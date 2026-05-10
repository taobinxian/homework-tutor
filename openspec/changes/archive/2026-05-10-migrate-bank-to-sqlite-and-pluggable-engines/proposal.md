## Why

题库（`grade1.js`～`grade6.js` ≈ 2000 行）和课程纲目（`curriculum.js`）目前散落在静态 JS 文件里：扩题需要改代码、按场景出题（错题反哺、按知识点抽题、按难度分布抽题）只能在前端硬编码、覆盖率无可视化。同时 `index.html` 单文件 3257 行，仅有"能量弹打怪"一种关卡玩法，BattleEngine 与主流程深度耦合，新增游戏类型必然失控。

借这次重构把题库迁入 SQLite，建立服务端**出题器**作为统一抽题入口，并在前端建立**可插拔关卡引擎**架构，为后续持续扩题和新增游戏玩法（射击、格斗）打下地基。错题库 `wrong_questions` 表已在 SQLite 不动。

## What Changes

- **新增**：`questions` / `generators` / `curriculum` 三张 SQLite 表（与现有 `wrong_questions` 同库 `wrongbook.db`）
- **新增**：服务端出题器 `lib/picker.js`，统一抽题接口 `pickQuestions({grade, subject, lv, topic, source, count, user, ...})`
- **新增**：HTTP 路由 `GET /api/questions/pick`、`GET /api/questions/coverage`、`GET /api/curriculum`、`POST /api/questions`
- **新增**：题目生成器模块约定（`generators/<key>.js`），首批落地 5-10 个核心生成器（凑十法、退位减、九九乘法等），元数据写入 `generators` 表
- **新增**：`scripts/migrate-from-js.js`（一次性把现有 `grade*.js` 物化进 `questions` 表，幂等可重跑）+ `scripts/seed-curriculum.js`（课程纲目入库）+ `npm run db:migrate`（schema 升级幂等命令）
- **新增**：覆盖率工具 `npm run coverage`，输出 `grade × subject × semester × topic × lv` 矩阵，每格阈值检查；`npm run validate:bank` 扩展为 schema 级校验
- **新增**：前端 vanilla ESM 模块拆分（`static/app/main.js`、`data.js`、`ui.js`、`tts.js`、`pets.js`、`ai.js`、`engines/{base,battle,shooting,fighting}.js`）
- **新增**：`LevelEngine` 抽象接口与三个引擎实现 — `BattleEngine`（迁移自现有逻辑）、`ShootingEngine`（射击靶心 + 倒计时 + 移动靶）、`FightingEngine`（血条对决 + 连击 + Boss 多阶段）
- **新增**：关卡选择 UI 增加"玩法"维度（题目集合 × 引擎解耦）
- **新增**：错题反哺出题模式 `source='wrongbook-practice'`（错题 + 同知识点同难度静态题扩展练习）
- **修改**：`proxy.js` 注册新 API 路由
- **修改**：`index.html` 删除 `<script src="grade*.js">` / `questions.js` / `curriculum.js`，仅保留 HTML + CSS + `<script type="module" src="/static/app/main.js">`
- **删除（归档至 `legacy/`）**：`grade1.js` ~ `grade6.js`、`questions.js`、`curriculum.js`（数据已迁移，保留备份）
- **更新**：`README.md` / `DEPLOY.md` 部署流程、新增 `db:migrate` 步骤
- **BREAKING**：前端不再通过全局 `QB`/`QB_TERM_INDEX`/`getQuestionPool` 等访问题库；统一走 `data.js` 异步 API。任何外部脚本若依赖这些全局对象需改造（项目内仅 `index.html` 使用，无外部依赖）

## Capabilities

### New Capabilities

- `question-bank`: SQLite 题库存储 — `questions` / `generators` / `curriculum` 表 schema、迁移脚本、`content_hash` 去重、与 `wrong_questions` 共库；提供 `db:migrate` 幂等升级命令
- `question-picker`: 服务端出题器 — `pickQuestions` 统一抽题逻辑（按 grade/subject/semester/lv/topic/knowledgePoints 过滤；source 支持 static/generated/mixed/wrongbook-practice）+ HTTP 路由
- `question-generators`: 生成器约定与首批实现 — `generators/<key>.js` 模块协议（`generate(n, ctx)` 返回题目数组）、注册到 `generators` 表的元数据契约、5-10 个初始生成器
- `level-engines`: 可插拔关卡引擎 — `LevelEngine` 抽象接口（`start`/`ask`/`onAnswer`/`finish`/`destroy`）+ 三个实现（Battle/Shooting/Fighting）+ 题目集合与玩法解耦
- `frontend-modules`: 前端 vanilla ESM 模块化 — `static/app/` 目录结构与各模块职责边界，零构建链
- `bank-coverage`: 题库覆盖率与扩题工作流 — coverage 矩阵命令、阈值卡线、seed 文件 upsert、扩展的 validate-bank 校验

### Modified Capabilities

无（项目尚无既有 spec）。

## Impact

- **影响代码**：`proxy.js`（新路由 + DB schema 升级）、`index.html`（删脚本引用 + 切 ESM 入口）、删除/归档 `grade*.js` / `questions.js` / `curriculum.js`、新增 `lib/picker.js` / `static/app/**` / `generators/**` / `scripts/migrate-from-js.js` / `scripts/seed-curriculum.js`
- **影响 API**：服务端新增 `/api/questions/*`、`/api/curriculum`；现有 `/api/wrongbook/*` / `/v1/chat/completions` / `/tts` 不动
- **影响数据**：`wrongbook.db` 增加 3 张表与若干索引；现有 `wrong_questions` 不动；首次 `db:migrate` 后跑 `migrate-from-js`，将现有题库内容写入；可回滚（删除新表）
- **影响依赖**：`better-sqlite3` 已在 `package.json`，无新依赖；前端零构建链不引入 bundler
- **影响部署**：`deploy.sh` 增加 schema migrate + seed 步骤；`README.md` / `DEPLOY.md` 文档更新
- **影响测试**：新增端到端验收（覆盖三种引擎 × 多年级 × 多难度题集）；新增 picker 单元测试；扩展 `validate:bank`
