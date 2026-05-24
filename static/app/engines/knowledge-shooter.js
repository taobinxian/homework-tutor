// KnowledgeShooterEngine — 知识补给驱动的轻量射击闯关
// Phase 1 目标：可玩闭环，不追求复杂美术。学习题只出现在补给/Boss 机制，战斗阶段连续操作。

import { LevelEngine, isCorrect, makeChoiceOptions } from './base.js';
import { confetti } from '../ui.js';
import * as fx from '../fx.js';
import { computeSupplyResources, addResources } from './resources.js';

const TPL = `
<div class="ks" id="bg-knowledge-shooter">
  <div class="ks-top">
    <div>关卡 <b class="ks-level">知识战场</b></div>
    <div>HP <b class="ks-hp">100</b></div>
    <div>弹药 <b class="ks-ammo">0</b></div>
    <div>护盾 <b class="ks-shield">0</b></div>
    <div>波次 <b class="ks-wave">补给</b></div>
  </div>
  <div class="ks-arena">
    <div class="ks-bg-stars"></div>
    <div class="ks-player">🧑‍🚀</div>
    <div class="ks-pet">🐣</div>
    <div class="ks-enemies"></div>
    <div class="ks-bullets"></div>
    <div class="ks-boss" style="display:none">👾<div class="ks-boss-hp"><span></span></div></div>
    <div class="ks-banner"></div>
  </div>
  <div class="ks-controls">
    <button class="ks-move" data-dir="left">⬅️</button>
    <button class="ks-move" data-dir="right">➡️</button>
    <button class="ks-fire">🔫 发射</button>
    <button class="ks-skill">💥 爆裂</button>
    <button class="ks-ult">⚡ 大招</button>
  </div>
  <div class="ks-panel"></div>
</div>`;

export class KnowledgeShooterEngine extends LevelEngine {
  constructor(opts) {
    super(opts);
    this.level = opts.config?.level || {};
    this.runId = opts.config?.runId || '';
    this.supplyConfig = opts.config?.supplyConfig || { opening: 5, mid: 3, boss: 1 };
    this.resources = { ammo_basic: 0, ammo_power: 0, shield: 0, skill_bomb: 0, skill_freeze: 0, ultimate_energy: 0, ...(opts.config?.initialResources || {}) };
    this.skipOpeningSupply = !!opts.config?.skipOpeningSupply;
    this.preSupplyStats = opts.config?.preSupplyStats || { correct: 0, wrong: 0 };
    this.player = { hp: 100, x: 18 };
    this.enemies = [];
    this.boss = null;
    this.wrongQuestions = [];
    this.answers = [];
    this.combatStats = { kills: 0, hitsTaken: 0, shotsFired: 0, wavesCleared: 0, bossShieldSolved: 0, bossShieldTriggers: 0 };
    this.startedAt = 0;
    this.reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this._keys = new Set();
    this._timers = [];
  }

  async start() {
    this.startedAt = Date.now();
    this.container.innerHTML = TPL;
    this._levelEl = this.container.querySelector('.ks-level');
    this._hpEl = this.container.querySelector('.ks-hp');
    this._ammoEl = this.container.querySelector('.ks-ammo');
    this._shieldEl = this.container.querySelector('.ks-shield');
    this._waveEl = this.container.querySelector('.ks-wave');
    this._arena = this.container.querySelector('.ks-arena');
    this._playerEl = this.container.querySelector('.ks-player');
    this._petEl = this.container.querySelector('.ks-pet');
    this._enemiesEl = this.container.querySelector('.ks-enemies');
    this._bulletsEl = this.container.querySelector('.ks-bullets');
    this._bossEl = this.container.querySelector('.ks-boss');
    this._bossHpFill = this.container.querySelector('.ks-boss-hp span');
    this._banner = this.container.querySelector('.ks-banner');
    this._panel = this.container.querySelector('.ks-panel');
    this._levelEl.textContent = this.level.title || '知识战场';
    this._bindControls();
    this._renderHud();
    this._renderPlayer();
  }

