'use strict';

const path = require('node:path');

const SEMESTER_LABELS = { upper: '上册', lower: '下册', unknown: '未标注' };

function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function rowToQuestion(r) {
  return {
    id: r.id,
    q: r.q,
    type: r.q_type,
    options: safeJSON(r.options, null),
    answer: r.answer,
    hints: safeJSON(r.hints, []),
    explain: r.explain_text || '',
    topic: r.topic,
    knowledgePoints: safeJSON(r.knowledge_points, [r.topic]),
    semester: r.semester || 'unknown',
    semesterLabel: SEMESTER_LABELS[r.semester] || SEMESTER_LABELS.unknown,
    grade: r.grade,
    subject: r.subject,
    lv: r.lv,
    source: 'static',
  };
}

function normalizeGenerated(q) {
  const semester = (q.semester === 'upper' || q.semester === 'lower') ? q.semester : 'unknown';
  return {
    q: q.q,
    type: q.type === 'input' ? 'input' : 'choice',
    options: q.options || null,
    answer: String(q.answer),
    hints: Array.isArray(q.hints) ? q.hints : [],
    explain: q.explain || '',
    topic: q.topic || '未标注',
    knowledgePoints: Array.isArray(q.knowledgePoints) ? q.knowledgePoints : [q.topic || '未标注'],
    semester,
    semesterLabel: SEMESTER_LABELS[semester],
    grade: q.grade,
    subject: q.subject,
    lv: q.lv,
    source: 'generated',
  };
}

function buildWhere(opts) {
  const clauses = ['enabled=1', 'grade=?', 'subject=?'];
  const params = [opts.grade, opts.subject];
  if (opts.semester) { clauses.push('semester=?'); params.push(opts.semester); }
  if (opts.lv) { clauses.push('lv=?'); params.push(opts.lv); }
  if (opts.topic) {
    if (Array.isArray(opts.topic)) {
      clauses.push(`topic IN (${opts.topic.map(()=>'?').join(',')})`);
      params.push(...opts.topic);
    } else {
      clauses.push('topic=?');
      params.push(opts.topic);
    }
  }
  if (Array.isArray(opts.excludeIds) && opts.excludeIds.length) {
    clauses.push(`id NOT IN (${opts.excludeIds.map(()=>'?').join(',')})`);
    params.push(...opts.excludeIds);
  }
  return { where: clauses.join(' AND '), params };
}

function pickStatic(db, opts, count) {
  if (count <= 0) return [];
  const { where, params } = buildWhere(opts);
  const sql = `SELECT * FROM questions WHERE ${where} ORDER BY RANDOM() LIMIT ?`;
  const rows = db.prepare(sql).all(...params, count);
  return rows.map(rowToQuestion);
}

function pickGenerated(db, opts, count) {
  if (count <= 0) return [];
  const { where, params } = buildWhere({
    grade: opts.grade, subject: opts.subject,
    semester: opts.semester, lv: opts.lv, topic: opts.topic,
  });
  // generators table has same columns we filter on
  const sql = `SELECT * FROM generators WHERE ${where} ORDER BY RANDOM()`;
  const gens = db.prepare(sql).all(...params);
  if (!gens.length) return [];

  const out = [];
  let remain = count;
  for (let i = 0; i < gens.length && remain > 0; i++) {
    const g = gens[i];
    const share = Math.max(1, Math.floor(remain / (gens.length - i)));
    const want = Math.min(share, remain);
    let mod;
    try {
      // module_path 可以是绝对路径（测试 fixture）或相对 repo 根
      const resolved = path.isAbsolute(g.module_path)
        ? g.module_path
        : path.join(__dirname, '..', g.module_path);
      // 测试支持热更新：清除 cache（小代价）
      delete require.cache[require.resolve(resolved)];
      mod = require(resolved);
    } catch (e) {
      console.error(`[picker] 加载生成器失败 ${g.key}: ${e.message}`);
      continue;
    }
    if (typeof mod.generate !== 'function') continue;
    const genOpts = {
      ...opts,
      grade: g.grade,
      subject: g.subject,
      semester: g.semester,
      topic: g.topic,
      lv: g.lv,
      knowledgePoints: safeJSON(g.knowledge_points, [g.topic]),
      generatorKey: g.key,
    };
    const produced = mod.generate(want, { db, opts: genOpts });
    for (const q of (produced || [])) {
      out.push(normalizeGenerated(q));
      remain--;
      if (remain <= 0) break;
    }
  }
  return out;
}

