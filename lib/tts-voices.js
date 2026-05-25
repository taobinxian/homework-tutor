'use strict';

const DEFAULT_FEMALE_CLOUD_VOICE = 'saturn_zh_female_keainvsheng_tob';
const DEFAULT_MALE_CLOUD_VOICE = 'saturn_zh_male_tiancaitongzhuo_tob';

const LOCAL_TO_CLOUD_VOICE = {
  zf_xiaoxiao: DEFAULT_FEMALE_CLOUD_VOICE,
  zf_xiaoyi: DEFAULT_FEMALE_CLOUD_VOICE,
  zm_yunxia: DEFAULT_FEMALE_CLOUD_VOICE,
  zm_yunjian: DEFAULT_MALE_CLOUD_VOICE,
};

function cloudSpeakerForVoice(voice) {
  const key = String(voice || '').trim();
  return LOCAL_TO_CLOUD_VOICE[key] || key || DEFAULT_FEMALE_CLOUD_VOICE;
}

module.exports = { cloudSpeakerForVoice };
