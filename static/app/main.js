// 应用入口 — 视图路由 + 关卡选择 + 引擎实例化
//
// 设计说明：
//  - 关卡 = 题目集合 × 引擎玩法（解耦）
//  - 题目集合由 picker (lib/picker.js) 提供，参数：grade/subject/lv/topic/source
//  - 引擎玩法：battle / shooting / fighting
//  - 主页面只渲染骨架；引擎独占 #stage 容器内 DOM

import * as data from './data.js';
import { $, $$, toast, showConfirm, confetti, loadJSON, saveJSON } from './ui.js';
import { speak, preloadBattle, toggleVoice, isEnabled, stopSpeak, clearTTSCache } from './tts.js';
import { renderPet, evolveIfNeeded, petByExp } from './pets.js';
import { loadAICfg, saveAICfg, syncTTSConfig, explainQuestion, recognizeQuestionsFromPhoto, fileToBase64 } from './ai.js';

import { BattleEngine } from './engines/battle.js';
import { ShootingEngine } from './engines/shooting.js';
import { FightingEngine } from './engines/fighting.js';

const SAVE_KEY = 'scholar_odyssey_save_v1';
const DEFAULT_SAVE = {
  user: 'default',
  exp: 0,
  petStage: 0,
  gold: 0,
  achievements: [],
  prefs: { engine: 'battle', source: 'mixed' },
};

const SAVE = Object.assign({}, DEFAULT_SAVE, loadJSON(SAVE_KEY, {}));
SAVE.prefs = Object.assign({}, DEFAULT_SAVE.prefs, SAVE.prefs || {});
syncTTSConfig();

function persistSave() { saveJSON(SAVE_KEY, SAVE); }

// ---------- 顶部状态栏 ----------
function renderTopbar() {
  const bar = $('#topbar');
  if (!bar) return;
  const pet = petByExp(SAVE.exp || 0);
  bar.innerHTML = `
    <div class="tb-left">
      <span class="tb-pet">${pet.emoji} ${pet.name}</span>
      <span class="tb-exp">EXP ${SAVE.exp}</span>
      <span class="tb-gold">💎 ${SAVE.gold}</span>
    </div>
    <div class="tb-right">
      <button id="btn-voice" class="btn-mini">${isEnabled() ? '🔊' : '🔇'}</button>
      <button id="btn-photo" class="btn-mini">📷 拍照</button>
      <button id="btn-wrongbook" class="btn-mini">📚 错题</button>
      <button id="btn-settings" class="btn-mini">⚙️</button>
    </div>
  `;
  $('#btn-voice').addEventListener('click', () => {
    const on = toggleVoice();
    $('#btn-voice').textContent = on ? '🔊' : '🔇';
  });
  $('#btn-photo').addEventListener('click', openPhotoFlow);
  $('#btn-wrongbook').addEventListener('click', openWrongbook);
  $('#btn-settings').addEventListener('click', openSettings);
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
  { key: 'wrongbook-practice', label: '📚 错题练习' },
];

const sel = {
  grade: 1, subject: 'math', lv: 1, semester: '',
  engine: SAVE.prefs.engine || 'battle',
  source: SAVE.prefs.source || 'mixed',
  count: 10,
};

let AVAILABILITY = null;  // { [grade]: { [subject]: { semesters:[], lvs:[], cells:{} } } }

function isSubjectAvailable(grade, subject) {
  if (!AVAILABILITY) return true;
  return !!(AVAILABILITY[grade] && AVAILABILITY[grade][subject]);
}
function isLvAvailable(grade, subject, lv) {
  if (!AVAILABILITY) return true;
  const s = AVAILABILITY[grade]?.[subject];
  if (!s) return false;
  return s.lvs.includes(lv);
}
function isSemesterAvailable(grade, subject, semester) {
  if (!AVAILABILITY || !semester) return true;
  const s = AVAILABILITY[grade]?.[subject];
  if (!s) return false;
  return s.semesters.includes(semester);
}

