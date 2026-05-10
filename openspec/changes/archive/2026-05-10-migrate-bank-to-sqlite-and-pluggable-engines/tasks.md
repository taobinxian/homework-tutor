## 1. 数据库 schema 与迁移基础

- [x] 1.1 抽出 `lib/db.js`：导出共享的 `db` 实例 + 表初始化函数 `initSchema(db)`（包含 `wrong_questions` 现有 schema + `ensureColumn` 列升级），被 `proxy.js` 与脚本共用
- [x] 1.2 在 `lib/db.js` 的 `initSchema` 内新增三张表与索引：`questions` / `generators` / `curriculum`（`CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`）
- [x] 1.3 在 `lib/db.js` 的 `ensureColumn` 调用列表追加 `lv INTEGER DEFAULT 2`（用于 `wrongbook-practice` 按 lv 聚合错题）
- [x] 1.4 在 `package.json` 增加脚本：`db:migrate`、`db:seed:curriculum`、`db:seed:legacy`、`db:seed:generators`、`db:seed`
- [x] 1.5 实现 `scripts/db-migrate.js`：调用 `initSchema`，输出当前 DB schema 状态摘要；幂等
- [x] 1.6 修改 `proxy.js` 错题库 POST 处理：接收 `lv` 字段写入；GET 返回包含 `lv`
- [x] 1.7 端到端验证：在干净 DB 上跑 `npm run db:migrate`，再次执行不变；旧 `wrong_questions` 数据保留；新 `lv` 列存在且对老行取缺省 2

## 2. 题库数据迁移

- [x] 2.1 编写 `scripts/db-seed-curriculum.js`：在 Node 中 `require('./curriculum.js')`，遍历 `QB_CURRICULUM_MAP`，按 `(grade, subject, topic)` UPSERT 进 `curriculum` 表
- [x] 2.2 验证 curriculum 入库：跑 `db:seed:curriculum` 两次后行数稳定，覆盖六个年级所有学科
- [x] 2.3 编写 `scripts/db-seed-legacy.js`：构造 Node 兼容 globalThis（提供 `rand/shuffle/pick`），`require('./questions.js')` + 6 个 `grade*.js`，调用 `finalizeQuestionBank()` 后遍历 `QB[g][subject]`，按 `content_hash = sha1(grade|subject|q|answer)` UPSERT 进 `questions` 表
- [x] 2.4 验证 legacy 入库：跑 `db:seed:legacy` 后 `SELECT COUNT(*) FROM questions` ≥ `QB_ANNOTATION_REPORT.total`；二次执行行数不变；抽样 10 道题对比字段
- [x] 2.5 在 README/DEPLOY 增加"首次部署需运行 `npm run db:seed`"说明（已在 G8 一并完成）

## 3. 出题器与生成器

- [x] 3.1 实现 `lib/picker.js` 的 `pickQuestions(opts)` 主函数 + 辅助：参数校验、过滤构造、`source` 分派、去重、`semesterLabel` 补齐
- [x] 3.2 实现 `source='static'` 抽题：`SELECT ... ORDER BY RANDOM() LIMIT n` + 反序列化 JSON 字段
- [x] 3.3 实现 `source='generated'` 抽题：查 `generators` 表 → `require(module_path)` → 调 `generate(n_i, ctx)` → 拼接
- [x] 3.4 实现 `source='mixed'` 抽题：默认 70/30 比例并行 + 自动补齐策略
- [x] 3.5 实现 `source='wrongbook-practice'` 抽题：取错题 → 按 `(topic, lv)` 聚合 → 每点扩展 1-2 道同分类静态题 → 加权返回
- [x] 3.6 picker 单元测试 / 端到端冒烟：四种 source 各跑一遍，断言返回字段完整、数量合理、去重生效
- [x] 3.7 在 `generators/` 目录创建生成器模块协议示例 `_template.js` + `README.md`
- [x] 3.8 实现 5 个核心生成器：`g1-math-add-within-5`、`g1-math-sub-within-5`、`g1-math-add-within-10`、`g1-math-carry-add-20`、`g2-math-multiplication`，每个含 `meta` + `generate(n, ctx)`
- [x] 3.9 实现 `scripts/db-seed-generators.js`：扫描 `generators/*.js`（排除 `_template.js`、`index.js`、子目录），读 `meta`，校验 `meta.key` 与文件名一致，UPSERT 至 `generators` 表；磁盘已不存在的 key 置 `enabled=0`
- [x] 3.10 验证生成器迁移：`db:seed:generators` 跑后 5 个 key enabled=1；删除一个文件再跑，对应行 enabled=0

