// BattleEngine — 能量弹打怪 (从 index.html 现有逻辑迁移)
// 视觉 / CSS 依赖于 index.html 中的 .battle / .hp-fill / .combo / 等 class
//
// 题目集合与玩法解耦：传入任意 questions 数组都能跑

import { LevelEngine, isCorrect } from './base.js';
import { confetti, $ } from '../ui.js';
import * as fx from '../fx.js';

const TPL = `
<div class="battle" id="bg-battle">
  <div class="battle-top">
    <div class="hp-bar"><span>玩家 HP</span><div class="hp-track"><div class="hp-fill p-hp" style="width:100%"></div></div></div>
    <div class="combo">连击 <span class="combo-n">0</span></div>
    <div class="hp-bar boss"><span>BOSS HP</span><div class="hp-track"><div class="hp-fill b-hp" style="width:100%"></div></div></div>
  </div>
  <div class="arena">
    <div class="hero">🧒</div>
    <div class="boss">👹</div>
    <div class="fx-layer"></div>
  </div>
  <div class="qbox">
    <div class="q-text"></div>
    <div class="q-options"></div>
    <div class="q-actions">
      <button class="btn-mini btn-tts">🔊 朗读</button>
      <button class="btn-mini btn-hint">💡 提示</button>
    </div>
  </div>
</div>
`;

export class BattleEngine extends LevelEngine {
  constructor(opts) {
    super(opts);
    this.playerHp = opts.config?.playerHp ?? 100;
    this.bossHp = opts.config?.bossHp ?? 100;
    this.bossHpMax = this.bossHp;
    this.combo = 0;
    this.maxCombo = 0;
    // 道具效果
    this.E = opts.config?.itemEffects || {};
    this.shieldRemain = this.E.shieldCharges || 0;
    this.reviveRemain = this.E.revive || 0;
  }

  async start() {
    this.container.innerHTML = TPL;
    this._heroEl = this.container.querySelector('.hero');
    this._bossEl = this.container.querySelector('.boss');
    this._fxLayer = this.container.querySelector('.fx-layer');
    this._qText = this.container.querySelector('.q-text');
    this._qOptions = this.container.querySelector('.q-options');
    this._comboN = this.container.querySelector('.combo-n');
    this._pHp = this.container.querySelector('.p-hp');
    this._bHp = this.container.querySelector('.b-hp');

    this.container.querySelector('.btn-tts').addEventListener('click', () => {
      const q = this.current(); if (q) this.callbacks.requestTTS?.(q.q);
    });
    this.container.querySelector('.btn-hint').addEventListener('click', () => this._showHint());
  }

