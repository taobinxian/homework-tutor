# 二级 PRD 03：射击战斗与 Boss 机制

- **所属总 PRD**：《学霸奇遇记：知识战场》
- **版本**：v1.0 / 满血首发上线版
- **负责人**：小P
- **目标读者**：polaw、小架、小码、小质
- **说明**：老板要求做完整产品；本文按“可上线发布的满血首发版”定义需求；分阶段只用于工程落地，不降低产品闭环。

---

## 1. 需求 / 问题

当前 Shooting 玩法仍偏“点答案靶子”，操作感不足。知识战场需要一个真正的战斗阶段：孩子能移动、射击、躲避、释放技能，并使用通过答题获得的资源。

核心目标：

> 从“答题射击”升级为“答题补给 + 真实射击闯关”。

---

## 2. 目标用户与场景

### 目标用户

- 孩子：需要更强的操作反馈、打怪爽感和 Boss 挑战。
- 家长：需要战斗不脱离学习目标。
- 研发：需要明确首发版战斗引擎边界。

### 核心场景

1. 孩子补给答题后获得弹药和技能。
2. 进入战斗场景，移动角色并射击怪物。
3. 每完成一波，获得掉落或进入补给。
4. Boss 出现，触发知识护盾机制。
5. 击败 Boss 后结算学习和游戏结果。

---

## 3. 方案概述

首发版建议新增或演进为：`KnowledgeShooterEngine`。

它与现有 Shooting 的区别：

| 维度 | 现有 Shooting | KnowledgeShooterEngine |
|---|---|---|
| 核心交互 | 点击答案目标 | 移动 + 射击 + 技能 |
| 题目位置 | 战斗中直接作为目标 | 补给阶段 / Boss 机制 |
| 资源 | 分数 / 防线 | 弹药、护盾、技能、大招 |
| 沉浸感 | 中等 | 更强 |

---

## 4. 用户流程

```text
知识补给完成
→ 展示资源装载
→ 进入战斗地图
→ 第 1 波小怪
→ 第 2 波小怪 + 精英怪
→ 中途补给
→ 第 3 波小怪
→ Boss 出现
→ Boss 知识护盾
→ 击败 Boss / 失败
→ 结算
```

---

## 5. 核心战斗规则

## 5.1 操作规则

首发版优先做移动端友好方案：

- 左侧虚拟摇杆 / 左右方向按钮：移动。
- 右侧射击按钮：普通射击。
- 技能按钮：释放冰冻 / 爆裂。
- 大招按钮：能量满后可释放。
- 护盾资源：自动抵挡一次伤害，也可做手动按钮。

桌面端兼容：

- WASD / 方向键移动。
- 空格 / 鼠标点击射击。
- 数字键释放技能。

## 5.2 战斗资源消耗

| 操作 | 消耗 |
|---|---|
| 普通射击 | ammo_basic -1 |
| 能量射击 | ammo_power -1 |
| 冰冻技能 | skill_freeze -1 |
| 爆裂技能 | skill_bomb -1 |
| 大招 | ultimate_energy -1 |
| 护盾 | shield -1 |

## 5.3 胜负规则

胜利：

- 清完普通关全部波次。
- Boss 关击败 Boss。

失败：

- 玩家 HP <= 0 且无复活资源。
- 护送/守护类关卡目标失败。

首发版失败处理：

- 提供“复活补给”：答 1-3 道题，答对恢复一定 HP。
- 若放弃，则进入结算，保留学习记录和错题。

## 5.4 波次规则

普通关首发版默认 3 波：

| 波次 | 内容 |
|---|---|
| Wave 1 | 少量基础怪，教学和热身 |
| Wave 2 | 增加速度或血量，出现精英怪 |
| Wave 3 | 更多怪物，资源消耗压力 |

## 5.5 敌人类型

| enemyKey | 名称 | 行为 |
|---|---|---|
| slime-bot | 软泥机器人 | 慢速靠近 |
| gear-bug | 齿轮虫 | 快速直线移动 |
| shield-drone | 护盾无人机 | 需要多次攻击 |
| quiz-mage | 混乱法师 | 触发知识干扰，Boss 关优先 |

---

## 6. Boss 机制

## 6.1 Boss 基础结构

每个 Boss 包含：

- HP
- 阶段
- 普通攻击
- 召唤小怪
- 知识护盾
- 弱点窗口

## 6.2 阶段规则

