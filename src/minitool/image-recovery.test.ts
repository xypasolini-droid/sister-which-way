import { describe, expect, it, vi } from 'vitest';
import { installImageRecovery } from './image-recovery';

function recoveryFixture() {
  const rootListeners = new Map<string, (event: Event) => void>();
  const buttonListeners = new Map<string, () => void>();
  const button = {
    type: '', className: '', textContent: '', isConnected: false,
    setAttribute: vi.fn(),
    addEventListener: vi.fn((name: string, listener: () => void) => buttonListeners.set(name, listener)),
    removeEventListener: vi.fn(),
    remove: vi.fn(() => { button.isConnected = false; }),
  };
  const root = {
    addEventListener: vi.fn((name: string, listener: (event: Event) => void) => rootListeners.set(name, listener)),
    removeEventListener: vi.fn(),
    appendChild: vi.fn(() => { button.isConnected = true; }),
  };
  const owner = { createElement: () => button };
  const cleanup = installImageRecovery(root as unknown as HTMLElement, owner as unknown as Pick<Document, 'createElement'>);
  const emit = (name: string, target: unknown) => { const event = { target, stopImmediatePropagation: vi.fn() }; rootListeners.get(name)!(event as unknown as Event); return event; };
  const image = (source = './assets/art/ending.webp') => {
    const writes: string[] = [];
    const actor = { tagName: 'IMG', isConnected: true, hidden: true, style: { display: 'none' }, getAttribute: () => source, get src() { return source; }, set src(value: string) { writes.push(value); source = value; } };
    return { actor, writes };
  };
  return { root, button, cleanup, emit, image, retry: () => buttonListeners.get('click')!() };
}

describe('minitool local image recovery', () => {
  it('automatically retries a local image once at the identical path, then waits for the player', () => {
    const fixture = recoveryFixture(), { actor, writes } = fixture.image();
    const event = fixture.emit('error', actor);
    expect(event.stopImmediatePropagation).toHaveBeenCalledOnce();
    expect(writes).toEqual(['./assets/art/ending.webp']);
    expect(fixture.button.isConnected).toBe(false);
    fixture.emit('error', actor);
    fixture.emit('error', actor);
    expect(writes).toHaveLength(1);
    expect(fixture.button.textContent).toContain('重试画面');
    expect(fixture.button.isConnected).toBe(true);
    fixture.retry();
    expect(writes).toEqual(['./assets/art/ending.webp', './assets/art/ending.webp']);
    expect(fixture.button.isConnected).toBe(false);
    fixture.emit('error', actor);
    expect(writes).toHaveLength(2);
    expect(fixture.button.isConnected).toBe(true);
  });

  it('does not force a hidden actor to appear and clears the retry prompt after loading', () => {
    const fixture = recoveryFixture(), { actor } = fixture.image();
    fixture.emit('error', actor); fixture.emit('error', actor);
    expect(actor.hidden).toBe(true);
    expect(actor.style.display).toBe('none');
    fixture.emit('load', actor);
    expect(fixture.button.isConnected).toBe(false);
  });

  it('drops a failed image from a departed scene instead of retrying a removed actor', () => {
    const fixture = recoveryFixture(), { actor, writes } = fixture.image();
    fixture.emit('error', actor); fixture.emit('error', actor);
    actor.isConnected = false;
    fixture.retry();
    expect(writes).toHaveLength(1);
    expect(fixture.button.isConnected).toBe(false);
  });

  it('does not request unexpected external sources and removes its listeners on disposal', () => {
    const fixture = recoveryFixture(), { actor, writes } = fixture.image('https://example.com/missing.webp');
    fixture.emit('error', actor);
    expect(writes).toHaveLength(0);
    expect(fixture.button.isConnected).toBe(false);
    fixture.cleanup();
    expect(fixture.root.removeEventListener).toHaveBeenCalledWith('error', expect.any(Function), true);
    expect(fixture.root.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function), true);
  });
});
