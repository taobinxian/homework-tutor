# 学霸奇遇记 — 小学生作业辅导

基于 AI + 游戏化闯关的小学作业辅导工具，覆盖 1-6 年级数学、语文、英语，以及 3 年级起的科学。项目是 Node.js + SQLite 单体服务，前端为原生 ESM 模块，无前端构建步骤。

在线体验：<https://taobinxian.cloud/app>

## 当前功能

- **闯关答题**：按年级、科目、学期、难度、题目来源和玩法组合出题。
- **三种玩法引擎**：战斗、射击、格斗，统一实现 `LevelEngine` 接口。
- **题库与生成器**：SQLite 存储静态题、课程纲目、生成器元数据和错题库；生成器按需产题。
- **错题练习**：错题服务端入库，多设备可共享，支持从错题来源重新闯关。
- **拍照出题**：浏览器上传图片，由 AI 识别题目并写入题库副本。
- **AI 讲解**：答错后可请求逐步提示和完整解题思路。
- **语音朗读**：优先走本地/服务端 TTS，失败时回退到浏览器 `speechSynthesis`。
- **成长系统**：经验、金币、宝石、宠物、每日任务、成就和商店道具。

题库覆盖数量以当前数据库 seed 后的 `npm run coverage` 输出为准，避免 README 中的静态数字与实际库内容漂移。

## 最近关键改动

- **P0 游戏体验 / 前端渲染优化**：首屏 skeleton、关键模块 `modulepreload`、静态资源缓存头、长选项换行、`prefers-reduced-motion` 降载、TTS 前 2 题预热、顶部状态栏增量刷新，以及 shake/flash 动画降载。
- **儿童容错与 Shooting 难度调整**：错答扣血按次数递进，前两次错答更宽容；Shooting 初始怪物数更低，防线值为 6，倒计时为 lv1=15s、lv2=10s、lv3=8s。
- **血槽 / 死亡判定一致性修复**：玩家 HP、扣减、死亡判定和血槽渲染统一使用同一组 `currentHp/maxHp`；只有实际 `HP <= 0` 才触发 gameover，血槽百分比由实际 HP 计算。

## 快速启动

环境要求：Node.js 18+。

```bash
npm install
npm run db:migrate
npm run db:seed
npm test
npm start
```

本地访问：

```text
http://localhost:8787/app
```

常用环境变量：

| 变量 | 用途 |
|---|---|
| `PORT` | HTTP 服务监听端口，默认 `8787` |
| `BIND` | HTTP 服务监听地址，默认 `0.0.0.0` |
| `UPSTREAM` | AI 聊天代理上游地址 |
| `VOLC_APPID` | 火山引擎 TTS App ID，配置后启用云端 TTS |
| `VOLC_TOKEN` | 火山引擎 TTS 访问凭证 |
| `VOLC_RESOURCE_ID` | 可选，强制指定 TTS resource id；留空使用默认路由 |
| `STATIC_DIR` | 静态文件目录 |
| `HOMEWORK_DB` | SQLite 数据库文件路径 |
| `LOCAL_TTS` | 本地 TTS 开关，设为 `0` 可跳过本地 TTS 尝试 |

不要把真实 token、服务器地址或密钥写入仓库文档。部署时在服务配置或运行环境中注入变量值。

## 验证命令

```bash
npm test
npm run validate:bank
npm run coverage
```

- `npm test`：运行 `node:test` 单元 / 集成测试。
- `npm run validate:bank`：校验题库 schema、topic 和生成器元数据。
- `npm run coverage`：输出 grade × subject × semester × topic × lv 覆盖矩阵。

数据库相关命令：

```bash
npm run db:migrate
npm run db:seed
npm run db:seed:curriculum
npm run db:seed:legacy
npm run db:seed:generators
```

`db:migrate` 和 seed 命令设计为幂等，可在部署或升级后重复执行。

## 部署入口

推荐使用仓库内的 `deploy.sh`，详细流程见 [DEPLOY.md](DEPLOY.md)。

```bash
./deploy.sh <ssh-user> --install
./deploy.sh <ssh-user>
./deploy.sh <ssh-user> --service
```

- `--install`：首次安装，包含 Node.js、部署目录、依赖安装、数据库迁移 / seed 和服务安装。
- 默认更新：同步代码、安装依赖、执行迁移 / seed 并重启服务。
- `--service`：同步 systemd service 文件，适合服务配置模板有变更时使用。

部署验证要点：

```bash
curl http://<host>:8787/
```

浏览器打开：

```text
http://<host>:8787/app
```

查看服务日志时使用目标系统对应的服务管理命令；不要在 README 中记录真实服务器地址、密钥或个人凭证。

