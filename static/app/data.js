// 后端 API 封装 — 所有 fetch 都走这里
// 其他模块禁止直接 fetch /api/*

const BASE = '';  // 同源部署
const DEFAULT_TIMEOUT_MS = 10000;  // 任何 API 默认 10s 超时；防止移动端弱网下 fetch 永不返回

// 带 timeout 的 fetch — fetch 本身没有内置超时，必须手动 AbortController
function fetchWithTimeout(url, opts = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  return fetch(url, { ...opts, signal: opts.signal || ctrl.signal })
    .finally(() => clearTimeout(t));
}

async function jsonRequest(url, opts = {}) {
  const res = await fetchWithTimeout(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  }, opts.timeoutMs || DEFAULT_TIMEOUT_MS);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.error) msg = body.error;
    } catch (_) {}
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// ========== 出题器 ==========

export async function fetchPick(opts) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(opts || {})) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) params.set(k, v.join(','));
    else params.set(k, String(v));
  }
  // 直接 fetch 以读取 X-Pick-Fallback header
  const res = await fetchWithTimeout(`${BASE}/api/questions/pick?${params}`);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const b = await res.json(); if (b?.error) msg = b.error; } catch (_) {}
    const err = new Error(msg); err.status = res.status; throw err;
  }
  const questions = await res.json();
  const fallbackRaw = res.headers.get('X-Pick-Fallback');
  const fallback = fallbackRaw ? decodeURIComponent(fallbackRaw) : null;
  return { questions, fallback };
}

export async function fetchCoverage() {
  return jsonRequest(`${BASE}/api/questions/coverage`);
}

export async function fetchAvailability() {
  return jsonRequest(`${BASE}/api/questions/availability`);
}

// ========== 知识战场 / 战役关卡 ==========

export async function fetchCampaignMap({ user = 'default', grade = 1, subject = 'math', semester = 'upper' } = {}) {
  const params = new URLSearchParams({ user, grade: String(grade), subject, semester });
  return jsonRequest(`${BASE}/api/campaign/map?${params}`);
}

export async function startCampaignLevel(payload) {
  return jsonRequest(`${BASE}/api/levels/start`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export async function submitSupply(payload) {
  return jsonRequest(`${BASE}/api/levels/supply/submit`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export async function finishLevelRun(payload) {
  return jsonRequest(`${BASE}/api/levels/finish`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export const finishCampaignLevel = finishLevelRun;

export async function fetchDailyReport({ user = 'default', date } = {}) {
  const params = new URLSearchParams({ user });
  if (date) params.set('date', date);
  return jsonRequest(`${BASE}/api/reports/daily?${params}`);
}

export async function fetchWeeklyReport({ user = 'default', endDate } = {}) {
  const params = new URLSearchParams({ user });
  if (endDate) params.set('endDate', endDate);
  return jsonRequest(`${BASE}/api/reports/weekly?${params}`);
}

export async function createReviewLevel(payload) {
  return jsonRequest(`${BASE}/api/reports/review-level`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// 主页"自由练习" finish 上报（让 BattleEngine 等也进家长日报）。
export async function submitFreePractice(payload) {
  return jsonRequest(`${BASE}/api/free-practice/finish`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export async function addQuestion(payload) {
  return jsonRequest(`${BASE}/api/questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ========== 课程纲目 ==========

export async function fetchCurriculum({ grade, subject } = {}) {
  const params = new URLSearchParams();
  if (grade) params.set('grade', String(grade));
  if (subject) params.set('subject', subject);
  return jsonRequest(`${BASE}/api/curriculum?${params}`);
}

// ========== 错题库 ==========

export async function wrongbookList(user) {
  return jsonRequest(`${BASE}/api/wrongbook?user=${encodeURIComponent(user || 'default')}`);
}

export async function wrongbookAdd(user, payload) {
  return jsonRequest(`${BASE}/api/wrongbook?user=${encodeURIComponent(user || 'default')}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function wrongbookDelete(user, id) {
  return jsonRequest(`${BASE}/api/wrongbook/${id}?user=${encodeURIComponent(user || 'default')}`, {
    method: 'DELETE',
  });
}

export async function wrongbookClear(user) {
  return jsonRequest(`${BASE}/api/wrongbook?user=${encodeURIComponent(user || 'default')}`, {
    method: 'DELETE',
  });
}

// ========== AI 聊天代理（流式可选）==========

export async function aiChat({ url, model, messages, temperature, apiKey, signal }) {
  const res = await fetch(url || `${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'Authorization': 'Bearer ' + apiKey } : {}),
    },
    body: JSON.stringify({ model, messages, temperature, stream: false }),
    signal,
  });
  if (!res.ok) {
    let msg = `AI HTTP ${res.status}`;
    try { const body = await res.json(); if (body?.error?.message) msg = body.error.message; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}
