'use strict';

const { listLevels, progressFor } = require('./campaign-api');

function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function makeSessionId() { return `camp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function normalizeUser(v) { return String(v || 'default'); }
function nowIso() { return new Date().toISOString(); }

function rowToSession(row) {
  if (!row) return null;
  return {
    sessionId: row.session_id,
    user: row.user,
    grade: row.grade,
    subject: row.subject,
    semester: row.semester,
    plannedCount: row.planned_count,
    startLevelId: row.start_level_id,
    currentLevelId: row.current_level_id,
    currentIndex: row.current_index,
    passedCount: row.passed_count,
    totalStars: row.total_stars,
    wrongCount: row.wrong_count,
    durationSec: row.duration_sec,
    status: row.status,
    stats: safeJSON(row.stats_json, {}),
    clientUpdatedAt: row.client_updated_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

function rowToSave(row) {
  if (!row) return null;
  return {
    saveId: row.save_id,
    user: row.user,
    runId: row.run_id,
    levelId: row.level_id,
    sessionId: row.session_id,
    phase: row.phase,
    checkpoint: row.checkpoint,
    payload: safeJSON(row.payload_json, {}),
    status: row.status,
    clientUpdatedAt: row.client_updated_at,
    serverUpdatedAt: row.server_updated_at,
  };
}

function explainLocked(level) {
  const unlock = level?.unlock || {};
  const ids = Array.isArray(unlock.requiredLevelIds) ? unlock.requiredLevelIds : [];
  const stars = Number(unlock.requiredStars || 1);
  if (!ids.length) return '下一关暂未解锁';
  return `需要先通关 ${ids.join('、')}（每关至少 ${stars} 星）`;
}

function getNextLevel(db, { user = 'default', levelId, grade = 1, subject = 'math', semester = 'upper' } = {}) {
  if (!levelId) return { status: 400, body: { error: '缺少 levelId' } };
  const levels = listLevels(db, { user, grade: Number(grade || 1), subject, semester });
  const idx = levels.findIndex(l => l.id === levelId);
  if (idx < 0) return { status: 404, body: { error: '当前关卡不存在' } };
  const next = levels[idx + 1] || null;
  if (!next) return { status: 200, body: { nextLevel: null, done: true } };
  if (!next.unlocked) return { status: 423, body: { error: '下一关未解锁', nextLevel: next, unlockHint: explainLocked(next) } };
  return { status: 200, body: { nextLevel: next, done: false } };
}

function startSessionHandler(db, payload = {}) {
  const user = normalizeUser(payload.user);
  const sessionId = payload.sessionId || makeSessionId();
  const grade = Number(payload.grade || 1);
  const subject = payload.subject || 'math';
  const semester = payload.semester || 'upper';
  const plannedCount = Math.max(1, Math.min(50, Number(payload.plannedCount || payload.batchCount || 1)));
  const startLevelId = payload.startLevelId || payload.levelId || null;
  const currentLevelId = payload.currentLevelId || startLevelId;
  if (!currentLevelId) return { status: 400, body: { error: '缺少 currentLevelId/startLevelId' } };
  db.prepare(`INSERT INTO campaign_sessions
    (session_id,user,grade,subject,semester,planned_count,start_level_id,current_level_id,current_index,status,stats_json,client_updated_at,started_at,updated_at)
    VALUES (@sessionId,@user,@grade,@subject,@semester,@plannedCount,@startLevelId,@currentLevelId,1,'active',@statsJson,@clientUpdatedAt,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(session_id) DO UPDATE SET
      planned_count=excluded.planned_count,
      current_level_id=excluded.current_level_id,
      status='active',
      stats_json=excluded.stats_json,
      client_updated_at=excluded.client_updated_at,
      updated_at=CURRENT_TIMESTAMP`).run({
        sessionId, user, grade, subject, semester, plannedCount, startLevelId, currentLevelId,
        statsJson: JSON.stringify(payload.stats || {}),
        clientUpdatedAt: payload.clientUpdatedAt || nowIso(),
      });
  return { status: 200, body: { ok: true, session: rowToSession(db.prepare('SELECT * FROM campaign_sessions WHERE session_id=?').get(sessionId)) } };
}

function saveProgressHandler(db, payload = {}) {
  const user = normalizeUser(payload.user);
  const runId = payload.runId;
  const levelId = payload.levelId;
  if (!runId) return { status: 400, body: { error: '缺少 runId' } };
  if (!levelId) return { status: 400, body: { error: '缺少 levelId' } };
  const saveId = payload.saveId || `${user}:${runId}`;
  const sessionId = payload.sessionId || null;
  const phase = payload.phase || 'unknown';
  const checkpoint = payload.checkpoint || phase;
  const status = payload.status || (checkpoint === 'settlement' ? 'completed' : 'active');
  const clientUpdatedAt = payload.clientUpdatedAt || nowIso();
  const body = { ...(payload.payload || {}) };
  db.prepare(`INSERT INTO campaign_progress_saves
    (save_id,user,run_id,level_id,session_id,phase,checkpoint,payload_json,status,client_updated_at,server_updated_at)
    VALUES (@saveId,@user,@runId,@levelId,@sessionId,@phase,@checkpoint,@payloadJson,@status,@clientUpdatedAt,CURRENT_TIMESTAMP)
    ON CONFLICT(save_id) DO UPDATE SET
      level_id=excluded.level_id,
      session_id=excluded.session_id,
      phase=excluded.phase,
      checkpoint=excluded.checkpoint,
      payload_json=excluded.payload_json,
      status=excluded.status,
      client_updated_at=excluded.client_updated_at,
      server_updated_at=CURRENT_TIMESTAMP`).run({
        saveId, user, runId, levelId, sessionId, phase, checkpoint,
        payloadJson: JSON.stringify(body), status, clientUpdatedAt,
      });
  if (sessionId) {
    db.prepare(`UPDATE campaign_sessions SET current_level_id=?, stats_json=?, client_updated_at=?, updated_at=CURRENT_TIMESTAMP WHERE session_id=? AND user=?`)
      .run(levelId, JSON.stringify(body.sessionStats || {}), clientUpdatedAt, sessionId, user);
  }
  return { status: 200, body: { ok: true, save: rowToSave(db.prepare('SELECT * FROM campaign_progress_saves WHERE save_id=?').get(saveId)) } };
}

function updateSessionHandler(db, payload = {}) {
  const user = normalizeUser(payload.user);
  const sessionId = payload.sessionId;
  if (!sessionId) return { status: 400, body: { error: '缺少 sessionId' } };
  const prev = db.prepare('SELECT * FROM campaign_sessions WHERE session_id=? AND user=?').get(sessionId, user);
  if (!prev) return { status: 404, body: { error: '连续闯关会话不存在' } };
  const status = payload.status || prev.status;
  db.prepare(`UPDATE campaign_sessions SET
    current_level_id=COALESCE(@currentLevelId,current_level_id),
    current_index=COALESCE(@currentIndex,current_index),
    passed_count=COALESCE(@passedCount,passed_count),
    total_stars=COALESCE(@totalStars,total_stars),
    wrong_count=COALESCE(@wrongCount,wrong_count),
    duration_sec=COALESCE(@durationSec,duration_sec),
    status=@status,
    stats_json=@statsJson,
    client_updated_at=@clientUpdatedAt,
    updated_at=CURRENT_TIMESTAMP,
    completed_at=CASE WHEN @status IN ('completed','abandoned') THEN CURRENT_TIMESTAMP ELSE completed_at END
    WHERE session_id=@sessionId AND user=@user`).run({
      sessionId, user,
      currentLevelId: payload.currentLevelId ?? null,
      currentIndex: payload.currentIndex ?? null,
      passedCount: payload.passedCount ?? null,
      totalStars: payload.totalStars ?? null,
      wrongCount: payload.wrongCount ?? null,
      durationSec: payload.durationSec ?? null,
      status,
      statsJson: JSON.stringify(payload.stats || safeJSON(prev.stats_json, {})),
      clientUpdatedAt: payload.clientUpdatedAt || nowIso(),
    });
  return { status: 200, body: { ok: true, session: rowToSession(db.prepare('SELECT * FROM campaign_sessions WHERE session_id=?').get(sessionId)) } };
}

function resumeHandler(db, query = {}) {
  const user = normalizeUser(query.user);
  const save = db.prepare(`SELECT * FROM campaign_progress_saves
    WHERE user=? AND status='active'
    ORDER BY datetime(server_updated_at) DESC, rowid DESC LIMIT 1`).get(user);
  const session = db.prepare(`SELECT * FROM campaign_sessions
    WHERE user=? AND status='active'
    ORDER BY datetime(updated_at) DESC, rowid DESC LIMIT 1`).get(user);
  return { status: 200, body: { save: rowToSave(save), session: rowToSession(session), hasResume: !!(save || session) } };
}

function resolveConflictHandler(db, payload = {}) {
  const user = normalizeUser(payload.user);
  const mode = payload.mode || 'server';
  if (mode === 'local' && payload.save) return saveProgressHandler(db, { ...payload.save, user });
  return resumeHandler(db, { user });
}

function markSaveStatusHandler(db, payload = {}) {
  const user = normalizeUser(payload.user);
  const saveId = payload.saveId;
  const runId = payload.runId;
  const status = payload.status || 'completed';
  if (!saveId && !runId) return { status: 400, body: { error: '缺少 saveId/runId' } };
  if (saveId) db.prepare('UPDATE campaign_progress_saves SET status=?, server_updated_at=CURRENT_TIMESTAMP WHERE save_id=? AND user=?').run(status, saveId, user);
  else db.prepare('UPDATE campaign_progress_saves SET status=?, server_updated_at=CURRENT_TIMESTAMP WHERE run_id=? AND user=?').run(status, runId, user);
  return { status: 200, body: { ok: true } };
}

module.exports = {
  safeJSON,
  rowToSession,
  rowToSave,
  getNextLevel,
  startSessionHandler,
  saveProgressHandler,
  updateSessionHandler,
  resumeHandler,
  resolveConflictHandler,
  markSaveStatusHandler,
};
