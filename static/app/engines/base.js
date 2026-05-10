// LevelEngine 抽象 — 所有引擎的协议
// 子类必须实现：start, ask, onAnswer, finish
// 不可直接调用 fetch / wrongbook / TTS — 统一通过 callbacks
//
// callbacks 协议：
//   onCorrect(q)
//   onWrong(q, userAnswer)
//   onWrongAdd(q, userAnswer) -> Promise (写入错题库)
//   onComplete({result, stats}) — result: 'win' | 'fail' | 'complete'
//   requestExplain(q) -> Promise<{ text }> (AI 讲解)
//   requestTTS(text) -> Promise (朗读)

export class LevelEngine {
  constructor({ container, questions, callbacks = {}, config = {} }) {
    if (!container) throw new Error('LevelEngine: container is required');
    if (!Array.isArray(questions)) throw new Error('LevelEngine: questions must be array');
    this.container = container;
    this.questions = questions;
    this.callbacks = callbacks;
    this.config = config;
    this.idx = 0;
    this.stats = { correct: 0, wrong: 0, started: false, ended: false };
    this._listeners = [];
  }

  // 注册 DOM 事件，destroy 时统一卸载
  _on(target, event, handler, opts) {
    target.addEventListener(event, handler, opts);
    this._listeners.push({ target, event, handler, opts });
  }

  _clearListeners() {
    for (const l of this._listeners) {
      try { l.target.removeEventListener(l.event, l.handler, l.opts); } catch (_) {}
    }
    this._listeners = [];
  }

  current() { return this.questions[this.idx]; }
  hasNext() { return this.idx < this.questions.length - 1; }

  // ---- 抽象方法（子类实现）----
  async start() {
    throw new Error('LevelEngine subclass must implement start()');
  }

  async ask(_q) {
    throw new Error('LevelEngine subclass must implement ask()');
  }

  async onAnswer(_q, _userAnswer, _correct) {
    throw new Error('LevelEngine subclass must implement onAnswer()');
  }

  async finish() {
    throw new Error('LevelEngine subclass must implement finish()');
  }

  // 统一的"主循环"，子类可重写但通常调用即可
  async run() {
    await this.start();
    this.stats.started = true;
    while (this.idx < this.questions.length && !this.stats.ended) {
      const q = this.questions[this.idx];
      const { userAnswer, correct } = await this.ask(q);
      if (correct) {
        this.stats.correct++;
        this.callbacks.onCorrect?.(q);
      } else {
        this.stats.wrong++;
        this.callbacks.onWrong?.(q, userAnswer);
        // 错题入库 fire-and-forget — 即使网络挂起也不阻塞下一题流程
        if (this.callbacks.onWrongAdd) {
          Promise.resolve()
            .then(() => this.callbacks.onWrongAdd(q, userAnswer))
            .catch(err => console.warn('[engine] onWrongAdd 失败:', err));
        }
      }
      await this.onAnswer(q, userAnswer, correct);
      if (this.stats.ended) break;
      this.idx++;
    }
    // 无论是循环正常结束还是引擎中途置 stats.ended=true（HP 归零 / Boss 击败 / 防线失守），
    // 都必须走 finish() + onComplete()，否则关卡会卡死在原地
    if (!this._completed) {
      this._completed = true;
      this.stats.ended = true;
      const result = await this.finish();
      this.callbacks.onComplete?.({
        result: result?.result || 'complete',
        stats: { ...this.stats, ...(result?.stats || {}) },
      });
    }
  }

  // 终止关卡（外部调用，如用户点退出）
  abort(reason = 'aborted') {
    if (this._completed) return;
    this._completed = true;
    this.stats.ended = true;
    this.callbacks.onComplete?.({ result: reason, stats: { ...this.stats } });
    this.destroy();
  }

  destroy() {
    this._clearListeners();
    if (this.container) this.container.innerHTML = '';
  }
}

// 通用工具：判断答案是否正确（兼容前端原 normalize 逻辑）
export function normalizeAnswer(s) {
  return String(s || '')
    .replace(/[０-９Ａ-Ｚａ-ｚ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/\s+/g, '')
    .replace(/[。．.，,、：:；;！!？?]+$/g, '')
    .toLowerCase();
}

export function isCorrect(question, userAnswer) {
  const ua = normalizeAnswer(userAnswer);
  const ans = normalizeAnswer(question.answer);
  if (ua === ans) return true;
  const uaNum = Number(ua);
  const ansNum = Number(ans);
  return Number.isFinite(uaNum) && Number.isFinite(ansNum) && Math.abs(uaNum - ansNum) < 1e-9;
}

// 为没有 options 的题（input 类）生成 plausible 干扰项 + 正确答案，乱序
// fighting / shooting 引擎用此函数把 input 题包装成 choice 形式
export function makeChoiceOptions(question, n = 4) {
  const answer = String(question.answer);
  if (Array.isArray(question.options) && question.options.length >= 2) {
    return question.options.slice(0, n);
  }
  const distractors = generateDistractors(answer);
  const opts = [answer, ...distractors].slice(0, n);
  // 乱序
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

function generateDistractors(answer) {
  const n = parseFloat(answer);
  if (!Number.isNaN(n) && Number.isFinite(n) && answer.match(/^-?\d+(\.\d+)?$/)) {
    // 数字答案：保持原小数位精度，生成附近数
    const m = answer.match(/\.(\d+)$/);
    const decimals = m ? m[1].length : 0;
    const fmt = x => decimals > 0 ? x.toFixed(decimals) : String(Math.round(x));
    const cands = new Set();
    const offsets = decimals > 0 ? [0.1, -0.1, 1, -1, 0.5, -0.5, 2, -2] : [1, -1, 2, -2, 3, -3, 5];
    for (const off of offsets) {
      const v = n + off;
      if (decimals === 0 && v < 0) continue; // 整数答案的干扰避免负数
      const s = fmt(v);
      if (s !== answer) cands.add(s);
      if (cands.size >= 3) break;
    }
    return [...cands].slice(0, 3);
  }
  // 字符串答案：少见情况，做尾字符变体（仍不理想，但比 X/Y/Z 好）
  const cands = [];
  for (const suffix of ['？', '？？', '不对', '错']) {
    if (cands.length >= 3) break;
    if (suffix !== answer) cands.push(suffix);
  }
  return cands;
}
