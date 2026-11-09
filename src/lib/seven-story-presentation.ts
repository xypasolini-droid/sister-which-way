import type { BranchState } from './branch-story';
import type { SevenEndingId } from './seven-ending-story';
import type { SixArtKey, SixShot } from './six-story-presentation';

export type SevenShot = SixShot & { action: string };
type SevenState = Pick<BranchState, 'nodeId' | 'endingId'>;

function shot(id: string, art: SixArtKey, speaker: string, line: string, caption?: string, cue?: SevenShot['cue'], realm?: SevenShot['realm']): SevenShot {
  return { id, action: id, art, speaker, line, caption, durationMs: 6000, cue, realm };
}

const OPENING: SevenShot[] = [
  shot('last-grain', 'opening', '母亲', '袋底这点粮，够萨米吃几口。', '母亲抖了抖粮袋。', 'wind'),
  shot('father-absent', 'opening', '努拉', '他们就在这里带走父亲。我们都看见了。'),
  shot('scissors-between', 'opening', '玛莉安', '我把剪刀放这里。等你想好。', '姐姐松开手，剪刀留在地毯上。'),
  shot('layla-note', 'opening', '莱拉的字条', '到水井来找我。我在外面也用男孩的名字。', '一张纸从门下滑进来。'),
  shot('brothers-coat', 'opening', '玛莉安', '阿里的衣服有点大。我给你把裤脚折起来。', '姐姐从衣箱里拿出亡兄的旧衣和小帽。'),
  shot('home-or-street', 'opening', '努拉', '我拿着钱去买粮，店家一看我是女孩，就让我回去。'),
  shot('opening-choice', 'opening', '玛莉安', '粮还在。你想先做哪件事？', '萨米守着碗，努拉捏住井边的字条。'),
];

const HOME: SevenShot[] = [
  shot('give-sami-bowl', 'opening', '努拉', '萨米，来。这一份也给你。'),
  shot('close-scissors', 'opening', '努拉', '我先留在家。剪刀收起来吧。'),
  shot('write-door-list', 'opening', '努拉', '先找父亲的老主顾。远一点的，我们托人带话。'),
  shot('knock-door', 'opening', '受托的邻居', '是东巷那一家让我来的。只要一把粮。', '门里的人推回空袋。', 'knock'),
  shot('cross-off-door', 'opening', '努拉', '粮店也不肯赊了。划掉这个。'),
  shot('sell-kettle', 'opening', '玛莉安', '这把壶也拿去吧。屋里还有一口锅。'),
  shot('try-last-name', 'opening', '萨米', '纸上这个人，还没有划掉。', '他用指头压住最后一个名字。'),
  shot('face-marriage-offer', 'opening', '来访的亲戚', '她嫁过来，粮和住的地方都有。', '他的脚跨过了门槛。'),
  shot('sister-at-table', 'opening', '母亲', '我们已经两天没开火了。', '玛莉安压住衣角，抬起头。'),
  shot('home-choice', 'opening', '玛莉安', '等一下。我有话要说。'),
];

const HAIRCUT: SevenShot[] = [
  shot('she-takes-scissors', 'opening', '努拉', '姐姐，把镜子扶稳。我自己来。'),
  shot('she-cuts', 'opening', '玛莉安', '我扶着。你慢一点。', '努拉亲手剪断发辫，姐姐伸手接住。', 'scissors'),
  shot('sister-keeps-name', 'opening', '努拉', '在外面叫我阿提什。阿提什是火。', '姐姐递过小帽：“家里还是叫你努拉。”'),
];

const MARKET: SevenShot[] = [
  ...HAIRCUT,
  shot('set-home-signal', 'opening', '努拉', '我敲两下短的，再敲一下长的。听见了再开门。', '玛莉安在门板上敲了一遍。', 'knock'),
  shot('ask-price', 'work', '努拉', '一趟给多少？我们两个都搬。', '老板朝货堆一扬下巴。'),
  shot('carry-crate', 'work', '老板', '再慢一点，你们今天的工钱就都别拿。', '莱拉弯腰托住快滑下来的木箱。', 'steps'),
  shot('count-coins', 'work', '莱拉', '少了。刚才那两趟，他说不算。', '她把几枚钱拨进努拉手里。'),
  shot('split-bread', 'work', '努拉', '这半张你吃。另一半，我带给萨米。'),
  shot('blast-nearby', 'war', '莱拉', '阿提什，低头！', '一声爆响，饼从努拉手上滑下去。', 'rumble'),
  shot('shutters-fall', 'war', '努拉', '去家里的巷口还开着。那边有人往城门跑。', '她捡起饼塞进衣襟，转身看见街上的人流。'),
  shot('market-choice', 'war', '莱拉', '快，哪边？', '两个人还能碰到彼此的手。'),
];

