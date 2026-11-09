import { describe, expect, it } from 'vitest';
import { choose, createInitialState, createRevisionFiveState, getEnding, LEGACY_NODES, type BranchState } from './branch-story';
import { getArchivedEnding, restoreEndingCollections, restoreTenEndingArchive, serializeEndingStates } from './ending-collection';
import { createSixState, SIX_ENDING_ROUTES } from './six-ending-story';

const empty = { ids: null, states: null };
import { LEGACY_ENDING_TEST_ROUTES } from './story-test-routes';
function completion(previous = false): BranchState {
  let state = createRevisionFiveState();
  if (previous) delete state.storyContentRevision;
  for (const id of ['work', 'sew', 'buy', 'truth', 'courier', 'plan', 'release']) {
    const result = choose(state, id);
    if (!result) throw Error(`Unavailable test action: ${state.nodeId}/${id}`);
    state = result.state;
  }
  return state;
}
function currentCompletion(): BranchState {
  return ['take_bread', 'run_home'].reduce((state, id) => choose(state, id)!.state, createInitialState('short'));
}
const stored = (state: BranchState) => ({ ids: JSON.stringify([state.endingId]), states: JSON.stringify({ [state.endingId!]: state }) });

describe('content revision 8 and historical ending collections', () => {
  it('counts only authenticated content-eight completions toward the six new endings', () => {
    const result = restoreEndingCollections(stored(currentCompletion()), [stored(completion()), stored(completion(true))]);
    expect(result.current.ids).toEqual(['four_in_the_back']);
    expect(result.current.states.four_in_the_back.storyContentRevision).toBe(8);
    expect(result.previous.ids).toEqual(['r5c6:reunited', 'r5c0:reunited']);
    expect(result.previous.states['r5c6:reunited'].storyContentRevision).toBe(6);
    expect(result.previous.states['r5c0:reunited'].storyContentRevision).toBeUndefined();
  });
  it('keeps old completed snapshots as old history even when found in the new keys', () => {
    const old = completion(true);
    const result = restoreEndingCollections(stored(old));
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual(['r5c0:reunited']);
    expect(result.previous.states['r5c0:reunited'].history).toEqual(old.history);
  });
  it('recovers genuinely played current snapshots from a misplaced collection key', () => {
    const result = restoreEndingCollections(empty, stored(currentCompletion()));
    expect(result.current.ids).toEqual(['four_in_the_back']);
    expect(result.previous.ids).toEqual([]);
  });
  it('preserves version-qualified name-only records with original identity and numbers', () => {
    const result = restoreEndingCollections({ ids: '["four_in_the_back"]', states: '{}' }, [
      { ids: '["dream_guardian","caravan"]', states: '{}', revision: 'r5c6' },
      { ids: '["caravan","waiting"]', states: '{}', revision: 'legacy' },
    ]);
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual(['r5c6:dream_guardian', 'r5c6:caravan', 'legacy:caravan', 'legacy:waiting']);
    expect(getArchivedEnding('r5c6:dream_guardian')).toMatchObject({ number: '04', title: '守护之地', dream: true });
    expect(getArchivedEnding('r5c6:caravan')).toMatchObject({ number: '02', title: '离城的四个人' });
    expect(getArchivedEnding('legacy:waiting')?.id).toBe('waiting');
    expect(getArchivedEnding('legacy:caravan')?.title).toBe('这条路，我自己选');
    expect(getArchivedEnding('r5c6:family_escape')).toBeNull();
  });
  it('does not mutate source records or count malformed snapshots', () => {
    const source = stored(completion(true));
    const before = JSON.stringify(source);
    const result = restoreEndingCollections({ ids: '["four_in_the_back"]', states: '{"four_in_the_back":{"storyContentRevision":8,"endingId":"four_in_the_back"}}' }, source);
    expect(result.current.ids).toEqual([]);
    expect(JSON.stringify(source)).toBe(before);
    expect(restoreEndingCollections({ ids: 'broken', states: 'broken' }, empty).current.ids).toEqual([]);
  });
  it('keeps both old revisions with the same ID alongside a new completion after reloading', () => {
    const latest = currentCompletion(), r6 = completion(), r5 = completion(true);
    const states = serializeEndingStates({ four_in_the_back: latest }, { 'r5c6:reunited': r6, 'r5c0:reunited': r5 });
    const result = restoreEndingCollections({ ids: '["four_in_the_back"]', states });
    expect(result.current.ids).toEqual(['four_in_the_back']);
    expect(result.previous.ids).toEqual(['r5c6:reunited', 'r5c0:reunited']);
    expect(result.current.states.four_in_the_back.storyContentRevision).toBe(8);
    expect(result.previous.states['r5c6:reunited'].storyContentRevision).toBe(6);
    expect(result.previous.states['r5c0:reunited'].storyContentRevision).toBeUndefined();
  });
  it('accepts qualified ID-only archives on reload without adding a second prefix', () => {
    const result = restoreEndingCollections(empty, { ids: '["r5c6:dream_guardian","legacy:waiting"]', states: '{}' });
    expect(result.previous.ids).toEqual(['r5c6:dream_guardian', 'legacy:waiting']);
    expect(getArchivedEnding('family_escape')).toBeNull();
  });
  it('retains all six 0.6.0 completions, exact prose and numbering after r8 serialization', () => {
    const old = Object.entries(SIX_ENDING_ROUTES).map(([id, actions]) => {
      const state = actions.reduce((state, action) => choose(state, action)!.state, createSixState());
      return [id, state] as const;
    });
    const source = {
      revision: 'r6c7' as const,
      ids: JSON.stringify(old.map(([id]) => id)),
      states: JSON.stringify(Object.fromEntries(old)),
    };
    const first = restoreEndingCollections(stored(currentCompletion()), source);
    const second = restoreEndingCollections({
      ids: JSON.stringify(first.current.ids),
      states: serializeEndingStates(first.current.states, first.previous.states),
    });
    expect(second).toEqual(first);
    expect(second.current.ids).toEqual(['four_in_the_back']);
    expect(second.previous.ids).toEqual(old.map(([id]) => `r6c7:${id}`));
    for (const [id, state] of old) {
      const archived = getArchivedEnding(`r6c7:${id}`);
      expect(archived).toEqual(getEnding(state));
      expect(second.previous.states[`r6c7:${id}`]).toEqual(state);
    }
    expect(getArchivedEnding('r6c7:family_escape')).toMatchObject({ number: '04', title: '离城的四个人' });
    expect(getArchivedEnding('r6c7:guardian_future')).toMatchObject({ number: '06', title: '守护之地' });
  });
  it('keeps ID-only 0.6.0 archives and never counts them or unfinished runs as new completions', () => {
    const unfinished = choose(createSixState(), 'cut_hair')!.state;
    const result = restoreEndingCollections({
      ids: '["family_escape","four_in_the_back"]',
      states: JSON.stringify({ family_escape: unfinished }),
    }, { ids: '["family_escape","four_in_the_back"]', states: '{}', revision: 'r6c7' });
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual(['r6c7:family_escape']);
    expect(result.previous.states).toEqual({});
  });
});