## 项目结构

```text
├── index.html              # 主页面骨架、样式、首屏 skeleton 和模块加载入口
├── proxy.js                # Node.js HTTP 服务：AI/TTS 代理、题库 API、错题 API、静态托管
├── lib/
│   ├── db.js               # SQLite 连接和 schema 初始化
│   ├── picker.js           # 唯一抽题入口 pickQuestions(opts)
│   ├── coverage.js         # 题库覆盖率聚合
│   ├── questions-api.js    # /api/questions/* HTTP 处理
│   ├── wrongbook-api.js    # /api/wrongbook HTTP 处理
│   └── level-damage.js     # 错答递进伤害、HP 百分比和复活 HP 计算
├── static/app/
│   ├── main.js             # 前端入口、关卡选择、状态栏、引擎挂载
│   ├── data.js             # API fetch 封装
│   ├── ai.js               # AI 设置、讲解、拍照识题
│   ├── tts.js              # TTS 预热、缓存、播放与浏览器兜底
│   ├── audio.js            # 音效和移动端音频解锁
│   ├── state.js            # 本地存档迁移与奖励计算
│   ├── pets.js             # 宠物系统
│   ├── items.js            # 商店和道具
│   ├── achievements.js     # 成就
│   └── engines/
│       ├── base.js         # LevelEngine 抽象、节奏、伤害和 HP 工具镜像
│       ├── battle.js       # 战斗玩法
│       ├── shooting.js     # 射击玩法
│       └── fighting.js     # 格斗玩法
├── generators/             # 题目生成器及协议说明
├── scripts/                # 数据库迁移、seed、coverage、题库校验脚本
├── test/                   # node:test 测试
├── legacy/                 # 迁移前静态题库快照，仅作历史参考
├── deploy.sh               # 部署脚本
├── homework.service        # systemd 服务模板
└── DEPLOY.md               # 部署和 TTS 配置详解
```

## 题库与出题器

题库存在 SQLite (`wrongbook.db`) 中：

- `questions`：静态题库和拍照 / 手动新增题，按 `content_hash` 去重。
- `generators`：题模板元数据；实际模板代码在 `generators/*.js`。
- `curriculum`：课程纲目，按年级、科目、知识点和学期组织。
- `wrong_questions`：错题库。

服务端唯一抽题入口是 `lib/picker.js`：

```js
pickQuestions({
  grade,
  subject,
  semester,
  lv,
  topic,
  source: 'mixed', // static | generated | mixed | wrongbook-practice
  count: 10,
  user,
  excludeIds,
});
```

HTTP 示例：

```text
GET /api/questions/pick?grade=1&subject=math&lv=2&count=10&source=mixed
```

## 关卡引擎

每关由 **题目集合 × 玩法引擎** 组合而成。当前内置三种引擎：

- **Battle**：能量弹、连击和 Boss 反击。
- **Shooting**：移动靶、倒计时和防线值。
- **Fighting**：双方血条、连击必杀和 Boss 阶段切换。

引擎不能直接访问 fetch、错题库或 TTS，统一通过 `LevelEngine` callbacks 与应用层交互。

## API 路由

| 路由 | 方法 | 说明 |
|---|---|---|
| `/` | GET | 健康检查 |
| `/app` | GET | 主页面 |
| `/v1/chat/completions` | POST | AI 聊天代理 |
| `/tts?text=...&voice=...` | GET/POST | TTS 语音合成 |
| `/api/tts/status` | GET | TTS 状态 |
| `/api/wrongbook?user=...` | GET/POST/DELETE | 错题库 CRUD |
| `/api/wrongbook/<id>?user=...` | DELETE | 删除单条错题 |
| `/api/questions/pick` | GET | 抽题 |
| `/api/questions/coverage` | GET | 覆盖率矩阵 JSON |
| `/api/questions` | POST | 加题 |
| `/api/curriculum` | GET | 课程纲目 |
| `/static/<file>` | GET | 静态资源 |

## 常见问题

**TTS 不出声？**
确认服务端是否配置了 `VOLC_APPID` / `VOLC_TOKEN`，或本地 TTS 模型是否可用；前端会在服务端 TTS 不可用时回退到浏览器朗读。

**题库或错题库加载失败？**
先确认依赖安装完成，然后执行 `npm run db:migrate && npm run db:seed`。跨 Node 版本部署后，如 native 模块报错，重新构建 `better-sqlite3`。

**Shooting 难度和血槽表现不一致？**
当前版本应以实际 HP 为唯一状态源。若看到血槽还有血却已经失败，优先检查是否运行了旧前端缓存，并强制刷新页面或重新部署静态资源。
