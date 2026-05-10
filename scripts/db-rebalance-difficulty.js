#!/usr/bin/env node
'use strict';

// 题库难度重分级脚本
//
// 默认 dry-run：仅输出 before/after 统计 + 调整明细，不写库。
// 加 --apply 才真正 UPDATE questions 表。
// 加 --sample N 在 dry-run 时打印 N 条调整样本（默认 10）。
//
// 规则：
//  数学：按运算复杂度评分（数字大小、运算符数量、进退位、含小数/分数、应用题特征）
//  语文：按 topic 类别（拼音/词语 → 1，古诗 → 2，句子/阅读理解 → 3）
//  英语：基础词汇 → 1，主题词汇 → 2，句型/语法 → 3
//  科学：认识 → 1，实验 → 2，综合 → 3
//  特殊 topic 名：「解决问题/应用题/综合/挑战」 → 3；「认识/分类/比一比」 → 1

const path = require('node:path');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');

function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function classifyMath(q, text) {
  let score = 0;

  // 数字
  const numStrs = text.match(/\d+(\.\d+)?/g) || [];
  const nums = numStrs.map(parseFloat).filter(n => Number.isFinite(n));
  const maxN = nums.length ? Math.max(...nums) : 0;
  if (maxN > 10000) score += 3;
  else if (maxN > 1000) score += 2;
  else if (maxN > 100) score += 1;

  // 含小数 / 分数
  if (nums.some(n => !Number.isInteger(n))) score += 1;
  if (/\d+\/\d+|分之|\d+\.\d{2,}/.test(text)) score += 1;
  if (/[%％]/.test(text)) score += 2; // 百分比

  // 运算符数量
  const ops = (text.match(/[+\-×÷*\/]/g) || []).length;
  if (ops >= 3) score += 2;
  else if (ops >= 2) score += 1;

  // 应用题特征（人物 + 量词 + 求未知）
  const hasActor = /小[明红李丽华芳强东西军]|妈妈|爸爸|老师|学生|班级|工人|阿姨|叔叔|哥哥|姐姐|弟弟|妹妹|奶奶|爷爷|商店|学校|工厂|图书馆/.test(text);
  const hasQuantity = /[只条头匹个支本块斤米厘升克元角分件双套朵瓶箱|本箱|页|车|杯]/.test(text);
  const hasUnknown = /多少|几个|几支|几本|几只|几条|几人|几米|几元|几斤|多大|多重|多长|多远|一共|总共|还剩|剩多少|平均|相差|几倍|百分之几|几分之几/.test(text);
  if (hasActor && hasUnknown) score += 2;
  else if (hasQuantity && hasUnknown) score += 1;

  // 高级概念
  if (/方程|未知数|未知量|x\s*[=+]|未知|消去/.test(text)) score += 2;
  if (/面积|体积|周长|表面积/.test(text) && nums.length >= 2) score += 1;
  if (/比例|比|百分率|利润|利息|折扣/.test(text)) score += 1;

  // 简单题降分（单步、小数字、整数）
  if (ops <= 1 && maxN <= 10 && nums.length <= 2 && nums.every(Number.isInteger)) {
    score = Math.max(0, score - 1);
  }
  // 个位单步 + 无应用题 → 强制 lv1
  if (ops === 1 && maxN <= 10 && nums.every(Number.isInteger) && !hasActor && !hasUnknown) {
    return 1;
  }

  // 进退位（两位数加减）
  if (ops === 1 && /[+\-]/.test(text) && nums.length === 2 && nums.every(Number.isInteger)) {
    const a = nums[0], b = nums[1];
    if (text.includes('+') && (a % 10 + b % 10 >= 10) && a < 100 && b < 100) score += 1;
    if (text.includes('-') && a >= b && a < 100 && (a % 10 < b % 10)) score += 1;
  }

  if (score >= 5) return 3;
  if (score >= 2) return 2;
  return 1;
}

function classifyChinese(topic, text) {
  if (/拼音|笔画|笔顺|偏旁|声母|韵母|声调/.test(topic)) return 1;
  if (/反义词|近义词|量词|组词/.test(topic)) return 1;
  if (/形近字|多音字/.test(topic)) return 2;
  if (/古诗|诗句/.test(topic)) return 2;
  if (/标点符号/.test(topic)) return 2;
  if (/修辞|阅读理解|作文|缩句|扩句|修改病句|句子/.test(topic)) return 3;
  // 字数较多的题目难度提升
  if (text.length > 60) return 3;
  if (text.length > 30) return 2;
  return 2;
}

function classifyEnglish(topic, text) {
  if (/字母|数字|颜色|问候/.test(topic)) return 1;
  if (/动物|水果|食物|身体|玩具|学习用品|衣服|天气|家庭|食物饮料/.test(topic)) return 2;
  if (/课堂用语/.test(topic)) return 1;
  if (/句型|语法|时态|对话/.test(topic) || /[A-Za-z]+\s+[A-Za-z]+/.test(text)) return 3;
  return 2;
}

