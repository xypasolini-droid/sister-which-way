import type { BranchState } from './branch-story';

export type SceneDialogueLine = {
  speaker: string;
  actor: 'hero' | 'sister' | 'mother' | 'father' | 'brother' | 'friend' | 'guard' | 'narrator';
  text: string;
};

const line = (speaker: string, actor: SceneDialogueLine['actor'], text: string): SceneDialogueLine => ({ speaker, actor, text });
const hero = (text: string) => line('努拉', 'hero', text);
const sister = (text: string) => line('玛莉安', 'sister', text);
const mother = (text: string) => line('母亲', 'mother', text);
const friend = (text: string) => line('莱拉', 'friend', text);
const guard = (text: string) => line('阿明', 'guard', text);
const memory = (text: string) => line('姐姐·临行的话', 'narrator', text);

/** Short performed exchanges. The full prose belongs to the optional journal. */
export function getSceneDialogue(state: BranchState): SceneDialogueLine[] {
  const has = (flag: string) => state.flags.includes(flag);
  const previous = state.history.at(-1);
  const cameFrom = (nodeId: string, choiceId?: string) => previous?.nodeId === nodeId && (!choiceId || previous.choiceId === choiceId);
  const arrival = (texts: Record<string, string>, fallback: string) => texts[`${previous?.nodeId}:${previous?.choiceId}`] ?? fallback;
  const street = (text: string) => line(has('aliasAatish') ? '阿提什' : '努拉', 'hero', text);

  switch (state.nodeId) {
    case 'n01':
      return [
        line('年轻巡查', 'narrator', '谁准你把女孩带到这里来的？'),
        line('父亲', 'father', '我教过你认字。她是我的女儿。'),
        hero('我们只是替人读信，卖一点东西。'),
        line('年轻巡查', 'narrator', '还敢顶嘴？我记住你家在哪儿了。'),
      ];
    case 'n02':
      return [
        line('年轻巡查·闯进家门', 'narrator', '白天还敢顶嘴？把他押去拘留院！'),
        mother('他只是教书！你们凭什么抓他？'),
        line('父亲·被拖向门口', 'father', '努拉，别追。照顾母亲和弟弟。'),
        hero('爸爸！别关门！把我爸爸还回来！'),
      ];
    case 'n03':
      return [
        mother('我要去拘留院，请你们放了我丈夫。'),
        line('街口巡查', 'narrator', '没有男性亲属陪同，谁准你出门！'),
        hero('别打了！母亲，抓住我的手！'),
        mother('别往棍子前冲。扶我退开。'),
      ];
    case 'n04':
      return [
        hero('母亲被打得下不了床。我来买一张饼。'),
        line('摊主', 'narrator', '女孩不能自己来！拿着钱，走！'),
        hero('我有钱！别拿棍子追我——'),
        line('哈米德·后门内', 'narrator', '后门还有一点饼。先躲开他们。'),
      ];
    case 'n05':
      return [
        line('萨米', 'brother', cameFrom('n04', 'learn') ? '你带饼回来了？我可以吃一口吗？' : '钱还在，怎么没有饼？爸爸呢？'),
        hero('别再问了！……对不起，不是你的错。'),
        sister('母亲还疼。你坐下，我们一起想明天。'),
        line('萨米', 'brother', '那你讲那个小火苗，好不好？'),
      ];
    case 'n06':
      return [
        sister('阿里去世后，母亲一直留着他的旧衣。'),
        hero('穿哥哥的衣服，剪短头发，能买饼吗？'),
        sister('别人会当你是男孩。小帽也试一试。'),
        hero('剪下来的头发，替我留着。'),
      ];
    case 'n07':
      return [
        friend('努拉？我是莱拉，以前坐你旁边的。'),
        hero(has('selfCut') ? '头发是我自己剪的。这回他们肯卖饼了。' : '剪了头发，穿成男孩，他们就肯卖饼了。'),
        friend('我也这样挣钱。街上得换个名字。'),
        line('努拉 → 阿提什', 'hero', '阿提什，火焰。我们一起找活吧。'),
      ];
    case 'n08':
      return [
        street('刚才跑腿挣了饭，转眼却拦上绳了。'),
        friend('那个妇人又挨打了。先看清退路。'),
        street('如果过不去，替我给家里带句话。'),
      ];
    case 'n09':
      return [
        friend('他们推疼你了吗？纸都捡回来了。'),
        guard('替我读这封信。我叫阿明。'),
        street('信说你妻子死于战火。能帮我问父亲吗？'),
        guard('她的名字，教我认认。你父亲的也写下。'),
      ];
    case 'n10':
      return [
        street(cameFrom('n08') ? '绕开检查，却错过送信人。这里还有活吗？' : '莱拉介绍我来补衣。先说好工钱，可以吗？'),
        line('女工·帘后', 'narrator', '整件都不算钱？连线钱也没有？'),
        street('那处污渍原来就有。我看见了。'),
        friend('我还想攒钱去海边，也怕工钱被扣。'),
      ];
    case 'n11':
      return [
        hero(cameFrom('n10') ? '账算清了，她的工钱却还没讨回来。' : cameFrom('n08') ? '送水人传了话，我才绕回这扇门。' : '饼带回来了。莱拉帮我找到这扇门。'),
        sister('父亲的学生肯作证。我也想借黑板教书。'),
        hero('先听谁愿意帮忙，再决定去哪儿。'),
      ];
    case 'n12':
      if (!has('guardKnown')) return [
        street('邻居看见父亲被押进北门。这是证词。'),
        guard('我叫阿明。先替我读信，教我认妻子的名。'),
        street('信说她死于战火。这几个字，就是她的名。'),
        guard('字我记住了。名字留下，今天不准进去。'),
      ];
      return [
        street(cameFrom('n11') ? '邻居看见父亲被押进北门。这是证词。' : '阿明说父亲被押进这里。今天能见他吗？'),
        line('门房', 'narrator', '阿明今天不在。你还带了多少钱？'),
        street('我刚看见交钱的人，也没能进去。'),
        line('门房', 'narrator', '那就往后站。别堵门。'),
      ];
    case 'n13':
      return [
        hero(cameFrom('n12') ? '等到关门，也没见到父亲。只确认他还在。' : cameFrom('n10') ? '工钱拿到了。那位女工的钱还是没给。' : cameFrom('n09') ? '阿明记下父亲的名字，可他没答应放人。' : '今天的事，我想说给你听。'),
        sister('这些我都听着。可下一步，也该告诉我。'),
        hero('你又不是母亲！为什么总要拦着我？'),
        sister('我也想读书。不想每天只守着门等你。'),
      ];
    case 'n14':
      return [
        cameFrom('n13') ? hero('刚才不该冲你喊。你的课堂，我来望风。') : sister('只开一小时。窗遮好了，我们写名字。'),
        line('女孩·窗边', 'narrator', '外面有人！要把纸藏起来吗？'),
        hero('是水桶。别咬纸，给我。'),
        sister('先歇一下。谁还想听，就坐近一点。'),
      ];
    case 'n15':
      return [
        hero(cameFrom('n11') ? '有一户没开门，药我原样带回来了。' : '昨晚我照看母亲，今天我们来问药。'),
        sister('母亲叫我买便宜的。她说已经不疼了。'),
        hero('她早上走到门口，还要扶着墙。'),
        line('萨米拉', 'narrator', '把药单给我。先说清她哪里疼，再算钱。'),
      ];
    case 'n16':
      return [
        cameFrom('n13') ? memory('我带母亲和萨米去法里达家。别再瞒我。') : street(cameFrom('n09') ? '阿明学了几个字，说会试着问父亲。' : cameFrom('n12') ? '门房不准见父亲。我先来问材料。' : '孩子送回家了。今天先问离城材料。'),
        line('窗口里的人', 'narrator', '姓名写全。少一个人，就重新排。'),
        street('这张办好，母亲和姐姐就能走了吗？'),
        line('阿齐兹·窗口旁', 'narrator', '还不行。陪同的人、落脚的门，都得再问。'),
      ];
    case 'n17':
      if (!has('guardBond')) return [
        street(cameFrom('n16') ? '文书办好了。你的信，我也读给你听。' : '这封信我读给你听。也请你查查父亲。'),
        guard('她死在战火里……教我认妻子的名字吧。'),
        street('好。写完，再看我父亲的名字好吗？'),
        guard('查到了，他还在名册上。别在街口久留。'),
      ];
      return [
        guard(cameFrom('n12') ? '托人送来的名字收到了。父亲还在名册上。' : '文书办好了？你父亲还在名册上。'),
        friend('街口的人抓着我，逼我跟队伍搬东西。'),
        street('我们不答应。记牢父亲的编号就回去。'),
      ];
    case 'n18': {
      const outcome = arrival({
        'n14:teach': '课读完了，有个孩子怕得不敢再写。',
        'n14:hide': '原书藏好了。以后只能拿抄本上课。',
        'n15:treat': '药买齐了。母亲，复诊日我记下了。',
        'n15:share': '送药换了诊费。药还只够眼前几天。',
        'n16:route': '问到了借宿的门，还得先问肯不肯收。',
        'n16:risk': '凭条是假的，钱没追回来。我被骗了。',
        'n17:copy': '父亲还在。名单抄好了，传话人没署名。',
        'n17:family': '父亲的编号记住了。我没敢带整张名单。',
      }, '街上说快封路了。今晚我们去哪儿？');
      if (state.sister === 'apart') return [
        hero(outcome),
        line('法里达·捎来的话', 'narrator', '母亲写信给贾维德，提了姐姐的婚事。'),
        line('玛莉安·托人带来的话', 'narrator', '我不愿意。不能为了活路就替我许出去。'),
        hero('我先当面听姐姐说。今晚也得有住处。'),
      ];
      return [
        hero(outcome),
        mother('我写信求贾维德，许你嫁他最小的儿子。'),
        sister('你替我许了婚事？我不愿意。'),
        mother('我以为能换来保护……可你还没有答应。'),
      ];
    }
    case 'n19':
      return [
        hero('口粮和药清点好了。舅舅还没回信。'),
        sister('你要去北门，可贾维德也可能提前来。'),
        mother('先约好在哪扇门会合。我等你回来。'),
      ];
    case 'n20':
      return [
        friend('纸又被退回来了。你先别挤。'),
        line('武装者', 'narrator', '你们两个小子，跟队伍去搬东西！'),
        friend('家里还等着我。放开，我得回去。'),
        street('莱拉，退到我这里。别让他带走我们。'),
      ];
    case 'n21':
      return [
        line('贾维德', 'narrator', '不等了！少一个也得走，婚事我已经定了。'),
        mother('我女儿还没回来。我不走。'),
        sister('我也没答应嫁。母亲，把手给我。'),
        mother('抱紧萨米。先退到那扇门里。'),
      ];
    case 'n22':
      return [
        mother(has('marriageRefused') ? '我已经回绝他了。可今晚的饭，还得借。' : '那门婚事我不能替你答应。今晚先在这里住下。'),
        sister('我能补衣。里面那张桌子，也想留下教孩子。'),
        hero('先算算够几个人吃。我的那份也算进去。'),
      ];
    case 'n23':
      if (state.history.at(-1)?.nodeId === 'n21' || has('motherSearching')) return [
        hero('姐姐！我以为你们已经走了。'),
        sister('母亲不肯。她说，还有一个女儿没回来。'),
        hero('她现在在哪儿？还受着伤呢。'),
        sister('她在托人找你。先告诉她，你到这里了。'),
      ];
      return [
        hero(has('hiddenRisk') ? '我不该瞒你。你说的住处，我想听完。' : '你没同意那门婚事。我来听你怎么安排。'),
        sister('我在替家人问住处。去哪里，我也想做主。'),
        hero('你的地址给我看看。我们再商量父亲的事。'),
      ];
    case 'n24':
      return [
        hero(cameFrom('n20') ? '门口的人推打我，连累你跌下台阶。' : '我催大家上街。巡查推你，扭伤了脚。'),
        sister('疼得不能落地。先给我水，别再催我走。'),
        line('萨米拉', 'narrator', '脚踝要休息。包扎完也不能马上赶路。'),
      ];
    case 'n25': {
      const entering = cameFrom('n24') ? street('姐姐包扎后留在内院。我按约来问父亲。')
        : cameFrom('n23') ? street('姐姐留在内院守副本。我来问父亲。')
          : has('guardBond') ? guard('你替我读信、教的那些字，我记住了。') : street('我来求你放父亲，还能先做些什么？');
      if (state.stats.exposure > 8) return [
        entering,
        guard('有人认出你了。别再往这边来！'),
        street('可我父亲还在里面。'),
        guard('把能回话的地址留下。先退到门后去。'),
      ];
      if (!has('guardBond')) return [
        cameFrom('n20') || !previous ? street('我来求你放父亲，还能先做些什么？') : entering,
        guard('这封信读完，我先记下你父亲的名字。'),
        street('记下以后，你会去找他吗？'),
        guard('我不能答应。先说清能把回话送到哪里。'),
      ];
      return [
        entering,
        guard('里面在调人。我进去找，但不敢答应你。'),
        street('他走路不方便。请别让他一个人走出来。'),
        guard('名字再写一遍。你在能躲住的地方等。'),
      ];
    }
    case 'n26':
      if (has('motherSearching') || state.history.some(entry => entry.nodeId === 'n21') || (has('motherReturned') && has('relativePressure'))) return [
        mother('贾维德逼我们走。我不肯丢下你。'),
        hero('你还受着伤，怎么又回来找我？'),
        mother('你没回来，我怎么能走。'),
        sister(has('escortConfirmed') ? '舅舅回话了。等他亲自到，我们再商量。' : '法里达肯留我们一晚。先把水喝了吧。'),
      ];
      return [
        cameFrom('n24') ? hero('推车借来了。姐姐脚还疼，先别催她走。') : cameFrom('n23') ? hero('按姐姐的办法留宿。母亲，我们回来了。') : mother('努拉，过来。让我看看你。'),
        hero('我也想坐下了。今晚能留在这里吗？'),
        mother('先坐到我身边。今晚的住处，我们一起问。'),
        sister(has('escortConfirmed') ? '舅舅回话了。等他亲自到，我们再商量。' : '法里达肯留我们一晚。先把水喝了吧。'),
      ];
    case 'n27':
      return [
        hero('值日表里有我上课的时间，不只是做工。'),
        sister('留了，先坐。今天那位姑娘却没来。'),
        hero('她那张纸，还留着吗？'),
        sister('留着。可我还不知道她去了哪里。'),
      ];
    case 'n28':
      if (state.sister === 'apart') return [
        hero('父亲还被关着，今天又没有回信。'),
        memory('把住处告诉我，难受也可以写。'),
        hero('姐姐，我今天实在不想再说自己很好。'),
      ];
      if (cameFrom('n25')) return [
        mother('贾维德要带我走，可我不肯丢下你。'),
        hero('阿明没能救出父亲。他说父亲还在。'),
        sister(has('sisterHurt') || has('sisterTreated') ? '坐下说吧。我的脚还疼，今天走不了。' : '先留好回信的地址。我们都在这里。'),
        hero('今天先烧水，再写信。不能断了消息。'),
      ];
      if (cameFrom('n24')) return [
        sister('诊所只许短留。我的脚还不能落地。'),
        hero('法里达答应开门。我们先在这里歇。'),
        sister('父亲的信还没到。明天再托人去问。'),
      ];
      return [
        hero(cameFrom('n20') ? '又不准探视。名字交给送信人了。' : cameFrom('n22') ? '院子安顿好了。父亲的信还是没来。' : '别人都有信。只有我们还在等。'),
        sister(state.stats.food === 0 ? '路粮吃尽了。我先托人借一点。' : '我今天也不想听“耐心一点”了。'),
        hero('那先烧水吧。你坐着，我来。'),
      ];
    case 'n29':
      if (cameFrom('n21') || cameFrom('n25')) return [
        mother('努拉！我们回来了。他别想丢下你。'),
        hero(cameFrom('n25') ? '我也没接到父亲。今晚先别再赶路。' : '你们没走就好。我先把门关上。'),
        sister('母亲和萨米留这里。我们要分住吗？'),
        hero('住哪儿、谁递话，都得写清。'),
      ];
      return [
        hero(arrival({
          'n22:send': '我去作坊挣钱，你们先留法里达家？',
          'n23:apart': '我接受分住。今晚住哪儿，你说清给我。',
          'n26:seat': '我留作坊继续递信，你们借住这里，可以吗？',
          'n27:send': '课堂停了。有个孩子以为是自己写错了。',
          'n28:depart': '没等到信就搬走，我怕父亲找不到我们。',
        }, '真的要分开住吗？几扇门，也很远。')),
        sister(has('sisterHurt') || has('sisterTreated') ? '脚还疼，我先留下。你住哪扇门后？' : cameFrom('n27') ? '我解释过了。接下来先安排我们住哪里。' : cameFrom('n28') ? '旧门留了地址。今晚的住处，还得说清。' : '我陪母亲和萨米留这里。你去作坊后间。'),
        hero('我们还能商量。别只说一句“以后见”。'),
      ];
    case 'n30':
      if (state.sister === 'apart') return [
        line('努拉·写给姐姐的信', 'hero', cameFrom('n29', 'evidence') ? '记录交给阿齐兹了。姐姐，我住下了。' : '姐姐，我该怎么走？我到作坊后间了。'),
        memory('难受也可以写。不必每一封信都说自己很好。'),
        line('努拉·写给姐姐的信', 'hero', state.father === 'free' ? '父亲已经在我这里。我先照顾他，再给你回信。' : '我住下了。明天先报平安，再去问父亲的消息。'),
      ];
      if (state.father === 'free') return [
        line('父亲', 'father', '阿明冒着炮火，把我从侧门带出来了。'),
        hero('父亲，靠着我。母亲，你们怎么回来了？'),
        mother('贾维德逼我们走。我不能丢下你。'),
        sister(has('sisterHurt') || has('sisterTreated') ? '坐到我旁边。我的脚也还疼，先歇一歇。' : '先坐下喝水。今晚，我们终于都在。'),
      ];
      if (has('boarded')) return [
        mother('舅舅亲自来接了。孩子们，都坐稳。'),
        line('萨米', 'brother', '爸爸怎么知道我们去哪儿了？'),
        mother('留下新地址了。接着托人给他带信。'),
        hero('旧地址我也带着。没有把他忘在那儿。'),
      ];
      if (has('sustained')) return [
        sister('值日排好了。努拉，明天先上课，再做工。'),
        hero('父亲还在等。我也想把这页学完。'),
        sister('我们轮流递信。也留一点时间给你。'),
      ];
      if (cameFrom('n27', 'archive')) return [
        hero('课停了。名单核对好，等愿意带信的人。'),
        sister('不愿署名的人划掉了。剩下的再核一遍。'),
        hero('姐姐，我想把这一切写出去。'),
      ];
      if (cameFrom('n28', 'post') || cameFrom('n29', 'evidence')) return [
        hero('记录交给阿齐兹了。回话还要等。'),
        sister('副本留着。今晚先安排母亲和萨米。'),
        hero('姐姐，我该怎么走？这些字，我还想写下去。'),
      ];
      if (cameFrom('n26', 'shelter') || cameFrom('n29', 'together')) return [
        sister(has('sisterHurt') || has('sisterTreated') ? '脚还不能使力。今晚能留在这里就好。' : '先铺好被褥。母亲和萨米可以躺下了。'),
        mother('法里达只答应这一夜。明天再商量。'),
        hero('父亲的消息还得问。今晚我先照顾你们。'),
      ];
      if (cameFrom('n28', 'address')) return [
        hero('新地址留好了。父亲依旧没有回信。'),
        sister('母亲睡稳了一会儿。先别把今天全划掉。'),
        hero('那我先烧水，明天再去递信。'),
      ];
      return [
        hero('姐姐，我该怎么走？我还是想把父亲带回来。'),
        sister('我也想。先坐一会儿，我们一起写下一封信。'),
        line('萨米', 'brother', '那小火苗的故事，还讲吗？'),
        hero('讲。它也还没有走完。'),
      ];
    default:
      return [];
  }
}
