import { describe, expect, it } from 'vitest';
import {
  choose, createInitialState, ENDINGS, getChoices, getEnding, getNode, validateBranchState,
} from './branch-story';
import { initialPlayPhase, readPlayPosition, resolveStoryPlayPhase } from './play-flow';
import { SEVEN_ENDING_ROUTES } from './seven-ending-story';
import { getSevenShots } from './seven-story-presentation';

const forks = [
  { first: 'keep_bowl', node: 'v7-home', next: ['close_door', 'let_sister_speak'] },
  { first: 'take_bread', node: 'v7-market', next: ['hold_layla', 'run_home'] },
  { first: 'answer_note', node: 'v7-street', next: ['follow_spring', 'answer_layla'] },
];

const routes = [
  { choices: ['keep_bowl', 'close_door'], id: 'doors_stay_closed', title: '门一直关着', number: '01', mode: 'reality' },
  { choices: ['keep_bowl', 'let_sister_speak'], id: 'grain_without_her', title: '粮袋旁少了她', number: '02', mode: 'reality' },
  { choices: ['take_bread', 'hold_layla'], id: 'two_borrowed_boys', title: '两个被叫错的名字', number: '03', mode: 'reality' },
  { choices: ['take_bread', 'run_home'], id: 'four_in_the_back', title: '货斗里数四个人', number: '04', mode: 'reality' },
  { choices: ['answer_note', 'follow_spring'], id: 'spring_without_waking', title: '春天没有叫醒她', number: '05', mode: 'dream' },
  { choices: ['answer_note', 'answer_layla'], id: 'one_lantern_many_hands', title: '一盏灯，许多只手', number: '06', mode: 'future' },
] as const;

function play(actions: readonly string[]) {
  return actions.reduce((state, action) => choose(state, action)!.state, createInitialState('short'));
}

describe('0.7.0 proposal A', () => {
  it('opens three direct choices into distinct two-option forks, with no qualities or stats gates', () => {
    const initial = createInitialState('short');
    expect(initial).toMatchObject({
      edition: 'short', storyRevision: 7, storyContentRevision: 8, nodeId: 'v7-opening',
      father: 'missing', endingId: null, history: [],
    });
    expect(initial.flags).toContain('fatherArrested');
    expect(getChoices(initial).map(choice => choice.id)).toEqual(forks.map(fork => fork.first));

    const allChoices = [...getChoices(initial)];
    for (const { first, node, next } of forks) {
      const state = play([first]);
      expect(state.nodeId).toBe(node);
      expect(state.endingId).toBeNull();
      const choices = getChoices(state);
      expect(choices.map(choice => choice.id)).toEqual(next);
      allChoices.push(...choices);
    }
    expect(new Set(allChoices.map(choice => choice.id)).size).toBe(9);
    for (const choice of allChoices) {
      expect(choice.enabled).toBe(true);
      expect(choice.requires ?? []).toEqual([]);
      expect(choice.qualities?.length).toBeGreaterThan(0);
      expect(choice.label).not.toMatch(/被允许|只好|恳求姐姐答应|被人群带着走|跟着声音走/);
    }
    expect(choose(initial, 'cut_hair')).toBeNull();
    expect(choose(initial, 'run_home')).toBeNull();
  });

  it.each(routes)('reaches $title in two decisions and restores every authentic prefix', ({ choices, id, title, number, mode }) => {
    expect(SEVEN_ENDING_ROUTES[id]).toEqual(choices);
    let runtimeMs = 0;
    for (const count of [0, 1, 2]) {
      const state = play(choices.slice(0, count));
      expect(validateBranchState(JSON.parse(JSON.stringify(state)))).toEqual(state);
      expect(state.endingId).toBe(count === 2 ? id : null);
      const shots = getSevenShots(state);
      expect(shots.length).toBeGreaterThan(0);
      expect(readPlayPosition({ key: state.nodeId, index: shots.length - 1, phase: 'cinematic' })).not.toBeNull();
      for (const { durationMs } of shots) {
        expect(durationMs).toBeGreaterThanOrEqual(3000);
        expect(durationMs).toBeLessThanOrEqual(6000);
        runtimeMs += durationMs;
      }
    }
    expect(runtimeMs).toBeGreaterThanOrEqual(120_000);
    expect(runtimeMs).toBeLessThanOrEqual(240_000);
    const state = play(choices);
    expect(getEnding(state)).toMatchObject({ id, title, number, mode });
    expect(getNode(state).id).toBe('v7-end');
    expect(state.father).toBe('missing');
    expect(getChoices(state)).toEqual([]);
    expect(choose(state, choices[1])).toBeNull();
    expect(initialPlayPhase(state)).toBe('cinematic');
    expect(resolveStoryPlayPhase('explore', true, 1)).toBe('ending');
  });

  it('keeps the dream and waking future independent of the earlier family departure', () => {
    expect(ENDINGS.map(({ id }) => id)).toEqual(routes.map(({ id }) => id));
    expect(play(routes[3].choices).flags).toContain('boarded');
    for (const { choices } of [routes[4], routes[5]]) {
      const state = play(choices);
      expect(state.flags).toContain('familyWhereaboutsUnknown');
      expect(state.flags.filter(flag => ['boarded', 'familyEscaped', 'familyTogether'].includes(flag))).toEqual([]);
    }
    expect(play(routes[4].choices).flags).toContain('heroUnconscious');
    expect(play(routes[5].choices).flags).not.toContain('heroUnconscious');
  });

  it('rejects relabeled old versions, substituted fates, and invented changes in the saved state', () => {
    const state = play(routes[3].choices);
    for (const forged of [
      { ...state, storyRevision: 6 },
      { ...state, storyContentRevision: 7 },
      { ...state, edition: undefined },
      { ...state, endingId: 'family_escape' },
      { ...state, endingId: 'one_lantern_many_hands' },
      { ...state, flags: [...state.flags, 'released'] },
      { ...state, father: 'free' },
      { ...state, history: [...state.history, state.history[1]] },
    ]) expect(validateBranchState(forged)).toBeNull();
  });
});
