'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');

const Database = require('better-sqlite3');
const { initSchema } = require('../lib/db');
const { computeCoverage, diffGaps } = require('../lib/coverage');

const REPO = path.join(__dirname, '..');

function tmpDb() {
  const file = path.join(os.tmpdir(), `homework-cov-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return { db, file };
}

function seedSomeQuestions(db, n) {
  const ins = db.prepare(`INSERT INTO questions
    (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled)
    VALUES(?,1,'math','upper','5以内加法','["5以内加法"]',1,'choice',?,?,?,?,?,'seed',1)`);
  for (let i = 0; i < n; i++) {
    ins.run(`hash-${i}`, `q-${i}`, '["a","b"]', 'a', '["h"]', 'exp');
  }
  db.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points)
    VALUES(?,?,?,?,?)`).run(1,'math','upper','5以内加法','["5以内加法"]');
}

test('computeCoverage returns matrix with curriculum × lv cells', () => {
  const { db, file } = tmpDb();
  try {
    seedSomeQuestions(db, 5);
    const r = computeCoverage(db, { threshold: 3 });
    assert.equal(r.threshold, 3);
    // 1 topic × 3 lv levels = 3 cells
    assert.equal(r.matrix.length, 3);
    const lv1Cell = r.matrix.find(m => m.lv === 1);
    assert.equal(lv1Cell.static, 5);
    assert.equal(lv1Cell.generated, 0);
    assert.equal(lv1Cell.total, 5);
    // gaps = lv2 (0) and lv3 (0), both < threshold
    assert.equal(r.gaps.length, 2);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('computeCoverage counts generators alongside questions', () => {
  const { db, file } = tmpDb();
  try {
    seedSomeQuestions(db, 1);
    db.prepare(`INSERT INTO generators(key,grade,subject,semester,topic,knowledge_points,lv,module_path,enabled)
                VALUES(?,1,'math','upper','5以内加法','["5以内加法"]',2,'generators/g.js',1)`).run('g-test');
    const r = computeCoverage(db, { threshold: 3 });
    const lv2Cell = r.matrix.find(m => m.lv === 2);
    assert.equal(lv2Cell.static, 0);
    assert.equal(lv2Cell.generated, 1);
    assert.equal(lv2Cell.total, 1);
  } finally { db.close(); fs.unlinkSync(file); }
});

test('diffGaps returns only new gaps not in baseline', () => {
  const baseline = [
    { grade: 1, subject: 'math', semester: 'upper', topic: 'A', lv: 1 },
  ];
  const current = [
    { grade: 1, subject: 'math', semester: 'upper', topic: 'A', lv: 1 },
    { grade: 1, subject: 'math', semester: 'upper', topic: 'B', lv: 2 },
  ];
  const newGaps = diffGaps(current, baseline);
  assert.equal(newGaps.length, 1);
  assert.equal(newGaps[0].topic, 'B');
});

test('coverage CLI runs and outputs matrix', () => {
  const { db, file } = tmpDb();
  try {
    seedSomeQuestions(db, 5);
    db.close();
    const r = cp.spawnSync('node', ['scripts/coverage.js'], {
      cwd: REPO, env: { ...process.env, HOMEWORK_DB: file }, encoding: 'utf-8',
    });
    if (r.status !== 0) {
      console.error('STDOUT:', r.stdout);
      console.error('STDERR:', r.stderr);
    }
    assert.equal(r.status, 0);
    assert.match(r.stdout, /5以内加法/);
    assert.match(r.stdout, /lv1/);
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('coverage CLI --json outputs valid JSON', () => {
  const { db, file } = tmpDb();
  try {
    seedSomeQuestions(db, 2);
    db.close();
    const r = cp.spawnSync('node', ['scripts/coverage.js', '--json'], {
      cwd: REPO, env: { ...process.env, HOMEWORK_DB: file }, encoding: 'utf-8',
    });
    assert.equal(r.status, 0);
    const parsed = JSON.parse(r.stdout);
    assert.ok(Array.isArray(parsed.matrix));
    assert.ok(Array.isArray(parsed.gaps));
    assert.equal(typeof parsed.summary, 'object');
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('coverage CLI --strict exits non-zero when gaps exist', () => {
  const { db, file } = tmpDb();
  try {
    seedSomeQuestions(db, 1);  // only 1 in lv1 cell, lv2/lv3 are gaps
    db.close();
    const r = cp.spawnSync('node', ['scripts/coverage.js', '--strict'], {
      cwd: REPO, env: { ...process.env, HOMEWORK_DB: file }, encoding: 'utf-8',
    });
    assert.notEqual(r.status, 0);
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('coverage CLI --check-baseline detects new gaps', () => {
  const { db, file } = tmpDb();
  const baseFile = path.join(os.tmpdir(), `cov-baseline-${process.pid}.json`);
  try {
    seedSomeQuestions(db, 5);
    db.close();
    // first run: write baseline
    cp.spawnSync('node', ['scripts/coverage.js', '--update-baseline', '--baseline', baseFile], {
      cwd: REPO, env: { ...process.env, HOMEWORK_DB: file }, encoding: 'utf-8',
    });
    assert.ok(fs.existsSync(baseFile), 'baseline file should be created');

    // check baseline OK (no new gaps): exit 0
    const r1 = cp.spawnSync('node', ['scripts/coverage.js', '--check-baseline', '--baseline', baseFile], {
      cwd: REPO, env: { ...process.env, HOMEWORK_DB: file }, encoding: 'utf-8',
    });
    assert.equal(r1.status, 0, `expected 0, got ${r1.status}: ${r1.stderr}`);

    // add a new gap by removing some seeded questions: actually we cannot
    // remove from a closed db; instead, create a NEW topic in curriculum that has 0 questions
    const db2 = new Database(file);
    db2.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points)
                  VALUES(?,?,?,?,?)`).run(2,'math','upper','新增 Topic','["新增"]');
    db2.close();

    const r2 = cp.spawnSync('node', ['scripts/coverage.js', '--check-baseline', '--baseline', baseFile], {
      cwd: REPO, env: { ...process.env, HOMEWORK_DB: file }, encoding: 'utf-8',
    });
    assert.notEqual(r2.status, 0);
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
    if (fs.existsSync(baseFile)) fs.unlinkSync(baseFile);
  }
});
