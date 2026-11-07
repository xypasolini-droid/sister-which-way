/** Frozen 0.5.0 content: authenticates and preserves already played revision-five saves. */
import type { BranchState, StoryChoice, StoryNode } from './branch-story';
import { getLegacyShortNode } from './legacy-short-story';

type Effect = NonNullable<StoryChoice['effect']>;
const has = (state: BranchState, flag: string) => state.flags.includes(flag);
const needs = (flag: string, reason: string) => ({ flag, reason });
function effect(original: StoryChoice, extra: Effect): Effect {
  return { ...original.effect, ...extra, stats: { ...original.effect?.stats, ...extra.stats }, add: [...new Set([...(original.effect?.add ?? []), ...(extra.add ?? [])])], remove: [...new Set([...(original.effect?.remove ?? []), ...(extra.remove ?? [])])] };
}
function edit(node: StoryNode, patches: Record<string, Partial<StoryChoice>>, content: Partial<Omit<StoryNode, 'choices'>> = {}): StoryNode {
  return { ...node, ...content, choices: node.choices.map(choice => ({ ...choice, ...patches[choice.id] })) };
}
const familyDeparture: Effect = {
  outfit: 'travel', sister: 'beside',
  add: ['caravan', 'documents', 'registered', 'escortConfirmed', 'boarded', 'familyTogether', 'motherReturned', 'marriageRefused', 'fateDeparture'],
  remove: ['missingSister', 'hiddenRisk', 'fateGuide', 'fateGuardian', 'fateCommons'],
};
const familyParts: Effect = {
  outfit: 'worker', sister: 'apart',
  add: ['familyDeparted', 'escortConfirmed', 'motherReturned', 'marriageRefused', 'heroStayed', 'friendTogether'],
  remove: ['boarded', 'familyTogether', 'missingSister', 'hiddenRisk'],
};
const guide: Effect = { ...familyParts, add: [...familyParts.add!, 'fateGuide'] };
const departText = '你先回到约定的私院。母亲已经带着姐姐和萨米拒绝贾维德的强迫，优素福本人也赶到了。他核对去向与家人，替母亲找好能坐低的地方。你们四人登上露天后斗货车，握住栏板；父亲仍被关着。莱拉托人说会与熟悉的同伴走另一条路，你们不能保证她也能离开。';
const guideText = '你先把母亲、姐姐和萨米送到优素福亲自接应的露天货车旁。街口传来莱拉被堵住的消息。你告诉姐姐：“我去接她。封关了就走，不要回头等我。”她反复确认你的话，紧握过你的手才上车。你折返把莱拉拉进侧巷；关卡随即封闭，车已不得不开走。母亲、姐姐与幼弟离了城，你与莱拉留在另一边，父亲仍未获救。';

