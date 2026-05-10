'use strict';

module.exports = {
  meta: {
    key: 'g1-math-add-within-10',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '10以内加法',
    knowledgePoints: ['10以内加法', '6-10的认识和加减法'],
    lv: 2,
    description: '10 以内加法（结果不超过 10）',
  },
  generate(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * (10 - a + 1));
      const s = a + b;
      const options = [String(s), String(s + 1), String(Math.max(0, s - 1)), String(Math.min(10, s + 2))];
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      out.push({
        q: `${a} + ${b} = ?`,
        type: 'choice',
        options,
        answer: String(s),
        hints: [`先数 ${a}`, `再加 ${b} 个`, `${a}+${b}=${s}`],
        explain: '10 以内加法可用手指数',
        topic: '10以内加法',
        knowledgePoints: ['10以内加法'],
        semester: 'upper',
        grade: 1, subject: 'math', lv: 2,
        source: 'generated',
      });
    }
    return out;
  },
};
