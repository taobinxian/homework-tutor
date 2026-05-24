# Agent Handoff Protocol

多 agent（Claude Code、Codex 等）通过共享文件 `AGENT_HANDOFF.md` 完成异步交接的通信协议。

## 1. 设计目标

- **机读 + 人读**：agent 能 grep/parse 出"轮到我了"，人能直接 review
- **并发安全**：避免双写覆盖；明确"球在谁手里"
- **可追溯**：所有消息 append-only，可回放完整交互
- **可阻塞**：支持 question / blocked 状态，强制对方先解阻

## 2. 文件结构

`AGENT_HANDOFF.md` 由两个区组成：顶部 STATUS（O(1) 状态查询）+ MESSAGES（append-only 消息日志）。

```markdown
# AGENT HANDOFF BOARD

<!-- 追加新消息只能 append 到末尾。修改既有消息只允许更新 status 字段。 -->

## STATUS
\```yaml
turn: codex
last_msg_id: msg-007
updated_at: 2026-05-11T14:32:00Z
open_threads:
  - thread: thread-fast-mode-impl
    owner: codex
    blocked_on: null
\```

---

## MESSAGES

### msg-007
\```yaml
from: claude
to: codex
ts: 2026-05-11T14:32:00Z
type: request
thread: thread-fast-mode-impl
refs: [msg-005]
status: pending
artifacts:
  - openspec/changes/pipeline-fast-mode/tasks.md
\```

**Body**

请按 tasks.md 第 1 节执行 5 条 TransitionRule 的 TDD：
- 先写 `apps/api/app/tests/test_state_machine_fast_mode.py`
- 红 → 绿 → 重构
- 完成后把 test 输出贴回 response

**Acceptance**: `pytest test_state_machine_fast_mode.py -v` 全绿。

---

### msg-006
（更早的消息）
```

## 3. STATUS 字段

| 字段 | 类型 | 说明 |
|---|---|---|
| `turn` | enum | `claude` / `codex` / `human` — 当前持有写入权的 agent |
| `last_msg_id` | string | 最新消息 id，写新消息时 +1 |
| `updated_at` | ISO-8601 | 上一次更新 STATUS 的时间戳 |
| `open_threads[]` | list | 未关闭的议题清单 |
| `open_threads[].thread` | string | thread 标识（slug） |
| `open_threads[].owner` | enum | 当前 thread 主导者 |
| `open_threads[].blocked_on` | string \| null | 阻塞原因，null 表示进行中 |

## 4. 消息字段

每条消息 = `### msg-NNN` 标题 + YAML metadata 块 + Markdown body。

| 字段 | 必填 | 取值 / 说明 |
|---|---|---|
| `from` | ✅ | `claude` / `codex` / `human` |
| `to` | ✅ | 同上 |
| `ts` | ✅ | ISO-8601 时间戳 |
| `type` | ✅ | `request` 派活 / `response` 交付 / `question` 阻塞提问 / `handoff` 转交主导权 / `ack` 仅签收 / `status` 进度同步 |
| `thread` | ✅ | 议题串联标识，新议题用 `thread-<slug>` |
| `refs` | 可选 | 引用上游消息 id 数组 |
| `status` | ✅ | `pending` / `in_progress` / `completed` / `blocked` / `rejected` — 接收方更新 |
| `artifacts` | 可选 | 相关文件路径数组（仓库相对路径） |

### 4.1 Body 约定

- **request**：必须含 `**Acceptance**` 小节，说明完成判定标准
- **response**：必须含 `**Evidence**` 小节，贴出测试/编译输出或文件 diff 摘要
- **question**：body 第一行 `**Blocking**: yes`，末尾列举具体问题
- **handoff**：body 必须含 `**Reason**`（为何转交）+ `**Next step**`（建议接收方下一步）
- **blocked**：status 转 blocked 时 body 末尾必须有 `**Blocked on**: <reason>`

## 5. 状态流转

```
pending ──→ in_progress ──→ completed
                  │
                  ├─→ blocked ──(unblocked)──→ in_progress
                  │
                  └─→ rejected
```

- `pending`：消息刚 append，接收方未读
- `in_progress`：接收方已读并开始处理
- `completed`：任务完成（response 类消息）
- `blocked`：处理中遇阻，需对方回复
- `rejected`：不接受该请求（body 必须含拒绝理由）

## 6. 协议规则（硬约束）

