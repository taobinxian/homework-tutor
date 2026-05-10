'use strict';

const crypto = require('node:crypto');
const { pickQuestions } = require('./picker');
const { computeCoverage } = require('./coverage');

function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

async function pickHandler(db, query) {
  const grade = query.grade ? Number(query.grade) : null;
  const subject = query.subject || null;
  const source = query.source || 'mixed';
  // wrongbook-practice 允许跨年级/科目（按 user 即可）；其他 source 必填
  if (source !== 'wrongbook-practice') {
    if (!grade) return { status: 400, body: { error: '缺少必填参数 grade' } };
    if (!subject) return { status: 400, body: { error: '缺少必填参数 subject' } };
  }

  const opts = {
    db, grade, subject,
    semester: query.semester || undefined,
    lv: query.lv ? Number(query.lv) : undefined,
    topic: query.topic || undefined,
    count: query.count ? Number(query.count) : 10,
    source,
    user: query.user || 'default',
    excludeIds: query.excludeIds
      ? String(query.excludeIds).split(',').map(s => Number(s)).filter(Number.isFinite)
      : [],
  };
  try {
    const out = await pickQuestions(opts);
    const headers = out._fallback ? { 'X-Pick-Fallback': encodeURIComponent(out._fallback) } : {};
    return { status: 200, body: out, headers };
  } catch (e) {
    return { status: 500, body: { error: e.message } };
  }
}

function curriculumHandler(db, query) {
  const where = [];
  const params = [];
  if (query.grade) { where.push('grade=?'); params.push(Number(query.grade)); }
  if (query.subject) { where.push('subject=?'); params.push(query.subject); }
  const sql = `SELECT grade, subject, semester, topic, knowledge_points
               FROM curriculum
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY grade, subject, semester, topic`;
  const rows = db.prepare(sql).all(...params).map(r => ({
    grade: r.grade, subject: r.subject, semester: r.semester, topic: r.topic,
    knowledgePoints: safeJSON(r.knowledge_points, []),
  }));
  return { status: 200, body: rows };
}

function contentHashOf(grade, subject, q, answer) {
  return crypto.createHash('sha1').update(`${grade}|${subject}|${q}|${answer}`).digest('hex');
}

function addQuestionHandler(db, payload) {
  const j = payload || {};
  if (!j.grade || !j.subject || !j.q || j.answer === undefined || j.answer === null) {
    return { status: 400, body: { error: '缺少必填字段 (grade, subject, q, answer)' } };
  }
  const grade = Number(j.grade);
  const subject = String(j.subject);
  const q = String(j.q);
  const answer = String(j.answer);
  const hash = contentHashOf(grade, subject, q, answer);

  const existing = db.prepare(`SELECT id FROM questions WHERE content_hash=?`).get(hash);
  if (existing) {
    return { status: 200, body: { ok: true, duplicate: true, id: existing.id } };
  }

  const semester = (j.semester === 'upper' || j.semester === 'lower') ? j.semester : 'unknown';
  const topic = j.topic || '未标注';
  const kp = Array.isArray(j.knowledgePoints) && j.knowledgePoints.length ? j.knowledgePoints : [topic];
  const lv = (j.lv === 1 || j.lv === 2 || j.lv === 3) ? j.lv : 2;
  const qType = j.type === 'input' ? 'input' : 'choice';
  const options = Array.isArray(j.options) ? JSON.stringify(j.options) : null;
  const hints = Array.isArray(j.hints) ? JSON.stringify(j.hints) : null;
  const source = j.source || 'manual';

  const info = db.prepare(`INSERT INTO questions
    (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)`).run(
    hash, grade, subject, semester, topic, JSON.stringify(kp),
    lv, qType, q, options, answer, hints, j.explain || '', source
  );
  return { status: 200, body: { ok: true, id: info.lastInsertRowid } };
}

function coverageHandler(db, query) {
  const raw = query.threshold;
  const parsed = raw !== undefined ? Number(raw) : NaN;
  const threshold = Number.isFinite(parsed) && parsed >= 0 ? parsed : 3;
  const result = computeCoverage(db, { threshold });
  return { status: 200, body: result };
}

// 返回 (grade, subject, semester, lv) 是否非空的紧凑映射
// 前端用此把无题的按钮灰掉
function availabilityHandler(db) {
  const rows = db.prepare(`
    SELECT grade, subject, semester, lv FROM questions WHERE enabled=1
    GROUP BY grade, subject, semester, lv
  `).all();
  // 紧凑结构：matrix[grade][subject] = { semesters: ['upper','lower'], lvs: [1,2,3], cells: { 'upper|1': true, ... } }
  const matrix = {};
  for (const r of rows) {
    if (!matrix[r.grade]) matrix[r.grade] = {};
    if (!matrix[r.grade][r.subject]) matrix[r.grade][r.subject] = { semesters: new Set(), lvs: new Set(), cells: {} };
    const m = matrix[r.grade][r.subject];
    m.semesters.add(r.semester);
    m.lvs.add(r.lv);
    m.cells[`${r.semester}|${r.lv}`] = true;
  }
  // 序列化 Set
  const out = {};
  for (const g of Object.keys(matrix)) {
    out[g] = {};
    for (const s of Object.keys(matrix[g])) {
      const m = matrix[g][s];
      out[g][s] = {
        semesters: [...m.semesters],
        lvs: [...m.lvs].sort(),
        cells: m.cells,
      };
    }
  }
  return { status: 200, body: out };
}

module.exports = {
  pickHandler,
  curriculumHandler,
  addQuestionHandler,
  coverageHandler,
  availabilityHandler,
  contentHashOf,
};
