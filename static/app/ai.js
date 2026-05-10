// AI 客户端 — 讲解 / 拍照出题
// 通过 data.aiChat 发起请求；提示词在此模块构造

import { aiChat } from './data.js';

const AI_CFG_KEY = 'scholar_ai_cfg_v1';
const AI_DEFAULTS = {
  ai_url: '/v1/chat/completions',
  ai_model: 'openai/gpt-4o',
  ai_key: '',
  tts_url: '/tts',
  tts_voice: 'saturn_zh_female_keainvsheng_tob',
  tts_rate: 0.95,
};

export function loadAICfg() {
  try {
    const c = JSON.parse(localStorage.getItem(AI_CFG_KEY)) || {};
    return { ...AI_DEFAULTS, ...c };
  } catch (_) { return { ...AI_DEFAULTS }; }
}

export function saveAICfg(c) { localStorage.setItem(AI_CFG_KEY, JSON.stringify(c)); }

// 让 tts.js 通过 globalThis.__TTS_CFG 拿到当前 TTS 配置
export function syncTTSConfig() {
  const cfg = loadAICfg();
  globalThis.__TTS_CFG = {
    tts_url: cfg.tts_url,
    tts_voice: cfg.tts_voice,
    tts_rate: cfg.tts_rate,
  };
}

export async function explainQuestion(question) {
  const cfg = loadAICfg();
  const prompt = `你是一位耐心的小学老师"蘑菇博士"。学生答错了下面这道题，请用简单生动的语言一步步引导，先给提示再揭示答案：

题目：${question.q}
${Array.isArray(question.options) ? '选项：' + question.options.join(' / ') : ''}
正确答案：${question.answer}

请按以下格式输出，每行一句：
1. 友好打招呼，让学生不要紧张
2. 给一个生动的提示
3. 引导学生思考关键点
4. 揭示正确答案并解释为什么
5. 用一句话鼓励`;

  const res = await aiChat({
    url: cfg.ai_url,
    model: cfg.ai_model,
    apiKey: cfg.ai_key,
    messages: [
      { role: 'system', content: '你是儿童友好的小学辅导老师。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });
  const text = res?.choices?.[0]?.message?.content || '蘑菇博士暂时想不出来…';
  return { text };
}

export async function recognizeQuestionsFromPhoto(base64DataUrl) {
  const cfg = loadAICfg();
  const prompt = `这是一张小学生作业的照片。请识别出所有题目，转成 JSON。每题包含字段：
- q: 题目文字
- type: "choice" 或 "input"
- options: 选项数组（choice 类型必填）
- answer: 正确答案
- topic: 知识点
- lv: 难度（1=入门 2=进阶 3=挑战）

仅输出合法 JSON 数组，不要任何解释文字。`;

  const res = await aiChat({
    url: cfg.ai_url,
    model: cfg.ai_model,
    apiKey: cfg.ai_key,
    messages: [
      { role: 'system', content: '你是 OCR + 题库结构化助手。仅输出 JSON。' },
      { role: 'user', content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: base64DataUrl } },
      ] },
    ],
    temperature: 0.2,
  });
  const text = res?.choices?.[0]?.message?.content || '[]';
  try {
    const m = text.match(/\[[\s\S]*\]/);
    return JSON.parse(m ? m[0] : text);
  } catch (e) {
    console.error('AI 识别 JSON 解析失败:', e, text);
    return [];
  }
}

export function fileToBase64(f) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}
