// 浏览器端 ESM 适配 lib/state-recorder.js（CommonJS 重导出）
// 设计：state-recorder.js 用 module.exports，前端通过 fetch 拉取 + new Function 包装并不优雅；
// 直接在前端再实现一遍同名函数（保持小而清晰）。Node 测试覆盖业务逻辑；前端这层是"薄镜像"。

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(a, b) {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / 86400000);
}

export function createInitialState() {
  return {
    user: 'default', name: '', avatar: '', grade: 1,
    exp: 0, gold: 0, gems: 0,
    petStage: 0,
    stats: { correct: 0, wrong: 0, levelsCleared: 0, battles: 0, perfectClears: 0 },
    clearedLevels: {},
    achievements: [],
    dailyTasks: { date: '', tasks: {}, claimed: [] },
    lastLogin: todayStr(),
    streak: 0,
    prefs: { engine: 'battle', source: 'mixed', muted: false },
  };
}

// 旧版 SAVE 可能缺字段；这里做一次性补齐 + 数据修正
export function migrateState(raw) {
  const fresh = createInitialState();
  const merged = { ...fresh, ...(raw || {}) };
  merged.stats = { ...fresh.stats, ...(raw?.stats || {}) };
  merged.prefs = { ...fresh.prefs, ...(raw?.prefs || {}) };
  merged.dailyTasks = { ...fresh.dailyTasks, ...(raw?.dailyTasks || {}) };
  merged.clearedLevels = raw?.clearedLevels || {};
  merged.achievements = Array.isArray(raw?.achievements) ? raw.achievements : [];
  // 清理旧版残留 pet:{name:'蛋蛋',face:'🥚',xp:0} —— 与 petByExp 计算冲突
  delete merged.pet;
  // 兼容 gold/gems：旧版可能用 stars 命名
  if (merged.gold == null && raw?.stars != null) merged.gold = raw.stars;
  return merged;
}

export function recordCorrect(state, { exp = 5 } = {}) {
  state.exp = (state.exp || 0) + exp;
  state.stats.correct = (state.stats.correct || 0) + 1;
  return { exp };
}

export function recordWrong(state) {
  state.stats.wrong = (state.stats.wrong || 0) + 1;
}

export function recordLevelComplete(state, { grade, subject, lv, engine, result, correct = 0, wrong = 0 }) {
  state.stats.battles = (state.stats.battles || 0) + 1;
  const stars = computeStarRating({ result, correct, wrong });
  const isClear = result === 'win' || result === 'complete';
  if (isClear) {
    state.stats.levelsCleared = (state.stats.levelsCleared || 0) + 1;
    if (stars === 3) state.stats.perfectClears = (state.stats.perfectClears || 0) + 1;
    const key = `g${grade}.${subject}.lv${lv}`;
    const prev = state.clearedLevels[key] || { bestStars: 0, times: 0 };
    state.clearedLevels[key] = {
      bestStars: Math.max(prev.bestStars, stars),
      times: prev.times + 1,
      lastResult: result,
      lastEngine: engine,
    };
  }
  return { stars, isClear };
}

export function computeStarRating({ result, correct = 0, wrong = 0 }) {
  if (result === 'fail') return 0;
  const total = correct + wrong;
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 1) return 3;
  if (rate >= 0.8) return 2;
  return 1;
}

export function computeRewards({ stars, correct = 0, wrong = 0 }) {
  if (stars === 0) return { exp: 0, gold: 0, gems: 0 };
  const baseExp = stars * 10 + correct * 2;
  const baseGold = stars * 4 + correct;
  const gems = stars >= 3 ? 2 : stars >= 2 ? 1 : 0;
  return { exp: baseExp, gold: baseGold, gems };
}

export function awardDaily(state, { today = todayStr(), baseGold = 5, perDay = 2 } = {}) {
  if (!state.lastLogin) state.lastLogin = today;
  if (state.lastLogin === today) return null;
  const diff = dayDiff(state.lastLogin, today);
  if (diff === 1) state.streak = (state.streak || 0) + 1;
  else state.streak = 1;
  state.lastLogin = today;
  const gold = baseGold + Math.min(20, state.streak * perDay);
  state.gold = (state.gold || 0) + gold;
  return { gold, streak: state.streak };
}
