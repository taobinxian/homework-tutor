// 四年级题库（人教版）
QB[4].math.push(
  {q:'三百二十万零五百写作？',type:'input',answer:'3200500',hints:['三百二十万=3200000','加五百','3200500'],explain:'大数的写法',topic:'大数的认识',lv:1},
  {q:'45600000读作？',type:'choice',options:shuffle(['四千五百六十万','四百五十六万','四千五百六万','四万五千六百']),answer:'四千五百六十万',hints:['从高位读起','4560个万','四千五百六十万'],explain:'大数的读法',topic:'大数的认识',lv:1},
  {q:'125×24=?',type:'input',answer:'3000',hints:['125×8=1000','24=8×3','1000×3=3000'],explain:'简便运算125×8=1000',topic:'三位数乘两位数',lv:1},
  {q:'直线上两点确定几条直线？',type:'choice',options:shuffle(['1条','2条','无数条','0条']),answer:'1条',hints:['两点之间','只有一条直线','1条'],explain:'两点确定一条直线',topic:'平行与垂直',lv:1},
  {q:'平行四边形底8cm高5cm面积？',type:'input',answer:'40',hints:['面积=底×高','8×5','40'],explain:'平行四边形面积=底×高',topic:'面积',lv:2},
  {q:'梯形上底3下底7高4面积？',type:'input',answer:'20',hints:['(上底+下底)×高÷2','(3+7)×4÷2','20'],explain:'梯形面积=(上底+下底)×高÷2',topic:'面积',lv:2},
  {q:'25×4×7简便算？',type:'input',answer:'700',hints:['先算25×4=100','100×7','700'],explain:'25×4=100要记住',topic:'简便运算',lv:2},
  {q:'78×99+78简便算？',type:'input',answer:'7800',hints:['78×99+78×1','78×(99+1)','78×100=7800'],explain:'乘法分配律',topic:'简便运算',lv:2},
  {q:'3.5+2.8=?',type:'input',answer:'6.3',hints:['小数点对齐','35+28=63','6.3'],explain:'小数加法小数点对齐',topic:'小数加减法',lv:2},
  {q:'鸡兔共10只26条腿，鸡几只？',type:'input',answer:'7',hints:['假设全是鸡20条腿','多26-20=6条腿','每换一只兔多2条腿6÷2=3只兔7只鸡'],explain:'鸡兔同笼假设法',topic:'鸡兔同笼',lv:3},
  {q:'甲乙相距240km甲60km/h乙40km/h相向而行几小时相遇？',type:'input',answer:'2.4',hints:['速度和=60+40=100','时间=路程÷速度和','240÷100=2.4'],explain:'相遇时间=路程÷速度和',topic:'行程问题',lv:3},
  {q:'10棵树种一排每两棵间隔3米全长？',type:'input',answer:'27',hints:['10棵树有9个间隔','9×3','27米'],explain:'植树问题间隔数=棵数-1',topic:'植树问题',lv:3}
);
QB[4].chinese.push(
  {q:'"举世闻名"里举是什么意思？',type:'choice',options:shuffle(['举起','全','举行','推荐']),answer:'全',hints:['举世=全世界','举=全部','全'],explain:'成语字义',topic:'字义辨析',lv:1},
  {q:'下面是比喻句的是？',type:'choice',options:shuffle(['弟弟好像听懂了','她长得像妈妈','月亮像银盘','他好像在哪见过']),answer:'月亮像银盘',hints:['比喻用不同事物描写','同类不是比喻','月亮像银盘'],explain:'比喻本体喻体本质不同',topic:'修辞',lv:2},
  {q:'"这座桥有1700多年历史"用了什么说明方法？',type:'choice',options:shuffle(['列数字','打比方','作比较','举例子']),answer:'列数字',hints:['用了具体数字','1700多年','列数字'],explain:'用数字说明是列数字',topic:'说明方法',lv:2},
  {q:'"不识庐山真面目"下一句？',type:'choice',options:shuffle(['只缘身在此山中','更上一层楼','春风送暖入屠苏','山重水复疑无路']),answer:'只缘身在此山中',hints:['题西林壁','苏轼','只缘身在此山中'],explain:'苏轼《题西林壁》',topic:'古诗',lv:2},
  {q:'"山重水复疑无路"下一句？',type:'choice',options:shuffle(['柳暗花明又一村','只缘身在此山中','欲穷千里目','处处闻啼鸟']),answer:'柳暗花明又一村',hints:['游山西村','陆游','柳暗花明又一村'],explain:'陆游《游山西村》',topic:'古诗',lv:2},
  {q:'"我们一定要认真地学习态度"这句话的问题？',type:'choice',options:shuffle(['搭配不当','语序不对','用词重复','缺少主语']),answer:'搭配不当',hints:['学习态度搭配不对','应该是端正态度','搭配不当'],explain:'动宾搭配要恰当',topic:'修改病句',lv:3}
);
QB[4].english.push(
  {q:'"What are you doing?" "I am _____."正在读书',type:'choice',options:shuffle(['reading','read','reads','to read']),answer:'reading',hints:['现在进行时','am+doing','reading'],explain:'现在进行时be+doing',topic:'现在进行时',lv:1},
  {q:'"He _____ football every day."填？',type:'choice',options:shuffle(['play','plays','playing','played']),answer:'plays',hints:['He三单','动词加s','plays'],explain:'三单动词加s',topic:'三单',lv:2},
  {q:'"There _____ a book on the desk."填？',type:'choice',options:shuffle(['is','are','am','be']),answer:'is',hints:['a book单数','用is','is'],explain:'There be就近原则',topic:'There be',lv:2},
  {q:'"Would you like _____ water?"填？',type:'choice',options:shuffle(['some','any','a','many']),answer:'some',hints:['委婉请求用some','Would you like+some','some'],explain:'委婉语气用some',topic:'Would you like',lv:3},
  {q:'first是什么意思？',type:'choice',options:shuffle(['第一','最后','最好','最大']),answer:'第一',hints:['f-i-r-s-t','序数词','第一'],explain:'first=第一',topic:'序数词',lv:3}
);
QB[4].science.push(
  {q:'声音怎么产生的？',type:'choice',options:shuffle(['物体振动','物体发光','物体变热','物体变大']),answer:'物体振动',hints:['拨琴弦','弦在振动','振动产生声音'],explain:'声音由物体振动产生',topic:'声音',lv:1},
  {q:'食物链中草属于？',type:'choice',options:shuffle(['生产者','消费者','分解者','捕食者']),answer:'生产者',hints:['草能自己造养分','光合作用','生产者'],explain:'绿色植物是生产者',topic:'食物链',lv:2},
  {q:'电流从电池哪极流出？',type:'choice',options:shuffle(['正极','负极','都可以','没方向']),answer:'正极',hints:['电池有+和-','从+流出','正极'],explain:'电流从正极流出',topic:'电路',lv:2},
  {q:'下列哪个不是光源？',type:'choice',options:shuffle(['太阳','电灯','月亮','蜡烛']),answer:'月亮',hints:['光源自己发光','月亮反射太阳光','月亮'],explain:'月亮不是光源反射太阳光',topic:'光',lv:3}
);
// 补充更多题目
for(let i=0;i<8;i++){const a=rand(10,90),b=rand(10,99-a),s=a+b;QB[4].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意进位',a+'+'+b+'='+s],explain:'加法练习',topic:'加减法',lv:1});}
for(let i=0;i<8;i++){const a=rand(30,99),b=rand(10,a-5),s=a-b;QB[4].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意退位',a+'-'+b+'='+s],explain:'减法练习',topic:'加减法',lv:1});}
// === 四年级补充 ===
for(let i=0;i<6;i++){const a=rand(100,400),b=rand(10,50),s=a*b;QB[4].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意对位',a+'×'+b+'='+s],explain:'三位数乘两位数',topic:'三位数乘两位数',lv:1});}
for(let i=0;i<4;i++){const a=rand(100,900),b=rand(10,30),s=Math.floor(a/b),r=a-s*b;QB[4].math.push({q:a+' ÷ '+b+' = ?'+(r>0?'...?':''),type:'input',answer:r>0?s+'...'+r:String(s),hints:['从高位除','注意余数',a+'÷'+b+'='+(r>0?s+'...'+r:s)],explain:'三位数除两位数',topic:'除法',lv:2});}
QB[4].math.push(
  {q:'用量角器量一个角是120度这是什么角？',type:'choice',options:shuffle(['锐角','直角','钝角','平角']),answer:'钝角',hints:['大于90度','小于180度','钝角'],explain:'90<钝角<180',topic:'角的度量',lv:1},
  {q:'三角形三个角的和是？',type:'choice',options:shuffle(['90度','180度','270度','360度']),answer:'180度',hints:['三角形内角和','固定值','180度'],explain:'三角形内角和=180°',topic:'角的度量',lv:2},
  {q:'一个梯形上底4cm下底8cm高5cm面积？',type:'input',answer:'30',hints:['(4+8)×5÷2','12×5÷2','30'],explain:'梯形面积=(上底+下底)×高÷2',topic:'面积',lv:2},
  {q:'99×25简便算？',type:'input',answer:'2475',hints:['99=100-1','100×25-1×25','2500-25=2475'],explain:'接近整百的简便计算',topic:'简便运算',lv:2},
  {q:'125×32简便算？',type:'input',answer:'4000',hints:['32=8×4','125×8=1000','1000×4=4000'],explain:'125×8=1000',topic:'简便运算',lv:2},
  {q:'5.6-2.8=?',type:'input',answer:'2.8',hints:['56-28=28','一位小数','2.8'],explain:'小数减法',topic:'小数加减法',lv:2},
  {q:'12.5+7.5=?',type:'input',answer:'20',hints:['125+75=200','20.0','20'],explain:'小数加法',topic:'小数加减法',lv:1},
  {q:'在比例尺1:100的图上5cm代表实际多少？',type:'choice',options:shuffle(['5米','50米','500米','5千米']),answer:'5米',hints:['5×100=500cm','500cm=5米','5米'],explain:'图上×比例尺=实际',topic:'比例尺',lv:3},
  {q:'路边种树一边25棵两边共几棵？',type:'input',answer:'50',hints:['一边25','两边25×2','50棵'],explain:'两边=一边×2',topic:'植树问题',lv:3},
  {q:'甲乙相向而行甲50km/h乙30km/h相距160km几小时相遇？',type:'input',answer:'2',hints:['速度和50+30=80','160÷80','2小时'],explain:'相遇时间=距离÷速度和',topic:'行程问题',lv:3}
);
QB[4].chinese.push(
  {q:'"风光"里"光"的意思？',type:'choice',options:shuffle(['光线','景色','光滑','只']),answer:'景色',hints:['风光=风景','光=景色','景色'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"花"在"花钱"中的意思？',type:'choice',options:shuffle(['花朵','使用','花样','开花']),answer:'使用',hints:['花钱=用钱','花=使用','使用'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"难道他不知道吗？"用了什么修辞？',type:'choice',options:shuffle(['比喻','反问','设问','夸张']),answer:'反问',hints:['其实他知道','反着问','反问'],explain:'反问用问句表肯定',topic:'修辞',lv:2},
  {q:'"什么是幸福？幸福就是..."用了什么修辞？',type:'choice',options:shuffle(['比喻','反问','设问','拟人']),answer:'设问',hints:['自问自答','设问','设问'],explain:'设问自问自答引起思考',topic:'修辞',lv:2},
  {q:'"列数字"属于什么？',type:'choice',options:shuffle(['修辞手法','说明方法','写作方法','阅读方法']),answer:'说明方法',hints:['用数字说明事物','说明文中常用','说明方法'],explain:'说明方法：列数字打比方作比较',topic:'说明方法',lv:2},
  {q:'"故人西辞黄鹤楼"下一句？',type:'choice',options:shuffle(['烟花三月下扬州','孤帆远影碧空尽','唯见长江天际流','两岸猿声啼不住']),answer:'烟花三月下扬州',hints:['李白','送孟浩然','烟花三月下扬州'],explain:'李白《黄鹤楼送孟浩然之广陵》',topic:'古诗',lv:2},
  {q:'"劝君更尽一杯酒"下一句？',type:'choice',options:shuffle(['西出阳关无故人','烟花三月下扬州','春风不度玉门关','孤帆远影碧空尽']),answer:'西出阳关无故人',hints:['王维','送别诗','西出阳关无故人'],explain:'王维《送元二使安西》',topic:'古诗',lv:2},
  {q:'概括段意时应抓住？',type:'choice',options:shuffle(['中心句','每个字','标点','页码']),answer:'中心句',hints:['段落的核心','中心句','中心句'],explain:'找中心句概括段意',topic:'阅读',lv:3},
  {q:'"总-分-总"是一种？',type:'choice',options:shuffle(['文章结构','修辞手法','说明方法','标点用法']),answer:'文章结构',hints:['先总述再分述再总结','结构方式','文章结构'],explain:'常见结构总分总/总分/分总',topic:'写作方法',lv:3},
  {q:'作者写景是为了什么？',type:'choice',options:shuffle(['借景抒情','列数字','打比方','查字典']),answer:'借景抒情',hints:['通过景色表达感情','景→情','借景抒情'],explain:'借景抒情寓情于景',topic:'写作方法',lv:3}
);
QB[4].english.push(
  {q:'"She is _____ now."她正在跑步',type:'choice',options:shuffle(['run','running','runs','ran']),answer:'running',hints:['现在进行时','is+doing','running'],explain:'现在进行时be+doing',topic:'现在进行时',lv:1},
  {q:'"They are _____ a book."他们正在读书',type:'choice',options:shuffle(['read','reading','reads','readed']),answer:'reading',hints:['are+doing','reading','reading'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'library是什么地方？',type:'choice',options:shuffle(['图书馆','操场','食堂','教室']),answer:'图书馆',hints:['l-i-b-r-a-r-y','借书的地方','图书馆'],explain:'library=图书馆',topic:'学校场所',lv:1},
  {q:'playground是什么？',type:'choice',options:shuffle(['图书馆','操场','食堂','教室']),answer:'操场',hints:['play+ground','玩的地方','操场'],explain:'playground=操场',topic:'学校场所',lv:1},
  {q:'"He _____ breakfast at 7."他7点吃早餐',type:'choice',options:shuffle(['have','has','having','had']),answer:'has',hints:['He三单','has','has'],explain:'三单has',topic:'三单',lv:2},
  {q:'"There _____ some water."有一些水',type:'choice',options:shuffle(['is','are','am','be']),answer:'is',hints:['water不可数','用is','is'],explain:'不可数名词用is',topic:'There be',lv:2},
  {q:'"Do you have _____ brothers?"你有兄弟吗',type:'choice',options:shuffle(['some','any','a','many']),answer:'any',hints:['疑问句','any','any'],explain:'疑问否定用any',topic:'some/any',lv:2},
  {q:'"How many legs does a cat have?"',type:'choice',options:shuffle(['Two','Three','Four','Six']),answer:'Four',hints:['猫有4条腿','four legs','Four'],explain:'How many问数量',topic:'How many',lv:2},
  {q:'third是第几？',type:'choice',options:shuffle(['第一','第二','第三','第四']),answer:'第三',hints:['t-h-i-r-d','three→third','第三'],explain:'three→third',topic:'序数词',lv:3},
  {q:'"Don\'t run!"意思？',type:'choice',options:shuffle(['不要跑','快跑','跑步','正在跑']),answer:'不要跑',hints:['Dont=不要','祈使句','不要跑'],explain:'Dont+动词=不要做',topic:'祈使句',lv:3},
  {q:'"What time is it?" "It\'s 3:30."几点了？',type:'choice',options:shuffle(['3:00','3:15','3:30','3:45']),answer:'3:30',hints:['three thirty','3点30分','3:30'],explain:'时间表达',topic:'时间',lv:3}
);
QB[4].science.push(
  {q:'声音在什么中传播最快？',type:'choice',options:shuffle(['固体','液体','气体','真空']),answer:'固体',hints:['固体分子紧密','传播最快','固体'],explain:'声速：固体>液体>气体>真空不传',topic:'声音',lv:1},
  {q:'温度计的单位是？',type:'choice',options:shuffle(['℃','kg','m','L']),answer:'℃',hints:['摄氏度','温度','℃'],explain:'温度单位摄氏度℃',topic:'天气',lv:1},
  {q:'简单电路需要哪些部件？',type:'choice',options:shuffle(['电源导线用电器开关','只要电池','只要灯泡','只要开关']),answer:'电源导线用电器开关',hints:['电路四要素','缺一不可','电源导线用电器开关'],explain:'电路四要素',topic:'电路',lv:2},
  {q:'光沿什么方向传播？',type:'choice',options:shuffle(['直线','曲线','任意方向','圆形']),answer:'直线',hints:['光线是直的','直线传播','直线'],explain:'光沿直线传播',topic:'光',lv:2},
  {q:'花岗岩属于什么岩？',type:'choice',options:shuffle(['岩浆岩','沉积岩','变质岩','人造岩']),answer:'岩浆岩',hints:['岩浆冷却形成','火成岩','岩浆岩'],explain:'花岗岩是岩浆岩',topic:'岩石',lv:3}
);
// === 四年级补充 ===
QB[4].math.push(
  {q:'一亿有几个零？',type:'choice',options:shuffle(['7个','8个','9个','10个']),answer:'8个',hints:['100000000','数零','8个'],explain:'一亿=10^8',topic:'大数的认识',lv:1},
  {q:'用量角器量出45度是什么角？',type:'choice',options:shuffle(['锐角','直角','钝角','平角']),answer:'锐角',hints:['小于90度','锐角','锐角'],explain:'锐角<90度',topic:'角的度量',lv:1},
  {q:'平行四边形底10cm高6cm面积？',type:'input',answer:'60',hints:['底×高','10×6','60'],explain:'平行四边形面积=底×高',topic:'面积',lv:2},
  {q:'梯形上底5下底9高4面积？',type:'input',answer:'28',hints:['(5+9)×4÷2','14×4÷2','28'],explain:'梯形面积=(上底+下底)×高÷2',topic:'面积',lv:2},
  {q:'101×45简便算？',type:'input',answer:'4545',hints:['101=100+1','100×45+1×45','4500+45=4545'],explain:'接近整百简便',topic:'简便运算',lv:2},
  {q:'4.5+3.8=?',type:'input',answer:'8.3',hints:['45+38=83','小数点','8.3'],explain:'小数加法',topic:'小数加减法',lv:1},
  {q:'10.0-3.6=?',type:'input',answer:'6.4',hints:['100-36=64','小数点','6.4'],explain:'小数减法',topic:'小数加减法',lv:2},
  {q:'被除数不变除数乘以2商怎样？',type:'choice',options:shuffle(['乘以2','除以2','不变','加2']),answer:'除以2',hints:['商的变化规律','除数大商小','除以2'],explain:'被除数不变除数×2商÷2',topic:'商的变化规律',lv:2},
  {q:'甲追乙甲60km/h乙40km/h相距100km几小时追上？',type:'input',answer:'5',hints:['速度差60-40=20','100÷20','5小时'],explain:'追及时间=距离÷速度差',topic:'行程问题',lv:3}
);
QB[4].chinese.push(
  {q:'"深"在"深浅"和"深刻"中意思一样吗？',type:'choice',options:shuffle(['不一样','一样','差不多','无法判断']),answer:'不一样',hints:['深浅指程度','深刻指含义深','不一样'],explain:'一词多义要看语境',topic:'字义辨析',lv:1},
  {q:'"飞蛾扑火"比喻什么？',type:'choice',options:shuffle(['自取灭亡','勇敢','聪明','快速']),answer:'自取灭亡',hints:['飞蛾被火烧','自取灭亡','自取灭亡'],explain:'比喻自取灭亡',topic:'成语',lv:1},
  {q:'"一日之计在于晨"强调什么重要？',type:'choice',options:shuffle(['早晨','计划','一天','清晨运动']),answer:'早晨',hints:['一天之计在早上','抓住早晨','早晨'],explain:'珍惜早晨时光',topic:'谚语',lv:1},
  {q:'"横看成岭侧成峰"说明什么道理？',type:'choice',options:shuffle(['角度不同看法不同','山很美','爬山很累','山很高']),answer:'角度不同看法不同',hints:['题西林壁','不同角度不同样子','角度不同看法不同'],explain:'看问题要全面',topic:'古诗',lv:2},
  {q:'"孤帆远影碧空尽"下一句？',type:'choice',options:shuffle(['唯见长江天际流','烟花三月下扬州','故人西辞黄鹤楼','两岸猿声啼不住']),answer:'唯见长江天际流',hints:['送别诗','李白','唯见长江天际流'],explain:'李白《黄鹤楼送孟浩然之广陵》',topic:'古诗',lv:2},
  {q:'"作比较"是什么说明方法？',type:'choice',options:shuffle(['用对比说明特点','列举数字','打个比方','举例子']),answer:'用对比说明特点',hints:['A和B对比','突出特点','用对比说明'],explain:'作比较突出差异',topic:'说明方法',lv:2},
  {q:'"总分"结构的特点？',type:'choice',options:shuffle(['先总后分','先分后总','先总后分再总','一直分述']),answer:'先总后分',hints:['先概括再分述','总→分','先总后分'],explain:'总分结构',topic:'写作方法',lv:3}
);
QB[4].english.push(
  {q:'"Are they _____?"他们正在睡觉吗',type:'choice',options:shuffle(['sleep','sleeping','sleeps','slept']),answer:'sleeping',hints:['现在进行时','are+doing','sleeping'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"She _____ to school every day."',type:'choice',options:shuffle(['walk','walks','walking','walked']),answer:'walks',hints:['She三单','every day一般现在','walks'],explain:'三单+s',topic:'三单',lv:2},
  {q:'"There _____ three cats."有三只猫',type:'choice',options:shuffle(['is','are','am','be']),answer:'are',hints:['three cats复数','用are','are'],explain:'复数用are',topic:'There be',lv:2},
  {q:'"How much is it?"回答"5 yuan"用？',type:'choice',options:shuffle(["It's five yuan.","They are five.","Yes, it is.","Five yuan is it."]),answer:"It's five yuan.",hints:['问价格','回答价格',"It's five yuan."],explain:'回答价格',topic:'How much',lv:2},
  {q:'fifth是第几？',type:'choice',options:shuffle(['第三','第四','第五','第六']),answer:'第五',hints:['five→fifth','第五','第五'],explain:'five→fifth',topic:'序数词',lv:3},
  {q:'"Don\'t talk in class!"意思？',type:'choice',options:shuffle(['上课不要说话','上课说话','上课后说话','快说话']),answer:'上课不要说话',hints:['Dont=不要','in class=上课','上课不要说话'],explain:'祈使否定句',topic:'祈使句',lv:3}
);
QB[4].science.push(
  {q:'声音不能在什么中传播？',type:'choice',options:shuffle(['空气','水','钢铁','真空']),answer:'真空',hints:['真空没有介质','声音需要介质','真空'],explain:'真空不传声',topic:'声音',lv:1},
  {q:'导体和绝缘体的区别？',type:'choice',options:shuffle(['导体容易导电绝缘体不容易','颜色不同','大小不同','重量不同']),answer:'导体容易导电绝缘体不容易',hints:['铜线导电','橡胶不导电','导电能力'],explain:'导体导电绝缘体不导电',topic:'电路',lv:2},
  {q:'彩虹有几种颜色？',type:'choice',options:shuffle(['5种','6种','7种','8种']),answer:'7种',hints:['红橙黄绿蓝靛紫','七色光','7种'],explain:'赤橙黄绿蓝靛紫',topic:'光',lv:2},
  {q:'食物网比食物链更能说明什么？',type:'choice',options:shuffle(['生态系统中生物关系复杂','食物好吃','动物很多','植物很多']),answer:'生态系统中生物关系复杂',hints:['多条食物链交织','复杂关系','关系复杂'],explain:'食物网=多条食物链交织',topic:'食物链',lv:3}
);
// === 补充4年级 ===
for(let i=0;i<6;i++){const a=rand(100,500),b=rand(10,40),s=a*b;QB[4].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意对位',a+'×'+b+'='+s],explain:'三位数乘两位数',topic:'三位数乘两位数',lv:1});}
QB[4].math.push(
  {q:'198×5简便算？',type:'input',answer:'990',hints:['198=200-2','200×5-2×5','1000-10=990'],explain:'接近整百简便',topic:'简便运算',lv:2},
  {q:'7.2-3.5=?',type:'input',answer:'3.7',hints:['72-35=37','小数点','3.7'],explain:'小数减法',topic:'小数加减法',lv:2},
  {q:'2.5+3.8+7.5=?',type:'input',answer:'13.8',hints:['2.5+7.5=10','10+3.8','13.8'],explain:'凑整简便',topic:'简便运算',lv:2},
  {q:'鸡兔共15只42条腿兔几只？',type:'input',answer:'6',hints:['假设全鸡30腿','多42-30=12','12÷2=6只兔'],explain:'鸡兔同笼',topic:'鸡兔同笼',lv:3},
  {q:'环形跑道上10棵树等距每两棵间隔多少米？(一圈200米)',type:'input',answer:'20',hints:['环形=棵数=间隔数','200÷10','20米'],explain:'环形植树棵数=间隔数',topic:'植树问题',lv:3},
  {q:'甲4小时走48千米乙3小时走42千米谁快？',type:'choice',options:shuffle(['甲','乙','一样快','不确定']),answer:'乙',hints:['甲速度48÷4=12','乙速度42÷3=14','乙快'],explain:'比速度=路程÷时间',topic:'行程问题',lv:3},
  {q:'一个三角形两个角分别是35度和65度第三个角？',type:'input',answer:'80',hints:['三角形内角和180','180-35-65','80度'],explain:'三角形内角和=180°',topic:'角的度量',lv:3}
);
QB[4].chinese.push(
  {q:'"画蛇添足"比喻？',type:'choice',options:shuffle(['做多余的事反而不好','画画技术好','蛇有脚','添加东西']),answer:'做多余的事反而不好',hints:['蛇本来没脚','添了脚反而输了','多余的事'],explain:'比喻多此一举',topic:'成语',lv:1},
  {q:'"望子成龙"是什么意思？',type:'choice',options:shuffle(['盼望孩子有出息','看到龙','子变成龙','龙在天上']),answer:'盼望孩子有出息',hints:['望=盼望','龙=有出息','盼望孩子有出息'],explain:'盼望孩子成才',topic:'成语',lv:1},
  {q:'"水到渠成"是什么意思？',type:'choice',options:shuffle(['条件成熟自然成功','水流到沟里','挖渠引水','游泳']),answer:'条件成熟自然成功',hints:['水到了渠自然形成','自然而然','条件成熟自然成功'],explain:'比喻条件成熟自然成功',topic:'成语',lv:1},
  {q:'"只有...才..."表示什么关系？',type:'choice',options:shuffle(['条件','因果','转折','递进']),answer:'条件',hints:['必要条件','只有A才B','条件'],explain:'只有才=必要条件',topic:'关联词',lv:2},
  {q:'"尽管...还是..."表示？',type:'choice',options:shuffle(['转折','因果','条件','递进']),answer:'转折',hints:['尽管A还是B','转折','转折'],explain:'尽管还是=虽然但是',topic:'关联词',lv:2},
  {q:'"黄鹤一去不复返"下一句？',type:'choice',options:shuffle(['白云千载空悠悠','烟花三月下扬州','孤帆远影碧空尽','两岸猿声啼不住']),answer:'白云千载空悠悠',hints:['崔颢','黄鹤楼','白云千载空悠悠'],explain:'崔颢《黄鹤楼》',topic:'古诗',lv:2},
  {q:'阅读理解时找中心句通常在段落的？',type:'choice',options:shuffle(['开头或结尾','中间','标题','页码']),answer:'开头或结尾',hints:['总起句或总结句','开头或结尾','开头或结尾'],explain:'中心句常在段首或段尾',topic:'阅读',lv:3},
  {q:'"他不但成绩好而且品德好"缩句？',type:'choice',options:shuffle(['他成绩好品德好','他好','不但而且','成绩品德好']),answer:'他成绩好品德好',hints:['保留主干','去掉关联词','他成绩好品德好'],explain:'缩句去修饰保主干',topic:'缩句',lv:3}
);
QB[4].english.push(
  {q:'classroom是什么？',type:'choice',options:shuffle(['教室','图书馆','操场','食堂']),answer:'教室',hints:['class+room','上课的房间','教室'],explain:'classroom=教室',topic:'学校场所',lv:1},
  {q:'canteen是什么？',type:'choice',options:shuffle(['教室','图书馆','操场','食堂']),answer:'食堂',hints:['c-a-n-t-e-e-n','吃饭的地方','食堂'],explain:'canteen=食堂',topic:'学校场所',lv:1},
  {q:'"I am _____ a letter."我正在写信',type:'choice',options:shuffle(['write','writing','writes','wrote']),answer:'writing',hints:['am+doing','writing','writing'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"She _____ like oranges."她不喜欢橙子',type:'choice',options:shuffle(["doesn't","don't","isn't","aren't"]),answer:"doesn't",hints:['She三单','does not=doesnt',"doesn't"],explain:'三单否定doesnt',topic:'三单',lv:2},
  {q:'"There _____ some milk."有一些牛奶',type:'choice',options:shuffle(['is','are','am','be']),answer:'is',hints:['milk不可数','用is','is'],explain:'不可数名词用is',topic:'There be',lv:2},
  {q:'"_____ is the weather today?"今天天气怎样',type:'choice',options:shuffle(['What','How','Where','Who']),answer:'How',hints:['问天气','How is the weather','How'],explain:'How is the weather问天气',topic:'疑问句',lv:2},
  {q:'eighth是第几？',type:'choice',options:shuffle(['第六','第七','第八','第九']),answer:'第八',hints:['eight→eighth','第八','第八'],explain:'eight→eighth',topic:'序数词',lv:3},
  {q:'"Be quiet!"意思？',type:'choice',options:shuffle(['安静','快点','站起来','坐下']),answer:'安静',hints:['quiet=安静','Be quiet','安静'],explain:'祈使句',topic:'祈使句',lv:3},
  {q:'"Let\'s go to the park."意思？',type:'choice',options:shuffle(['我们去公园吧','公园在哪','这是公园','我喜欢公园']),answer:'我们去公园吧',hints:["Let's=让我们",'go to=去','我们去公园吧'],explain:"Let's+动词=让我们做",topic:'祈使句',lv:3}
);
QB[4].science.push(
  {q:'声音的高低叫什么？',type:'choice',options:shuffle(['音调','音量','音色','响度']),answer:'音调',hints:['高音低音','音调','音调'],explain:'音调由振动频率决定',topic:'声音',lv:1},
  {q:'声音的大小叫什么？',type:'choice',options:shuffle(['音调','音量','音色','频率']),answer:'音量',hints:['大声小声','音量','音量'],explain:'音量由振动幅度决定',topic:'声音',lv:1},
  {q:'电路断开时灯泡会？',type:'choice',options:shuffle(['亮','不亮','更亮','闪烁']),answer:'不亮',hints:['断路','没有电流','不亮'],explain:'断路=没有电流',topic:'电路',lv:2},
  {q:'镜子反射光属于什么现象？',type:'choice',options:shuffle(['光的反射','光的折射','光的直射','光的吸收']),answer:'光的反射',hints:['镜子把光弹回','反射','光的反射'],explain:'光的反射',topic:'光',lv:2},
  {q:'石灰岩属于什么岩？',type:'choice',options:shuffle(['岩浆岩','沉积岩','变质岩','人造岩']),answer:'沉积岩',hints:['一层一层沉积','有化石','沉积岩'],explain:'石灰岩是沉积岩常含化石',topic:'岩石',lv:3},
  {q:'大理岩属于什么岩？',type:'choice',options:shuffle(['岩浆岩','沉积岩','变质岩','人造岩']),answer:'变质岩',hints:['石灰岩变质而来','高温高压','变质岩'],explain:'大理岩是变质岩',topic:'岩石',lv:3}
);
// === 四年级数学大量补充 ===
// lv1补充(需13题)
for(let i=0;i<5;i++){const a=rand(1000,9000),b=rand(1000,9999-a),s=a+b;QB[4].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式对位','注意进位',a+'+'+b+'='+s],explain:'万以内加法',topic:'加减法',lv:1});}
for(let i=0;i<5;i++){const a=rand(5000,9999),b=rand(1000,a-1000),s=a-b;QB[4].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式对位','注意退位',a+'-'+b+'='+s],explain:'万以内减法',topic:'加减法',lv:1});}
QB[4].math.push(
  {q:'50000000读作？',type:'choice',options:shuffle(['五千万','五百万','五亿','五十万']),answer:'五千万',hints:['从高位读起','5后面7个0','五千万'],explain:'大数的读法',topic:'大数的认识',lv:1},
  {q:'三千零五十写作？',type:'input',answer:'3050',hints:['三千=3000','五十=50','3050'],explain:'大数的写法',topic:'大数的认识',lv:1},
  {q:'用量角器量出60度是什么角？',type:'choice',options:shuffle(['锐角','直角','钝角','平角']),answer:'锐角',hints:['小于90度','锐角','锐角'],explain:'锐角<90°',topic:'角的度量',lv:1}
);
// lv2补充(需28题)
for(let i=0;i<6;i++){const a=rand(100,300),b=rand(20,60),s=a*b;QB[4].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['竖式分步','先乘个位再乘十位',a+'×'+b+'='+s],explain:'三位数乘两位数',topic:'三位数乘两位数',lv:2});}
for(let i=0;i<4;i++){const b=rand(10,30),s=rand(10,50),a=s*b;QB[4].math.push({q:a+' ÷ '+b+' = ?',type:'input',answer:String(s),hints:['试商','从高位除',a+'÷'+b+'='+s],explain:'除法',topic:'除法',lv:2});}
QB[4].math.push(
  {q:'平行四边形底12cm高8cm面积？',type:'input',answer:'96',hints:['底×高','12×8','96'],explain:'平行四边形面积=底×高',topic:'面积',lv:2},
  {q:'梯形上底6下底10高5面积？',type:'input',answer:'40',hints:['(6+10)×5÷2','16×5÷2','40'],explain:'梯形面积=(上底+下底)×高÷2',topic:'面积',lv:2},
  {q:'三角形底8高6面积？',type:'input',answer:'24',hints:['底×高÷2','8×6÷2','24'],explain:'三角形面积=底×高÷2',topic:'面积',lv:2},
  {q:'36×25简便算？',type:'input',answer:'900',hints:['36=4×9','4×25=100','100×9=900'],explain:'拆因数凑整百',topic:'简便运算',lv:2},
  {q:'47×99+47简便算？',type:'input',answer:'4700',hints:['47×99+47×1','47×(99+1)','47×100=4700'],explain:'乘法分配律',topic:'简便运算',lv:2},
  {q:'125×16简便算？',type:'input',answer:'2000',hints:['16=8×2','125×8=1000','1000×2=2000'],explain:'125×8=1000',topic:'简便运算',lv:2},
  {q:'被除数和除数同时乘以3商怎样？',type:'choice',options:shuffle(['乘以3','除以3','不变','加3']),answer:'不变',hints:['商不变规律','同乘同除商不变','不变'],explain:'商不变规律',topic:'商的变化规律',lv:2},
  {q:'被除数乘以4除数不变商怎样？',type:'choice',options:shuffle(['乘以4','除以4','不变','加4']),answer:'乘以4',hints:['除数不变','被除数变大商变大','乘以4'],explain:'被除数变化商同样变化',topic:'商的变化规律',lv:2},
  {q:'6.3+4.7=?',type:'input',answer:'11',hints:['63+47=110','11.0','11'],explain:'小数加法',topic:'小数加减法',lv:2},
  {q:'15.2-8.6=?',type:'input',answer:'6.6',hints:['152-86=66','6.6','6.6'],explain:'小数减法',topic:'小数加减法',lv:2},
  {q:'3.05+2.95=?',type:'input',answer:'6',hints:['305+295=600','6.00','6'],explain:'小数加法凑整',topic:'小数加减法',lv:2},
  {q:'某班男生条形图25人女生23人共几人？',type:'input',answer:'48',hints:['25+23','条形图读数','48人'],explain:'读条形统计图',topic:'条形统计图',lv:2},
  {q:'150度是什么角？',type:'choice',options:shuffle(['锐角','直角','钝角','平角']),answer:'钝角',hints:['大于90','小于180','钝角'],explain:'90°<钝角<180°',topic:'角的度量',lv:2}
);
// lv3补充(需39题)
for(let i=0;i<6;i++){const a=rand(10,50),b=rand(10,50);const s=(a/10+b/10).toFixed(1);QB[4].math.push({q:(a/10).toFixed(1)+' + '+(b/10).toFixed(1)+' = ?',type:'input',answer:String(parseFloat(s)),hints:['小数加法','对齐小数点',String(parseFloat(s))],explain:'小数加法',topic:'小数加减法',lv:3});}
for(let i=0;i<6;i++){const a=rand(50,99),b=rand(10,a-10);const s=((a-b)/10).toFixed(1);QB[4].math.push({q:(a/10).toFixed(1)+' - '+(b/10).toFixed(1)+' = ?',type:'input',answer:String(parseFloat(s)),hints:['小数减法','对齐小数点',String(parseFloat(s))],explain:'小数减法',topic:'小数加减法',lv:3});}
QB[4].math.push(
  {q:'鸡兔共12只34条腿兔几只？',type:'input',answer:'5',hints:['假设全鸡24腿','多34-24=10','10÷2=5只兔'],explain:'鸡兔同笼',topic:'鸡兔同笼',lv:3},
  {q:'鸡兔共20只52条腿鸡几只？',type:'input',answer:'14',hints:['假设全鸡40腿','多52-40=12','12÷2=6兔所以14鸡'],explain:'鸡兔同笼',topic:'鸡兔同笼',lv:3},
  {q:'路一边种树50米每5米一棵两端都种几棵？',type:'input',answer:'11',hints:['50÷5=10个间隔','两端都种+1','11棵'],explain:'两端都种=间隔数+1',topic:'植树问题',lv:3},
  {q:'圆形花坛周长60米每3米种一棵种几棵？',type:'input',answer:'20',hints:['60÷3=20','环形棵数=间隔数','20棵'],explain:'环形植树棵数=间隔数',topic:'植树问题',lv:3},
  {q:'路一边种树100米每4米一棵两端不种几棵？',type:'input',answer:'24',hints:['100÷4=25个间隔','两端不种-1','24棵'],explain:'两端不种=间隔数-1',topic:'植树问题',lv:3},
  {q:'甲乙同时出发相向而行甲45km/h乙55km/h距离300km几小时相遇？',type:'input',answer:'3',hints:['速度和45+55=100','300÷100','3小时'],explain:'相遇时间=距离÷速度和',topic:'行程问题',lv:3},
  {q:'甲追乙甲80km/h乙60km/h相距40km几小时追上？',type:'input',answer:'2',hints:['速度差80-60=20','40÷20','2小时'],explain:'追及时间=距离÷速度差',topic:'行程问题',lv:3},
  {q:'小明从家到学校走15分钟每分钟走60米距离？',type:'input',answer:'900',hints:['路程=速度×时间','60×15','900米'],explain:'路程=速度×时间',topic:'行程问题',lv:3},
  {q:'一列火车3小时行360千米速度？',type:'input',answer:'120',hints:['速度=路程÷时间','360÷3','120km/h'],explain:'速度=路程÷时间',topic:'行程问题',lv:3},
  {q:'两个三角形拼成平行四边形底6高4则一个三角形面积？',type:'input',answer:'12',hints:['平行四边形面积=6×4=24','三角形=一半','24÷2=12'],explain:'三角形面积=平行四边形÷2',topic:'面积',lv:3},
  {q:'0.125×8=?',type:'input',answer:'1',hints:['0.125=1/8','1/8×8=1','1'],explain:'常用乘积',topic:'小数加减法',lv:3},
  {q:'102×35简便算？',type:'input',answer:'3570',hints:['102=100+2','100×35+2×35','3500+70=3570'],explain:'乘法分配律',topic:'简便运算',lv:3},
  {q:'99×16简便算？',type:'input',answer:'1584',hints:['99=100-1','100×16-1×16','1600-16=1584'],explain:'接近整百',topic:'简便运算',lv:3},
  {q:'四边形内角和？',type:'choice',options:shuffle(['180度','270度','360度','540度']),answer:'360度',hints:['可分成2个三角形','2×180','360度'],explain:'四边形内角和=360°',topic:'角的度量',lv:3},
  {q:'一个角的两条边是什么线？',type:'choice',options:shuffle(['射线','直线','线段','曲线']),answer:'射线',hints:['有端点','无限延伸','射线'],explain:'角的两边是射线',topic:'角的度量',lv:3}
);
// === 四年级语文大量补充 ===
// lv1(需41题)
QB[4].chinese.push(
  {q:'"打"在"打伞"中的意思？',type:'choice',options:shuffle(['撑开','击打','做','买']),answer:'撑开',hints:['打伞=撑伞','展开','撑开'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"打"在"打水"中的意思？',type:'choice',options:shuffle(['击打','取','撑开','做']),answer:'取',hints:['打水=取水','从井里取','取'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"生"在"生气"中的意思？',type:'choice',options:shuffle(['产生/发出','生长','活的','出生']),answer:'产生/发出',hints:['生气=产生怒气','发出','产生/发出'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"生"在"生日"中的意思？',type:'choice',options:shuffle(['出生','生长','活的','产生']),answer:'出生',hints:['生日=出生的日子','诞生','出生'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"马到成功"是什么意思？',type:'choice',options:shuffle(['一到就成功形容迅速','马很快','骑马比赛','养马的故事']),answer:'一到就成功形容迅速',hints:['马到=一到','立刻成功','形容迅速成功'],explain:'形容事情顺利迅速成功',topic:'成语',lv:1},
  {q:'"胸有成竹"是什么意思？',type:'choice',options:shuffle(['心里有数有把握','胸里有竹子','画竹子','种竹子']),answer:'心里有数有把握',hints:['文与可画竹','心中已有完整的竹子','有把握'],explain:'比喻做事前已有成熟的计划',topic:'成语',lv:1},
  {q:'"雪中送炭"比喻什么？',type:'choice',options:shuffle(['在别人急需时给予帮助','下雪送煤炭','天气很冷','烧炭取暖']),answer:'在别人急需时给予帮助',hints:['雪中=困难中','送炭=送温暖','急需时帮助'],explain:'比喻在困难中给予帮助',topic:'成语',lv:1},
  {q:'"锦上添花"比喻什么？',type:'choice',options:shuffle(['好上加好','织锦绣花','花很美','买花']),answer:'好上加好',hints:['锦=好','添花=更好','好上加好'],explain:'比喻在好的基础上更好',topic:'成语',lv:1},
  {q:'"半途而废"是什么意思？',type:'choice',options:shuffle(['做事中途放弃','走到一半','废物利用','半个东西']),answer:'做事中途放弃',hints:['半途=中途','废=放弃','中途放弃'],explain:'比喻做事不能坚持到底',topic:'成语',lv:1},
  {q:'"异口同声"是什么意思？',type:'choice',options:shuffle(['大家说法一致','嘴巴不同','声音很大','分别说话']),answer:'大家说法一致',hints:['异口=不同的嘴','同声=相同的话','说法一致'],explain:'形容大家意见一致',topic:'成语',lv:1},
  {q:'"坚持不懈"的"懈"是什么意思？',type:'choice',options:shuffle(['松懈放松','解开','理解','感谢']),answer:'松懈放松',hints:['不懈=不放松','坚持','松懈放松'],explain:'不懈=不松懈',topic:'字义辨析',lv:1},
  {q:'"精益求精"的"益"是什么意思？',type:'choice',options:shuffle(['更加','利益','好处','增加']),answer:'更加',hints:['精益求精=好了还要更好','更加精','更加'],explain:'益=更加',topic:'字义辨析',lv:1},
  {q:'"赞叹"是褒义还是贬义？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'褒义',hints:['赞叹=称赞','好的','褒义'],explain:'赞叹表示称赞',topic:'词语归类',lv:1},
  {q:'"狡猾"是褒义还是贬义？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'贬义',hints:['狡猾不好','诡计多端','贬义'],explain:'狡猾=贬义 机智=褒义',topic:'词语归类',lv:1},
  {q:'"朴素"的反义词？',type:'choice',options:shuffle(['华丽','简单','美丽','高贵']),answer:'华丽',hints:['朴素=简朴','反面=华丽','华丽'],explain:'朴素↔华丽',topic:'反义词',lv:1},
  // lv2(需35题)
  {q:'"只要...就..."表示什么关系？',type:'choice',options:shuffle(['条件(充分)','因果','转折','递进']),answer:'条件(充分)',hints:['只要A就B','充分条件','条件'],explain:'只要就=充分条件',topic:'关联词',lv:2},
  {q:'"虽然...但是..."表示什么关系？',type:'choice',options:shuffle(['转折','因果','条件','递进']),answer:'转折',hints:['虽然A但是B','前后转折','转折'],explain:'虽然但是=转折',topic:'关联词',lv:2},
  {q:'"因为...所以..."表示什么关系？',type:'choice',options:shuffle(['因果','转折','条件','递进']),answer:'因果',hints:['因为A所以B','原因结果','因果'],explain:'因为所以=因果',topic:'关联词',lv:2},
  {q:'"宁可...也不..."表示什么关系？',type:'choice',options:shuffle(['选择','因果','转折','条件']),answer:'选择',hints:['宁可A也不B','选择前者','选择'],explain:'宁可也不=选择',topic:'关联词',lv:2},
  {q:'"桃花潭水深千尺不及汪伦送我情"用了什么修辞？',type:'choice',options:shuffle(['夸张','比喻','拟人','排比']),answer:'夸张',hints:['千尺深夸大了','突出友情深','夸张'],explain:'夸张突出友情',topic:'修辞',lv:2},
  {q:'"这座石桥好像一条巨龙横卧水面"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'比喻',hints:['好像','石桥像巨龙','比喻'],explain:'把石桥比作巨龙',topic:'修辞',lv:2},
  {q:'"花儿向我点头微笑"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'拟人',hints:['花能点头微笑吗','当作人','拟人'],explain:'赋予花人的动作',topic:'修辞',lv:2},
  {q:'"举例子"是什么说明方法？',type:'choice',options:shuffle(['用具体例子说明','列数字','打比方','作比较']),answer:'用具体例子说明',hints:['举一个例子','具体说明','用例子说明'],explain:'用例子使说明更具体',topic:'说明方法',lv:2},
  {q:'"赵州桥已经有1400多年的历史"用了什么说明方法？',type:'choice',options:shuffle(['列数字','举例子','打比方','作比较']),answer:'列数字',hints:['1400多年','具体数字','列数字'],explain:'用数字说明',topic:'说明方法',lv:2},
  {q:'"松树像一把大伞"用了什么说明方法？',type:'choice',options:shuffle(['打比方','列数字','举例子','作比较']),answer:'打比方',hints:['像','用比喻来说明','打比方'],explain:'打比方=说明文中的比喻',topic:'说明方法',lv:2},
  {q:'"相看两不厌"下一句？',type:'choice',options:shuffle(['只有敬亭山','众鸟高飞尽','孤云独去闲','白云千载空悠悠']),answer:'只有敬亭山',hints:['独坐敬亭山','李白','只有敬亭山'],explain:'李白《独坐敬亭山》',topic:'古诗',lv:2},
  {q:'"遥望洞庭山水翠"下一句？',type:'choice',options:shuffle(['白银盘里一青螺','湖光秋月两相和','潭面无风镜未磨','相看两不厌']),answer:'白银盘里一青螺',hints:['望洞庭','刘禹锡','白银盘里一青螺'],explain:'刘禹锡《望洞庭》',topic:'古诗',lv:2},
  {q:'"湖光秋月两相和"下一句？',type:'choice',options:shuffle(['潭面无风镜未磨','白银盘里一青螺','遥望洞庭山水翠','相看两不厌']),answer:'潭面无风镜未磨',hints:['望洞庭','刘禹锡','潭面无风镜未磨'],explain:'刘禹锡《望洞庭》',topic:'古诗',lv:2},
  {q:'"渭城朝雨浥轻尘"下一句？',type:'choice',options:shuffle(['客舍青青柳色新','劝君更尽一杯酒','西出阳关无故人','烟花三月下扬州']),answer:'客舍青青柳色新',hints:['送元二使安西','王维','客舍青青柳色新'],explain:'王维《送元二使安西》',topic:'古诗',lv:2},
  {q:'"分类别"是什么说明方法？',type:'choice',options:shuffle(['按类别分别说明','打比方','列数字','作比较']),answer:'按类别分别说明',hints:['分成几类','分别介绍','按类别分别说明'],explain:'分类别使说明条理清晰',topic:'说明方法',lv:2},
  {q:'找中心句应重点看段落的哪里？',type:'choice',options:shuffle(['开头和结尾','中间','随便哪里','最长的句子']),answer:'开头和结尾',hints:['总起句或总结句','首尾','开头和结尾'],explain:'中心句常在段首或段尾',topic:'阅读方法',lv:2},
  // lv3(需43题)
  {q:'"他改正了作业中的错别字"中"改正"搭配对吗？',type:'choice',options:shuffle(['对','不对应该用改正错误','不对应该用修改','不确定']),answer:'不对应该用修改',hints:['改正+错误','修改+作业','搭配不当'],explain:'改正错误修改作业',topic:'修改病句',lv:3},
  {q:'"通过学习使我进步了"有什么问题？',type:'choice',options:shuffle(['缺少主语','搭配不当','语义重复','语序不对']),answer:'缺少主语',hints:['谁进步了','通过和使不能同时用','缺少主语'],explain:'去掉通过或使',topic:'修改病句',lv:3},
  {q:'"我们要发挥优点改正缺点"搭配对吗？',type:'choice',options:shuffle(['不对应该是发扬优点','对','不确定','都错了']),answer:'不对应该是发扬优点',hints:['发扬优点','发挥优势','发扬优点'],explain:'发扬优点发挥优势',topic:'修改病句',lv:3},
  {q:'"全班同学都基本到齐了"有什么问题？',type:'choice',options:shuffle(['语义矛盾','搭配不当','缺少主语','没有问题']),answer:'语义矛盾',hints:['都=全部','基本=大部分','矛盾'],explain:'都和基本矛盾去掉一个',topic:'修改病句',lv:3},
  {q:'"他的成绩比过去增加了"搭配对吗？',type:'choice',options:shuffle(['不对应该是提高','对','不确定','应该用增长']),answer:'不对应该是提高',hints:['成绩+提高','产量+增加','搭配不当'],explain:'成绩提高产量增加',topic:'修改病句',lv:3},
  {q:'概括文章主要内容的方法？',type:'choice',options:shuffle(['找关键句归纳','随便说说','抄一段','看标题就行']),answer:'找关键句归纳',hints:['找中心句关键词','归纳概括','找关键句归纳'],explain:'抓住要素归纳概括',topic:'阅读方法',lv:3},
  {q:'记叙文的六要素是？',type:'choice',options:shuffle(['时间地点人物起因经过结果','开头中间结尾','谁说了什么','论点论据论证']),answer:'时间地点人物起因经过结果',hints:['六要素','记叙文基本要素','时间地点人物起因经过结果'],explain:'记叙文六要素',topic:'阅读方法',lv:3},
  {q:'"按时间顺序写"是什么结构？',type:'choice',options:shuffle(['顺叙','倒叙','插叙','总分']),answer:'顺叙',hints:['按时间先后','顺序写','顺叙'],explain:'按时间顺序=顺叙',topic:'写作方法',lv:3},
  {q:'"先写结果再写原因"是什么结构？',type:'choice',options:shuffle(['倒叙','顺叙','插叙','总分']),answer:'倒叙',hints:['先果后因','倒着写','倒叙'],explain:'先写结果=倒叙引人入胜',topic:'写作方法',lv:3},
  {q:'描写人物可以从哪些方面入手？',type:'choice',options:shuffle(['外貌语言动作心理神态','只写外貌','只写语言','只写动作']),answer:'外貌语言动作心理神态',hints:['五种描写方法','全面刻画','外貌语言动作心理神态'],explain:'人物描写五种方法',topic:'写作方法',lv:3},
  {q:'"风一更雪一更"出自哪首诗？',type:'choice',options:shuffle(['长相思','泊船瓜洲','秋思','示儿']),answer:'长相思',hints:['纳兰性德','聒碎乡心梦不成','长相思'],explain:'纳兰性德《长相思》',topic:'古诗',lv:3},
  {q:'文章结尾点明中心的作用？',type:'choice',options:shuffle(['深化主题画龙点睛','凑字数','随便写','没有作用']),answer:'深化主题画龙点睛',hints:['结尾升华','点题','深化主题'],explain:'结尾点题深化中心思想',topic:'写作方法',lv:3}
);
// === 四年级英语大量补充 ===
// lv1(需41题)
QB[4].english.push(
  {q:'"I am _____ my homework."我正在做作业',type:'choice',options:shuffle(['do','doing','does','did']),answer:'doing',hints:['am+doing','现在进行时','doing'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"Look! The children _____ in the park."孩子们正在玩',type:'choice',options:shuffle(['play','are playing','plays','played']),answer:'are playing',hints:['Look提示正在','are+doing','are playing'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"She is _____ a picture."她正在画画',type:'choice',options:shuffle(['draw','drawing','draws','drew']),answer:'drawing',hints:['is+doing','drawing','drawing'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"We are _____ English."我们正在学英语',type:'choice',options:shuffle(['learn','learning','learns','learned']),answer:'learning',hints:['are+doing','learning','learning'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'garden是什么？',type:'choice',options:shuffle(['花园','教室','操场','图书馆']),answer:'花园',hints:['g-a-r-d-e-n','种花的地方','花园'],explain:'garden=花园',topic:'学校场所',lv:1},
  {q:'music room是什么？',type:'choice',options:shuffle(['音乐室','教室','图书馆','食堂']),answer:'音乐室',hints:['music=音乐','room=房间','音乐室'],explain:'music room=音乐室',topic:'学校场所',lv:1},
  {q:'art room是什么？',type:'choice',options:shuffle(['美术室','音乐室','教室','食堂']),answer:'美术室',hints:['art=美术','room=房间','美术室'],explain:'art room=美术室',topic:'学校场所',lv:1},
  {q:'computer room是什么？',type:'choice',options:shuffle(['电脑室','教室','图书馆','食堂']),answer:'电脑室',hints:['computer=电脑','room=房间','电脑室'],explain:'computer room=电脑室',topic:'学校场所',lv:1},
  {q:'gym是什么？',type:'choice',options:shuffle(['体育馆','教室','花园','食堂']),answer:'体育馆',hints:['g-y-m','运动的地方','体育馆'],explain:'gym=体育馆',topic:'学校场所',lv:1},
  {q:'"What are you doing?" "I am _____."我在吃东西',type:'choice',options:shuffle(['eat','eating','eats','ate']),answer:'eating',hints:['am+doing','eating','eating'],explain:'现在进行时回答',topic:'现在进行时',lv:1},
  // lv2(需38题)
  {q:'"She _____ TV every evening."她每晚看电视',type:'choice',options:shuffle(['watch','watches','watching','watched']),answer:'watches',hints:['She三单','every evening一般现在','watches'],explain:'三单+es',topic:'三单',lv:2},
  {q:'"He _____ to school by bus."他坐公交上学',type:'choice',options:shuffle(['go','goes','going','went']),answer:'goes',hints:['He三单','一般现在时','goes'],explain:'三单+es',topic:'三单',lv:2},
  {q:'"My sister _____ English well."我姐姐英语说得好',type:'choice',options:shuffle(['speak','speaks','speaking','spoke']),answer:'speaks',hints:['sister三单','speaks','speaks'],explain:'三单+s',topic:'三单',lv:2},
  {q:'"There _____ two dogs and a cat."有两只狗和一只猫',type:'choice',options:shuffle(['is','are','am','be']),answer:'are',hints:['就近原则','two dogs复数','are'],explain:'There be就近原则',topic:'There be',lv:2},
  {q:'"There _____ a book and three pens."有一本书和三支笔',type:'choice',options:shuffle(['is','are','am','be']),answer:'is',hints:['就近原则','a book单数','is'],explain:'就近a book用is',topic:'There be',lv:2},
  {q:'"I have _____ apples."我有一些苹果(肯定)',type:'choice',options:shuffle(['some','any','a','an']),answer:'some',hints:['肯定句','用some','some'],explain:'肯定句用some',topic:'some/any',lv:2},
  {q:'"There isn\'t _____ milk."没有牛奶',type:'choice',options:shuffle(['some','any','a','many']),answer:'any',hints:['否定句','用any','any'],explain:'否定句用any',topic:'some/any',lv:2},
  {q:'"How much _____ the shoes?"这鞋多少钱',type:'choice',options:shuffle(['is','are','am','do']),answer:'are',hints:['shoes复数','用are','are'],explain:'复数用are',topic:'How much',lv:2},
  {q:'"How many _____ do you have?"你有多少书',type:'choice',options:shuffle(['book','books','a book','the book']),answer:'books',hints:['How many+复数','books','books'],explain:'How many+可数复数',topic:'How many',lv:2},
  {q:'second是第几？',type:'choice',options:shuffle(['第一','第二','第三','第四']),answer:'第二',hints:['one→first','two→second','第二'],explain:'two→second',topic:'序数词',lv:2},
  {q:'fourth是第几？',type:'choice',options:shuffle(['第二','第三','第四','第五']),answer:'第四',hints:['four→fourth','第四','第四'],explain:'four→fourth',topic:'序数词',lv:2},
  {q:'ninth是第几？',type:'choice',options:shuffle(['第七','第八','第九','第十']),answer:'第九',hints:['nine→ninth','去e加th','第九'],explain:'nine→ninth',topic:'序数词',lv:2},
  {q:'"It is _____ today."今天很热',type:'choice',options:shuffle(['hot','cold','warm','cool']),answer:'hot',hints:['热=hot','天气','hot'],explain:'天气形容词',topic:'天气',lv:2},
  {q:'"It is _____ today."今天很冷',type:'choice',options:shuffle(['hot','cold','warm','cool']),answer:'cold',hints:['冷=cold','天气','cold'],explain:'天气形容词',topic:'天气',lv:2},
  // lv3(需40题)
  {q:'"Would you like _____ juice?"你想要果汁吗',type:'choice',options:shuffle(['some','any','a','many']),answer:'some',hints:['委婉请求','Would you like+some','some'],explain:'委婉请求用some',topic:'Would you like',lv:3},
  {q:'"Would you like to _____ with me?"你想和我一起去吗',type:'choice',options:shuffle(['go','going','goes','went']),answer:'go',hints:['would like to+原形','go','go'],explain:'would like to+动词原形',topic:'Would you like',lv:3},
  {q:'"Can I help you?" "Yes, _____."',type:'choice',options:shuffle(["please.","I can.","you can.","help me."]),answer:"please.",hints:['购物用语','Yes please','please.'],explain:'购物：Can I help you? Yes please.',topic:'购物',lv:3},
  {q:'"Don\'t _____ the flowers!"不要摘花',type:'choice',options:shuffle(['pick','picking','picks','picked']),answer:'pick',hints:['Dont+动词原形','pick','pick'],explain:'否定祈使句Dont+原形',topic:'祈使句',lv:3},
  {q:'"Please _____ the window."请打开窗户',type:'choice',options:shuffle(['open','opens','opening','opened']),answer:'open',hints:['Please+动词原形','open','open'],explain:'肯定祈使句',topic:'祈使句',lv:3},
  {q:'"What time is it?" "It\'s _____."现在2:15',type:'choice',options:shuffle(['two fifteen','two fifty','a quarter past two','both A and C']),answer:'both A and C',hints:['2:15两种说法','two fifteen或a quarter past two','都对'],explain:'时间两种表达法',topic:'时间',lv:3},
  {q:'"It\'s time _____ lunch."该吃午饭了',type:'choice',options:shuffle(['for','to','at','in']),answer:'for',hints:["It's time for+名词","for lunch",'for'],explain:"It's time for+名词/It's time to+动词",topic:'时间',lv:3},
  {q:'"Whose bag is this?" "_____."这是他的',type:'choice',options:shuffle(["It's his.","It's he.","He is.","His is."]),answer:"It's his.",hints:['whose问谁的','his=他的',"It's his."],explain:'名词性物主代词',topic:'疑问句',lv:3},
  {q:'"Turn left at the traffic light."意思？',type:'choice',options:shuffle(['在红绿灯处左转','在红绿灯处右转','直走','停下']),answer:'在红绿灯处左转',hints:['Turn left=左转','traffic light=红绿灯','在红绿灯处左转'],explain:'问路指路用语',topic:'日常用语',lv:3},
  {q:'"Go straight."意思？',type:'choice',options:shuffle(['直走','左转','右转','停下']),answer:'直走',hints:['straight=直的','Go straight=直走','直走'],explain:'问路指路',topic:'日常用语',lv:3}
);
// === 四年级科学大量补充 ===
// lv1(需44题)
QB[4].science.push(
  {q:'声音能在水中传播吗？',type:'choice',options:shuffle(['能','不能','只能在空气中','不确定']),answer:'能',hints:['水也是介质','能传播','能'],explain:'声音能在固液气中传播',topic:'声音',lv:1},
  {q:'用力敲鼓和轻敲鼓哪个声音大？',type:'choice',options:shuffle(['用力敲大','轻敲大','一样大','不确定']),answer:'用力敲大',hints:['振动幅度大','声音大','用力敲大'],explain:'振幅越大声音越大',topic:'声音',lv:1},
  {q:'弦越紧声音越？',type:'choice',options:shuffle(['高','低','大','小']),answer:'高',hints:['弦紧振动快','频率高','音调高'],explain:'弦越紧频率越高音调越高',topic:'声音',lv:1},
  {q:'天气预报中☀代表什么？',type:'choice',options:shuffle(['晴天','阴天','雨天','雪天']),answer:'晴天',hints:['太阳','晴朗','晴天'],explain:'天气符号',topic:'天气',lv:1},
  {q:'天气预报中☁代表什么？',type:'choice',options:shuffle(['晴天','多云','雨天','雪天']),answer:'多云',hints:['云朵','多云','多云'],explain:'天气符号',topic:'天气',lv:1},
  {q:'风向标箭头指的方向是？',type:'choice',options:shuffle(['风来的方向','风去的方向','东方','北方']),answer:'风来的方向',hints:['箭头指向风来处','风向','风来的方向'],explain:'风向=风来的方向',topic:'天气',lv:1},
  {q:'测量气温用什么工具？',type:'choice',options:shuffle(['温度计','量角器','量杯','天平']),answer:'温度计',hints:['测温度','温度计','温度计'],explain:'温度计测气温',topic:'天气',lv:1},
  {q:'降水量用什么工具测量？',type:'choice',options:shuffle(['雨量器','温度计','风速仪','气压计']),answer:'雨量器',hints:['收集雨水','测量降水','雨量器'],explain:'雨量器测降水量',topic:'天气',lv:1},
  {q:'噪声对人有害吗？',type:'choice',options:shuffle(['有害','无害','只对耳朵有害','不确定']),answer:'有害',hints:['影响听力','影响健康','有害'],explain:'噪声影响听力和健康',topic:'声音',lv:1},
  // lv2(需42题)
  {q:'电路中电流方向？',type:'choice',options:shuffle(['从正极流向负极','从负极流向正极','没有方向','随机']),answer:'从正极流向负极',hints:['正极出发','经过导线到负极','正极→负极'],explain:'电流：正极→导线→用电器→负极',topic:'电路',lv:2},
  {q:'串联电路中一个灯泡坏了其他灯？',type:'choice',options:shuffle(['都不亮','正常亮','更亮','闪烁']),answer:'都不亮',hints:['一条路','断了就不通','都不亮'],explain:'串联一断全断',topic:'电路',lv:2},
  {q:'并联电路中一个灯泡坏了其他灯？',type:'choice',options:shuffle(['都不亮','正常亮','更亮','闪烁']),answer:'正常亮',hints:['各走各的路','互不影响','正常亮'],explain:'并联互不影响',topic:'电路',lv:2},
  {q:'橡皮是导体还是绝缘体？',type:'choice',options:shuffle(['导体','绝缘体','半导体','超导体']),answer:'绝缘体',hints:['橡胶不导电','绝缘体','绝缘体'],explain:'橡胶塑料是绝缘体',topic:'电路',lv:2},
  {q:'铜线是导体还是绝缘体？',type:'choice',options:shuffle(['导体','绝缘体','半导体','超导体']),answer:'导体',hints:['金属导电','铜是金属','导体'],explain:'金属是导体',topic:'电路',lv:2},
  {q:'影子形成的原因？',type:'choice',options:shuffle(['光沿直线传播被物体挡住','光弯曲了','物体发光','地面有颜色']),answer:'光沿直线传播被物体挡住',hints:['光直线传播','被挡住','光沿直线传播被挡住'],explain:'不透明物体挡住光形成影子',topic:'光',lv:2},
  {q:'凸透镜能把光线怎样？',type:'choice',options:shuffle(['聚焦','发散','反射','吸收']),answer:'聚焦',hints:['放大镜','聚光','聚焦'],explain:'凸透镜聚焦凹透镜发散',topic:'光',lv:2},
  {q:'彩虹是光的什么现象？',type:'choice',options:shuffle(['色散(折射)','反射','直射','吸收']),answer:'色散(折射)',hints:['白光分成七色','折射分光','色散'],explain:'白光经水滴折射分成七色',topic:'光',lv:2},
  {q:'植物→蚱蜢→青蛙→蛇→鹰这条食物链有几个营养级？',type:'choice',options:shuffle(['3个','4个','5个','6个']),answer:'5个',hints:['植物蚱蜢青蛙蛇鹰','5种生物','5个'],explain:'每种生物一个营养级',topic:'食物链',lv:2},
  {q:'食物链的起点总是？',type:'choice',options:shuffle(['植物(生产者)','动物','分解者','阳光']),answer:'植物(生产者)',hints:['从植物开始','生产者','植物'],explain:'食物链从生产者开始',topic:'食物链',lv:2},
  // lv3(需45题)
  {q:'砂岩属于什么岩？',type:'choice',options:shuffle(['沉积岩','岩浆岩','变质岩','人造岩']),answer:'沉积岩',hints:['沙粒沉积','一层层的','沉积岩'],explain:'砂岩是沉积岩',topic:'岩石',lv:3},
  {q:'玄武岩属于什么岩？',type:'choice',options:shuffle(['岩浆岩','沉积岩','变质岩','人造岩']),answer:'岩浆岩',hints:['火山喷发','岩浆冷却','岩浆岩'],explain:'玄武岩是岩浆岩',topic:'岩石',lv:3},
  {q:'化石一般在什么岩石中发现？',type:'choice',options:shuffle(['沉积岩','岩浆岩','变质岩','人造岩']),answer:'沉积岩',hints:['一层层沉积','生物被埋','沉积岩'],explain:'化石主要在沉积岩中',topic:'岩石',lv:3},
  {q:'人体的消化器官顺序？',type:'choice',options:shuffle(['口腔→食道→胃→小肠→大肠','胃→口腔→食道→小肠','小肠→胃→口腔→大肠','口腔→胃→食道→小肠']),answer:'口腔→食道→胃→小肠→大肠',hints:['从嘴巴开始','经过食道到胃','口腔→食道→胃→小肠→大肠'],explain:'消化道顺序',topic:'消化系统',lv:3},
  {q:'食物主要在哪里被消化吸收？',type:'choice',options:shuffle(['小肠','胃','口腔','大肠']),answer:'小肠',hints:['小肠最长','吸收面积大','小肠'],explain:'小肠是主要消化吸收器官',topic:'消化系统',lv:3},
  {q:'人呼吸时吸入什么气体？',type:'choice',options:shuffle(['氧气','二氧化碳','氮气','氢气']),answer:'氧气',hints:['吸入氧气','呼出二氧化碳','氧气'],explain:'呼吸吸入O2呼出CO2',topic:'呼吸系统',lv:3},
  {q:'肺的主要功能？',type:'choice',options:shuffle(['气体交换','消化食物','泵血','过滤血液']),answer:'气体交换',hints:['吸入O2呼出CO2','在肺泡交换','气体交换'],explain:'肺进行气体交换',topic:'呼吸系统',lv:3},
  {q:'矿物的硬度用什么方法测试？',type:'choice',options:shuffle(['互相刻划','看颜色','闻气味','称重量']),answer:'互相刻划',hints:['硬的能划软的','互相刻划','互相刻划'],explain:'莫氏硬度用刻划法测定',topic:'岩石',lv:3},
  {q:'生态系统中如果草减少了会怎样？',type:'choice',options:shuffle(['食草动物减少进而食肉动物也减少','没有影响','动物增多','只影响草']),answer:'食草动物减少进而食肉动物也减少',hints:['连锁反应','食物链','逐级影响'],explain:'食物链环环相扣一个变化影响全局',topic:'食物链',lv:3},
  {q:'沉积岩的特征？',type:'choice',options:shuffle(['有层理可能有化石','有气孔','晶体大','很硬']),answer:'有层理可能有化石',hints:['一层一层','可能有化石','有层理可能有化石'],explain:'沉积岩层状结构含化石',topic:'岩石',lv:3}
);
// === 四年级继续补充至每科每级50+ ===
// 数学lv2补5 lv3补12
for(let i=0;i<5;i++){const a=rand(200,500),b=rand(20,50),s=a*b;QB[4].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['竖式','注意进位',a+'×'+b+'='+s],explain:'乘法',topic:'三位数乘两位数',lv:2});}
for(let i=0;i<6;i++){const a=rand(10,99),b=rand(10,99);const s=parseFloat(((a+b)/10).toFixed(1));QB[4].math.push({q:(a/10).toFixed(1)+' + '+(b/10).toFixed(1)+' = ?',type:'input',answer:String(s),hints:['小数加法','对齐小数点',String(s)],explain:'小数加法',topic:'小数加减法',lv:3});}
QB[4].math.push(
  {q:'25×(40+4)简便算？',type:'input',answer:'1100',hints:['25×40+25×4','1000+100','1100'],explain:'乘法分配律',topic:'简便运算',lv:3},
  {q:'999×6简便算？',type:'input',answer:'5994',hints:['(1000-1)×6','6000-6','5994'],explain:'接近整千',topic:'简便运算',lv:3},
  {q:'甲从A到B走4小时速度5km/h乙走5小时乙速度？',type:'input',answer:'4',hints:['距离=4×5=20km','乙速度=20÷5','4km/h'],explain:'路程相同速度=路程÷时间',topic:'行程问题',lv:3},
  {q:'两列火车相向而行速度分别80和70km/h距离450km几小时相遇？',type:'input',answer:'3',hints:['速度和150','450÷150','3小时'],explain:'相遇问题',topic:'行程问题',lv:3},
  {q:'一条路200米种树两端都种每10米一棵共？',type:'input',answer:'21',hints:['200÷10=20个间隔','两端都种+1','21棵'],explain:'植树问题',topic:'植树问题',lv:3}
);
// 语文lv1补26
QB[4].chinese.push(
  {q:'"指"在"指望"中的意思？',type:'choice',options:shuffle(['盼望','手指','指出','指挥']),answer:'盼望',hints:['指望=盼望','希望','盼望'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"用"在"费用"中的意思？',type:'choice',options:shuffle(['花费','使用','用处','需要']),answer:'花费',hints:['费用=花费','费=花','花费'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"开"在"开花"中的意思？',type:'choice',options:shuffle(['绽放','打开','开始','开车']),answer:'绽放',hints:['花开了','绽放','绽放'],explain:'一词多义',topic:'字义辨析',lv:1},
  {q:'"对症下药"是什么意思？',type:'choice',options:shuffle(['针对问题解决','吃药','看病','下棋']),answer:'针对问题解决',hints:['什么病用什么药','有针对性','针对问题解决'],explain:'比喻针对问题采取措施',topic:'成语',lv:1},
  {q:'"事半功倍"是什么意思？',type:'choice',options:shuffle(['花少力气收效大','做一半','事情失败','翻倍努力']),answer:'花少力气收效大',hints:['半=少','倍=多','花少力气收效大'],explain:'花小力气得大效果',topic:'成语',lv:1},
  {q:'"刻苦"是褒义还是贬义？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'褒义',hints:['刻苦学习','好品质','褒义'],explain:'刻苦=褒义',topic:'词语归类',lv:1},
  {q:'"虚伪"是褒义还是贬义？',type:'choice',options:shuffle(['褒义','贬义','中性','疑问']),answer:'贬义',hints:['虚伪不好','假的','贬义'],explain:'虚伪=贬义 真诚=褒义',topic:'词语归类',lv:1},
  {q:'"骄傲"在"他很骄傲"中是褒义还是贬义？',type:'choice',options:shuffle(['贬义(自大)','褒义','中性','不确定']),answer:'贬义(自大)',hints:['骄傲=自满','不好','贬义'],explain:'骄傲可褒可贬看语境',topic:'词语归类',lv:1},
  {q:'"谦虚"的反义词？',type:'choice',options:shuffle(['骄傲','勇敢','胆小','开心']),answer:'骄傲',hints:['谦虚↔骄傲','反面','骄傲'],explain:'谦虚↔骄傲',topic:'反义词',lv:1},
  {q:'"团结"的反义词？',type:'choice',options:shuffle(['分裂','合作','友好','帮助']),answer:'分裂',hints:['团结↔分裂','反面','分裂'],explain:'团结↔分裂',topic:'反义词',lv:1},
  {q:'"坚强"的反义词？',type:'choice',options:shuffle(['软弱','勇敢','聪明','高大']),answer:'软弱',hints:['坚强↔软弱','反面','软弱'],explain:'坚强↔软弱',topic:'反义词',lv:1},
  {q:'"诚实"的近义词？',type:'choice',options:shuffle(['老实','虚伪','聪明','勇敢']),answer:'老实',hints:['诚实=老实','不骗人','老实'],explain:'近义词',topic:'近义词',lv:1},
  {q:'"美丽"的近义词？',type:'choice',options:shuffle(['漂亮','丑陋','高大','渺小']),answer:'漂亮',hints:['美丽=漂亮','好看','漂亮'],explain:'近义词',topic:'近义词',lv:1},
  {q:'"愉快"的近义词？',type:'choice',options:shuffle(['快乐','伤心','生气','害怕']),answer:'快乐',hints:['愉快=快乐','高兴','快乐'],explain:'近义词',topic:'近义词',lv:1},
  // 语文lv2补19
  {q:'"既...又..."表示什么关系？',type:'choice',options:shuffle(['并列','因果','转折','条件']),answer:'并列',hints:['既A又B','两个并列','并列'],explain:'既又表并列',topic:'关联词',lv:2},
  {q:'"要么...要么..."表示什么关系？',type:'choice',options:shuffle(['选择','并列','因果','条件']),answer:'选择',hints:['二选一','要么A要么B','选择'],explain:'要么要么表选择',topic:'关联词',lv:2},
  {q:'"白日依山尽黄河入海流"用了什么修辞？',type:'choice',options:shuffle(['对偶','比喻','拟人','夸张']),answer:'对偶',hints:['字数相等','词性对应','对偶'],explain:'对偶工整对仗',topic:'修辞',lv:2},
  {q:'"春风又绿江南岸"中"绿"字好在哪？',type:'choice',options:shuffle(['化静为动生动形象','颜色好看','字数少','押韵']),answer:'化静为动生动形象',hints:['绿做动词','变绿','化静为动'],explain:'炼字:形容词活用为动词',topic:'古诗赏析',lv:2},
  {q:'"作比较"的作用？',type:'choice',options:shuffle(['通过对比突出事物特点','列数字','打比方','举例子']),answer:'通过对比突出事物特点',hints:['A比B更...','突出特点','对比突出'],explain:'作比较突出事物特征',topic:'说明方法',lv:2},
  {q:'"总分总"结构的特点？',type:'choice',options:shuffle(['先总后分再总结','先分后总','先总后分','一直分述']),answer:'先总后分再总结',hints:['开头总起','中间分述','结尾总结'],explain:'总起+分述+总结',topic:'文章结构',lv:2},
  // 语文lv3补31
  {q:'"老师要求我们把不正确的错别字改正过来"有什么问题？',type:'choice',options:shuffle(['语义重复','搭配不当','缺少主语','语序不对']),answer:'语义重复',hints:['不正确就是错','重复了','语义重复'],explain:'不正确和错别字重复',topic:'修改病句',lv:3},
  {q:'"我估计他一定会来"有什么问题？',type:'choice',options:shuffle(['语义矛盾','搭配不当','缺少主语','没有问题']),answer:'语义矛盾',hints:['估计=不确定','一定=确定','矛盾'],explain:'估计和一定矛盾',topic:'修改病句',lv:3},
  {q:'"听了老师的话受到很大教育"有什么问题？',type:'choice',options:shuffle(['缺少主语','搭配不当','语义重复','语序不对']),answer:'缺少主语',hints:['谁听了','谁受到教育','缺少主语'],explain:'加上"我们"或"同学们"',topic:'修改病句',lv:3},
  {q:'体会作者感情的方法？',type:'choice',options:shuffle(['抓关键词句联系背景','随便猜','只看标题','看字数']),answer:'抓关键词句联系背景',hints:['重点词语','作者背景','抓关键词句联系背景'],explain:'抓关键词联系写作背景',topic:'阅读方法',lv:3},
  {q:'说明文的语言特点？',type:'choice',options:shuffle(['准确严密','优美抒情','幽默风趣','随意自由']),answer:'准确严密',hints:['科学准确','严谨','准确严密'],explain:'说明文语言准确严密',topic:'阅读方法',lv:3},
  {q:'"侧面描写"的作用？',type:'choice',options:shuffle(['从旁人角度间接突出人物特点','正面写','随便写','只写景']),answer:'从旁人角度间接突出人物特点',hints:['不直接写','通过别人来表现','间接突出'],explain:'侧面描写间接烘托人物',topic:'写作方法',lv:3},
  {q:'"环境描写"的作用？',type:'choice',options:shuffle(['烘托气氛推动情节','凑字数','好看','没有作用']),answer:'烘托气氛推动情节',hints:['渲染气氛','推动发展','烘托气氛推动情节'],explain:'环境描写烘托气氛',topic:'写作方法',lv:3}
);
// 英语lv1补31 lv2补24 lv3补30
QB[4].english.push(
  {q:'"He is _____ a song."他正在唱歌',type:'choice',options:shuffle(['sing','singing','sings','sang']),answer:'singing',hints:['is+doing','singing','singing'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"They are _____ lunch."他们正在吃午饭',type:'choice',options:shuffle(['have','having','has','had']),answer:'having',hints:['are+doing','having','having'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'"I am _____ TV."我正在看电视',type:'choice',options:shuffle(['watch','watching','watches','watched']),answer:'watching',hints:['am+doing','watching','watching'],explain:'现在进行时',topic:'现在进行时',lv:1},
  {q:'office是什么？',type:'choice',options:shuffle(['办公室','教室','图书馆','食堂']),answer:'办公室',hints:['o-f-f-i-c-e','老师工作的地方','办公室'],explain:'office=办公室',topic:'学校场所',lv:1},
  {q:'toilet是什么？',type:'choice',options:shuffle(['卫生间','教室','操场','食堂']),answer:'卫生间',hints:['t-o-i-l-e-t','洗手间','卫生间'],explain:'toilet=卫生间',topic:'学校场所',lv:1},
  {q:'sunny是什么天气？',type:'choice',options:shuffle(['晴朗','多云','下雨','下雪']),answer:'晴朗',hints:['sun+ny','有太阳','晴朗'],explain:'sunny=晴朗',topic:'天气',lv:1},
  {q:'rainy是什么天气？',type:'choice',options:shuffle(['晴朗','多云','下雨','下雪']),answer:'下雨',hints:['rain+y','下雨的','下雨'],explain:'rainy=下雨的',topic:'天气',lv:1},
  {q:'cloudy是什么天气？',type:'choice',options:shuffle(['晴朗','多云','下雨','下雪']),answer:'多云',hints:['cloud+y','有云的','多云'],explain:'cloudy=多云',topic:'天气',lv:1},
  {q:'snowy是什么天气？',type:'choice',options:shuffle(['晴朗','多云','下雨','下雪']),answer:'下雪',hints:['snow+y','下雪的','下雪'],explain:'snowy=下雪的',topic:'天气',lv:1},
  {q:'windy是什么天气？',type:'choice',options:shuffle(['有风','晴朗','下雨','下雪']),answer:'有风',hints:['wind+y','刮风的','有风'],explain:'windy=有风的',topic:'天气',lv:1},
  {q:'"She _____ like fish."她不喜欢鱼(三单)',type:'choice',options:shuffle(["doesn't","don't","isn't","wasn't"]),answer:"doesn't",hints:['She三单','否定doesn\'t','doesn\'t'],explain:'三单否定doesn\'t+原形',topic:'三单',lv:2},
  {q:'"_____ she like music?"她喜欢音乐吗',type:'choice',options:shuffle(['Does','Do','Is','Are']),answer:'Does',hints:['She三单','Does提问','Does'],explain:'三单疑问Does+原形',topic:'三单',lv:2},
  {q:'"There _____ no water."没有水',type:'choice',options:shuffle(['is','are','am','be']),answer:'is',hints:['water不可数','is','is'],explain:'不可数用is',topic:'There be',lv:2},
  {q:'tenth是第几？',type:'choice',options:shuffle(['第八','第九','第十','第十一']),answer:'第十',hints:['ten→tenth','第十','第十'],explain:'ten→tenth',topic:'序数词',lv:2},
  {q:'sixth是第几？',type:'choice',options:shuffle(['第四','第五','第六','第七']),answer:'第六',hints:['six→sixth','第六','第六'],explain:'six→sixth',topic:'序数词',lv:2},
  {q:'seventh是第几？',type:'choice',options:shuffle(['第五','第六','第七','第八']),answer:'第七',hints:['seven→seventh','第七','第七'],explain:'seven→seventh',topic:'序数词',lv:2},
  {q:'"It is warm today."意思？',type:'choice',options:shuffle(['今天暖和','今天冷','今天热','今天凉爽']),answer:'今天暖和',hints:['warm=暖和','天气','今天暖和'],explain:'warm=暖和',topic:'天气',lv:2},
  {q:'"Don\'t swim in the river!"意思？',type:'choice',options:shuffle(['不要在河里游泳','在河里游泳','游泳比赛','河里有鱼']),answer:'不要在河里游泳',hints:['Don\'t=不要','swim=游泳','不要在河里游泳'],explain:'否定祈使句',topic:'祈使句',lv:3},
  {q:'"Please sit down and read."意思？',type:'choice',options:shuffle(['请坐下读书','站起来','不要读','快跑']),answer:'请坐下读书',hints:['sit down=坐下','read=读','请坐下读书'],explain:'祈使句',topic:'祈使句',lv:3},
  {q:'"It\'s time to go to school."意思？',type:'choice',options:shuffle(['该上学了','放学了','在学校','不去学校']),answer:'该上学了',hints:["It's time to=该","go to school=上学",'该上学了'],explain:"It's time to+动词",topic:'时间',lv:3},
  {q:'"How much is the jacket?"回答用？',type:'choice',options:shuffle(["It's 200 yuan.","They are 200.","Two hundred.","Both A and C"]),answer:"Both A and C",hints:['问价格','回答金额','两种都对'],explain:'回答价格的方式',topic:'购物',lv:3},
  {q:'"What size do you want?"问什么？',type:'choice',options:shuffle(['要什么尺码','要什么颜色','要几个','多少钱']),answer:'要什么尺码',hints:['size=尺码','购物','要什么尺码'],explain:'购物询问尺码',topic:'购物',lv:3},
  {q:'"I\'ll take it."意思？',type:'choice',options:shuffle(['我买了','我拿着','我看看','我不要']),answer:'我买了',hints:['take=买/要','购物用语','我买了'],explain:'购物决定购买',topic:'购物',lv:3}
);
// 科学lv1补35 lv2补32 lv3补35
QB[4].science.push(
  {q:'我们用什么器官听到声音？',type:'choice',options:shuffle(['耳朵','眼睛','鼻子','嘴巴']),answer:'耳朵',hints:['听觉器官','耳朵','耳朵'],explain:'耳朵是听觉器官',topic:'声音',lv:1},
  {q:'声音传播需要什么？',type:'choice',options:shuffle(['介质(物质)','光','电','磁']),answer:'介质(物质)',hints:['空气水固体','需要介质','介质'],explain:'声音需要介质传播',topic:'声音',lv:1},
  {q:'把耳朵贴在铁轨上能更早听到火车声因为？',type:'choice',options:shuffle(['固体传声快','铁轨会说话','火车很响','铁轨很长']),answer:'固体传声快',hints:['固体传声比空气快','铁轨是固体','固体传声快'],explain:'声速固体>液体>气体',topic:'声音',lv:1},
  {q:'温度计里的液体通常是？',type:'choice',options:shuffle(['水银或酒精','水','油','墨水']),answer:'水银或酒精',hints:['热胀冷缩明显','常用液体','水银或酒精'],explain:'水银和酒精热胀冷缩明显',topic:'天气',lv:1},
  {q:'一天中通常什么时候最热？',type:'choice',options:shuffle(['中午12点','下午2点左右','早上6点','晚上8点']),answer:'下午2点左右',hints:['不是正午','午后2点左右','下午2点左右'],explain:'一天中午后2点左右最热',topic:'天气',lv:1},
  {q:'云是由什么组成的？',type:'choice',options:shuffle(['小水滴和冰晶','棉花','烟','灰尘']),answer:'小水滴和冰晶',hints:['水蒸气凝结','小水滴','小水滴和冰晶'],explain:'云由小水滴和冰晶组成',topic:'天气',lv:1},
  {q:'电池有几个电极？',type:'choice',options:shuffle(['1个','2个','3个','4个']),answer:'2个',hints:['正极和负极','2个','2个'],explain:'电池有正极(+)和负极(-)',topic:'电路',lv:2},
  {q:'开关的作用？',type:'choice',options:shuffle(['控制电路通断','发电','发光','储电']),answer:'控制电路通断',hints:['开=通关=断','控制','控制电路通断'],explain:'开关控制电路通断',topic:'电路',lv:2},
  {q:'用手电筒照墙会发现光是什么形状？',type:'choice',options:shuffle(['圆形','方形','三角形','不规则']),answer:'圆形',hints:['手电筒圆形','光斑是圆的','圆形'],explain:'光沿直线传播形成圆形光斑',topic:'光',lv:2},
  {q:'不透明物体的颜色由什么决定？',type:'choice',options:shuffle(['反射的光的颜色','重量','大小','形状']),answer:'反射的光的颜色',hints:['红色物体反射红光','反射','反射的光的颜色'],explain:'物体颜色=反射光的颜色',topic:'光',lv:2},
  {q:'食物链中箭头方向表示？',type:'choice',options:shuffle(['能量流动方向(被吃→吃)','从大到小','从左到右','随意']),answer:'能量流动方向(被吃→吃)',hints:['箭头指向吃的一方','能量流向','被吃→吃'],explain:'食物链箭头指向捕食者',topic:'食物链',lv:2},
  {q:'一条食物链至少有几种生物？',type:'choice',options:shuffle(['1种','2种','3种','不确定']),answer:'2种',hints:['至少一个吃一个被吃','2种','2种'],explain:'食物链至少2种生物',topic:'食物链',lv:2},
  {q:'岩浆岩的特征？',type:'choice',options:shuffle(['有气孔晶体结构','有层理有化石','有条纹','很软']),answer:'有气孔晶体结构',hints:['岩浆冷却','可能有气孔','有气孔晶体结构'],explain:'岩浆岩有气孔和晶体',topic:'岩石',lv:3},
  {q:'板岩属于什么岩？',type:'choice',options:shuffle(['变质岩','岩浆岩','沉积岩','人造岩']),answer:'变质岩',hints:['页岩变质','高温高压','变质岩'],explain:'板岩是变质岩',topic:'岩石',lv:3},
  {q:'人体消化液有哪些？',type:'choice',options:shuffle(['唾液胃液肠液胆汁胰液','只有唾液','只有胃液','只有肠液']),answer:'唾液胃液肠液胆汁胰液',hints:['多种消化液','配合消化','唾液胃液肠液胆汁胰液'],explain:'多种消化液参与消化',topic:'消化系统',lv:3},
  {q:'人体呼吸频率约每分钟几次？',type:'choice',options:shuffle(['5-10次','16-20次','30-40次','60次以上']),answer:'16-20次',hints:['安静时','正常范围','16-20次'],explain:'正常呼吸频率约16-20次/分',topic:'呼吸系统',lv:3},
  {q:'吸烟对呼吸系统有什么害处？',type:'choice',options:shuffle(['损害肺功能可能导致肺癌','没有害处','让肺更健康','帮助呼吸']),answer:'损害肺功能可能导致肺癌',hints:['烟有害','伤害肺','损害肺功能'],explain:'吸烟严重损害呼吸系统',topic:'呼吸系统',lv:3},
  {q:'保护食物链生态平衡最重要的是？',type:'choice',options:shuffle(['保护生物多样性','消灭害虫','砍树建房','排放废水']),answer:'保护生物多样性',hints:['每种生物都有作用','保护多样性','保护生物多样性'],explain:'生物多样性维持生态平衡',topic:'食物链',lv:3}
);

// =============== 补充题目 — 人教版知识点覆盖 ===============

// -------- 数学：公顷和平方千米 --------
QB[4].math.push(
  {q:'1公顷等于多少平方米？',type:'choice',options:shuffle(['1000','10000','100000','1000000']),answer:'10000',hints:['边长100米的正方形','100×100','10000平方米'],explain:'1公顷=10000平方米',topic:'公顷和平方千米',lv:1},
  {q:'1平方千米等于多少公顷？',type:'choice',options:shuffle(['10','100','1000','10000']),answer:'100',hints:['1km=1000m','1000000÷10000','100公顷'],explain:'1平方千米=100公顷',topic:'公顷和平方千米',lv:2},
  {q:'一个足球场面积大约7000平方米合多少公顷？',type:'input',answer:'0.7',hints:['1公顷=10000㎡','7000÷10000','0.7公顷'],explain:'平方米换公顷÷10000',topic:'公顷和平方千米',lv:2},
  {q:'3平方千米等于多少平方米？',type:'input',answer:'3000000',hints:['1平方千米=1000000㎡','3×1000000','3000000'],explain:'平方千米换平方米×1000000',topic:'公顷和平方千米',lv:3},
  {q:'50000平方米等于多少公顷？',type:'input',answer:'5',hints:['÷10000','50000÷10000','5公顷'],explain:'平方米换公顷÷10000',topic:'公顷和平方千米',lv:2}
);

// -------- 数学：四则运算与运算顺序 --------
QB[4].math.push(
  {q:'200-35×4 = ?',type:'input',answer:'60',hints:['先乘后减','35×4=140','200-140=60'],explain:'先乘除后加减',topic:'四则运算',lv:2},
  {q:'(200-35)×4 = ?',type:'input',answer:'660',hints:['先算括号','200-35=165','165×4=660'],explain:'有括号先算括号内',topic:'四则运算',lv:2},
  {q:'36-12=24 用什么验算？',type:'choice',options:shuffle(['24+12=36','36+12','24-12','36×12']),answer:'24+12=36',hints:['减法用加法验','差+减数=被减数','24+12=36'],explain:'减法验算：差+减数=被减数',topic:'四则运算',lv:1},
  {q:'一个数÷5商12余3这个数是？',type:'input',answer:'63',hints:['被除数=商×除数+余数','12×5+3','63'],explain:'被除数=商×除数+余数',topic:'四则运算',lv:3},
  {q:'加法和减法是什么关系？',type:'choice',options:shuffle(['互逆运算','相同运算','无关','互补运算']),answer:'互逆运算',hints:['加法反过来是减法','互为逆运算','互逆运算'],explain:'加减互逆乘除互逆',topic:'四则运算',lv:1}
);

// -------- 数学：小数的意义和性质 --------
QB[4].math.push(
  {q:'0.3里面有几个0.1？',type:'choice',options:shuffle(['1个','2个','3个','30个']),answer:'3个',hints:['0.3=3个0.1','十分之三','3个'],explain:'一位小数的计数单位是0.1',topic:'小数的意义',lv:1},
  {q:'0.30和0.3哪个大？',type:'choice',options:shuffle(['0.30大','0.3大','一样大','无法比较']),answer:'一样大',hints:['末尾加0去0','大小不变','一样大'],explain:'小数末尾添0或去0大小不变',topic:'小数的意义',lv:1},
  {q:'把3.6的小数点向右移动一位得？',type:'input',answer:'36',hints:['右移一位×10','3.6×10','36'],explain:'小数点右移一位数扩大10倍',topic:'小数的意义',lv:2},
  {q:'5.26保留一位小数约是？',type:'input',answer:'5.3',hints:['看第二位6','6≥5进1','5.3'],explain:'四舍五入保留一位小数',topic:'小数的意义',lv:2},
  {q:'比较大小：0.58和0.6谁大？',type:'choice',options:shuffle(['0.58大','0.6大','一样大','无法比较']),answer:'0.6大',hints:['0.6=0.60','58<60','0.6大'],explain:'先对齐小数位数再比较',topic:'小数的意义',lv:2}
);

// -------- 数学：三角形分类 --------
QB[4].math.push(
  {q:'三个角都是锐角的三角形叫？',type:'choice',options:shuffle(['锐角三角形','直角三角形','钝角三角形','等边三角形']),answer:'锐角三角形',hints:['三个角都<90°','锐角三角形','锐角三角形'],explain:'三个角都是锐角=锐角三角形',topic:'三角形',lv:1},
  {q:'有一个角是直角的三角形叫？',type:'choice',options:shuffle(['锐角三角形','直角三角形','钝角三角形','等腰三角形']),answer:'直角三角形',hints:['一个角=90°','直角三角形','直角三角形'],explain:'有一个直角=直角三角形',topic:'三角形',lv:1},
  {q:'等边三角形每个角是多少度？',type:'input',answer:'60',hints:['三个角相等','180÷3','60度'],explain:'等边三角形三个角都是60°',topic:'三角形',lv:2},
  {q:'三角形两边之和与第三边的关系？',type:'choice',options:shuffle(['大于第三边','等于第三边','小于第三边','不确定']),answer:'大于第三边',hints:['三边关系','两边之和>第三边','大于'],explain:'三角形任意两边之和大于第三边',topic:'三角形',lv:2},
  {q:'三角形内角和是多少度？',type:'input',answer:'180',hints:['所有三角形都一样','三个角加起来','180度'],explain:'三角形内角和=180°',topic:'三角形',lv:1}
);

// -------- 数学：图形的运动 --------
QB[4].math.push(
  {q:'把图形沿直线方向移动一定距离叫什么？',type:'choice',options:shuffle(['平移','旋转','对称','翻转']),answer:'平移',hints:['沿直线移动','方向+距离','平移'],explain:'平移=沿一个方向移动',topic:'图形的运动',lv:1},
  {q:'钟表指针的运动属于什么？',type:'choice',options:shuffle(['平移','旋转','对称','翻转']),answer:'旋转',hints:['绕一个点转动','指针转圈','旋转'],explain:'绕一个点转动=旋转',topic:'图形的运动',lv:1},
  {q:'正方形有几条对称轴？',type:'choice',options:shuffle(['1条','2条','4条','无数条']),answer:'4条',hints:['水平竖直各1条','对角线2条','共4条'],explain:'正方形有4条对称轴',topic:'图形的运动',lv:2},
  {q:'圆有几条对称轴？',type:'choice',options:shuffle(['1条','2条','4条','无数条']),answer:'无数条',hints:['任意直径','都是对称轴','无数条'],explain:'圆有无数条对称轴',topic:'图形的运动',lv:2},
  {q:'等腰三角形有几条对称轴？',type:'choice',options:shuffle(['0条','1条','2条','3条']),answer:'1条',hints:['沿顶角平分线折','1条','1条'],explain:'等腰三角形有1条对称轴',topic:'图形的运动',lv:2}
);

// -------- 数学：平均数 --------
QB[4].math.push(
  {q:'4个同学身高132、136、140、144厘米平均身高？',type:'input',answer:'138',hints:['先求总和552','552÷4','138厘米'],explain:'平均数=总数÷个数',topic:'平均数',lv:2},
  {q:'小明5次成绩：90、85、95、80、100平均分？',type:'input',answer:'90',hints:['总分450','450÷5','90分'],explain:'平均分=总分÷次数',topic:'平均数',lv:2},
  {q:'3个数平均12加一个数后平均15第四个数？',type:'input',answer:'24',hints:['原总和3×12=36','新总和4×15=60','60-36=24'],explain:'新总和-原总和=新增的数',topic:'平均数',lv:3},
  {q:'一组数据3、5、7、9、6平均数是？',type:'input',answer:'6',hints:['3+5+7+9+6=30','30÷5','6'],explain:'平均数=总数÷个数',topic:'平均数',lv:2}
);

// -------- 数学：运算定律 --------
QB[4].math.push(
  {q:'a+b=b+a 这是什么运算定律？',type:'choice',options:shuffle(['加法交换律','加法结合律','乘法交换律','乘法分配律']),answer:'加法交换律',hints:['交换位置','和不变','加法交换律'],explain:'交换加数位置和不变',topic:'运算定律',lv:1},
  {q:'a×(b+c)=a×b+a×c 这是什么定律？',type:'choice',options:shuffle(['乘法分配律','乘法交换律','乘法结合律','加法结合律']),answer:'乘法分配律',hints:['分别乘再加','分配律','乘法分配律'],explain:'一个数乘两数的和=分别乘再加',topic:'运算定律',lv:2},
  {q:'(a×b)×c=a×(b×c) 这是什么定律？',type:'choice',options:shuffle(['乘法结合律','乘法交换律','乘法分配律','加法结合律']),answer:'乘法结合律',hints:['改变结合方式','积不变','乘法结合律'],explain:'先乘谁都行积不变',topic:'运算定律',lv:2},
  {q:'25×13×4 怎样简便计算？',type:'choice',options:shuffle(['25×4×13','25+4×13','13×4+25','(25+13)×4']),answer:'25×4×13',hints:['25×4=100','交换律','25×4×13=1300'],explain:'利用乘法交换律凑整百',topic:'运算定律',lv:2}
);

// -------- 语文：古诗补充 --------
QB[4].chinese.push(
  {q:'"一道残阳铺水中"下一句？',type:'choice',options:shuffle(['半江瑟瑟半江红','可怜九月初三夜','露似真珠月似弓','大漠沙如雪']),answer:'半江瑟瑟半江红',hints:['白居易《暮江吟》','残阳照水','半江瑟瑟半江红'],explain:'白居易《暮江吟》',topic:'古诗',lv:2},
  {q:'"梅须逊雪三分白"下一句？',type:'choice',options:shuffle(['雪却输梅一段香','遥知不是雪','为有暗香来','忽如一夜春风来']),answer:'雪却输梅一段香',hints:['卢钺《雪梅》','梅和雪互比','雪却输梅一段香'],explain:'卢钺《雪梅》',topic:'古诗',lv:2},
  {q:'"但使龙城飞将在"下一句？',type:'choice',options:shuffle(['不教胡马度阴山','万里长征人未还','秦时明月汉时关','醉卧沙场君莫笑']),answer:'不教胡马度阴山',hints:['王昌龄《出塞》','边塞诗','不教胡马度阴山'],explain:'王昌龄《出塞》',topic:'古诗',lv:2},
  {q:'"儿童急走追黄蝶"下一句？',type:'choice',options:shuffle(['飞入菜花无处寻','小扣柴扉久不开','忙趁东风放纸鸢','草长莺飞二月天']),answer:'飞入菜花无处寻',hints:['杨万里《宿新市徐公店》','追蝴蝶','飞入菜花无处寻'],explain:'杨万里《宿新市徐公店》',topic:'古诗',lv:2},
  {q:'"不要人夸好颜色"下一句？',type:'choice',options:shuffle(['只留清气满乾坤','疑是地上霜','为有暗香来','遥知不是雪']),answer:'只留清气满乾坤',hints:['王冕《墨梅》','品格高洁','只留清气满乾坤'],explain:'王冕《墨梅》',topic:'古诗',lv:2},
  {q:'"生当作人杰"下一句？',type:'choice',options:shuffle(['死亦为鬼雄','至今思项羽','不肯过江东','壮志饥餐胡虏肉']),answer:'死亦为鬼雄',hints:['李清照《夏日绝句》','气节','死亦为鬼雄'],explain:'李清照《夏日绝句》',topic:'古诗',lv:2},
  {q:'"黄河远上白云间"下一句？',type:'choice',options:shuffle(['一片孤城万仞山','春风不度玉门关','羌笛何须怨杨柳','万里长征人未还']),answer:'一片孤城万仞山',hints:['王之涣《凉州词》','边塞景色','一片孤城万仞山'],explain:'王之涣《凉州词》',topic:'古诗',lv:2}
);

// -------- 语文：文言文 --------
QB[4].chinese.push(
  {q:'"精卫填海"中精卫原来是谁？',type:'choice',options:shuffle(['炎帝的小女儿女娃','王母娘娘','嫦娥','织女']),answer:'炎帝的小女儿女娃',hints:['炎帝之少女','溺于东海','化为精卫鸟'],explain:'精卫是炎帝之女女娃溺海后化鸟填海',topic:'文言文',lv:2},
  {q:'"王戎不取道旁李"王戎为什么不摘李子？',type:'choice',options:shuffle(['路边多果必是苦李','不喜欢吃李子','李子太高够不着','有人看守']),answer:'路边多果必是苦李',hints:['路边多子必苦','善于推理','苦李'],explain:'善于观察和推理',topic:'文言文',lv:3},
  {q:'文言文中"少女"是什么意思？',type:'choice',options:shuffle(['小女儿','年轻女子','少年女孩','很少的女子']),answer:'小女儿',hints:['古文少=小','少女=小女儿','小女儿'],explain:'古文中少女=小女儿',topic:'文言文',lv:2},
  {q:'"盘古开天地"的故事属于什么体裁？',type:'choice',options:shuffle(['神话','寓言','童话','小说']),answer:'神话',hints:['远古传说','神话故事','神话'],explain:'盘古开天地是中国古代神话',topic:'文言文',lv:1}
);

// -------- 语文：标点符号 --------
QB[4].chinese.push(
  {q:'引用别人的话时用什么标点引出？',type:'choice',options:shuffle(['冒号和引号','句号','逗号','感叹号']),answer:'冒号和引号',hints:['某某说："..."','冒号+引号','冒号和引号'],explain:'引用的话用冒号和引号',topic:'标点符号',lv:1},
  {q:'并列的词语之间用什么标点？',type:'choice',options:shuffle(['顿号','逗号','句号','分号']),answer:'顿号',hints:['苹果、香蕉、橘子','并列用顿号','顿号'],explain:'并列词语之间用顿号(、)',topic:'标点符号',lv:2},
  {q:'表示省略内容用什么标点？',type:'choice',options:shuffle(['省略号','破折号','书名号','引号']),answer:'省略号',hints:['六个点……','省略号','省略号'],explain:'省略号表示省略的内容',topic:'标点符号',lv:2},
  {q:'书名、篇名用什么标点？',type:'choice',options:shuffle(['书名号','引号','括号','破折号']),answer:'书名号',hints:['《》','书名号','书名号'],explain:'书名篇名用书名号《》',topic:'标点符号',lv:2}
);

// -------- 英语：教室词汇 --------
QB[4].english.push(
  {q:'blackboard 是什么？',type:'choice',options:shuffle(['黑板','白板','书桌','椅子']),answer:'黑板',hints:['black+board','教室前面','黑板'],explain:'blackboard = 黑板',topic:'教室词汇',lv:1},
  {q:'"Turn on the light" 意思是？',type:'choice',options:shuffle(['开灯','关灯','开门','关门']),answer:'开灯',hints:['turn on=打开','light=灯','开灯'],explain:'turn on the light = 开灯',topic:'教室词汇',lv:1},
  {q:'"Let me clean the window" 意思？',type:'choice',options:shuffle(['让我擦窗户','让我开窗户','让我关窗户','让我看窗户']),answer:'让我擦窗户',hints:['clean=擦/打扫','window=窗户','让我擦窗户'],explain:'clean the window = 擦窗户',topic:'教室词汇',lv:2},
  {q:'computer 是什么？',type:'choice',options:shuffle(['电脑','电视','电话','空调']),answer:'电脑',hints:['c-o-m-p-u-t-e-r','教室里用的','电脑'],explain:'computer = 电脑',topic:'教室词汇',lv:1}
);

// -------- 英语：房间与介词 --------
QB[4].english.push(
  {q:'bedroom 是什么？',type:'choice',options:shuffle(['卧室','客厅','厨房','卫生间']),answer:'卧室',hints:['bed+room','睡觉的房间','卧室'],explain:'bedroom = 卧室',topic:'房间与介词',lv:1},
  {q:'kitchen 是什么？',type:'choice',options:shuffle(['卧室','客厅','厨房','卫生间']),answer:'厨房',hints:['k-i-t-c-h-e-n','做饭的地方','厨房'],explain:'kitchen = 厨房',topic:'房间与介词',lv:1},
  {q:'"The book is _____ the desk." 书在桌上',type:'choice',options:shuffle(['on','in','under','behind']),answer:'on',hints:['在上面=on','on the desk','on'],explain:'on = 在...上面',topic:'房间与介词',lv:2},
  {q:'"The cat is _____ the chair." 猫在椅子下面',type:'choice',options:shuffle(['on','in','under','behind']),answer:'under',hints:['在下面=under','under the chair','under'],explain:'under = 在...下面',topic:'房间与介词',lv:2},
  {q:'living room 是什么？',type:'choice',options:shuffle(['卧室','客厅','厨房','书房']),answer:'客厅',hints:['living=生活','客厅','客厅'],explain:'living room = 客厅',topic:'房间与介词',lv:1}
);

// -------- 英语：食物词汇 --------
QB[4].english.push(
  {q:'rice 是什么？',type:'choice',options:shuffle(['米饭','面条','面包','蛋糕']),answer:'米饭',hints:['r-i-c-e','中国人主食','米饭'],explain:'rice = 米饭(不可数)',topic:'食物词汇',lv:1},
  {q:'noodles 是什么？',type:'choice',options:shuffle(['面条','米饭','面包','蛋糕']),answer:'面条',hints:['n-o-o-d-l-e-s','常用复数','面条'],explain:'noodles = 面条',topic:'食物词汇',lv:1},
  {q:'"Pass me the chopsticks" 中 chopsticks 是？',type:'choice',options:shuffle(['筷子','叉子','刀','勺子']),answer:'筷子',hints:['中国人用的餐具','chopsticks','筷子'],explain:'chopsticks=筷子 fork=叉 knife=刀 spoon=勺',topic:'食物词汇',lv:2},
  {q:'"Help yourself!" 是什么意思？',type:'choice',options:shuffle(['请自便/随便吃','帮帮我','你自己来','帮助别人']),answer:'请自便/随便吃',hints:['招待客人用语','自己动手','请自便'],explain:'Help yourself = 请自便',topic:'食物词汇',lv:2},
  {q:'vegetable 是什么？',type:'choice',options:shuffle(['蔬菜','水果','肉类','主食']),answer:'蔬菜',hints:['v-e-g-e-t-a-b-l-e','绿色健康的','蔬菜'],explain:'vegetable = 蔬菜',topic:'食物词汇',lv:1}
);

// -------- 英语：家庭与职业 --------
QB[4].english.push(
  {q:'doctor 是什么职业？',type:'choice',options:shuffle(['医生','老师','司机','农民']),answer:'医生',hints:['d-o-c-t-o-r','看病的','医生'],explain:'doctor = 医生',topic:'家庭与职业',lv:1},
  {q:'nurse 是什么职业？',type:'choice',options:shuffle(['护士','医生','老师','司机']),answer:'护士',hints:['n-u-r-s-e','照顾病人','护士'],explain:'nurse = 护士',topic:'家庭与职业',lv:1},
  {q:'uncle 是什么意思？',type:'choice',options:shuffle(['叔叔/舅舅','阿姨','爷爷','哥哥']),answer:'叔叔/舅舅',hints:['父母的兄弟','uncle','叔叔/舅舅'],explain:'uncle = 叔叔/伯伯/舅舅',topic:'家庭与职业',lv:2},
  {q:'"What\'s your father\'s job?" 在问什么？',type:'choice',options:shuffle(['你爸爸做什么工作','你爸爸在哪里','你爸爸多大','你爸爸叫什么']),answer:'你爸爸做什么工作',hints:['job=工作','问职业','你爸爸做什么工作'],explain:'问职业用What\'s...job?',topic:'家庭与职业',lv:2}
);

// -------- 英语：农场词汇 --------
QB[4].english.push(
  {q:'tomato 的复数是？',type:'choice',options:shuffle(['tomatoes','tomatos','tomatoies','tomatoss']),answer:'tomatoes',hints:['以o结尾加es','tomato+es','tomatoes'],explain:'tomato→tomatoes(有生命的o结尾加es)',topic:'农场词汇',lv:2},
  {q:'horse 是什么动物？',type:'choice',options:shuffle(['马','牛','羊','鸡']),answer:'马',hints:['h-o-r-s-e','可以骑的','马'],explain:'horse = 马',topic:'农场词汇',lv:1},
  {q:'sheep 的复数形式是？',type:'choice',options:shuffle(['sheep','sheeps','sheepes','sheepies']),answer:'sheep',hints:['单复数同形','不变化','sheep'],explain:'sheep 单复数同形',topic:'农场词汇',lv:2},
  {q:'cow 和 hen 分别是什么？',type:'choice',options:shuffle(['奶牛和母鸡','马和羊','猪和鸭','狗和猫']),answer:'奶牛和母鸡',hints:['cow=奶牛','hen=母鸡','奶牛和母鸡'],explain:'cow=奶牛 hen=母鸡',topic:'农场词汇',lv:1}
);

// -------- 英语：衣服词汇 --------
QB[4].english.push(
  {q:'dress 是什么？',type:'choice',options:shuffle(['连衣裙','衬衫','裤子','外套']),answer:'连衣裙',hints:['d-r-e-s-s','女孩穿的','连衣裙'],explain:'dress = 连衣裙',topic:'衣服词汇',lv:1},
  {q:'"Put on your coat" 意思是？',type:'choice',options:shuffle(['穿上外套','脱掉外套','买外套','洗外套']),answer:'穿上外套',hints:['put on=穿上','coat=外套','穿上外套'],explain:'put on = 穿上',topic:'衣服词汇',lv:1},
  {q:'"Whose coat is this?" "It\'s _____." 我的',type:'choice',options:shuffle(['mine','my','I','me']),answer:'mine',hints:['名词性物主代词','mine=我的东西','mine'],explain:'mine=我的(后面不加名词)',topic:'衣服词汇',lv:2},
  {q:'pants 和 shorts 分别是？',type:'choice',options:shuffle(['长裤和短裤','裙子和短裤','外套和上衣','袜子和鞋子']),answer:'长裤和短裤',hints:['pants=长裤','shorts=短裤','长裤和短裤'],explain:'pants=长裤 shorts=短裤',topic:'衣服词汇',lv:1}
);

// -------- 科学：溶解 --------
QB[4].science.push(
  {q:'把食盐放入水中搅拌后食盐怎么了？',type:'choice',options:shuffle(['溶解了看不见了','沉到底了','浮在上面','变色了']),answer:'溶解了看不见了',hints:['食盐能溶于水','均匀分布','溶解了'],explain:'食盐溶解在水中均匀分布',topic:'溶解',lv:1},
  {q:'下列哪种物质不能溶解在水中？',type:'choice',options:shuffle(['沙子','食盐','白糖','小苏打']),answer:'沙子',hints:['沙子不溶于水','会沉淀','沙子'],explain:'沙子不溶于水',topic:'溶解',lv:1},
  {q:'怎样加快食盐在水中的溶解？',type:'choice',options:shuffle(['搅拌、加热、研碎','不动等待','加更多盐','降温']),answer:'搅拌、加热、研碎',hints:['搅拌加快','加热加快','研碎加快'],explain:'搅拌、加热、研碎都能加快溶解',topic:'溶解',lv:2},
  {q:'一杯水能无限溶解食盐吗？',type:'choice',options:shuffle(['不能会饱和','能','能但很慢','看水温']),answer:'不能会饱和',hints:['饱和溶液','不能再溶了','有限量'],explain:'一定量水只能溶解一定量盐',topic:'溶解',lv:2},
  {q:'把溶解在水中的盐取回来用什么方法？',type:'choice',options:shuffle(['蒸发','过滤','搅拌','冷却']),answer:'蒸发',hints:['加热蒸发水','盐留下','蒸发'],explain:'蒸发结晶可以分离盐和水',topic:'溶解',lv:3}
);

// -------- 科学：身体结构 --------
QB[4].science.push(
  {q:'人体的支架是什么？',type:'choice',options:shuffle(['骨骼','肌肉','皮肤','血管']),answer:'骨骼',hints:['支撑身体','框架','骨骼'],explain:'骨骼是人体的支架',topic:'身体结构',lv:1},
  {q:'骨和骨之间的连接叫什么？',type:'choice',options:shuffle(['关节','肌肉','韧带','骨髓']),answer:'关节',hints:['连接两块骨','可以活动','关节'],explain:'关节连接骨与骨使身体能活动',topic:'身体结构',lv:1},
  {q:'使骨骼运动的是什么？',type:'choice',options:shuffle(['肌肉','关节','皮肤','血液']),answer:'肌肉',hints:['收缩牵动骨骼','带动运动','肌肉'],explain:'肌肉收缩和舒张带动骨骼运动',topic:'身体结构',lv:2},
  {q:'运动后心跳和呼吸会怎样变化？',type:'choice',options:shuffle(['加快','变慢','不变','停止']),answer:'加快',hints:['需要更多氧气','加快供氧','加快'],explain:'运动需要更多氧气心跳呼吸加快',topic:'身体结构',lv:2}
);

// -------- 科学：动植物繁殖 --------
QB[4].science.push(
  {q:'一朵完全花由哪些部分组成？',type:'choice',options:shuffle(['花萼花瓣雄蕊雌蕊','只有花瓣','只有花蕊','花萼和花瓣']),answer:'花萼花瓣雄蕊雌蕊',hints:['四个部分','由外到里','花萼花瓣雄蕊雌蕊'],explain:'完全花有花萼花瓣雄蕊雌蕊四部分',topic:'动植物繁殖',lv:1},
  {q:'花粉从雄蕊传到雌蕊的过程叫什么？',type:'choice',options:shuffle(['传粉','开花','结果','发芽']),answer:'传粉',hints:['花粉转移','传粉','传粉'],explain:'传粉是花粉从雄蕊传到雌蕊的过程',topic:'动植物繁殖',lv:2},
  {q:'蒲公英的种子靠什么传播？',type:'choice',options:shuffle(['风','水','动物','弹射']),answer:'风',hints:['有小伞结构','随风飘散','风'],explain:'蒲公英靠风传播种子',topic:'动植物繁殖',lv:2},
  {q:'蝴蝶的一生经历哪几个阶段？',type:'choice',options:shuffle(['卵→幼虫→蛹→成虫','卵→成虫','幼虫→成虫','卵→蛹→成虫']),answer:'卵→幼虫→蛹→成虫',hints:['完全变态发育','四个阶段','卵幼虫蛹成虫'],explain:'蝴蝶属于完全变态发育',topic:'动植物繁殖',lv:3},
  {q:'苍耳的种子靠什么传播？',type:'choice',options:shuffle(['动物皮毛','风','水','弹射']),answer:'动物皮毛',hints:['表面有钩刺','粘在动物身上','动物皮毛'],explain:'苍耳靠钩刺粘在动物皮毛上传播',topic:'动植物繁殖',lv:2}
);

// -------- 科学：食物与营养 --------
QB[4].science.push(
  {q:'米饭面包主要提供什么营养？',type:'choice',options:shuffle(['糖类(碳水化合物)','蛋白质','脂肪','维生素']),answer:'糖类(碳水化合物)',hints:['主食','提供能量','糖类'],explain:'米饭面包主要含糖类提供能量',topic:'食物营养',lv:1},
  {q:'牛奶鸡蛋主要提供什么营养？',type:'choice',options:shuffle(['蛋白质','糖类','脂肪','矿物质']),answer:'蛋白质',hints:['生长发育需要','蛋白质丰富','蛋白质'],explain:'牛奶鸡蛋富含蛋白质',topic:'食物营养',lv:1},
  {q:'新鲜蔬菜水果主要提供什么营养？',type:'choice',options:shuffle(['维生素','蛋白质','脂肪','糖类']),answer:'维生素',hints:['蔬菜水果','维生素丰富','维生素'],explain:'新鲜蔬果富含维生素',topic:'食物营养',lv:2},
  {q:'为什么不能吃变质食物？',type:'choice',options:shuffle(['有害细菌危害健康','味道不好','颜色不好','没有区别']),answer:'有害细菌危害健康',hints:['食品安全','细菌繁殖','有害健康'],explain:'变质食物产生有害细菌危害健康',topic:'食物营养',lv:2},
  {q:'均衡膳食是什么意思？',type:'choice',options:shuffle(['各种食物搭配吃','只吃肉','只吃蔬菜','想吃什么吃什么']),answer:'各种食物搭配吃',hints:['营养全面','荤素搭配','各种食物搭配'],explain:'均衡膳食=各类食物合理搭配',topic:'食物营养',lv:1}
);
