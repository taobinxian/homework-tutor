'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openDb, initSchema } = require('../lib/db');
const campaign = require('../lib/campaign-api');
const levelApi = require('../lib/level-api');
const reportsApi = require('../lib/reports-api');
const { seedCampaigns } = require('../scripts/db-seed-campaigns');
const { addQuestionHandler } = require('../lib/questions-api');

function tmpDb() {
  return path.join(os.tmpdir(), `homework-campaign-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
}

function cleanup(file) {
  for (const ext of ['', '-shm', '-wal']) {
    const p = file + ext;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

function seedQuestions(db) {
  const cases = [
    ['0 + 0 = ?', '0', '0的认识'], ['0 是几个？', '0', '0的认识'], ['下面哪个是 0？', '0', '0的认识'],
    ['1 + 1 = ?', '2', '5以内加法'], ['2 + 2 = ?', '4', '5以内加法'], ['3 + 1 = ?', '4', '5以内加法'], ['4 + 0 = ?', '4', '5以内加法'],
  ];
  for (const [q, answer, topic] of cases) {
    addQuestionHandler(db, {
      grade: 1, subject: 'math', semester: 'upper', topic, knowledgePoints: [topic], lv: 1,
      type: 'choice', q, options: ['0', '1', '2', '3', '4'], answer, source: 'test',
    });
  }
}

test('db-seed-campaigns seeds exactly Phase 1 sample chapter levels', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db);
    const n = seedCampaigns(db);
    assert.equal(n, 3);
    const rows = db.prepare('SELECT id, level_type FROM campaign_levels WHERE enabled=1 ORDER BY order_no').all();
    assert.deepEqual(rows.map(r => r.id), ['g1-math-upper-1-1', 'g1-math-upper-1-2', 'g1-math-upper-1-3-boss']);
    assert.equal(rows[2].level_type, 'boss');
    db.close();
  } finally { cleanup(file); }
});

test('campaign map reads SQLite config and exposes unlock state', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    const r = campaign.mapHandler(db, { user: 'u1', grade: '1', subject: 'math', semester: 'upper' });
    assert.equal(r.status, 200);
    const levels = r.body.chapters[0].levels;
    assert.equal(levels.length, 3);
    assert.equal(levels[0].unlocked, true);
    assert.equal(levels[1].unlocked, false);
    assert.equal(levels[2].config.boss.id, 'boss-math-chaos-calculator');
    db.close();
  } finally { cleanup(file); }
});

test('level start creates run and returns picked questions', async () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db); seedQuestions(db);
    const r = await levelApi.startHandler(db, { user: 'u1', levelId: 'g1-math-upper-1-1', source: 'static' });
    assert.equal(r.status, 200);
    assert.equal(r.body.level.id, 'g1-math-upper-1-1');
    assert.ok(r.body.runId.startsWith('run-'));
    assert.ok(r.body.questions.length > 0);
    assert.ok(db.prepare('SELECT id FROM level_runs WHERE run_id=?').get(r.body.runId));
    db.close();
  } finally { cleanup(file); }
});

test('supply submit stores answers and updates mastery (resources owned by frontend)', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    db.prepare(`INSERT INTO level_runs (run_id,user,level_id,result) VALUES ('r1','u1','g1-math-upper-1-1','started')`).run();
    const r = levelApi.submitSupplyHandler(db, { runId: 'r1', phase: 'opening', answers: [
      { questionId: 'q1', q: '0+0=?', answer: '0', userAnswer: '0', isCorrect: true, topic: '0的认识', durationMs: 1000 },
      { questionId: 'q2', q: '0 是几个？', answer: '0', userAnswer: '1', isCorrect: false, topic: '0的认识', durationMs: 2000 },
    ] });
    assert.equal(r.status, 200);
    assert.equal(r.body.answersStored, 2);
    // 后端不再返回 resources（前端为权威）。combo 字段仍保留以便前端断链时重算。
    assert.equal(r.body.resources, undefined);
    // 第1题对 → combo=1；第2题错 → combo 归 0。
    assert.equal(r.body.combo, 0);
    assert.equal(db.prepare('SELECT COUNT(*) c FROM level_run_answers WHERE run_id=?').get('r1').c, 2);
    const m = db.prepare('SELECT attempts, correct, wrong, mastery FROM knowledge_mastery WHERE user=? AND topic=?').get('u1', '0的认识');
    assert.equal(m.attempts, 2);
    assert.equal(m.correct, 1);
    assert.equal(m.wrong, 1);
    assert.equal(db.prepare('SELECT COUNT(*) c FROM wrong_questions WHERE user=?').get('u1').c, 1);
    db.close();
  } finally { cleanup(file); }
});

test('supply submit is idempotent for same runId phase question', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    db.prepare(`INSERT INTO level_runs (run_id,user,level_id,result) VALUES ('r-idem','u1','g1-math-upper-1-1','started')`).run();
    const payload = { runId: 'r-idem', phase: 'opening', resources: {}, answers: [
      { questionId: 'q-idem', q: '0+0=?', answer: '0', userAnswer: '1', isCorrect: false, topic: '0的认识', durationMs: 1000 },
    ] };
    const first = levelApi.submitSupplyHandler(db, payload);
    const second = levelApi.submitSupplyHandler(db, payload);
    assert.equal(first.body.answersStored, 1);
    assert.equal(second.body.answersStored, 0);
    assert.equal(second.body.duplicateAnswers, 1);
    assert.equal(db.prepare('SELECT COUNT(*) c FROM level_run_answers WHERE run_id=?').get('r-idem').c, 1);
    assert.equal(db.prepare('SELECT attempts FROM knowledge_mastery WHERE user=? AND topic=?').get('u1', '0的认识').attempts, 1);
    assert.equal(db.prepare('SELECT COUNT(*) c FROM wrong_questions WHERE user=?').get('u1').c, 1);
    db.close();
  } finally { cleanup(file); }
});

test('level finish stores run, progress and daily report without replaying submitted answers', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    db.prepare(`INSERT INTO level_runs (run_id,user,level_id,result) VALUES ('r2','u1','g1-math-upper-1-1','started')`).run();
    const submitted = [
      { questionId: 'q1', q: '0+0=?', answer: '0', userAnswer: '0', isCorrect: true, topic: '0的认识', phase: 'opening' },
      { questionId: 'q2', q: '0+1=?', answer: '1', userAnswer: '0', isCorrect: false, topic: '0的认识', phase: 'opening' },
      { questionId: 'q3', q: '0 是几个？', answer: '0', userAnswer: '0', isCorrect: true, topic: '0的认识', phase: 'boss' },
    ];
    for (const a of submitted) levelApi.submitSupplyHandler(db, { runId: 'r2', phase: a.phase, answers: [a] });
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM level_run_answers WHERE run_id=?').get('r2').c, 3);
    assert.equal(db.prepare('SELECT attempts FROM knowledge_mastery WHERE user=? AND topic=?').get('u1', '0的认识').attempts, 3);

    const finish = levelApi.finishHandler(db, {
      user: 'u1', runId: 'r2', levelId: 'g1-math-upper-1-1', result: 'win', correctCount: 99, wrongCount: 99, durationSec: 90,
      resources: { ammo_basic: 3 }, combatStats: { kills: 8 }, answers: submitted, wrongQuestions: submitted.filter(a => !a.isCorrect),
    });
    assert.equal(finish.status, 200);
    assert.equal(finish.body.stars, 1);
    assert.equal(finish.body.accuracy, 2 / 3);
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM level_run_answers WHERE run_id=?').get('r2').c, 3);
    assert.equal(db.prepare('SELECT attempts FROM knowledge_mastery WHERE user=? AND topic=?').get('u1', '0的认识').attempts, 3);
    const p = db.prepare('SELECT * FROM level_progress WHERE user=? AND level_id=?').get('u1', 'g1-math-upper-1-1');
    assert.equal(p.best_stars, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS c FROM wrong_questions WHERE user=?').get('u1').c, 1);
    const report = reportsApi.dailyReportHandler(db, { user: 'u1', date: new Date().toISOString().slice(0, 10) });
    assert.equal(report.body.summary.levelsCompleted, 1);
    assert.equal(report.body.summary.questionCount, 3);
    assert.equal(report.body.summary.weakTopics[0].topic, '0的认识');
    const weekly = reportsApi.weeklyReportHandler(db, { user: 'u1', endDate: new Date().toISOString().slice(0, 10) });
    assert.equal(weekly.body.period.days, 7);
    assert.equal(weekly.body.summary.questionCount, 3);
    assert.equal(weekly.body.summary.byDay.length, 1);
    const review = reportsApi.createReviewLevelHandler(db, { user: 'u1', topic: '0的认识', grade: 1, subject: 'math', semester: 'upper' });
    assert.equal(review.status, 200);
    assert.equal(review.body.level.type, 'review');
    assert.equal(review.body.level.questionCount, 15);
    assert.equal(review.body.level.unlocked, true);
    db.close();
  } finally { cleanup(file); }
});

test('finish is idempotent: re-running same runId does not double-count clear_times', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    db.prepare(`INSERT INTO level_runs (run_id,user,level_id,result) VALUES ('r-idem-fin','u1','g1-math-upper-1-1','started')`).run();
    const payload = {
      user: 'u1', runId: 'r-idem-fin', levelId: 'g1-math-upper-1-1',
      result: 'win', correctCount: 5, wrongCount: 0, durationSec: 60,
    };
    const a = levelApi.finishHandler(db, payload);
    assert.equal(a.status, 200);
    const after1 = db.prepare('SELECT clear_times, best_stars FROM level_progress WHERE user=? AND level_id=?').get('u1', 'g1-math-upper-1-1');
    assert.equal(after1.clear_times, 1);
    // 网络重试 / 前端误重发 → 第二次 finish 应当不再 +1
    const b = levelApi.finishHandler(db, payload);
    assert.equal(b.status, 200);
    const after2 = db.prepare('SELECT clear_times, best_stars FROM level_progress WHERE user=? AND level_id=?').get('u1', 'g1-math-upper-1-1');
    assert.equal(after2.clear_times, 1, 'clear_times must stay at 1 after duplicate finish');
    assert.equal(after2.best_stars, after1.best_stars);
    db.close();
  } finally { cleanup(file); }
});

test('createReviewLevel slug uses sha1 — long topics with same 18-char prefix do not collide', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    // 两个 topic 前 18 个字符完全相同（base64url 截断会撞 id），sha1 取 16 位应当区分。
    const t1 = '一二三四五六七八九十甲乙丙丁戊己庚辛-A';
    const t2 = '一二三四五六七八九十甲乙丙丁戊己庚辛-B';
    const r1 = reportsApi.createReviewLevelHandler(db, { user: 'u1', topic: t1, grade: 1, subject: 'math', semester: 'upper' });
    const r2 = reportsApi.createReviewLevelHandler(db, { user: 'u1', topic: t2, grade: 1, subject: 'math', semester: 'upper' });
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    assert.notEqual(r1.body.level.id, r2.body.level.id, 'distinct topics must yield distinct review level ids');
    // 两条都应存在于 DB
    assert.ok(db.prepare('SELECT id FROM campaign_levels WHERE id=?').get(r1.body.level.id));
    assert.ok(db.prepare('SELECT id FROM campaign_levels WHERE id=?').get(r2.body.level.id));
    db.close();
  } finally { cleanup(file); }
});

test('boss level seed exposes knowledgeShield.questionCount for engine multi-question shield', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    const r = campaign.mapHandler(db, { user: 'u1', grade: '1', subject: 'math', semester: 'upper' });
    const boss = r.body.chapters[0].levels.find(l => l.type === 'boss');
    assert.ok(boss, 'boss level must exist');
    assert.equal(boss.config.boss.knowledgeShield.questionCount, 2);
    db.close();
  } finally { cleanup(file); }
});

test('daily report buckets runs by Beijing day (UTC+8), not UTC day', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    // 一条 UTC 2026-05-23 17:30 finished = 北京 2026-05-24 01:30 → 应归到北京 5-24
    db.prepare(`INSERT INTO level_runs (run_id, user, level_id, result, stars, correct_count, wrong_count, duration_sec, finished_at)
                VALUES ('run-tz-a', 'u-tz', 'g1-math-upper-1-1', 'win', 3, 5, 0, 60, '2026-05-23 17:30:00')`).run();
    // 一条 UTC 2026-05-24 17:30 finished = 北京 2026-05-25 01:30 → 不在北京 5-24 的日报
    db.prepare(`INSERT INTO level_runs (run_id, user, level_id, result, stars, correct_count, wrong_count, duration_sec, finished_at)
                VALUES ('run-tz-b', 'u-tz', 'g1-math-upper-1-1', 'win', 3, 2, 0, 30, '2026-05-24 17:30:00')`).run();
    const r = reportsApi.dailyReportHandler(db, { user: 'u-tz', date: '2026-05-24' });
    assert.equal(r.body.runs.length, 1, '北京日 2026-05-24 应当只包含 run-tz-a（UTC 5-23 17:30 = 北京 5-24 01:30）');
    assert.equal(r.body.summary.questionCount, 5);
    assert.equal(r.body.summary.correctCount, 5);
    db.close();
  } finally { cleanup(file); }
});

test('summary 全 0 时 suggestion 不再用历史 mastery 兜底，给鼓励语', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    db.prepare(`INSERT INTO knowledge_mastery (user, grade, subject, semester, topic, attempts, correct, wrong, mastery)
                VALUES ('u-empty', 1, 'math', 'upper', '0的认识', 3, 1, 2, 0.4)`).run();
    const r = reportsApi.dailyReportHandler(db, { user: 'u-empty', date: '2026-05-24' });
    assert.equal(r.body.summary.questionCount, 0);
    assert.equal(r.body.summary.levelsCompleted, 0);
    assert.ok(!/继续巩固/.test(r.body.summary.suggestion),
      `今日 0 活动时 suggestion 不应引用历史 mastery，实际：${r.body.summary.suggestion}`);
    assert.ok(/(开始|挑战|战场|加油|学习)/.test(r.body.summary.suggestion),
      `应该是鼓励文案，实际：${r.body.summary.suggestion}`);
    // mastery 字段仍保留（关卡结算页 showCampaignResult 要用历史掌握度）
    assert.equal(r.body.summary.mastery[0].topic, '0的认识');
    db.close();
  } finally { cleanup(file); }
});

test('summary 暴露 learningSeconds，短时长不再 round 成 0 分钟', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    // 25 秒就赢的关，旧逻辑 round(25/60)=0 分钟 → 与 levelsCompleted=1 互相矛盾。
    // 用相对当前时间的 UTC 时戳，配合北京日切换。
    db.prepare(`INSERT INTO level_runs (run_id, user, level_id, result, stars, correct_count, wrong_count, duration_sec, finished_at)
                VALUES ('run-short', 'u-short', 'g1-math-upper-1-1', 'win', 3, 5, 0, 25, datetime('now', '-2 hours'))`).run();
    const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
    const r = reportsApi.dailyReportHandler(db, { user: 'u-short', date: today });
    assert.equal(r.body.summary.levelsCompleted, 1);
    assert.equal(r.body.summary.learningSeconds, 25, 'learningSeconds 字段应当存在且 = 25');
    // learningMinutes 仍保留向后兼容
    assert.equal(typeof r.body.summary.learningMinutes, 'number');
    // byDay 也要带 learningSeconds
    assert.equal(r.body.summary.byDay[0].learningSeconds, 25);
    db.close();
  } finally { cleanup(file); }
});

test('主页练习 (/api/free-practice/finish) 写入 level_runs / answers / mastery，并出现在家长日报', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    const freeApi = require('../lib/free-practice-api');
    const r = freeApi.finishHandler(db, {
      user: 'u-free',
      grade: 1, subject: 'math', semester: 'upper', lv: 1, engine: 'battle',
      result: 'win',
      correct: 4, wrong: 1, durationSec: 90,
      answers: [
        { questionId: 'fp1', q: '1+1=?', answer: '2', userAnswer: '2', isCorrect: true, topic: '5以内加法', durationMs: 1200 },
        { questionId: 'fp2', q: '0+0=?', answer: '0', userAnswer: '0', isCorrect: true, topic: '0的认识', durationMs: 800 },
        { questionId: 'fp3', q: '3+2=?', answer: '5', userAnswer: '6', isCorrect: false, topic: '5以内加法', durationMs: 2000 },
        { questionId: 'fp4', q: '2+1=?', answer: '3', userAnswer: '3', isCorrect: true, topic: '5以内加法', durationMs: 1500 },
        { questionId: 'fp5', q: '4+0=?', answer: '4', userAnswer: '4', isCorrect: true, topic: '0的认识', durationMs: 1100 },
      ],
    });
    assert.equal(r.status, 200);
    assert.ok(r.body.runId.startsWith('run-free-'));
    assert.equal(r.body.stars, 2); // accuracy = 4/5 = 0.8 → 2 stars

    const run = db.prepare("SELECT level_id, result, correct_count, wrong_count, duration_sec FROM level_runs WHERE run_id=?").get(r.body.runId);
    assert.equal(run.level_id, 'free-g1-math-lv1-battle');
    assert.equal(run.result, 'win');
    assert.equal(run.correct_count, 4);
    assert.equal(run.wrong_count, 1);
    assert.equal(run.duration_sec, 90);

    const ansCount = db.prepare('SELECT COUNT(*) c FROM level_run_answers WHERE run_id=?').get(r.body.runId).c;
    assert.equal(ansCount, 5);

    const m1 = db.prepare("SELECT attempts, correct, wrong FROM knowledge_mastery WHERE user=? AND topic=?").get('u-free', '5以内加法');
    assert.equal(m1.attempts, 3);
    assert.equal(m1.correct, 2);
    assert.equal(m1.wrong, 1);
    const m2 = db.prepare("SELECT attempts, correct FROM knowledge_mastery WHERE user=? AND topic=?").get('u-free', '0的认识');
    assert.equal(m2.attempts, 2);
    assert.equal(m2.correct, 2);

    const wrongCount = db.prepare("SELECT COUNT(*) c FROM wrong_questions WHERE user=?").get('u-free').c;
    assert.equal(wrongCount, 1, '错题本应只收 1 条 (fp3)');

    const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
    const daily = reportsApi.dailyReportHandler(db, { user: 'u-free', date: today });
    assert.equal(daily.body.summary.levelsCompleted, 1);
    assert.equal(daily.body.summary.questionCount, 5);
    assert.equal(daily.body.summary.correctCount, 4);
    assert.equal(daily.body.summary.wrongCount, 1);
    assert.equal(daily.body.summary.learningSeconds, 90);
    db.close();
  } finally { cleanup(file); }
});

test('weakTopics 从题级 topic 聚合，主页练习的薄弱点也能显示', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    const freeApi = require('../lib/free-practice-api');
    freeApi.finishHandler(db, {
      user: 'u-weak', grade: 3, subject: 'english', semester: 'lower', lv: 1, engine: 'battle',
      result: 'complete', correct: 0, wrong: 3, durationSec: 60,
      answers: [
        { questionId: 'w1', q: '2+3=?', answer: '5', userAnswer: '4', isCorrect: false, topic: '5以内加法' },
        { questionId: 'w2', q: '1+4=?', answer: '5', userAnswer: '6', isCorrect: false, topic: '5以内加法' },
        { questionId: 'w3', q: '0+0=?', answer: '0', userAnswer: '1', isCorrect: false, topic: '0的认识' },
      ],
    });
    const today = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10);
    const daily = reportsApi.dailyReportHandler(db, { user: 'u-weak', date: today });
    const wt = daily.body.summary.weakTopics;
    assert.ok(wt.length >= 2, `weakTopics 应至少 2 个，实际 ${JSON.stringify(wt)}`);
    const byTopic = Object.fromEntries(wt.map(x => [x.topic, x.wrongCount]));
    assert.equal(byTopic['5以内加法'], 2);
    assert.equal(byTopic['0的认识'], 1);
    assert.equal(wt[0].topic, '5以内加法'); // 按错题数降序
    assert.deepEqual(
      { grade: wt[0].grade, subject: wt[0].subject, semester: wt[0].semester },
      { grade: 3, subject: 'english', semester: 'lower' }
    );
    db.close();
  } finally { cleanup(file); }
});

test('campaign map unlocks next level after a cleared run even when computed stars are 0', () => {
  const file = tmpDb();
  try {
    const db = openDb(file); initSchema(db); seedCampaigns(db);
    const finish = levelApi.finishHandler(db, {
      user: 'u-clear-zero', runId: 'r-clear-zero', levelId: 'g1-math-upper-1-1',
      result: 'win', correctCount: 0, wrongCount: 3, durationSec: 60,
    });
    assert.equal(finish.status, 200);
    assert.equal(finish.body.stars, 0);
    const progress = db.prepare('SELECT best_stars, clear_times, last_result FROM level_progress WHERE user=? AND level_id=?')
      .get('u-clear-zero', 'g1-math-upper-1-1');
    assert.equal(progress.best_stars, 0);
    assert.equal(progress.clear_times, 1);
    assert.equal(progress.last_result, 'win');

    const r = campaign.mapHandler(db, { user: 'u-clear-zero', grade: '1', subject: 'math', semester: 'upper' });
    const levels = r.body.chapters[0].levels;
    assert.equal(levels[0].state, 'cleared');
    assert.equal(levels[1].unlocked, true);
    assert.equal(r.body.recommendedLevelId, 'g1-math-upper-1-2');
    db.close();
  } finally { cleanup(file); }
});
