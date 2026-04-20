// ================================================================
//  小学生作业辅导 — 本地 AI 代理 + 火山引擎 豆包语音合成 2.0 (Seed-TTS 2.0) + 静态托管
//
//  用法（最简）:   node proxy.js
//  启用 TTS：      VOLC_APPID=xxx VOLC_TOKEN=xxx node proxy.js
//
//  部署到局域网 Ubuntu (192.168.3.79) 看 DEPLOY.md
//  局域网访问:     http://192.168.3.79:8787/app
// ================================================================
//
//  环境变量:
//   PORT             监听端口（默认 8787）
//   BIND             监听地址（默认 0.0.0.0，允许局域网访问）
//   UPSTREAM         AI chat 上游（默认 OpenRouter）
//   VOLC_APPID       火山引擎 AppID（填了才启用 TTS）
//   VOLC_TOKEN       火山引擎 Access Token（旧控制台 AccessToken / 新控制台 Api Key 都可）
//   VOLC_RESOURCE_ID 可选，强制指定 X-Api-Resource-Id；留空时默认 seed-tts-2.0（适用所有音色）
//   STATIC_DIR       静态目录（默认脚本所在目录）
//
//  路由:
//   GET  /                    健康检查
//   GET  /app                 主页（index.html）
//   POST /v1/chat/completions 转发到 AI 上游（支持流式）
//   GET  /tts?text=...&voice=saturn_zh_female_keainvsheng_tob  火山 TTS，返回 MP3
//   POST /tts  {text,voice,rate}              同上，body 传参
// ================================================================

'use strict';

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const { URL } = require('url');

