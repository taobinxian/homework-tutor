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

    CREATE TABLE IF NOT EXISTS campaign_levels (
      id TEXT PRIMARY KEY,
      chapter_id TEXT NOT NULL,
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      level_type TEXT NOT NULL,
      difficulty INTEGER NOT NULL DEFAULT 1,
      question_count INTEGER NOT NULL DEFAULT 8,
      order_no INTEGER NOT NULL DEFAULT 0,
      config_json TEXT NOT NULL DEFAULT '{}',
      reward_json TEXT NOT NULL DEFAULT '{}',
      unlock_json TEXT NOT NULL DEFAULT '{}',
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_campaign_filter ON campaign_levels(grade, subject, semester, enabled, order_no);

    CREATE TABLE IF NOT EXISTS level_progress (
      user TEXT NOT NULL DEFAULT 'default',
      level_id TEXT NOT NULL,
      best_stars INTEGER NOT NULL DEFAULT 0,
      best_accuracy REAL NOT NULL DEFAULT 0,
      clear_times INTEGER NOT NULL DEFAULT 0,
      last_result TEXT,
      last_played_at DATETIME,
      PRIMARY KEY(user, level_id)
    );

    CREATE TABLE IF NOT EXISTS level_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT UNIQUE,
      user TEXT NOT NULL DEFAULT 'default',
      level_id TEXT NOT NULL,
      result TEXT NOT NULL DEFAULT 'started',
      stars INTEGER NOT NULL DEFAULT 0,
      correct_count INTEGER NOT NULL DEFAULT 0,
      wrong_count INTEGER NOT NULL DEFAULT 0,
      duration_sec INTEGER NOT NULL DEFAULT 0,
      resources_json TEXT NOT NULL DEFAULT '{}',
      combat_stats_json TEXT NOT NULL DEFAULT '{}',
      wrong_questions_json TEXT NOT NULL DEFAULT '[]',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      finished_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_level_runs_user_date ON level_runs(user, created_at);

    CREATE TABLE IF NOT EXISTS level_run_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT NOT NULL,
      level_id TEXT NOT NULL,
      user TEXT NOT NULL DEFAULT 'default',
      question_id TEXT,
      question_text TEXT NOT NULL,
      topic TEXT,
      knowledge_points_json TEXT NOT NULL DEFAULT '[]',
      correct_answer TEXT,
      user_answer TEXT,
      is_correct INTEGER NOT NULL DEFAULT 0,
      phase TEXT NOT NULL DEFAULT 'supply',
      duration_ms INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_level_run_answers_run ON level_run_answers(run_id);
    CREATE INDEX IF NOT EXISTS idx_level_run_answers_user_topic ON level_run_answers(user, topic);

    CREATE TABLE IF NOT EXISTS knowledge_mastery (
      user TEXT NOT NULL DEFAULT 'default',
      grade INTEGER NOT NULL,
      subject TEXT NOT NULL,
      semester TEXT NOT NULL,
      topic TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct INTEGER NOT NULL DEFAULT 0,
      wrong INTEGER NOT NULL DEFAULT 0,
      mastery REAL NOT NULL DEFAULT 0,
      last_practiced_at DATETIME,
      PRIMARY KEY(user, grade, subject, semester, topic)
    );
    CREATE INDEX IF NOT EXISTS idx_mastery_user ON knowledge_mastery(user, grade, subject, semester);
  `);

  ensureColumn(db, 'level_runs', 'run_id', 'TEXT');
  ensureColumn(db, 'level_runs', 'started_at', 'DATETIME');
  ensureColumn(db, 'level_runs', 'finished_at', 'DATETIME');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_level_runs_run_id_unique ON level_runs(run_id) WHERE run_id IS NOT NULL');
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
