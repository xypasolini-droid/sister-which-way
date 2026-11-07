import type { BranchState, StoryChoice, StoryNode } from './branch-story';

type Effect = NonNullable<StoryChoice['effect']>;
type ChoicePatch = Partial<StoryChoice>;
const has = (state: BranchState, flag: string) => state.flags.includes(flag);
const need = (stat: 'coins' | 'health' | 'food', min: number, reason: string) => ({ stat, min, reason });

function edit(node: StoryNode, patches: Record<string, ChoicePatch>, content: Partial<Omit<StoryNode, 'choices'>> = {}): StoryNode {
  return { ...node, ...content, choices: node.choices.map(choice => ({ ...choice, ...patches[choice.id] })) };
}
function addEffect(choice: StoryChoice, extra: Effect): Effect {
  return {
    ...choice.effect,
    ...extra,
    stats: { ...choice.effect?.stats, ...extra.stats },
    add: [...new Set([...(choice.effect?.add ?? []), ...(extra.add ?? [])])],
    remove: [...new Set([...(choice.effect?.remove ?? []), ...(extra.remove ?? [])])],
  };
}

/** Eight authored decisions. Called by getNode only for the short edition. */
export function getShortNode(node: StoryNode, state: BranchState): StoryNode {
  if (node.id === 'n30') return node;
  if (node.id === 'n01') return edit(node, { work: { label: '拉住父亲，先离开这里' } });

  if (node.id === 'n02') {
    const patches: Record<string, ChoicePatch> = {};
    for (const choice of node.choices) patches[choice.id] = {
      next: 'n06',
      detail: `${choice.detail}接下来几日的遭遇会以过场推进。`,
      consequence: `${choice.id === 'sew' ? '你先和姐姐写好回家的约定，再陪母亲出门。' : '你陪母亲去拘留院要求放人，姐姐留家照看萨米。'}街口巡查指责母女没有成年男性亲属陪同，母亲的话没说完，棍子已落下来。你扶她回家养伤，随后独自买饼，却被推回零钱、追赶着空手归来。萨米问有钱为什么没有饭，你答不上来，只陪他讲完火苗守住名字的故事。姐姐打开亡兄的衣箱，把剪刀放在你面前。`,
      effect: addEffect(choice, { father: 'missing', stats: { ...choice.effect?.stats, health: -2, food: -1 }, add: ['motherSearch', 'motherHurt', 'brotherStory', 'book'] }),
    };
    return edit(node, patches);
  }

  if (node.id === 'n06') return edit(node, {
    buy: { label: '告诉姐姐我害怕，请她陪我开始', detail: '先说出害怕，让姐姐陪你完成剪发与换装，再约好回家的时间。', keywords: [...node.choices[0].keywords, '害怕', '陪我', '告诉姐姐'] },
    help: { label: '我也害怕，但想自己迈出这一步', detail: '姐姐留在身旁，你接过剪刀，亲手留下属于自己的决定。', keywords: [...node.choices[1].keywords, '迈出', '亲手', '自己开始'] },
  }, {
    paragraphs: [
      '这几天，母亲带你要求释放父亲，被巡查以没有成年男性亲属陪同为由殴打；她回家养伤。你偷偷买饼，被拒绝、追赶，带着仍未花掉的钱空手回家。萨米听完火苗的故事，还是饿。',
      '姐姐打开亡兄阿里的衣箱。灰白长衫、宽裤和朴素小帽压在最下面。穿成男孩或许能接过一枚钱，却不能让饥饿、武器和战争消失。她把剪刀放低，等你决定怎样开始。',
    ],
    sisterLine: '我们借阿里的衣服，不把你变成阿里。回来以后，我还是叫你努拉。',
  });

  if (node.id === 'n07') return edit(node, {
    truth: {
      next: 'n09',
      consequence: '莱拉与你核对工钱，一起跑腿，挣到两人的饭。你把自己的饼送回家，再到摊位读信。阿明捏着一封信等在那里；你认出他曾站在抓走父亲的人身旁，脚先退了半步。',
    },
    hide: { next: 'n10' },
    pact: {
      label: '先回家，和姐姐商量下一步',
      detail: '把自己的饼带回去，告诉姐姐莱拉的帮助，以及在街上使用的新名字。',
      keywords: ['回家', '姐姐', '商量', '饼', '约定'],
      next: 'n13',
      consequence: '莱拉带你认过愿意开后门的熟人，再去照顾她自己的家。你把饼带回去，告诉姐姐在外面叫阿提什——火焰。她没有因你能挣钱便放心，先问下次要去哪儿、几点回来。',
    },
  });

  if (node.id === 'n09') return edit(node, {
    verify: {
      next: 'n18',
      consequence: '你替阿明读完信，把父亲的名字写给他。阿明对照轮值纸，确认父亲仍在北门拘留院，却没有答应让你探视。你回家报信；已经知道关在哪里，和能够把人带回家，仍隔着一道铁门。',
    },
    courier: {
      next: 'n18',
      consequence: '接下来的几次送货，你替阿明读信，也教他把信上的几个字写下来。他逐渐认出你的字，记下父亲的名字。阿齐兹愿意递消息，你保留可核对的记录，再回家商量；往来依赖具体的人愿意冒险，没有换来放人的保证。',
    },
    sister: {
      next: 'n18',
      consequence: '你带信回家，把阿明说过的话讲给姐姐。她与你核对父亲的名字，没有把一次读信当成已经赢得他的信任。母亲把夜里写给远亲的信推到灯下，另一个求生的办法也需要有人说清代价。',
    },
  });

  if (node.id === 'n10') return edit(node, {
    wage: {
      label: '带自己的报酬回家',
      detail: '家里仍在等饭，把自己挣到的报酬先带回去。',
      next: 'n18',
    },
    ledger: {
      label: '征求女工同意，保留被扣工钱的记录',
      detail: '听她说完，用代号留下获准保留的记录；记录不能保证讨回工钱。',
      next: 'n18',
      consequence: '女工同意用代号，你听她说完，把被扣工钱的事记下。对方仍说下次再谈；她收好副本，你只保留获准留下的记录，把报酬带回家。家里广播正说道路快要封锁，母亲拿出一封还没敢念给姐姐听的信。',
    },
  });

  if (node.id === 'n13') return edit(node, {
    listen: { next: 'n18' },
    secret: {
      label: '说不清楚，先独自去做工',
      detail: '保留自己的行动，也承受没有把去向说清的距离；住处仍需互相知道。',
      keywords: ['独自', '做工', '不告诉', '自己去'],
      next: 'n18',
      consequence: '你没有把话说清。姐姐、母亲和萨米先住法里达相连的里间，你去作坊做工，不能再把她会等在原处当成理所当然。广播说路快封了；法里达转来母亲的信，你才知道她还试着用一桩婚事向远亲求照应。',
    },
    care: {
      next: 'n18',
      consequence: '你接过水盆，让姐姐终于坐下。母亲喝了水，伤仍在；关于明天的争执也没有消失。夜里广播说道路快封锁，母亲把写给远亲的信拿出来，这一次不能再只让一个人决定全家的去路。',
    },
  });

  if (node.id === 'n18') return edit(node, {
    plan: {
      label: '先确认接信地址，再独自去北门',
      detail: '与姐姐约好回话的门和时限；她留在已知住处，你去问阿明。',
      keywords: ['北门', '阿明', '父亲', '救父', '地址', '约定'],
      next: 'n25', requires: [],
      consequence: `${state.sister === 'apart' ? '你托法里达把接信地址和回话时限交给姐姐。她确认收到了，没有答应立刻搬回一起住。' : '你和姐姐确认接信地址、回话时限，再把母亲和萨米托给她。'}你独自去北门，仍不知道贾维德会提前来催人离开。能不能救父亲，还要看阿明认不认得你，以及门边有没有人盯着。`,
      effect: { stats: { trust: 1, hope: 1, exposure: 1, food: -1 }, add: ['pact', 'marriageOffer', 'sisterRefused', 'rescueRoute', 'relativePressure'], remove: ['caravan'] },
    },
    find: {
      label: '去问亲舅舅接应，让家人在屋里等',
      detail: '先问优素福是否真的能来，不能让司机或婚约替家人决定。',
      keywords: ['舅舅', '接应', '屋里', '母亲', '车', '撤离'],
      next: 'n21', requires: [],
      consequence: '你去问母亲的亲弟优素福有没有回信，家人留在关门的住处。贾维德却趁你不在开着红色轿车提前到了，借战事催母亲、姐姐和萨米上车。母亲反复说还有一个女儿没回来，他不肯等；接下来的决定，由她们自己作出。',
      effect: { outfit: 'travel', stats: { hope: 1 }, add: ['caravan', 'relativePressure', 'marriageOffer', 'sisterRefused'], remove: ['rescueRoute'] },
    },
    rush: {
      label: '留在内院，把照护与谋生分担起来',
      detail: '接受有限的邻里互助，先安排饭、休息和关门里间的学习。',
      keywords: ['留下', '院子', '互助', '照护', '课堂', '谋生'],
      next: 'n22', requires: [],
      consequence: `${state.sister === 'apart' ? '你先到内院听姐姐的意见，她确认愿意共同安排照护，再和你写清谁做什么。' : '你先听姐姐说完，她愿意和你共同安排照护。'}你们确认法里达仍愿意留门，把有限口粮凑在一起。母亲在关好的门里拒绝贾维德：玛莉安没有答应婚事。留下仍会挨饿、会害怕，也需要主人承担风险，但这一次不拿姐姐的一生去换一个屋檐。`,
      effect: { sister: 'beside', stats: { food: 1 }, add: ['stayRoute', 'marriageOffer', 'sisterRefused', 'marriageRefused'], remove: ['caravan', 'rescueRoute', 'missingSister', 'hiddenRisk'] },
    },
  }, {
    title: '这一次，谁来决定',
    paragraphs: state.sister === 'apart' ? [
      '广播说道路快封锁。法里达捎来母亲的信：她曾主动提出让姐姐嫁给远亲的小儿子，以求那一家照应母亲和孩子。母亲害怕活不下去，姐姐却没有答应。',
      '姐姐托人说，她不愿被拿一生交换一条路。母亲终于答应不能替她决定。你们仍分住两处，可以先确认接信地址，再决定寻父、问亲属接应，还是留在内院互助。',
    ] : [
      '广播说道路快封锁。母亲把夜里写给远亲贾维德的信放到灯下：她主动提出让姐姐嫁给他的小儿子，希望全家得到照应。说到最后，她不敢看姐姐。',
      '姐姐明确说不。母亲握着受伤的手臂，终于答应不能替她决定。亲舅舅优素福尚未到场，父亲仍在铁门后；你们必须先选一件今天能做的事。',
    ],
    sisterLine: state.sister === 'apart' ? '她托人传话：“去哪里先说清楚。我的婚事，也必须听我说完。”' : '我知道母亲很怕。但不能先许出我的一生，再说那是为了全家。',
  });

  if (node.id === 'n25') return edit(node, {
    release: {
      next: 'n30',
      requires: node.choices.find(choice => choice.id === 'release')!.requires?.map(requirement => requirement.flag === 'guardBond' ? { ...requirement, reason: '先前尚未建立读信、教字的往来，今天不能要求阿明冒险。' } : requirement),
      consequence: '炮火与调动声中，阿明负伤把父亲带出侧门，安置到借来的木推车上。父亲早已失去一条腿，如今添了重伤，不能撑拐行走，你推着他离开。与此同时，母亲拒绝贾维德的强迫带离，带萨米回到约定的门。你们再接上姐姐，终于重新数到五个人；父母都还需要水、休息和照护。',
      effect: addEffect(node.choices.find(choice => choice.id === 'release')!, { sister: 'beside', add: ['familyTogether', 'motherReturned', 'marriageRefused'], remove: ['missingSister', 'hiddenRisk'] }),
    },
    letter: {
      next: 'n30',
      consequence: '阿明没能立刻带人出来，只托人确认父亲仍在。你留下接信地址，退回约定的私院。母亲拒绝了强迫离开，带萨米回来；姐姐确认你的去向后也来会合。你们仍少一个人，但下一封信知道该寄到哪扇门。',
      effect: addEffect(node.choices.find(choice => choice.id === 'letter')!, { sister: 'beside', add: ['familyTogether', 'safeAddress'], remove: ['missingSister', 'hiddenRisk'] }),
    },
    leave: {
      label: '先退出门口，和家人接受一夜借住',
      detail: '承认今天无法救回父亲，确认法里达愿意留门后再安顿家人。',
      next: 'n30',
      consequence: '你退回约定的门，母亲拒绝了贾维德，带萨米回来，姐姐也按接信约定与你会合。法里达只答应这一夜，你们接受邀请，把疼着的人安顿到帘后。父亲仍未回来，留下的纸也不保证下一次能打开铁门。',
      effect: addEffect(node.choices.find(choice => choice.id === 'leave')!, { sister: 'beside', add: ['settled', 'shelter', 'familyTogether', 'safeAddress'], remove: ['missingSister', 'hiddenRisk'] }),
    },
  }, {
    paragraphs: [
      has(state, 'guardBond') ? '这几次读信和识字，让阿明认出了你的字。战事逼近，你按约到了北门；他记着父亲的名字，却仍不敢保证能把人带出来。' : '你在北门认出市场上见过的看守阿明。此前的往来还不足以让他为你冒险开门；你先留下父亲的姓名，没有把一次见面当成已经建立的信任。',
      '同一时候，贾维德提前来催家人离开。母亲拒绝丢下尚未回家的你，姐姐抱紧萨米，她忍着疼往约定的门返行。你还没听到消息，仍一遍遍讲火苗守在石门前的故事。',
    ],
    tale: has(state, 'guardBond') ? node.tale : '火苗守在石门前，念着旅人的名字。它没有编出门已经打开，也没有把陌生看门人写成一定会帮忙的朋友。风大时，它先给自己留一点热，再把能够回话的地址写清。',
  });

  if (node.id === 'n21') return edit(node, {
    register: {
      label: '先回去会合，等亲舅舅本人来接',
      detail: '拒绝婚事与强迫上车，核实优素福本人、办理去向，再支付路费。',
      keywords: ['舅舅', '接应', '核对', '登记', '会合', '上车'],
      next: 'n30',
      requires: [need('coins', 2, '路费需要两枚钱；可以先留在被邀请的私宅。'), need('health', 3, '家人身体暂时承受不了这段路；先接受一夜借住。')],
      consequence: '母亲拒绝随贾维德走，带姐姐和萨米回到约定的门，你也按时回来。优素福亲自到场，听清她们拒绝婚事，核对去向，办好文书。付过两枚路费，你们才在他的陪同下登上露天后斗货车，坐低、扶住栏板；母亲数齐每个孩子，父亲的消息仍没有回来。',
      effect: { outfit: 'travel', sister: 'beside', stats: { coins: -2, exposure: -1 }, add: ['caravan', 'documents', 'registered', 'escortConfirmed', 'boarded', 'familyTogether', 'motherReturned', 'marriageRefused', 'relativePressure'], remove: ['missingSister', 'hiddenRisk'] },
    },
    child: {
      label: '拒绝婚事，全家接受一夜私宅借住',
      detail: '母亲支持姐姐说不，先回去会合，再确认主人愿意留门。',
      keywords: ['拒绝', '婚事', '借住', '私宅', '一夜', '孩子'],
      next: 'n30',
      consequence: '姐姐说没有答应嫁人，母亲挡住伸来的手，让她抱萨米先退进开着的门。她们拒绝继续随贾维德走，回去与你会合。法里达确认可以借住一夜，你们关门倒水；母亲的疼没有因一床被子消失，父亲也仍未归来。',
      effect: { sister: 'beside', stats: { hope: 2, trust: 1 }, add: ['settled', 'shelter', 'familyTogether', 'motherReturned', 'marriageRefused', 'relativePressure'], remove: ['missingSister', 'hiddenRisk', 'boarded'] },
    },
    search: {
      label: '母亲坚持回家，等尚未归来的女儿',
      detail: '姐姐与母亲一起拒绝强迫带离，按先前约定找到努拉。',
      keywords: ['回家', '等', '女儿', '找', '母亲', '拒绝'],
      next: 'n30',
      consequence: '母亲不再等贾维德允许，拉着姐姐的手，带萨米返回你们约过的门。你也从问讯的街口回来；姐姐把你拉进屋，先告诉你母亲没有答应丢下任何一个孩子。家里仍缺食物，也仍少父亲，至少彼此知道下一封消息该送到哪里。',
      effect: { sister: 'beside', stats: { food: -1 }, add: ['familyTogether', 'motherReturned', 'motherSearching', 'marriageRefused', 'relativePressure', 'safeAddress'], remove: ['missingSister', 'hiddenRisk', 'boarded'] },
    },
  });

  if (node.id === 'n22') return edit(node, {
    school: {
      label: '按现有口粮排轮值，留一小时课堂',
      detail: '先安排照护与补衣，托可以买食的熟人采买，不让每个女孩轮流冒险上街。',
      next: 'n30',
      requires: [need('food', 2, '至少需要两份口粮才能安排有限的轮值课堂。'), need('health', 3, '家人仍需休息；可以先维持日常、等待消息。')],
      consequence: '值日表先写谁照看萨米、谁补衣、谁能托熟人带食物。姐姐把你的名字也排进读书的一栏，莱拉有空时来坐一会儿。门外一响，所有人仍会停笔；你们只排稳眼前一天，没有许诺明天一定开门。',
      effect: { stats: { food: -1, trust: 1, hope: 2 }, add: ['school', 'lantern', 'sustained', 'neighbors', 'marriageRefused', 'familyTogether'] },
    },
    father: {
      next: 'n30',
      consequence: '母亲坐下歇一会儿，你烧水，姐姐核对今天的口粮，再把父亲的名字写在信封上。母亲已经拒绝婚事，屋外的命令却没有撤掉。回信没有来，你们先完成这个能够分担的一天。',
      effect: { stats: { health: 1 }, add: ['letter', 'waiting', 'safeAddress', 'stayRoute', 'marriageRefused', 'familyTogether'] },
    },
    send: {
      label: '商量分住两处，写清地址与报平安日',
      detail: '姐姐、母亲和幼弟留在邀请借住的私宅，你到作坊后间；双方确认后才分别。',
      next: 'n30',
      consequence: '你先问姐姐愿不愿意，她把两个住处、接信人和报平安日期写清。姐姐、母亲和萨米留在法里达家，你到作坊后间；没有人独自去街上等车。你把亲眼见过、得到允许的事记下来，分别仍让人难过，也没有被说成永远失联。',
      effect: { sister: 'apart', scarf: 'shared', stats: { trust: -1 }, add: ['sendFamily', 'chosenApart', 'evidence', 'letter', 'safeAddress', 'marriageRefused'], remove: ['missingSister', 'boarded', 'familyTogether'] },
    },
  });

  return node;
}