  _bindControls() {
    this.container.querySelectorAll('.ks-move').forEach(btn => {
      this._on(btn, 'click', () => this._move(btn.dataset.dir === 'left' ? -12 : 12));
    });
    this._on(this.container.querySelector('.ks-fire'), 'click', () => this._fire());
    this._on(this.container.querySelector('.ks-skill'), 'click', () => this._bomb());
    this._on(this.container.querySelector('.ks-ult'), 'click', () => this._ultimate());
    this._on(document, 'keydown', e => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) this._move(-10);
      if (['ArrowRight', 'd', 'D'].includes(e.key)) this._move(10);
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this._fire(); }
      if (e.key === '1') this._bomb();
      if (e.key === '2') this._ultimate();
    });
  }

  async run() {
    await this.start();
    this.stats.started = true;
    try {
      this.stats.correct = Number(this.preSupplyStats.correct || 0);
      this.stats.wrong = Number(this.preSupplyStats.wrong || 0);
      if (this.skipOpeningSupply) {
        this._showBanner('📦 已完成开局补给，进入战斗！');
        this._panel.innerHTML = `<div class="ks-loadout">资源装载：🔸弹药 ${this.resources.ammo_basic} · 💥爆裂 ${this.resources.skill_bomb} · 🛡护盾 ${this.resources.shield} · ⚡大招 ${this.resources.ultimate_energy}</div>`;
        await this._sleep(650);
      } else {
        await this._supply('opening', this.supplyConfig.opening || 5);
      }
      const hasBoss = !!(this.level.config?.boss || this.level.type === 'boss');
      const waveCount = hasBoss ? 2 : 3;
      for (let w = 1; w <= waveCount && !this.stats.ended; w++) {
        await this._combatWave(w, w === waveCount && !hasBoss ? 7 : 4 + w * 2);
        if (this.stats.ended) break;
        if (w < waveCount) await this._supply('mid', this.supplyConfig.mid || 3);
      }
      if (!this.stats.ended && hasBoss) await this._bossFight();
    } catch (err) {
      console.error('[knowledge-shooter] run failed', err);
      this.stats.ended = true;
      this._result = 'fail';
    }
    if (!this._completed) {
      this._completed = true;
      this.stats.ended = true;
      const result = await this.finish();
      this._emit('finish', result);
      this.callbacks.onComplete?.({
        result: result.result,
        stats: { ...this.stats, ...(result.stats || {}) },
      });
    }
  }

  async _supply(phase, count) {
    this._waveEl.textContent = phase === 'opening' ? '开局补给' : phase === 'boss' ? 'Boss 破解' : '中途补给';
    this._clearBattlefield();
    let combo = 0;
    let phaseCorrect = 0;
    const qs = this._takeQuestions(count);
    this._showBanner(phase === 'opening' ? '📦 知识补给：答题装填弹药' : phase === 'boss' ? '🧩 破解 Boss 知识护盾' : '🔋 中途补给');
    for (const q of qs) {
      const started = Date.now();
      const { userAnswer, correct } = await this._askSupplyQuestion(q, phase);
      const durationMs = Date.now() - started;
      const answerRecord = { ...q, questionId: q.id, userAnswer, isCorrect: correct, phase, durationMs };
      this.answers.push(answerRecord);
      if (correct) {
        this.stats.correct++;
        phaseCorrect++;
        combo++;
        this.callbacks.onCorrect?.(q);
      } else {
        this.stats.wrong++;
        combo = 0;
        this.wrongQuestions.push({ ...q, userAnswer });
        this.callbacks.onWrong?.(q, userAnswer);
        if (this.callbacks.onWrongAdd) {
          Promise.resolve().then(() => this.callbacks.onWrongAdd(q, userAnswer)).catch(err => console.warn('[knowledge-shooter] wrong add failed', err));
        }
      }
      this._grantResources({ phase, correct, combo, durationMs });
      this._renderHud();
      if (this.callbacks.onSupplyAnswer) {
        try { await this.callbacks.onSupplyAnswer(answerRecord, { resources: { ...this.resources }, combo, phase }); }
        catch (err) { console.warn('[knowledge-shooter] onSupplyAnswer failed', err); }
      }
      if (phase === 'boss' && correct) this.combatStats.bossShieldSolved++;
      await this._sleep(220);
    }
    if (phase === 'opening' && qs.length && phaseCorrect === qs.length) {
      this.resources.shield += 1;
      this.resources.ultimate_energy += 1;
      this._showBanner('🌟 全对！护盾 +1，大招 +1');
      await this._sleep(700);
    }
    this._panel.innerHTML = `<div class="ks-loadout">资源装载：🔸弹药 ${this.resources.ammo_basic} · 💥爆裂 ${this.resources.skill_bomb} · 🛡护盾 ${this.resources.shield} · ⚡大招 ${this.resources.ultimate_energy}</div>`;
    await this._sleep(650);
  }

  _takeQuestions(count) {
    const out = [];
    while (out.length < count && this.idx < this.questions.length) out.push(this.questions[this.idx++]);
    return out;
  }

  _grantResources({ phase, correct, combo, durationMs }) {
    const delta = computeSupplyResources({ correct, combo, phase, durationMs, difficulty: this.level.difficulty || 1 });
    this.resources = addResources(this.resources, delta);
  }

  _askSupplyQuestion(q, phase) {
    const opts = makeChoiceOptions(q, 4);
    return new Promise(resolve => {
      this._panel.innerHTML = `<div class="ks-qcard">
        <div class="ks-qphase">${phase === 'boss' ? 'Boss 护盾题' : '知识补给题'}</div>
        <div class="ks-qtext">${escapeHtml(q.q)}</div>
        <button class="btn-mini ks-tts">🔊 朗读</button>
        <div class="ks-options">${opts.map(o => `<button class="ks-opt" data-answer="${escapeHtml(o)}">${escapeHtml(o)}</button>`).join('')}</div>
      </div>`;
      this._panel.querySelector('.ks-tts').onclick = () => this.callbacks.requestTTS?.(q.q);
      this._panel.querySelectorAll('.ks-opt').forEach(btn => {
        btn.onclick = () => {
          const ua = btn.dataset.answer;
          const correct = isCorrect(q, ua);
          this._panel.querySelectorAll('.ks-opt').forEach(b => {
            b.disabled = true;
            if (isCorrect(q, b.dataset.answer)) b.classList.add('correct');
          });
          btn.classList.add(correct ? 'selected' : 'wrong');
          resolve({ userAnswer: ua, correct });
        };
      });
    });
  }

  async _combatWave(waveNo, enemyCount) {
    this._waveEl.textContent = `Wave ${waveNo}`;
    this._panel.innerHTML = '<div class="ks-tip">移动躲避怪物，点击「发射」消耗补给弹药。弹药来自答题表现。</div>';
    this._showBanner(`🚀 第 ${waveNo} 波来袭`);
    this._spawnEnemies(enemyCount, waveNo);
    while (!this.stats.ended && this.enemies.length) {
      await this._enemyStep();
    }
    if (!this.stats.ended) {
      this.combatStats.wavesCleared++;
      this.resources.ammo_basic += 3; // 少量掉落，避免卡死
      this._renderHud();
      this._showBanner('✅ 波次清理完成 · 掉落弹药 +3');
      await this._sleep(700);
    }
  }

  _spawnEnemies(count, waveNo) {
    this._clearBattlefield();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'ks-enemy';
      const hp = waveNo >= 3 && i % 3 === 0 ? 2 : 1;
      el.textContent = hp > 1 ? '🛸' : (i % 2 ? '⚙️' : '🤖');
      const enemy = { el, hp, x: 88 + Math.random() * 8, y: 18 + Math.random() * 58, speed: 3 + Math.random() * waveNo };
      this.enemies.push(enemy);
      this._enemiesEl.appendChild(el);
      this._renderEnemy(enemy);
    }
  }

  async _enemyStep() {
    for (const enemy of [...this.enemies]) {
      enemy.x -= enemy.speed;
      if (Math.abs(enemy.x - this.player.x) < 8) {
        this._enemyHitsPlayer(enemy);
        this._removeEnemy(enemy, false);
      } else if (enemy.x <= 2) {
        this._enemyHitsPlayer(enemy);
        this._removeEnemy(enemy, false);
      } else {
        this._renderEnemy(enemy);
      }
    }
    await this._sleep(520);
  }

  _enemyHitsPlayer(enemy) {
    const blocked = this.resources.shield > 0;
    if (blocked) {
      this.resources.shield--;
      this._showBanner('🛡 护盾抵挡一次伤害');
    } else {
      this.player.hp = Math.max(0, this.player.hp - 15);
      this.combatStats.hitsTaken++;
      this._fx(() => fx.flashScreen('rgba(255,80,80,.35)', 100));
      this._fx(() => fx.screenShake(2));
      if (this.player.hp <= 0) {
        this.stats.ended = true;
        this._result = 'fail';
        this._showBanner('💔 HP 归零');
      }
    }
    this._emit('playerDamaged', { hp: this.player.hp, shield: this.resources.shield || 0, blocked, source: enemy });
    this._renderHud();
  }

  _fire() {
    if (this.stats.ended) return;
    if (this.resources.ammo_basic <= 0) { this._showBanner('⚠️ 弹药不足：下一次补给要多答对几题'); return; }
    this.resources.ammo_basic--;
    this._emit('resourceUsed', { type: 'ammo_basic', amount: 1, remaining: this.resources.ammo_basic });
    this.combatStats.shotsFired++;
    const target = this.boss && this.boss.active ? null : this._closestEnemy();
    if (target) {
      this._projectileTo(target.el);
      target.hp--;
      if (target.hp <= 0) this._removeEnemy(target, true); else this._renderEnemy(target);
    } else if (this.boss?.active) {
      this._hitBoss(8);
    }
    this._renderHud();
  }

  _bomb() {
    if (this.resources.skill_bomb <= 0) { this._showBanner('💥 没有爆裂技能'); return; }
    this.resources.skill_bomb--;
    this._emit('resourceUsed', { type: 'skill_bomb', amount: 1, remaining: this.resources.skill_bomb });
    const victims = this.enemies.slice(0, 3);
    for (const e of victims) this._removeEnemy(e, true);
    if (this.boss?.active) this._hitBoss(25);
    this._fx(() => fx.flashScreen('rgba(255,207,75,.35)', 120));
    this._renderHud();
  }

  _ultimate() {
    if (this.resources.ultimate_energy <= 0) { this._showBanner('⚡ 大招能量不足'); return; }
    this.resources.ultimate_energy--;
    this._emit('resourceUsed', { type: 'ultimate_energy', amount: 1, remaining: this.resources.ultimate_energy });
    for (const e of [...this.enemies]) this._removeEnemy(e, true);
    if (this.boss?.active) this._hitBoss(50);
    this._showBanner('⚡ 学霸能量爆发！');
    this._fx(() => confetti(30));
    this._renderHud();
  }

  _closestEnemy() {
    if (!this.enemies.length) return null;
    return [...this.enemies].sort((a, b) => a.x - b.x)[0];
  }

  _removeEnemy(enemy, killed) {
    this.enemies = this.enemies.filter(e => e !== enemy);
    if (killed) {
      this.combatStats.kills++;
      this._emit('enemyDefeated', { enemy, kills: this.combatStats.kills });
      enemy.el.classList.add('dead');
      setTimeout(() => enemy.el.remove(), 240);
    } else enemy.el.remove();
  }

  _projectileTo(targetEl) {
    const p = document.createElement('div');
    p.className = 'ks-shot';
    p.textContent = '✦';
    p.style.left = `${this.player.x + 6}%`;
    p.style.top = '54%';
    this._bulletsEl.appendChild(p);
    const r = targetEl.getBoundingClientRect();
    setTimeout(() => p.remove(), this.reducedMotion ? 0 : 260);
    this._fx(() => fx.impactBurst(r.left + r.width / 2, r.top + r.height / 2, { count: 6, symbols: ['✦', '💥'], color: '#ffcf4b' }));
  }

  async _bossFight() {
    this._clearBattlefield();
    const bossCfg = this.level.config?.boss || {};
    const shieldCfg = bossCfg.knowledgeShield || {};
    const shieldHp = typeof shieldCfg === 'object' ? (shieldCfg.hp || 30) : 30;
    const shieldQuestionCount = typeof shieldCfg === 'object' ? Math.max(1, Number(shieldCfg.questionCount) || 1) : 1;
    this.boss = { active: true, hp: bossCfg.hp || 120, maxHp: bossCfg.hp || 120, shield: shieldHp, shieldQuestionCount, triggers: new Set() };
    this._bossEl.style.display = '';
    this._waveEl.textContent = 'Boss';
    this._panel.innerHTML = '<div class="ks-tip">Boss 有知识护盾。血量到阶段阈值时会触发破解题，答对可削弱护盾。</div>';
    this._renderBoss();
    this._showBanner('👾 混乱计算兽出现！');
    while (!this.stats.ended && this.boss.hp > 0) {
      await this._sleep(700);
      if (this.boss.hp <= 0) break;
      this._bossAttack();
      if (this.resources.ammo_basic <= 0 && this.resources.ultimate_energy <= 0 && this.resources.skill_bomb <= 0) {
        this.resources.ammo_basic += 2;
        this._showBanner('🐣 宠物支援：弹药 +2');
        this._renderHud();
      }
    }
    if (!this.stats.ended) {
      this._result = 'win';
      this.stats.ended = true;
      this._showBanner('🏆 击败 Boss！');
      this._fx(() => confetti(60));
    }
  }

  _hitBoss(dmg) {
    if (!this.boss?.active) return;
    const beforePct = this.boss.hp / this.boss.maxHp;
    const actual = this.boss.shield > 0 ? Math.max(1, Math.round(dmg * 0.45)) : dmg;
    this.boss.shield = Math.max(0, this.boss.shield - Math.max(1, Math.round(dmg * 0.25)));
    this.boss.hp = Math.max(0, this.boss.hp - actual);
    this._renderBoss();
    this._fx(() => fx.flashScreen('rgba(255,255,255,.25)', 60));
    this._maybeTriggerBossShield(beforePct);
    if (this.boss.hp <= 0) {
      this.boss.active = false;
      this._bossEl.classList.add('dead');
    }
  }

  _maybeTriggerBossShield(beforePct) {
    if (!this.boss?.active || this.boss._shieldQuestionActive) return;
    const afterPct = this.boss.hp / this.boss.maxHp;
    const thresholds = [0.7, 0.4];
    for (const t of thresholds) {
      if (beforePct > t && afterPct <= t && !this.boss.triggers.has(t)) {
        this.boss.triggers.add(t);
        this.combatStats.bossShieldTriggers++;
        this.boss._shieldQuestionActive = true;
        Promise.resolve().then(async () => {
          this._showBanner('🧩 Boss 知识护盾启动！');
          await this._sleep(350);
          await this._supply('boss', this.boss.shieldQuestionCount || 1);
          this.boss.shield = Math.max(0, this.boss.shield - 18);
          this.boss._shieldQuestionActive = false;
          this._bossEl.style.display = '';
          this._waveEl.textContent = 'Boss';
          this._panel.innerHTML = '<div class="ks-tip">护盾已削弱，继续射击 Boss。</div>';
          this._renderBoss();
        }).catch(err => { console.warn('[knowledge-shooter] boss shield failed', err); this.boss._shieldQuestionActive = false; });
        break;
      }
    }
  }

  _bossAttack() {
    if (Math.random() < 0.45) this._spawnEnemies(1, 2);
    else this._enemyHitsPlayer({});
  }

  _move(dx) {
    this.player.x = Math.max(5, Math.min(45, this.player.x + dx));
    this._renderPlayer();
  }

  _renderHud() {
    if (!this._hpEl) return;
    this._hpEl.textContent = this.player.hp;
    this._ammoEl.textContent = this.resources.ammo_basic || 0;
    this._shieldEl.textContent = this.resources.shield || 0;
  }

  _renderPlayer() {
    if (!this._playerEl) return;
    this._playerEl.style.left = `${this.player.x}%`;
    this._petEl.style.left = `${Math.max(2, this.player.x - 7)}%`;
  }

  _renderEnemy(enemy) {
    enemy.el.style.left = `${enemy.x}%`;
    enemy.el.style.top = `${enemy.y}%`;
    enemy.el.dataset.hp = enemy.hp;
  }

  _renderBoss() {
    const pct = Math.max(0, Math.round((this.boss.hp / this.boss.maxHp) * 100));
    this._bossHpFill.style.width = pct + '%';
    this._bossEl.dataset.shield = this.boss.shield > 0 ? 'on' : 'off';
  }

  _clearBattlefield() {
    this.enemies = [];
    if (this._enemiesEl) this._enemiesEl.innerHTML = '';
    if (this._bulletsEl) this._bulletsEl.innerHTML = '';
    if (this._bossEl) { this._bossEl.style.display = 'none'; this._bossEl.classList.remove('dead'); }
  }

  _showBanner(text) {
    if (!this._banner) return;
    this._banner.textContent = text;
    this._banner.classList.remove('pop');
    void this._banner.offsetWidth;
    this._banner.classList.add('pop');
  }

  async finish() {
    const result = this._result || (this.player.hp > 0 ? 'complete' : 'fail');
    return { result, stats: {
      correct: this.stats.correct,
      wrong: this.stats.wrong,
      resources: { ...this.resources },
      combatStats: { ...this.combatStats },
      wrongQuestions: this.wrongQuestions,
      answers: this.answers,
      durationSec: Math.max(1, Math.round((Date.now() - this.startedAt) / 1000)),
    }};
  }

  _emit(name, payload) {
    try { this.callbacks?.[name]?.(payload); }
    catch (err) { console.warn(`[knowledge-shooter] callback ${name} failed`, err); }
  }

  _fx(fn) {
    if (this.reducedMotion) return;
    try { fn(); } catch (err) { console.warn('[knowledge-shooter] fx failed', err); }
  }

  _sleep(ms) {
    const delay = this.reducedMotion ? Math.min(ms, 120) : ms;
    return new Promise(resolve => {
      const t = setTimeout(resolve, delay);
      this._timers.push(t);
    });
  }

  destroy() {
    for (const t of this._timers) clearTimeout(t);
    this._timers = [];
    super.destroy();
  }
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
