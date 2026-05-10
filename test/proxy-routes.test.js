'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const http = require('node:http');

const REPO = path.join(__dirname, '..');

function tmpDb() {
  return path.join(os.tmpdir(), `homework-routes-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
}

function freePort() {
  // best effort: pick a high random port
  return 9000 + Math.floor(Math.random() * 1000);
}

async function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        let parsed; try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
        resolve({ status: res.statusCode, body: parsed, raw: body });
      });
    }).on('error', reject);
  });
}

async function post(url, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(payload);
    const req = http.request({
      method: 'POST', host: u.hostname, port: u.port, path: u.pathname,
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf-8');
        let parsed; try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

async function startProxy(dbFile) {
  const port = freePort();
  // seed minimal data first
  const seedRes = cp.spawnSync('node', ['scripts/db-seed-curriculum.js'], {
    cwd: REPO,
    env: { ...process.env, HOMEWORK_DB: dbFile },
    encoding: 'utf-8',
  });
  if (seedRes.status !== 0) throw new Error('seed-curriculum failed: ' + seedRes.stderr);

  cp.spawnSync('node', ['scripts/db-seed-legacy.js'], {
    cwd: REPO,
    env: { ...process.env, HOMEWORK_DB: dbFile, HOMEWORK_LEGACY_SEED: 'route-test' },
    encoding: 'utf-8',
  });
  cp.spawnSync('node', ['scripts/db-seed-generators.js'], {
    cwd: REPO,
    env: { ...process.env, HOMEWORK_DB: dbFile },
    encoding: 'utf-8',
  });

  const child = cp.spawn('node', ['proxy.js'], {
    cwd: REPO,
    env: { ...process.env, HOMEWORK_DB: dbFile, PORT: String(port), BIND: '127.0.0.1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  // wait for "监听 :"
  await new Promise((resolve, reject) => {
    let ok = false;
    const timer = setTimeout(() => {
      if (!ok) reject(new Error('proxy did not start within 5s'));
    }, 5000);
    child.stdout.on('data', d => {
      const s = d.toString();
      if (s.includes('监听') || s.includes('listen')) {
        ok = true; clearTimeout(timer); resolve();
      }
    });
    child.stderr.on('data', d => process.stderr.write('[proxy stderr] ' + d.toString()));
    child.on('error', reject);
  });
  // tiny additional grace period for HTTP listen
  await new Promise(r => setTimeout(r, 100));
  return { child, port };
}

function stopProxy(child) {
  return new Promise(resolve => {
    child.on('exit', () => resolve());
    child.kill('SIGTERM');
    setTimeout(() => { try { child.kill('SIGKILL'); } catch (_) {} resolve(); }, 1500);
  });
}

function cleanupDb(file) {
  for (const ext of ['', '-shm', '-wal']) {
    const p = file + ext;
    if (fs.existsSync(p)) try { fs.unlinkSync(p); } catch (_) {}
  }
}

test('GET /api/questions/pick returns array', async () => {
  const dbFile = tmpDb();
  let child;
  try {
    const started = await startProxy(dbFile); child = started.child;
    const r = await get(`http://127.0.0.1:${started.port}/api/questions/pick?grade=1&subject=math&lv=1&count=5&source=static`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
  } finally {
    if (child) await stopProxy(child);
    cleanupDb(dbFile);
  }
});

test('GET /api/questions/pick missing param returns 400', async () => {
  const dbFile = tmpDb();
  let child;
  try {
    const started = await startProxy(dbFile); child = started.child;
    const r = await get(`http://127.0.0.1:${started.port}/api/questions/pick?subject=math`);
    assert.equal(r.status, 400);
    assert.match(r.body.error, /grade/);
  } finally {
    if (child) await stopProxy(child);
    cleanupDb(dbFile);
  }
});

test('GET /api/curriculum returns array filtered by grade', async () => {
  const dbFile = tmpDb();
  let child;
  try {
    const started = await startProxy(dbFile); child = started.child;
    const r = await get(`http://127.0.0.1:${started.port}/api/curriculum?grade=1`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body));
    for (const c of r.body) assert.equal(c.grade, 1);
  } finally {
    if (child) await stopProxy(child);
    cleanupDb(dbFile);
  }
});

test('POST /api/questions inserts and dedupes', async () => {
  const dbFile = tmpDb();
  let child;
  try {
    const started = await startProxy(dbFile); child = started.child;
    const payload = { grade: 4, subject: 'math', q: 'route test q', answer: 'X', type: 'input' };
    const r1 = await post(`http://127.0.0.1:${started.port}/api/questions`, payload);
    assert.equal(r1.status, 200);
    assert.equal(r1.body.ok, true);
    assert.ok(r1.body.id);
    const r2 = await post(`http://127.0.0.1:${started.port}/api/questions`, payload);
    assert.equal(r2.body.duplicate, true);
  } finally {
    if (child) await stopProxy(child);
    cleanupDb(dbFile);
  }
});

test('GET /api/questions/coverage returns matrix structure', async () => {
  const dbFile = tmpDb();
  let child;
  try {
    const started = await startProxy(dbFile); child = started.child;
    const r = await get(`http://127.0.0.1:${started.port}/api/questions/coverage`);
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.body.matrix));
    assert.ok(Array.isArray(r.body.gaps));
    assert.ok(r.body.summary);
  } finally {
    if (child) await stopProxy(child);
    cleanupDb(dbFile);
  }
});
