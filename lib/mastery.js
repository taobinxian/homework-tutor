'use strict';

function masteryFrom(correct, attempts) {
  if (!attempts) return 0;
  // Laplace smoothing: avoids overconfidence after 1 question while remaining explainable.
  return Math.max(0, Math.min(1, (Number(correct) + 1) / (Number(attempts) + 2)));
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
    (user, grade, subject, semester, topic, attempts, correct, wrong, mastery, last_practiced_at)
    VALUES (@user, @grade, @subject, @semester, @topic, @attempts, @correct, @wrong, @mastery, CURRENT_TIMESTAMP)
    ON CONFLICT(user, grade, subject, semester, topic) DO UPDATE SET
      attempts = attempts + excluded.attempts,
      correct = correct + excluded.correct,
      wrong = wrong + excluded.wrong,
      mastery = CAST(correct + excluded.correct + 1 AS REAL) / CAST(attempts + excluded.attempts + 2 AS REAL),
      last_practiced_at = CURRENT_TIMESTAMP`);
  for (const x of byTopic.values()) {
    const payload = { user, grade, subject, semester, topic: x.topic, attempts: x.attempts, correct: x.correct, wrong: x.wrong, mastery: masteryFrom(x.correct, x.attempts) };
    stmt.run(payload);
    rows.push(payload);
  }
  return rows;
}

module.exports = { masteryFrom, updateMastery };
