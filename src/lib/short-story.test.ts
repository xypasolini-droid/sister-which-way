import { describe, expect, it } from 'vitest';
import {
  ENDINGS, choose, createInitialState, getChoices, getEnding, getNode,
  validateBranchState, type BranchState,
} from './branch-story';
import { getSceneEncounter, resolveEncounterActivity } from './scene-encounter';

function exploreShortStory() {
  const states: BranchState[] = [];
  const endings = new Map<string, BranchState>();
  const pending = [createInitialState('short')];
  while (pending.length) {
    const state = pending.pop()!;
    states.push(state);
    if (state.endingId) {
      endings.set(state.endingId, state);
      continue;
    }
    if (state.history.length >= 8) throw new Error(`Short story exceeded eight decisions at ${state.nodeId}`);
    const actions = getChoices(state).filter(choice => choice.enabled);
    if (!actions.length) throw new Error(`Short story has no available action at ${state.nodeId}`);
    for (const action of actions) {
      const result = choose(state, action.id);
      if (!result) throw new Error(`Enabled action failed at ${state.nodeId}/${action.id}`);
      pending.push(result.state);
    }
  }
  return { states, endings };
}

describe('the eight-decision short edition', () => {
  const explored = exploreShortStory();

  it('reaches every ending through legal actions within eight decisions', () => {
    expect([...explored.endings.keys()].sort()).toEqual(ENDINGS.map(ending => ending.id).sort());
    const chapters = [
      ['n01'], ['n02'], ['n06'], ['n07'], ['n09', 'n10', 'n13'],
      ['n18'], ['n25', 'n21', 'n22'], ['n30'],
    ];
    for (const state of explored.states) {
      expect(state.edition).toBe('short');
      expect(state.history.length).toBeLessThanOrEqual(8);
      if (state.endingId) {
        expect(state.history).toHaveLength(8);
        expect(choose(state, 'live')).toBeNull();
      } else {
        expect(chapters[state.history.length], `chapter ${state.history.length + 1}`).toContain(state.nodeId);
      }
      for (const value of Object.values(state.stats)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
      }
    }
  });

  it('preserves the arrest, the mother’s injury, the disguise, and the flame name after the condensed journey', () => {
    expect(createInitialState('short').father).toBe('free');
    for (const state of explored.states) {
      if (state.nodeId === 'n06') {
        expect(state.father).toBe('missing');
        expect(state.flags).toContain('motherHurt');
        expect(state.outfit).toBe('cloak');
        const text = `${getNode(state).paragraphs.join('')} ${state.history.at(-1)?.consequence}`;
        expect(text).toMatch(/打|殴|伤/);
        expect(text).toMatch(/买|饼|食物/);
      }
      if (state.nodeId === 'n07') {
        expect(state.outfit).toBe('worker');
        expect(state.flags).toContain('disguise');
      }
      if (['n09', 'n10', 'n13'].includes(state.nodeId)) {
        expect(state.flags).toContain('aliasAatish');
        expect(state.flags).toContain('friendMet');
      }
    }
  });

  it('retains rescue requirements and a playable alternative when they are missing', () => {
    const gate = explored.states.find(state => state.nodeId === 'n25' && getChoices(state).some(choice => choice.id === 'release' && choice.enabled));
    expect(gate, 'a legal short route must support the rescue ending').toBeDefined();
    for (const unavailable of [
      { ...gate!, flags: gate!.flags.filter(flag => flag !== 'guardBond') },
      { ...gate!, stats: { ...gate!.stats, trust: 0 } },
      { ...gate!, stats: { ...gate!.stats, exposure: 10 } },
    ]) {
      expect(getChoices(unavailable).find(choice => choice.id === 'release')?.enabled).toBe(false);
      expect(choose(unavailable, 'release')).toBeNull();
      expect(getChoices(unavailable).some(choice => choice.enabled)).toBe(true);
    }
    for (const state of explored.states.filter(state => state.father === 'free' && state.history.length > 2)) {
      expect(state.history.some(step => step.nodeId === 'n25' && step.choiceId === 'release')).toBe(true);
    }
    for (const state of explored.states.filter(state => state.flags.includes('guardBond'))) {
      expect(state.history.some(step => step.nodeId === 'n09' && step.choiceId === 'courier'),
        'guard trust must grow from the chosen reading and writing relationship').toBe(true);
    }
  });

  it('reunites the sister before shared classroom or household endings after an earlier disagreement', () => {
    const afterDisagreement = explored.states.filter(state => state.nodeId === 'n22' && state.history.some(step => step.nodeId === 'n13' && step.choiceId === 'secret'));
    expect(afterDisagreement.length).toBeGreaterThan(0);
    for (const state of afterDisagreement) {
      for (const choiceId of ['school', 'father']) {
        if (!getChoices(state).find(choice => choice.id === choiceId)?.enabled) continue;
        const after = choose(state, choiceId)!.state;
        expect(after.sister, `n22/${choiceId} describes a shared household`).toBe('beside');
        expect(after.flags).toContain('familyTogether');
        if (choiceId === 'school') expect(choose(after, 'live')!.state.endingId).toBe('lantern');
      }
    }
  });

  it('keeps scene interactions aligned with the short edition’s rewritten choices', () => {
    for (const state of explored.states.filter(state => !state.endingId)) {
      const encounter = getSceneEncounter(state);
      const choices = getChoices(state);
      for (const point of encounter.points) {
        expect(choices.some(choice => choice.id === point.choiceId), `${state.nodeId}/${point.choiceId}`).toBe(true);
      }
      if (encounter.activity) {
        const activity = encounter.activity;
        const selected = activity.solution ?? activity.items.slice(0, activity.required ?? 1).map(item => item.id);
        const snapshot = structuredClone(state);
        const result = resolveEncounterActivity(state, selected);
        expect(result.complete, state.nodeId).toBe(true);
        expect(choices.some(choice => choice.id === result.choiceId), state.nodeId).toBe(true);
        expect(state).toEqual(snapshot);
      }
    }
  });

  it('keeps forced-departure decisions with the mother and does not turn a refusal into consent', () => {
    const departureScenes = explored.states.filter(state => state.nodeId === 'n21');
    expect(departureScenes.length).toBeGreaterThan(0);
    for (const state of departureScenes) {
      const scene = getNode(state);
      expect(scene.paragraphs.join('')).toMatch(/母亲/);
      expect(scene.paragraphs.join('')).toMatch(/拒绝|没有答应|不肯/);
      for (const choice of getChoices(state).filter(choice => choice.enabled)) {
        const result = choose(state, choice.id)!;
        expect(result.state.flags).toContain('marriageRefused');
      }
    }
  });

  it('replays short saves and rejects edition changes, forged resources, and forged destinations', () => {
    for (const state of explored.endings.values()) {
      expect(getEnding(state)?.id).toBe(state.endingId);
      expect(validateBranchState(state)).toEqual(state);
      expect(validateBranchState({ ...state, edition: 'other' })).toBeNull();
      expect(validateBranchState({ ...state, edition: undefined })).toBeNull();
      expect(validateBranchState({ ...state, stats: { ...state.stats, coins: 99 } })).toBeNull();
      expect(validateBranchState({ ...state, nodeId: 'n04' })).toBeNull();
    }
  });

  it('lets dreams preserve the real family, resources, and injuries', () => {
    const before = explored.states.find(state => state.nodeId === 'n30' && !state.endingId)!;
    for (const choiceId of ['dream_guardian', 'dream_commons']) {
      const snapshot = structuredClone(before);
      const after = choose(before, choiceId)!.state;
      expect(after.endingId).toBe(choiceId);
      expect(after.stats).toEqual(before.stats);
      expect(after.flags).toEqual(before.flags);
      expect(after.father).toBe(before.father);
      expect(after.sister).toBe(before.sister);
      expect(after.outfit).toBe(before.outfit);
      expect(before).toEqual(snapshot);
      expect(getEnding(after)?.dream).toBe(true);
    }
  });

  it('keeps existing full-edition saves on their original graph', () => {
    let state = createInitialState();
    expect(state.edition).toBeUndefined();
    state = choose(state, 'work')!.state;
    expect(state.nodeId).toBe('n02');
    state = choose(state, 'sew')!.state;
    expect(state.nodeId).toBe('n03');
    expect(validateBranchState(state)).toEqual(state);
  });
});
