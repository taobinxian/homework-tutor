import { openCampaignLevelDetail } from './level-detail.js';
import { openDailyReport } from './reports.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

export async function openCampaignMap(ctx) {
  const { data, SAVE, audio, ensureOverlay } = ctx;
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
      <div class="camp-levels">${levels.map(l => `
        <button class="camp-node ${l.type} ${l.unlocked ? '' : 'locked'} ${map.recommendedLevelId === l.id ? 'recommended' : ''}" data-id="${esc(l.id)}" ${l.unlocked ? '' : 'disabled'}>
          <span class="camp-node-icon">${l.config?.icon || (l.type === 'boss' ? '👾' : '⚙️')}</span>
          <span class="camp-node-title">${esc(l.title)}</span>
          <span class="camp-node-stars">${'⭐'.repeat(l.stars)}${'☆'.repeat(3 - l.stars)}</span>
          <small>${esc(l.topic)} · ${l.type}</small>
        </button>`).join('')}</div>
      <div class="camp-actions"><button class="camp-report-open">📊 查看家长日报</button></div>
    `;
    body.querySelectorAll('.camp-node').forEach(btn => btn.onclick = () => {
      audio.sfxClick();
      const level = levels.find(l => l.id === btn.dataset.id);
      if (level) openCampaignLevelDetail(ctx, level, overlay);
    });
    body.querySelector('.camp-report-open').onclick = () => { audio.sfxClick(); openDailyReport(ctx); };
  } catch (e) {
    audio.sfxWrong();
    body.textContent = '地图加载失败：' + e.message;
  }
}
