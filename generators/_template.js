'use strict';
// 生成器模板 — 复制此文件并改名 g{grade}-{subject}-{slug}.js
// meta.key MUST 与文件名（去 .js 后）一致，否则 db:seed:generators 会报错

module.exports = {
  meta: {
    key: '_template',                                  // 改成与文件名一致
    grade: 1,                                          // 1..6
    subject: 'math',                                   // math | chinese | english | science
    semester: 'upper',                                 // upper | lower
    topic: '示例题型',                                  // 必须在 curriculum 表存在
    knowledgePoints: ['示例题型', '相关知识点'],       // 第一项通常等于 topic
    lv: 1,                                             // 1=入门 2=进阶 3=挑战
    description: '生成器一句话说明',
  },

  /**
   * 生成 n 道题
   * @param {number} n 期望题数；可少返回（picker 会兜底），但不要超过 n*2
   * @param {{db, opts}} ctx 可读 DB / 完整 opts，但不要写 DB
   * @returns {Array<Question>} 每条 Question schema 见 lib/picker.js 注释
   */
  generate(n /*, ctx */) {
    const out = [];
    for (let i = 0; i < n; i++) {
      // 用 Math.random() 即可；测试通过 patch Math.random 实现确定性
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * 5);
      const s = a + b;
      out.push({
        q: `${a} + ${b} = ?`,
        type: 'choice',
        options: [String(s), String(s + 1), String(s + 2), String(Math.max(0, s - 1))],
        answer: String(s),
        hints: [`先数 ${a}`, `再加 ${b}`, `${a}+${b}=${s}`],
        explain: '加法把两堆合起来',
        topic: '示例题型',
        knowledgePoints: ['示例题型'],
        semester: 'upper',
        grade: 1, subject: 'math', lv: 1,
        source: 'generated',
      });
    }
    return out;
  },
};
