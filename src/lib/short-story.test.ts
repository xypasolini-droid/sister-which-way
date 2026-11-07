import { describe, expect, it } from 'vitest';
import { ENDINGS, choose, createInitialState, getChoices, getEnding, getNode, validateBranchState, type BranchState } from './branch-story';
import { getSceneEncounter } from './scene-encounter';
import { getSceneDialogue } from './scene-dialogue';
import { getCompanionStatus, getHeroDisplayName } from './story-presentation';
import { SHORT_ENDING_TEST_ROUTES } from './story-test-routes';

function play(route: string[], initial = createInitialState('short')) {
  return route.reduce((state, action) => {
    const result = choose(state, action);
    if (!result) throw new Error(`${state.nodeId}/${action}`);
    return result.state;
  }, initial);
}
function explore() {
  const states: BranchState[] = [], terminal: BranchState[] = [];
  const pending = [createInitialState('short')];
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
  it('makes the early sister promise and repeated literacy visits independently necessary for rescue', () => {
    const bonded = play(['work','sew','buy','truth','courier','plan']);
    const noPromise = play(['work','cut','buy','truth','courier','plan']);
    const noLessons = play(['work','sew','buy','truth','verify','plan']);
    expect(getChoices(bonded).find(choice => choice.id === 'release')!.enabled).toBe(true);
    for (const state of [noPromise, noLessons]) {
      expect(getChoices(state).find(choice => choice.id === 'release')!.enabled).toBe(false);
      expect(choose(state, 'release')).toBeNull();
      expect(choose(state, 'letter')!.state.endingId).toBe('caravan');
      expect(choose(state, 'leave')!.state.endingId).toBe('lantern');
    }
    const rescued = choose(bonded, 'release')!.state;
    expect(rescued.father).toBe('free');
    expect(rescued.flags).toContain('familyTogether');
    expect(rescued.history.at(-1)!.consequence).toMatch(/跛行，需要腋拐支撑/);
    expect(rescued.history.at(-1)!.consequence).toContain('木推车');
    expect(rescued.flags).not.toContain('boarded');
  });
  it('does not let a late decision magically repair an earlier broken promise', () => {
    const afterSilence = play(['work','sew','buy','pact','secret']);
    expect(afterSilence.flags).not.toContain('pact');
    const atNorthGate = choose(afterSilence, 'plan')!.state;
    expect(atNorthGate.flags).not.toContain('pact');
    expect(atNorthGate.history.at(-1)!.consequence).toContain('错过');
  });
  it('unlocks the two adult dreams through different earlier actions, never through an arbitrary last menu', () => {
    const protection = play(['work','cut','buy','hide','wage','rush']);
    const records = play(['neighbor','cut','buy','hide','ledger','rush']);
    expect(getChoices(protection).find(choice => choice.id === 'father')!.enabled).toBe(true);
    expect(getChoices(protection).find(choice => choice.id === 'school')!.enabled).toBe(false);
    expect(getChoices(records).find(choice => choice.id === 'father')!.enabled).toBe(false);
    expect(getChoices(records).find(choice => choice.id === 'school')!.enabled).toBe(true);
    expect(choose(protection, 'father')!.state.endingId).toBe('dream_guardian');
    expect(choose(records, 'school')!.state.endingId).toBe('dream_commons');
    for (const state of [protection, records]) expect(getChoices(state).find(choice => choice.id === 'send')!.enabled).toBe(true);
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
  it('lets the market witness lead to the building dream without inventing literacy lessons or a care visit', () => {
    const dream = play(['neighbor','cut','buy','hide','wage','rush','school']);
    expect(dream.endingId).toBe('dream_commons');
    expect(dream.flags).toContain('recordPractice');
    expect(dream.flags).not.toContain('literacyPractice');
    expect(dream.flags).not.toContain('carePractice');
    const text = getEnding(dream)!.paragraphs.join('');
    expect(text).toContain('让一段遭遇被记住');
    expect(text).not.toMatch(/你曾陪阿明|获准留下被扣报酬的记录|接过姐姐的水盆/);
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
    const initial = createInitialState('short'); delete initial.storyRevision;
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
    const initial = createInitialState('short'); delete initial.storyRevision;
    const old = play(['neighbor','sew','buy','hide','wage'], initial);
    expect(old.history).toHaveLength(5);
    const restored = validateBranchState(old)!;
    expect(restored.nodeId).toBe('n10');
    expect(restored.history).toHaveLength(4);
    expect(restored.flags).not.toContain('workerProtected');
    expect(restored.flags).not.toContain('protectedSomeone');
  });
  it('migrates active old short saves without consenting to newly changed late choices', () => {
    const initial = createInitialState('short'); delete initial.storyRevision;
    const early = play(['work','sew'], initial);
    const migratedEarly = validateBranchState(early)!;
    expect(migratedEarly.nodeId).toBe('n06');
    expect(migratedEarly.history.map(step=>step.choiceId)).toEqual(['work','sew']);
    expect(migratedEarly.storyRevision).toBe(5);
    const late = play(['work','sew','buy','pact','care','rush','school'], initial);
    const migratedLate = validateBranchState(late)!;
    expect(migratedLate.nodeId).toBe('n18');
    expect(migratedLate.history).toHaveLength(5);
    expect(migratedLate.endingId).toBeNull();
    expect(migratedLate.flags).not.toContain('familyDeparted');
    expect(getChoices(migratedLate).some(choice=>choice.enabled)).toBe(true);
  });
});