function renderLevelSelect() {
  const home = $('#home');
  if (!home) return;
  // 自动修正：当前选的 subject/lv/semester 不可用时跳到第一个可用的
  if (AVAILABILITY) {
    if (!isSubjectAvailable(sel.grade, sel.subject)) {
      const firstAvail = SUBJECTS.find(s => isSubjectAvailable(sel.grade, s.key));
      if (firstAvail) sel.subject = firstAvail.key;
    }
    if (!isLvAvailable(sel.grade, sel.subject, sel.lv)) {
      const firstLv = [1,2,3].find(l => isLvAvailable(sel.grade, sel.subject, l));
      if (firstLv) sel.lv = firstLv;
    }
    if (sel.semester && !isSemesterAvailable(sel.grade, sel.subject, sel.semester)) {
      sel.semester = '';
    }
  }
  home.innerHTML = `
    <h1 class="home-title">🎓 学霸奇遇记</h1>
    <div class="ls-row"><span>年级</span>${[1,2,3,4,5,6].map(g => btn('g', g, '年级' + g, sel.grade === g, false)).join('')}</div>
    <div class="ls-row"><span>科目</span>${SUBJECTS.map(s => btn('s', s.key, s.icon + ' ' + s.label, sel.subject === s.key, !isSubjectAvailable(sel.grade, s.key))).join('')}</div>
    <div class="ls-row"><span>难度</span>${[1,2,3].map(l => btn('l', l, '⭐'.repeat(l), sel.lv === l, !isLvAvailable(sel.grade, sel.subject, l))).join('')}</div>
    <div class="ls-row"><span>学期</span>${[{k:'',n:'全部'},{k:'upper',n:'上册'},{k:'lower',n:'下册'}].map(s => btn('sm', s.k, s.n, sel.semester === s.k, s.k && !isSemesterAvailable(sel.grade, sel.subject, s.k))).join('')}</div>
    <div class="ls-row"><span>玩法</span>${ENGINES.map(e => btn('e', e.key, e.label, sel.engine === e.key, false)).join('')}</div>
    <div class="ls-row"><span>来源</span>${SOURCES.map(s => btn('src', s.key, s.label, sel.source === s.key, false)).join('')}</div>
    <div class="ls-row"><span>题数</span>${[5,10,15].map(c => btn('cnt', c, c + '题', sel.count === c, false)).join('')}</div>
    <button id="btn-start" class="btn-start">🚀 开始闯关</button>
  `;
  home.querySelectorAll('.ls-btn').forEach(b => {
    if (b.classList.contains('disabled')) return;  // 灰按钮不响应
    b.addEventListener('click', () => {
      const k = b.dataset.kind, v = b.dataset.val;
      if (k === 'g') sel.grade = Number(v);
      else if (k === 's') sel.subject = v;
      else if (k === 'l') sel.lv = Number(v);
      else if (k === 'sm') sel.semester = v;
      else if (k === 'e') { sel.engine = v; SAVE.prefs.engine = v; persistSave(); }
      else if (k === 'src') { sel.source = v; SAVE.prefs.source = v; persistSave(); }
      else if (k === 'cnt') sel.count = Number(v);
      renderLevelSelect();
    });
  });
  $('#btn-start').addEventListener('click', startLevel);
  function btn(kind, val, label, active, disabled) {
    const cls = ['ls-btn'];
    if (active) cls.push('active');
    if (disabled) cls.push('disabled');
    return `<button class="${cls.join(' ')}" data-kind="${kind}" data-val="${val}">${label}</button>`;
  }
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
    toast('抽题失败: ' + e.message); return;
  }
  if (!questions.length) {
    toast('该筛选条件下没有可用题目，请换组合（科目/难度/学期）'); return;
  }
  if (fallback) toast('⚠️ ' + fallback, 2400);
  if (questions.length < sel.count) toast(`⚠️ 题库仅 ${questions.length} 题（你选了 ${sel.count}）`, 2600);

  preloadBattle(questions);  // 主入口为题集预热 TTS（引擎内不直连 tts.js）

  const stage = $('#stage');
  stage.classList.add('show');
  $('#home').style.display = 'none';

  const EngineClass = sel.engine === 'shooting' ? ShootingEngine
                     : sel.engine === 'fighting' ? FightingEngine
                     : BattleEngine;

  const engine = new EngineClass({
    container: stage,
    questions,
    callbacks: {
      onCorrect: q => { SAVE.exp += 5; renderTopbar(); persistSave(); },
      onWrong: () => {},
      onWrongAdd: async (q, userAnswer) => {
        try {
          await data.wrongbookAdd(SAVE.user, {
            ...q, userAnswer, source: q.source || 'level',
          });
        } catch (e) { console.warn('wrongbookAdd 失败:', e); }
      },
      onComplete: async ({ result, stats }) => {
        await new Promise(r => setTimeout(r, 600));
        const evolved = evolveIfNeeded(SAVE);
        persistSave();
        renderTopbar();
        const summary = `${result === 'win' ? '🏆 胜利！' : result === 'fail' ? '💔 失败' : '✅ 完成'}\n答对 ${stats.correct}\n答错 ${stats.wrong}\n${stats.maxCombo ? '最高连击 ' + stats.maxCombo : ''}`;
        if (evolved) {
          toast(`${evolved.emoji} 进化为 ${evolved.name}！`, 3000);
          confetti(60);
        }
        await showConfirm({ icon: result === 'win' ? '🏆' : '🎯', title: '关卡结束', msg: summary, yes: '返回主页', no: '再来一关', danger: false }).then(go => {
          stage.classList.remove('show'); stage.innerHTML = '';
          $('#home').style.display = ''; renderLevelSelect();
          if (!go) startLevel();
        });
      },
      requestExplain: explainQuestion,
      requestTTS: text => { speak(text, { interrupt: true }); return Promise.resolve(); },
    },
  });
  // 提供退出按钮
  const back = document.createElement('button');
  back.className = 'btn-mini btn-stage-back';
  back.textContent = '← 退出';
  back.addEventListener('click', async () => {
    const ok = await showConfirm({ icon: '🚪', title: '退出关卡？', msg: '当前进度将丢失', yes: '退出', no: '继续' });
    if (ok) { engine.abort('aborted'); stage.classList.remove('show'); stage.innerHTML = ''; $('#home').style.display = ''; renderLevelSelect(); }
  });
  stage.appendChild(back);

  engine.run().catch(err => { console.error('engine error:', err); toast('引擎错误: ' + err.message); });
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
  overlay.querySelector('.wb-close').onclick = () => overlay.classList.remove('show');
  overlay.querySelector('.wb-clear').onclick = async () => {
    const ok = await showConfirm({ icon: '🗑', title: '清空错题本？', msg: '此操作不可恢复', yes: '清空', no: '取消' });
    if (ok) { await data.wrongbookClear(SAVE.user); openWrongbook(); }
  };
  overlay.querySelector('.wb-practice').onclick = () => {
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
        <div class="wb-ans">正解：${w.answer} · 我答：${w.userAnswer || '空'}</div>
        <button class="wb-del" data-id="${w.id}">删除</button>
      </div>
    `).join('');
    listEl.querySelectorAll('.wb-del').forEach(b => b.addEventListener('click', async e => {
      const id = e.target.dataset.id;
      await data.wrongbookDelete(SAVE.user, id);
      e.target.closest('.wb-item').remove();
    }));
  } catch (e) { overlay.querySelector('.wb-list').textContent = '加载失败: ' + e.message; }
}

// ---------- 拍照出题 ----------
async function openPhotoFlow() {
  const overlay = ensureOverlay('photo');
  overlay.innerHTML = `<div class="ph-panel">
    <div class="ph-head"><h2>📷 拍照出题</h2><button class="ph-close">×</button></div>
    <input type="file" accept="image/*" capture="environment" id="ph-input" />
    <div class="ph-status">选择一张作业照片，AI 自动识别题目</div>
    <div class="ph-result"></div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.ph-close').onclick = () => overlay.classList.remove('show');
  $('#ph-input').onchange = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    overlay.querySelector('.ph-status').textContent = '🤖 AI 识别中…';
    try {
      const dataUrl = await fileToBase64(file);
      const qs = await recognizeQuestionsFromPhoto(dataUrl);
      if (!qs.length) { overlay.querySelector('.ph-status').textContent = '未识别到题目，请重拍'; return; }
      // 入库
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
      overlay.querySelector('.ph-status').textContent = `✅ 已识别 ${qs.length} 题，入库 ${inserted} 条`;
      overlay.querySelector('.ph-result').innerHTML = qs.slice(0, 5).map(q => `<div class="ph-q">${q.q} → ${q.answer}</div>`).join('');
    } catch (err) { overlay.querySelector('.ph-status').textContent = '识别失败: ' + err.message; }
  };
}

