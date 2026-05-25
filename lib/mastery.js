'use strict';

function masteryFrom(correct, attempts) {
  if (!attempts) return 0;
  // Laplace smoothing: avoids overconfidence after 1 question while remaining explainable.
  return Math.max(0, Math.min(1, (Number(correct) + 1) / (Number(attempts) + 2)));
}

function masteryStatus(score) {
  if (!score) return 'not_started';
  if (score < 40) return 'weak';
  if (score < 70) return 'learning';
  if (score < 85) return 'consolidating';
  return 'mastered';
}

function masteryScore(correct, attempts, wrong = attempts - correct) {
  if (!attempts) return 0;
  const accuracy = Number(correct) / Number(attempts);
  const streakBonus = Math.min(10, Number(correct) * 2);
  const recentPenalty = Number(wrong) > Number(correct) ? 12 : 0;
  return Math.max(0, Math.min(100, Math.round(accuracy * 80 + streakBonus - recentPenalty)));
}

function updateMastery(db, { user = 'default', grade, subject, semester, answers = [] } = {}) {
  const byTopic = new Map();
  for (const a of answers || []) {
    const topic = a.topic || '未标注';
    const key = `${grade}|${subject}|${semester}|${topic}`;
    const cur = byTopic.get(key) || { topic, attempts: 0, correct: 0, wrong: 0 };
    cur.attempts += 1;
    if (a.isCorrect || a.correct) cur.correct += 1; else cur.wrong += 1;
    byTopic.set(key, cur);
  }
  const rows = [];
  const stmt = db.prepare(`INSERT INTO knowledge_mastery
    (user, grade, subject, semester, topic, attempts, correct, wrong, mastery, score, status, last_practiced_at)
    VALUES (@user, @grade, @subject, @semester, @topic, @attempts, @correct, @wrong, @mastery, @score, @status, CURRENT_TIMESTAMP)
    ON CONFLICT(user, grade, subject, semester, topic) DO UPDATE SET
      attempts = attempts + excluded.attempts,
      correct = correct + excluded.correct,
      wrong = wrong + excluded.wrong,
      mastery = CAST(correct + excluded.correct + 1 AS REAL) / CAST(attempts + excluded.attempts + 2 AS REAL),
      score = MAX(0, MIN(100, ROUND((CAST(correct + excluded.correct AS REAL) / CAST(attempts + excluded.attempts AS REAL)) * 80 + MIN(10, (correct + excluded.correct) * 2) - CASE WHEN (wrong + excluded.wrong) > (correct + excluded.correct) THEN 12 ELSE 0 END))),
      status = CASE
        WHEN MAX(0, MIN(100, ROUND((CAST(correct + excluded.correct AS REAL) / CAST(attempts + excluded.attempts AS REAL)) * 80 + MIN(10, (correct + excluded.correct) * 2) - CASE WHEN (wrong + excluded.wrong) > (correct + excluded.correct) THEN 12 ELSE 0 END))) >= 85 THEN 'mastered'
        WHEN MAX(0, MIN(100, ROUND((CAST(correct + excluded.correct AS REAL) / CAST(attempts + excluded.attempts AS REAL)) * 80 + MIN(10, (correct + excluded.correct) * 2) - CASE WHEN (wrong + excluded.wrong) > (correct + excluded.correct) THEN 12 ELSE 0 END))) >= 70 THEN 'consolidating'
        WHEN MAX(0, MIN(100, ROUND((CAST(correct + excluded.correct AS REAL) / CAST(attempts + excluded.attempts AS REAL)) * 80 + MIN(10, (correct + excluded.correct) * 2) - CASE WHEN (wrong + excluded.wrong) > (correct + excluded.correct) THEN 12 ELSE 0 END))) >= 40 THEN 'learning'
        ELSE 'weak' END,
      last_practiced_at = CURRENT_TIMESTAMP`);
  for (const x of byTopic.values()) {
    const score = masteryScore(x.correct, x.attempts, x.wrong);
    const payload = { user, grade, subject, semester, topic: x.topic, attempts: x.attempts, correct: x.correct, wrong: x.wrong, mastery: masteryFrom(x.correct, x.attempts), score, status: masteryStatus(score) };
    stmt.run(payload);
    rows.push(payload);
  }
  return rows;
}

module.exports = { masteryFrom, masteryScore, masteryStatus, updateMastery };
