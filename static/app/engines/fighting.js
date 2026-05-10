// FightingEngine — 格斗关：双方血条 / 招式 / Combo / Boss 多阶段
//
// 玩法：
//  - 玩家 vs Boss 血条对决
//  - 选项 = 招式（A 拳 / B 腿 / C 重击 / D 必杀）
//  - 答对：出招命中 Boss
//  - 答错：被反击扣血
//  - 连续 3 题正确 → 必杀技动画 + 双倍伤害
//  - Boss HP 50% / 25% 切换形态，反击伤害递增

import { LevelEngine, isCorrect, makeChoiceOptions } from './base.js';
import { confetti } from '../ui.js';
import * as fx from '../fx.js';

const PUNCH_EMOJIS = ['👊', '🤛', '🦵', '💢'];
const HIT_EMOJIS   = ['💥', '✦', '💢', '⚡'];

const TPL = `
<div class="fighting" id="bg-fighting">
  <div class="ft-top">
    <div class="ft-bar">
      <span>玩家</span>
      <div class="ft-track"><div class="ft-fill p-hp" style="width:100%"></div></div>
    </div>
    <div class="ft-vs">VS</div>
    <div class="ft-bar boss">
      <div class="ft-track"><div class="ft-fill b-hp" style="width:100%"></div></div>
      <span>BOSS</span>
    </div>
  </div>
  <div class="ft-arena">
    <div class="ft-hero">🥋</div>
    <div class="ft-fx-layer"></div>
    <div class="ft-boss">👺</div>
  </div>
  <div class="ft-combo">COMBO × <span class="ft-combo-n">0</span></div>
  <div class="ft-q"></div>
  <div class="ft-actions"><button class="btn-mini btn-tts">🔊 朗读</button></div>
  <div class="ft-moves"></div>
</div>
`;

const MOVES = [
  { key: 'A', label: '拳' },
  { key: 'B', label: '腿' },
  { key: 'C', label: '重击' },
  { key: 'D', label: '必杀' },
];

export class FightingEngine extends LevelEngine {
  constructor(opts) {
    super(opts);
    this.playerHp = 100;
    this.bossHp = 100;
    this.combo = 0;
    this.maxCombo = 0;
    this.bossPhase = 1;  // 1 → 2 → 3
  }

  async start() {
    this.container.innerHTML = TPL;
    this._heroEl = this.container.querySelector('.ft-hero');
    this._bossEl = this.container.querySelector('.ft-boss');
    this._fx = this.container.querySelector('.ft-fx-layer');
    this._qEl = this.container.querySelector('.ft-q');
    this._movesEl = this.container.querySelector('.ft-moves');
    this._comboN = this.container.querySelector('.ft-combo-n');
    this._pHp = this.container.querySelector('.p-hp');
    this._bHp = this.container.querySelector('.b-hp');
    this.container.querySelector('.btn-tts').addEventListener('click', () => {
      const q = this.current(); if (q) this.callbacks.requestTTS?.(q.q);
    });
  }

  async ask(q) {
    this._qEl.textContent = q.q;
    this._movesEl.innerHTML = '';
    const opts = makeChoiceOptions(q, 4);

    // 上一轮 ask 的键盘监听（如还在）必须先卸载
    this._removeAskListeners?.();

    return new Promise(resolve => {
      let resolved = false;
      const finish = (userAnswer, sourceEl) => {
        if (resolved) return; resolved = true;
        const correct = isCorrect(q, userAnswer);
        this._markAnswered(q, userAnswer, sourceEl, correct);
        resolve({ userAnswer, correct });
      };

      // 累积当前轮的 keydown 监听器；既登记到基类 _listeners（destroy 兜底卸载），
      // 也维护一个"按 ask 卸载"的回调，避免堆积
      const askKeyHandlers = [];
      opts.forEach((opt, i) => {
        const move = MOVES[i] || { key: '?', label: '招' };
        const btn = document.createElement('button');
        btn.className = 'ft-move';
        btn.innerHTML = `<span class="ft-move-k">${move.key}</span><span class="ft-move-l">${move.label}</span><span class="ft-move-o">${opt}</span>`;
        btn.dataset.answer = opt;
        this._on(btn, 'click', () => finish(opt, btn));
        const keyHandler = e => { if (e.key.toUpperCase() === move.key) finish(opt, btn); };
        document.addEventListener('keydown', keyHandler);
        askKeyHandlers.push(keyHandler);
        this._movesEl.appendChild(btn);
      });
      this._removeAskListeners = () => {
        for (const h of askKeyHandlers) document.removeEventListener('keydown', h);
        this._removeAskListeners = null;
      };
    });
  }

  _markAnswered(q, _userAnswer, sourceEl, correct) {
    const buttons = Array.from(this._movesEl.querySelectorAll('button'));
    for (const btn of buttons) {
      btn.disabled = true;
      btn.classList.add('answered');
      if (isCorrect(q, btn.dataset.answer || btn.textContent)) btn.classList.add('correct');
    }
    if (sourceEl) {
      sourceEl.classList.add('selected');
      sourceEl.classList.add(correct ? 'correct' : 'wrong');
    }
  }

