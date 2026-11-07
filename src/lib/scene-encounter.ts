import { getChoices, getNode, type BranchState } from './branch-story';

export type EncounterPoint = { id: string; label: string; speaker: string; response: string; choiceId: string };
export type EncounterItem = { id: string; label: string; note?: string; image?: string };
export type EncounterActivity = {
  kind: 'pack' | 'share' | 'compare' | 'route' | 'reply' | 'remember';
  title: string; instruction: string; items: EncounterItem[];
  required?: number; capacity?: number; solution?: string[]; choiceId: string;
  response: string; correction?: string;
};
export type SceneEncounterData = { title: string; goal: string; points: EncounterPoint[]; activity?: EncounterActivity };
type PointSpec = [label: string, speaker: string, response: string, choiceId: string];
type SceneSpec = { goal: string; points: PointSpec[] };

const SCENES: Record<string, SceneSpec> = {
  n01: { goal: '收好摊上的旧物，陪父亲离开集市。', points: [
    ['摊上的旧物', '父亲', '先收纽扣和布。今天挣不到的钱，回家再想。', 'work'],
    ['熟客的方向', '努拉', '他看见了。敢不敢留下见证，要由他决定。', 'neighbor'],
    ['护住故事册', '努拉', '我记得那个人的名字。至少别让这一页也丢了。', 'mother'],
  ] },
  n02: { goal: '父亲被当着全家带走了。先把彼此的去向说清。', points: [
    ['父亲留下的外衣', '努拉', '他被抓去了拘留院。我们知道发生了什么。', 'cut'],
    ['姐姐手里的纸', '玛莉安', '写下回家的约定。我在这里等你们。', 'sew'],
  ] },
  n03: { goal: '母亲受到殴打。先找能带她离开的方向。', points: [
    ['退回家的路', '母亲', '扶着我。今天先回去。', 'buy'],
    ['开了一线的门', '门内的声音', '快进来。别站在街上。', 'share'],
    ['掉在地上的纸', '努拉', '纸上是父亲的名字。打人的脸，我也记住了。', 'carry'],
  ] },
  n04: { goal: '钱还在手里，摊主却不肯卖。你能去哪里？', points: [
    ['回家的小巷', '努拉', '姐姐让我拿不到也回来。空手不是我的错。', 'day'],
    ['面包房后门', '哈米德', '别站在外面。等脚步声过去。', 'learn'],
  ] },
  n05: { goal: '萨米把玩具攥得很紧。你想先怎样陪他？', points: [
    ['弟弟的空碗', '萨米', '有钱，为什么没有饼？', 'flour'],
    ['他的布玩具', '努拉', '刚才我不该冲你发火。那不是你的错。', 'names'],
  ] },
  n06: { goal: '借亡兄的衣服，剪去发辫，准备出门。', points: [
    ['姐姐伸来的手', '玛莉安', '我会慢一点。你想停，就告诉我。', 'buy'],
    ['自己的发辫', '努拉', '先剪一小束。最后这一下，我想自己来。', 'help'],
  ] },
  n07: { goal: '莱拉也藏着一个女孩的名字。一起选今天的活。', points: [
    ['市场的货担', '莱拉', '一起核对工钱，别忘了回家的时辰。', 'truth'],
    ['作坊的后窗', '莱拉', '我认识一处修补活。慢一点，但能坐下来。', 'hide'],
    ['带回家的饼', '努拉', '先把这点食物带回去，再请邻居帮着想。', 'pact'],
  ] },
  n08: { goal: '街口新拦了绳。你要从哪里走？', points: [
    ['检查的长队', '努拉', '小帽不是护身符。排队也可能挨打。', 'queue'],
    ['作坊小巷', '努拉', '绕路会晚到。我得守住报平安的约定。', 'alley'],
    ['送水人的脚步', '送水人', '我可以传话。可我不能代替你的亲属。', 'neighbor'],
  ] },
  n09: { goal: '阿明把一封信递来。先听清里面失去了谁。', points: [
    ['信上的消息', '努拉', '信里是他失去的亲人。不是交换父亲的价钱。', 'courier'],
    ['拘留院的方向', '努拉', '我仍想核实父亲的去向，也可能被盘问。', 'verify'],
    ['折好的信', '努拉', '带回去和姐姐一起看，不再只由我猜。', 'sister'],
  ] },
  n10: { goal: '一笔工钱被扣了。先问女工是否愿意让你帮忙。', points: [
    ['自己的活计', '努拉', '我也得把今天的工钱带回家。', 'wage'],
    ['帘后的账目', '女工', '可以替我核一遍。要把名字交出去，先问我。', 'ledger'],
  ] },
  n11: { goal: '门关上以后，院子里的人才能商量自己的事。', points: [
    ['愿意开口的人', '努拉', '只记自愿留下的证词，不替任何人署名。', 'testimony'],
    ['姐姐的碎纸', '玛莉安', '我想再教一小时。你愿意帮我吗？', 'school'],
    ['分好的药包', '努拉', '只接约好的短途差事，不让她们到街上等。', 'medicine'],
  ] },
  n12: { goal: '门房要钱，却不许见人。下一步要留下什么？', points: [
    ['写着姓名的纸', '努拉', '请阿明回来时看一眼，不把收纸当成答应。', 'petition'],
    ['陌生人的手', '努拉', '交钱也没有保证。我先去查文书。', 'forms'],
    ['快关上的门', '努拉', '再等下去，会错过今天的活和买饭。', 'wait'],
  ] },
  n13: { goal: '她想知道你瞒下了什么，也想说完自己的计划。', points: [
    ['摊开的信', '玛莉安', '你说完以后，也让我把自己的计划说完。', 'listen'],
    ['藏纸的床垫', '努拉', '我还没准备好开口。独自行动会让她更远。', 'secret'],
    ['隔壁的水碗', '努拉', '今晚先一起照顾母亲。不能总把照护留给她。', 'care'],
  ] },
  n14: { goal: '只够开一小时。怎样保住书，也保住孩子？', points: [
    ['愿意留下的孩子', '玛莉安', '有人害怕，就让他回去。留下的可以听故事。', 'teach'],
    ['父亲的原书', '努拉', '留下抄本，把他的笔迹藏好。', 'hide'],
    ['通向家的后门', '努拉', '先送孩子回家，再去办家人的离城材料。', 'leave'],
  ] },
  n15: { goal: '医师拉上门帘。药费和照护，需要一起安排。', points: [
    ['母亲的药单', '萨米拉', '治疗以后仍要休息，不是付过钱就好了。', 'treat'],
    ['待分的药包', '努拉', '按医师安排做事，换取基础诊费。', 'share'],
  ] },
  n16: { goal: '纸能留下去向，不能让危险自动消失。', points: [
    ['可核对的签字', '努拉', '要有人能认领这份登记，也要付得起费用。', 'register'],
    ['送信人的地址', '努拉', '先问清谁肯开门，拒绝没有凭据的带路。', 'route'],
    ['快办的许诺', '努拉', '凭条很快，却没有能追问的人。', 'risk'],
  ] },
  n17: { goal: '时间很短。哪些信息该留下，哪些身份该保护？', points: [
    ['父亲的名字', '阿明', '他还在名册上。我的岗位可能很快就变。', 'family'],
    ['纸的背面', '努拉', '记下去向，隐去传话人的身份。', 'copy'],
  ] },
  n18: { goal: '母亲的婚事信放在灯下。先听姐姐怎样回答。', points: [
    ['灯下的婚事信', '母亲', '我盼远亲照应全家，可玛莉安没有答应。', 'find'],
    ['能带走的东西', '努拉', '我们只有这些。先一起订能兑现的计划。', 'plan'],
    ['越来越急的广播', '努拉', '抢在封街前走，也可能让家人陷入危险。', 'rush'],
  ] },
  n19: { goal: '谁去传话，谁留下等？把地点先说清。', points: [
    ['北门的约定', '努拉', '我去递消息。母亲和萨米留在私宅。', 'rescue'],
    ['城南的方向', '努拉', '我去问接应，不代表远亲会等我回来。', 'caravan'],
    ['院里的油灯', '玛莉安', '也可以先留在这里，把今天安排下去。', 'stay'],
  ] },
  n20: { goal: '铁门只留一条缝。你与莱拉都在长队之外。', points: [
    ['写过的几个字', '努拉', '他认得这些字。愿不愿冒险，仍由他决定。', 'submit'],
    ['向前挤的人群', '莱拉', '越挤越难退回来。先看住彼此。', 'press'],
    ['送信人的位置', '努拉', '请他继续问。今天也可能来不及。', 'wait'],
  ] },
  n21: { goal: '镜头留在母亲这边。她不愿丢下任何一个女儿。', points: [
    ['法里达家的方向', '母亲', '先离开这辆车，再找我自己的亲弟。', 'register'],
    ['姐姐攥紧的手', '玛莉安', '这桩婚事，我没有答应。', 'child'],
    ['回去的路', '母亲', '我还有一个女儿没回来。我要回去。', 'search'],
  ] },
  n22: { goal: '母亲已拒绝婚事。关门以后的日子，仍要谋生。', points: [
    ['小课堂的桌面', '玛莉安', '教书、补衣和照看孩子，要轮流来。', 'school'],
    ['留给父亲的位置', '努拉', '先保住家人的日常，再继续找消息。', 'father'],
    ['两处借住的地址', '努拉', '分住要有联络。不能让她们到街上等车。', 'send'],
  ] },
  n23: { goal: '找到了姐姐。她有权说出接下来怎样走。', points: [
    ['已答应的后门', '玛莉安', '先确认今晚能住下，再谈求医和迁移。', 'repair'],
    ['交给她的证据', '努拉', '让她自己核实，自己决定要不要再去北门。', 'ask'],
    ['彼此的地址', '玛莉安', '分住也可以。把地址写清楚。', 'apart'],
  ] },
  n24: { goal: '姐姐扭伤了脚踝。让照护跟得上下一步。', points: [
    ['医师的药箱', '萨米拉', '先看伤势。包扎过，也还不能好好走路。', 'treat'],
    ['借来的推车', '努拉', '先确认私宅后门有人接，再慢慢送她过去。', 'carry'],
    ['遮挡的门帘', '玛莉安', '让我缓一会儿。晚上仍要有人接应。', 'stay'],
  ] },
  n25: { goal: '避开路口的枪声，看清阿明给你的信号。', points: [
    ['阿明指的侧门', '阿明', '我试着带他出来。你先离开敞开的路口。', 'release'],
    ['能找到你的地址', '努拉', '若今天见不到，至少别再让名字失联。', 'letter'],
    ['保留下来的证据', '努拉', '先让家人安顿下来，带走能够核实的东西。', 'leave'],
  ] },
  n26: { goal: '母亲回到了私院。谁来接，必须认清。', points: [
    ['约好的亲舅舅', '母亲', '要等优素福本人。司机不能代替他。', 'board'],
    ['邻居留出的房间', '法里达', '今晚可以留下。明天还得再商量。', 'shelter'],
    ['写给送信人的纸', '努拉', '让家人住在门里，我继续递信。', 'seat'],
  ] },
  n27: { goal: '值日表很小。先把一天里真正能做的事排好。', points: [
    ['今天的口粮', '努拉', '人手和食物够，课堂才能留到明天。', 'sustain'],
    ['学生和家属的记录', '玛莉安', '暂缓课堂，也别弄丢他们的名字。', 'archive'],
    ['准备收起的故事册', '努拉', '离开这次课堂，也要保存书和约定。', 'send'],
  ] },
  n28: { goal: '还没有回信。先给等待安排一个能生活的今天。', points: [
    ['长期联络的地址', '努拉', '这里要有饭、有药，也要有人能找到我们。', 'address'],
    ['送信人的布袋', '努拉', '把记录传出去，不能保证立刻有回音。', 'post'],
    ['摆在门边的旧鞋', '努拉', '想离开等待的地方，也要把分别说清楚。', 'depart'],
  ] },
  n29: { goal: '院门已经关好。相聚或分别，都由你们商量。', points: [
    ['同一处屋檐', '努拉', '放下这次远行机会，先保住眼前的照护。', 'together'],
    ['两份报平安的纸', '玛莉安', '地址写清楚，不能把分开写成谁被丢下。', 'apart'],
    ['征得同意的记录', '努拉', '先让这部分故事走出去，再一起决定去向。', 'evidence'],
  ] },
  n30: { goal: '这句话里，已经有了你走过的路。', points: [
    ['今天的生活', '努拉', '先兑现已经说出的约定，让今天接住明天。', 'live'],
    ['写给外面的信', '努拉', '把能够核实的经历写下，让消息继续走。', 'pages'],
    ['还留着的位置', '努拉', '等待不是胜利。我仍想给它安排一顿饭。', 'wait'],
  ] },
};

