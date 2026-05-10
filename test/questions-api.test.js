'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const Database = require('better-sqlite3');
const { initSchema } = require('../lib/db');
const qApi = require('../lib/questions-api');

function tmpDb() {
  const file = path.join(os.tmpdir(), `homework-qapi-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return { db, file };
}

function ch(grade, subject, q, answer) {
  return crypto.createHash('sha1').update(`${grade}|${subject}|${q}|${answer}`).digest('hex');
}

function seedSome(db) {
  const ins = db.prepare(`INSERT INTO questions
    (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
    VALUES(?,1,'math','upper','5以内加法','["5以内加法"]',1,'choice',?,?,?,?,?,'seed',1)`);
  ins.run(ch(1,'math','q1','a'),'q1','["a","b"]','a','["h1"]','exp');
  ins.run(ch(1,'math','q2','b'),'q2','["a","b"]','b','["h2"]','exp');
  db.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points)
    VALUES(?,?,?,?,?)`).run(1,'math','upper','5以内加法','["5以内加法"]');
}

test('pickHandler returns picked questions for valid params', async () => {
  const { db, file } = tmpDb();
  try {
    seedSome(db);
    const r = await qApi.pickHandler(db, { grade: '1', subject: 'math', count: '5', source: 'static' });
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    assert.ok(r.body.length > 0);
    assert.equal(r.body[0].grade, 1);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('pickHandler rejects missing grade or subject', async () => {
  const { db, file } = tmpDb();
  try {
    const r1 = await qApi.pickHandler(db, { subject: 'math' });
    assert.equal(r1.status, 400);
    assert.match(r1.body.error, /grade/);
    const r2 = await qApi.pickHandler(db, { grade: '1' });
    assert.equal(r2.status, 400);
    assert.match(r2.body.error, /subject/);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('curriculumHandler returns rows filtered by grade', () => {
  const { db, file } = tmpDb();
  try {
    seedSome(db);
    db.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points)
      VALUES(?,?,?,?,?)`).run(2,'math','upper','乘法口诀','["乘法口诀"]');
    const r = qApi.curriculumHandler(db, { grade: '1' });
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 1);
    assert.equal(r.body[0].grade, 1);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('curriculumHandler returns all when no filter', () => {
  const { db, file } = tmpDb();
  try {
    seedSome(db);
    const r = qApi.curriculumHandler(db, {});
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 1);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('addQuestionHandler inserts new and returns id', () => {
  const { db, file } = tmpDb();
  try {
    const payload = {
      grade: 3, subject: 'math', q: 'new q', answer: 'new a',
      type: 'input', topic: '万以内数', semester: 'lower', lv: 2,
    };
    const r = qApi.addQuestionHandler(db, payload);
    assert.equal(r.status, 200);
    assert.equal(r.body.ok, true);
    assert.ok(r.body.id);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('addQuestionHandler returns duplicate=true on content_hash conflict', () => {
  const { db, file } = tmpDb();
  try {
    const payload = { grade: 3, subject: 'math', q: 'dup q', answer: 'dup a' };
    const r1 = qApi.addQuestionHandler(db, payload);
    const r2 = qApi.addQuestionHandler(db, payload);
    assert.equal(r2.body.duplicate, true);
    assert.equal(r2.body.id, r1.body.id);
    const count = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
    assert.equal(count, 1);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('coverageHandler returns matrix and gaps structure', () => {
  const { db, file } = tmpDb();
  try {
    seedSome(db);
    const r = qApi.coverageHandler(db, {});
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.matrix), 'matrix should be array');
    assert.ok(Array.isArray(r.body.gaps), 'gaps should be array');
    assert.ok(r.body.summary && typeof r.body.summary === 'object');
    assert.equal(typeof r.body.threshold, 'number');
  } finally { db.close(); fs.unlinkSync(file); }
});
