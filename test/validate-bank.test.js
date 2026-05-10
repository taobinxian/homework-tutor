'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');

const Database = require('better-sqlite3');
const { initSchema } = require('../lib/db');

const REPO = path.join(__dirname, '..');

function tmpDb() {
  const file = path.join(os.tmpdir(), `homework-validate-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return { db, file };
}

function cleanup(file) {
  for (const ext of ['', '-shm', '-wal']) {
    if (fs.existsSync(file + ext)) try { fs.unlinkSync(file + ext); } catch (_) {}
  }
}

function runValidate(env) {
  return cp.spawnSync('node', ['scripts/validate-question-bank.js'], {
    cwd: REPO, env: { ...process.env, ...env }, encoding: 'utf-8',
  });
}

function seedValidQuestion(db) {
  db.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points)
    VALUES(?,?,?,?,?)`).run(1,'math','upper','5以内加法','["5以内加法"]');
  db.prepare(`INSERT INTO questions
    (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
    VALUES('h1',1,'math','upper','5以内加法','["5以内加法"]',1,'choice','q1','["a","b"]','a','["h"]','exp','seed',1)`).run();
}

test('validate:bank passes on clean DB', () => {
  const { db, file } = tmpDb();
  try {
    seedValidQuestion(db);
    db.close();
    const r = runValidate({ HOMEWORK_DB: file });
    assert.equal(r.status, 0, `expected 0, got ${r.status}: ${r.stdout}\n${r.stderr}`);
  } finally { cleanup(file); }
});

test('validate:bank fails when answer not in options', () => {
  const { db, file } = tmpDb();
  try {
    seedValidQuestion(db);
    db.prepare(`INSERT INTO questions
      (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
      VALUES('h2',1,'math','upper','5以内加法','["5以内加法"]',1,'choice','q-bad','["x","y"]','z','[]','','seed',1)`).run();
    db.close();
    const r = runValidate({ HOMEWORK_DB: file });
    assert.notEqual(r.status, 0);
    assert.match(r.stdout + r.stderr, /answer.*options|q-bad|不在/i);
  } finally { cleanup(file); }
});

test('validate:bank fails when topic not in curriculum (and source=seed)', () => {
  const { db, file } = tmpDb();
  try {
    db.prepare(`INSERT INTO questions
      (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
      VALUES('h3',1,'math','upper','不存在的话题','["未知"]',1,'choice','q','["a"]','a','[]','','seed',1)`).run();
    db.close();
    const r = runValidate({ HOMEWORK_DB: file });
    assert.notEqual(r.status, 0);
    assert.match(r.stdout + r.stderr, /topic|curriculum|不存在/i);
  } finally { cleanup(file); }
});

test('validate:bank passes for source=photo with unknown topic', () => {
  const { db, file } = tmpDb();
  try {
    seedValidQuestion(db);
    db.prepare(`INSERT INTO questions
      (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
      VALUES('h4',1,'math','upper','拍照新题','["未知"]',1,'choice','q','["a","b"]','a','[]','','photo',1)`).run();
    db.close();
    const r = runValidate({ HOMEWORK_DB: file });
    assert.equal(r.status, 0, `photo source should be allowed: ${r.stdout}\n${r.stderr}`);
  } finally { cleanup(file); }
});
