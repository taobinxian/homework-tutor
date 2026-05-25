'use strict';

const crypto = require('node:crypto');
function safeJSON(text, fallback) {
  if (text === null || text === undefined) return fallback;
  try { return JSON.parse(text); } catch (_) { return fallback; }
}
const { updateMastery } = require('./mastery');

function id(prefix, seed = '') {
  const h = crypto.createHash('sha1').update(`${seed}|${Date.now()}|${Math.random()}`).digest('hex').slice(0, 12);
  return `${prefix}-${h}`;
}
function stableId(prefix, seed) {
  return `${prefix}-${crypto.createHash('sha1').update(String(seed)).digest('hex').slice(0, 16)}`;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function masteryStatus(score) {
  if (!score) return 'not_started';
  if (score < 40) return 'weak';
  if (score < 70) return 'learning';
  if (score < 85) return 'consolidating';
  return 'mastered';
}
function parseKp(row, topic) {
  const kp = safeJSON(row.knowledge_points || row.knowledge_points_json, null);
  return Array.isArray(kp) && kp.length ? kp : [topic || row.topic || '未标注'];
}
function monsterName(topic, type = 'normal') {
  const suffix = type === 'boss' ? '破盾兽' : type === 'hard' ? '顽固怪' : '吞吞兽';
  return `${String(topic || '知识点').slice(0, 12)}${suffix}`;
}
function trackEvent(db, user, eventName, payload = {}) {
  try {
    db.prepare(`INSERT OR IGNORE INTO analytics_events (id,user,event_name,payload_json,created_at)
      VALUES (?,?,?,?,CURRENT_TIMESTAMP)`).run(id('evt'), user || 'default', eventName, JSON.stringify(payload || {}));
  } catch (_) {}
}
function grantItem(db, user, itemType, itemId, name, qty = 1, meta = {}) {
  db.prepare(`INSERT INTO player_inventory (user,item_type,item_id,name,qty,meta_json,updated_at)
    VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(user,item_type,item_id) DO UPDATE SET qty=qty+excluded.qty, name=excluded.name, meta_json=excluded.meta_json, updated_at=CURRENT_TIMESTAMP`)
    .run(user, itemType, itemId, name, Number(qty || 1), JSON.stringify(meta || {}));
  trackEvent(db, user, 'reward_item_gain', { itemType, itemId, qty });
}
function seedStarterCollection(db, user = 'default') {
  grantItem(db, user, 'pet', 'spark-fox', '火花狐', 1, { skill: '每关初始护盾 +1', xp: 0, level: 1 });
  grantItem(db, user, 'equipment', 'starter-blaster', '新手知识炮', 1, { slot: 'weapon', ammoBonus: 1 });
  grantItem(db, user, 'badge', 'first-adventurer', '知识冒险家', 1, { desc: '开启知识战场' });
  const existing = db.prepare('SELECT 1 FROM player_loadout WHERE user=? AND slot=?').get(user, 'pet');
  if (!existing) db.prepare(`INSERT OR IGNORE INTO player_loadout (user,slot,item_id,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP)`).run(user, 'pet', 'spark-fox');
}

function syncMonstersFromWrongbook(db, { user = 'default' } = {}) {
  const rows = db.prepare(`SELECT topic, COUNT(*) AS wrong_count, MAX(created_at) AS last_seen_at,
                                  MAX(knowledge_points) AS knowledge_points
                           FROM wrong_questions
                           WHERE user=? AND COALESCE(topic,'') <> ''
                           GROUP BY topic`).all(user);
  const out = [];
  const upsert = db.prepare(`INSERT INTO wrong_monsters
    (id,user,topic,knowledge_points_json,monster_type,name,status,wrong_count,last_seen_at,created_at,updated_at)
    VALUES (@id,@user,@topic,@kp,@type,@name,@status,@wrongCount,@lastSeen,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(user, topic) DO UPDATE SET
      knowledge_points_json=excluded.knowledge_points_json,
      monster_type=excluded.monster_type,
      name=excluded.name,
      status=CASE WHEN wrong_monsters.status='purified' AND excluded.wrong_count>wrong_monsters.wrong_count THEN 'discovered' ELSE wrong_monsters.status END,
      wrong_count=excluded.wrong_count,
      last_seen_at=excluded.last_seen_at,
      updated_at=CURRENT_TIMESTAMP`);
  for (const r of rows) {
    const topic = r.topic || '未标注';
    const type = r.wrong_count >= 5 ? 'hard' : 'normal';
    const payload = { id: stableId('mon', `${user}|${topic}`), user, topic, kp: JSON.stringify(parseKp(r, topic)), type, name: monsterName(topic, type), status: 'discovered', wrongCount: r.wrong_count, lastSeen: r.last_seen_at };
    upsert.run(payload);
    out.push(db.prepare('SELECT * FROM wrong_monsters WHERE user=? AND topic=?').get(user, topic));
  }
  for (const m of out) trackEvent(db, user, 'wrong_monster_created', { topic: m.topic, monsterType: m.monster_type, wrongCount: m.wrong_count });
  return out;
}
function rowMonster(r) { return r && { id:r.id, topic:r.topic, knowledgePoints:safeJSON(r.knowledge_points_json,[]), type:r.monster_type, name:r.name, status:r.status, wrongCount:r.wrong_count, purifiedCount:r.purified_count, lastSeenAt:r.last_seen_at, createdAt:r.created_at, updatedAt:r.updated_at }; }
function listMonstersHandler(db, query = {}) {
  const user = query.user || 'default';
  syncMonstersFromWrongbook(db, { user });
  const rows = db.prepare("SELECT * FROM wrong_monsters WHERE user=? ORDER BY status='bounty' DESC, wrong_count DESC, updated_at DESC").all(user);
  trackEvent(db, user, 'monster_atlas_open', { monsterCount: rows.length });
  return { status: 200, body: rows.map(rowMonster) };
}
function getMonsterHandler(db, idOrQuery, query = {}) {
  const user = query.user || 'default';
  const mid = typeof idOrQuery === 'string' ? idOrQuery : idOrQuery.id;
  const r = db.prepare('SELECT * FROM wrong_monsters WHERE id=? AND user=?').get(mid, user);
  if (!r) return { status: 404, body: { error: '怪兽不存在' } };
  const wrong = db.prepare(`SELECT id,q,answer,user_answer AS userAnswer,topic,created_at AS createdAt FROM wrong_questions WHERE user=? AND topic=? ORDER BY created_at DESC LIMIT 20`).all(user, r.topic);
  const mastery = db.prepare('SELECT * FROM knowledge_mastery WHERE user=? AND topic=? ORDER BY last_practiced_at DESC LIMIT 1').get(user, r.topic);
  trackEvent(db, user, 'monster_detail_open', { monsterId: r.id, topic: r.topic, status: r.status });
  return { status: 200, body: { ...rowMonster(r), wrongQuestions: wrong, mastery: mastery ? { score: mastery.score || Math.round((mastery.mastery || 0) * 100), status: mastery.status || masteryStatus(Math.round((mastery.mastery || 0) * 100)), attempts: mastery.attempts, correct: mastery.correct, wrong: mastery.wrong } : null } };
}

function bountyReward(difficulty) {
  if (difficulty === 'boss') return { gold: 20, petXp: 10, items: [{ type: 'badge', id: 'boss-breaker', name: 'Boss破盾徽章', qty: 1 }, { type: 'material', id: 'core-crystal', name: '核心水晶', qty: 2 }] };
  if (difficulty === 'hard') return { gold: 14, petXp: 8, items: [{ type: 'equipment', id: 'focus-chip', name: '专注芯片', qty: 1 }, { type: 'material', id: 'badge-fragment', name: '徽章碎片', qty: 2 }] };
  return { gold: 8, petXp: 5, items: [{ type: 'material', id: 'base-brick', name: '基地砖块', qty: 3 }] };
}
function generateBounties(db, { user = 'default', source = 'system' } = {}) {
  const monsters = syncMonstersFromWrongbook(db, { user });
  const created = [];
  const recent = db.prepare(`SELECT topic, COUNT(*) AS attempts, SUM(CASE WHEN is_correct=0 THEN 1 ELSE 0 END) AS wrongs
                             FROM level_run_answers
                             WHERE user=? AND created_at >= datetime('now','-7 day') AND COALESCE(topic,'') <> ''
                             GROUP BY topic`).all(user);
  const byTopic = new Map(recent.map(r => [r.topic, r]));
  const ins = db.prepare(`INSERT INTO bounty_tasks
    (id,user,source,topic,monster_id,task_type,cycle,difficulty,target_json,progress_json,reward_json,status,created_at)
    VALUES (@id,@user,@source,@topic,@monsterId,@taskType,@cycle,@difficulty,@target,@progress,@reward,'active',CURRENT_TIMESTAMP)`);
  for (const m of monsters) {
    if (m.status === 'purified') continue;
    const r = byTopic.get(m.topic) || { attempts: m.wrong_count, wrongs: m.wrong_count };
    const acc = r.attempts ? (r.attempts - r.wrongs) / r.attempts : 0;
    const difficulty = m.wrong_count >= 5 || (r.attempts >= 3 && acc < 0.6) ? 'hard' : 'normal';
    if (m.wrong_count < 2 && difficulty !== 'hard') continue;
    const taskType = difficulty === 'hard' ? 'review' : 'review';
    const target = difficulty === 'hard' ? { minQuestions: 8, minAccuracy: 0.75 } : { minQuestions: 5, minAccuracy: 0.8 };
    const active = db.prepare(`SELECT * FROM bounty_tasks
      WHERE user=? AND topic=? AND task_type=? AND status='active'
      ORDER BY created_at DESC LIMIT 1`).get(user, m.topic, taskType);
    if (active) {
      created.push(active);
      continue;
    }
    const last = db.prepare(`SELECT COALESCE(MAX(cycle), 0) AS maxCycle FROM bounty_tasks WHERE user=? AND topic=? AND task_type=?`).get(user, m.topic, taskType);
    const cycle = Number(last.maxCycle || 0) + 1;
    const payload = { id: id('bounty', `${user}|${m.topic}|${taskType}|${cycle}`), user, source, topic: m.topic, monsterId: m.id, taskType, cycle, difficulty, target: JSON.stringify(target), progress: JSON.stringify({ correct: 0, total: 0, accuracy: 0 }), reward: JSON.stringify(bountyReward(difficulty)) };
    ins.run(payload);
    db.prepare(`UPDATE wrong_monsters SET status='bounty', updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='purified'`).run(m.id);
    trackEvent(db, user, 'bounty_generated', { topic: m.topic, difficulty, monsterId: m.id, cycle });
    created.push(db.prepare('SELECT * FROM bounty_tasks WHERE id=?').get(payload.id));
  }
  return created;
}
function rowBounty(r) { return r && { id:r.id, source:r.source, topic:r.topic, monsterId:r.monster_id, taskType:r.task_type, cycle:r.cycle, difficulty:r.difficulty, target:safeJSON(r.target_json,{}), progress:safeJSON(r.progress_json,{}), reward:safeJSON(r.reward_json,{}), status:r.status, createdAt:r.created_at, completedAt:r.completed_at, claimedAt:r.claimed_at }; }
function listBountiesHandler(db, query = {}) {
  const user = query.user || 'default';
  if (query.generate !== '0') generateBounties(db, { user, source: query.source || 'list' });
  const status = query.status || 'active';
  const rows = status === 'all'
    ? db.prepare('SELECT * FROM bounty_tasks WHERE user=? ORDER BY created_at DESC').all(user)
    : db.prepare('SELECT * FROM bounty_tasks WHERE user=? AND status=? ORDER BY created_at DESC').all(user, status);
  return { status: 200, body: rows.map(rowBounty) };
}
function runStatsForBounty(db, { user = 'default', runId, topic } = {}) {
  if (!runId) return null;
  const run = db.prepare('SELECT * FROM level_runs WHERE run_id=? AND user=?').get(runId, user);
  if (!run || !run.finished_at || !['win', 'complete'].includes(String(run.result || ''))) return null;
  const topicStats = db.prepare(`SELECT topic, COUNT(*) AS total, COALESCE(SUM(is_correct),0) AS correct
                                 FROM level_run_answers
                                 WHERE run_id=? AND user=? AND COALESCE(topic,'') <> ''
                                 GROUP BY topic`).all(runId, user);
  const stat = topicStats.find(r => r.topic === topic);
  if (!stat) return null;
  const total = Number(stat.total || 0);
  const correct = Number(stat.correct || 0);
  return { runId, levelId: run.level_id, result: run.result, topic, total, correct, accuracy: total ? correct / total : 0 };
}
function applyBountyRunStats(db, bounty, stats, meta = {}) {
  if (!bounty || bounty.status === 'claimed' || bounty.status === 'completed') {
    return { ok: true, bounty: rowBounty(bounty), idempotent: true };
  }
  const target = safeJSON(bounty.target_json, {});
  const pass = stats.total >= Number(target.minQuestions || 1) && stats.accuracy >= Number(target.minAccuracy || 0);
  const progress = { runId: stats.runId, levelId: stats.levelId, correct: stats.correct, total: stats.total, accuracy: stats.accuracy };
  db.prepare(`UPDATE bounty_tasks SET progress_json=?, status=?, completed_at=CASE WHEN ? THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id=? AND status='active'`)
    .run(JSON.stringify(progress), pass ? 'completed' : 'active', pass ? 1 : 0, bounty.id);
  if (pass) {
    db.prepare(`UPDATE wrong_monsters SET status='purified', purified_count=purified_count+1, updated_at=CURRENT_TIMESTAMP WHERE id=? AND status!='purified'`).run(bounty.monster_id);
    upsertKnowledgeBuilding(db, bounty.user, bounty.topic, '悬赏净化');
    trackEvent(db, bounty.user, 'bounty_complete', { bountyId: bounty.id, topic: bounty.topic, runId: stats.runId, accuracy: stats.accuracy, source: meta.source || 'run' });
  }
  const fresh = db.prepare('SELECT * FROM bounty_tasks WHERE id=?').get(bounty.id);
  return { ok: pass, bounty: rowBounty(fresh), progress };
}
function completeBountyHandler(db, bountyId, payload = {}) {
  const user = payload.user || 'default';
  const runId = payload.runId;
  if (!runId) return { status: 400, body: { error: '缺少 runId，悬赏必须由真实关卡结算' } };
  const b = db.prepare('SELECT * FROM bounty_tasks WHERE id=? AND user=?').get(bountyId, user);
  if (!b) return { status: 404, body: { error: '悬赏不存在' } };
  if (b.status === 'claimed' || b.status === 'completed') return { status: 200, body: { ok: true, bounty: rowBounty(b), idempotent: true } };
  const stats = runStatsForBounty(db, { user, runId, topic: b.topic });
  if (!stats || stats.total <= 0) return { status: 422, body: { error: 'run 未完成或不匹配悬赏知识点' } };
  const result = applyBountyRunStats(db, b, stats, { source: 'manual-complete' });
  return { status: 200, body: result };
}
function settleBountiesForRun(db, { user = 'default', runId } = {}) {
  if (!runId) return [];
  const active = db.prepare(`SELECT * FROM bounty_tasks WHERE user=? AND status='active' ORDER BY created_at ASC`).all(user);
  const settled = [];
  for (const b of active) {
    const stats = runStatsForBounty(db, { user, runId, topic: b.topic });
    if (!stats || stats.total <= 0) continue;
    settled.push(applyBountyRunStats(db, b, stats, { source: 'level-finish' }));
  }
  return settled;
}
function claimBountyHandler(db, bountyId, payload = {}) {
  const user = payload.user || 'default';
  const b = db.prepare('SELECT * FROM bounty_tasks WHERE id=? AND user=?').get(bountyId, user);
  if (!b) return { status: 404, body: { error: '悬赏不存在' } };
  if (b.status === 'claimed') return { status: 200, body: { ok: true, reward: safeJSON(b.reward_json, {}), idempotent: true } };
  if (b.status !== 'completed') return { status: 409, body: { error: '悬赏尚未完成' } };
  const reward = safeJSON(b.reward_json, {});
  for (const it of reward.items || []) grantItem(db, user, it.type, it.id, it.name, it.qty || 1, { source: 'bounty', bountyId });
  grantItem(db, user, 'currency', 'gold', '金币', Number(reward.gold || 0), { virtual: true });
  db.prepare(`UPDATE bounty_tasks SET status='claimed', claimed_at=CURRENT_TIMESTAMP WHERE id=?`).run(bountyId);
  return { status: 200, body: { ok: true, reward, bounty: rowBounty(db.prepare('SELECT * FROM bounty_tasks WHERE id=?').get(bountyId)) } };
}

function updateMasteryScores(db, user) {
  const rows = db.prepare('SELECT rowid,* FROM knowledge_mastery WHERE user=?').all(user);
  for (const r of rows) {
    const accuracy = r.attempts ? r.correct / r.attempts : 0;
    const streakBonus = r.correct >= 5 ? 10 : Math.min(8, r.correct * 2);
    const recentPenalty = r.wrong > r.correct ? 12 : 0;
    const score = clamp(Math.round(accuracy * 80 + streakBonus - recentPenalty), 0, 100);
    db.prepare('UPDATE knowledge_mastery SET score=?, status=? WHERE rowid=?').run(score, masteryStatus(score), r.rowid);
  }
}
function upsertKnowledgeBuilding(db, user, topic, source = 'mastery') {
  const kid = stableId('kb', `${user}|${topic}|building`);
  db.prepare(`INSERT INTO knowledge_base_items (id,user,topic,item_type,name,status,meta_json,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    ON CONFLICT(user,topic,item_type) DO UPDATE SET status='placed', updated_at=CURRENT_TIMESTAMP`)
    .run(kid, user, topic, 'building', `${topic}能量塔`, 'placed', JSON.stringify({ source }));
}
function awardBadgesFromState(db, user) {
  const mastered = db.prepare(`SELECT topic FROM knowledge_mastery WHERE user=? AND (status='mastered' OR score>=85)`).all(user);
  for (const m of mastered) {
    grantItem(db, user, 'badge', stableId('badge', `mastered|${m.topic}`), `${m.topic}掌握徽章`, 1, { topic: m.topic });
    upsertKnowledgeBuilding(db, user, m.topic, 'mastery');
  }
  const purified = db.prepare(`SELECT COUNT(*) AS c FROM wrong_monsters WHERE user=? AND status='purified'`).get(user).c;
  if (purified > 0) grantItem(db, user, 'badge', 'monster-purifier-1', '错题净化徽章', 1, { purified });
}
function growthSummaryHandler(db, query = {}) {
  const user = query.user || 'default';
  seedStarterCollection(db, user);
  updateMasteryScores(db, user);
  syncMonstersFromWrongbook(db, { user });
  awardBadgesFromState(db, user);
  const mastery = db.prepare('SELECT topic,attempts,correct,wrong,mastery,score,status FROM knowledge_mastery WHERE user=? ORDER BY score DESC, attempts DESC LIMIT 50').all(user);
  const inv = db.prepare('SELECT * FROM player_inventory WHERE user=? ORDER BY item_type,name').all(user);
  const power = mastery.reduce((sum, m) => sum + Number(m.score || Math.round((m.mastery || 0) * 100)), 0)
    + inv.filter(i => i.item_type === 'badge').length * 5
    + inv.filter(i => i.item_type === 'pet' || i.item_type === 'equipment').length * 3;
  return { status: 200, body: { knowledgePower: power, title: power >= 300 ? '知识勇者' : power >= 120 ? '知识探险家' : '见习冒险者', mastery, inventory: inv.map(rowItem), loadout: loadout(db, user) } };
}
function rowItem(r) { return { type:r.item_type, id:r.item_id, name:r.name, qty:r.qty, meta:safeJSON(r.meta_json,{}) }; }
function loadout(db, user) { return Object.fromEntries(db.prepare('SELECT slot,item_id FROM player_loadout WHERE user=?').all(user).map(r => [r.slot, r.item_id])); }
function inventoryHandler(db, query = {}) { const user = query.user || 'default'; seedStarterCollection(db,user); return { status:200, body:{ items: db.prepare('SELECT * FROM player_inventory WHERE user=? ORDER BY item_type,name').all(user).map(rowItem), loadout: loadout(db,user) } }; }
function equipHandler(db, payload = {}) { const user=payload.user||'default'; const slot=payload.slot; const itemId=payload.itemId; if(!slot||!itemId) return {status:400,body:{error:'缺少 slot/itemId'}}; const item=db.prepare('SELECT * FROM player_inventory WHERE user=? AND item_id=?').get(user,itemId); if(!item) return {status:404,body:{error:'未拥有该物品'}}; db.prepare(`INSERT INTO player_loadout (user,slot,item_id,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(user,slot) DO UPDATE SET item_id=excluded.item_id, updated_at=CURRENT_TIMESTAMP`).run(user,slot,itemId); trackEvent(db,user,item.item_type==='pet'?'pet_equip':'equipment_equip',{slot,itemId}); return {status:200,body:{ok:true,loadout:loadout(db,user)}}; }
function knowledgeBaseHandler(db, query = {}) { const user=query.user||'default'; updateMasteryScores(db,user); for (const m of db.prepare(`SELECT topic FROM knowledge_mastery WHERE user=? AND score>=70`).all(user)) upsertKnowledgeBuilding(db,user,m.topic,'mastery'); trackEvent(db,user,'knowledge_base_open',{}); return {status:200,body: db.prepare('SELECT * FROM knowledge_base_items WHERE user=? ORDER BY created_at DESC').all(user).map(r=>({id:r.id,topic:r.topic,type:r.item_type,name:r.name,status:r.status,meta:safeJSON(r.meta_json,{})}))}; }
function placeKnowledgeBaseHandler(db, payload = {}) { const user=payload.user||'default'; const topic=payload.topic; if(!topic) return {status:400,body:{error:'缺少 topic'}}; upsertKnowledgeBuilding(db,user,topic,'manual'); return knowledgeBaseHandler(db,{user}); }
function runHighlightsHandler(db, query = {}) { const user=query.user||'default'; const runId=query.runId; const rows = runId ? db.prepare('SELECT * FROM battle_highlights WHERE user=? AND run_id=? ORDER BY created_at DESC LIMIT 10').all(user,runId) : db.prepare('SELECT * FROM battle_highlights WHERE user=? ORDER BY created_at DESC LIMIT 10').all(user); return {status:200,body:rows.map(r=>({id:r.id,runId:r.run_id,type:r.highlight_type,title:r.title,payload:safeJSON(r.payload_json,{}),createdAt:r.created_at}))}; }
function recordRunHighlights(db, { user='default', runId, levelId, stats={}, result, rewards={} } = {}) {
  const highlights=[];
  const add=(type,title,payload={})=>highlights.push({type,title,payload});
  if ((stats.masteryUpgrades||[]).length) add('mastery_up','掌握度升级', { upgrades: stats.masteryUpgrades });
  if (stats.purifiedMonsters?.length) add('monster_purified','净化错题怪兽', { monsters: stats.purifiedMonsters });
  if ((stats.combatStats?.maxCombo || stats.maxCombo || 0) >= 3) add('combo',`最高连击 ${stats.combatStats?.maxCombo || stats.maxCombo}`,{});
  if (stats.combatStats?.rescueSuccess || stats.rescueSuccess) add('rescue','补救一击成功',{});
  if ((rewards.gems||0)>0) add('rare_reward','获得稀有奖励',{rewards});
  for (const h of highlights.slice(0,3)) db.prepare(`INSERT OR IGNORE INTO battle_highlights (id,user,run_id,level_id,highlight_type,title,payload_json,created_at) VALUES (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`).run(id('hi'),user,runId,levelId,h.type,h.title,JSON.stringify(h.payload));
  return highlights;
}

function ensureMapEvents(db, user='default') {
  const levels = db.prepare('SELECT id,topic,title FROM campaign_levels WHERE enabled=1 ORDER BY order_no ASC LIMIT 12').all();
  const types = ['chest','npc','branch'];
  let i=0;
  for (const l of levels) {
    const eventType = types[i % types.length]; i++;
    const eid = stableId('mev', `${user}|${l.id}|${eventType}`);
    const cfg = eventType === 'chest' ? { title:'知识宝箱', questionCount:2, topic:l.topic, reward:{gold:5, material:'base-brick'} }
      : eventType === 'branch' ? { title:'分支挑战', mode:'combo3', topic:l.topic, reward:{equipment:'focus-chip'} }
      : { title:'NPC提示', text:`${l.topic} 要先看清题干，再决定策略。`, topic:l.topic };
    db.prepare(`INSERT OR IGNORE INTO map_events (id,user,level_id,event_type,config_json,status,created_at) VALUES (?,?,?,?,?,'available',CURRENT_TIMESTAMP)`).run(eid,user,l.id,eventType,JSON.stringify(cfg));
  }
}
function listMapEventsHandler(db, query={}) { const user=query.user||'default'; ensureMapEvents(db,user); const rows=db.prepare(`SELECT * FROM map_events WHERE user=? AND status=? ORDER BY created_at ASC LIMIT 20`).all(user, query.status||'available'); return {status:200,body:rows.map(r=>({id:r.id,levelId:r.level_id,type:r.event_type,config:safeJSON(r.config_json,{}),status:r.status,createdAt:r.created_at}))}; }
function completeMapEventHandler(db, eventId, payload={}) { const user=payload.user||'default'; const e=db.prepare('SELECT * FROM map_events WHERE id=? AND user=?').get(eventId,user); if(!e) return {status:404,body:{error:'地图事件不存在'}}; if(e.status==='completed') return {status:200,body:{ok:true,idempotent:true}}; const cfg=safeJSON(e.config_json,{}); db.prepare(`UPDATE map_events SET status='completed', completed_at=CURRENT_TIMESTAMP WHERE id=?`).run(eventId); if(e.event_type==='chest') grantItem(db,user,'material','base-brick','基地砖块',3,{source:'map-chest'}); if(e.event_type==='branch') grantItem(db,user,'equipment','focus-chip','专注芯片',1,{source:'branch'}); trackEvent(db,user,e.event_type==='branch'?'branch_challenge_start':'map_event_view',{eventId,type:e.event_type}); return {status:200,body:{ok:true,reward:cfg.reward||{},eventId}}; }

function createPraiseCardHandler(db, payload={}) { const user=payload.user||'default'; const topic=payload.topic||'今天的学习'; const message=String(payload.message||`今天你认真完成了 ${topic}，太棒了！`).slice(0,160); const reward=payload.reward||{gold:3, material:'base-brick'}; const pid=id('praise'); db.prepare(`INSERT INTO praise_cards (id,user,topic,message,reward_json,status,created_at) VALUES (?,?,?,?,?,'created',CURRENT_TIMESTAMP)`).run(pid,user,topic,message,JSON.stringify(reward)); trackEvent(db,user,'praise_card_create',{topic}); return {status:200,body:{ok:true,card:{id:pid,topic,message,reward,status:'created'}}}; }
function listPraiseCardsHandler(db, query={}) { const user=query.user||'default'; const rows=db.prepare('SELECT * FROM praise_cards WHERE user=? ORDER BY created_at DESC LIMIT 20').all(user); return {status:200,body:rows.map(r=>({id:r.id,topic:r.topic,message:r.message,reward:safeJSON(r.reward_json,{}),status:r.status,createdAt:r.created_at,claimedAt:r.claimed_at}))}; }
function claimPraiseCardHandler(db, cardId, payload={}) { const user=payload.user||'default'; const c=db.prepare('SELECT * FROM praise_cards WHERE id=? AND user=?').get(cardId,user); if(!c) return {status:404,body:{error:'表扬卡不存在'}}; if(c.status==='claimed') return {status:200,body:{ok:true,idempotent:true}}; grantItem(db,user,'material','base-brick','基地砖块',2,{source:'praise'}); grantItem(db,user,'badge','praised-star','被表扬的小星星',1,{source:'praise'}); db.prepare(`UPDATE praise_cards SET status='claimed', claimed_at=CURRENT_TIMESTAMP WHERE id=?`).run(cardId); trackEvent(db,user,'praise_card_claim',{cardId}); return {status:200,body:{ok:true}}; }
function createParentBossHandler(db, payload={}) { const user=payload.user||'default'; const q=String(payload.q||payload.question||'').trim(); const answer=String(payload.answer||'').trim(); if(!q||!answer) return {status:400,body:{error:'缺少题干或答案'}}; const bid=id('pboss'); db.prepare(`INSERT INTO parent_boss_questions (id,user,topic,q,options_json,answer,status,created_at) VALUES (?,?,?,?,?,?, 'available', CURRENT_TIMESTAMP)`).run(bid,user,payload.topic||'家长挑战',q,JSON.stringify(payload.options||[]),answer); trackEvent(db,user,'parent_boss_create',{topic:payload.topic||'家长挑战'}); return {status:200,body:{ok:true,boss:{id:bid,topic:payload.topic||'家长挑战',q,options:payload.options||[],status:'available'}}}; }
function listParentBossHandler(db, query={}) { const user=query.user||'default'; const rows=db.prepare('SELECT * FROM parent_boss_questions WHERE user=? ORDER BY created_at DESC LIMIT 20').all(user); return {status:200,body:rows.map(r=>({id:r.id,topic:r.topic,q:r.q,options:safeJSON(r.options_json,[]),status:r.status,result:r.result,createdAt:r.created_at}))}; }
function finishParentBossHandler(db, bossId, payload={}) { const user=payload.user||'default'; const b=db.prepare('SELECT * FROM parent_boss_questions WHERE id=? AND user=?').get(bossId,user); if(!b) return {status:404,body:{error:'家长Boss题不存在'}}; const correct=String(payload.userAnswer||'').trim()===String(b.answer).trim(); if(b.status==='completed') return {status:200,body:{ok:true,idempotent:true,correct:b.result==='correct'}}; db.prepare(`UPDATE parent_boss_questions SET status='completed', result=?, completed_at=CURRENT_TIMESTAMP WHERE id=?`).run(correct?'correct':'wrong',bossId); if(correct){ grantItem(db,user,'badge','parent-boss-breaker','家长Boss破盾者',1,{source:'parent-boss'}); createPraiseCardHandler(db,{user,topic:b.topic,message:`你答对了家长 Boss 题「${b.topic}」，破盾成功！`}); } else { db.prepare(`INSERT INTO wrong_questions (user,q,type,options,answer,user_answer,topic,source,knowledge_points,created_at) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`).run(user,b.q,'choice',b.options_json,b.answer,payload.userAnswer||'',b.topic,'parent-boss',JSON.stringify([b.topic])); syncMonstersFromWrongbook(db,{user}); }
  trackEvent(db,user,'parent_boss_finish',{bossId,correct}); return {status:200,body:{ok:true,correct}}; }
function analyticsListHandler(db, query={}) { const user=query.user||'default'; const rows=db.prepare('SELECT * FROM analytics_events WHERE user=? ORDER BY created_at DESC LIMIT ?').all(user, Number(query.limit||100)); return {status:200,body:rows.map(r=>({id:r.id,eventName:r.event_name,payload:safeJSON(r.payload_json,{}),createdAt:r.created_at}))}; }

module.exports = {
  trackEvent, syncMonstersFromWrongbook, generateBounties, settleBountiesForRun, recordRunHighlights,
  listMonstersHandler, getMonsterHandler, listBountiesHandler, completeBountyHandler, claimBountyHandler,
  growthSummaryHandler, inventoryHandler, equipHandler, knowledgeBaseHandler, placeKnowledgeBaseHandler, runHighlightsHandler,
  listMapEventsHandler, completeMapEventHandler, createPraiseCardHandler, listPraiseCardsHandler, claimPraiseCardHandler,
  createParentBossHandler, listParentBossHandler, finishParentBossHandler, analyticsListHandler,
};
