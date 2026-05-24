// 知识战场资源公式（前端权威）。
// 引擎 (knowledge-shooter.js) 与开局补给 UI (supply.js) 共用此公式，
// 保证两段补给路径下玩家看到的资源数完全一致。
// 后端 lib/level-api.js 不再计算资源，只负责落库 answers / mastery。

export function computeSupplyResources({ correct = false, combo = 0, phase = 'opening', durationMs = 0, difficulty = 1 } = {}) {
  const mult = difficulty === 1 ? 1.2 : difficulty === 3 ? 0.9 : 1;
  const out = { ammo_basic: 0, ammo_power: 0, shield: 0, skill_bomb: 0, skill_freeze: 0, ultimate_energy: 0 };
  const add = (key, n) => { out[key] = (out[key] || 0) + Math.max(1, Math.round(n * mult)); };
  if (phase === 'opening') {
    add('ammo_basic', correct ? 6 : 2);
    if (correct && durationMs > 0 && durationMs <= 8000) add('ammo_basic', 2);
    if (correct && combo > 0 && combo % 3 === 0) add('ammo_power', 3);
  } else if (phase === 'mid') {
    add('ammo_basic', correct ? 4 : 1);
    if (correct && combo > 0 && combo % 3 === 0) add('skill_bomb', 1);
  } else {
    add('ammo_basic', correct ? 4 : 1);
    if (correct) add('ultimate_energy', 1);
  }
  return out;
}

export function addResources(a = {}, b = {}) {
  const out = { ...a };
  for (const [k, v] of Object.entries(b || {})) out[k] = (Number(out[k]) || 0) + (Number(v) || 0);
  return out;
}

export function emptyResources() {
  return { ammo_basic: 0, ammo_power: 0, shield: 0, skill_bomb: 0, skill_freeze: 0, ultimate_energy: 0 };
}
