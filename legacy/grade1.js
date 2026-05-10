// 一年级题库（人教版）
// --- 数学 ---
for(let i=0;i<10;i++){const a=rand(1,5),b=rand(0,5-a),s=a+b;
  QB[1].math.push({q:a+' + '+b+' = ?',type:'choice',options:shuffle([String(s),String(s+1),String(Math.max(0,s-1)),String(s+2)]),answer:String(s),hints:['数'+a+'再加'+b+'个','用手指数一数',a+'+'+b+'='+s],explain:'加法把两堆合起来',topic:'5以内加法',lv:1});}
for(let i=0;i<8;i++){const a=rand(2,5),b=rand(1,a),s=a-b;
  QB[1].math.push({q:a+' - '+b+' = ?',type:'choice',options:shuffle([String(s),String(s+1),String(Math.max(0,s-1)),String(a)]),answer:String(s),hints:['有'+a+'个拿走'+b+'个','从'+a+'往回数'+b+'步',a+'-'+b+'='+s],explain:'减法拿走一部分',topic:'5以内减法',lv:1});}
QB[1].math.push(
  {q:'8和5谁大？',type:'choice',options:shuffle(['8大','5大','一样大','不知道']),answer:'8大',hints:['数一数谁多','8比5多3','8大'],explain:'比大小看谁多',topic:'比一比',lv:1},
  {q:'3○5填什么？',type:'choice',options:shuffle(['>','<','=','不确定']),answer:'<',hints:['3和5谁大','5比3大','填<'],explain:'小的数在左边用<',topic:'比一比',lv:1},
  {q:'足球像什么形状？',type:'choice',options:shuffle(['球','正方体','长方体','圆柱']),answer:'球',hints:['圆圆的','能滚','球'],explain:'球是圆的立体图形',topic:'认识图形',lv:1},
  {q:'魔方是什么形状？',type:'choice',options:shuffle(['球','正方体','长方体','圆柱']),answer:'正方体',hints:['6面相同','每面正方形','正方体'],explain:'正方体6面相同',topic:'认识图形',lv:1}
);
for(let i=0;i<10;i++){const a=rand(1,9),b=rand(0,9-a),s=a+b;
  QB[1].math.push({q:a+' + '+b+' = ?',type:'choice',options:shuffle([String(s),String(s+1),String(Math.max(0,s-1)),String(Math.min(18,s+2))]),answer:String(s),hints:['先数'+a+'再数'+b+'个','用手指帮忙',a+'+'+b+'='+s],explain:'10以内加法',topic:'10以内加法',lv:2});}
for(let i=0;i<10;i++){const a=rand(3,10),b=rand(1,a),s=a-b;
  QB[1].math.push({q:a+' - '+b+' = ?',type:'choice',options:shuffle([String(s),String(s+1),String(Math.max(0,s-1)),String(a)]),answer:String(s),hints:['有'+a+'个拿走'+b+'个','倒着数'+b+'步',a+'-'+b+'='+s],explain:'10以内减法',topic:'10以内减法',lv:2});}
QB[1].math.push(
  {q:'15里有几个十几个一？',type:'choice',options:shuffle(['1个十5个一','5个十1个一','15个一','10个5个']),answer:'1个十5个一',hints:['十位是1','个位是5','1个十5个一'],explain:'两位数分十位个位',topic:'11-20各数',lv:2},
  {q:'17前面一个数是？',type:'input',answer:'16',hints:['比17小1','17-1','16'],explain:'前面的数减1',topic:'11-20各数',lv:2},
  {q:'20是几个十？',type:'choice',options:shuffle(['1个','2个','10个','20个']),answer:'2个',hints:['20=10+10','2个10','2个十'],explain:'20=2个十',topic:'11-20各数',lv:2},
  {q:'时针指3分针指12几点？',type:'choice',options:shuffle(['3时','12时','3时30分','12时3分']),answer:'3时',hints:['分针指12是整点','时针指3','3时'],explain:'分针指12就是整时',topic:'认识钟表',lv:2},
  {q:'一天有几小时？',type:'choice',options:shuffle(['12','24','60','100']),answer:'24',hints:['时针转2圈','每圈12小时','24小时'],explain:'一天=24小时',topic:'认识钟表',lv:2}
);
for(let i=0;i<10;i++){const a=rand(2,9),b=rand(11-a>2?11-a:2,9),s=a+b;
  QB[1].math.push({q:a+' + '+b+' = ?',type:'choice',options:shuffle([String(s),String(s-1),String(s+1),String(s-2)]),answer:String(s),hints:['凑十法把'+b+'拆开',a+'+'+(10-a)+'=10再加'+(b-(10-a)),a+'+'+b+'='+s],explain:'凑十法先凑10再加',topic:'20以内进位加法',lv:2});}
for(let i=0;i<10;i++){const a=rand(11,18),b=rand(a-9>2?a-9:2,9),s=a-b;
  QB[1].math.push({q:a+' - '+b+' = ?',type:'choice',options:shuffle([String(s),String(s+1),String(Math.max(0,s-1)),String(s+2)]),answer:String(s),hints:['破十法'+a+'拆成10和'+(a-10),'10-'+b+'='+(10-b),a+'-'+b+'='+s],explain:'破十法拆成10减',topic:'20以内退位减法',lv:3});}
QB[1].math.push(
  {q:'56的十位是？',type:'choice',options:shuffle(['5','6','56','50']),answer:'5',hints:['十位在左边','5在十位','5'],explain:'两位数左边是十位',topic:'100以内数',lv:3},
  {q:'4个十3个一组成？',type:'input',answer:'43',hints:['4个十=40','40+3','43'],explain:'十位乘10加个位',topic:'100以内数',lv:3},
  {q:'最大的两位数是？',type:'input',answer:'99',hints:['十位最大9','个位最大9','99'],explain:'最大两位数99',topic:'100以内数',lv:3},
  {q:'1元等于几角？',type:'choice',options:shuffle(['1角','5角','10角','100角']),answer:'10角',hints:['元和角的关系','1元=10角','10角'],explain:'1元=10角',topic:'认识人民币',lv:3},
  {q:'3元5角等于几角？',type:'input',answer:'35',hints:['3元=30角','30+5','35角'],explain:'元转角乘10加角',topic:'认识人民币',lv:3},
  {q:'2,4,6,8,?下一个？',type:'input',answer:'10',hints:['每次加2','8+2','10'],explain:'等差规律',topic:'找规律',lv:3},
  {q:'1,3,5,7,?下一个？',type:'input',answer:'9',hints:['每次加2','7+2','9'],explain:'奇数列',topic:'找规律',lv:3},
  {q:'树上12只鸟飞走5只剩几只？',type:'input',answer:'7',hints:['12-5','减法','7只'],explain:'求剩余用减法',topic:'应用题',lv:3},
  {q:'小明8颗糖小红比他多3颗小红几颗？',type:'input',answer:'11',hints:['比多用加法','8+3','11颗'],explain:'比A多几就加几',topic:'应用题',lv:3},
  {q:'15个苹果吃6个又买4个现在几个？',type:'input',answer:'13',hints:['15-6=9','9+4=13','13个'],explain:'两步计算先减后加',topic:'应用题',lv:3}
);
for(let i=0;i<6;i++){const a=rand(10,50),b=rand(10,40),s=a+b;
  QB[1].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['先算十位再算个位','注意是否进位',a+'+'+b+'='+s],explain:'两位数加法',topic:'100以内加减法',lv:3});}
for(let i=0;i<6;i++){const a=rand(40,90),b=rand(10,a-10),s=a-b;
  QB[1].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['先算十位再算个位','注意是否退位',a+'-'+b+'='+s],explain:'两位数减法',topic:'100以内加减法',lv:3});}
