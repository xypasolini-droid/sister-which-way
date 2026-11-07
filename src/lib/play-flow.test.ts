import { describe, expect, it } from 'vitest';
import { initialPlayPhase, readPlayPosition } from './play-flow';

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
  it.each([null, [], {}, { key: 'x', index: -1, phase: 'explore' }, { key: 'x', index: 0, phase: 'unknown' }, { key: 'x', index: 1.5, phase: 'reading' }])('rejects malformed positions: %j', value => {
    expect(readPlayPosition(value)).toBeNull();
  });
});
