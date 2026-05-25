# 二级 PRD 01：战役地图与关卡配置

- **所属总 PRD**：《学霸奇遇记：知识战场》
- **版本**：v1.0 / 满血首发上线版
- **负责人**：小P
- **目标读者**：polaw、小架、小码、小质
- **说明**：老板要求做完整产品；本文按“可上线发布的满血首发版”定义需求；分阶段只用于工程落地，不降低产品闭环。

---

## 1. 需求 / 问题

当前 homework-tutor 的选关方式偏参数面板：年级、科目、学期、难度、玩法、来源。它能用，但不像一个真正游戏，孩子缺少“我在冒险地图上推进”的感受。

需要把选题参数升级为 **战役地图 + 关卡节点**：孩子看到星球、章节、关卡、Boss 和奖励；研发侧则通过配置把关卡绑定到现有题库 picker。

---

## 2. 目标用户与场景

### 目标用户

- 小学生：希望看到清晰、有成就感的闯关路线。
- 家长：希望知道每一关对应哪个知识点。
- 研发 / 内容维护者：希望通过配置新增关卡，而不是改大量代码。

### 核心场景

1. 孩子打开首页，点击“继续冒险”。
2. 进入当前年级学科对应的星球地图。
3. 选择已解锁关卡，查看知识点、奖励和 Boss。
4. 通关后地图节点点亮，解锁下一关。

---

## 3. 方案概述

引入三层结构：

```text
星球 / 学科
→ 章节 / 学期 + 知识模块
→ 关卡 / 具体知识点 + 战斗配置
```

示例：

```text
机械星（一年级数学上册）
第 1 章：数字能量工厂
1-1 认识 0-5
1-2 5 以内加法
1-3 5 以内减法
1-4 连加连减
1-Boss 混乱计算兽
```

---

## 4. 用户流程

### 4.1 首次进入

```text
首页
→ 选择年级 / 或读取存档年级
→ 展示推荐学科星球
→ 进入战役地图
→ 默认高亮第一个未通关关卡
```

### 4.2 选择关卡

```text
战役地图
→ 点击关卡节点
→ 弹出关卡详情
→ 展示：知识点、题数、战斗类型、奖励、历史星级
→ 点击“开始补给”
```

### 4.3 通关后

```text
结算页
→ 返回地图
→ 当前节点显示星级
→ 若满足解锁条件，下一个节点解锁
→ 若章节完成，Boss 或下一章节解锁
```

---

## 5. 核心规则

### 5.1 解锁规则

首发版推荐简单规则：

- 每个章节第 1 关默认解锁。
- 普通关通关后解锁下一关。
- Boss 关需要本章节前置普通关全部至少 1 星。
- 复习副本不受主线解锁限制，由错题规则生成。

### 5.2 星级规则

| 条件 | 星级 |
|---|---|
| 未通关 | 0 星 |
| 通关，正确率 < 80% | 1 星 |
| 通关，正确率 ≥ 80% | 2 星 |
| 通关，正确率 = 100% 或达成特殊目标 | 3 星 |

### 5.3 关卡类型

| 类型 | 首发是否做 | 说明 |
|---|---:|---|
| normal | 是 | 普通清怪关 |
| elite | 是 | 精英怪/更强波次 |
| boss | 是 | 章节 Boss，有知识机制 |
| review | 是 | 薄弱点副本入口，可轻量展示 |
| challenge | 否 | 限时挑战、无伤挑战等后置 |

### 5.4 地图展示规则

- 节点展示状态：锁定 / 可挑战 / 已通关 / 3 星 / Boss。
- 节点点击后展示关卡详情，不直接开始。
- 当前推荐关卡有明显高亮。
- 若存在复习副本，地图顶部或侧边展示“薄弱点警报”。

---

## 6. 数据字段 / 配置项

### 6.1 campaign_worlds

