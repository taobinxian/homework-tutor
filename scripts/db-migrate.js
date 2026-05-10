#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

function main() {
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  console.log('▸ DB 路径: ' + dbPath);

  const db = openDb(dbPath);
  initSchema(db);

  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all().map(r => r.name);
  const indexes = db.prepare(`SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name`).all().map(r => r.name);

  console.log('▸ 表: ' + tables.join(', '));
  console.log('▸ 索引: ' + indexes.join(', '));

  for (const t of tables) {
    const count = db.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;
    console.log(`  · ${t}: ${count} 行`);
  }

  db.close();
  console.log('✅ db:migrate 完成（幂等）');
}

if (require.main === module) {
  try {
    main();
  } catch (e) {
    console.error('✗ db:migrate 失败: ' + e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

module.exports = { main };
