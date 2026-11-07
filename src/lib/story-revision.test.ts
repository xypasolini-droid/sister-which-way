import { describe, expect, it } from 'vitest';
import { choose, createInitialState, getChoices, getEnding, validateBranchState, type BranchState } from './branch-story';

function takeAvailableStep(state: BranchState) {
  const action = getChoices(state).find(choice => choice.enabled && !choice.id.startsWith('dream_'));
  if (!action) throw new Error(`No available action at ${state.nodeId}`);
  const result = choose(state, action.id);
  if (!result) throw new Error(`Could not take ${action.id} at ${state.nodeId}`);
  return result.state;
}

function reachFinalDecision() {
  let state = createInitialState();
  for (let step = 0; step < 35 && state.nodeId !== 'n30'; step++) state = takeAvailableStep(state);
  expect(state.nodeId).toBe('n30');
  expect(state.endingId).toBeNull();
  return state;
}

describe('the revised story and the boundary between reality and dreams', () => {
  it('starts with the father present, then records the arrest and the mother’s lasting injury', () => {
    const initial = createInitialState();
    expect(initial.version).toBe(3);
    expect(initial.father).toBe('free');
    const arrestScene = takeAvailableStep(initial);
    expect(arrestScene.nodeId).toBe('n02');
    expect(arrestScene.father).toBe('free');
    const afterArrest = takeAvailableStep(arrestScene);
    expect(afterArrest.nodeId).toBe('n03');
    expect(afterArrest.father).toBe('missing');
    const afterSearch = takeAvailableStep(afterArrest);
    expect(afterSearch.nodeId).toBe('n04');
    expect(afterSearch.flags).toContain('motherHurt');
    expect(initial.history).toHaveLength(0);
    expect(initial.father).toBe('free');
  });

  it('normalizes only the earlier v3 n02 arrest snapshot while still validating every other field', () => {
    const current = takeAvailableStep(createInitialState());
    const legacy = { ...current, father: 'missing' };
    expect(validateBranchState(legacy)).toEqual(current);
    expect(validateBranchState({...legacy, stats:{...legacy.stats,coins:10}})).toBeNull();
    const arrested = takeAvailableStep(current);
    expect(validateBranchState({...arrested,father:'free'})).toBeNull();
    expect(validateBranchState(arrested)).toEqual(arrested);
  });

  it('rejects the previous story revision instead of reinterpreting its old choices', () => {
    const current = createInitialState();
    expect(validateBranchState(current)).toEqual(current);
    expect(validateBranchState({ ...current, version: 2 })).toBeNull();
  });

  for (const id of ['dream_guardian', 'dream_commons']) {
    it(`${id} leaves the real family and resources unchanged`, () => {
      const before = reachFinalDecision();
      const snapshot = structuredClone(before);
      expect(getChoices(before).find(choice => choice.id === id)?.enabled).toBe(true);
      const result = choose(before, id);
      expect(result).not.toBeNull();
      const after = result!.state;
      expect(after.endingId).toBe(id);
      expect(after.father).toBe(before.father);
      expect(after.sister).toBe(before.sister);
      expect(after.stats).toEqual(before.stats);
      expect(after.outfit).toBe(before.outfit);
      expect(after.scarf).toBe(before.scarf);
      expect(after.flags).toEqual(before.flags);
      expect(before).toEqual(snapshot);
      expect(after.history).toHaveLength(before.history.length + 1);
      expect(getEnding(after)?.id).toBe(id);
      expect(validateBranchState(after)).toEqual(after);
    });
  }
});
