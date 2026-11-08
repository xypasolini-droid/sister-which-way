import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createInitialState, createRevisionFiveState, type BranchState } from './branch-story';
import { getOppressionShots, type DramaShot } from './oppression-scenes';
import { getDramaStaging } from './drama-staging';
import { selectNarrativeStage } from './narrative-stage-state';

const story = (nodeId: string): BranchState => ({ ...createRevisionFiveState(), nodeId, outfit: 'worker', father: 'missing', flags: ['motherHurt', 'disguise', 'friendMet'] });
const shots = (nodeId: string) => getOppressionShots(story(nodeId));
const cast = (nodeId: string, shot: DramaShot, phase: 'cinematic' | 'explore' | 'reading' = 'cinematic') => selectNarrativeStage({ ...story(nodeId), scene: shot.scene, dramaShot: shot, phase });

describe('visible actions and physical presence during oppressive events', () => {
  it('shows a distinct persecutor whose drawn arm changes from pointing to raised and lowered cane', () => {
    const market = shots('n01').map(shot => getDramaStaging(shot)!);
    expect(market.map(frame => frame.oppressor)).toEqual(['patrol', 'patrol']);
    expect(market.map(frame => frame.oppressorAsset)).toEqual(['/art/sister-v3/patrol.png', '/art/sister-v3/patrol-raised.png']);
    const mother = shots('n06').slice(0, 4).map(shot => getDramaStaging(shot)!);
    expect(mother[1].oppressorPose).toBe('raised');
    expect(mother[2].oppressorPose).toBe('strike');
    expect(mother[1].oppressorAsset).not.toBe(mother[2].oppressorAsset);
  });

  it('performs the mother’s street journey before disguise, with no sister or brother transported into it', () => {
    const sequence = shots('n06');
    for (const shot of sequence.slice(0, 4)) {
      const frame = cast('n06', shot);
      expect(frame).toMatchObject({ showHero: true, showMother: true, showFather: false, showSister: false, showBrother: false, showGuard: false });
      expect(frame.drama?.preDisguise).toBe(true);
      expect(frame.assets.hero).not.toContain('worker');
      expect(frame.motherWardrobe).toBe('outdoor');
      expect(frame.assets.background).toContain('/checkpoint.png');
    }
    const shield = cast('n06', sequence[2]);
    const fallen = cast('n06', sequence[3]);
    expect(shield.assets.mother).toContain('mother-shield.png');
    expect(fallen.assets.mother).toContain('mother-fallen.png');
    expect(fallen.assets.hero).toContain('hero-help.png');
    expect(fallen.drama?.heroPose).toBe('help');
    expect(fallen.motherInjured).toBe(true);
  });

  it('shows the merchant and threatening patrol at refusal, then only reunites the family at home', () => {
    const sequence = shots('n06');
    for (const shot of sequence.slice(4, 7)) {
      const frame = cast('n06', shot);
      expect(frame).toMatchObject({ showHero: true, showMother: false, showSister: false, showBrother: false, showFather: false });
      expect(frame.drama).toMatchObject({ oppressor: 'merchant', secondPatrol: true, preDisguise: true });
      expect(frame.showBread).toBe(false);
    }
    const home = cast('n06', sequence[7]);
    expect(home).toMatchObject({ showMother: true, showSister: true, showBrother: true, showFather: false });
    expect(home.drama?.oppressor).toBeNull();
    expect(home.assets.mother).toContain('mother-injured.png');
  });

  it('shows two armed men physically taking the father away and keeps the final threat after playback', () => {
    const sequence = shots('n02');
    const frames = sequence.map(shot => cast('n02', shot));
    expect(frames.map(frame => frame.showFather)).toEqual([true, true, true, false]);
    expect(frames.every(frame => frame.drama?.secondPatrol)).toBe(true);
    expect(frames[0].drama?.oppressorAsset).toContain('/patrol.png');
    expect(frames[0].drama?.secondAsset).toContain('/armed-patrol.png');
    expect(frames[1].drama?.secondAsset).toContain('/patrol.png');
    expect(frames[1].assets.father).toContain('father-drag.png');
    expect(frames[2].drama!.fatherLeft).toBeGreaterThan(frames[1].drama!.fatherLeft);
    expect(frames[1].drama?.oppressorAsset).toContain('armed-patrol-grab.png');
    const finalShot = sequence.at(-1)!;
    for (const phase of ['cinematic', 'explore', 'reading'] as const) {
      expect(cast('n02', finalShot, phase).drama).toEqual(frames[3].drama);
      expect(cast('n02', finalShot, phase).showFather).toBe(false);
    }
  });

  it('keeps a later boy-disguise checkpoint from replaying the mother’s earlier journey', () => {
    const frame = cast('n08', shots('n08')[0]);
    expect(frame).toMatchObject({ showMother: false, showHero: true });
    expect(frame.drama?.preDisguise).toBe(false);
    expect(frame.assets.hero).toContain('hero-worker');
  });

  it('separates the recruiter and coercive relative from Amin and leaves the heroine offstage during the mother’s refusal', () => {
    for (const shot of shots('n07')) {
      expect(cast('n07', shot)).toMatchObject({ showHero: true, showFriend: true, showGuard: false });
      expect(getDramaStaging(shot)?.oppressor).toBe('recruit');
    }
    const sequence = shots('n21');
    for (const shot of sequence) {
      const frame = cast('n21', shot);
      expect(frame).toMatchObject({ showHero: false, showMother: true, showSister: true, showBrother: true, showGuard: false });
      expect(frame.sisterWardrobe).toBe('outdoor');
      expect(frame.drama?.oppressor).toBe('relative');
    }
    expect(getDramaStaging(sequence[1])?.oppressorAsset).toContain('relative-pull.png');
    expect(getDramaStaging(sequence[2])?.motherLeft).toBeLessThan(getDramaStaging(sequence[1])!.motherLeft);
    for (const shot of shots('n25')) {
      const frame = cast('n25', shot);
      expect(frame).toMatchObject({ showGuard: true, showMother: false, showSister: false, showFather: false });
      expect(frame.drama?.oppressor).toBe('patrol');
      expect(frame.drama?.oppressorAsset).not.toBe(frame.assets.guard);
    }
  });

  it('uses existing transparent assets for every shot and does not mutate the story while staging', () => {
    for (const nodeId of ['n01', 'n02', 'n06', 'n07', 'n08', 'n21', 'n25']) {
      const state = story(nodeId);
      const before = structuredClone(state);
      for (const shot of getOppressionShots(state)) {
        const frame = cast(nodeId, shot);
        const paths = [frame.assets.hero, frame.assets.mother, frame.assets.father, frame.drama?.oppressorAsset, frame.drama?.secondAsset];
        for (const path of paths.filter((value): value is string => Boolean(value))) expect(existsSync(resolve(process.cwd(), 'public', path.slice(1))), path).toBe(true);
      }
      expect(state).toEqual(before);
    }
  });
});
