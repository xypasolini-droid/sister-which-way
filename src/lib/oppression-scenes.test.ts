import { describe, expect, it } from 'vitest';
import { choose, createInitialState, createRevisionFiveState, getChoices, getNode, LEGACY_NODES as NODES, type BranchState } from './branch-story';
import { getOppressionShots } from './oppression-scenes';

const sceneState = (nodeId: string, edition?: 'short', flags: string[] = []) => ({ nodeId, edition, endingId: null, flags });

function shortRoute(actions: string[]): BranchState {
  return actions.reduce((state, id) => {
    const result = choose(state, id);
    if (!result) throw new Error(`Illegal test route: ${state.nodeId}/${id}`);
    return result.state;
  }, createRevisionFiveState());
}

describe('automatic scenes of coercion', () => {
  it('returns only the authored performances and suppresses them after an ending', () => {
    const expected: Record<string, number> = { n01: 2, n02: 4, n03: 4, n04: 3, n06: 8, n07: 2, n08: 1, n21: 3, n25: 3 };
    for (const nodeId of Object.keys(NODES)) {
      const state = sceneState(nodeId, 'short');
      expect(getOppressionShots(state), nodeId).toHaveLength(expected[nodeId] ?? 0);
      expect(getOppressionShots({ ...state, endingId: 'dream_guardian' }), nodeId).toEqual([]);
    }
    expect(getOppressionShots(sceneState('n06'))).toEqual([]);
    expect(getOppressionShots(sceneState('unknown'))).toEqual([]);
  });

  it('uses short, timed shots with stable unique ids and clear scene transitions', () => {
    const sequences = [
      ['n01', ['market', 'market']],
      ['n02', ['home', 'home', 'home', 'home']],
      ['n03', ['checkpoint', 'checkpoint', 'checkpoint', 'checkpoint']],
      ['n04', ['market', 'market', 'market']],
      ['n07', ['market', 'market']],
      ['n08', ['checkpoint']],
      ['n21', ['road', 'road', 'road']],
      ['n25', ['prison', 'prison', 'prison']],
    ] as const;
    const ids: string[] = [];
    for (const [nodeId, scenes] of sequences) {
      const shots = getOppressionShots(sceneState(nodeId));
      expect(shots.map(shot => shot.scene), nodeId).toEqual(scenes);
      expect(getOppressionShots(sceneState(nodeId))).toEqual(shots);
      ids.push(...shots.map(shot => shot.id));
      for (const shot of shots) {
        expect(shot.durationMs).toBeGreaterThanOrEqual(2200);
        expect(shot.durationMs).toBeLessThanOrEqual(3000);
        expect(Array.from(shot.line).length).toBeLessThanOrEqual(26);
        expect(shot.location).not.toBe('');
        expect(shot.speaker).not.toBe('');
        expect(shot.caption).not.toBe('');
      }
    }
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows the mother struck and supported, then the refusal and forced retreat before disguise', () => {
    const shots = getOppressionShots(sceneState('n06', 'short'));
    expect(shots.map(shot => shot.visual)).toEqual([
      'mother-block', 'mother-plead', 'mother-struck', 'mother-floor',
      'bread-refuse', 'bread-threat', 'bread-flee', 'home-wounded',
    ]);
    expect(shots.map(shot => shot.scene)).toEqual([
      'checkpoint', 'checkpoint', 'checkpoint', 'checkpoint', 'market', 'market', 'market', 'home',
    ]);
    expect(shots.every(shot => shot.location.startsWith('此前 · '))).toBe(true);
    expect(shots[2].caption).toMatch(/棍子落下.*抬臂护住头/);
    expect(shots[3].caption).toMatch(/女孩向母亲伸手.*扶她起身/);
    expect(shots[4].caption).toMatch(/举掌拒卖.*巡查/);
    expect(shots[5].speaker).toBe('巡查');
    expect(shots[5].caption).toMatch(/举棍.*逼近/);
    expect(shots[6].caption).toMatch(/空手退开.*没能买到食物/);
    expect(shots[7].caption).toMatch(/养伤.*空手回家/);
    expect(getOppressionShots(sceneState('n07', 'short'))[0].scene).toBe('market');
  });

  it('shows the arrest as a witnessed removal rather than an unexplained disappearance', () => {
    const shots = getOppressionShots(sceneState('n02', 'short'));
    expect(shots.map(shot => shot.visual)).toEqual(['arrest-entry', 'arrest-grab', 'arrest-drag', 'arrest-empty']);
    expect(shots[1].caption).toMatch(/抓住父亲.*母亲/);
    expect(shots[2].speaker).toBe('努拉');
    expect(shots[2].caption).toMatch(/父亲被拖向门口/);
    expect(shots[3].line).toMatch(/拘留院/);
  });

  it('addresses the disguised child as a boy at the later checkpoint', () => {
    const shot = getOppressionShots(sceneState('n08'))[0];
    expect(shot.visual).toBe('mother-block');
    expect(shot.line).toMatch(/小子/);
    expect(shot.caption).toMatch(/戴小帽的孩子/);
    expect(`${shot.line}${shot.caption}`).not.toMatch(/母女|没有男人|女孩/);
  });

  it('keeps the mother’s refusal in her own words during the relative’s coercion', () => {
    const shots = getOppressionShots(sceneState('n21', 'short'));
    expect(shots.map(shot => shot.visual)).toEqual(['relative-order', 'relative-pull', 'relative-refuse']);
    expect(shots[1].speaker).toBe('母亲');
    expect(shots[1].caption).toMatch(/强拉母亲.*逼她上车/);
    expect(shots[2].speaker).toBe('母亲');
    expect(shots[2].line).toMatch(/不能丢下.*我回去/);
    expect(shots[2].caption).toMatch(/拒绝强迫带离/);
  });

  it('keeps the archived unprepared refusal separate from the current prepared rescue', () => {
    const bonded = shortRoute(['work', 'sew', 'buy', 'truth', 'courier', 'plan']);
    expect(bonded.nodeId).toBe('n25');
    const unbonded = { ...bonded, storyContentRevision: undefined, flags: bonded.flags.filter(flag => flag !== 'guardBond') };
    const refusal = getOppressionShots(unbonded);
    const signal = getOppressionShots(bonded);
    expect(refusal.map(shot => shot.visual)).toEqual(['prison-gunfire', 'prison-shelter', 'prison-signal']);
    expect(refusal.at(-1)?.line).toMatch(/不能答应/);
    expect(signal.at(-1)?.line).toMatch(/进去找他/);
    expect(refusal.slice(0, 2)).toEqual(signal.slice(0, 2));
    expect(getChoices(unbonded).find(choice => choice.id === 'release')?.enabled).toBe(false);
    expect(getChoices(bonded).find(choice => choice.id === 'release')?.enabled).toBe(true);
    for (const shot of [...refusal, ...signal]) {
      expect(`${shot.line}${shot.caption}`).not.toMatch(/救出|扶出|已经带出|父亲回来了/);
    }
    expect(bonded.father).not.toBe('free');
    expect(unbonded.father).not.toBe('free');
  });

  it('preserves an old missed window while the new route visibly prepares its own opportunity', () => {
    const initial = createRevisionFiveState(); delete initial.storyContentRevision;
    const route = ['work', 'cut', 'buy', 'truth', 'courier', 'plan'];
    const late = route.reduce((state, id) => choose(state, id)!.state, initial);
    expect(late.flags).toContain('guardBond');
    expect(late.flags).not.toContain('pact');
    const last = getOppressionShots(late).at(-1)!;
    expect(last.line).toContain('已经换岗');
    expect(last.caption).toContain('错过');
    expect(`${last.line}${last.caption}`).not.toContain('进去找他');
    expect(getChoices(late).find(choice => choice.id === 'release')!.enabled).toBe(false);
    const current = shortRoute(route);
    expect(current.flags).toContain('rescuePrepared');
    expect(current.flags).toContain('pact');
    expect(getOppressionShots(current).at(-1)!.line).toContain('进去找他');
    expect(getChoices(current).find(choice => choice.id === 'release')!.enabled).toBe(true);
  });

  it('labels the relative scene as earlier before the new truck-side reunion', () => {
    const truck = shortRoute(['work', 'sew', 'buy', 'pact', 'care', 'find']);
    expect(truck.nodeId).toBe('n21');
    expect(getOppressionShots(truck).every(shot => shot.location.startsWith('此前 · '))).toBe(true);
    expect(getOppressionShots({ ...truck, storyRevision: undefined }).every(shot => !shot.location.startsWith('此前 · '))).toBe(true);
    expect(getNode(truck).paragraphs.join('')).toContain('与你会合');
  });

  it('never mutates story state or leaves shared mutable shot templates', () => {
    const state = shortRoute(['work', 'sew']);
    const before = structuredClone(state);
    Object.freeze(state.flags);
    Object.freeze(state.stats);
    Object.freeze(state.history);
    Object.freeze(state);
    const shots = getOppressionShots(state);
    expect(shots).toHaveLength(8);
    shots[0].line = 'changed by a presentation consumer';
    shots.pop();
    expect(getOppressionShots(state)).toHaveLength(8);
    expect(getOppressionShots(state)[0].line).not.toBe(shots[0].line);
    expect(state).toEqual(before);
    expect(state.history).toHaveLength(2);
  });

  it('offers immediate physical help or opening the door without arithmetic or bookkeeping', () => {
    const state = shortRoute(['work', 'sew', 'buy', 'hide']);
    expect(state.nodeId).toBe('n10');
    const choices = getNode(state).choices;
    const ledger = choices.find(choice => choice.id === 'ledger')!;
    const wage = choices.find(choice => choice.id === 'wage')!;
    expect(ledger.label).toContain('拉开后门，叫莱拉');
    expect(`${ledger.label}${ledger.detail}${ledger.consequence}`).not.toMatch(/核算|核账|算出|乘|四件|八枚/);
    expect(wage.label).toContain('扶住被推的女工');
    expect(wage.effect!.add).toContain('protectedSomeone');
    for (const choice of [ledger, wage]) {
      expect(choice.requires).toEqual([]);
      expect(choice.next).toBe('n18');
      const result = choose(state, choice.id);
      expect(result?.state.nodeId).toBe('n18');
    }
    expect(ledger.effect!.add).toContain('workerHelped');
    expect(ledger.effect!.add).not.toContain('evidence');
    expect(wage.effect!.add).not.toContain('paid');
    expect(wage.effect!.stats!.coins).toBe(-1);
  });
});
