'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { cloudSpeakerForVoice } = require('../lib/tts-voices');

test('cloudSpeakerForVoice maps local Kokoro voice aliases to Volc speakers', () => {
  assert.equal(cloudSpeakerForVoice('zf_xiaoxiao'), 'saturn_zh_female_keainvsheng_tob');
  assert.equal(cloudSpeakerForVoice('zf_xiaoyi'), 'saturn_zh_female_keainvsheng_tob');
  assert.equal(cloudSpeakerForVoice('zm_yunxia'), 'saturn_zh_female_keainvsheng_tob');
  assert.equal(cloudSpeakerForVoice('zm_yunjian'), 'saturn_zh_male_tiancaitongzhuo_tob');
});

test('cloudSpeakerForVoice preserves already-cloud speaker ids', () => {
  assert.equal(cloudSpeakerForVoice('saturn_zh_female_keainvsheng_tob'), 'saturn_zh_female_keainvsheng_tob');
  assert.equal(cloudSpeakerForVoice('zh_female_vv_uranus_bigtts'), 'zh_female_vv_uranus_bigtts');
});
