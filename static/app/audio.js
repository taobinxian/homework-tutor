// 音效系统 — 使用 WebAudio 合成，无需音频文件
// 所有音效都用震荡器实时合成，包内零依赖

let ctx = null;
let muted = false;
let masterGain = null;

function ensureCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.4;
      masterGain.connect(ctx.destination);
    } catch (e) {
      console.warn('[audio] WebAudio 不可用:', e);
    }
  }
  // 浏览器自动播放策略：用户首次交互后 resume
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

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
