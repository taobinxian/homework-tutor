'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createInitialState,
  recordCorrect,
  recordWrong,
  recordLevelComplete,
  computeStarRating,
  computeRewards,
  awardDaily,
} = require('../lib/state-recorder.js');

test('createInitialState — 默认结构完整', () => {
  const s = createInitialState();
  assert.equal(s.exp, 0);
  assert.equal(s.gold, 0);
  assert.equal(s.gems, 0);
  assert.equal(s.petStage, 0);
  assert.deepEqual(s.stats, { correct: 0, wrong: 0, levelsCleared: 0, battles: 0, perfectClears: 0 });
  assert.deepEqual(s.clearedLevels, {});
  assert.deepEqual(s.achievements, []);
  assert.equal(typeof s.lastLogin, 'string');
  assert.equal(s.streak, 0);
});

test('recordCorrect — 同步更新 exp 和 stats.correct', () => {
  const s = createInitialState();
  recordCorrect(s, { exp: 5 });
  assert.equal(s.exp, 5);
  assert.equal(s.stats.correct, 1);
  recordCorrect(s, { exp: 5 });
  assert.equal(s.exp, 10);
  assert.equal(s.stats.correct, 2);
});

test('recordWrong — 只累加 stats.wrong，不改 exp', () => {
  const s = createInitialState();
  recordWrong(s);
  assert.equal(s.stats.wrong, 1);
  assert.equal(s.exp, 0);
});

test('recordLevelComplete — 更新 levelsCleared/battles/perfectClears', () => {
  const s = createInitialState();
  recordLevelComplete(s, {
    grade: 1, subject: 'math', lv: 1, engine: 'battle',
    result: 'win', correct: 5, wrong: 0,
  });
  assert.equal(s.stats.battles, 1);
  assert.equal(s.stats.levelsCleared, 1);
  assert.equal(s.stats.perfectClears, 1);
  // 关卡 key 形如 g1.math.lv1
  assert.deepEqual(Object.keys(s.clearedLevels), ['g1.math.lv1']);
  const rec = s.clearedLevels['g1.math.lv1'];
  assert.equal(rec.bestStars, 3);
  assert.equal(rec.times, 1);
});

test('recordLevelComplete — 失败不算 levelsCleared', () => {
  const s = createInitialState();
  recordLevelComplete(s, {
    grade: 1, subject: 'math', lv: 1, engine: 'battle',
    result: 'fail', correct: 1, wrong: 4,
  });
  assert.equal(s.stats.battles, 1);
  assert.equal(s.stats.levelsCleared, 0);
  assert.equal(s.stats.perfectClears, 0);
});

test('recordLevelComplete — 重复通关取最高星', () => {
  const s = createInitialState();
  recordLevelComplete(s, { grade: 1, subject: 'math', lv: 1, engine: 'battle', result: 'win', correct: 3, wrong: 2 });
  const r1 = s.clearedLevels['g1.math.lv1'];
  assert.ok(r1.bestStars >= 1);
  const stars1 = r1.bestStars;
  recordLevelComplete(s, { grade: 1, subject: 'math', lv: 1, engine: 'battle', result: 'win', correct: 5, wrong: 0 });
  const r2 = s.clearedLevels['g1.math.lv1'];
  assert.equal(r2.bestStars, 3);
  assert.ok(r2.bestStars >= stars1);
  assert.equal(r2.times, 2);
});

test('computeStarRating — 全对3星 / >80% 2星 / 否则1星 / fail 0星', () => {
  assert.equal(computeStarRating({ result: 'win', correct: 5, wrong: 0 }), 3);
  assert.equal(computeStarRating({ result: 'win', correct: 4, wrong: 1 }), 2);
  assert.equal(computeStarRating({ result: 'win', correct: 3, wrong: 2 }), 1);
  assert.equal(computeStarRating({ result: 'complete', correct: 5, wrong: 0 }), 3);
  assert.equal(computeStarRating({ result: 'fail', correct: 0, wrong: 5 }), 0);
});

test('computeRewards — 星数决定 exp/gold/gems', () => {
  const r3 = computeRewards({ stars: 3, correct: 5, wrong: 0 });
  assert.ok(r3.exp >= 25);
  assert.ok(r3.gold >= 10);
  assert.ok(r3.gems >= 1);

  const r1 = computeRewards({ stars: 1, correct: 3, wrong: 2 });
  assert.ok(r1.exp >= r1.exp);
  assert.ok(r1.gold > 0);
  assert.equal(r1.gems, 0);

  const r0 = computeRewards({ stars: 0, correct: 0, wrong: 5 });
  assert.equal(r0.gold, 0);
  assert.equal(r0.gems, 0);
});

test('awardDaily — 同一天不重复奖励，新一天+连续登录天数', () => {
  const s = createInitialState();
  s.lastLogin = '2026-05-09';
  s.streak = 1;
  // 第二天
  const r = awardDaily(s, { today: '2026-05-10' });
  assert.equal(s.streak, 2);
  assert.equal(s.lastLogin, '2026-05-10');
  assert.ok(r.gold > 0);
  // 同天再调不重复
  const r2 = awardDaily(s, { today: '2026-05-10' });
  assert.equal(r2, null);
  assert.equal(s.streak, 2);
});

test('awardDaily — 中断重置 streak', () => {
  const s = createInitialState();
  s.lastLogin = '2026-05-01';
  s.streak = 5;
  awardDaily(s, { today: '2026-05-10' });  // 跳过 9 天
  assert.equal(s.streak, 1);
});
