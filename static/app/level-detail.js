import { openSupply } from './supply.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

export function openCampaignLevelDetail(ctx, level, mapOverlay) {
  const { data, SAVE, audio, ensureOverlay, toast } = ctx;
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
    <label class="camp-batch-label">连续闯关数量 <input class="camp-batch-count" type="number" min="1" max="20" value="1" /></label>
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
    const plannedCount = Math.max(1, Math.min(20, Number(overlay.querySelector('.camp-batch-count')?.value || 1)));
    try {
      const res = await data.startCampaignSession({ user: SAVE.user, grade: level.grade || 1, subject: level.subject || 'math', semester: level.semester || 'upper', plannedCount, startLevelId: level.id, currentLevelId: level.id });
      SAVE.campaignSession = res.session;
    } catch (err) {
      toast?.('⚠️ 连续闯关会话创建失败，将以单关模式继续：' + err.message, 2600);
      SAVE.campaignSession = { plannedCount, startLevelId: level.id, currentLevelId: level.id, currentIndex: 1, passedCount: 0, totalStars: 0, wrongCount: 0, durationSec: 0 };
    }
    overlay.classList.remove('show');
    mapOverlay?.classList.remove('show');
    await openSupply({ ...ctx, campaignSession: SAVE.campaignSession }, level);
  };
}
