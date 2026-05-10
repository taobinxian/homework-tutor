## ADDED Requirements

### Requirement: 覆盖率矩阵命令

系统 SHALL 提供 `npm run coverage` 命令，输出 `grade × subject × semester × topic × lv` 维度的题数矩阵，每个单元格显示静态题数 / 生成器数 / 总数。

输出 MUST 包含：
- 矩阵主体（按年级、科目、学期分组打印）
- 阈值（默认 `N=3`）下的"缺口"列表（`总数 < N` 的单元格）
- 总览行（总题数、覆盖率百分比）
- JSON 输出选项：`npm run coverage -- --json` 输出机器可读格式

#### Scenario: 文本输出矩阵

- **WHEN** 在已迁移的项目中执行 `npm run coverage`
- **THEN** 命令成功完成（退出码 0），stdout 含每个 `(grade, subject, semester, topic, lv)` 单元格的题数

#### Scenario: JSON 输出

- **WHEN** 执行 `npm run coverage -- --json > coverage.json`
- **THEN** `coverage.json` 是合法 JSON，含 `{matrix, gaps, summary, threshold}` 字段

### Requirement: 覆盖率阈值卡线

`npm run coverage` SHALL 接受可选 `--threshold N` 参数，缺省 N=3；当存在 `(grade, subject, semester, topic, lv)` 单元格题数（含静态 + 生成器）小于阈值时输出警告；提供 `--strict` 开关使存在缺口时退出码非零。

#### Scenario: 阈值默认 3

- **WHEN** 执行 `npm run coverage` 而未指定 `--threshold`
- **THEN** 阈值取 3；缺口列表只列出题数 < 3 的单元格

#### Scenario: strict 模式失败

- **WHEN** 存在任何缺口单元格
- **AND** 执行 `npm run coverage -- --strict`
- **THEN** 命令退出码非零；CI 据此可阻塞合并

### Requirement: 基线对比避免缺口扩大

系统 SHALL 支持把当前覆盖率"快照"写入仓库根的 `.coverage-baseline.json`；`npm run coverage -- --check-baseline` MUST 比较当前缺口与基线，若**新增**缺口（基线之外的新单元格 < 阈值）则退出码非零。

#### Scenario: 维持基线

- **WHEN** 一次 PR 没有引入新的缺口（缺口集合 ⊆ 基线缺口集合）
- **THEN** `npm run coverage -- --check-baseline` 退出码 0

#### Scenario: 新增缺口失败

- **WHEN** 一次 PR 让一个原本满足阈值的单元格题数降低到阈值以下
- **THEN** `npm run coverage -- --check-baseline` 退出码非零并列出新增缺口

#### Scenario: 主动降低基线

- **WHEN** 一次 PR 大量补题、不再有缺口
- **AND** 执行 `npm run coverage -- --update-baseline`
- **THEN** `.coverage-baseline.json` 被改写为更小的缺口集合

### Requirement: validate-bank 校验题库 schema

`npm run validate:bank` SHALL 在迁移后基于 `questions` / `generators` / `curriculum` 表做 schema 级校验，至少包含：

- 每条 `questions` 行的 `q`、`answer` 非空
- `q_type='choice'` 时 `options` JSON 至少 2 项；`answer ∈ options`
- `content_hash` 全表唯一（DB UNIQUE 双重确认）
- 每条题目的 `topic` 在 `curriculum` 表存在（除非 `source IN ('photo','manual')`）
- 每个 `generators` 行 `module_path` 文件存在且可 `require`
- `meta.key` 与 `generators.key` 一致

任何校验失败 MUST 输出明确错误信息且退出码非零。

#### Scenario: 校验通过

- **WHEN** 数据库与代码处于一致状态
- **THEN** `npm run validate:bank` 退出码 0，stdout 输出"✅ 题库校验通过"与各项统计

#### Scenario: 选项答案不一致

- **WHEN** 某题 `q_type='choice'` 但 `answer` 不在 `options` 列表中
- **THEN** 命令退出码非零，输出该题 `id` 与具体错误

#### Scenario: 生成器模块缺失

- **WHEN** `generators` 表中某行 `module_path` 文件已被删除
- **THEN** 命令退出码非零，输出该 `key` 与缺失路径

### Requirement: 部署流程集成迁移命令

系统 SHALL 在 `package.json` 提供以下脚本，支持顺序执行完成数据库初始化：

- `db:migrate`：创建/升级表与索引（幂等）
- `db:seed:curriculum`：写入课程纲目
- `db:seed:legacy`：把现有 `grade*.js` 题库迁入 `questions` 表
- `db:seed:generators`：扫描 `generators/*.js` 注册元数据
- `db:seed`：组合命令，按上述顺序串行执行
- `coverage`：覆盖率矩阵
- `validate:bank`：schema 校验

`deploy.sh` MUST 在每次部署后自动运行 `npm run db:migrate && npm run db:seed`。

#### Scenario: 部署脚本执行迁移

- **WHEN** 在生产环境执行 `./deploy.sh <user>`
- **THEN** 部署流程成功完成；DB schema 与 seed 数据已同步至最新

#### Scenario: 命令顺序无副作用

- **WHEN** 顺序执行 `db:migrate → db:seed:curriculum → db:seed:legacy → db:seed:generators` 然后再次执行同一序列
- **THEN** 数据库行数与第一次执行后相同（幂等）
