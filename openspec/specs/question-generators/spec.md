# question-generators Specification

## Purpose
TBD - created by archiving change migrate-bank-to-sqlite-and-pluggable-engines. Update Purpose after archive.
## Requirements
### Requirement: 生成器模块协议

每个生成器 MUST 是一个 CommonJS 模块，存放在仓库根 `generators/` 目录下，文件名格式 `g{grade}-{subject}-{slug}.js`。模块 MUST 导出对象包含：

- `meta`：元数据，必含字段 `key`（全局唯一，与文件名 slug 一致）、`grade`、`subject`、`semester`、`topic`、`knowledgePoints`（数组）、`lv`、`description`
- `generate(n, ctx)`：函数，返回长度 ≤ n 的题目数组；每条题目对象 schema 须与 `questions` 表行的 JS 表示一致；`source` 字段必须为 `'generated'`

#### Scenario: 模块结构合规

- **WHEN** 加载 `generators/g1-math-add-within-5.js`
- **THEN** `module.exports.meta` 含全部必填字段；`module.exports.generate(5)` 返回 5 个题目对象

#### Scenario: meta.key 与文件名一致

- **WHEN** 生成器文件名为 `g2-math-multiplication.js`
- **THEN** 该模块 `meta.key === 'g2-math-multiplication'`，否则 `npm run db:seed:generators` 必须报错

#### Scenario: generate 返回字段完整

- **WHEN** 调用 `generate(3)` 返回 3 个题目
- **THEN** 每个题目均含 `q`、`type`、`answer`、`hints`、`explain`、`topic`、`knowledgePoints`、`semester`、`grade`、`subject`、`lv`、`source='generated'` 字段

### Requirement: 生成器元数据自动注册到 DB

系统 SHALL 提供 `scripts/seed-generators.js`（对应 `npm run db:seed:generators`），扫描 `generators/*.js`，读取每个模块的 `meta`，按 `key` upsert 到 `generators` 表。

#### Scenario: 首次注册

- **WHEN** 在空 `generators` 表上执行 `npm run db:seed:generators`
- **AND** `generators/` 目录有 5 个模块
- **THEN** `SELECT COUNT(*) FROM generators` = 5

#### Scenario: meta 修改后重新 upsert

- **WHEN** 已注册的生成器 meta 中 `lv` 由 1 改为 2
- **AND** 重新执行 `npm run db:seed:generators`
- **THEN** 该 key 对应行 `lv` 字段更新为 2，未变 `id`

#### Scenario: 文件被删除时禁用

- **WHEN** 一个已注册的生成器 JS 文件被删除
- **AND** 重新执行 `npm run db:seed:generators`
- **THEN** 数据库中对应行的 `enabled` 字段被置为 0（不直接 DELETE，保留历史）

### Requirement: 首批核心生成器覆盖

系统 SHALL 在首次部署时落地至少 5 个核心生成器，覆盖以下高频题型：

- `g1-math-add-within-5`（5 以内加法）
- `g1-math-sub-within-5`（5 以内减法）
- `g1-math-add-within-10`（10 以内加法）
- `g1-math-carry-add-20`（20 以内进位加法）
- `g2-math-multiplication`（九九乘法表）

每个生成器 MUST 与 `curriculum` 表中的对应 `topic` 一致，且 `npm run validate:bank` 通过。

#### Scenario: 5 个核心生成器存在

- **WHEN** 在新部署完成后查询 `SELECT key FROM generators WHERE enabled=1`
- **THEN** 至少包含上述 5 个 key

#### Scenario: 生成器输出可被 picker 使用

- **WHEN** 调用 `pickQuestions({grade:1, subject:'math', lv:1, count:10, source:'generated'})`
- **THEN** 返回的题目均来自这些生成器之一，且字段合规

### Requirement: 生成器与静态题的 topic 一致性

每个生成器 `meta.topic` MUST 已在 `curriculum` 表中存在；`npm run validate:bank` MUST 校验此一致性，发现不一致时报错并退出非零状态码。

#### Scenario: 一致性校验通过

- **WHEN** 所有生成器 `meta.topic` 都能在 `curriculum` 表中找到对应行
- **THEN** `npm run validate:bank` 退出码 0

#### Scenario: 不一致退出非零

- **WHEN** 某个生成器 `meta.topic='不存在的话题'`
- **THEN** `npm run validate:bank` 输出错误信息并退出码非零

