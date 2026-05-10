# 学霸奇遇记 — 小学生作业辅导

基于 AI + 游戏化的小学作业辅导工具，支持 1-6 年级数学/语文/英语/科学（3年级起）四个学科。

## 功能特色

- **闯关答题** — 1-6 年级人教版题库 1100+ 题，按入门/进阶/挑战三级难度递增
- **拍照出题** — 拍照上传作业，AI 自动识别题目并生成闯关副本
- **蘑菇博士讲解** — 答错时 AI 逐步提示，提供完整解题思路
- **语音朗读** — 火山引擎豆包 TTS 真人级语音，点击🔊按钮朗读题目
- **战斗动画** — 能量弹射击、连击 Combo、Boss 反击等游戏化交互
- **错题库** — 服务端 SQLite 存储，多设备共享，支持错题闯关
- **宠物系统** — 🦜小鹦鹉→🐱机灵猫→🦊勇敢狐→🐲闪耀龙→🦅神兽凤凰
- **家长报告** — 可视化学习数据统计和建议

## 项目结构

```
├── index.html              # 主页面骨架（HTML + CSS）；JS 由模块引导
├── proxy.js                # Node.js HTTP 服务（AI/TTS/错题/题库 API + 静态托管）
├── lib/                    # 服务端共享模块
│   ├── db.js               # SQLite 连接 + initSchema (questions/generators/curriculum/wrong_questions)
│   ├── picker.js           # 出题器: pickQuestions(opts) — 4 种 source 抽题
│   ├── coverage.js         # 覆盖率聚合 (CLI + HTTP 共用)
│   ├── questions-api.js    # /api/questions/* HTTP 处理函数
│   └── wrongbook-api.js    # /api/wrongbook 处理函数
├── static/app/             # 前端 ESM 模块
│   ├── main.js             # 入口 + 关卡选择 UI + 引擎挂载
│   ├── data.js             # 后端 API 封装（fetch 层）
│   ├── ui.js               # 共享 UI（toast / showConfirm / 粒子动画）
│   ├── tts.js              # 朗读（服务端 TTS + 浏览器兜底）
│   ├── pets.js             # 宠物系统（升级、渲染）
│   ├── ai.js               # AI 讲解 + 拍照出题
│   └── engines/            # 关卡引擎插件
│       ├── base.js         # LevelEngine 抽象接口
│       ├── battle.js       # ⚔️ 战斗（能量弹打怪）
│       ├── shooting.js     # 🎯 射击（靶心 + 倒计时）
│       └── fighting.js     # 🥋 格斗（血条 + Combo + 多阶段 Boss）
├── generators/             # 题模板（运行时生成无穷题）
│   ├── _template.js        # 模板与协议示例
│   ├── README.md           # 生成器编写指南
│   └── g{grade}-{subj}-{slug}.js  # 每个生成器一个文件
├── scripts/
│   ├── db-migrate.js       # 创建/升级 schema（幂等）
│   ├── db-seed-curriculum.js  # 课程纲目入库
│   ├── db-seed-legacy.js   # 旧 grade*.js 物化进 questions 表
│   ├── db-seed-generators.js  # 扫描 generators/ 注册元数据
│   ├── coverage.js         # 覆盖率矩阵 CLI（--json / --threshold / --strict）
│   └── validate-question-bank.js  # schema + topic + 生成器校验
├── test/                   # node:test 单元/集成测试
├── legacy/                 # 重构前快照（grade*.js / questions.js / curriculum.js / index.html.original）
├── homework.service        # systemd 服务配置
├── deploy.sh               # 一键部署脚本（已支持新结构 + 自动 db:migrate + db:seed）
└── DEPLOY.md               # 火山引擎 TTS 配置说明
```

## 题库与出题器

题库与课程纲目存在 SQLite (`wrongbook.db`) 中：
- **questions** 表：静态题库（含旧 `grade*.js` 物化结果），按 `content_hash` 去重
- **generators** 表：题模板元数据（实际代码在 `generators/*.js`）
- **curriculum** 表：人教版课程纲目（grade × subject × topic → semester + 知识点）
- **wrong_questions** 表：错题库（多设备共享）

### 出题接口 `pickQuestions`

服务端唯一抽题入口 [`lib/picker.js`](lib/picker.js)：

```javascript
pickQuestions({
  grade, subject,           // 必填
  semester?, lv?, topic?,   // 可选过滤
  source = 'mixed',         // static | generated | mixed | wrongbook-practice
  count = 10,
  user, excludeIds,
});
```

HTTP：`GET /api/questions/pick?grade=1&subject=math&lv=2&count=10&source=mixed`

### 添加新题

**静态题**：编辑 seed 数据后 `npm run db:seed:legacy`（content_hash 去重，可重跑）。

**生成器**：在 `generators/` 下新建 `g{grade}-{subj}-{slug}.js`（参考 `_template.js`），导出 `meta` + `generate(n, ctx)`，运行 `npm run db:seed:generators` 注册。

**拍照出题**：浏览器内点 📷 拍照按钮，AI 识别后自动 POST 到 `/api/questions`（`source='photo'`）。

