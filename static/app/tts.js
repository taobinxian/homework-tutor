// 语音朗读 — 服务端 TTS 优先，浏览器兜底
// 兼容现有 index.html TTS 行为：预加载缓存、限流、停止/恢复

const _ttsCache = new Map(); // text → Promise<blobURL>
const _preloadQueue = [];
let _preloadActive = 0;
const _preloadMax = 1;
// 前 2 题在 startLevel 时预热；首题朗读不再冷启动
const DEFAULT_PRELOAD_LIMIT = 2;

const _state = {
  enabled: true,
  current: null,   // 当前 Audio 实例
  voices: [],
  speakPlaying: false,
  speakQueue: [],
  ttsId: 0,
  serverUnavailable: false,  // 服务端 TTS 失败后熔断，避免 console 刷屏
};

try {
  const loadVoices = () => { _state.voices = window.speechSynthesis?.getVoices?.() || []; };
  loadVoices();
  if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
} catch (_) {}

function detectLang(text) {
  const en = (text.match(/[a-zA-Z]/g) || []).length;
  const zh = (text.match(/[一-龥]/g) || []).length;
  return en > zh * 2 ? 'en-US' : 'zh-CN';
}

function pickVoice(lang) {
  if (!_state.voices.length) return null;
  const want = _state.voices.filter(v => v.lang && v.lang.startsWith(lang.split('-')[0]));
  if (!want.length) return null;
  const kid = want.find(v => /Xiaoxiao|Yaoyao|Kid|child|Female|女|小/i.test(v.name));
  return kid || want[0];
}

