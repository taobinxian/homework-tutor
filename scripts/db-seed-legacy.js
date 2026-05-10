#!/usr/bin/env node
'use strict';

const path = require('node:path');
const crypto = require('node:crypto');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

function makeRng(seedStr) {
  // mulberry32 — 32-bit deterministic PRNG; for idempotent test runs
  let s = 0;
  for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) | 0;
  s = s >>> 0;
  return function() {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function setupGlobals() {
  const seed = process.env.HOMEWORK_LEGACY_SEED;
  if (seed) {
    // 替换 Math.random — questions.js 在 IIFE 里捕获 Math.random，必须 patch 这一层
    const rng = makeRng(seed);
    Math.random = rng;
  }
}

function loadLegacyBank() {
  const fs = require('node:fs');
  const baseRoot = path.join(__dirname, '..');
  const baseLegacy = path.join(__dirname, '..', 'legacy');

  function resolveLegacy(file) {
    const c1 = path.join(baseRoot, file);
    const c2 = path.join(baseLegacy, file);
    if (fs.existsSync(c1)) return c1;
    if (fs.existsSync(c2)) return c2;
    throw new Error(`找不到 ${file}（尝试 ${c1}, ${c2}）`);
  }

  // questions.js 必须先加载（创建 QB / finalizeQuestionBank 等全局）
  require(resolveLegacy('questions.js'));
  require(resolveLegacy('curriculum.js'));
  for (let g = 1; g <= 6; g++) {
    require(resolveLegacy(`grade${g}.js`));
  }
  if (typeof globalThis.finalizeQuestionBank === 'function') {
    globalThis.finalizeQuestionBank();
  }
  return {
    QB: globalThis.QB || {},
    report: globalThis.QB_ANNOTATION_REPORT || { total: 0, mapped: 0, unmapped: 0 },
  };
}

function contentHash(grade, subject, q, answer) {
  return crypto.createHash('sha1').update(`${grade}|${subject}|${q}|${answer}`).digest('hex');
}

function main() {
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  initSchema(db);

  setupGlobals();
  const { QB, report } = loadLegacyBank();

  const upsert = db.prepare(`
    INSERT INTO questions
      (content_hash, grade, subject, semester, topic, knowledge_points, lv, q_type, q, options, answer, hints, explain_text, source, enabled, updated_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'seed', 1, CURRENT_TIMESTAMP)
    ON CONFLICT(content_hash) DO UPDATE SET
      grade=excluded.grade,
      subject=excluded.subject,
      semester=excluded.semester,
      topic=excluded.topic,
      knowledge_points=excluded.knowledge_points,
      lv=excluded.lv,
      q_type=excluded.q_type,
      options=excluded.options,
      answer=excluded.answer,
      hints=excluded.hints,
      explain_text=excluded.explain_text,
      enabled=1,
      updated_at=CURRENT_TIMESTAMP
  `);

  let inserted = 0;
  let skipped = 0;
  const tx = db.transaction(() => {
    for (const gradeKey of Object.keys(QB)) {
      const grade = Number(gradeKey);
      const subjects = QB[gradeKey] || {};
      for (const subject of Object.keys(subjects)) {
        const list = subjects[subject] || [];
        for (const q of list) {
          if (!q || !q.q || q.answer === undefined || q.answer === null) {
            skipped++;
            continue;
          }
          const semester = (q.semester === 'upper' || q.semester === 'lower') ? q.semester : 'unknown';
          const topic = q.topic || '未标注';
          const kp = Array.isArray(q.knowledgePoints) && q.knowledgePoints.length ? q.knowledgePoints : [topic];
          const lv = (q.lv === 1 || q.lv === 2 || q.lv === 3) ? q.lv : 2;
          const qType = q.type === 'input' ? 'input' : 'choice';
          const options = Array.isArray(q.options) ? JSON.stringify(q.options) : null;
          const hints = Array.isArray(q.hints) ? JSON.stringify(q.hints) : null;
          const hash = contentHash(grade, subject, q.q, String(q.answer));
          upsert.run(
            hash, grade, subject, semester, topic, JSON.stringify(kp), lv,
            qType, q.q, options, String(q.answer), hints, q.explain || ''
          );
          inserted++;
        }
      }
    }
  });
  tx();

  const total = db.prepare('SELECT COUNT(*) AS c FROM questions').get().c;
  console.log(`▸ db:seed:legacy 处理 ${inserted} 题（跳过 ${skipped}）；表内总数 ${total}；finalize 报告 total=${report.total} mapped=${report.mapped} unmapped=${report.unmapped}`);
  db.close();
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('✗ ' + e.message); console.error(e.stack); process.exit(1); }
}

module.exports = { main, contentHash };
