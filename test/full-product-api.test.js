'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { openDb, initSchema } = require('../lib/db');
const { addOne } = require('../lib/wrongbook-api');
const full = require('../lib/full-product-api');
const { updateMastery } = require('../lib/mastery');
const levelApi = require('../lib/level-api');

function memdb() { const db = openDb(':memory:'); initSchema(db); return db; }

function seedWrongs(db, user = 'u') {
  addOne(db, user, { q:'1+2=?', answer:'3', userAnswer:'4', topic:'进位加法', grade:1, subject:'math', semester:'upper', knowledgePoints:['加法'], lv:1, source:'test' });
  addOne(db, user, { q:'2+3=?', answer:'5', userAnswer:'6', topic:'进位加法', grade:1, subject:'math', semester:'upper', knowledgePoints:['加法'], lv:1, source:'test' });
}

function seedCampaignLevel(db) {
  db.prepare(`INSERT OR IGNORE INTO campaign_levels (id,chapter_id,grade,subject,semester,topic,title,level_type,difficulty,question_count,order_no,config_json,reward_json,unlock_json,enabled)
    VALUES ('review-1','c1',1,'math','upper','进位加法','进位加法复习','review',1,5,1,'{}','{}','{}',1)`).run();
}

function submitRealRun(db, { runId = 'run-real-1', correct = 4, total = 5 } = {}) {
  seedCampaignLevel(db);
  db.prepare(`INSERT INTO level_runs (run_id,user,level_id,result,started_at,created_at) VALUES (?,'u','review-1','started',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`).run(runId);
  const answers = Array.from({ length: total }, (_, i) => ({
    questionId: `q${i}`, questionText: `${i}+1=?`, topic: '进位加法', answer: '1', userAnswer: i < correct ? '1' : '0', isCorrect: i < correct,
    grade: 1, subject: 'math', semester: 'upper', knowledgePoints: ['加法']
  }));
  const supply = levelApi.submitSupplyHandler(db, { runId, answers });
  assert.equal(supply.status, 200);
  return levelApi.finishHandler(db, { user:'u', levelId:'review-1', runId, result:'complete' });
}

test('wrong monsters sync and forged bounty completion is rejected without real run', () => {
  const db = memdb();
  seedWrongs(db);
  const monsters = full.syncMonstersFromWrongbook(db, { user:'u' });
  assert.equal(monsters.length, 1);
  assert.equal(monsters[0].wrong_count, 2);
  assert.match(monsters[0].name, /进位加法/);

  const [b] = full.generateBounties(db, { user:'u', source:'test' });
  assert.equal(b.status, 'active');
  assert.equal(db.prepare('SELECT status FROM wrong_monsters WHERE id=?').get(monsters[0].id).status, 'bounty');

  const forged = full.completeBountyHandler(db, b.id, { user:'u', correct:5, total:5, force:true });
  assert.equal(forged.status, 400);
  assert.equal(db.prepare('SELECT status FROM bounty_tasks WHERE id=?').get(b.id).status, 'active');
  assert.equal(db.prepare('SELECT status FROM wrong_monsters WHERE id=?').get(monsters[0].id).status, 'bounty');
});

test('real finished run completes bounty and repeat complete/claim remain idempotent', () => {
  const db = memdb();
  seedWrongs(db);
  const [b] = full.generateBounties(db, { user:'u' });
  const finish = submitRealRun(db);
  assert.equal(finish.status, 200);
  assert.ok(finish.body.bountySettlements.some(x => x.bounty.id === b.id && x.bounty.status === 'completed'));

  const monster = db.prepare('SELECT status,purified_count FROM wrong_monsters WHERE id=?').get(b.monster_id);
  assert.equal(monster.status, 'purified');
  assert.equal(monster.purified_count, 1);
  assert.ok(db.prepare('SELECT attempts,correct FROM knowledge_mastery WHERE user=? AND topic=?').get('u','进位加法').attempts >= 5);
  assert.ok(db.prepare('SELECT COUNT(*) AS c FROM knowledge_base_items WHERE user=? AND topic=?').get('u','进位加法').c >= 1);

  const again = full.completeBountyHandler(db, b.id, { user:'u', runId:'run-real-1', correct:0, total:0, force:true });
  assert.equal(again.body.idempotent, true);
  assert.equal(db.prepare('SELECT purified_count FROM wrong_monsters WHERE id=?').get(b.monster_id).purified_count, 1);

  const c1 = full.claimBountyHandler(db, b.id, { user:'u' });
  assert.equal(c1.status, 200);
  assert.equal(c1.body.ok, true);
  const itemCount = db.prepare('SELECT COUNT(*) AS c FROM player_inventory WHERE user=?').get('u').c;
  const goldQty = db.prepare("SELECT qty FROM player_inventory WHERE user=? AND item_type='currency' AND item_id='gold'").get('u').qty;
  const c2 = full.claimBountyHandler(db, b.id, { user:'u' });
  assert.equal(c2.body.idempotent, true);
  assert.equal(db.prepare('SELECT COUNT(*) AS c FROM player_inventory WHERE user=?').get('u').c, itemCount);
  assert.equal(db.prepare("SELECT qty FROM player_inventory WHERE user=? AND item_type='currency' AND item_id='gold'").get('u').qty, goldQty);
});


