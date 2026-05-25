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

  ensureColumn(db, 'knowledge_mastery', 'score', 'INTEGER DEFAULT 0');
  ensureColumn(db, 'knowledge_mastery', 'status', "TEXT DEFAULT 'not_started'");

  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      event_name TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_analytics_user_event ON analytics_events(user, event_name, created_at);

    CREATE TABLE IF NOT EXISTS wrong_monsters (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      topic TEXT NOT NULL,
      knowledge_points_json TEXT NOT NULL DEFAULT '[]',
      monster_type TEXT NOT NULL DEFAULT 'normal',
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'discovered',
      wrong_count INTEGER NOT NULL DEFAULT 0,
      purified_count INTEGER NOT NULL DEFAULT 0,
      last_seen_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user, topic)
    );
    CREATE INDEX IF NOT EXISTS idx_wrong_monsters_user_status ON wrong_monsters(user, status, updated_at);

    CREATE TABLE IF NOT EXISTS bounty_tasks (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      source TEXT NOT NULL DEFAULT 'system',
      topic TEXT NOT NULL,
      monster_id TEXT,
      task_type TEXT NOT NULL DEFAULT 'review',
      difficulty TEXT NOT NULL DEFAULT 'normal',
      target_json TEXT NOT NULL DEFAULT '{}',
      progress_json TEXT NOT NULL DEFAULT '{}',
      reward_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      claimed_at DATETIME,
      UNIQUE(user, topic, task_type, status)
    );
    CREATE INDEX IF NOT EXISTS idx_bounty_user_status ON bounty_tasks(user, status, created_at);

    CREATE TABLE IF NOT EXISTS player_inventory (
      user TEXT NOT NULL DEFAULT 'default',
      item_type TEXT NOT NULL,
      item_id TEXT NOT NULL,
      name TEXT NOT NULL,
      qty INTEGER NOT NULL DEFAULT 1,
      meta_json TEXT NOT NULL DEFAULT '{}',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user, item_type, item_id)
    );

    CREATE TABLE IF NOT EXISTS player_loadout (
      user TEXT NOT NULL DEFAULT 'default',
      slot TEXT NOT NULL,
      item_id TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY(user, slot)
    );

    CREATE TABLE IF NOT EXISTS knowledge_base_items (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      topic TEXT NOT NULL,
      item_type TEXT NOT NULL DEFAULT 'building',
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'placed',
      meta_json TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user, topic, item_type)
    );

    CREATE TABLE IF NOT EXISTS battle_highlights (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      run_id TEXT,
      level_id TEXT,
      highlight_type TEXT NOT NULL,
      title TEXT NOT NULL,
      payload_json TEXT NOT NULL DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_highlights_run ON battle_highlights(run_id, created_at);

    CREATE TABLE IF NOT EXISTS map_events (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      level_id TEXT,
      event_type TEXT NOT NULL,
      config_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      UNIQUE(user, level_id, event_type)
    );
    CREATE INDEX IF NOT EXISTS idx_map_events_user_status ON map_events(user, status, created_at);

    CREATE TABLE IF NOT EXISTS praise_cards (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      topic TEXT,
      message TEXT NOT NULL,
      reward_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'created',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      claimed_at DATETIME
    );
    CREATE INDEX IF NOT EXISTS idx_praise_user_status ON praise_cards(user, status, created_at);

    CREATE TABLE IF NOT EXISTS parent_boss_questions (
      id TEXT PRIMARY KEY,
      user TEXT NOT NULL DEFAULT 'default',
      topic TEXT NOT NULL DEFAULT '家长挑战',
      q TEXT NOT NULL,
      options_json TEXT NOT NULL DEFAULT '[]',
      answer TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    );
    CREATE INDEX IF NOT EXISTS idx_parent_boss_user_status ON parent_boss_questions(user, status, created_at);
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
