import { describe, expect, it } from 'vitest';
import { ACT_TITLES, ENDINGS, NODES, NODE_COUNT, choose, createInitialState, getChoices, getEnding, getNode, interpretChoice, validateBranchState } from './branch-story';
import { ENDING_TEST_ROUTES, NODE_TEST_ROUTES } from './story-test-routes';

function walk(route: string[], seen = new Set<string>()) {
  let state = createInitialState();
  seen.add(state.nodeId);
  for (const id of route) {
    const action = getChoices(state).find(choice => choice.id === id);
    expect(action?.enabled, `${id} at ${state.nodeId}: ${action?.reason}`).toBe(true);
    const result = choose(state, id);
    expect(result).not.toBeNull();
    state = result!.state;
    seen.add(state.nodeId);
    for (const value of Object.values(state.stats)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
    expect(state.endingId || getChoices(state).some(choice => choice.enabled)).toBeTruthy();
  }
  return state;
}

describe('姐姐，我该怎么走：v3 branch story', () => {
  it('has 30 scenes, eight reality endings and two explicit dreams', () => {
    expect(Object.keys(NODES)).toHaveLength(NODE_COUNT);
    expect(NODE_COUNT).toBe(30);
    expect(ENDINGS).toHaveLength(10);
    expect(new Set(ENDINGS.map(ending => ending.id)).size).toBe(10);
    expect(ENDINGS.filter(ending => ending.dream)).toHaveLength(2);
    for (const node of Object.values(NODES)) {
      expect(node.paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(node.tale.length).toBeGreaterThan(20);
      expect(node.act).toBeGreaterThanOrEqual(1);
      expect(node.act).toBeLessThanOrEqual(ACT_TITLES.length);
      expect(node.choices.length).toBeGreaterThanOrEqual(2);
      expect(node.choices.length).toBeLessThanOrEqual(node.id === 'n30' ? 5 : 3);
      expect(new Set(node.choices.map(choice => choice.id)).size).toBe(node.choices.length);
      for (const choice of node.choices) expect(NODES[choice.next]).toBeDefined();
    }
  });
  for (const [endingId, route] of Object.entries(ENDING_TEST_ROUTES)) {
    it(`reaches ${endingId} by legal actions and restores it from history`, () => {
      const state = walk(route);
      expect(state.endingId).toBe(endingId);
      expect(getEnding(state)?.id).toBe(endingId);
      expect(validateBranchState(state)).toEqual(state);
      expect(choose(state, 'live')).toBeNull();
      expect(getChoices(state).every(choice => !choice.enabled)).toBe(true);
    });
  }
  it('reaches all 30 scenes with actual resources and prerequisites', () => {
    const seen = new Set<string>();
    for (const [nodeId, route] of Object.entries(NODE_TEST_ROUTES)) {
      const state = walk(route, seen);
      expect(state.nodeId).toBe(nodeId);
      expect(state.endingId).toBeNull();
      expect(validateBranchState(state)).toEqual(state);
    }
    expect([...seen].sort()).toEqual(Object.keys(NODES).sort());
  });
  it('changes clothing and family state without mutating earlier frames', () => {
    const before = walk(NODE_TEST_ROUTES.n06);
    const copy = structuredClone(before);
    const disguised = choose(before, 'buy')!.state;
    expect(disguised.outfit).toBe('worker');
    expect(disguised.flags).toContain('disguise');
    expect(before).toEqual(copy);
    expect(before.outfit).toBe('cloak');
    const named = choose(disguised, 'truth')!.state;
    expect(named.flags).toContain('aliasAatish');
    expect(named.flags).toContain('friendMet');
    expect(disguised.flags).not.toContain('aliasAatish');
    const injured = walk(NODE_TEST_ROUTES.n24);
    expect(injured.sister).toBe('injured');
    expect(injured.flags).toContain('sisterHurt');
    expect(injured.flags).toContain('motherHurt');
    expect(walk(ENDING_TEST_ROUTES.reunited).father).toBe('free');
    expect(walk(ENDING_TEST_ROUTES.separated).sister).toBe('apart');
  });
  it('requires the guard relationship for rescue and retains a fallback', () => {
    const before = walk(ENDING_TEST_ROUTES.reunited.slice(0, -2));
    expect(before.nodeId).toBe('n25');
    expect(getChoices(before).find(choice => choice.id === 'release')?.enabled).toBe(true);
    const unknownGuard = { ...before, flags: before.flags.filter(flag => flag !== 'guardBond') };
    expect(getChoices(unknownGuard).find(choice => choice.id === 'release')?.enabled).toBe(false);
    expect(choose(unknownGuard, 'release')).toBeNull();
    expect(getChoices(unknownGuard).some(choice => choice.enabled)).toBe(true);
    const exposed = { ...before, stats: { ...before.stats, exposure: 9 } };
    expect(getChoices(exposed).find(choice => choice.id === 'release')?.enabled).toBe(false);
    expect(getChoices(exposed).find(choice => choice.id === 'letter')?.enabled).toBe(true);
  });
  it('requires confirmed family escort as well as documents before boarding', () => {
    const before = walk(ENDING_TEST_ROUTES.caravan.slice(0, -2));
    expect(before.nodeId).toBe('n26');
    expect(getChoices(before).find(choice => choice.id === 'board')?.enabled).toBe(true);
    for (const prerequisite of ['documents', 'escortConfirmed']) {
      const unavailable = { ...before, flags: before.flags.filter(flag => flag !== prerequisite) };
      expect(getChoices(unavailable).find(choice => choice.id === 'board')?.enabled).toBe(false);
      expect(choose(unavailable, 'board')).toBeNull();
      expect(getChoices(unavailable).find(choice => choice.id === 'shelter')?.enabled).toBe(true);
    }
  });
  it('does not invent actions or treat questions and negations as decisions', () => {
    const state = createInitialState();
    expect(interpretChoice(state, '扶父亲收摊，先离开').choiceId).toBe('work');
    expect(interpretChoice(state, '2').choiceId).toBe('neighbor');
    expect(interpretChoice(state, '请熟客留下见证').choiceId).toBe('neighbor');
    for (const words of ['我不想收摊', '姐姐，我该怎么走？', '变出宇宙飞船', '如果收摊就好了']) expect(interpretChoice(state, words).choiceId).toBeNull();
    expect(state.history).toHaveLength(0);
  });
  it('replays saves and rejects invented counters, destinations and extra decisions', () => {
    const state = walk(ENDING_TEST_ROUTES.caravan);
    expect(validateBranchState({ ...state, stats: { ...state.stats, coins: 99 } })).toBeNull();
    expect(validateBranchState({ ...state, father: 'free' })).toBeNull();
    expect(validateBranchState({ ...state, endingId: 'reunited' })).toBeNull();
    expect(validateBranchState({ ...state, history: [...state.history, { nodeId: 'n30', choiceId: 'live' }] })).toBeNull();
    expect(validateBranchState(null)).toBeNull();
    expect(validateBranchState({ ...state, history: state.history.map(entry => ({ ...entry, consequence: '<script>fake</script>' })) })?.history).toEqual(state.history);
  });
  it('does not make a rescued father missing again in waiting or writing endings', () => {
    const state = walk(ENDING_TEST_ROUTES.reunited.slice(0, -1));
    expect(state.father).toBe('free');
    expect(getChoices(state).find(choice => choice.id === 'wait')?.enabled).toBe(false);
    expect(choose(state, 'wait')).toBeNull();
    const writing = choose(state, 'pages')!.state;
    expect(writing.father).toBe('free');
    expect(getEnding(writing)?.paragraphs.join('')).toContain('父亲已经回到身边');
  });
  it('keeps absent sisters absent and boarded families on the road', () => {
    const apart = walk(ENDING_TEST_ROUTES.separated.slice(0, -1));
    expect(getNode(apart).sisterLine).toContain('留下的话');
    expect(getEnding(choose(apart, 'wait')!.state)?.summary).toContain('另一处');
    const boarded = walk(ENDING_TEST_ROUTES.caravan.slice(0, -1));
    for (const action of ['wait', 'pages']) {
      const ending = getEnding(choose(boarded, action)!.state)!;
      expect(ending.scene).toBe('road');
      expect(ending.paragraphs.join('')).toContain('车帘后');
    }
  });
});
export { ENDING_TEST_ROUTES };
