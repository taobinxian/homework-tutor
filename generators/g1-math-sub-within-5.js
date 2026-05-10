'use strict';

module.exports = {
  meta: {
    key: 'g1-math-sub-within-5',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '5以内减法',
    knowledgePoints: ['5以内减法', '1-5的认识和加减法'],
    lv: 1,
    description: '5 以内减法（被减数 ≤ 5）',
  },
  generate(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = Math.floor(Math.random() * 5) + 1;
      const b = Math.floor(Math.random() * (a + 1));
      const s = a - b;
      const options = [String(s), String(s + 1), String(Math.max(0, s - 1)), String(a)];
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      out.push({
        q: `${a} - ${b} = ?`,
        type: 'choice',
        options,
        answer: String(s),
        hints: [`有 ${a} 个，拿走 ${b} 个`, `从 ${a} 倒着数 ${b} 步`, `${a}-${b}=${s}`],
        explain: '减法是从一堆里拿走一部分',
        topic: '5以内减法',
        knowledgePoints: ['5以内减法'],
        semester: 'upper',
        grade: 1, subject: 'math', lv: 1,
        source: 'generated',
      });
    }
    return out;
  },
};
