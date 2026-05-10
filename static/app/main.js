// 应用入口 — 视图路由 + 关卡选择 + 引擎实例化
import * as data from './data.js';
import { $, $$, toast, showConfirm, confetti, loadJSON, saveJSON } from './ui.js';
import { speak, preloadBattle, toggleVoice, isEnabled, stopSpeak, clearTTSCache } from './tts.js';
import { renderPet, evolveIfNeeded, petByExp, PET_STAGES, nextPetThreshold } from './pets.js';
import { loadAICfg, saveAICfg, syncTTSConfig, explainQuestion, recognizeQuestionsFromPhoto, fileToBase64 } from './ai.js';
import {
  migrateState, recordCorrect, recordWrong, recordLevelComplete,
  computeStarRating, computeRewards, awardDaily,
} from './state.js';
import { ACHIEVEMENTS, checkAchievements, totalAchievements } from './achievements.js';
import * as audio from './audio.js';
import {
  ITEMS, findItem, canAfford, buyItem, toggleActive,
  consumeActiveAtLevelStart, applyEndOfLevelEffects,
} from './items.js';

import { BattleEngine } from './engines/battle.js';
import { ShootingEngine } from './engines/shooting.js';
import { FightingEngine } from './engines/fighting.js';

const SAVE_KEY = 'scholar_odyssey_save_v1';
const SAVE = migrateState(loadJSON(SAVE_KEY, null));
syncTTSConfig();
audio.setMuted(SAVE.prefs.muted || false);
audio.installUnlockHook();  // 移动端首次手势解锁 WebAudio + HTML5 Audio

function persistSave() { saveJSON(SAVE_KEY, SAVE); }
function refreshAll() { renderTopbar(); renderPet($('#pet-area'), SAVE); }

// ---------- 顶部状态栏 ----------
function renderTopbar() {
  const bar = $('#topbar');
  if (!bar) return;
  const pet = petByExp(SAVE.exp || 0);
  const next = nextPetThreshold(SAVE.exp || 0);
  const progress = next ? Math.round(((SAVE.exp - pet.threshold) / (next - pet.threshold)) * 100) : 100;
  bar.innerHTML = `
    <div class="tb-left">
      <span class="tb-pet" title="${pet.name} Lv ${pet.stage + 1} · 距下一阶段还需 ${next ? (next - SAVE.exp) : 0} EXP">
        ${pet.emoji} <b>${pet.name}</b>
        <span class="tb-mini-bar"><span style="width:${progress}%"></span></span>
      </span>
      <span class="tb-exp">⚡ ${SAVE.exp}</span>
      <span class="tb-gold">🪙 ${SAVE.gold || 0}</span>
      <span class="tb-gem">💎 ${SAVE.gems || 0}</span>
      ${(SAVE.streak || 0) > 0 ? `<span class="tb-streak" title="连续登录 ${SAVE.streak} 天">🔥 ${SAVE.streak}</span>` : ''}
    </div>
    <div class="tb-right">
      <button id="btn-voice" class="btn-mini" title="${isEnabled() ? '语音开' : '语音关'}">${isEnabled() ? '🔊' : '🔇'}</button>
      <button id="btn-mute" class="btn-mini" title="${audio.isMuted() ? '音效关' : '音效开'}">${audio.isMuted() ? '🔕' : '🎵'}</button>
      <button id="btn-daily" class="btn-mini" title="每日任务">📋</button>
      <button id="btn-shop" class="btn-mini" title="商店">🛒</button>
      <button id="btn-achv" class="btn-mini" title="成就">🏆 ${SAVE.achievements.length}/${totalAchievements()}</button>
      <button id="btn-photo" class="btn-mini">📷</button>
      <button id="btn-wrongbook" class="btn-mini">📚</button>
      <button id="btn-settings" class="btn-mini">⚙️</button>
    </div>
  `;
  $('#btn-voice').addEventListener('click', () => {
    audio.sfxClick();
    toggleVoice(); refreshAll();
  });
  $('#btn-mute').addEventListener('click', () => {
    const newMuted = !audio.isMuted();
    audio.setMuted(newMuted);
    SAVE.prefs.muted = newMuted; persistSave();
    if (!newMuted) audio.sfxClick();
    refreshAll();
  });
  $('#btn-daily').addEventListener('click', () => { audio.sfxClick(); openDaily(); });
  $('#btn-shop').addEventListener('click', () => { audio.sfxClick(); openShop(); });
  $('#btn-achv').addEventListener('click', () => { audio.sfxClick(); openAchievements(); });
  $('#btn-photo').addEventListener('click', () => { audio.sfxClick(); openPhotoFlow(); });
  $('#btn-wrongbook').addEventListener('click', () => { audio.sfxClick(); openWrongbook(); });
  $('#btn-settings').addEventListener('click', () => { audio.sfxClick(); openSettings(); });
}

