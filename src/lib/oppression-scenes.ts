import type { BranchState, SceneId } from './branch-story';

export type DramaVisual =
  | 'market-warning' | 'market-cane'
  | 'arrest-entry' | 'arrest-grab' | 'arrest-drag' | 'arrest-empty'
  | 'mother-block' | 'mother-plead' | 'mother-struck' | 'mother-floor'
  | 'bread-refuse' | 'bread-threat' | 'bread-flee' | 'home-wounded'
  | 'street-recruit' | 'street-hide'
  | 'relative-order' | 'relative-pull' | 'relative-refuse'
  | 'prison-gunfire' | 'prison-shelter' | 'prison-signal';

export type DramaShot = {
  id: string;
  visual: DramaVisual;
  scene: SceneId;
  location: string;
  speaker: string;
  line: string;
  caption: string;
  durationMs: number;
};

type ShotTemplate = Omit<DramaShot, 'id'>;
type DramaState = Pick<BranchState, 'nodeId' | 'edition' | 'endingId' | 'flags' | 'storyRevision'>;

// Original staging of the authored story, rather than a transcript of the film.
// These shots only present events: skipping or replaying them never changes rules.
const MARKET: readonly ShotTemplate[] = [
  { visual: 'market-warning', scene: 'market', location: '集市的旧毯前', speaker: '年轻巡查', line: '一个女孩也敢坐在这里？马上收摊！', caption: '巡查指着女孩，挡在摊前。', durationMs: 2600 },
  { visual: 'market-cane', scene: 'market', location: '集市的旧毯前', speaker: '父亲', line: '努拉，退到我身后。', caption: '巡查举棍逼近，父亲挡在女孩前。', durationMs: 2400 },
];

const ARREST: readonly ShotTemplate[] = [
  { visual: 'arrest-entry', scene: 'home', location: '傍晚 · 家中的房间', speaker: '年轻巡查', line: '白天还敢顶嘴？把他带走！', caption: '门被踢开，巡查带武装者闯入。', durationMs: 2400 },
  { visual: 'arrest-grab', scene: 'home', location: '傍晚 · 家中的房间', speaker: '母亲', line: '松手！你们凭什么抓他？', caption: '武装者抓住父亲手臂，母亲上前阻拦。', durationMs: 2600 },
  { visual: 'arrest-drag', scene: 'home', location: '傍晚 · 家门内', speaker: '努拉', line: '放开我父亲！', caption: '父亲被拖向门口，母亲被推开。', durationMs: 2600 },
  { visual: 'arrest-empty', scene: 'home', location: '傍晚 · 家门内', speaker: '母亲', line: '他们把他带到拘留院去了。', caption: '父亲消失在门外，水碗倒在地上。', durationMs: 2800 },
];

const MOTHER: readonly ShotTemplate[] = [
  { visual: 'mother-block', scene: 'checkpoint', location: '监所外的街口', speaker: '巡查', line: '没有男人陪着，你们还敢出门？', caption: '巡查指着母女，挡住去路。', durationMs: 2600 },
  { visual: 'mother-plead', scene: 'checkpoint', location: '监所外的街口', speaker: '母亲', line: '他们抓走我丈夫。我只想见他。', caption: '母亲向前要求探视，被巡查逼住。', durationMs: 2600 },
  { visual: 'mother-struck', scene: 'checkpoint', location: '监所外的街口', speaker: '巡查', line: '回去！这里不准你们说话！', caption: '棍子落下，母亲抬臂护住头。', durationMs: 2500 },
  { visual: 'mother-floor', scene: 'checkpoint', location: '监所外的街口', speaker: '努拉', line: '母亲，靠着我。我们回家。', caption: '女孩向母亲伸手，试着扶她起身。', durationMs: 2800 },
];

const BREAD: readonly ShotTemplate[] = [
  { visual: 'bread-refuse', scene: 'market', location: '集市的面饼摊前', speaker: '摊主', line: '收起钱，别在这里惹麻烦。', caption: '摊主举掌拒卖，巡查站在摊边。', durationMs: 2400 },
  { visual: 'bread-threat', scene: 'market', location: '集市的面饼摊前', speaker: '巡查', line: '一个女孩？回家去！', caption: '巡查举棍，向空手的女孩逼近。', durationMs: 2500 },
  { visual: 'bread-flee', scene: 'market', location: '集市出口', speaker: '努拉', line: '我走，我这就走。', caption: '女孩空手退开，没能买到食物。', durationMs: 2500 },
];

