// 共享 UI：toast / showConfirm / 简单 DOM helpers

export const $ = sel => document.querySelector(sel);
export const $$ = sel => Array.from(document.querySelectorAll(sel));

export function toast(msg, ms = 1800) {
  let wrap = $('#toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), ms + 200);
}

export function showConfirm({ icon = '🏃', title = '确定吗？', msg = '', yes = '确定', no = '取消', danger = true } = {}) {
  return new Promise(resolve => {
    const overlay = $('#confirm-overlay');
    if (!overlay) {
      console.warn('[ui] confirm overlay 未找到，直接返回 confirm()');
      resolve(window.confirm(`${title}\n${msg}`));
      return;
    }
    $('#confirm-icon').textContent = icon;
    $('#confirm-title').textContent = title;
    $('#confirm-msg').textContent = msg;
    $('#confirm-yes').textContent = yes;
    $('#confirm-no').textContent = no;
    $('#confirm-yes').className = 'btn ' + (danger ? 'btn-danger' : 'btn-cancel');
    overlay.classList.add('show');
    const done = v => { overlay.classList.remove('show'); resolve(v); };
    $('#confirm-yes').onclick = () => done(true);
    $('#confirm-no').onclick = () => done(false);
    overlay.onclick = e => { if (e.target === overlay) done(false); };
  });
}

export function spawnParticle(x, y, emoji) {
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = emoji;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

export function confetti(n = 40) {
  const emojis = ['⭐', '✨', '🎉', '💎', '🌟'];
  const w = window.innerWidth, h = window.innerHeight;
  for (let i = 0; i < n; i++) {
    setTimeout(() => spawnParticle(Math.random() * w, Math.random() * h * 0.5, emojis[Math.floor(Math.random() * emojis.length)]), i * 30);
  }
}

// 简单本地存储工具
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (_) { return fallback; }
}

export function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
}
