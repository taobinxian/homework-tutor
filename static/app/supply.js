// 知识补给 UI：答题 -> submitSupply -> 后端落 level_run_answers / mastery；
// 资源计算由前端 (engines/resources.js) 唯一拥有，与战斗 engine 共用同一公式。

import { computeSupplyResources, addResources } from './engines/resources.js';

function esc(s) {
  return String(s ?? '').replace(/[&<>\"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

function choiceOptions(q) {
  if (Array.isArray(q.options) && q.options.length) return q.options.map(String);
  const ans = String(q.answer ?? '');
  const nums = /^-?\d+$/.test(ans) ? [Number(ans) - 1, Number(ans) + 1, Number(ans) + 2].map(String) : [];
  return [...new Set([ans, ...nums, '0', '1', '2', '3', '4', '5'])].slice(0, 4);
}

function isCorrect(q, userAnswer) {
  return String(userAnswer).trim() === String(q.answer ?? '').trim();
}

function renderResources(r = {}) {
  return `🔸弹药 ${r.ammo_basic || 0} · 💥爆裂 ${r.skill_bomb || 0} · 🛡护盾 ${r.shield || 0} · ⚡大招 ${r.ultimate_energy || 0}`;
}

export async function openSupply(ctx, level) {
  const { data, SAVE, audio, toast, ensureOverlay } = ctx;
  const overlay = ensureOverlay('supply');
  overlay.innerHTML = `<div class="supply-panel">
    <div class="camp-head"><h2>📦 ${esc(level.title)} · 开局知识补给</h2><button class="camp-close">×</button></div>
    <div class="supply-body">准备补给题…</div>
  </div>`;
  overlay.classList.add('show');
  overlay.querySelector('.camp-close').onclick = () => { audio.sfxClick(); overlay.classList.remove('show'); };

  let payload;
  try {
    payload = await data.startCampaignLevel({ user: SAVE.user, levelId: level.id });
  } catch (e) {
    audio.sfxWrong();
    overlay.querySelector('.supply-body').textContent = '关卡启动失败：' + e.message;
    return;
  }

  const body = overlay.querySelector('.supply-body');
  const questions = (payload.questions || []).slice(0, payload.supplyConfig?.opening || 5);
  const answers = [];
  let idx = 0;
  let combo = 0;
  const difficulty = Number(level.difficulty || 1);
  let resources = { ...(payload.initialResources || {}) };

  const renderQuestion = () => {
    const q = questions[idx];
    if (!q) return renderDone();
    const opts = choiceOptions(q);
    body.innerHTML = `<div class="supply-progress">第 ${idx + 1} / ${questions.length} 题</div>
      <div class="supply-resource">当前资源：${renderResources(resources)}</div>
      <div class="ks-qcard supply-card">
        <div class="ks-qphase">答对越多，战斗补给越充足</div>
        <div class="ks-qtext">${esc(q.q)}</div>
        <div class="ks-options">${opts.map(o => `<button class="ks-opt" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>
      </div>`;
    body.querySelectorAll('.ks-opt').forEach(btn => {
      btn.onclick = async () => {
        const userAnswer = btn.dataset.answer;
        const correct = isCorrect(q, userAnswer);
        audio[correct ? 'sfxHit' : 'sfxWrong']();
        const durationMs = 0; // 开局补给当前不计时；保留字段供后端 mastery 使用
        const answerRecord = { ...q, questionId: q.id, userAnswer, isCorrect: correct, phase: 'opening', durationMs };
        answers.push(answerRecord);
        combo = correct ? combo + 1 : 0;
        resources = addResources(resources, computeSupplyResources({ correct, combo, phase: 'opening', durationMs, difficulty }));
        body.querySelectorAll('.ks-opt').forEach(b => {
          b.disabled = true;
          if (isCorrect(q, b.dataset.answer)) b.classList.add('correct');
        });
        btn.classList.add(correct ? 'selected' : 'wrong');
        try {
          await data.submitSupply({ runId: payload.runId, phase: 'opening', answers: [answerRecord] });
          toast(`补给更新：${renderResources(resources)}`, 1200);
        } catch (e) {
          toast('⚠️ 补给记录失败：' + e.message, 2200);
        }
        setTimeout(() => { idx += 1; renderQuestion(); }, 420);
      };
    });
  };

  const renderDone = () => {
    const correct = answers.filter(a => a.isCorrect).length;
    body.innerHTML = `<div class="supply-done">
      <div class="result-emoji">📦</div>
      <h3>补给完成</h3>
      <p>答对 <b>${correct}</b> / ${answers.length}，已获得：</p>
      <div class="supply-resource big">${renderResources(resources)}</div>
      <div class="camp-desc">补给记录已写入后端，掌握度已更新。下一步将用这些资源进入 KnowledgeShooter 战斗。</div>
      <button class="btn-start supply-battle">进入战斗</button>
    </div>`;
    body.querySelector('.supply-battle').onclick = (e) => {
      const btn = e.currentTarget;
      if (btn.dataset.busy === '1') return;
      btn.dataset.busy = '1';
      btn.disabled = true;
      btn.textContent = '进入中…';
      audio.sfxLevelUp();
      overlay.classList.remove('show');
      ctx.onSupplyComplete?.({ ...payload, openingAnswers: answers, resources });
    };
  };

  renderQuestion();
}