// ---------- 设置 ----------
function openSettings() {
  const overlay = ensureOverlay('settings');
  const cfg = loadAICfg();
  overlay.innerHTML = `<div class="st-panel">
    <div class="st-head"><h2>⚙️ 设置</h2><button class="st-close">×</button></div>
    <label>AI URL <input id="ai_url" value="${cfg.ai_url}"></label>
    <label>AI 模型 <input id="ai_model" value="${cfg.ai_model}"></label>
    <label>AI Key <input id="ai_key" type="password" value="${cfg.ai_key || ''}"></label>
    <label>TTS URL <input id="tts_url" value="${cfg.tts_url}"></label>
    <label>TTS 音色 <input id="tts_voice" value="${cfg.tts_voice}"></label>
    <label>TTS 语速 <input id="tts_rate" type="number" step="0.05" value="${cfg.tts_rate}"></label>
    <button class="st-save">保存</button>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.st-close').onclick = () => overlay.classList.remove('show');
  overlay.querySelector('.st-save').onclick = () => {
    const c = {
      ai_url: $('#ai_url').value, ai_model: $('#ai_model').value, ai_key: $('#ai_key').value,
      tts_url: $('#tts_url').value, tts_voice: $('#tts_voice').value, tts_rate: parseFloat($('#tts_rate').value) || 0.95,
    };
    saveAICfg(c); syncTTSConfig(); clearTTSCache();
    toast('已保存'); overlay.classList.remove('show');
  };
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
  renderTopbar();
  renderPet($('#pet-area'), SAVE);
  if (!$('#stage')) {
    const s = document.createElement('div'); s.id = 'stage'; s.className = 'stage';
    document.body.appendChild(s);
  }
  // 先渲染（用 cached/无可用性的版本），再异步刷新
  renderLevelSelect();
  try {
    AVAILABILITY = await data.fetchAvailability();
    renderLevelSelect();  // 重渲染应用 disabled 状态
  } catch (e) {
    console.warn('[boot] availability 加载失败:', e.message);
  }
}

document.addEventListener('DOMContentLoaded', boot);
if (document.readyState !== 'loading') boot();
