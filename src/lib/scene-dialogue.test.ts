import { describe, expect, it } from 'vitest';
import { NODES, SISTER_OFFSTAGE_NODES, choose, createInitialState, type BranchState } from './branch-story';
import { getSceneDialogue, type SceneDialogueLine } from './scene-dialogue';

function at(nodeId: string, changes: Partial<BranchState> = {}): BranchState {
  return { ...createInitialState(), nodeId, father: nodeId === 'n01' ? 'free' : 'missing', ...changes };
}

function assertShortExchange(state: BranchState) {
  const lines = getSceneDialogue(state);
  const context = `${state.nodeId}: ${state.flags.join(',')}, ${state.sister}, ${state.father}`;
  expect(lines.length, context).toBeGreaterThanOrEqual(2);
  expect(lines.length, context).toBeLessThanOrEqual(4);
  expect(new Set(lines.map(line => line.speaker)).size, context).toBeGreaterThanOrEqual(2);
  for (const line of lines) {
    expect(line.text.trim().length, context).toBeGreaterThan(0);
    expect([...line.text].length, `${context}: ${line.text}`).toBeLessThanOrEqual(22);
  }
}

const spoken = (lines: SceneDialogueLine[]) => lines.map(line => line.text).join('\n');
const actorText = (lines: SceneDialogueLine[], actor: SceneDialogueLine['actor']) => spoken(lines.filter(line => line.actor === actor));

// Transition fixtures exercise authored handoffs, not fabricated full playthroughs.
// The engine suite separately checks legal routes from the opening scene.
function afterAction(nodeId: string, choiceId: string): BranchState {
  const result = choose(at(nodeId, {
    father: ['n01', 'n02'].includes(nodeId) ? 'free' : 'located',
    stats: { food: 10, coins: 10, trust: 10, hope: 10, exposure: 0, health: 10 },
    flags: ['disguise', 'aliasAatish', 'friendMet', 'evidence', 'guardKnown', 'guardBond', 'documents', 'escortConfirmed'],
  }), choiceId);
  expect(result, `${nodeId}:${choiceId} should have a transition fixture`).not.toBeNull();
  return result!.state;
}

// A consequence can be condensed, but its causal fact must reach the main screen.
// Every non-ending action has a cue, including different paths into the same scene.
const HANDOFF_CUES: Record<string, string> = {
  'n01:work': '押去拘留院', 'n01:neighbor': '押去拘留院', 'n01:mother': '押去拘留院',
  'n02:cut': '放了我丈夫', 'n02:sew': '放了我丈夫',
  'n03:buy': '被打得下不了床', 'n03:share': '被打得下不了床', 'n03:carry': '被打得下不了床',
  'n04:day': '怎么没有饼', 'n04:learn': '带饼回来了',
  'n05:flour': '阿里去世', 'n05:names': '阿里去世',
  'n06:buy': '剪了头发', 'n06:help': '自己剪的',
  'n07:truth': '跑腿挣了饭', 'n07:hide': '莱拉介绍', 'n07:pact': '饼带回来了',
  'n08:queue': '推疼你了吗', 'n08:alley': '错过送信人', 'n08:neighbor': '送水人传了话',
  'n09:verify': '阿明说父亲被押进这里', 'n09:courier': '阿明学了几个字', 'n09:sister': '没答应放人',
  'n10:wage': '工钱拿到了', 'n10:ledger': '工钱却还没讨回来',
  'n11:testimony': '邻居看见父亲被押进北门', 'n11:school': '只开一小时', 'n11:medicine': '药我原样带回来了',
  'n12:petition': '托人送来的名字收到了', 'n12:forms': '门房不准见父亲', 'n12:wait': '只确认他还在',
  'n13:listen': '不该冲你喊', 'n13:secret': '母亲和萨米去法里达家', 'n13:care': '昨晚我照看母亲',
  'n14:teach': '怕得不敢再写', 'n14:hide': '只能拿抄本', 'n14:leave': '孩子送回家了',
  'n15:treat': '复诊日', 'n15:share': '送药换了诊费',
  'n16:register': '文书办好了', 'n16:route': '借宿的门', 'n16:risk': '我被骗了',
  'n17:copy': '名单抄好了', 'n17:family': '没敢带整张名单',
  'n18:plan': '清点好了', 'n18:find': '没同意那门婚事', 'n18:rush': '巡查推你',
  'n19:rescue': '纸又被退回来了', 'n19:caravan': '少一个也得走', 'n19:stay': '已经回绝',
  'n20:submit': '读信、教的那些字', 'n20:press': '跌下台阶', 'n20:wait': '又不准探视',
  'n21:register': '不肯丢下你', 'n21:child': '我们回来了', 'n21:search': '母亲不肯',
  'n22:school': '值日表', 'n22:father': '院子安顿好了', 'n22:send': '我去作坊挣钱',
  'n23:repair': '按姐姐的办法留宿', 'n23:ask': '守副本', 'n23:apart': '接受分住',
  'n24:treat': '包扎后留在内院', 'n24:carry': '推车借来了', 'n24:stay': '脚还不能落地',
  'n25:release': '阿明冒着炮火', 'n25:letter': '阿明没能救出父亲', 'n25:leave': '没接到父亲',
  'n26:board': '舅舅亲自来接', 'n26:shelter': '只答应这一夜', 'n26:seat': '继续递信',
  'n27:sustain': '值日排好了', 'n27:archive': '课停了', 'n27:send': '课堂停了',
  'n28:address': '新地址留好了', 'n28:post': '记录交给阿齐兹', 'n28:depart': '没等到信就搬走',
  'n29:together': '只答应这一夜', 'n29:apart': '作坊后间', 'n29:evidence': '记录交给阿齐兹',
};

