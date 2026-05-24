'use strict';

function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function rowToLevel(row, progressMap = {}) {
  const config = safeJSON(row.config_json, {});
  const reward = safeJSON(row.reward_json, {});
  const unlock = safeJSON(row.unlock_json, {});
  const p = progressMap[row.id] || null;
  const required = Array.isArray(unlock.requiredLevelIds) ? unlock.requiredLevelIds : [];
  const requiredStars = Number(unlock.requiredStars ?? 1);
  const unlocked = required.length === 0 || required.every(id => (progressMap[id]?.bestStars || 0) >= requiredStars);
  return {
    id: row.id,
    chapterId: row.chapter_id,
    grade: row.grade,
    subject: row.subject,
    semester: row.semester,
    topic: row.topic,
    title: row.title,
    type: row.level_type,
    difficulty: row.difficulty,
    questionCount: row.question_count,
    order: row.order_no,
    config,
    reward,
    unlock,
    state: p?.bestStars ? 'cleared' : unlocked ? 'unlocked' : 'locked',
    unlocked,
    stars: p?.bestStars || 0,
    bestAccuracy: p?.bestAccuracy || 0,
    clearTimes: p?.clearTimes || 0,
    lastResult: p?.lastResult || null,
  };
}

function progressFor(db, user) {
  const rows = db.prepare(`SELECT level_id, best_stars, best_accuracy, clear_times, last_result, last_played_at
                           FROM level_progress WHERE user=?`).all(user);
  const out = {};
  for (const r of rows) out[r.level_id] = {
    bestStars: r.best_stars,
    bestAccuracy: r.best_accuracy,
    clearTimes: r.clear_times,
    lastResult: r.last_result,
    lastPlayedAt: r.last_played_at,
  };
  return out;
}

function listLevels(db, { user = 'default', grade = 1, subject = 'math', semester = 'upper' } = {}) {
  const rows = db.prepare(`SELECT * FROM campaign_levels
                           WHERE grade=? AND subject=? AND semester=? AND enabled=1
                           ORDER BY order_no ASC`).all(Number(grade), subject, semester);
  const progress = progressFor(db, user);
  return rows.map(r => rowToLevel(r, progress));
}

function mapHandler(db, query = {}) {
  const user = query.user || 'default';
  const grade = query.grade ? Number(query.grade) : 1;
  const subject = query.subject || 'math';
  const semester = query.semester || 'upper';
  const levels = listLevels(db, { user, grade, subject, semester });
  const next = levels.find(l => l.unlocked && !l.stars) || levels.find(l => l.unlocked) || levels[0] || null;
  return { status: 200, body: {
    world: { id: 'world-math-mechanical', subject, name: '机械星', icon: '⚙️', description: '修复数学能量核心' },
    chapters: [{ id: 'g1-math-upper-ch01', name: '数字能量工厂', grade, subject, semester, order: 1, levels }],
    recommendedLevelId: next?.id || null,
    empty: levels.length === 0,
    seedHint: levels.length === 0 ? '请先运行 npm run db:seed:campaigns' : null,
  }};
}

function detailHandler(db, query = {}) {
  const user = query.user || 'default';
  const levelId = query.levelId || query.id;
  if (!levelId) return { status: 400, body: { error: '缺少 levelId' } };
  const row = db.prepare('SELECT * FROM campaign_levels WHERE id=? AND enabled=1').get(levelId);
  if (!row) return { status: 404, body: { error: '关卡不存在' } };
  return { status: 200, body: { level: rowToLevel(row, progressFor(db, user)) } };
}

module.exports = { safeJSON, rowToLevel, progressFor, listLevels, mapHandler, detailHandler };