// --- 语文 ---
QB[1].chinese.push(
  {q:'"爸爸"的拼音是？',type:'choice',options:shuffle(['ba ba','bà ba','bà bà','bá ba']),answer:'bà ba',hints:['第一个四声','第二个轻声','bà ba'],explain:'叠词第二字轻声',topic:'拼音',lv:1},
  {q:'下面哪个是声母？',type:'choice',options:shuffle(['b','a','o','e']),answer:'b',hints:['aoe是韵母','b是声母','b'],explain:'声母在前韵母在后',topic:'拼音',lv:1},
  {q:'"大"的反义词？',type:'choice',options:shuffle(['多','小','高','长']),answer:'小',hints:['大的反面','大↔小','小'],explain:'大↔小',topic:'反义词',lv:1},
  {q:'"上"的反义词？',type:'choice',options:shuffle(['下','左','前','后']),answer:'下',hints:['上的反面','上↔下','下'],explain:'上↔下',topic:'反义词',lv:1},
  {q:'"黑"的反义词？',type:'choice',options:shuffle(['红','白','蓝','绿']),answer:'白',hints:['黑的反面','黑↔白','白'],explain:'黑↔白',topic:'反义词',lv:1},
  {q:'一____小狗',type:'choice',options:shuffle(['只','条','个','头']),answer:'只',hints:['小动物用只','一只小狗','只'],explain:'小动物常用只',topic:'量词',lv:2},
  {q:'一____大树',type:'choice',options:shuffle(['棵','只','条','个']),answer:'棵',hints:['树用棵','一棵大树','棵'],explain:'树木用棵',topic:'量词',lv:2},
  {q:'"妈"的偏旁是？',type:'choice',options:shuffle(['女','马','口','日']),answer:'女',hints:['左边是女','女字旁','女'],explain:'妈=女+马',topic:'偏旁部首',lv:2},
  {q:'"床前明月光"下一句？',type:'choice',options:shuffle(['疑是地上霜','举头望明月','低头思故乡','处处闻啼鸟']),answer:'疑是地上霜',hints:['李白静夜思','月光像什么','疑是地上霜'],explain:'李白《静夜思》',topic:'古诗',lv:2},
  {q:'"春眠不觉晓"下一句？',type:'choice',options:shuffle(['处处闻啼鸟','花落知多少','疑是地上霜','举头望明月']),answer:'处处闻啼鸟',hints:['孟浩然春晓','春天早晨','处处闻啼鸟'],explain:'孟浩然《春晓》',topic:'古诗',lv:2},
  {q:'"鹅鹅鹅"下一句？',type:'choice',options:shuffle(['曲项向天歌','白毛浮绿水','红掌拨清波','处处闻啼鸟']),answer:'曲项向天歌',hints:['骆宾王咏鹅','鹅弯着脖子','曲项向天歌'],explain:'骆宾王《咏鹅》',topic:'古诗',lv:2},
  {q:'"小猫吃鱼"改把字句？',type:'choice',options:shuffle(['小猫把鱼吃了','鱼把小猫吃了','鱼被小猫吃了','小猫被鱼吃了']),answer:'小猫把鱼吃了',hints:['谁把什么怎么了','小猫把鱼','小猫把鱼吃了'],explain:'把字句主语+把+宾语+动词',topic:'句子',lv:3},
  {q:'选正确的句子',type:'choice',options:shuffle(['我高兴地跑','我高兴的跑','我高兴得跑','我高兴跑了']),answer:'我高兴地跑',hints:['修饰动词用地','高兴地+跑','我高兴地跑'],explain:'的+名词地+动词得+形容词',topic:'句子',lv:3}
);
// --- 英语 ---
QB[1].english.push(
  {q:'A后面是哪个字母？',type:'choice',options:shuffle(['B','C','D','E']),answer:'B',hints:['A-B-C','A后面','B'],explain:'字母表顺序',topic:'字母',lv:1},
  {q:'红色英语是？',type:'choice',options:shuffle(['red','blue','green','yellow']),answer:'red',hints:['r-e-d','红色','red'],explain:'red=红色',topic:'颜色',lv:1},
  {q:'green是什么颜色？',type:'choice',options:shuffle(['红色','蓝色','绿色','黄色']),answer:'绿色',hints:['g-r-e-e-n','草的颜色','绿色'],explain:'green=绿色',topic:'颜色',lv:1},
  {q:'数字3英语是？',type:'choice',options:shuffle(['one','two','three','four']),answer:'three',hints:['1=one 2=two 3=?','three','three'],explain:'three=3',topic:'数字',lv:1},
  {q:'ten是数字几？',type:'choice',options:shuffle(['8','9','10','11']),answer:'10',hints:['t-e-n','10','ten=10'],explain:'ten=10',topic:'数字',lv:1},
  {q:'"你好"英语是？',type:'choice',options:shuffle(['Hello','Goodbye','Sorry','Thanks']),answer:'Hello',hints:['打招呼','Hello','Hello'],explain:'Hello=你好',topic:'问候',lv:1},
  {q:'"猫"英语是？',type:'choice',options:shuffle(['cat','dog','bird','fish']),answer:'cat',hints:['c-a-t','喵喵叫','cat'],explain:'cat=猫',topic:'动物',lv:2},
  {q:'dog是什么？',type:'choice',options:shuffle(['猫','狗','鸟','鱼']),answer:'狗',hints:['d-o-g','汪汪叫','狗'],explain:'dog=狗',topic:'动物',lv:2},
  {q:'"苹果"英语是？',type:'choice',options:shuffle(['apple','banana','orange','pear']),answer:'apple',hints:['a-p-p-l-e','红红的','apple'],explain:'apple=苹果',topic:'水果',lv:2},
  {q:'banana是什么？',type:'choice',options:shuffle(['苹果','香蕉','橘子','梨']),answer:'香蕉',hints:['b-a-n-a-n-a','黄黄弯弯的','香蕉'],explain:'banana=香蕉',topic:'水果',lv:2},
  {q:'head是什么？',type:'choice',options:shuffle(['头','手','脚','眼睛']),answer:'头',hints:['h-e-a-d','最上面','头'],explain:'head=头',topic:'身体',lv:2},
  {q:'father是什么？',type:'choice',options:shuffle(['爸爸','妈妈','哥哥','姐姐']),answer:'爸爸',hints:['f-a-t-h-e-r','男性长辈','爸爸'],explain:'father=爸爸',topic:'家庭',lv:3},
  {q:'"I like apples."意思是？',type:'choice',options:shuffle(['我喜欢苹果','我有苹果','我是苹果','我吃苹果']),answer:'我喜欢苹果',hints:['like=喜欢','I like=我喜欢','我喜欢苹果'],explain:'I like+名词=我喜欢',topic:'句型',lv:3},
  {q:'Stand up意思是？',type:'choice',options:shuffle(['起立','坐下','打开书','安静']),answer:'起立',hints:['stand=站','up=起来','起立'],explain:'Stand up=起立',topic:'课堂用语',lv:3},
  {q:'Sit down意思是？',type:'choice',options:shuffle(['起立','坐下','打开书','安静']),answer:'坐下',hints:['sit=坐','down=下','坐下'],explain:'Sit down=坐下',topic:'课堂用语',lv:3}
);
// 补充数学题
for(let i=0;i<8;i++){const a=rand(0,5),b=rand(0,5-a),s=a+b;QB[1].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['数一数','合起来',a+'+'+b+'='+s],explain:'加法',topic:'5以内加法',lv:1});}
for(let i=0;i<8;i++){const a=rand(2,5),b=rand(0,a),s=a-b;QB[1].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['拿走','倒数',a+'-'+b+'='+s],explain:'减法',topic:'5以内减法',lv:1});}
QB[1].math.push(
  {q:'5○8填什么？',type:'choice',options:shuffle(['>','<','=','不确定']),answer:'<',hints:['5和8谁大','8大','<'],explain:'比大小',topic:'比一比',lv:1},
  {q:'把2,5,1,4从大到小排第一个是？',type:'choice',options:shuffle(['1','2','4','5']),answer:'5',hints:['找最大','5最大','5'],explain:'从大到小排列',topic:'比一比',lv:1},
  {q:'鞋盒是什么形状？',type:'choice',options:shuffle(['球','正方体','长方体','圆柱']),answer:'长方体',hints:['有6个面','面有大有小','长方体'],explain:'长方体6个面',topic:'认识图形',lv:1},
  {q:'哪个图形不能滚？',type:'choice',options:shuffle(['正方体','球','圆柱','足球']),answer:'正方体',hints:['有平面','棱角分明','正方体'],explain:'有棱角不能滚',topic:'认识图形',lv:1}
);
for(let i=0;i<8;i++){const a=rand(2,9),b=rand(1,10-a),s=a+b;QB[1].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['加法',a+'+'+b,String(s)],explain:'加法',topic:'10以内加法',lv:2});}
for(let i=0;i<8;i++){const a=rand(4,10),b=rand(1,a-1),s=a-b;QB[1].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['减法',a+'-'+b,String(s)],explain:'减法',topic:'10以内减法',lv:2});}
QB[1].math.push(
  {q:'13里有几个十几个一？',type:'choice',options:shuffle(['1个十3个一','3个十1个一','13个一','10个3个']),answer:'1个十3个一',hints:['十位1','个位3','1个十3个一'],explain:'分位理解',topic:'11-20各数',lv:2},
  {q:'19后面一个数是？',type:'input',answer:'20',hints:['19+1','进十','20'],explain:'19后面是20',topic:'11-20各数',lv:2},
  {q:'11,12,13,14,?下一个？',type:'input',answer:'15',hints:['每次加1','14+1','15'],explain:'连续数',topic:'11-20各数',lv:2},
  {q:'时针指6分针指12几点？',type:'choice',options:shuffle(['6时','12时','6时30分','12时6分']),answer:'6时',hints:['分针12整点','时针6','6时'],explain:'整时判断',topic:'认识钟表',lv:2},
  {q:'现在8时再过3小时？',type:'input',answer:'11',hints:['8+3','11时','11'],explain:'推算时间',topic:'认识钟表',lv:2}
);
for(let i=0;i<8;i++){const a=rand(3,9),b=rand(11-a,9),s=a+b;QB[1].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['凑十法','先凑10',a+'+'+b+'='+s],explain:'凑十法',topic:'20以内进位加法',lv:2});}
for(let i=0;i<8;i++){const a=rand(12,18),b=rand(a-9,9),s=a-b;QB[1].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['破十法','拆成10减',a+'-'+b+'='+s],explain:'破十法',topic:'20以内退位减法',lv:3});}
QB[1].math.push(
  {q:'73的个位是？',type:'choice',options:shuffle(['7','3','73','70']),answer:'3',hints:['个位在右边','3在个位','3'],explain:'个位',topic:'100以内数',lv:3},
  {q:'5个十2个一组成？',type:'input',answer:'52',hints:['50+2','52','52'],explain:'组数',topic:'100以内数',lv:3},
  {q:'最小的两位数是？',type:'input',answer:'10',hints:['两位数最小','10','10'],explain:'最小两位数10',topic:'100以内数',lv:3},
  {q:'铅笔8角橡皮3角共几角？',type:'input',answer:'11',hints:['8+3','11角','超过10角=1元1角'],explain:'人民币加法',topic:'认识人民币',lv:3},
  {q:'1元2角=几角？',type:'input',answer:'12',hints:['1元=10角','10+2','12角'],explain:'元角换算',topic:'认识人民币',lv:3},
  {q:'10,8,6,4,2,?下一个？',type:'input',answer:'0',hints:['每次减2','2-2','0'],explain:'递减规律',topic:'找规律',lv:3},
  {q:'1,2,1,2,1,?下一个？',type:'input',answer:'2',hints:['交替出现','1和2交替','2'],explain:'交替规律',topic:'找规律',lv:3},
  {q:'篮子里9个苹果吃了3个又放进5个现在几个？',type:'input',answer:'11',hints:['9-3=6','6+5=11','11个'],explain:'两步计算',topic:'应用题',lv:3},
  {q:'哥哥14岁弟弟比哥哥小5岁弟弟几岁？',type:'input',answer:'9',hints:['比小用减法','14-5','9岁'],explain:'比少用减法',topic:'应用题',lv:3},
  {q:'一排有8个小朋友从左数小明第3个从右数第几个？',type:'input',answer:'6',hints:['总数-左边位置+1','8-3+1','6'],explain:'排队问题',topic:'应用题',lv:3}
);
for(let i=0;i<8;i++){const a=rand(20,60),b=rand(10,30),s=a+b;QB[1].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['两位数加法','注意进位',a+'+'+b+'='+s],explain:'两位数加法',topic:'100以内加减法',lv:3});}
for(let i=0;i<8;i++){const a=rand(50,99),b=rand(10,a-10),s=a-b;QB[1].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['两位数减法','注意退位',a+'-'+b+'='+s],explain:'两位数减法',topic:'100以内加减法',lv:3});}
// 补充语文
QB[1].chinese.push(
  {q:'"ma"的声母是？',type:'choice',options:shuffle(['m','a','ma','am']),answer:'m',hints:['前面是声母','m是声母','m'],explain:'声母在前',topic:'拼音',lv:1},
  {q:'整体认读音节是哪个？',type:'choice',options:shuffle(['shi','bo','mu','la']),answer:'shi',hints:['整体认读不拼','shi','shi'],explain:'zhi chi shi ri',topic:'拼音',lv:1},
  {q:'"远"的反义词？',type:'choice',options:shuffle(['近','长','大','高']),answer:'近',hints:['远↔近','远的反面','近'],explain:'远↔近',topic:'反义词',lv:1},
  {q:'"前"的反义词？',type:'choice',options:shuffle(['后','左','右','上']),answer:'后',hints:['前↔后','前的反面','后'],explain:'前↔后',topic:'反义词',lv:1},
  {q:'"来"的反义词？',type:'choice',options:shuffle(['去','走','跑','飞']),answer:'去',hints:['来↔去','来的反面','去'],explain:'来↔去',topic:'反义词',lv:1},
  {q:'一____花',type:'choice',options:shuffle(['朵','只','条','个']),answer:'朵',hints:['花用朵','一朵花','朵'],explain:'花用朵',topic:'量词',lv:2},
  {q:'一____鱼',type:'choice',options:shuffle(['条','只','棵','朵']),answer:'条',hints:['鱼用条','一条鱼','条'],explain:'鱼用条',topic:'量词',lv:2},
  {q:'一____山',type:'choice',options:shuffle(['座','只','条','棵']),answer:'座',hints:['山用座','一座山','座'],explain:'山用座',topic:'量词',lv:2},
  {q:'"林"字有几画？',type:'choice',options:shuffle(['6画','7画','8画','9画']),answer:'8画',hints:['左边木4画','右边木4画','8画'],explain:'数笔画',topic:'笔画',lv:2},
  {q:'"明"由哪两部分组成？',type:'choice',options:shuffle(['日和月','目和月','日和目','明和月']),answer:'日和月',hints:['左日右月','日+月','日和月'],explain:'日+月=明',topic:'偏旁部首',lv:2},
  {q:'"举头望明月"下一句？',type:'choice',options:shuffle(['低头思故乡','疑是地上霜','处处闻啼鸟','花落知多少']),answer:'低头思故乡',hints:['静夜思','李白','低头思故乡'],explain:'李白《静夜思》',topic:'古诗',lv:2},
  {q:'"锄禾日当午"下一句？',type:'choice',options:shuffle(['汗滴禾下土','低头思故乡','处处闻啼鸟','白毛浮绿水']),answer:'汗滴禾下土',hints:['悯农','李绅','汗滴禾下土'],explain:'李绅《悯农》',topic:'古诗',lv:2},
  {q:'"风吹树叶"改把字句？',type:'choice',options:shuffle(['风把树叶吹了','树叶把风吹了','树叶被风吹了','风被树叶吹了']),answer:'风把树叶吹了',hints:['谁把什么怎么了','风把树叶','风把树叶吹了'],explain:'把字句',topic:'句子',lv:3},
  {q:'"太阳像火球"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'比喻',hints:['像字','用火球比太阳','比喻'],explain:'像字比喻',topic:'修辞',lv:3}
);
// 补充英语
QB[1].english.push(
  {q:'Z前面是哪个字母？',type:'choice',options:shuffle(['X','Y','W','V']),answer:'Y',hints:['X-Y-Z','Z前面','Y'],explain:'字母顺序',topic:'字母',lv:1},
  {q:'yellow是什么颜色？',type:'choice',options:shuffle(['红色','蓝色','绿色','黄色']),answer:'黄色',hints:['y-e-l-l-o-w','太阳的颜色','黄色'],explain:'yellow=黄色',topic:'颜色',lv:1},
  {q:'black是什么颜色？',type:'choice',options:shuffle(['黑色','白色','蓝色','棕色']),answer:'黑色',hints:['b-l-a-c-k','夜晚的颜色','黑色'],explain:'black=黑色',topic:'颜色',lv:1},
  {q:'five是数字几？',type:'choice',options:shuffle(['3','4','5','6']),answer:'5',hints:['f-i-v-e','five=5','5'],explain:'five=5',topic:'数字',lv:1},
  {q:'eight是数字几？',type:'choice',options:shuffle(['6','7','8','9']),answer:'8',hints:['e-i-g-h-t','eight=8','8'],explain:'eight=8',topic:'数字',lv:1},
  {q:'Goodbye意思是？',type:'choice',options:shuffle(['你好','再见','谢谢','对不起']),answer:'再见',hints:['告别','Goodbye','再见'],explain:'Goodbye=再见',topic:'问候',lv:1},
  {q:'fish是什么？',type:'choice',options:shuffle(['猫','狗','鸟','鱼']),answer:'鱼',hints:['f-i-s-h','水里游','鱼'],explain:'fish=鱼',topic:'动物',lv:2},
  {q:'bear是什么？',type:'choice',options:shuffle(['猫','熊','鸟','兔子']),answer:'熊',hints:['b-e-a-r','大大的','熊'],explain:'bear=熊',topic:'动物',lv:2},
  {q:'pear是什么水果？',type:'choice',options:shuffle(['苹果','香蕉','梨','葡萄']),answer:'梨',hints:['p-e-a-r','梨子','梨'],explain:'pear=梨',topic:'水果',lv:2},
  {q:'nose是什么？',type:'choice',options:shuffle(['嘴','鼻子','耳朵','眼睛']),answer:'鼻子',hints:['n-o-s-e','闻味道','鼻子'],explain:'nose=鼻子',topic:'身体',lv:2},
  {q:'mouth是什么？',type:'choice',options:shuffle(['嘴','鼻子','耳朵','手']),answer:'嘴',hints:['m-o-u-t-h','吃饭说话','嘴'],explain:'mouth=嘴',topic:'身体',lv:2},
  {q:'mother是什么？',type:'choice',options:shuffle(['爸爸','妈妈','哥哥','姐姐']),answer:'妈妈',hints:['m-o-t-h-e-r','女性长辈','妈妈'],explain:'mother=妈妈',topic:'家庭',lv:3},
  {q:'brother是什么？',type:'choice',options:shuffle(['爸爸','妈妈','兄弟','姐妹']),answer:'兄弟',hints:['b-r-o-t-h-e-r','男性同辈','兄弟'],explain:'brother=兄弟',topic:'家庭',lv:3},
  {q:'"This is a dog."意思？',type:'choice',options:shuffle(['这是一只狗','那是一只狗','我有一只狗','狗在这里']),answer:'这是一只狗',hints:['This is=这是','a dog=一只狗','这是一只狗'],explain:'This is=这是',topic:'句型',lv:3},
  {q:'Open your book意思？',type:'choice',options:shuffle(['打开书','关上书','拿起书','放下书']),answer:'打开书',hints:['open=打开','your book=你的书','打开书'],explain:'Open=打开',topic:'课堂用语',lv:3}
);
// === 补充语文至30+/等级 ===
QB[1].chinese.push(
  // lv1补充
  {q:'"左"的反义词？',type:'choice',options:shuffle(['右','上','下','后']),answer:'右',hints:['左↔右','左的反面','右'],explain:'左↔右',topic:'反义词',lv:1},
  {q:'"快"的反义词？',type:'choice',options:shuffle(['慢','大','高','多']),answer:'慢',hints:['快↔慢','快的反面','慢'],explain:'快↔慢',topic:'反义词',lv:1},
  {q:'"胖"的反义词？',type:'choice',options:shuffle(['瘦','高','矮','长']),answer:'瘦',hints:['胖↔瘦','胖的反面','瘦'],explain:'胖↔瘦',topic:'反义词',lv:1},
  {q:'"冷"的反义词？',type:'choice',options:shuffle(['热','暖','凉','温']),answer:'热',hints:['冷↔热','冷的反面','热'],explain:'冷↔热',topic:'反义词',lv:1},
  {q:'"开"的反义词？',type:'choice',options:shuffle(['关','合','闭','停']),answer:'关',hints:['开↔关','开的反面','关'],explain:'开↔关',topic:'反义词',lv:1},
  {q:'"哭"的反义词？',type:'choice',options:shuffle(['笑','乐','喜','欢']),answer:'笑',hints:['哭↔笑','哭的反面','笑'],explain:'哭↔笑',topic:'反义词',lv:1},
  {q:'"进"的反义词？',type:'choice',options:shuffle(['出','退','走','跑']),answer:'出',hints:['进↔出','进的反面','出'],explain:'进↔出',topic:'反义词',lv:1},
  {q:'"天"的拼音声调？',type:'choice',options:shuffle(['第一声','第二声','第三声','第四声']),answer:'第一声',hints:['tiān','一声平','第一声'],explain:'一声ˉ',topic:'拼音',lv:1},
  {q:'"人"的拼音是？',type:'choice',options:shuffle(['rén','lén','réng','rěn']),answer:'rén',hints:['r-é-n','第二声','rén'],explain:'人rén',topic:'拼音',lv:1},
  {q:'哪个是韵母？',type:'choice',options:shuffle(['a','b','d','g']),answer:'a',hints:['aoe是韵母','a是韵母','a'],explain:'韵母aoe等',topic:'拼音',lv:1},
  {q:'"zhi"是什么？',type:'choice',options:shuffle(['整体认读音节','声母','韵母','声调']),answer:'整体认读音节',hints:['不能拼读','整体认读','整体认读音节'],explain:'zhi chi shi ri等',topic:'拼音',lv:1},
  {q:'"j"是声母还是韵母？',type:'choice',options:shuffle(['声母','韵母','整体认读','声调']),answer:'声母',hints:['j在前面','声母','声母'],explain:'jqx是声母',topic:'拼音',lv:1},
  {q:'"月"字有几画？',type:'choice',options:shuffle(['3画','4画','5画','6画']),answer:'4画',hints:['一笔一笔数','4画','4画'],explain:'月=4画',topic:'笔画',lv:1},
  {q:'"日"字有几画？',type:'choice',options:shuffle(['3画','4画','5画','6画']),answer:'4画',hints:['横竖横折横','4画','4画'],explain:'日=4画',topic:'笔画',lv:1},
  // lv2补充
  {q:'一____路',type:'choice',options:shuffle(['条','只','棵','朵']),answer:'条',hints:['路用条','一条路','条'],explain:'路用条',topic:'量词',lv:2},
  {q:'一____房子',type:'choice',options:shuffle(['座','只','条','棵']),answer:'座',hints:['房子用座','一座房子','座'],explain:'建筑用座',topic:'量词',lv:2},
  {q:'一____风',type:'choice',options:shuffle(['阵','只','条','棵']),answer:'阵',hints:['风用阵','一阵风','阵'],explain:'风用阵',topic:'量词',lv:2},
  {q:'一____马',type:'choice',options:shuffle(['匹','只','条','头']),answer:'匹',hints:['马用匹','一匹马','匹'],explain:'马用匹',topic:'量词',lv:2},
  {q:'一____雨',type:'choice',options:shuffle(['场','只','条','阵']),answer:'场',hints:['雨用场','一场雨','场'],explain:'雨用场',topic:'量词',lv:2},
  {q:'"口"字加一笔变什么字？',type:'choice',options:shuffle(['日','中','田','目']),answer:'日',hints:['口加一横','日','日'],explain:'加笔画变新字',topic:'偏旁部首',lv:2},
  {q:'"木"加一笔变什么字？',type:'choice',options:shuffle(['本','术','禾','未']),answer:'本',hints:['木下面加一横','本','本'],explain:'加笔画变新字',topic:'偏旁部首',lv:2},
  {q:'"白毛浮绿水"下一句？',type:'choice',options:shuffle(['红掌拨清波','曲项向天歌','鹅鹅鹅','处处闻啼鸟']),answer:'红掌拨清波',hints:['咏鹅','骆宾王','红掌拨清波'],explain:'骆宾王《咏鹅》',topic:'古诗',lv:2},
  {q:'"谁知盘中餐"下一句？',type:'choice',options:shuffle(['粒粒皆辛苦','汗滴禾下土','锄禾日当午','春种一粒粟']),answer:'粒粒皆辛苦',hints:['悯农','珍惜粮食','粒粒皆辛苦'],explain:'李绅《悯农》',topic:'古诗',lv:2},
  {q:'"远看山有色"出自哪首诗？',type:'choice',options:shuffle(['画','春晓','静夜思','咏鹅']),answer:'画',hints:['远看山有色近听水无声','王维','画'],explain:'王维《画》',topic:'古诗',lv:2},
  {q:'"春去花还在"下一句？',type:'choice',options:shuffle(['人来鸟不惊','近听水无声','远看山有色','花落知多少']),answer:'人来鸟不惊',hints:['画','王维','人来鸟不惊'],explain:'王维《画》',topic:'古诗',lv:2},
  {q:'"花落知多少"出自？',type:'choice',options:shuffle(['春晓','画','静夜思','咏鹅']),answer:'春晓',hints:['孟浩然','夜来风雨声','春晓'],explain:'孟浩然《春晓》',topic:'古诗',lv:2},
  // lv3补充
  {q:'"老师把黑板擦干净了"改被字句？',type:'choice',options:shuffle(['黑板被老师擦干净了','老师被黑板擦干净了','黑板把老师擦了','擦干净了被黑板']),answer:'黑板被老师擦干净了',hints:['谁被谁怎么了','黑板被老师','黑板被老师擦干净了'],explain:'被字句',topic:'句子',lv:3},
  {q:'选正确的"的地得"用法',type:'choice',options:shuffle(['认真地写字','认真的写字','认真得写字','写字地认真']),answer:'认真地写字',hints:['修饰动词用地','认真地+写','认真地写字'],explain:'的+名词地+动词得+形容词',topic:'句子',lv:3},
  {q:'选正确的"的地得"用法',type:'choice',options:shuffle(['跑得快','跑的快','跑地快','快地跑']),answer:'跑得快',hints:['补充说明动词用得','跑得+快','跑得快'],explain:'得后面补充说明程度',topic:'句子',lv:3},
  {q:'"小草从地里钻出来"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'拟人',hints:['草能钻吗','当作人来写','拟人'],explain:'拟人赋予物人的动作',topic:'修辞',lv:3},
  {q:'"星星像眼睛"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'比喻',hints:['像字','用眼睛比星星','比喻'],explain:'比喻',topic:'修辞',lv:3},
  {q:'小鸟在枝头唱歌蝴蝶在花间跳舞。写了几种动物？',type:'choice',options:shuffle(['1种','2种','3种','4种']),answer:'2种',hints:['小鸟和蝴蝶','2种','2种'],explain:'找出动物',topic:'阅读理解',lv:3},
  {q:'"秋天到了叶子黄了果子红了"描写的季节是？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'秋天',hints:['叶子黄果子红','丰收','秋天'],explain:'通过景色判断季节',topic:'阅读理解',lv:3},
  {q:'"雪花飘飘北风呼呼"描写的季节是？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'冬天',hints:['雪花北风','寒冷','冬天'],explain:'雪花北风=冬天',topic:'阅读理解',lv:3},
  {q:'"荷花开了知了叫了"描写的季节是？',type:'choice',options:shuffle(['春天','夏天','秋天','冬天']),answer:'夏天',hints:['荷花知了','炎热','夏天'],explain:'荷花知了=夏天',topic:'阅读理解',lv:3}
);
// === 补充英语至30+/等级 ===
QB[1].english.push(
  // lv1补充
  {q:'white是什么颜色？',type:'choice',options:shuffle(['白色','黑色','蓝色','红色']),answer:'白色',hints:['w-h-i-t-e','雪的颜色','白色'],explain:'white=白色',topic:'颜色',lv:1},
  {q:'orange是什么颜色？',type:'choice',options:shuffle(['橙色','红色','黄色','绿色']),answer:'橙色',hints:['o-r-a-n-g-e','橘子色','橙色'],explain:'orange=橙色',topic:'颜色',lv:1},
  {q:'four是数字几？',type:'choice',options:shuffle(['3','4','5','6']),answer:'4',hints:['f-o-u-r','four=4','4'],explain:'four=4',topic:'数字',lv:1},
  {q:'six是数字几？',type:'choice',options:shuffle(['5','6','7','8']),answer:'6',hints:['s-i-x','six=6','6'],explain:'six=6',topic:'数字',lv:1},
  {q:'nine是数字几？',type:'choice',options:shuffle(['7','8','9','10']),answer:'9',hints:['n-i-n-e','nine=9','9'],explain:'nine=9',topic:'数字',lv:1},
  {q:'two是数字几？',type:'choice',options:shuffle(['1','2','3','4']),answer:'2',hints:['t-w-o','two=2','2'],explain:'two=2',topic:'数字',lv:1},
  {q:'Thank you意思？',type:'choice',options:shuffle(['谢谢','你好','再见','对不起']),answer:'谢谢',hints:['感谢','Thank you','谢谢'],explain:'Thank you=谢谢',topic:'问候',lv:1},
  {q:'Sorry意思？',type:'choice',options:shuffle(['谢谢','你好','再见','对不起']),answer:'对不起',hints:['道歉','Sorry','对不起'],explain:'Sorry=对不起',topic:'问候',lv:1},
  {q:'Good morning意思？',type:'choice',options:shuffle(['早上好','下午好','晚上好','晚安']),answer:'早上好',hints:['morning=早上','Good=好','早上好'],explain:'Good morning=早上好',topic:'问候',lv:1},
  {q:'Good night意思？',type:'choice',options:shuffle(['早上好','下午好','晚上好','晚安']),answer:'晚安',hints:['night=晚上','睡前说','晚安'],explain:'Good night=晚安',topic:'问候',lv:1},
  {q:'D的小写是？',type:'choice',options:shuffle(['b','c','d','e']),answer:'d',hints:['D→d','小写','d'],explain:'大小写对应',topic:'字母',lv:1},
  {q:'哪个是元音字母？',type:'choice',options:shuffle(['A','B','C','D']),answer:'A',hints:['AEIOU是元音','A是元音','A'],explain:'5个元音AEIOU',topic:'字母',lv:1},
  // lv2补充
  {q:'duck是什么？',type:'choice',options:shuffle(['鸭子','狗','猫','鸡']),answer:'鸭子',hints:['d-u-c-k','嘎嘎叫','鸭子'],explain:'duck=鸭子',topic:'动物',lv:2},
  {q:'pig是什么？',type:'choice',options:shuffle(['猪','狗','猫','鸡']),answer:'猪',hints:['p-i-g','哼哼叫','猪'],explain:'pig=猪',topic:'动物',lv:2},
  {q:'rabbit是什么？',type:'choice',options:shuffle(['兔子','老鼠','猫','狗']),answer:'兔子',hints:['r-a-b-b-i-t','长耳朵','兔子'],explain:'rabbit=兔子',topic:'动物',lv:2},
  {q:'grape是什么水果？',type:'choice',options:shuffle(['葡萄','苹果','橘子','梨']),answer:'葡萄',hints:['g-r-a-p-e','一串串的','葡萄'],explain:'grape=葡萄',topic:'水果',lv:2},
  {q:'watermelon是什么？',type:'choice',options:shuffle(['西瓜','苹果','桃子','草莓']),answer:'西瓜',hints:['water+melon','很大的水果','西瓜'],explain:'watermelon=西瓜',topic:'水果',lv:2},
  {q:'ear是什么？',type:'choice',options:shuffle(['耳朵','眼睛','嘴巴','鼻子']),answer:'耳朵',hints:['e-a-r','听声音','耳朵'],explain:'ear=耳朵',topic:'身体',lv:2},
  {q:'foot是什么？',type:'choice',options:shuffle(['脚','手','头','腿']),answer:'脚',hints:['f-o-o-t','走路用','脚'],explain:'foot=脚',topic:'身体',lv:2},
  {q:'arm是什么？',type:'choice',options:shuffle(['手臂','腿','头','手']),answer:'手臂',hints:['a-r-m','胳膊','手臂'],explain:'arm=手臂',topic:'身体',lv:2},
  {q:'leg是什么？',type:'choice',options:shuffle(['腿','手','头','脚']),answer:'腿',hints:['l-e-g','走路的','腿'],explain:'leg=腿',topic:'身体',lv:2},
  // lv3补充
  {q:'sister是什么？',type:'choice',options:shuffle(['姐妹','兄弟','爸爸','妈妈']),answer:'姐妹',hints:['s-i-s-t-e-r','女性同辈','姐妹'],explain:'sister=姐妹',topic:'家庭',lv:3},
  {q:'grandma是什么？',type:'choice',options:shuffle(['奶奶/外婆','爷爷','妈妈','阿姨']),answer:'奶奶/外婆',hints:['grand+ma','长辈女性','奶奶/外婆'],explain:'grandma=奶奶/外婆',topic:'家庭',lv:3},
  {q:'"It is a bird."意思？',type:'choice',options:shuffle(['它是一只鸟','这是一只狗','我有一只鸟','鸟在飞']),answer:'它是一只鸟',hints:['It is=它是','a bird=一只鸟','它是一只鸟'],explain:'It is=它是',topic:'句型',lv:3},
  {q:'"I can run."意思？',type:'choice',options:shuffle(['我能跑','我在跑','我跑了','我喜欢跑']),answer:'我能跑',hints:['can=能','run=跑','我能跑'],explain:'can+动词=能做某事',topic:'句型',lv:3},
  {q:'Close the door意思？',type:'choice',options:shuffle(['关门','开门','打开书','坐下']),answer:'关门',hints:['close=关','door=门','关门'],explain:'Close=关闭',topic:'课堂用语',lv:3},
  {q:'"How old are you?"问什么？',type:'choice',options:shuffle(['你几岁','你好吗','你在哪','你叫什么']),answer:'你几岁',hints:['How old=多大','问年龄','你几岁'],explain:'How old问年龄',topic:'句型',lv:3},
  {q:'"What is this?" "It is a _____."这是一本书',type:'choice',options:shuffle(['book','pen','bag','cat']),answer:'book',hints:['书=book','b-o-o-k','book'],explain:'book=书',topic:'句型',lv:3},
  {q:'"I am six years old."意思？',type:'choice',options:shuffle(['我六岁了','我有六个','我是第六','我六点了']),answer:'我六岁了',hints:['six years old','六岁','我六岁了'],explain:'I am X years old=我X岁',topic:'句型',lv:3}
);
// === 补充lv2/lv3英语 ===
QB[1].english.push(
  {q:'elephant是什么？',type:'choice',options:shuffle(['大象','老虎','狮子','猴子']),answer:'大象',hints:['e-l-e-p-h-a-n-t','最大的陆地动物','大象'],explain:'elephant=大象',topic:'动物',lv:2},
  {q:'tiger是什么？',type:'choice',options:shuffle(['大象','老虎','狮子','猴子']),answer:'老虎',hints:['t-i-g-e-r','条纹','老虎'],explain:'tiger=老虎',topic:'动物',lv:2},
  {q:'strawberry是什么？',type:'choice',options:shuffle(['草莓','蓝莓','西瓜','葡萄']),answer:'草莓',hints:['s-t-r-a-w-b-e-r-r-y','红色小果','草莓'],explain:'strawberry=草莓',topic:'水果',lv:2},
  {q:'finger是什么？',type:'choice',options:shuffle(['手指','脚趾','手臂','腿']),answer:'手指',hints:['f-i-n-g-e-r','手上的','手指'],explain:'finger=手指',topic:'身体',lv:2},
  {q:'"What is your name?"怎么回答？',type:'choice',options:shuffle(["My name is Tom.","I'm fine.","I'm six.",'Thank you.']),answer:"My name is Tom.",hints:['问名字','My name is...','My name is Tom.'],explain:'回答名字',topic:'句型',lv:3},
  {q:'"Where is the cat?"意思？',type:'choice',options:shuffle(['猫在哪里','猫是什么','这是猫吗','猫多大了']),answer:'猫在哪里',hints:['Where=哪里','问地点','猫在哪里'],explain:'Where问地点',topic:'句型',lv:3},
  {q:'"I don\'t like spiders."意思？',type:'choice',options:shuffle(['我不喜欢蜘蛛','我喜欢蜘蛛','我有蜘蛛','蜘蛛喜欢我']),answer:'我不喜欢蜘蛛',hints:["don't like=不喜欢",'否定','我不喜欢蜘蛛'],explain:'否定句',topic:'句型',lv:3}
);
QB[1].chinese.push(
  {q:'"出"的反义词？',type:'choice',options:shuffle(['入','走','跑','飞']),answer:'入',hints:['出↔入','出的反面','入'],explain:'出↔入',topic:'反义词',lv:1},
  {q:'"新"的反义词？',type:'choice',options:shuffle(['旧','老','古','久']),answer:'旧',hints:['新↔旧','新的反面','旧'],explain:'新↔旧',topic:'反义词',lv:1},
  {q:'一____歌',type:'choice',options:shuffle(['首','只','条','棵']),answer:'首',hints:['歌用首','一首歌','首'],explain:'歌曲用首',topic:'量词',lv:2},
  {q:'一____画',type:'choice',options:shuffle(['幅','只','条','棵']),answer:'幅',hints:['画用幅','一幅画','幅'],explain:'画用幅',topic:'量词',lv:2},
  {q:'"妈妈洗了衣服"改把字句？',type:'choice',options:shuffle(['妈妈把衣服洗了','衣服把妈妈洗了','衣服被洗了妈妈','洗了把妈妈衣服']),answer:'妈妈把衣服洗了',hints:['谁把什么怎么了','妈妈把衣服','妈妈把衣服洗了'],explain:'把字句',topic:'句子',lv:3},
  {q:'"他跑得很快"中"得"用法对吗？',type:'choice',options:shuffle(['对','错应该用的','错应该用地','不确定']),answer:'对',hints:['得后面补充说明','跑得快','对'],explain:'得+补充说明程度',topic:'句子',lv:3}
);

// =============== 补充题目 — 人教版知识点覆盖 ===============

// -------- 数学：位置 --------
QB[1].math.push(
  {q:'小鸟飞在树的哪个方向？',type:'choice',options:shuffle(['上面','下面','左边','右边']),answer:'上面',hints:['鸟在天上飞','树的上方','上面'],explain:'鸟飞在树的上面',topic:'位置',lv:1},
  {q:'排队时你前面有3人后面有2人一共几人？',type:'input',answer:'6',hints:['前3+自己+后2','3+1+2','6人'],explain:'总人数=前面+自己+后面',topic:'位置',lv:1},
  {q:'小明坐在小红的左边那小红坐在小明的哪边？',type:'choice',options:shuffle(['左边','右边','前面','后面']),answer:'右边',hints:['位置是相对的','左右相反','右边'],explain:'左右是相对的',topic:'位置',lv:1},
  {q:'面朝前方你的右手在哪边？',type:'choice',options:shuffle(['左边','右边','前面','后面']),answer:'右边',hints:['写字的手','右边','右边'],explain:'大多数人右手在右边',topic:'位置',lv:1},
  {q:'教室里黑板在同学们的哪个方向？',type:'choice',options:shuffle(['前面','后面','左边','右边']),answer:'前面',hints:['上课看黑板','面对黑板','前面'],explain:'黑板在同学们的前面',topic:'位置',lv:1}
);

// -------- 数学：连加连减 --------
QB[1].math.push(
  {q:'2 + 3 + 4 = ?',type:'input',answer:'9',hints:['先算2+3=5','再算5+4','9'],explain:'连加从左到右算',topic:'连加连减',lv:2},
  {q:'10 - 3 - 2 = ?',type:'input',answer:'5',hints:['先算10-3=7','再算7-2','5'],explain:'连减从左到右算',topic:'连加连减',lv:2},
  {q:'8 - 3 + 4 = ?',type:'input',answer:'9',hints:['先算8-3=5','再算5+4','9'],explain:'加减混合从左到右',topic:'连加连减',lv:2},
  {q:'5 + 2 - 3 = ?',type:'input',answer:'4',hints:['先算5+2=7','再算7-3','4'],explain:'加减混合从左到右',topic:'连加连减',lv:2},
  {q:'1 + 2 + 3 + 4 = ?',type:'input',answer:'10',hints:['先算1+2=3','3+3=6再6+4','10'],explain:'连加从左到右依次算',topic:'连加连减',lv:2}
);
for(let i=0;i<6;i++){const a=rand(1,8),b=rand(1,9-a),c=rand(1,9-a-b);const s=a+b+c;
  QB[1].math.push({q:a+' + '+b+' + '+c+' = ?',type:'input',answer:String(s),hints:['先算'+a+'+'+b+'='+(a+b),'再加'+c,(a+b)+'+'+c+'='+s],explain:'连加从左到右',topic:'连加连减',lv:2});}
for(let i=0;i<6;i++){const a=rand(10,18),b=rand(1,a-2),c=rand(1,a-b-1);const s=a-b-c;
  QB[1].math.push({q:a+' - '+b+' - '+c+' = ?',type:'input',answer:String(s),hints:['先算'+a+'-'+b+'='+(a-b),'再减'+c,(a-b)+'-'+c+'='+s],explain:'连减从左到右',topic:'连加连减',lv:2});}

// -------- 数学：平面图形 --------
QB[1].math.push(
  {q:'三角形有几条边？',type:'choice',options:shuffle(['2条','3条','4条','5条']),answer:'3条',hints:['三角＝三条边','数一数','3条'],explain:'三角形有3条边和3个角',topic:'平面图形',lv:2},
  {q:'正方形有几条边？',type:'choice',options:shuffle(['3条','4条','5条','6条']),answer:'4条',hints:['正方形四四方方','4条边','4条'],explain:'正方形有4条相等的边',topic:'平面图形',lv:2},
  {q:'圆有几个角？',type:'choice',options:shuffle(['0个','1个','2个','4个']),answer:'0个',hints:['圆是弯的','没有角','0个'],explain:'圆没有角',topic:'平面图形',lv:2},
  {q:'黑板的面是什么形状？',type:'choice',options:shuffle(['正方形','长方形','三角形','圆']),answer:'长方形',hints:['两条长边两条短边','四边形','长方形'],explain:'黑板面是长方形',topic:'平面图形',lv:2},
  {q:'车轮的形状是什么？',type:'choice',options:shuffle(['正方形','长方形','三角形','圆']),answer:'圆',hints:['圆圆的能滚动','车轮','圆'],explain:'车轮是圆形的',topic:'平面图形',lv:2}
);

// -------- 数学：分类与整理 --------
QB[1].math.push(
  {q:'苹果香蕉西瓜黄瓜哪个不是水果？',type:'choice',options:shuffle(['苹果','香蕉','西瓜','黄瓜']),answer:'黄瓜',hints:['黄瓜是蔬菜','不是水果','黄瓜'],explain:'按水果和蔬菜分类黄瓜是蔬菜',topic:'分类与整理',lv:1},
  {q:'红球5个蓝球3个黄球4个一共几个球？',type:'input',answer:'12',hints:['5+3+4','分类再合计','12个'],explain:'分类计数再求总数',topic:'分类与整理',lv:1},
  {q:'圆形3个三角形5个正方形2个哪种最多？',type:'choice',options:shuffle(['圆形','三角形','正方形','一样多']),answer:'三角形',hints:['比较3、5、2','5最大','三角形'],explain:'三角形5个最多',topic:'分类与整理',lv:1},
  {q:'铅笔、尺子、橡皮、苹果哪个不是文具？',type:'choice',options:shuffle(['铅笔','尺子','橡皮','苹果']),answer:'苹果',hints:['苹果是水果','不是文具','苹果'],explain:'苹果是水果不是文具',topic:'分类与整理',lv:1}
);

// -------- 数学：0的认识 --------
QB[1].math.push(
  {q:'5 - 5 = ?',type:'input',answer:'0',hints:['全部拿走','一个不剩','0'],explain:'相同数相减等于0',topic:'0的认识',lv:1},
  {q:'0 + 7 = ?',type:'input',answer:'7',hints:['0加任何数','还是那个数','7'],explain:'0加任何数等于那个数',topic:'0的认识',lv:1},
  {q:'0比1大还是小？',type:'choice',options:shuffle(['大','小','一样大','不能比']),answer:'小',hints:['0比1小','0<1','小'],explain:'0是最小的自然数',topic:'0的认识',lv:1},
  {q:'3 - 0 = ?',type:'input',answer:'3',hints:['没拿走任何','还是3','3'],explain:'任何数减0等于它自己',topic:'0的认识',lv:1},
  {q:'0 + 0 = ?',type:'input',answer:'0',hints:['两个0相加','还是0','0'],explain:'0加0等于0',topic:'0的认识',lv:1}
);

// -------- 数学：整十数加减 --------
for(let i=0;i<6;i++){const a=rand(1,8)*10,b=rand(1,Math.floor((100-a)/10))*10;const s=a+b;
  QB[1].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['整十数相加',a/10+'个十+'+b/10+'个十='+s/10+'个十',String(s)],explain:'整十数加法数十位即可',topic:'整十数加减',lv:3});}
for(let i=0;i<6;i++){const a=rand(3,9)*10,b=rand(1,Math.floor(a/10)-1)*10;const s=a-b;
  QB[1].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['整十数相减',a/10+'个十-'+b/10+'个十='+s/10+'个十',String(s)],explain:'整十数减法数十位即可',topic:'整十数加减',lv:3});}

// -------- 语文：多音字 --------
QB[1].chinese.push(
  {q:'"长"在"长大"中读什么？',type:'choice',options:shuffle(['cháng','zhǎng','chǎng','zháng']),answer:'zhǎng',hints:['长大=成长','三声','zhǎng'],explain:'长大的长读zhǎng',topic:'多音字',lv:2},
  {q:'"长"在"很长"中读什么？',type:'choice',options:shuffle(['cháng','zhǎng','chǎng','zháng']),answer:'cháng',hints:['很长=长短的长','二声','cháng'],explain:'长短的长读cháng',topic:'多音字',lv:2},
  {q:'"乐"在"快乐"中读什么？',type:'choice',options:shuffle(['lè','yuè','lào','yào']),answer:'lè',hints:['快乐=高兴','四声','lè'],explain:'快乐的乐读lè',topic:'多音字',lv:2},
  {q:'"乐"在"音乐"中读什么？',type:'choice',options:shuffle(['lè','yuè','lào','yào']),answer:'yuè',hints:['音乐=歌曲','四声','yuè'],explain:'音乐的乐读yuè',topic:'多音字',lv:2},
  {q:'"地"在"土地"中读什么？',type:'choice',options:shuffle(['dì','de','dī','dǐ']),answer:'dì',hints:['土地=大地','四声','dì'],explain:'名词读dì助词读de',topic:'多音字',lv:2}
);

// -------- 语文：形近字 --------
QB[1].chinese.push(
  {q:'"木"和"目"哪个表示眼睛？',type:'choice',options:shuffle(['木','目','林','日']),answer:'目',hints:['目=眼睛','木=树木','目'],explain:'目表示眼睛木表示树木',topic:'形近字',lv:2},
  {q:'选正确的字填空："人（ ）口"',type:'choice',options:shuffle(['入','人','八','大']),answer:'入',hints:['入口=进去的地方','入','入'],explain:'入口的入不是人',topic:'形近字',lv:2},
  {q:'"请（ ）下"选正确的字：',type:'choice',options:shuffle(['座','坐','做','作']),answer:'坐',hints:['坐是动作','坐下来','坐'],explain:'坐是动词座是名词',topic:'形近字',lv:2},
  {q:'"太（ ）了"选正确的字：',type:'choice',options:shuffle(['大','太','犬','天']),answer:'大',hints:['太大了','大=尺寸大','大'],explain:'大表示尺寸太是程度副词',topic:'形近字',lv:2}
);

// -------- 语文：古诗补充 --------
QB[1].chinese.push(
  {q:'"小娃撑小艇"下一句？',type:'choice',options:shuffle(['偷采白莲回','白毛浮绿水','疑是地上霜','处处闻啼鸟']),answer:'偷采白莲回',hints:['白居易《池上》','小孩偷莲','偷采白莲回'],explain:'白居易《池上》',topic:'古诗',lv:2},
  {q:'"泉眼无声惜细流"下一句？',type:'choice',options:shuffle(['树阴照水爱晴柔','小荷才露尖尖角','早有蜻蜓立上头','偷采白莲回']),answer:'树阴照水爱晴柔',hints:['杨万里《小池》','泉水树阴','树阴照水爱晴柔'],explain:'杨万里《小池》',topic:'古诗',lv:2},
  {q:'"小荷才露尖尖角"下一句？',type:'choice',options:shuffle(['早有蜻蜓立上头','树阴照水爱晴柔','偷采白莲回','处处闻啼鸟']),answer:'早有蜻蜓立上头',hints:['《小池》名句','荷叶蜻蜓','早有蜻蜓立上头'],explain:'杨万里《小池》',topic:'古诗',lv:2},
  {q:'"松下问童子"下一句？',type:'choice',options:shuffle(['言师采药去','只在此山中','云深不知处','低头思故乡']),answer:'言师采药去',hints:['贾岛《寻隐者不遇》','问小孩','言师采药去'],explain:'贾岛《寻隐者不遇》',topic:'古诗',lv:2},
  {q:'"李白乘舟将欲行"下一句？',type:'choice',options:shuffle(['忽闻岸上踏歌声','疑是地上霜','低头思故乡','处处闻啼鸟']),answer:'忽闻岸上踏歌声',hints:['李白《赠汪伦》','坐船要走','忽闻岸上踏歌声'],explain:'李白《赠汪伦》',topic:'古诗',lv:2},
  {q:'"桃花潭水深千尺"下一句？',type:'choice',options:shuffle(['不及汪伦送我情','忽闻岸上踏歌声','春风吹又生','花落知多少']),answer:'不及汪伦送我情',hints:['《赠汪伦》','友情深厚','不及汪伦送我情'],explain:'李白《赠汪伦》',topic:'古诗',lv:2}
);

// -------- 语文：组词 --------
QB[1].chinese.push(
  {q:'"花"能组成哪个词？',type:'choice',options:shuffle(['花朵','花鱼','花走','花跑']),answer:'花朵',hints:['花和朵搭配','花朵','花朵'],explain:'花朵是正确组词',topic:'组词',lv:1},
  {q:'"明"能组成哪个词？',type:'choice',options:shuffle(['明天','明走','明跑','明飞']),answer:'明天',hints:['日+月=明','明天','明天'],explain:'明天是正确组词',topic:'组词',lv:1},
  {q:'"下"能组成哪个词？',type:'choice',options:shuffle(['下雨','下鱼','下花','下树']),answer:'下雨',hints:['天上下雨','下雨','下雨'],explain:'下雨是正确组词',topic:'组词',lv:1},
  {q:'"大"能组成哪个词？',type:'choice',options:shuffle(['大人','大走','大飞','大跳']),answer:'大人',hints:['大和人搭配','大人','大人'],explain:'大人是正确组词',topic:'组词',lv:1}
);

// -------- 语文：标点符号 --------
QB[1].chinese.push(
  {q:'"你叫什么名字"后面用什么标点？',type:'choice',options:shuffle(['。','？','！','，']),answer:'？',hints:['在问别人','疑问句','？'],explain:'疑问句用问号',topic:'标点符号',lv:3},
  {q:'"今天天气真好啊"后面用什么标点？',type:'choice',options:shuffle(['。','？','！','，']),answer:'！',hints:['表示感叹','真好啊','！'],explain:'感叹句用感叹号',topic:'标点符号',lv:3},
  {q:'"小明去上学了"后面用什么标点？',type:'choice',options:shuffle(['。','？','！','，']),answer:'。',hints:['陈述一件事','普通句子','。'],explain:'陈述句用句号',topic:'标点符号',lv:3},
  {q:'"你吃饭了吗"后面用什么标点？',type:'choice',options:shuffle(['。','？','！','，']),answer:'？',hints:['在问别人','疑问句','？'],explain:'疑问句用问号',topic:'标点符号',lv:3}
);

// -------- 语文：笔顺规则 --------
QB[1].chinese.push(
  {q:'"十"字先写哪一笔？',type:'choice',options:shuffle(['横','竖','撇','捺']),answer:'横',hints:['先横后竖','横在前面','横'],explain:'笔顺规则：先横后竖',topic:'笔顺',lv:1},
  {q:'"八"字先写哪一笔？',type:'choice',options:shuffle(['撇','捺','横','竖']),answer:'撇',hints:['先撇后捺','撇在前面','撇'],explain:'笔顺规则：先撇后捺',topic:'笔顺',lv:1},
  {q:'"国"字的书写规则是？',type:'choice',options:shuffle(['先外后里再封口','先里后外','从左到右','从上到下']),answer:'先外后里再封口',hints:['全包围结构','先写框','先外后里再封口'],explain:'全包围字先外后里再封口',topic:'笔顺',lv:1},
  {q:'"问"字先写哪部分？',type:'choice',options:shuffle(['门','口','先写口','先写点']),answer:'门',hints:['半包围结构','先外后里','门'],explain:'半包围结构先写外面',topic:'笔顺',lv:1}
);

// -------- 英语：学习用品 --------
QB[1].english.push(
  {q:'pencil 是什么？',type:'choice',options:shuffle(['铅笔','钢笔','尺子','橡皮']),answer:'铅笔',hints:['p-e-n-c-i-l','写字用的','铅笔'],explain:'pencil = 铅笔',topic:'学习用品',lv:2},
  {q:'ruler 是什么？',type:'choice',options:shuffle(['铅笔','尺子','橡皮','书包']),answer:'尺子',hints:['r-u-l-e-r','画直线用的','尺子'],explain:'ruler = 尺子',topic:'学习用品',lv:2},
  {q:'eraser 是什么？',type:'choice',options:shuffle(['铅笔','尺子','橡皮','书']),answer:'橡皮',hints:['e-r-a-s-e-r','擦掉写错的','橡皮'],explain:'eraser = 橡皮',topic:'学习用品',lv:2},
  {q:'"书包"用英语怎么说？',type:'choice',options:shuffle(['bag','book','pen','desk']),answer:'bag',hints:['b-a-g','装书的','bag'],explain:'bag = 书包',topic:'学习用品',lv:2},
  {q:'book 是什么？',type:'choice',options:shuffle(['书','本子','笔','桌子']),answer:'书',hints:['b-o-o-k','看的读的','书'],explain:'book = 书',topic:'学习用品',lv:2}
);

// -------- 英语：食物饮料 --------
QB[1].english.push(
  {q:'milk 是什么？',type:'choice',options:shuffle(['牛奶','果汁','水','茶']),answer:'牛奶',hints:['m-i-l-k','白白的','牛奶'],explain:'milk = 牛奶',topic:'食物饮料',lv:2},
  {q:'cake 是什么？',type:'choice',options:shuffle(['蛋糕','面包','饼干','糖果']),answer:'蛋糕',hints:['c-a-k-e','过生日吃的','蛋糕'],explain:'cake = 蛋糕',topic:'食物饮料',lv:2},
  {q:'bread 是什么？',type:'choice',options:shuffle(['蛋糕','面包','米饭','面条']),answer:'面包',hints:['b-r-e-a-d','早餐常吃','面包'],explain:'bread = 面包',topic:'食物饮料',lv:2},
  {q:'egg 是什么？',type:'choice',options:shuffle(['鸡蛋','鸡肉','鱼肉','牛肉']),answer:'鸡蛋',hints:['e-g-g','母鸡下的','鸡蛋'],explain:'egg = 鸡蛋',topic:'食物饮料',lv:2},
  {q:'water 是什么？',type:'choice',options:shuffle(['水','牛奶','果汁','茶']),answer:'水',hints:['w-a-t-e-r','每天都要喝','水'],explain:'water = 水',topic:'食物饮料',lv:2}
);

// -------- 英语：玩具 --------
QB[1].english.push(
  {q:'ball 是什么？',type:'choice',options:shuffle(['球','娃娃','风筝','车']),answer:'球',hints:['b-a-l-l','圆圆的可以踢','球'],explain:'ball = 球',topic:'玩具',lv:2},
  {q:'kite 是什么？',type:'choice',options:shuffle(['球','风筝','娃娃','飞机']),answer:'风筝',hints:['k-i-t-e','在天上飞','风筝'],explain:'kite = 风筝',topic:'玩具',lv:2},
  {q:'doll 是什么？',type:'choice',options:shuffle(['娃娃','球','车','风筝']),answer:'娃娃',hints:['d-o-l-l','抱着玩的','娃娃'],explain:'doll = 娃娃',topic:'玩具',lv:2},
  {q:'"玩具车"用英语怎么说？',type:'choice',options:shuffle(['toy car','toy dog','toy cat','toy bird']),answer:'toy car',hints:['toy=玩具','car=车','toy car'],explain:'toy car = 玩具车',topic:'玩具',lv:2}
);

// -------- 英语：天气 --------
QB[1].english.push(
  {q:'sunny 是什么天气？',type:'choice',options:shuffle(['晴天','雨天','阴天','雪天']),answer:'晴天',hints:['sun=太阳','sunny=晴朗的','晴天'],explain:'sunny = 晴天',topic:'天气',lv:3},
  {q:'rainy 是什么天气？',type:'choice',options:shuffle(['晴天','雨天','阴天','雪天']),answer:'雨天',hints:['rain=雨','rainy=下雨的','雨天'],explain:'rainy = 雨天',topic:'天气',lv:3},
  {q:'cold 是什么意思？',type:'choice',options:shuffle(['冷的','热的','暖的','凉的']),answer:'冷的',hints:['c-o-l-d','冬天的感觉','冷的'],explain:'cold = 冷的',topic:'天气',lv:3},
  {q:'hot 是什么意思？',type:'choice',options:shuffle(['冷的','热的','暖的','凉的']),answer:'热的',hints:['h-o-t','夏天的感觉','热的'],explain:'hot = 热的',topic:'天气',lv:3},
  {q:'snowy 是什么天气？',type:'choice',options:shuffle(['晴天','雨天','多云','下雪']),answer:'下雪',hints:['snow=雪','snowy=下雪的','下雪'],explain:'snowy = 下雪天',topic:'天气',lv:3}
);

// -------- 英语：衣服 --------
QB[1].english.push(
  {q:'hat 是什么？',type:'choice',options:shuffle(['帽子','裤子','鞋子','裙子']),answer:'帽子',hints:['h-a-t','戴在头上','帽子'],explain:'hat = 帽子',topic:'衣服',lv:3},
  {q:'shoes 是什么？',type:'choice',options:shuffle(['帽子','裤子','鞋子','裙子']),answer:'鞋子',hints:['s-h-o-e-s','穿在脚上','鞋子'],explain:'shoes = 鞋子',topic:'衣服',lv:3},
  {q:'dress 是什么？',type:'choice',options:shuffle(['帽子','裤子','鞋子','连衣裙']),answer:'连衣裙',hints:['d-r-e-s-s','女孩穿的','连衣裙'],explain:'dress = 连衣裙',topic:'衣服',lv:3},
  {q:'"外套"用英语怎么说？',type:'choice',options:shuffle(['coat','hat','shoes','pants']),answer:'coat',hints:['c-o-a-t','天冷穿的','coat'],explain:'coat = 外套',topic:'衣服',lv:3}
);
