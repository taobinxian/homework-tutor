## Context

`homework-tutor` 是一个面向小学 1-6 年级的"作业辅导 + 闯关答题"H5 应用，部署在局域网 Linux/本机 macOS 上。当前架构关键痛点：

1. **题库形态散乱**：`grade1.js` ~ `grade6.js` 共 ~2000 行，混合了静态题和 `for(){rand()}` 运行时生成器，前端 `<script>` 直接加载到全局 `QB`。结构无法支持"按错题反哺出题"、"按知识点分布抽题"、"覆盖率统计"等场景。
2. **关卡单一**：`index.html` 3257 行单文件，仅有"能量弹打怪"一种玩法，BattleEngine 与主流程耦合。新增射击 / 格斗等玩法将令文件继续膨胀。
3. **错题库已在 SQLite**：`wrongbook.db` + `wrong_questions` 表已工作，提供了 schema 设计参考，但其余数据资产没沿用此通道。

约束：

- **不能引入构建链**（用户明确要求）：proxy.js 只是静态文件托管 + AI 代理，不能依赖 webpack/vite。
- **不能丢失现有题库内容**：1100+ 道题（含动态生成的物化结果）必须无损迁移。
- **必须保持现有所有用户功能正常**：错题库 / 拍照出题 / AI 讲解 / TTS / 宠物 / 战斗动画。
- **deploy.sh 是局域网运维流程**：DB schema 升级要做成幂等命令，避免人工干预。
- **better-sqlite3 是 native 模块**：跨 Node 版本要 rebuild，部署文档要写清。

利益相关者：唯一维护者（taobinxian），通过 git 维护题库，未来可能有其他题库贡献者。

## Goals / Non-Goals

**Goals:**

- 题库（静态题 + 生成器元数据 + 课程纲目）统一存入 SQLite，与错题库共库
- 服务端 picker 成为唯一抽题入口，支持 4 种 source（static / generated / mixed / wrongbook-practice）
- 前端按 vanilla ESM 模块化，`index.html` 只剩 HTML + CSS + module 入口
- 关卡引擎插件化，三种玩法（Battle/Shooting/Fighting）独立模块、统一 `LevelEngine` 接口
- 题目集合（年级×科目×难度×知识点）和玩法（引擎类型）解耦：任意题集可挂任意引擎
- 持续扩题工程化：覆盖率矩阵、CI 卡线、seed 文件 upsert
- 错题反哺：错题 + 同知识点同难度静态题组成"针对性练习关"

**Non-Goals:**

- 不做录题后台 UI（暂保留 file-based seed + git 流程）
- 不抽出 CSS / 不引入构建链 / 不上 React/Vue
- 不做生成器 DSL/规则引擎（保持 JS 模块约定）
- 不做用户系统（沿用 `?user=xxx` 即可）
- 不重写 BattleEngine 玩法逻辑（仅迁移到模块化结构）
- 不做 i18n / 多端原生
- 不做 schema 历史性 rollback（只做"幂等创建/升级"）

## Decisions

### D1. 数据建模：3 张新表 + 错题表保留

**选择**：在现有 `wrongbook.db` 内新增 `questions` / `generators` / `curriculum` 三张表。

