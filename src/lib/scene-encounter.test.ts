import { describe, expect, it } from 'vitest';
import { NODES, choose, createInitialState, getChoices, type BranchState } from './branch-story';
import { NODE_TEST_ROUTES } from './story-test-routes';
import { getSceneEncounter, resolveEncounterActivity, toggleEncounterItem } from './scene-encounter';

function reach(nodeId: string): BranchState {
  let state = createInitialState();
  for (const id of NODE_TEST_ROUTES[nodeId]) {
    const next = choose(state, id);
    expect(next, `${state.nodeId}/${id}`).not.toBeNull();
    state = next!.state;
  }
  expect(state.nodeId).toBe(nodeId);
  return state;
}

describe('in-scene encounters preserve authored choices and consequences', () => {
  it('offers concrete, bounded observations at every legally reached node', () => {
    for (const nodeId of Object.keys(NODES)) {
      const state = reach(nodeId);
      const encounter = getSceneEncounter(state);
      expect(encounter.points.length, nodeId).toBeGreaterThanOrEqual(2);
      expect(encounter.points.length, nodeId).toBeLessThanOrEqual(3);
      expect(new Set(encounter.points.map(point => point.id)).size).toBe(encounter.points.length);
      for (const point of encounter.points) {
        expect(point.response.length, `${nodeId}:${point.id}`).toBeLessThanOrEqual(44);
        const choice = getChoices(state).find(item => item.id === point.choiceId);
        expect(choice, `${nodeId}:${point.choiceId}`).toBeDefined();
        if (choice?.enabled) {
          const result = choose(state, choice.id);
          expect(result?.state.history.at(-1)?.choiceId).toBe(choice.id);
          expect(result?.consequence).toBe(choice.consequence);
        }
      }
    }
  });

  it('has varied activities in at least eight nodes and only proposes existing actions', () => {
    const kinds = new Set<string>();
    let count = 0;
    for (const nodeId of Object.keys(NODES)) {
      const state = reach(nodeId);
      const { activity } = getSceneEncounter(state);
      if (!activity) continue;
      count++;
      kinds.add(activity.kind);
      const original = JSON.stringify(state);
      const selected = activity.solution ?? activity.items.slice(0, activity.required ?? 1).map(item => item.id);
      const result = resolveEncounterActivity(state, selected);
      expect(result.complete, nodeId).toBe(true);
      expect(getChoices(state).some(choice => choice.id === result.choiceId), nodeId).toBe(true);
      expect(JSON.stringify(state), nodeId).toBe(original);
    }
    expect(count).toBeGreaterThanOrEqual(8);
    expect(kinds.size).toBeGreaterThanOrEqual(4);
  });

  it('does not conjure food or bread when household food is empty', () => {
    const state = reach('n05');
    const empty = { ...state, flags: [], stats: { ...state.stats, food: 0 } };
    expect(getSceneEncounter(empty).activity).toBeUndefined();
    expect(resolveEncounterActivity(empty, ['sami']).choiceId).toBeNull();
    expect(empty.stats.food).toBe(0);
    expect(empty.flags).not.toContain('bread');
  });

  it('lets Sami notice the bread actually obtained from the back door', () => {
    const market = reach('n04');
    const bought = choose(market, 'learn')!.state;
    const returnedEmpty = choose(market, 'day')!.state;
    const point = (state: BranchState) => getSceneEncounter(state).points.find(item => item.choiceId === 'flour')!;
    expect(point(bought).label).toBe('弟弟面前的碗');
    expect(point(bought).response).toBe('你带饼回来了？我可以吃一口吗？');
    expect(point(bought).response).not.toContain('没有饼');
    expect(point(returnedEmpty).response).toContain('为什么没有饼');
    // A household-food number alone does not mean this trip bought bread.
    expect(point({ ...returnedEmpty, stats: { ...returnedEmpty.stats, food: bought.stats.food } }).response).toContain('为什么没有饼');
  });

  it('presents the absent mother’s words as a message rather than an in-person exchange', () => {
    const apart = reach('n18');
    expect(apart.sister).toBe('apart');
    const encounter = getSceneEncounter(apart);
    expect(encounter.goal).toMatch(/托.*话/);
    expect(encounter.goal).not.toContain('放在灯下');
    const letter = encounter.points.find(point => point.choiceId === 'find')!;
    expect(letter.label).toContain('捎来');
    expect(letter.speaker).toBe('母亲托来的话');
    expect(encounter.points.some(point => point.speaker === '母亲')).toBe(false);
    const together = choose(reach('n14'), 'hide')!.state;
    expect(together.sister).not.toBe('apart');
    expect(getSceneEncounter(together).points.find(point => point.choiceId === 'find')?.speaker).toBe('母亲');
  });

  it('does not promise a rescue before the personal connection with Amin exists', () => {
    const state = reach('n25');
    expect(state.flags).not.toContain('guardBond');
    const encounter = getSceneEncounter(state);
    const point = encounter.points.find(item => item.choiceId === 'release')!;
    expect(encounter.goal).toContain('信里的名字');
    expect(point.label).toBe('阿明手里的信');
    expect(point.response).toContain('还没答应');
    expect(point.response).not.toContain('我试着带他出来');
    expect(getChoices(state).find(choice => choice.id === point.choiceId)?.enabled).toBe(false);
    const bonded = { ...state, flags: [...state.flags, 'guardBond'] };
    expect(getSceneEncounter(bonded).points.find(item => item.choiceId === 'release')?.response).toContain('我试着带他出来');
  });

  it('makes accounting a recoverable comparison and never pays extra coins', () => {
    const state = reach('n10');
    const original = JSON.stringify(state);
    const wrong = resolveEncounterActivity(state, ['six']);
    expect(wrong.complete).toBe(false);
    expect(wrong.choiceId).toBeNull();
    expect(wrong.response).toContain('4 × 2 = 8');
    expect(resolveEncounterActivity(state, ['eight']).choiceId).toBe('ledger');
    expect(JSON.stringify(state)).toBe(original);
  });

  it('lets route and conversation controls select different real branches', () => {
    const route = reach('n08');
    for (const id of ['queue', 'alley', 'neighbor']) expect(resolveEncounterActivity(route, [id]).choiceId).toBe(id);
    const conversation = reach('n13');
    for (const id of ['listen', 'care', 'secret']) expect(resolveEncounterActivity(conversation, [id]).choiceId).toBe(id);
  });

  it('allows a limited plan to be revised without creating an irreversible action', () => {
    const state = reach('n18');
    const activity = getSceneEncounter(state).activity!;
    let selected = toggleEncounterItem(activity, [], 'care');
    expect(resolveEncounterActivity(state, selected).complete).toBe(false);
    selected = toggleEncounterItem(activity, selected, 'contact');
    expect(resolveEncounterActivity(state, selected).complete).toBe(true);
    selected = toggleEncounterItem(activity, selected, 'food');
    expect(selected).toEqual(['contact', 'food']);
    expect(state.history.at(-1)?.nodeId).not.toBe('n18');
  });

  it('retains requirement locks even after a successful activity', () => {
    const state = reach('n16');
    const poor = { ...state, stats: { ...state.stats, coins: 0 } };
    const result = resolveEncounterActivity(poor, ['registered']);
    expect(result.complete).toBe(true);
    expect(result.choiceId).toBe('register');
    expect(getChoices(poor).find(choice => choice.id === result.choiceId)?.enabled).toBe(false);
    expect(choose(poor, result.choiceId!)).toBeNull();
  });

  it('does not expose a rescued father as still being awaited', () => {
    const state = reach('n30');
    const rescued = { ...state, father: 'free' as const, flags: [...state.flags, 'released'] };
    expect(getSceneEncounter(rescued).points.map(point => point.choiceId)).not.toContain('wait');
  });

  it('rejects unknown and forged selection IDs instead of completing an activity', () => {
    const state = reach('n01');
    expect(resolveEncounterActivity(state, ['buttons', 'made-up']).complete).toBe(false);
    const activity = getSceneEncounter(state).activity!;
    expect(toggleEncounterItem(activity, ['buttons'], 'made-up')).toEqual(['buttons']);
    expect(resolveEncounterActivity(reach('n16'), ['registered', 'quick']).complete).toBe(false);
  });
});

