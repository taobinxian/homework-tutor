'use strict';
// 纯函数：累加玩家进度（统计/星级/奖励/每日登录）
// 同时被前端 main.js 与服务端测试用例引用
//
// 设计原则：
//  - 所有函数 in-place 修改 state（前端 SAVE 对象就是引用），但返回值表示"本次发生了什么"
//  - 所有数据格式固定，便于序列化到 localStorage 或 SQLite
//  - 不做 IO，便于 node:test 直接验证

function todayStr() {
  return new Date().toISOString().slice(0, 10);  // YYYY-MM-DD
}

function dayDiff(a, b) {
  const da = new Date(a + 'T00:00:00Z').getTime();
  const db = new Date(b + 'T00:00:00Z').getTime();
  return Math.round((db - da) / 86400000);
}

function createInitialState() {
  return {
    user: 'default',
    name: '',
    avatar: '',
    grade: 1,
    exp: 0,
    gold: 0,
    gems: 0,
    petStage: 0,
    stats: { correct: 0, wrong: 0, levelsCleared: 0, battles: 0, perfectClears: 0 },
    clearedLevels: {},     // { 'g1.math.lv1': { bestStars, times, lastResult } }
    achievements: [],      // 已解锁 achievement key 列表
    dailyTasks: { date: '', tasks: {}, claimed: [] },  // 每日任务进度
    lastLogin: todayStr(),
    streak: 0,
    prefs: { engine: 'battle', source: 'mixed', muted: false },
  };
}

// 答对一题：累加 exp 与 stats.correct
function recordCorrect(state, { exp = 5 } = {}) {
  state.exp = (state.exp || 0) + exp;
  state.stats = state.stats || { correct: 0, wrong: 0, levelsCleared: 0, battles: 0, perfectClears: 0 };
  state.stats.correct = (state.stats.correct || 0) + 1;
  return { exp };
}

// 答错一题：只累加 stats.wrong
function recordWrong(state) {
  state.stats = state.stats || { correct: 0, wrong: 0, levelsCleared: 0, battles: 0, perfectClears: 0 };
  state.stats.wrong = (state.stats.wrong || 0) + 1;
}

// 完成一关：更新 levelsCleared/battles/perfectClears
function recordLevelComplete(state, { grade, subject, lv, engine, result, correct = 0, wrong = 0 }) {
  state.stats = state.stats || { correct: 0, wrong: 0, levelsCleared: 0, battles: 0, perfectClears: 0 };
  state.clearedLevels = state.clearedLevels || {};
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

// 星级判定：win 时按正确率
function computeStarRating({ result, correct = 0, wrong = 0 }) {
  if (result === 'fail') return 0;
  const total = correct + wrong;
  if (total === 0) return 0;
  const rate = correct / total;
  if (rate >= 1) return 3;
  if (rate >= 0.8) return 2;
  return 1;
}

// 关卡奖励：星数+正确数 → exp/gold/gems
function computeRewards({ stars, correct = 0, wrong = 0 }) {
  if (stars === 0) return { exp: 0, gold: 0, gems: 0 };
  const baseExp = stars * 10 + correct * 2;
  const baseGold = stars * 4 + correct;
  const gems = stars >= 3 ? 2 : stars >= 2 ? 1 : 0;
  return { exp: baseExp, gold: baseGold, gems };
}

// 每日登录奖励
function awardDaily(state, { today = todayStr(), baseGold = 5, perDay = 2 } = {}) {
  if (!state.lastLogin) state.lastLogin = today;
  if (state.lastLogin === today) return null;  // 同天不重复
  const diff = dayDiff(state.lastLogin, today);
  if (diff === 1) {
    state.streak = (state.streak || 0) + 1;
  } else {
    state.streak = 1;
  }
  state.lastLogin = today;
  const gold = baseGold + Math.min(20, state.streak * perDay);
  state.gold = (state.gold || 0) + gold;
  return { gold, streak: state.streak };
}

// 让 ES module（前端）也能 import
module.exports = {
  createInitialState,
  recordCorrect,
  recordWrong,
  recordLevelComplete,
  computeStarRating,
  computeRewards,
  awardDaily,
  todayStr,
  dayDiff,
};