describe('the real pre-consolidation ten-ending archive', () => {
  it('reads collection/states and keeps the original ten IDs, numbers and prose', () => {
    const ids = ['reunited','caravan','lantern','letters','separated','shelter','witness','waiting','dream_guardian','dream_commons'];
    const result = restoreEndingCollections(empty, restoreTenEndingArchive(JSON.stringify({ collection: ids, states: {} })));
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual(ids.map(id => `legacy10:${id}`));
    expect(result.previous.ids.map(key => getArchivedEnding(key)?.number)).toEqual(['01','02','03','04','05','06','07','08','09','10']);
    expect(getArchivedEnding('legacy10:waiting')).toMatchObject({ title: '门边仍留着一双鞋', number: '08' });
    expect(getArchivedEnding('legacy10:dream_guardian')).toMatchObject({ title: '守护之地', number: '09', dream: true });
    expect(getArchivedEnding('legacy10:letters')?.paragraphs[0]).toBe('第一封信写今天吃了什么、姐姐住在哪里、萨米又问了什么。你没有用一场准时团圆填掉尚未知道的地方。');
  });
  it('preserves authenticated original coda IDs and reused dream numbers across r8 serialization', () => {
    let dream = createInitialState();
    for (const id of LEGACY_ENDING_TEST_ROUTES.dream_guardian) dream = choose(dream, id)!.state;
    let before = createInitialState();
    for (const id of LEGACY_ENDING_TEST_ROUTES.waiting.slice(0,-1)) before = choose(before, id)!.state;
    const coda = LEGACY_NODES.n30.choices.find(choice => choice.id === 'wait')!;
    const waiting: BranchState = { ...choose(before, 'live')!.state, endingId: 'waiting', history: [...before.history, { nodeId: 'n30', choiceId: 'wait', label: coda.label, consequence: coda.consequence }] };
    const archive = restoreTenEndingArchive(JSON.stringify({ collection: ['dream_guardian','waiting'], states: { dream_guardian: dream, waiting } }));
    const first = restoreEndingCollections(empty, [archive, { ids: '["dream_guardian"]', states: '{}', revision: 'r5c6' }]);
    expect(first.previous.ids).toEqual(['legacy10:dream_guardian','legacy10:waiting','r5c6:dream_guardian']);
    expect(first.previous.states['legacy10:waiting'].endingId).toBe('waiting');
    const reloaded = restoreEndingCollections({ ids: null, states: serializeEndingStates({}, first.previous.states) });
    expect(reloaded.current.ids).toEqual([]);
    expect(reloaded.previous.ids).toEqual(['legacy10:dream_guardian','legacy10:waiting']);
    expect(getArchivedEnding('legacy10:dream_guardian')?.number).toBe('09');
    expect(getArchivedEnding('r5c6:dream_guardian')?.number).toBe('04');
  });
  it.each([null, 'broken', '[]', '{}', '{"collection":{},"states":[]}'])('ignores malformed archive fields: %s', value => {
    const result = restoreEndingCollections(empty, restoreTenEndingArchive(value));
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual([]);
  });
});