// ---------- 关卡选择 UI ----------
const SUBJECTS = [
  { key: 'math', label: '数学', icon: '📐' },
  { key: 'chinese', label: '语文', icon: '📖' },
  { key: 'english', label: '英语', icon: '🔤' },
  { key: 'science', label: '科学', icon: '🔬' },
];
const ENGINES = [
  { key: 'battle', label: '⚔️ 战斗' },
  { key: 'shooting', label: '🎯 射击' },
  { key: 'fighting', label: '🥋 格斗' },
];
const SOURCES = [
  { key: 'mixed', label: '混合' },
  { key: 'static', label: '仅静态' },
  { key: 'generated', label: '生成器' },
  { key: 'wrongbook-practice', label: '📚 错题' },
];

const sel = {
  grade: SAVE.grade || 1, subject: 'math', lv: 1, semester: '',
  engine: SAVE.prefs.engine || 'battle',
  source: SAVE.prefs.source || 'mixed',
  count: 10,
};

let AVAILABILITY = null;

function isSubjectAvailable(grade, subject) {
  if (!AVAILABILITY) return true;
  return !!(AVAILABILITY[grade] && AVAILABILITY[grade][subject]);
}
function isLvAvailable(grade, subject, lv) {
  if (!AVAILABILITY) return true;
  const s = AVAILABILITY[grade]?.[subject];
  return s ? s.lvs.includes(lv) : false;
}
function isSemesterAvailable(grade, subject, semester) {
  if (!AVAILABILITY || !semester) return true;
  const s = AVAILABILITY[grade]?.[subject];
  return s ? s.semesters.includes(semester) : false;
}

function renderLevelSelect() {
  const home = $('#home');
  if (!home) return;
  if (AVAILABILITY) {
    if (!isSubjectAvailable(sel.grade, sel.subject)) {
      const f = SUBJECTS.find(s => isSubjectAvailable(sel.grade, s.key));
      if (f) sel.subject = f.key;
    }
    if (!isLvAvailable(sel.grade, sel.subject, sel.lv)) {
      const f = [1, 2, 3].find(l => isLvAvailable(sel.grade, sel.subject, l));
      if (f) sel.lv = f;
    }
    if (sel.semester && !isSemesterAvailable(sel.grade, sel.subject, sel.semester)) sel.semester = '';
  }
  // 关卡进度提示
  const key = `g${sel.grade}.${sel.subject}.lv${sel.lv}`;
  const cleared = SAVE.clearedLevels[key];
  const starsHtml = cleared ? '⭐'.repeat(cleared.bestStars) + '☆'.repeat(3 - cleared.bestStars) : '☆☆☆';

  home.innerHTML = `
    <h1 class="home-title">🎓 学霸奇遇记</h1>
    <div class="ls-row"><span>年级</span>${[1,2,3,4,5,6].map(g => btn('g', g, '年级' + g, sel.grade === g, false)).join('')}</div>
    <div class="ls-row"><span>科目</span>${SUBJECTS.map(s => btn('s', s.key, s.icon + ' ' + s.label, sel.subject === s.key, !isSubjectAvailable(sel.grade, s.key))).join('')}</div>
    <div class="ls-row"><span>难度</span>${[1,2,3].map(l => btn('l', l, '⭐'.repeat(l), sel.lv === l, !isLvAvailable(sel.grade, sel.subject, l))).join('')}</div>
    <div class="ls-row"><span>学期</span>${[{k:'',n:'全部'},{k:'upper',n:'上册'},{k:'lower',n:'下册'}].map(s => btn('sm', s.k, s.n, sel.semester === s.k, s.k && !isSemesterAvailable(sel.grade, sel.subject, s.k))).join('')}</div>
    <div class="ls-row"><span>玩法</span>${ENGINES.map(e => btn('e', e.key, e.label, sel.engine === e.key, false)).join('')}</div>
    <div class="ls-row"><span>来源</span>${SOURCES.map(s => btn('src', s.key, s.label, sel.source === s.key, false)).join('')}</div>
    <div class="ls-row"><span>题数</span>${[5,10,15].map(c => btn('cnt', c, c + '题', sel.count === c, false)).join('')}</div>
    <div class="ls-prog">本关最佳: <b>${starsHtml}</b>${cleared ? ` · 通过 ${cleared.times} 次` : ' · 未通关'}</div>
    ${renderItemSlots()}
    <button id="btn-start" class="btn-start">🚀 开始闯关</button>
  `;
  home.querySelectorAll('.ls-btn').forEach(b => {
    if (b.classList.contains('disabled')) return;
    b.addEventListener('click', () => {
      audio.sfxClick();
      const k = b.dataset.kind, v = b.dataset.val;
      if (k === 'g') { sel.grade = Number(v); SAVE.grade = sel.grade; persistSave(); }
      else if (k === 's') sel.subject = v;
      else if (k === 'l') sel.lv = Number(v);
      else if (k === 'sm') sel.semester = v;
      else if (k === 'e') { sel.engine = v; SAVE.prefs.engine = v; persistSave(); }
      else if (k === 'src') { sel.source = v; SAVE.prefs.source = v; persistSave(); }
      else if (k === 'cnt') sel.count = Number(v);
      renderLevelSelect();
    });
  });
  $('#btn-start').addEventListener('click', () => { audio.sfxLevelUp(); startLevel(); });

  // 道具槽位点击：移除已激活
  home.querySelectorAll('.it-slot').forEach(s => s.addEventListener('click', () => {
    const k = s.dataset.k; if (!k) return;
    audio.sfxClick();
    toggleActive(SAVE, k); persistSave();
    renderLevelSelect();
  }));
  // 「+」槽位点击：弹出库存选择
  const addSlot = home.querySelector('.it-slot.add');
  if (addSlot) addSlot.addEventListener('click', () => { audio.sfxClick(); openInventoryPicker(); });
  // 商店入口
  const shopLink = home.querySelector('.it-shop-link');
  if (shopLink) shopLink.addEventListener('click', () => { audio.sfxClick(); openShop(); });

  function btn(kind, val, label, active, disabled) {
    const cls = ['ls-btn'];
    if (active) cls.push('active');
    if (disabled) cls.push('disabled');
    return `<button class="${cls.join(' ')}" data-kind="${kind}" data-val="${val}">${label}</button>`;
  }
}

