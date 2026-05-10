'use strict';

const crypto = require('node:crypto');

const LVS = [1, 2, 3];
const SLOTS_PER_CELL = 5;
const SUBJECT_LABELS = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  science: '科学',
};

function topicId(topic) {
  return crypto.createHash('sha1').update(String(topic)).digest('hex').slice(0, 10);
}

function variants({ db }) {
  const rows = db.prepare(`
    SELECT grade, subject, semester, topic, knowledge_points
    FROM curriculum
    ORDER BY grade, subject, semester, topic
  `).all();

  const out = [];
  for (const r of rows) {
    for (const lv of LVS) {
      for (let slot = 1; slot <= SLOTS_PER_CELL; slot++) {
        out.push({
          key: `generic-g${r.grade}-${r.subject}-${r.semester}-${topicId(r.topic)}-lv${lv}-s${slot}`,
          grade: r.grade,
          subject: r.subject,
          semester: r.semester,
          topic: r.topic,
          knowledgePoints: safeJSON(r.knowledge_points, [r.topic]),
          lv,
          description: `${r.grade}年级${SUBJECT_LABELS[r.subject] || r.subject}${r.topic} lv${lv} 通用练习模板 ${slot}`,
        });
      }
    }
  }
  return out;
}

function safeJSON(text, fallback) {
  try { return JSON.parse(text); } catch (_) { return fallback; }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[randInt(0, items.length - 1)];
}

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function choiceOptions(answer, distractors) {
  const opts = [];
  for (const x of [answer, ...distractors]) {
    const s = String(x);
    if (s && !opts.includes(s)) opts.push(s);
  }
  let bump = 1;
  while (opts.length < 4) {
    const n = Number(answer);
    opts.push(Number.isFinite(n) ? String(n + bump) : `${answer}${bump}`);
    bump++;
  }
  return shuffle(opts.slice(0, 4));
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function humanizeQuestionText(topic, text) {
  const topicPrefix = escapeRegExp(topic || '');
  return String(text || '')
    .replace(new RegExp(`^${topicPrefix}(?:基础|进阶|挑战)?练习\\s*\\d+\\s*[：:]\\s*`), '')
    .replace(new RegExp(`^${topicPrefix}\\s+practice\\s*\\d+\\s*:\\s*`, 'i'), '')
    .replace(/（第\d+组）$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeQuestion(base, payload) {
  return {
    type: 'choice',
    options: choiceOptions(payload.answer, payload.distractors || []),
    hints: payload.hints || ['先找题目关键词', '排除明显不符合的选项', '再核对答案'],
    explain: payload.explain || `这道题练习的是“${base.topic}”。`,
    topic: base.topic,
    knowledgePoints: base.knowledgePoints,
    semester: base.semester,
    grade: base.grade,
    subject: base.subject,
    lv: base.lv,
    source: 'generated',
    q: humanizeQuestionText(base.topic, payload.q),
    answer: String(payload.answer),
  };
}

function mathQuestion(base, i) {
  const topic = base.topic;
  const grade = base.grade;
  const lv = base.lv;
  const names = ['小明', '小红', '乐乐', '安安', '朵朵', '晨晨'];
  const units = ['本书', '盒彩笔', '朵花', '张贴纸', '个积木', '米彩带'];
  const max = Math.max(10, grade * 20 + lv * 30);

  if (/分数|小数/.test(topic)) {
    const den = pick([4, 5, 6, 8, 10, 12]);
    const a = randInt(1, den - 2);
    const b = randInt(1, den - a - 1);
    const answer = `${a + b}/${den}`;
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${a}/${den} + ${b}/${den} = ?`,
      answer,
      distractors: [`${Math.abs(a - b)}/${den}`, `${a + b}/${den + 1}`, `${a + b + 1}/${den}`],
      hints: ['同分母分数相加，分母不变', '只把分子相加', `${a}+${b}=${a + b}`],
      explain: `同分母分数相加，${a}/${den}+${b}/${den}=${answer}。`,
    });
  }

  if (/百分|折扣|利率/.test(topic)) {
    const total = randInt(40, 200);
    const pct = pick([10, 20, 25, 30, 40, 50, 60, 75]);
    const answer = total * pct / 100;
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${total} 的 ${pct}% 是多少？`,
      answer,
      distractors: [answer + 5, Math.max(1, answer - 5), total - answer],
      hints: ['百分数先写成除以 100', `${pct}%=${pct}/100`, '用总数乘百分率'],
      explain: `${total}×${pct}%=${answer}。`,
    });
  }

  if (/面积|周长|图形|圆|圆柱|圆锥|体积|表面积/.test(topic)) {
    if (grade <= 2 && /图形/.test(topic) && !/面积|周长/.test(topic)) {
      const templates = [
        ['长方形通常有几条边？', '4条', ['3条', '5条', '6条']],
        ['正方形的四条边有什么特点？', '一样长', ['都不相等', '只有两条边', '没有角']],
        ['下面哪种图形没有角？', '圆形', ['三角形', '正方形', '长方形']],
      ];
      const [stem, answer, distractors] = pick(templates);
      return makeQuestion(base, {
        q: `${topic}练习 ${i + 1}：${stem}`,
        answer,
        distractors,
        hints: ['先回忆图形的边和角', '看清题目问的是哪种图形', '把选项逐个排除'],
        explain: `这道题考查常见平面图形的特征。`,
      });
    }
    const a = randInt(3, 12 + grade);
    const b = randInt(2, 10 + grade);
    const answer = /周长/.test(topic) ? 2 * (a + b) : a * b;
    const q = /周长/.test(topic)
      ? `${topic}练习 ${i + 1}：长方形长 ${a} 厘米、宽 ${b} 厘米，周长是多少厘米？`
      : `${topic}练习 ${i + 1}：长方形长 ${a} 厘米、宽 ${b} 厘米，面积是多少平方厘米？`;
    return makeQuestion(base, {
      q,
      answer,
      distractors: [a + b, answer + a, Math.max(1, answer - b)],
      hints: ['先判断要求周长还是面积', '周长看边长一圈，面积看铺满多少方格', '代入公式计算'],
      explain: /周长/.test(topic) ? `周长=(长+宽)×2=${answer}。` : `面积=长×宽=${answer}。`,
    });
  }

  if (/乘法|口诀|倍/.test(topic)) {
    const a = randInt(2, Math.min(12, 4 + grade + lv * 2));
    const b = randInt(2, Math.min(12, 5 + grade + lv * 2));
    const answer = a * b;
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${a} × ${b} = ?`,
      answer,
      distractors: [answer + a, answer - b, a + b],
      hints: ['把乘法看成几个相同加数相加', '回忆乘法口诀', `${a}×${b}=${answer}`],
      explain: `${a} 个 ${b} 相加是 ${answer}。`,
    });
  }

  if (/除法|平均/.test(topic)) {
    const b = randInt(2, Math.min(12, 5 + grade + lv));
    const answer = randInt(2, Math.min(12, 5 + grade + lv));
    const a = b * answer;
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：把 ${a} 个物品平均分成 ${b} 份，每份几个？`,
      answer,
      distractors: [answer + 1, Math.max(1, answer - 1), b],
      hints: ['平均分用除法', `列式 ${a}÷${b}`, '用乘法口诀验算'],
      explain: `${a}÷${b}=${answer}。`,
    });
  }

  if (/方程|比例|比/.test(topic) && grade >= 5) {
    const x = randInt(3, 18);
    const k = randInt(2, 9);
    const b = randInt(5, 30);
    const total = k * x + b;
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：如果 ${k}x + ${b} = ${total}，x = ?`,
      answer: x,
      distractors: [x + 1, Math.max(1, x - 1), k + b],
      hints: ['先把等式两边同时减去常数', '再除以 x 前面的系数', '代回原式检查'],
      explain: `${total}-${b}=${k * x}，${k * x}÷${k}=${x}。`,
    });
  }

  if (/人民币|元|角|分/.test(topic)) {
    const yuan = randInt(1, 9);
    const jiao = randInt(1, 9);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${yuan} 元 ${jiao} 角一共是多少角？`,
      answer: yuan * 10 + jiao,
      distractors: [yuan + jiao, yuan * 10, yuan * 10 + jiao + 1],
      hints: ['1 元等于 10 角', '先把元换成角', '再加上原来的角'],
      explain: `${yuan} 元是 ${yuan * 10} 角，再加 ${jiao} 角，一共 ${yuan * 10 + jiao} 角。`,
    });
  }

  if (/位置|方向|上下|左右|前后/.test(topic)) {
    const templates = [
      ['小猫在小狗的左边，那么小狗在小猫的哪边？', '右边', ['左边', '上面', '下面']],
      ['排队时，小明前面有 2 人，后面有 3 人，这一队一共有几人？', '6人', ['5人', '4人', '3人']],
      ['看地图时，上面通常表示哪个方向？', '北', ['南', '东', '西']],
    ];
    const [stem, answer, distractors] = pick(templates);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${stem}`,
      answer,
      distractors,
      hints: ['先确定参照物', '分清左和右、前和后', '把自己代入位置想一想'],
      explain: `位置题要先找参照物，再判断方向或顺序。`,
    });
  }

  if (/钟表|时间|时刻/.test(topic)) {
    const hour = randInt(1, 11);
    const later = pick([1, 2, 3]);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：现在是 ${hour} 时，过 ${later} 小时是几时？`,
      answer: `${hour + later}时`,
      distractors: [`${hour}时`, `${Math.max(1, hour - later)}时`, `${hour + later + 1}时`],
      hints: ['过几小时就是往后数几格', '从现在的时刻开始数', '注意不要把现在这一格算进去'],
      explain: `${hour} 时过 ${later} 小时是 ${hour + later} 时。`,
    });
  }

  if (/分类|统计|整理/.test(topic)) {
    const apples = randInt(2, 6);
    const bananas = randInt(2, 6);
    const answer = apples === bananas ? '一样多' : (apples > bananas ? '苹果' : '香蕉');
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：苹果有 ${apples} 个，香蕉有 ${bananas} 个，哪种水果更多？`,
      answer,
      distractors: ['苹果', '香蕉', '一样多', '看不出来'].filter(x => x !== answer),
      hints: ['先看每一类有几个', '比较两个数的大小', '数量大的那一类更多'],
      explain: `${apples} 和 ${bananas} 比较，${apples === bananas ? '一样多' : (apples > bananas ? '苹果更多' : '香蕉更多')}。`,
    });
  }

  if (/认识|数位|读数|写数|比较大小|顺序|11-20|各数/.test(topic)) {
    const tens = randInt(1, Math.min(9, Math.max(1, grade + 1)));
    const ones = randInt(0, 9);
    const num = tens * 10 + ones;
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${num} 里面有几个十和几个一？`,
      answer: `${tens}个十${ones}个一`,
      distractors: [`${ones}个十${tens}个一`, `${tens + 1}个十${ones}个一`, `${tens}个十${Math.max(0, ones - 1)}个一`],
      hints: ['十位上的数表示几个十', '个位上的数表示几个一', '先看十位，再看个位'],
      explain: `${num} 的十位是 ${tens}，个位是 ${ones}。`,
    });
  }

  if (lv === 1) {
    const a = randInt(1, Math.min(max, 50));
    const b = randInt(1, Math.min(max, 50));
    const answer = a + b;
    return makeQuestion(base, {
      q: `${topic}基础练习 ${i + 1}：${a} + ${b} = ?`,
      answer,
      distractors: [answer + 1, answer - 1, answer + 10],
      hints: ['先算个位', '再算十位', '检查有没有进位'],
      explain: `${a}+${b}=${answer}。`,
    });
  }

  if (lv === 2) {
    const a = randInt(20, max + 40);
    const b = randInt(10, max);
    const c = randInt(5, Math.min(60, a + b - 1));
    const answer = a + b - c;
    return makeQuestion(base, {
      q: `${topic}进阶练习 ${i + 1}：${a} + ${b} - ${c} = ?`,
      answer,
      distractors: [a + b, Math.max(0, answer - 5), answer + 5],
      hints: ['按从左到右的顺序计算', '先算加法，再算减法', '最后检查结果是否合理'],
      explain: `${a}+${b}=${a + b}，再减 ${c} 得 ${answer}。`,
    });
  }

  const name = pick(names);
  const unit = pick(units);
  const bought = randInt(20, max + 50);
  const used = randInt(5, Math.floor(bought / 2));
  const more = randInt(6, 40);
  const answer = bought - used + more;
  return makeQuestion(base, {
    q: `${topic}挑战练习 ${i + 1}：${name}原有 ${bought}${unit}，用去 ${used}${unit} 后又买来 ${more}${unit}，现在有多少${unit}？`,
    answer,
    distractors: [bought - used, bought + more, answer + used],
    hints: ['先算用去后剩下多少', '再把新买来的加上', '分两步列式'],
    explain: `${bought}-${used}+${more}=${answer}。`,
  });
}

