# question-picker Specification

## Purpose
TBD - created by archiving change migrate-bank-to-sqlite-and-pluggable-engines. Update Purpose after archive.
## Requirements
### Requirement: 服务端出题器统一抽题入口

系统 SHALL 在 `lib/picker.js` 提供 `pickQuestions(opts)` 函数，作为唯一抽题入口。函数 MUST 接受参数 `{grade, subject, semester?, lv?, topic?, knowledgePoints?, source = 'mixed', count = 10, user = 'default', excludeIds = []}` 并返回 `Promise<Question[]>`。

返回的 Question 对象 MUST 满足如下结构：
- `q`、`type`、`answer`、`hints`、`explain`、`topic`、`knowledgePoints`、`semester`、`semesterLabel`、`grade`、`subject`、`lv`、`source` 字段必填
- `type='choice'` 时 `options` 必填且非空数组
- `type='input'` 时 `options` 可为 `null`
- 静态题包含 `id`（DB 行 ID），生成的题不包含 `id`

#### Scenario: 按基础参数抽题

- **WHEN** 调用 `pickQuestions({grade:1, subject:'math', lv:2, count:10, source:'static'})`
- **THEN** 返回数组长度 ≤ 10，每条题目均满足 `grade=1`、`subject='math'`、`lv=2`，且都来自 `questions` 表

#### Scenario: count 大于库存时返回所有可用题目

- **WHEN** 调用 `pickQuestions({grade:1, subject:'science', lv:3, count:50, source:'static'})` 且库存仅 5 题
- **THEN** 返回 ≤ 5 条题目，函数不抛错

### Requirement: 四种 source 抽题策略

picker MUST 支持以下 `source` 值，每种行为如下：

- `static`：仅从 `questions` 表中按过滤条件随机抽取
- `generated`：仅查 `generators` 表中匹配条件的生成器，按比例分配 `n` 调用 `generate(n_i, ctx)` 拼接
- `mixed`：默认 70% static + 30% generated 比例并行抽取，若任一侧库存 < 配额，自动用另一侧补齐
- `wrongbook-practice`：取该 user 的错题，按 `(grade, subject, topic, lv)` 聚合，每个错题点扩展 1-2 道同分类的静态题（不重复包含错题本身）

#### Scenario: source=generated 调用生成器模块

- **WHEN** 数据库中存在 `key='g1-math-add-within-5'` 的生成器记录，且对应 JS 模块导出 `generate`
- **AND** 调用 `pickQuestions({grade:1, subject:'math', lv:1, count:5, source:'generated'})`
- **THEN** picker 通过 `require(module_path)` 加载模块并调用 `generate(5, ctx)`，返回的题目 `source` 字段为 `'generated'`

#### Scenario: source=mixed 自动补齐

- **WHEN** 调用 `pickQuestions({grade:6, subject:'science', lv:3, count:10, source:'mixed'})`
- **AND** static 候选只有 2 题，无可用 generator
- **THEN** picker 返回 ≤ 2 条静态题，不抛错；不会因为生成器侧 0 题而失败

#### Scenario: source=wrongbook-practice 错题反哺

- **WHEN** user `xiaoming` 的错题库中有 3 道一年级数学错题
- **AND** 调用 `pickQuestions({grade:1, subject:'math', count:10, source:'wrongbook-practice', user:'xiaoming'})`
- **THEN** 返回的题目集合包含原始错题与同 `(topic, lv)` 的扩展静态题，扩展题不与错题重复

### Requirement: 题目去重保证

picker SHALL 在返回结果前对题目按 `content_hash`（无 hash 时按 `q+answer`）去重，避免同一关出现重复题目。

#### Scenario: mixed 模式下 static 与 generated 内容相同

- **WHEN** 静态题和生成器恰好生成相同 `q+answer`
- **THEN** 返回数组中该题只出现一次

#### Scenario: excludeIds 过滤

- **WHEN** 调用 `pickQuestions({..., excludeIds:[1,2,3]})`
- **THEN** 返回结果不包含 `id ∈ {1,2,3}` 的题目

### Requirement: HTTP API 暴露 picker 能力

系统 SHALL 在 `proxy.js` 注册以下路由，由 picker 支撑：

- `GET /api/questions/pick?grade=&subject=&semester=&lv=&topic=&count=&source=&user=` → JSON 数组（Question[]）
- `GET /api/questions/coverage` → 覆盖率矩阵 JSON
- `GET /api/curriculum?grade=&subject=` → 课程纲目 JSON
- `POST /api/questions` body 含 Question 字段 → 写入 `questions` 表（content_hash 去重），返回 `{ok, id?}`

所有路由 MUST 设置同 CORS 头与现有 `/api/wrongbook` 一致。

#### Scenario: pick 路由正常返回

- **WHEN** `GET /api/questions/pick?grade=1&subject=math&lv=2&count=5&source=static`
- **THEN** 响应状态 200，Content-Type `application/json`，body 是长度 ≤ 5 的 Question 数组

#### Scenario: pick 路由参数缺失

- **WHEN** 请求未带 `grade` 或 `subject`
- **THEN** 响应状态 400，body 为 `{error:'缺少必填参数 grade/subject'}`

#### Scenario: POST 加题 content_hash 冲突

- **WHEN** `POST /api/questions` 提交一条已存在 `content_hash` 的题目
- **THEN** 响应状态 200，body 含 `{ok:true, duplicate:true, id}`，不重复插入

#### Scenario: coverage 路由

- **WHEN** `GET /api/questions/coverage`
- **THEN** 响应包含 `{matrix:[{grade,subject,semester,topic,lv,static,generated,total}], gaps:[...], threshold:N}` 结构

### Requirement: Question 输出 schema 由后端统一补齐

picker SHALL 保证返回的每个 Question 对象 `semesterLabel` 字段已根据 `semester` 补齐为「上册/下册/未标注」之一，避免前端重复实现映射。

#### Scenario: semester='upper' 自动补 semesterLabel

- **WHEN** picker 返回一道 `semester='upper'` 的题
- **THEN** 该题 `semesterLabel === '上册'`

