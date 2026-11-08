import type { BranchState } from './branch-story';
import type { StorySoundCue } from './story-audio';

/** Every image used by the new graph, including result sequences, is discoverable offline. */
export const SIX_ART = {
  opening: { src: '/art/sister-v6/opening-scissors.webp', alt: '姐姐坐在最后一碗粮食旁，握着剪刀；母亲护着幼弟，努拉坐在对面，父亲不在。' },
  work: { src: '/art/sister-v6/work-street.webp', alt: '戴朴素小帽、穿男式长衫的努拉与莱拉在街边做工，老板与巡查的阴影挡住去路。' },
  war: { src: '/art/sister-v6/war-street.webp', alt: '战乱中的街道，努拉与莱拉被惊慌的人流挤向街道两边。' },
  warTogether: { src: '/art/sister-v6/war-together.webp', alt: '战乱中的街口，努拉与莱拉牢牢拉着手，周围的人群向城外奔逃。' },
  assault: { src: '/art/sister-v6/street-assault.webp', alt: '巡查挡在两个孩子身前，向努拉举起棍棒；莱拉伸手护住她。' },
  rescue: { src: '/art/sister-v6/unconscious-rescue.webp', alt: '受伤的努拉躺在遮蔽处，莱拉和一名成年女性俯身照料她。' },
  awake: { src: '/art/sister-v6/rescue-awake.webp', alt: '努拉带着淤伤睁开眼睛，抬手回应身旁的莱拉；一名成年女性准备为她包扎。' },
  village: { src: '/art/sister-v6/tale-village.webp', alt: '童话中的少年苏莱曼走出缺少种子的村庄。' },
  journey: { src: '/art/sister-v6/tale-journey.webp', alt: '苏莱曼带着膝伤穿过纸片山谷，一位老妇为他包扎，递来清水。' },
  elephant: { src: '/art/sister-v6/tale-elephant.webp', alt: '小小的苏莱曼面对象王，金色种子就在巨兽脚边；云中浮现亡兄的记忆。' },
  growth: { src: '/art/sister-v6/growth-learning.webp', alt: '离城后渐渐长大的努拉与莱拉，在女性伙伴中学习识字、照料伤者与轮值守望。' },
  no_smoke: { src: '/art/sister-v6/end-no_smoke.webp', alt: '冷灶旁有四只空碗，母亲、姐姐、努拉与幼弟渐渐安静下来，父亲始终不在房间里。' },
  sister_married: { src: '/art/sister-v6/end-sister_married.webp', alt: '姐姐被带离家门；剩下母亲、努拉和幼弟的饭桌上，姐姐的位置空着。' },
  conscripted: { src: '/art/sister-v6/end-conscripted.webp', alt: '努拉与莱拉被当作男孩征用，背着沉重物资走向远处的前线。' },
  family_escape: { src: '/art/sister-v6/end-family_escape.webp', alt: '努拉、母亲、姐姐和幼弟四人坐在露天木板货斗里离城，车上没有父亲和莱拉。' },
  unwaking_spring: { src: '/art/sister-v6/end-unwaking_spring.webp', alt: '梦中的春日饭桌旁，努拉与父母、姐姐、幼弟、亡兄团聚；现实中受伤的她仍没有醒来。' },
  guardian_future: { src: '/art/sister-v6/end-guardian_future.webp', alt: '多年后，成年努拉指挥成年女性护卫队守望山口，女孩们走向学校。' },
} as const;

export type SixArtKey = keyof typeof SIX_ART;
export type StoryCue = StorySoundCue;
export type SixShot = {
  id: string; art: SixArtKey; speaker: string; line: string; caption?: string;
  durationMs: number; cue?: StoryCue; position?: string; realm?: 'reality' | 'dream' | 'future';
};
type SixState = Pick<BranchState, 'nodeId' | 'endingId' | 'storyRevision'>;
const shot = (id: string, art: SixArtKey, speaker: string, line: string, caption = '', cue?: StoryCue, durationMs = 6000): SixShot => ({ id, art, speaker, line, caption, cue, durationMs });