// ---------- 错题库 SQLite ----------
let db;
try {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, 'wrongbook.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS wrong_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user TEXT NOT NULL DEFAULT 'default',
    q TEXT NOT NULL,
    type TEXT,
    options TEXT,
    answer TEXT,
    user_answer TEXT,
    hints TEXT,
    explain_text TEXT,
    topic TEXT,
    source TEXT,
    needs_image INTEGER DEFAULT 0,
    image_desc TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_wrong_user ON wrong_questions(user)`);
  console.log('  错题库: ✅ SQLite 已就绪 · ' + dbPath);
} catch(e) {
  console.log('  错题库: ⚠️ SQLite 不可用，使用客户端本地存储 (' + e.message + ')');
  db = null;
}

const PORT            = parseInt(process.env.PORT || '8787', 10);
const BIND            = process.env.BIND            || '0.0.0.0';
const UPSTREAM        = process.env.UPSTREAM        || 'https://openrouter.ai/api/v1/chat/completions';
const VOLC_APPID      = process.env.VOLC_APPID      || '';
const VOLC_TOKEN      = process.env.VOLC_TOKEN      || '';
const VOLC_RESOURCE_ID= process.env.VOLC_RESOURCE_ID|| '';   // 留空自动按 voice 前缀路由
const STATIC_DIR      = process.env.STATIC_DIR      || __dirname;

// Seed-TTS 2.0 统一 resource_id（适用所有音色，含 saturn_* 复刻音色）
const RID_DEFAULT = 'seed-tts-2.0';

function pickResourceId(voice){
  return VOLC_RESOURCE_ID || RID_DEFAULT;
}

const CORS = {
  'Access-Control-Allow-Origin' : '*',
  'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Max-Age'      : '86400',
};

const MIME = {
  '.html':'text/html; charset=utf-8',
  '.htm' :'text/html; charset=utf-8',
  '.js'  :'application/javascript; charset=utf-8',
  '.css' :'text/css; charset=utf-8',
  '.json':'application/json; charset=utf-8',
  '.png' :'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.gif' :'image/gif', '.svg':'image/svg+xml', '.ico':'image/x-icon',
  '.webp':'image/webp', '.txt':'text/plain; charset=utf-8',
  '.woff':'font/woff','.woff2':'font/woff2',
};

function uuid(){
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g,c=>{
    const r=Math.random()*16|0; return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

function readBody(req){
  return new Promise((resolve,reject)=>{
    const chunks=[];
    req.on('data',c=>chunks.push(c));
    req.on('end',()=>resolve(Buffer.concat(chunks)));
    req.on('error',reject);
  });
}

// ---------- /v1/chat/completions 转发（支持流式） ----------
function proxyChat(req,res){
  readBody(req).then(body=>{
    const u=new URL(UPSTREAM);
    const opts={
      method : 'POST',
      host   : u.hostname,
      port   : u.port || 443,
      path   : u.pathname + u.search,
      headers: {
        'Content-Type'  : 'application/json',
        'Authorization' : req.headers['authorization'] || '',
        'Content-Length': body.length,
        'Accept'        : req.headers['accept'] || 'application/json',
      },
    };
    const up=https.request(opts, r=>{
      const headers={
        ...CORS,
        'Content-Type': r.headers['content-type'] || 'application/json',
      };
      if(r.headers['transfer-encoding']) headers['Transfer-Encoding']=r.headers['transfer-encoding'];
      res.writeHead(r.statusCode, headers);
      r.pipe(res);
    });
    up.on('error', err=>{
      res.writeHead(502, {...CORS,'Content-Type':'application/json; charset=utf-8'});
      res.end(JSON.stringify({error:{message:'上游连接失败: '+err.message}}));
    });
    up.write(body); up.end();
  }).catch(err=>{
    res.writeHead(500, {...CORS,'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({error:{message:'读请求体失败: '+err.message}}));
  });
}

// ---------- /tts 火山引擎 豆包语音合成 2.0 (Seed-TTS 2.0)  /api/v3/tts/unidirectional/sse ----------
function handleTTS(req,res){
  if(!VOLC_APPID||!VOLC_TOKEN){
    res.writeHead(500,{...CORS,'Content-Type':'application/json; charset=utf-8'});
    return res.end(JSON.stringify({error:'未配置火山引擎。请在启动时设置 VOLC_APPID 和 VOLC_TOKEN 环境变量。'}));
  }
  const parseReq=()=>{
    if(req.method==='GET'){
      const u=new URL(req.url,'http://x');
      return Promise.resolve({
        text   : u.searchParams.get('text')  || '',
        voice  : u.searchParams.get('voice') || 'saturn_zh_female_keainvsheng_tob',
        rate   : parseFloat(u.searchParams.get('rate')||'1.0'),
        encoding: u.searchParams.get('enc')  || 'mp3',
      });
    }
    return readBody(req).then(buf=>{
      let j={}; try{ j=JSON.parse(buf.toString('utf-8')) }catch(_){}
      return {
        text    : j.text     || '',
        voice   : j.voice    || 'saturn_zh_female_keainvsheng_tob',
        rate    : typeof j.rate==='number' ? j.rate : 1.0,
        encoding: j.encoding || 'mp3',
      };
    });
  };
  parseReq().then(p=>{
    if(!p.text){
      res.writeHead(400,{...CORS,'Content-Type':'application/json; charset=utf-8'});
      return res.end(JSON.stringify({error:'text 参数为空'}));
    }

    // rate (0.5~2.0, 1.0=正常) 转换成 Seed-TTS 2.0 的 speech_rate (-50~50, 0=正常)
    // 1.0 -> 0 ；  0.8 -> -20 ；  1.2 -> 20
    const speechRate = Math.max(-50, Math.min(50, Math.round((p.rate - 1.0) * 100)));
    const resourceId = pickResourceId(p.voice);

    const payload = JSON.stringify({
      user: { uid: 'homework-app' },
      req_params: {
        text   : p.text.slice(0, 1024),
        speaker: p.voice,
        audio_params: {
          format     : p.encoding,   // 'mp3' | 'wav' | 'pcm'
          sample_rate: 24000,
          speech_rate: speechRate,
        },
      },
    });

    const opts={
      method: 'POST',
      host  : 'openspeech.bytedance.com',
      path  : '/api/v3/tts/unidirectional/sse',
      headers: {
        'Content-Type'       : 'application/json',
        'X-Api-App-Id'       : VOLC_APPID,
        'X-Api-Access-Key'   : VOLC_TOKEN,
        'X-Api-Resource-Id'  : resourceId,
        'X-Api-Request-Id'   : uuid(),
        'Content-Length'     : Buffer.byteLength(payload),
      },
    };

    const up=https.request(opts, r=>{
      // 非 200：把原始响应读完后回给前端便于排错
      if(r.statusCode !== 200){
        const chunks=[];
        r.on('data',c=>chunks.push(c));
        r.on('end',()=>{
          res.writeHead(502,{...CORS,'Content-Type':'application/json; charset=utf-8'});
          res.end(JSON.stringify({
            error  : '火山 HTTP '+r.statusCode,
            headers: { logid: r.headers['x-tt-logid'] || r.headers['x-api-logid'] || '' },
            raw    : Buffer.concat(chunks).toString('utf-8').slice(0,800),
          }));
        });
        return;
      }

      // 流式解析 SSE：收到音频块立即写给客户端，不等全部完成
      let buffer='';
      let headerSent=false;
      let sseError=null;
      let hasAudio=false;

      const sendHeader=()=>{
        if(headerSent)return;
        headerSent=true;
        res.writeHead(200, {
          ...CORS,
          'Content-Type'  : p.encoding==='mp3' ? 'audio/mpeg'
                          : p.encoding==='wav' ? 'audio/wav'
                          : 'application/octet-stream',
          'Transfer-Encoding': 'chunked',
          'Cache-Control' : 'no-cache',
        });
      };

      const handleBlock = (block)=>{
        let eventName='';
        const dataLines=[];
        for(const line of block.split(/\r?\n/)){
          if(line.startsWith('event:'))      eventName = line.slice(6).trim();
          else if(line.startsWith('data:'))  dataLines.push(line.slice(5).trimStart());
        }
        const dataStr = dataLines.join('\n').trim();
        if(!dataStr) return;
        let j;
        try{ j = JSON.parse(dataStr); }catch(_){ return; }

        // 官方文档里，data 为 base64 音频；code 非 0（且不是 20000000 “任务成功”）视为错误
        if(typeof j.code === 'number' && j.code !== 0 && j.code !== 20000000){
          sseError = { code: j.code, message: j.message || '', logid: j.logid || '' };
        }
        if(j.data && typeof j.data === 'string'){
          try{
            const chunk=Buffer.from(j.data,'base64');
            if(chunk.length>0){
              sendHeader();
              res.write(chunk);
              hasAudio=true;
            }
          }catch(_){}
        }
      };

      r.on('data', c=>{
        buffer += c.toString('utf-8');
        while(true){
          // SSE 块分隔：两个换行
          const m = buffer.match(/\r?\n\r?\n/);
          if(!m) break;
          const idx = m.index;
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + m[0].length);
          handleBlock(block);
        }
      });
      r.on('end', ()=>{
        // 处理残留（极少数情况下最后一块没有结尾换行）
        if(buffer.trim()) handleBlock(buffer);

        if(sseError && !headerSent){
          res.writeHead(502,{...CORS,'Content-Type':'application/json; charset=utf-8'});
          return res.end(JSON.stringify({ error:'火山 TTS 错误', ...sseError }));
        }
        if(!hasAudio && !headerSent){
          res.writeHead(502,{...CORS,'Content-Type':'application/json; charset=utf-8'});
          return res.end(JSON.stringify({ error:'火山未返回音频数据' }));
        }
        res.end();
      });
      r.on('error', err=>{
        if(!headerSent){
          res.writeHead(502,{...CORS,'Content-Type':'application/json; charset=utf-8'});
          res.end(JSON.stringify({ error:'读取火山响应失败: '+err.message }));
        }else{
          res.end();
        }
      });
    });

    up.on('error', err=>{
      res.writeHead(502,{...CORS,'Content-Type':'application/json; charset=utf-8'});
      res.end(JSON.stringify({ error:'连接火山失败: '+err.message }));
    });
    up.write(payload); up.end();
  }).catch(err=>{
    res.writeHead(500,{...CORS,'Content-Type':'application/json; charset=utf-8'});
    res.end(JSON.stringify({ error:'TTS 处理失败: '+err.message }));
  });
}

// ---------- 静态文件 ----------
function serveStatic(req,res,relPath){
  const safe=path.normalize(relPath).replace(/^(\.\.[\/\\])+/,'');
  const full=path.join(STATIC_DIR,safe);
  if(!full.startsWith(STATIC_DIR)){
    res.writeHead(403,CORS); return res.end('403');
  }
  fs.stat(full,(e,s)=>{
    if(e||!s.isFile()){
      res.writeHead(404,{...CORS,'Content-Type':'text/plain; charset=utf-8'});
      return res.end('404 not found: '+relPath);
    }
    const ext=path.extname(full).toLowerCase();
    res.writeHead(200,{
      ...CORS,
      'Content-Type' : MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(full).pipe(res);
  });
}

// ---------- 路由 ----------
const server = http.createServer((req,res)=>{
  if(req.method==='OPTIONS'){ res.writeHead(204,CORS); return res.end(); }

  let pathname;
  try{ pathname=new URL(req.url,'http://x').pathname; }
  catch(_){ pathname=req.url.split('?')[0]; }

  if(req.method==='GET' && (pathname==='/' || pathname==='/health')){
    const ridInfo = VOLC_RESOURCE_ID
      ? `强制 ${VOLC_RESOURCE_ID}`
      : `${RID_DEFAULT}`;
    res.writeHead(200,{...CORS,'Content-Type':'text/plain; charset=utf-8'});
    return res.end(
      `✅ 小学生作业辅导·本地服务\n`+
      `监听 : ${BIND}:${PORT}\n`+
      `上游 : ${UPSTREAM}\n`+
      `TTS  : ${VOLC_APPID?'✅ 火山 豆包语音合成 2.0 · '+ridInfo:'⚠️  未配置（设 VOLC_APPID 和 VOLC_TOKEN 启用）'}\n`+
      `静态 : ${STATIC_DIR}\n\n`+
      `H5 入口: http://<本机 IP>:${PORT}/app\n`+
      `路由:\n`+
      `  GET  /                       健康检查\n`+
      `  GET  /app                    H5 应用\n`+
      `  POST /v1/chat/completions    AI 代理\n`+
      `  GET  /tts?text=...&voice=... 火山 TTS (Seed-TTS 2.0)\n`
    );
  }

  if(req.method==='POST' && pathname==='/v1/chat/completions') return proxyChat(req,res);
  if(pathname==='/tts' && (req.method==='GET'||req.method==='POST')) return handleTTS(req,res);

  // ---------- 错题库 API ----------
  if(pathname.startsWith('/api/wrongbook') && db){
    const u=new URL(req.url,'http://x');
    const user=u.searchParams.get('user')||'default';
    if(req.method==='GET' && pathname==='/api/wrongbook'){
      const rows=db.prepare('SELECT * FROM wrong_questions WHERE user=? ORDER BY created_at DESC').all(user);
      const out=rows.map(r=>({id:r.id,q:r.q,type:r.type,options:r.options?JSON.parse(r.options):null,
        answer:r.answer,userAnswer:r.user_answer,hints:r.hints?JSON.parse(r.hints):null,
        explain:r.explain_text,topic:r.topic,source:r.source,date:r.created_at,
        needsImage:!!r.needs_image,imageDesc:r.image_desc}));
      res.writeHead(200,{...CORS,'Content-Type':'application/json; charset=utf-8'});
      return res.end(JSON.stringify(out));
    }
    if(req.method==='POST' && pathname==='/api/wrongbook'){
      return readBody(req).then(buf=>{
        const j=JSON.parse(buf.toString('utf-8'));
        const existing=db.prepare('SELECT id FROM wrong_questions WHERE user=? AND q=?').get(user,j.q);
        if(existing){res.writeHead(200,{...CORS,'Content-Type':'application/json'});return res.end('{"ok":true,"msg":"already exists"}')}
        db.prepare(`INSERT INTO wrong_questions(user,q,type,options,answer,user_answer,hints,explain_text,topic,source,needs_image,image_desc)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run(user,j.q,j.type,j.options?JSON.stringify(j.options):null,
          j.answer,j.userAnswer,j.hints?JSON.stringify(j.hints):null,j.explain||'',j.topic||'',j.source||'',j.needsImage?1:0,j.imageDesc||'');
        res.writeHead(200,{...CORS,'Content-Type':'application/json'});res.end('{"ok":true}');
      }).catch(e=>{res.writeHead(400,{...CORS,'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}))});
    }
    if(req.method==='DELETE' && pathname.startsWith('/api/wrongbook/')){
      const id=parseInt(pathname.split('/').pop());
      if(id){db.prepare('DELETE FROM wrong_questions WHERE id=? AND user=?').run(id,user)}
      res.writeHead(200,{...CORS,'Content-Type':'application/json'});return res.end('{"ok":true}');
    }
    if(req.method==='DELETE' && pathname==='/api/wrongbook'){
      db.prepare('DELETE FROM wrong_questions WHERE user=?').run(user);
      res.writeHead(200,{...CORS,'Content-Type':'application/json'});return res.end('{"ok":true}');
    }
  }

  if(req.method==='GET' && (pathname==='/app' || pathname==='/app/' || pathname==='/app/index.html')){
    return serveStatic(req,res,'index.html');
  }
  if(req.method==='GET' && pathname.startsWith('/static/')){
    return serveStatic(req,res,pathname.slice('/static/'.length));
  }

  res.writeHead(404,{...CORS,'Content-Type':'text/plain; charset=utf-8'});
  res.end('404\n可用路由：GET /、GET /app、POST /v1/chat/completions、GET /tts、/api/wrongbook\n');
});

server.listen(PORT,BIND,()=>{
  console.log('════════════════════════════════════════════');
  console.log('  🎓 小学生作业辅导 · 本地服务');
  console.log('  监听 : '+BIND+':'+PORT);
  console.log('  上游 : '+UPSTREAM);
  console.log('  静态 : '+STATIC_DIR);
  if(VOLC_APPID){
    const ridInfo = VOLC_RESOURCE_ID
      ? `强制 ${VOLC_RESOURCE_ID}`
      : RID_DEFAULT;
    console.log('  TTS  : ✅ 火山 豆包语音合成 2.0 · '+ridInfo);
  } else {
    console.log('  TTS  : ⚠️  未配置');
  }
  console.log('');
  console.log('  H5 入口（同机）   : http://localhost:'+PORT+'/app');
  console.log('  H5 入口（局域网） : http://<本机IP>:'+PORT+'/app');
  console.log('════════════════════════════════════════════');
});
