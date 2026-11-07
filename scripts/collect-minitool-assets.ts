import { writeFileSync } from 'node:fs';
import { createInitialState, getChoices, getNode, choose, type BranchState } from '../src/lib/branch-story';
import { getOppressionShots } from '../src/lib/oppression-scenes';
import { selectNarrativeStage } from '../src/lib/narrative-stage-state';

const paths = new Set<string>();
const endingCounts: Record<string, number> = {};
let stateCount = 0;
function collect(value: unknown): void {
  if (typeof value === 'string' && value.startsWith('/art/')) paths.add(value);
  else if (value && typeof value === 'object') for (const child of Object.values(value)) collect(child);
}
function visit(state: BranchState): void {
  stateCount++;
  const node = getNode(state);
  if (state.endingId) {
    endingCounts[state.endingId] = (endingCounts[state.endingId] ?? 0) + 1;
    paths.add(`/art/sister-v4/end-${state.endingId}.webp`);
    return;
  }
  // Images on persistent offstage actors also own a src, so include all assets.
  const context = { ...state, scene: node.scene, phase: 'explore' as const };
  const staging = selectNarrativeStage(context);
  collect(staging.assets); collect(staging.drama);
  getOppressionShots(state).forEach((dramaShot, beatIndex) => {
    const shot = selectNarrativeStage({ ...context, scene: dramaShot.scene, phase: 'cinematic', dramaShot, beatIndex });
    collect(shot.assets); collect(shot.drama);
  });
  const available = getChoices(state).filter(choice=>choice.enabled);
  if (!available.length) throw Error(`Dead end ${state.nodeId}`);
  for (const choice of available) {
    const next = choose(state,choice.id);
    if (!next) throw Error(`Invalid edge ${state.nodeId}/${choice.id}`);
    if (next.state.history.length>7) throw Error('More than seven choices');
    if (next.state.endingId && next.state.history.length!==7) throw Error('Early ending');
    visit(next.state);
  }
}
visit(createInitialState('short'));
for (const name of ['bag','book','bread','medicine','letter','lantern']) paths.add(`/art/sister/${name}.png`);
for (const name of ['hero-cloak','hero-worker','hero-worker-indoor','hero-travel-girl','mother']) paths.add(`/art/sister-v2/${name}.png`);
for (const name of ['mother-standing','father-standing-crutch','patrol','armed-patrol','adult-builder']) paths.add(`/art/sister-v3/${name}.png`);
// Bounded visual coverage for authenticated historical saves. The active graph
// does not visit the clinic or these older travel/injury poses, but recovery can.
for (const name of ['hero-travel-indoor','father-rescued','sister-injured','sister-covered-injured','sister-outdoor-injured']) paths.add(`/art/sister-v2/${name}.png`);
paths.add('/art/sister/clinic.png');
paths.add('/art/scene-forest.png'); paths.add('/art/sister-v2/tale-flame.png');
const report = { paths:[...paths].sort(), routeCount:Object.values(endingCounts).reduce((a,b)=>a+b,0), stateCount, endingCounts, method:'Exhaustive legal choose() paths; every cinematic shot, persistent actor and fallback; no injected ending state.' };
writeFileSync(process.argv[2],JSON.stringify(report,null,2));
console.log(JSON.stringify({ assets:paths.size,routeCount:report.routeCount,stateCount,endingCounts }));
