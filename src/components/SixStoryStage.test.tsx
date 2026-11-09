import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { choose, type BranchState } from '../lib/branch-story';
import { createSixState } from '../lib/six-ending-story';
import { getSixShots, getSixStill, SIX_ART } from '../lib/six-story-presentation';
import { initialPlayPhase, readPlayPosition, resolveSixPlayPhase, type PlayPhase } from '../lib/play-flow';
vi.mock('@/lib/six-story-presentation', () => import('../lib/six-story-presentation'));
import SixStoryStage from './SixStoryStage';

const routes = {
  no_smoke: ['stay_long', 'refuse'], sister_married: ['stay_long', 'accept'],
  conscripted: ['cut_hair', 'flee'], family_escape: ['cut_hair', 'home'],
  unwaking_spring: ['cut_hair', 'friend', 'dream'], guardian_future: ['cut_hair', 'friend', 'wake'],
};
const play = (route: string[]) => route.reduce((state, action) => choose(state, action)!.state, createSixState());

describe('short automatic revision-7 performance', () => {
  it('keeps every final choice committed while its result plays before the terminal panel', () => {
    for (const [id, route] of Object.entries(routes)) {
      const state = play(route), before = JSON.stringify(state);
      expect(state.endingId).toBe(id);
      expect(initialPlayPhase(state)).toBe('cinematic');
      const shots = getSixShots(state);
      expect(shots.length).toBeGreaterThan(2);
      for (const shot of shots) {
        expect(SIX_ART[shot.art].src).toMatch(/^\/art\/sister-v6\/.+\.webp$/);
        expect(shot.durationMs).toBeGreaterThanOrEqual(3000);
        expect(shot.durationMs).toBeLessThanOrEqual(6000);
        expect(shot.line.length).toBeLessThanOrEqual(45);
      }
      const recovered = readPlayPosition({ key: `result-${id}`, index: shots.length - 1, phase: 'cinematic' });
      expect(recovered?.index).toBe(shots.length - 1);
      expect(JSON.stringify(state)).toBe(before);
    }
  });
  it('preserves Layla continuity and the ordered seed tale before the last choice', () => {
    const war = getSixShots(play(['cut_hair']));
    expect(war.at(-2)!.caption).toContain('手还在你手里');
    const voices = getSixShots(play(['cut_hair', 'friend']));
    expect(voices.map(shot => shot.id)).toEqual(['hands-part', 'against-crowd', 'layla-found', 'recognized', 'blow-falls', 'become-sulayman', 'stolen-seeds', 'journey-fear', 'journey-help', 'elephant-king', 'brother-remembered', 'seed-returned', 'two-voices']);
    expect(voices.find(shot => shot.id === 'brother-remembered')!.line).toContain('阿里');
  });
  it('distinguishes the unrecovered dream from rescue and years of adult growth', () => {
    const dream = getSixShots(play(routes.unwaking_spring));
    expect(dream.at(-1)!.art).toBe('rescue');
    expect(dream.at(-1)!.line).toContain('没有醒来');
    expect(getSixStill(play(routes.unwaking_spring))!.art).toBe('unwaking_spring');
    const future = getSixShots(play(routes.guardian_future));
    expect(future.map(shot => shot.id)).toEqual(['choose-wake', 'rescued', 'escape-city', 'years-mutual-aid', 'learn-and-train', 'adult-leader', 'guarded-land']);
    expect(future.some(shot => shot.realm === 'dream')).toBe(false);
    expect(future.find(shot => shot.id === 'adult-leader')!.caption).toContain('多年');
  });
  it('uses a complete composed scene, with no popup character stack', () => {
    const shot = getSixShots(createSixState())[0];
    const html = renderToStaticMarkup(<SixStoryStage shot={shot} reducedMotion paused/>);
    expect(html).toContain('six-story-stage--still');
    expect(html).toContain('data-paused="true"');
    expect(html).toContain(SIX_ART.opening.src);
    expect(html).not.toMatch(/narrative-actor|narrative-sprite|story-dialogue/);
  });
  it('restores terminal playback and normalizes obsolete phases without reopening choices', () => {
    for (const phase of ['explore', 'reading', 'choice', 'compose', 'ending'] as PlayPhase[]) {
      expect(resolveSixPlayPhase(phase, true, 5)).toBe('ending');
      expect(resolveSixPlayPhase(phase, false, 5)).toBe('explore');
    }
    expect(resolveSixPlayPhase('cinematic', true, 5)).toBe('cinematic');
    expect(resolveSixPlayPhase('cinematic', true, 0)).toBe('ending');
    expect(resolveSixPlayPhase('cinematic', false, 0)).toBe('explore');
  });
  it('keeps natural full-route viewing under five minutes without fake choices', () => {
    for (const route of Object.values(routes)) {
      let state: BranchState = createSixState(), duration = 0;
      for (const action of route) { duration += getSixShots(state).reduce((total, shot) => total + shot.durationMs, 0); state = choose(state, action)!.state; }
      duration += getSixShots(state).reduce((total, shot) => total + shot.durationMs, 0);
      expect(duration).toBeLessThan(300000);
      expect(duration).toBeGreaterThan(60000);
    }
  });
});
