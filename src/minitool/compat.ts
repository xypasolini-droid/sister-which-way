// Only the few language/runtime helpers used by the game are supplied here.
// Syntax is lowered by the minitool build to the Chrome 61 / ES2017 baseline.
export function installCompatibility(): void {
  if (!Object.hasOwn) Object.defineProperty(Object, 'hasOwn', { configurable: true, writable: true, value: (object: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(object, key) });
  if (!Array.prototype.at) Object.defineProperty(Array.prototype, 'at', { configurable: true, writable: true, value: function(index: number) { const integer = Math.trunc(Number(index)) || 0; return this[integer < 0 ? this.length + integer : integer]; } });
  if (!Array.prototype.findLast) Object.defineProperty(Array.prototype, 'findLast', { configurable: true, writable: true, value: function(predicate: (value: unknown, index: number, array: unknown[]) => boolean, thisArg?: unknown) { for (let index = this.length - 1; index >= 0; index--) if (predicate.call(thisArg, this[index], index, this)) return this[index]; return undefined; } });
  if (!Array.prototype.flatMap) Object.defineProperty(Array.prototype, 'flatMap', { configurable: true, writable: true, value: function(mapper: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: unknown) { const result: unknown[] = []; for (let index = 0; index < this.length; index++) if (index in this) { const value = mapper.call(thisArg, this[index], index, this); if (Array.isArray(value)) for (let inner = 0; inner < value.length; inner++) { if (inner in value) result.push(value[inner]); } else result.push(value); } return result; } });
  if (typeof window === 'undefined') return;
  const flex = document.createElement('div');
  flex.style.cssText = 'position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px;padding:0;border:0';
  for (let index = 0; index < 2; index++) { const item = document.createElement('div'); item.style.cssText = 'height:1px;flex-shrink:0'; flex.appendChild(item); }
  document.body.appendChild(flex);
  document.documentElement.classList.toggle('no-flex-gap', flex.scrollHeight !== 3);
  flex.remove();
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function' || !CSS.supports('aspect-ratio', '1 / 1')) {
    document.documentElement.classList.add('no-aspect-ratio');
    let scheduled = false;
    const scheduleActors = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        document.querySelectorAll<HTMLElement>('.narrative-actor').forEach(actor => {
          const ratio = Number(getComputedStyle(actor).getPropertyValue('--legacy-aspect').trim());
          const width = Math.round(actor.offsetHeight * ratio * 100) / 100;
          if (Number.isFinite(width) && width > 0 && actor.style.width !== `${width}px`) { actor.style.width = `${width}px`; actor.dataset.legacyWidth = 'true'; }
          else if (ratio <= 0 && actor.dataset.legacyWidth) { actor.style.width = ''; delete actor.dataset.legacyWidth; }
        });
      });
    };
    const root = document.getElementById('root');
    if (root && typeof MutationObserver === 'function') new MutationObserver(scheduleActors).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-pose', 'data-drama-visual', 'data-arrest-step', 'data-phase', 'data-presence', 'data-kind', 'data-space'] });
    window.addEventListener('resize', scheduleActors);
    document.addEventListener('load', scheduleActors, true);
    scheduleActors();
  }
  // Story snapshots contain JSON values only; this is deliberately not a
  // general structured-clone implementation for DOM nodes or binary data.
  if (typeof window.structuredClone !== 'function') window.structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
  const originalMatchMedia = window.matchMedia;
  if (typeof originalMatchMedia === 'function') {
    window.matchMedia = (query: string): MediaQueryList => {
      const media = originalMatchMedia.call(window, query);
      if (typeof media.addEventListener !== 'function' && typeof media.addListener === 'function') {
        media.addEventListener = ((_type: string, listener: (event: MediaQueryListEvent) => void) => media.addListener(listener)) as MediaQueryList['addEventListener'];
        media.removeEventListener = ((_type: string, listener: (event: MediaQueryListEvent) => void) => media.removeListener(listener)) as MediaQueryList['removeEventListener'];
      }
      return media;
    };
  }
}