/** Revision five: seven decisions, five fixed fates, no extra final-page click. */
export function getShortNode(original: StoryNode, state: BranchState): StoryNode {
  const node = getLegacyShortNode(original, state);
  const find = (id: string) => node.choices.find(choice => choice.id === id)!;
  if (node.id === 'n01') return edit(node, {
    work: { effect: effect(find('work'), { add: ['protectedSomeone'] }) },
    neighbor: { effect: effect(find('neighbor'), { add: ['recordPractice'] }) },
    mother: { effect: effect(find('mother'), { add: ['recordPractice'] }) },
  });
  if (node.id === 'n09') return edit(node, {
    courier: { effect: effect(find('courier'), { add: ['literacyPractice'] }) },
  });
  if (node.id === 'n10') return edit(node, {
    wage: {
      label: '挡到女工身前，和她一起退出作坊',
      detail: '老板伸手推她，你扶住她往门外退；自己今天的报酬也可能拿不到。',
      keywords: ['挡住', '保护', '女工', '一起退出', '离开作坊'],
      consequence: '老板伸手推搡不肯认账的女工。你挡到她身前，莱拉拉开门，三个人一起退进巷子。她稳住身体后让你别再回去争；你的活也没拿到报酬。你把遭遇照实告诉家人，母亲摊开那封寄给远亲的信：她已向优素福求接应，却还没收到回话。',
      effect: { stats: { coins: -1, trust: 1 }, add: ['protectedSomeone', 'workerProtected'] },
    },
    ledger: { effect: effect(find('ledger'), { add: ['recordPractice'] }) },
  }, { paragraphs: [`${node.paragraphs[0]}莱拉送完货回到后门，与你一起听见女工争辩。`, ...node.paragraphs.slice(1)] });
  if (node.id === 'n13') return edit(node, {
    listen: { effect: effect(find('listen'), { add: ['pact', 'listenedSister'] }) },
    secret: { effect: effect(find('secret'), { add: ['leftUnsaid'], remove: ['pact'] }) },
    care: { effect: effect(find('care'), { add: ['carePractice', 'protectedSomeone', 'pact'] }) },
  });
  if (node.id === 'n18') return edit(node, {
    plan: {
      label: '按姐妹约定去北门，争取救父',
      detail: has(state, 'pact') ? '姐姐知道回话的门和时限。先前教字的往来，会决定阿明是否肯冒险。' : '此前没把联络约好；今天要补接应，会错过救父的侧门机会。仍可以去核实，或回头与家人离城。',
      effect: { stats: { hope: 1, exposure: 1, food: -1 }, add: ['marriageOffer', 'sisterRefused', 'rescueRoute', 'relativePressure'], remove: ['caravan'] },
      consequence: `${has(state, 'pact') ? '姐姐复述了你们先前说好的门与时限。' : '你先托法里达把去向送给姐姐；之前没说清的话，现在需要多跑一趟，错过了侧门接应时段。'}母亲拒绝用婚事换路，已请亲弟优素福来接孩子。你去北门找阿明，莱拉留在市场收尾；封关的消息越来越急。`,
    },
    find: {
      label: '先与家人会合，争取最后一趟离城车',
      detail: '优素福刚传来接应消息。贾维德催人走，母亲必须先摆脱他的控制。',
    },
    rush: {
      label: '让家人先走，我与莱拉接应受困的女孩',
      detail: '向家人说明分别，留下找莱拉。你们不能同时赶车、去监所和接人。',
      consequence: '优素福亲自赶到私院，母亲拒绝贾维德的逼婚，决定带姐姐和萨米跟亲弟离城。你告诉她们自己要去找被堵住的莱拉：“封关了就走，不要等。”姐姐先与你确认这真是你的决定，再把手松开。你沿市场侧巷去找莱拉。家人的车已经出发，父亲仍在监所。',
      effect: { ...familyParts, add: [...familyParts.add!, 'stayRoute', 'relativePressure', 'sisterRefused'] },
    },
  }, {
    title: '最后一趟车，和北门的灯',
    paragraphs: [
      '母亲承认曾想用玛莉安的婚事求贾维德照应。姐姐说不，她终于收回这份没有得到女儿同意的许诺。亲弟优素福传来消息：最后一趟露天货车会在封关前接她们。贾维德却已提前上门逼人走。',
      `父亲仍在北门，莱拉仍在街上。${has(state, 'pact') ? '你和姐姐保留着早先说好的接应时限。' : '你还没有守住与姐姐的联络约定；临时补消息会耗掉北门的窗口。'}炮火不会等你把每个人都找齐。今天往哪边走，会让另一些人留在身后。`,
    ],
    sisterLine: '我不答应嫁过去。你要去哪里，现在告诉我；封关以前，我们得知道彼此会不会回来。',
  });
  if (node.id === 'n25') return edit(node, {
    release: {
      label: '守住侧门，把父亲接到木车上',
      requires: [needs('guardBond', '此前尚未建立读信、教字的往来，阿明不会因一次请求便冒险救人。'), needs('pact', '此前没有守住姐妹联络约定，补传消息已错过侧门接应时段。')],
      consequence: '阿明认出了你教过的字。炮火与调动声中，他负伤把父亲带出侧门，安置到借来的木推车上。父亲平日跛行，需要腋拐支撑，如今添了重伤，暂时不能自己撑拐行走。你握紧车把，朝先前与姐姐约定的门推去。母亲拒绝贾维德的强迫，已带萨米返回，姐姐也守在那里。',
      effect: effect(find('release'), { add: ['fateRescue', 'familyTogether', 'motherReturned', 'marriageRefused'] }),
    },
    letter: {
      label: '离开北门，赶回去与家人一起登车',
      detail: '放弃今天的救父机会，四人随优素福离城；父亲仍留在铁门后。',
      keywords: ['赶车', '家人', '离城', '舅舅', '上车'],
      consequence: departText,
      effect: familyDeparture,
    },
    leave: {
      label: '送家人上车，回头去接被堵住的莱拉',
      detail: '先明确告诉家人不要等。回头接她，可能让你再也赶不上这趟车。',
      keywords: ['莱拉', '回头', '接她', '折返', '留下'],
      consequence: guideText,
      effect: guide,
    },
  }, {
    paragraphs: [
      has(state, 'guardBond') ? '阿明认出你教过的字，指向炮火间歇时能打开的侧门。救人仍会让他冒险，也会耗尽离城的时间。' : '阿明仍收着妻子哈拉的信。他认得你，或愿意听你再念一次她的名字，却没有同你建立足以进门救人的往来。你不能靠一次求恳让侧门打开。',
      `${has(state, 'pact') ? '姐姐守着你们先前约好的门。' : '补送去向的脚步回来时，侧门已经换岗。'}送信人带来急话：母亲拒绝了贾维德，优素福已到；莱拉被堵在市场另一头。你仍能赶回家人的车，也能回头接她，却不能把两条路一起走。`,
    ],
  });
  if (node.id === 'n21') {
    const departure = edit(node, {
      register: { label: '握住姐姐的手，四个人一起上车', detail: '与母亲、姐姐、幼弟随优素福离城，父亲仍在监所。', requires: [], consequence: departText, effect: familyDeparture },
      child: { label: '先送家人上车，我回头接莱拉', detail: '告诉姐姐封关就走。把被堵住的莱拉接回来，可能赶不上这趟车。', requires: [], consequence: guideText, effect: guide },
    }, {
      title: '车在等，另一头有人叫你',
      paragraphs: [
        '母亲拿起灶边的木棍，逼贾维德退开：“我女儿没有答应！”她带姐姐和萨米回到私院，与你会合。优素福已经到场，确认过落脚处，不拿婚约作交换。',
        '露天货斗里有母亲和幼弟坐的位置。姐姐伸手拉你，送信人却跑来，说莱拉被截在市场侧巷。车得在封关前走。你若回头，家人不能留下来替你承担同一次危险。',
      ],
      sisterLine: '我想你跟我们走。可若你一定回头，先把话说清楚——我不会假装这不痛。',
    });
    return { ...departure, choices: departure.choices.filter(choice => choice.id !== 'search') };
  }
  if (node.id === 'n22') return edit(node, {
    send: {
      label: '牵住莱拉，带女孩们先穿过这条巷子',
      detail: '家人的车不再等你。你和莱拉留下相互接应，接着学会怎样带人过路。',
      requires: [], keywords: ['莱拉', '巷子', '带路', '女孩', '留下'],
      consequence: '你与莱拉把女孩们带到受邀请的里间，自己再退回侧巷找下一条路。优素福的车在封关前带母亲、姐姐和萨米离开；没有人答应你们何时重逢。你没有救出父亲，也没有赶上车，留下的两个人开始一起认路、一起活下去。',
      effect: guide,
    },
    father: {
      label: '挡在女孩身前，让莱拉带她们进门',
      finish: 'dream_guardian',
      detail: '成年童话分支：你曾真正保护过别人，此刻再承担护送，让火苗长成女性卫队首领。现实中的家人仍随舅舅离城，父亲未获救。',
      requires: [needs('protectedSomeone', '先前尚未选择保护别人：扶父亲退开、保护女工或分担姐姐的照护，会给这个守护之梦留下根。')],
      keywords: ['守护', '卫队', '山口', '挡住', '保护', '梦境'],
      consequence: '你挡住侧门，让莱拉先把两个女孩送进里间，再一起把门关上。母亲、姐姐和萨米已随优素福离城，父亲仍在监所。你们躲在门后续写火苗的故事：如果有一天不必再退开，长大的她会怎样守住这条路？故事把时间带到成年，没有替现实的人撤去伤和失散。',
      effect: { ...familyParts, add: [...familyParts.add!, 'fateGuardian', 'girlsProtected'] },
    },
    school: {
      label: '教女孩写下真名，让她们自己讲故事',
      finish: 'dream_commons',
      detail: '成年童话分支：先前教字、记录或共担照护的行动，成为女性学校、市场与议事庭的开端。现实家人的去向不被梦改变。',
      requires: canBuildCommons(state) ? [] : [needs('commonsPractice', '先前尚未参与教字、留下获准记录或分担照护；先让建设的愿望有真实行动作根。')],
      keywords: ['名字', '学校', '自治', '教字', '梦境', '共同'],
      consequence: '你和莱拉先把女孩们安顿进受邀请的里间，听她们说出自己的名字，再陪不会写字的孩子画第一笔。母亲、姐姐和萨米已随优素福离城，父亲仍在监所。你续写火苗和许多人一起建城的故事，把学校、市场与议事的长桌放进成年之梦；梦没有让现实家人突然团聚。',
      effect: { ...familyParts, add: [...familyParts.add!, 'fateCommons', 'namesShared'] },
    },
  }, {
    title: '两个女孩，和一扇还开着的门',
    paragraphs: [
      '你找到莱拉时，她正护着两个被巡查赶离街口的女孩。法里达让侧门开了一线，屋里只能暂时藏身。你们得先把人带进去。',
      '母亲、姐姐和萨米跟优素福的车离城，父亲仍被囚。你们可以继续学着接应眼前的人，也能把已经做过的保护、教字和照护写进童话，看看成年后的自己能够成为什么人。两种成年结局会明确留在梦境里。',
    ],
    sisterLine: '你记着临别时姐姐的话：“你还得活着。帮别人时，也把自己的手牵好。”',
  });
  if (node.id === 'n30') {
    const live = find('live');
    const fate = getShortFate(state);
    const closes: Record<string, Pick<StoryChoice, 'label' | 'detail' | 'consequence'> & { scene: StoryNode['scene']; finish: StoryChoice['finish'] }> = {
      reunited: { scene: 'road', finish: 'road', label: '推起木车，带父亲回约定的门', detail: '父亲在车上，母亲、姐姐和幼弟守着你们早先约好的门。', consequence: '你推着父亲的木车穿过夜路。姐姐跑来握住另一边车把，母亲牵着萨米让开门槛。父亲两条腿完整，旧跛行之外添了重伤，腋拐收在车边；这一夜五个人重新聚到了一起，伤与战争仍需要共同承受。' },
      caravan: { scene: 'road', finish: 'road', label: '拉住姐姐的手，在露天货斗里坐稳', detail: '四个人随优素福离城。你没有救回父亲，也没有拿姐姐的婚事换路。', consequence: '姐姐把你拉到母亲身旁，萨米伏在她膝边。你扶住露天货斗的栏板，跟着优素福的车越过最后一个关口。父亲仍被囚禁；你与母亲、姐姐和幼弟离开了城，开始承担没有他同行的新生活。' },
      lantern: { scene: 'road', finish: 'road', label: '握住莱拉的手，带她穿过封锁', detail: '家人的车已经离开。此后的路由你们相互接应；这段成长是游戏原创延展。', consequence: '你拉着莱拉穿过侧巷，关卡在身后落下。几年后，你们已长成能辨认山路与巡查动向的年轻女人：她守住队尾，你把一个快滑下石阶的女孩拉到身旁。母亲、姐姐和萨米离了城，父亲未能救出；家人没有被安排在山口等你。你无法带回所有人，却成了能带别人过路的人。' },
      dream_guardian: { scene: 'courtyard', finish: 'dream_guardian', label: '站到女孩身前，守住梦里的山口', detail: '此刻进入明确的成年童话，现实中的父亲、伤势和分别保持原状。', consequence: '门后的小火苗在故事里长大。成年后的你发出手势，女性卫队在山口展开；女孩从你们身后走向学校。这是有意偏离现实的愿望，父亲仍未在现实获救，母亲、姐姐与幼弟也没有因梦重返你身旁。' },
      dream_commons: { scene: 'courtyard', finish: 'dream_commons', label: '推开梦里的校门，让她们写下真名', detail: '此刻进入明确的成年童话：学校、买卖与公共决定由女性共同掌握。', consequence: '成年之梦展开：姐姐打开校门，莱拉经营自己的铺子，你把议事的位置让给提出异议的女人。女孩当街写下真名。现实里父亲仍被囚，母亲、姐姐与幼弟随舅舅离城，梦没有为这场分别编造已经发生的重逢。' },
    };
    const close = closes[fate];
    return { ...node, title: fate.startsWith('dream_') ? '火苗长大的那一页' : '这一次，握住谁的手', scene: close.scene, paragraphs: [state.history.at(-1)?.consequence ?? close.detail, close.detail], sisterLine: fate === 'lantern' || fate.startsWith('dream_') ? '姐姐已随车离开。这一幕，她的手没有从别处伸过来。' : node.sisterLine,
      choices: [{ ...live, ...close, next: 'n30', keywords: ['继续', '走', '握住', '推车', '上车', '守住', '校门'], requires: [], effect: fate === 'lantern' ? { add: ['guideGrown'] } : {} }],
    };
  }
  return node;
}
export function canBuildCommons(state: BranchState): boolean {
  return ['literacyPractice', 'recordPractice', 'carePractice'].some(flag => has(state, flag));
}
export function getShortFate(state: BranchState): 'reunited' | 'caravan' | 'lantern' | 'dream_guardian' | 'dream_commons' {
  if (has(state, 'fateRescue')) return 'reunited';
  if (has(state, 'fateDeparture')) return 'caravan';
  if (has(state, 'fateGuardian')) return 'dream_guardian';
  if (has(state, 'fateCommons')) return 'dream_commons';
  return 'lantern';
}