```json
{
  "id": "world-math-mechanical",
  "subject": "math",
  "name": "机械星",
  "description": "数字和计算能量构成的星球",
  "theme": "mechanical",
  "icon": "⚙️",
  "enabled": true
}
```

### 6.2 campaign_chapters

```json
{
  "id": "g1-math-upper-ch01",
  "worldId": "world-math-mechanical",
  "grade": 1,
  "subject": "math",
  "semester": "upper",
  "name": "数字能量工厂",
  "order": 1,
  "topics": ["0的认识", "5以内加法", "5以内减法"],
  "enabled": true
}
```

### 6.3 campaign_levels

```json
{
  "id": "g1-math-upper-001",
  "chapterId": "g1-math-upper-ch01",
  "grade": 1,
  "subject": "math",
  "semester": "upper",
  "topic": "5以内加法",
  "knowledgePoints": ["5以内加法"],
  "levelType": "normal",
  "difficulty": 1,
  "questionSource": "mixed",
  "questionCount": 8,
  "battleConfig": {
    "engine": "knowledge-shooter",
    "theme": "mechanical-factory",
    "waves": 3,
    "enemyPool": ["slime-bot", "gear-bug"],
    "bossId": null
  },
  "reward": {
    "exp": 20,
    "gold": 10,
    "materials": ["math-core-small"]
  },
  "unlock": {
    "requiredLevelIds": [],
    "requiredStars": 0
  },
  "enabled": true
}
```

### 6.4 user_level_progress

```json
{
  "user": "default",
  "levelId": "g1-math-upper-001",
  "bestStars": 3,
  "bestAccuracy": 1,
  "clearTimes": 2,
  "lastResult": "win",
  "lastPlayedAt": "2026-05-23T00:00:00Z"
}
```

---

## 7. API 需求

### 7.1 获取地图

`GET /api/campaign/map?user=default&grade=1&subject=math&semester=upper`

返回：

```json
{
  "world": {},
  "chapters": [
    {
      "id": "g1-math-upper-ch01",
      "name": "数字能量工厂",
      "levels": [
        {
          "id": "g1-math-upper-001",
          "name": "5以内加法能量站",
          "topic": "5以内加法",
          "levelType": "normal",
          "status": "available",
          "bestStars": 2,
          "recommended": true
        }
      ]
    }
  ],
  "reviewAlerts": []
}
```

### 7.2 获取关卡详情

`GET /api/campaign/levels/:levelId?user=default`

返回关卡配置、历史进度、奖励预览。

---

## 8. 验收标准

### 8.1 产品验收

- [ ] 用户能从首页进入战役地图。
- [ ] 地图按年级 / 科目 / 学期展示章节和关卡。
- [ ] 关卡状态正确：锁定、可挑战、已通关、星级。
- [ ] 点击关卡展示详情。
- [ ] 通关后回到地图，节点星级更新。
- [ ] Boss 关按前置关卡解锁。

### 8.2 技术验收

- [ ] 关卡配置能绑定现有 `pickQuestions` 参数。
- [ ] 新增一个普通关不需要改战斗核心代码。
- [ ] 地图 API 返回结构稳定，可被前端直接渲染。
- [ ] `npm test` 通过。

### 8.3 数据验收

- [ ] 每个关卡必须有 grade / subject / semester / topic。
- [ ] 每个关卡必须有 questionCount、questionSource。
- [ ] 每个关卡必须有 battleConfig。
- [ ] 用户进度可持久化。

---

## 9. 首发边界与上线后增强

- 不做复杂大地图自由移动。
- 不做开放世界探索。
- 不做关卡编辑器 UI。
- 不做多人地图进度。
- 不做复杂剧情分支。
- 不做跨设备云同步，除非 Polaw 后续另行定优先级。

---

## 10. 建议下一步

1. 小架确认配置落库还是先 JSON 文件配置。
2. 小码评估前端地图渲染方式：DOM 节点地图优先，Canvas 可后置。
3. 小质设计地图状态与解锁规则测试用例。
4. 小P后续可补充首批关卡清单。