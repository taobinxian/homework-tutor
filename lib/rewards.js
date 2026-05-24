'use strict';

function clamp01(n) { return Math.max(0, Math.min(1, Number(n) || 0)); }

function computeStars({ result = 'complete', correct = 0, wrong = 0 } = {}) {
  if (result === 'fail' || result === 'aborted') return 0;
  const total = Number(correct) + Number(wrong);
  if (!total) return 0;
  const accuracy = Number(correct) / total;
  if (accuracy >= 1) return 3;
  if (accuracy >= 0.8) return 2;
  if (accuracy >= 0.5) return 1;
  return 0;
}

function computeRewards({ stars = 0, correct = 0, levelReward = {} } = {}) {
  const s = Math.max(0, Math.min(3, Number(stars) || 0));
  if (s <= 0) return { exp: 0, gold: 0, gems: 0, materials: [] };
  const baseExp = Number(levelReward.exp || 20);
  const baseGold = Number(levelReward.gold || 10);
  return {
    exp: Math.round(baseExp * (0.5 + s / 3) + Number(correct || 0) * 2),
    gold: Math.round(baseGold * (0.5 + s / 3) + Number(correct || 0)),
    gems: s >= 3 ? 2 : s >= 2 ? 1 : 0,
    materials: Array.isArray(levelReward.materials) ? levelReward.materials : [],
  };
}

function computeSupplyResources({ correct = false, combo = 0, phase = 'opening', durationMs = 0 } = {}) {
  const out = { ammo_basic: 0, ammo_power: 0, shield: 0, skill_bomb: 0, skill_freeze: 0, ultimate_energy: 0 };
  if (phase === 'boss') {
    out.ammo_basic += correct ? 4 : 1;
    out.ultimate_energy += correct ? 1 : 0;
    return out;
  }
  out.ammo_basic += correct ? (phase === 'mid' ? 4 : 6) : (phase === 'mid' ? 1 : 2);
  if (correct && durationMs > 0 && durationMs <= 8000) out.ammo_basic += 2;
  if (correct && combo > 0 && combo % 3 === 0) out.ammo_power += 3;
  if (correct && combo > 0 && combo % 4 === 0) out.skill_bomb += 1;
  return out;
}

function addResources(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) out[k] = (Number(out[k]) || 0) + (Number(v) || 0);
  return out;
}

module.exports = { clamp01, computeStars, computeRewards, computeSupplyResources, addResources };
