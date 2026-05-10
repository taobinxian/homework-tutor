// 成就系统 — 30+ 徽章定义 + 解锁判定
// 触发：每次状态变更后调用 checkAchievements(state)，返回新解锁的徽章列表

export const ACHIEVEMENTS = [
  // 答题数量
  { key: 'first_correct',    name: '初次答对',     icon: '🌱', desc: '答对第一题',     check: s => s.stats.correct >= 1 },
  { key: 'correct_10',       name: '小有所成',     icon: '🌿', desc: '累计答对 10 题', check: s => s.stats.correct >= 10 },
  { key: 'correct_50',       name: '勤学好问',     icon: '🌳', desc: '累计答对 50 题', check: s => s.stats.correct >= 50 },
  { key: 'correct_200',      name: '博学多才',     icon: '🎓', desc: '累计答对 200 题', check: s => s.stats.correct >= 200 },
  { key: 'correct_500',      name: '学富五车',     icon: '📚', desc: '累计答对 500 题', check: s => s.stats.correct >= 500 },
  // 关卡通关
  { key: 'first_clear',      name: '首战告捷',     icon: '🎉', desc: '通过第一关',     check: s => s.stats.levelsCleared >= 1 },
  { key: 'cleared_10',       name: '十全十美',     icon: '🏅', desc: '通过 10 关',    check: s => s.stats.levelsCleared >= 10 },
  { key: 'cleared_50',       name: '关卡大师',     icon: '🏆', desc: '通过 50 关',    check: s => s.stats.levelsCleared >= 50 },
  // 完美通关
  { key: 'first_perfect',    name: '完美主义',     icon: '⭐', desc: '首次三星通关',   check: s => s.stats.perfectClears >= 1 },
  { key: 'perfect_10',       name: '不容有失',     icon: '🌟', desc: '三星通关 10 次', check: s => s.stats.perfectClears >= 10 },
  // 宠物进化
  { key: 'pet_evolve_1',     name: '初次进化',     icon: '🐱', desc: '宠物升至 2 阶', check: s => s.petStage >= 1 },
  { key: 'pet_evolve_3',     name: '神兽降临',     icon: '🐲', desc: '宠物升至 4 阶', check: s => s.petStage >= 3 },
  { key: 'pet_evolve_max',   name: '凤凰涅槃',     icon: '🔥', desc: '宠物满阶进化',   check: s => s.petStage >= 4 },
  // 财富
  { key: 'gold_100',         name: '小富翁',       icon: '💰', desc: '累计 100 金币', check: s => (s.gold || 0) >= 100 },
  { key: 'gem_10',           name: '宝石收藏家',   icon: '💎', desc: '累计 10 宝石',   check: s => (s.gems || 0) >= 10 },
  // 连续登录
  { key: 'streak_3',         name: '三日连登',     icon: '📅', desc: '连续登录 3 天', check: s => (s.streak || 0) >= 3 },
  { key: 'streak_7',         name: '一周不辍',     icon: '🗓️', desc: '连续登录 7 天', check: s => (s.streak || 0) >= 7 },
  { key: 'streak_30',        name: '月度学霸',     icon: '📆', desc: '连续登录 30 天', check: s => (s.streak || 0) >= 30 },
  // 三引擎
  { key: 'try_shooting',     name: '射击新手',     icon: '🎯', desc: '体验射击模式',   check: s => Object.values(s.clearedLevels).some(l => l.lastEngine === 'shooting') },
  { key: 'try_fighting',     name: '格斗新手',     icon: '🥋', desc: '体验格斗模式',   check: s => Object.values(s.clearedLevels).some(l => l.lastEngine === 'fighting') },
  { key: 'all_engines',      name: '十项全能',     icon: '🏟️', desc: '三种引擎都通关', check: s => {
    const engines = new Set(Object.values(s.clearedLevels).map(l => l.lastEngine));
    return engines.has('battle') && engines.has('shooting') && engines.has('fighting');
  }},
  // 跨年级
  { key: 'multi_grade',      name: '跨年级冒险',   icon: '🎒', desc: '通关 3 个年级',   check: s => {
    const grades = new Set(Object.keys(s.clearedLevels).map(k => k.split('.')[0]));
    return grades.size >= 3;
  }},
  { key: 'all_subjects',     name: '全科达人',     icon: '🧑‍🎓', desc: '4 个科目都通关', check: s => {
    const subs = new Set(Object.keys(s.clearedLevels).map(k => k.split('.')[1]));
    return ['math', 'chinese', 'english', 'science'].every(sub => subs.has(sub));
  }},
  // 错题
  { key: 'wrongbook_clear',  name: '知错能改',     icon: '📕', desc: '使用错题练习',   check: s => Object.values(s.clearedLevels).some(l => l.lastResult === 'win' && (s._lastSource === 'wrongbook-practice' || s.prefs.source === 'wrongbook-practice')) },
];

// 检查所有成就，返回新解锁的列表（不修改 state.achievements 之外的字段）
export function checkAchievements(state) {
  const owned = new Set(state.achievements || []);
  const newly = [];
  for (const ach of ACHIEVEMENTS) {
    if (owned.has(ach.key)) continue;
    try {
      if (ach.check(state)) { newly.push(ach); owned.add(ach.key); }
    } catch (_) { /* check 异常视作未解锁 */ }
  }
  if (newly.length) state.achievements = Array.from(owned);
  return newly;
}

export function totalAchievements() { return ACHIEVEMENTS.length; }