  async ask(q) {
    this._qText.textContent = q.q;
    this._qOptions.innerHTML = '';
    this._hintIdx = 0;
    if (q.type === 'choice' && Array.isArray(q.options)) {
      for (const opt of q.options) {
        const btn = document.createElement('button');
        btn.className = 'q-opt';
        btn.textContent = opt;
        btn.dataset.answer = opt;
        btn.addEventListener('click', () => this._submit(opt, btn));
        this._qOptions.appendChild(btn);
      }
    } else {
      const inp = document.createElement('input');
      inp.className = 'q-input';
      inp.placeholder = '输入答案后回车';
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') this._submit(inp.value.trim());
      });
      this._qOptions.appendChild(inp);
      const ok = document.createElement('button');
      ok.className = 'q-opt';
      ok.textContent = '提交';
      ok.addEventListener('click', () => this._submit(inp.value.trim(), ok));
      this._qOptions.appendChild(ok);
      setTimeout(() => inp.focus(), 50);
    }

    // 道具：全知之眼 — 自动显示首条提示
    if (this.E.autoHint && Array.isArray(q.hints) && q.hints.length) {
      setTimeout(() => this._showHint(), 200);
    }
    return new Promise(resolve => { this._resolveAnswer = resolve; });
  }

  _submit(userAnswer, sourceEl) {
    if (!this._resolveAnswer) return;
    const q = this.current();
    const correct = isCorrect(q, userAnswer);
    this._markAnswered(q, userAnswer, sourceEl, correct);
    const r = this._resolveAnswer; this._resolveAnswer = null;
    r({ userAnswer, correct });
  }

  _markAnswered(q, userAnswer, sourceEl, correct) {
    const buttons = Array.from(this._qOptions.querySelectorAll('button'));
    for (const btn of buttons) {
      btn.disabled = true;
      btn.classList.add('answered');
      const answer = btn.dataset.answer ?? btn.textContent;
      if (isCorrect(q, answer)) btn.classList.add('correct');
    }
    if (sourceEl) {
      sourceEl.classList.add('selected');
      sourceEl.classList.add(correct ? 'correct' : 'wrong');
    }
    const input = this._qOptions.querySelector('input');
    if (input) {
      input.disabled = true;
      input.classList.add(correct ? 'correct' : 'wrong');
    }
  }

  async onAnswer(q, userAnswer, correct) {
    if (correct) {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this._comboN.textContent = this.combo;
      let dmg = 10 + Math.min(20, this.combo * 2);
      // 道具：闪电之剑 = 伤害倍率
      if (this.E.damageMultiplier && this.E.damageMultiplier > 1) {
        dmg = Math.round(dmg * this.E.damageMultiplier);
      }
      // 道具：暴击护符 = 30% 概率额外暴击
      let isCrit = this.combo >= 3;
      if (this.E.critChance && Math.random() < this.E.critChance) {
        isCrit = true;
        dmg = Math.round(dmg * (this.E.critMultiplier || 2));
      }
      const isCombo = isCrit || this.combo >= 3;

      // 能量弹飞向 Boss → hitstop → 闪光 → 浮字 → 爆裂粒子
      await fx.projectile(this._heroEl, this._bossEl, { emoji: '⚡', size: 36, duration: 280 });
      fx.hitstop(isCombo ? 100 : 60);
      fx.flashScreen(isCombo ? 'rgba(255,207,75,.6)' : 'rgba(255,255,255,.35)', 70);
      const bossRect = this._bossEl.getBoundingClientRect();
      const tx = bossRect.left + bossRect.width / 2;
      const ty = bossRect.top + bossRect.height / 2;
      fx.flinch(this._bossEl, isCombo ? 2 : 1);
      fx.impactRing(tx, ty, isCombo ? '#ffcf4b' : '#fff');
      fx.impactBurst(tx, ty, { count: isCombo ? 12 : 8, symbols: ['✦', '✧', '★', '⚡'], color: '#ffcf4b' });
      fx.damageNumber(tx, ty - 20, dmg, { crit: isCombo });
      fx.screenShake(isCombo ? 2 : 1);

      this.bossHp = Math.max(0, this.bossHp - dmg);
      this._bHp.style.width = (this.bossHp / this.bossHpMax * 100) + '%';

      if (isCombo && this.combo % 3 === 0) {
        fx.bigText(this.container, `${this.combo} COMBO!`, { color: '#ffcf4b', duration: 900 });
      }

      if (this.bossHp <= 0) {
        this.stats.ended = true;
        fx.bigText(this.container, '🏆 击败 BOSS!', { crit: true, color: '#ffcf4b', duration: 1600 });
        fx.flashScreen('#fff', 240);
        fx.screenShake(3);
        confetti(50);
      }
    } else {
      this.combo = 0;
      this._comboN.textContent = 0;

      // 道具：守护盾 = 答错不扣血（消耗一层盾）
      if (this.shieldRemain > 0) {
        this.shieldRemain--;
        const heroRect = this._heroEl.getBoundingClientRect();
        const hx = heroRect.left + heroRect.width / 2;
        const hy = heroRect.top + heroRect.height / 2;
        fx.flashScreen('rgba(80,180,255,.4)', 80);
        fx.impactRing(hx, hy, '#6cdcff');
        fx.bigText(this.container, `🛡 守护盾抵挡 (剩 ${this.shieldRemain})`, { color: '#6cdcff', duration: 800 });
        await new Promise(r => setTimeout(r, 380));
        return;
      }

      // Boss 反击
      await fx.projectile(this._bossEl, this._heroEl, { emoji: '💢', size: 32, duration: 240 });
      const heroRect = this._heroEl.getBoundingClientRect();
      const hx = heroRect.left + heroRect.width / 2;
      const hy = heroRect.top + heroRect.height / 2;
      fx.hitstop(70);
      fx.flashScreen('rgba(255,80,80,.45)', 80);
      fx.flinch(this._heroEl, 1);
      fx.impactBurst(hx, hy, { count: 6, symbols: ['💥', '✖'], color: '#ff6b6b' });
      fx.damageNumber(hx, hy - 20, 15, { prefix: '-' });
      fx.screenShake(2);

      this.playerHp = Math.max(0, this.playerHp - 15);
      this._pHp.style.width = this.playerHp + '%';

      if (this.playerHp <= 0) {
        // 道具：复活卷
        if (this.reviveRemain > 0) {
          this.reviveRemain--;
          this.playerHp = 50;
          this._pHp.style.width = '50%';
          fx.flashScreen('rgba(255,207,75,.7)', 320);
          fx.bigText(this.container, '❤️ 凤凰复活!', { crit: true, color: '#ffcf4b', duration: 1400 });
          confetti(40);
        } else {
          this.stats.ended = true;
          fx.bigText(this.container, '💔 GAME OVER', { color: '#ff4040', duration: 1600 });
        }
      }
    }
    await new Promise(r => setTimeout(r, 380));
  }

  async finish() {
    if (this.bossHp <= 0) {
      return { result: 'win', stats: { maxCombo: this.maxCombo } };
    }
    if (this.playerHp <= 0) {
      return { result: 'fail', stats: { maxCombo: this.maxCombo } };
    }
    return { result: 'complete', stats: { maxCombo: this.maxCombo } };
  }

  _showHint() {
    const q = this.current();
    if (!q || !Array.isArray(q.hints) || !q.hints.length) return;
    const idx = (this._hintIdx || 0) % q.hints.length;
    this._hintIdx = (this._hintIdx || 0) + 1;
    this.callbacks.requestTTS?.(q.hints[idx]);
    const bubble = document.createElement('div');
    bubble.className = 'hint-bubble';
    bubble.textContent = q.hints[idx];
    this.container.querySelector('.qbox').appendChild(bubble);
    setTimeout(() => bubble.remove(), 2500);
  }
}
