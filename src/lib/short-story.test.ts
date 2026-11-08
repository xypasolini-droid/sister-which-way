import { describe, expect, it } from 'vitest';
import { REVISION_FIVE_ENDINGS as ENDINGS, choose, createInitialState, createRevisionFiveState, getChoices, getEnding, getNode, validateBranchState, type BranchState } from './branch-story';
import { getSceneEncounter } from './scene-encounter';
import { getSceneDialogue } from './scene-dialogue';
import { getCompanionStatus, getHeroDisplayName } from './story-presentation';
import { SHORT_ENDING_TEST_ROUTES } from './story-test-routes';

function play(route: string[], initial = createRevisionFiveState()) {
  return route.reduce((state, action) => {
    const result = choose(state, action);
    if (!result) throw new Error(`${state.nodeId}/${action}`);
    return result.state;
  }, initial);
}
function explore() {
  const states: BranchState[] = [], terminal: BranchState[] = [];
  const pending = [createRevisionFiveState()];
  while (pending.length) {
    const state = pending.pop()!;
    states.push(state);
    if (state.endingId) { terminal.push(state); continue; }
    if (state.history.length >= 7) throw new Error(`Extra click at ${state.nodeId}`);
    const actions = getChoices(state).filter(choice => choice.enabled);
    if (!actions.length) throw new Error(`Soft lock at ${state.nodeId}`);
    for (const action of actions) pending.push(choose(state, action.id)!.state);
  }
  return { states, terminal };
}
const explored = explore();

