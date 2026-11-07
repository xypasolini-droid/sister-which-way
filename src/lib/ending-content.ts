import type { BranchState, Ending } from './branch-story';

/** Original conclusions for this game, informed by research rather than film dialogue. */
export const ENDINGS: Ending[] = [
  {
    id: 'reunited', number: '01', title: '这次，我带你回家', scene: 'home',
    summary: '父亲曾带你穿过市场；这一次，你推着受伤的他回到家人身边。',
    cost: '父亲仍有重伤，阿明也为救人承担危险；团聚没有撤去街上的命令。',
    unlockedBy: '此前建立读信、教字的往来，在北门等到阿明冒险救父。',
    paragraphs: [
      '木推车停在门槛前。父亲睁开眼，先叫了你的名字。你俯下身，让他认清你的脸：“这次，我带你回家。”车边收着他平日跛行时用的腋拐；新添的伤仍需要照护，没有被这一声回答抹去。',
      '母亲与姐姐迎到门边，萨米伸手去碰父亲，又怕碰疼他。你一直攥着车把，直到姐姐把手覆上来，才发现自己的手在抖。她说：“现在可以松开了。”',
      '你曾以为，只有不哭、不停下，才能把父亲找回来。现在你让家人一起接住推车，也接住终于哭出声的你。把父亲带回家，不等于从此要独自替所有人撑住这个家。',
    ],
  },
  {
    id: 'caravan', number: '02', title: '这条路，我自己选', scene: 'road',
    summary: '你们拒绝用婚事换一条路，确认亲舅舅接应后离城；寻找父亲的痛也被一起带走。',
    cost: '父亲仍未获救，前路仍有盘问；离开是承担取舍，并不是忘掉留下的人。',
    unlockedBy: '脱离贾维德的强迫，确认优素福本人、去向、路费和家人的身体条件后登车。',
    paragraphs: [
      '露天货斗停稳，优素福在车前等母亲说出要去的地址。她看过姐姐，才点头。你扶着栏板爬上去，回望城里的方向，脚没有立刻收回来。父亲还在那里。',
      '姐姐坐到你身边。你说：“我没把父亲带回来。”她没有说这不要紧，只握住你冰凉的手。你终于把脚收进货斗：“可这一次，谁也不能拿你的婚事替我们选路。”',
      '车开了，你仍在哭，却没有要求自己跳下去证明牵挂。过去你只敢求别人放行；这一次，你承认自己选择了离开，也愿意带着这份痛，和家人一起承担选择以后的生活。',
    ],
  },
  {
    id: 'lantern', number: '03', title: '我不再一个人养家', scene: 'home',
    summary: '你仍困在这座城里，却终于把“我撑不住了”说出口，让照护与谋生成为共同承担的事。',
    cost: '父亲仍未归来，食物、住处和互助的余力都有限；没有人承诺苦难已经过去。',
    unlockedBy: '没有登车或救回父亲时，承接已经作出的留城、借住、分住与互助安排。',
    paragraphs: [
      '关上门以后，你仍攥着水杯，听每一次脚步。母亲把杯子接过去，等了很久，你才说：“我今天真的撑不住了。”这句话说出口，没有人把你赶回街上。',
      '姐姐没有催你再勇敢一点。你们把各自能做的事说清，也说清做不到的部分。该休息的人终于可以躺下，留在门边听动静的人也有权叫别人接手。',
      '街上的命令还在，父亲的位置仍空着。你没有变成能独自养活所有人的英雄；你学会在力气用完以前求助，也不再把一个人的辛苦当作自己被需要的唯一证据。',
    ],
  },
  {
    id: 'dream_guardian', number: '04', title: '守护之地', scene: 'courtyard', dream: true,
    summary: '成人梦境：曾在棍影下躲藏的女孩，成为全女性卫队的首领，守住女性自己决定生活的土地。',
    cost: '守护需要轮班、训练与彼此照应，领头者同样要接受这里女性的共同决定。',
    unlockedBy: '选择进入成年后的女性卫队之梦。',
    paragraphs: [
      '许多年后的梦里，你已经成年。山口传来急报，女性卫队沿石墙展开，令擅自逼近的武装者止步。你站在她们中间，等最后一队女孩穿过山路，走向开着门的学校。',
      '这片土地由女性自治。女孩可以上学，女人可以经营自己的铺子、选择伴侣，也可以不选。男性不得未经这里女性的共同许可踏入；守门的决定握在她们自己手里。',
      '你把守山口的岗位交给接班者：“守住路，让她们长大。”从前你躲过巡查，才有一口饭；如今你学会指挥，也学会交出岗位，让更多女性不必重走那条躲藏的路。',
    ],
  },
  {
    id: 'dream_commons', number: '05', title: '没有锁的明天', scene: 'courtyard', dream: true,
    summary: '成人梦境：学校、市场与议事庭由女性共同建设；你拥有力量，也愿意让反对自己的声音留下。',
    cost: '自治仍有分歧、疲惫与有限的资源，决定必须由这里的女性一起承担和修订。',
    unlockedBy: '选择进入成年后的学校、市场与女性议事庭之梦。',
    paragraphs: [
      '梦里，你、姐姐和莱拉都已成年。姐姐推开教室的门，莱拉在自己铺前写下价格。一个女孩当街报出真名，没有先看身后；没有谁要她许出婚事，才肯给她一张课桌。',
      '女性议事庭里，有人当面反对你的办法。你把已经抬起的手放下：“把你的办法说完。”窗外的买卖声没有停，旁听的女孩也举起手。土地由女性自治，男性来访须经这里女性共同许可。',
      '你终于不必用更响的命令证明自己有力量。曾经说不完的话，在这里可以说完；你愿意建设一个连自己也不能独占答案的地方，让每个女人都有决定怎样长大的权利。',
    ],
  },
];

