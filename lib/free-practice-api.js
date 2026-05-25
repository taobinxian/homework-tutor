'use strict';

// 主页"自由练习" finish 端点：把 BattleEngine / ShootingEngine / FightingEngine
// 等非战役入口的关卡数据也落到 level_runs / level_run_answers / knowledge_mastery，
// 让家长日报覆盖**全部**练习行为。
//
// 与 campaign 关卡的区别：
// - level_id 是虚拟字符串 `free-g{grade}-{subject}-lv{lv}-{engine}`，不在 campaign_levels 表
// - 不参与战役地图 / 解锁链
// - 不写 level_progress（清关进度只对战役关卡有意义）

const { addOne: addWrongQuestion } = require('./wrongbook-api');
const { updateMastery } = require('./mastery');
const { computeStars, computeRewards } = require('./rewards');
const fullProduct = require('./full-product-api');

function makeRunId() {
  return `run-free-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAnswer(a, ctx, runId) {
  const isCorrect = !!(a.isCorrect ?? a.correct);
  const kp = Array.isArray(a.knowledgePoints) ? a.knowledgePoints
    : Array.isArray(a.knowledge_points) ? a.knowledge_points
    : (a.topic ? [a.topic] : []);
  return {
    runId,
    levelId: ctx.levelId,
    user: ctx.user,
    questionId: String(a.questionId ?? a.id ?? ''),
    questionText: String(a.q ?? a.question ?? a.questionText ?? ''),
    topic: a.topic || null,
    knowledgePointsJson: JSON.stringify(kp),
    correctAnswer: String(a.answer ?? a.correctAnswer ?? ''),
    userAnswer: String(a.userAnswer ?? a.user_answer ?? ''),
    isCorrect,
    phase: a.phase || 'main',
    durationMs: Number(a.durationMs || 0),
    grade: ctx.grade,
    subject: ctx.subject,
    semester: ctx.semester,
    type: a.type || 'choice',
    options: a.options,
    hints: a.hints,
    explain: a.explain,
    source: a.source || 'free-practice',
  };
}

function finishHandler(db, payload = {}) {
  const user = payload.user || 'default';
  const grade = Number(payload.grade || 1);
  const subject = String(payload.subject || 'math');
  const semester = String(payload.semester || 'upper');
  const lv = Number(payload.lv || 1);
  const engine = String(payload.engine || 'battle');
  const result = payload.result || 'complete';
  const correct = Number(payload.correct ?? payload.correctCount ?? 0);
  const wrong = Number(payload.wrong ?? payload.wrongCount ?? 0);
  const durationSec = Number(payload.durationSec || 0);
  const answers = Array.isArray(payload.answers) ? payload.answers : [];

  const levelId = `free-g${grade}-${subject}-lv${lv}-${engine}`;
  const runId = payload.runId || makeRunId();
  const stars = computeStars({ result, correct, wrong });
  const totalQ = correct + wrong;
  const accuracy = totalQ ? correct / totalQ : 0;
  const rewards = computeRewards({ stars, correct, levelReward: {} });

  const ctx = { user, levelId, grade, subject, semester };
  const normAnswers = answers.map(a => normalizeAnswer(a, ctx, runId));

  const tx = db.transaction(() => {
    const existing = db.prepare('SELECT id FROM level_runs WHERE run_id=?').get(runId);
    if (existing) {
      db.prepare(`UPDATE level_runs SET
        user=?, level_id=?, result=?, stars=?, correct_count=?, wrong_count=?, duration_sec=?,
        finished_at=CURRENT_TIMESTAMP
        WHERE run_id=?`).run(user, levelId, result, stars, correct, wrong, durationSec, runId);
    } else {
      db.prepare(`INSERT INTO level_runs
        (run_id, user, level_id, result, stars, correct_count, wrong_count, duration_sec, started_at, finished_at, created_at)
        VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).run(
        runId, user, levelId, result, stars, correct, wrong, durationSec
      );
    }
    if (normAnswers.length) {
      const ins = db.prepare(`INSERT INTO level_run_answers
        (run_id, level_id, user, question_id, question_text, topic, knowledge_points_json, correct_answer, user_answer, is_correct, phase, duration_ms)
        VALUES (@runId, @levelId, @user, @questionId, @questionText, @topic, @knowledgePointsJson, @correctAnswer, @userAnswer, @isCorrectInt, @phase, @durationMs)`);
      for (const a of normAnswers) {
        ins.run({ ...a, isCorrectInt: a.isCorrect ? 1 : 0 });
        if (!a.isCorrect && a.questionText) {
          addWrongQuestion(db, user, {
            id: a.questionId,
            q: a.questionText,
            type: a.type,
            options: a.options,
            answer: a.correctAnswer,
            userAnswer: a.userAnswer,
            hints: a.hints,
            explain: a.explain,
            topic: a.topic,
            grade: a.grade,
            subject: a.subject,
            semester: a.semester,
            knowledgePoints: a.topic ? [a.topic] : [],
            lv,
            source: a.source,
          });
          fullProduct.trackEvent(db, user, 'wrong_question_record', { runId, topic: a.topic, questionId: a.questionId });
        }
      }
      updateMastery(db, { user, grade, subject, semester, answers: normAnswers });
      fullProduct.syncMonstersFromWrongbook(db, { user });
      fullProduct.generateBounties(db, { user, source: 'free-practice' });
    }
  });
  tx();
  fullProduct.syncMonstersFromWrongbook(db, { user });
  fullProduct.generateBounties(db, { user, source: 'free-practice' });
  const bountySettlements = fullProduct.settleBountiesForRun(db, { user, runId });
  const highlights = fullProduct.recordRunHighlights(db, { user, runId, levelId, stats: payload.stats || {}, result, rewards });
  fullProduct.trackEvent(db, user, 'level_finish', { runId, levelId, result, stars, accuracy, source: 'free-practice' });

  return { status: 200, body: { ok: true, runId, levelId, result, stars, rewards, accuracy, bountySettlements, highlights } };
}

module.exports = { finishHandler };
