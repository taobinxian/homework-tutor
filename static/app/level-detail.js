import { openSupply } from './supply.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

export function openCampaignLevelDetail(ctx, level, mapOverlay) {
  const { audio, ensureOverlay } = ctx;
  const overlay = ensureOverlay('leveldetail');
  overlay.innerHTML = `<div class="camp-detail">
    <div class="camp-head"><h2>${level.type === 'boss' ? '👾' : '🚀'} ${esc(level.title)}</h2><button class="camp-close">×</button></div>
    <div class="camp-detail-grid">
      <div><b>知识点</b><span>${esc(level.topic)}</span></div>
      <div><b>题数</b><span>${level.questionCount} 题</span></div>
      <div><b>战斗</b><span>${level.config?.waves || 3} 波${level.type === 'boss' ? ' + Boss' : ''}</span></div>
      <div><b>奖励</b><span>⚡${level.reward?.exp || 20} 🪙${level.reward?.gold || 10}</span></div>
    </div>
    <div class="camp-desc">答题补给会转化为弹药、护盾和大招。错题会进入错题本，结算会写入家长日报。</div>
    <button class="btn-start camp-start">开始补给</button>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  overlay.querySelector('.camp-start').onclick = async (e) => {
    const btn = e.currentTarget;
    if (btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    btn.disabled = true;
    btn.textContent = '启动中…';
    audio.sfxLevelUp();
    overlay.classList.remove('show');
    mapOverlay?.classList.remove('show');
    await openSupply(ctx, level);
  };
}
