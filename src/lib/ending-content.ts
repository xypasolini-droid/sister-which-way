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
    if (has(state, 'sustained')) {
      ending.scene = apart ? 'workshop' : 'courtyard';
      ending.summary = '你们已把一小时的课堂办起来；你从独自挣钱的孩子，变成会分担、也敢请人接手的同伴。';
      ending.paragraphs[0] = '院里的课读到一半，门外的脚步让所有人停笔。声音远去，一个孩子问：“还读吗？”姐姐回到那一行：“读完你的名字。”这一回，课没有只留在你们商量过的纸上。';
      ending.paragraphs[1] = '你起身想去接下一份活，姐姐把一张凳子留给你。照看萨米的人已接过这一轮，你终于坐下，不必先证明今天挣够了钱，才配做一个也能学字的孩子。';
      if (apart) {
        ending.paragraphs[0] = '你记着院里已经开起来的一小时课：门外的脚步让人停笔，声音远去，姐姐接着读完孩子的名字。你们仍分住两处，那一堂课却已经发生，不会因为分别就被划掉。';
        ending.paragraphs[1] = '你在作坊后间把做不到的事也写清。家人不能随时替彼此端水，照护就更需要说出交给谁、哪一次由自己承担。你不再把沉默和硬撑当成独立。';
      }
    } else if (apart) {
      ending.scene = 'workshop';
      ending.summary = '你与姐姐仍分住两处，却不再靠累垮自己证明独立；开始为自己安排生活，也学着向可信的人求助。';
      ending.paragraphs[0] = '作坊收工了。你回到作坊后间，放下没做完的活，给自己留下休息的时间。姐姐、母亲与萨米仍住在法里达家，今夜没有人在身旁立刻回答；长大却不再意味着一个人硬撑到天亮。';
      ending.paragraphs[1] = has(state, 'chosenApart') ? '这次分住是你们听完彼此意见后的决定。距离仍让你难受，却不能再靠命令姐姐回来抵消；你把需要帮忙的事写清，也把自己愿意承担的部分留下。' : '之前没说清去向的争执还在。你不再把姐姐会替你等候当成理所当然，先写清住处与需要的帮助；一张纸不能补完争执，却能让你开始承担说清楚的责任。';
    } else if (has(state, 'settled') || has(state, 'shelter')) {
      ending.paragraphs[0] = '法里达只答应这一夜。门闩扣好，你仍握着水杯，不肯躺下。母亲接过它：“今夜，轮到你休息。”你想说自己不累，张开嘴，却先哭了。';
      ending.paragraphs[1] = acted(state, 'n13', 'care') ? '你曾让姐姐先坐一会儿。现在她替你留出同样的一小块位置，没有催你变得坚强。你终于躺下，听她接过门边的动静；原来照护也可以轮到自己。' : '姐姐没有把这一夜说成往后都安全。她只接过门边的动静，让你躺到薄被上。你第一次没有因为家里还缺一个人，就逼自己一直醒着。';
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
