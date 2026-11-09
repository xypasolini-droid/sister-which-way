import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMinitoolRuntime, PROGRESS_KEYS } from './platform';

const saveKey = PROGRESS_KEYS[0];
function localStorageMock(values = new Map<string, string>()) {
  return { getItem: vi.fn((key: string) => values.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { values.set(key, value); }) };
}
function sdkMock(values = new Map<string, string>()) {
  return {
    getStorage: vi.fn(async ({ key }: { key: string }) => ({ data: values.get(key) ?? null })),
    setStorage: vi.fn(async ({ key, data }: { key: string; data: string }) => { values.set(key, data); }),
  };
}
afterEach(() => { vi.useRealTimers(); });

describe('minitool persistence', () => {
  it('keeps r8 progress independent from every historical save namespace', async () => {
    const old = 'sister-which-way.v3';
    const oldEndings = 'sister-which-way.endings.r6';
    const lastEndings = 'sister-which-way.endings.r7';
    const values = new Map([[old, 'unfinished-old-story'], [oldEndings, '["dream_guardian"]'], [lastEndings, '["family_escape"]']]);
    const native = sdkMock(values);
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9490000 } }, miniTool: native } });
    await runtime.prepareRuntime();
    await runtime.writeLocal('sister-which-way.play.r8', 'new-three-way-opening');
    await runtime.writeLocal('sister-which-way.endings.r8', '["four_in_the_back"]');
    expect(values.get(old)).toBe('unfinished-old-story');
    expect(values.get(oldEndings)).toBe('["dream_guardian"]');
    expect(values.get(lastEndings)).toBe('["family_escape"]');
    expect(PROGRESS_KEYS).toContain('sister-which-way.reading.r8');
    expect(PROGRESS_KEYS).toContain('sister-which-way.ending-states.r8');
    expect(runtime.readLocal(old)).toBe('unfinished-old-story');
  });
  it('hydrates every current and historical progress key from the native SDK before synchronous reads', async () => {
    const native = sdkMock(new Map([[saveKey, '["original"]']]));
    const fallback = localStorageMock();
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9460007 } }, miniTool: native }, localStorage: fallback });
    expect(() => runtime.readLocal(saveKey)).toThrow();
    await runtime.prepareRuntime();
    expect(native.getStorage.mock.calls.map(([options]) => options.key)).toEqual([...PROGRESS_KEYS]);
    expect(runtime.readLocal(saveKey)).toBe('["original"]');
    expect(runtime.readLocal(PROGRESS_KEYS[1])).toBeNull();
    expect(fallback.getItem).not.toHaveBeenCalled();
    await runtime.writeLocal(saveKey, '["next"]');
    expect(native.setStorage).toHaveBeenCalledWith({ key: saveKey, data: '["next"]' });
    expect(runtime.readLocal(saveKey)).toBe('["next"]');
  });

  it('uses asynchronous launch options and ignores only the trailing build sequence', async () => {
    const native = { ...sdkMock(), getLaunchOptions: vi.fn(async () => ({ miniToolEnv: { buildVersion: '9460001' } })) };
    const runtime = createMinitoolRuntime({ xhs: { miniTool: native } });
    await runtime.prepareRuntime();
    expect(native.getLaunchOptions).toHaveBeenCalledOnce();
    expect(native.getStorage).toHaveBeenCalledTimes(PROGRESS_KEYS.length);
  });

  it.each([9459999, 0])('uses guarded browser storage below the supported version: %s', async buildVersion => {
    const native = sdkMock();
    const fallback = localStorageMock(new Map([[saveKey, '["fallback"]']]));
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion } }, miniTool: native }, localStorage: fallback });
    await runtime.prepareRuntime();
    expect(runtime.readLocal(saveKey)).toBe('["fallback"]');
    await runtime.writeLocal(saveKey, '["new"]');
    expect(fallback.setItem).toHaveBeenCalledWith(saveKey, '["new"]');
    expect(native.getStorage).not.toHaveBeenCalled();
  });

  it('falls back only when SDK storage methods are absent', async () => {
    const fallback = localStorageMock();
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9490000 } }, miniTool: {} }, localStorage: fallback });
    await runtime.prepareRuntime();
    await runtime.writeLocal(saveKey, '[]');
    expect(fallback.setItem).toHaveBeenCalledWith(saveKey, '[]');
  });

  it('protects failed native reads from an empty-game overwrite without falling back', async () => {
    const native = sdkMock();
    native.getStorage.mockImplementation(async ({ key }) => { if (key === saveKey) throw Error('temporary'); return { data: null }; });
    const fallback = localStorageMock(new Map([[saveKey, 'unrelated browser save']]));
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9460000 } }, miniTool: native }, localStorage: fallback });
    await runtime.prepareRuntime();
    expect(() => runtime.readLocal(saveKey)).toThrow();
    await expect(runtime.writeLocal(saveKey, '[]')).rejects.toThrow('storage-protected');
    expect(native.setStorage).not.toHaveBeenCalled();
    expect(fallback.getItem).not.toHaveBeenCalled();
    expect(fallback.setItem).not.toHaveBeenCalled();
    expect(runtime.readLocal(PROGRESS_KEYS[1])).toBeNull();
  });

  it('does not report a failed SDK write as a saved value or try browser storage', async () => {
    const native = sdkMock(new Map([[saveKey, '["original"]']]));
    native.setStorage.mockRejectedValue(Error('storage-full'));
    const fallback = localStorageMock();
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9460000 } }, miniTool: native }, localStorage: fallback });
    await runtime.prepareRuntime();
    await expect(runtime.writeLocal(saveKey, '["unsaved"]')).rejects.toThrow('storage-full');
    expect(() => runtime.readLocal(saveKey)).toThrow('storage-read-unavailable');
    expect(fallback.setItem).not.toHaveBeenCalled();
  });

  it('serializes native writes so an earlier save cannot finish after a newer one', async () => {
    const native = sdkMock();
    let finishFirst: (() => void) | undefined;
    native.setStorage.mockImplementationOnce(() => new Promise<void>(resolve => { finishFirst = resolve; }));
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9460000 } }, miniTool: native } });
    await runtime.prepareRuntime();
    const first = runtime.writeLocal(saveKey, '["first"]');
    const second = runtime.writeLocal(saveKey, '["second"]');
    await Promise.resolve(); await Promise.resolve();
    expect(native.setStorage).toHaveBeenCalledTimes(1);
    finishFirst!();
    await Promise.all([first, second]);
    expect(native.setStorage.mock.calls.map(([options]) => options.data)).toEqual(['["first"]', '["second"]']);
    expect(runtime.readLocal(saveKey)).toBe('["second"]');
  });

  it('stops subsequent writes after a deadline with an uncertain native outcome', async () => {
    vi.useFakeTimers();
    const native = sdkMock();
    native.setStorage.mockImplementationOnce(() => new Promise<void>(() => {}));
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9460000 } }, miniTool: native } });
    await runtime.prepareRuntime();
    const first = runtime.writeLocal(saveKey, '["late"]');
    const firstFailure = expect(first).rejects.toThrow('deadline');
    const second = runtime.writeLocal(saveKey, '["newer"]');
    const secondFailure = expect(second).rejects.toThrow('storage-protected');
    await vi.advanceTimersByTimeAsync(4001);
    await Promise.all([firstFailure, secondFailure]);
    expect(native.setStorage).toHaveBeenCalledTimes(1);
  });

  it('tolerates unavailable browser storage without destroying a save', async () => {
    const fallback = localStorageMock(); fallback.getItem.mockImplementation(() => { throw Error('denied'); });
    const runtime = createMinitoolRuntime({ localStorage: fallback });
    await runtime.prepareRuntime();
    expect(() => runtime.readLocal(saveKey)).toThrow();
    await expect(runtime.writeLocal(saveKey, '[]')).rejects.toThrow();
    expect(fallback.setItem).not.toHaveBeenCalled();
  });
});

