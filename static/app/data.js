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

export async function fetchNextCampaignLevel({ user = 'default', levelId, grade = 1, subject = 'math', semester = 'upper' } = {}) {
  const params = new URLSearchParams({ user, levelId, grade: String(grade), subject, semester });
  return jsonRequest(`${BASE}/api/campaign/next?${params}`);
}

export async function startCampaignSession(payload = {}) {
  return jsonRequest(`${BASE}/api/campaign/session/start`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCampaignSession(payload = {}) {
  return jsonRequest(`${BASE}/api/campaign/session/update`, { method: 'POST', body: JSON.stringify(payload) });
}

export async function saveCampaignProgress(payload = {}) {
  return jsonRequest(`${BASE}/api/campaign/progress/save`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: 5000 });
}

export async function markCampaignProgressStatus(payload = {}) {
  return jsonRequest(`${BASE}/api/campaign/progress/status`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: 5000 });
}

export async function fetchCampaignResume(user = 'default') {
  return jsonRequest(`${BASE}/api/campaign/progress/resume?user=${encodeURIComponent(user || 'default')}`);
}

export async function resolveCampaignProgressConflict(payload = {}) {
  return jsonRequest(`${BASE}/api/campaign/progress/resolve-conflict`, { method: 'POST', body: JSON.stringify(payload) });
}

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

// ========== 满血首发闭环：错题怪兽 / 悬赏 / 成长收集 / 地图事件 / 家庭互动 / 埋点 ==========
export async function fetchMonsters(user = 'default') {
  return jsonRequest(`${BASE}/api/monsters?user=${encodeURIComponent(user)}`);
}
export async function fetchBounties({ user = 'default', status = 'active' } = {}) {
  return jsonRequest(`${BASE}/api/bounties?user=${encodeURIComponent(user)}&status=${encodeURIComponent(status)}`);
}
export async function completeBounty(id, payload = {}) {
  return jsonRequest(`${BASE}/api/bounties/${encodeURIComponent(id)}/complete`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function claimBounty(id, payload = {}) {
  return jsonRequest(`${BASE}/api/bounties/${encodeURIComponent(id)}/claim`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function fetchGrowthSummary(user = 'default') {
  return jsonRequest(`${BASE}/api/growth/summary?user=${encodeURIComponent(user)}`);
}
export async function fetchInventory(user = 'default') {
  return jsonRequest(`${BASE}/api/inventory?user=${encodeURIComponent(user)}`);
}
export async function equipLoadout(payload = {}) {
  return jsonRequest(`${BASE}/api/loadout/equip`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function fetchKnowledgeBase(user = 'default') {
  return jsonRequest(`${BASE}/api/knowledge-base?user=${encodeURIComponent(user)}`);
}
export async function fetchRunHighlights({ user = 'default', runId } = {}) {
  return jsonRequest(`${BASE}/api/runs/${encodeURIComponent(runId || '')}/highlights?user=${encodeURIComponent(user)}`);
}
export async function fetchMapEvents({ user = 'default', status = 'available' } = {}) {
  return jsonRequest(`${BASE}/api/map-events?user=${encodeURIComponent(user)}&status=${encodeURIComponent(status)}`);
}
export async function completeMapEvent(id, payload = {}) {
  return jsonRequest(`${BASE}/api/map-events/${encodeURIComponent(id)}/complete`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function fetchPraiseCards(user = 'default') {
  return jsonRequest(`${BASE}/api/family/praise-cards?user=${encodeURIComponent(user)}`);
}
export async function createPraiseCard(payload = {}) {
  return jsonRequest(`${BASE}/api/family/praise-cards`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function claimPraiseCard(id, payload = {}) {
  return jsonRequest(`${BASE}/api/family/praise-cards/${encodeURIComponent(id)}/claim`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function fetchParentBoss(user = 'default') {
  return jsonRequest(`${BASE}/api/family/parent-boss?user=${encodeURIComponent(user)}`);
}
export async function createParentBoss(payload = {}) {
  return jsonRequest(`${BASE}/api/family/parent-boss`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function finishParentBoss(id, payload = {}) {
  return jsonRequest(`${BASE}/api/family/parent-boss/${encodeURIComponent(id)}/finish`, { method: 'POST', body: JSON.stringify(payload) });
}
export async function trackEvent(payload = {}) {
  return jsonRequest(`${BASE}/api/analytics/events`, { method: 'POST', body: JSON.stringify(payload), timeoutMs: 3000 });
}
