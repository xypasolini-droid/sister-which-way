import type { BranchState } from './branch-story';
import type { SevenEndingId } from './seven-ending-story';
import type { SixArtKey, SixShot } from './six-story-presentation';

export type SevenShot = SixShot & { action: string };
type SevenState = Pick<BranchState, 'nodeId' | 'endingId'>;

function shot(id: string, art: SixArtKey, speaker: string, line: string, caption?: string, cue?: SevenShot['cue'], realm?: SevenShot['realm']): SevenShot {
  return { id, action: id, art, speaker, line, caption, durationMs: 6000, cue, realm };
}

const OPENING: SevenShot[] = [
  shot('last-grain', 'opening', '母亲', '就剩这么一点粮了。萨米，等我加点水。', undefined, 'wind'),
  shot('father-absent', 'opening', '努拉', '爸被抓走以后，粮店的人连钱都不肯收我的。'),
  shot('scissors-between', 'opening', '玛莉安', '要是你真想换身衣服出去，我帮你扶镜子。'),
  shot('layla-note', 'opening', '莱拉的字条', '我在井边等你。我也换了男装。', '字条从门缝里递了进来。'),
  shot('brothers-coat', 'opening', '玛莉安', '阿里留下的小帽你能戴。裤脚折两折就行。'),
  shot('home-or-street', 'opening', '努拉', '我留在家还能托邻居借粮。要是出门，得想好先去哪儿。'),
  shot('opening-choice', 'opening', '玛莉安', '你想留在家，还是剪了头发出门？'),
];

const HOME: SevenShot[] = [
  shot('give-sami-bowl', 'opening', '努拉', '萨米，把碗给我。我的这份也倒给你。'),
  shot('close-scissors', 'opening', '玛莉安', '好，剪刀我先收起来。要托谁去借粮？'),
  shot('write-door-list', 'opening', '努拉', '我把爸的几个老主顾写下来。请邻居替我们问问。'),
  shot('knock-door', 'opening', '邻居', '东巷那家托我问一声，能借一把粮吗？', '门里的人把空袋推了回来。', 'knock'),
  shot('cross-off-door', 'opening', '努拉', '邻居空手回来了。粮店也不肯赊。'),
  shot('sell-kettle', 'opening', '玛莉安', '这把壶也拿去吧。屋里还有一口锅。'),
  shot('try-last-name', 'opening', '萨米', '姐姐，纸上还有一个名字。这个人也问过了吗？'),
  shot('face-marriage-offer', 'opening', '来访的亲戚', '玛莉安嫁到我家，我就送粮，再给你们腾间屋。'),
  shot('sister-at-table', 'opening', '母亲', '萨米两天没吃上热饭了。玛莉安，你听见他开出的条件了吗？'),
  shot('home-choice', 'opening', '玛莉安', '听见了。先等等，这件事让我自己说。'),
];

const HAIRCUT: SevenShot[] = [
  shot('she-takes-scissors', 'opening', '努拉', '姐姐，把镜子扶稳。我自己来。'),
  shot('she-cuts', 'opening', '玛莉安', '镜子稳着呢。你慢慢剪。', undefined, 'scissors'),
  shot('sister-keeps-name', 'opening', '努拉', '出门以后，我就叫阿提什。是火的意思。'),
];

const MARKET: SevenShot[] = [
  ...HAIRCUT,
  shot('set-home-signal', 'opening', '努拉', '姐姐，我回来时敲两下短的，再敲一下长的。听见了再开门。', undefined, 'knock'),
  shot('ask-price', 'work', '努拉', '掌柜，这些箱子我能搬。一趟给多少？'),
  shot('carry-crate', 'work', '莱拉', '阿提什，我托这头。掌柜刚说，搬慢了就扣钱。', undefined, 'steps'),
  shot('count-coins', 'work', '莱拉', '他还是少给了。咱们先去买饼吧。'),
  shot('split-bread', 'work', '努拉', '这半张你吃。另一半，我带给萨米。'),
  shot('blast-nearby', 'war', '莱拉', '阿提什，低头！', '街口突然传来一声爆响。', 'rumble'),
  shot('shutters-fall', 'war', '努拉', '回家的巷口还没堵住。母亲和萨米都还在家。'),
  shot('market-choice', 'war', '莱拉', '人都往城门跑。你跟我一起走，还是先回家接他们？'),
];

