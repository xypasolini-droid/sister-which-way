import { describe, expect, it } from 'vitest';
import { initialPlayPhase, readPlayPosition, restoreStoryPlayback } from './play-flow';
import { choose, createInitialState } from './branch-story';
import { getSevenShots } from './seven-story-presentation';

describe('scene-first play flow', () => {
  it('opens normal scenes for action and performs the arrest and mother’s encounter first', () => {
    expect(initialPlayPhase({ nodeId: 'n01', endingId: null })).toBe('cinematic');
    expect(initialPlayPhase({ nodeId: 'n06', endingId: null })).toBe('explore');
    expect(initialPlayPhase({ nodeId: 'n02', endingId: null })).toBe('cinematic');
    expect(initialPlayPhase({ nodeId: 'n03', endingId: null })).toBe('cinematic');
    expect(initialPlayPhase({ nodeId: 'n30', endingId: 'reunited' })).toBe('reading');
    expect(initialPlayPhase({ nodeId: 'n06', endingId: null, edition: 'short' })).toBe('cinematic');
    expect(initialPlayPhase({ nodeId: 'n30', endingId: 'reunited', edition: 'short' })).toBe('ending');
  });
  it('resumes new exploration and pre-existing reading or decisions without resetting the story', () => {
    for (const phase of ['cinematic', 'explore', 'reading', 'choice', 'compose', 'ending']) {
      expect(readPlayPosition({ key: 'same-path', index: 2, phase })).toEqual({ key: 'same-path', index: 2, phase });
    }
  });
  it('shows the opening decision immediately, including when a 0.7.0 save was waiting in the opener', () => {
    const state = createInitialState('short');
    const shots = getSevenShots(state);
    const fallback = initialPlayPhase(state);
    expect(restoreStoryPlayback('open', null, fallback, false, shots)).toEqual({ phase: 'explore', index: 0 });
    expect(restoreStoryPlayback('open', { key: 'open', index: 3, phase: 'cinematic' }, fallback, false, shots)).toEqual({ phase: 'explore', index: 0 });
  });
  it('resumes a scene by shot ID and keeps a reached fork or ending open', () => {
    const market = choose(createInitialState('short'), 'take_bread')!.state;
    const shots = getSevenShots(market);
    const fallback = initialPlayPhase(market);
    const saved = readPlayPosition({ key: 'market', index: 1, phase: 'cinematic', shotId: shots[4].id });
    expect(restoreStoryPlayback('market', saved, fallback, false, shots)).toEqual({ phase: 'cinematic', index: 4 });
    expect(restoreStoryPlayback('market', { key: 'market', index: 4, phase: 'cinematic' }, fallback, false, shots)).toEqual({ phase: 'cinematic', index: 0 });
    expect(restoreStoryPlayback('market', { key: 'market', index: 0, phase: 'explore' }, fallback, false, shots)).toEqual({ phase: 'explore', index: 0 });
    const ending = choose(market, 'run_home')!.state;
    expect(restoreStoryPlayback('truck', { key: 'truck', index: 0, phase: 'ending' }, initialPlayPhase(ending), true, getSevenShots(ending))).toEqual({ phase: 'ending', index: 0 });
  });
  it.each([null, [], {}, { key: 'x', index: -1, phase: 'explore' }, { key: 'x', index: 0, phase: 'unknown' }, { key: 'x', index: 1.5, phase: 'reading' }])('rejects malformed positions: %j', value => {
    expect(readPlayPosition(value)).toBeNull();
  });
});
