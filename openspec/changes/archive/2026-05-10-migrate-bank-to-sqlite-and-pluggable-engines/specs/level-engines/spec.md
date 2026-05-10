## ADDED Requirements

### Requirement: LevelEngine 抽象接口

系统 SHALL 在 `static/app/engines/base.js` 提供 `LevelEngine` 抽象类，所有关卡引擎 MUST 继承之。接口契约：

- `constructor(opts)` 接收 `{container, questions, callbacks, config?}`
- `callbacks` 对象至少包含 `onCorrect`、`onWrong`、`onWrongAdd`、`onComplete`、`requestExplain`、`requestTTS`
- 抽象方法（子类必须实现）：`start()`、`ask(q)`、`onAnswer(q, userAnswer, correct)`、`finish()`
- `destroy()`：清理 DOM 与事件监听

引擎 MUST NOT 直接调用 wrongbook API、TTS、AI 接口；所有外部交互必须通过 `callbacks` 注入。

#### Scenario: 基类提供契约

- **WHEN** 加载 `static/app/engines/base.js`
- **THEN** `LevelEngine` 类暴露上述方法签名；未实现的抽象方法在调用时抛 `Error('LevelEngine subclass must implement <method>')`

#### Scenario: 引擎独占 container 内 DOM

- **WHEN** 引擎被 `destroy()`
- **THEN** `container.innerHTML` 被清空，引擎注册的所有事件监听器已移除

### Requirement: BattleEngine 迁移现有"能量弹打怪"

系统 SHALL 在 `static/app/engines/battle.js` 实现 `BattleEngine`，其行为与现有 `index.html` 中的战斗动画、连击、Boss 反击逻辑功能等价。

#### Scenario: 现有战斗体验保留

- **WHEN** 用户选关后选择"战斗"玩法并完成 10 题
- **THEN** 视觉表现（能量弹动画、HP 条、Combo 计数、Boss 反击效果）与重构前观感一致

#### Scenario: 答错触发错题入库

- **WHEN** 用户答错一道题
- **THEN** BattleEngine 调用 `callbacks.onWrongAdd(q, userAnswer)`，未直接调用 `/api/wrongbook`

### Requirement: ShootingEngine 射击关玩法

系统 SHALL 在 `static/app/engines/shooting.js` 实现 `ShootingEngine`，玩法关键行为：

- 题目以选项作为靶子呈现，用户点击靶心 = 提交答案
- 每题有倒计时（lv1=15s, lv2=10s, lv3=6s）；超时算未命中（错题）
- 多个怪物从屏幕一侧进入；答对一题 = 击杀一个；答错或超时 = 怪物前进一格
- 怪物到达己方防线 = 关卡失败，立即触发 `finish()`，已答对题目计入战绩

#### Scenario: 倒计时按难度分级

- **WHEN** 关卡 `lv=2` 启动
- **THEN** 每题倒计时为 10 秒，UI 显示倒计时

#### Scenario: 超时算错

- **WHEN** 倒计时归零仍未提交
- **THEN** 引擎调用 `callbacks.onWrong(q, '')` 与 `onWrongAdd(q, '')`，并播放"未命中"反馈

#### Scenario: 怪物突破触发关卡失败

- **WHEN** 5 个怪物连续突破到防线
- **THEN** 引擎调用 `callbacks.onComplete({result:'fail', stats:{correct, wrong, ...}})`

### Requirement: FightingEngine 格斗关玩法

系统 SHALL 在 `static/app/engines/fighting.js` 实现 `FightingEngine`，玩法关键行为：

- 双方血条对决（玩家 vs Boss）
- 题目选项 = 招式（拳/腿/重击/必杀）；正确 = 出招命中扣 Boss 血；错误 = 被反击扣自己血
- Combo：连续答对累积 Combo 数；Combo ≥ 3 触发"必杀技"动画并加倍伤害
- Boss 多阶段：HP 降至 50% / 25% 时切换形态，难度递增（更短反应时间或更复杂题面）
- 任一方血条归零 = `finish()`，玩家归零为 `result:'fail'`，Boss 归零为 `result:'win'`

#### Scenario: 答对扣 Boss 血

- **WHEN** 用户连续答对 2 题
- **THEN** Boss HP 减少（具体伤害由 `config.damage` 决定，缺省 10）

#### Scenario: Combo 触发必杀

- **WHEN** Combo 达到 3
- **THEN** 引擎播放"必杀技"动画，下一题答对伤害 × 2

#### Scenario: Boss 多阶段切换

- **WHEN** Boss HP 首次降至 ≤ 50%
- **THEN** 引擎触发阶段 2 视觉效果（颜色变红/抖动），后续答错的反击伤害提升

### Requirement: 题目集合与玩法解耦

系统 SHALL 保证任意 picker 返回的 Question 数组都可以传给任意 LevelEngine 实现而不需修改题目结构。引擎 MUST NOT 假设题目特定 `subject` / `lv`。

#### Scenario: 同一题集挂载不同引擎

- **WHEN** 同一份 10 道二年级数学题数组分别传给 BattleEngine、ShootingEngine、FightingEngine
- **THEN** 三个引擎都能正常完成关卡，无需对题目对象做任何转换

### Requirement: 关卡选择 UI 增加玩法维度

系统 SHALL 在关卡选择界面新增"玩法"选项，可选值 `battle | shooting | fighting`，默认 `battle`；选择"来源"维度 `mixed | static | generated | wrongbook-practice`，默认 `mixed`。

#### Scenario: 默认值

- **WHEN** 用户首次进入关卡选择页
- **THEN** 玩法默认 "战斗"、来源默认 "混合"，可一键开始关卡而不必选这两项

#### Scenario: 玩法切换不变更题目筛选

- **WHEN** 用户在已选 `grade=1, subject=math, lv=2` 后切换玩法 `battle → shooting`
- **THEN** picker 调用参数中题目筛选条件不变，仅引擎实现切换
