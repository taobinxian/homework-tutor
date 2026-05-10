// 宠物系统 — 升级、装饰、动画
// 状态由 main.js 通过 SAVE 注入；本模块只负责渲染与升级判定

export const PET_STAGES = [
  { stage: 0, name: '小鹦鹉', emoji: '🦜', threshold: 0 },
  { stage: 1, name: '机灵猫', emoji: '🐱', threshold: 50 },
  { stage: 2, name: '勇敢狐', emoji: '🦊', threshold: 150 },
  { stage: 3, name: '闪耀龙', emoji: '🐲', threshold: 350 },
  { stage: 4, name: '神兽凤凰', emoji: '🦅', threshold: 700 },
];

export function petByExp(exp) {
  let current = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (exp >= s.threshold) current = s;
    else break;
  }
  return current;
}

export function nextPetThreshold(exp) {
  for (const s of PET_STAGES) {
    if (exp < s.threshold) return s.threshold;
  }
  return null;
}

export function evolveIfNeeded(save) {
  const cur = petByExp(save.exp || 0);
  const prevStage = save.petStage ?? 0;
  if (cur.stage > prevStage) {
    save.petStage = cur.stage;
    return cur;
  }
  return null;
}

export function renderPet(container, save) {
  if (!container) return;
  const pet = petByExp(save.exp || 0);
  const next = nextPetThreshold(save.exp || 0);
  const progress = next ? Math.min(100, Math.round(((save.exp || 0) - pet.threshold) / (next - pet.threshold) * 100)) : 100;
  container.innerHTML = `
    <div class="pet-emoji">${pet.emoji}</div>
    <div class="pet-name">${pet.name}</div>
    <div class="pet-bar"><div class="pet-bar-fill" style="width:${progress}%"></div></div>
    <div class="pet-exp">EXP ${save.exp || 0}${next ? ' / ' + next : ' (满级)'}</div>
  `;
}