const chinesePairs = {
  antonym: [['高', '低'], ['快', '慢'], ['冷', '热'], ['明亮', '昏暗'], ['认真', '马虎'], ['勇敢', '胆小']],
  synonym: [['美丽', '漂亮'], ['著名', '有名'], ['格外', '特别'], ['马上', '立刻'], ['认真', '仔细'], ['喜爱', '喜欢']],
  measure: [['一', '本', '书'], ['一', '朵', '花'], ['一', '条', '鱼'], ['一', '片', '叶子'], ['一', '座', '桥'], ['一', '阵', '风']],
  pinyin: [['山', 'shan'], ['水', 'shui'], ['月', 'yue'], ['鸟', 'niao'], ['花', 'hua'], ['学', 'xue']],
};

function chineseQuestion(base, i) {
  const topic = base.topic;
  if (/拼音/.test(topic)) {
    const [word, answer] = pick(chinesePairs.pinyin);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：“${word}”的拼音是哪一个？`,
      answer,
      distractors: ['shi', 'yun', 'hao', 'ming'],
      hints: ['先读准声母', '再看韵母', '最后检查声调或拼写'],
      explain: `“${word}”读作 ${answer}。`,
    });
  }
  if (/反义词/.test(topic)) {
    const [word, answer] = pick(chinesePairs.antonym);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：“${word}”的反义词是？`,
      answer,
      distractors: ['快乐', '清楚', '整齐', '安静'],
      hints: ['反义词意思相反', '把选项放回句子里读一读', '排除意思相近的词'],
      explain: `“${word}”和“${answer}”意思相反。`,
    });
  }
  if (/近义词/.test(topic)) {
    const [word, answer] = pick(chinesePairs.synonym);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：“${word}”的近义词是？`,
      answer,
      distractors: ['寒冷', '宽阔', '轻轻', '后来'],
      hints: ['近义词意思相近', '联系句子语境判断', '选最贴近的词'],
      explain: `“${word}”和“${answer}”意思相近。`,
    });
  }
  if (/量词/.test(topic)) {
    const [prefix, answer, noun] = pick(chinesePairs.measure);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：选择合适的量词：${prefix}（ ）${noun}`,
      answer,
      distractors: ['只', '把', '块', '辆'],
      hints: ['先看后面的名词', '想一想平时怎么搭配', '读一遍是否顺口'],
      explain: `常说“${prefix}${answer}${noun}”。`,
    });
  }
  if (/修辞|句子|阅读|作文|写作|标点|病句/.test(topic)) {
    const templates = base.grade <= 2
      ? [
          ['“弯弯的月亮像小船。”这句话把月亮比作什么？', '小船', ['太阳', '星星', '白云']],
          ['“今天真热啊！”句末应该用什么标点？', '感叹号', ['句号', '逗号', '问号']],
          ['读短句时，先要把每个字怎样？', '读清楚', ['跳过去', '只看标点', '乱猜']],
        ]
      : [
          ['“弯弯的月亮像小船。”使用了什么修辞手法？', '比喻', ['拟人', '排比', '夸张']],
          ['“春天来了，小草探出了头。”使用了什么修辞手法？', '拟人', ['比喻', '反问', '设问']],
          ['“今天真热啊！”句末应使用什么标点？', '感叹号', ['句号', '逗号', '问号']],
          ['阅读短文时，概括段意首先要抓住什么？', '中心句和关键词', ['标点数量', '字写得是否工整', '生字笔画']],
        ];
    const [stem, answer, distractors] = pick(templates);
    return makeQuestion(base, {
      q: `${topic}练习 ${i + 1}：${stem}`,
      answer,
      distractors,
      hints: ['先读完整句子', '找关键词', '联系学过的方法判断'],
      explain: `这类题要抓住“${topic}”的判断依据。`,
    });
  }
  const words = [['清晨', '早晨'], ['伙伴', '朋友'], ['保护', '爱护'], ['希望', '盼望']];
  const [word, answer] = pick(words);
  return makeQuestion(base, {
    q: `${topic}练习 ${i + 1}：给“${word}”选择最合适的解释或相近表达。`,
    answer,
    distractors: ['忽然', '宽广', '困难', '整洁'],
    hints: ['先理解词语意思', '联系生活中的用法', '选意思最接近的一项'],
    explain: `“${word}”在这里可理解为“${answer}”。`,
  });
}