  async onAnswer(_q, _ua, correct) {
    this._removeAskListeners?.();

    if (correct) {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this._comboN.textContent = this.combo;
      let dmg = 12;
      const isUlt = this.combo >= 3;
      if (isUlt) {
        dmg *= 2;
        fx.slowMotion(450);
        fx.bigText(this.container, '💥 必杀技！', { crit: true });
        fx.flashScreen('#ffcf4b', 180);
      }

      // 1. 拳影从玩家飞出
      const heroRect = this._heroEl.getBoundingClientRect();
      const bossRect = this._bossEl.getBoundingClientRect();
      const hx = heroRect.left + heroRect.width / 2;
      const hy = heroRect.top + heroRect.height / 2;
      fx.trailImage(PUNCH_EMOJIS[Math.floor(Math.random() * PUNCH_EMOJIS.length)], hx + 60, hy);

      // 2. 拳到 Boss 后 hitstop + 闪光 + 震屏 + 浮字 + 粒子
      const tx = bossRect.left + bossRect.width / 2;
      const ty = bossRect.top + bossRect.height / 2;
      await fx.projectile(this._heroEl, this._bossEl, { emoji: '⚡', duration: 200 });
      fx.hitstop(isUlt ? 150 : 90);
      fx.flashScreen(isUlt ? '#fff' : 'rgba(255,255,255,.4)', 80);
      fx.flinch(this._bossEl, isUlt ? 2 : 1);
      fx.impactRing(tx, ty, '#ffcf4b');
      fx.impactBurst(tx, ty, { count: isUlt ? 16 : 10, symbols: HIT_EMOJIS, color: isUlt ? '#ff4040' : '#ffcf4b' });
      fx.damageNumber(tx, ty - 20, dmg, { crit: isUlt });
      fx.screenShake(isUlt ? 3 : 1);

      this.bossHp = Math.max(0, this.bossHp - dmg);
      this._bHp.style.width = this.bossHp + '%';

      // 阶段切换
      if (this.bossHp <= 50 && this.bossPhase === 1) {
        this.bossPhase = 2;
        this._bossEl.classList.add('phase-2');
        fx.bigText(this.container, '⚠️ Boss 觉醒！', { color: '#ff9a3d', duration: 1300 });
        fx.flashScreen('#ff4040', 120);
        fx.screenShake(2);
      } else if (this.bossHp <= 25 && this.bossPhase === 2) {
        this.bossPhase = 3;
        this._bossEl.classList.add('phase-3');
        fx.bigText(this.container, '🔥 Boss 怒吼！', { color: '#ff4040', duration: 1500, crit: true });
        fx.flashScreen('#ff4040', 200);
        fx.screenShake(3);
      }
      if (this.bossHp <= 0) {
        this.stats.ended = true;
        fx.bigText(this.container, 'K.O.!', { crit: true, duration: 1800 });
        fx.flashScreen('#fff', 200);
        fx.screenShake(3);
      }
    } else {
      this.combo = 0;
      this._comboN.textContent = 0;
      const counterDmg = 8 * this.bossPhase;

      // Boss 反击：拳影从 Boss 飞向玩家
      await fx.projectile(this._bossEl, this._heroEl, { emoji: '💢', duration: 220 });
      const heroRect = this._heroEl.getBoundingClientRect();
      const hx = heroRect.left + heroRect.width / 2;
      const hy = heroRect.top + heroRect.height / 2;
      fx.hitstop(80);
      fx.flashScreen('rgba(255,80,80,.5)', 100);
      fx.flinch(this._heroEl, this.bossPhase >= 2 ? 2 : 1);
      fx.impactRing(hx, hy, '#ff6b6b');
      fx.impactBurst(hx, hy, { count: 8, symbols: ['💥', '✖', '💢'], color: '#ff6b6b' });
      fx.damageNumber(hx, hy - 20, counterDmg, { prefix: '-' });
      fx.screenShake(this.bossPhase);

      this.playerHp = Math.max(0, this.playerHp - counterDmg);
      this._pHp.style.width = this.playerHp + '%';

      if (this.playerHp <= 0) {
        this.stats.ended = true;
        fx.bigText(this.container, '💔 GAME OVER', { color: '#ff4040', duration: 1800 });
      }
    }
    await new Promise(r => setTimeout(r, 380));
  }

  async finish() {
    this._removeAskListeners?.();
    if (this.bossHp <= 0) {
      confetti(50);
      fx.bigText(this.container, '🏆 VICTORY!', { color: '#ffcf4b', duration: 2000, crit: true });
      return { result: 'win', stats: { maxCombo: this.maxCombo } };
    }
    if (this.playerHp <= 0) {
      return { result: 'fail', stats: { maxCombo: this.maxCombo } };
    }
    return { result: 'complete', stats: { maxCombo: this.maxCombo } };
  }

  destroy() {
    this._removeAskListeners?.();
    super.destroy();
  }
}
