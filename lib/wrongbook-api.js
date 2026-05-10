'use strict';

function safeJSONParse(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function rowToOut(r) {
  return {
    id: r.id,
    q: r.q,
    type: r.type,
    options: safeJSONParse(r.options, null),
    answer: r.answer,
    userAnswer: r.user_answer,
    hints: safeJSONParse(r.hints, null),
    explain: r.explain_text,
    topic: r.topic,
    grade: r.grade || null,
    subject: r.subject || '',
    semester: r.semester || '',
    knowledgePoints: safeJSONParse(r.knowledge_points, []),
    lv: r.lv == null ? 2 : r.lv,
    source: r.source,
    date: r.created_at,
    needsImage: !!r.needs_image,
    imageDesc: r.image_desc,
  };
}

function listForUser(db, user) {
  const rows = db.prepare('SELECT * FROM wrong_questions WHERE user=? ORDER BY created_at DESC').all(user);
  return rows.map(rowToOut);
}

function addOne(db, user, payload) {
  const j = payload || {};
  // 用 (user, q, answer) 而非 (user, q) — 避免相同题面但不同正确答案的题被误判为重复
  const existing = db.prepare(
    "SELECT id FROM wrong_questions WHERE user=? AND q=? AND COALESCE(answer,'')=COALESCE(?,'')"
  ).get(user, j.q, j.answer || null);
  if (existing) return { ok: true, duplicate: true, id: existing.id };

  const info = db.prepare(`INSERT INTO wrong_questions
      (user,q,type,options,answer,user_answer,hints,explain_text,topic,grade,subject,semester,knowledge_points,lv,source,needs_image,image_desc)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    user,
    j.q,
    j.type || null,
    j.options ? JSON.stringify(j.options) : null,
    j.answer || null,
    j.userAnswer || null,
    j.hints ? JSON.stringify(j.hints) : null,
    j.explain || '',
    j.topic || '',
    j.grade || null,
    j.subject || '',
    j.semester || '',
    Array.isArray(j.knowledgePoints) ? JSON.stringify(j.knowledgePoints) : '[]',
    j.lv == null ? 2 : j.lv,
    j.source || '',
    j.needsImage ? 1 : 0,
    j.imageDesc || ''
  );
  return { ok: true, id: info.lastInsertRowid };
}

function deleteOne(db, user, id) {
  if (!id) return { ok: false };
  db.prepare('DELETE FROM wrong_questions WHERE id=? AND user=?').run(id, user);
  return { ok: true };
}

function clearForUser(db, user) {
  db.prepare('DELETE FROM wrong_questions WHERE user=?').run(user);
  return { ok: true };
}

module.exports = {
  rowToOut,
  listForUser,
  addOne,
  deleteOne,
  clearForUser,
};