// Projection fixtures cover the concise edition; graph legality is tested separately.
describe('short-edition encounter presentation', () => {
  const shortAt = (nodeId: string, patch: Partial<BranchState> = {}): BranchState => ({ ...createInitialState('short'), nodeId, ...patch });

  it('makes the opening conflict and compressed disguise setup explicit and brief', () => {
    const opening = getSceneEncounter(shortAt('n01'));
    expect(opening.goal).toContain('年轻巡查');
    expect(opening.goal).toContain('赶摊');
    const disguise = getSceneEncounter(shortAt('n06'));
    expect(disguise.goal).toContain('母亲寻父挨打');
    expect(disguise.goal).toContain('买饼受拒');
    expect(disguise.goal).toContain('亡兄衣服');
    expect([...disguise.goal].length).toBeLessThanOrEqual(40);
  });

  it('replaces the long-edition supply priorities with three true route choices', () => {
    const state = shortAt('n18');
    const encounter = getSceneEncounter(state);
    expect(encounter.activity?.kind).toBe('route');
    expect(encounter.activity?.items.map(item => item.id)).toEqual(['plan', 'find', 'rush']);
    for (const id of ['plan', 'find', 'rush']) {
      expect(resolveEncounterActivity(state, [id]).choiceId).toBe(id);
      expect(getChoices(state).some(choice => choice.id === id)).toBe(true);
    }
    expect(encounter.points.find(point => point.choiceId === 'plan')?.response).toContain('阿明');
    expect(encounter.points.find(point => point.choiceId === 'find')?.response).toContain('优素福');
    expect(encounter.points.find(point => point.choiceId === 'rush')?.response).toContain('照护');
    expect(getSceneEncounter(reach('n18')).activity?.kind).toBe('pack');
  });

  it('keeps both the mother and sister off-camera when the concise route is separated', () => {
    const encounter = getSceneEncounter(shortAt('n18', { sister: 'apart' }));
    expect(encounter.goal).toMatch(/托.*话/);
    expect(encounter.goal).toContain('分住');
    expect(encounter.points.find(point => point.choiceId === 'find')?.speaker).toBe('母亲托来的话');
    expect(encounter.points.find(point => point.choiceId === 'rush')?.speaker).toBe('姐姐托来的话');
    expect(encounter.points.some(point => ['母亲', '玛莉安'].includes(point.speaker))).toBe(false);
  });

  it('describes direct departure, one-night lodging and the mother’s return without reusing the old detour', () => {
    const encounter = getSceneEncounter(shortAt('n21'));
    const response = (id: string) => encounter.points.find(point => point.choiceId === id)!.response;
    expect(response('register')).toContain('优素福本人');
    expect(response('register')).toContain('文书');
    expect(response('child')).toContain('今夜');
    expect(response('child')).toContain('借住');
    expect(response('search')).toContain('我不跟他走');
    expect(response('search')).toContain('回去找她');
  });

  it('confirms the limited duty roster with the concise school action and describes a one-night fallback', () => {
    const courtyard = shortAt('n22');
    expect(resolveEncounterActivity(courtyard, ['teaching', 'care']).choiceId).toBe('school');
    expect(getSceneEncounter(courtyard).points.find(point => point.choiceId === 'send')?.response).toContain('私宅');
    const prison = getSceneEncounter(shortAt('n25'));
    expect(prison.points.find(point => point.choiceId === 'leave')?.label).toContain('今夜');
    expect(prison.points.find(point => point.choiceId === 'leave')?.response).toContain('夜宿');
  });
});
