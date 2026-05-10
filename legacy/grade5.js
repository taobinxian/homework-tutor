// 五年级题库（人教版）
QB[5].math.push(
  {q:'0.25×4=?',type:'input',answer:'1',hints:['0.25就是1/4','1/4×4=1','1'],explain:'0.25=1/4',topic:'小数乘法',lv:1},
  {q:'1.2×0.5=?',type:'input',answer:'0.6',hints:['12×5=60','两位小数','0.6'],explain:'小数乘法数小数位数',topic:'小数乘法',lv:1},
  {q:'7.2÷0.8=?',type:'input',answer:'9',hints:['同时×10变72÷8','72÷8=9','9'],explain:'除数变整数再除',topic:'小数除法',lv:1},
  {q:'12和18的最大公因数？',type:'input',answer:'6',hints:['12的因数1,2,3,4,6,12','18的因数1,2,3,6,9,18','公共最大是6'],explain:'列因数找最大公共',topic:'因数与倍数',lv:2},
  {q:'1/2+1/3=?',type:'choice',options:shuffle(['2/5','2/6','5/6','1/6']),answer:'5/6',hints:['先通分','1/2=3/6 1/3=2/6','3/6+2/6=5/6'],explain:'异分母分数先通分再加',topic:'分数加法',lv:2},
  {q:'正方体棱长3cm体积？',type:'input',answer:'27',hints:['体积=棱长³','3×3×3','27立方厘米'],explain:'正方体体积=a³',topic:'体积',lv:2},
  {q:'甲数60乙数是甲的3/4乙数？',type:'input',answer:'45',hints:['一个数的3/4=这个数×3/4','60×3/4','60÷4×3=45'],explain:'一个数的几分之几用乘法',topic:'分数乘法',lv:2},
  {q:'解方程3x+5=20',type:'input',answer:'5',hints:['3x=20-5','3x=15','x=15÷3=5'],explain:'解方程移项变号除系数',topic:'方程',lv:3},
  {q:'解方程2x-8=12',type:'input',answer:'10',hints:['2x=12+8','2x=20','x=10'],explain:'移项再除',topic:'方程',lv:3},
  {q:'长方体长5宽4高3体积？',type:'input',answer:'60',hints:['体积=长×宽×高','5×4×3','60'],explain:'长方体体积=长×宽×高',topic:'体积',lv:3},
  {q:'袋子里3红球2白球摸到红球概率？',type:'choice',options:shuffle(['3/5','2/5','1/2','3/2']),answer:'3/5',hints:['共5个球','红球3个','3/5'],explain:'概率=有利数÷总数',topic:'可能性',lv:3}
);
QB[5].chinese.push(
  {q:'"春蚕到死丝方尽"赞美？',type:'choice',options:shuffle(['勤劳节俭','无私奉献','勇敢无畏','廉洁自律']),answer:'无私奉献',hints:['春蚕吐丝蜡烛燃烧','给予他人','无私奉献'],explain:'李商隐以蚕烛喻奉献者',topic:'古诗',lv:1},
  {q:'"不论风雨多大他都坚持跑步"是什么复句？',type:'choice',options:shuffle(['因果','并列','条件','转折']),answer:'条件',hints:['不论...都...','无论什么条件结果一样','条件'],explain:'不论...都...条件关系',topic:'关联词',lv:2},
  {q:'"即使遇到困难____不能放弃"填？',type:'choice',options:shuffle(['也','就','才','还']),answer:'也',hints:['即使...也...','让步关系','也'],explain:'即使...也...表让步',topic:'关联词',lv:2},
  {q:'"泊船瓜洲"作者？',type:'choice',options:shuffle(['王安石','苏轼','李白','杜甫']),answer:'王安石',hints:['春风又绿江南岸','王安石','王安石'],explain:'王安石《泊船瓜洲》',topic:'古诗',lv:2},
  {q:'下面哪句有语病？',type:'choice',options:shuffle(['我们要改正缺点','我们要改正优点','我们要发扬优点','他认真完成作业']),answer:'我们要改正优点',hints:['优点能改正吗','优点应该发扬','改正优点有语病'],explain:'搭配不当优点不能改正',topic:'修改病句',lv:3},
  {q:'"文章用了首尾呼应"是什么写作方法？',type:'choice',options:shuffle(['首尾呼应','借景抒情','以小见大','欲扬先抑']),answer:'首尾呼应',hints:['开头结尾相呼应','前后照应','首尾呼应'],explain:'首尾呼应使文章结构完整',topic:'写作方法',lv:3}
);
QB[5].english.push(
  {q:'"I _____ to school yesterday."昨天去学校',type:'choice',options:shuffle(['go','went','goes','going']),answer:'went',hints:['yesterday=昨天','过去时','went'],explain:'一般过去时go→went',topic:'过去时',lv:1},
  {q:'tall的比较级？',type:'choice',options:shuffle(['taller','tallest','more tall','tallst']),answer:'taller',hints:['短词加er','tall→taller','taller'],explain:'短形容词+er',topic:'比较级',lv:2},
  {q:'good的最高级？',type:'choice',options:shuffle(['gooder','goodest','better','best']),answer:'best',hints:['不规则','good-better-best','best'],explain:'good的三级不规则',topic:'最高级',lv:2},
  {q:'"There _____ a cat here before."以前这有只猫',type:'choice',options:shuffle(['is','was','are','were']),answer:'was',hints:['before=以前','过去时','was'],explain:'过去时There was/were',topic:'there was',lv:2},
  {q:'"You _____ wash your hands."你必须洗手',type:'choice',options:shuffle(['must','can','may','will']),answer:'must',hints:['必须=must','must wash','must'],explain:'must=必须',topic:'情态动词',lv:3},
  {q:'"She _____ speak English."她能说英语',type:'choice',options:shuffle(['can','must','should','will']),answer:'can',hints:['能=can','can speak','can'],explain:'can=能够',topic:'情态动词',lv:3}
);
QB[5].science.push(
  {q:'地球自转一周多长时间？',type:'choice',options:shuffle(['1小时','1天','1个月','1年']),answer:'1天',hints:['自转产生昼夜','24小时','1天'],explain:'自转周期约24小时',topic:'地球运动',lv:1},
  {q:'铁生锈是什么变化？',type:'choice',options:shuffle(['物理变化','化学变化','不是变化','机械变化']),answer:'化学变化',hints:['产生了新物质','锈是新物质','化学变化'],explain:'产生新物质=化学变化',topic:'物质变化',lv:2},
  {q:'人体最大的器官？',type:'choice',options:shuffle(['心脏','肝脏','皮肤','大脑']),answer:'皮肤',hints:['覆盖全身','面积最大','皮肤'],explain:'皮肤是最大器官',topic:'人体',lv:2},
  {q:'杠杆省力条件？',type:'choice',options:shuffle(['动力臂>阻力臂','动力臂<阻力臂','动力臂=阻力臂','与力臂无关']),answer:'动力臂>阻力臂',hints:['撬棍原理','支点离重物近','动力臂>阻力臂'],explain:'动力臂越长越省力',topic:'简单机械',lv:3}
);
// 补充更多题目
for(let i=0;i<8;i++){const a=rand(10,90),b=rand(10,99-a),s=a+b;QB[5].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意进位',a+'+'+b+'='+s],explain:'加法练习',topic:'加减法',lv:1});}
for(let i=0;i<8;i++){const a=rand(30,99),b=rand(10,a-5),s=a-b;QB[5].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意退位',a+'-'+b+'='+s],explain:'减法练习',topic:'加减法',lv:1});}
// === 五年级补充 ===
for(let i=0;i<6;i++){const a=rand(10,99);const b=rand(2,9);const s=(a*b/10).toFixed(1);QB[5].math.push({q:(a/10).toFixed(1)+' × '+b+' = ?',type:'input',answer:String(parseFloat(s)),hints:['小数乘法','数小数位数',String(parseFloat(s))],explain:'小数乘法',topic:'小数乘法',lv:1});}
for(let i=0;i<6;i++){const b=rand(2,9),s=rand(10,50),a=s*b;QB[5].math.push({q:a+' ÷ '+b+' = ?',type:'input',answer:String(s),hints:['除法',a+'÷'+b,String(s)],explain:'整数除法',topic:'除法',lv:1});}
QB[5].math.push(
  {q:'24的因数有哪些？',type:'choice',options:shuffle(['1,2,3,4,6,8,12,24','1,2,4,8,24','1,24','2,3,4,6,8,12']),answer:'1,2,3,4,6,8,12,24',hints:['能整除24的数','从1到24逐个试','1,2,3,4,6,8,12,24'],explain:'因数是能整除它的数',topic:'因数与倍数',lv:2},
  {q:'下面哪个是质数？',type:'choice',options:shuffle(['4','9','11','15']),answer:'11',hints:['只有1和自身两个因数','11÷1=11其他除不尽','11'],explain:'质数只有1和自身两个因数',topic:'质数合数',lv:2},
  {q:'12和8的最小公倍数？',type:'input',answer:'24',hints:['12的倍数：12,24,36...','8的倍数：8,16,24...','24'],explain:'最小公倍数',topic:'公倍数',lv:2},
  {q:'3/4-1/4=?',type:'choice',options:shuffle(['2/4','1/2','2/8','1/4']),answer:'2/4',hints:['同分母直接减','3-1=2','2/4=1/2'],explain:'同分母分数减法',topic:'分数加减法',lv:2},
  {q:'1/3+1/6=?',type:'choice',options:shuffle(['2/9','2/6','1/2','1/6']),answer:'1/2',hints:['通分1/3=2/6','2/6+1/6=3/6','3/6=1/2'],explain:'异分母先通分',topic:'分数加减法',lv:2},
  {q:'长方体长4宽3高2表面积？',type:'input',answer:'52',hints:['(4×3+4×2+3×2)×2','(12+8+6)×2','52'],explain:'表面积=2(ab+ac+bc)',topic:'表面积',lv:3},
  {q:'2x+6=20求x',type:'input',answer:'7',hints:['2x=20-6','2x=14','x=7'],explain:'解方程',topic:'方程',lv:3},
  {q:'用字母表示正方形周长C=?',type:'choice',options:shuffle(['4a','2a','a×a','a+4']),answer:'4a',hints:['正方形4条边','每条边a','C=4a'],explain:'用字母表示公式',topic:'字母表示数',lv:3},
  {q:'一项工程甲5天完成乙10天完成合作几天？',type:'choice',options:shuffle(['3天','10/3天','7天','15天']),answer:'10/3天',hints:['甲效率1/5乙1/10','合1/5+1/10=3/10','1÷3/10=10/3'],explain:'工程问题',topic:'应用题',lv:3}
);
QB[5].chinese.push(
  {q:'"欣赏"和"观赏"的区别？',type:'choice',options:shuffle(['欣赏含喜爱观赏侧重看','完全相同','欣赏是看观赏是听','没有区别']),answer:'欣赏含喜爱观赏侧重看',hints:['欣赏带感情','观赏重在观看','欣赏含喜爱'],explain:'近义词辨析注意感情色彩',topic:'词语辨析',lv:1},
  {q:'"果断"是什么词？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'褒义',hints:['果断是好的','干脆利落','褒义'],explain:'果断=褒义武断=贬义',topic:'褒贬义',lv:1},
  {q:'"固执"是什么词？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'贬义',hints:['固执不好','不听劝','贬义'],explain:'坚持=褒义固执=贬义',topic:'褒贬义',lv:1},
  {q:'"只要努力____就能成功"填？',type:'choice',options:shuffle(['就','也','才','还']),answer:'就',hints:['只要...就...','充分条件','就'],explain:'只要就表充分条件',topic:'关联词',lv:2},
  {q:'"无论多难____不放弃"填？',type:'choice',options:shuffle(['都','就','才','还']),answer:'都',hints:['无论...都...','条件关系','都'],explain:'无论都表条件',topic:'关联词',lv:2},
  {q:'"春风又绿江南岸"作者？',type:'choice',options:shuffle(['王安石','苏轼','李白','杜甫']),answer:'王安石',hints:['泊船瓜洲','明月何时照我还','王安石'],explain:'王安石《泊船瓜洲》',topic:'古诗',lv:2},
  {q:'"洛阳城里见秋风"出自？',type:'choice',options:shuffle(['秋思','泊船瓜洲','长相思','静夜思']),answer:'秋思',hints:['张籍','欲作家书意万重','秋思'],explain:'张籍《秋思》',topic:'古诗',lv:2},
  {q:'"我国的人口是世界上最多的国家"有什么问题？',type:'choice',options:shuffle(['搭配不当','语序不对','用词重复','成分残缺']),answer:'搭配不当',hints:['人口是国家？','主宾搭配不对','搭配不当'],explain:'应改为：我国是世界上人口最多的国家',topic:'修改病句',lv:3},
  {q:'"大约有100多人"有什么问题？',type:'choice',options:shuffle(['搭配不当','语义重复','成分残缺','语序不对']),answer:'语义重复',hints:['大约和多重复','去掉一个','语义重复'],explain:'大约=大概不确定多也是不确定重复了',topic:'修改病句',lv:3},
  {q:'说明文中"大约""左右"等词体现了？',type:'choice',options:shuffle(['准确性','生动性','抒情性','趣味性']),answer:'准确性',hints:['留有余地','科学严谨','准确性'],explain:'说明文语言要准确',topic:'说明文',lv:3}
);
QB[5].english.push(
  {q:'"He _____ to school yesterday."',type:'choice',options:shuffle(['walk','walked','walks','walking']),answer:'walked',hints:['yesterday过去时','walk→walked','walked'],explain:'规则动词+ed',topic:'过去时',lv:1},
  {q:'eat的过去式？',type:'choice',options:shuffle(['eated','ate','eaten','eating']),answer:'ate',hints:['不规则','eat→ate','ate'],explain:'eat→ate→eaten',topic:'过去时',lv:1},
  {q:'"I _____ play the piano."我以前不会弹钢琴',type:'choice',options:shuffle(["couldn't","can't","won't","don't"]),answer:"couldn't",hints:['过去时','以前不能','couldnt'],explain:'过去式could/couldnt',topic:'过去时',lv:2},
  {q:'big的比较级？',type:'choice',options:shuffle(['biger','bigger','more big','biggest']),answer:'bigger',hints:['双写g加er','bigger','bigger'],explain:'辅元辅双写加er',topic:'比较级',lv:2},
  {q:'beautiful的比较级？',type:'choice',options:shuffle(['beautifuler','more beautiful','most beautiful','beautifuller']),answer:'more beautiful',hints:['多音节用more','more beautiful','more beautiful'],explain:'多音节more+原级',topic:'比较级',lv:2},
  {q:'"I am _____ to visit Beijing."我打算去北京',type:'choice',options:shuffle(['go','going','went','goes']),answer:'going',hints:['be going to','打算','going'],explain:'be going to将来时',topic:'将来时',lv:2},
  {q:'"You _____ do your homework."你应该做作业',type:'choice',options:shuffle(['should','can','may','will']),answer:'should',hints:['应该=should','建议','should'],explain:'should=应该',topic:'情态动词',lv:3},
  {q:'"He always _____ up early."他总是早起',type:'choice',options:shuffle(['get','gets','got','getting']),answer:'gets',hints:['always一般现在时','He三单','gets'],explain:'频率副词+一般现在时',topic:'频率副词',lv:1},
  {q:'never是什么意思？',type:'choice',options:shuffle(['总是','经常','有时','从不']),answer:'从不',hints:['n-e-v-e-r','从来不','从不'],explain:'频率：always>usually>often>sometimes>never',topic:'频率副词',lv:1}
);
QB[5].science.push(
  {q:'地球公转产生什么？',type:'choice',options:shuffle(['昼夜交替','四季变化','地震','海啸']),answer:'四季变化',hints:['绕太阳转','一年一圈','四季变化'],explain:'公转→四季自转→昼夜',topic:'地球运动',lv:1},
  {q:'光速约为多少？',type:'choice',options:shuffle(['340米/秒','3万千米/秒','30万千米/秒','300万千米/秒']),answer:'30万千米/秒',hints:['光非常快','约30万千米/秒','30万'],explain:'光速≈3×10⁸米/秒',topic:'光',lv:2},
  {q:'铁在什么条件下容易生锈？',type:'choice',options:shuffle(['干燥的空气中','有水和空气时','在真空中','在油中']),answer:'有水和空气时',hints:['铁+水+氧气','潮湿环境','有水和空气时'],explain:'铁生锈需要水和氧气',topic:'物质变化',lv:2},
  {q:'人体的呼吸器官是？',type:'choice',options:shuffle(['心脏','肺','胃','肾']),answer:'肺',hints:['呼吸用的','吸入氧气呼出二氧化碳','肺'],explain:'肺是主要呼吸器官',topic:'人体',lv:2},
  {q:'滑轮有什么用？',type:'choice',options:shuffle(['省力或改变力的方向','发电','照明','发热']),answer:'省力或改变力的方向',hints:['简单机械','定滑轮改变方向动滑轮省力','省力或改变方向'],explain:'定滑轮改变方向动滑轮省力',topic:'简单机械',lv:3},
  {q:'食物链中分解者的作用？',type:'choice',options:shuffle(['分解有机物','制造食物','捕食猎物','光合作用']),answer:'分解有机物',hints:['细菌真菌','把遗体分解','分解有机物'],explain:'分解者把动植物遗体分解为无机物',topic:'生态系统',lv:3}
);
// === 五年级补充 ===
QB[5].math.push(
  {q:'15和20的最大公因数？',type:'input',answer:'5',hints:['15=3×5','20=4×5','公因数5'],explain:'找公因数',topic:'因数与倍数',lv:2},
  {q:'6和9的最小公倍数？',type:'input',answer:'18',hints:['6的倍数6,12,18...','9的倍数9,18...','18'],explain:'最小公倍数',topic:'公倍数',lv:2},
  {q:'2/3×3/4=?',type:'choice',options:shuffle(['1/2','6/12','6/7','2/4']),answer:'1/2',hints:['分子乘分子','分母乘分母','6/12=1/2'],explain:'分数乘法约分',topic:'分数乘法',lv:2},
  {q:'3/5÷3=?',type:'choice',options:shuffle(['1/5','3/15','9/5','3/8']),answer:'1/5',hints:['除以整数=乘以倒数','3/5×1/3','1/5'],explain:'分数除以整数',topic:'分数除法',lv:3},
  {q:'正方体棱长5cm表面积？',type:'input',answer:'150',hints:['每面5×5=25','6个面','25×6=150'],explain:'正方体表面积=6a²',topic:'表面积',lv:3},
  {q:'4x=28求x',type:'input',answer:'7',hints:['x=28÷4','x=7','7'],explain:'解方程',topic:'方程',lv:3},
  {q:'3x-9=18求x',type:'input',answer:'9',hints:['3x=18+9','3x=27','x=9'],explain:'解方程',topic:'方程',lv:3}
);
QB[5].chinese.push(
  {q:'"与其...不如..."表示？',type:'choice',options:shuffle(['选择','因果','条件','转折']),answer:'选择',hints:['选择后者','与其A不如B','选择'],explain:'与其不如表选择',topic:'关联词',lv:2},
  {q:'"不是...而是..."表示？',type:'choice',options:shuffle(['并列','选择','转折','因果']),answer:'并列',hints:['否定前者肯定后者','并列','并列'],explain:'不是而是并列否定选择',topic:'关联词',lv:2},
  {q:'"山外青山楼外楼"出自？',type:'choice',options:shuffle(['题临安邸','泊船瓜洲','秋思','长相思']),answer:'题临安邸',hints:['林升','西湖歌舞几时休','题临安邸'],explain:'林升《题临安邸》',topic:'古诗',lv:2},
  {q:'"死去元知万事空"出自？',type:'choice',options:shuffle(['示儿','题临安邸','泊船瓜洲','秋思']),answer:'示儿',hints:['陆游','但悲不见九州同','示儿'],explain:'陆游《示儿》',topic:'古诗',lv:2},
  {q:'"已是黄昏独自愁"中表达了什么感情？',type:'choice',options:shuffle(['忧愁孤独','开心快乐','愤怒不满','平静安详']),answer:'忧愁孤独',hints:['黄昏独自愁','孤独忧伤','忧愁孤独'],explain:'通过景物表达感情',topic:'诗词鉴赏',lv:3},
  {q:'说明文常用的说明顺序有？',type:'choice',options:shuffle(['时间空间逻辑','只有时间','只有空间','随意']),answer:'时间空间逻辑',hints:['三种顺序','按需选择','时间空间逻辑'],explain:'说明文三种说明顺序',topic:'说明文',lv:3}
);
QB[5].english.push(
  {q:'write的过去式？',type:'choice',options:shuffle(['writed','wrote','written','writing']),answer:'wrote',hints:['不规则','write→wrote','wrote'],explain:'write→wrote→written',topic:'过去时',lv:1},
  {q:'swim的过去式？',type:'choice',options:shuffle(['swimmed','swam','swum','swimming']),answer:'swam',hints:['不规则','swim→swam','swam'],explain:'swim→swam→swum',topic:'过去时',lv:1},
  {q:'long的比较级？',type:'choice',options:shuffle(['longer','more long','longest','longger']),answer:'longer',hints:['短词加er','longer','longer'],explain:'long→longer→longest',topic:'比较级',lv:2},
  {q:'thin的比较级？',type:'choice',options:shuffle(['thiner','thinner','more thin','thinnest']),answer:'thinner',hints:['双写n加er','thinner','thinner'],explain:'辅元辅双写加er',topic:'比较级',lv:2},
  {q:'"He _____ to play basketball."他打算打篮球',type:'choice',options:shuffle(['is going','are going','am going','going']),answer:'is going',hints:['He用is','is going to','is going'],explain:'be going to将来时',topic:'将来时',lv:2},
  {q:'"May I use your pen?"可以用你的笔吗',type:'choice',options:shuffle(["Sure.","No, I can't.","Yes, I am.","Thank you."]),answer:"Sure.",hints:['允许','当然可以','Sure.'],explain:'May I问允许回答Sure/Of course',topic:'情态动词',lv:3}
);
QB[5].science.push(
  {q:'地球自转方向？',type:'choice',options:shuffle(['自西向东','自东向西','自南向北','自北向南']),answer:'自西向东',hints:['逆时针','自西向东','自西向东'],explain:'地球自西向东自转',topic:'地球运动',lv:1},
  {q:'钢铁是导体还是绝缘体？',type:'choice',options:shuffle(['导体','绝缘体','半导体','都不是']),answer:'导体',hints:['金属导电','钢铁是金属','导体'],explain:'金属是导体',topic:'物质',lv:2},
  {q:'热量传递的三种方式？',type:'choice',options:shuffle(['传导对流辐射','只有传导','只有对流','只有辐射']),answer:'传导对流辐射',hints:['三种方式','传导对流辐射','传导对流辐射'],explain:'热传递三方式',topic:'热传递',lv:3}
);
// === 补充5年级 ===
for(let i=0;i<6;i++){const a=(rand(11,99)/10).toFixed(1),b=(rand(11,99)/10).toFixed(1),s=(parseFloat(a)*parseFloat(b)).toFixed(2);QB[5].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(parseFloat(s)),hints:['小数乘法','数小数位数',String(parseFloat(s))],explain:'小数乘法',topic:'小数乘法',lv:1});}
QB[5].math.push(
  {q:'30以内的质数有几个？',type:'choice',options:shuffle(['9个','10个','11个','12个']),answer:'10个',hints:['2,3,5,7,11,13,17,19,23,29','数一数','10个'],explain:'30以内质数',topic:'质数合数',lv:2},
  {q:'24和36的最大公因数？',type:'input',answer:'12',hints:['24=2×2×2×3','36=2×2×3×3','公共=2×2×3=12'],explain:'分解质因数法',topic:'公因数',lv:2},
  {q:'5/8-1/4=?',type:'choice',options:shuffle(['3/8','4/4','1/8','5/4']),answer:'3/8',hints:['1/4=2/8','5/8-2/8','3/8'],explain:'通分后相减',topic:'分数加减法',lv:2},
  {q:'长方体长6宽4高3表面积？',type:'input',answer:'108',hints:['(6×4+6×3+4×3)×2','(24+18+12)×2','108'],explain:'表面积=2(ab+ac+bc)',topic:'表面积',lv:3},
  {q:'一个袋子3红2白1蓝摸到蓝球概率？',type:'choice',options:shuffle(['1/6','1/3','1/2','2/6']),answer:'1/6',hints:['共6个球','蓝球1个','1/6'],explain:'概率=有利÷总',topic:'可能性',lv:3},
  {q:'5x+3=28求x',type:'input',answer:'5',hints:['5x=28-3','5x=25','x=5'],explain:'解方程',topic:'方程',lv:3}
);
QB[5].chinese.push(
  {q:'"武断"是什么词？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'贬义',hints:['武断不好','主观臆断','贬义'],explain:'果断=褒义 武断=贬义',topic:'褒贬义',lv:1},
  {q:'"谦虚"是什么词？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'褒义',hints:['谦虚是好品质','美德','褒义'],explain:'谦虚=褒义',topic:'褒贬义',lv:1},
  {q:'"只有刻苦学习____才能取得好成绩"填？',type:'choice',options:shuffle(['才','就','也','还']),answer:'才',hints:['只有...才...','必要条件','才'],explain:'只有才必要条件',topic:'关联词',lv:2},
  {q:'"九曲黄河万里沙"出自？',type:'choice',options:shuffle(['浪淘沙','泊船瓜洲','秋思','长相思']),answer:'浪淘沙',hints:['刘禹锡','黄河','浪淘沙'],explain:'刘禹锡《浪淘沙》',topic:'古诗',lv:2},
  {q:'"他被评为三好学生"改为把字句？',type:'choice',options:shuffle(['学校把他评为三好学生','他把三好学生评了','三好学生把他评了','评为把他三好学生']),answer:'学校把他评为三好学生',hints:['谁把谁怎么了','学校把他','学校把他评为三好学生'],explain:'被字句改把字句',topic:'把被句',lv:3},
  {q:'"这篇文章的内容和形式都很丰富"有什么问题？',type:'choice',options:shuffle(['搭配不当','语序不对','用词重复','没有问题']),answer:'搭配不当',hints:['形式不能用丰富','形式多样内容丰富','搭配不当'],explain:'内容丰富形式多样',topic:'修改病句',lv:3}
);
QB[5].english.push(
  {q:'run的过去式？',type:'choice',options:shuffle(['runned','ran','run','running']),answer:'ran',hints:['不规则','run→ran','ran'],explain:'run→ran→run',topic:'过去时',lv:1},
  {q:'come的过去式？',type:'choice',options:shuffle(['comed','came','come','coming']),answer:'came',hints:['不规则','come→came','came'],explain:'come→came→come',topic:'过去时',lv:1},
  {q:'short的比较级？',type:'choice',options:shuffle(['shorter','more short','shortest','shortor']),answer:'shorter',hints:['短词加er','shorter','shorter'],explain:'short→shorter',topic:'比较级',lv:2},
  {q:'expensive的比较级？',type:'choice',options:shuffle(['expensiver','more expensive','most expensive','expensiveer']),answer:'more expensive',hints:['多音节用more','more expensive','more expensive'],explain:'多音节more+原级',topic:'比较级',lv:2},
  {q:'"You _____ eat too much candy."你不应该吃太多糖',type:'choice',options:shuffle(["shouldn't","should","must","can"]),answer:"shouldn't",hints:['不应该=shouldnt','建议否定',"shouldn't"],explain:"shouldn't=不应该",topic:'情态动词',lv:3},
  {q:'"_____ I borrow your book?"我可以借你的书吗',type:'choice',options:shuffle(['May','Must','Should','Will']),answer:'May',hints:['请求用May','May I...','May'],explain:'May I请求许可',topic:'情态动词',lv:3}
);
QB[5].science.push(
  {q:'地球是太阳系第几颗行星？',type:'choice',options:shuffle(['第一','第二','第三','第四']),answer:'第三',hints:['水金地','第三颗','第三'],explain:'地球是第三颗行星',topic:'地球运动',lv:1},
  {q:'蜡烛燃烧是什么变化？',type:'choice',options:shuffle(['物理变化','化学变化','不是变化','机械变化']),answer:'化学变化',hints:['燃烧产生新物质','CO2和水','化学变化'],explain:'燃烧=化学变化',topic:'物质变化',lv:2},
  {q:'人的正常体温约多少？',type:'choice',options:shuffle(['35℃','37℃','39℃','40℃']),answer:'37℃',hints:['正常体温','37℃左右','37℃'],explain:'正常体温约37℃',topic:'人体',lv:2},
  {q:'什么叫食物链？',type:'choice',options:shuffle(['生物之间吃与被吃的关系','食物的链子','做饭的顺序','买菜的路线']),answer:'生物之间吃与被吃的关系',hints:['谁吃谁','食物关系','吃与被吃的关系'],explain:'食物链=吃与被吃的链条',topic:'生态系统',lv:3}
);