test('claimed bounty can generate, complete, and claim a fresh later weak cycle', () => {
  const db = memdb();
  seedWrongs(db);
  const [first] = full.generateBounties(db, { user:'u' });
  submitRealRun(db, { runId:'run-real-1' });
  const claim = full.claimBountyHandler(db, first.id, { user:'u' });
  assert.equal(claim.status, 200);
  assert.equal(db.prepare('SELECT status FROM bounty_tasks WHERE id=?').get(first.id).status, 'claimed');

  addOne(db, 'u', { q:'3+4=?', answer:'7', userAnswer:'8', topic:'进位加法', grade:1, subject:'math', semester:'upper', knowledgePoints:['加法'], lv:1, source:'test' });
  const [second] = full.generateBounties(db, { user:'u', source:'repeat-cycle' });
  assert.equal(second.status, 'active');
  assert.notEqual(second.id, first.id);
  assert.equal(second.cycle, first.cycle + 1);

  const finish = submitRealRun(db, { runId:'run-real-2' });
  assert.equal(finish.status, 200);
  assert.ok(finish.body.bountySettlements.some(x => x.bounty.id === second.id && x.bounty.status === 'completed'));
  const secondClaim = full.claimBountyHandler(db, second.id, { user:'u' });
  assert.equal(secondClaim.status, 200);
  assert.equal(secondClaim.body.ok, true);

  assert.equal(db.prepare("SELECT COUNT(*) AS c FROM bounty_tasks WHERE user='u' AND topic='进位加法' AND status='claimed'").get().c, 2);
});

test('growth summary creates mastery power, starter collection and knowledge base', () => {
  const db = memdb();
  updateMastery(db, { user:'u', grade:1, subject:'math', semester:'upper', answers:[
    { topic:'5以内加法', isCorrect:true }, { topic:'5以内加法', isCorrect:true }, { topic:'5以内加法', isCorrect:true }, { topic:'5以内加法', isCorrect:true }, { topic:'5以内加法', isCorrect:true }
  ] });
  const r = full.growthSummaryHandler(db, { user:'u' });
  assert.equal(r.status, 200);
  assert.ok(r.body.knowledgePower > 0);
  assert.ok(r.body.inventory.some(i => i.type === 'pet'));
  const kb = full.knowledgeBaseHandler(db, { user:'u' });
  assert.ok(kb.body.some(i => i.topic === '5以内加法'));
});

test('map events and family interactions close local loops', () => {
  const db = memdb();
  db.prepare(`INSERT INTO campaign_levels (id,chapter_id,grade,subject,semester,topic,title,level_type,difficulty,question_count,order_no,config_json,reward_json,unlock_json,enabled)
    VALUES ('l1','c1',1,'math','upper','退位减法','退位工厂','normal',1,5,1,'{}','{}','{}',1)`).run();
  const events = full.listMapEventsHandler(db, { user:'u' });
  assert.equal(events.body.length, 1);
  const done = full.completeMapEventHandler(db, events.body[0].id, { user:'u' });
  assert.equal(done.body.ok, true);

  const praise = full.createPraiseCardHandler(db, { user:'u', topic:'退位减法' });
  assert.equal(praise.body.ok, true);
  const claim = full.claimPraiseCardHandler(db, praise.body.card.id, { user:'u' });
  assert.equal(claim.body.ok, true);

  const boss = full.createParentBossHandler(db, { user:'u', topic:'退位减法', q:'9-4=?', options:['4','5'], answer:'5' });
  assert.equal(boss.status, 200);
  assert.equal(Object.hasOwn(boss.body.boss, 'answer'), false);
  const listedBosses = full.listParentBossHandler(db, { user:'u' });
  assert.equal(listedBosses.status, 200);
  assert.equal(Object.hasOwn(listedBosses.body[0], 'answer'), false);
  const finish = full.finishParentBossHandler(db, boss.body.boss.id, { user:'u', userAnswer:'5' });
  assert.equal(finish.body.correct, true);
  assert.ok(db.prepare("SELECT COUNT(*) AS c FROM praise_cards WHERE user='u'").get().c >= 2);
});