const ACTIVITIES: Partial<Record<string, EncounterActivity>> = {
  n01: { kind: 'pack', title: '收好摊上的旧物', instruction: '收起纽扣和布料，就和父亲离开集市。', required: 2, choiceId: 'work', items: [
    { id: 'buttons', label: '拢起纽扣', note: '别让它们滚进尘土。' }, { id: 'cloth', label: '折好布料', image: '/art/sister/bag.png' },
  ], response: '你们拢好布包，离开摊位。' },
  n05: { kind: 'share', title: '把自己的一份递过去', instruction: '这顿饭不够。把你的那份放到谁面前？', required: 1, choiceId: 'flour', items: [
    { id: 'sami', label: '放到萨米面前', note: '你少吃一点，仍需为明天找饭。' },
  ], response: '萨米接过去。姐姐看着你，留出商量明天的位置。' },
  n06: { kind: 'pack', title: '请姐姐剪发，换上亡兄衣服', instruction: '铺好长衫和宽裤，姐姐便为你剪下发辫。', required: 2, choiceId: 'buy', items: [
    { id: 'tunic', label: '灰白长衫', note: '亡兄阿里留下的。' }, { id: 'trousers', label: '收紧宽裤', note: '裤脚要折起来。' },
  ], response: '衣服铺好了。姐姐剪下发辫，替你收好。' },
  n08: { kind: 'route', title: '从哪条路离开街口', instruction: '点选路线，就沿那条路前行。', required: 1, choiceId: 'alley', items: [
    { id: 'queue', label: '街口长队', note: '较近 · 需要接受盘查' }, { id: 'alley', label: '作坊小巷', note: '绕远 · 会错过约定时辰' }, { id: 'neighbor', label: '退回私院', note: '暂缓工作 · 托人报平安' },
  ], response: '绕行会晚到，但你记得该在哪里报平安。' },
  n09: { kind: 'remember', title: '把信里的意思读完整', instruction: '读出亲人的死讯，留出沉默的时间，陪阿明认字。', required: 2, choiceId: 'courier', items: [
    { id: 'loss', label: '亲人死于战火', image: '/art/sister/letter.png' }, { id: 'pause', label: '给他沉默的时间', note: '不把悲伤换成放人承诺。' },
  ], response: '阿明把信折好。他可以学着写字，也可以听你说父亲。' },
  n10: { kind: 'compare', title: '替她核清这笔账', instruction: '点“核对”就征求女工同意并为她核账；算错可重试。', required: 1, solution: ['eight'], choiceId: 'ledger', items: [
    { id: 'six', label: '应付 6 枚' }, { id: 'eight', label: '应付 8 枚' },
  ], correction: '4 × 2 = 8。少付了 2 枚；留下账目之前，还要征得她同意。', response: '少付了 2 枚。她同意你帮着核账，是否交出名字仍由她决定。' },
  n13: { kind: 'reply', title: '回答姐姐', instruction: '点一句回应，把话说给姐姐。', required: 1, choiceId: 'listen', items: [
    { id: 'listen', label: '你的计划，我想听完。' }, { id: 'care', label: '今晚我来照顾母亲。' }, { id: 'secret', label: '我现在还说不清。' },
  ], response: '姐姐把信摊在两人之间：“那我们一起看。”' },
  n16: { kind: 'compare', title: '看清纸上能追问什么', instruction: '找到可追问负责人的那份纸，办理文书。', required: 1, solution: ['registered'], choiceId: 'register', items: [
    { id: 'quick', label: '一句“马上办好”', note: '没有登记姓名。' }, { id: 'registered', label: '姓名、见证人与去向', note: '仍需要费用与核实。' },
  ], correction: '只有许诺，日后找不到负责的人。也可以先向送信人问路线。', response: '这份纸能留下可追问的去向，仍要付费，也不保证通过检查。' },
  n17: { kind: 'remember', title: '把联络信息记住', instruction: '记住北门与见面时间，抄下去向，隐去传话人身份。', required: 2, choiceId: 'copy', items: [
    { id: 'gate', label: '北门', image: '/art/sister/letter.png' }, { id: 'time', label: '明天下午', note: '岗位随时可能调动。' },
  ], response: '去向记住了。抄其他姓名前，仍要想清携带名单的风险。' },
  n18: { kind: 'pack', title: '手边只能先顾两件事', instruction: '排好两项准备，就和姐姐订下计划。', required: 2, capacity: 2, choiceId: 'plan', items: [
    { id: 'care', label: '照护和休息' }, { id: 'contact', label: '联络的地址' }, { id: 'food', label: '今天的食物' },
  ], response: '先后次序写下了。计划要让姐姐也能修改，不是替她答应婚事。' },
  n27: { kind: 'pack', title: '给今天排一张轮值表', instruction: '排上两项能承担的事，就按这张表开始轮值。', required: 2, capacity: 2, choiceId: 'sustain', items: [
    { id: 'teaching', label: '在门内教书', image: '/art/sister/book.png' }, { id: 'care', label: '照看幼弟', note: '让照护也有人轮换。' }, { id: 'work', label: '补衣、托人采买', image: '/art/sister/bag.png' },
  ], response: '轮值表还很小。食物和家人的身体决定它能否持续。' },
};