## 4. HTTP API 路由

- [x] 4.1 在 `proxy.js` 增加 `/api/questions/pick` 路由：解析 query params → 调 `pickQuestions` → JSON 响应；错误时返回 400/500 + JSON
- [x] 4.2 增加 `/api/curriculum` 路由：可选 `grade/subject` 过滤 → 返回数组
- [x] 4.3 增加 `POST /api/questions` 路由：解析 body → 计算 `content_hash` → UPSERT → 返回 `{ok, id, duplicate?}`
- [x] 4.4 增加 `/api/questions/coverage` 路由：调用覆盖率聚合 SQL → 返回 `{matrix, gaps, summary, threshold}`
- [x] 4.5 端到端验证：用 curl 跑四个新路由，确认 CORS 头、状态码、响应结构合规

## 5. 前端 ESM 拆分

- [x] 5.1 创建 `static/app/` 目录与各模块空文件（`main.js`、`data.js`、`ui.js`、`tts.js`、`pets.js`、`ai.js`、`engines/{base,battle,shooting,fighting}.js`）
- [x] 5.2 实现 `data.js`：`fetchPick`、`fetchCoverage`、`fetchCurriculum`、`addQuestion`、`wrongbookList/Add/Delete/Clear`，错误时 reject `Error{status, message}`
- [x] 5.3 实现 `ui.js`：`toast`、`showConfirm`、设置弹窗（迁移自 `index.html` 中对应代码）
- [x] 5.4 实现 `tts.js`：迁移 TTS 预加载缓存与播放逻辑（保留现有 `_ttsCache` 行为）
- [x] 5.5 实现 `ai.js`：迁移 `/v1/chat/completions` 调用 + 拍照出题 + AI 讲解请求
- [x] 5.6 实现 `pets.js`：迁移宠物升级/装饰/动画
- [x] 5.7 实现 `engines/base.js`：`LevelEngine` 抽象类，定义构造、抽象方法 stub（抛 NotImplemented）、`destroy` 默认实现
- [x] 5.8 实现 `engines/battle.js`：把 `index.html` 中现有"能量弹打怪"逻辑迁入；通过 `callbacks` 向外通信
- [x] 5.9 实现 `engines/shooting.js`：靶心 + 倒计时（lv1=15s/lv2=10s/lv3=6s）+ 移动靶；超时算错；怪物突破触发关卡失败
- [x] 5.10 实现 `engines/fighting.js`：双方血条 + 招式按键 + Combo 必杀 + Boss 多阶段（HP 50%/25% 切换）
- [x] 5.11 实现 `main.js`：启动流程、视图路由、关卡选择 UI（年级/科目/学期/难度/玩法/来源）、引擎实例化与 callbacks 接线
- [x] 5.12 修改 `index.html`：删除所有 `<script src="/static/grade*.js">` 等旧引用与原有内嵌 JS（仅保留必要 HTML 模板与 CSS），加 `<script type="module" src="/static/app/main.js">`
- [ ] 5.13 浏览器手测全部现有路径：选关 → 答题 → 错题入库 → AI 讲解 → TTS → 宠物升级 → 拍照出题；新增三种引擎（battle/shooting/fighting）各跑一关 — **未在 CLI 完成，需用户在浏览器打开 http://localhost:8787/app 验证**

## 6. 旧文件归档

- [x] 6.1 创建 `legacy/` 目录与 `README.md`，说明这是迁移前快照、勿引用、勿编辑
- [x] 6.2 把 `grade1.js`、`grade2.js`、…、`grade6.js`、`questions.js`、`curriculum.js` 移入 `legacy/`
- [x] 6.3 grep 全仓库确认无代码再 require/import 这些路径（除 `legacy/README.md`）
- [x] 6.4 更新 `.gitignore` 与 `package.json` `main` 字段（如必要）

