#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function moduleKeys(mod, db) {
  const keys = new Set();
  if (mod && mod.meta && mod.meta.key) keys.add(mod.meta.key);
  if (mod && typeof mod.variants === 'function') {
    const variants = mod.variants({ db }) || [];
    for (const v of variants) {
      if (v && v.key) keys.add(v.key);
    }
  }
  return keys;
}

function validate(db) {
  const errors = [];
  const warnings = [];

  // 1. content_hash uniqueness（DB UNIQUE 已强制；double-check）
  const dups = db.prepare(`SELECT content_hash, COUNT(*) c FROM questions GROUP BY content_hash HAVING c > 1`).all();
  if (dups.length) errors.push(`存在 ${dups.length} 个重复 content_hash`);

  // 2. q / answer 非空
  const emptyQ = db.prepare(`SELECT id FROM questions WHERE q IS NULL OR length(q)=0`).all();
  if (emptyQ.length) errors.push(`存在 ${emptyQ.length} 题 q 为空`);
  const emptyA = db.prepare(`SELECT id FROM questions WHERE answer IS NULL OR length(answer)=0`).all();
  if (emptyA.length) errors.push(`存在 ${emptyA.length} 题 answer 为空`);

  // 3. choice 类 options 至少 2 项 & answer 在 options 内
  const choices = db.prepare(`SELECT id, q, options, answer FROM questions WHERE q_type='choice' AND enabled=1`).all();
  for (const r of choices) {
    const opts = safeJSON(r.options, []);
    if (!Array.isArray(opts) || opts.length < 2) {
      errors.push(`#${r.id} choice 题 options 不合规: ${r.options}`);
      continue;
    }
    if (!opts.map(String).includes(String(r.answer))) {
      errors.push(`#${r.id} answer "${r.answer}" 不在 options 中: ${r.q}`);
    }
  }

  // 4. topic 在 curriculum 表（除非 source IN ('photo','manual')）
  const curRows = db.prepare(`SELECT grade, subject, topic FROM curriculum`).all();
  const curSet = new Set(curRows.map(r => `${r.grade}|${r.subject}|${r.topic}`));
  const seedQs = db.prepare(`SELECT id, grade, subject, topic FROM questions WHERE source NOT IN ('photo','manual') AND enabled=1`).all();
  let unknownTopicCount = 0;
  const unknownExamples = [];
  for (const r of seedQs) {
    const key = `${r.grade}|${r.subject}|${r.topic}`;
    if (!curSet.has(key)) {
      unknownTopicCount++;
      if (unknownExamples.length < 5) unknownExamples.push(`#${r.id} grade=${r.grade} ${r.subject}/${r.topic}`);
    }
  }
  if (unknownTopicCount > 0) {
    errors.push(`存在 ${unknownTopicCount} 题 topic 不在 curriculum 表 (例: ${unknownExamples.join('; ')})`);
  }

  // 5. generators 模块文件存在 + key 可由 meta 或 variants 提供 + 有 generate 函数
  const gens = db.prepare(`SELECT key, module_path FROM generators WHERE enabled=1`).all();
  const moduleCache = new Map();
  for (const g of gens) {
    const fullPath = path.isAbsolute(g.module_path)
      ? g.module_path
      : path.join(__dirname, '..', g.module_path);
    if (!fs.existsSync(fullPath)) {
      errors.push(`generator '${g.key}' 文件缺失: ${g.module_path}`);
      continue;
    }
    try {
      let modInfo = moduleCache.get(fullPath);
      if (!modInfo) {
        delete require.cache[require.resolve(fullPath)];
        const mod = require(fullPath);
        modInfo = { mod, keys: moduleKeys(mod, db) };
        moduleCache.set(fullPath, modInfo);
      }
      if (!modInfo.keys.has(g.key)) {
        errors.push(`generator '${g.key}' 不在模块 meta/variants 中: ${g.module_path}`);
      }
      if (typeof modInfo.mod.generate !== 'function') {
        errors.push(`generator '${g.key}' 缺少 generate 函数`);
      }
    } catch (e) {
      errors.push(`generator '${g.key}' 加载失败: ${e.message}`);
    }
  }

  return { errors, warnings };
}

function main() {
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  initSchema(db);

  const totalQ = db.prepare(`SELECT COUNT(*) AS c FROM questions WHERE enabled=1`).get().c;
  const totalG = db.prepare(`SELECT COUNT(*) AS c FROM generators WHERE enabled=1`).get().c;
  const totalC = db.prepare(`SELECT COUNT(*) AS c FROM curriculum`).get().c;

  console.log('━━━ validate:bank ━━━');
  console.log(`▸ DB: ${dbPath}`);
  console.log(`▸ questions(enabled): ${totalQ}`);
  console.log(`▸ generators(enabled): ${totalG}`);
  console.log(`▸ curriculum: ${totalC}`);

  const { errors, warnings } = validate(db);
  db.close();

  if (warnings.length) {
    console.log(`⚠ ${warnings.length} 个警告:`);
    for (const w of warnings.slice(0, 10)) console.log('  · ' + w);
    if (warnings.length > 10) console.log(`  ...（共 ${warnings.length} 条）`);
  }
  if (errors.length) {
    console.error(`✗ ${errors.length} 个错误:`);
    for (const e of errors) console.error('  · ' + e);
    process.exit(1);
  }
  console.log('✅ 题库校验通过');
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('✗ ' + e.message); console.error(e.stack); process.exit(1); }
}

module.exports = { validate, main, moduleKeys };