function englishQuestion(base, i) {
  const topic = base.topic;
  const vocab = [['apple', '苹果'], ['teacher', '老师'], ['library', '图书馆'], ['weather', '天气'], ['breakfast', '早餐'], ['hospital', '医院']];
  if (/过去/.test(topic)) {
    return makeQuestion(base, {
      q: `${topic} practice ${i + 1}: 请选择 "go" 的过去式。`,
      answer: 'went',
      distractors: ['goed', 'goes', 'going'],
      hints: ['先判断时态', 'go 的过去式是不规则变化', 'went 表示过去去过'],
      explain: 'The past tense of "go" is "went".',
    });
  }
  if (/将来/.test(topic)) {
    return makeQuestion(base, {
      q: `${topic} practice ${i + 1}: 句子 "I ___ visit my grandparents tomorrow." 空格应填什么？`,
      answer: 'will',
      distractors: ['was', 'did', 'am'],
      hints: ['tomorrow 表示将来', '一般将来时常用 will', '把选项代入读一读'],
      explain: 'Tomorrow points to the future, so use "will".',
    });
  }
  if (/完成/.test(topic)) {
    return makeQuestion(base, {
      q: `${topic} practice ${i + 1}: 句子 "She has ___ her homework." 空格应填什么？`,
      answer: 'finished',
      distractors: ['finish', 'finishes', 'finishing'],
      hints: ['has 后常接过去分词', 'finish 的过去分词是 finished', '注意现在完成时结构'],
      explain: 'Present perfect uses has/have + past participle.',
    });
  }
  if (/比较|最高/.test(topic)) {
    return makeQuestion(base, {
      q: `${topic} practice ${i + 1}: 句子 "This book is the ___ of the three." 空格应填什么？`,
      answer: 'most interesting',
      distractors: ['interesting', 'more interesting', 'interestinger'],
      hints: ['of the three 表示三者比较', '三者或以上常用最高级', '多音节形容词最高级用 most'],
      explain: 'For three or more things, use the superlative form.',
    });
  }
  if (/被动/.test(topic)) {
    return makeQuestion(base, {
      q: `${topic} practice ${i + 1}: 句子 "The window ___ cleaned every week." 空格应填什么？`,
      answer: 'is',
      distractors: ['are', 'am', 'be'],
      hints: ['主语 window 是单数', '被动语态结构是 be + done', '一般现在时单数用 is'],
      explain: 'A singular subject in passive voice takes "is".',
    });
  }
  const [word, answer] = pick(vocab);
  return makeQuestion(base, {
    q: `${topic} practice ${i + 1}: "${word}" 的中文意思是什么？`,
    answer,
    distractors: ['铅笔', '颜色', '运动', '星期'],
    hints: ['先读单词', '回忆同主题词汇', '排除不属于该主题的选项'],
    explain: `"${word}" means “${answer}”.`,
  });
}

