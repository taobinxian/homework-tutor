#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT_FILES = [
  'questions.js',
  'curriculum.js',
  'grade1.js',
  'grade2.js',
  'grade3.js',
  'grade4.js',
  'grade5.js',
  'grade6.js',
];

const SUBJECT_LABELS = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  science: '科学',
};

const SEMESTER_LABELS = {
  upper: '上册',
  lower: '下册',
  unknown: '未标注',
};

function loadIntoContext(context, fileName) {
  const absPath = path.join(ROOT, fileName);
  const code = fs.readFileSync(absPath, 'utf8');
  vm.runInContext(code, context, { filename: absPath });
}

function main() {
  const context = {
    console,
    setTimeout,
    clearTimeout,
  };
  context.globalThis = context;
  context.window = context;
  context.self = context;
  vm.createContext(context);

  SCRIPT_FILES.forEach(fileName => loadIntoContext(context, fileName));

  if (typeof context.finalizeQuestionBank !== 'function') {
    throw new Error('questions.js 未暴露 finalizeQuestionBank()');
  }

  const report = context.finalizeQuestionBank();
  const qb = context.QB || {};
  const unmapped = context.QB_UNMAPPED || [];
  const emptyKnowledge = [];

  console.log('== 题库教材标注统计 ==');
  console.log(`总题量: ${report.total}`);
  console.log(`已映射: ${report.mapped}`);
  console.log(`未映射: ${report.unmapped}`);
  console.log('');

  for (let grade = 1; grade <= 6; grade++) {
    const subjects = qb[grade] || {};
    const lines = [];
    Object.keys(subjects).forEach(subject => {
      const questions = subjects[subject] || [];
      if (!questions.length) return;

      const counts = { upper: 0, lower: 0, unknown: 0 };
      questions.forEach(question => {
        const semester = counts[question.semester] != null ? question.semester : 'unknown';
        counts[semester] += 1;
        if (!Array.isArray(question.knowledgePoints) || !question.knowledgePoints.length) {
          emptyKnowledge.push({
            grade,
            subject,
            q: question.q,
            topic: question.topic,
          });
        }
      });

      lines.push(
        `${SUBJECT_LABELS[subject] || subject}: 总计 ${questions.length} 题 | ` +
        `${SEMESTER_LABELS.upper} ${counts.upper} | ${SEMESTER_LABELS.lower} ${counts.lower} | ${SEMESTER_LABELS.unknown} ${counts.unknown}`
      );
    });

    if (!lines.length) continue;
    console.log(`G${grade}`);
    lines.forEach(line => console.log(`  - ${line}`));
    console.log('');
  }

  if (unmapped.length) {
    console.log('== 未映射题目 ==');
    unmapped.forEach((item, index) => {
      console.log(
        `${index + 1}. G${item.grade} ${SUBJECT_LABELS[item.subject] || item.subject} | ${item.topic} | ${item.q}`
      );
    });
    console.log('');
  }

  if (emptyKnowledge.length) {
    console.log('== knowledgePoints 为空的题目 ==');
    emptyKnowledge.forEach((item, index) => {
      console.log(
        `${index + 1}. G${item.grade} ${SUBJECT_LABELS[item.subject] || item.subject} | ${item.topic || '未标注'} | ${item.q}`
      );
    });
    console.log('');
  }

  if (!unmapped.length && !emptyKnowledge.length) {
    console.log('校验通过：所有题目都已完成学期与知识点标注。');
  } else {
    process.exitCode = 1;
  }
}

main();
