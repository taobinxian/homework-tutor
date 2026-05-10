## ADDED Requirements

### Requirement: 题库 SQLite 表结构

系统 SHALL 在 `wrongbook.db` 中维护 `questions` / `generators` / `curriculum` 三张表，schema 必须包含本节定义的全部列与索引。表与现有 `wrong_questions` 共库。

`questions` 表必须包含：
- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `content_hash` TEXT UNIQUE NOT NULL（题目去重指纹）
- `grade` INTEGER NOT NULL（1-6）
- `subject` TEXT NOT NULL（math/chinese/english/science）
- `semester` TEXT NOT NULL（upper/lower/unknown）
- `topic` TEXT NOT NULL
- `knowledge_points` TEXT NOT NULL（JSON 数组）
- `lv` INTEGER NOT NULL（1/2/3）
- `q_type` TEXT NOT NULL（choice/input）
- `q` TEXT NOT NULL
- `options` TEXT（JSON 数组，input 类型为 NULL）
- `answer` TEXT NOT NULL
- `hints` TEXT（JSON 数组）
- `explain_text` TEXT
- `source` TEXT NOT NULL DEFAULT 'seed'（seed/photo/manual）
- `enabled` INTEGER NOT NULL DEFAULT 1
- `created_at`、`updated_at` DATETIME

索引：`idx_q_filter(grade, subject, semester, lv, enabled)`、`idx_q_topic(grade, subject, topic, enabled)`。

`generators` 表必须包含：
- `id`、`key` UNIQUE、`grade`、`subject`、`semester`、`topic`、`knowledge_points`、`lv`、`module_path`、`enabled`、`description`

索引：`idx_gen_filter(grade, subject, semester, lv, enabled)`。

`curriculum` 表必须包含：
- `id`、`grade`、`subject`、`semester`、`topic`、`knowledge_points`
- 唯一约束 `UNIQUE(grade, subject, topic)`

#### Scenario: 首次启动时表自动创建

- **WHEN** `proxy.js` 启动且 `wrongbook.db` 不存在 `questions` 表
- **THEN** 系统自动执行 `CREATE TABLE IF NOT EXISTS` 建立三张新表与所有索引，且不影响已存在的 `wrong_questions` 表

#### Scenario: 已有数据库幂等升级

- **WHEN** 一个已运行的 `wrongbook.db`（仅有 `wrong_questions`）执行 `npm run db:migrate`
- **THEN** 命令成功完成，新增三张表与索引，原有 `wrong_questions` 数据不受影响

### Requirement: content_hash 去重保证幂等迁移

系统 SHALL 为每条题目生成 `content_hash = sha1(grade|subject|q|answer)`，作为唯一约束。重复 upsert 同一题不得插入新行。

#### Scenario: 重复执行迁移脚本不重复插入

- **WHEN** 连续执行 `npm run db:seed:legacy` 两次
- **THEN** `questions` 表行数与第一次执行后相同；不抛 UNIQUE 冲突错误（脚本必须捕获或使用 `INSERT OR IGNORE`）

#### Scenario: 内容相同但元数据更新的题目

- **WHEN** seed 文件中已存在的题目改了 `lv` 或 `topic`
- **AND** 重新执行 seed 脚本
- **THEN** 系统执行 `UPDATE` 更新元数据字段，但不变更 `content_hash`、`id`，不重复插入

### Requirement: 现有 JS 题库无损迁移

系统 SHALL 提供 `scripts/migrate-from-js.js`（对应 `npm run db:seed:legacy`），将现有 `grade1.js` ~ `grade6.js` 中的全部题目（包含 `for(){rand()}` 物化结果）写入 `questions` 表，迁移后题数不少于现有 `finalizeQuestionBank()` 报告的 total。

#### Scenario: 全量迁移

- **WHEN** 在干净 DB 上跑 `npm run db:seed:legacy`
- **THEN** `SELECT COUNT(*) FROM questions` 不少于现有 `QB_ANNOTATION_REPORT.total`
- **AND** 每条题目的 `semester`、`topic`、`knowledge_points`、`lv`、`grade`、`subject` 字段均已正确补齐

#### Scenario: 字段补齐使用 finalizeQuestionBank

- **WHEN** 迁移脚本读取 `QB[g][subject]` 数组
- **AND** 题目缺失 `semester` 或 `knowledgePoints`
- **THEN** 脚本必须先调用 `finalizeQuestionBank()` 让 `curriculum.js` 自动补齐字段，再写入 DB

### Requirement: 课程纲目入库

系统 SHALL 提供 `scripts/seed-curriculum.js`（对应 `npm run db:seed:curriculum`），将 `curriculum.js` 中 `QB_CURRICULUM_MAP` 数据写入 `curriculum` 表。

#### Scenario: 纲目首次入库

- **WHEN** 在空 `curriculum` 表上执行 `npm run db:seed:curriculum`
- **THEN** 表中每个 `(grade, subject, topic)` 组合都对应一行，`semester` 与 `knowledge_points` 字段与 `curriculum.js` 一致

#### Scenario: 重复入库不复制

- **WHEN** 重复执行 `npm run db:seed:curriculum`
- **THEN** 行数不变，已有行的 `knowledge_points` 字段被更新为最新值

### Requirement: 共库不破坏错题表 + 追加 lv 列

系统 SHALL 保证新表的引入不丢失 `wrong_questions` 表数据或现有 `/api/wrongbook` 行为；MUST 通过现有 `ensureColumn` 模式幂等追加 `lv INTEGER` 列（缺省 2），用于 `wrongbook-practice` 出题按 `(topic, lv)` 聚合。

#### Scenario: 错题库已有数据保留

- **WHEN** 题库迁移完成后调用 `GET /api/wrongbook?user=xxx`
- **THEN** 返回的原有错题字段与迁移前完全一致，原有错题记录不丢失；新增的 `lv` 字段对老错题取缺省值 2

#### Scenario: lv 列幂等添加

- **WHEN** 已有 `wrong_questions` 表（无 `lv` 列）执行 `npm run db:migrate`
- **THEN** 表追加 `lv INTEGER` 列且不报错；二次执行同命令不重复添加

#### Scenario: 部署回滚保留新表

- **WHEN** 因故回滚到旧版 `index.html` + 旧版 `proxy.js`
- **THEN** 新增的 `questions/generators/curriculum` 表与 `wrong_questions.lv` 列可保留而不影响旧服务运行（旧服务忽略未知列）
