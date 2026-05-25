import { openCampaignLevelDetail } from './level-detail.js';

function esc(s) { return String(s ?? '').replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;' }[ch])); }
function pct(n) { return Math.round(Number(n || 0) * 100); }
function learnerContext(SAVE = {}) {
  return { grade: Number(SAVE.grade || 1), subject: SAVE.subject || 'math', semester: SAVE.semester || 'upper' };
}

async function enterReviewLevel(ctx, topic, sourceOverlay) {
  const { data, SAVE, audio, toast } = ctx;
  const title = String(topic || '').trim();
  if (!title) throw new Error('缺少复习知识点');
  const result = await data.createReviewLevel({ user: SAVE.user, topic: title, ...learnerContext(SAVE) });
  if (!result?.level) throw new Error('后端未返回复习副本');
  sourceOverlay?.classList.remove('show');
  audio.sfxLevelUp?.();
  openCampaignLevelDetail(ctx, result.level, sourceOverlay);
  toast?.(`已进入复习副本：${title}`, 1400);
  return result.level;
}

export async function openMonsterAtlas(ctx) {
  const { data, SAVE, audio, ensureOverlay, toast } = ctx;
  const isCurrent = () => !ctx.isHomePanelCurrent || ctx.isHomePanelCurrent();
  if (!isCurrent()) return;
  const overlay = ensureOverlay('monster-atlas');
  overlay.innerHTML = `<div class="camp-panel"><div class="camp-head"><h2>🐲 错题怪兽图鉴</h2><button class="camp-close">×</button></div><div class="camp-body">同步错题怪兽中…</div></div>`;
  overlay.dataset.homePanel = '1';
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  const body = overlay.querySelector('.camp-body');
  try {
    const [monsters, bounties] = await Promise.all([data.fetchMonsters(SAVE.user), data.fetchBounties({ user: SAVE.user, status: 'active' })]);
    if (!isCurrent()) { overlay.classList.remove('show'); return; }
    const bountyByMonster = new Map((bounties || []).map(b => [b.monsterId, b]));
    body.innerHTML = monsters.length ? `<div class="monster-grid">${monsters.map(m => {
      const b = bountyByMonster.get(m.id);
      return `<div class="wb-item monster-card">
        <div class="wb-q">${m.status === 'purified' ? '✨' : m.status === 'bounty' ? '🎯' : '🐲'} ${esc(m.name)}</div>
        <div class="wb-meta">${esc(m.topic)} · 错 ${m.wrongCount} · ${esc(m.status)}</div>
        <div class="wb-ans">知识点：${(m.knowledgePoints || []).map(esc).join('、') || esc(m.topic)}</div>
        ${b ? `<button class="monster-bounty" data-id="${esc(b.id)}" data-topic="${esc(b.topic || m.topic)}">挑战悬赏：${esc(b.difficulty)}</button>` : `<button class="monster-review" data-topic="${esc(m.topic)}">生成复习副本</button>`}
      </div>`;
    }).join('')}</div>` : '<div class="inv-empty">目前没有错题怪兽。继续冒险，遇到错题也不用怕，它会变成可战胜的挑战。</div>';
    body.querySelectorAll('.monster-review').forEach(btn => btn.onclick = async () => {
      audio.sfxClick();
      btn.disabled = true;
      try { await enterReviewLevel(ctx, btn.dataset.topic, overlay); }
      catch (e) { btn.disabled = false; toast?.('进入失败：' + e.message); }
    });
    body.querySelectorAll('.monster-bounty').forEach(btn => btn.onclick = async () => {
      audio.sfxClick();
      btn.disabled = true;
      try { await enterReviewLevel(ctx, btn.dataset.topic, overlay); }
      catch (e) { btn.disabled = false; toast?.('挑战启动失败：' + e.message); }
    });
  } catch (e) { if (!isCurrent()) { overlay.classList.remove('show'); return; } body.textContent = '图鉴加载失败：' + e.message; }
}

export async function openBountyBoard(ctx) {
  const { data, SAVE, audio, ensureOverlay, toast } = ctx;
  const isCurrent = () => !ctx.isHomePanelCurrent || ctx.isHomePanelCurrent();
  if (!isCurrent()) return;
  const overlay = ensureOverlay('bounty-board');
  overlay.innerHTML = `<div class="report-panel"><div class="camp-head"><h2>🎯 薄弱点悬赏</h2><button class="camp-close">×</button></div><div class="report-body">生成当前推荐任务…</div></div>`;
  overlay.dataset.homePanel = '1';
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  const body = overlay.querySelector('.report-body');
  try {
    const bounties = await data.fetchBounties({ user: SAVE.user, status: 'all' });
    if (!isCurrent()) { overlay.classList.remove('show'); return; }
    body.innerHTML = bounties.length ? bounties.map(b => `<div class="wb-item">
      <div class="wb-q">${b.status === 'completed' ? '✅' : b.status === 'claimed' ? '🎁' : '🎯'} ${esc(b.topic)} · ${esc(b.difficulty)}</div>
      <div class="wb-meta">状态：${esc(b.status)} · 目标：${b.target.minQuestions || 5} 题，正确率 ≥ ${pct(b.target.minAccuracy || .8)}%</div>
      <div class="wb-ans">奖励：🪙${b.reward.gold || 0} · ${(b.reward.items || []).map(i => esc(i.name)).join('、')}</div>
      ${b.status === 'completed'
        ? `<button class="bounty-claim" data-id="${esc(b.id)}">领取奖励</button>`
        : b.status === 'active'
          ? `<button class="bounty-review" data-topic="${esc(b.topic)}">进入复习副本</button>`
          : '<span class="wb-meta">奖励已领取</span>'}
    </div>`).join('') : '<div class="inv-empty">暂无悬赏。日报识别到薄弱点或错题累计后会自动出现。</div>';
    body.querySelectorAll('.bounty-review').forEach(btn => btn.onclick = async () => {
      audio.sfxClick();
      btn.disabled = true;
      try { await enterReviewLevel(ctx, btn.dataset.topic, overlay); }
      catch (e) { btn.disabled = false; toast?.('复习副本进入失败：' + e.message); }
    });
    body.querySelectorAll('.bounty-claim').forEach(btn => btn.onclick = async () => {
      audio.sfxClick();
      try { await data.claimBounty(btn.dataset.id, { user: SAVE.user }); toast?.('悬赏奖励已领取'); openBountyBoard(ctx); }
      catch (e) { toast?.('领取失败：' + e.message); }
    });
  } catch (e) { if (!isCurrent()) { overlay.classList.remove('show'); return; } body.textContent = '悬赏加载失败：' + e.message; }
}

export async function openGrowthCenter(ctx) {
  const { data, SAVE, audio, ensureOverlay } = ctx;
  const isCurrent = () => !ctx.isHomePanelCurrent || ctx.isHomePanelCurrent();
  if (!isCurrent()) return;
  const overlay = ensureOverlay('growth-center');
  overlay.innerHTML = `<div class="report-panel"><div class="camp-head"><h2>🌱 成长收集中心</h2><button class="camp-close">×</button></div><div class="report-body">读取知识战力…</div></div>`;
  overlay.dataset.homePanel = '1';
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  const body = overlay.querySelector('.report-body');
  try {
    const [g, kb] = await Promise.all([data.fetchGrowthSummary(SAVE.user), data.fetchKnowledgeBase(SAVE.user)]);
    if (!isCurrent()) { overlay.classList.remove('show'); return; }
    body.innerHTML = `<div class="report-metrics"><div><b>${g.knowledgePower}</b><span>知识战力</span></div><div><b>${esc(g.title)}</b><span>称号</span></div><div><b>${g.inventory.length}</b><span>收集</span></div></div>
      <h3>掌握度升级</h3><div class="report-runs">${(g.mastery || []).slice(0, 8).map(m => `<div>${esc(m.topic)} · ${m.score || Math.round((m.mastery||0)*100)} 分 · ${esc(m.status || '')}</div>`).join('') || '暂无掌握记录'}</div>
      <h3>宠物 / 装备 / 徽章</h3><div class="report-runs">${g.inventory.map(i => `<div>${i.type === 'pet' ? '🐾' : i.type === 'equipment' ? '🛡️' : i.type === 'badge' ? '🏅' : '🧱'} ${esc(i.name)} ×${i.qty}</div>`).join('')}</div>
      <h3>知识基地</h3><div class="report-runs">${(kb || []).map(i => `<div>🏗️ ${esc(i.name)} · ${esc(i.topic)}</div>`).join('') || '掌握知识点后会建设基地建筑'}</div>`;
  } catch (e) { if (!isCurrent()) { overlay.classList.remove('show'); return; } body.textContent = '成长中心加载失败：' + e.message; }
}

export async function openFamilyCenter(ctx) {
  const { data, SAVE, audio, ensureOverlay, toast } = ctx;
  const isCurrent = () => !ctx.isHomePanelCurrent || ctx.isHomePanelCurrent();
  if (!isCurrent()) return;
  const overlay = ensureOverlay('family-center');
  overlay.innerHTML = `<div class="report-panel"><div class="camp-head"><h2>👨‍👩‍👧 家庭互动</h2><button class="camp-close">×</button></div><div class="report-body">加载家庭互动…</div></div>`;
  overlay.dataset.homePanel = '1';
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  const body = overlay.querySelector('.report-body');
  const render = async () => {
    const [cards, bosses] = await Promise.all([data.fetchPraiseCards(SAVE.user), data.fetchParentBoss(SAVE.user)]);
    if (!isCurrent()) { overlay.classList.remove('show'); return; }
    body.innerHTML = `<div class="camp-actions"><button class="create-praise">发一张表扬卡</button><button class="create-boss">出一道家长 Boss 题</button></div>
      <h3>表扬卡信箱</h3>${cards.map(c => `<div class="wb-item"><div class="wb-q">💌 ${esc(c.message)}</div><div class="wb-meta">${esc(c.status)}</div>${c.status !== 'claimed' ? `<button class="claim-praise" data-id="${esc(c.id)}">孩子领取</button>` : ''}</div>`).join('') || '<div class="inv-empty">暂无表扬卡</div>'}
      <h3>家长 Boss 挑战</h3>${bosses.map(b => `<div class="wb-item"><div class="wb-q">👾 ${esc(b.q)}</div><div class="wb-meta">${esc(b.topic)} · ${esc(b.status)}</div>${b.status !== 'completed' ? `<input class="boss-answer" data-id="${esc(b.id)}" placeholder="孩子答案"><button class="finish-boss" data-id="${esc(b.id)}">提交挑战</button>` : `<div class="wb-ans">结果：${esc(b.result)}</div>`}</div>`).join('') || '<div class="inv-empty">暂无家长 Boss 题</div>'}`;
    body.querySelector('.create-praise').onclick = async () => { audio.sfxClick(); await data.createPraiseCard({ user: SAVE.user, topic: '今日学习' }); toast?.('表扬卡已放入孩子信箱'); render(); };
    body.querySelector('.create-boss').onclick = async () => { audio.sfxClick(); await data.createParentBoss({ user: SAVE.user, topic: '家长挑战', q: '家长 Boss：6 + 3 = ?', options: ['8','9','10'], answer: '9' }); toast?.('家长 Boss 题已创建'); render(); };
    body.querySelectorAll('.claim-praise').forEach(btn => btn.onclick = async () => { await data.claimPraiseCard(btn.dataset.id, { user: SAVE.user }); toast?.('领取成功，获得基地材料和徽章'); render(); });
    body.querySelectorAll('.finish-boss').forEach(btn => btn.onclick = async () => { const input = body.querySelector(`.boss-answer[data-id="${btn.dataset.id}"]`); const r = await data.finishParentBoss(btn.dataset.id, { user: SAVE.user, userAnswer: input?.value || '' }); toast?.(r.correct ? '破盾成功！' : '没关系，已进入错题怪兽链路'); render(); });
  };
  try { await render(); } catch (e) { if (!isCurrent()) { overlay.classList.remove('show'); return; } body.textContent = '家庭互动加载失败：' + e.message; }
}
