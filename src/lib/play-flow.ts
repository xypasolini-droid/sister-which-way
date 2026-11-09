import type { BranchState } from './branch-story';
import { getOppressionShots } from './oppression-scenes';
import { getSixShots } from './six-story-presentation';
import { getSevenShots } from './seven-story-presentation';

export type PlayPhase = 'cinematic' | 'explore' | 'reading' | 'choice' | 'compose' | 'ending';
export type PlayPosition = { key: string; index: number; phase: PlayPhase; shotId?: string };

/** The six-ending editions have an automatic performance, a fork, and a final panel.
 * The committed fate survives both replay and obsolete/corrupt reading phases. */
export function resolveStoryPlayPhase(recovered: PlayPhase, hasEnding: boolean, shotCount: number): PlayPhase {
  return recovered === 'cinematic' && shotCount > 0 ? 'cinematic' : hasEnding ? 'ending' : 'explore';
}
export { resolveStoryPlayPhase as resolveSixPlayPhase };

/** A numeric cursor from 0.7.0 cannot point into revised dialogue safely. */
export function restoreStoryPlayback(key: string, position: PlayPosition | null, fallback: PlayPhase, hasEnding: boolean, shots: readonly { id: string }[]) {
  const saved = position?.key === key ? position : null;
  const savedIndex = saved?.phase === 'cinematic' && saved.shotId ? shots.findIndex(shot => shot.id === saved.shotId) : -1;
  const recovered = saved && (saved.phase !== 'cinematic' || savedIndex >= 0) ? saved.phase : fallback;
  const phase = resolveStoryPlayPhase(recovered, hasEnding, shots.length);
  return { phase, index: phase === 'cinematic' ? Math.max(0, savedIndex) : 0 };
}

/** Open on the first decision. Choices with consequences start their performance. */
export function initialPlayPhase(state: Pick<BranchState, 'nodeId' | 'endingId' | 'edition'> & Partial<Pick<BranchState, 'flags' | 'storyRevision'>>): PlayPhase {
  if (state.storyRevision === 7 && state.nodeId === 'v7-opening') return 'explore';
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
  const { key, index, phase, shotId } = position;
  return { key, index: index!, phase: phase!, ...(typeof shotId === 'string' && /^[a-z0-9-]{1,80}$/.test(shotId) ? { shotId } : {}) };
}
