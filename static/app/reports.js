// 家长报告 UI：今日 / 近 7 日聚合 + 薄弱点复习副本入口

import { openCampaignLevelDetail } from './level-detail.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function formatDuration(seconds, minutes) {
  const s = Number(seconds || 0);
  if (s <= 0) return '0 分钟';
  if (s < 60) return `${s} 秒`;
  return `${Number(minutes ?? Math.round(s / 60))} 分钟`;
}

function renderMetrics(s = {}) {
  return `<div class="report-metrics">
    <div><b>${s.questionCount || 0}</b><span>答题数</span></div>
    <div><b>${Math.round((s.accuracy || 0) * 100)}%</b><span>正确率</span></div>
    <div><b>${s.wrongCount || 0}</b><span>错题</span></div>
  </div>`;
}

function renderWeakTopics(weakTopics = []) {
  if (!weakTopics.length) return '<div class="report-weak"><b>薄弱点：</b>暂无明显薄弱点</div>';
  return `<div class="report-weak"><b>薄弱点：</b><div class="report-weak-list">${weakTopics.map(x => `
    <button class="report-review" data-topic="${esc(x.topic)}" data-grade="${esc(x.grade || 1)}" data-subject="${esc(x.subject || 'math')}" data-semester="${esc(x.semester || 'upper')}">🧩 ${esc(x.topic)}（错 ${x.wrongCount}）· 生成复习副本</button>
  `).join('')}</div></div>`;
}

function renderRuns(runs = []) {
  return `<div class="report-runs">${runs.map(r => `<div>⭐${r.stars} · ${esc(r.title || r.levelId)} · 答对 ${r.correct} / 错 ${r.wrong}</div>`).join('')}</div>`;
}

function renderBody(report, mode) {
  const s = report.summary || {};
  const period = report.period || {};
  const title = mode === 'weekly' ? `近 7 日（${period.startDate || ''} ~ ${period.endDate || ''}）` : '今日';
  const duration = formatDuration(s.learningSeconds, s.learningMinutes);
  const dayRows = mode === 'weekly' && s.byDay?.length
    ? `<div class="report-runs"><b>每日趋势：</b>${s.byDay.map(d => `<div>${d.date} · ${d.questionCount} 题 · 正确率 ${d.questionCount ? Math.round(d.correctCount * 100 / d.questionCount) : 0}% · ${formatDuration(d.learningSeconds, d.learningMinutes)}</div>`).join('')}</div>`
    : '';
  return `
    <p>${title}学习 <b>${duration}</b>，完成 <b>${s.levelsCompleted || 0}</b> 个知识战场关卡。</p>
    ${renderMetrics(s)}
    ${renderWeakTopics(s.weakTopics || [])}
    ${report.recommendedBounties?.length ? `<div class="report-weak"><b>报告反哺悬赏：</b>${report.recommendedBounties.map(b => `🎯 ${esc(b.topic)} · ${esc(b.difficulty)}`).join('、')}</div>` : ''}
    <div class="report-suggest">${esc(s.suggestion || '继续保持。')}</div>
    <div class="camp-actions"><button class="report-create-bounty">🎯 生成复习悬赏</button><button class="report-create-praise">💌 发表扬卡</button><button class="report-create-boss">👾 出 Boss 题</button></div>
    ${dayRows}
    ${renderRuns(report.runs || [])}
  `;
}

async function loadReport(data, user, mode) {
  return mode === 'weekly' ? data.fetchWeeklyReport({ user }) : data.fetchDailyReport({ user });
}

export async function openDailyReport(ctx) {
  const { data, SAVE, audio, ensureOverlay, toast } = ctx;
  const isCurrent = () => !ctx.isHomePanelCurrent || ctx.isHomePanelCurrent();
  if (!isCurrent()) return;
  const overlay = ensureOverlay('dailyreport');
  overlay.innerHTML = `<div class="report-panel"><div class="camp-head"><h2>📊 家长学习报告</h2><button class="camp-close">×</button></div>
    <div class="report-tabs"><button class="report-tab active" data-mode="daily">今日</button><button class="report-tab" data-mode="weekly">近7日</button></div>
    <div class="report-body">生成报告中…</div></div>`;
  overlay.dataset.homePanel = '1';
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };
  const body = overlay.querySelector('.report-body');

  const bindReviewButtons = () => {
    body.querySelectorAll('.report-review').forEach(btn => {
      btn.onclick = async () => {
        audio.sfxClick();
        const topic = btn.dataset.topic;
        btn.disabled = true;
        btn.textContent = `生成「${topic}」复习副本中…`;
        try {
          const res = await data.createReviewLevel({
            user: SAVE.user,
            topic,
            grade: Number(btn.dataset.grade || SAVE.grade || 1),
            subject: btn.dataset.subject || SAVE.subject || 'math',
            semester: btn.dataset.semester || SAVE.semester || 'upper',
          });
          overlay.classList.remove('show');
          toast?.(`已生成复习副本：${topic}`, 1400);
          openCampaignLevelDetail(ctx, res.level, overlay);
        } catch (e) {
          btn.disabled = false;
          btn.textContent = `🧩 ${topic} · 生成复习副本`;
          toast?.('复习副本生成失败：' + e.message, 2200);
        }
      };
    });
  };

  const render = async (mode) => {
    body.textContent = '生成报告中…';
    overlay.querySelectorAll('.report-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    try {
      const report = await loadReport(data, SAVE.user, mode);
      if (!isCurrent()) { overlay.classList.remove('show'); return; }
      body.innerHTML = renderBody(report, mode);
      bindReviewButtons();
      body.querySelector('.report-create-bounty')?.addEventListener('click', async () => {
        audio.sfxClick();
        const topic = report.summary?.weakTopics?.[0]?.topic || report.summary?.mastery?.[0]?.topic || '今日复习';
        await data.fetchBounties({ user: SAVE.user, status: 'active' });
        toast?.(`已根据报告刷新「${topic}」悬赏`, 1600);
      });
      body.querySelector('.report-create-praise')?.addEventListener('click', async () => {
        audio.sfxClick(); await data.createPraiseCard({ user: SAVE.user, topic: report.summary?.weakTopics?.[0]?.topic || '今日学习' }); toast?.('表扬卡已生成，孩子侧可领取', 1600);
      });
      body.querySelector('.report-create-boss')?.addEventListener('click', async () => {
        audio.sfxClick(); await data.createParentBoss({ user: SAVE.user, topic: report.summary?.weakTopics?.[0]?.topic || '家长挑战', q: '家长 Boss：4 + 5 = ?', options: ['8','9','10'], answer: '9' }); toast?.('家长 Boss 题已生成', 1600);
      });
    } catch (e) {
      if (!isCurrent()) { overlay.classList.remove('show'); return; }
      body.textContent = '报告加载失败：' + e.message;
    }
  };

  overlay.querySelectorAll('.report-tab').forEach(btn => btn.onclick = () => { audio.sfxClick(); render(btn.dataset.mode); });
  await render('daily');
}
