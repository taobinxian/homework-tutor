'use strict';

// Fixture generator for picker tests; not registered via seed
module.exports = {
  meta: {
    key: 'fixture-g1-math-add-within-5',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '5以内加法', knowledgePoints: ['5以内加法'],
    lv: 1,
    description: '测试用 5 以内加法',
  },
  generate(n /*, ctx */) {
    const out = [];
    // 用宽量级保证唯一题面，避免 dedup 截断；测试用，不追求题面合理
    for (let i = 0; i < n; i++) {
      const a = (i % 5) + 1;
      const b = (Math.floor(i / 5) % 5);
      const s = a + b;
      out.push({
        q: `[fixture#${i}] ${a} + ${b} = ?`,
        type: 'choice',
        options: [String(s), String(s + 1), String(s + 2), String(Math.max(0, s - 1))],
        answer: String(s),
        hints: ['数', '加', `${s}`],
        explain: 'fixture 加法',
        topic: '5以内加法',
        knowledgePoints: ['5以内加法'],
        semester: 'upper',
        grade: 1, subject: 'math', lv: 1,
        source: 'generated',
      });
    }
    return out;
  },
};
