import { describe, expect, it } from 'vitest';
import {
  advanceChapter, applyOperations, canAdvance, initialState,
  resolveLocalRewrite, RewriteSchema, suggestedLines, validateState,
  type StoryState,
} from './story';

function write(state: StoryState, text: string): StoryState {
  const response = resolveLocalRewrite(state, text);
  expect(RewriteSchema.safeParse(response).success).toBe(true);
  expect(response.accepted, response.narration).toBe(true);
  return applyOperations(state, response.operations);
}

describe('the paper story', () => {
  it('turns a flower path into visible flowers and an open exit in one turn', () => {
    const next = write(initialState, '洞口开出一朵花，花瓣铺成出去的路。');
    expect(next).toMatchObject({ flowers: true, pathOpen: true, turn: 1 });
    expect(initialState).toMatchObject({ flowers: false, pathOpen: false, turn: 0 });
  });

  it.each([
    '打开那扇门。', '墙壁消失了。', '河上出现了一座桥。',
    '我长出翅膀，带着同伴飞过黑暗。', '让一条小路出现。',
  ])('understands different ways out: %s', (line) => {
    expect(write(initialState, line).pathOpen).toBe(true);
  });

  it.each(['不要打开门。', '我不想让花开。', '打开门吗？', '怎么打开出口？', '让世界有一台量子计算机。'])('does not pretend to execute %s', (line) => {
    const response = resolveLocalRewrite(initialState, line);
    expect(response.accepted).toBe(false);
    expect(response.operations).toHaveLength(0);
    expect(applyOperations(initialState, response.operations)).toEqual(initialState);
  });

  it('can ignore a negative clause while applying a positive one', () => {
    const next = write(initialState, '不要打开门，让星星落进洞穴。');
    expect(next).toMatchObject({ pathOpen: false, light: true, weather: 'stars' });
  });

  it('treats own-story invincibility as a rule, including hostile player instructions', () => {
    const next = write(initialState, '一块巨石把我杀死了。');
    expect(next).toMatchObject({ ending: null, light: true });
    expect(Object.keys(next)).not.toContain('health');
    expect(resolveLocalRewrite(initialState, '我不会死。').operations).toContainEqual({ type: 'shield_player' });
    expect(applyOperations(initialState, [{ type: 'kill_player' } as never])).toEqual(initialState);
  });

  it('gates chapters using facts and keeps authored facts on transition', () => {
    expect(canAdvance(initialState)).toBe(false);
    expect(advanceChapter(initialState)).toEqual(initialState);
    const cave = write(initialState, suggestedLines(initialState)[0]);
    const forest = advanceChapter(cave);
    expect(forest).toMatchObject({ chapter: 'forest', flowers: true, pathOpen: true, turn: 1 });
    expect(canAdvance(forest)).toBe(false);
    const restored = write(forest, '怪物其实是一个迷路的孩子。');
    expect(canAdvance(restored)).toBe(true);
    expect(advanceChapter(restored).chapter).toBe('banquet');
  });

  it('completes a three-scene story with a name and a wish', () => {
    let state = advanceChapter(write(initialState, '花瓣铺成出去的路。'));
    state = write(state, '怪物其实是一个迷路的孩子。');
    state = write(state, '她叫阿禾，一直想把春天带回家。');
    expect(state).toMatchObject({ companionName: '阿禾', companionWish: '把春天带回家', companionForm: 'child' });
    state = advanceChapter(state);
    state = write(state, '她写下了自己的结局，我们一起回家。');
    expect(state.ending).toBe('together');
    expect(validateState(state)).toEqual(state);
    expect(canAdvance(state)).toBe(false);
  });

  it('allows a brief generous ending without forcing magic keywords', () => {
    const state = write(initialState, '大家都有自己的故事，并且一起活了下来。');
    expect(state).toMatchObject({ ending: 'together', companionForm: 'child', companionName: '阿禾' });
    expect(validateState(state)).toEqual(state);
  });

  it('allows an open ending only after the banquet has been reached', () => {
    expect(resolveLocalRewrite(initialState, '故事结束了。').accepted).toBe(false);
    let state = advanceChapter(write(initialState, '打开洞口。'));
    state = advanceChapter(write(state, '影子变成一个孩子。'));
    state = write(state, '故事在这里结束，未写完的明天留给我们。');
    expect(state.ending).toBe('open');
  });

  it('keeps ended stories stable until a caller explicitly undoes or resets', () => {
    const state = write(initialState, '所有人都活下来。');
    expect(resolveLocalRewrite(state, '让花盛开。').accepted).toBe(false);
    expect(applyOperations(state, [{ type: 'open_path' }])).toEqual(state);
  });

  it('rejects malformed saves, impossible endings, and oversized operation values', () => {
    expect(validateState(null)).toBeNull();
    expect(validateState({ ...initialState, chapter: 'banquet' })).toBeNull();
    expect(validateState({ ...initialState, ending: 'together' })).toBeNull();
    expect(validateState({ ...initialState, turn: -1 })).toBeNull();
    expect(validateState({ ...initialState, unknown: true })).toBeNull();
    expect(applyOperations(initialState, [{ type: 'name_companion', value: '名'.repeat(17) }])).toEqual(initialState);
    expect(applyOperations(initialState, [{ type: 'change_weather', value: 'meteor' }])).toEqual(initialState);
  });

  it('accepts a custom companion name in subsequent wish sentences', () => {
    const named = write(initialState, '她的名字叫小满。');
    const wished = write(named, '小满的愿望是成为一位讲故事的人。');
    expect(wished.companionWish).toBe('成为一位讲故事的人');
  });

  it('commits operation batches atomically when any value is invalid', () => {
    expect(applyOperations(initialState, [
      { type: 'grow_flowers' },
      { type: 'name_companion', value: '名字'.repeat(10) },
    ])).toEqual(initialState);
    expect(applyOperations(initialState, [
      { type: 'open_path' },
      { type: 'change_weather', value: 'meteor' },
    ])).toEqual(initialState);
    expect(applyOperations(initialState, [
      { type: 'grow_flowers' },
      { type: 'end_story' },
    ])).toEqual(initialState);
  });
});