const STREET: SevenShot[] = [
  ...HAIRCUT,
  shot('read-note', 'opening', '努拉', '井边。莱拉还在等我。'),
  shot('meet-at-well', 'work', '莱拉', '我还以为你不会来。帽子再往下压一点。'),
  shot('agree-signal', 'work', '努拉', '要是走散了，就回井边这面低墙。先到的等另一个。'),
  shot('show-cap', 'work', '巡查', '让开，井边这条路要封了！'),
  shot('hands-part', 'war', '莱拉', '阿提什，抓住我！', '爆响过后，奔逃的人群把两人冲散了。', 'rumble'),
  shot('back-for-layla', 'war', '努拉', '井边的低墙。她会在那里等我。', undefined, 'steps'),
  shot('find-layla', 'warTogether', '莱拉', '我在这儿！快，巡查往这边来了。'),
  shot('shield-face', 'assault', '巡查', '站住。我抓你父亲那天见过你。换顶帽子就以为我认不出？'),
  shot('collapse', 'rescue', '莱拉', '努拉！你听得见我吗？', '棍子落下后，努拉昏了过去。'),
  shot('tell-sulayman', 'village', '努拉的故事', '象王夺走了村里的种子。苏莱曼捡回几颗，就背起袋子进了山。', '昏迷中，努拉想起她给萨米讲过的故事。', 'bell', 'dream'),
  shot('carry-seeds', 'journey', '苏莱曼', '这几颗不够全村种。我得把象王拿走的那袋也带回去。', undefined, undefined, 'dream'),
  shot('bind-knee', 'journey', '路上的老妇', '你膝盖流血了。先让我包一下。象王就在洞里。', undefined, undefined, 'dream'),
  shot('face-elephant', 'elephant', '苏莱曼', '请把种子还给我。村里的人还等着播种。', undefined, 'rumble', 'dream'),
  shot('name-ali', 'elephant', '阿里的声音 · 梦里', '努拉，回来吃饭吧。你的碗还在桌上。', '苏莱曼拿回了种袋。努拉听见亡兄阿里的声音。', undefined, 'dream'),
  shot('voices-cross', 'elephant', '莱拉的声音 · 井边', '努拉，醒一醒。听见了，就握一下我的手。', '梦里的家人在等她，井边的莱拉也在等她。', 'bell', 'dream'),
];

