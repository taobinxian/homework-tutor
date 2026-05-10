#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

function loadCurriculum() {
  const fs = require('node:fs');
  // 兼容：迁移期 curriculum.js 在 repo 根；迁移后归档到 legacy/
  const candidates = [
    path.join(__dirname, '..', 'curriculum.js'),
    path.join(__dirname, '..', 'legacy', 'curriculum.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      require(c);
      return {
        map: globalThis.QB_CURRICULUM_MAP || {},
        overrides: globalThis.QB_CURRICULUM_OVERRIDES || [],
      };
    }
  }
  throw new Error('找不到 curriculum.js (尝试: ' + candidates.join(', ') + ')');
}

function main() {
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  initSchema(db);

  const { map, overrides } = loadCurriculum();
  const upsert = db.prepare(`
    INSERT INTO curriculum(grade, subject, semester, topic, knowledge_points)
    VALUES(?, ?, ?, ?, ?)
    ON CONFLICT(grade, subject, topic) DO UPDATE SET
      semester=excluded.semester,
      knowledge_points=excluded.knowledge_points
  `);

  let n = 0;
  const tx = db.transaction(() => {
    // 1) 主映射 QB_CURRICULUM_MAP
    for (const gradeStr of Object.keys(map)) {
      const grade = Number(gradeStr);
      const gradeMap = map[gradeStr] || {};
      for (const subject of Object.keys(gradeMap)) {
        const topics = gradeMap[subject] || {};
        for (const rawTopic of Object.keys(topics)) {
          const meta = topics[rawTopic] || {};
          const semester = meta.semester || 'unknown';
          const canonicalTopic = meta.topic || rawTopic;
          const kp = Array.isArray(meta.knowledgePoints) ? meta.knowledgePoints : [canonicalTopic];
          upsert.run(grade, subject, semester, canonicalTopic, JSON.stringify(kp));
          n++;
          if (rawTopic !== canonicalTopic) {
            upsert.run(grade, subject, semester, rawTopic, JSON.stringify(kp));
            n++;
          }
        }
      }
    }
    // 2) QB_CURRICULUM_OVERRIDES 中带 meta 的也要登记（题目按文本匹配后会落到这些 topic 上）
    for (const rule of overrides) {
      const meta = typeof rule.meta === 'function' ? null : rule.meta;
      if (!meta || !rule.grade || !rule.subject) continue;
      const canonicalTopic = meta.topic;
      if (!canonicalTopic) continue;
      const semester = meta.semester || 'unknown';
      const kp = Array.isArray(meta.knowledgePoints) ? meta.knowledgePoints : [canonicalTopic];
      upsert.run(rule.grade, rule.subject, semester, canonicalTopic, JSON.stringify(kp));
      n++;
    }
  });
  tx();

  const total = db.prepare('SELECT COUNT(*) AS c FROM curriculum').get().c;
  console.log(`▸ db:seed:curriculum 写入/更新 ${n} 行；表内总行数 ${total}`);
  db.close();
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('✗ ' + e.message); console.error(e.stack); process.exit(1); }
}

module.exports = { main };
