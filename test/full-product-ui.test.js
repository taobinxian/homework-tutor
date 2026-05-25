'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('bounty and monster review buttons enter the returned review level instead of only creating it', () => {
  const src = read('static/app/full-product.js');
  assert.match(src, /import \{ openCampaignLevelDetail \} from '\.\/level-detail\.js';/);
  assert.match(src, /async function enterReviewLevel\(ctx, topic, sourceOverlay\)/);
  assert.match(src, /const result = await data\.createReviewLevel\(/);
  assert.match(src, /openCampaignLevelDetail\(ctx, result\.level, sourceOverlay\)/);
  assert.match(src, /body\.querySelectorAll\('\.bounty-review'\)[\s\S]*enterReviewLevel\(ctx, btn\.dataset\.topic, overlay\)/);
  assert.doesNotMatch(src, /复习副本已准备好，请到地图\/复习入口挑战/);
});

test('branch map events open a playable level detail rather than marking complete immediately', () => {
  const src = read('static/app/campaign.js');
  assert.match(src, /if \(ev\.type === 'branch'\) \{/);
  assert.match(src, /openCampaignLevelDetail\(ctx, level, overlay\)/);
  const branchBlock = src.match(/if \(ev\.type === 'branch'\) \{[\s\S]*?\n      \}/)?.[0] || '';
  assert.doesNotMatch(branchBlock, /completeMapEvent/);
});

test('campaign completion refreshes map after result dialog closes', () => {
  const src = read('static/app/main.js');
  assert.match(src, /await showCampaignResult\(\{ result, stars, rewards, evolved, newAchv, stats, finish, report \}\);/);
  assert.match(src, /if \(\(result === 'win' \|\| result === 'complete'\) && !finish\.error\) \{\s*await openCampaignMapUI\(campaignCtx\(\)\)/s);
});

test('home campaign entry buttons use delegated actions for all product panels', () => {
  const src = read('static/app/main.js');
  for (const action of ['campaign', 'report', 'atlas', 'bounty', 'growth', 'family']) {
    assert.match(src, new RegExp(`data-campaign-action="${action}"`));
  }
  assert.match(src, /campaignEntry\.addEventListener\('click', handleCampaignEntryClick\)/);
  assert.match(src, /action === 'report'[\s\S]*openDailyReportUI\(ctx\)/);
  assert.match(src, /action === 'atlas'[\s\S]*openMonsterAtlas\(ctx\)/);
  assert.match(src, /action === 'bounty'[\s\S]*openBountyBoard\(ctx\)/);
  assert.match(src, /action === 'growth'[\s\S]*openGrowthCenter\(ctx\)/);
  assert.match(src, /action === 'family'[\s\S]*openFamilyCenter\(ctx\)/);
});
