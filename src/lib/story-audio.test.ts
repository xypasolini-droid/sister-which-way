import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStoryAudio } from './story-audio';

afterEach(() => vi.unstubAllGlobals());
describe('optional offline story sound', () => {
  it('creates no audio context until explicitly enabled and handles missing support', async () => {
    const Audio = vi.fn();
    vi.stubGlobal('window', { AudioContext: Audio });
    const sound = createStoryAudio();
    sound.play('rumble');
    expect(Audio).not.toHaveBeenCalled();
    expect(await sound.setEnabled(false)).toBe(false);
    vi.stubGlobal('window', {});
    expect(await sound.setEnabled(true)).toBe(false);
    expect(() => sound.dispose()).not.toThrow();
  });
  it('stops active cues when muted and closes the context on disposal', async () => {
    const source = { type: '', frequency: { value: 0 }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn(), onended: null };
    const gain = { connect: vi.fn(), disconnect: vi.fn(), gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } };
    const close = vi.fn(async () => undefined);
    const Audio = vi.fn(function () { return { state: 'running', currentTime: 0, createOscillator: () => source, createGain: () => gain, destination: {}, close }; });
    vi.stubGlobal('window', { AudioContext: Audio });
    const sound = createStoryAudio();
    expect(await sound.setEnabled(true)).toBe(true);
    sound.play('bell');
    expect(source.start).toHaveBeenCalled();
    await sound.setEnabled(false);
    expect(source.disconnect).toHaveBeenCalled();
    const calls = source.start.mock.calls.length;
    sound.play('bell');
    expect(source.start).toHaveBeenCalledTimes(calls);
    sound.dispose();
    expect(close).toHaveBeenCalledOnce();
    expect(await sound.setEnabled(true)).toBe(false);
  });
});