| HP 区间 | 阶段 | 行为 |
|---|---|---|
| 100%-70% | 阶段 1 | 普通攻击，召唤少量小怪 |
| 70%-40% | 阶段 2 | 开启知识护盾，需补给题破解 |
| 40%-0% | 阶段 3 | 攻击加快，出现大招窗口 |

## 6.3 知识护盾

Boss 进入护盾状态时：

```text
Boss 免疫或减伤
→ 弹出 1-2 道当前知识点题
→ 答对削弱护盾 50%
→ 答错削弱护盾 20%，但 Boss 继续攻击或召唤小怪
```

## 6.4 学科 Boss 示例

| 学科 | Boss 机制 |
|---|---|
| 数学 | 护盾显示算式，答对才能破盾 |
| 语文 | 找出正确词语/句子破解文字迷雾 |
| 英语 | 根据单词或句型选择弱点 |
| 科学 | 根据知识点选择元素克制技能 |

首发版优先实现数学 Boss，其他学科先复用通用知识护盾。

---

## 7. 数据字段 / 配置项

### 7.1 battle_config

```json
{
  "engine": "knowledge-shooter",
  "theme": "mechanical-factory",
  "player": {
    "maxHp": 100,
    "speed": 1.0
  },
  "waves": [
    {
      "wave": 1,
      "enemies": [
        { "enemyKey": "slime-bot", "count": 5, "spawnDelayMs": 800 }
      ]
    },
    {
      "wave": 2,
      "enemies": [
        { "enemyKey": "slime-bot", "count": 6 },
        { "enemyKey": "gear-bug", "count": 3 }
      ],
      "supplyAfter": true
    }
  ],
  "bossId": "boss-math-chaos-calculator"
}
```

### 7.2 boss_config

```json
{
  "id": "boss-math-chaos-calculator",
  "name": "混乱计算兽",
  "subject": "math",
  "topic": "5以内加法",
  "maxHp": 300,
  "phases": [
    { "hpBelow": 0.7, "action": "summon" },
    { "hpBelow": 0.4, "action": "knowledge_shield", "questionCount": 2 }
  ],
  "rewards": {
    "exp": 50,
    "gold": 30,
    "materials": ["boss-core-math-1"]
  }
}
```

### 7.3 combat_result

```json
{
  "levelRunId": "run-001",
  "result": "win",
  "durationSec": 180,
  "playerHpLeft": 42,
  "enemiesDefeated": 28,
  "damageTaken": 58,
  "resourcesUsed": {
    "ammo_basic": 35,
    "skill_freeze": 1
  },
  "boss": {
    "bossId": "boss-math-chaos-calculator",
    "defeated": true,
    "shieldQuestionsCorrect": 2,
    "shieldQuestionsWrong": 0
  }
}
```

---

## 8. 验收标准

### 8.1 产品验收

- [ ] 玩家可以在战斗阶段移动。
- [ ] 玩家可以使用补给获得的弹药射击。
- [ ] 玩家可以释放至少一种技能。
- [ ] 敌人有基础移动和碰撞 / 攻击反馈。
- [ ] 战斗有明确胜负。
- [ ] Boss 有阶段变化和知识护盾。
- [ ] 战斗结果进入结算页。

### 8.2 学习验收

- [ ] Boss 知识护盾题来自当前关卡 topic。
- [ ] Boss 题答错进入错题链路。
- [ ] 战斗不绕过学习资源：资源必须来自补给。

### 8.3 技术验收

- [ ] `KnowledgeShooterEngine` 与题库 API 解耦。
- [ ] 引擎通过 callbacks 上报事件：resourceUsed、enemyDefeated、playerDamaged、finish。
- [ ] 移动端和桌面端至少主路径可玩。
- [ ] `prefers-reduced-motion` 下动画降载。

---

## 9. 首发边界与上线后增强

- 不做 3D。
- 不做多人联机。
- 不做复杂物理引擎。
- 不做地图自由探索。
- 不做超过 2 种技能的复杂组合。
- 首发版不做所有学科完全差异化 Boss，先做通用机制 + 数学示例；上线后逐步扩展学科 Boss。

---

## 10. 建议下一步

1. 小架确定复用现有 Shooting 还是新增 `KnowledgeShooterEngine`。
2. 小码先做一条完整数学 Boss 关作为端到端 Demo。
3. 小质优先测移动端操控、资源消耗、Boss 护盾题、失败复活。