const OPENING: SixShot[] = [
  shot('last-grain', 'opening', '母亲', '只剩这些了。萨米还小，先给他。', '父亲被捕后，家里已经断了收入。', 'wind'),
  shot('known-arrest', 'opening', '努拉', '他们就在这里把父亲带走。我们都看见了。', '父亲坐过的位置，空了很多天。'),
  shot('young-brother', 'opening', '萨米', '姐姐，我还饿。', '幼弟三岁，还不明白门为什么总关着。'),
  shot('sister-keeps-watch', 'opening', '玛莉安', '嘘。靠着母亲，先睡一会儿。', '幼弟紧靠母亲。姐姐的目光落在空粮袋上。'),
  shot('doors-closed', 'opening', '母亲', '没有男人陪同，连买粮的门都进不去。', '她揉着寻父途中留下的伤。'),
  shot('brothers-clothes', 'opening', '玛莉安', '阿里的旧衣服还在。穿上它，他们会当你是男孩。', '亡兄的衣服，放在姐姐膝边。'),
  shot('scissors-wait', 'opening', '玛莉安', '努拉……你来决定。', '姐姐拿起剪刀，等你的回答。', 'scissors'),
];
const MARRIAGE: SixShot[] = [
  shot('scissors-down', 'opening', '努拉', '先别剪。我们再求一次人。', '剪刀被放回地毯。'),
  shot('entrust-shopping', 'opening', '母亲', '托人带的粮呢？', '来人站在门口，空着手。', 'knock'),
  shot('credit-refused', 'opening', '来人', '粮商说，先让你丈夫把欠的结清。', '托人买粮、赊账，接连没有结果。'),
  shot('belongings-sold', 'opening', '玛莉安', '这个也卖掉吧。总得熬过今晚。', '家当越来越少，换来的粮却越来越少。'),
  shot('help-fails', 'opening', '母亲', '亲戚说，自己家也没有多余的。', '求援的人走了，门又关上。', 'knock'),
  shot('last-dish-sold', 'opening', '玛莉安', '连装饭的盘子也卖了。明天怎么办？', '母亲把最后一点面粉扫进空碗。'),
  shot('marriage-offer', 'opening', '来人', '让大女儿嫁过来，粮和住处就有了。', '他们的目光停在姐姐身上。'),
  shot('sister-price', 'opening', '玛莉安', '你们都看着我……这就是最后的办法了吗？', '萨米的碗空着，没有人接话。'),
];
const WAR: SixShot[] = [
  shot('hair-cut', 'opening', '玛莉安', '低一下头。我会轻一点。', '头发落下来。哥哥的旧长衫，袖口折了两折。', 'scissors'),
  shot('aatish-name', 'work', '努拉', '我叫阿提什。是火焰的意思。', '浅灰小帽遮住短发，男式长衫和宽裤遮住身份。'),
  shot('layla-recognizes', 'work', '莱拉', '是我。别叫出我原来的名字。', '旧同学也借了一个男孩的名字。', 'steps'),
  shot('shared-labor', 'work', '莱拉', '这边我抬。你扶住另一头。', '两个孩子一起搬货，跑腿，把力气换成面饼。'),
  shot('boss-threat', 'work', '老板', '慢吞吞的！砸坏了就从工钱里扣！', '沉重的货物压住她们的肩。', 'knock'),
  shot('wages-withheld', 'work', '努拉', '我们做了一整天。说好的钱呢？', '老板挥手把她们赶出门，只扔来几枚零钱。'),
  shot('bread-shared', 'work', '莱拉', '别让他看见你哭。明天我们还一起。', '终于攒下一点饼钱。她们在墙根分开面饼。'),
  shot('war-arrives', 'warTogether', '街上的人', '关门！军车来了！', '爆炸声越过屋顶，铺门一道道落下。', 'rumble'),
  shot('crowd-rushes', 'warTogether', '莱拉', '抓紧，别松手！', '人流把你们挤到街口。她的手还在你手里。', 'steps'),
  shot('war-choice', 'warTogether', '努拉', '母亲她们还在家里……', '街口即将封闭。你必须决定先往哪里走。', 'wind'),
];
const VOICES: SixShot[] = [
  shot('hands-part', 'war', '努拉', '莱拉！', '一辆军车切开人流，你们的手被挤开。', 'rumble'),
  shot('against-crowd', 'war', '努拉', '我回来找你。别走！', '你逆着人流，跑回封锁的街口。', 'steps'),
  shot('layla-found', 'assault', '莱拉', '我在这里！', '你终于看见她，也看见挡住去路的巡查。'),
  shot('recognized', 'assault', '巡查', '我认得你！你是那个老师的女儿！', '他抓住你的衣领，莱拉伸手拦他。', 'knock'),
  shot('blow-falls', 'rescue', '莱拉', '放开她！', '棍棒落下。你倒在街边，呼喊渐渐远了。', 'knock'),
  { ...shot('become-sulayman', 'village', '努拉的故事', '从前，有个少年，名叫苏莱曼。', '黑暗里，姐姐讲过的故事开始了。', 'wind'), realm: 'dream' },
  { ...shot('stolen-seeds', 'village', '村人', '种子被象王夺走了。春天要怎么来？', '苏莱曼背上空袋，离开村庄。'), realm: 'dream' },
  { ...shot('journey-fear', 'journey', '苏莱曼', '我很害怕。可村里的人还等着。', '山道遮住来路，膝上的伤口在疼。', 'steps'), realm: 'dream' },
  { ...shot('journey-help', 'journey', '路上的女人', '先坐下。伤口要包起来。', '一双手给他清水，也给他继续走的力气。'), realm: 'dream' },
  { ...shot('elephant-king', 'elephant', '象王', '你这么小，凭什么要我归还春天？', '巨大的影子俯下来。少年仍没有退开。', 'rumble'), realm: 'dream' },
  { ...shot('brother-remembered', 'elephant', '苏莱曼', '哥哥叫阿里。他再也不能回家吃饭了。', '他终于说出一直藏着的失去。'), realm: 'dream' },
  { ...shot('seed-returned', 'elephant', '努拉的故事', '象王的吼声停了。少年终于能带种子回家。', '不是因为不怕，而是他没有转身。', 'bell'), realm: 'dream' },
  { ...shot('two-voices', 'village', '家人 ／ 莱拉', '「回家吧。」　「努拉，醒醒。听得到我吗？」', '两个声音同时响起。你站在梦与醒的交界。'), realm: 'dream' },
];

