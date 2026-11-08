import { writeFileSync } from 'node:fs';
import { createInitialState, getChoices, choose, type BranchState } from '../src/lib/branch-story';
import { SIX_ART, getSixShots } from '../src/lib/six-story-presentation';
import { SIX_ENDING_IDS } from '../src/lib/six-ending-story';

const paths = new Set<string>();
const endingCounts: Record<string, number> = {};
const decisions = new Set<string>();
const options = new Set<string>();
const shots = new Set<string>();
const routes: { ending: string; choices: string[]; durationMs: number }[] = [];
let stateCount = 0;
function visit(state: BranchState, duration = 0): void {
  stateCount++;
  // Ending states own consequence shots before their final tableau.
  for (const shot of getSixShots(state)) {
    paths.add(SIX_ART[shot.art].src); shots.add(shot.id); duration += shot.durationMs;
  }
  if (state.endingId) {
    endingCounts[state.endingId] = (endingCounts[state.endingId] ?? 0) + 1;
    routes.push({ ending: state.endingId, choices: state.history.map(item => item.choiceId), durationMs: duration });
    return;
  }
  decisions.add(state.nodeId);
  const available = getChoices(state).filter(choice => choice.enabled);
  if (!available.length) throw Error(`Dead end ${state.nodeId}`);
  for (const choice of available) {
    options.add(`${state.nodeId}/${choice.id}`);
    const next = choose(state, choice.id);
    if (!next) throw Error(`Invalid edge ${state.nodeId}/${choice.id}`);
    if (next.state.history.length > 3) throw Error('More than three decisions in the approved graph');
    visit(next.state, duration);
  }
}
visit(createInitialState('short'));
if (routes.length !== 6 || decisions.size !== 4 || options.size !== 9) throw Error('Expected exactly six routes, four forks and nine options');
for (const id of SIX_ENDING_IDS) if (endingCounts[id] !== 1) throw Error(`Ending ${id} must have exactly one complete route`);
for (const route of routes) if (route.choices.length < 2 || route.choices.length > 3) throw Error(`Unexpected route length ${route.ending}`);
const report = { storyRevision: 6, storyContentRevision: 7, paths: [...paths].sort(), routeCount: routes.length, decisionCount: decisions.size, optionCount: options.size, shotCount: shots.size, stateCount, endingCounts, routes, method: 'Exhaustive legal choose() routes; every new graph shot including terminal aftermath; historical records remain text-only offline.' };
writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
console.log(JSON.stringify({ assets: paths.size, routes: routes.length, forks: decisions.size, options: options.size, shots: shots.size, endingCounts }));
