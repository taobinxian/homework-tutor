// 音效系统 — 使用 WebAudio 合成，无需音频文件
//
// 移动端音频解锁：iOS Safari / 部分 Android 浏览器要求 AudioContext 必须
// 在 user gesture 的同步路径里 resume()，否则永远 suspended（无声）。
// boot 时调用 installUnlockHook()，在 body 上挂一次性 pointerdown/touchstart
// 监听，第一次用户手势同步：
//   1) 创建 AudioContext + resume
//   2) 播一段 1 采样点的静音，强制激活音频输出
//   3) 用 muted Audio 元素 play 一次，解锁 TTS 的 HTML5 audio

let ctx = null;
let muted = false;
let masterGain = null;
let unlocked = false;

function makeCtx() {
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.4;
    masterGain.connect(ctx.destination);
  } catch (e) { console.warn('[audio] WebAudio 不可用:', e); }
}

function ensureCtx() {
  if (!ctx) makeCtx();
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

// user gesture 同步路径里调用 — 解锁 WebAudio 与 HTML5 Audio
function unlockAudio() {
  if (unlocked) return;
  if (!ctx) makeCtx();
  if (!ctx) return;
  ctx.resume().catch(() => {});

  // ① 静音 buffer：iOS 必须播至少一次 buffer source 才会真正激活音频管线
  try {
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch (_) {}

  // ② 真实可听 oscillator（极短极轻）— iOS Safari 在某些版本要求 oscillator
  //    实际响过一次才把 audio output 完全激活；不然后续所有 tone 都不响。
  //    控制在 ~50ms / 0.04 vol，几乎无感但能解锁。
  try {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.frequency.value = 440;
    osc.type = 'sine';
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.005);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
    osc.connect(g).connect(masterGain || ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch (_) {}

  // ③ 解锁 HTML5 Audio（TTS 用 new Audio()）— 必须在 gesture 内 play
  try {
    const a = new Audio();
    a.muted = true;
    a.playsInline = true;
    a.play().catch(() => {});
    setTimeout(() => { try { a.pause(); } catch (_) {} }, 60);
  } catch (_) {}

  unlocked = true;
}

// boot 时挂一次性事件监听 —— 第一次手势就解锁
export function installUnlockHook() {
  if (typeof document === 'undefined') return;
  const handler = () => { unlockAudio(); };
  const events = ['pointerdown', 'touchstart', 'mousedown', 'keydown'];
  for (const ev of events) document.addEventListener(ev, handler, { once: true, capture: true });
}

export function isUnlocked() { return unlocked; }

export function setMuted(v) { muted = !!v; }
export function isMuted() { return muted; }
export function setVolume(v) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

// 通用音效合成器
function tone({ freq = 440, duration = 0.15, type = 'sine', vol = 0.5, attack = 0.005, release = 0.1, slide = 0 }) {
  if (muted) return;
  const c = ensureCtx(); if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), c.currentTime + duration);
  gain.gain.setValueAtTime(0, c.currentTime);
  gain.gain.linearRampToValueAtTime(vol, c.currentTime + attack);
  gain.gain.linearRampToValueAtTime(0, c.currentTime + duration);
  osc.connect(gain).connect(masterGain);
  osc.start();
  osc.stop(c.currentTime + duration + release);
}

function noise({ duration = 0.1, vol = 0.3, filter = 'lowpass', filterFreq = 1000 }) {
  if (muted) return;
  const c = ensureCtx(); if (!c) return;
  const buffer = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
  const src = c.createBufferSource(); src.buffer = buffer;
  const f = c.createBiquadFilter(); f.type = filter; f.frequency.value = filterFreq;
  const g = c.createGain(); g.gain.value = vol;
  src.connect(f).connect(g).connect(masterGain); src.start();
}

// === 游戏音效预设 ===
export function sfxClick() {
  tone({ freq: 600, duration: 0.05, type: 'square', vol: 0.15, slide: 200 });
}
export function sfxCorrect() {
  tone({ freq: 523, duration: 0.08, type: 'triangle', vol: 0.3 });
  setTimeout(() => tone({ freq: 784, duration: 0.12, type: 'triangle', vol: 0.3 }), 80);
}
export function sfxWrong() {
  tone({ freq: 200, duration: 0.18, type: 'sawtooth', vol: 0.25, slide: -120 });
}
export function sfxHit() {
  tone({ freq: 80, duration: 0.05, type: 'sine', vol: 0.45, slide: -40 });
  noise({ duration: 0.06, vol: 0.18, filter: 'lowpass', filterFreq: 600 });
}
export function sfxCrit() {
  tone({ freq: 880, duration: 0.06, type: 'square', vol: 0.4 });
  setTimeout(() => tone({ freq: 1175, duration: 0.1, type: 'square', vol: 0.4 }), 60);
  noise({ duration: 0.15, vol: 0.25, filter: 'highpass', filterFreq: 2000 });
}
export function sfxCombo(n) {
  const freq = 440 + n * 80;
  tone({ freq, duration: 0.08, type: 'triangle', vol: 0.3 });
}
export function sfxLevelUp() {
  const notes = [523, 659, 784, 1047];  // C E G C
  notes.forEach((f, i) => setTimeout(() => tone({ freq: f, duration: 0.16, type: 'triangle', vol: 0.35 }), i * 100));
}
export function sfxAchievement() {
  const notes = [523, 784, 1047, 1319];
  notes.forEach((f, i) => setTimeout(() => tone({ freq: f, duration: 0.18, type: 'sine', vol: 0.32 }), i * 80));
}
export function sfxCoin() {
  tone({ freq: 988, duration: 0.05, type: 'square', vol: 0.25 });
  setTimeout(() => tone({ freq: 1319, duration: 0.08, type: 'square', vol: 0.25 }), 40);
}
export function sfxGameOver() {
  const notes = [392, 349, 294, 220];
  notes.forEach((f, i) => setTimeout(() => tone({ freq: f, duration: 0.22, type: 'sawtooth', vol: 0.3 }), i * 140));
}
export function sfxVictory() {
  const notes = [523, 659, 784, 1047, 1319, 1568];
  notes.forEach((f, i) => setTimeout(() => tone({ freq: f, duration: 0.14, type: 'triangle', vol: 0.35 }), i * 90));
}
export function sfxSwoosh() {
  noise({ duration: 0.12, vol: 0.18, filter: 'bandpass', filterFreq: 1500 });
}