// 道具槽 — 3 槽位，已激活的显示道具图标，空槽显示 "+"
function renderItemSlots() {
  const active = SAVE.activeItems || [];
  const slots = [];
  for (let i = 0; i < 3; i++) {
    if (i < active.length) {
      const it = findItem(active[i]);
      if (!it) continue;
      slots.push(`<button class="it-slot active" data-k="${it.key}" title="${it.desc}（点击移除）">
        <span class="it-ic">${it.icon}</span><span class="it-n">${it.name}</span>
      </button>`);
    } else {
      slots.push(`<button class="it-slot add" title="装备道具">+</button>`);
    }
  }
  const totalItems = Object.values(SAVE.inventory || {}).reduce((a, b) => a + b, 0);
  return `<div class="ls-row it-row">
    <span>道具</span>
    ${slots.join('')}
    <span class="it-shop-link">🛒 商店${totalItems ? `（背包 ${totalItems}）` : ''}</span>
  </div>`;
}

// 库存选择弹窗（点 + 槽时）
function openInventoryPicker() {
  const overlay = ensureOverlay('invpicker');
  const inv = SAVE.inventory || {};
  const owned = Object.entries(inv).filter(([_, n]) => n > 0);
  const html = owned.length
    ? owned.map(([k, n]) => {
        const it = findItem(k); if (!it) return '';
        const equipped = (SAVE.activeItems || []).includes(k);
        return `<button class="inv-card${equipped ? ' equipped' : ''}" data-k="${k}">
          <div class="inv-ic">${it.icon}</div>
          <div class="inv-n">${it.name} ×${n}</div>
          <div class="inv-d">${it.desc}</div>
          ${equipped ? '<div class="inv-eq">已装备</div>' : ''}
        </button>`;
      }).join('')
    : '<div class="inv-empty">背包空空 · 去 🛒 商店采购吧</div>';
  overlay.innerHTML = `<div class="inv-panel">
    <div class="inv-head"><h2>🎒 选择道具</h2><button class="inv-close">×</button></div>
    <div class="inv-tip">最多激活 3 个；关卡开始时消耗。当前已激活 ${(SAVE.activeItems || []).length}/3</div>
    <div class="inv-grid">${html}</div>
    <button class="inv-shop-btn">🛒 去商店</button>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.inv-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); renderLevelSelect(); };
  overlay.querySelector('.inv-shop-btn').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); openShop(); };
  overlay.querySelectorAll('.inv-card').forEach(b => b.onclick = () => {
    audio.sfxClick();
    const r = toggleActive(SAVE, b.dataset.k);
    if (r.reason === 'full') toast('道具槽已满（最多 3 个）');
    else if (r.reason === 'no_stock') toast('已无库存');
    else { persistSave(); openInventoryPicker(); }
  });
}

// ---------- 商店 ----------
function openShop() {
  const overlay = ensureOverlay('shop');
  overlay.innerHTML = `<div class="shop-panel">
    <div class="shop-head">
      <h2>🛒 魔法商店</h2>
      <span class="shop-bal">🪙 ${SAVE.gold || 0} · 💎 ${SAVE.gems || 0}</span>
      <button class="shop-close">×</button>
    </div>
    <div class="shop-tip">道具会加到背包；选关时点 + 槽位激活，关卡开始即生效。</div>
    <div class="shop-grid">
      ${ITEMS.map(it => {
        const owned = SAVE.inventory?.[it.key] || 0;
        const ok = canAfford(SAVE, it);
        const priceStr = it.cost.gold ? `🪙 ${it.cost.gold}` : `💎 ${it.cost.gems}`;
        return `<div class="shop-card ${ok ? '' : 'disabled'}" data-k="${it.key}">
          <div class="shop-ic">${it.icon}</div>
          <div class="shop-n">${it.name}</div>
          <div class="shop-d">${it.desc}</div>
          <div class="shop-foot">
            <span class="shop-p">${priceStr}</span>
            ${owned ? `<span class="shop-own">已有 ×${owned}</span>` : ''}
            <button class="shop-buy" data-k="${it.key}" ${ok ? '' : 'disabled'}>${ok ? '购买' : '不够'}</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.shop-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); renderLevelSelect(); };
  overlay.querySelectorAll('.shop-buy').forEach(b => b.onclick = e => {
    e.stopPropagation();
    if (b.disabled) return;
    const k = b.dataset.k;
    const it = findItem(k);
    if (!it) return;
    const r = buyItem(SAVE, k);
    if (!r.ok) { audio.sfxWrong(); toast('购买失败：' + (r.reason === 'insufficient' ? '货币不足' : r.reason)); return; }
    audio.sfxCoin();
    persistSave(); refreshAll();
    toast(`✅ 已购买 ${it.icon} ${it.name}`, 1400);
    openShop();  // 重渲染余额
  });
}

// ---------- 启动关卡 ----------
async function startLevel() {
  toast('🎲 抽题中…');
  let questions, fallback = null;
  try {
    const res = await data.fetchPick({
      grade: sel.grade, subject: sel.subject, lv: sel.lv,
      semester: sel.semester || undefined,
      count: sel.count, source: sel.source, user: SAVE.user,
    });
    questions = res.questions || [];
    fallback = res.fallback;
  } catch (e) {
    audio.sfxWrong();
    toast('抽题失败: ' + e.message); return;
  }
  if (!questions.length) {
    audio.sfxWrong();
    toast('该筛选条件下没有可用题目'); return;
  }
  if (fallback) toast('⚠️ ' + fallback, 2400);
  if (questions.length < sel.count) toast(`⚠️ 题库仅 ${questions.length} 题`, 2600);

  preloadBattle(questions);
  SAVE._lastSource = sel.source;  // 给成就检查用

  // 关卡开始：消耗激活道具
  const itemRun = consumeActiveAtLevelStart(SAVE);
  persistSave();
  if (itemRun.used.length) {
    toast(`🎒 已使用：${itemRun.used.map(i => i.icon + i.name).join('、')}`, 2200);
    audio.sfxLevelUp();
  }
  const E = itemRun.effects;  // 道具合并后的效果

  const stage = $('#stage');
  stage.classList.add('show');
  $('#home').style.display = 'none';

  const EngineClass = sel.engine === 'shooting' ? ShootingEngine
                     : sel.engine === 'fighting' ? FightingEngine
                     : BattleEngine;

  const engine = new EngineClass({
    container: stage,
    questions,
    config: { itemEffects: E },
    callbacks: {
      onCorrect: q => {
        recordCorrect(SAVE, { exp: 5 });
        audio.sfxHit();
        refreshAll();
        persistSave();
      },
      onWrong: () => {
        recordWrong(SAVE);
        audio.sfxWrong();
        refreshAll();
        persistSave();
      },
      onWrongAdd: async (q, userAnswer) => {
        try {
          await data.wrongbookAdd(SAVE.user, { ...q, userAnswer, source: q.source || 'level' });
        } catch (e) { console.warn('wrongbookAdd 失败:', e); }
      },
      onComplete: async ({ result, stats }) => {
        await new Promise(r => setTimeout(r, 600));
        // 关卡通关 + 星评（forceThreeStar 道具：通关时无脑给三星）
        let { stars, isClear } = recordLevelComplete(SAVE, {
          grade: sel.grade, subject: sel.subject, lv: sel.lv, engine: sel.engine,
          result, correct: stats.correct ?? 0, wrong: stats.wrong ?? 0,
        });
        if (E.forceThreeStar && (result === 'win' || result === 'complete') && stars < 3) {
          stars = 3;
          // 同步到 clearedLevels.bestStars
          const k = `g${sel.grade}.${sel.subject}.lv${sel.lv}`;
          if (SAVE.clearedLevels[k]) SAVE.clearedLevels[k].bestStars = 3;
        }
        // 基础奖励 → 道具倍率/宝箱
        const baseRewards = computeRewards({ stars, correct: stats.correct ?? 0, wrong: stats.wrong ?? 0 });
        const rewards = applyEndOfLevelEffects(SAVE, E, baseRewards, stars);
        SAVE.exp += rewards.exp;
        SAVE.gold = (SAVE.gold || 0) + rewards.gold;
        SAVE.gems = (SAVE.gems || 0) + rewards.gems;

        const evolved = evolveIfNeeded(SAVE);
        const newAchv = checkAchievements(SAVE);

        persistSave();
        refreshAll();

        if (result === 'win' || result === 'complete') audio.sfxVictory(); else audio.sfxGameOver();

        await showLevelResult({ result, stars, rewards, evolved, newAchv, stats, itemsUsed: itemRun.used });

        stage.classList.remove('show'); stage.innerHTML = '';
        $('#home').style.display = ''; renderLevelSelect();
      },
      requestExplain: explainQuestion,
      requestTTS: text => { speak(text, { interrupt: true }); return Promise.resolve(); },
    },
  });

  // 退出按钮
  const back = document.createElement('button');
  back.className = 'btn-mini btn-stage-back';
  back.textContent = '← 退出';
  back.addEventListener('click', async () => {
    audio.sfxClick();
    const ok = await showConfirm({ icon: '🚪', title: '退出关卡？', msg: '当前进度将丢失', yes: '退出', no: '继续' });
    if (ok) { engine.abort('aborted'); stage.classList.remove('show'); stage.innerHTML = ''; $('#home').style.display = ''; renderLevelSelect(); }
  });
  stage.appendChild(back);

  engine.run().catch(err => { console.error('engine error:', err); toast('引擎错误: ' + err.message); });
}

// ---------- 豪华关卡结束界面 ----------
function showLevelResult({ result, stars, rewards, evolved, newAchv, stats, itemsUsed = [] }) {
  return new Promise(resolve => {
    const overlay = ensureOverlay('result');
    overlay.classList.add('show');
    const isWin = result === 'win' || result === 'complete';
    const headEmoji = isWin ? (stars === 3 ? '🏆' : stars === 2 ? '🥇' : '✨') : '💔';
    const headText = isWin ? (stars === 3 ? '完美通关!' : '通关成功!') : '挑战失败';
    overlay.innerHTML = `<div class="result-panel ${isWin ? 'win' : 'lose'}">
      <div class="result-emoji">${headEmoji}</div>
      <div class="result-title">${headText}</div>
      <div class="result-stars">
        ${[1,2,3].map(i => `<span class="rstar ${i <= stars ? 'on' : ''}">★</span>`).join('')}
      </div>
      <div class="result-stats">答对 <b>${stats.correct ?? 0}</b> · 答错 <b>${stats.wrong ?? 0}</b>${stats.maxCombo ? ' · 最高连击 <b>' + stats.maxCombo + '</b>' : ''}</div>
      <div class="result-rewards">
        <div class="rrew"><span>⚡</span><b>+${rewards.exp}</b><i>经验</i></div>
        <div class="rrew"><span>🪙</span><b>+${rewards.gold}</b><i>金币</i></div>
        <div class="rrew"><span>💎</span><b>+${rewards.gems}</b><i>宝石</i></div>
      </div>
      ${rewards.bonusGold ? `<div class="result-evolve">🎁 幸运宝箱开出 <b>${rewards.bonusGold}</b> 金币！</div>` : ''}
      ${itemsUsed.length ? `<div class="result-items">本关消耗：${itemsUsed.map(i => i.icon + i.name).join(' · ')}</div>` : ''}
      ${evolved ? `<div class="result-evolve">🎊 宠物进化为 <b>${evolved.emoji} ${evolved.name}</b>！</div>` : ''}
      ${newAchv.length ? `<div class="result-achv"><div class="rachv-title">🏅 新成就</div>${newAchv.map(a => `<div class="rachv">${a.icon} ${a.name}<small>${a.desc}</small></div>`).join('')}</div>` : ''}
      <div class="result-actions">
        <button class="btn-back">返回主页</button>
        <button class="btn-retry">${isWin ? '再来一关' : '重新挑战'}</button>
      </div>
    </div>`;
    setTimeout(() => {
      // 星星动画依次入
      [...overlay.querySelectorAll('.rstar.on')].forEach((el, i) => {
        setTimeout(() => { el.classList.add('pop'); audio.sfxCoin(); }, 250 + i * 280);
      });
      if (evolved) setTimeout(() => audio.sfxLevelUp(), 1300);
      if (newAchv.length) setTimeout(() => { audio.sfxAchievement(); confetti(40); }, 1700);
      if (isWin && stars === 3) setTimeout(() => confetti(80), 1100);
    }, 200);
    overlay.querySelector('.btn-back').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); resolve('back'); };
    overlay.querySelector('.btn-retry').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); resolve('retry'); setTimeout(startLevel, 200); };
  });
}

// ---------- 错题本 ----------
async function openWrongbook() {
  const overlay = ensureOverlay('wb');
  overlay.innerHTML = `<div class="wb-panel">
    <div class="wb-head"><h2>📚 错题本</h2><button class="wb-close">×</button></div>
    <div class="wb-list">载入中…</div>
    <div class="wb-actions"><button class="wb-clear">🗑 清空</button><button class="wb-practice">🎯 错题练习</button></div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.wb-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  overlay.querySelector('.wb-clear').onclick = async () => {
    audio.sfxClick();
    const ok = await showConfirm({ icon: '🗑', title: '清空错题本？', msg: '此操作不可恢复', yes: '清空', no: '取消' });
    if (ok) { await data.wrongbookClear(SAVE.user); openWrongbook(); }
  };
  overlay.querySelector('.wb-practice').onclick = () => {
    audio.sfxClick();
    overlay.classList.remove('show');
    sel.source = 'wrongbook-practice'; SAVE.prefs.source = 'wrongbook-practice'; persistSave();
    renderLevelSelect(); startLevel();
  };
  try {
    const list = await data.wrongbookList(SAVE.user);
    const listEl = overlay.querySelector('.wb-list');
    if (!list.length) { listEl.textContent = '🎉 错题本空空如也！'; return; }
    listEl.innerHTML = list.map(w => `
      <div class="wb-item" data-id="${w.id}">
        <div class="wb-q">${w.q}</div>
        <div class="wb-meta">G${w.grade || '-'} · ${w.subject || '-'} · ${w.topic || '-'} · lv${w.lv || '-'}</div>
        <div class="wb-ans">正解：<b>${w.answer}</b> · 我答：${w.userAnswer || '<i>空</i>'}</div>
        <button class="wb-del" data-id="${w.id}">删除</button>
      </div>
    `).join('');
    listEl.querySelectorAll('.wb-del').forEach(b => b.addEventListener('click', async e => {
      audio.sfxClick();
      const id = e.target.dataset.id;
      await data.wrongbookDelete(SAVE.user, id);
      e.target.closest('.wb-item').remove();
    }));
  } catch (e) { overlay.querySelector('.wb-list').textContent = '加载失败: ' + e.message; }
}

// ---------- 拍照出题（重写：丰富入口） ----------
async function openPhotoFlow() {
  const overlay = ensureOverlay('photo');
  overlay.innerHTML = `<div class="ph-panel">
    <div class="ph-head"><h2>📷 拍照出题</h2><button class="ph-close">×</button></div>
    <div class="ph-grid">
      <button class="ph-btn ph-cam">
        <div class="ph-big">📷</div>
        <div class="ph-t">拍照</div>
        <div class="ph-d">用摄像头拍作业</div>
      </button>
      <button class="ph-btn ph-file">
        <div class="ph-big">📁</div>
        <div class="ph-t">上传图片</div>
        <div class="ph-d">从相册选</div>
      </button>
    </div>
    <div class="ph-drop" id="ph-drop">
      <div class="ph-big">🖼️</div>
      <div class="ph-t">把图片拖到这里</div>
      <div class="ph-d">或按 <b>Ctrl/Cmd+V</b> 粘贴截图</div>
    </div>
    <input type="file" accept="image/*" capture="environment" id="ph-input-cam" style="display:none">
    <input type="file" accept="image/*" id="ph-input-file" style="display:none">
    <div class="ph-tip">
      💡 提示：照片要清晰，每张作业最多识别 10 题。识别后会自动入库以供后续练习。
    </div>
    <button class="ph-demo">🎲 试试示例（无需 API Key）</button>
    <div class="ph-status"></div>
    <div class="ph-result"></div>
  </div>`;
  overlay.classList.add('show');
  const status = overlay.querySelector('.ph-status');
  const result = overlay.querySelector('.ph-result');
  const closeBtn = overlay.querySelector('.ph-close');
  closeBtn.onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };

  const handleFile = async (file) => {
    if (!file) return;
    audio.sfxSwoosh();
    status.innerHTML = '🤖 AI 识别中…';
    try {
      const dataUrl = await fileToBase64(file);
      const qs = await recognizeQuestionsFromPhoto(dataUrl);
      if (!qs.length) { status.textContent = '未识别到题目，请重拍'; return; }
      let inserted = 0;
      for (const q of qs) {
        try {
          await data.addQuestion({
            grade: q.grade || sel.grade, subject: q.subject || sel.subject,
            q: q.q, type: q.type || 'choice', options: q.options, answer: q.answer,
            hints: q.hints, explain: q.explain, topic: q.topic || '拍照新题',
            lv: q.lv || 2, semester: q.semester || 'unknown', source: 'photo',
          });
          inserted++;
        } catch (_) {}
      }
      audio.sfxCorrect();
      status.innerHTML = `✅ 识别 <b>${qs.length}</b> 题 · 入库 <b>${inserted}</b> 条`;
      result.innerHTML = qs.slice(0, 5).map(q => `<div class="ph-q">${q.q} → <b>${q.answer}</b></div>`).join('');
    } catch (err) {
      audio.sfxWrong();
      status.textContent = '识别失败: ' + err.message;
    }
  };

  overlay.querySelector('.ph-cam').onclick = () => { audio.sfxClick(); overlay.querySelector('#ph-input-cam').click(); };
  overlay.querySelector('.ph-file').onclick = () => { audio.sfxClick(); overlay.querySelector('#ph-input-file').click(); };
  overlay.querySelector('#ph-input-cam').onchange = e => handleFile(e.target.files?.[0]);
  overlay.querySelector('#ph-input-file').onchange = e => handleFile(e.target.files?.[0]);

  // 拖拽
  const drop = overlay.querySelector('#ph-drop');
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('drag'); };
  drop.ondragleave = () => drop.classList.remove('drag');
  drop.ondrop = e => {
    e.preventDefault(); drop.classList.remove('drag');
    handleFile(e.dataTransfer.files?.[0]);
  };
  // 粘贴
  const onPaste = e => {
    if (!overlay.classList.contains('show')) return;
    const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
    if (item) handleFile(item.getAsFile());
  };
  document.addEventListener('paste', onPaste);
  closeBtn.addEventListener('click', () => document.removeEventListener('paste', onPaste));

  // 示例
  overlay.querySelector('.ph-demo').onclick = async () => {
    audio.sfxClick();
    status.textContent = '加载示例题…';
    const demo = [
      { q: '7 + 8 = ?', type: 'input', answer: '15', hints: ['两位数加法'], explain: '7+8=15', topic: '示例题', lv: 1 },
      { q: '“春眠不觉晓”下一句是？', type: 'choice', options: ['处处闻啼鸟','花落知多少','夜来风雨声','疑是地上霜'], answer: '处处闻啼鸟', hints: ['孟浩然《春晓》'], explain: '《春晓》第二句', topic: '古诗', lv: 1 },
      { q: 'apple 的中文意思是？', type: 'choice', options: ['苹果','香蕉','桃子','橘子'], answer: '苹果', hints: ['fruit'], explain: 'apple = 苹果', topic: '单词', lv: 1 },
    ];
    audio.sfxCorrect();
    status.innerHTML = `✅ 示例已加载（${demo.length} 题）`;
    result.innerHTML = demo.map(q => `<div class="ph-q">${q.q} → <b>${q.answer}</b></div>`).join('');
  };
}

// ---------- 设置（重写：丰富） ----------
const AI_PRESETS = [
  { key: 'openrouter', label: 'OpenRouter (全模型)', url: 'https://openrouter.ai/api/v1/chat/completions', model: 'openai/gpt-4o' },
  { key: 'openai', label: 'OpenAI 官方', url: 'https://api.openai.com/v1/chat/completions', model: 'gpt-4o' },
  { key: 'kimi', label: 'Kimi (Moonshot)', url: 'https://api.moonshot.cn/v1/chat/completions', model: 'moonshot-v1-8k-vision-preview' },
  { key: 'local', label: '本机代理（默认）', url: '/v1/chat/completions', model: 'openai/gpt-4o' },
];

const TTS_VOICES = [
  { key: 'zf_xiaoxiao', label: '小晓 (女声)' },
  { key: 'zf_xiaoyi', label: '小怡 (女声)' },
  { key: 'zm_yunjian', label: '云剑 (男声)' },
  { key: 'zm_yunxia', label: '云霞 (女声)' },
  { key: 'saturn_zh_female_keainvsheng_tob', label: '可爱女生 (火山引擎)' },
  { key: 'zh_female_vv_uranus_bigtts', label: 'vivi (火山引擎)' },
];

function openSettings() {
  const overlay = ensureOverlay('settings');
  const cfg = loadAICfg();
  overlay.innerHTML = `<div class="st-panel">
    <div class="st-head"><h2>⚙️ 设置</h2><button class="st-close">×</button></div>
    <div class="st-section">
      <div class="st-stitle">AI 厂商预设</div>
      <div class="st-presets">
        ${AI_PRESETS.map(p => `<button class="st-preset" data-k="${p.key}">${p.label}</button>`).join('')}
      </div>
    </div>
    <div class="st-section">
      <label>AI URL <input id="ai_url" value="${cfg.ai_url}"></label>
      <label>AI 模型 <input id="ai_model" value="${cfg.ai_model}"></label>
      <label>AI Key <input id="ai_key" type="password" value="${cfg.ai_key || ''}" placeholder="sk-..."></label>
      <button class="st-test-ai">🔌 测试 AI 连通</button>
    </div>
    <div class="st-section">
      <label>TTS URL <input id="tts_url" value="${cfg.tts_url}"></label>
      <label>TTS 音色
        <select id="tts_voice">
          ${TTS_VOICES.map(v => `<option value="${v.key}" ${cfg.tts_voice === v.key ? 'selected' : ''}>${v.label}</option>`).join('')}
        </select>
      </label>
      <label>TTS 语速 <input id="tts_rate" type="number" step="0.05" min="0.5" max="2" value="${cfg.tts_rate}"></label>
      <button class="st-test-tts">🔊 试听语音</button>
    </div>
    <div class="st-section">
      <button class="st-save">💾 保存</button>
      <button class="st-reset">⚠️ 重置所有进度</button>
    </div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.st-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };

  // 预设按钮
  overlay.querySelectorAll('.st-preset').forEach(b => b.onclick = () => {
    audio.sfxClick();
    const p = AI_PRESETS.find(x => x.key === b.dataset.k);
    if (!p) return;
    $('#ai_url').value = p.url;
    $('#ai_model').value = p.model;
    toast(`已应用预设: ${p.label}`);
  });

  // 测试 AI 连通
  overlay.querySelector('.st-test-ai').onclick = async () => {
    audio.sfxClick();
    const tBtn = overlay.querySelector('.st-test-ai');
    tBtn.textContent = '🔌 测试中…';
    try {
      const url = $('#ai_url').value;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + $('#ai_key').value },
        body: JSON.stringify({
          model: $('#ai_model').value,
          messages: [{ role: 'user', content: '你好（一句话回复）' }],
          max_tokens: 10,
        }),
      });
      if (r.ok) { audio.sfxCorrect(); toast('✅ AI 连通正常'); }
      else { audio.sfxWrong(); toast(`❌ HTTP ${r.status}`); }
    } catch (e) {
      audio.sfxWrong();
      toast('❌ ' + e.message);
    }
    tBtn.textContent = '🔌 测试 AI 连通';
  };

  // 试听 TTS
  overlay.querySelector('.st-test-tts').onclick = async () => {
    audio.sfxClick();
    const c = collectCfg();
    saveAICfg(c); syncTTSConfig(); clearTTSCache();
    speak('你好小朋友，欢迎来到学霸奇遇记！', { interrupt: true });
  };

  function collectCfg() {
    return {
      ai_url: $('#ai_url').value, ai_model: $('#ai_model').value, ai_key: $('#ai_key').value,
      tts_url: $('#tts_url').value, tts_voice: $('#tts_voice').value,
      tts_rate: parseFloat($('#tts_rate').value) || 0.95,
    };
  }

  // 保存
  overlay.querySelector('.st-save').onclick = () => {
    audio.sfxCoin();
    saveAICfg(collectCfg()); syncTTSConfig(); clearTTSCache();
    toast('✅ 已保存'); overlay.classList.remove('show');
  };

  // 重置
  overlay.querySelector('.st-reset').onclick = async () => {
    audio.sfxClick();
    const ok = await showConfirm({ icon: '⚠️', title: '重置所有进度？', msg: '所有 EXP / 金币 / 宝石 / 成就都会清零', yes: '确定重置', no: '取消' });
    if (ok) { localStorage.removeItem(SAVE_KEY); location.reload(); }
  };
}

// ---------- 成就页 ----------
function openAchievements() {
  const overlay = ensureOverlay('achv');
  const owned = new Set(SAVE.achievements);
  overlay.innerHTML = `<div class="achv-panel">
    <div class="achv-head"><h2>🏆 成就 (${owned.size}/${ACHIEVEMENTS.length})</h2><button class="achv-close">×</button></div>
    <div class="achv-grid">
      ${ACHIEVEMENTS.map(a => `<div class="achv-card ${owned.has(a.key) ? 'unlocked' : 'locked'}">
        <div class="achv-ic">${owned.has(a.key) ? a.icon : '🔒'}</div>
        <div class="achv-n">${a.name}</div>
        <div class="achv-d">${a.desc}</div>
      </div>`).join('')}
    </div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.achv-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
}

// ---------- 每日任务 ----------
const DAILY_TASKS = [
  { key: 'correct_5',      label: '答对 5 题',         goal: 5,  test: (s, before) => s.stats.correct - (before.correct || 0) },
  { key: 'clear_1',        label: '通关 1 关',         goal: 1,  test: (s, before) => s.stats.levelsCleared - (before.levelsCleared || 0) },
  { key: 'try_engine',     label: '体验 1 种新玩法',   goal: 1,  test: () => 1 },  // 简单视为完成
  { key: 'photo',          label: '使用拍照出题',      goal: 1,  test: () => 0 },  // 占位
];

function refreshDailyTasks() {
  const today = new Date().toISOString().slice(0, 10);
  if (SAVE.dailyTasks.date !== today) {
    SAVE.dailyTasks = {
      date: today,
      baseStats: { correct: SAVE.stats.correct, levelsCleared: SAVE.stats.levelsCleared },
      tasks: {}, claimed: [],
    };
    persistSave();
  }
}

function openDaily() {
  refreshDailyTasks();
  const overlay = ensureOverlay('daily');
  const before = SAVE.dailyTasks.baseStats || { correct: 0, levelsCleared: 0 };
  overlay.innerHTML = `<div class="daily-panel">
    <div class="daily-head"><h2>📋 每日任务</h2><button class="daily-close">×</button></div>
    <div class="daily-streak">🔥 连续登录 <b>${SAVE.streak || 0}</b> 天</div>
    <div class="daily-list">
      ${DAILY_TASKS.map(t => {
        const progress = Math.min(t.goal, t.test(SAVE, before));
        const done = progress >= t.goal;
        const claimed = SAVE.dailyTasks.claimed.includes(t.key);
        return `<div class="daily-item ${done ? 'done' : ''}">
          <div class="daily-info">
            <div class="daily-l">${t.label}</div>
            <div class="daily-bar"><span style="width:${progress / t.goal * 100}%"></span></div>
            <div class="daily-p">${progress}/${t.goal}</div>
          </div>
          <button class="daily-claim" data-k="${t.key}" ${(!done || claimed) ? 'disabled' : ''}>
            ${claimed ? '✓ 已领' : done ? '🎁 领取' : '进行中'}
          </button>
        </div>`;
      }).join('')}
    </div>
    <div class="daily-tip">完成所有任务可获得额外金币奖励！</div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.daily-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  overlay.querySelectorAll('.daily-claim').forEach(b => b.onclick = () => {
    if (b.disabled) return;
    audio.sfxCoin();
    SAVE.gold = (SAVE.gold || 0) + 10;
    SAVE.dailyTasks.claimed.push(b.dataset.k);
    persistSave(); refreshAll();
    openDaily();  // 重渲染
    toast('🪙 +10 金币');
  });
}

function ensureOverlay(name) {
  const id = 'overlay-' + name;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div'); el.id = id; el.className = 'overlay';
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('show'); });
    document.body.appendChild(el);
  }
  return el;
}

// ---------- 启动 ----------
async function boot() {
  // 每日登录奖励
  const dailyReward = awardDaily(SAVE);
  if (dailyReward) {
    persistSave();
    setTimeout(() => {
      audio.sfxCoin();
      toast(`🎁 每日登录 +${dailyReward.gold} 金币 · 连续 ${dailyReward.streak} 天 🔥`, 3000);
    }, 800);
  }
  refreshAll();
  if (!$('#stage')) {
    const s = document.createElement('div'); s.id = 'stage'; s.className = 'stage';
    document.body.appendChild(s);
  }
  renderLevelSelect();
  // 检查启动时成就
  const newly = checkAchievements(SAVE);
  if (newly.length) { persistSave(); refreshAll(); }

  try {
    AVAILABILITY = await data.fetchAvailability();
    renderLevelSelect();
  } catch (e) { console.warn('[boot] availability 加载失败:', e.message); }
}

document.addEventListener('DOMContentLoaded', boot);
if (document.readyState !== 'loading') boot();
