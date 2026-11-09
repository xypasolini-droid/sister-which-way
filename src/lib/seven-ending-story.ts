import type { BranchState, StoryChoice, StoryNode } from './branch-story';

export const SEVEN_ENDING_IDS = [
  'doors_stay_closed',
  'grain_without_her',
  'two_borrowed_boys',
  'four_in_the_back',
  'spring_without_waking',
  'one_lantern_many_hands',
] as const;

export type SevenEndingId = typeof SEVEN_ENDING_IDS[number];

function action(
  id: string,
  label: string,
  detail: string,
  qualities: NonNullable<StoryChoice['qualities']>,
  next: string,
  consequence: string,
  effect: StoryChoice['effect'],
  finish?: SevenEndingId,
): StoryChoice {
  return { id, label, detail, qualities, next, consequence, effect, finish, keywords: [], hint: '', requires: [] };
}

export const SEVEN_NODES: Record<string, StoryNode> = {
  'v7-opening': {
    id: 'v7-opening',
    title: '最后一点粮食',
    chapter: '伸手之前',
    act: 1,
    day: 1,
    scene: 'home',
    paragraphs: [
      '父亲在全家眼前被巡查带走。母亲知道他关在哪里，却没能见到他。你试着以女孩的身份去买粮，带出去的钱也没能换回食物。现在粮袋一倒，刚够盖住碗底。',
      '玛莉安从衣箱里拿出亡兄阿里的长衫、宽裤和小帽，把剪刀放在两人之间。萨米盯着那点粮，你听见门下的纸擦过地毯。',
      '纸上是莱拉的字。她约你在水井边见，说她在外面也用男孩的名字。你知道哪里可能找到活，也记得几户曾同父亲往来的人家。时间只够你先做一件事。',
    ],
    sisterLine: '父亲被带走后，家里只剩一点粮。姐姐放下剪刀，莱拉捎来字条约你去水井。你先做什么？',
    tale: '萨米记得那个被象王夺走种子的村庄。他问，这么小一把种子，该先给谁？你伸手把纸从门缝里捡起来。',
    choices: [
      action('keep_bowl', '合上剪刀，先把粮让给萨米', '留下发辫，把能敲的门排成顺序。', ['善良', '智慧'], 'v7-home',
        '你合上剪刀，把自己那份粮倒进萨米的碗里。姐姐把剪刀收回衣箱。你在纸背写下人名、住处和先去的那扇门，同家人把托人带粮、赊账、变卖家当一项项试过去。送粮的路接连断了，最后一位来访的亲戚开口谈婚事。',
        { add: ['hairKept', 'sharedGrain', 'keptAidList', 'aidFailed', 'marriageOffer'] }),
      action('take_bread', '自己剪发，去市场挣今天的饼', '穿阿里的旧衣，和姐姐定好回家报平安的暗号。', ['勇敢', '智慧'], 'v7-market',
        '你拿起剪刀，自己剪断发辫。玛莉安扶镜、收好发辫，再把阿里的衣服递给你。你约她听见两短一长的敲门声再开门，戴上小帽，用阿提什的名字到市场找活。你问清一趟给多少，同莱拉记下每次搬货，分一张饼。爆炸从街那头传来时，另一半还在你怀里。',
        { outfit: 'worker', add: ['selfCut', 'disguise', 'aliasAatish', 'homeSignal', 'friendMet', 'checkedWages', 'bread', 'warApproaching'] }),
      action('answer_note', '自己剪发，先到水井赴约', '按字条接莱拉，约好走散时到哪儿找对方。', ['善良', '智慧'], 'v7-street',
        '你拿起剪刀，自己剪短头发，换上阿里的旧衣。你按莱拉的字条到水井边，和她约好走散就回井边那面低墙。军车驶来，人流挤开了你们。你照约定逆着人流回去找到她。抓过父亲的巡查认出你，举起棍子；你护住头，倒在低墙边。在黑暗里，你把苏莱曼的故事一句句接下去。',
        { outfit: 'worker', scarf: 'lost', sister: 'apart', add: ['selfCut', 'disguise', 'aliasAatish', 'answeredNote', 'wellPact', 'friendFound', 'identityExposed', 'heroUnconscious', 'familyWhereaboutsUnknown'] }),
    ],
  },
  'v7-home': {
    id: 'v7-home',
    title: '门只肯开一次',
    chapter: '名字写在纸背',
    act: 2,
    day: 2,
    scene: 'home',
    paragraphs: [
      '你把自己的粮匀给萨米，再翻过一张旧纸写人名。附近的门先问，远一点的托人带话。卖掉水壶之后，连愿意赊粮的店家也关了门。',
      '一名亲戚站到门槛前，说家里可以送口粮、腾住处，条件是玛莉安嫁过去。你把这两条写在纸上。玛莉安坐在地毯边，手始终压着自己的衣角。',
      '你抬起头，来人的脚已经迈过门槛。你可以挡住他，继续找纸上没划掉的那个人；也可以请他先到门外，让姐姐有机会把话说完。',
    ],
    sisterLine: '你们没借到粮。来人说，姐姐嫁过去，他才给粮和住处。姐姐刚想开口。',
    tale: '纸上写得下十扇门。萨米趴在你膝上，用指头沿着还没划去的名字数，数到最后一个就停了。',
    choices: [
      action('close_door', '挡在门前，接着敲剩下的门', '挡回婚事条件，把仍可能帮忙的名字一个个记下。', ['勇敢', '智慧'], 'v7-end',
        '你站到门槛前，请来人收回条件，再按纸上记下的名字敲门。存粮耗尽，通往城里的路封死，援助一直没送到。冷灶旁，四只碗一只只空下来。母亲、玛莉安、你和萨米相继死于饥饿。父亲仍被关押。',
        { add: ['blockedMarriageBargain', 'checkedRemainingDoors', 'familyStarved'] }, 'doors_stay_closed'),
      action('let_sister_speak', '请来人退到门外，让姐姐开口', '把决定交还姐姐，逐条记下口粮和住处的许诺。', ['善良', '智慧'], 'v7-end',
        '你请来人退到门外，把说话的位置留给玛莉安。她一条一条问清楚，要求先把粮送来。到了约定那天，她收好衣服，向萨米道别。你在纸上勾掉已经送到的口粮，再抬头看时，粮袋压在旧书的位置，姐姐的碗还空在那里。她的决定是在一家人缺粮、住房无着的压力下做出的。',
        { sister: 'apart', add: ['sisterSpoke', 'promisesRecorded', 'sisterMarried', 'foodByMarriage'] }, 'grain_without_her'),
    ],
  },
  'v7-market': {
    id: 'v7-market',
    title: '封城前，我往哪走？',
    chapter: '还没送到的半张饼',
    act: 2,
    day: 1,
    scene: 'market',
    paragraphs: [
      '你用阿提什的名字在市场问活。掌柜答应按趟付钱，交工时却把最后两趟从账上划掉。你记下数目，把收到的钱买成一张饼，留半张回家。',
      '震响从街那头掀起灰尘，店主一扇扇放下门板。你先看见军车占住大路，又看见侧街的人涌向城门。莱拉在你身旁，抓着自己的小帽。',
      '你记着回家的三个转角，也记着舅舅接应的露天货车在后巷。现在转向城门，你可以拉住莱拉一起走；若转回家，封街之前还有时间带出母亲和姐弟。',
    ],
    sisterLine: '军车堵住大路，莱拉还在你身边。你可以和她往城门走，也可以赶在封街前回去接家人。',
    tale: '你沿墙记过三样东西：白墙、破旗、低门槛。尘土越来越重，你在心里把顺序再念了一遍。',
    choices: [
      action('hold_layla', '看清封路方向，拉住莱拉一起走', '盯住军车的空隙，牵紧她往侧街去。', ['智慧', '善良'], 'v7-end',
        '你看清军车的方向，拉住莱拉奔向侧街。关口的木栏已经落下，武装者从队伍里扣下被当作男孩的孩子。两顶小帽挤落在地。你和莱拉被征去搬物资、传口令，离家越来越远。没有人问你们原本叫什么，那半张饼始终没送到家。',
        { sister: 'apart', add: ['readBlockade', 'heldLayla', 'conscripted', 'friendTogether', 'familyWhereaboutsUnknown'] }, 'two_borrowed_boys'),
      action('run_home', '数清路口，逆着人流回家接人', '沿白墙、破旗、低门槛回去，带家人去接应的货车。', ['勇敢', '智慧'], 'v7-end',
        '你把三个转角倒着数，逆人流回家，照约定敲门。你扶起母亲、叫上姐姐和萨米，从后巷赶到舅舅的露天货车，把三个人一个个扶进货斗。你最后翻上木栏，开车前重新数出四个人。父亲仍被关押；莱拉去向不明。',
        { outfit: 'travel', sister: 'beside', add: ['countedCrossroads', 'familyEscaped', 'boarded', 'familyTogether'] }, 'four_in_the_back'),
    ],
  },
  'v7-street': {
    id: 'v7-street',
    title: '两个声音，我回应谁？',
    chapter: '井边低墙，梦里山口',
    act: 2,
    day: 1,
    scene: 'courtyard',
    paragraphs: [
      '你按字条走到水井。莱拉戴着一顶浅帽，同你约定走散就去低墙。盘查的人来了又走，爆炸后人群翻涌，你看不见她的衣角。你记着约定往回跑，终于在低墙边抓到她的袖口。',
      '巡查认出你，把手伸向棍子。你举起手臂护住头。莱拉在低墙后叫你，声音渐渐沉了下去。你在昏迷中把苏莱曼的故事接了下去。',
      '苏莱曼拿着拾回的几颗种子走向山口，跌伤了膝，坐下来让路上的人包扎，再一步步走到象王面前。他怕得站不稳，仍伸手拾起象王脚边的布袋。你在梦里想起亡兄阿里。家人叫你吃饭，井边的莱拉叫你睁眼。',
    ],
    sisterLine: '你在井边受伤昏迷。梦里的哥哥阿里叫你回家，井边的莱拉叫你睁眼。你回应谁？',
    tale: '苏莱曼是故事里背种子的少年。阿里是你已经去世的哥哥。梦里你还记得抱在母亲怀里、等你回家的幼弟萨米。',
    choices: [
      action('follow_spring', '把种子交还村庄，走向梦里饭桌', '把故事讲到春天，再坐到家人身边。', ['善良', '勇敢'], 'v7-end',
        '你把种子交还村人，看见春天沿田垄一行行长起来。你走向饭桌，父亲双腿完整，撑着木腋拐跛行回来；阿里把一块饼留给年幼的萨米，姐姐在自己的位置坐下。梦仍在继续。井边的伤使你的身体始终没有醒来，现实家人的去向仍未知。',
        { add: ['returnedSeeds', 'unwakingDream'] }, 'spring_without_waking'),
      action('answer_layla', '攥住莱拉的手，忍着疼睁眼', '循她叫你的名字，先让她知道你听见了。', ['勇敢'], 'v7-end',
        '你摸到莱拉的手，攥了一下，费力睁开眼。莱拉请井边的女人过来，一起包住伤处，把你扶进遮蔽处。伤势稳定后，你们一起离城。多年后，你与莱拉和其他女性在一处院里开门、教字、照料伤者、轮值守望。你们交接的那盏灯每天都有人接。现实中母亲、姐姐和萨米的去向仍未知，父亲仍无出狱消息。',
        { add: ['wokeWithLayla', 'escapedWithLayla', 'womenMutualAid', 'sharedWatch'], remove: ['heroUnconscious'] }, 'one_lantern_many_hands'),
    ],
  },
  'v7-end': {
    id: 'v7-end',
    title: '这一程的尽头',
    chapter: '门后还有人',
    act: 3,
    day: 2,
    scene: 'home',
    paragraphs: ['灯光落在你走过的路上。'],
    sisterLine: '',
    tale: '',
    choices: [],
  },
};

