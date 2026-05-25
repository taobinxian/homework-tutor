'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('desktop breakpoint widens app shell and feature panels instead of reusing mobile widths', () => {
  const html = read('index.html');
  const desktopBlock = html.match(/@media \(min-width: 1024px\) \{[\s\S]*?\n\}/)?.[0] || '';

  assert.match(desktopBlock, /#home\{max-width:1120px/);
  assert.match(desktopBlock, /\.camp-panel,\.camp-detail,\.report-panel\{max-width:1040px/);
  assert.match(desktopBlock, /\.battle, \.shooting, \.fighting\{max-width:1100px/);
  assert.match(desktopBlock, /\.ks\{max-width:1100px/);
  assert.match(desktopBlock, /\.campaign-entry\{display:grid;grid-template-columns:/);
});

test('viewport keeps device width without forcing mobile-only scaling behavior', () => {
  const html = read('index.html');
  const viewport = html.match(/<meta name="viewport" content="([^"]+)" \/>/)?.[1] || '';

  assert.match(viewport, /width=device-width/);
  assert.match(viewport, /initial-scale=1\.0/);
  assert.doesNotMatch(viewport, /maximum-scale/);
  assert.doesNotMatch(viewport, /user-scalable=no/);
});

test('layout selection is driven by CSS breakpoints rather than user-agent sniffing', () => {
  const js = fs.readdirSync(path.join(root, 'static/app'))
    .filter(name => name.endsWith('.js'))
    .map(name => read(`static/app/${name}`))
    .join('\n');

  assert.doesNotMatch(js, /navigator\.userAgent|navigator\.platform|\buserAgentData\b/);
});

test('desktop overlay panel widths win after topbar overlay base rules', () => {
  const html = read('index.html');
  const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '';
  const desktopRule = '.shop-panel{max-width:1040px;width:min(1040px,calc(100vw - 80px))';
  const desktopIndex = css.lastIndexOf(desktopRule);

  assert.notEqual(desktopIndex, -1);
  for (const baseRule of [
    '.wb-panel,.ph-panel,.st-panel{background:',
    '.achv-panel{background:',
    '.daily-panel{background:',
    '.inv-panel{background:',
    '.shop-panel{background:',
  ]) {
    const baseIndex = css.lastIndexOf(baseRule);
    assert.notEqual(baseIndex, -1, `${baseRule} should exist`);
    assert.ok(desktopIndex > baseIndex, `${desktopRule} must be later than ${baseRule}`);
  }
});
