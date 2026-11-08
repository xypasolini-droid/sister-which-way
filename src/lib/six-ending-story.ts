import type { BranchState, StoryChoice, StoryNode } from './branch-story';

/** The user's 0.6.0 tree. Four forks, nine actions, six independent fates. */
export const SIX_ENDING_IDS = ['no_smoke', 'sister_married', 'conscripted', 'family_escape', 'unwaking_spring', 'guardian_future'] as const;
export type SixEndingId = typeof SIX_ENDING_IDS[number];
const action = (id: string, label: string, detail: string, next: string, consequence: string, effect: StoryChoice['effect'] = {}, finish?: SixEndingId): StoryChoice => ({ id, label, detail, next, consequence, effect, finish, keywords: [], hint: '', requires: [] });

export const SIX_NODES: Record<string, StoryNode> = {
  'v6-opening': {
    id: 'v6-opening', title: '最后一点粮食', chapter: '剪刀还没有落下', act: 1, day: 1, scene: 'home',
    paragraphs: [
      '姐姐把最后一点粮食倒进碗里，指尖沿着袋底刮了两次。父亲是当着全家人的面被抓走的；从那以后，家里没有了收入。母亲抱着萨米坐在床边，谁也没有说他只是暂时出门。',
      '你已经试过独自去买食物，带着女孩的面孔，却连付钱都不被允许。母亲也不能自由出门。哥哥阿里留下的长衫、宽裤和小帽被取出衣箱，放在你的发辫旁。',
      '玛莉安握着剪刀，等你回答。她没有催你。你望着自己的头发，又望向碗里只够分几口的饭。借一个男孩的名字出门，或留在这里继续找人帮忙，两条路都没有保证。',
    ],
    sisterLine: '努拉，我会陪着你。剪刀放下也好，拿起来也好，你先告诉我。',
    tale: '萨米还记得那个被象王夺走种子的村庄。没有种子，下一年的春天也无法播种。故事先停在这里，姐姐正等你的回答。',
    choices: [
      action('stay_long', '放下剪刀', '保留头发，先托人买粮、赊账，再向亲戚求助。', 'v6-marriage', '你把剪刀轻轻推回姐姐身边。接下来的日子，母亲托人买粮、试着赊账，你们卖掉家当，挨个向熟人求援。有人自己也已断粮，有人不敢再带话，送出去的请求接连落空。粮袋空了，一名亲戚带来婚事：只要玛莉安出嫁，对方就愿意接济口粮、安排住处。', { add: ['hairKept', 'aidFailed', 'marriageOffer'] }),
      action('cut_hair', '剪掉头发', '穿哥哥的旧衣，借一个男孩的名字出门谋生。', 'v6-war', '姐姐剪下第一束头发，最后几下你自己握住剪刀。你穿上亡兄的长衫、宽裤和小帽，借男孩的身份走出门。旧同学莱拉认出了你，她也以男孩的身份养家。你在街上叫阿提什——火焰。两人一起跑腿做工，挨骂、被推搡、被克扣工钱，终于挣回一点饼。直到爆炸传来，商铺落闸，街上开始挤满逃离的人。', { outfit: 'worker', add: ['disguise', 'aliasAatish', 'friendMet', 'bread', 'warApproaching'] }),
    ],
  },
  'v6-marriage': {
    id: 'v6-marriage', title: '用姐姐换来的口粮', chapter: '门外的条件', act: 2, day: 2, scene: 'home',
    paragraphs: [
      '托买的粮没能送到，赊账被拒，能卖的东西已经卖尽。母亲一次次听完门外的拒绝，再回到萨米身旁。饥饿没有因为大家彼此相爱而停下来。',
      '亲戚提出让姐姐出嫁，说以后会有口粮和住处。玛莉安握紧自己的衣角。她不愿意，可家人看着空碗，已经没有力气再说还能等多久。',
      '这不是一桩从容商量的婚事。你可以和家人拒绝，继续等待仍未到来的援助；也可以加入家人的恳求，让姐姐承担活下去的代价。',
    ],
    sisterLine: '要是我走了，你们就会有饭吗？……那我呢？',
    tale: '故事里的种子能让整片田地重新长出来。现实中，姐姐不是粮袋，也没有谁能替她承受嫁出家门以后的日子。',
    choices: [
      action('refuse', '拒绝婚事，继续等待援助', '不让姐姐出嫁；家里的粮已经耗尽。', 'v6-end', '你们拒绝了婚事，继续敲门、托话，却没有等来足够的粮。家当卖尽以后，饥饿拖得越来越久。萨米不再追问晚饭，母亲的声音也渐渐低下去。留在家中的母亲、姐姐、女主和幼弟相继饿死，屋顶再没有升起炊烟。父亲仍被关着，没有回到这个房间。', { add: ['marriageRefused', 'familyStarved'], stats: { food: -3, health: -5 } }, 'no_smoke'),
      action('accept', '和家人一起，恳求姐姐答应', '亲戚承诺口粮和住处，姐姐将在压力下出嫁。', 'v6-end', '家人一次次恳求，玛莉安终于点头。她是在生存压力下接受婚事，不是忽然愿意离开你们。出嫁那天，她把萨米抱了很久，又把你额前的头发理好。粮食送来了，母亲、你和幼弟活下来，饭桌却少了姐姐的位置；父亲也没有归来。', { sister: 'apart', add: ['sisterMarried', 'foodByMarriage'], stats: { food: 2 } }, 'sister_married'),
    ],
  },
  'v6-war': {
    id: 'v6-war', title: '人潮把街口推开', chapter: '城门将要关闭', act: 3, day: 3, scene: 'market',
    paragraphs: [
      '你和莱拉刚分好挣来的饼。搬货的雇主少给工钱，又把你们赶离门口。男孩的衣服只让别人愿意雇你，并没有让你们免于羞辱。你还没把饼送回去，远处就传来爆炸。',
      '商铺落下门板，军车穿过街道，人群往城门挤。你和莱拉还拉着手，逃离的人不断挤进你们之间，手指几乎要被冲开。',
      '母亲、姐姐和萨米仍在家中。舅舅先前传话说能开露天货车接应，关路后便不能折返。你可以先赶回家，也可以握紧莱拉随人潮出城；如果人群把你们冲散，你是否会回头找她？',
    ],
    sisterLine: '你记着姐姐出门前的话：“要是乱起来，先告诉我们你在哪里。”',
    tale: '那个取回种子的少年也曾在路口犹豫。故事里的山看得见尽头，眼前这条街却被尘土遮住，谁也不知道封锁何时落下。',
    choices: [
      action('home', '先回家，找母亲和姐弟', '带她们赶舅舅接应的露天货车。', 'v6-end', '你逆着人潮赶回家，催大家带上能拿的东西。母亲抱起萨米，姐姐握着你的手，四个人在道路封锁前登上舅舅的露天货斗。你扶住木栏板，等车驶出关口才敢回头。父亲仍被关押；莱拉没有与你们同车，她的去向不明。', { outfit: 'travel', sister: 'beside', add: ['familyEscaped', 'boarded', 'familyTogether'] }, 'family_escape'),
      action('flee', '拉住莱拉，跟着人群出城', '握紧她的手，一起往城门挤。', 'v6-end', '你没有松开莱拉的手，两人一起赶到城门，道路却已经被封。武装人员从人群里扣下少年，看到你们的短发和小帽，也把两人当作男孩带走。你们被迫搬运、传令，离家越来越远。没有机会脱身，最后被送向前线，卷进战斗。', { sister: 'apart', add: ['conscripted', 'friendTogether', 'familyWhereaboutsUnknown'] }, 'conscripted'),
      action('friend', '回头找被人群冲散的莱拉', '逆着人流，回到封锁的街口。', 'v6-voices', '人潮彻底冲开你和莱拉的手。你转回封锁街口找到她，想带她从墙边穿过去，却遇见抓走父亲的年轻巡查。他认出你的脸，把你的小帽打落，揭穿女孩身份。棍子落下，你护住头，听见莱拉喊你的名字；随后声音远了，眼前变成故事里的山。你还没有得知家人是否离城。', { scarf: 'lost', sister: 'apart', add: ['friendFound', 'identityExposed', 'heroUnconscious', 'familyWhereaboutsUnknown'], stats: { health: -2 } }),
    ],
  },
  'v6-voices': {
    id: 'v6-voices', title: '两个声音同时响起', chapter: '种子与回声', act: 4, day: 3, scene: 'courtyard',
    paragraphs: [
      '梦中，你成为少年苏莱曼，走进被象王夺去种子的村庄。你向山里出发，被黑影追赶，跌倒受伤，又在别人伸手帮助后继续前行。你不再只是等人回来带饭的孩子。',
      '面对巨大的象王，你想起亡兄阿里。阿里年轻的脸仿佛就在眼前，留在家中的小萨米却还需要人抱。你把恐惧说出来，种子在手中留下了一点温度。',
      '家人的声音从春天的村庄传来，父亲叫你回家；另一边，莱拉在叫你醒来。两个声音都越来越近。梦中的家没有饥饿，也没有人逼姐姐出嫁。现实里的你仍躺着，没有得到家人的消息。',
    ],
    sisterLine: '梦里，姐姐说：“饭好了，努拉。”远处莱拉仍喊着你的名字。',
    tale: '种子可以在故事里一夜发芽，可醒来以后，伤仍需要别人照顾。你站在两个声音之间，必须选择跟随哪一个。',
    choices: [
      action('dream', '走向梦里的家人', '沿着熟悉的声音，回到春天的饭桌。', 'v6-end', '你把种子交还村庄，田野迎来丰收。父亲撑着木腋拐走进家门，双腿完整；姐姐没有出嫁，幼弟萨米笑着分饼，已经去世的哥哥阿里也坐在饭桌旁。你终于坐下，再也不必决定谁该少吃一口。你一直活在这个梦中，现实中的你始终没有醒来。现实中，家人下落仍未知。', { add: ['unwakingDream'], remove: ['familyEscaped', 'boarded', 'familyTogether'] }, 'unwaking_spring'),
      action('wake', '回应莱拉：“我要活下去。”', '离开梦中的饭桌，试着睁开眼睛。', 'v6-end', '你循着莱拉的呼喊慢慢醒来。她与愿意伸手的女性同伴把你带离街口，照料伤势，再和你一起逃离混乱的城。此后许多年，你们收留逃来的人，学习自卫、识字与互相接应；保护不再只靠某个人硬撑。成年后，你成为一方女性护卫队长，守住妇女与孩子可以落脚的地方。多年过去，你仍不知道家人的下落，父亲的名字一直留在你的心里。', { add: ['wokeWithLayla', 'womenMutualAid', 'adultGuardian'], remove: ['heroUnconscious', 'familyEscaped', 'boarded', 'familyTogether'] }, 'guardian_future'),
    ],
  },
  'v6-end': { id: 'v6-end', title: '这一程的尽头', chapter: '留下的命运', act: 4, day: 3, scene: 'home', paragraphs: ['这一次的行动已经落定。', '演出会带你走完它留下的后果。'], sisterLine: '', tale: '', choices: [] },
};

