'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_MODEL_DIR = path.join(__dirname, '..', 'models', 'tts', 'kokoro-multi-lang-v1_0');
const DEFAULT_SPEAKER = 'zf_xiaoxiao';
const CACHE_LIMIT = 80;

const SPEAKERS = {
  af_alloy: 0, af_aoede: 1, af_bella: 2, af_heart: 3, af_jessica: 4,
  af_kore: 5, af_nicole: 6, af_nova: 7, af_river: 8, af_sarah: 9,
  af_sky: 10, am_adam: 11, am_echo: 12, am_eric: 13, am_fenrir: 14,
  am_liam: 15, am_michael: 16, am_onyx: 17, am_puck: 18, am_santa: 19,
  bf_alice: 20, bf_emma: 21, bf_isabella: 22, bf_lily: 23, bm_daniel: 24,
  bm_fable: 25, bm_george: 26, bm_lewis: 27, ef_dora: 28, em_alex: 29,
  ff_siwis: 30, hf_alpha: 31, hf_beta: 32, hm_omega: 33, hm_psi: 34,
  if_sara: 35, im_nicola: 36, jf_alpha: 37, jf_gongitsune: 38,
  jf_nezumi: 39, jf_tebukuro: 40, jm_kumo: 41, pf_dora: 42, pm_alex: 43,
  pm_santa: 44, zf_xiaobei: 45, zf_xiaoni: 46, zf_xiaoxiao: 47,
  zf_xiaoyi: 48, zm_yunjian: 49, zm_yunxi: 50, zm_yunxia: 51,
  zm_yunyang: 52,
};

let tts = null;
let initError = null;
let initTried = false;
const cache = new Map();

function fileExists(file) {
  try { return fs.statSync(file).isFile(); } catch (_) { return false; }
}

function modelDir() {
  return process.env.LOCAL_TTS_MODEL_DIR || DEFAULT_MODEL_DIR;
}

function requiredFiles(dir) {
  return [
    path.join(dir, 'model.onnx'),
    path.join(dir, 'voices.bin'),
    path.join(dir, 'tokens.txt'),
    path.join(dir, 'lexicon-us-en.txt'),
    path.join(dir, 'lexicon-zh.txt'),
  ];
}

function status() {
  const dir = modelDir();
  const enabled = process.env.LOCAL_TTS !== '0';
  const filesReady = requiredFiles(dir).every(fileExists);
  return {
    enabled,
    ready: enabled && filesReady && !initError,
    loaded: !!tts,
    modelDir: dir,
    error: initError ? initError.message : '',
  };
}

function createTts() {
  if (tts) return tts;
  if (process.env.LOCAL_TTS === '0') throw new Error('LOCAL_TTS=0');

  const dir = modelDir();
  const missing = requiredFiles(dir).filter(f => !fileExists(f));
  if (missing.length) {
    throw new Error('本地 TTS 模型文件缺失: ' + missing.map(f => path.relative(dir, f)).join(', '));
  }

  const sherpa = require('sherpa-onnx');
  const kokoro = {
    model: path.join(dir, 'model.onnx'),
    voices: path.join(dir, 'voices.bin'),
    tokens: path.join(dir, 'tokens.txt'),
    dataDir: path.join(dir, 'espeak-ng-data'),
    lexicon: [
      path.join(dir, 'lexicon-us-en.txt'),
      path.join(dir, 'lexicon-zh.txt'),
    ].join(','),
    lengthScale: 1.0,
  };
  const config = {
    offlineTtsModelConfig: {
      offlineTtsKokoroModelConfig: kokoro,
      // The WASM build is stable with one thread on local macOS/Node.
      numThreads: Number(process.env.LOCAL_TTS_THREADS || 1),
      debug: process.env.LOCAL_TTS_DEBUG === '1' ? 1 : 0,
      provider: 'cpu',
    },
    maxNumSentences: 1,
    silenceScale: 0.2,
  };
  tts = sherpa.createOfflineTts(config);
  return tts;
}

function getTts() {
  try {
    initTried = true;
    return createTts();
  } catch (e) {
    initError = e;
    throw e;
  }
}

function resolveSpeaker(voice) {
  const envVoice = process.env.LOCAL_TTS_VOICE || '';
  const raw = String(envVoice || voice || DEFAULT_SPEAKER).trim();
  if (/^\d+$/.test(raw)) return Math.max(0, Math.min(52, Number(raw)));
  if (SPEAKERS[raw] !== undefined) return SPEAKERS[raw];
  if (/xiaoni/i.test(raw)) return SPEAKERS.zf_xiaoni;
  if (/xiaoyi/i.test(raw)) return SPEAKERS.zf_xiaoyi;
  if (/yunjian/i.test(raw)) return SPEAKERS.zm_yunjian;
  return SPEAKERS[DEFAULT_SPEAKER];
}

function clampSpeed(rate) {
  const n = Number(rate);
  if (!Number.isFinite(n)) return 1.0;
  return Math.max(0.65, Math.min(1.35, n));
}

function wavBuffer(audio) {
  const samples = audio.samples;
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(audio.sampleRate, 24);
  buffer.writeUInt32LE(audio.sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const x = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(x < 0 ? x * 32768 : x * 32767), 44 + i * 2);
  }
  return buffer;
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  cache.delete(key);
  cache.set(key, hit);
  return hit;
}

function cacheSet(key, value) {
  cache.set(key, value);
  while (cache.size > CACHE_LIMIT) {
    cache.delete(cache.keys().next().value);
  }
}

function synthesize(text, opts = {}) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 500);
  if (!clean) throw new Error('text 参数为空');
  const sid = resolveSpeaker(opts.voice);
  const speed = clampSpeed(opts.rate);
  const key = `${sid}|${speed}|${clean}`;
  const hit = cacheGet(key);
  if (hit) return hit;

  const engine = getTts();
  const audio = engine.generateWithConfig(clean, {
    sid,
    speed,
    silenceScale: 0.2,
  });
  const out = {
    buffer: wavBuffer(audio),
    mime: 'audio/wav',
    speakerId: sid,
    sampleRate: audio.sampleRate,
  };
  cacheSet(key, out);
  return out;
}

function free() {
  if (tts && typeof tts.free === 'function') tts.free();
  tts = null;
}

module.exports = {
  DEFAULT_MODEL_DIR,
  SPEAKERS,
  status,
  synthesize,
  free,
  _state: () => ({ initTried, cacheSize: cache.size }),
};
