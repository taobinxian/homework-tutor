# PRD 05：错题怪兽图鉴与薄弱点悬赏任务

- **所属总 PRD**：《学霸奇遇记：知识战场》
- **版本**：v1.0 / 满血首发上线版
- **负责人**：小P
- **目标读者**：研发、测试、产品

---

## 1. 需求 / 问题

传统错题本对孩子缺少吸引力，家长也难以推动孩子主动复习。满血版要把“答错”转成游戏世界里的可见敌人和可完成任务：

- 答错题 → 生成或强化错题怪兽。
- 多次错同一知识点 → 形成薄弱点悬赏。
- 完成复习 → 击败/净化怪兽，领取奖励，提升掌握度。

目标不是惩罚错误，而是让孩子觉得：

> 我发现了一只怪兽，只要复习就能打败它。

---

## 2. 功能范围

### 2.1 首发必须做

1. 错题怪兽图鉴入口。
2. 按知识点聚合错题怪兽。
3. 怪兽状态：未发现 / 已发现 / 悬赏中 / 已净化。
4. 怪兽详情：知识点、错题数、最近错误、推荐复习。
5. 薄弱点悬赏任务自动生成。
6. 悬赏任务完成后更新：奖励、掌握度、怪兽状态。
7. 家长报告可引用悬赏任务。

### 2.2 上线后增强

- 怪兽稀有度、进化形态、连续复错变异。
- 周悬赏、Boss 级错题怪兽。
- 图鉴收集成就与基地陈列。

---

## 3. 用户流程

### 3.1 答错生成怪兽

```text
孩子答错题
→ 系统记录 wrong_questions / level_run_answers
→ 根据 topic / knowledge_points 聚合
→ 若该知识点无怪兽，生成“错题怪兽”
→ 结算页展示：发现了 XX 怪兽
→ 图鉴出现新条目
```

### 3.2 薄弱点悬赏

触发条件首发版推荐：

| 条件 | 结果 |
|---|---|
| 单知识点近 7 日错题数 ≥ 2 | 生成普通悬赏 |
| 单知识点正确率 < 60% 且题数 ≥ 3 | 生成重点悬赏 |
| Boss 关相关知识点失败 | 生成 Boss 破盾悬赏 |

流程：

```text
报告/结算识别薄弱点
→ 生成悬赏卡
→ 孩子点击挑战
→ 进入复习副本或补给题组
→ 达到完成条件
→ 怪兽净化 + 奖励 + 掌握度提升
```

---

## 4. 页面结构

### 4.1 图鉴列表页

字段：
- 怪兽名称、图标、知识点。
- 状态标签：已发现 / 悬赏中 / 已净化。
- 错题数、最近出现时间。
- 操作：查看、去复习。

空状态：
- 无错题：展示“目前没有错题怪兽，继续冒险收集知识能量”。

### 4.2 怪兽详情页

模块：
1. 怪兽形象与状态。
2. 关联知识点。
3. 错题列表：题干、你的答案、正确答案、讲解入口。
4. 掌握度状态：薄弱 / 巩固中 / 已掌握。
5. 推荐任务：复习 5 题 / 完成 Boss 破盾 / 连对 3 题。
6. 奖励预览：金币、宠物经验、徽章碎片、基地材料。

### 4.3 悬赏任务卡

字段：
- `bountyId`
- `topic`
- `knowledgePoints[]`
- `monsterId`
- `difficulty`: normal / hard / boss
- `target`: correctCount / accuracy / combo
- `progress`
- `reward`
- `status`: active / completed / claimed / expired

---

## 5. 数据建议

### 5.1 新增表：`wrong_monsters`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 怪兽 ID |
| user | string | 用户 |
| topic | string | 知识点主题 |
| knowledge_points_json | text | 知识点数组 |
| monster_type | string | 模板类型 |
| name | string | 展示名 |
| status | string | discovered / bounty / purified |
| wrong_count | number | 聚合错题数 |
| purified_count | number | 净化次数 |
| last_seen_at | datetime | 最近错误时间 |
| created_at / updated_at | datetime | 时间 |

### 5.2 新增表：`bounty_tasks`

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 任务 ID |
| user | string | 用户 |
| source | string | report / settlement / atlas |
| topic | string | 知识点 |
| monster_id | string | 关联怪兽 |
| task_type | string | review / combo / boss_break |
| target_json | text | 目标配置 |
| progress_json | text | 进度 |
| reward_json | text | 奖励 |
| status | string | active / completed / claimed |
| created_at / completed_at | datetime | 时间 |

---

## 6. 规则

### 6.1 怪兽命名

首发可用模板：

```text
{知识点短名} + 怪兽后缀
例如：退位减法吞吞兽、拼音迷雾怪、单词遗忘虫
```

### 6.2 净化条件

| 任务类型 | 完成条件 |
|---|---|
| 普通复习 | 完成 5 题且正确率 ≥ 80% |
| 重点悬赏 | 完成 8 题且正确率 ≥ 75% |
| Boss 破盾 | 完成 Boss 补给题组且至少答对 2 题 |
| Combo 修复 | 同知识点连对 3 题 |

### 6.3 奖励

- 普通悬赏：金币、宠物经验。
- 重点悬赏：装备材料、徽章碎片。
- Boss 悬赏：大招能量、Boss 徽章、基地装饰。

---

## 7. 接口建议

- `GET /api/monsters?user=default`
- `GET /api/monsters/:id`
- `POST /api/monsters/sync-from-wrongbook`
- `GET /api/bounties?user=default&status=active`
- `POST /api/bounties/generate`
- `POST /api/bounties/:id/complete`
- `POST /api/bounties/:id/claim`

---

## 8. 埋点

| 事件 | 参数 |
|---|---|
| wrong_monster_created | topic, monsterType, wrongCount |
| monster_atlas_open | userId, monsterCount |
| monster_detail_open | monsterId, topic, status |
| bounty_generated | source, topic, taskType, difficulty |
| bounty_start | bountyId, topic |
| bounty_complete | bountyId, accuracy, durationSec |
| bounty_claim_reward | bountyId, rewardType |

---

## 9. 验收标准

- [ ] 孩子答错一道题后，图鉴生成对应知识点怪兽。
- [ ] 同知识点错题数达到阈值后，自动生成悬赏任务。
- [ ] 从报告点击薄弱点可进入对应悬赏。
- [ ] 完成悬赏后，怪兽状态变为已净化或净化进度增加。
- [ ] 奖励能进入成长系统。
- [ ] 所有状态刷新后保持一致，重启页面不丢失。