const SHORT_SCENES: Partial<Record<string, SceneSpec>> = {
  n01: { ...SCENES.n01, goal: '年轻巡查指着女孩赶摊。先帮父亲收好旧物。' },
  n06: { ...SCENES.n06, goal: '母亲寻父挨打，你买饼受拒。借亡兄衣服，准备剪发。' },
  n07: { ...SCENES.n07, goal: '街上，你叫阿提什——火焰。莱拉也藏着真名，一起谋生。' },
  n18: { goal: '母亲想以婚事换庇护，姐姐拒绝了。封街前，往哪边走？', points: [
    ['北门的联络', '努拉', '去找阿明。母亲和孩子先留在私院等消息。', 'plan'],
    ['舅舅的接应', '母亲', '先核实优素福本人、文书和落脚的门。', 'find'],
    ['院里的轮值表', '玛莉安', '一起教书、谋生，也把照护轮换起来。', 'rush'],
  ] },
  n21: { goal: '贾维德逼婚，催家人上车。母亲拒绝丢下努拉，坚持返回。', points: [
    ['等亲舅舅本人', '母亲', '要认出优素福本人，核对文书和路费再上车。', 'register'],
    ['今夜借住的门', '母亲', '婚事我不答应。今夜先带全家借住。', 'child'],
    ['回去找努拉的路', '母亲', '努拉还没回来。我不跟他走，我回去找她。', 'search'],
  ] },
  n22: { goal: '把照护、课堂和父亲的消息安排下去。', points: [
    ['有限的轮值表', '玛莉安', '按现有食物和人手开课，家人的身体也得顾着。', 'school'],
    ['给父亲留的地址', '努拉', '让这里有饭有药，也有人能递消息。', 'father'],
    ['分住的两处地址', '玛莉安', '你去作坊，我和母亲、萨米留私宅，按约报平安。', 'send'],
  ] },
};

