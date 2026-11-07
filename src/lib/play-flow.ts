import type { BranchState } from './branch-story';

export type PlayPhase = 'explore' | 'reading' | 'choice' | 'compose' | 'ending';
export type PlayPosition = { key: string; index: number; phase: PlayPhase };

/** These two events must establish what happened before the player handles the aftermath. */
export function initialPlayPhase(state: Pick<BranchState, 'nodeId' | 'endingId' | 'edition'>): PlayPhase {
  if (state.edition === 'short' && state.endingId) return 'ending';
  return state.endingId || state.nodeId === 'n02' || state.nodeId === 'n03' || (state.edition === 'short' && state.nodeId === 'n06') ? 'reading' : 'explore';
}

/** Keeps existing reading positions while accepting the new, recoverable scene mode. */
export function readPlayPosition(value: unknown): PlayPosition | null {
  if (!value || typeof value !== 'object') return null;
  const position = value as Partial<PlayPosition>;
  if (typeof position.key !== 'string' || position.key.length > 12000 || !Number.isInteger(position.index) || position.index! < 0 || position.index! > 20) return null;
  if (!['explore', 'reading', 'choice', 'compose', 'ending'].includes(position.phase as string)) return null;
  return { key: position.key, index: position.index!, phase: position.phase! };
}