export function stripForTTS(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_`#~]/g, '')
    .replace(/（第\d+组）/g, ' ')
    .replace(/第\d+组/g, ' ')
    .replace(/(?:基础|进阶|挑战)?练习\s*\d+\s*[：:]/g, ' ')
    .replace(/practice\s*\d+\s*:/ig, ' ')
    .replace(/___+/g, '空格')
    .replace(/"([^"]+)"/g, ' $1 ')
    .replace(/“([^”]+)”/g, ' $1 ')
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$2分之$1')
    .replace(/(\d+)\s*%/g, '百分之$1')
    .replace(/[+＋]/g, ' 加 ')
    .replace(/[×xX]/g, ' 乘 ')
    .replace(/[÷]/g, ' 除以 ')
    .replace(/[=＝]/g, ' 等于 ')
    .replace(/\?/g, ' 多少 ')
    .replace(/？/g, ' 多少 ')
    .replace(/:/g, ' ')
    .replace(/：/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function _drainQueue() {
  while (_preloadActive < _preloadMax && _preloadQueue.length > 0) {
    const task = _preloadQueue.shift();
    _preloadActive++;
    task().finally(() => { _preloadActive--; _drainQueue(); });
  }
}

function _ttsConfig() {
  // 由 main.js 注入 — 缺省值
  return globalThis.__TTS_CFG || { tts_url: '/tts', tts_voice: 'saturn_zh_female_keainvsheng_tob', tts_rate: 0.95 };
}

export function preloadTTS(text) {
  if (_state.serverUnavailable) return;  // 熔断：服务端 TTS 不可用时直接跳过
  const t = stripForTTS(text);
  if (!t || _ttsCache.has(t)) return;
  const cfg = _ttsConfig();
  if (!cfg.tts_url) return;
  let resolve_;
  _ttsCache.set(t, new Promise(r => { resolve_ = r; }));
  _preloadQueue.push(() => {
    const useGet = t.length <= 120;
    const p = useGet
      ? fetch(cfg.tts_url + (cfg.tts_url.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(t) + '&voice=' + encodeURIComponent(cfg.tts_voice) + '&rate=' + cfg.tts_rate)
      : fetch(cfg.tts_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: t, voice: cfg.tts_voice, rate: cfg.tts_rate, encoding: 'mp3' }),
        });
    return p.then(r => {
      if (r.status >= 500) {
        // 服务端不可用（多半未配置 VOLC_APPID/TOKEN），熔断后续预加载
        _state.serverUnavailable = true;
        _preloadQueue.length = 0;
        throw new Error('TTS 服务不可用，已停止预加载');
      }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.blob();
    }).then(blob => {
      const url = URL.createObjectURL(blob);
      resolve_(url);
      return url;
    }).catch(() => { _ttsCache.delete(t); resolve_(null); });
  });
  _drainQueue();
}

export function clearTTSCache() {
  for (const v of _ttsCache.values()) {
    Promise.resolve(v).then(url => { if (url) try { URL.revokeObjectURL(url); } catch (_) {} });
  }
  _ttsCache.clear();
}

export function preloadBattle(qs, limit = DEFAULT_PRELOAD_LIMIT) {
  for (const q of (qs || []).slice(0, limit)) {
    if (q.q) preloadTTS(q.q);
  }
}

export function setEnabled(v) { _state.enabled = !!v; }
export function isEnabled() { return _state.enabled; }

export function toggleVoice() {
  _state.enabled = !_state.enabled;
  if (!_state.enabled) stopSpeak();
  return _state.enabled;
}

export function stopSpeak() {
  _state.speakQueue.length = 0;
  _stopCurrent();
}

function _stopCurrent() {
  try {
    if (_state.current) {
      _state.current.pause();
      _state.current.src = '';
      _state.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  } catch (_) {}
  _state.speakPlaying = false;
}

async function _playOne(t, opts, onDone) {
  const cfg = _ttsConfig();
  let url = null;
  if (cfg.tts_url && !_state.serverUnavailable) {
    try {
      const cached = _ttsCache.get(t);
      if (cached) {
        url = await cached;
      } else {
        // 直接现取
        let resolve_;
        _ttsCache.set(t, new Promise(r => { resolve_ = r; }));
        try {
          const useGet = t.length <= 120;
          const r = useGet
            ? await fetch(cfg.tts_url + '?text=' + encodeURIComponent(t) + '&voice=' + encodeURIComponent(cfg.tts_voice) + '&rate=' + cfg.tts_rate)
            : await fetch(cfg.tts_url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: t, voice: cfg.tts_voice, rate: cfg.tts_rate, encoding: 'mp3' }) });
          if (r.status >= 500) { _state.serverUnavailable = true; throw new Error('TTS 服务不可用'); }
          if (!r.ok) throw new Error('HTTP ' + r.status);
          const blob = await r.blob();
          url = URL.createObjectURL(blob);
          resolve_(url);
        } catch (_) { _ttsCache.delete(t); resolve_(null); }
      }
    } catch (_) {}
  }
  if (url) {
    const audio = new Audio(url);
    audio.playsInline = true;          // iOS：禁止全屏播放器，行内播放
    audio.preload = 'auto';
    _state.current = audio;
    audio.onended = () => { _state.current = null; onDone?.(); };
    audio.onerror = () => { _state.current = null; onDone?.(); };
    audio.play().catch(err => {
      console.warn('[tts] audio.play 失败:', err?.message || err);
      _state.current = null;
      onDone?.();
    });
    return;
  }
  // 浏览器兜底
  if (window.speechSynthesis) {
    const u = new SpeechSynthesisUtterance(t);
    const lang = detectLang(t);
    u.lang = lang;
    const v = pickVoice(lang);
    if (v) u.voice = v;
    u.rate = opts?.rate || 0.95;
    u.onend = () => onDone?.();
    u.onerror = () => onDone?.();
    window.speechSynthesis.speak(u);
  } else { onDone?.(); }
}

export function speak(text, opts = {}) {
  if (!_state.enabled) return;
  const t = stripForTTS(text);
  if (!t) return;
  if (opts.interrupt) stopSpeak();
  _state.speakQueue.push({ t, opts });
  if (!_state.speakPlaying) _drainSpeakQueue();
}

function _drainSpeakQueue() {
  if (!_state.speakQueue.length) { _state.speakPlaying = false; return; }
  _state.speakPlaying = true;
  const { t, opts } = _state.speakQueue.shift();
  _playOne(t, opts, () => _drainSpeakQueue());
}
