type ImageAttempt = { source: string; automaticRetries: number };

/** A failed image keeps its place in the scene. Recovery never changes who is visible. */
export function installImageRecovery(root: HTMLElement, owner: Pick<Document, 'createElement'> = document): () => void {
  const attempts = new WeakMap<HTMLImageElement, ImageAttempt>();
  const failed = new Set<HTMLImageElement>();
  const button = owner.createElement('button');
  button.type = 'button';
  button.className = 'minitool-image-retry';
  button.textContent = '部分画面暂未载入 · 重试画面';
  button.setAttribute('aria-label', '部分画面暂未载入，重试画面');

  function imageTarget(event: Event): HTMLImageElement | null {
    const target = event.target as HTMLImageElement | null;
    return target?.tagName === 'IMG' && typeof target.getAttribute === 'function' ? target : null;
  }
  function updateButton() {
    for (const image of failed) {
      if (!image.isConnected || image.getAttribute('src') !== attempts.get(image)?.source) failed.delete(image);
    }
    if (failed.size) { if (!button.isConnected) root.appendChild(button); }
    else button.remove();
  }
  const onError = (event: Event) => {
    const image = imageTarget(event);
    if (!image) return;
    const source = image.getAttribute('src');
    // Assets in this build are local. Never turn an unexpected remote URL into
    // an extra request, and never add cache-busting queries to packaged paths.
    if (!source || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(source)) return;
    // The browser sprite component has its own fallback/hide handler. The
    // container owns this failure instead, so a successful retry can restore
    // the original sprite without changing the character or its visibility.
    event.stopImmediatePropagation();
    let attempt = attempts.get(image);
    if (!attempt || attempt.source !== source) { attempt = { source, automaticRetries: 0 }; attempts.set(image, attempt); }
    if (attempt.automaticRetries === 0) {
      attempt.automaticRetries = 1;
      image.src = source;
      return;
    }
    failed.add(image);
    updateButton();
  };
  const onLoad = (event: Event) => { const image = imageTarget(event); if (image) { failed.delete(image); updateButton(); } };
  const retry = () => {
    updateButton();
    const images = [...failed];
    failed.clear();
    updateButton();
    for (const image of images) { const attempt = attempts.get(image); if (attempt && image.isConnected) image.src = attempt.source; }
  };
  button.addEventListener('click', retry);
  root.addEventListener('error', onError, true);
  root.addEventListener('load', onLoad, true);
  // A later story choice may remove a failed actor; that old failure must not
  // leave a retry prompt on the next scene.
  const observer = typeof MutationObserver === 'function' ? new MutationObserver(updateButton) : null;
  observer?.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  return () => { observer?.disconnect(); root.removeEventListener('error', onError, true); root.removeEventListener('load', onLoad, true); button.removeEventListener('click', retry); button.remove(); };
}
