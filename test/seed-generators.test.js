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
  return path.join(os.tmpdir(), `homework-gen-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
}

function runScript(env) {
  return cp.spawnSync('node', [path.join('scripts', 'db-seed-generators.js')], {
    cwd: REPO,
    env: { ...process.env, ...env },
    encoding: 'utf-8',
  });
}

test('db-seed-generators registers all 5 core generators', () => {
  const file = tmpDb();
  try {
    const r = runScript({ HOMEWORK_DB: file });
    assert.equal(r.status, 0, `script failed: ${r.stderr}`);
    const db = new Database(file);
    const keys = db.prepare(`SELECT key FROM generators WHERE enabled=1 ORDER BY key`).all().map(r => r.key);
    for (const expected of [
      'g1-math-add-within-5',
      'g1-math-sub-within-5',
      'g1-math-add-within-10',
      'g1-math-carry-add-20',
      'g2-math-multiplication',
    ]) {
      assert.ok(keys.includes(expected), `expected key ${expected} in DB, got: ${keys.join(',')}`);
    }
    db.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-generators excludes _template.js and README.md', () => {
  const file = tmpDb();
  try {
    runScript({ HOMEWORK_DB: file });
    const db = new Database(file);
    const tpl = db.prepare(`SELECT key FROM generators WHERE key='_template'`).get();
    assert.equal(tpl, undefined, '_template.js should not register');
    db.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-generators expands curriculum-backed variant generators', () => {
  const file = tmpDb();
  try {
    const db = new Database(file);
    initSchema(db);
    db.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points)
                VALUES(?,?,?,?,?)`).run(3, 'science', 'upper', '植物', '["植物"]');
    db.close();

    const r = runScript({ HOMEWORK_DB: file });
    assert.equal(r.status, 0, `script failed: ${r.stderr}`);

    const db2 = new Database(file);
    const rows = db2.prepare(`
      SELECT key, module_path, grade, subject, semester, topic, lv
      FROM generators
      WHERE enabled=1 AND module_path='generators/generic-curriculum-practice.js'
      ORDER BY key
    `).all();
    assert.equal(rows.length, 15, '1 curriculum row × 3 levels × 5 slots');
    assert.deepEqual(new Set(rows.map(r => r.lv)), new Set([1, 2, 3]));
    for (const row of rows) {
      assert.equal(row.grade, 3);
      assert.equal(row.subject, 'science');
      assert.equal(row.semester, 'upper');
      assert.equal(row.topic, '植物');
    }
    db2.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-generators is idempotent (no row count change on re-run)', () => {
  const file = tmpDb();
  try {
    runScript({ HOMEWORK_DB: file });
    const db1 = new Database(file);
    const c1 = db1.prepare('SELECT COUNT(*) AS c FROM generators').get().c;
    db1.close();
    runScript({ HOMEWORK_DB: file });
    const db2 = new Database(file);
    const c2 = db2.prepare('SELECT COUNT(*) AS c FROM generators').get().c;
    db2.close();
    assert.equal(c1, c2);
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-generators disables removed generators (sets enabled=0)', () => {
  const file = tmpDb();
  try {
    runScript({ HOMEWORK_DB: file });
    const db = new Database(file);
    // Inject a stale generator that does not exist on disk
    db.prepare(`INSERT INTO generators(key, grade, subject, semester, topic, knowledge_points, lv, module_path, enabled, description)
                VALUES(?,?,?,?,?,?,?,?,?,?)`).run(
      'g9-stale', 9, 'math', 'upper', 'fake', '[]', 1, 'generators/missing.js', 1, 'stale'
    );
    db.close();

    runScript({ HOMEWORK_DB: file });

    const db2 = new Database(file);
    const stale = db2.prepare(`SELECT enabled FROM generators WHERE key='g9-stale'`).get();
    assert.equal(stale.enabled, 0, 'missing module_path should be disabled');
    db2.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});

test('db-seed-generators rejects mismatched meta.key vs filename', () => {
  // Write a temporary bad file
  const bad = path.join(REPO, 'generators', 'bad-key-mismatch.js');
  fs.writeFileSync(bad, `'use strict';
module.exports = {
  meta: {
    key: 'NOT-MATCHING',
    grade: 1, subject: 'math', semester: 'upper',
    topic: '5以内加法', knowledgePoints: ['5以内加法'], lv: 1,
    description: 'test bad'
  },
  generate(n){ return []; }
};
`);
  const file = tmpDb();
  try {
    const r = runScript({ HOMEWORK_DB: file });
    assert.notEqual(r.status, 0, 'should fail with non-zero exit');
    assert.match(r.stderr + r.stdout, /key/i);
  } finally {
    fs.unlinkSync(bad);
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});