```sql
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_hash TEXT UNIQUE NOT NULL,    -- sha1(grade|subject|q|answer)，幂等去重
  grade INTEGER NOT NULL,                -- 1..6
  subject TEXT NOT NULL,                 -- math|chinese|english|science
  semester TEXT NOT NULL,                -- upper|lower|unknown
  topic TEXT NOT NULL,
  knowledge_points TEXT NOT NULL,        -- JSON array
  lv INTEGER NOT NULL,                   -- 1..3
  q_type TEXT NOT NULL,                  -- choice|input
  q TEXT NOT NULL,
  options TEXT,                          -- JSON array, NULL for input
  answer TEXT NOT NULL,
  hints TEXT,                            -- JSON array
  explain_text TEXT,
  source TEXT NOT NULL DEFAULT 'seed',   -- seed|photo|manual
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_q_filter ON questions(grade, subject, semester, lv, enabled);
CREATE INDEX IF NOT EXISTS idx_q_topic ON questions(grade, subject, topic, enabled);

CREATE TABLE IF NOT EXISTS generators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,              -- 'g1-math-add-within-5'
  grade INTEGER NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  topic TEXT NOT NULL,
  knowledge_points TEXT NOT NULL,        -- JSON array
  lv INTEGER NOT NULL,
  module_path TEXT NOT NULL,             -- 相对仓库根，如 'generators/g1-math-add-within-5.js'
  enabled INTEGER NOT NULL DEFAULT 1,
  description TEXT
);
CREATE INDEX IF NOT EXISTS idx_gen_filter ON generators(grade, subject, semester, lv, enabled);

CREATE TABLE IF NOT EXISTS curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grade INTEGER NOT NULL,
  subject TEXT NOT NULL,
  semester TEXT NOT NULL,
  topic TEXT NOT NULL,
  knowledge_points TEXT NOT NULL,        -- JSON array
  UNIQUE(grade, subject, topic)
);
```

**为什么共库**：单文件 SQLite 部署/备份只管一个；事务跨 wrong_questions 与 questions（如错题反哺时校验题源是否还存在）方便。

**替代方案**：分库 `questions.db`。被否：备份/部署变复杂；本身体量都很小（几 MB 内），无性能压力。

**`wrong_questions` 表的兼容性升级**：现有 schema 已通过 `ensureColumn` 增量添加过 `grade/subject/semester/knowledge_points`，本次再追加 `lv INTEGER`（picker 的 `wrongbook-practice` 模式按 `(topic, lv)` 聚合错题需要此列）。前端 `wrongbookAdd` 调用须附带 `lv`；后端缺省值 `lv=2`（进阶）。

**为什么生成器元数据进 DB**：让 picker 能用统一的 `WHERE` 查询同时找到匹配的静态题和生成器；让覆盖率矩阵能正确计入"该格子是否被生成器覆盖"。

**替代方案**：生成器只在 JS 注册表（`generators/index.js`）。被否：覆盖率统计要去读 JS、绕过 SQL，引入双源真相。

### D2. 生成器协议：JS 模块 + 元数据契约

**选择**：每个生成器是一个 CommonJS 模块，导出 `generate(n, ctx)`：

```javascript
// generators/g1-math-add-within-5.js
module.exports = {
  meta: {
    key: 'g1-math-add-within-5',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '5以内加法', knowledgePoints: ['5以内加法','1-5的认识和加减法'],
    lv: 1,
    description: '5以内加法（运算结果不超过 5）',
  },
  generate(n /*, ctx */) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = rand(1, 5), b = rand(0, 5 - a), s = a + b;
      out.push({
        q: `${a} + ${b} = ?`,
        type: 'choice',
        options: shuffle([String(s), String(s+1), String(Math.max(0,s-1)), String(s+2)]),
        answer: String(s),
        hints: [`数 ${a} 再加 ${b} 个`, '用手指数', `${a}+${b}=${s}`],
        explain: '加法把两堆合起来',
        topic: '5以内加法',
        knowledgePoints: ['5以内加法'],
        lv: 1, grade: 1, subject: 'math', semester: 'upper',
        source: 'generated',
      });
    }
    return out;
  },
};
```

**约定**：
- 模块路径相对仓库根，写入 `generators.module_path`
- `meta.key` 即 `generators.key`，全局唯一，命名规则 `g{grade}-{subject}-{slug}`
- `generate(n, ctx)` 返回的题目对象 schema 必须与 `questions` 表行的 JS 表示一致，便于 picker 合并

**替代方案**：在 DB 存生成器参数（`{a_range:[1,5], b_range:[0,5]}`）+ 服务端解释器。被否：约束类型多样（凑十法、退位减、九九乘法、加减混合），解释器复杂度等同于直接写代码，且失去 IDE 跳转/调试。

