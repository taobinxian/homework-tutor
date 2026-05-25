import { openCampaignLevelDetail } from './level-detail.js';
import { openDailyReport } from './reports.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

export async function openCampaignMap(ctx) {
  const { data, SAVE, audio, ensureOverlay, persistSave } = ctx;
  const overlay = ensureOverlay('campaign');
  overlay.innerHTML = `<div class="camp-panel"><div class="camp-head"><h2>🪐 知识战场</h2><button class="camp-close">×</button></div><div class="camp-body">加载战役地图…</div></div>`;
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  const body = overlay.querySelector('.camp-body');
  try {
    const map = await data.fetchCampaignMap({ user: SAVE.user, grade: 1, subject: 'math', semester: 'upper' });
    const levels = map.chapters?.[0]?.levels || [];
    body.innerHTML = `
      <div class="camp-world"><div class="camp-planet">${map.world?.icon || '⚙️'}</div><div><h3>${esc(map.world?.name || '机械星')}</h3><p>${esc(map.world?.description || '')}</p></div></div>
      <div class="camp-chapter"><b>第 1 章：数字能量工厂</b><span>一年级数学上册样板章节</span></div>
      ${map.seedHint ? `<div class="camp-desc">${esc(map.seedHint)}</div>` : ''}
      ${SAVE.campaignSession ? `<div class="camp-progress"><b>连续闯关进度：</b>第 ${Number(SAVE.campaignSession.passedCount || 0) + 1}/${SAVE.campaignSession.plannedCount || 1} 关 · 通关 ${SAVE.campaignSession.passedCount || 0} · 总星数 ${SAVE.campaignSession.totalStars || 0} · 错题 ${SAVE.campaignSession.wrongCount || 0} · 用时 ${Math.round((SAVE.campaignSession.durationSec || 0) / 60)} 分钟 <button class="camp-save-exit">暂停/保存并退出</button></div>` : ''}
      ${map.mapEvents?.length ? `<div class="camp-chapter"><b>地图事件</b><span>宝箱 / NPC / 分支挑战</span></div><div class="camp-levels map-events">${map.mapEvents.map(e => `<button class="camp-node event ${e.type}" data-event="${esc(e.id)}"><span class="camp-node-icon">${e.type === 'chest' ? '🎁' : e.type === 'branch' ? '🛤️' : '🧙'}</span><span class="camp-node-title">${esc(e.config?.title || e.type)}</span><small>${esc(e.config?.topic || '')}</small></button>`).join('')}</div>` : ''}
      <div class="camp-levels">${levels.map(l => `
        <button class="camp-node ${l.type} ${l.unlocked ? '' : 'locked'} ${map.recommendedLevelId === l.id ? 'recommended' : ''}" data-id="${esc(l.id)}" ${l.unlocked ? '' : 'disabled'}>
          <span class="camp-node-icon">${l.config?.icon || (l.type === 'boss' ? '👾' : '⚙️')}</span>
          <span class="camp-node-title">${esc(l.title)}</span>
          <span class="camp-node-stars">${'⭐'.repeat(l.stars)}${'☆'.repeat(3 - l.stars)}</span>
          <small>${esc(l.topic)} · ${l.type}</small>
        </button>`).join('')}</div>
      <div class="camp-actions"><button class="camp-report-open">📊 查看家长日报</button></div>
    `;
    body.querySelectorAll('.camp-node[data-id]').forEach(btn => btn.onclick = () => {
      audio.sfxClick();
      const level = levels.find(l => l.id === btn.dataset.id);
      if (level) openCampaignLevelDetail(ctx, level, overlay);
    });
    body.querySelectorAll('.camp-node[data-event]').forEach(btn => btn.onclick = async () => {
      audio.sfxClick();
      const ev = (map.mapEvents || []).find(e => e.id === btn.dataset.event);
      if (!ev) return;
      if (ev.type === 'npc') { alert(ev.config?.text || '继续保持，知识能量正在变强！'); return; }
      if (ev.type === 'branch') {
        const level = levels.find(l => l.id === ev.levelId) || {
          id: ev.levelId,
          title: ev.config?.title || '分支挑战',
          topic: ev.config?.topic || '',
          type: 'review',
          difficulty: 1,
          questionCount: ev.config?.questionCount || 5,
          config: { ...(ev.config || {}), icon: '🛤️', waves: 2 },
          reward: ev.config?.reward || { exp: 12, gold: 6 },
          unlocked: true,
          stars: 0,
        };
        openCampaignLevelDetail(ctx, level, overlay);
        return;
      }
      try { await data.completeMapEvent(ev.id, { user: SAVE.user }); btn.disabled = true; btn.querySelector('small').textContent = '已完成'; }
      catch (e) { alert('事件完成失败：' + e.message); }
    });
    const saveExit = body.querySelector('.camp-save-exit');
    if (saveExit) saveExit.onclick = async () => {
      audio.sfxClick();
      try { await data.updateCampaignSession({ ...SAVE.campaignSession, user: SAVE.user, sessionId: SAVE.campaignSession?.sessionId, status: 'abandoned' }); } catch (_) {}
      SAVE.campaignSession = null;
      persistSave?.();
      ctx.toast?.('已保存并退出连续闯关');
      overlay.classList.remove('show');
    };
    body.querySelector('.camp-report-open').onclick = () => { audio.sfxClick(); openDailyReport(ctx); };
  } catch (e) {
    audio.sfxWrong();
    body.textContent = '地图加载失败：' + e.message;
  }
}