const has = (state: BranchState, flag: string) => state.flags.includes(flag);
const acted = (state: BranchState, nodeId: string, choiceId: string) => state.history.some(step => step.nodeId === nodeId && step.choiceId === choiceId);

export type StayEndingKind = 'classroom' | 'apart' | 'rescue_failed' | 'shelter' | 'staying';
type StayEndingPresentation = {
  kind: StayEndingKind;
  title: string;
  summary: string;
  cost: string;
  growth: string;
  dialogue: [string, string];
  echo: string;
};

/** One saved ending family, with the actual consequence visible in every presentation. */
export function getStayEndingPresentation(state: BranchState): StayEndingPresentation {
  if (has(state, 'sustained')) return {
    kind: 'classroom', title: state.sister === 'apart' ? '那一小时，也有我的位置' : '这一回，轮到我读书',
    summary: state.sister === 'apart' ? '你独住作坊后间，仍记着已经开过的一小时课：那张凳子，也曾留给只顾挣钱的你。' : '门外仍有巡查，你们却真的开了一小时课。你拿起粉笔，也第一次坐进学生的位置。',
    cost: '父亲仍被关着；一小时之后仍要谋生，课堂没有替任何人取消禁令。',
    growth: '从只替家人挣饭，到接过粉笔，也争取自己学习的时间。',
    dialogue: state.sister === 'apart' ? ['作坊收工，你想起那一小时：姐姐把粉笔递到你手里。', '今夜你仍独自铺床。那张课堂上的凳子，却曾有你的位置。'] : ['门外的脚步远了。你接过粉笔，把自己的名字写到黑板上。', '姐姐留出一张凳子：“这节课，你也坐下。”父亲的位置仍空着。'],
    echo: state.sister === 'apart' ? '你曾被排进上课的一栏；分住没有把那一小时抹去，也没有让姐姐今夜出现在身旁。' : '你被排进上课的一栏；保住这一小时，意味着少接一份活。',
  };
  if (state.sister === 'apart') return {
    kind: 'apart', title: '姐姐不在身旁的夜晚',
    summary: has(state, 'chosenApart') ? '你住进作坊后间，家人留在另一扇门里。你开始独自安排生活，也承担共同答应分别之后的孤单。' : '你住进作坊后间，家人留在另一扇门里。你开始独自安排生活，也面对没有把话说清的后果。',
    cost: '父亲仍未获救；分住让每天的照护和求助都隔着距离，没有当夜和解或团聚。',
    growth: '从把姐姐的等候当成理所当然，到独自安排住处，承担分别的后果。',
    dialogue: ['作坊落闩。你铺好自己的被褥，习惯地叫了一声“姐姐”。', '没有人应声。你放下没做完的活，先给自己倒了一杯水。'],
    echo: has(state, 'chosenApart') ? '是你们共同答应分住；答应得再清楚，今夜也听不见她回答。' : '争执没有随天黑消失；这一次，你得先把自己的住处与难处说清。',
  };
  if (state.father !== 'free' && state.history.some(step => step.nodeId === 'n25')) return {
    kind: 'rescue_failed', title: '我没能带他回来',
    summary: '你真的走到了北门，却没能救出父亲。你空着手退离枪声，回去面对等着你的家人。',
    cost: '父亲仍在铁门后，下一次机会没有保证；退开保住了你，却留下没有完成的救援。',
    growth: '从相信再拼命一次就能救人，到认清这次失败，改变继续冒险的办法。',
    dialogue: ['你推开借住处的门，手里没有父亲。姐姐看向你身后。', '“我没能带他回来。”你说完，才肯让她拉你离开门口。'],
    echo: '你去过北门，也退了回来；父亲的消息没有跟上你的脚步。',
  };
  if (has(state, 'settled') || has(state, 'shelter')) return {
    kind: 'shelter', title: '关上门，只借到这一夜',
    summary: has(state, 'marriageRefused') ? '你们没有用姐姐的婚事换庇护。家人挤进暂借的里间，今晚留下，明天的去处仍没有着落。' : '家人挤进暂借的里间。你安顿疼着的人，今晚留下，明天的去处仍没有着落。',
    cost: '借住只到今夜，父亲仍未归来；一床被褥没有带来粮食、永久住处或街上的自由。',
    growth: has(state, 'marriageRefused') ? '从盼一个人替全家作主，到参与承担拒绝之后的照护与谋生。' : '从只想立刻走得更远，到接过水盆，承担今晚必须完成的照护。',
    dialogue: ['法里达把门闩扣好：“只到明早。”你接过水盆，腾出床边。', has(state, 'marriageRefused') ? '姐姐不用为这床被褥嫁人。你们留下了，父亲却仍没有回来。' : '你把疼着的人安顿在帘后。今夜有床，父亲仍没有回来。'],
    echo: has(state, 'marriageRefused') ? '你们拒绝了婚事，失去那份有条件的接应；这一夜仍是别人冒险借出的。' : '这一夜是别人冒险借出的；关门没有让伤势和明天的去处自动解决。',
  };
  return {
    kind: 'staying', title: '天亮后，仍要出门',
    summary: '你留在城里，父亲没有回来。烧水、照护与谋生开始有人接手，下一次上街仍轮得到你。',
    cost: '生活没有替你打开铁门；食物、伤势和下一天的劳动，都没有因为共同承担而消失。',
    growth: '从等一个奇迹结束苦难，到改变家里谁能休息、谁来接手的一天。',
    dialogue: ['水烧开了。母亲接过水杯，姐姐替你把明天的活划去一份。', '你把剩下的活记好。天亮仍得出门，父亲的位置依然空着。'],
    echo: '没有人替你取消明天的劳动；今天的改变，是你终于能交出其中一部分。',
  };
}

