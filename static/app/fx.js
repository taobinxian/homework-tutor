// 共享特效引擎：街机打击感工具集
// 设计：所有效果都是无副作用的 DOM 注入 + 自动清理
// 不依赖具体引擎；任何引擎传入 root（容器）和坐标即可触发

// ---------- 1. 屏幕震动 ----------
let _shakeTimer = null;
export function screenShake(intensity = 1, durationMs = 250) {
  const root = document.body;
  if (_shakeTimer) clearTimeout(_shakeTimer);
  root.classList.remove('fx-shake-light', 'fx-shake-medium', 'fx-shake-heavy');
  const cls = intensity >= 3 ? 'fx-shake-heavy' : intensity >= 2 ? 'fx-shake-medium' : 'fx-shake-light';
  root.classList.add(cls);
  _shakeTimer = setTimeout(() => {
    root.classList.remove(cls);
    _shakeTimer = null;
  }, durationMs);
}

// ---------- 2. 全屏闪光 ----------
export function flashScreen(color = '#fff', durationMs = 120) {
  const flash = document.createElement('div');
  flash.className = 'fx-flash';
  flash.style.background = color;
  flash.style.animationDuration = durationMs + 'ms';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), durationMs + 50);
}

// ---------- 3. 伤害飘字 ----------
export function damageNumber(x, y, value, opts = {}) {
  const el = document.createElement('div');
  el.className = 'fx-damage' + (opts.crit ? ' crit' : '') + (opts.heal ? ' heal' : '');
  el.textContent = (opts.prefix || '') + value;
  el.style.left = (x + (Math.random() - 0.5) * 30) + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1100);
}

// ---------- 4. Hitstop（凝帧）----------
// 简化实现：通过给 root 加 class 让 transition 暂停 N ms
export function hitstop(durationMs = 100) {
  const root = document.body;
  root.classList.add('fx-hitstop');
  setTimeout(() => root.classList.remove('fx-hitstop'), durationMs);
}

// ---------- 5. 命中粒子（多方向飞溅）----------
export function impactBurst(x, y, opts = {}) {
  const count = opts.count || 8;
  const symbols = opts.symbols || ['✦', '✧', '★', '✺', '⚡'];
  const color = opts.color || '#ffcf4b';
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
    const distance = 60 + Math.random() * 40;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const p = document.createElement('div');
    p.className = 'fx-spark';
    p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    p.style.color = color;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', dx + 'px');
    p.style.setProperty('--dy', dy + 'px');
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

// ---------- 6. 击中冲击波（圆环扩散）----------
export function impactRing(x, y, color = '#fff') {
  const ring = document.createElement('div');
  ring.className = 'fx-ring';
  ring.style.left = x + 'px';
  ring.style.top = y + 'px';
  ring.style.borderColor = color;
  document.body.appendChild(ring);
  setTimeout(() => ring.remove(), 500);
}

// ---------- 7. 大字幕（KO! / 必杀！/ 命中！）----------
export function bigText(root, text, opts = {}) {
  const el = document.createElement('div');
  el.className = 'fx-big-text' + (opts.crit ? ' crit' : '');
  el.textContent = text;
  if (opts.color) el.style.color = opts.color;
  (root || document.body).appendChild(el);
  setTimeout(() => el.remove(), opts.duration || 1400);
}

// ---------- 8. 慢镜头（CSS 动画速率减慢）----------
export function slowMotion(durationMs = 400) {
  const root = document.body;
  root.classList.add('fx-slowmo');
  setTimeout(() => root.classList.remove('fx-slowmo'), durationMs);
}

// ---------- 9. 命中冲击元素（短暂放大 + 亮）----------
export function flinch(el, intensity = 1) {
  if (!el) return;
  const cls = intensity >= 2 ? 'fx-flinch-strong' : 'fx-flinch';
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), 280);
}

// ---------- 10. 子弹时间投射物（带尾迹）----------
export function projectile(fromEl, toEl, opts = {}) {
  if (!fromEl || !toEl) return Promise.resolve();
  const fr = fromEl.getBoundingClientRect();
  const tr = toEl.getBoundingClientRect();
  const fx = fr.left + fr.width / 2;
  const fy = fr.top + fr.height / 2;
  const tx = tr.left + tr.width / 2;
  const ty = tr.top + tr.height / 2;
  return new Promise(resolve => {
    const proj = document.createElement('div');
    proj.className = 'fx-proj';
    proj.textContent = opts.emoji || '⚡';
    proj.style.left = fx + 'px';
    proj.style.top = fy + 'px';
    proj.style.fontSize = (opts.size || 32) + 'px';
    document.body.appendChild(proj);
    requestAnimationFrame(() => {
      proj.style.transition = `transform ${opts.duration || 280}ms cubic-bezier(.34,1.56,.64,1)`;
      proj.style.transform = `translate(${tx - fx}px, ${ty - fy}px)`;
    });
    setTimeout(() => {
      proj.remove();
      resolve({ tx, ty });
    }, (opts.duration || 280) + 30);
  });
}

// ---------- 11. 拳轨残影（连续帧）----------
export function trailImage(emoji, x, y) {
  const t = document.createElement('div');
  t.className = 'fx-trail';
  t.textContent = emoji;
  t.style.left = x + 'px';
  t.style.top = y + 'px';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 300);
}
