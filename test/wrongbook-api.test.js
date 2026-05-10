'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const Database = require('better-sqlite3');
const { initSchema } = require('../lib/db');
const wrongbook = require('../lib/wrongbook-api');

function tmpDb() {
  const file = path.join(os.tmpdir(), `homework-wbk-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  initSchema(db);
  return { db, file };
}

test('addOne inserts a wrong question with lv field', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'alice', {
      q: '1+1=?', type: 'choice', options: ['1','2','3'], answer: '2',
      userAnswer: '3', hints: ['加法'], explain: '基础', topic: '5以内加法',
      grade: 1, subject: 'math', semester: 'upper',
      knowledgePoints: ['5以内加法'], source: 'seed', lv: 1,
    });
    const row = db.prepare('SELECT * FROM wrong_questions WHERE user=?').get('alice');
    assert.equal(row.q, '1+1=?');
    assert.equal(row.lv, 1, 'lv should be persisted');
    assert.equal(row.grade, 1);
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('addOne defaults lv=2 when not provided', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'bob', { q: 'x', answer: 'y' });
    const row = db.prepare('SELECT * FROM wrong_questions WHERE user=?').get('bob');
    assert.equal(row.lv, 2, 'missing lv should default to 2');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('listForUser returns rows with lv field included', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'carol', { q: 'a', answer: 'b', lv: 3, options: ['b','c'] });
    wrongbook.addOne(db, 'carol', { q: 'd', answer: 'e', lv: 1 });
    const rows = wrongbook.listForUser(db, 'carol');
    assert.equal(rows.length, 2);
    const sortedLv = rows.map(r => r.lv).sort();
    assert.deepEqual(sortedLv, [1, 3]);
    for (const r of rows) {
      assert.ok('lv' in r, 'every row should have lv field');
    }
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('addOne is idempotent on (user, q, answer) — duplicate does not insert', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'dave', { q: 'same q', answer: 'same a', lv: 1 });
    const r1 = wrongbook.addOne(db, 'dave', { q: 'same q', answer: 'same a', lv: 2 });
    assert.equal(r1.duplicate, true, 'second insert with identical (q,answer) should report duplicate');
    const rows = wrongbook.listForUser(db, 'dave');
    assert.equal(rows.length, 1, 'should not insert twice');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('addOne with same q but different answer is NOT a duplicate', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'henry', { q: '选出正确的', answer: 'A', lv: 1 });
    const r2 = wrongbook.addOne(db, 'henry', { q: '选出正确的', answer: 'B', lv: 2 });
    assert.notEqual(r2.duplicate, true, 'different answer means a different question');
    const rows = wrongbook.listForUser(db, 'henry');
    assert.equal(rows.length, 2, 'both should be inserted');
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('deleteOne removes a single row by id', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'eve', { q: 'q1', answer: 'a1' });
    wrongbook.addOne(db, 'eve', { q: 'q2', answer: 'a2' });
    const rows = wrongbook.listForUser(db, 'eve');
    wrongbook.deleteOne(db, 'eve', rows[0].id);
    assert.equal(wrongbook.listForUser(db, 'eve').length, 1);
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});

test('clearForUser removes all rows for a user', () => {
  const { db, file } = tmpDb();
  try {
    wrongbook.addOne(db, 'frank', { q: 'q1', answer: 'a1' });
    wrongbook.addOne(db, 'frank', { q: 'q2', answer: 'a2' });
    wrongbook.addOne(db, 'gina',  { q: 'q3', answer: 'a3' });
    wrongbook.clearForUser(db, 'frank');
    assert.equal(wrongbook.listForUser(db, 'frank').length, 0);
    assert.equal(wrongbook.listForUser(db, 'gina').length, 1, "other user's rows untouched");
  } finally {
    db.close(); fs.unlinkSync(file);
  }
});