const STREET: SevenShot[] = [
  ...HAIRCUT,
  shot('read-note', 'opening', '努拉', '井边。莱拉还在等我。'),
  shot('meet-at-well', 'work', '莱拉', '我还以为你不会来。帽子再往下压一点。'),
  shot('agree-signal', 'work', '努拉', '走散了就回这面低墙。谁先到，谁等。'),
  shot('show-cap', 'work', '巡查', '帽子戴好。别堵着路！', '努拉把帽檐按低，贴着井边的墙走。'),
  shot('hands-part', 'war', '莱拉', '阿提什！', '爆炸声里，一辆军车挤过街口。两只手被奔逃的人群撞开。', 'rumble'),
  shot('back-for-layla', 'war', '努拉', '低墙。她会回低墙。', '她抵住墙，转身逆着人流走。', 'steps'),
  shot('find-layla', 'warTogether', '莱拉', '这边！我在井旁边！', '努拉抓住她的袖口。'),
  shot('shield-face', 'assault', '巡查', '我认得你。你父亲被带走那天，你就在屋里。', '棍子抬起。努拉抬臂护住头。'),
  shot('collapse', 'rescue', '莱拉', '努拉！听得见我吗？', '她倒在墙根，莱拉的声音越来越远。'),
  shot('tell-sulayman', 'village', '努拉的故事', '从前有个叫苏莱曼的孩子。村里的种子被象王夺走了。', undefined, 'bell', 'dream'),
  shot('carry-seeds', 'journey', '苏莱曼', '这几颗是我捡回来的。还有一袋，在山那头。', '他攥紧小布袋，往山里走。', undefined, 'dream'),
  shot('bind-knee', 'journey', '路上的老妇', '先坐下，让我把你的膝盖绑起来。', '苏莱曼接过她递来的水。', undefined, 'dream'),
  shot('face-elephant', 'elephant', '苏莱曼', '我们把种子埋下去，一村子的人就有饭吃。', '象王低下头。他颤着手，捡起巨兽脚边的布袋。', 'rumble', 'dream'),
  shot('name-ali', 'elephant', '努拉', '阿里。你没回来的那天，桌上还有你的碗。', '她想起亡兄，手里的布袋一点点沉下去。', undefined, 'dream'),
  shot('voices-cross', 'elephant', '两个声音', '家人：“努拉，回来吃饭。”　莱拉：“努拉，醒一醒。”', '两个声音几乎同时响起。', 'bell', 'dream'),
];