const SHORT_ROUTE: EncounterActivity = {
  kind: 'route', title: '封街前，往哪边走', instruction: '点一条路，就去做那件事。', required: 1, choiceId: 'plan', items: [
    { id: 'plan', label: '北门', note: '寻找父亲 · 仍有风险' },
    { id: 'find', label: '亲舅舅', note: '核对本人 · 安排接应' },
    { id: 'rush', label: '私院', note: '轮值谋生 · 安顿生活' },
  ], response: '你选的路，已经写进今天的约定。',
};

export function getSceneEncounter(state: BranchState): SceneEncounterData {
  const node = getNode(state);
  const short = 'edition' in state && state.edition === 'short';
  const spec = (short && SHORT_SCENES[state.nodeId]) || SCENES[state.nodeId] || { goal: '点选身边的人与物，走出今天的一步。', points: [] };
  let goal = spec.goal;
  if (short && state.nodeId === 'n30') goal = state.father === 'free'
    ? '阿明救出了父亲，母亲拒绝带离后归来。为今天写下结尾。'
    : state.sister === 'apart' ? '姐妹已说好分住和回信的地址。父亲未归，下一页怎样写？'
    : state.flags.includes('boarded') ? '亲舅舅已接齐家人，父亲还在等待的方向。写下下一页。'
    : state.flags.includes('sustained') ? '轮值表留住一小时课堂。父亲未归，先为今天写下结尾。'
    : state.flags.includes('settled') ? '你们有了一夜借住的屋檐，父亲仍未回来。写下下一页。'
    : '母亲拒绝了婚事，家人已会合，父亲未归。写下下一页。';
  let points = spec.points.map(([label, speaker, response, choiceId], i) => ({ id: `${state.nodeId}-${i}`, label, speaker, response, choiceId }));
  const previous = state.history.at(-1);
  if (short && state.nodeId === 'n07') points = points.map(point => point.choiceId === 'truth' ? { ...point, response: '一起核对工钱，也留心退路。少年也会被逼去替队伍搬军需。' } : point.choiceId === 'pact' ? { ...point, response: '把饼和今天的遭遇带回去，也听姐姐怎样想。' } : point);
  if (state.nodeId === 'n05' && previous?.nodeId === 'n04' && previous.choiceId === 'learn') {
    points = points.map(point => point.choiceId === 'flour' ? { ...point, label: '弟弟面前的碗', response: '你带饼回来了？我可以吃一口吗？' } : point);
  }
  if (state.nodeId === 'n30' && state.father === 'free') points = points.filter(point => point.choiceId !== 'wait');
  if (state.nodeId === 'n18' && state.sister === 'apart') {
    goal = short ? '母亲曾提婚事，姐姐托话拒绝。你们分住两处，先说清去向。' : '母亲与姐姐托来了话。先看清信里写了什么。';
    points = points.map(point => point.speaker === '母亲' ? { ...point, label: short ? '母亲托来的接应消息' : '母亲捎来的婚事信', speaker: '母亲托来的话' }
      : point.speaker === '玛莉安' ? { ...point, speaker: '姐姐托来的话' } : point);
  }
  if (state.nodeId === 'n25' && !state.flags.includes('guardBond')) {
    goal = '避开路口的枪声，先把信里的名字读清。';
    points = points.map(point => point.choiceId === 'release' ? { ...point, label: '阿明手里的信', response: '先替我读信，教我认名字。救人的事，我还没答应。' } : point);
  }
  if (short && state.nodeId === 'n25') points = points.map(point => point.choiceId === 'leave' ? { ...point, label: '今夜能借住的门', response: '先确认私宅夜宿，带着能核实的证据离开。' } : point);
  let activity = ACTIVITIES[state.nodeId];
  if (short && state.nodeId === 'n09') activity = undefined;
  if (short && state.nodeId === 'n18') activity = SHORT_ROUTE;
  if (short && state.nodeId === 'n22') activity = { ...ACTIVITIES.n27!, choiceId: 'school' };
  if (state.nodeId === 'n05' && state.stats.food <= 0) activity = undefined;
  return { title: node.title, goal, points: points.slice(0, 3), activity };
}

