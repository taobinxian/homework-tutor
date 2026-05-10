'use strict';

const path = require('node:path');
const Database = require('better-sqlite3');

const DEFAULT_DB_FILE = path.join(__dirname, '..', 'wrongbook.db');

function openDb(dbPath = DEFAULT_DB_FILE) {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

function ensureColumn(db, table, name, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(name)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`);
  }
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wrong_questions (
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
    );
    CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_questions(user);
  `);

  ensureColumn(db, 'wrong_questions', 'grade', 'INTEGER');
  ensureColumn(db, 'wrong_questions', 'subject', 'TEXT');
  ensureColumn(db, 'wrong_questions', 'semester', 'TEXT');
  ensureColumn(db, 'wrong_questions', 'knowledge_points', 'TEXT');
  ensureColumn(db, 'wrong_questions', 'lv', 'INTEGER DEFAULT 2');

  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content_hash TEXT UNIQUE NOT NULL,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      topic TEXT NOT NULL,
      knowledge_points TEXT NOT NULL,
      lv INTEGER NOT NULL,
      q_type TEXT NOT NULL,
      q TEXT NOT NULL,
      options TEXT,
      answer TEXT NOT NULL,
      hints TEXT,
      explain_text TEXT,
      source TEXT NOT NULL DEFAULT 'seed',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_q_filter ON questions(grade, subject, semester, lv, enabled);
    CREATE INDEX IF NOT EXISTS idx_q_topic  ON questions(grade, subject, topic, enabled);

    CREATE TABLE IF NOT EXISTS generators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      topic TEXT NOT NULL,
      knowledge_points TEXT NOT NULL,
      lv INTEGER NOT NULL,
      module_path TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      description TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_gen_filter ON generators(grade, subject, semester, lv, enabled);

    CREATE TABLE IF NOT EXISTS curriculum (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      topic TEXT NOT NULL,
      knowledge_points TEXT NOT NULL,
      UNIQUE(grade, subject, topic)
    );
  `);
}

let _shared = null;
function getDb() {
  if (!_shared) {
    _shared = openDb();
    initSchema(_shared);
  }
  return _shared;
}

module.exports = {
  DEFAULT_DB_FILE,
  openDb,
  ensureColumn,
  initSchema,
  getDb,
};