const RESULTS: Record<SevenEndingId, SevenShot[]> = {
  doors_stay_closed: [
    shot('block-door', 'opening', '努拉', '你走吧。这门婚事，我们不答应。', undefined, 'steps'),
    shot('write-last-name', 'opening', '母亲', '名单上那最后一家，在井后头。拿上袋子。'),
    shot('last-door', 'no_smoke', '努拉', '有人在吗？我们只想借一点粮。', '门后没人应答。封城以后，再没人能送粮来。', 'knock'),
    shot('empty-bowls', 'no_smoke', '玛莉安', '萨米，过来靠着我。姐姐给你暖暖手。', '许多天过去，灶里一直没有火。'),
    shot('door-stays-shut', 'no_smoke', '终幕', '留在家里的四个人先后死于饥饿。父亲仍在狱中。', undefined, 'wind'),
  ],
  grain_without_her: [
    shot('give-sister-word', 'opening', '努拉', '请你先到门外等。等姐姐想好了，让她自己跟你说。'),
    shot('record-promises', 'opening', '玛莉安', '粮要先送到，答应给他们的住处也得写下来。这样我才跟你走。'),
    shot('grain-arrives', 'sister_married', '母亲', '萨米，粮送来了。你先喝几口粥。'),
    shot('sister-leaves', 'sister_married', '玛莉安', '努拉，书留给萨米。等他再长一点，你教他念。', '亲戚兑现条件后，玛莉安离家成婚。', 'steps'),
    shot('empty-place', 'sister_married', '终幕', '父亲仍在狱中。开饭时，努拉还是会多摆一只碗。'),
  ],
  two_borrowed_boys: [
    shot('read-road', 'war', '努拉', '大路过不去。莱拉，我们走侧街，跟人群一起出城。'),
    shot('take-layla-hand', 'warTogether', '莱拉', '好。拉住我，别松手。', undefined, 'steps'),
    shot('hats-fall', 'conscripted', '武装者', '你们两个小子，出列。跟我走！', '关口已经封了。武装人员开始从人群里扣下少年。'),
    shot('load-truck', 'conscripted', '武装者', '把这些箱子搬上车！搬完跟着队伍去传令。', undefined, 'rumble'),
    shot('carry-orders', 'conscripted', '莱拉', '他们说下一站是前线。我们还能回去吗？'),
    shot('two-wrong-names', 'conscripted', '终幕', '她们被押往前线。给萨米的半张饼一直没能送回家。', undefined, 'wind'),
  ],
  four_in_the_back: [
    shot('count-crossroads', 'war', '努拉', '我得回家接他们。白墙在左边，从这儿穿过去。'),
    shot('run-home', 'war', '努拉', '看见门槛了。两短一长，姐姐一定听得见。', undefined, 'steps'),
    shot('bring-family-out', 'opening', '玛莉安', '两短一长，是努拉。萨米，抱紧我。我们从后巷去找舅舅。', undefined, 'knock'),
    shot('help-family-board', 'family_escape', '舅舅（车头）', '快上货斗！把萨米先抱上来，再扶你们母亲。'),
    shot('count-four', 'family_escape', '努拉', '妈、姐姐、萨米，还有我。人齐了，舅舅，开车吧！', undefined, 'rumble'),
    shot('gate-behind', 'family_escape', '终幕', '四个人在封城前离开。父亲仍在狱里，莱拉也没有消息。', undefined, 'wind'),
  ],
  spring_without_waking: [
    shot('return-seeds', 'village', '苏莱曼', '种子带回来了。家家都有份，明天就能播种。', undefined, undefined, 'dream'),
    shot('spring-harvest', 'unwaking_spring', '努拉的故事', '到了春天，田里第一次有了足够全村人吃的粮。', undefined, undefined, 'dream'),
    shot('father-at-table', 'unwaking_spring', '父亲', '努拉，回来了？坐爸爸旁边。', undefined, undefined, 'dream'),
    shot('dream-table', 'unwaking_spring', '阿里', '慢慢吃，锅里还有。萨米，给你姐姐挪一点地方。', '梦里，父亲回家了，玛莉安没出嫁，阿里也还在。', 'bell', 'dream'),
    shot('reality-unwaking', 'rescue', '现实', '莱拉一遍遍叫她的名字。努拉始终没有醒来。', '现实中，家人的去向仍无消息。', 'wind', 'reality'),
  ],
  one_lantern_many_hands: [
    shot('grip-layla-hand', 'rescue', '莱拉', '我感觉到了。努拉，再握一下。'),
    shot('open-eyes', 'awake', '努拉', '莱拉……别松手。', '努拉忍着疼睁开眼。', 'bell'),
    shot('bind-wound', 'awake', '救助的女人', '先按住这块布。等巡查走了，我们再从后门出去。', '几位女人把努拉和莱拉扶进院里。'),
    shot('leave-city', 'warTogether', '莱拉', '跟我走。走不动了就靠着我。', '等努拉能走动，两人一起离城。家人的去向仍无消息。', 'steps'),
    shot('teach-letters', 'growth', '成年努拉', '把自己的名字写在这儿。写完，把笔递给旁边的人。', '多年后，努拉和莱拉与其他女性一起开了一处院子。', undefined, 'future'),
    shot('open-door', 'growth', '成年努拉', '让她们进来。我去给孩子看看伤。', undefined, undefined, 'future'),
    shot('share-lantern', 'growth', '成年莱拉', '去歇会儿吧。灯给我，今晚我守上半夜。', undefined, 'bell', 'future'),
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
