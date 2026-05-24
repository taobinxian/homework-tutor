'use strict';

const crypto = require('node:crypto');
const { rowToLevel, progressFor } = require('./campaign-api');

// 用户在北京时间生活，DB 时戳是 UTC。日报必须按北京日切，否则凌晨 0-8 点的活动会被算到 UTC 昨天。
const BEIJING_OFFSET_MS = 8 * 3600 * 1000;
function dayString(d) {
  return new Date(d.getTime() + BEIJING_OFFSET_MS).toISOString().slice(0, 10);
}

// sha1 短哈希避免长 / 同前缀 topic 串撞 ID（base64url 截断在 18 字符外就丢信息）。
function safeTopicSlug(topic) {
  return crypto.createHash('sha1').update(String(topic || 'review')).digest('hex').slice(0, 16);
}

function buildSummary(rows, mastery, wrongByTopic = []) {
  const totals = rows.reduce((acc, r) => {
    acc.levels += 1;
    acc.correct += r.correct_count || 0;
    acc.wrong += r.wrong_count || 0;
    acc.durationSec += r.duration_sec || 0;
    const day = String(r.day || r.created_at || '').slice(0, 10);
    if (day) {
      acc.days[day] ||= { date: day, levelsCompleted: 0, questionCount: 0, correctCount: 0, wrongCount: 0, learningSeconds: 0, learningMinutes: 0 };
      acc.days[day].levelsCompleted += 1;
      acc.days[day].correctCount += r.correct_count || 0;
      acc.days[day].wrongCount += r.wrong_count || 0;
      acc.days[day].questionCount += (r.correct_count || 0) + (r.wrong_count || 0);
      acc.days[day].learningSeconds += r.duration_sec || 0;
      acc.days[day].learningMinutes = Math.round(acc.days[day].learningSeconds / 60);
    }
    return acc;
  }, { levels: 0, correct: 0, wrong: 0, durationSec: 0, days: {} });
  const totalQ = totals.correct + totals.wrong;
  // weakTopics 来自 level_run_answers 题级 topic 聚合（比关卡级 cl.topic 更准确，
  // 同时支持主页练习 free-practice — 它没有 campaign_levels 关联行）。
  const weakTopics = (wrongByTopic || [])
    .filter(x => x.topic && x.wrong_count > 0)
    .map(x => ({ topic: x.topic, wrongCount: x.wrong_count, reviewAvailable: true }));
  // 今日 / 本周完全无活动时不再用历史 mastery 兜底建议（避免"今日 0 题 + 建议巩固 X"自相矛盾）。
  const hasActivity = totals.levels > 0 || totalQ > 0;
  const suggestion = weakTopics[0]
    ? `建议优先生成「${weakTopics[0].topic}」复习副本，完成 15 题巩固。`
    : hasActivity
      ? (mastery[0] && mastery[0].mastery < 0.75
        ? `建议继续巩固「${mastery[0].topic}」。`
        : '表现稳定，可以继续推进下一关。')
      : '今天还没开始学习，挑一关知识战场试试吧～';
  return {
    levelsCompleted: totals.levels,
    questionCount: totalQ,
    correctCount: totals.correct,
    wrongCount: totals.wrong,
    accuracy: totalQ ? totals.correct / totalQ : 0,
    learningSeconds: totals.durationSec,
    learningMinutes: Math.round(totals.durationSec / 60),
    weakTopics,
    mastery,
    byDay: Object.values(totals.days).sort((a, b) => a.date.localeCompare(b.date)),
    suggestion,
  };
}

function fetchMastery(db, user, limit = 5) {
  return db.prepare(`SELECT topic, attempts, correct, wrong, mastery
                     FROM knowledge_mastery
                     WHERE user=?
                     ORDER BY mastery ASC, wrong DESC
                     LIMIT ?`).all(user, limit);
}

// SQL 端：DB 存的是 UTC，按北京日切就要给时戳加 8 小时再 date()；查询参数已经是北京日字符串，不再加 hours。
const DAY_EXPR = "date(COALESCE(lr.finished_at, lr.created_at), '+8 hours')";

// level_run_answers 也按北京日切，与 level_runs 一致。
const ANS_DAY_EXPR = "date(lra.created_at, '+8 hours')";

