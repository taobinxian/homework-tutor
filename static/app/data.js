// 后端 API 封装 — 所有 fetch 都走这里
// 其他模块禁止直接 fetch /api/*

const BASE = '';  // 同源部署

async function jsonRequest(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
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
  const res = await fetch(`${BASE}/api/questions/pick?${params}`);
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
