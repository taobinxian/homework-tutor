'use strict';

module.exports = {
  meta: {
    key: 'g2-math-multiplication',
    grade: 2, subject: 'math', semester: 'upper',
    topic: '乘法口诀',
    knowledgePoints: ['乘法口诀', '表内乘法'],
    lv: 1,
    description: '九九乘法表（1×1 ~ 9×9）',
  },
  generate(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = Math.floor(Math.random() * 9) + 1;
      const b = Math.floor(Math.random() * 9) + 1;
      const s = a * b;
      // distractors: ±a, ±b, 邻近积
      const candidates = new Set([s + a, s - a, s + b, s - b, s + 1, s - 1].filter(x => x !== s && x > 0));
      const distractors = [...candidates].slice(0, 3).map(String);
      while (distractors.length < 3) distractors.push(String(s + distractors.length + 1));
      const options = [String(s), ...distractors];
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      out.push({
        q: `${a} × ${b} = ?`,
        type: 'choice',
        options,
        answer: String(s),
        hints: [
          `${a} 个 ${b} 相加`,
          `${a}×${b} = ${a}×${b}`,
          `${a}×${b}=${s}`,
        ],
        explain: '乘法是相同数相加的简便写法',
        topic: '乘法口诀',
        knowledgePoints: ['乘法口诀'],
        semester: 'upper',
        grade: 2, subject: 'math', lv: 1,
        source: 'generated',
      });
    }
    return out;
  },
};
