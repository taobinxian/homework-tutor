# 生成器目录

每个 `.js` 文件是一个题目生成器（题模板），按需运行时生成无穷题，避免静态题库重复。

## 目录约定

- 文件名：`g{grade}-{subject}-{slug}.js`，例如 `g1-math-add-within-5.js`
- `_template.js` 是模板，**不会**被 `db:seed:generators` 注册
- `index.js`、`README.md`、子目录也会被忽略

## 模块协议

### 单个生成器

```javascript
module.exports = {
  meta: {
    key: 'g1-math-add-within-5',  // 必须与文件名（去 .js）一致
    grade: 1,
    subject: 'math',              // math | chinese | english | science
    semester: 'upper',            // upper | lower
    topic: '5以内加法',            // 必须在 curriculum 表存在
    knowledgePoints: ['5以内加法','1-5的认识和加减法'],
    lv: 1,                        // 1=入门 2=进阶 3=挑战
    description: '5 以内加法（结果不超过 5）',
  },
  generate(n, ctx) {
    // 返回最多 n 道题；可少返回
    // ctx = { db, opts }
    return [];
  },
};
```

### 批量生成器

一个模块也可以导出 `variants({ db })`，用同一个 `generate()` 为多组
`(grade, subject, semester, topic, lv)` 注册生成器。适合按 curriculum 自动补齐覆盖率：

```javascript
module.exports = {
  variants({ db }) {
    return db.prepare('SELECT * FROM curriculum').all().map(row => ({
      key: `my-generator-${row.grade}-${row.subject}-${row.topic}-lv1`,
      grade: row.grade,
      subject: row.subject,
      semester: row.semester,
      topic: row.topic,
      knowledgePoints: JSON.parse(row.knowledge_points),
      lv: 1,
      description: '按课程自动生成',
    }));
  },
  generate(n, ctx) {
    // ctx.opts 会包含当前 generator row 的 grade/subject/semester/topic/lv/knowledgePoints/generatorKey
    return [];
  },
};
```

## 注册到 DB

```bash
npm run db:seed:generators
```

会扫描所有 `.js` 文件，校验 `meta.key` 与文件名一致，UPSERT 至 `generators` 表。
被删除的文件对应行会被置 `enabled=0`（不直接 DELETE，保留历史）。

## Question 输出 schema

每条生成的题目对象必填字段（picker 会再次补齐 `semesterLabel` 等）：

```typescript
{
  q: string,
  type: 'choice'|'input',
  options?: string[],
  answer: string,
  hints: string[],
  explain: string,
  topic: string,
  knowledgePoints: string[],
  semester: 'upper'|'lower',
  grade: 1..6,
  subject: 'math'|'chinese'|'english'|'science',
  lv: 1|2|3,
  source: 'generated',
}
```
