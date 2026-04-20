// 二年级题库（人教版）
// --- 数学 ---
for(let i=0;i<8;i++){const a=rand(2,9),b=rand(2,9),s=a*b;
  QB[2].math.push({q:a+' × '+b+' = ?',type:'choice',options:shuffle([String(s),String(s-a),String(s+a),String(s+b)]),answer:String(s),hints:['乘法就是'+b+'个'+a+'相加','背口诀'+Math.min(a,b)+'×'+Math.max(a,b),a+'×'+b+'='+s],explain:'背熟乘法口诀',topic:'乘法口诀',lv:1});}
for(let i=0;i<6;i++){const a=rand(25,85),b=rand(10,99-a),s=a+b;
  QB[2].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['个位相加看是否进位','十位别忘加进位',a+'+'+b+'='+s],explain:'两位数加法注意进位',topic:'两位数加减法',lv:1});}
for(let i=0;i<6;i++){const a=rand(40,95),b=rand(10,a-10),s=a-b;
  QB[2].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['个位不够减要退位','从十位借1当10',a+'-'+b+'='+s],explain:'两位数减法注意退位',topic:'两位数加减法',lv:1});}
QB[2].math.push(
  {q:'12÷3=?',type:'choice',options:shuffle(['4','3','5','6']),answer:'4',hints:['3×?=12','3×4=12','4'],explain:'除法是乘法的逆运算',topic:'表内除法',lv:2},
  {q:'24÷6=?',type:'input',answer:'4',hints:['6×?=24','6×4=24','4'],explain:'除法口诀',topic:'表内除法',lv:2},
  {q:'45÷9=?',type:'input',answer:'5',hints:['9×?=45','9×5=45','5'],explain:'除法口诀',topic:'表内除法',lv:2},
  {q:'18个苹果平均分3人每人几个？',type:'input',answer:'6',hints:['平均分=除法','18÷3','6个'],explain:'平均分用除法',topic:'表内除法',lv:2},
  {q:'1米=?厘米',type:'input',answer:'100',hints:['米是大单位','1米=100厘米','100'],explain:'1米=100厘米',topic:'认识长度',lv:2},
  {q:'课桌高约70?单位是',type:'choice',options:shuffle(['米','厘米','千米','毫米']),answer:'厘米',hints:['70米太高','70厘米合适','厘米'],explain:'选合适的长度单位',topic:'认识长度',lv:2},
  {q:'直角是多少度？',type:'choice',options:shuffle(['45°','90°','180°','360°']),answer:'90°',hints:['正方形的角','直角=90度','90°'],explain:'直角=90°',topic:'角的认识',lv:2},
  {q:'3456有几个千？',type:'choice',options:shuffle(['3','4','5','6']),answer:'3',hints:['千位上是3','3个千','3'],explain:'千位数字表示几个千',topic:'万以内数',lv:2},
  {q:'最大的三位数是？',type:'input',answer:'999',hints:['每位都是9','999','999'],explain:'最大三位数999',topic:'万以内数',lv:2},
  {q:'时针在7和8之间分针指6几时几分？',type:'choice',options:shuffle(['7:30','7:06','8:30','6:07']),answer:'7:30',hints:['分针指6=30分','时针过了7','7:30'],explain:'分针指6=30分',topic:'认识时间',lv:2},
  {q:'17÷5=?...?',type:'choice',options:shuffle(['3...2','3...1','2...7','4...1']),answer:'3...2',hints:['5×3=15','17-15=2','商3余2'],explain:'有余数的除法',topic:'有余数除法',lv:3},
  {q:'23÷4=?...?',type:'choice',options:shuffle(['5...3','6...1','4...7','5...2']),answer:'5...3',hints:['4×5=20','23-20=3','商5余3'],explain:'余数要比除数小',topic:'有余数除法',lv:3},
  {q:'一盒饼干5元买4盒多少元？',type:'input',answer:'20',hints:['总价=单价×数量','5×4','20元'],explain:'总价=单价×数量',topic:'应用题',lv:3},
  {q:'35个气球飞走8个又买12个现在几个？',type:'input',answer:'39',hints:['35-8=27','27+12=39','39个'],explain:'两步混合运算',topic:'应用题',lv:3},
  {q:'每排6棵树种5排共几棵？',type:'input',answer:'30',hints:['6×5','行列用乘法','30棵'],explain:'行列问题用乘法',topic:'应用题',lv:3},
  {q:'1千克=?克',type:'choice',options:shuffle(['10克','100克','1000克','10000克']),answer:'1000克',hints:['千克是大单位','1千克=1000克','1000克'],explain:'1千克=1000克',topic:'克和千克',lv:3}
);
// --- 语文 ---
QB[2].chinese.push(
  {q:'下面哪个是多音字？',type:'choice',options:shuffle(['天','花','长','水']),answer:'长',hints:['哪个有两种读音','长(cháng/zhǎng)','长'],explain:'多音字要看语境',topic:'多音字',lv:1},
  {q:'"高"的反义词？',type:'choice',options:shuffle(['大','矮','远','快']),answer:'矮',hints:['高的反面','高↔矮','矮'],explain:'反义词',topic:'反义词',lv:1},
  {q:'"快"的反义词？',type:'choice',options:shuffle(['慢','大','高','多']),answer:'慢',hints:['快的反面','快↔慢','慢'],explain:'反义词',topic:'反义词',lv:1},
  {q:'"飞流直下三千尺"前一句？',type:'choice',options:shuffle(['床前明月光','欲穷千里目','日照香炉生紫烟','疑是银河落九天']),answer:'日照香炉生紫烟',hints:['望庐山瀑布','李白','日照香炉生紫烟'],explain:'李白《望庐山瀑布》',topic:'古诗',lv:2},
  {q:'"白日依山尽"出自哪首诗？',type:'choice',options:shuffle(['望庐山瀑布','登鹳雀楼','静夜思','春晓']),answer:'登鹳雀楼',hints:['黄河入海流','王之涣','登鹳雀楼'],explain:'王之涣《登鹳雀楼》',topic:'古诗',lv:2},
  {q:'"桃花潭水深千尺"下一句？',type:'choice',options:shuffle(['疑是银河落九天','不及汪伦送我情','春风送暖入屠苏','飞流直下三千尺']),answer:'不及汪伦送我情',hints:['赠汪伦','表达友情','不及汪伦送我情'],explain:'李白《赠汪伦》',topic:'古诗',lv:2},
  {q:'句子末尾表示疑问用什么标点？',type:'choice',options:shuffle(['。','？','！','，']),answer:'？',hints:['问句','疑问号','？'],explain:'问句用问号',topic:'标点符号',lv:2},
  {q:'"风吹树叶"改成被字句？',type:'choice',options:shuffle(['树叶被风吹','风被树叶吹','树叶把风吹','风把树叶吹']),answer:'树叶被风吹',hints:['谁被谁怎么了','树叶被风','树叶被风吹'],explain:'被字句宾语+被+主语+动词',topic:'句子',lv:3},
  {q:'小鸟在枝头唱歌用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','排比']),answer:'拟人',hints:['鸟会唱歌吗','把鸟当人写','拟人'],explain:'把物当人写是拟人',topic:'修辞',lv:3}
);
// --- 英语 ---
QB[2].english.push(
  {q:'"This is _____ apple."填？',type:'choice',options:shuffle(['a','an','the','/']),answer:'an',hints:['apple以a开头','元音前用an','an'],explain:'aeiou开头用an',topic:'冠词',lv:1},
  {q:'数字11英文？',type:'choice',options:shuffle(['ten','eleven','twelve','thirteen']),answer:'eleven',hints:['10=ten 11=?','eleven','eleven'],explain:'eleven=11',topic:'数字',lv:1},
  {q:'pencil是什么？',type:'choice',options:shuffle(['铅笔','钢笔','书包','橡皮']),answer:'铅笔',hints:['p-e-n-c-i-l','写字用','铅笔'],explain:'pencil=铅笔',topic:'文具',lv:1},
  {q:'cake是什么？',type:'choice',options:shuffle(['蛋糕','面包','鸡蛋','米饭']),answer:'蛋糕',hints:['c-a-k-e','甜甜的','蛋糕'],explain:'cake=蛋糕',topic:'食物',lv:2},
  {q:'"I like _____."喜欢苹果填？',type:'choice',options:shuffle(['apples','apple','an apple','the apple']),answer:'apples',hints:['泛指用复数','like+复数','apples'],explain:'like+复数名词',topic:'句型',lv:2},
  {q:'shirt是什么？',type:'choice',options:shuffle(['衬衫','裤子','鞋子','帽子']),answer:'衬衫',hints:['s-h-i-r-t','上身穿的','衬衫'],explain:'shirt=衬衫',topic:'衣物',lv:2},
  {q:'The cat is _____ the box.猫在盒子里面',type:'choice',options:shuffle(['in','on','under','behind']),answer:'in',hints:['在里面','in=在...里','in'],explain:'in=在里面',topic:'方位',lv:3},
  {q:'How many apples? 问什么？',type:'choice',options:shuffle(['多少苹果','什么苹果','哪个苹果','苹果在哪']),answer:'多少苹果',hints:['How many=多少','问数量','多少苹果'],explain:'How many问数量',topic:'疑问句',lv:3}
);
// 补充更多题目
for(let i=0;i<8;i++){const a=rand(10,90),b=rand(10,99-a),s=a+b;QB[2].math.push({q:a+' + '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意进位',a+'+'+b+'='+s],explain:'加法练习',topic:'加减法',lv:1});}
for(let i=0;i<8;i++){const a=rand(30,99),b=rand(10,a-5),s=a-b;QB[2].math.push({q:a+' - '+b+' = ?',type:'input',answer:String(s),hints:['竖式计算','注意退位',a+'-'+b+'='+s],explain:'减法练习',topic:'加减法',lv:1});}
// === 二年级补充题库 ===
// 数学补充
for(let i=0;i<6;i++){const a=rand(2,9),b=rand(2,9),s=a*b;QB[2].math.push({q:a+' × '+b+' = ?',type:'input',answer:String(s),hints:['口诀',Math.min(a,b)+'×'+Math.max(a,b),String(s)],explain:'乘法口诀',topic:'乘法口诀',lv:1});}
for(let i=0;i<6;i++){const a=rand(2,9),b=rand(2,9),s=a*b;QB[2].math.push({q:s+' ÷ '+a+' = ?',type:'input',answer:String(b),hints:[a+'×?='+s,'想口诀',String(b)],explain:'除法',topic:'表内除法',lv:2});}
QB[2].math.push(
  {q:'1时30分=?分',type:'input',answer:'90',hints:['1时=60分','60+30','90分'],explain:'时间换算',topic:'认识时间',lv:2},
  {q:'从8:00到8:45经过了几分钟？',type:'input',answer:'45',hints:['同一小时','45-0','45分钟'],explain:'时间差',topic:'认识时间',lv:2},
  {q:'35厘米+65厘米=?米',type:'input',answer:'1',hints:['35+65=100厘米','100厘米=1米','1米'],explain:'长度换算',topic:'认识长度',lv:2},
  {q:'2米=?厘米',type:'input',answer:'200',hints:['1米=100厘米','2×100','200厘米'],explain:'米转厘米',topic:'认识长度',lv:2},
  {q:'一个角有几条边？',type:'choice',options:shuffle(['1条','2条','3条','4条']),answer:'2条',hints:['角有顶点和边','2条射线','2条'],explain:'角=顶点+2条边',topic:'角的认识',lv:1},
  {q:'比直角大的角叫？',type:'choice',options:shuffle(['锐角','直角','钝角','平角']),answer:'钝角',hints:['大于90度','钝角','钝角'],explain:'锐角<90<钝角<180',topic:'角的认识',lv:2},
  {q:'4567的百位是？',type:'choice',options:shuffle(['4','5','6','7']),answer:'5',hints:['从右数第三位','5在百位','5'],explain:'各位数字',topic:'万以内数',lv:2},
  {q:'30÷7=?...?',type:'choice',options:shuffle(['4...2','4...3','3...9','5...0']),answer:'4...2',hints:['7×4=28','30-28=2','商4余2'],explain:'有余数除法',topic:'有余数除法',lv:3},
  {q:'50÷8=?...?',type:'choice',options:shuffle(['6...2','5...10','7...1','6...3']),answer:'6...2',hints:['8×6=48','50-48=2','商6余2'],explain:'余数<除数',topic:'有余数除法',lv:3},
  {q:'3千克=?克',type:'input',answer:'3000',hints:['1千克=1000克','3×1000','3000克'],explain:'千克转克',topic:'克和千克',lv:3},
  {q:'一袋面粉重5?',type:'choice',options:shuffle(['克','千克','吨','毫克']),answer:'千克',hints:['5克太轻','5千克合适','千克'],explain:'选合适单位',topic:'克和千克',lv:3},
  {q:'小明有15元买了3支笔每支4元还剩几元？',type:'input',answer:'3',hints:['3×4=12','15-12=3','3元'],explain:'先乘后减',topic:'应用题',lv:3},
  {q:'一本书42页每天看6页几天看完？',type:'input',answer:'7',hints:['42÷6','7天','7'],explain:'除法应用',topic:'应用题',lv:3},
  {q:'4+5×3=?',type:'input',answer:'19',hints:['先算乘法','5×3=15','4+15=19'],explain:'先乘除后加减',topic:'混合运算',lv:3},
  {q:'(4+5)×3=?',type:'input',answer:'27',hints:['先算括号','4+5=9','9×3=27'],explain:'先算括号里的',topic:'混合运算',lv:3}
);
// 语文补充
QB[2].chinese.push(
  {q:'"行"在"行走"中读？',type:'choice',options:shuffle(['xíng','háng','hàng','xìng']),answer:'xíng',hints:['行走的行','第二声','xíng'],explain:'行(xíng走/háng行业)',topic:'多音字',lv:1},
  {q:'"好"在"好人"中读？',type:'choice',options:shuffle(['hǎo','hào','háo','hāo']),answer:'hǎo',hints:['好人','第三声','hǎo'],explain:'好(hǎo好的/hào爱好)',topic:'多音字',lv:1},
  {q:'"乐"在"快乐"中读？',type:'choice',options:shuffle(['lè','yuè','là','lā']),answer:'lè',hints:['快乐','开心','lè'],explain:'乐(lè快乐/yuè音乐)',topic:'多音字',lv:1},
  {q:'"美丽"的近义词？',type:'choice',options:shuffle(['漂亮','丑陋','高大','渺小']),answer:'漂亮',hints:['美丽=漂亮','意思相近','漂亮'],explain:'近义词',topic:'近义词',lv:1},
  {q:'"开心"的近义词？',type:'choice',options:shuffle(['高兴','伤心','生气','害怕']),answer:'高兴',hints:['开心=高兴','快乐','高兴'],explain:'近义词',topic:'近义词',lv:1},
  {q:'"安静"的反义词？',type:'choice',options:shuffle(['热闹','美丽','高大','开心']),answer:'热闹',hints:['安静的反面','吵闹','热闹'],explain:'反义词',topic:'反义词',lv:1},
  {q:'"危险"的反义词？',type:'choice',options:shuffle(['安全','困难','容易','美丽']),answer:'安全',hints:['危险的反面','不危险','安全'],explain:'反义词',topic:'反义词',lv:1},
  {q:'一____白云',type:'choice',options:shuffle(['朵','只','条','片']),answer:'朵',hints:['白云用朵','一朵白云','朵'],explain:'云用朵',topic:'量词',lv:1},
  {q:'一____小船',type:'choice',options:shuffle(['只','条','艘','个']),answer:'条',hints:['小船用条','一条小船','条'],explain:'小船用条大船用艘',topic:'量词',lv:1},
  {q:'一____彩虹',type:'choice',options:shuffle(['道','条','根','个']),answer:'道',hints:['彩虹用道','一道彩虹','道'],explain:'彩虹用道',topic:'量词',lv:1},
  {q:'用"渐渐"造句正确的是？',type:'choice',options:shuffle(['天渐渐黑了','渐渐我吃饭了','他渐渐地很高','渐渐花开了突然']),answer:'天渐渐黑了',hints:['渐渐表示慢慢地','天慢慢黑','天渐渐黑了'],explain:'渐渐=慢慢地',topic:'造句',lv:2},
  {q:'下面哪个句子用了问号？',type:'choice',options:shuffle(['你叫什么名字？','今天天气真好！','小鸟在唱歌。','花儿开了，']),answer:'你叫什么名字？',hints:['问句用问号','提问','你叫什么名字？'],explain:'问句用?',topic:'标点符号',lv:2},
  {q:'"危楼高百尺"下一句？',type:'choice',options:shuffle(['手可摘星辰','不敢高声语','恐惊天上人','欲穷千里目']),answer:'手可摘星辰',hints:['李白《夜宿山寺》','楼很高','手可摘星辰'],explain:'李白《夜宿山寺》',topic:'古诗',lv:2},
  {q:'"泉眼无声惜细流"出自？',type:'choice',options:shuffle(['小池','望庐山瀑布','登鹳雀楼','春晓']),answer:'小池',hints:['杨万里','树阴照水爱晴柔','小池'],explain:'杨万里《小池》',topic:'古诗',lv:2},
  {q:'"欲穷千里目"下一句？',type:'choice',options:shuffle(['更上一层楼','黄河入海流','白日依山尽','疑是银河落九天']),answer:'更上一层楼',hints:['登鹳雀楼','想看更远','更上一层楼'],explain:'王之涣《登鹳雀楼》',topic:'古诗',lv:2},
  {q:'"妈妈把衣服洗了"改被字句？',type:'choice',options:shuffle(['衣服被妈妈洗了','妈妈被衣服洗了','衣服把妈妈洗了','洗衣服被妈妈了']),answer:'衣服被妈妈洗了',hints:['谁被谁怎么了','衣服被妈妈','衣服被妈妈洗了'],explain:'被字句',topic:'把被句',lv:3},
  {q:'"小鸟在树上叽叽喳喳地唱歌"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','对偶']),answer:'拟人',hints:['鸟能唱歌吗','当作人来写','拟人'],explain:'拟人赋予物人的行为',topic:'修辞',lv:3},
  {q:'"弯弯的月亮像小船"中把什么比作什么？',type:'choice',options:shuffle(['月亮比作小船','小船比作月亮','月亮比作弯弯','弯弯比作月亮']),answer:'月亮比作小船',hints:['像字后面是喻体','月亮像小船','月亮比作小船'],explain:'比喻本体+像+喻体',topic:'修辞',lv:3},
  {q:'查字典"打"字应查什么部首？',type:'choice',options:shuffle(['扌','丁','大','口']),answer:'扌',hints:['左边是偏旁','提手旁','扌'],explain:'查字典看偏旁部首',topic:'查字典',lv:3},
  {q:'下面哪个句子是完整的？',type:'choice',options:shuffle(['小明认真地写作业。','在操场上。','漂亮的。','高兴地。']),answer:'小明认真地写作业。',hints:['完整句要有主谓宾','谁做什么','小明写作业'],explain:'完整句需主语+谓语',topic:'句子',lv:3}
);
// 英语补充
QB[2].english.push(
  {q:'twelve是数字几？',type:'choice',options:shuffle(['10','11','12','13']),answer:'12',hints:['t-w-e-l-v-e','twelve=12','12'],explain:'twelve=12',topic:'数字',lv:1},
  {q:'fifteen是数字几？',type:'choice',options:shuffle(['14','15','16','17']),answer:'15',hints:['f-i-f-t-e-e-n','fifteen=15','15'],explain:'fifteen=15',topic:'数字',lv:1},
  {q:'twenty是数字几？',type:'choice',options:shuffle(['12','15','18','20']),answer:'20',hints:['t-w-e-n-t-y','twenty=20','20'],explain:'twenty=20',topic:'数字',lv:1},
  {q:'ruler是什么？',type:'choice',options:shuffle(['铅笔','尺子','橡皮','书包']),answer:'尺子',hints:['r-u-l-e-r','量长度','尺子'],explain:'ruler=尺子',topic:'文具',lv:1},
  {q:'eraser是什么？',type:'choice',options:shuffle(['铅笔','尺子','橡皮','书包']),answer:'橡皮',hints:['e-r-a-s-e-r','擦铅笔','橡皮'],explain:'eraser=橡皮',topic:'文具',lv:1},
  {q:'pink是什么颜色？',type:'choice',options:shuffle(['粉色','紫色','棕色','灰色']),answer:'粉色',hints:['p-i-n-k','公主色','粉色'],explain:'pink=粉色',topic:'颜色',lv:1},
  {q:'purple是什么颜色？',type:'choice',options:shuffle(['粉色','紫色','棕色','灰色']),answer:'紫色',hints:['p-u-r-p-l-e','葡萄色','紫色'],explain:'purple=紫色',topic:'颜色',lv:1},
  {q:'bread是什么？',type:'choice',options:shuffle(['面包','蛋糕','饼干','米饭']),answer:'面包',hints:['b-r-e-a-d','早餐吃','面包'],explain:'bread=面包',topic:'食物',lv:2},
  {q:'egg是什么？',type:'choice',options:shuffle(['面包','鸡蛋','牛奶','果汁']),answer:'鸡蛋',hints:['e-g-g','鸡下的','鸡蛋'],explain:'egg=鸡蛋',topic:'食物',lv:2},
  {q:'milk是什么？',type:'choice',options:shuffle(['水','牛奶','果汁','茶']),answer:'牛奶',hints:['m-i-l-k','白色的饮料','牛奶'],explain:'milk=牛奶',topic:'饮料',lv:2},
  {q:'juice是什么？',type:'choice',options:shuffle(['水','牛奶','果汁','茶']),answer:'果汁',hints:['j-u-i-c-e','水果榨的','果汁'],explain:'juice=果汁',topic:'饮料',lv:2},
  {q:'dress是什么？',type:'choice',options:shuffle(['连衣裙','衬衫','裤子','鞋子']),answer:'连衣裙',hints:['d-r-e-s-s','女生穿的','连衣裙'],explain:'dress=连衣裙',topic:'衣物',lv:2},
  {q:'shoes是什么？',type:'choice',options:shuffle(['帽子','衬衫','裤子','鞋子']),answer:'鞋子',hints:['s-h-o-e-s','穿在脚上','鞋子'],explain:'shoes=鞋子',topic:'衣物',lv:2},
  {q:'"That is a pen."意思？',type:'choice',options:shuffle(['这是一支笔','那是一支笔','我有一支笔','笔在那里']),answer:'那是一支笔',hints:['That is=那是','a pen=一支笔','那是一支笔'],explain:'That is=那是',topic:'句型',lv:2},
  {q:'"Is this a cat?" "Yes, _____."',type:'choice',options:shuffle(['it is','it not','this is','is it']),answer:'it is',hints:['Is this回答用it','肯定yes it is','it is'],explain:'Is this...? Yes, it is.',topic:'句型',lv:3},
  {q:'The pen is _____ the box.笔在盒子下面',type:'choice',options:shuffle(['in','on','under','behind']),answer:'under',hints:['在下面','under=在...下','under'],explain:'under=在...下面',topic:'方位',lv:3},
  {q:'"I don\'t like fish."意思？',type:'choice',options:shuffle(['我喜欢鱼','我不喜欢鱼','我有鱼','我吃鱼']),answer:'我不喜欢鱼',hints:["don't like=不喜欢",'否定','我不喜欢鱼'],explain:"don't like=不喜欢",topic:'句型',lv:3},
  {q:'"How many books?" "_____ five."',type:'choice',options:shuffle(['There are','It is','This is','They is']),answer:'There are',hints:['问数量回答There are','books复数','There are'],explain:'How many回答There are',topic:'疑问句',lv:3}
);
// === 二年级补充语文英语各等级至30+ ===
QB[2].chinese.push(
  {q:'"干"在"干活"中读？',type:'choice',options:shuffle(['gàn','gān','gǎn','gàng']),answer:'gàn',hints:['干活','做事','gàn'],explain:'干(gàn做/gān干燥)',topic:'多音字',lv:1},
  {q:'"明亮"的近义词？',type:'choice',options:shuffle(['光明','黑暗','模糊','昏暗']),answer:'光明',hints:['明亮=光明','意思相近','光明'],explain:'近义词',topic:'近义词',lv:1},
  {q:'"勇敢"的近义词？',type:'choice',options:shuffle(['胆大','害怕','胆小','懦弱']),answer:'胆大',hints:['勇敢=胆大','不怕','胆大'],explain:'近义词',topic:'近义词',lv:1},
  {q:'"粗心"的反义词？',type:'choice',options:shuffle(['细心','开心','伤心','小心']),answer:'细心',hints:['粗心↔细心','认真','细心'],explain:'反义词',topic:'反义词',lv:1},
  {q:'"简单"的反义词？',type:'choice',options:shuffle(['复杂','容易','困难','麻烦']),answer:'复杂',hints:['简单↔复杂','不简单','复杂'],explain:'反义词',topic:'反义词',lv:1},
  {q:'一____眼睛',type:'choice',options:shuffle(['双','只','对','个']),answer:'双',hints:['眼睛成对','一双','双'],explain:'成对的用双',topic:'量词',lv:1},
  {q:'一____毛笔',type:'choice',options:shuffle(['支','只','条','棵']),answer:'支',hints:['笔用支','一支笔','支'],explain:'笔用支',topic:'量词',lv:1},
  {q:'一____衣服',type:'choice',options:shuffle(['件','只','条','棵']),answer:'件',hints:['衣服用件','一件','件'],explain:'衣服用件',topic:'量词',lv:1},
  {q:'"都"在"首都"中读？',type:'choice',options:shuffle(['dū','dōu','dǔ','dù']),answer:'dū',hints:['首都的都','dū','dū'],explain:'都(dū首都/dōu都是)',topic:'多音字',lv:1},
  {q:'"地"在"土地"中读？',type:'choice',options:shuffle(['dì','de','dí','dǐ']),answer:'dì',hints:['土地','名词','dì'],explain:'地(dì土地/de认真地)',topic:'多音字',lv:1},
  {q:'用"一边...一边..."造句正确的是？',type:'choice',options:shuffle(['他一边走路一边唱歌','一边他走路唱歌一边','一边一边走路唱歌','走路唱歌一边一边']),answer:'他一边走路一边唱歌',hints:['同时做两件事','一边A一边B','他一边走路一边唱歌'],explain:'一边...一边...同时做两件事',topic:'造句',lv:2},
  {q:'用"非常"造句正确的是？',type:'choice',options:shuffle(['今天非常开心','非常今天开心','开心非常今天','今天开心非常']),answer:'今天非常开心',hints:['非常=很','修饰形容词','今天非常开心'],explain:'非常+形容词',topic:'造句',lv:2},
  {q:'表示高兴用什么标点？',type:'choice',options:shuffle(['。','！','？','，']),answer:'！',hints:['感叹号','表达强烈感情','！'],explain:'感叹句用！',topic:'标点符号',lv:2},
  {q:'"让我们一起去春游把"哪个字错了？',type:'choice',options:shuffle(['把→吧','春→村','游→有','一→衣']),answer:'把→吧',hints:['语气词','应该是吧','把→吧'],explain:'吧是语气词',topic:'改错字',lv:2},
  {q:'"同学门在操场上玩"哪个字错了？',type:'choice',options:shuffle(['门→们','操→草','玩→完','同→通']),answer:'门→们',hints:['同学们','人字旁','门→们'],explain:'们是人字旁',topic:'改错字',lv:2},
  {q:'"小花把玻璃打碎了"改被字句？',type:'choice',options:shuffle(['玻璃被小花打碎了','小花被玻璃打碎了','玻璃把小花打碎了','打碎了被小花玻璃']),answer:'玻璃被小花打碎了',hints:['谁被谁怎么了','玻璃被小花','玻璃被小花打碎了'],explain:'被字句',topic:'把被句',lv:3},
  {q:'"老师把作业批改了"改被字句？',type:'choice',options:shuffle(['作业被老师批改了','老师被作业批改了','作业把老师批改了','批改了被作业老师']),answer:'作业被老师批改了',hints:['谁被谁怎么了','作业被老师','作业被老师批改了'],explain:'被字句',topic:'把被句',lv:3},
  {q:'"月亮弯弯的像什么？"像什么最合适？',type:'choice',options:shuffle(['像小船','像太阳','像皮球','像大饼']),answer:'像小船',hints:['弯弯的形状','小船也是弯的','像小船'],explain:'抓住形状特征比喻',topic:'修辞',lv:3},
  {q:'下面哪个是拟人句？',type:'choice',options:shuffle(['春风轻轻地抚摸大地','他跑得很快','太阳真大','花很红']),answer:'春风轻轻地抚摸大地',hints:['抚摸是人的动作','春风当作人','拟人'],explain:'赋予物人的动作=拟人',topic:'修辞',lv:3}
);
QB[2].english.push(
  {q:'bag是什么？',type:'choice',options:shuffle(['书包','书','笔','本子']),answer:'书包',hints:['b-a-g','装东西','书包'],explain:'bag=书包',topic:'文具',lv:1},
  {q:'book是什么？',type:'choice',options:shuffle(['书包','书','笔','本子']),answer:'书',hints:['b-o-o-k','读的','书'],explain:'book=书',topic:'文具',lv:1},
  {q:'brown是什么颜色？',type:'choice',options:shuffle(['棕色','粉色','紫色','灰色']),answer:'棕色',hints:['b-r-o-w-n','巧克力色','棕色'],explain:'brown=棕色',topic:'颜色',lv:1},
  {q:'thirteen是数字？',type:'choice',options:shuffle(['11','12','13','14']),answer:'13',hints:['thirteen','13','13'],explain:'thirteen=13',topic:'数字',lv:1},
  {q:'sixteen是数字？',type:'choice',options:shuffle(['15','16','17','18']),answer:'16',hints:['sixteen','16','16'],explain:'sixteen=16',topic:'数字',lv:1},
  {q:'rice是什么？',type:'choice',options:shuffle(['米饭','面包','面条','蛋糕']),answer:'米饭',hints:['r-i-c-e','白白的','米饭'],explain:'rice=米饭',topic:'食物',lv:2},
  {q:'noodles是什么？',type:'choice',options:shuffle(['米饭','面包','面条','蛋糕']),answer:'面条',hints:['n-o-o-d-l-e-s','长长的','面条'],explain:'noodles=面条',topic:'食物',lv:2},
  {q:'chicken是什么？',type:'choice',options:shuffle(['鸡肉','牛肉','猪肉','鱼肉']),answer:'鸡肉',hints:['c-h-i-c-k-e-n','鸡','鸡肉'],explain:'chicken=鸡肉',topic:'食物',lv:2},
  {q:'tea是什么？',type:'choice',options:shuffle(['水','牛奶','茶','果汁']),answer:'茶',hints:['t-e-a','热的饮品','茶'],explain:'tea=茶',topic:'饮料',lv:2},
  {q:'coat是什么？',type:'choice',options:shuffle(['外套','衬衫','裤子','裙子']),answer:'外套',hints:['c-o-a-t','冬天穿','外套'],explain:'coat=外套',topic:'衣物',lv:2},
  {q:'hat是什么？',type:'choice',options:shuffle(['帽子','手套','围巾','袜子']),answer:'帽子',hints:['h-a-t','戴头上','帽子'],explain:'hat=帽子',topic:'衣物',lv:2},
  {q:'The cat is _____ the table.猫在桌子后面',type:'choice',options:shuffle(['in','on','under','behind']),answer:'behind',hints:['后面=behind','behind the table','behind'],explain:'behind=在后面',topic:'方位',lv:3},
  {q:'"Is that a dog?" "No, it _____."',type:'choice',options:shuffle(["isn't","is","am","not"]),answer:"isn't",hints:['No否定','is not=isnt',"isn't"],explain:'否定回答No it isnt',topic:'句型',lv:3},
  {q:'"I like _____ cats."我不喜欢猫',type:'choice',options:shuffle(["don't","not","no","doesn't"]),answer:"don't",hints:['不喜欢','I dont like',"don't"],explain:'I dont like=我不喜欢',topic:'句型',lv:3},
  {q:'"How many pens do you have?" "I have _____."我有3支',type:'choice',options:shuffle(['three','third','tree','there']),answer:'three',hints:['3=three','数量','three'],explain:'回答数量用基数词',topic:'疑问句',lv:3}
);
// === 补充lv2/lv3 ===
for(let i=0;i<8;i++){const a=rand(2,9),b=rand(2,9),s=a*b;QB[2].math.push({q:s+' ÷ '+b+' = ?',type:'input',answer:String(a),hints:[b+'×?='+s,'想口诀',String(a)],explain:'除法',topic:'表内除法',lv:2});}
QB[2].math.push(
  {q:'38÷7=?...?',type:'choice',options:shuffle(['5...3','5...2','4...10','6...1']),answer:'5...3',hints:['7×5=35','38-35=3','商5余3'],explain:'有余数除法',topic:'有余数除法',lv:3},
  {q:'43÷6=?...?',type:'choice',options:shuffle(['7...1','6...7','8...0','7...2']),answer:'7...1',hints:['6×7=42','43-42=1','商7余1'],explain:'余数<除数',topic:'有余数除法',lv:3},
  {q:'8×5+12=?',type:'input',answer:'52',hints:['先乘后加','8×5=40','40+12=52'],explain:'先乘除后加减',topic:'混合运算',lv:3},
  {q:'100-36÷4=?',type:'input',answer:'91',hints:['先除后减','36÷4=9','100-9=91'],explain:'先乘除后加减',topic:'混合运算',lv:3},
  {q:'(25+15)×2=?',type:'input',answer:'80',hints:['先算括号','25+15=40','40×2=80'],explain:'先算括号',topic:'混合运算',lv:3},
  {q:'5000克=?千克',type:'input',answer:'5',hints:['1000克=1千克','5000÷1000','5千克'],explain:'克转千克',topic:'克和千克',lv:3},
  {q:'一个西瓜约重3?',type:'choice',options:shuffle(['克','千克','吨','毫克']),answer:'千克',hints:['3克太轻','3千克合适','千克'],explain:'选合适单位',topic:'克和千克',lv:3},
  {q:'7×8-20=?',type:'input',answer:'36',hints:['先乘','7×8=56','56-20=36'],explain:'先乘后减',topic:'混合运算',lv:3}
);
QB[2].chinese.push(
  {q:'用"可爱"造句正确的是？',type:'choice',options:shuffle(['小猫真可爱','可爱小猫真','真可爱小猫了','小猫可爱真的']),answer:'小猫真可爱',hints:['主语+形容词','小猫真可爱','小猫真可爱'],explain:'造句',topic:'造句',lv:2},
  {q:'"接天莲叶无穷碧"下一句？',type:'choice',options:shuffle(['映日荷花别样红','小荷才露尖尖角','泉眼无声惜细流','树阴照水爱晴柔']),answer:'映日荷花别样红',hints:['杨万里','晓出净慈寺','映日荷花别样红'],explain:'杨万里《晓出净慈寺送林子方》',topic:'古诗',lv:2},
  {q:'"小荷才露尖尖角"下一句？',type:'choice',options:shuffle(['早有蜻蜓立上头','映日荷花别样红','泉眼无声惜细流','接天莲叶无穷碧']),answer:'早有蜻蜓立上头',hints:['杨万里小池','蜻蜓','早有蜻蜓立上头'],explain:'杨万里《小池》',topic:'古诗',lv:2},
  {q:'"值日"的"值"查什么部首？',type:'choice',options:shuffle(['亻','直','十','目']),answer:'亻',hints:['左边是偏旁','单人旁','亻'],explain:'查字典看偏旁',topic:'查字典',lv:3},
  {q:'"花朵在阳光下笑了"用了什么修辞？',type:'choice',options:shuffle(['比喻','拟人','夸张','对比']),answer:'拟人',hints:['花能笑吗','当作人','拟人'],explain:'拟人',topic:'修辞',lv:3}
);
QB[2].english.push(
  {q:'water是什么？',type:'choice',options:shuffle(['水','牛奶','果汁','茶']),answer:'水',hints:['w-a-t-e-r','透明的','水'],explain:'water=水',topic:'饮料',lv:1},
  {q:'fourteen是数字？',type:'choice',options:shuffle(['13','14','15','16']),answer:'14',hints:['fourteen','14','14'],explain:'fourteen=14',topic:'数字',lv:1},
  {q:'eighteen是数字？',type:'choice',options:shuffle(['16','17','18','19']),answer:'18',hints:['eighteen','18','18'],explain:'eighteen=18',topic:'数字',lv:1},
  {q:'hamburger是什么？',type:'choice',options:shuffle(['汉堡','热狗','三明治','披萨']),answer:'汉堡',hints:['h-a-m-b-u-r-g-e-r','快餐','汉堡'],explain:'hamburger=汉堡',topic:'食物',lv:2},
  {q:'trousers是什么？',type:'choice',options:shuffle(['裤子','衬衫','外套','裙子']),answer:'裤子',hints:['t-r-o-u-s-e-r-s','穿腿上','裤子'],explain:'trousers=裤子',topic:'衣物',lv:2},
  {q:'The dog is _____ the house.狗在房子旁边',type:'choice',options:shuffle(['in','on','next to','under']),answer:'next to',hints:['旁边','next to=在旁边','next to'],explain:'next to=在旁边',topic:'方位',lv:3},
  {q:'"Do you like ice cream?" "Yes, I _____."',type:'choice',options:shuffle(['do','does','am','is']),answer:'do',hints:['Do提问Do回答','I do','do'],explain:'Do you...? Yes I do.',topic:'句型',lv:3}
);
