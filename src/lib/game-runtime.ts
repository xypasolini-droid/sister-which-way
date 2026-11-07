// The minitool build replaces this module as a whole. Browser-only capabilities
// stay here so they cannot be carried into the offline container by accident.
export const isMinitool = false;
export const canFullscreen = true;
export function readLocal(key: string): string | null { return localStorage.getItem(key); }
export async function writeLocal(key: string, value: string): Promise<void> { localStorage.setItem(key, value); }
export function readSession(key: string): string | null { return sessionStorage.getItem(key); }
export function writeSession(key: string, value: string): void { sessionStorage.setItem(key, value); }
export function downloadStory(text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = '姐姐，我该怎么走-我的故事.md'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function enterFullscreen(): Promise<void> {
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}