### D3. picker 抽题策略

**选择**：单一入口 `pickQuestions(opts)`，按 `source` 分派子策略，最后做去重 + 截取。

```
┌── source: 'static' ──── SELECT ... ORDER BY RANDOM() LIMIT n
│
├── source: 'generated' ─ 查 generators 表 → require(module_path) → 各跑 generate(n_i)
│
├── source: 'mixed' ────  按比例并行（默认 70% static + 30% generated, 可调）
│                         若某一侧 < 配额，自动用另一侧补齐
│
└── source: 'wrongbook-practice' ─
                         1. 取 user 错题（按 created_at DESC, LIMIT k）
                         2. 按 (grade, subject, topic, lv) 聚合
                         3. 每个错题点扩展 1-2 道同分类的 static 题（不重复包含错题本身）
                         4. 按错题题数加权返回
```

**去重**：返回前对 `(content_hash || q+answer)` 去重，避免一关同题。
**幂等性**：同样的 opts 在不同时刻应返回不同随机抽样（满足"刷新出新题"），但题目对象本身是稳定的（id/字段一致）。

**替代方案 A**：按 topic 等概率抽。被否：题目分布不均时拉不到题。改为先按 topic 聚合再各取，保证多样性。
**替代方案 B**：纯概率比例混合。被否：补齐策略更稳健（小题库不会卡顿）。

### D4. picker 输出 schema：统一 Question 对象

```typescript
type Question = {
  id?: number;             // 静态题有，生成的没有
  q: string;
  type: 'choice'|'input';
  options?: string[];
  answer: string;
  hints: string[];
  explain: string;
  topic: string;
  knowledgePoints: string[];
  semester: 'upper'|'lower'|'unknown';
  semesterLabel: string;   // 由后端补齐 (上册/下册/未标注)
  grade: 1|2|3|4|5|6;
  subject: 'math'|'chinese'|'english'|'science';
  lv: 1|2|3;
  source: 'static'|'generated'|'wrongbook'; // 给前端区分用
};
```

前端 `data.js` 不重新解析，直接消费此结构。引擎只关心 `q/options/answer/hints/explain/type` 字段，其余作为元数据展示。

### D5. 前端模块化：vanilla ESM + 分层

**选择**：

```
static/app/
├── main.js              # 应用入口；启动流程；视图路由
├── data.js              # API 封装：fetchPick / fetchCoverage / fetchCurriculum
│                          / wrongbookList / wrongbookAdd / wrongbookDelete
├── ui.js                # toast / showConfirm / settings 弹窗
├── tts.js               # TTS 预加载缓存与播放
├── pets.js              # 宠物系统（升级/装饰/动画）
├── ai.js                # AI 讲解 / 拍照出题客户端
└── engines/
    ├── base.js          # LevelEngine 抽象（接口 + 默认实现）
    ├── battle.js        # 现有"能量弹打怪"
    ├── shooting.js      # 射击（靶心 + 倒计时 + 移动靶）
    └── fighting.js      # 格斗（血条对决 + 连击 + 多阶段 Boss）
```

`index.html` 只保留：HTML 骨架 + CSS（暂不抽）+ `<script type="module" src="/static/app/main.js"></script>`。

**为什么 vanilla ESM**：浏览器原生支持 import/export，零构建链；`proxy.js` 静态托管现成；`main.js` import 链按顺序加载，无 bundling 复杂度。

**为什么不抽 CSS**：CSS 体量约 1500 行但与 HTML 结构强耦合，而且只有一个页面；抽出收益小、风险大（关卡动画依赖 keyframes 命名）。后续 `engines/*.js` 用 `<style>` 局部注入即可。

**替代方案**：Vite + esbuild。被否：增加运维心智负担与部署复杂度，本项目无收益。

### D6. LevelEngine 接口

