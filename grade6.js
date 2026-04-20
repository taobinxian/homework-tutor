// 六年级题库（人教版）
QB[6].math.push(
  {q:'圆半径5cm面积？(π取3.14)',type:'input',answer:'78.5',hints:['S=πr²','5²=25','3.14×25=78.5'],explain:'圆面积S=πr²',topic:'圆',lv:1},
  {q:'圆直径10cm周长？(π取3.14)',type:'input',answer:'31.4',hints:['C=πd','3.14×10','31.4'],explain:'圆周长C=πd=2πr',topic:'圆',lv:1},
  {q:'2/3×9=?',type:'input',answer:'6',hints:['分数×整数','2×9÷3','6'],explain:'分数乘整数分子乘整数除分母',topic:'分数乘法',lv:1},
  {q:'5÷2/3=?',type:'choice',options:shuffle(['15/2','10/3','5/6','3/10']),answer:'15/2',hints:['除以分数=乘以倒数','5×3/2','15/2'],explain:'除以分数等于乘以倒数',topic:'分数除法',lv:1},
  {q:'250元按3:2分给哥弟哥哥分多少？',type:'input',answer:'150',hints:['共3+2=5份','每份250÷5=50','哥哥3份50×3=150'],explain:'按比分配',topic:'比例',lv:2},
  {q:'衣服原价200元打8折多少元？',type:'input',answer:'160',hints:['8折=80%','200×0.8','160'],explain:'几折=百分之几十',topic:'百分数',lv:2},
  {q:'甲乙两地相距360km车4小时跑完速度？',type:'input',answer:'90',hints:['速度=路程÷时间','360÷4','90km/h'],explain:'v=s/t',topic:'行程问题',lv:2},
  {q:'圆柱底面半径2dm高5dm体积？(π=3.14)',type:'input',answer:'62.8',hints:['V=πr²h','3.14×4×5','62.8'],explain:'圆柱体积V=πr²h',topic:'圆柱体',lv:3},
  {q:'解方程3x+5=20',type:'input',answer:'5',hints:['3x=15','x=5','5'],explain:'解方程',topic:'方程',lv:3},
  {q:'解方程x/4=12',type:'input',answer:'48',hints:['x=12×4','x=48','48'],explain:'解方程',topic:'方程',lv:3},
  {q:'鸡兔共20只56条腿鸡几只？',type:'input',answer:'12',hints:['假设全鸡40腿','多56-40=16腿','每换一只兔多2腿16÷2=8兔12鸡'],explain:'鸡兔同笼',topic:'鸡兔同笼',lv:3},
  {q:'圆锥底面半径3cm高4cm体积？(π=3.14)',type:'input',answer:'37.68',hints:['V=1/3×πr²h','1/3×3.14×9×4','37.68'],explain:'圆锥体积=1/3×底面积×高',topic:'圆锥',lv:3}
);
QB[6].chinese.push(
  {q:'"穷则独善其身达则兼济天下"出自？',type:'choice',options:shuffle(['论语','孟子','大学','诗经']),answer:'孟子',hints:['儒家思想','孟子','孟子'],explain:'《孟子》',topic:'文学常识',lv:1},
  {q:'"学弈"中弈是什么意思？',type:'choice',options:shuffle(['下棋','学习','射箭','游泳']),answer:'下棋',hints:['弈=下棋','学弈=学下棋','下棋'],explain:'弈=下棋',topic:'文言文',lv:1},
  {q:'"两小儿辩日"出自？',type:'choice',options:shuffle(['列子','论语','孟子','庄子']),answer:'列子',hints:['两个小孩争论太阳','列子·汤问','列子'],explain:'《列子·汤问》',topic:'文言文',lv:1},
  {q:'"春风桃李花开日秋雨梧桐叶落时"用了？',type:'choice',options:shuffle(['比喻','拟人','对偶','夸张']),answer:'对偶',hints:['字数相等词性相同','两两相对','对偶'],explain:'对偶字数词性意义相对',topic:'修辞',lv:2},
  {q:'"红军不怕远征难"出自？',type:'choice',options:shuffle(['七律长征','沁园春雪','清平乐','菩萨蛮']),answer:'七律长征',hints:['毛泽东','万水千山只等闲','七律长征'],explain:'毛泽东《七律·长征》',topic:'诗词',lv:2},
  {q:'"千锤万凿出深山"出自哪首诗？',type:'choice',options:shuffle(['石灰吟','竹石','夏日绝句','泊秦淮']),answer:'石灰吟',hints:['于谦','粉骨碎身浑不怕','石灰吟'],explain:'于谦《石灰吟》',topic:'诗词',lv:2},
  {q:'《西游记》作者？',type:'choice',options:shuffle(['吴承恩','罗贯中','施耐庵','曹雪芹']),answer:'吴承恩',hints:['唐僧取经','孙悟空','吴承恩'],explain:'四大名著作者',topic:'名著',lv:2},
  {q:'议论文的三要素是？',type:'choice',options:shuffle(['论点论据论证','时间地点人物','开头经过结尾','起因经过结果']),answer:'论点论据论证',hints:['议论文核心','论点论据论证','论点论据论证'],explain:'议论文三要素',topic:'议论文',lv:3}
);
QB[6].english.push(
  {q:'"She _____ go tomorrow."她明天会去',type:'choice',options:shuffle(['will','is','was','did']),answer:'will',hints:['tomorrow=明天','将来时','will'],explain:'一般将来时will+动词原形',topic:'将来时',lv:1},
  {q:'"I have _____ finished."我已经完成了',type:'choice',options:shuffle(['already','yet','never','always']),answer:'already',hints:['已经=already','完成时','already'],explain:'现在完成时have+过去分词',topic:'完成时',lv:2},
  {q:'"The book _____ by him."这本书被他写的',type:'choice',options:shuffle(['writes','wrote','is written','written']),answer:'is written',hints:['被动=be+过去分词','is written','is written'],explain:'被动语态',topic:'被动语态',lv:2},
  {q:'"If it _____ tomorrow we will stay home."',type:'choice',options:shuffle(['rain','rains','will rain','rained']),answer:'rains',hints:['if从句用一般现在时','三单加s','rains'],explain:'主将从现',topic:'条件句',lv:3},
  {q:'good的最高级？',type:'choice',options:shuffle(['gooder','goodest','better','best']),answer:'best',hints:['不规则','good-better-best','best'],explain:'不规则变化',topic:'最高级',lv:3},
  {q:'与finally意思最接近的是？',type:'choice',options:shuffle(['first','at last','sometimes','again']),answer:'at last',hints:['finally=最后','at last也是终于','at last'],explain:'近义词finally/at last',topic:'近义词',lv:3}
);
QB[6].science.push(
  {q:'地球内部从外到内？',type:'choice',options:shuffle(['地核地幔地壳','地壳地幔地核','地幔地壳地核','地壳地核地幔']),answer:'地壳地幔地核',hints:['最外面地壳','中间地幔','地壳→地幔→地核'],explain:'地球圈层',topic:'地球',lv:1},
  {q:'太阳系离太阳最近的行星？',type:'choice',options:shuffle(['金星','地球','水星','火星']),answer:'水星',hints:['水金地火木土天海','最近的','水星'],explain:'行星排序',topic:'天文',lv:1},
  {q:'下列哪个是可再生能源？',type:'choice',options:shuffle(['煤','石油','太阳能','天然气']),answer:'太阳能',hints:['可再生用不完','太阳每天都有','太阳能'],explain:'太阳能风能水能可再生',topic:'能源',lv:2},
  {q:'废旧电池属于什么垃圾？',type:'choice',options:shuffle(['可回收','厨余','有害','其他']),answer:'有害',hints:['电池含有毒物质','污染环境','有害垃圾'],explain:'废电池有害垃圾',topic:'环保',lv:2},
  {q:'湿手可以触摸开关吗？',type:'choice',options:shuffle(['可以','不可以','戴手套可以','看情况']),answer:'不可以',hints:['水导电','触电危险','不可以'],explain:'用电安全',topic:'安全',lv:3}
);
// 补充更多题目
for(let i=0;i<8;i++){const a=rand(10,90),b=rand(10,99-a),s=a+b;QB[6].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意进位',a+'+'+b+'='+s],explain:'加法练习',topic:'加减法',lv:1});}
for(let i=0;i<8;i++){const a=rand(30,99),b=rand(10,a-5),s=a-b;QB[6].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意退位',a+'-'+b+'='+s],explain:'减法练习',topic:'加减法',lv:1});}
// === 六年级补充 ===
for(let i=0;i<6;i++){const a=rand(2,9),b=rand(2,9);QB[6].math.push({q:a+'/'+b+' × '+(b*rand(2,5))+' = ?',type:'input',answer:String(a*rand(2,5)),hints:['分数乘整数','分子乘整数除分母','计算'],explain:'分数乘法',topic:'分数乘法',lv:1});}
QB[6].math.push(
  {q:'3:5的比值是？',type:'choice',options:shuffle(['0.6','1.5','3/5','5/3']),answer:'0.6',hints:['3÷5','0.6','0.6'],explain:'比值=前项÷后项',topic:'比',lv:1},
  {q:'12:8的最简比？',type:'choice',options:shuffle(['3:2','6:4','12:8','2:3']),answer:'3:2',hints:['同除以4','3:2','3:2'],explain:'最简比公因数除尽',topic:'比',lv:1},
  {q:'圆周率π约等于？',type:'choice',options:shuffle(['3.14','3.41','2.14','4.14']),answer:'3.14',hints:['π≈3.14','圆周率','3.14'],explain:'π≈3.14159...',topic:'圆',lv:1},
  {q:'半径4cm的圆周长？(π=3.14)',type:'input',answer:'25.12',hints:['C=2πr','2×3.14×4','25.12'],explain:'C=2πr',topic:'圆',lv:2},
  {q:'25%化成分数？',type:'choice',options:shuffle(['1/4','1/5','2/5','3/4']),answer:'1/4',hints:['25%=25/100','约分','1/4'],explain:'百分数化分数',topic:'百分数',lv:2},
  {q:'0.75化成百分数？',type:'choice',options:shuffle(['7.5%','75%','0.75%','750%']),answer:'75%',hints:['0.75×100','75%','75%'],explain:'小数×100=百分数',topic:'百分数',lv:2},
  {q:'原价100元涨价20%现价？',type:'input',answer:'120',hints:['20%×100=20','100+20','120元'],explain:'涨价=原价×(1+百分比)',topic:'百分数',lv:2},
  {q:'y=3x中x增大y怎样？',type:'choice',options:shuffle(['增大','减小','不变','不确定']),answer:'增大',hints:['正比例','x大y也大','增大'],explain:'正比例y/x=k(k>0)',topic:'正反比例',lv:3},
  {q:'xy=12中x增大y怎样？',type:'choice',options:shuffle(['增大','减小','不变','不确定']),answer:'减小',hints:['反比例','x大y小','减小'],explain:'反比例xy=k',topic:'正反比例',lv:3},
  {q:'圆柱底面直径4cm高10cm侧面积？(π=3.14)',type:'input',answer:'125.6',hints:['侧面积=周长×高','3.14×4×10','125.6'],explain:'侧面积=πdh',topic:'圆柱',lv:3},
  {q:'圆锥体积是等底等高圆柱的？',type:'choice',options:shuffle(['1/2','1/3','1/4','相等']),answer:'1/3',hints:['圆锥=1/3圆柱','三分之一','1/3'],explain:'V锥=1/3V柱',topic:'圆锥',lv:3},
  {q:'比例尺1:50000图上2cm实际？',type:'input',answer:'1000',hints:['2×50000=100000cm','100000cm=1000m','1000米=1千米'],explain:'实际距离=图上×比例尺',topic:'比例尺',lv:3}
);
QB[6].chinese.push(
  {q:'"学弈"中"弈"的意思？',type:'choice',options:shuffle(['下棋','学习','射箭','游泳']),answer:'下棋',hints:['弈=下棋','学弈=学下棋','下棋'],explain:'弈=下棋',topic:'文言文',lv:1},
  {q:'"之"在"学而时习之"中的意思？',type:'choice',options:shuffle(['它/知识','的','去','助词']),answer:'它/知识',hints:['习之=复习它','之=代词','它/知识'],explain:'之作代词',topic:'文言虚词',lv:1},
  {q:'"以"在"以为"中的意思？',type:'choice',options:shuffle(['认为','用','凭借','因为']),answer:'认为',hints:['以为=认为','以=认为','认为'],explain:'以为=认为/以为',topic:'文言虚词',lv:1},
  {q:'"望梅止渴"的典故主人公？',type:'choice',options:shuffle(['曹操','诸葛亮','刘备','关羽']),answer:'曹操',hints:['三国时期','行军口渴','曹操'],explain:'曹操望梅止渴',topic:'成语典故',lv:1},
  {q:'"粉骨碎身浑不怕要留清白在人间"的意思？',type:'choice',options:shuffle(['不怕牺牲保持清白','喜欢石灰','怕疼','不想活了']),answer:'不怕牺牲保持清白',hints:['石灰吟','于谦','气节'],explain:'于谦以石灰喻气节',topic:'诗词鉴赏',lv:2},
  {q:'"千磨万击还坚劲"出自？',type:'choice',options:shuffle(['竹石','石灰吟','夏日绝句','泊秦淮']),answer:'竹石',hints:['郑燮','任尔东西南北风','竹石'],explain:'郑燮《竹石》',topic:'诗词鉴赏',lv:2},
  {q:'"生当作人杰死亦为鬼雄"出自？',type:'choice',options:shuffle(['竹石','石灰吟','夏日绝句','七律长征']),answer:'夏日绝句',hints:['李清照','至今思项羽','夏日绝句'],explain:'李清照《夏日绝句》',topic:'诗词鉴赏',lv:2},
  {q:'《水浒传》作者？',type:'choice',options:shuffle(['吴承恩','罗贯中','施耐庵','曹雪芹']),answer:'施耐庵',hints:['108好汉','梁山','施耐庵'],explain:'四大名著作者',topic:'名著',lv:2},
  {q:'《三国演义》中"三顾茅庐"请的是谁？',type:'choice',options:shuffle(['诸葛亮','关羽','张飞','赵云']),answer:'诸葛亮',hints:['刘备请军师','卧龙','诸葛亮'],explain:'刘备三顾茅庐请诸葛亮',topic:'名著',lv:2},
  {q:'论点在议论文中的作用？',type:'choice',options:shuffle(['提出主张','证明观点','叙述事实','描写景物']),answer:'提出主张',hints:['议论文的灵魂','作者的观点','提出主张'],explain:'论点是作者的主张',topic:'议论文',lv:3},
  {q:'"欲扬先抑"是什么写法？',type:'choice',options:shuffle(['先贬后褒','先褒后贬','一直夸','一直贬']),answer:'先贬后褒',hints:['先说缺点再说优点','对比更突出','先贬后褒'],explain:'欲扬先抑先贬后褒突出赞美',topic:'写作方法',lv:3},
  {q:'"以小见大"是什么手法？',type:'choice',options:shuffle(['通过小事反映大主题','只写小事','不写大事','大事化小']),answer:'通过小事反映大主题',hints:['小切口大主题','以小见大','通过小事反映大主题'],explain:'以小见大通过细节反映宏大主题',topic:'写作方法',lv:3}
);
QB[6].english.push(
  {q:'"I will _____ there tomorrow."我明天会去那里',type:'choice',options:shuffle(['go','going','went','goes']),answer:'go',hints:['will+动词原形','will go','go'],explain:'将来时will+原形',topic:'将来时',lv:1},
  {q:'go的过去式？',type:'choice',options:shuffle(['goed','went','gone','going']),answer:'went',hints:['不规则','go→went','went'],explain:'go→went→gone',topic:'过去时',lv:1},
  {q:'see的过去式？',type:'choice',options:shuffle(['seed','saw','seen','seeing']),answer:'saw',hints:['不规则','see→saw','saw'],explain:'see→saw→seen',topic:'过去时',lv:1},
  {q:'"I have _____ this book."我读过这本书',type:'choice',options:shuffle(['read','reading','reads','readed']),answer:'read',hints:['have+过去分词','read不变','read'],explain:'完成时have+过去分词',topic:'完成时',lv:2},
  {q:'"English is _____ all over the world."英语被全世界使用',type:'choice',options:shuffle(['speak','spoke','spoken','speaking']),answer:'spoken',hints:['被动语态','is+过去分词','spoken'],explain:'被动语态is spoken',topic:'被动语态',lv:2},
  {q:'"If it rains I _____ stay home."如果下雨我就待在家',type:'choice',options:shuffle(['will','would','am','do']),answer:'will',hints:['主将从现','主句will','will'],explain:'If从句现在时主句will',topic:'条件句',lv:3},
  {q:'"He said he _____ a student."他说他是学生',type:'choice',options:shuffle(['is','was','are','were']),answer:'was',hints:['间接引语','时态后移','was'],explain:'宾语从句时态一致',topic:'宾语从句',lv:3},
  {q:'happy的反义词？',type:'choice',options:shuffle(['sad','glad','excited','angry']),answer:'sad',hints:['开心↔伤心','happy↔sad','sad'],explain:'happy↔sad',topic:'反义词',lv:1},
  {q:'big的反义词？',type:'choice',options:shuffle(['small','large','tall','short']),answer:'small',hints:['大↔小','big↔small','small'],explain:'big↔small',topic:'反义词',lv:1},
  {q:'begin的近义词？',type:'choice',options:shuffle(['start','end','stop','finish']),answer:'start',hints:['开始','begin=start','start'],explain:'begin=start',topic:'近义词',lv:2}
);
QB[6].science.push(
  {q:'日食时月球在哪？',type:'choice',options:shuffle(['太阳和地球之间','地球和太阳之间','地球背后','太阳背后']),answer:'太阳和地球之间',hints:['月球挡住阳光','日食','太阳和地球之间'],explain:'日食：月球在太阳和地球之间',topic:'天文',lv:1},
  {q:'八大行星中最大的？',type:'choice',options:shuffle(['地球','火星','木星','土星']),answer:'木星',hints:['太阳系最大行星','气态巨行星','木星'],explain:'木星是最大行星',topic:'天文',lv:2},
  {q:'煤石油天然气是什么能源？',type:'choice',options:shuffle(['可再生','不可再生','永久','无限']),answer:'不可再生',hints:['用完就没了','化石能源','不可再生'],explain:'化石能源不可再生',topic:'能源',lv:2},
  {q:'温室效应主要由什么气体引起？',type:'choice',options:shuffle(['氧气','二氧化碳','氮气','氢气']),answer:'二氧化碳',hints:['CO2','温室气体','二氧化碳'],explain:'二氧化碳是主要温室气体',topic:'环保',lv:3},
  {q:'生物多样性包括哪三个层次？',type:'choice',options:shuffle(['基因多样性物种多样性生态系统多样性','动物植物微生物','天上地上水里','大中小']),answer:'基因多样性物种多样性生态系统多样性',hints:['三个层次','基因物种生态系统','基因物种生态系统多样性'],explain:'生物多样性三层次',topic:'生物多样性',lv:3}
);
// === 六年级补充 ===
QB[6].math.push(
  {q:'5/6×3/10=?',type:'choice',options:shuffle(['1/4','15/60','5/20','3/12']),answer:'1/4',hints:['5×3=15 6×10=60','15/60','约分=1/4'],explain:'分数乘法先乘再约分',topic:'分数乘法',lv:1},
  {q:'3/4÷1/2=?',type:'choice',options:shuffle(['3/8','3/2','6/4','1/2']),answer:'3/2',hints:['除以分数=乘倒数','3/4×2/1','3/2'],explain:'分数除法乘倒数',topic:'分数除法',lv:1},
  {q:'5:8的比值？',type:'input',answer:'0.625',hints:['5÷8','0.625','0.625'],explain:'比值=前项÷后项',topic:'比',lv:1},
  {q:'3/8化成百分数？',type:'choice',options:shuffle(['37.5%','38%','30%','35%']),answer:'37.5%',hints:['3÷8=0.375','0.375×100%','37.5%'],explain:'分数化百分数先除再乘100',topic:'百分数',lv:2},
  {q:'打折:原价500元打7折现价？',type:'input',answer:'350',hints:['7折=70%','500×0.7','350'],explain:'打折价=原价×折数',topic:'百分数',lv:2},
  {q:'利润率:(成本100卖120)利润率？',type:'choice',options:shuffle(['20%','120%','80%','12%']),answer:'20%',hints:['利润=120-100=20','20÷100×100%','20%'],explain:'利润率=利润÷成本×100%',topic:'百分数',lv:3},
  {q:'x/5=y/3则x:y=?',type:'choice',options:shuffle(['5:3','3:5','15:1','1:15']),answer:'5:3',hints:['x=5k y=3k','x:y=5:3','5:3'],explain:'比例关系',topic:'比例',lv:3},
  {q:'1/2x+1/3x=5求x',type:'input',answer:'6',hints:['5/6x=5','x=5×6/5','x=6'],explain:'解方程',topic:'方程',lv:3}
);
QB[6].chinese.push(
  {q:'"而"在"学而时习之"中的意思？',type:'choice',options:shuffle(['然后/并且','但是','你','的']),answer:'然后/并且',hints:['学了然后复习','连接词','然后/并且'],explain:'而=然后并且',topic:'文言虚词',lv:1},
  {q:'"其"在"其人"中的意思？',type:'choice',options:shuffle(['他的/那个','其他','难道','大概']),answer:'他的/那个',hints:['其人=那个人','代词','他的/那个'],explain:'其=他的/那个',topic:'文言虚词',lv:1},
  {q:'"铁杵成针"告诉我们什么？',type:'choice',options:shuffle(['只要坚持就能成功','铁很硬','针很尖','磨刀技术好']),answer:'只要坚持就能成功',hints:['李白小时候的故事','坚持不懈','只要坚持就能成功'],explain:'坚持不懈终能成功',topic:'成语典故',lv:1},
  {q:'"任尔东西南北风"出自？',type:'choice',options:shuffle(['竹石','石灰吟','夏日绝句','七律长征']),answer:'竹石',hints:['郑燮','咬定青山不放松','竹石'],explain:'郑燮《竹石》',topic:'诗词',lv:2},
  {q:'"五岭逶迤腾细浪"出自？',type:'choice',options:shuffle(['七律长征','竹石','石灰吟','夏日绝句']),answer:'七律长征',hints:['毛泽东','红军不怕远征难','七律长征'],explain:'毛泽东《七律·长征》',topic:'诗词',lv:2},
  {q:'《红楼梦》的作者？',type:'choice',options:shuffle(['曹雪芹','罗贯中','吴承恩','施耐庵']),answer:'曹雪芹',hints:['贾宝玉林黛玉','四大名著','曹雪芹'],explain:'曹雪芹《红楼梦》',topic:'名著',lv:2},
  {q:'《鲁滨逊漂流记》作者？',type:'choice',options:shuffle(['笛福','马克吐温','安徒生','格林']),answer:'笛福',hints:['英国作家','荒岛求生','笛福'],explain:'笛福《鲁滨逊漂流记》',topic:'名著',lv:2},
  {q:'论据分为哪两种？',type:'choice',options:shuffle(['事实论据和道理论据','大论据和小论据','正面和反面','直接和间接']),answer:'事实论据和道理论据',hints:['事实和道理','两种论据','事实论据和道理论据'],explain:'事实论据+道理论据',topic:'议论文',lv:3},
  {q:'"借物喻人"是什么手法？',type:'choice',options:shuffle(['通过描写某物赞美人的品质','借东西','画物','写景']),answer:'通过描写某物赞美人的品质',hints:['写竹石赞美坚韧','物→人','通过物赞美人'],explain:'借物喻人托物言志',topic:'写作方法',lv:3}
);
QB[6].english.push(
  {q:'do的过去式？',type:'choice',options:shuffle(['doed','did','done','doing']),answer:'did',hints:['不规则','do→did','did'],explain:'do→did→done',topic:'过去时',lv:1},
  {q:'have的过去式？',type:'choice',options:shuffle(['haved','had','haven','having']),answer:'had',hints:['不规则','have→had','had'],explain:'have→had→had',topic:'过去时',lv:1},
  {q:'make的过去式？',type:'choice',options:shuffle(['maked','made','maken','making']),answer:'made',hints:['不规则','make→made','made'],explain:'make→made→made',topic:'过去时',lv:1},
  {q:'"She has _____ to Beijing."她去过北京',type:'choice',options:shuffle(['been','gone','go','went']),answer:'been',hints:['have been to=去过','has been','been'],explain:'have been to去过(回来了)',topic:'完成时',lv:2},
  {q:'"The window was _____ by the boy."',type:'choice',options:shuffle(['break','broke','broken','breaking']),answer:'broken',hints:['被动语态','was+过去分词','broken'],explain:'被动语态be+过去分词',topic:'被动语态',lv:2},
  {q:'"If you study hard you _____ pass the exam."',type:'choice',options:shuffle(['will','would','can','could']),answer:'will',hints:['主将从现','will+原形','will'],explain:'条件句主句用will',topic:'条件句',lv:3},
  {q:'"I think _____ she is right."我觉得她是对的',type:'choice',options:shuffle(['that','what','which','who']),answer:'that',hints:['宾语从句','I think that','that'],explain:'宾语从句用that',topic:'宾语从句',lv:3},
  {q:'beautiful的反义词？',type:'choice',options:shuffle(['ugly','pretty','nice','lovely']),answer:'ugly',hints:['美↔丑','beautiful↔ugly','ugly'],explain:'beautiful↔ugly',topic:'反义词',lv:2},
  {q:'difficult的近义词？',type:'choice',options:shuffle(['hard','easy','simple','fun']),answer:'hard',hints:['困难','difficult=hard','hard'],explain:'difficult=hard',topic:'近义词',lv:2}
);
QB[6].science.push(
  {q:'月食时什么挡住了光？',type:'choice',options:shuffle(['地球','月球','太阳','星星']),answer:'地球',hints:['月食=地球挡住阳光','地球在中间','地球'],explain:'月食地球挡住照向月球的光',topic:'天文',lv:1},
  {q:'水力发电属于什么能源利用？',type:'choice',options:shuffle(['可再生','不可再生','核能','化石能源']),answer:'可再生',hints:['水循环','用不完','可再生'],explain:'水能是可再生能源',topic:'能源',lv:2},
  {q:'减少白色污染最好的方法？',type:'choice',options:shuffle(['减少使用塑料制品','多烧垃圾','埋在地下','扔进河里']),answer:'减少使用塑料制品',hints:['塑料难降解','减少使用','减少使用塑料制品'],explain:'从源头减少塑料使用',topic:'环保',lv:3},
  {q:'三角形结构比四边形稳定因为？',type:'choice',options:shuffle(['三角形不易变形','三角形好看','三角形面积大','三角形角度大']),answer:'三角形不易变形',hints:['三角形具有稳定性','不易变形','三角形不易变形'],explain:'三角形不易变形工程常用',topic:'工程',lv:3}
);
// === 补充6年级 ===
QB[6].math.push(
  {q:'2/5÷4/5=?',type:'choice',options:shuffle(['1/2','8/25','2/4','8/5']),answer:'1/2',hints:['除以分数乘倒数','2/5×5/4','10/20=1/2'],explain:'分数除法',topic:'分数除法',lv:1},
  {q:'半径3cm圆面积？(π=3.14)',type:'input',answer:'28.26',hints:['S=πr²','3.14×9','28.26'],explain:'圆面积',topic:'圆',lv:1},
  {q:'直径8cm圆周长？(π=3.14)',type:'input',answer:'25.12',hints:['C=πd','3.14×8','25.12'],explain:'圆周长',topic:'圆',lv:2},
  {q:'40%化成分数？',type:'choice',options:shuffle(['2/5','4/10','40/10','4/5']),answer:'2/5',hints:['40%=40/100','约分','2/5'],explain:'百分数化分数',topic:'百分数',lv:2},
  {q:'y=12/x中x增大y怎样？',type:'choice',options:shuffle(['增大','减小','不变','不确定']),answer:'减小',hints:['反比例','xy=12','x大y小'],explain:'反比例y=k/x',topic:'正反比例',lv:3},
  {q:'圆柱底面半径3cm高8cm体积？(π=3.14)',type:'input',answer:'226.08',hints:['V=πr²h','3.14×9×8','226.08'],explain:'圆柱体积',topic:'圆柱',lv:3},
  {q:'比例尺1:200000图上3cm实际？',type:'input',answer:'6',hints:['3×200000=600000cm','600000cm=6km','6千米'],explain:'图上×比例尺=实际',topic:'比例尺',lv:3},
  {q:'8个抽屉放9双袜子至少有一个抽屉有2双以上因为？',type:'choice',options:shuffle(['抽屉原理','概率','巧合','不一定']),answer:'抽屉原理',hints:['9>8','鸽巢原理','抽屉原理'],explain:'抽屉原理n+1个物品放n个抽屉',topic:'数学广角',lv:3}
);
QB[6].chinese.push(
  {q:'"学而不思则罔思而不学则殆"出自？',type:'choice',options:shuffle(['论语','孟子','大学','中庸']),answer:'论语',hints:['孔子','学习方法','论语'],explain:'《论语》',topic:'文言文',lv:1},
  {q:'"为"在"为人民服务"中的意思？',type:'choice',options:shuffle(['替/给','做','是','因为']),answer:'替/给',hints:['为=替/给','为人民=替人民','替/给'],explain:'为=替给',topic:'文言虚词',lv:1},
  {q:'"金戈铁马"形容什么？',type:'choice',options:shuffle(['战争场面','和平生活','做生意','种地']),answer:'战争场面',hints:['金戈=武器','铁马=战马','战争场面'],explain:'形容战争壮烈场面',topic:'成语典故',lv:1},
  {q:'"卷地风来忽吹散"出自？',type:'choice',options:shuffle(['六月二十七日望湖楼醉书','七律长征','石灰吟','竹石']),answer:'六月二十七日望湖楼醉书',hints:['苏轼','暴风雨','六月二十七日望湖楼醉书'],explain:'苏轼写暴风雨',topic:'诗词',lv:2},
  {q:'"茅檐长扫净无苔"出自？',type:'choice',options:shuffle(['书湖阴先生壁','石灰吟','竹石','夏日绝句']),answer:'书湖阴先生壁',hints:['王安石','田园诗','书湖阴先生壁'],explain:'王安石《书湖阴先生壁》',topic:'诗词',lv:2},
  {q:'《水浒传》中"智取生辰纲"的主要人物？',type:'choice',options:shuffle(['吴用晁盖','宋江','林冲','武松']),answer:'吴用晁盖',hints:['智多星吴用','托塔天王晁盖','吴用晁盖'],explain:'智取生辰纲',topic:'名著',lv:2},
  {q:'论证方法有哪些？',type:'choice',options:shuffle(['举例论证道理论证比喻论证对比论证','只有举例','只有道理','没有方法']),answer:'举例论证道理论证比喻论证对比论证',hints:['四种主要方法','举例道理比喻对比','四种'],explain:'四种论证方法',topic:'议论文',lv:3},
  {q:'"开门见山"是什么写作方法？',type:'choice',options:shuffle(['直接点题不绕弯子','描写大山','打开门','先写景']),answer:'直接点题不绕弯子',hints:['文章开头直奔主题','不铺垫','直接点题'],explain:'开头直接切入主题',topic:'写作方法',lv:3}
);
QB[6].english.push(
  {q:'give的过去式？',type:'choice',options:shuffle(['gived','gave','given','giving']),answer:'gave',hints:['不规则','give→gave','gave'],explain:'give→gave→given',topic:'过去时',lv:1},
  {q:'take的过去式？',type:'choice',options:shuffle(['taked','took','taken','taking']),answer:'took',hints:['不规则','take→took','took'],explain:'take→took→taken',topic:'过去时',lv:1},
  {q:'think的过去式？',type:'choice',options:shuffle(['thinked','thought','thinking','thinks']),answer:'thought',hints:['不规则','think→thought','thought'],explain:'think→thought→thought',topic:'过去时',lv:1},
  {q:'"He has _____ lived here for 5 years."他已经住这5年了',type:'choice',options:shuffle(['already','yet','just','never']),answer:'already',hints:['已经=already','肯定句','already'],explain:'already用于肯定句',topic:'完成时',lv:2},
  {q:'"The car _____ made in Japan."这车日本制造',type:'choice',options:shuffle(['is','was','are','were']),answer:'was',hints:['过去被制造','过去时被动','was'],explain:'过去时被动was+过去分词',topic:'被动语态',lv:2},
  {q:'cheap的反义词？',type:'choice',options:shuffle(['expensive','cheap','free','new']),answer:'expensive',hints:['便宜↔贵','cheap↔expensive','expensive'],explain:'cheap↔expensive',topic:'反义词',lv:2},
  {q:'remember的反义词？',type:'choice',options:shuffle(['forget','remember','think','know']),answer:'forget',hints:['记住↔忘记','remember↔forget','forget'],explain:'remember↔forget',topic:'反义词',lv:2},
  {q:'"He told me _____ he was busy."他告诉我他很忙',type:'choice',options:shuffle(['that','what','who','where']),answer:'that',hints:['宾语从句','told me that','that'],explain:'宾语从句that可省略',topic:'宾语从句',lv:3}
);
QB[6].science.push(
  {q:'地球绕太阳转一圈约多少天？',type:'choice',options:shuffle(['30天','180天','365天','730天']),answer:'365天',hints:['一年','公转周期','365天'],explain:'公转周期约365天',topic:'天文',lv:1},
  {q:'风能属于什么能源？',type:'choice',options:shuffle(['可再生','不可再生','核能','化石']),answer:'可再生',hints:['风一直有','用不完','可再生'],explain:'风能是可再生能源',topic:'能源',lv:2},
  {q:'保护环境最根本的方法？',type:'choice',options:shuffle(['减少污染源头治理','只靠政府','等自然恢复','搬到其他星球']),answer:'减少污染源头治理',hints:['预防为主','从源头减少','减少污染源头治理'],explain:'源头治理最有效',topic:'环保',lv:3}
);
