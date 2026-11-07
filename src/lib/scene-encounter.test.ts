import { describe, expect, it } from 'vitest';
import { NODES, choose, createInitialState, getChoices, type BranchState } from './branch-story';
import { NODE_TEST_ROUTES } from './story-test-routes';
import { getSceneEncounter } from './scene-encounter';

function reach(nodeId: string): BranchState {
  let state = createInitialState();
  for (const id of NODE_TEST_ROUTES[nodeId]) {
    const next = choose(state, id);
    if (!next) throw new Error(`Unavailable route at ${state.nodeId}/${id}`);
    state = next.state;
  }
  return state;
}
const shortAt = (nodeId: string, patch: Partial<BranchState> = {}): BranchState => ({ ...createInitialState('short'), nodeId, ...patch });

describe('scene context for direct story branches', () => {
  it('projects brief contextual responses without adding preparation, arithmetic or resource changes', () => {
    for (const nodeId of Object.keys(NODES)) {
      const state = reach(nodeId);
      const before = structuredClone(state);
      const encounter = getSceneEncounter(state);
      expect(encounter.points.length).toBeGreaterThanOrEqual(nodeId==='n30'?1:2);
      expect(encounter.points.length).toBeLessThanOrEqual(3);
      expect(encounter).not.toHaveProperty('activity');
      expect(new Set(encounter.points.map(point => point.id)).size).toBe(encounter.points.length);
      for (const point of encounter.points) {
        expect(point.response.length).toBeLessThanOrEqual(44);
        expect(getChoices(state).some(choice => choice.id === point.choiceId)).toBe(true);
      }
      expect(state).toEqual(before);
    }
  });

  it('makes the oppressor and the reason to leave explicit without requiring object preparation', () => {
    for (const state of [createInitialState(), createInitialState('short')]) {
      const encounter = getSceneEncounter(state);
      expect(encounter.goal).toContain('年轻巡查');
      expect(encounter.goal).toMatch(/举棍|拦摊|赶摊/);
      expect(encounter.goal).not.toMatch(/收好旧物|整理|准备/);
    }
    const disguise = getSceneEncounter(shortAt('n06'));
    expect(disguise.goal).toContain('母亲寻父挨打');
    expect(disguise.goal).toContain('买饼受拒');
    expect(disguise.goal).toContain('亡兄衣服');
    expect(disguise.goal).toContain('出门');
    expect([...disguise.goal].length).toBeLessThanOrEqual(40);
  });

  it('lets Sami notice the bread actually obtained from the back door', () => {
    const market = reach('n04');
    const bought = choose(market, 'learn')!.state;
    const returnedEmpty = choose(market, 'day')!.state;
    const point = (state: BranchState) => getSceneEncounter(state).points.find(item => item.choiceId === 'flour')!;
    expect(point(bought).label).toBe('弟弟面前的碗');
    expect(point(bought).response).toContain('你带饼回来了');
    expect(point(bought).response).not.toContain('没有饼');
    expect(point(returnedEmpty).response).toContain('为什么没有饼');
    expect(point({ ...returnedEmpty, stats: { ...returnedEmpty.stats, food: bought.stats.food } }).response).toContain('为什么没有饼');
  });

  it('presents the absent family’s words as messages rather than in-person exchanges', () => {
    const apart = reach('n18');
    expect(apart.sister).toBe('apart');
    const encounter = getSceneEncounter(apart);
    expect(encounter.goal).toMatch(/托.*话/);
    expect(encounter.points.find(point => point.choiceId === 'find')?.speaker).toBe('母亲托来的话');
    expect(encounter.points.some(point => point.speaker === '母亲')).toBe(false);
    const concise = getSceneEncounter(shortAt('n18', { sister: 'apart' }));
    expect(concise.goal).toContain('分住');
    expect(concise.points.find(point => point.choiceId === 'rush')?.speaker).toBe('姐姐托来的话');
    const together = choose(reach('n14'), 'hide')!.state;
    expect(getSceneEncounter(together).points.find(point => point.choiceId === 'find')?.speaker).toBe('母亲');
  });

  it('does not promise rescue before Amin’s personal connection exists', () => {
    const state = reach('n25');
    expect(state.flags).not.toContain('guardBond');
    const point = getSceneEncounter(state).points.find(item => item.choiceId === 'release')!;
    expect(point.response).toContain('还没答应');
    expect(getChoices(state).find(choice => choice.id === point.choiceId)?.enabled).toBe(false);
    const bonded = { ...state, flags: [...state.flags, 'guardBond'] };
    expect(getSceneEncounter(bonded).points.find(item => item.choiceId === 'release')?.response).toContain('我试着带他出来');
  });

  it('keeps the short edition’s three destinations as ordinary story choices', () => {
    const state = shortAt('n18');
    const encounter = getSceneEncounter(state);
    expect(encounter).not.toHaveProperty('activity');
    expect(encounter.points.map(point => point.choiceId).sort()).toEqual(['find', 'plan', 'rush']);
    expect(getChoices(state).map(choice => choice.id).sort()).toEqual(['find', 'plan', 'rush']);
    expect(encounter.points.find(point => point.choiceId === 'plan')?.response).toContain('阿明');
    expect(encounter.points.find(point => point.choiceId === 'find')?.response).toContain('优素福');
    expect(encounter.points.find(point => point.choiceId === 'rush')?.response).toContain('照护');
  });

  it('preserves the mother’s refusal and the invitation needed for one-night lodging', () => {
    const encounter = getSceneEncounter(shortAt('n21'));
    const response = (id: string) => encounter.points.find(point => point.choiceId === id)!.response;
    expect(response('register')).toContain('优素福本人');
    expect(response('register')).toContain('文书');
    expect(response('child')).toContain('借住');
    expect(response('search')).toContain('我不跟他走');
    expect(response('search')).toContain('回去找她');
    expect(getSceneEncounter(shortAt('n25')).points.find(point => point.choiceId === 'leave')?.response).toContain('夜宿');
  });

  it('does not describe the rescued father as still being awaited', () => {
    const rescued = { ...reach('n30'), father: 'free' as const, flags: ['released'] };
    expect(getSceneEncounter(rescued).points.map(point => point.choiceId)).not.toContain('wait');
  });
});
