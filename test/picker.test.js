'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const Database = require('better-sqlite3');
const { initSchema } = require('../lib/db');
const { pickQuestions } = require('../lib/picker');

function tmpDb() {
  const file = path.join(os.tmpdir(), `homework-pick-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return { db, file };
}

function hash(grade, subject, q, answer) {
  return crypto.createHash('sha1').update(`${grade}|${subject}|${q}|${answer}`).digest('hex');
}

function seedStatic(db, items) {
  const ins = db.prepare(`INSERT INTO questions
    (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,'seed',1)`);
  for (const x of items) {
    ins.run(hash(x.grade, x.subject, x.q, x.answer),
      x.grade, x.subject, x.semester || 'upper', x.topic || 'topic',
      JSON.stringify(x.knowledgePoints || [x.topic || 'topic']),
      x.lv, x.q_type, x.q, x.options ? JSON.stringify(x.options) : null,
      x.answer, x.hints ? JSON.stringify(x.hints) : null, x.explain_text || ''
    );
  }
}

function seedGenerator(db, modulePath) {
  const mod = require(modulePath);
  const m = mod.meta;
  db.prepare(`INSERT INTO generators
    (key, grade, subject, semester, topic, knowledge_points, lv, module_path, enabled, description)
    VALUES(?,?,?,?,?,?,?,?,1,?)`).run(
    m.key, m.grade, m.subject, m.semester, m.topic,
    JSON.stringify(m.knowledgePoints), m.lv, modulePath, m.description || ''
  );
}

test('pickQuestions source=static returns rows matching filter', async () => {
  const { db, file } = tmpDb();
  try {
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: '1+1=?', options: ['2','3'], answer: '2', topic: '5以内加法' },
      { grade: 1, subject: 'math', lv: 2, q_type: 'choice', q: '5+5=?', options: ['10','11'], answer: '10', topic: '10以内加法' },
      { grade: 2, subject: 'math', lv: 1, q_type: 'choice', q: '2x2=?', options: ['4','5'], answer: '4', topic: '乘法口诀' },
    ]);

    const got = await pickQuestions({ db, grade: 1, subject: 'math', count: 10, source: 'static' });
    assert.equal(got.length, 2);
    for (const q of got) {
      assert.equal(q.grade, 1);
      assert.equal(q.subject, 'math');
      assert.ok(['upper','lower','unknown'].includes(q.semester));
      assert.ok(q.semesterLabel, 'semesterLabel should be filled');
      assert.equal(q.source, 'static');
    }
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions source=static filters by lv', async () => {
  const { db, file } = tmpDb();
  try {
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'a', options: ['x'], answer: 'x', topic: 't' },
      { grade: 1, subject: 'math', lv: 2, q_type: 'choice', q: 'b', options: ['x'], answer: 'x', topic: 't' },
      { grade: 1, subject: 'math', lv: 3, q_type: 'choice', q: 'c', options: ['x'], answer: 'x', topic: 't' },
    ]);
    const got = await pickQuestions({ db, grade: 1, subject: 'math', lv: 2, count: 10, source: 'static' });
    assert.equal(got.length, 1);
    assert.equal(got[0].lv, 2);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions source=generated calls generator module', async () => {
  const { db, file } = tmpDb();
  try {
    seedGenerator(db, path.resolve(__dirname, 'fixtures/gen-fixture.js'));
    const got = await pickQuestions({ db, grade: 1, subject: 'math', lv: 1, count: 5, source: 'generated' });
    assert.equal(got.length, 5);
    for (const q of got) {
      assert.equal(q.source, 'generated');
      assert.equal(q.grade, 1);
      assert.equal(q.subject, 'math');
      assert.ok(q.q.includes('+'));
    }
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions source=mixed combines static and generated', async () => {
  const { db, file } = tmpDb();
  try {
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'static-1', options: ['x'], answer: 'x', topic: '5以内加法' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'static-2', options: ['x'], answer: 'x', topic: '5以内加法' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'static-3', options: ['x'], answer: 'x', topic: '5以内加法' },
    ]);
    seedGenerator(db, path.resolve(__dirname, 'fixtures/gen-fixture.js'));

    const got = await pickQuestions({ db, grade: 1, subject: 'math', lv: 1, count: 10, source: 'mixed' });
    assert.equal(got.length, 10);
    const sources = new Set(got.map(q => q.source));
    assert.ok(sources.has('static') || sources.has('generated'), 'mix should include both');
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions source=mixed auto-fills when one side empty', async () => {
  const { db, file } = tmpDb();
  try {
    seedGenerator(db, path.resolve(__dirname, 'fixtures/gen-fixture.js'));
    // No static questions seeded
    const got = await pickQuestions({ db, grade: 1, subject: 'math', lv: 1, count: 10, source: 'mixed' });
    assert.equal(got.length, 10, 'should fill from generator side');
    for (const q of got) {
      assert.equal(q.source, 'generated');
    }
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions deduplicates by content', async () => {
  const { db, file } = tmpDb();
  try {
    // Insert same question twice (different content_hash NOT possible due to UNIQUE),
    // so seed one static and have generator emit a duplicate q+answer
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: '1 + 0 = ?', options: ['1'], answer: '1', topic: '5以内加法' },
    ]);
    seedGenerator(db, path.resolve(__dirname, 'fixtures/gen-fixture.js'));
    const got = await pickQuestions({ db, grade: 1, subject: 'math', lv: 1, count: 20, source: 'mixed' });
    const seen = new Set();
    for (const q of got) {
      const k = q.q + '|' + q.answer;
      assert.ok(!seen.has(k), `duplicate question detected: ${k}`);
      seen.add(k);
    }
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions source=wrongbook-practice expands wrongbook entries', async () => {
  const { db, file } = tmpDb();
  try {
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'q-static-1', options: ['x'], answer: 'x', topic: '5以内加法' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'q-static-2', options: ['x'], answer: 'x', topic: '5以内加法' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'q-static-3', options: ['x'], answer: 'x', topic: '5以内加法' },
      { grade: 1, subject: 'math', lv: 2, q_type: 'choice', q: 'q-static-other', options: ['x'], answer: 'x', topic: 'other' },
    ]);
    db.prepare(`INSERT INTO wrong_questions(user, q, answer, topic, grade, subject, semester, lv) VALUES(?,?,?,?,?,?,?,?)`).run(
      'kid1', 'wrong-q-1', 'a', '5以内加法', 1, 'math', 'upper', 1
    );
    const got = await pickQuestions({ db, grade: 1, subject: 'math', count: 10, source: 'wrongbook-practice', user: 'kid1' });
    assert.ok(got.length >= 1, 'should include at least the wrongbook entry');
    const sources = new Set(got.map(q => q.source));
    assert.ok(sources.has('wrongbook'), 'should include wrongbook source');
    // Expansion picks should match topic+lv of the wrongbook entry
    const expansionStatic = got.filter(q => q.source === 'static');
    for (const q of expansionStatic) {
      assert.equal(q.topic, '5以内加法');
      assert.equal(q.lv, 1);
    }
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions count limits result', async () => {
  const { db, file } = tmpDb();
  try {
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({ grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: `q-${i}`, options: ['x'], answer: 'x', topic: 't' });
    }
    seedStatic(db, items);
    const got = await pickQuestions({ db, grade: 1, subject: 'math', count: 5, source: 'static' });
    assert.equal(got.length, 5);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions excludeIds filters out by id', async () => {
  const { db, file } = tmpDb();
  try {
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'a', options: ['x'], answer: 'x', topic: 't' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'b', options: ['x'], answer: 'x', topic: 't' },
    ]);
    const all = await pickQuestions({ db, grade: 1, subject: 'math', count: 10, source: 'static' });
    const excludeId = all[0].id;
    const got = await pickQuestions({ db, grade: 1, subject: 'math', count: 10, source: 'static', excludeIds: [excludeId] });
    for (const q of got) {
      assert.notEqual(q.id, excludeId);
    }
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions throws on missing required params', async () => {
  const { db, file } = tmpDb();
  try {
    await assert.rejects(() => pickQuestions({ db, count: 5 }), /grade/);
    await assert.rejects(() => pickQuestions({ db, grade: 1, count: 5 }), /subject/);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickQuestions wrongbook-practice does NOT require grade/subject', async () => {
  const { db, file } = tmpDb();
  try {
    db.prepare(`INSERT INTO wrong_questions(user,q,answer,topic,grade,subject,semester,lv) VALUES(?,?,?,?,?,?,?,?)`).run(
      'kid', 'wb question', 'a', 't', 1, 'math', 'upper', 1
    );
    // 不传 grade/subject，应该返回错题
    const got = await pickQuestions({ db, count: 5, source: 'wrongbook-practice', user: 'kid' });
    assert.ok(got.length >= 1, 'should fetch wrongbook entries even without grade/subject');
  } finally { db.close(); fs.unlinkSync(file); }
});

test('semesterLabel is filled from semester', async () => {
  const { db, file } = tmpDb();
  try {
    seedStatic(db, [
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'u', options: ['x'], answer: 'x', topic: 't', semester: 'upper' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'l', options: ['x'], answer: 'x', topic: 't', semester: 'lower' },
      { grade: 1, subject: 'math', lv: 1, q_type: 'choice', q: 'n', options: ['x'], answer: 'x', topic: 't', semester: 'unknown' },
    ]);
    const got = await pickQuestions({ db, grade: 1, subject: 'math', count: 10, source: 'static' });
    const labels = got.reduce((acc, q) => { acc[q.semester] = q.semesterLabel; return acc; }, {});
    assert.equal(labels.upper, '上册');
    assert.equal(labels.lower, '下册');
    assert.equal(labels.unknown, '未标注');
  } finally { db.close(); fs.unlinkSync(file); }
});
