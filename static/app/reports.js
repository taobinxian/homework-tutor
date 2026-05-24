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
    <button class="report-review" data-topic="${esc(x.topic)}">🧩 ${esc(x.topic)}（错 ${x.wrongCount}）· 生成复习副本</button>
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
    <div class="report-suggest">${esc(s.suggestion || '继续保持。')}</div>
    ${dayRows}
    ${renderRuns(report.runs || [])}
  `;
}

async function loadReport(data, user, mode) {
  return mode === 'weekly' ? data.fetchWeeklyReport({ user }) : data.fetchDailyReport({ user });
}

export async function openDailyReport(ctx) {
  const { data, SAVE, audio, ensureOverlay, toast } = ctx;
  const overlay = ensureOverlay('dailyreport');
  overlay.innerHTML = `<div class="report-panel"><div class="camp-head"><h2>📊 家长学习报告</h2><button class="camp-close">×</button></div>
    <div class="report-tabs"><button class="report-tab active" data-mode="daily">今日</button><button class="report-tab" data-mode="weekly">近7日</button></div>
    <div class="report-body">生成报告中…</div></div>`;
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
          const res = await data.createReviewLevel({ user: SAVE.user, topic, grade: 1, subject: 'math', semester: 'upper' });
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
      body.innerHTML = renderBody(report, mode);
      bindReviewButtons();
    } catch (e) {
      body.textContent = '报告加载失败：' + e.message;
    }
  };

  overlay.querySelectorAll('.report-tab').forEach(btn => btn.onclick = () => { audio.sfxClick(); render(btn.dataset.mode); });
  await render('daily');
}