function classifyScience(topic, text) {
  if (/认识|观察|分类|地球|天文|植物|动物名/.test(topic)) return 1;
  if (/实验|测量|能源|材料/.test(topic)) return 2;
  return 2;
}

function classify(question) {
  const topic = question.topic || '';
  const text = (question.q || '') + ' ' + (question.answer || '') + ' ' + (Array.isArray(question.options) ? question.options.join(' ') : '');

  // 通用 topic 名命中（覆盖所有学科）
  if (/解决问题|应用题|综合|挑战|拓展/.test(topic)) return 3;
  if (/^(认识|0的认识|位置|分类与整理|比一比)$/.test(topic)) return 1;

  switch (question.subject) {
    case 'math':    return classifyMath(question, text);
    case 'chinese': return classifyChinese(topic, text);
    case 'english': return classifyEnglish(topic, text);
    case 'science': return classifyScience(topic, text);
    default:        return question.lv || 2;
  }
}

function parseArgs(argv) {
  const out = { apply: false, sample: 10 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--apply') out.apply = true;
    else if (argv[i] === '--sample') out.sample = Number(argv[++i]) || 10;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  initSchema(db);

  const rows = db.prepare(`
    SELECT id, grade, subject, semester, topic, lv, q_type, q, answer, options
    FROM questions WHERE enabled=1
  `).all();

  const before = { 1:0, 2:0, 3:0 };
  const after  = { 1:0, 2:0, 3:0 };
  const changes = [];

  for (const r of rows) {
    before[r.lv] = (before[r.lv] || 0) + 1;
    const newLv = classify({
      grade: r.grade, subject: r.subject, topic: r.topic,
      q: r.q, answer: r.answer,
      options: safeJSON(r.options, null),
      lv: r.lv,
    });
    after[newLv] = (after[newLv] || 0) + 1;
    if (newLv !== r.lv) {
      changes.push({ id: r.id, grade: r.grade, subject: r.subject, topic: r.topic, q: r.q, answer: r.answer, oldLv: r.lv, newLv });
    }
  }

  console.log('━━━ 题库难度重分级 ' + (args.apply ? '· 写入模式' : '· DRY RUN') + ' ━━━');
  console.log(`▸ DB: ${dbPath}`);
  console.log(`▸ 题数: ${rows.length}`);
  console.log('');
  console.log(`原分布: lv1=${before[1]||0}  lv2=${before[2]||0}  lv3=${before[3]||0}`);
  console.log(`新分布: lv1=${after[1]||0}  lv2=${after[2]||0}  lv3=${after[3]||0}`);
  console.log(`变更:   ${changes.length} 题`);

  // 按 (grade, subject) 分组统计
  const byGS = new Map();
  for (const c of changes) {
    const k = `G${c.grade} ${c.subject}`;
    if (!byGS.has(k)) byGS.set(k, { up: 0, down: 0, fromLv: { 1:0, 2:0, 3:0 } });
    const g = byGS.get(k);
    if (c.newLv > c.oldLv) g.up++;
    else g.down++;
    g.fromLv[c.oldLv]++;
  }
  console.log('');
  console.log('按年级×学科:');
  for (const [k, v] of [...byGS.entries()].sort()) {
    console.log(`  ${k}: ↑${v.up}  ↓${v.down}  (原 lv1→${v.fromLv[1]} lv2→${v.fromLv[2]} lv3→${v.fromLv[3]})`);
  }

  if (changes.length && args.sample > 0) {
    console.log('');
    console.log(`样本（前 ${Math.min(args.sample, changes.length)} 条）:`);
    for (const c of changes.slice(0, args.sample)) {
      const arrow = c.newLv > c.oldLv ? '↑' : '↓';
      console.log(`  ${arrow} #${c.id} G${c.grade} ${c.subject}/${c.topic} lv${c.oldLv}→lv${c.newLv}: ${c.q.slice(0, 50)} → ${c.answer}`);
    }
  }

  if (args.apply && changes.length) {
    console.log('');
    console.log(`▸ 写入 ${changes.length} 条 UPDATE...`);
    const upd = db.prepare(`UPDATE questions SET lv=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    const tx = db.transaction(() => { for (const c of changes) upd.run(c.newLv, c.id); });
    tx();
    console.log(`✅ 已应用`);
  } else if (!args.apply && changes.length) {
    console.log('');
    console.log('（dry-run，未写库。加 --apply 应用变更）');
  } else {
    console.log('');
    console.log('✅ 无需调整');
  }

  db.close();
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('✗ ' + e.message); console.error(e.stack); process.exit(1); }
}

module.exports = { main, classify };
