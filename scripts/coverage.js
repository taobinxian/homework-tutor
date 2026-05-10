#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { openDb, initSchema, DEFAULT_DB_FILE } = require('../lib/db');
const { computeCoverage, diffGaps } = require('../lib/coverage');

function parseArgs(argv) {
  const out = { json: false, strict: false, threshold: 3, checkBaseline: false, updateBaseline: false, baseline: '.coverage-baseline.json' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--strict') out.strict = true;
    else if (a === '--check-baseline') out.checkBaseline = true;
    else if (a === '--update-baseline') out.updateBaseline = true;
    else if (a === '--threshold') out.threshold = Number(argv[++i]);
    else if (a === '--baseline') out.baseline = argv[++i];
  }
  return out;
}

function printText(result) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`覆盖率矩阵 · 阈值=${result.threshold}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  // 按 (grade, subject, semester) 分组打印
  const grouped = new Map();
  for (const m of result.matrix) {
    const k = `${m.grade}|${m.subject}|${m.semester}`;
    if (!grouped.has(k)) grouped.set(k, []);
    grouped.get(k).push(m);
  }
  for (const [key, cells] of [...grouped.entries()].sort()) {
    const [grade, subject, semester] = key.split('|');
    const semesterLabel = semester === 'upper' ? '上册' : semester === 'lower' ? '下册' : '未标注';
    console.log(`\nGrade ${grade} · ${subject} · ${semesterLabel}`);
    const byTopic = new Map();
    for (const c of cells) {
      if (!byTopic.has(c.topic)) byTopic.set(c.topic, {});
      byTopic.get(c.topic)[`lv${c.lv}`] = c;
    }
    for (const [topic, lvs] of byTopic.entries()) {
      const fmt = lv => {
        const c = lvs[`lv${lv}`];
        if (!c) return `lv${lv}: -    `;
        const total = c.total;
        const flag = total < result.threshold ? '⚠️ ' : '   ';
        return `lv${lv}: ${String(total).padStart(3)}${flag}`;
      };
      console.log(`  ${topic.padEnd(18, ' ')}  ${fmt(1)}${fmt(2)}${fmt(3)}`);
    }
  }
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`总览: ${result.summary.totalQuestions} 题（静态） + ${result.summary.totalGenerators} 生成器`);
  console.log(`覆盖: ${result.summary.filledCells}/${result.summary.totalCells} 单元格 (${result.summary.coveragePercent}%)`);
  console.log(`缺口: ${result.summary.gapCount} 个 (题数 < ${result.threshold})`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dbPath = process.env.HOMEWORK_DB || DEFAULT_DB_FILE;
  const db = openDb(dbPath);
  initSchema(db);

  const result = computeCoverage(db, { threshold: args.threshold });

  if (args.updateBaseline) {
    fs.writeFileSync(args.baseline, JSON.stringify({
      generatedAt: new Date().toISOString(),
      threshold: result.threshold,
      gaps: result.gaps,
      summary: result.summary,
    }, null, 2));
    console.log(`✅ baseline 已写入 ${args.baseline}（${result.gaps.length} 个缺口）`);
    db.close();
    return;
  }

  if (args.checkBaseline) {
    if (!fs.existsSync(args.baseline)) {
      console.error(`✗ baseline 文件不存在: ${args.baseline}`);
      db.close();
      process.exit(2);
    }
    const baselineRaw = JSON.parse(fs.readFileSync(args.baseline, 'utf-8'));
    const newGaps = diffGaps(result.gaps, baselineRaw.gaps || []);
    if (newGaps.length > 0) {
      console.error(`✗ 新增 ${newGaps.length} 个缺口（基线之外）:`);
      for (const g of newGaps.slice(0, 20)) {
        console.error(`  · grade=${g.grade} ${g.subject}/${g.semester}/${g.topic}/lv${g.lv} total=${g.total}`);
      }
      db.close();
      process.exit(1);
    } else {
      console.log(`✅ check-baseline 通过：缺口集合 ⊆ 基线（基线 ${baselineRaw.gaps?.length || 0} 个 vs 当前 ${result.gaps.length} 个）`);
      db.close();
      return;
    }
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printText(result);
  }

  if (args.strict && result.gaps.length > 0) {
    console.error(`✗ --strict: 存在 ${result.gaps.length} 个缺口`);
    db.close();
    process.exit(1);
  }
  db.close();
}

if (require.main === module) {
  try { main(); }
  catch (e) { console.error('✗ ' + e.message); console.error(e.stack); process.exit(1); }
}

module.exports = { parseArgs, printText, main };
