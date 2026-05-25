'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const Database = require('better-sqlite3');
const { initSchema } = require('../lib/db');

function tmpDb() {
  const file = path.join(os.tmpdir(), `homework-test-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  return { db, file };
}

function tableInfo(db, table) {
  return db.prepare(`PRAGMA table_info(${table})`).all();
}

function indexNames(db, table) {
  return db.prepare(`PRAGMA index_list(${table})`).all().map(r => r.name);
}

test('initSchema creates wrong_questions with all expected columns including lv', () => {
  const { db, file } = tmpDb();
  try {
    initSchema(db);
    const cols = tableInfo(db, 'wrong_questions').map(c => c.name);
    for (const required of ['id','user','q','type','options','answer','user_answer','hints','explain_text','topic','source','needs_image','image_desc','grade','subject','semester','knowledge_points','lv','created_at']) {
      assert.ok(cols.includes(required), `wrong_questions should contain column ${required}, got ${cols.join(',')}`);
    }
    const lvDefault = tableInfo(db, 'wrong_questions').find(c => c.name === 'lv').dflt_value;
    assert.equal(String(lvDefault), '2', 'lv default should be 2');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('initSchema creates questions table with required columns and indexes', () => {
  const { db, file } = tmpDb();
  try {
    initSchema(db);
    const cols = tableInfo(db, 'questions').map(c => c.name);
    for (const required of ['id','content_hash','grade','subject','semester','topic','knowledge_points','lv','q_type','q','options','answer','hints','explain_text','source','enabled','created_at','updated_at']) {
      assert.ok(cols.includes(required), `questions should contain column ${required}`);
    }
    const idxs = indexNames(db, 'questions');
    assert.ok(idxs.includes('idx_q_filter'), 'idx_q_filter missing');
    assert.ok(idxs.includes('idx_q_topic'), 'idx_q_topic missing');
    const hashUniq = db.prepare(`SELECT sql FROM sqlite_master WHERE name='questions'`).get().sql;
    assert.match(hashUniq, /content_hash[^,]*UNIQUE/i, 'content_hash should be UNIQUE');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('initSchema creates generators table with key UNIQUE and idx_gen_filter', () => {
  const { db, file } = tmpDb();
  try {
    initSchema(db);
    const cols = tableInfo(db, 'generators').map(c => c.name);
    for (const required of ['id','key','grade','subject','semester','topic','knowledge_points','lv','module_path','enabled','description']) {
      assert.ok(cols.includes(required), `generators should contain column ${required}`);
    }
    const sql = db.prepare(`SELECT sql FROM sqlite_master WHERE name='generators'`).get().sql;
    assert.match(sql, /key[^,]*UNIQUE/i, 'key should be UNIQUE');
    const idxs = indexNames(db, 'generators');
    assert.ok(idxs.includes('idx_gen_filter'));
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('initSchema creates curriculum table with UNIQUE(grade,subject,topic)', () => {
  const { db, file } = tmpDb();
  try {
    initSchema(db);
    const cols = tableInfo(db, 'curriculum').map(c => c.name);
    for (const required of ['id','grade','subject','semester','topic','knowledge_points']) {
      assert.ok(cols.includes(required), `curriculum should contain column ${required}`);
    }
    const insert = db.prepare(`INSERT INTO curriculum(grade,subject,semester,topic,knowledge_points) VALUES(?,?,?,?,?)`);
    insert.run(1,'math','upper','测试','[]');
    assert.throws(() => insert.run(1,'math','upper','测试','[]'), /UNIQUE/i, 'duplicate (grade,subject,topic) should fail');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('initSchema is idempotent (running twice does not throw or duplicate)', () => {
  const { db, file } = tmpDb();
  try {
    initSchema(db);
    assert.doesNotThrow(() => initSchema(db), 'second init should not throw');
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`).all().map(r => r.name);
    const counts = tables.reduce((acc,n)=>{ acc[n]=(acc[n]||0)+1; return acc; },{});
    for (const [name,count] of Object.entries(counts)) {
      assert.equal(count, 1, `table ${name} should not be duplicated`);
    }
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('initSchema uses bounty cycle uniqueness instead of status uniqueness', () => {
  const { db, file } = tmpDb();
  try {
    initSchema(db);
    const cols = tableInfo(db, 'bounty_tasks').map(c => c.name);
    assert.ok(cols.includes('cycle'), 'bounty_tasks should contain cycle column');
    const sql = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='bounty_tasks'`).get().sql;
    assert.match(sql, /UNIQUE\s*\(user, topic, task_type, cycle\)/i);
    assert.doesNotMatch(sql, /UNIQUE\s*\(user, topic, task_type, status\)/i);
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('initSchema preserves existing wrong_questions data when adding lv column', () => {
  const { db, file } = tmpDb();
  try {
    db.exec(`CREATE TABLE wrong_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT NOT NULL DEFAULT 'default',
      q TEXT NOT NULL,
      type TEXT,
      options TEXT,
      answer TEXT,
      user_answer TEXT,
      hints TEXT,
      explain_text TEXT,
      topic TEXT,
      source TEXT,
      needs_image INTEGER DEFAULT 0,
      image_desc TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.prepare(`INSERT INTO wrong_questions(user,q,answer) VALUES(?,?,?)`).run('alice','old question','42');
    initSchema(db);
    const row = db.prepare(`SELECT * FROM wrong_questions WHERE user='alice'`).get();
    assert.ok(row, 'old row should be preserved');
    assert.equal(row.q, 'old question');
    assert.equal(row.lv, 2, 'old row should get default lv=2');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('openDb returns a usable better-sqlite3 instance with WAL mode', () => {
  const { openDb } = require('../lib/db');
  const file = path.join(os.tmpdir(), `homework-test-open-${process.pid}-${Date.now()}.db`);
  try {
    const db = openDb(file);
    const journalMode = db.pragma('journal_mode', { simple: true });
    assert.equal(journalMode, 'wal', 'journal_mode should be WAL');
    db.close();
  } finally {
    if (fs.existsSync(file)) fs.unlinkSync(file);
    if (fs.existsSync(file + '-shm')) fs.unlinkSync(file + '-shm');
    if (fs.existsSync(file + '-wal')) fs.unlinkSync(file + '-wal');
  }
});