```typescript
abstract class LevelEngine {
  constructor(opts: {
    container: HTMLElement;          // 关卡渲染挂载点
    questions: Question[];           // picker 返回的题目数组
    callbacks: {
      onCorrect(q: Question): void;  // 答对（用于宠物/经验值/连击外部记录）
      onWrong(q: Question, userAnswer: string): void;
      onWrongAdd(q: Question, userAnswer: string): Promise<void>; // 加入错题库
      onComplete(stats): void;       // 关卡完成
      requestExplain(q: Question): Promise<string>; // AI 讲解
      requestTTS(text: string): Promise<void>;      // 朗读
    };
    config?: Record<string, any>;    // 引擎特定配置（射击关倒计时、格斗关 Boss 阶段等）
  });

  abstract async start(): Promise<void>;             // 渲染场景，开始第一题
  abstract async ask(q: Question): Promise<{userAnswer: string; correct: boolean}>;
  abstract async onAnswer(q, userAnswer, correct): Promise<void>; // 关卡内反馈
  abstract async finish(): Promise<{stats}>;
  destroy(): void;                                    // 清理 DOM/事件/动画
}
```

**核心契约**：
- 引擎不持有"是否还有题"逻辑——由外层主流程驱动循环
- 引擎不直接调用 wrongbook API、TTS、AI——通过 callbacks 注入
- 引擎独占 container 内 DOM，禁止动主页面其他部分

### D7. 关卡选择 UI 增加"玩法"维度

旧选关：年级 → 科目 → 难度。
新选关：年级 → 科目 → 难度 → **玩法**（战斗 / 射击 / 格斗）→ 来源（混合 / 静态 / 生成器 / 错题练习）。

URL/state 形式：`{grade, subject, lv, engine, source}`。`engine` 默认 `battle`，`source` 默认 `mixed`。

**替代方案**：自动按难度推荐玩法（lv1=battle, lv2=shooting, lv3=fighting）。被否：剥夺孩子选择权；玩法是"包装"，难度是"内容"，应正交。

### D8. 迁移：物化 + 生成器并行

**步骤**：

1. `npm run db:migrate` — 创建 schema（幂等 `CREATE TABLE IF NOT EXISTS`）
2. `npm run db:seed:curriculum` — 把 `curriculum.js` 内容写 `curriculum` 表
3. `npm run db:seed:legacy` — 在 Node 环境 `require('./grade*.js')`，遍历 `QB`，按 `content_hash` upsert 进 `questions` 表（`source='seed'`）
4. `npm run db:seed:generators` — 扫 `generators/*.js`，读 `meta`，upsert 进 `generators` 表
5. 启动 `proxy.js` — picker 上线、新 API 可用
6. 部署后再读 index.html，确认前端走新 ESM 链路
7. 一切 OK 后归档：`mv grade*.js questions.js curriculum.js legacy/`

**幂等性**：每次部署都跑 migrate + seed 三件套，不重复插入（content_hash / key / UNIQUE(grade,subject,topic) 控制）。

**回滚**：若新 picker 出问题，可在 deploy 临时回退 `index.html` 到旧版本（保留旧的 grade*.js 静态文件 + script 引用作为应急包）。schema 不需要回滚（新表不影响旧逻辑）。

### D9. 覆盖率与 CI

`npm run coverage`：

```
SELECT grade, subject, semester, topic, lv, COUNT(*) AS static_n
FROM questions WHERE enabled=1
GROUP BY 1,2,3,4,5;

SELECT grade, subject, semester, topic, lv, COUNT(*) AS gen_n
FROM generators WHERE enabled=1
GROUP BY 1,2,3,4,5;
```

合并两表 + 课程纲目（用 curriculum 表"全集"作为 LEFT JOIN 基准），输出矩阵：
- 每个 (grade, subject, semester, topic, lv) 单元格的题数（static + gen）
- 阈值（默认 N=3）下的"缺口"列表
- Top N 缺口排名（按年级×科目优先级）

