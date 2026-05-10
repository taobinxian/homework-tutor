// 三年级题库（人教版）
for(let i=0;i<6;i++){const a=rand(100,400),b=rand(2,9),s=a*b;
  QB[3].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['先算百位再算十位个位','注意进位',a+'×'+b+'='+s],explain:'两三位数乘一位数',topic:'乘法',lv:1});}
for(let i=0;i<6;i++){const a=rand(100,800),b=rand(2,9),s=Math.floor(a/b),r=a-s*b;
  QB[3].math.push({q:a+' ÷ '+b+' = ?'+(r>0?'...?':''),type:'input',answer:r>0?s+'...'+r:String(s),hints:['从高位除起','注意余数',a+'÷'+b+'='+(r>0?s+'...'+r:s)],explain:'除法从高位除起',topic:'除法',lv:1});}
QB[3].math.push(
  {q:'长方形长8cm宽5cm周长？',type:'input',answer:'26',hints:['周长=(长+宽)×2','(8+5)×2','26cm'],explain:'长方形周长=(长+宽)×2',topic:'周长',lv:1},
  {q:'正方形边长6cm周长？',type:'input',answer:'24',hints:['正方形4条边一样','6×4','24cm'],explain:'正方形周长=边长×4',topic:'周长',lv:1},
  {q:'1/4表示什么？',type:'choice',options:shuffle(['把整体分4份取1份','把整体分1份取4份','4个1','1个4']),answer:'把整体分4份取1份',hints:['分母是4','分子是1','4份取1份'],explain:'分数=把整体平均分取几份',topic:'分数初步',lv:2},
  {q:'3/8和5/8谁大？',type:'choice',options:shuffle(['3/8','5/8','一样大','不确定']),answer:'5/8',hints:['分母相同比分子','5>3','5/8大'],explain:'同分母分数分子大的大',topic:'分数初步',lv:2},
  {q:'长方形长6cm宽4cm面积？',type:'input',answer:'24',hints:['面积=长×宽','6×4','24平方厘米'],explain:'长方形面积=长×宽',topic:'面积',lv:2},
  {q:'正方形边长5cm面积？',type:'input',answer:'25',hints:['面积=边长×边长','5×5','25平方厘米'],explain:'正方形面积=边长²',topic:'面积',lv:2},
  {q:'平年全年有几天？',type:'choice',options:shuffle(['365天','366天','360天','364天']),answer:'365天',hints:['平年2月28天','365天','365天'],explain:'平年365天闰年366天',topic:'年月日',lv:2},
  {q:'哪些月是大月(31天)？',type:'choice',options:shuffle(['1,3,5,7,8,10,12','1,2,3,4,5,6,7','2,4,6,8,10,12','1,3,5,7,9,11']),answer:'1,3,5,7,8,10,12',hints:['一三五七八十腊','31天的月份','1,3,5,7,8,10,12'],explain:'大月口诀一三五七八十腊',topic:'年月日',lv:2},
  {q:'0.5和0.8谁大？',type:'choice',options:shuffle(['0.5','0.8','一样大','不确定']),answer:'0.8',hints:['比小数看十分位','8>5','0.8大'],explain:'一位小数比较大小',topic:'小数初步',lv:2},
  {q:'300-128=?',type:'input',answer:'172',hints:['三位数减法注意退位','个位0-8不够减向十位借','300-128=172'],explain:'减法退位',topic:'万以内加减法',lv:3},
  {q:'456+278=?',type:'input',answer:'734',hints:['个位相加6+8=14进1','十位5+7+1=13进1','456+278=734'],explain:'三位数加法注意连续进位',topic:'万以内加减法',lv:3},
  {q:'3个小朋友每2人握一次手共握几次？',type:'choice',options:shuffle(['2次','3次','4次','6次']),answer:'3次',hints:['AB AC BC','排列组合','3次'],explain:'搭配问题',topic:'搭配问题',lv:3},
  {q:'学校买6箱苹果每箱24个共几个？',type:'input',answer:'144',hints:['24×6','先算20×6=120再算4×6=24','120+24=144'],explain:'两位数乘一位数',topic:'应用题',lv:3},
  {q:'一个正方形边长5cm周长是面积的几倍？',type:'choice',options:shuffle(['不能比','和单位有关','20÷25不到1倍','4÷5']),answer:'和单位有关',hints:['周长20cm面积25平方厘米','单位不同不能直接比','和单位有关'],explain:'周长和面积单位不同不能直接比较',topic:'周长与面积',lv:3}
);
QB[3].chinese.push(
  {q:'"守株待兔"的意思是？',type:'choice',options:shuffle(['不劳而获心存侥幸','保护树木','和兔子做朋友','在树下休息']),answer:'不劳而获心存侥幸',hints:['守着树桩等兔子','不愿劳动','不劳而获'],explain:'守株待兔比喻不劳而获',topic:'成语',lv:1},
  {q:'"画龙点睛"比喻什么？',type:'choice',options:shuffle(['在关键处加精彩之笔','画画技术好','龙的眼睛很美','做事很仔细']),answer:'在关键处加精彩之笔',hints:['画龙最后点眼睛','关键的一笔','在关键处加精彩之笔'],explain:'画龙点睛比喻在关键处加精彩使整体生动',topic:'成语',lv:1},
  {q:'"因为下雨____我没去上学"填关联词',type:'choice',options:shuffle(['所以','但是','而且','如果']),answer:'所以',hints:['因为...所以...','因果关系','所以'],explain:'因为...所以...表因果',topic:'关联词',lv:2},
  {q:'"虽然很累____他坚持跑完"填关联词',type:'choice',options:shuffle(['所以','但是','因为','而且']),answer:'但是',hints:['虽然...但是...','转折关系','但是'],explain:'虽然...但是...表转折',topic:'关联词',lv:2},
  {q:'"弯弯的月亮像小船"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'比喻',hints:['月亮像小船','用像字比较','比喻'],explain:'比喻用像把A比作B',topic:'修辞',lv:2},
  {q:'"停车坐爱枫林晚"出自哪首诗？',type:'choice',options:shuffle(['山行','望天门山','饮湖上','夜书所见']),answer:'山行',hints:['杜牧','霜叶红于二月花','山行'],explain:'杜牧《山行》',topic:'古诗',lv:2},
  {q:'"两岸青山相对出"出自？',type:'choice',options:shuffle(['望天门山','山行','饮湖上','绝句']),answer:'望天门山',hints:['李白','天门中断楚江开','望天门山'],explain:'李白《望天门山》',topic:'古诗',lv:2},
  {q:'"我的书包很重很重"有什么问题？',type:'choice',options:shuffle(['语序不当','用词重复','缺少主语','没有问题']),answer:'用词重复',hints:['很重说一次就够','重复了','用词重复'],explain:'修改病句去掉重复',topic:'修改病句',lv:3}
);
QB[3].english.push(
  {q:'"I _____ a student."填？',type:'choice',options:shuffle(['is','am','are','be']),answer:'am',hints:['I搭配am','不是is/are','am'],explain:'I am/You are/He is',topic:'be动词',lv:1},
  {q:'Monday是星期几？',type:'choice',options:shuffle(['星期一','星期二','星期日','星期六']),answer:'星期一',hints:['Mon=一','Monday','星期一'],explain:'Monday=星期一',topic:'星期',lv:1},
  {q:'"She _____ swim."她会游泳填？',type:'choice',options:shuffle(['can','is','are','do']),answer:'can',hints:['会=can','She can','can'],explain:'can+动词原形=会...',topic:'can句型',lv:2},
  {q:'"_____ is your name?"你叫什么名字',type:'choice',options:shuffle(['What','Where','Who','How']),answer:'What',hints:['问什么','What is...','What'],explain:'What问事物',topic:'疑问句',lv:2},
  {q:'"I like _____."我喜欢游泳',type:'choice',options:shuffle(['swim','swimming','swims','to swim']),answer:'swimming',hints:['like后面加ing','like+doing','swimming'],explain:'like+doing=喜欢做...',topic:'like句型',lv:2},
  {q:'The book is _____ the desk.书在桌子上',type:'choice',options:shuffle(['in','on','under','behind']),answer:'on',hints:['在上面','on=在...上','on'],explain:'on=在...上面',topic:'介词',lv:3},
  {q:'"Where is the cat?"问什么？',type:'choice',options:shuffle(['猫在哪里','猫是什么','谁是猫','猫怎么样']),answer:'猫在哪里',hints:['Where=哪里','问地点','猫在哪里'],explain:'Where问地点',topic:'疑问句',lv:3}
);
QB[3].science.push(
  {q:'植物吸收水分的部分是？',type:'choice',options:shuffle(['根','茎','叶','花']),answer:'根',hints:['在土里的','根吸水','根'],explain:'根吸收水分和矿物质',topic:'植物',lv:1},
  {q:'蚕的一生经历？',type:'choice',options:shuffle(['卵→幼虫→蛹→成虫','卵→蛹→幼虫→成虫','幼虫→卵→蛹→成虫','卵→幼虫→成虫']),answer:'卵→幼虫→蛹→成虫',hints:['从卵孵化','先幼虫再结茧','卵→幼虫→蛹→成虫'],explain:'完全变态发育',topic:'动物',lv:1},
  {q:'水在什么温度结冰？',type:'choice',options:shuffle(['100℃','0℃','37℃','-10℃']),answer:'0℃',hints:['水变冰的温度','冰点','0℃'],explain:'冰点0℃沸点100℃',topic:'物质',lv:2},
  {q:'磁铁能吸引什么？',type:'choice',options:shuffle(['木块','铁钉','塑料尺','橡皮']),answer:'铁钉',hints:['磁铁吸铁','铁制品','铁钉'],explain:'磁铁吸引铁钴镍',topic:'磁铁',lv:2},
  {q:'空气有重量吗？',type:'choice',options:shuffle(['没有','有','不确定','只有热空气有']),answer:'有',hints:['空气是物质','物质有重量','有'],explain:'空气有重量可用天平测量',topic:'空气',lv:3}
);
// 补充更多题目
for(let i=0;i<8;i++){const a=rand(10,90),b=rand(10,99-a),s=a+b;QB[3].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意进位',a+'+'+b+'='+s],explain:'加法练习',topic:'加减法',lv:1});}
for(let i=0;i<8;i++){const a=rand(30,99),b=rand(10,a-5),s=a-b;QB[3].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意退位',a+'-'+b+'='+s],explain:'减法练习',topic:'加减法',lv:1});}
// === 三年级补充 ===
for(let i=0;i<6;i++){const a=rand(100,500),b=rand(100,999-a),s=a+b;QB[3].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意进位',a+'+'+b+'='+s],explain:'三位数加法',topic:'万以内加减法',lv:1});}
for(let i=0;i<6;i++){const a=rand(300,999),b=rand(100,a-50),s=a-b;QB[3].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意退位',a+'-'+b+'='+s],explain:'三位数减法',topic:'万以内加减法',lv:1});}
for(let i=0;i<6;i++){const a=rand(10,50),b=rand(2,9),s=a*b;QB[3].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['先算十位再算个位','注意进位',a+'×'+b+'='+s],explain:'两位数乘一位数',topic:'乘法',lv:1});}
QB[3].math.push(
  {q:'2/5+1/5=?',type:'choice',options:shuffle(['3/5','3/10','2/10','1/5']),answer:'3/5',hints:['同分母直接加','2+1=3','3/5'],explain:'同分母加法',topic:'分数初步',lv:2},
  {q:'4/7-2/7=?',type:'choice',options:shuffle(['2/7','2/14','6/7','2/0']),answer:'2/7',hints:['同分母直接减','4-2=2','2/7'],explain:'同分母减法',topic:'分数初步',lv:2},
  {q:'0.3+0.5=?',type:'input',answer:'0.8',hints:['3+5=8','一位小数','0.8'],explain:'一位小数加法',topic:'小数初步',lv:2},
  {q:'1.2-0.7=?',type:'input',answer:'0.5',hints:['12-7=5','一位小数','0.5'],explain:'一位小数减法',topic:'小数初步',lv:2},
  {q:'2月有28天的是什么年？',type:'choice',options:shuffle(['平年','闰年','大年','小年']),answer:'平年',hints:['平年2月28天','闰年29天','平年'],explain:'平年28天闰年29天',topic:'年月日',lv:2},
  {q:'一年有几个月？',type:'choice',options:shuffle(['10个','11个','12个','13个']),answer:'12个',hints:['一年12个月','12个','12'],explain:'一年12个月',topic:'年月日',lv:2},
  {q:'1平方米=?平方分米',type:'choice',options:shuffle(['10','100','1000','10000']),answer:'100',hints:['1米=10分米','10×10=100','100'],explain:'面积单位换算',topic:'面积',lv:3},
  {q:'东的对面是？',type:'choice',options:shuffle(['西','南','北','东南']),answer:'西',hints:['东西相对','南北相对','西'],explain:'方向对应',topic:'位置与方向',lv:1},
  {q:'面向北左手边是？',type:'choice',options:shuffle(['东','西','南','北']),answer:'西',hints:['上北下南左西右东','左手边','西'],explain:'左西右东',topic:'位置与方向',lv:2},
  {q:'24×3+24×7用简便方法？',type:'input',answer:'240',hints:['24×(3+7)','24×10','240'],explain:'乘法分配律',topic:'混合运算',lv:3},
  {q:'小明买3本笔记本每本8元和1支钢笔15元共花几元？',type:'input',answer:'39',hints:['3×8=24','24+15=39','39元'],explain:'先乘后加',topic:'应用题',lv:3}
);
QB[3].chinese.push(
  {q:'"亡羊补牢"的意思？',type:'choice',options:shuffle(['出了问题及时补救','丢了羊去修羊圈','养羊的方法','忘记了羊']),answer:'出了问题及时补救',hints:['亡=丢失','补牢=修补','及时补救'],explain:'亡羊补牢比喻出了问题及时补救',topic:'成语',lv:1},
  {q:'"掩耳盗铃"比喻？',type:'choice',options:shuffle(['自欺欺人','偷东西','保护耳朵','听铃声']),answer:'自欺欺人',hints:['捂住耳朵偷铃铛','以为别人听不到','自欺欺人'],explain:'自欺欺人',topic:'成语',lv:1},
  {q:'"揠苗助长"的教训是？',type:'choice',options:shuffle(['不能急于求成','要努力拔苗','苗长得快','帮助别人']),answer:'不能急于求成',hints:['拔苗苗反而死了','违反规律','不能急于求成'],explain:'遵循客观规律',topic:'成语',lv:1},
  {q:'"狐假虎威"中狐狸借的是谁的威风？',type:'choice',options:shuffle(['老虎','狮子','大象','狼']),answer:'老虎',hints:['狐狸假借老虎','虎威','老虎'],explain:'狐假虎威借势吓人',topic:'成语',lv:1},
  {q:'"不但...而且..."表示？',type:'choice',options:shuffle(['递进','转折','因果','条件']),answer:'递进',hints:['不但A而且B','B比A更进一步','递进'],explain:'不但而且表递进',topic:'关联词',lv:2},
  {q:'"如果明天下雨____我就不去了"填？',type:'choice',options:shuffle(['所以','但是','就','而且']),answer:'就',hints:['如果...就...','假设关系','就'],explain:'如果就表假设',topic:'关联词',lv:2},
  {q:'"花儿笑了"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','反问']),answer:'拟人',hints:['花能笑吗','当作人来写','拟人'],explain:'赋予物人的动作',topic:'修辞',lv:2},
  {q:'"飞流直下三千尺"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'夸张',hints:['三千尺夸大了','实际没那么长','夸张'],explain:'夸张扩大或缩小',topic:'修辞',lv:2},
  {q:'"霜叶红于二月花"出自？',type:'choice',options:shuffle(['山行','望天门山','饮湖上','绝句']),answer:'山行',hints:['杜牧','停车坐爱枫林晚','山行'],explain:'杜牧《山行》',topic:'古诗',lv:2},
  {q:'"独在异乡为异客"下一句？',type:'choice',options:shuffle(['每逢佳节倍思亲','遥知兄弟登高处','遍插茱萸少一人','举头望明月']),answer:'每逢佳节倍思亲',hints:['王维','思念亲人','每逢佳节倍思亲'],explain:'王维《九月九日忆山东兄弟》',topic:'古诗',lv:2},
  {q:'"我们要学习认真"这句话的毛病？',type:'choice',options:shuffle(['语序不当','搭配不当','用词重复','缺少成分']),answer:'语序不当',hints:['认真应在前面','认真地学习','语序不当'],explain:'修改：认真地学习',topic:'修改病句',lv:3},
  {q:'缩句"美丽的小鸟在高高的树上唱歌"？',type:'choice',options:shuffle(['小鸟唱歌','小鸟在树上','美丽的小鸟唱歌','鸟唱歌在树上']),answer:'小鸟唱歌',hints:['去掉修饰语','谁做什么','小鸟唱歌'],explain:'缩句保留主干',topic:'缩句',lv:3},
  {q:'扩句"花开了"？',type:'choice',options:shuffle(['美丽的花儿悄悄地开了','花','开了花','花开了吗']),answer:'美丽的花儿悄悄地开了',hints:['加修饰语','什么样的花怎样地开了','美丽的花儿悄悄地开了'],explain:'扩句加修饰成分',topic:'扩句',lv:3}
);
QB[3].english.push(
  {q:'"She _____ a teacher."她是老师',type:'choice',options:shuffle(['am','is','are','be']),answer:'is',hints:['She用is','第三人称单数','is'],explain:'She/He/It+is',topic:'be动词',lv:1},
  {q:'"We _____ students."我们是学生',type:'choice',options:shuffle(['am','is','are','be']),answer:'are',hints:['We用are','复数','are'],explain:'We/They/You+are',topic:'be动词',lv:1},
  {q:'Tuesday是星期几？',type:'choice',options:shuffle(['星期一','星期二','星期三','星期四']),answer:'星期二',hints:['Tue=二','Tuesday','星期二'],explain:'Tuesday=星期二',topic:'星期',lv:1},
  {q:'Friday是星期几？',type:'choice',options:shuffle(['星期三','星期四','星期五','星期六']),answer:'星期五',hints:['Fri=五','Friday','星期五'],explain:'Friday=星期五',topic:'星期',lv:1},
  {q:'January是几月？',type:'choice',options:shuffle(['一月','二月','三月','四月']),answer:'一月',hints:['Jan=一月','January','一月'],explain:'January=一月',topic:'月份',lv:1},
  {q:'spring是什么季节？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'春天',hints:['s-p-r-i-n-g','花开的季节','春天'],explain:'spring=春天',topic:'季节',lv:1},
  {q:'winter是什么季节？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'冬天',hints:['w-i-n-t-e-r','下雪的季节','冬天'],explain:'winter=冬天',topic:'季节',lv:1},
  {q:'"Can you swim?" "No, I _____."',type:'choice',options:shuffle(["can","can't","am","do"]),answer:"can't",hints:['No否定','不能','can not=cant'],explain:'否定回答No I cant',topic:'can句型',lv:2},
  {q:'"_____ is your teacher?" "Miss Li."',type:'choice',options:shuffle(['What','Where','Who','How']),answer:'Who',hints:['问人用Who','谁是老师','Who'],explain:'Who问人',topic:'疑问句',lv:2},
  {q:'"_____ are you?" "I am ten."',type:'choice',options:shuffle(['What','Where','Who','How old']),answer:'How old',hints:['问年龄','多大了','How old'],explain:'How old问年龄',topic:'疑问句',lv:2},
  {q:'"I like swimming."意思？',type:'choice',options:shuffle(['我喜欢游泳','我在游泳','我会游泳','我去游泳']),answer:'我喜欢游泳',hints:['like+doing','喜欢做','我喜欢游泳'],explain:'like doing喜欢做某事',topic:'like句型',lv:2},
  {q:'The cat is _____ the chair.猫在椅子后面',type:'choice',options:shuffle(['in','on','under','behind']),answer:'behind',hints:['后面','behind=在...后','behind'],explain:'behind=在后面',topic:'介词',lv:3},
  {q:'The ball is _____ the two boxes.球在两个盒子之间',type:'choice',options:shuffle(['in','on','between','under']),answer:'between',hints:['两个之间','between','between'],explain:'between=在两者之间',topic:'介词',lv:3},
  {q:'"How much is it?" "It is 5 yuan." 问什么？',type:'choice',options:shuffle(['多少钱','多少个','在哪里','什么颜色']),answer:'多少钱',hints:['How much=多少钱','问价格','多少钱'],explain:'How much问价格',topic:'日常对话',lv:3},
  {q:'"Nice to meet you."怎么回答？',type:'choice',options:shuffle(['Nice to meet you too.','Thank you.','Goodbye.','Sorry.']),answer:'Nice to meet you too.',hints:['见到你也很高兴','too=也','Nice to meet you too.'],explain:'Nice to meet you too.',topic:'日常对话',lv:3}
);
QB[3].science.push(
  {q:'植物的哪个部分进行光合作用？',type:'choice',options:shuffle(['根','茎','叶','花']),answer:'叶',hints:['叶子是绿色的','叶绿体','叶'],explain:'叶进行光合作用制造养分',topic:'植物',lv:1},
  {q:'蝴蝶属于什么类动物？',type:'choice',options:shuffle(['昆虫','鸟类','鱼类','哺乳类']),answer:'昆虫',hints:['有翅膀6条腿','昆虫','昆虫'],explain:'昆虫6条腿3段身体',topic:'动物',lv:1},
  {q:'冰变成水是什么变化？',type:'choice',options:shuffle(['融化','蒸发','凝固','凝结']),answer:'融化',hints:['固体变液体','冰变水','融化'],explain:'固→液=融化',topic:'水的三态',lv:2},
  {q:'水变成水蒸气是什么变化？',type:'choice',options:shuffle(['融化','蒸发','凝固','凝结']),answer:'蒸发',hints:['液体变气体','水变水蒸气','蒸发'],explain:'液→气=蒸发',topic:'水的三态',lv:2},
  {q:'磁铁同极相互怎样？',type:'choice',options:shuffle(['吸引','排斥','无关','融合']),answer:'排斥',hints:['同极相斥','N和N排斥','排斥'],explain:'同极相斥异极相吸',topic:'磁铁',lv:2},
  {q:'土壤中的腐殖质来自？',type:'choice',options:shuffle(['动植物残体','石头','水','空气']),answer:'动植物残体',hints:['落叶腐烂','动植物遗体','动植物残体'],explain:'腐殖质来自动植物分解',topic:'土壤',lv:3},
  {q:'空气受热会怎样？',type:'choice',options:shuffle(['上升','下降','不动','变重']),answer:'上升',hints:['热空气轻','上升','上升'],explain:'热空气上升冷空气下降',topic:'空气',lv:3}
);
// === 三年级补充各科至30+ ===
for(let i=0;i<8;i++){const a=rand(2,9),b=rand(2,9),s=a*b;QB[3].math.push({q:s+' ÷ '+a+' = ?',type:'input',answer:String(b),hints:[a+'×?='+s,'想口诀',String(b)],explain:'除法',topic:'除法',lv:1});}
QB[3].math.push(
  {q:'正方形边长7cm周长？',type:'input',answer:'28',hints:['7×4','28cm','28'],explain:'正方形周长=边长×4',topic:'周长',lv:1},
  {q:'长方形长10cm宽6cm周长？',type:'input',answer:'32',hints:['(10+6)×2','32cm','32'],explain:'长方形周长=(长+宽)×2',topic:'周长',lv:1},
  {q:'正方形边长4cm面积？',type:'input',answer:'16',hints:['4×4','16平方厘米','16'],explain:'正方形面积=边长²',topic:'面积',lv:2},
  {q:'长方形长9cm宽3cm面积？',type:'input',answer:'27',hints:['9×3','27平方厘米','27'],explain:'长方形面积=长×宽',topic:'面积',lv:2},
  {q:'1平方分米=?平方厘米',type:'input',answer:'100',hints:['1分米=10厘米','10×10=100','100'],explain:'面积单位换算',topic:'面积',lv:3},
  {q:'5月有几天？',type:'choice',options:shuffle(['28天','29天','30天','31天']),answer:'31天',hints:['5月是大月','31天','31天'],explain:'1,3,5,7,8,10,12是大月31天',topic:'年月日',lv:2},
  {q:'6月有几天？',type:'choice',options:shuffle(['28天','29天','30天','31天']),answer:'30天',hints:['6月是小月','30天','30天'],explain:'4,6,9,11是小月30天',topic:'年月日',lv:2},
  {q:'2024年是平年还是闰年？',type:'choice',options:shuffle(['平年','闰年']),answer:'闰年',hints:['能被4整除','2024÷4=506','闰年'],explain:'能被4整除(百年被400)是闰年',topic:'年月日',lv:3},
  {q:'1.5+2.3=?',type:'input',answer:'3.8',hints:['15+23=38','一位小数','3.8'],explain:'小数加法',topic:'小数初步',lv:2},
  {q:'3.6-1.4=?',type:'input',answer:'2.2',hints:['36-14=22','一位小数','2.2'],explain:'小数减法',topic:'小数初步',lv:2}
);
QB[3].chinese.push(
  {q:'"刻舟求剑"说明什么？',type:'choice',options:shuffle(['事物在变化不能死板','刻船很难','找剑的方法','游泳的故事']),answer:'事物在变化不能死板',hints:['船在动剑没动','死板的人','事物在变化不能死板'],explain:'比喻死板不知变通',topic:'成语',lv:1},
  {q:'"叶公好龙"比喻什么？',type:'choice',options:shuffle(['口是心非表里不一','喜欢龙','龙的故事','画龙的技术']),answer:'口是心非表里不一',hints:['叶公说喜欢龙但见到真龙害怕','表面喜欢实际害怕','口是心非'],explain:'表面爱好实际害怕',topic:'成语',lv:1},
  {q:'"坐井观天"比喻什么？',type:'choice',options:shuffle(['眼界狭小','坐在井里','看天空','井很深']),answer:'眼界狭小',hints:['青蛙在井里','只看到一小块天','眼界狭小'],explain:'比喻眼界狭小见识有限',topic:'成语',lv:1},
  {q:'"杯弓蛇影"比喻什么？',type:'choice',options:shuffle(['疑神疑鬼自相惊扰','杯子里有蛇','弓像蛇','喝酒的故事']),answer:'疑神疑鬼自相惊扰',hints:['把弓的影子当成蛇','自己吓自己','疑神疑鬼'],explain:'比喻疑神疑鬼',topic:'成语',lv:1},
  {q:'"不但...而且..."造句正确的是？',type:'choice',options:shuffle(['他不但学习好而且品德好','不但他学习而且好','他不但而且学习好','好不但学习而且他']),answer:'他不但学习好而且品德好',hints:['递进关系','A而且B更进一步','他不但学习好而且品德好'],explain:'不但而且递进',topic:'关联词',lv:2},
  {q:'"如果...就..."表示什么关系？',type:'choice',options:shuffle(['假设','因果','转折','递进']),answer:'假设',hints:['如果A就B','假设条件','假设'],explain:'如果就表假设',topic:'关联词',lv:2},
  {q:'"水光潋滟晴方好"出自？',type:'choice',options:shuffle(['饮湖上初晴后雨','望天门山','山行','夜书所见']),answer:'饮湖上初晴后雨',hints:['苏轼','西湖','饮湖上初晴后雨'],explain:'苏轼写西湖',topic:'古诗',lv:2},
  {q:'"荷尽已无擎雨盖"出自？',type:'choice',options:shuffle(['赠刘景文','山行','望天门山','夜书所见']),answer:'赠刘景文',hints:['苏轼','秋天的景色','赠刘景文'],explain:'苏轼《赠刘景文》',topic:'古诗',lv:2},
  {q:'"萧萧梧叶送寒声"出自？',type:'choice',options:shuffle(['夜书所见','山行','望天门山','饮湖上']),answer:'夜书所见',hints:['叶绍翁','秋天夜晚','夜书所见'],explain:'叶绍翁《夜书所见》',topic:'古诗',lv:2},
  {q:'"他的成绩有了明显的进步和提高"有什么问题？',type:'choice',options:shuffle(['语义重复','搭配不当','语序不对','没有问题']),answer:'语义重复',hints:['进步和提高意思一样','重复了','语义重复'],explain:'去掉重复的词',topic:'修改病句',lv:3},
  {q:'"经过努力使他的成绩提高了"有什么问题？',type:'choice',options:shuffle(['缺少主语','搭配不当','语义重复','语序不对']),answer:'缺少主语',hints:['谁经过努力','缺主语','缺少主语'],explain:'去掉经过或使',topic:'修改病句',lv:3},
  {q:'缩句"可爱的小鸟在蓝蓝的天空中快乐地飞翔"？',type:'choice',options:shuffle(['小鸟飞翔','小鸟在天空中','可爱的小鸟飞','鸟飞翔在天空']),answer:'小鸟飞翔',hints:['去修饰语','谁做什么','小鸟飞翔'],explain:'保留主干',topic:'缩句',lv:3}
);
QB[3].english.push(
  {q:'"They _____ happy."他们很开心',type:'choice',options:shuffle(['am','is','are','be']),answer:'are',hints:['They复数','are','are'],explain:'They+are',topic:'be动词',lv:1},
  {q:'Wednesday是星期几？',type:'choice',options:shuffle(['星期二','星期三','星期四','星期五']),answer:'星期三',hints:['Wed=三','Wednesday','星期三'],explain:'Wednesday=星期三',topic:'星期',lv:1},
  {q:'Saturday是星期几？',type:'choice',options:shuffle(['星期五','星期六','星期日','星期一']),answer:'星期六',hints:['Sat=六','Saturday','星期六'],explain:'Saturday=星期六',topic:'星期',lv:1},
  {q:'Sunday是星期几？',type:'choice',options:shuffle(['星期五','星期六','星期日','星期一']),answer:'星期日',hints:['Sun=日','Sunday','星期日'],explain:'Sunday=星期日',topic:'星期',lv:1},
  {q:'March是几月？',type:'choice',options:shuffle(['一月','二月','三月','四月']),answer:'三月',hints:['Mar=三月','March','三月'],explain:'March=三月',topic:'月份',lv:1},
  {q:'summer是什么季节？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'夏天',hints:['s-u-m-m-e-r','最热的','夏天'],explain:'summer=夏天',topic:'季节',lv:1},
  {q:'autumn是什么季节？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'秋天',hints:['a-u-t-u-m-n','落叶的','秋天'],explain:'autumn/fall=秋天',topic:'季节',lv:1},
  {q:'"_____ you like apples?"你喜欢苹果吗',type:'choice',options:shuffle(['Do','Does','Is','Are']),answer:'Do',hints:['you用Do','一般疑问','Do'],explain:'Do you like...?',topic:'疑问句',lv:2},
  {q:'"_____ does she live?"她住哪里',type:'choice',options:shuffle(['What','Where','Who','How']),answer:'Where',hints:['问地点','住在哪','Where'],explain:'Where问地点',topic:'疑问句',lv:2},
  {q:'"I want _____ some apples."我想要买一些苹果',type:'choice',options:shuffle(['some','any','a','an']),answer:'some',hints:['肯定句用some','想要一些','some'],explain:'肯定句用some',topic:'some/any',lv:3},
  {q:'"Do you have _____ milk?"你有牛奶吗',type:'choice',options:shuffle(['some','any','a','an']),answer:'any',hints:['疑问句用any','有没有','any'],explain:'疑问句否定句用any',topic:'some/any',lv:3},
  {q:'"Excuse me, where is the library?"怎么回答？',type:'choice',options:shuffle(["It's next to the park.","I'm fine.",'Thank you.','My name is Tom.']),answer:"It's next to the park.",hints:['问地点','回答在哪里',"It's next to..."],explain:'回答地点',topic:'日常对话',lv:3}
);
QB[3].science.push(
  {q:'植物种子发芽需要什么？',type:'choice',options:shuffle(['水分温度空气','只要水','只要阳光','只要土壤']),answer:'水分温度空气',hints:['三个条件','缺一不可','水分温度空气'],explain:'种子发芽三要素',topic:'植物',lv:1},
  {q:'鲸鱼是鱼吗？',type:'choice',options:shuffle(['是','不是它是哺乳动物','是因为它在水里','是因为它叫鲸鱼']),answer:'不是它是哺乳动物',hints:['鲸鱼用肺呼吸','胎生哺乳','哺乳动物'],explain:'鲸鱼是哺乳动物不是鱼',topic:'动物',lv:2},
  {q:'水蒸气遇冷变成小水珠叫什么？',type:'choice',options:shuffle(['蒸发','凝结','融化','凝固']),answer:'凝结',hints:['气→液','变成水珠','凝结'],explain:'气→液=凝结',topic:'水的三态',lv:2},
  {q:'指南针的N极指向哪个方向？',type:'choice',options:shuffle(['北','南','东','西']),answer:'北',hints:['N=North=北','指向北方','北'],explain:'N极指北S极指南',topic:'磁铁',lv:3},
  {q:'哪种土壤渗水最快？',type:'choice',options:shuffle(['沙质土','黏质土','壤土','岩石']),answer:'沙质土',hints:['沙子颗粒大','缝隙大','沙质土'],explain:'沙质土渗水快保水差',topic:'土壤',lv:3}
);
// === 补充3年级各科lv2/lv3 ===
QB[3].math.push(
  {q:'2/3和3/5哪个大？',type:'choice',options:shuffle(['2/3','3/5','一样大','不确定']),answer:'2/3',hints:['通分比较','10/15和9/15','2/3大'],explain:'异分母通分比较',topic:'分数初步',lv:2},
  {q:'1-3/7=?',type:'choice',options:shuffle(['4/7','3/7','7/3','1/7']),answer:'4/7',hints:['1=7/7','7/7-3/7','4/7'],explain:'1减分数',topic:'分数初步',lv:2},
  {q:'长方形面积48平方厘米长8cm宽？',type:'input',answer:'6',hints:['面积÷长=宽','48÷8','6cm'],explain:'反向求宽',topic:'面积',lv:3},
  {q:'小明8:10出发走了25分钟到学校几时几分到？',type:'choice',options:shuffle(['8:35','8:25','8:50','9:10']),answer:'8:35',hints:['10+25=35','8时35分','8:35'],explain:'时间推算',topic:'年月日',lv:3},
  {q:'480÷6=?',type:'input',answer:'80',hints:['48÷6=8','加个0','80'],explain:'整十整百除法',topic:'除法',lv:2},
  {q:'125×8=?',type:'input',answer:'1000',hints:['常用算式','125×8=1000','1000'],explain:'记住125×8=1000',topic:'乘法',lv:2}
);
QB[3].chinese.push(
  {q:'"对牛弹琴"比喻什么？',type:'choice',options:shuffle(['对不懂的人讲道理白费力气','牛喜欢音乐','弹琴很好听','牛很聪明']),answer:'对不懂的人讲道理白费力气',hints:['牛听不懂琴','白费力气','对不懂的人讲道理白费力气'],explain:'比喻白费力气',topic:'成语',lv:1},
  {q:'"自相矛盾"比喻？',type:'choice',options:shuffle(['自己的言行前后不一致','矛和盾很厉害','武器很多','打仗的故事']),answer:'自己的言行前后不一致',hints:['矛能刺穿一切盾能挡一切','自相矛盾','言行不一致'],explain:'比喻言行矛盾',topic:'成语',lv:1},
  {q:'"两个黄鹂鸣翠柳"下一句？',type:'choice',options:shuffle(['一行白鹭上青天','窗含西岭千秋雪','门泊东吴万里船','绝句杜甫']),answer:'一行白鹭上青天',hints:['杜甫绝句','鸟飞天上','一行白鹭上青天'],explain:'杜甫《绝句》',topic:'古诗',lv:2},
  {q:'"窗含西岭千秋雪"下一句？',type:'choice',options:shuffle(['门泊东吴万里船','一行白鹭上青天','两个黄鹂鸣翠柳','遥知兄弟登高处']),answer:'门泊东吴万里船',hints:['杜甫绝句','窗外看到的','门泊东吴万里船'],explain:'杜甫《绝句》',topic:'古诗',lv:2},
  {q:'"全班同学基本上都到齐了"有什么问题？',type:'choice',options:shuffle(['语义矛盾','搭配不当','语序不对','缺少主语']),answer:'语义矛盾',hints:['基本上和都矛盾','去掉一个','语义矛盾'],explain:'基本上=不全都=全不能共存',topic:'修改病句',lv:3},
  {q:'"春天像小姑娘花枝招展地笑着走着"用了？',type:'choice',options:shuffle(['拟人和比喻','只有比喻','只有拟人','夸张']),answer:'拟人和比喻',hints:['像=比喻','笑着走着=拟人','两种都有'],explain:'可以同时使用多种修辞',topic:'修辞',lv:3}
);
QB[3].english.push(
  {q:'October是几月？',type:'choice',options:shuffle(['八月','九月','十月','十一月']),answer:'十月',hints:['Oct=十月','October','十月'],explain:'October=十月',topic:'月份',lv:1},
  {q:'December是几月？',type:'choice',options:shuffle(['十月','十一月','十二月','一月']),answer:'十二月',hints:['Dec=十二月','December','十二月'],explain:'December=十二月',topic:'月份',lv:1},
  {q:'"He can _____ English."他会说英语',type:'choice',options:shuffle(['speak','speaks','speaking','spoke']),answer:'speak',hints:['can后动词原形','can speak','speak'],explain:'can+动词原形',topic:'can句型',lv:2},
  {q:'"_____ can I get to the park?"怎么去公园',type:'choice',options:shuffle(['What','Where','Who','How']),answer:'How',hints:['问方式','怎么去','How'],explain:'How问方式',topic:'疑问句',lv:2},
  {q:'near是什么意思？',type:'choice',options:shuffle(['近的/在附近','远的','上面','下面']),answer:'近的/在附近',hints:['n-e-a-r','附近','近的/在附近'],explain:'near=在附近',topic:'介词',lv:3},
  {q:'"Thank you very much."回答？',type:'choice',options:shuffle(["You're welcome.",'Hello.','Goodbye.','Sorry.']),answer:"You're welcome.",hints:['不客气','回应感谢',"You're welcome."],explain:"You're welcome=不客气",topic:'日常对话',lv:3}
);
QB[3].science.push(
  {q:'种子发芽后最先长出什么？',type:'choice',options:shuffle(['根','茎','叶','花']),answer:'根',hints:['先向下扎根','根先出来','根'],explain:'种子先长根再长茎叶',topic:'植物',lv:1},
  {q:'昆虫的身体分几部分？',type:'choice',options:shuffle(['2部分','3部分','4部分','5部分']),answer:'3部分',hints:['头胸腹','三部分','3部分'],explain:'昆虫=头+胸+腹3部分6条腿',topic:'动物',lv:1},
  {q:'磁铁哪部分磁力最强？',type:'choice',options:shuffle(['两端(磁极)','中间','哪都一样','不确定']),answer:'两端(磁极)',hints:['两端磁力最强','中间最弱','两端(磁极)'],explain:'磁极在两端磁力最强',topic:'磁铁',lv:2},
  {q:'不锈钢勺放热水里勺柄变热属于？',type:'choice',options:shuffle(['热传导','热对流','热辐射','化学变化']),answer:'热传导',hints:['热通过固体传递','传导','热传导'],explain:'固体传热=热传导',topic:'空气',lv:3}
);
