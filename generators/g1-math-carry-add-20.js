'use strict';

module.exports = {
  meta: {
    key: 'g1-math-carry-add-20',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '20以内进位加法',
    knowledgePoints: ['20以内进位加法', '9加几', '凑十法'],
    lv: 2,
    description: '20 以内进位加法（被加数 + 加数 > 10）',
  },
  generate(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      // 保证进位（a + b > 10），a,b ∈ [2,9]
      const a = Math.floor(Math.random() * 8) + 2;
      const minB = Math.max(2, 11 - a);
      const b = Math.floor(Math.random() * (9 - minB + 1)) + minB;
      const s = a + b;
      const options = [String(s), String(s - 1), String(s + 1), String(s - 2)];
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      out.push({
        q: `${a} + ${b} = ?`,
        type: 'choice',
        options,
        answer: String(s),
        hints: [
          `凑十法：把 ${b} 拆成 ${10 - a} 和 ${b - (10 - a)}`,
          `${a}+${10 - a}=10，再加 ${b - (10 - a)}`,
          `${a}+${b}=${s}`,
        ],
        explain: '凑十法先凑 10 再加余下',
        topic: '20以内进位加法',
        knowledgePoints: ['20以内进位加法', '凑十法'],
        semester: 'upper',
        grade: 1, subject: 'math', lv: 2,
        source: 'generated',
      });
    }
    return out;
  },
};