`npm run validate:bank` 重写为：
- schema 校验（type/options/answer 一致性）
- options 唯一性 / answer 在 options 里
- content_hash 应该唯一（DB 已强制，再 double check）
- topic 在 curriculum 内（除非 source=photo|manual）

**CI 集成**：`package.json` `scripts.coverage` 和 `scripts.validate:bank` 在 PR 上 run；coverage 缺口数不允许变多（保存上次基线 `.coverage-baseline.json` 供对比）。

### D10. 拍照出题 / 手动加题入库

`POST /api/questions` body 同 Question 字段（最小：`grade, subject, q, answer, type`），后端补齐 `content_hash`、缺省 `semester='unknown', topic='未标注', lv=2, source='photo'|'manual'`。前端拍照流程不变（AI 识别后调此 API）。

## Risks / Trade-offs

- **better-sqlite3 native 编译失败** → 部署文档新增"Node 版本固定 + npm rebuild better-sqlite3"步骤；deploy.sh 加预检
- **现有 BattleEngine 拆分回归** → 拆分后写一份"端到端清单"，覆盖所有现有玩法路径（拍照→出题→答题→错题→AI 讲解→TTS→宠物升级），每条路径都浏览器手测
- **物化静态题导致"刷新无新题"感** → 同时落地 5-10 个核心生成器；picker 默认 `source='mixed'`；用户感知保持
- **vanilla ESM 在某些浏览器加载失败** → `index.html` 加 `<script nomodule>` 提示升级；目前用户群是局域网 + 现代浏览器，风险低
- **题库迁移丢失语义字段（如 `originalTopic`）** → migrate-from-js 跑 `finalizeQuestionBank` 后再读，确保 `semester/topic/knowledgePoints` 都已补齐
- **content_hash 撞到（不同题面相同 hash）** → 用 sha1(grade|subject|q|answer)，碰撞概率忽略不计
- **关卡选择维度增加导致认知负担** → "玩法"和"来源"在 UI 上做成可选标签，默认值合理；不强制每次都选
- **新 API 暴露给 LAN 内任何人** → 沿用现有 CORS（仅本机/局域网部署），不引入鉴权（与现有 `/api/wrongbook` 一致）

## Migration Plan

**部署阶段**：

1. 备份 `wrongbook.db`：`cp wrongbook.db wrongbook.db.backup-pre-migration`
2. `git pull` 拉取新代码
3. `npm install`（无新依赖，可能要 rebuild better-sqlite3）
4. `npm run db:migrate`（创建新表）
5. `npm run db:seed`（curriculum + legacy + generators 三步合一）
6. `systemctl restart homework`（或本机 `launchctl kickstart`）
7. 浏览器手测：随机选一关验证现有玩法
8. 选择新玩法（射击/格斗）验证新引擎

**回滚（仅前端）**：

- `git revert <commit>` + 重启服务，恢复旧 `index.html` + 静态 grade*.js
- 新表保留不删（无副作用）

**回滚（含 schema）**：

- 不需要。新表与旧逻辑无交集。

## Open Questions

- Q1：射击关的"靶心动画"和格斗关的"出招贴图"是否需要专门美术资源？
  - 暂定：纯 emoji + CSS 动画 + 现有色板，与现有"能量弹"风格保持一致；后续美术升级再迭代
- Q2：是否在 `generators` 表存储一份"示例输出"用于覆盖率展示？
  - 不做。覆盖率只看"是否有生成器存在"，不看产出数（生成器是无限的）
- Q3：`source='wrongbook-practice'` 的扩展题数量应该几道？
  - 默认 1 道错题 + 2 道扩展题，整关 10 道总数中按错题数加权；可作为 `?expandRatio=` 参数调
- Q4：是否需要把现有题库 hash 用作 git 钩子防双写？
  - 不做。content_hash 在 DB 层面 UNIQUE 已经够；本地开发不强制
