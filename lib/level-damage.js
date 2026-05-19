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

module.exports = {
  progressiveCounterDamage,
  PROGRESSIVE_MISS_MULTIPLIERS,
};