/** Adult dreams remember a witnessed wound or action; they never certify a real victory. */
export function getDreamEndingPresentation(state: BranchState): { dialogue: [string, string]; echo: string } {
  if (state.endingId === 'dream_guardian') return has(state, 'motherHurt') ? {
    dialogue: ['梦里，成年的你挡住棍影：“这里不许再打她。”', '女性卫队守住山口，女孩们从你身后走向学校。'],
    echo: '你记着母亲挨打时无路可走的身体；梦里的你守住一条她曾无法通过的路。',
  } : {
    dialogue: ['成年阿提什：“放她们过去。她们是去上学的。”', '从前你在摊前被迫退开；梦里，女性卫队站到女孩身前。'],
    echo: '从摊前被迫退开的那一步，梦里的你长成愿意站到其他女孩身前的人。',
  };
  if (has(state, 'sustained')) return {
    dialogue: ['梦里，一小时的课变成全天。成年后的你推开下一间教室。', '“我不同意你的办法。”女人站起来。你停下：“你说。”'],
    echo: '你们曾冒险保住的一小时，长成梦里不必听脚步停笔的学校；办学的人也要听见反对。',
  };
  if (has(state, 'guardKnown')) return {
    dialogue: ['梦里，成年后的你打开学校。女人们亲手写下自己的名字。', '你记得为阿明念哈拉的名字；如今，每个人都能自己读。'],
    echo: '曾经你为一个思念妻子的人念名字；梦里的学校，让女人自己认写、讲述自己的名字。',
  };
  return {
    dialogue: ['梦里，成年后的你为女孩推开教室，姐姐在里面等她们。', '市场有人大声报出真名。议事庭里，你让反对的人说完。'],
    echo: '你曾把真名留在家里；梦里的女人可以在市场报出名字，也能当面反对掌权的你。',
  };
}

