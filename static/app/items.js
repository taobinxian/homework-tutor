// 道具系统 — 每关消耗品（选关前激活，关内单次生效）
// 设计：
//   ITEMS 是只读定义；state.inventory 是 { itemKey: count }；state.activeItems 是激活列表（最多 3 个）
//   引擎通过 callbacks.itemEffects 拿到激活道具的效果配置，自行应用

export const ITEMS = [
  {
    key: 'exp_potion', name: '经验药水', icon: '⚗️',
    desc: '本关 EXP 奖励 +50%',
    cost: { gold: 30 }, effect: { expMultiplier: 1.5 },
  },
  {
    key: 'double_gold', name: '双倍金币', icon: '💰',
    desc: '本关金币奖励 ×2',
    cost: { gold: 40 }, effect: { goldMultiplier: 2 },
  },
  {
    key: 'revive', name: '复活卷', icon: '❤️',
    desc: '玩家 HP 归零时自动复活（HP 50%）',
    cost: { gold: 80 }, effect: { revive: 1 },
  },
  {
    key: 'lightning_sword', name: '闪电之剑', icon: '⚔️',
    desc: '答对题目伤害 +50%',
    cost: { gold: 50 }, effect: { damageMultiplier: 1.5 },
  },
  {
    key: 'all_seeing_eye', name: '全知之眼', icon: '👁️',
    desc: '所有题目自动显示首条提示（不扣分）',
    cost: { gold: 25 }, effect: { autoHint: true },
  },
  {
    key: 'time_glass', name: '时间沙漏', icon: '⏳',
    desc: '射击模式倒计时 +5s/题',
    cost: { gold: 35 }, effect: { extraTime: 5 },
  },
  {
    key: 'shield', name: '守护盾', icon: '🛡️',
    desc: '答错时不扣 HP，最多 3 次',
    cost: { gold: 60 }, effect: { shieldCharges: 3 },
  },
  // 宝石购买（高阶）
  {
    key: 'crit_charm', name: '暴击护符', icon: '💎',
    desc: '答对时 30% 概率暴击（双倍伤害）',
    cost: { gems: 5 }, effect: { critChance: 0.3, critMultiplier: 2 },
  },
  {
    key: 'lucky_box', name: '幸运宝箱', icon: '🎁',
    desc: '通关后开启宝箱：50–200 金币随机',
    cost: { gems: 10 }, effect: { bonusBox: [50, 200] },
  },
  {
    key: 'phoenix_feather', name: '凤凰羽毛', icon: '🪶',
    desc: '通关时即使非三星，也按三星结算奖励',
    cost: { gems: 8 }, effect: { forceThreeStar: true },
  },
];

export function findItem(key) { return ITEMS.find(i => i.key === key); }

// 是否买得起（不修改 state）
export function canAfford(state, item) {
  const need = item.cost;
  if (need.gold && (state.gold || 0) < need.gold) return false;
  if (need.gems && (state.gems || 0) < need.gems) return false;
  return true;
}

// 购买：扣货币、加 inventory；返回 { ok, reason? }
export function buyItem(state, key) {
  const item = findItem(key);
  if (!item) return { ok: false, reason: 'not_found' };
  if (!canAfford(state, item)) return { ok: false, reason: 'insufficient' };
  state.inventory = state.inventory || {};
  if (item.cost.gold) state.gold = (state.gold || 0) - item.cost.gold;
  if (item.cost.gems) state.gems = (state.gems || 0) - item.cost.gems;
  state.inventory[key] = (state.inventory[key] || 0) + 1;
  return { ok: true, item };
}

// 激活到 activeItems（关卡前），从 inventory 暂未扣减——开关时扣
export function toggleActive(state, key) {
  state.activeItems = state.activeItems || [];
  state.inventory = state.inventory || {};
  const idx = state.activeItems.indexOf(key);
  if (idx >= 0) {
    state.activeItems.splice(idx, 1);
    return { active: false };
  }
  if (state.activeItems.length >= 3) return { active: false, reason: 'full' };
  if (!state.inventory[key]) return { active: false, reason: 'no_stock' };
  state.activeItems.push(key);
  return { active: true };
}

// 关卡开始时调用：从 inventory 扣减一份（开始即消耗），返回当次合并 effects
export function consumeActiveAtLevelStart(state) {
  state.activeItems = state.activeItems || [];
  state.inventory = state.inventory || {};
  const used = [];
  const effects = {
    expMultiplier: 1, goldMultiplier: 1, damageMultiplier: 1,
    revive: 0, autoHint: false, extraTime: 0,
    shieldCharges: 0, critChance: 0, critMultiplier: 1,
    bonusBox: null, forceThreeStar: false,
  };
  for (const key of state.activeItems) {
    const it = findItem(key); if (!it) continue;
    if (!state.inventory[key]) continue;
    state.inventory[key] -= 1;
    if (state.inventory[key] <= 0) delete state.inventory[key];
    used.push(it);
    const e = it.effect;
    if (e.expMultiplier) effects.expMultiplier = Math.max(effects.expMultiplier, e.expMultiplier);
    if (e.goldMultiplier) effects.goldMultiplier = Math.max(effects.goldMultiplier, e.goldMultiplier);
    if (e.damageMultiplier) effects.damageMultiplier = Math.max(effects.damageMultiplier, e.damageMultiplier);
    if (e.revive) effects.revive += e.revive;
    if (e.autoHint) effects.autoHint = true;
    if (e.extraTime) effects.extraTime += e.extraTime;
    if (e.shieldCharges) effects.shieldCharges += e.shieldCharges;
    if (e.critChance) {
      effects.critChance = Math.max(effects.critChance, e.critChance);
      effects.critMultiplier = Math.max(effects.critMultiplier, e.critMultiplier || 2);
    }
    if (e.bonusBox) effects.bonusBox = e.bonusBox;
    if (e.forceThreeStar) effects.forceThreeStar = true;
  }
  state.activeItems = [];  // 用完清空
  return { used, effects };
}

// 关卡结束后应用奖励倍率，可能加 bonusBox 金币
export function applyEndOfLevelEffects(state, effects, baseRewards, stars) {
  const out = { ...baseRewards };
  out.exp = Math.round(out.exp * (effects.expMultiplier || 1));
  out.gold = Math.round(out.gold * (effects.goldMultiplier || 1));
  if (effects.bonusBox && Array.isArray(effects.bonusBox)) {
    const [min, max] = effects.bonusBox;
    const bonus = Math.floor(min + Math.random() * (max - min + 1));
    out.bonusGold = bonus;
    out.gold += bonus;
  }
  // forceThreeStar 已在 main.js 计算 stars 时处理
  return out;
}
