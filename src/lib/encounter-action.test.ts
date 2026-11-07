import { describe, expect, it } from 'vitest';
import { choose, createInitialState, getChoices, type BranchState } from './branch-story';
import { NODE_TEST_ROUTES } from './story-test-routes';
import { getSceneEncounter, resolveEncounterAction, toggleEncounterItem } from './scene-encounter';

function walk(route: string[], edition?: 'short'): BranchState {
  let state = createInitialState(edition);
  for (const choiceId of route) {
    const result = choose(state, choiceId);
    if (!result) throw new Error(`Test route is unavailable at ${state.nodeId}/${choiceId}`);
    state = result.state;
  }
  return state;
}

const reach = (nodeId: string) => walk(NODE_TEST_ROUTES[nodeId]);

describe('a completed encounter action advances without another confirmation', () => {
  it('returns the action as soon as the last required object is collected', () => {
    const state = reach('n01');
    const activity = getSceneEncounter(state).activity!;
    const first = toggleEncounterItem(activity, [], 'buttons');
    expect(resolveEncounterAction(state, first)).toBeNull();
    const complete = toggleEncounterItem(activity, first, 'cloth');
    expect(resolveEncounterAction(state, complete)).toBe('work');
    expect(choose(state, resolveEncounterAction(state, complete)!)?.state.nodeId).toBe('n02');
    expect(resolveEncounterAction(state, ['buttons', 'buttons'])).toBeNull();
  });

  it('keeps incomplete clothes preparation on the current scene', () => {
    const state = reach('n06');
    expect(resolveEncounterAction(state, [])).toBeNull();
    expect(resolveEncounterAction(state, ['tunic'])).toBeNull();
    expect(resolveEncounterAction(state, ['trousers'])).toBeNull();
    expect(resolveEncounterAction(state, ['tunic', 'trousers'])).toBe('buy');
  });

  it('submits a single food-sharing selection immediately when food exists', () => {
    const state = reach('n05');
    expect(resolveEncounterAction(state, ['sami'])).toBe('flour');
    expect(choose(state, 'flour')?.state.nodeId).toBe('n06');
    const empty = { ...state, stats: { ...state.stats, food: 0 } };
    expect(resolveEncounterAction(empty, ['sami'])).toBeNull();
  });

  it('waits for correct accounting and never advances on a wrong answer', () => {
    const state = reach('n10');
    expect(resolveEncounterAction(state, [])).toBeNull();
    expect(resolveEncounterAction(state, ['six'])).toBeNull();
    expect(resolveEncounterAction(state, ['eight'])).toBe('ledger');
    expect(choose(state, 'ledger')?.state.nodeId).toBe('n11');
  });

  it('preserves the chosen route and reply IDs instead of submitting a default branch', () => {
    const crossing = reach('n08');
    for (const choiceId of ['queue', 'alley', 'neighbor']) {
      expect(resolveEncounterAction(crossing, [choiceId])).toBe(choiceId);
      expect(choose(crossing, choiceId)?.state.history.at(-1)?.choiceId).toBe(choiceId);
    }
    const conversation = reach('n13');
    for (const choiceId of ['listen', 'care', 'secret']) {
      expect(resolveEncounterAction(conversation, [choiceId])).toBe(choiceId);
    }
    expect(resolveEncounterAction(crossing, ['queue', 'alley'])).toBe('alley');
  });

  it('does not submit completed activities whose story requirements are locked', () => {
    const papers = reach('n16');
    const poor = { ...papers, stats: { ...papers.stats, coins: 0 } };
    expect(getChoices(poor).find(choice => choice.id === 'register')?.enabled).toBe(false);
    expect(resolveEncounterAction(poor, ['registered'])).toBeNull();
    expect(choose(poor, 'register')).toBeNull();

    const classroom = reach('n27');
    const exhausted = { ...classroom, stats: { ...classroom.stats, food: 0, health: 0 } };
    expect(resolveEncounterAction(exhausted, ['teaching', 'care'])).toBeNull();
    expect(choose(exhausted, 'sustain')).toBeNull();
  });

  it('does not advance unknown, cross-scene, or unfinished selection IDs', () => {
    const stall = reach('n01');
    expect(resolveEncounterAction(stall, ['made-up'])).toBeNull();
    expect(resolveEncounterAction(stall, ['buttons', 'made-up'])).toBeNull();
    expect(resolveEncounterAction(stall, ['tunic', 'trousers'])).toBeNull();
    const activity = getSceneEncounter(stall).activity!;
    const selected = toggleEncounterItem(activity, ['buttons'], 'made-up');
    expect(selected).toEqual(['buttons']);
    expect(resolveEncounterAction(stall, selected)).toBeNull();
    expect(resolveEncounterAction(reach('n02'), ['buttons', 'cloth'])).toBeNull();
  });

  it('uses the short edition’s rewritten destinations and classroom action', () => {
    const fork = walk(['work', 'sew', 'buy', 'truth', 'courier'], 'short');
    expect(fork.nodeId).toBe('n18');
    for (const [choiceId, destination] of [['plan', 'n25'], ['find', 'n21'], ['rush', 'n22']]) {
      expect(resolveEncounterAction(fork, [choiceId])).toBe(choiceId);
      expect(choose(fork, choiceId)?.state.nodeId).toBe(destination);
    }
    const classroom = choose(fork, 'rush')!.state;
    expect(resolveEncounterAction(classroom, ['teaching'])).toBeNull();
    expect(resolveEncounterAction(classroom, ['teaching', 'care'])).toBe('school');
    const result = choose(classroom, 'school')!.state;
    expect(result.nodeId).toBe('n30');
    expect(result.flags).toContain('sustained');
  });

  it('only resolves an intent and leaves resources, history, and selection untouched', () => {
    const state = reach('n10');
    const selection = ['eight'];
    const snapshot = structuredClone(state);
    expect(resolveEncounterAction(state, selection)).toBe('ledger');
    expect(resolveEncounterAction(state, selection)).toBe('ledger');
    expect(state).toEqual(snapshot);
    expect(selection).toEqual(['eight']);
  });
});
