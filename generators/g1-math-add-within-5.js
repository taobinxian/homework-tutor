'use strict';

module.exports = {
  meta: {
    key: 'g1-math-add-within-5',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '5以内加法',
    knowledgePoints: ['5以内加法', '1-5的认识和加减法'],
    lv: 1,
    description: '5 以内加法（结果不超过 5）',
  },
  generate(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * (5 - a + 1));
      const s = a + b;
      const distractors = [String(s + 1), String(s + 2), String(Math.max(0, s - 1))];
      const options = [String(s), ...distractors];
      // 简单乱序
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      out.push({
        q: `${a} + ${b} = ?`,
        type: 'choice',
        options,
        answer: String(s),
        hints: [`数 ${a} 再加 ${b} 个`, '用手指数一数', `${a}+${b}=${s}`],
        explain: '加法就是把两堆合起来',
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
