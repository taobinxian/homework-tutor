'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('deploy health check URL-encodes Chinese TTS probe text for curl', () => {
  const src = fs.readFileSync(path.join(root, 'deploy.sh'), 'utf8');
  assert.match(src, /local tts_probe_text="%E4%BD%A0%E5%A5%BD"/);
  assert.match(src, /\$\{BASE\}\/tts\?text=\$\{tts_probe_text\}&voice=zf_xiaoxiao/);
  assert.doesNotMatch(src, /\$\{BASE\}\/tts\?text=你好&voice=zf_xiaoxiao/);
});
