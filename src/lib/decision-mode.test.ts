import { describe, expect, it, vi } from 'vitest';
import { observeDecisionMode } from './decision-mode';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

const flush = () => new Promise<void>(resolve => setImmediate(resolve));

describe('optional decision-mode discovery lifecycle', () => {
  it('does not abort or update state when disposed before the GET resolves', async () => {
    const request = deferred<Response>();
    const fetcher = vi.fn<typeof fetch>().mockReturnValue(request.promise);
    const onMode = vi.fn();
    const dispose = observeDecisionMode(onMode, fetcher);
    dispose();
    request.resolve(Response.json({ mode: 'ai' }));
    await flush();
    expect(fetcher).toHaveBeenCalledWith('/api/decision', { cache: 'no-store' });
    expect(onMode).not.toHaveBeenCalled();
  });

  it('ignores an old response that finishes after a fresh effect has resolved', async () => {
    const old = deferred<Response>();
    const fresh = deferred<Response>();
    const fetcher = vi.fn<typeof fetch>().mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
    const onMode = vi.fn();
    const disposeOld = observeDecisionMode(onMode, fetcher);
    disposeOld(); // Strict Mode / Fast Refresh teardown, followed by setup.
    observeDecisionMode(onMode, fetcher);
    fresh.resolve(Response.json({ mode: 'ai' }));
    await flush();
    old.resolve(Response.json({ mode: 'local' }));
    await flush();
    expect(onMode.mock.calls).toEqual([[true]]);
  });

  it('does not update after cleanup while the body is still being read', async () => {
    const body = deferred<unknown>();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue({ ok: true, json: () => body.promise } as Response);
    const onMode = vi.fn();
    const dispose = observeDecisionMode(onMode, fetcher);
    await flush();
    dispose();
    body.resolve({ mode: 'ai' });
    await flush();
    expect(onMode).not.toHaveBeenCalled();
  });

  it.each(['network', 'http', 'json', 'shape'] as const)('keeps the local story usable after %s discovery failure', async failure => {
    const fetcher = vi.fn<typeof fetch>();
    if (failure === 'network') fetcher.mockRejectedValue(new TypeError('Network unavailable'));
    if (failure === 'http') fetcher.mockResolvedValue(new Response('Unavailable', { status: 503 }));
    if (failure === 'json') fetcher.mockResolvedValue(new Response('not json'));
    if (failure === 'shape') fetcher.mockResolvedValue(Response.json(null));
    const onMode = vi.fn();
    observeDecisionMode(onMode, fetcher);
    await flush();
    expect(onMode.mock.calls).toEqual([[false]]);
  });

  it('consumes a rejected request after cleanup without a stale fallback update', async () => {
    const request = deferred<Response>();
    const fetcher = vi.fn<typeof fetch>().mockReturnValue(request.promise);
    const onMode = vi.fn();
    const dispose = observeDecisionMode(onMode, fetcher);
    dispose();
    request.reject(new DOMException('The request was aborted', 'AbortError'));
    await flush();
    expect(onMode).not.toHaveBeenCalled();
  });
});
