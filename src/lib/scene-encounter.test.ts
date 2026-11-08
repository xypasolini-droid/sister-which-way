import { describe, expect, it } from 'vitest';
import { LEGACY_NODES as NODES, choose, createInitialState, createRevisionFiveState, getChoices, type BranchState } from './branch-story';
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
const shortAt = (nodeId: string, patch: Partial<BranchState> = {}): BranchState => ({ ...createRevisionFiveState(), nodeId, ...patch });

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
    for (const state of [createInitialState(), createRevisionFiveState()]) {
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
    expect(concise.goal).toContain('封关');
    expect(concise.points.every(point => point.speaker !== '母亲')).toBe(true);
    const together = choose(reach('n14'), 'hide')!.state;
    expect(getSceneEncounter(together).points.find(point => point.choiceId === 'find')?.speaker).toBe('母亲');
  });

  it('does not promise rescue before Amin’s personal connection exists', () => {
    const state = reach('n25');
    expect(state.flags).not.toContain('guardBond');
    const point = getSceneEncounter(state).points.find(item => item.choiceId === 'release')!;
    expect(point.response).toMatch(/还没答应|没有答应|不能答应|不敢保证/);
    expect(point.response).not.toMatch(/先替我读信|读完.{0,8}救|教我.{0,8}救/);
    expect(getChoices(state).find(choice => choice.id === point.choiceId)?.enabled).toBe(false);
    const bonded = { ...state, flags: [...state.flags, 'guardBond'] };
    expect(getSceneEncounter(bonded).points.find(item => item.choiceId === 'release')?.response).toContain('我试着带他出来');
  });

  it('treats Amin’s letter as his memory of Hala rather than a family document to take away', () => {
    const encounter = getSceneEncounter(reach('n09'));
    const text = `${encounter.goal}${encounter.points.map(point => `${point.label}${point.response}`).join('')}`;
    expect(text).toContain('哈拉');
    expect(text).toContain('妻子');
    expect(text).not.toMatch(/失去的亲人|带回去和姐姐一起看|带信回家|把信带回家/);
  });

  it('does not claim that an unknown Amin recognises the heroine’s handwriting at n20', () => {
    const unknown: BranchState = { ...reach('n20'), flags: ['disguise', 'aliasAatish', 'friendMet'] };
    const first = getSceneEncounter(unknown).points.find(point => point.choiceId === 'submit')!;
    expect(`${first.label}${first.response}`).not.toMatch(/他认得|写过的|再写/);
    const known = { ...unknown, flags: [...unknown.flags, 'guardKnown'] };
    const remembered = getSceneEncounter(known).points.find(point => point.choiceId === 'submit')!;
    expect(`${remembered.label}${remembered.response}`).not.toMatch(/初次|第一次|不认识|陌生的阿明/);
  });

  it('keeps the short edition’s three destinations as ordinary story choices', () => {
    const state = shortAt('n18');
    const encounter = getSceneEncounter(state);
    expect(encounter).not.toHaveProperty('activity');
    expect(encounter.points.map(point => point.choiceId).sort()).toEqual(['find', 'plan', 'rush']);
    expect(getChoices(state).map(choice => choice.id).sort()).toEqual(['find', 'plan', 'rush']);
    expect(encounter.points.find(point => point.choiceId === 'plan')?.response).toContain('救父');
    expect(encounter.points.find(point => point.choiceId === 'find')?.response).toContain('优素福');
    expect(encounter.points.find(point => point.choiceId === 'rush')?.response).toContain('莱拉');
  });

  it('makes the last vehicle decision about who departs, without a generic one-night shelter ending', () => {
    const state = shortAt('n21');
    const encounter = getSceneEncounter(state);
    expect(encounter.points.map(point=>point.choiceId)).toEqual(['register','child']);
    expect(encounter.points.find(point=>point.choiceId==='register')!.response).toContain('离城');
    expect(encounter.points.find(point=>point.choiceId==='child')!.response).toContain('赶不上');
    const nodeChoices=getChoices(state);
    for(const choice of nodeChoices)expect(choice.effect!.add).toContain('marriageRefused');
    expect(getSceneEncounter(shortAt('n25')).points.find(point=>point.choiceId==='leave')!.response).toContain('家人不要等');
  });

  it('does not describe the rescued father as still being awaited', () => {
    const rescued = { ...reach('n30'), father: 'free' as const, flags: ['released'] };
    expect(getSceneEncounter(rescued).points.map(point => point.choiceId)).not.toContain('wait');
  });
});