/** Project only established facts. Reading an ending never changes its state or resources. */
export function projectEnding(state: BranchState, base: Ending): Ending {
  const ending: Ending = { ...base, paragraphs: [...base.paragraphs] };
  if (ending.dream) return ending;

  const apart = state.sister === 'apart';
  const finalChoice = state.history.findLast(step => step.nodeId === 'n30')?.choiceId;
  const injury: string[] = [];
  if (has(state, 'motherHurt')) injury.push(has(state, 'motherTreated') ? '母亲受过照护，起身仍会牵动伤处。' : '母亲起身时仍护着受打的地方。');
  if (has(state, 'sisterHurt') || has(state, 'sisterTreated')) injury.push(apart ? '另一处住着的姐姐也仍要养脚踝。' : '姐姐把受伤的脚垫好，没有再逞强站起。');

  if (ending.id === 'reunited') {
    const echo = has(state, 'guardBond') ? '阿明认出了你教他写过的字，才愿意再听父亲的名字。' : '阿明冒险把父亲带出了铁门。';
    const meeting = has(state, 'pact') ? '从前写下的回话地点，这一夜真的让家人找到彼此。' : '你们终于在能关门的地方接上了消息。';
    ending.paragraphs[0] += ` ${echo}`;
    if (apart) {
      ending.scene = 'workshop';
      ending.summary = '父亲已被带出铁门；你先把这份平安送到姐姐的住处，让照护也由家人一起承担。';
      ending.paragraphs[1] = '你把推车停在作坊后间的避风处，写下父亲已被带出的消息。姐姐、母亲与萨米仍在法里达家，你没有把几扇门的距离写成已经团聚。先让她们知道父亲在哪儿，再一起决定怎样照护。';
      ending.paragraphs[2] = '你曾想把父亲找回来，就能不再求别人。现在你看着自己发抖的手，终于肯说还需要帮忙。你带他离开了铁门，接下来的家，要由家人一起接住。';
    } else {
      if (!has(state, 'motherReturned') && !state.history.some(step => step.nodeId === 'n21' || step.nodeId === 'n25')) {
        ending.paragraphs[1] = '母亲与姐姐在借住处接到消息，萨米先摸了摸父亲的手，又怕碰疼他。你一直攥着车把，直到姐姐把手覆上来，才发现自己的手在抖。她说：“现在可以松开了。”';
      }
      ending.paragraphs[1] += ` ${meeting}`;
    }
  } else if (ending.id === 'caravan') {
    if (has(state, 'pact') && !apart) ending.paragraphs[0] += '那处早早约定的门，没有让任何一个孩子被丢在上车时刻之外。';
    if (apart) {
      ending.summary = '接应的车已经出发，姐姐仍住在约定的私宅；离城没有替你们取消分别。';
      ending.paragraphs[0] = '优素福按确认过的地址发动车子。你扶着露天货斗的栏板，回望城里的方向，脚没有立刻收回来。父亲还没有获救，姐姐也仍住在另一处私宅。';
      ending.paragraphs[1] = '姐姐仍在约定的私宅，你把她的地址贴身收好，没有把车上的人写成全家。风越过栏板，你想起还没有见到的父亲，也想起不能替姐姐作主的那一刻。';
    }
  } else if (ending.id === 'lantern') {
    const moment = getStayEndingPresentation(state);
    ending.title = moment.title;
    ending.summary = moment.summary;
    ending.cost = moment.cost;
    if (moment.kind === 'classroom') {
      ending.scene = apart ? 'workshop' : 'courtyard';
      ending.paragraphs[0] = '院里的课读到一半，门外的脚步让所有人停笔。声音远去，一个孩子问：“还读吗？”姐姐回到那一行：“读完你的名字。”这一回，课没有只留在你们商量过的纸上。';
      ending.paragraphs[1] = '你起身想去接下一份活，姐姐把一张凳子留给你。照看萨米的人已接过这一轮，你终于坐下，不必先证明今天挣够了钱，才配做一个也能学字的孩子。';
      if (apart) {
        ending.paragraphs[0] = '你记着院里已经开起来的一小时课：门外的脚步让人停笔，声音远去，姐姐接着读完孩子的名字。你们仍分住两处，那一堂课却已经发生，不会因为分别就被划掉。';
        ending.paragraphs[1] = '你在作坊后间把做不到的事也写清。家人不能随时替彼此端水，照护就更需要说出交给谁、哪一次由自己承担。你不再把沉默和硬撑当成独立。';
      }
      ending.paragraphs[2] = '父亲的位置仍空着，街上的禁令也没有撤去。下课后你还得谋生，可你已不愿把自己的名字永远写在跑腿那一栏。你和姐姐定下轮换，给下一堂能否开起来的课留一小段真实的时间。';
    } else if (moment.kind === 'apart') {
      ending.scene = 'workshop';
      ending.paragraphs[0] = '作坊收工了。你回到作坊后间，放下没做完的活，给自己留下休息的时间。姐姐、母亲与萨米仍住在法里达家，今夜没有人在身旁立刻回答；长大却不再意味着一个人硬撑到天亮。';
      ending.paragraphs[1] = has(state, 'chosenApart') ? '这次分住是你们听完彼此意见后的决定。距离仍让你难受，却不能再靠命令姐姐回来抵消；你把需要帮忙的事写清，也把自己愿意承担的部分留下。' : '之前没说清去向的争执还在。你不再把姐姐会替你等候当成理所当然，先写清住处与需要的帮助；一张纸不能补完争执，却能让你开始承担说清楚的责任。';
      ending.paragraphs[2] = '父亲仍没有获救，家人也没有因分别过得更轻松。你第一次为自己的下一顿、睡处和回话负责，才知道独立也会有想叫人却无人应声的夜晚。你放下没做完的活，先给自己倒一杯水。';
    } else if (moment.kind === 'rescue_failed') {
      ending.paragraphs = [
        '你从北门退回来，关门前还是向街口看了一次。手里没有推车，没有父亲；姐姐看向你身后，便没有再问。你站在门边很久，才说：“我没能带他回来。”',
        '你把阿明没有给出的保证、门边的枪声，以及自己不得不退开的时刻说清。姐姐把你拉到墙边，让母亲听见你已回来。她们没有说父亲明天一定能得救，也没有再让你独自回到枪口前证明一次。',
        '父亲仍在铁门后。你留下能回话的地址，让愿意递消息的人继续问，自己先接过家里的水与药。下一次还要找他，但不能再只靠把一个孩子推到门前。这一次的失败，会改变你下一步向谁求助、带谁一起准备。',
      ];
    } else if (moment.kind === 'shelter') {
      ending.paragraphs[0] = '法里达只答应这一夜。门闩扣好，你仍握着水杯，不肯躺下。母亲接过它：“今夜，轮到你休息。”你想说自己不累，张开嘴，却先哭了。';
      ending.paragraphs[1] = acted(state, 'n13', 'care') ? '你曾让姐姐先坐一会儿。现在她替你留出同样的一小块位置，没有催你变得坚强。你终于躺下，听她接过门边的动静；原来照护也可以轮到自己。' : '姐姐没有把这一夜说成往后都安全。她只接过门边的动静，让你躺到薄被上。你第一次没有因为家里还缺一个人，就逼自己一直醒着。';
      ending.paragraphs[2] = `${has(state, 'marriageRefused') ? '姐姐不用为这一床被褥嫁人。你们拒绝了那份有条件的接应，' : ''}眼前只借到一夜，明天还要找食物和下一扇愿意开的门。你先接过水盆，和姐姐约好谁照护、谁找活；接下来谁能休息、谁去谋生，也得说清。`;
    } else {
      ending.paragraphs = [
        '父亲的回信没有来。水烧开时，你照例要把每只杯子都端好，母亲却先接过自己的那只。姐姐把明天要做的活摆开，让你划出已经接不下的一份。',
        '你没有把那份活重新揽回来。烧水、照看萨米和补衣被重新分开，谁做不到，也必须说给别人听。你们只排好了眼前这一天，没有更多食物突然出现在门里。',
        '天亮以后，你仍要出门，父亲的位置仍然空着。你不能独自改变街上的命令，却开始改变家里谁可以停下、谁必须接手。这个家还困在原处，活下去的办法不再只剩把你一个人耗尽。',
      ];
    }
  }

  // An epilogue cannot erase the rescue, the departing truck, or an actual classroom.
  let epilogue = '';
  if (finalChoice === 'pages') {
    if (has(state, 'evidence') && has(state, 'courier')) epilogue = '你只交出获准传递的记录，把不知道的地方留白；纸包能继续走，不代表铁门已经为其他人打开。';
    else epilogue = apart ? '信没有得到回音以前，你先把今晚的住处和那句“我需要帮忙”写清。' : '你把今天的害怕写进给家人的信，没有再替自己添上一句“我已经什么都不怕了”。';
  } else if (finalChoice === 'wait' && state.father !== 'free') {
    epilogue = has(state, 'boarded') ? '父亲的消息仍没有跟上这辆车。你把能接信的去向留好，没有为了继续等他，就把已经选择的路抹掉。' : '你仍等父亲的消息，也允许自己先睡下；等待不再要求你把全家的日子一起停住。';
  }
  if (epilogue) ending.paragraphs[2] += ` ${epilogue}`;
  if (injury.length) ending.paragraphs[1] += ` ${injury.join('')}`;
  return ending;
}
