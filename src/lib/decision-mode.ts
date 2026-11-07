/**
 * This GET only discovers optional AI configuration; it never invokes a model.
 * Let the tiny request finish and ignore a retired effect's result. Aborting it
 * during Strict Mode / Fast Refresh teardown can surface a needless AbortError
 * in development tooling, and does not save any model work.
 */
export function observeDecisionMode(onMode: (enabled: boolean) => void, fetcher: typeof fetch = fetch): () => void {
  let active = true;

  async function load() {
    let enabled = false;
    try {
      const response = await fetcher('/api/decision', { cache: 'no-store' });
      if (response.ok) {
        const data: unknown = await response.json();
        enabled = data !== null && typeof data === 'object' && 'mode' in data && data.mode === 'ai';
      }
    } catch {
      // Optional discovery failure keeps the authored local game available.
    }
    if (active) onMode(enabled);
  }

  void load();
  return () => { active = false; };
}
