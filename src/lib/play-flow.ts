import type { BranchState } from './branch-story';
import { getOppressionShots } from './oppression-scenes';
import { getSixShots } from './six-story-presentation';
import { getSevenShots } from './seven-story-presentation';

export type PlayPhase = 'cinematic' | 'explore' | 'reading' | 'choice' | 'compose' | 'ending';
export type PlayPosition = { key: string; index: number; phase: PlayPhase };

/** The six-ending editions have an automatic performance, a fork, and a final panel.
 * The committed fate survives both replay and obsolete/corrupt reading phases. */
export function resolveStoryPlayPhase(recovered: PlayPhase, hasEnding: boolean, shotCount: number): PlayPhase {
  return recovered === 'cinematic' && shotCount > 0 ? 'cinematic' : hasEnding ? 'ending' : 'explore';
}
export { resolveStoryPlayPhase as resolveSixPlayPhase };

/** These two events must establish what happened before the player handles the aftermath. */
export function initialPlayPhase(state: Pick<BranchState, 'nodeId' | 'endingId' | 'edition'> & Partial<Pick<BranchState, 'flags' | 'storyRevision'>>): PlayPhase {
  if (state.storyRevision === 6 || state.storyRevision === 7) {
    const shots = state.storyRevision === 7 ? getSevenShots(state) : getSixShots(state);
    return resolveStoryPlayPhase('cinematic', Boolean(state.endingId), shots.length);
  }
  if (state.edition === 'short' && state.endingId) return 'ending';
  if (getOppressionShots({ ...state, flags: state.flags ?? [] }).length) return 'cinematic';
  return state.endingId ? 'reading' : 'explore';
}

/** Keeps existing reading positions while accepting the new, recoverable scene mode. */
export function readPlayPosition(value: unknown): PlayPosition | null {
  if (!value || typeof value !== 'object') return null;
  const position = value as Partial<PlayPosition>;
  if (typeof position.key !== 'string' || position.key.length > 12000 || !Number.isInteger(position.index) || position.index! < 0 || position.index! > 20) return null;
  if (!['cinematic', 'explore', 'reading', 'choice', 'compose', 'ending'].includes(position.phase as string)) return null;
  return { key: position.key, index: position.index!, phase: position.phase! };
}