const RESULTS: Record<SevenEndingId, SevenShot[]> = {
  doors_stay_closed: [
    shot('block-door', 'opening', '努拉', '请你出去。我们再去找人。', '她挡在姐姐身前。', 'steps'),
    shot('write-last-name', 'opening', '努拉', '还有这家。把住处写上，我去。'),
    shot('last-door', 'no_smoke', '努拉', '有人在吗？我只想借一点粮。', '路被封死，门后再没有声音。', 'knock'),
    shot('empty-bowls', 'no_smoke', '玛莉安', '把碗放这儿吧。我陪着萨米。', '冷灶旁，努拉的发辫垂到空碗边。'),
    shot('door-stays-shut', 'no_smoke', '终幕', '母亲、玛莉安、努拉和萨米相继死于饥饿。', '纸上的名字没有等来粮。父亲仍被关押。', 'wind'),
  ],
  grain_without_her: [
    shot('give-sister-word', 'opening', '努拉', '你先在门外等。让姐姐把话说完。', '她挪开身子，姐姐自己走到门槛前。'),
    shot('record-promises', 'opening', '玛莉安', '先把粮送来。说好的住处，也请努拉记下来。', '努拉低头，把两条都写在纸上。'),
    shot('grain-arrives', 'sister_married', '母亲', '粮送到了。萨米，你先吃一点。', '粮袋搁在姐姐从前放书的地方。'),
    shot('sister-leaves', 'sister_married', '玛莉安', '萨米，姐姐把书留给你。', '她抱了幼弟一会儿，提起布包，自己跨出门槛。', 'steps'),
    shot('empty-place', 'sister_married', '终幕', '三个人有了饭吃。桌边还空着姐姐的位置。', '努拉扶住多摆的碗。父亲仍被关押。'),
  ],
  two_borrowed_boys: [
    shot('read-road', 'war', '努拉', '大路被堵住了。跟住往关口走的人。'),
    shot('take-layla-hand', 'warTogether', '努拉', '莱拉，抓紧。我们一起过去。', undefined, 'steps'),
    shot('hats-fall', 'conscripted', '武装者', '你们两个小子，留下。', '两顶小帽滚到地上，拦路的人把她们拖出队伍。'),
    shot('load-truck', 'conscripted', '武装者', '把箱子搬上车。跑起来！', '努拉和莱拉抬起第一箱物资。', 'rumble'),
    shot('carry-orders', 'conscripted', '莱拉', '这条路已经不是回城的路了。', '她们从搬运变成传令，被送得越来越远。'),
    shot('two-wrong-names', 'conscripted', '终幕', '没人问她们叫什么。车继续往前线开。', '给萨米的半张饼还在衣襟里。父亲仍被关押。', 'wind'),
  ],
  four_in_the_back: [
    shot('count-crossroads', 'war', '努拉', '白墙、破旗、低门槛。照来时的路走。'),
    shot('run-home', 'war', '努拉', '莱拉，我要去接他们！', '她放开身边的衣袖，折回巷子。', 'steps'),
    shot('bring-family-out', 'opening', '玛莉安', '两短一长，是你。萨米，抱住我。', '母亲放下包裹，跟她们一起跨出门。', 'knock'),
    shot('help-family-board', 'family_escape', '舅舅', '扶着后面的栏板，一个个上！', '努拉先托起萨米，再扶母亲和姐姐爬上露天货斗。'),
    shot('count-four', 'family_escape', '努拉', '母亲、姐姐、萨米。还有我。四个。', '她在木栏内坐下，货斗上方只有天空。', 'rumble'),
    shot('gate-behind', 'family_escape', '终幕', '四个人离开了城。', '父亲仍在狱里。车驶过关口时，她没有看见莱拉。', 'wind'),
  ],
  spring_without_waking: [
    shot('return-seeds', 'village', '苏莱曼', '把手伸出来。每个人分几颗，埋在自家的门外。', '他解开布袋，把种子交回村里。', undefined, 'dream'),
    shot('spring-harvest', 'unwaking_spring', '努拉的故事', '春天来了，谷子压弯了秆。', '村里终于有了自己的粮。', undefined, 'dream'),
    shot('father-at-table', 'unwaking_spring', '父亲', '努拉，靠这里坐。', '父亲跛着走到桌边，把木腋拐靠在椅旁。', undefined, 'dream'),
    shot('dream-table', 'unwaking_spring', '阿里', '妹妹，我给你留了热的。', '阿里坐在小小的萨米身边。玛莉安还在家，母亲摆好了六只碗。', 'bell', 'dream'),
    shot('reality-unwaking', 'rescue', '现实', '莱拉反复呼唤，受伤的努拉始终没有醒来。', '丰收和团聚留在梦里。现实中她家人的去向未知。', 'wind', 'reality'),
  ],
  one_lantern_many_hands: [
    shot('grip-layla-hand', 'rescue', '莱拉', '努拉。听得见的话，捏一下我的手。', '她的指尖动了动。'),
    shot('open-eyes', 'awake', '努拉', '莱拉……我在。', '她忍着疼，终于睁开眼。', 'bell'),
    shot('bind-wound', 'awake', '救助的女人', '把头靠过来。我给你换块干净布。', '几位女人把她们藏在院里，等巡查离开。'),
    shot('leave-city', 'warTogether', '莱拉', '能走了吗？累了就告诉我。', '伤好一些后，两人趁混乱离城。城内家人的去向仍未知。', 'steps'),
    shot('teach-letters', 'growth', '成年努拉', '把自己的名字写在这儿。笔不够，我们轮着用。', '多年以后，她和伙伴在院里教新来的女孩识字。', undefined, 'future'),
    shot('open-door', 'growth', '成年努拉', '让她们进来。我去给孩子看看伤。', '有女人带着孩子来到门口，莱拉铺开空出的床褥。', undefined, 'future'),
    shot('share-lantern', 'growth', '莱拉', '今晚我守上半夜。你把灯传给我。', '努拉举起灯，院里几只手依次接过。', 'bell', 'future'),
  ],
};

const SCENES: Record<string, SevenShot[]> = {
  'v7-opening': OPENING,
  'v7-home': HOME,
  'v7-market': MARKET,
  'v7-street': STREET,
};

const CHAPTERS: Record<string, string> = {
  'v7-opening': '最后一点粮食',
  'v7-home': '名字写在纸背',
  'v7-market': '饼还在怀里',
  'v7-street': '井边的低墙',
  doors_stay_closed: '没有等到的粮',
  grain_without_her: '三只碗',
  two_borrowed_boys: '两顶小帽',
  four_in_the_back: '封城之前',
  spring_without_waking: '梦里开饭了',
  one_lantern_many_hands: '院里有灯',
};

export function getSevenShots(state: SevenState): SevenShot[] {
  if (state.endingId) return RESULTS[state.endingId as SevenEndingId] ?? [];
  return SCENES[state.nodeId] ?? [];
}

export function getSevenStill(state: SevenState): SevenShot | undefined {
  const shots = getSevenShots(state);
  if (state.endingId === 'spring_without_waking') return shots.find(item => item.id === 'dream-table');
  return shots.at(-1);
}

export function getSevenChapter(state: SevenState): string {
  return CHAPTERS[state.endingId ?? state.nodeId] ?? '姐姐，我该怎么走';
}