describe('minitool native window information', () => {
  it('preserves CSS safe-area fallbacks when native geometry is unavailable', async () => {
    const setProperty = vi.fn();
    const removeProperty = vi.fn();
    const getWindowInfo = vi.fn();
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9460000 } }, miniTool: { ...sdkMock(), getWindowInfo } }, innerHeight: 700, document: { documentElement: { style: { setProperty, removeProperty } } as unknown as HTMLElement } });
    await runtime.prepareRuntime();
    expect(getWindowInfo).not.toHaveBeenCalled();
    expect(setProperty).toHaveBeenCalledWith('--app-height', '700px');
    expect(setProperty.mock.calls.some(([key]) => key.startsWith('--safe-area-inset-'))).toBe(false);
    expect(removeProperty).toHaveBeenCalledWith('--minitool-toolbar-top');
  });

  it('restores the CSS toolbar fallback when native top buttons are hidden', async () => {
    const setProperty = vi.fn(), removeProperty = vi.fn();
    const miniTool = { ...sdkMock(), getWindowInfo: async () => ({ windowWidth: 400, windowHeight: 800, safeArea: { top: 24, left: 0, right: 400, bottom: 780 }, menuButtons: { back: null, share: null } }) };
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9490000 } }, miniTool }, document: { documentElement: { style: { setProperty, removeProperty } } as unknown as HTMLElement } });
    await runtime.prepareRuntime();
    expect(setProperty).toHaveBeenCalledWith('--safe-area-inset-top', '24px');
    expect(removeProperty).toHaveBeenCalledWith('--minitool-toolbar-top');
  });

  it('uses safe-area coordinates and visible native buttons on supported clients', async () => {
    const styles = new Map<string, string>();
    const native = { ...sdkMock(), getWindowInfo: vi.fn(async () => ({ windowWidth: 400, windowHeight: 800, safeArea: { top: 24, left: 0, right: 400, bottom: 780 }, menuButtons: { back: { top: 28, left: 8, right: 40, bottom: 60 }, share: null } })) };
    const runtime = createMinitoolRuntime({ xhs: { launchOptions: { miniToolEnv: { buildVersion: 9490004 } }, miniTool: native }, document: { documentElement: { style: { setProperty: (key: string, value: string) => styles.set(key, value) } } as unknown as HTMLElement } });
    await runtime.prepareRuntime();
    expect(native.getWindowInfo).toHaveBeenCalledOnce();
    expect(styles.get('--app-height')).toBe('800px');
    expect(styles.get('--safe-area-inset-top')).toBe('24px');
    expect(styles.get('--safe-area-inset-bottom')).toBe('20px');
    expect(styles.get('--minitool-toolbar-top')).toBe('60px');
  });
});