### 覆盖率与校验

```bash
npm run coverage              # 输出 grade × subject × semester × topic × lv 矩阵
npm run coverage -- --json    # JSON 输出
npm run coverage -- --strict  # 缺口存在则非零退出（CI 卡线）
npm run coverage -- --update-baseline   # 写入 .coverage-baseline.json
npm run coverage -- --check-baseline    # 比基线，新增缺口非零退出
npm run validate:bank         # schema + 生成器存在性 + topic 在 curriculum 校验
```

## 关卡引擎

每关 = **题目集合 × 引擎玩法**（解耦）。三种内置引擎实现 `LevelEngine` 接口：

- **⚔️ Battle** — 能量弹打怪、Combo、Boss 反击
- **🎯 Shooting** — 移动靶 + 倒计时（lv1=15s/lv2=10s/lv3=6s）+ 怪物突破防线
- **🥋 Fighting** — 双方血条 + 出招 + Combo 必杀 + Boss 多阶段（HP 50%/25% 切换）

任何题目集合（包括错题练习）都可挂任意引擎。在主页选择 "玩法" 维度切换。

## 快速部署

### 环境要求

- **服务器**：Linux（Ubuntu/Debian 推荐），有 Node.js 18+
- **本机**：macOS/Linux/Windows，有 SSH 客户端
- **网络**：服务器和客户端在同一局域网

### 0. 本机 macOS 启动（开发/自用）

如果你是在这台 Mac 上直接运行，而不是部署到远程 Linux 服务器：

```bash
cd /Users/taobinxian/homework-tutor
npm install                    # 装依赖（含 better-sqlite3 native）
npm run db:migrate             # 创建 schema
npm run db:seed                # 入库题目 + 生成器（首次部署必跑）
npm start                      # 等价 node proxy.js

# 浏览器访问
http://localhost:8787/app
```

如果希望 `8787` 端口常驻，可用仓库里的 LaunchAgent 模板：

```bash
cp launchagents/com.taobinxian.homework-tutor-8787.plist ~/Library/LaunchAgents/
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.taobinxian.homework-tutor-8787.plist
launchctl kickstart -k gui/$(id -u)/com.taobinxian.homework-tutor-8787

# 查看状态/日志
launchctl print gui/$(id -u)/com.taobinxian.homework-tutor-8787
tail -f /tmp/homework-tutor-8787.log
```

说明：

- 模板里的 `ProgramArguments` 默认写的是 Apple Silicon 常见 Node 路径 `/opt/homebrew/bin/node`，如果你的 `which node` 不一样，需要先改 plist。
- 模板里的 `WorkingDirectory` 和 `STATIC_DIR` 都要改成你的实际项目路径。
- 在本机浏览器访问时，直接用 `http://localhost:8787/app` 就可以。

### 1. 首次安装

```bash
# 设置目标服务器（默认 192.168.3.79）
export HOST=192.168.3.79

# 首次安装（自动安装 Node.js、创建用户、部署文件、配置 systemd 服务）
./deploy.sh <你的SSH用户名> --install
```

脚本会自动完成：
- 检查/安装 Node.js 20
- 创建 `homework` 系统用户
- 上传所有文件到 `/opt/homework/`（含 `lib/`、`scripts/`、`static/`、`generators/`、`legacy/`）
- `npm install` + `npm rebuild better-sqlite3`
- `npm run db:migrate && npm run db:seed`（schema + 静态题 + 课程 + 生成器入库）
- 安装 systemd 服务
- 开放 8787 端口（如有 ufw）

### 2. 配置火山引擎 TTS（可选但推荐）

> 不配置 TTS 也能使用，只是没有语音朗读功能

