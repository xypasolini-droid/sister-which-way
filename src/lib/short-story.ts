import type { BranchState, StoryChoice, StoryNode } from './branch-story';
import { getLegacyShortNode } from './legacy-short-story';

type Effect = NonNullable<StoryChoice['effect']>;
const has = (state: BranchState, flag: string) => state.flags.includes(flag);
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
    work: { label: '蹲下来，帮父亲捡起摊上的东西', detail: '纽扣滚到了巡查脚边。父亲低声叫你别争，先把毯子收起来。', keywords: ['收摊', '纽扣', '捡起', '帮父亲'], consequence: '你蹲下捡纽扣，伸到巡查靴边的手又缩回来。父亲把最后几件旧物裹进毯子，撑着腋拐站起：“走吧。”那人一直盯着你们离开的方向。傍晚，全家围着饭碗坐下，门外响起白天那人的声音。', effect: find('work').effect },
    neighbor: { label: '看向卖饼的熟人：“能帮帮我们吗？”', detail: '你认得他，也认得他忽然移开的目光。巡查还站在摊前。', keywords: ['熟人', '帮帮', '卖饼', '求助'], consequence: '卖饼的熟人看了看武器，低下头，把捡到的布包悄悄递还父亲。他没敢再说话。父亲牵你离开，你没有再叫他。傍晚回到家，饭刚端上来，白天威胁你们的人就在门外喊父亲的名字。', effect: find('neighbor').effect },
    mother: { label: '靠近父亲，小声问：“是我的错吗？”', detail: '巡查说女孩不该来。你把故事册抱紧，不敢再抬头。', keywords: ['我的错', '害怕', '父亲', '靠近'], consequence: '父亲把手放在你的肩上：“不是你的错。”他没再与巡查争辩，收好故事册和旧物，撑拐带你回家。你以为关上家门就能躲过那道目光。傍晚，萨米刚挨到父亲身旁，门却被狠狠踢响。', effect: find('mother').effect },
  }, { title: '巡查停在父亲的摊前', sisterLine: '姐姐出门前说：“跟着父亲。东西拿不回来也没关系，你们得回来。”' });
  if (node.id === 'n02') return edit(node, {
    cut: { label: '跟上母亲：“我和你一起去找爸爸。”', detail: '母亲要去监所要求放人；姐姐留下照看萨米。', keywords: ['母亲', '一起去', '爸爸', '监所'] },
    sew: { label: '抱抱姐姐：“要是晚了，别出来找我们。”', detail: '请她托法里达打听，再跟上母亲。你怕她也走到巡查面前。', keywords: ['姐姐', '别出来', '法里达', '晚了'], consequence: `出门前，你抱住姐姐，约好晚了就请法里达传话，别独自走到街上。${find('sew').consequence.slice(find('sew').consequence.indexOf('街口巡查'))}` },
  });
  if (node.id === 'n06') return edit(node, {
    buy: { label: '把剪刀递给姐姐：“你来吧。”', detail: '你闭上眼睛，请她先握一会儿你的手，再剪下发辫。', keywords: ['姐姐', '你来', '剪刀', '剪发'] },
    help: { label: '接过剪刀：“最后这一下，我自己来。”', detail: '姐姐先剪下一束，再陪着你剪完。亡兄的长衫、宽裤和小帽就在身旁。', keywords: ['自己', '剪刀', '最后', '剪发'] },
  }, { title: '姐姐把剪刀放在你面前' });
  if (node.id === 'n07') return edit(node, {
    truth: { label: '跟莱拉去市场，替人送货读信', detail: '你们结伴跑腿。先把买到的饼送回家，再去摆摊。', consequence: '莱拉带你绕开拦人的街口，一起送完几份货。你把挣来的饼送回家，再回到摊前替人读信。阿明捏着一封信等在那里；你认出他曾站在抓走父亲的人身旁，脚先退了半步。' },
    hide: { label: '跟莱拉去作坊，问问有没有修补活', detail: '你会缝几针。莱拉带你敲后门，再去送她自己的货。', consequence: '莱拉把你领到裁缝后门。老板让你坐下补衣，她去别处送货，答应回来接你。你先把买到的饼送回家，再坐到后间的矮凳上；学校里的同学，如今只能这样在街上相认。' },
    pact: { label: '先把饼带回家，告诉姐姐遇见了莱拉', detail: '她还不知道你在外面叫阿提什。回去时，你想让她先吃一点。' },
  }, { title: '莱拉认出了你', paragraphs: [...node.paragraphs.slice(0, 2), '莱拉指给你看几处肯雇小帮工的门。她自己也要送货、养家，不能一直陪着你。你把饼藏好：姐姐和萨米还在等。'] });
  if (node.id === 'n09') return edit(node, {
    verify: { label: '把信还给他，轻声问起父亲', detail: '等他缓过来，再另拿一张纸写父亲的名字；别催他拿这封信做交换。' },
    courier: { label: '再念一遍哈拉的名字，陪他认字', detail: '接下来的几次送货都停一会儿。你少接了几份活，阿明才慢慢愿意与你说话。', effect: effect(find('courier'), { add: ['literacyPractice'] }) },
    sister: { label: '今天先不问父亲，收摊回家', detail: '把哈拉的信还给阿明。你不知道该怎样安慰他，也想回去看看母亲。' },
  }, { title: '他想再听一次妻子的名字' });
  if (node.id === 'n10') return edit(node, {
    wage: {
      label: '扶住被推的女工，和她一起退到门外',
      detail: '老板伸手推她，你扶住她往门外退；自己今天的报酬也可能拿不到。',
      keywords: ['挡住', '保护', '女工', '一起退出', '离开作坊'],
      consequence: '老板伸手推搡不肯认账的女工。你挡到她身前，莱拉拉开门，三个人一起退进巷子。她稳住身体后让你别再回去争；你的活也没拿到报酬。你把遭遇照实告诉家人，母亲摊开那封寄给远亲的信：她已向优素福求接应，却还没收到回话。',
      effect: { stats: { coins: -1, trust: 1 }, add: ['protectedSomeone', 'workerProtected'] },
    },
    ledger: { label: '拉开后门，叫莱拉过来帮忙', detail: '先让她们进出有路。你不想再与老板争下去，也知道这份活可能做不成了。', keywords: ['后门', '莱拉', '帮忙', '开门'], consequence: '你拉开后门，叫回刚送完货的莱拉。她扶住女工，你从另一边护着她退出作坊。老板在身后骂你们别再回来。女工不肯丢下那件缝好的衣服，你替她包起，送她走到熟悉的街角才回家；母亲还在等你带回晚饭。', effect: { stats: { coins: -1, trust: 1 }, add: ['workerHelped'] } },
  }, { paragraphs: [`${node.paragraphs[0]}莱拉送完货回到后门，与你一起听见女工争辩。`, ...node.paragraphs.slice(1)] });
  if (node.id === 'n13') return edit(node, {
    listen: { label: '坐到姐姐身旁：“你也很害怕吧？”', detail: '先听她把话说完。你们一起说好，下次要去哪里、什么时候回来。', effect: effect(find('listen'), { add: ['pact', 'listenedSister'] }) },
    secret: { label: '把饼放下：“我还得出去一趟。”', detail: '你不愿再说街上发生的事。姐姐叫你等等，你还是走向了门口。', effect: effect(find('secret'), { add: ['leftUnsaid'], remove: ['pact'] }) },
    care: { label: '接过水盆：“你歇一会儿，我来照看母亲。”', detail: '姐姐一夜没睡。你留下换水喂药，今天不再出去找活。', effect: effect(find('care'), { add: ['carePractice', 'protectedSomeone', 'pact'] }) },
  });
  if (node.id === 'n18') return edit(node, {
    plan: {
      label: '和姐姐约好接应，再去北门找阿明',
      detail: '想救父亲，得先不随今天的车走。接下来用几次送货的时间陪阿明读信、教字，等侧门出现机会；家人也得多等几天。',
      effect: { stats: { hope: 1, exposure: 1, food: -1 }, add: ['marriageOffer', 'sisterRefused', 'rescueRoute', 'relativePressure', 'pact', 'guardKnown', 'guardBond', 'rescuePrepared'], remove: ['caravan'] },
      consequence: `${has(state, 'pact') ? '你与姐姐重新确认接应的门和时限。' : '你向姐姐把去向说清，补上此前没有守住的约定；她确认会守着法里达的后门接应。'}母亲拒绝贾维德的强迫，告诉优素福今天先不走。${has(state, 'guardBond') ? '你已有几次陪阿明认字的往来，便继续送货，等他能打听到父亲。' : '接下来的几次送货，你从替阿明读信开始，陪他一笔笔认写妻子哈拉的名字，等他愿意谈起自己的家。几次往来以后，你才在另一张纸上写下父亲的姓名。'}这些天你少接了许多活，家人分着剩下的饼，错过较早的离城车。直到炮火逼近、关口将封的那一夜，阿明才托人带来侧门换岗的消息；优素福也来跑最后一趟。`,
    },
    find: {
      label: '陪母亲上车，和家人一起离开',
      detail: '不再往北门跑，父亲暂时接不出来。帮母亲摆脱贾维德，和姐姐、萨米随优素福离开。',
    },
    rush: {
      label: '告诉家人别等我，回街上找莱拉',
      detail: '莱拉被堵在市场。你要回去接她，就得放下去监所和跟家人登车的机会。',
      consequence: '优素福亲自赶到私院，母亲拒绝贾维德的逼婚，决定带姐姐和萨米跟亲弟离城。你告诉她们自己要去找被堵住的莱拉：“封关了就走，不要等。”姐姐先与你确认这真是你的决定，再把手松开。你沿市场侧巷去找莱拉。家人的车已经出发，父亲仍在监所。',
      effect: { ...familyParts, add: [...familyParts.add!, 'stayRoute', 'relativePressure', 'sisterRefused'] },
    },
  }, {
    title: '母亲说，舅舅的车快到了',
    paragraphs: [
      '你赶回法里达的里间时，母亲和姐姐都在。母亲曾想用玛莉安的婚事求贾维德照应，姐姐不肯答应。如今贾维德借战事上门逼人走，母亲终于回绝了他。亲弟优素福传来消息：他今天能先接一趟，封关前还会再跑最后一趟，之后就不能折返。',
      '父亲还在北门。去那里不能敲一次门就把人接出来：你得和姐姐约好接应，再花几天与阿明读信、教字，家人也要承受等待。莱拉托人说市场开始拦人，她仍没能回家。你可以先赶回家人的车，也可以回街上找她。',
    ],
    sisterLine: '我不答应嫁过去。你要去哪里，现在告诉我；封关以前，我们得知道彼此会不会回来。',
  });
  if (node.id === 'n25') return edit(node, {
    release: {
      label: '留在侧门，接住阿明带出来的父亲',
      detail: '几天的准备等到了这一刻。接父亲上木车，就赶不上舅舅最后一趟车；家人会在后门等你。',
      // Choosing n18/plan performs the multi-day preparation. Old opening flags
      // are neither a secret price nor a reason to disable the rescue here.
      requires: [],
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
      '几天过去。哈拉的信仍由阿明收着，你教过的字，他已经能慢慢读出来。父亲的姓名另写在一张纸上。他终于打听到侧门的换岗，约你在炮火间歇时等；这次帮忙仍可能让他丢掉性命。',
      '姐姐收到了你再次确认的回话，守着法里达的后门。优素福最后一趟车也到了，莱拉却被堵在市场另一头。你现在留在侧门救父，就会错过车；赶回去仍能登车，回头接莱拉则要让家人先走。',
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
      detail: '你留下挡住追来的目光，让她们先进去。门合上后，接着讲火苗长大、守护女孩的成年童话。',
      requires: [],
      keywords: ['守护', '卫队', '山口', '挡住', '保护', '梦境'],
      consequence: '你挡住侧门，让莱拉先把两个女孩送进里间，再一起把门关上。母亲、姐姐和萨米已随优素福离城，父亲仍在监所。你们躲在门后续写火苗的故事：如果有一天不必再退开，长大的她会怎样守住这条路？故事把时间带到成年，没有替现实的人撤去伤和失散。',
      effect: { ...familyParts, add: [...familyParts.add!, 'fateGuardian', 'girlsProtected'] },
    },
    school: {
      label: '教女孩写下真名，让她们自己讲故事',
      finish: 'dream_commons',
      detail: '先带她们藏进门里。等脚步远去，再教她们写名字，续讲火苗长大、与女人们一起办学校的成年童话。',
      requires: [],
      keywords: ['名字', '学校', '自治', '教字', '梦境', '共同'],
      consequence: '你和莱拉先把女孩们安顿进受邀请的里间，听她们说出自己的名字，再陪不会写字的孩子画第一笔。母亲、姐姐和萨米已随优素福离城，父亲仍在监所。你续写火苗和许多人一起建城的故事，把学校、市场与议事的长桌放进成年之梦；梦没有让现实家人突然团聚。',
      effect: { ...familyParts, add: [...familyParts.add!, 'fateCommons', 'namesShared'] },
    },
  }, {
    title: '两个女孩，和一扇还开着的门',
    paragraphs: [
      '你找到莱拉时，她正护着两个被巡查赶离街口的女孩。法里达让侧门开了一线，屋里只能暂时藏身。你们得先把人带进去。',
      '家人的车已经走了，父亲仍被囚。莱拉看着你：“先带她们躲进去。然后呢？”你想起那个讲给萨米的火苗故事：接下来是继续找路，还是在门后讲一段长大以后、不必再躲藏的童话？成年童话里的自由不会改变现实中的分别。',
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
export function getShortFate(state: BranchState): 'reunited' | 'caravan' | 'lantern' | 'dream_guardian' | 'dream_commons' {
  if (has(state, 'fateRescue')) return 'reunited';
  if (has(state, 'fateDeparture')) return 'caravan';
  if (has(state, 'fateGuardian')) return 'dream_guardian';
  if (has(state, 'fateCommons')) return 'dream_commons';
  return 'lantern';
}
