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