describe('seven decisions and five genuinely different fates', () => {
  it('keeps every fate discoverable from all 96 early routes through the visible later actions', () => {
    expect(explored.states).toHaveLength(1210);
    expect(explored.terminal).toHaveLength(768);
    const counts = Object.fromEntries(ENDINGS.map(ending => [ending.id, explored.terminal.filter(state => state.endingId === ending.id).length]));
    expect(counts).toEqual({ reunited: 96, caravan: 192, lantern: 288, dream_guardian: 96, dream_commons: 96 });
  });
  it('starts with a child’s immediate response, never asking her to identify or record her persecutor', () => {
    const state = createRevisionFiveState();
    const node = getNode(state), encounter = getSceneEncounter(state);
    expect(node.title).toBe(encounter.title);
    expect(encounter.points.map(point => point.label)).toEqual(getChoices(state).map(choice => choice.label));
    const text = [encounter.goal, ...node.choices.flatMap(choice => [choice.label, choice.detail, choice.consequence])].join('');
    expect(text).not.toMatch(/留下见证|记下.*名字|保住.*线索|请熟客记住/);
    expect(node.choices.map(choice => choice.label)).toEqual(['蹲下来，帮父亲捡起摊上的东西', '看向卖饼的熟人：“能帮帮我们吗？”', '靠近父亲，小声问：“是我的错吗？”']);
  });
  it('settles every legal route on its seventh chosen action, without an eighth next button', () => {
    expect(ENDINGS).toHaveLength(5);
    expect([...new Set(explored.terminal.map(state => state.endingId))].sort()).toEqual(ENDINGS.map(ending => ending.id).sort());
    for (const state of explored.terminal) {
      expect(state.history).toHaveLength(7);
      expect(state.nodeId).toBe('n30');
      expect(state.storyRevision).toBe(5);
      expect(choose(state, 'live')).toBeNull();
      expect(choose(state, 'dream_guardian')).toBeNull();
      expect(choose(state, 'dream_commons')).toBeNull();
      expect(validateBranchState(state)).toEqual(state);
    }
    for (const state of explored.states) for (const value of Object.values(state.stats)) expect(value).toBeGreaterThanOrEqual(0);
  });
  it('provides five concrete UI routes and never hides a sixth ending below another title', () => {
    for (const [id, route] of Object.entries(SHORT_ENDING_TEST_ROUTES)) {
      const state = play(route);
      expect(state.endingId).toBe(id);
      const ending = getEnding(state)!;
      expect(ending.title).toBe(ENDINGS.find(item => item.id === id)!.title);
      expect(ending.paragraphs).toEqual(ENDINGS.find(item => item.id === id)!.paragraphs);
    }
    for (const state of explored.terminal) expect(getEnding(state)!.title).toBe(ENDINGS.find(ending => ending.id === state.endingId)!.title);
  });
  it('makes boarding versus turning back change who leaves with the family', () => {
    const before = play(['work','sew','buy','pact','care','find']);
    const boarding = choose(before, 'register')!.state;
    const turningBack = choose(before, 'child')!.state;
    expect(boarding.endingId).toBe('caravan');
    expect(boarding.sister).toBe('beside');
    expect(boarding.flags).toEqual(expect.arrayContaining(['boarded','familyTogether']));
    expect(boarding.flags).not.toContain('heroStayed');
    expect(turningBack.endingId).toBe('lantern');
    expect(turningBack.sister).toBe('apart');
    expect(turningBack.flags).toEqual(expect.arrayContaining(['familyDeparted','heroStayed','friendTogether','guideGrown']));
    expect(turningBack.flags).not.toContain('boarded');
    expect(turningBack.history.at(-1)!.consequence).toContain('不要回头等我');
    expect(getEnding(turningBack)!.paragraphs.join('')).toContain('几年后');
    expect(before.endingId).toBeNull();
  });
  it('lets every prior route choose the costly, performed preparation before rescue', () => {
    const waiting = explored.states.filter(state => state.nodeId === 'n25');
    expect(waiting).toHaveLength(96);
    for (const state of waiting) {
      expect(state.flags).toEqual(expect.arrayContaining(['pact', 'guardKnown', 'guardBond', 'rescuePrepared']));
      expect(getChoices(state).find(choice => choice.id === 'release')!.enabled).toBe(true);
      const preparation = state.history.at(-1)!.consequence;
      expect(preparation).toContain('几次');
      expect(preparation).toContain('少接了许多活');
      expect(preparation).toContain('错过较早的离城车');
      expect(preparation).toContain('最后一趟');
      expect(getNode(state).paragraphs.join('')).toContain('几天过去');
      expect(getSceneDialogue(state).map(line => line.text).join('')).not.toMatch(/没答应|晚了一步|补送消息/);
      expect(choose(state, 'release')!.state.endingId).toBe('reunited');
      expect(choose(state, 'letter')!.state.endingId).toBe('caravan');
      expect(choose(state, 'leave')!.state.endingId).toBe('lantern');
    }
    const rescued = play(SHORT_ENDING_TEST_ROUTES.reunited);
    expect(rescued.father).toBe('free');
    expect(rescued.flags).toContain('familyTogether');
    expect(rescued.history.at(-1)!.consequence).toMatch(/跛行，需要腋拐支撑/);
    expect(rescued.flags).not.toContain('boarded');
  });
  it('repairs an earlier silence through a shown return and several visits, rather than an invisible flag', () => {
    const afterSilence = play(['work','cut','buy','pact','secret']);
    expect(afterSilence.flags).not.toContain('pact');
    expect(afterSilence.flags).not.toContain('guardBond');
    const atNorthGate = choose(afterSilence, 'plan')!.state;
    expect(atNorthGate.flags).toEqual(expect.arrayContaining(['pact', 'guardBond', 'rescuePrepared']));
    expect(atNorthGate.history.at(-1)!.consequence).toContain('补上此前没有守住的约定');
    expect(atNorthGate.history.at(-1)!.consequence).toContain('几次往来以后');
    expect(atNorthGate.history.at(-1)!.consequence).toContain('另一张纸');
    expect(atNorthGate.history.at(-1)!.consequence).not.toMatch(/一次请求|拿信换/);
  });
  it('offers three distinct present actions at every alley arrival without a hidden early morality gate', () => {
    const arrivals = explored.states.filter(state => state.nodeId === 'n22');
    expect(arrivals).toHaveLength(96);
    for (const state of arrivals) {
      const actions = getChoices(state);
      expect(actions.map(choice => choice.id)).toEqual(['school', 'father', 'send']);
      expect(actions.every(choice => choice.enabled)).toBe(true);
      const escort = choose(state, 'send')!.state;
      const guard = choose(state, 'father')!.state;
      const teacher = choose(state, 'school')!.state;
      expect(escort.endingId).toBe('lantern');
      expect(guard.endingId).toBe('dream_guardian');
      expect(teacher.endingId).toBe('dream_commons');
      expect(guard.flags).toContain('girlsProtected');
      expect(teacher.flags).toContain('namesShared');
      expect(getEnding(guard)!.dream).toBe(true);
      expect(getEnding(teacher)!.dream).toBe(true);
    }
  });
  it('preserves the real family departure, father’s captivity and injuries inside both dream endings', () => {
    for (const id of ['dream_guardian', 'dream_commons']) {
      const route = SHORT_ENDING_TEST_ROUTES[id];
      const before = play(route.slice(0,-1));
      const after = choose(before, route.at(-1)!)!.state;
      expect(after.sister).toBe('apart');
      expect(after.father).toBe(before.father);
      expect(after.stats).toEqual(before.stats);
      expect(after.flags).toContain('motherHurt');
      expect(after.flags).toContain('familyDeparted');
      expect(after.flags).not.toContain('released');
      expect(after.flags).not.toContain('boarded');
      expect(getEnding(after)!.cost).toContain('现实');
      expect(getEnding(after)!.dream).toBe(true);
    }
  });
  it('has no arithmetic gate or dead end and maps every scene hotspot to a real current action', () => {
    for (const state of explored.states.filter(state => !state.endingId)) {
      const choices = getChoices(state);
      for (const choice of choices) expect(choice.requires?.some(requirement => requirement.stat)).toBeFalsy();
      for (const point of getSceneEncounter(state).points) expect(choices.some(choice => choice.id === point.choiceId), `${state.nodeId}/${point.choiceId}`).toBe(true);
    }
  });
  it('retains the arrest, beating, disguise and flame name across every shortened path', () => {
    for (const state of explored.states) {
      if (state.nodeId === 'n06') {
        expect(state.father).toBe('missing');
        expect(state.flags).toContain('motherHurt');
        expect(getNode(state).paragraphs.join('')).toMatch(/殴打|被巡查/);
      }
      if (state.nodeId === 'n07') expect(state.flags).toContain('disguise');
      if (['n09','n10','n13'].includes(state.nodeId)) expect(state.flags).toEqual(expect.arrayContaining(['aliasAatish','friendMet']));
    }
  });
  it('keeps Hala’s letter with Amin and treats repeated lessons as a chosen relationship', () => {
    const before = play(['work','sew','buy','truth']);
    expect(getNode(before).paragraphs.join('')).toContain('妻子');
    for (const id of ['verify','courier','sister']) {
      const after = choose(before,id)!.state;
      expect(after.flags).toContain('guardKnown');
      expect(after.flags.includes('guardBond')).toBe(id === 'courier');
      expect(after.history.at(-1)!.consequence).not.toMatch(/把信带回家|带着信去拘留/);
    }
  });
  it('keeps the workshop return and the later alley meeting in the right order', () => {
    const workshop = play(['neighbor','cut','buy','hide']);
    expect(getNode(workshop).paragraphs.join('')).toContain('莱拉送完货回到后门');
    expect(getSceneDialogue(workshop).find(line=>line.actor==='friend')!.text).toContain('我回来接你');
    const alley = play(['work','sew','buy','pact','care','rush']);
    expect(alley.history.at(-1)!.consequence).toContain('去找莱拉');
    expect(alley.history.at(-1)!.consequence).not.toMatch(/退进.*侧门|带.*女孩.*进/);
    expect(getNode(alley).paragraphs[0]).toContain('你找到莱拉时');
    const action = getChoices(alley).find(choice=>choice.id==='father')!;
    expect(action.label).toContain('让莱拉带她们进门');
    expect(action.label).not.toContain('成年童话');
    expect(choose(alley,'father')!.state.flags).toContain('girlsProtected');
    expect(choose(alley,'school')!.state.flags).toContain('namesShared');
  });
  it('starts the building dream with the current lesson without inventing earlier records or care', () => {
    const dream = play(['mother','cut','buy','pact','secret','rush','school']);
    expect(dream.endingId).toBe('dream_commons');
    for (const flag of ['recordPractice','literacyPractice','carePractice']) expect(dream.flags).not.toContain(flag);
    expect(dream.flags).toContain('namesShared');
    const text = getEnding(dream)!.paragraphs.join('');
    expect(text).toContain('再陪她画下不会写的第一笔');
    expect(text).not.toMatch(/你曾陪阿明|获准留下被扣报酬的记录|接过姐姐的水盆|你曾选择让一段遭遇被记住/);
  });
  it('knows the heroine is back beside the truck and is grown in the mountain ending', () => {
    const truck = play(SHORT_ENDING_TEST_ROUTES.caravan.slice(0,-1));
    expect(getCompanionStatus(truck).label).toContain('已回到');
    expect(getCompanionStatus(truck).label).not.toMatch(/还没有回到|未归/);
    const guide = play(SHORT_ENDING_TEST_ROUTES.lantern);
    expect(getHeroDisplayName(guide)).toBe('成年的阿提什');
  });
  it('authenticates the new revision rather than accepting copied resources, flags, destinations or a removed revision marker', () => {
    const state = play(SHORT_ENDING_TEST_ROUTES.lantern);
    expect(validateBranchState(state)).toEqual(state);
    expect(validateBranchState({...state, stats:{...state.stats,coins:99}})).toBeNull();
    expect(validateBranchState({...state, flags:[...state.flags,'released']})).toBeNull();
    expect(validateBranchState({...state, nodeId:'n04'})).toBeNull();
    expect(validateBranchState({...state, storyRevision:undefined})).toBeNull();
    expect(validateBranchState({...state, edition:undefined})).toBeNull();
  });
  it('keeps completed old stories explicitly archived rather than pretending the new mountain story happened', () => {
    const initial = createRevisionFiveState(); delete initial.storyRevision; delete initial.storyContentRevision;
    const old = play(['work','sew','buy','pact','care','rush','school','live'], initial);
    expect(old.storyRevision).toBeUndefined();
    const restored = validateBranchState(old)!;
    expect(restored).toEqual(old);
    expect(restored.flags).not.toContain('guideGrown');
    expect(getEnding(restored)!.title).toContain('旧版结局');
    expect(getEnding(restored)!.summary).toContain('旧版路线');
    expect(getEnding(restored)!.paragraphs.join('')).not.toContain('秘密山路');
  });
  it('does not reinterpret an old wage-taking action as consenting to physical confrontation', () => {
    const initial = createRevisionFiveState(); delete initial.storyRevision; delete initial.storyContentRevision;
    const old = play(['neighbor','sew','buy','hide','wage'], initial);
    expect(old.history).toHaveLength(5);
    const restored = validateBranchState(old)!;
    expect(restored.nodeId).toBe('n01');
    expect(restored.history).toHaveLength(0);
    expect(restored.flags).not.toContain('workerProtected');
    expect(restored.flags).not.toContain('protectedSomeone');
  });
  it('migrates active old short saves without consenting to newly changed late choices', () => {
    const initial = createRevisionFiveState(); delete initial.storyRevision; delete initial.storyContentRevision;
    const early = play(['work','sew'], initial);
    const migratedEarly = validateBranchState(early)!;
    expect(migratedEarly.nodeId).toBe('n01');
    expect(migratedEarly.history).toHaveLength(0);
    expect(migratedEarly.storyRevision).toBe(5);
    const late = play(['work','sew','buy','pact','care','rush','school'], initial);
    const migratedLate = validateBranchState(late)!;
    expect(migratedLate.nodeId).toBe('n01');
    expect(migratedLate.history).toHaveLength(0);
    expect(migratedLate.endingId).toBeNull();
    expect(migratedLate.flags).not.toContain('familyDeparted');
    expect(getChoices(migratedLate).some(choice=>choice.enabled)).toBe(true);
  });
  it('authenticates and preserves completed 0.5.0 revision-five fates without counting them as current content', () => {
    const initial = createRevisionFiveState(); delete initial.storyContentRevision;
    for (const route of [
      ['work','sew','buy','truth','courier','plan','release'],
      ['work','sew','buy','pact','care','find','register'],
      ['work','sew','buy','pact','care','find','child'],
      ['work','sew','buy','pact','care','rush','father'],
      ['neighbor','sew','buy','truth','courier','rush','school'],
    ]) {
      const old = play(route, initial);
      const restored = validateBranchState(old)!;
      expect(restored).toEqual(old);
      expect(restored.storyContentRevision).toBeUndefined();
      expect(getEnding(restored)!.title).toContain('旧版结局');
      expect(restored.endingId).toBe(old.endingId);
      expect(validateBranchState({ ...old, stats: { ...old.stats, coins: 99 } })).toBeNull();
      expect(validateBranchState({ ...old, storyContentRevision: 6 })).toBeNull();
    }
  });
  it('never treats an old unprepared north-gate choice as consent to the new multi-day preparation', () => {
    const initial = createRevisionFiveState(); delete initial.storyContentRevision;
    const old = play(['work','cut','buy','pact','secret','plan'], initial);
    expect(getChoices(old).find(choice => choice.id === 'release')!.enabled).toBe(false);
    const restored = validateBranchState(old)!;
    expect(restored.nodeId).toBe('n01');
    expect(restored.storyContentRevision).toBe(6);
    expect(restored.history).toHaveLength(0);
    expect(restored.flags).not.toContain('rescuePrepared');
    expect(validateBranchState(restored)).toEqual(restored);
  });
});
