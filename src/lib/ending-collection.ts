import { getHistoricalEnding, validateBranchState, type BranchState, type Ending } from './branch-story';

type HistoricalRevision = 'r5c6' | 'r5c0' | 'legacy' | 'legacy10';
export type StoredCollection = { ids: string | null; states: string | null; revision?: HistoricalRevision };
export type EndingCollection = { ids: string[]; states: Record<string, BranchState> };
function parse(value: string | null): unknown { try { return value ? JSON.parse(value) : null; } catch { return null; } }

function historicalRevision(state: BranchState): HistoricalRevision {
  return state.storyRevision === 5 ? state.storyContentRevision === 6 ? 'r5c6' : 'r5c0' : 'legacy';
}
export function historicalCollectionKey(state: BranchState): string | null {
  return state.endingId ? `${historicalRevision(state)}:${state.endingId}` : null;
}
export function getArchivedEnding(key: string): Ending | null {
  const match = /^(r5c6|r5c0|legacy|legacy10):(.+)$/.exec(key);
  return match ? getHistoricalEnding(match[2], match[1]) : null;
}

/** Real archive format written by release 6972188 before consolidating ten IDs. */
export function restoreTenEndingArchive(value: string | null): StoredCollection {
  const raw = parse(value);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ids: null, states: null, revision: 'legacy10' };
  const archive = raw as { collection?: unknown; states?: unknown };
  return {
    ids: Array.isArray(archive.collection) ? JSON.stringify(archive.collection) : null,
    states: archive.states && typeof archive.states === 'object' && !Array.isArray(archive.states) ? JSON.stringify(archive.states) : null,
    revision: 'legacy10',
  };
}

/** Only authenticated revision-7 snapshots unlock the six new endings.
 * Earlier editions keep both their version and original ending identity. */
export function restoreEndingCollections(current: StoredCollection, previous: StoredCollection | StoredCollection[] = []): { current: EndingCollection; previous: EndingCollection } {
  const latest: EndingCollection = { ids: [], states: {} };
  const archived: EndingCollection = { ids: [], states: {} };
  const oldSources = Array.isArray(previous) ? previous : [previous];
  for (const [source, allowNameOnly] of [[current, false], ...oldSources.map(source => [source, true] as const)] as const) {
    const raw = parse(source.states), ids = parse(source.ids);
    const authenticatedIds = new Set<string>();
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) for (const [storedKey, value] of Object.entries(raw)) {
      let snapshot = validateBranchState(value);
      if (!snapshot?.endingId) continue;
      const originalId = value && typeof value === 'object' && 'endingId' in value ? (value as { endingId: unknown }).endingId : null;
      // The explicit ten-ending archive, including a serialized copy in r7,
      // owns its original IDs. Authentication may canonicalize a former coda,
      // but its archive number and text must not become a later five-ending ID.
      const savedRef = /^(?:old:)?legacy10:(.+)$/.exec(storedKey);
      const tenId = source.revision === 'legacy10' ? originalId : savedRef?.[1];
      const isTen = typeof tenId === 'string' && tenId === originalId && Boolean(getHistoricalEnding(tenId, 'legacy10'));
      if (isTen) snapshot = { ...snapshot, endingId: tenId };
      authenticatedIds.add(snapshot.endingId!);
      const isLatest = snapshot.storyRevision === 6 && snapshot.storyContentRevision === 7;
      const collection = isLatest ? latest : archived;
      const key = isLatest ? snapshot.endingId! : isTen ? `legacy10:${tenId}` : historicalCollectionKey(snapshot)!;
      if (!collection.states[key]) collection.states[key] = snapshot;
      if (!collection.ids.includes(key)) collection.ids.push(key);
    }
    if (allowNameOnly && Array.isArray(ids)) for (const id of ids) {
      if (typeof id !== 'string' || authenticatedIds.has(id)) continue;
      // Serialized archives already have a version. A pre-r7 source supplies its
      // own version for its earlier ID-only records; do not guess a new fate.
      const key = /^(r5c6|r5c0|legacy|legacy10):/.test(id) ? id : `${source.revision ?? 'legacy'}:${id}`;
      if (getArchivedEnding(key) && !archived.ids.includes(key)) archived.ids.push(key);
    }
  }
  return { current: latest, previous: archived };
}

export function serializeEndingStates(current: Record<string, BranchState>, previous: Record<string, BranchState>): string {
  const snapshots: Record<string, BranchState> = { ...current };
  for (const [id, snapshot] of Object.entries(previous)) snapshots[`old:${id}`] = snapshot;
  return JSON.stringify(snapshots);
}