const HOME_WOUNDED: readonly ShotTemplate[] = [
  { visual: 'home-wounded', scene: 'home', location: '家中的房间', speaker: '母亲', line: '先把门关好。过来，让我看看你。', caption: '母亲坐着养伤，女孩空手回家。', durationMs: 2800 },
];

const STREET: readonly ShotTemplate[] = [
  { visual: 'street-recruit', scene: 'market', location: '集市的通道', speaker: '武装者', line: '两个小子，过来搬军需！', caption: '武装者堵住通道，催两个孩子搬军需。', durationMs: 2500 },
  { visual: 'street-hide', scene: 'market', location: '集市摊后的窄道', speaker: '莱拉', line: '低头，先退到摊后。', caption: '两个孩子退入摊后，让开武装队伍。', durationMs: 2500 },
];

const CHECKPOINT: readonly ShotTemplate[] = [
  { visual: 'mother-block', scene: 'checkpoint', location: '集市街口的检查绳前', speaker: '巡查', line: '你，小子，站住。把包打开！', caption: '巡查指着戴小帽的孩子，命令他停下。', durationMs: 2500 },
];

const RELATIVE: readonly ShotTemplate[] = [
  { visual: 'relative-order', scene: 'road', location: '远亲的车旁', speaker: '贾维德', line: '现在就走。你女儿的事已经说好。', caption: '远亲堵在车前，催家人上车。', durationMs: 2600 },
  { visual: 'relative-pull', scene: 'road', location: '远亲的车旁', speaker: '母亲', line: '努拉还没回来，你放开我！', caption: '贾维德伸手强拉母亲，逼她上车。', durationMs: 2500 },
  { visual: 'relative-refuse', scene: 'road', location: '远亲的车旁', speaker: '母亲', line: '不能丢下任何一个孩子。我回去。', caption: '母亲挣开他的手，拒绝强迫带离。', durationMs: 2800 },
];

function prisonShots(state: DramaState): readonly ShotTemplate[] {
  const bonded = state.flags.includes('guardBond');
  const missedWindow = state.storyRevision === 5 && !state.flags.includes('pact');
  const canAttemptRescue = bonded && !missedWindow;
  return [
    { visual: 'prison-gunfire', scene: 'prison', location: '北门外的路口', speaker: '阿明', line: '趴下！别站在路中央！', caption: '路口传来枪声，武装者守在门边。', durationMs: 2300 },
    { visual: 'prison-shelter', scene: 'prison', location: '北门侧墙', speaker: '努拉', line: '我记得他的名字。我还在这里。', caption: '女孩蹲在墙边避开路口，仍盯着门。', durationMs: 2600 },
    { visual: 'prison-signal', scene: 'prison', location: '北门侧墙', speaker: '阿明', line: canAttemptRescue ? '躲在门侧。我进去找他，别冲出来。' : bonded ? '已经换岗了。先退开，我不能带你进去。' : '名字留下。先退开，我不能答应。', caption: canAttemptRescue ? '阿明认出字迹，示意女孩留在门边。' : bonded ? '阿明认得女孩，但侧门时段已经错过。' : '阿明收下姓名，没有答应开门救人。', durationMs: 2800 },
  ];
}

/** Pure presentation projection. Playing, skipping, or revisiting adds no decisions. */
export function getOppressionShots(state: DramaState): DramaShot[] {
  if (state.endingId) return [];
  let shots: readonly ShotTemplate[] = [];
  switch (state.nodeId) {
    case 'n01': shots = MARKET; break;
    case 'n02': shots = ARREST; break;
    case 'n03': shots = MOTHER; break;
    case 'n04': shots = BREAD; break;
    case 'n06':
      if (state.edition === 'short') {
        shots = [...MOTHER, ...BREAD, ...HOME_WOUNDED].map(shot => ({ ...shot, location: `此前 · ${shot.location}` }));
      }
      break;
    case 'n07': shots = STREET; break;
    case 'n08': shots = CHECKPOINT; break;
    case 'n21': shots = state.storyRevision === 5 ? RELATIVE.map(shot => ({ ...shot, location: `此前 · ${shot.location}` })) : RELATIVE; break;
    case 'n25': shots = prisonShots(state); break;
  }
  return shots.map((shot, index) => ({ ...shot, id: `${state.nodeId}:${index + 1}:${shot.visual}` }));
}