function scienceQuestion(base, i) {
  const topic = base.topic;
  const banks = [
    [/植物/, ['植物制造养料主要依靠哪一部分进行光合作用？', '叶', ['根', '花', '果实']]],
    [/动物/, ['鱼能在水中呼吸，主要依靠什么器官？', '鳃', ['肺', '翅膀', '触角']]],
    [/电|能源/, ['干电池能把化学能主要转化为什么能？', '电能', ['声能', '光能', '热能']]],
    [/地球|天文|太阳|月/, ['地球自转一周大约需要多长时间？', '24小时', ['1小时', '7天', '365天']]],
    [/材料/, ['下列哪种材料通常容易导电？', '铜', ['塑料', '橡皮', '木头']]],
    [/实验|测量/, ['做对比实验时，通常应该改变几个条件？', '一个', ['两个', '越多越好', '不用控制']]],
    [/环保|安全/, ['节约用水的正确做法是哪一项？', '及时关紧水龙头', ['一直开着水龙头', '随意倒掉饮用水', '用清水冲走小纸片']]],
  ];
  const found = banks.find(([re]) => re.test(topic));
  const [stem, answer, distractors] = found
    ? found[1]
    : ['进行科学观察时，记录结果应尽量做到什么？', '真实准确', ['随意想象', '只写答案', '不用记录']];
  return makeQuestion(base, {
    q: `${topic}练习 ${i + 1}：${stem}`,
    answer,
    distractors,
    hints: ['先抓住科学概念', '联系实验或生活现象', '选择最符合事实的一项'],
    explain: `这道题考查“${topic}”中的基本科学认识。`,
  });
}

function normalizeBase(opts) {
  const variantMatch = String(opts.generatorKey || '').match(/-s(\d+)$/);
  return {
    grade: opts.grade,
    subject: opts.subject,
    semester: opts.semester || 'upper',
    topic: opts.topic || '综合练习',
    knowledgePoints: Array.isArray(opts.knowledgePoints) ? opts.knowledgePoints : [opts.topic || '综合练习'],
    lv: opts.lv || 2,
    variant: variantMatch ? Number(variantMatch[1]) : 1,
  };
}

function generate(n, ctx = {}) {
  const base = normalizeBase(ctx.opts || {});
  const out = [];
  for (let i = 0; i < n; i++) {
    if (base.subject === 'math') out.push(mathQuestion(base, i));
    else if (base.subject === 'chinese') out.push(chineseQuestion(base, i));
    else if (base.subject === 'english') out.push(englishQuestion(base, i));
    else if (base.subject === 'science') out.push(scienceQuestion(base, i));
    else out.push(chineseQuestion(base, i));
  }
  return out;
}

module.exports = {
  variants,
  generate,
};
