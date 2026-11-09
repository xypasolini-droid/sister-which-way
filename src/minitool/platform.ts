export const isMinitool = true;
export const canFullscreen = false;
export const PROGRESS_KEYS = ['sister-which-way.play.r8', 'sister-which-way.reading.r8', 'sister-which-way.endings.r8', 'sister-which-way.ending-states.r8', 'sister-which-way.play.r7', 'sister-which-way.reading.r7', 'sister-which-way.endings.r7', 'sister-which-way.ending-states.r7', 'sister-which-way.preferences.v3', 'sister-which-way.v3', 'sister-which-way.endings.r6', 'sister-which-way.ending-states.r6', 'sister-which-way.reading.v6', 'sister-which-way.ten-ending-archive.v1', 'sister-which-way.endings.v3', 'sister-which-way.ending-states.v3', 'sister-which-way.endings.r5', 'sister-which-way.ending-states.r5'] as const;
type LaunchOptions = { miniToolEnv?: { buildVersion?: number | string } };
type Rectangle = { top: number; right: number; bottom: number; left: number };
type WindowInfo = { windowWidth?: number; windowHeight?: number; safeArea?: Rectangle; menuButtons?: Record<string, Rectangle | null> };
type MiniTool = {
  getLaunchOptions?: () => Promise<LaunchOptions>;
  getStorage?: (options: { key: string }) => Promise<{ data: string | null }>;
  setStorage?: (options: { key: string; data: string }) => Promise<unknown>;
  getWindowInfo?: () => Promise<WindowInfo>;
};
type Xhs = { launchOptions?: LaunchOptions; miniTool?: MiniTool };
type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export type RuntimeEnvironment = {
  xhs?: Xhs;
  localStorage?: StorageLike;
  innerWidth?: number;
  innerHeight?: number;
  document?: Pick<Document, 'documentElement'>;
  addEventListener?: (name: string, listener: () => void) => void;
};

function deadline<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('deadline')), milliseconds);
    operation.then(value => { clearTimeout(timer); resolve(value); }, error => { clearTimeout(timer); reject(error); });
  });
}
function clientVersion(options?: LaunchOptions): number {
  return Math.floor((Number(options?.miniToolEnv?.buildVersion) || 0) / 1000);
}

// All current and historical keys are hydrated before React mounts. Failed reads are protected:
// a temporary SDK failure must never turn an existing story into an empty save.
export function createMinitoolRuntime(environment: RuntimeEnvironment) {
  const mirror = new Map<string, string | null>();
  const blocked = new Set<string>();
  const writes = new Map<string, Promise<void>>();
  const session = new Map<string, string>();
  let nativeStorage: MiniTool | undefined;
  let prepared: Promise<void> | undefined;
  let version = 0;
  let hydrated = false;
  let windowRequest = 0;

  async function updateWindow(): Promise<void> {
    const root = environment.document?.documentElement;
    if (!root) return;
    const request = ++windowRequest;
    let info: WindowInfo = {};
    const miniTool = environment.xhs?.miniTool;
    if (version >= 9490 && typeof miniTool?.getWindowInfo === 'function') {
      try { info = await deadline(miniTool.getWindowInfo(), 3000); } catch { /* Keep the usable viewport fallback. */ }
    }
    if (request !== windowRequest) return;
    const width = Number(info.windowWidth) || Number(environment.innerWidth) || 0;
    const height = Number(info.windowHeight) || Number(environment.innerHeight) || 0;
    if (height > 0) root.style.setProperty('--app-height', `${height}px`);
    const area = info.safeArea;
    const finite = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;
    if (area) {
      root.style.setProperty('--safe-area-inset-top', `${finite(area.top)}px`);
      root.style.setProperty('--safe-area-inset-left', `${finite(area.left)}px`);
      root.style.setProperty('--safe-area-inset-bottom', `${finite(height - area.bottom)}px`);
      root.style.setProperty('--safe-area-inset-right', `${finite(width - area.right)}px`);
    }
    const buttons = info.menuButtons ? Object.values(info.menuButtons) : [];
    const toolbarBottom = buttons.reduce((bottom, button) => button ? Math.max(bottom, finite(button.bottom)) : bottom, 0);
    if (toolbarBottom > 0) root.style.setProperty('--minitool-toolbar-top', `${Math.max(toolbarBottom, area ? finite(area.top) : 0)}px`);
    else root.style.removeProperty('--minitool-toolbar-top');
  }

  function prepareRuntime(): Promise<void> {
    if (prepared) return prepared;
    prepared = (async () => {
      version = clientVersion(environment.xhs?.launchOptions);
      const miniTool = environment.xhs?.miniTool;
      if (!version && typeof miniTool?.getLaunchOptions === 'function') {
        try { version = clientVersion(await deadline(miniTool.getLaunchOptions(), 3000)); } catch { version = 0; }
      }
      if (version >= 9460 && typeof miniTool?.getStorage === 'function' && typeof miniTool?.setStorage === 'function') nativeStorage = miniTool;
      await Promise.all(PROGRESS_KEYS.map(async key => {
        try {
          let value: string | null;
          if (nativeStorage) {
            const response = await deadline(nativeStorage.getStorage!({ key }), 4000);
            if (!response || !(response.data === null || typeof response.data === 'string')) throw Error('storage-response');
            value = response.data;
          } else {
            if (!environment.localStorage) throw Error('storage-unavailable');
            value = environment.localStorage.getItem(key);
          }
          mirror.set(key, value);
        } catch { blocked.add(key); }
      }));
      hydrated = true;
      await updateWindow();
      environment.addEventListener?.('resize', () => { void updateWindow(); });
    })();
    return prepared;
  }
  function readLocal(key: string): string | null {
    if (!hydrated || blocked.has(key) || !mirror.has(key)) throw Error('storage-read-unavailable');
    return mirror.get(key) ?? null;
  }
  async function writeLocal(key: string, value: string): Promise<void> {
    if (!hydrated || blocked.has(key) || !mirror.has(key)) throw Error('storage-protected');
    const previous = writes.get(key) || Promise.resolve();
    const operation = previous.catch(() => {}).then(async () => {
      if (blocked.has(key)) throw Error('storage-protected');
      if (nativeStorage) {
        try { await deadline(nativeStorage.setStorage!({ key, data: value }), 4000); }
        catch (error) { blocked.add(key); throw error; }
      }
      else {
        if (!environment.localStorage) throw Error('storage-unavailable');
        environment.localStorage.setItem(key, value);
      }
      mirror.set(key, value);
    });
    writes.set(key, operation);
    await operation;
  }
  return { prepareRuntime, readLocal, writeLocal, readSession: (key: string) => session.get(key) || null, writeSession: (key: string, value: string) => { session.set(key, value); } };
}

const environment: RuntimeEnvironment = typeof window === 'undefined' ? {} : window as unknown as RuntimeEnvironment;
const runtime = createMinitoolRuntime(environment);
export const { prepareRuntime, readLocal, writeLocal, readSession, writeSession } = runtime;
export function downloadStory(_text: string): void { /* The game opens its selectable text panel. */ }
export async function enterFullscreen(): Promise<void> { /* The container owns its display mode. */ }
