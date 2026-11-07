import { mapLegacyEndingId, validateBranchState, type BranchState } from './branch-story';

type StoredCollection = { ids: string | null; states: string | null };
export type EndingCollection = { ids: string[]; states: Record<string, BranchState> };
function parse(value: string | null): unknown { try { return value ? JSON.parse(value) : null; } catch { return null; } }

/** A finished earlier edition is history, never proof of playing this edition. */
export function restoreEndingCollections(current: StoredCollection, previous: StoredCollection): { current: EndingCollection; previous: EndingCollection } {
  const latest: EndingCollection = { ids: [], states: {} };
  const archived: EndingCollection = { ids: [], states: {} };
  for (const [source, allowNameOnly] of [[current, false], [previous, true]] as const) {
    const raw = parse(source.states), ids = parse(source.ids);
    const currentIds = new Set<string>();
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) for (const value of Object.values(raw)) {
      const snapshot = validateBranchState(value);
      if (!snapshot?.endingId) continue;
      const collection = snapshot.storyContentRevision === 6 ? latest : archived;
      if (!collection.states[snapshot.endingId]) collection.states[snapshot.endingId] = snapshot;
      if (!collection.ids.includes(snapshot.endingId)) collection.ids.push(snapshot.endingId);
      if (snapshot.storyContentRevision === 6) currentIds.add(snapshot.endingId);
    }
    if (allowNameOnly && Array.isArray(ids)) for (const id of ids) {
      if (typeof id !== 'string') continue;
      const known = mapLegacyEndingId(id);
      if (known && !currentIds.has(known) && !archived.ids.includes(known)) archived.ids.push(known);
    }
  }
  return { current: latest, previous: archived };
}

export function serializeEndingStates(current: Record<string, BranchState>, previous: Record<string, BranchState>): string {
  const snapshots: Record<string, BranchState> = { ...current };
  for (const [id, snapshot] of Object.entries(previous)) snapshots[`old:${id}`] = snapshot;
  return JSON.stringify(snapshots);
}