function dedup(items) {
  const seen = new Set();
  const out = [];
  for (const q of items) {
    const key = `${q.q}|${q.answer}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

function pickMixed(db, opts, count) {
  // 默认优先使用人工/静态题。生成题只补足题量缺口，避免通用模板题
  // 在静态题足够时污染关卡体验。
  const staticPool = pickStatic(db, opts, count + 10);
  const { out: result, seen } = _dedupSet(staticPool);
  if (result.length >= count) return result.slice(0, count);

  const generatedPool = pickGenerated(db, opts, (count - result.length) + 10);

  const tryAdd = (list) => {
    for (const q of list) {
      if (result.length >= count) break;
      const k = `${q.q}|${q.answer}`;
      if (seen.has(k)) continue;
      seen.add(k);
      result.push(q);
    }
  };

  tryAdd(generatedPool);
  if (result.length < count) {
    // last resort: ask generator for a big batch (gen is "infinite")
    tryAdd(pickGenerated(db, opts, (count - result.length) * 4));
  }

  return result.slice(0, count);
}

function pickWrongbookPractice(db, opts, count) {
  const user = opts.user || 'default';
  const wbRows = db.prepare(`
    SELECT * FROM wrong_questions
    WHERE user=?
      AND (? IS NULL OR grade=?)
      AND (? IS NULL OR subject=?)
    ORDER BY created_at DESC
    LIMIT 50
  `).all(user, opts.grade ?? null, opts.grade ?? null, opts.subject ?? null, opts.subject ?? null);

  const out = [];
  for (const r of wbRows) {
    out.push({
      id: r.id,
      q: r.q,
      type: r.type === 'input' ? 'input' : 'choice',
      options: safeJSON(r.options, null),
      answer: r.answer,
      hints: safeJSON(r.hints, []),
      explain: r.explain_text || '',
      topic: r.topic || '未标注',
      knowledgePoints: safeJSON(r.knowledge_points, [r.topic || '未标注']),
      semester: r.semester || 'unknown',
      semesterLabel: SEMESTER_LABELS[r.semester] || SEMESTER_LABELS.unknown,
      grade: r.grade || opts.grade,
      subject: r.subject || opts.subject,
      lv: r.lv == null ? 2 : r.lv,
      source: 'wrongbook',
    });
  }

  // 按 (topic, lv) 聚合错题，每个错题点扩展 1-2 道同分类静态题
  const groups = new Map();
  for (const q of out) {
    const key = `${q.topic}|${q.lv}`;
    if (!groups.has(key)) groups.set(key, { topic: q.topic, lv: q.lv, count: 0 });
    groups.get(key).count++;
  }

  const expansion = [];
  for (const g of groups.values()) {
    const wantPerGroup = Math.min(2, Math.max(1, g.count));
    const exp = pickStatic(db, {
      grade: opts.grade, subject: opts.subject,
      semester: opts.semester, lv: g.lv, topic: g.topic,
    }, wantPerGroup * 2);
    for (const e of exp) {
      // skip if same as a wrongbook entry
      if (out.some(w => w.q === e.q && w.answer === e.answer)) continue;
      expansion.push(e);
    }
  }

  const merged = dedup([...out, ...expansion]).slice(0, count);
  return merged;
}

function _pickOnce(db, opts) {
  const count = Math.max(1, opts.count || 10);
  const source = opts.source || 'mixed';
  let items;
  if (source === 'static') items = pickStatic(db, opts, count * 2);
  else if (source === 'generated') items = pickGenerated(db, opts, count);
  else if (source === 'mixed') items = pickMixed(db, opts, count);
  else if (source === 'wrongbook-practice') items = pickWrongbookPractice(db, opts, count);
  else throw new Error(`pickQuestions: unknown source '${source}'`);
  return dedup(items).slice(0, count);
}

async function pickQuestions(opts) {
  if (!opts || !opts.db) throw new Error('pickQuestions: db is required');
  const source = opts.source || 'mixed';
  if (source !== 'wrongbook-practice') {
    if (!opts.grade) throw new Error('pickQuestions: grade is required');
    if (!opts.subject) throw new Error('pickQuestions: subject is required');
  }
  const db = opts.db;
  const count = Math.max(1, opts.count || 10);
  // 至少要拉到题量的 60%，否则关卡体验差；仅 mixed 模式下允许 fallback
  const minOk = source === 'mixed' ? Math.max(3, Math.ceil(count * 0.6)) : 1;

  // 第一次尝试：原始参数
  let items = _pickOnce(db, opts);
  if (items.length >= minOk) return _attach(items, null);

  let bestItems = items;
  let bestFallback = null;

  // Fallback 1: 去掉 semester
  if (opts.semester) {
    const next = { ...opts, semester: undefined };
    const r = _pickOnce(db, next);
    if (r.length > bestItems.length) {
      bestItems = r;
      bestFallback = '已放宽到不限学期';
      if (r.length >= minOk) return _attach(r, bestFallback);
    }
  }
  // Fallback 2: 去掉 lv
  if (opts.lv) {
    const next = { ...opts, lv: undefined, semester: undefined };
    const r = _pickOnce(db, next);
    if (r.length > bestItems.length) {
      bestItems = r;
      bestFallback = '已放宽到不限难度';
      if (r.length >= minOk) return _attach(r, bestFallback);
    }
  }

  // 仍不足 — 返回收集到的最大集（即便没达到 minOk）
  return _attach(bestItems, bestFallback || (bestItems.length === 0 ? null : '题量不足，已尽量补齐'));
}

function _attach(items, fallback) {
  if (fallback) {
    Object.defineProperty(items, '_fallback', { value: fallback, enumerable: false });
  }
  return items;
}

// O(n) 去重 + Set 复用版（用于 mixed 自动补齐路径）
function _dedupSet(items) {
  const seen = new Set();
  const out = [];
  for (const q of items) {
    const k = `${q.q}|${q.answer}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(q);
  }
  return { out, seen };
}

module.exports = {
  pickQuestions,
  pickStatic,
  pickGenerated,
  pickMixed,
  pickWrongbookPractice,
  rowToQuestion,
  normalizeGenerated,
  SEMESTER_LABELS,
};