1. 注册 [火山引擎](https://console.volcengine.com/)
2. 开通 **语音技术 → 语音合成大模型**
3. 创建应用，获取 **AppID** 和 **Access Token**
4. 在服务器上编辑 service 文件填入凭证：

```bash
sudo nano /etc/systemd/system/homework.service
```

修改以下两行：
```ini
Environment=VOLC_APPID=你的AppID
Environment=VOLC_TOKEN=你的AccessToken
```

然后重启服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart homework
```

> 详细 TTS 配置说明见 [DEPLOY.md](DEPLOY.md)

### 3. 数据库

`/opt/homework/wrongbook.db` 含 4 张表：
- `wrong_questions`（错题库）
- `questions`（静态题库 — 由 `npm run db:seed:legacy` 从 `legacy/grade*.js` 物化）
- `generators`（生成器元数据 — 由 `npm run db:seed:generators` 注册）
- `curriculum`（课程纲目 — 由 `npm run db:seed:curriculum` 入库）

`db:migrate` 与三个 `db:seed:*` 都是**幂等**的，部署时被 `deploy.sh` 自动执行。

### 4. 日常更新

修改代码后，一键更新部署：

```bash
# 普通更新（覆盖代码 + 子目录 → 重新 npm install + db:migrate + db:seed → 重启服务）
./deploy.sh <用户名>

# 连 systemd service 文件一起更新（自动保留已有 Token）
./deploy.sh <用户名> --service
```

也可以手动部署：

```bash
# 上传文件
scp index.html proxy.js questions.js curriculum.js grade*.js <用户名>@<IP>:/tmp/homework-deploy/

# 远程执行
ssh <用户名>@<IP>
sudo cp /tmp/homework-deploy/*.js /tmp/homework-deploy/index.html /opt/homework/
sudo chown homework:homework /opt/homework/*.js /opt/homework/index.html
sudo systemctl restart homework
```

### 5. 验证部署

```bash
# 健康检查
curl http://<服务器IP>:8787/

# 访问应用
# 浏览器打开 http://<服务器IP>:8787/app

# 查看日志
sudo journalctl -u homework -f
```

## 配置说明

### 环境变量（在 homework.service 中配置）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `8787` | 监听端口 |
| `BIND` | `0.0.0.0` | 监听地址 |
| `UPSTREAM` | `https://openrouter.ai/api/v1/chat/completions` | AI 聊天上游 |
| `VOLC_APPID` | (空) | 火山引擎 AppID，填了才启用 TTS |
| `VOLC_TOKEN` | (空) | 火山引擎 Access Token |
| `VOLC_RESOURCE_ID` | (空) | 留空自动使用 `seed-tts-2.0` |
| `STATIC_DIR` | 脚本所在目录 | 静态文件目录 |
| `HOMEWORK_DB` | `<repo>/wrongbook.db` | 数据库路径（测试用） |

### API 路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 健康检查 |
| `/app` | GET | 主页面 |
| `/v1/chat/completions` | POST | AI 聊天代理（转发到上游） |
| `/tts?text=...&voice=...` | GET/POST | 火山引擎 TTS 语音合成 |
| `/api/wrongbook?user=...` | GET/POST/DELETE | 错题库 CRUD |
| `/api/wrongbook/<id>?user=...` | DELETE | 删除单条错题 |
| `/api/questions/pick` | GET | 出题：`?grade=&subject=&lv=&topic=&count=&source=&user=` |
| `/api/questions/coverage` | GET | 覆盖率矩阵 JSON |
| `/api/questions` | POST | 加题（拍照/手动） |
| `/api/curriculum` | GET | 课程纲目：`?grade=&subject=` |
| `/static/<file>` | GET | 静态文件（兼容 `static/` 子目录与根目录两种布局） |

### 前端默认配置

应用内置以下默认值（首次使用无需配置）：

- AI 接口：`https://openrouter.ai/api/v1/chat/completions`
- AI 模型：`openai/gpt-4o`
- TTS 地址：`http://192.168.3.79:8787/tts`
- TTS 音色：`saturn_zh_female_keainvsheng_tob`（可爱女生）

可在应用内 ⚙️ 设置页面修改。

## 题库说明

> 题库已迁移到 SQLite (`wrongbook.db`)。原 `grade*.js` / `questions.js` / `curriculum.js` 归档在 `legacy/`，仅供历史参考。

- **questions** 表：静态题（每题带 `content_hash` 去重）。`grade`、`subject`、`semester`、`topic`、`knowledge_points`、`lv` 都已结构化
- **generators** 表：题模板的元数据指针；模板代码在 `generators/<key>.js`
- **curriculum** 表：人教版课程纲目；`(grade, subject, topic)` 唯一
- 关卡按 `(grade, subject, semester?, lv?)` 经 `pickQuestions` 抽题；错题库按 `topic + lv` 反哺扩展练习

### 维护流程

1. 想新增静态题：手工编辑 seed 文件或 `POST /api/questions`，跑 `npm run db:seed:legacy`（content_hash 自动去重）
2. 想新增题模板：参考 `generators/_template.js` + `generators/README.md`，跑 `npm run db:seed:generators`
3. 改完跑 `npm run validate:bank`（schema 校验）+ `npm run coverage`（覆盖率审视）

校验命令：

```bash
npm run validate:bank   # schema + 生成器存在性 + topic 在 curriculum 内
npm run coverage        # grade × subject × semester × topic × lv 矩阵 + 缺口
```

## 常见问题

**Q: TTS 不出声？**
检查火山引擎 AppID/Token 是否正确配置，服务是否已开通 Seed-TTS 2.0。

**Q: 拍照出题识别不准？**
建议将 AI 模型改为 `openai/gpt-4o`（而非 mini），视觉识别能力更强。

**Q: 错题库 / 题库加载失败？**
确认 `better-sqlite3` 安装且 native 已编译：`cd /opt/homework && sudo -u homework npm rebuild better-sqlite3`。
确认 schema 已迁移：`sudo -u homework npm run db:migrate && sudo -u homework npm run db:seed`。

**Q: 跨 Node 版本部署后启动失败？**
`better-sqlite3` 是 native 模块，跨主版本需 rebuild：`sudo -u homework npm rebuild better-sqlite3`。

**Q: 手机上显示不正常？**
如果是手机或同局域网其他设备访问，请使用 `http://<IP>:8787/app`，不要用 `localhost`；如果是本机浏览器访问，`http://localhost:8787/app` 是可以的。