describe('scene dialogue pacing and continuity', () => {
  it('uses same-day and overnight language consistent with the actual scene dates', () => {
    expect(NODES.n07.day).toBe(NODES.n08.day);
    const marketReturn = spoken(getSceneDialogue(afterAction('n07', 'truth')));
    expect(marketReturn).toContain('刚才跑腿');
    expect(marketReturn).not.toMatch(/昨天跑腿|第二天/);

    expect(NODES.n15.day).toBe(NODES.n13.day + 1);
    expect(spoken(getSceneDialogue(afterAction('n13', 'care')))).toContain('昨晚我照看母亲');

    expect(NODES.n28.day).toBe(NODES.n24.day + 1);
    const afterClinic = spoken(getSceneDialogue(afterAction('n24', 'stay')));
    expect(afterClinic).toContain('诊所只许短留');
    expect(afterClinic).not.toContain('医师说今晚');
  });

  it('performs the arrest on screen before the family goes to demand release', () => {
    const arrest = getSceneDialogue(afterAction('n01', 'work'));
    expect(arrest).toHaveLength(4);
    expect(arrest[0].text).toContain('白天还敢顶嘴');
    expect(arrest[0].text).toContain('押去拘留院');
    expect(arrest[1].actor).toBe('mother');
    expect(arrest[1].text).toContain('抓他');
    expect(arrest[2].actor).toBe('father');
    expect(arrest[3].actor).toBe('hero');
    expect(arrest[3].text).toContain('别关门');
    const demand = getSceneDialogue(afterAction('n02', 'cut'));
    expect(actorText(demand, 'mother')).toContain('放了我丈夫');
    expect(spoken(demand)).toContain('男性亲属陪同');
    expect(actorText(demand, 'hero')).toContain('别打了');
  });

  it('covers every incoming action with its causal fact instead of hiding it in the journal', () => {
    const edges = Object.values(NODES).flatMap(node => node.choices.filter(choice => !choice.finish).map(choice => `${node.id}:${choice.id}`));
    expect(Object.keys(HANDOFF_CUES).sort()).toEqual(edges.sort());
    for (const edge of edges) {
      const [nodeId, choiceId] = edge.split(':');
      const state = afterAction(nodeId, choiceId);
      assertShortExchange(state);
      expect(spoken(getSceneDialogue(state)), edge).toContain(HANDOFF_CUES[edge]);
    }
  });

  it('lets the mother acknowledge initiating the marriage proposal herself', () => {
    const present = getSceneDialogue(at('n18'));
    expect(actorText(present, 'mother')).toContain('我写信');
    expect(actorText(present, 'mother')).toContain('最小的儿子');
    expect(actorText(present, 'sister')).toContain('我不愿意');
    const apart = getSceneDialogue(at('n18', { sister: 'apart' }));
    expect(spoken(apart)).toContain('母亲写信');
    expect(apart.some(line => line.actor === 'mother' || line.actor === 'sister')).toBe(false);
  });

  it('shows both parents returning through their separate decisions on the rescue route', () => {
    const lines = getSceneDialogue(afterAction('n25', 'release'));
    expect(actorText(lines, 'father')).toContain('阿明');
    expect(actorText(lines, 'father')).toContain('侧门');
    expect(actorText(lines, 'mother')).toContain('不能丢下你');
    expect(actorText(lines, 'hero')).toContain('你们怎么回来了');
  });

  it('preserves injury and confirmed captivity while waiting', () => {
    const injured = getSceneDialogue(at('n28', {
      father: 'located', flags: ['sisterTreated'],
      history: [{ nodeId: 'n25', choiceId: 'letter', label: '', consequence: '' }],
    }));
    expect(actorText(injured, 'sister')).toContain('脚还疼');
    expect(actorText(injured, 'hero')).toContain('父亲还在');
    const apart = getSceneDialogue(at('n28', { father: 'located', sister: 'apart' }));
    expect(spoken(apart)).not.toContain('你到底在哪儿');
    expect(actorText(apart, 'hero')).toContain('父亲还被关着');
  });
  it('gives every authored scene a short exchange rather than a prose click-through', () => {
    for (const nodeId of Object.keys(NODES)) assertShortExchange(at(nodeId));
  });

  it('keeps conditional exchanges within the same reading budget', () => {
    const states = [
      at('n12', { flags: ['guardKnown'] }),
      at('n13', { flags: ['honest'] }),
      at('n17', { flags: ['guardBond'] }),
      at('n18', { sister: 'apart' }),
      at('n22', { flags: ['marriageRefused'] }),
      at('n23', { flags: ['motherSearching'] }),
      at('n25', { flags: ['guardBond'] }),
      at('n25', { stats: { ...createInitialState().stats, exposure: 9 } }),
      at('n26', { flags: ['motherReturned', 'relativePressure', 'escortConfirmed'] }),
      at('n28', { sister: 'apart' }),
      ...(['missing', 'located', 'free'] as const).flatMap(father =>
        (['beside', 'apart'] as const).map(sister => at('n30', { father, sister }))),
      at('n30', { flags: ['boarded'] }),
      at('n30', { flags: ['sustained'] }),
    ];
    for (const state of states) assertShortExchange(state);
  });

  it('does not send a separated heroine to look for a father who is already free', () => {
    const lines = getSceneDialogue(at('n30', { father: 'free', sister: 'apart' }));
    expect(actorText(lines, 'hero')).toContain('父亲已经在我这里');
    expect(actorText(lines, 'hero')).toContain('照顾');
    expect(spoken(lines)).not.toMatch(/问父亲的消息|父亲.*在哪|继续找父亲/);
    expect(lines.some(line => line.actor === 'sister')).toBe(false);
    expect(lines.some(line => line.actor === 'narrator' && line.speaker.includes('临行'))).toBe(true);
  });

  it('distinguishes meeting Amin for the first time from asking for him when he is off duty', () => {
    const firstMeeting = getSceneDialogue(at('n12'));
    expect(actorText(firstMeeting, 'guard')).toContain('信');
    expect(actorText(firstMeeting, 'hero')).toContain('死于战火');
    expect(actorText(firstMeeting, 'guard')).toContain('妻子');
    expect(spoken(firstMeeting)).not.toContain('今天不在');

    const alreadyKnown = getSceneDialogue(at('n12', { flags: ['guardKnown'] }));
    expect(alreadyKnown.some(line => line.actor === 'guard')).toBe(false);
    expect(alreadyKnown.some(line => line.speaker === '门房' && line.actor === 'narrator')).toBe(true);
    expect(spoken(alreadyKnown)).toContain('阿明今天不在');
  });

  it('shows literacy building the guard relationship before using established trust', () => {
    const firstLesson = getSceneDialogue(at('n17'));
    expect(actorText(firstLesson, 'guard')).toContain('教我认');
    expect(actorText(firstLesson, 'guard')).toContain('他还在名册上');
    expect(actorText(firstLesson, 'hero')).toContain('父亲的名字');

    const knownGuard = getSceneDialogue(at('n17', { flags: ['guardBond'] }));
    expect(actorText(knownGuard, 'friend')).toContain('队伍');
    expect(spoken(knownGuard)).not.toContain('教我认');
  });

  it('does not promise a rescue before trust or after the heroine has been identified', () => {
    const noBond = getSceneDialogue(at('n25'));
    expect(actorText(noBond, 'guard')).toContain('不能答应');
    expect(actorText(noBond, 'guard')).not.toContain('我进去找');
    const identified = getSceneDialogue(at('n25', {
      flags: ['guardBond'], stats: { ...createInitialState().stats, exposure: 9 },
    }));
    expect(actorText(identified, 'guard')).toContain('别再往这边来');
    expect(actorText(identified, 'guard')).not.toContain('我进去找');
  });

  it.each([
    { route: 'ordinary reunion', flags: [] },
    { route: 'return without forced removal', flags: ['motherReturned'] },
    { route: 'relative pressure before any return', flags: ['relativePressure'] },
  ])('does not invent forced departure on the $route route', ({ flags }) => {
    const lines = getSceneDialogue(at('n26', { flags }));
    expect(spoken(lines)).toContain('今晚');
    expect(spoken(lines)).not.toMatch(/贾维德逼我们走|回来找我|你没回来/);
  });

  it('remembers the mother returning after an actual forced-departure scene', () => {
    const returnFlags = getSceneDialogue(at('n26', { flags: ['motherReturned', 'relativePressure'] }));
    const returnHistory = getSceneDialogue(at('n26', {
      history: [{ nodeId: 'n21', choiceId: 'register', label: '', consequence: '' }],
    }));
    for (const lines of [returnFlags, returnHistory]) {
      expect(actorText(lines, 'mother')).toContain('你没回来');
      expect(actorText(lines, 'hero')).toContain('回来找我');
      expect(actorText(lines, 'mother')).toContain('不肯丢下你');
    }
  });

  it('distinguishes refusing the marriage now from recalling an already delivered refusal', () => {
    const pending = getSceneDialogue(at('n22'));
    expect(actorText(pending, 'mother')).toContain('不能替你答应');
    expect(actorText(pending, 'mother')).not.toContain('已经回绝');
    const refused = getSceneDialogue(at('n22', { flags: ['marriageRefused'] }));
    expect(actorText(refused, 'mother')).toContain('已经回绝');
  });

  it('does not manufacture a letter merely because the heroine has been honest', () => {
    const lines = getSceneDialogue(at('n13', { flags: ['honest'] }));
    expect(actorText(lines, 'sister')).not.toMatch(/信我看过|又.*监所/);
    expect(actorText(lines, 'sister')).toContain('下一步');
  });

  it('keeps absent family out of live speech and switches n21 to the mother’s viewpoint', () => {
    for (const nodeId of SISTER_OFFSTAGE_NODES) {
      expect(getSceneDialogue(at(nodeId)).some(line => line.actor === 'sister'), nodeId).toBe(false);
    }
    const motherScene = getSceneDialogue(at('n21'));
    expect(motherScene.some(line => line.actor === 'hero')).toBe(false);
    expect(motherScene.some(line => line.actor === 'mother')).toBe(true);
  });
});
