'use strict';

const { pickQuestions } = require('./picker');
const { addOne: addWrongQuestion } = require('./wrongbook-api');
const { rowToLevel, progressFor, safeJSON } = require('./campaign-api');
const { updateMastery } = require('./mastery');
const { computeStars, computeRewards } = require('./rewards');

function makeRunId() { return `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function normalizeAnswer(a, level, user, runId, phase = 'supply') {
  const isCorrect = !!(a.isCorrect ?? a.correct);
  const kp = Array.isArray(a.knowledgePoints) ? a.knowledgePoints : Array.isArray(a.knowledge_points) ? a.knowledge_points : (a.topic ? [a.topic] : []);
  return {
    runId,
    levelId: level.id,
    user,
    questionId: String(a.questionId ?? a.id ?? ''),
    questionText: String(a.q ?? a.question ?? a.questionText ?? ''),
    topic: a.topic || level.topic,
    knowledgePointsJson: JSON.stringify(kp),
    correctAnswer: String(a.answer ?? a.correctAnswer ?? ''),
    userAnswer: String(a.userAnswer ?? a.user_answer ?? ''),
    isCorrect,
    phase: a.phase || phase,
    durationMs: Number(a.durationMs || 0),
    grade: Number(a.grade || level.grade),
    subject: a.subject || level.subject,
    semester: a.semester || level.semester,
    type: a.type || 'choice',
    options: a.options,
    hints: a.hints,
    explain: a.explain,
    source: a.source,
  };
}

async function startHandler(db, payload = {}) {
  const levelId = payload.levelId;
  const user = payload.user || 'default';
  if (!levelId) return { status: 400, body: { error: '缺少 levelId' } };
  const row = db.prepare('SELECT * FROM campaign_levels WHERE id=? AND enabled=1').get(levelId);
  if (!row) return { status: 404, body: { error: '关卡不存在，请先运行 npm run db:seed:campaigns' } };
  const level = rowToLevel(row, progressFor(db, user));
  if (!level.unlocked && payload.ignoreLock !== true) return { status: 423, body: { error: '关卡未解锁', level } };
  const config = safeJSON(row.config_json, {});
  const runId = payload.runId || makeRunId();
  const count = Math.max(1, Number(row.question_count || 8));
  const picked = await pickQuestions({
    db,
    grade: row.grade,
    subject: row.subject,
    semester: row.semester,
    topic: row.topic,
    lv: Math.min(Math.max(row.difficulty || 1, 1), 3),
    count,
    source: payload.source || 'mixed',
    user,
  });
  const exists = db.prepare('SELECT id FROM level_runs WHERE run_id=?').get(runId);
  if (!exists) {
    db.prepare(`INSERT INTO level_runs (run_id, user, level_id, result, started_at, created_at)
                VALUES (?, ?, ?, 'started', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`).run(runId, user, levelId);
  }
  return { status: 200, body: {
    runId,
    level,
    questions: Array.isArray(picked) ? picked : picked.questions || [],
    initialResources: { ammo_basic: 0, ammo_power: 0, shield: 0, skill_bomb: 0, skill_freeze: 0, ultimate_energy: 0 },
    supplyConfig: config.supply || { opening: 5, mid: 3, boss: 1 },
  }};
}

function submitSupplyHandler(db, payload = {}) {
  const runId = payload.runId;
  if (!runId) return { status: 400, body: { error: '缺少 runId' } };
  const run = db.prepare('SELECT * FROM level_runs WHERE run_id=?').get(runId);
  if (!run) return { status: 404, body: { error: 'run 不存在' } };
  const row = db.prepare('SELECT * FROM campaign_levels WHERE id=?').get(run.level_id);
  if (!row) return { status: 404, body: { error: '关卡不存在' } };
  const level = rowToLevel(row, progressFor(db, run.user));
  const answers = (payload.answers || []).map(a => normalizeAnswer(a, level, run.user, runId, payload.phase || 'supply'));
  let combo = Number(payload.combo || 0);
  // 资源公式由前端 (static/app/engines/resources.js) 唯一拥有；后端只负责落库 answers / mastery。
  const insert = db.prepare(`INSERT INTO level_run_answers
    (run_id, level_id, user, question_id, question_text, topic, knowledge_points_json, correct_answer, user_answer, is_correct, phase, duration_ms)
    VALUES (@runId, @levelId, @user, @questionId, @questionText, @topic, @knowledgePointsJson, @correctAnswer, @userAnswer, @isCorrectInt, @phase, @durationMs)`);
  const existsByQuestionId = db.prepare(`SELECT id FROM level_run_answers
    WHERE run_id=? AND phase=? AND question_id=? LIMIT 1`);
  const existsByText = db.prepare(`SELECT id FROM level_run_answers
    WHERE run_id=? AND phase=? AND question_text=? LIMIT 1`);
  const newAnswers = [];
  let duplicateAnswers = 0;
  const tx = db.transaction(() => {
    for (const a of answers) {
      const already = a.questionId
        ? existsByQuestionId.get(runId, a.phase, a.questionId)
        : existsByText.get(runId, a.phase, a.questionText);
      if (already) { duplicateAnswers++; continue; }
      combo = a.isCorrect ? combo + 1 : 0;
      insert.run({ ...a, isCorrectInt: a.isCorrect ? 1 : 0 });
      newAnswers.push(a);
      if (!a.isCorrect && a.questionText) {
        addWrongQuestion(db, run.user, {
          id: a.questionId,
          q: a.questionText,
          type: a.type || 'choice',
          options: a.options,
          answer: a.correctAnswer,
          userAnswer: a.userAnswer,
          hints: a.hints,
          explain: a.explain,
          topic: a.topic,
          grade: a.grade,
          subject: a.subject,
          semester: a.semester,
          knowledgePoints: safeJSON(a.knowledgePointsJson, [a.topic]),
          lv: a.lv || level.difficulty || 1,
          source: a.source || 'campaign',
        });
      }
    }
    if (newAnswers.length) updateMastery(db, { user: run.user, grade: level.grade, subject: level.subject, semester: level.semester, answers: newAnswers });
  });
  tx();
  return { status: 200, body: { ok: true, runId, combo, answersStored: newAnswers.length, duplicateAnswers } };
}

function finishHandler(db, payload = {}) {
  const user = payload.user || 'default';
  const levelId = payload.levelId;
  const runId = payload.runId || makeRunId();
  if (!levelId) return { status: 400, body: { error: '缺少 levelId' } };
  const row = db.prepare('SELECT * FROM campaign_levels WHERE id=? AND enabled=1').get(levelId);
  if (!row) return { status: 404, body: { error: '关卡不存在' } };
  const level = rowToLevel(row, progressFor(db, user));
  const result = payload.result || 'complete';
  const stored = db.prepare(`SELECT COUNT(*) AS total, COALESCE(SUM(is_correct),0) AS correct
                             FROM level_run_answers WHERE run_id=?`).get(runId);
  const storedTotal = Number(stored?.total || 0);
  const storedCorrect = Number(stored?.correct || 0);
  const correct = storedTotal > 0 ? storedCorrect : Number(payload.correctCount ?? payload.stats?.correct ?? 0);
  const wrong = storedTotal > 0 ? storedTotal - storedCorrect : Number(payload.wrongCount ?? payload.stats?.wrong ?? 0);
  const durationSec = Number(payload.durationSec || 0);
  const stars = Number.isFinite(payload.stars) ? Number(payload.stars) : computeStars({ result, correct, wrong });
  const accuracy = correct + wrong ? correct / (correct + wrong) : 0;
  const rewards = computeRewards({ stars, correct, levelReward: safeJSON(row.reward_json, {}) });
  const wrongQuestions = Array.isArray(payload.wrongQuestions) ? payload.wrongQuestions : [];
  const tx = db.transaction(() => {
    const existingRun = db.prepare('SELECT id, finished_at FROM level_runs WHERE run_id=?').get(runId);
    // 同一 runId 再次 finish（前端/网络重试）→ 不应让 clear_times 重复 +1。
    const alreadyFinished = !!existingRun?.finished_at;
    if (existingRun) {
      db.prepare(`UPDATE level_runs SET
        user=?, level_id=?, result=?, stars=?, correct_count=?, wrong_count=?, duration_sec=?,
        resources_json=?, combat_stats_json=?, wrong_questions_json=?, finished_at=CURRENT_TIMESTAMP
        WHERE run_id=?`).run(
        user, levelId, result, stars, correct, wrong, durationSec,
        JSON.stringify(payload.resources || {}), JSON.stringify(payload.combatStats || {}), JSON.stringify(wrongQuestions), runId
      );
    } else {
      db.prepare(`INSERT INTO level_runs
        (run_id, user, level_id, result, stars, correct_count, wrong_count, duration_sec, resources_json, combat_stats_json, wrong_questions_json, started_at, finished_at, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).run(
        runId, user, levelId, result, stars, correct, wrong, durationSec,
        JSON.stringify(payload.resources || {}), JSON.stringify(payload.combatStats || {}), JSON.stringify(wrongQuestions)
      );
    }
    const prev = db.prepare('SELECT * FROM level_progress WHERE user=? AND level_id=?').get(user, levelId);
    const isClear = result === 'win' || result === 'complete';
    const clearDelta = isClear && !alreadyFinished ? 1 : 0;
    if (prev) {
      db.prepare(`UPDATE level_progress SET best_stars=?, best_accuracy=?, clear_times=?, last_result=?, last_played_at=CURRENT_TIMESTAMP WHERE user=? AND level_id=?`).run(
        Math.max(prev.best_stars || 0, stars), Math.max(prev.best_accuracy || 0, accuracy), (prev.clear_times || 0) + clearDelta, result, user, levelId
      );
    } else {
      db.prepare(`INSERT INTO level_progress (user, level_id, best_stars, best_accuracy, clear_times, last_result, last_played_at) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)`).run(user, levelId, stars, accuracy, clearDelta, result);
    }
  });
  tx();
  return { status: 200, body: { ok: true, runId, result, stars, rewards, accuracy, generatedReview: wrong > 0 } };
}

module.exports = { startHandler, submitSupplyHandler, finishHandler, normalizeAnswer };