function dailyReportHandler(db, query = {}) {
  const user = query.user || 'default';
  const date = query.date || dayString(new Date());
  const rows = db.prepare(`SELECT lr.*, cl.topic, cl.title, ${DAY_EXPR} AS day
                           FROM level_runs lr
                           LEFT JOIN campaign_levels cl ON cl.id=lr.level_id
                           WHERE lr.user=? AND ${DAY_EXPR}=date(?) AND lr.result <> 'started'
                           ORDER BY COALESCE(lr.finished_at, lr.created_at) DESC`).all(user, date);
  const wrongByTopic = db.prepare(`SELECT topic, COUNT(*) AS wrong_count
                                    FROM level_run_answers lra
                                    WHERE lra.user=? AND lra.is_correct=0
                                      AND lra.topic IS NOT NULL AND lra.topic != ''
                                      AND ${ANS_DAY_EXPR}=date(?)
                                    GROUP BY topic
                                    ORDER BY wrong_count DESC`).all(user, date);
  const mastery = fetchMastery(db, user, 5);
  const summary = buildSummary(rows, mastery, wrongByTopic);
  return { status: 200, body: {
    date,
    period: { type: 'daily', startDate: date, endDate: date, days: 1 },
    summary,
    runs: rows.map(r => ({ levelId: r.level_id, title: r.title, topic: r.topic, result: r.result, stars: r.stars, correct: r.correct_count, wrong: r.wrong_count, createdAt: r.finished_at || r.created_at })),
  }};
}

function weeklyReportHandler(db, query = {}) {
  const user = query.user || 'default';
  const endDate = query.endDate || query.date || dayString(new Date());
  const rows = db.prepare(`SELECT lr.*, cl.topic, cl.title, ${DAY_EXPR} AS day
                           FROM level_runs lr
                           LEFT JOIN campaign_levels cl ON cl.id=lr.level_id
                           WHERE lr.user=?
                             AND ${DAY_EXPR} BETWEEN date(?, '-6 day') AND date(?)
                             AND lr.result <> 'started'
                           ORDER BY COALESCE(lr.finished_at, lr.created_at) DESC`).all(user, endDate, endDate);
  const wrongByTopic = db.prepare(`SELECT topic, COUNT(*) AS wrong_count
                                    FROM level_run_answers lra
                                    WHERE lra.user=? AND lra.is_correct=0
                                      AND lra.topic IS NOT NULL AND lra.topic != ''
                                      AND ${ANS_DAY_EXPR} BETWEEN date(?, '-6 day') AND date(?)
                                    GROUP BY topic
                                    ORDER BY wrong_count DESC`).all(user, endDate, endDate);
  const startDate = db.prepare(`SELECT date(?, '-6 day') AS d`).get(endDate).d;
  const mastery = fetchMastery(db, user, 8);
  return { status: 200, body: {
    period: { type: 'weekly', startDate, endDate, days: 7 },
    summary: buildSummary(rows, mastery, wrongByTopic),
    runs: rows.map(r => ({ levelId: r.level_id, title: r.title, topic: r.topic, result: r.result, stars: r.stars, correct: r.correct_count, wrong: r.wrong_count, createdAt: r.finished_at || r.created_at })),
  }};
}

function createReviewLevelHandler(db, payload = {}) {
  const user = payload.user || 'default';
  const topic = String(payload.topic || '').trim();
  if (!topic) return { status: 400, body: { error: '缺少 topic' } };
  const grade = Number(payload.grade || 1);
  const subject = payload.subject || 'math';
  const semester = payload.semester || 'upper';
  const slug = safeTopicSlug(topic);
  const id = `review-g${grade}-${subject}-${semester}-${slug}`;
  const base = db.prepare(`SELECT * FROM campaign_levels
                           WHERE grade=? AND subject=? AND semester=? AND topic=? AND enabled=1
                           ORDER BY level_type='review' ASC, order_no ASC LIMIT 1`).get(grade, subject, semester, topic);
  const config = {
    engine: 'knowledge-shooter', theme: 'review-copy', icon: '🧩', waves: 3,
    supply: { opening: 5, mid: 5, boss: 0 }, boss: null,
    review: { source: 'report-weak-topic', topic },
  };
  db.prepare(`INSERT INTO campaign_levels
    (id, chapter_id, grade, subject, semester, topic, title, level_type, difficulty, question_count, order_no, config_json, reward_json, unlock_json, enabled, updated_at)
    VALUES (@id, 'review-copies', @grade, @subject, @semester, @topic, @title, 'review', @difficulty, 15, 900, @configJson, @rewardJson, @unlockJson, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      topic=excluded.topic,
      title=excluded.title,
      difficulty=excluded.difficulty,
      question_count=15,
      config_json=excluded.config_json,
      reward_json=excluded.reward_json,
      unlock_json=excluded.unlock_json,
      enabled=1,
      updated_at=CURRENT_TIMESTAMP`).run({
    id, grade, subject, semester, topic,
    title: `复习副本：${topic}`,
    difficulty: Number(base?.difficulty || payload.difficulty || 1),
    configJson: JSON.stringify(config),
    rewardJson: JSON.stringify({ exp: 12, gold: 6, materials: ['review-chip'] }),
    unlockJson: JSON.stringify({ requiredLevelIds: [], requiredStars: 0 }),
  });
  const row = db.prepare('SELECT * FROM campaign_levels WHERE id=?').get(id);
  return { status: 200, body: { ok: true, level: rowToLevel(row, progressFor(db, user)) } };
}

module.exports = { dailyReportHandler, weeklyReportHandler, createReviewLevelHandler };
