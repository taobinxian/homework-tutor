'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  progressiveCounterDamage,
  PROGRESSIVE_MISS_MULTIPLIERS,
  hpBarPercent,
  reviveHp,
} = require('../lib/level-damage.js');

test('progressiveCounterDamage — 第 1/2/3 次错答按 ~34%/67%/100% 缩放', () => {
  assert.equal(progressiveCounterDamage(1, 15), 5);   // round(5.1)
  assert.equal(progressiveCounterDamage(2, 15), 10);  // round(10.05)
  assert.equal(progressiveCounterDamage(3, 15), 15);
});

test('progressiveCounterDamage — 第 4+ 次保持满伤害', () => {
  assert.equal(progressiveCounterDamage(4, 15), 15);
  assert.equal(progressiveCounterDamage(10, 15), 15);
  assert.equal(progressiveCounterDamage(99, 8), 8);
});

test('progressiveCounterDamage — 适配 fighting 阶段递增伤害', () => {
  // phase 1: base=8 → 3/5/8
  assert.equal(progressiveCounterDamage(1, 8), 3);    // round(2.72)
  assert.equal(progressiveCounterDamage(2, 8), 5);    // round(5.36)
  assert.equal(progressiveCounterDamage(3, 8), 8);
  // phase 2: base=16 → 5/11/16
  assert.equal(progressiveCounterDamage(1, 16), 5);   // round(5.44)
  assert.equal(progressiveCounterDamage(2, 16), 11);  // round(10.72)
  assert.equal(progressiveCounterDamage(3, 16), 16);
  // phase 3: base=24 → 8/16/24
  assert.equal(progressiveCounterDamage(1, 24), 8);
  assert.equal(progressiveCounterDamage(2, 24), 16);
  assert.equal(progressiveCounterDamage(3, 24), 24);
});

test('progressiveCounterDamage — 至少 1 点伤害（防御性下限）', () => {
  // baseDmg 极小时，0.34 * 1 = 0.34 → round=0 → 应被 clamp 到 1
  assert.equal(progressiveCounterDamage(1, 1), 1);
  assert.equal(progressiveCounterDamage(1, 2), 1);
});

test('progressiveCounterDamage — 防御非法输入', () => {
  // missCount = 0 / 负数 / NaN → 视为第 1 次
  assert.equal(progressiveCounterDamage(0, 15), 5);
  assert.equal(progressiveCounterDamage(-1, 15), 5);
  assert.equal(progressiveCounterDamage(NaN, 15), 5);
  // baseDmg 非有限数 → 视为 0，再 clamp 到 1
  assert.equal(progressiveCounterDamage(1, NaN), 1);
  assert.equal(progressiveCounterDamage(1, undefined), 1);
});

test('progressiveCounterDamage — 浮点 missCount 向下取整', () => {
  assert.equal(progressiveCounterDamage(1.7, 15), 5);  // 仍为第 1 次
  assert.equal(progressiveCounterDamage(2.9, 15), 10); // 仍为第 2 次
});

test('PROGRESSIVE_MISS_MULTIPLIERS — 单调非降', () => {
  for (let i = 1; i < PROGRESSIVE_MISS_MULTIPLIERS.length; i++) {
    assert.ok(PROGRESSIVE_MISS_MULTIPLIERS[i] >= PROGRESSIVE_MISS_MULTIPLIERS[i - 1],
      `index ${i} (${PROGRESSIVE_MISS_MULTIPLIERS[i]}) < index ${i - 1} (${PROGRESSIVE_MISS_MULTIPLIERS[i - 1]})`);
  }
  assert.equal(PROGRESSIVE_MISS_MULTIPLIERS[PROGRESSIVE_MISS_MULTIPLIERS.length - 1], 1);
});

test('hpBarPercent — 血槽百分比使用 actual HP / max HP，而不是把 HP 当百分比', () => {
  assert.equal(hpBarPercent(100, 200), 50);
  assert.equal(hpBarPercent(50, 200), 25);
  assert.equal(hpBarPercent(0, 200), 0);
});

test('hpBarPercent — clamp 到 0..100，非法 maxHP 回退到 100', () => {
  assert.equal(hpBarPercent(125, 100), 100);
  assert.equal(hpBarPercent(-5, 100), 0);
  assert.equal(hpBarPercent(50, 0), 50);
  assert.equal(hpBarPercent(50, undefined), 50);
});

test('reviveHp — 复活血量同样基于 max HP 计算', () => {
  assert.equal(reviveHp(200), 100);
  assert.equal(reviveHp(80), 40);
});
