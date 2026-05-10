// ShootingEngine — 射击关：靶心 / 倒计时 / 移动靶 / 怪物突破
//
// 玩法：
//  - 题目选项 = 多个靶子，正确选项为靶心
//  - 每题倒计时（lv1=15s, lv2=10s, lv3=6s）；超时算错
//  - 怪物从右侧推进，答错 / 超时怪物前进一格
//  - 5 个怪物突破防线 = 关卡失败
//  - 答对一题击杀一只靠近的怪物

import { LevelEngine, isCorrect, makeChoiceOptions } from './base.js';
import { confetti } from '../ui.js';
import * as fx from '../fx.js';

const LV_TIMES = { 1: 15, 2: 10, 3: 6 };

const TPL = `
<div class="shooting" id="bg-shooting">
  <div class="sh-top">
    <div class="sh-score">得分 <span class="sh-score-n">0</span></div>
    <div class="sh-time">⏱ <span class="sh-time-n">0</span></div>
    <div class="sh-defense">防线 <span class="sh-def-n">5</span> / 5</div>
  </div>
  <div class="sh-arena">
    <div class="sh-monsters"></div>
    <div class="sh-q"></div>
    <button class="btn-mini btn-tts sh-tts">🔊 朗读</button>
    <div class="sh-targets"></div>
  </div>
</div>
`;

export class ShootingEngine extends LevelEngine {
  constructor(opts) {
    super(opts);
    this.score = 0;
    this.defense = 5;
    this.monsters = []; // {el, distance: 0..5}
    this._timer = null;
    this._timeLeft = 0;
  }

  async start() {
    this.container.innerHTML = TPL;
    this._scoreN = this.container.querySelector('.sh-score-n');
    this._timeN = this.container.querySelector('.sh-time-n');
    this._defN = this.container.querySelector('.sh-def-n');
    this._monstersEl = this.container.querySelector('.sh-monsters');
    this._qEl = this.container.querySelector('.sh-q');
    this._targetsEl = this.container.querySelector('.sh-targets');
    this.container.querySelector('.btn-tts').addEventListener('click', () => {
      const q = this.current(); if (q) this.callbacks.requestTTS?.(q.q);
    });

    // 初始化几只远处的怪物
    for (let i = 0; i < 3; i++) this._spawnMonster();
  }

  _spawnMonster() {
    const el = document.createElement('div');
    el.className = 'sh-monster';
    el.textContent = ['💀', '👹', '👺', '🧟'][Math.floor(Math.random() * 4)];
    el.style.right = '5%';
    el.style.top = (10 + Math.random() * 60) + '%';
    this._monstersEl.appendChild(el);
    this.monsters.push({ el, distance: 0 });
  }

  _advanceMonsters() {
    for (const m of this.monsters) {
      m.distance++;
      m.el.style.right = (5 + m.distance * 12) + '%';
      if (m.distance >= 5) {
        // 突破：怪物到达防线 — 强烈反馈
        const r = m.el.getBoundingClientRect();
        fx.flashScreen('rgba(255,40,40,.7)', 200);
        fx.screenShake(3);
        fx.bigText(this.container, '⚠ BREACH!', { color: '#ff4040', duration: 800 });
        fx.impactBurst(r.left + r.width / 2, r.top + r.height / 2, { count: 12, symbols: ['💢', '💥', '✖'], color: '#ff4040' });
        m.el.classList.add('breached');
        setTimeout(() => m.el.remove(), 400);
      }
    }
    const breached = this.monsters.filter(m => m.distance >= 5).length;
    this.monsters = this.monsters.filter(m => m.distance < 5);
    if (breached) {
      this.defense -= breached;
      this._defN.textContent = Math.max(0, this.defense);
      if (this.defense <= 0) {
        this.stats.ended = true;
        fx.bigText(this.container, '💔 DEFENSE FAILED', { color: '#ff4040', duration: 1600, crit: true });
      }
    }
  }

  _killClosestMonster() {
    if (!this.monsters.length) return null;
    this.monsters.sort((a, b) => b.distance - a.distance);
    const dead = this.monsters.shift();
    const r = dead.el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    fx.hitstop(60);
    fx.flashScreen('rgba(255,255,255,.4)', 60);
    fx.flinch(dead.el, 2);
    fx.impactRing(x, y, '#ffcf4b');
    fx.impactBurst(x, y, { count: 10, symbols: ['💥', '✦', '⚡', '✺'], color: '#ffcf4b' });
    fx.damageNumber(x, y - 10, '+10', { crit: true });
    fx.screenShake(1);
    dead.el.classList.add('killed');
    setTimeout(() => dead.el.remove(), 500);
    return { x, y };
  }

  async ask(q) {
    this._qEl.textContent = q.q;
    this._targetsEl.innerHTML = '';
    const opts = makeChoiceOptions(q, 4);

    return new Promise(resolve => {
      let resolved = false;
      const finish = (userAnswer, sourceEl) => {
        if (resolved) return; resolved = true;
        clearInterval(this._timer); this._timer = null;
        const correct = isCorrect(q, userAnswer);
        this._markAnswered(q, userAnswer, sourceEl, correct);
        resolve({ userAnswer: userAnswer || '', correct });
      };

      for (const opt of opts) {
        const btn = document.createElement('button');
        btn.className = 'sh-target';
        btn.textContent = opt;
        btn.dataset.answer = opt;
        // 添加随机摆动
        btn.style.left = (10 + Math.random() * 70) + '%';
        btn.style.top = (40 + Math.random() * 30) + '%';
        btn.addEventListener('click', () => finish(opt, btn));
        this._targetsEl.appendChild(btn);
      }

      // 倒计时
      const lv = q.lv || 1;
      this._timeLeft = LV_TIMES[lv] || 10;
      this._timeN.textContent = this._timeLeft;
      this._timer = setInterval(() => {
        this._timeLeft--;
        this._timeN.textContent = this._timeLeft;
        if (this._timeLeft <= 0) finish('');
      }, 1000);
    });
  }

  _markAnswered(q, _userAnswer, sourceEl, correct) {
    const buttons = Array.from(this._targetsEl.querySelectorAll('button'));
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
    if (correct) {
      this.score += 10;
      this._scoreN.textContent = this.score;
      // 醒目动画 — 即使马上跳到下一题也能感知
      this._scoreN.classList.remove('sh-score-pop');
      void this._scoreN.offsetWidth;  // 触发 reflow 重启动画
      this._scoreN.classList.add('sh-score-pop');
      this._killClosestMonster();
    } else {
      // 错答 = 怪物前进 = 屏幕震动 + 红闪
      fx.flashScreen('rgba(255,80,80,.4)', 100);
      fx.screenShake(2);
      this._advanceMonsters();
      if (Math.random() < 0.4 && this.monsters.length < 8) this._spawnMonster();
    }
    await new Promise(r => setTimeout(r, 250));
  }

  async finish() {
    if (this.defense <= 0) {
      return { result: 'fail', stats: { score: this.score } };
    }
    confetti(40);
    fx.bigText(this.container, `🎯 TARGET CLEARED  ${this.score}`, { color: '#ffcf4b', duration: 1800, crit: true });
    fx.flashScreen('#fff', 200);
    return { result: 'win', stats: { score: this.score } };
  }

  destroy() {
    if (this._timer) clearInterval(this._timer);
    super.destroy();
  }
}
