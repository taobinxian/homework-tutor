#!/usr/bin/env node
'use strict';

const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

const LEVELS = [
  {
    id: 'g1-math-upper-1-1', chapterId: 'g1-math-upper-ch01', order: 1,
    title: '1-1 数字工厂', topic: '0的认识', levelType: 'normal', difficulty: 1, questionCount: 15, icon: '0️⃣',
    config: { engine: 'knowledge-shooter', theme: 'mechanical-factory', waves: 3, supply: { opening: 5, mid: 5, boss: 0 }, boss: null },
    reward: { exp: 20, gold: 10, materials: ['math-core-small'] },
    unlock: { requiredLevelIds: [], requiredStars: 0 },
  },
  {
    id: 'g1-math-upper-1-2', chapterId: 'g1-math-upper-ch01', order: 2,
    title: '1-2 加法能量站', topic: '5以内加法', levelType: 'normal', difficulty: 1, questionCount: 15, icon: '➕',
    config: { engine: 'knowledge-shooter', theme: 'mechanical-factory', waves: 3, supply: { opening: 5, mid: 5, boss: 0 }, boss: null },
    reward: { exp: 24, gold: 12, materials: ['math-core-small'] },
    unlock: { requiredLevelIds: ['g1-math-upper-1-1'], requiredStars: 1 },
  },
  {
    id: 'g1-math-upper-1-3-boss', chapterId: 'g1-math-upper-ch01', order: 3,
    title: '1-3 Boss：混乱计算兽', topic: '5以内加法', levelType: 'boss', difficulty: 1, questionCount: 10, icon: '👾',
    config: {
      engine: 'knowledge-shooter', theme: 'mechanical-factory', waves: 2,
      supply: { opening: 5, mid: 2, boss: 2 },
      boss: { id: 'boss-math-chaos-calculator', name: '混乱计算兽', hp: 120, knowledgeShield: { hp: 30, questionCount: 2 } },
    },
    reward: { exp: 45, gold: 22, materials: ['math-core-small', 'mechanical-star-badge'] },
    unlock: { requiredLevelIds: ['g1-math-upper-1-2'], requiredStars: 1 },
  },
];

function seedCampaigns(db) {
  initSchema(db);
  const stmt = db.prepare(`INSERT INTO campaign_levels
    (id, chapter_id, grade, subject, semester, topic, title, level_type, difficulty, question_count, order_no, config_json, reward_json, unlock_json, enabled, updated_at)
    VALUES (@id, @chapterId, 1, 'math', 'upper', @topic, @title, @levelType, @difficulty, @questionCount, @order, @configJson, @rewardJson, @unlockJson, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      chapter_id=excluded.chapter_id,
      topic=excluded.topic,
      title=excluded.title,
      level_type=excluded.level_type,
      difficulty=excluded.difficulty,
      question_count=excluded.question_count,
      order_no=excluded.order_no,
      config_json=excluded.config_json,
      reward_json=excluded.reward_json,
      unlock_json=excluded.unlock_json,
      enabled=1,
      updated_at=CURRENT_TIMESTAMP`);
  const tx = db.transaction(() => {
    for (const l of LEVELS) stmt.run({ ...l, configJson: JSON.stringify({ ...l.config, icon: l.icon }), rewardJson: JSON.stringify(l.reward), unlockJson: JSON.stringify(l.unlock) });
    db.prepare(`UPDATE campaign_levels SET enabled=0 WHERE grade=1 AND subject='math' AND semester='upper' AND chapter_id='g1-math-upper-ch01' AND id NOT IN (${LEVELS.map(() => '?').join(',')})`).run(...LEVELS.map(l => l.id));
  });
  tx();
  return LEVELS.length;
}

if (require.main === module) {
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  try {
    const n = seedCampaigns(db);
    console.log(`✅ campaign seed complete: ${n} levels -> ${dbPath}`);
  } finally {
    db.close();
  }
}

module.exports = { LEVELS, seedCampaigns };
