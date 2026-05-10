#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

const SKIP_NAMES = new Set(['_template.js', 'index.js']);

function listGeneratorFiles(genDir) {
  if (!fs.existsSync(genDir)) return [];
  return fs.readdirSync(genDir, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.endsWith('.js') && !SKIP_NAMES.has(d.name) && !d.name.startsWith('_'))
    .map(d => d.name);
}

function loadAll(genDir) {
  const files = listGeneratorFiles(genDir);
  const loaded = [];
  for (const file of files) {
    const full = path.join(genDir, file);
    delete require.cache[require.resolve(full)];
    let mod;
    try { mod = require(full); }
    catch (e) {
      throw new Error(`生成器加载失败 ${file}: ${e.message}`);
    }
    const expectedKey = file.replace(/\.js$/, '');
    if (!mod || (!mod.meta && typeof mod.variants !== 'function')) {
      throw new Error(`${file}: 缺少 meta 或 variants`);
    }
    if (mod.meta && mod.meta.key !== expectedKey) {
      throw new Error(`${file}: meta.key='${mod.meta.key}' 必须与文件名 '${expectedKey}' 一致`);
    }
    if (typeof mod.generate !== 'function') throw new Error(`${file}: 缺少 generate 函数`);
    loaded.push({ file, mod, modulePath: path.relative(path.join(__dirname, '..'), full).split(path.sep).join('/') });
  }
  return loaded;
}

function validateMeta(meta, sourceLabel) {
  const required = ['key', 'grade', 'subject', 'semester', 'topic', 'lv'];
  for (const k of required) {
    if (meta[k] === undefined || meta[k] === null || meta[k] === '') {
      throw new Error(`${sourceLabel}: meta.${k} 不能为空`);
    }
  }
  if (![1, 2, 3].includes(meta.lv)) throw new Error(`${sourceLabel}: meta.lv 必须是 1/2/3`);
  if (!['upper', 'lower'].includes(meta.semester)) throw new Error(`${sourceLabel}: meta.semester 必须是 upper/lower`);
}

function expandRecords(db, loaded) {
  const records = [];
  const seen = new Set();
  for (const entry of loaded) {
    const metas = [];
    if (entry.mod.meta) metas.push(entry.mod.meta);
    if (typeof entry.mod.variants === 'function') {
      const generated = entry.mod.variants({ db }) || [];
      for (const meta of generated) metas.push(meta);
    }
    for (const meta of metas) {
      validateMeta(meta, `${entry.file}:${meta && meta.key}`);
      if (seen.has(meta.key)) throw new Error(`重复 generator key: ${meta.key}`);
      seen.add(meta.key);
      records.push({ meta, modulePath: entry.modulePath });
    }
  }
  return records;
}

function main() {
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  initSchema(db);

  const genDir = path.join(__dirname, '..', 'generators');
  const loaded = loadAll(genDir);
  const records = expandRecords(db, loaded);

  const upsert = db.prepare(`
    INSERT INTO generators (key, grade, subject, semester, topic, knowledge_points, lv, module_path, enabled, description)
    VALUES(?,?,?,?,?,?,?,?,1,?)
    ON CONFLICT(key) DO UPDATE SET
      grade=excluded.grade, subject=excluded.subject, semester=excluded.semester,
      topic=excluded.topic, knowledge_points=excluded.knowledge_points, lv=excluded.lv,
      module_path=excluded.module_path, enabled=1, description=excluded.description
  `);

  const presentKeys = new Set();
  const loadedModulePaths = new Set(loaded.map(x => x.modulePath));
  const tx = db.transaction(() => {
    for (const { meta: m, modulePath } of records) {
      upsert.run(
        m.key, m.grade, m.subject, m.semester, m.topic,
        JSON.stringify(m.knowledgePoints || [m.topic]),
        m.lv, modulePath, m.description || ''
      );
      presentKeys.add(m.key);
    }
    // 磁盘上不存在的 key 置 enabled=0
    const allRows = db.prepare(`SELECT key, module_path FROM generators`).all();
    const disable = db.prepare(`UPDATE generators SET enabled=0 WHERE key=?`);
    for (const r of allRows) {
      if (!presentKeys.has(r.key)) {
        const fullPath = path.join(__dirname, '..', r.module_path);
        if (!fs.existsSync(fullPath) || loadedModulePaths.has(r.module_path)) disable.run(r.key);
      }
    }
  });
  tx();

  const enabledCount = db.prepare(`SELECT COUNT(*) AS c FROM generators WHERE enabled=1`).get().c;
  const disabledCount = db.prepare(`SELECT COUNT(*) AS c FROM generators WHERE enabled=0`).get().c;
  console.log(`▸ db:seed:generators 注册 ${records.length} 个生成器；表内 enabled=${enabledCount} disabled=${disabledCount}`);
  db.close();
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('✗ ' + e.message); console.error(e.stack); process.exit(1); }
}

module.exports = { main, listGeneratorFiles, loadAll, expandRecords, validateMeta };
