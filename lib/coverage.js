'use strict';

const SUBJECTS = ['math', 'chinese', 'english', 'science'];
const SEMESTERS = ['upper', 'lower'];
const LVS = [1, 2, 3];

function computeCoverage(db, { threshold = 3 } = {}) {
  // 收集 curriculum 全集（基准）
  const cur = db.prepare(`SELECT grade, subject, semester, topic FROM curriculum`).all();

  // 分别统计 questions 与 generators 在 (grade, subject, semester, topic, lv) 维度的题数
  const staticAgg = db.prepare(`
    SELECT grade, subject, semester, topic, lv, COUNT(*) AS c
    FROM questions WHERE enabled=1
    GROUP BY grade, subject, semester, topic, lv
  `).all();
  const genAgg = db.prepare(`
    SELECT grade, subject, semester, topic, lv, COUNT(*) AS c
    FROM generators WHERE enabled=1
    GROUP BY grade, subject, semester, topic, lv
  `).all();

  const staticMap = new Map();
  for (const r of staticAgg) staticMap.set(`${r.grade}|${r.subject}|${r.semester}|${r.topic}|${r.lv}`, r.c);
  const genMap = new Map();
  for (const r of genAgg) genMap.set(`${r.grade}|${r.subject}|${r.semester}|${r.topic}|${r.lv}`, r.c);

  // 矩阵 = curriculum 笛卡尔（topic）× lv
  const matrix = [];
  for (const c of cur) {
    for (const lv of LVS) {
      const key = `${c.grade}|${c.subject}|${c.semester}|${c.topic}|${lv}`;
      const staticN = staticMap.get(key) || 0;
      const genN = genMap.get(key) || 0;
      matrix.push({
        grade: c.grade, subject: c.subject, semester: c.semester, topic: c.topic,
        lv, static: staticN, generated: genN, total: staticN + genN,
      });
    }
  }

  const gaps = matrix.filter(m => m.total < threshold)
    .map(m => ({ grade: m.grade, subject: m.subject, semester: m.semester, topic: m.topic, lv: m.lv, total: m.total }));

  const totalCells = matrix.length;
  const filledCells = matrix.filter(m => m.total >= threshold).length;
  const totalQuestions = matrix.reduce((s, m) => s + m.static, 0);
  const totalGenerators = matrix.reduce((s, m) => s + m.generated, 0);

  return {
    matrix,
    gaps,
    summary: {
      totalCells,
      filledCells,
      gapCount: gaps.length,
      coveragePercent: totalCells === 0 ? 0 : Math.round((filledCells / totalCells) * 1000) / 10,
      totalQuestions,
      totalGenerators,
    },
    threshold,
  };
}

function diffGaps(currentGaps, baselineGaps) {
  const baselineSet = new Set(baselineGaps.map(g => `${g.grade}|${g.subject}|${g.semester}|${g.topic}|${g.lv}`));
  return currentGaps.filter(g => !baselineSet.has(`${g.grade}|${g.subject}|${g.semester}|${g.topic}|${g.lv}`));
}

module.exports = {
  SUBJECTS,
  SEMESTERS,
  LVS,
  computeCoverage,
  diffGaps,
};
