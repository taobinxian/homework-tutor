# AGENTS.md

本仓库由多个 AI agent 协作开发（Claude Code + Codex），通过共享文件 `AGENT_HANDOFF.md` 异步通信。

## 你（agent）每轮必做

1. **每轮开始**：Read 仓库根 `AGENT_HANDOFF.md` 顶部 `STATUS` 块
2. **检查轮次**：`STATUS.turn == 自己`（codex / claude）→ 可以处理消息或 append 新消息；`!= 自己` → 等待
3. **完整协议规范**：见 `AGENT_HANDOFF_PROTOCOL.md`（仓库根，与本文件同级）
4. **写消息硬约束**：append 后必须同步更新顶部 STATUS（`turn` / `last_msg_id` / `updated_at`），否则消息无效
5. **消息类型 body 约定**：
   - `request` 必含 `**Acceptance**` 段
   - `response` 必含 `**Evidence**` 段（贴测试 / 编译输出 / diff 摘要）
   - `question` 第一行 `**Blocking**: yes`
   - `blocked` 必含 `**Blocked on**` 段

## 项目要点

- Node.js + better-sqlite3 单体项目，前端原生 JS（无构建）
- 题库存储 `wrongbook.db`，schema 见 `openspec/specs/question-bank/spec.md`
- 关卡引擎抽象在 `static/app/engines/base.js`，子类放同目录
- 生成器协议见 `openspec/specs/question-generators/spec.md`
- 测试入口：`npm test`（node --test）；`npm run coverage` 看题库覆盖率
- 变更管理走 OpenSpec：`openspec/changes/<change-name>/{proposal,design,tasks,specs}.md`

## Agent Handoff Protocol

本仓库已启用多 agent 异步通信协议。每轮开始**必须**先 Read `AGENT_HANDOFF.md` 顶部 STATUS：

- `STATUS.turn == 自己` → 可以处理已有消息或 append 新消息
- `STATUS.turn != 自己` → 等待，不要写入

完整规范见 `AGENT_HANDOFF_PROTOCOL.md`。核心规则：
1. 写新消息前先 Read 整板拿 `last_msg_id`
2. append 消息后必须同步更新顶部 STATUS（`turn` / `last_msg_id` / `updated_at`）
3. `request` 必含 `**Acceptance**`、`response` 必含 `**Evidence**`
4. 议题闭环用 `type: ack` 并从 `open_threads` 移除

**双向唤起（必做）**：append 完消息 + 更新 STATUS 后，**必须**调用对应 notify 脚本唤起对方：

- 写完 `to: claude` 的消息 → `bash .agent-handoff/notify-claude.sh "<可选自定义提示>"`
- 写完 `to: codex` 的消息  → `bash .agent-handoff/notify-codex.sh "<可选自定义初始 prompt>"`

不唤起 = 对方不会主动来读板，等于消息没发。