const RESULTS: Record<string, SixShot[]> = {
  no_smoke: [
    shot('refuse-marriage', 'opening', '努拉', '不能拿姐姐去换。我们再等等。', '没有人带着粮食回来。'),
    shot('hunger-days', 'no_smoke', '玛莉安', '把我的那份给萨米。', '卖得掉的东西都已卖尽，灶里很久没有火。', 'wind', 5500),
    shot('hunger-time', 'no_smoke', '努拉', '今天……也没有人敲门。', '日光移过墙面。碗始终空着。'),
    shot('hunger-silence', 'no_smoke', '房间里', '后来，连讨一口水的声音也没有了。', '母亲、姐姐、努拉和幼弟，先后死于饥饿。', undefined, 5500),
    shot('cold-stove', 'no_smoke', '终幕', '这个家，再没有升起炊烟。', '父亲仍不在家中。', undefined, 5000),
  ],
  sister_married: [
    shot('plead-sister', 'opening', '母亲', '玛莉安……弟弟还得活下去。', '姐姐低着头，手指紧紧绞住衣角。'),
    shot('sister-departs', 'sister_married', '玛莉安', '努拉，替我看着他。', '她没有自由答应的余地。来人带走了她。', 'steps', 5500),
    shot('food-arrives', 'sister_married', '努拉', '粮来了。姐姐却不在。', '门关上后，母亲把粮袋拖到灶旁。', 'knock'),
    shot('sister-missing', 'sister_married', '萨米', '她什么时候回来？', '母亲把饼掰成三份，没有回答。'),
    shot('empty-place', 'sister_married', '终幕', '饭桌上，少了一个人。', '母亲、努拉与幼弟活下来，姐姐的以后握在别人手里。', undefined, 5500),
  ],
  conscripted: [
    shot('flee-together', 'warTogether', '努拉', '一起走。抓住我的手。', '你们拉紧彼此，跟着人群跑向城外。', 'steps'),
    shot('closed-gate', 'conscripted', '武装者', '男孩留下！你们两个，也过来！', '城门已封闭。他们把你们从人群中拽出。', 'knock'),
    shot('carry-ammunition', 'conscripted', '武装者', '搬上车！不许停！', '她们被当作男孩，先搬运沉重的物资。', 'rumble'),
    shot('forced-orders', 'conscripted', '莱拉', '我们离家越来越远了。', '传令、搬运、转移。没有人允许两个孩子离开。'),
    shot('toward-front', 'conscripted', '终幕', '这条路，没有返程。', '最后，她们被送向前线，卷进本不属于她们的战斗。', 'wind', 5500),
  ],
  family_escape: [
    shot('run-home', 'war', '努拉', '我要回家。母亲在等我。', '你松开莱拉，转身跑回熟悉的小巷。', 'steps'),
    shot('gather-family', 'opening', '努拉', '快收拾，车不会等到天黑！', '你扶起母亲，姐姐抱紧萨米。'),
    shot('cargo-boarding', 'family_escape', '舅舅', '快上后面！扶住木栏！', '你把母亲扶上露天货斗，自己最后攀上去。', 'rumble'),
    shot('cargo-departs', 'family_escape', '母亲', '努拉，坐稳。别再往下看了。', '车轮驶过最后一个路口。她把你拉到身旁。'),
    shot('four-depart', 'family_escape', '玛莉安', '四个人，都在这里了。', '货车在封路前离城。父亲仍被囚，莱拉去向不明。', 'wind', 5500),
  ],
  unwaking_spring: [
    { ...shot('dream-home', 'unwaking_spring', '努拉', '我回来了。', '你走向梦中家人的声音，把种子带回村庄。', 'bell'), realm: 'dream' },
    { ...shot('spring-grows', 'unwaking_spring', '努拉的故事', '种子发芽。村庄迎来丰收。', '春天像从前的故事那样，终于抵达。'), realm: 'dream' },
    { ...shot('dream-reunion', 'unwaking_spring', '阿里', '坐下吧，饭还热着。', '父亲回家，姐姐没有出嫁。亡兄也坐在萨米旁边。', undefined, 6000), realm: 'dream' },
    shot('reality-unwaking', 'rescue', '现实', '莱拉一遍遍呼唤。努拉始终没有醒来。', '团聚只发生在梦里。现实中家人的去向仍未知。', 'wind', 6000),
  ],
  guardian_future: [
    shot('choose-wake', 'awake', '努拉', '莱拉……我要活下去。', '她的手指终于动了一下，眼睛艰难地睁开。', 'bell'),
    shot('rescued', 'awake', '莱拉', '别起来。有人愿意帮我们。', '一名女人包住伤口，将她们藏到巡查经过以后。'),
    shot('escape-city', 'warTogether', '努拉', '这一次，我们都不能松手。', '休养一阵、伤势恢复后，她们才趁着混乱逃离城市。', 'steps'),
    { ...shot('years-mutual-aid', 'growth', '多年以后', '先给新来的人一碗水，再问她需要什么。', '她们与其他女性互相庇护，接应逃难的人。', 'wind'), realm: 'future' },
    { ...shot('learn-and-train', 'growth', '努拉', '我学会了读书，也学会和别人一起守夜。', '识字、急救、自卫。守望从几个人的一夜轮班开始。'), realm: 'future' },
    { ...shot('adult-leader', 'guardian_future', '成年努拉', '换哨。让孩子们先过去。', '多年组织与训练后，她成为女性护卫队长。', 'steps', 5500), realm: 'future' },
    { ...shot('guarded-land', 'guardian_future', '终幕', '她没有挣脱一切。她守住了一方可以长大的地方。', '女孩可以学习和谋生；成年女性共同守护这里。', 'bell', 5500), realm: 'future' },
  ],
};