## 7. 覆盖率与校验

- [x] 7.1 实现 `lib/coverage.js`：聚合函数 `computeCoverage(db, {threshold})`，从 DB 把 `questions` + `generators` 与 `curriculum` LEFT JOIN 后输出矩阵 + 缺口列表；同时被 CLI 与 HTTP `/api/questions/coverage` 路由复用
- [x] 7.2 实现 `scripts/coverage.js`：CLI 包装 `lib/coverage.js`；支持 `--json`、`--threshold N`、`--strict`、`--check-baseline`、`--update-baseline`（读写 `.coverage-baseline.json`）
- [x] 7.3 让 `proxy.js` 的 `/api/questions/coverage` 路由调用 `lib/coverage.js`，返回 `{matrix, gaps, summary, threshold}`
- [x] 7.4 重写 `scripts/validate-question-bank.js` 内容（保留文件名以兼容现有 `npm run validate:bank` 脚本配置）：从 DB 校验 schema（`q/answer` 非空、choice 类 `answer ∈ options` 等）+ 生成器模块存在性 + `meta.key` 与文件名一致 + topic 在 curriculum 内
- [x] 7.5 在 `package.json` 增加 `coverage` 脚本（`validate:bank` 已存在）
- [x] 7.6 端到端验证：`npm run coverage` 输出矩阵；`npm run validate:bank` 通过；故意制造一处 schema 不一致，确认失败退出码非零；HTTP 路由返回与 CLI 一致

## 8. 部署与文档

- [x] 8.1 修改 `deploy.sh`：远端 `npm install` 后追加 `npm run db:migrate && npm run db:seed`；同步上传 `lib/scripts/static/generators/legacy` 子目录
- [x] 8.2 更新 `homework.service`：保持现状（迁移由 deploy.sh 在部署时执行；service 文件无需 ExecStartPre）
- [x] 8.3 更新 `README.md`：项目结构、题库与出题器架构、生成器扩题指南、覆盖率命令、API 路由
- [x] 8.4 更新 `DEPLOY.md`：增加 "better-sqlite3 native rebuild" 与 "首次部署执行 `npm run db:seed`" 章节
- [x] 8.5 在 `README.md` 同步关卡选择 UI 维度变化（玩法 / 来源 字段说明） — 含三引擎说明

并入 G8 一同处理的任务：
- [x] 2.5 在 README/DEPLOY 增加"首次部署需运行 `npm run db:seed`"说明

## 9. 验收

- [x] 9.1 在干净环境完整跑一次部署流水线：`npm install` → `db:migrate` → `db:seed` → 启动服务 → HTTP 烟测试均 200
- [ ] 9.2 端到端清单逐项浏览器手测（**未在 CLI 完成 — 需用户在浏览器打开 http://localhost:8787/app 验证**）：
  - [ ] 各年级 × 各科目 × 各难度（任选 6 组合）使用 BattleEngine 完成关卡
  - [ ] 同样组合改用 ShootingEngine 和 FightingEngine 完成关卡
  - [ ] 拍照出题入库、错题本展示与清空
  - [ ] AI 讲解、TTS 朗读
  - [ ] 宠物升级动画
  - [ ] 错题反哺关卡（`source='wrongbook-practice'`）出题合理
- [x] 9.3 跑 `npm run coverage`（覆盖 211/903 cells，缺口 692 — 由生成器逐步补齐）、`npm run validate:bank` ✅ 通过
- [x] 9.4 旧 wrong_questions 数据保留；新增 lv 列对老行缺省 2；新增 3 张表与 wrong_questions 共库 (wrongbook.db)
- [x] 9.5 调用 `superpowers:code-reviewer` 完成代码审查；所有 Important issues (#1 picker grade requirement、#2 wrongbook addOne dedup key、#3 mixed dedup O(n²)、#5 fighting keydown leak、#11 engine-TTS 解耦、#6 NaN threshold) 已修复并补加测试
