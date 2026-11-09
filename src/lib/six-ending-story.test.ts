import { describe, expect, it } from 'vitest';
import { choose, createRevisionFiveState, getChoices, getEnding, getNode, validateBranchState, type BranchState } from './branch-story';
import { REVISION_SIX_ENDINGS as ENDINGS } from './ending-content';
import { createSixState, SIX_ENDING_IDS, SIX_ENDING_ROUTES } from './six-ending-story';
import { endingEcho, endingGrowth } from './ending-presentation';

function play(route: string[]): BranchState {
  return route.reduce((state, id) => {
    const next = choose(state, id);
    if (!next) throw Error(`Unavailable six-ending action ${state.nodeId}/${id}`);
    return next.state;
  }, createSixState());
}
function explore() {
  const pending = [createSixState()], forks = new Map<string, string[]>(), terminal: BranchState[] = [];
  while (pending.length) {
    const state = pending.pop()!;
    if (state.endingId) { terminal.push(state); continue; }
    const choices = getChoices(state);
    forks.set(state.nodeId, choices.map(choice => choice.id));
    for (const choice of choices) {
      expect(choice.enabled).toBe(true);
      expect(choice.requires).toEqual([]);
      pending.push(choose(state, choice.id)!.state);
    }
  }
  return { forks, terminal };
}

describe('0.6.0 literal six-ending graph', () => {
  it('starts at the scissors with the arrest already known and no old facts imported', () => {
    const state = createSixState();
    expect(state).toMatchObject({ storyRevision: 6, storyContentRevision: 7, version: 3, nodeId: 'v6-opening', father: 'missing', endingId: null, history: [] });
    expect(getNode(state).paragraphs.join('')).toContain('父亲是当着全家人的面被抓走的');
    expect(state.flags).toContain('fatherArrested');
    expect(getChoices(state).map(choice => choice.id)).toEqual(['stay_long', 'cut_hair']);
  });
  it('has exactly four forks, nine effective choices, and six full routes of two or three decisions', () => {
    const { forks, terminal } = explore();
    expect(Object.fromEntries(forks)).toEqual({
      'v6-opening': ['stay_long', 'cut_hair'], 'v6-war': ['home', 'flee', 'friend'],
      'v6-voices': ['dream', 'wake'], 'v6-marriage': ['refuse', 'accept'],
    });
    expect([...forks.values()].reduce((n, choices) => n + choices.length, 0)).toBe(9);
    expect(terminal).toHaveLength(6);
    expect(terminal.map(state => state.endingId).sort()).toEqual([...SIX_ENDING_IDS].sort());
    for (const state of terminal) {
      expect([2, 3]).toContain(state.history.length);
      expect(state.history.map(entry => entry.choiceId)).toEqual(SIX_ENDING_ROUTES[state.endingId as keyof typeof SIX_ENDING_ROUTES]);
    }
  });
  it.each(SIX_ENDING_IDS)('%s resolves only its explicit path, ends immediately, and authenticates all prefixes', id => {
    const route = SIX_ENDING_ROUTES[id];
    for (let count = 0; count <= route.length; count++) {
      const state = play(route.slice(0, count));
      expect(validateBranchState(JSON.parse(JSON.stringify(state)))).toEqual(state);
      expect(state.endingId).toBe(count === route.length ? id : null);
    }
    const final = play(route);
    expect(getEnding(final)?.id).toBe(id);
    expect(getNode(final).id).toBe('v6-end');
    expect(getChoices(final)).toEqual([]);
    expect(choose(final, route.at(-1)!)).toBeNull();
    expect(choose(final, 'live')).toBeNull();
  });
  it('uses literal explicit presentation modes, six different titles and fixed numbering', () => {
    expect(ENDINGS.map(ending => ending.number)).toEqual(['01','02','03','04','05','06']);
    expect(ENDINGS.map(ending => ending.mode)).toEqual(['reality','reality','reality','reality','dream','future']);
    expect(new Set(ENDINGS.map(ending => ending.title)).size).toBe(6);
    expect(ENDINGS.filter(ending => ending.dream).map(ending => ending.id)).toEqual(['unwaking_spring']);
    for (const id of SIX_ENDING_IDS) {
      expect(endingGrowth(play(SIX_ENDING_ROUTES[id]))).not.toMatch(/旧版/);
      expect(endingEcho(play(SIX_ENDING_ROUTES[id]))).not.toMatch(/旧版/);
    }
  });
  it('does not let the dream or the adult future inherit an unseen family escape or rescue', () => {
    const escape = play(SIX_ENDING_ROUTES.family_escape);
    expect(escape.flags).toContain('boarded');
    expect(escape.sister).toBe('beside');
    for (const id of ['unwaking_spring','guardian_future'] as const) {
      const state = play(SIX_ENDING_ROUTES[id]);
      expect(state.father).toBe('missing');
      expect(state.flags).toContain('familyWhereaboutsUnknown');
      expect(state.flags).not.toContain('boarded');
      expect(state.flags).not.toContain('familyEscaped');
      expect(state.flags).not.toContain('familyTogether');
    }
    expect(play(SIX_ENDING_ROUTES.unwaking_spring).flags).toContain('heroUnconscious');
    expect(play(SIX_ENDING_ROUTES.guardian_future).flags).not.toContain('heroUnconscious');
  });
  it('keeps result, source state and content immutable and deterministic', () => {
    const source = createSixState(), before = structuredClone(source);
    const a = choose(source, 'cut_hair')!, b = choose(source, 'cut_hair')!;
    expect(a).toEqual(b);
    expect(source).toEqual(before);
    a.state.flags.push('forged');
    expect(b.state.flags).not.toContain('forged');
    const final = play(SIX_ENDING_ROUTES.guardian_future), copy = structuredClone(final);
    getEnding(final)!.paragraphs.push('external edit');
    expect(final).toEqual(copy);
    expect(getEnding(final)!.paragraphs).not.toContain('external edit');
  });
  it('rejects fate editing, illegal paths, mixed editions and changed factual counters', () => {
    const done = play(SIX_ENDING_ROUTES.family_escape);
    for (const forged of [
      { ...done, endingId: 'guardian_future' }, { ...done, storyContentRevision: 6 },
      { ...done, storyRevision: 5 }, { ...done, father: 'free' },
      { ...done, nodeId: 'n30' }, { ...done, flags: [...done.flags, 'rescueRoute'] },
      { ...done, stats: { ...done.stats, trust: 10 } },
      { ...done, history: [...done.history, { nodeId: 'v6-end', choiceId: 'wake' }] },
    ]) expect(validateBranchState(forged)).toBeNull();
    expect(choose(createSixState(), 'work')).toBeNull();
    expect(choose(createSixState(), 'home')).toBeNull();
  });
  it('preserves the earlier five-ending story separately from the 0.6.0 ending with the same number', () => {
    let old = createRevisionFiveState();
    for (const id of ['mother','cut','buy','hide','ledger','rush','father']) old = choose(old, id)!.state;
    expect(old).toMatchObject({ storyRevision: 5, storyContentRevision: 6, endingId: 'dream_guardian' });
    expect(validateBranchState(old)).toEqual(old);
    expect(getEnding(old)).toMatchObject({ number: '04', dream: true });
    expect(getEnding(play(SIX_ENDING_ROUTES.family_escape))).toMatchObject({ number: '04', mode: 'reality', id: 'family_escape' });
  });
});