/** Temporary manipulation never grants resources or changes the authored branch state. */
export function toggleEncounterItem(activity: EncounterActivity, selected: string[], id: string): string[] {
  const valid = [...new Set(selected.filter(value => activity.items.some(item => item.id === value)))];
  if (!activity.items.some(item => item.id === id)) return valid;
  if (valid.includes(id)) return valid.filter(value => value !== id);
  if (activity.kind === 'compare' || activity.kind === 'route' || activity.kind === 'reply' || activity.kind === 'share') return [id];
  if (activity.capacity && valid.length >= activity.capacity) return [...valid.slice(1), id];
  return [...valid, id];
}

export function resolveEncounterActivity(state: BranchState, selected: string[]) {
  const activity = getSceneEncounter(state).activity;
  if (!activity) return { complete: false, response: '', choiceId: null };
  let valid = [...new Set(selected.filter(id => activity.items.some(item => item.id === id)))];
  if (['compare', 'route', 'reply', 'share'].includes(activity.kind)) valid = valid.slice(-1);
  else if (activity.capacity) valid = valid.slice(-activity.capacity);
  const complete = valid.length >= (activity.required ?? 1) && (!activity.solution || activity.solution.every(id => valid.includes(id)));
  let choiceId = activity.choiceId;
  if ((activity.kind === 'route' || activity.kind === 'reply') && valid.length === 1) choiceId = valid[0];
  const choice = getChoices(state).find(item => item.id === choiceId);
  const point = getSceneEncounter(state).points.find(item => item.choiceId === choiceId);
  const response = !complete && valid.length && activity.correction ? activity.correction
    : complete ? (activity.kind === 'route' || activity.kind === 'reply') && point ? `${point.speaker}：${point.response}` : activity.response
    : activity.instruction;
  return { complete, response, choiceId: complete && choice ? choice.id : null };
}

/** Completed controls express the action itself; story requirements still gate submission. */
export function resolveEncounterAction(state: BranchState, selected: string[]): string | null {
  const result = resolveEncounterActivity(state, selected);
  if (!result.complete || !result.choiceId) return null;
  return getChoices(state).find(choice => choice.id === result.choiceId && choice.enabled)?.id ?? null;
}