1. **轮转锁**：写消息前先读 `STATUS.turn`，仅当 `turn == 自己` 才能 append。写完后更新 `turn` 给对方
2. **Append-only**：消息体（YAML metadata + Body）不可改；仅允许接收方更新自己**作为 `to`** 的消息的 `status` 字段
3. **消息 id 单调递增**：`msg-NNN` 三位补零（`msg-001` ... `msg-999`），超过 999 后扩位 `msg-1000`
4. **显式 handoff**：转交主导权必须用 `type: handoff`，不允许默认假定对方接手
5. **Blocked 必须有 reason**：`status: blocked` 时 body 末尾必须有 `**Blocked on**`
6. **STATUS 与 MESSAGES 一致性**：每次 append 消息后必须同步更新 STATUS 的 `turn` / `last_msg_id` / `updated_at`，否则视为消息无效

## 7. 并发与冲突处理

- **正常路径**：通过轮转锁串行写入
- **检测冲突**：若 agent 准备写入时发现 `STATUS.last_msg_id` 与自己 cached 不一致，必须重新读取整个文件
- **冲突恢复**：发生 git 合并冲突时 → 保留所有消息（按 ts 排序）→ 由人工解决 STATUS 区
- **文件大小**：超过 200 条消息后归档到 `docs/handoff-archive/YYYY-MM.md`，主板仅保留最近 50 条

## 8. 议题（Thread）管理

- 新议题：发起方在 `request` 消息里写 `thread: thread-<slug>`，同时在 STATUS.open_threads append 一项
- 议题完成：发起方在最后一条 response 收到后，主动写 `type: ack` 消息标 `status: completed`，并从 `open_threads` 移除
- 议题阻塞：owner 写 `type: question` 消息并把 `open_threads[].blocked_on` 设为问题摘要

## 9. 示例：一个完整议题

```markdown
### msg-010
\```yaml
from: claude
to: codex
ts: 2026-05-11T15:00:00Z
type: request
thread: thread-state-machine-tdd
status: pending
artifacts:
  - openspec/changes/pipeline-fast-mode/tasks.md
\```

**Body**

执行 tasks.md 第 1.1 - 1.2 节。

**Acceptance**: 5 条 TransitionRule 通过 `pytest test_state_machine_fast_mode.py -v`，全绿。

---

### msg-011
\```yaml
from: codex
to: claude
ts: 2026-05-11T15:18:00Z
type: response
thread: thread-state-machine-tdd
refs: [msg-010]
status: completed
artifacts:
  - apps/api/app/services/state_machine.py
  - apps/api/app/tests/test_state_machine_fast_mode.py
\```

**Body**

完成。

**Evidence**

\```
$ pytest test_state_machine_fast_mode.py -v
========================= 8 passed in 0.42s =========================
\```

5 条新 TransitionRule 已写入，`_TRANSITION_INDEX` 唯一性 invariant 通过测试。

---

### msg-012
\```yaml
from: claude
to: codex
ts: 2026-05-11T15:20:00Z
type: ack
thread: thread-state-machine-tdd
refs: [msg-011]
status: completed
\```

**Body**

议题关闭。下一议题另起 `thread-orchestrator-routing`。
```

## 10. 关键 Tradeoff

| 选择 | 替代方案 | 选择理由 |
|---|---|---|
| 单文件 `AGENT_HANDOFF.md` | 一议题一文件 | 单文件方便 grep 和 review；超 200 条再归档 |
| YAML metadata | JSON inline | 人读友好；机读用 `yq` 或正则即可 |
| 轮转锁 | 自由 append | 防双写覆盖；代价是多一步 `read STATUS.turn` |
| ID 单调递增 | UUID | 短、有序、易引用 |
| Append-only | 可编辑历史 | 可追溯；status 字段例外更新是受控写 |

## 11. 实施清单

- [ ] 在仓库根创建 `AGENT_HANDOFF.md`，含 STATUS 初始块 + 一条 seed 消息
- [ ] 在 `.gitattributes` 或 PR 模板里禁止用 `--force` push 覆盖该文件
- [ ] 在 Claude / Codex 各自的 agent prompt（如 `CLAUDE.md` / `AGENTS.md`）追加：每轮开始读 STATUS，写入前 check `turn`
- [ ] 200 条阈值触发后归档：`mv` 旧消息到 `docs/handoff-archive/YYYY-MM.md`，主板留最新 50 条
