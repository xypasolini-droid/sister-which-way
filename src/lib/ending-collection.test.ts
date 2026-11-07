import { describe, expect, it } from 'vitest';
import { choose, createInitialState, type BranchState } from './branch-story';
import { restoreEndingCollections, serializeEndingStates } from './ending-collection';

const empty = { ids: null, states: null };
function completion(previous = false): BranchState {
  let state = createInitialState('short');
  if (previous) delete state.storyContentRevision;
  for (const id of ['work', 'sew', 'buy', 'truth', 'courier', 'plan', 'release']) {
    const result = choose(state, id);
    if (!result) throw Error(`Unavailable test action: ${state.nodeId}/${id}`);
    state = result.state;
  }
  return state;
}
const stored = (state: BranchState) => ({ ids: JSON.stringify([state.endingId]), states: JSON.stringify({ [state.endingId!]: state }) });

describe('current and historical ending collections', () => {
  it('counts only validated content-six completions toward the new five endings', () => {
    const result = restoreEndingCollections(stored(completion()), stored(completion(true)));
    expect(result.current.ids).toEqual(['reunited']);
    expect(result.current.states.reunited.storyContentRevision).toBe(6);
    expect(result.previous.ids).toEqual(['reunited']);
    expect(result.previous.states.reunited.storyContentRevision).toBeUndefined();
  });
  it('keeps old completed snapshots as old history even when found in the new keys', () => {
    const old = completion(true);
    const result = restoreEndingCollections(stored(old), empty);
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual(['reunited']);
    expect(result.previous.states.reunited.history).toEqual(old.history);
  });
  it('recovers genuinely played current snapshots from the previous collection keys', () => {
    const result = restoreEndingCollections(empty, stored(completion()));
    expect(result.current.ids).toEqual(['reunited']);
    expect(result.previous.ids).toEqual([]);
  });
  it('preserves name-only older records without treating them as current completions', () => {
    const result = restoreEndingCollections({ ids: '["caravan"]', states: '{}' }, { ids: '["caravan","waiting"]', states: '{}' });
    expect(result.current.ids).toEqual([]);
    expect(result.previous.ids).toEqual(['caravan', 'lantern']);
  });
  it('does not mutate source records or count malformed snapshots', () => {
    const source = stored(completion(true));
    const before = JSON.stringify(source);
    const result = restoreEndingCollections({ ids: '["reunited"]', states: '{"reunited":{"storyContentRevision":6,"endingId":"reunited"}}' }, source);
    expect(result.current.ids).toEqual([]);
    expect(JSON.stringify(source)).toBe(before);
    expect(restoreEndingCollections({ ids: 'broken', states: 'broken' }, empty).current.ids).toEqual([]);
  });
  it('keeps an old completion alongside a new completion of the same ending after reloading', () => {
    const current = completion(), previous = completion(true);
    const states = serializeEndingStates({ reunited: current }, { reunited: previous });
    const result = restoreEndingCollections({ ids: '["reunited"]', states }, empty);
    expect(result.current.ids).toEqual(['reunited']);
    expect(result.previous.ids).toEqual(['reunited']);
    expect(result.current.states.reunited.storyContentRevision).toBe(6);
    expect(result.previous.states.reunited.storyContentRevision).toBeUndefined();
  });
});