export function createSixState(): BranchState {
  return { version: 3, edition: 'short', storyRevision: 6, storyContentRevision: 7, nodeId: 'v6-opening', stats: { food: 1, coins: 0, trust: 5, hope: 3, exposure: 1, health: 5 }, flags: ['book', 'ribbon', 'fatherArrested'], outfit: 'cloak', scarf: 'worn', sister: 'beside', father: 'missing', endingId: null, history: [] };
}

export function getSixNode(state: BranchState): StoryNode {
  const original = SIX_NODES[state.nodeId];
  if (!original) throw new Error(`Unknown six-ending node: ${state.nodeId}`);
  return { ...original, paragraphs: [...original.paragraphs], choices: original.choices.map(choice => ({
    ...choice, keywords: [...choice.keywords], requires: choice.requires?.map(requirement => ({ ...requirement })),
    effect: choice.effect ? { ...choice.effect,
      ...(choice.effect.stats ? { stats: { ...choice.effect.stats } } : {}),
      ...(choice.effect.add ? { add: [...choice.effect.add] } : {}),
      ...(choice.effect.remove ? { remove: [...choice.effect.remove] } : {}),
    } : undefined,
  })) };
}

export const SIX_ENDING_ROUTES: Record<SixEndingId, string[]> = {
  no_smoke: ['stay_long', 'refuse'], sister_married: ['stay_long', 'accept'],
  conscripted: ['cut_hair', 'flee'], family_escape: ['cut_hair', 'home'],
  unwaking_spring: ['cut_hair', 'friend', 'dream'], guardian_future: ['cut_hair', 'friend', 'wake'],
};