/** A terminal state is committed before these shots; playback never chooses again. */
export function getSixShots(state: SixState): SixShot[] {
  if (state.storyRevision !== 6) return [];
  if (state.endingId) return RESULTS[state.endingId] ?? [];
  return ({ 'v6-opening': OPENING, 'v6-marriage': MARRIAGE, 'v6-war': WAR, 'v6-voices': VOICES } as Record<string, SixShot[]>)[state.nodeId] ?? [];
}

export function getSixChapter(state: SixState): string {
  if (state.endingId) return ({ no_smoke: '冷下去的灶', sister_married: '离家的姐姐', conscripted: '没有返程', family_escape: '封城之前', unwaking_spring: '梦中的春天', guardian_future: '她们守住的地方' } as Record<string, string>)[state.endingId] ?? '终幕';
  return ({ 'v6-opening': '最后一点粮食', 'v6-marriage': '姐姐的代价', 'v6-war': '借来的名字', 'v6-voices': '梦与醒之间' } as Record<string, string>)[state.nodeId] ?? '姐姐，我该怎么走';
}

export function getSixStill(state: SixState): SixShot | undefined {
  const shots = getSixShots(state);
  if (state.endingId === 'unwaking_spring') return shots.find(item => item.id === 'dream-reunion');
  return shots.at(-1);
}
