'use strict';

// 错答惩罚递进：越多次答错越疼，前期给小学生容错空间。
// 第 1 次 ~34% baseDmg、第 2 次 ~67%、第 3 次起 100%。
// 引擎调用：`progressiveCounterDamage(this.stats.wrong, baseDmg)` —
//   base.js run() 在调 onAnswer 前已 ++ stats.wrong，所以传入值即"含本次"。
// 前端镜像位于 static/app/engines/base.js 中（保持两份同步）。

const PROGRESSIVE_MISS_MULTIPLIERS = Object.freeze([0.34, 0.67, 1]);

function progressiveCounterDamage(missCount, baseDmg) {
  const n = Number.isFinite(missCount) ? Math.floor(missCount) : 1;
  const idx = Math.min(Math.max(n - 1, 0), PROGRESSIVE_MISS_MULTIPLIERS.length - 1);
  const m = PROGRESSIVE_MISS_MULTIPLIERS[idx];
  const bd = Number.isFinite(baseDmg) ? baseDmg : 0;
  return Math.max(1, Math.round(bd * m));
}

function hpBarPercent(currentHp, maxHp) {
  const max = Number.isFinite(maxHp) && maxHp > 0 ? maxHp : 100;
  const hp = Number.isFinite(currentHp) ? currentHp : 0;
  const pct = (Math.min(Math.max(hp, 0), max) / max) * 100;
  return Math.round(pct);
}

function reviveHp(maxHp, ratio = 0.5) {
  const max = Number.isFinite(maxHp) && maxHp > 0 ? maxHp : 100;
  const r = Number.isFinite(ratio) && ratio > 0 ? ratio : 0.5;
  return Math.max(1, Math.round(max * Math.min(r, 1)));
}

module.exports = {
  progressiveCounterDamage,
  PROGRESSIVE_MISS_MULTIPLIERS,
  hpBarPercent,
  reviveHp,
};
