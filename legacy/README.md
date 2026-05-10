# legacy/ — 重构前快照

本目录保存 `migrate-bank-to-sqlite-and-pluggable-engines` 重构前的文件副本，**勿引用、勿编辑**，仅作历史备份。

| 文件 | 来源 | 数据已迁移到 |
|---|---|---|
| `index.html.original` | 重构前 3257 行单文件应用 | 拆分为 `static/app/*.js` ESM 模块 + 新 `index.html` 骨架 |
| `grade1.js` ~ `grade6.js` | 题库（混合静态题 + `for+rand` 动态生成） | `questions` 表（`npm run db:seed:legacy` 物化） |
| `questions.js` | 题库工具函数 | `lib/picker.js` + `static/app/data.js` |
| `curriculum.js` | 课程纲目 | `curriculum` 表（`npm run db:seed:curriculum`） |

## 还原方法（万一需要回退）

1. `git revert <重构 commit>`（最干净）
2. 或手动：`cp legacy/grade*.js .` `cp legacy/index.html.original ./index.html`，然后还原 `package.json` `main` 字段为 `grade1.js`，并改回旧的 `<script src="/static/grade*.js">` 引用

## 数据迁移核对

迁移完成时，DB 内题数应等于或大于原 `QB_ANNOTATION_REPORT.total`（含动态生成题的物化结果）。重新跑 `npm run db:seed:legacy` 是幂等操作，不会重复插入相同 `content_hash`。
