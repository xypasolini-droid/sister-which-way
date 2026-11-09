import { writeFileSync } from 'node:fs';
import { createInitialState, getChoices, choose, type BranchState } from '../src/lib/branch-story';
import { getSevenShots, getSevenStill, type SevenShot } from '../src/lib/seven-story-presentation';
import { SEVEN_ENDING_IDS } from '../src/lib/seven-ending-story';
import { getSevenScene } from '../src/lib/seven-story-scenes';

const paths = new Set<string>();
const endingCounts: Record<string, number> = {};
const decisions = new Set<string>();
const options = new Set<string>();
const shots = new Set<string>();
const routes: { ending: string; choices: string[]; durationMs: number }[] = [];
let stateCount = 0;
function collectScene(shot: SevenShot): void {
  const scene = getSevenScene(shot);
  paths.add(scene.background);
  for (const actor of scene.actors) paths.add(actor.src);
  if (scene.foreground) paths.add(scene.foreground);
  shots.add(shot.id);
}
function visit(state: BranchState, duration = 0): void {
  stateCount++;
  // Ending states own consequence shots before their final tableau.
  for (const shot of getSevenShots(state)) {
    collectScene(shot);
    duration += shot.durationMs;
  }
  const still = getSevenStill(state);
  if (!still) throw Error(`Missing still for ${state.endingId ?? state.nodeId}`);
  collectScene(still);
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
    if (next.state.history.length > 2) throw Error('More than two decisions in the approved graph');
    visit(next.state, duration);
  }
}
visit(createInitialState('short'));
if (routes.length !== 6 || decisions.size !== 4 || options.size !== 9) throw Error('Expected exactly six routes, four forks and nine options');
for (const id of SEVEN_ENDING_IDS) if (endingCounts[id] !== 1) throw Error(`Ending ${id} must have exactly one complete route`);
for (const route of routes) if (route.choices.length !== 2) throw Error(`Unexpected route length ${route.ending}`);
const initial = createInitialState('short');
const report = { storyRevision: initial.storyRevision, storyContentRevision: initial.storyContentRevision, paths: [...paths].sort(), routeCount: routes.length, decisionCount: decisions.size, optionCount: options.size, shotCount: shots.size, stateCount, endingCounts, routes, method: 'Exhaustive legal choose() routes; backgrounds, actors, props and foregrounds for every scene including final stills; historical records remain text-only offline.' };
writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
console.log(JSON.stringify({ assets: paths.size, routes: routes.length, forks: decisions.size, options: options.size, shots: shots.size, endingCounts }));
