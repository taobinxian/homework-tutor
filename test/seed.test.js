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
  const file = path.join(os.tmpdir(), `homework-seed-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  return file;
}

function runScript(script, env = {}) {
  return cp.spawnSync('node', [path.join('scripts', script)], {
    cwd: REPO,
    env: { ...process.env, ...env },
    encoding: 'utf-8',
  });
}

test('db-seed-curriculum populates curriculum table from curriculum.js', () => {
  const file = tmpDb();
  try {
    const r = runScript('db-seed-curriculum.js', { HOMEWORK_DB: file });
    if (r.status !== 0) {
      console.error('STDOUT:', r.stdout);
      console.error('STDERR:', r.stderr);
    }
    assert.equal(r.status, 0, 'script should exit 0');

    const db = new Database(file);
    const count = db.prepare('SELECT COUNT(*) AS c FROM curriculum').get().c;
    assert.ok(count > 0, 'curriculum should have rows');

    const grades = db.prepare('SELECT DISTINCT grade FROM curriculum ORDER BY grade').all().map(r => r.grade);
    assert.deepEqual(grades, [1,2,3,4,5,6], 'all 6 grades present');

    const subjects = db.prepare('SELECT DISTINCT subject FROM curriculum ORDER BY subject').all().map(r => r.subject);
    for (const s of ['math','chinese','english']) {
      assert.ok(subjects.includes(s), `subject ${s} should be present`);
    }
    db.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-curriculum is idempotent', () => {
  const file = tmpDb();
  try {
    runScript('db-seed-curriculum.js', { HOMEWORK_DB: file });
    const db1 = new Database(file);
    const c1 = db1.prepare('SELECT COUNT(*) AS c FROM curriculum').get().c;
    db1.close();

    runScript('db-seed-curriculum.js', { HOMEWORK_DB: file });
    const db2 = new Database(file);
    const c2 = db2.prepare('SELECT COUNT(*) AS c FROM curriculum').get().c;
    db2.close();

    assert.equal(c1, c2, 'second run should not duplicate rows');
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-legacy populates questions table from grade*.js', () => {
  const file = tmpDb();
  try {
    runScript('db-seed-curriculum.js', { HOMEWORK_DB: file });
    const r = runScript('db-seed-legacy.js', { HOMEWORK_DB: file });
    if (r.status !== 0) {
      console.error('STDOUT:', r.stdout);
      console.error('STDERR:', r.stderr);
    }
    assert.equal(r.status, 0);

    const db = new Database(file);
    const count = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
    assert.ok(count > 100, `expected >100 questions, got ${count}`);

    const grades = db.prepare('SELECT DISTINCT grade FROM questions ORDER BY grade').all().map(r => r.grade);
    assert.deepEqual(grades, [1,2,3,4,5,6]);

    const sample = db.prepare('SELECT * FROM questions LIMIT 1').get();
    assert.ok(sample.content_hash, 'content_hash should be set');
    assert.ok(sample.q && sample.answer, 'q and answer should be non-empty');
    assert.ok(['choice','input'].includes(sample.q_type), 'q_type valid');
    assert.ok(['upper','lower','unknown'].includes(sample.semester), 'semester valid');
    assert.ok([1,2,3].includes(sample.lv), 'lv in {1,2,3}');
    db.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-legacy is idempotent for identical content (deterministic seed)', () => {
  const file = tmpDb();
  try {
    runScript('db-seed-curriculum.js', { HOMEWORK_DB: file });
    const env = { HOMEWORK_DB: file, HOMEWORK_LEGACY_SEED: 'test-seed-stable' };
    runScript('db-seed-legacy.js', env);
    const db1 = new Database(file);
    const c1 = db1.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
    db1.close();

    runScript('db-seed-legacy.js', env);
    const db2 = new Database(file);
    const c2 = db2.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
    db2.close();

    assert.equal(c1, c2, 'with same deterministic seed, second run should produce no new rows');
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-legacy never inserts duplicate content_hash', () => {
  const file = tmpDb();
  try {
    runScript('db-seed-curriculum.js', { HOMEWORK_DB: file });
    runScript('db-seed-legacy.js', { HOMEWORK_DB: file });
    runScript('db-seed-legacy.js', { HOMEWORK_DB: file });
    const db = new Database(file);
    const dups = db.prepare(`
      SELECT content_hash, COUNT(*) AS c FROM questions GROUP BY content_hash HAVING c > 1
    `).all();
    db.close();
    assert.equal(dups.length, 0, `no content_hash should appear twice; got ${JSON.stringify(dups)}`);
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});