export function createSevenState(): BranchState {
  return {
    version: 3,
    edition: 'short',
    storyRevision: 7,
    storyContentRevision: 8,
    nodeId: 'v7-opening',
    stats: { food: 1, coins: 0, trust: 5, hope: 3, exposure: 1, health: 5 },
    flags: ['book', 'ribbon', 'fatherArrested', 'laylaNote'],
    outfit: 'cloak',
    scarf: 'worn',
    sister: 'beside',
    father: 'missing',
    endingId: null,
    history: [],
  };
}

export function getSevenNode(state: BranchState): StoryNode {
  const node = SEVEN_NODES[state.nodeId];
  if (!node) throw new Error(`Unknown seven-ending node: ${state.nodeId}`);

  return {
    ...node,
    paragraphs: [...node.paragraphs],
    choices: node.choices.map(choice => ({
      ...choice,
      keywords: [...choice.keywords],
      qualities: choice.qualities && [...choice.qualities],
      requires: choice.requires?.map(requirement => ({ ...requirement })),
      effect: choice.effect && {
        ...choice.effect,
        ...(choice.effect.stats && { stats: { ...choice.effect.stats } }),
        ...(choice.effect.add && { add: [...choice.effect.add] }),
        ...(choice.effect.remove && { remove: [...choice.effect.remove] }),
      },
    })),
  };
}

export const SEVEN_ENDING_ROUTES: Record<SevenEndingId, [string, string]> = {
  doors_stay_closed: ['keep_bowl', 'close_door'],
  grain_without_her: ['keep_bowl', 'let_sister_speak'],
  two_borrowed_boys: ['take_bread', 'hold_layla'],
  four_in_the_back: ['take_bread', 'run_home'],
  spring_without_waking: ['answer_note', 'follow_spring'],
  one_lantern_many_hands: ['answer_note', 'answer_layla'],
};
