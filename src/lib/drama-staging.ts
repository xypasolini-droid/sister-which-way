import type { DramaShot, DramaVisual } from './oppression-scenes';

export type DramaPose = 'still' | 'fear' | 'help' | 'plead' | 'shield' | 'fallen' | 'wounded' | 'grabbed' | 'dragged' | 'refuse' | 'hide';
export type OppressorKind = 'patrol' | 'merchant' | 'relative' | 'recruit';
export type DramaStaging = {
  visual: DramaVisual; hero: boolean; mother: boolean; father: boolean; sister: boolean; brother: boolean; friend: boolean; amin: boolean;
  heroLeft: number; motherLeft: number; fatherLeft: number; sisterLeft: number; friendLeft: number;
  heroPose: DramaPose; motherPose: DramaPose; fatherPose: DramaPose;
  oppressor: OppressorKind | null; oppressorLeft: number; secondPatrol: boolean; secondLeft: number;
  oppressorPose: 'point' | 'raised' | 'strike' | 'grab' | 'drag' | 'pull' | 'block' | 'rifle';
  oppressorAsset: string; secondAsset: string; heroineAsset?: string; motherAsset?: string; fatherAsset?: string; friendAsset?: string;
  preDisguise: boolean; gunfire: boolean;
};
const asset = (name: string) => `/art/oppression/${name}.svg`;

/** Shot facts override the story node while its read-only event is on camera. */
export function getDramaStaging(shot?: DramaShot | null): DramaStaging | null {
  if (!shot) return null;
  const v = shot.visual;
  const stage: DramaStaging = {
    visual: v, hero: true, mother: false, father: false, sister: false, brother: false, friend: false, amin: false,
    heroLeft: 32, motherLeft: 49, fatherLeft: 53, sisterLeft: 29, friendLeft: 49,
    heroPose: 'fear', motherPose: 'still', fatherPose: 'still', oppressor: 'patrol', oppressorLeft: 78,
    secondPatrol: false, secondLeft: 92, oppressorPose: 'point',
    oppressorAsset: asset('patrol'), secondAsset: asset('armed-patrol'), preDisguise: false, gunfire: false,
  };
  if (v.startsWith('market-')) {
    Object.assign(stage, { father: true, fatherLeft: 52, heroLeft: 26, preDisguise: true, oppressorLeft: 73 });
    if (v === 'market-cane') Object.assign(stage, { oppressorPose: 'raised', oppressorLeft: 68, oppressorAsset: asset('patrol-raised'), heroineAsset: asset('hero-fear'), fatherPose: 'shield', fatherAsset: asset('father-shield') });
  } else if (v.startsWith('arrest-')) {
    Object.assign(stage, { mother: true, sister: true, brother: true, father: v !== 'arrest-empty', secondPatrol: true,
      heroLeft: 31, motherLeft: 40, sisterLeft: 13, fatherLeft: 58, oppressorLeft: 77, secondLeft: 91,
      preDisguise: true, fatherAsset: asset('father-standing-crutch'), oppressorAsset: asset('armed-patrol'), motherPose: 'plead', motherAsset: '/art/sister-v2/mother-stop.png' });
    if (v === 'arrest-grab') Object.assign(stage, { fatherPose: 'grabbed', fatherLeft: 65, motherLeft: 47, oppressorLeft: 72, oppressorPose: 'grab', oppressorAsset: asset('armed-patrol-grab'), fatherAsset: asset('father-drag'), heroineAsset: asset('hero-fear') });
    if (v === 'arrest-drag') Object.assign(stage, { fatherPose: 'dragged', fatherLeft: 79, motherLeft: 51, heroLeft: 40, oppressorLeft: 86, secondLeft: 98, oppressorPose: 'drag', oppressorAsset: asset('armed-patrol-grab'), fatherAsset: asset('father-drag'), heroineAsset: asset('hero-fear') });
    if (v === 'arrest-empty') Object.assign(stage, { motherLeft: 45, heroLeft: 30, oppressorLeft: 96, secondLeft: 108, motherPose: 'fallen', motherAsset: '/art/sister-v2/mother-injured.png', heroPose: 'help', heroineAsset: asset('hero-help') });
  } else if (v.startsWith('mother-')) {
    Object.assign(stage, { mother: true, preDisguise: true, heroineAsset: asset('hero-fear'), motherAsset: asset('mother-plead'), motherPose: 'plead', heroLeft: 27, motherLeft: 48, oppressorLeft: 66 });
    if (v === 'mother-block') stage.oppressorPose = 'block';
    if (v === 'mother-plead') Object.assign(stage, { oppressorPose: 'raised', oppressorLeft: 62, oppressorAsset: asset('patrol-raised') });
    if (v === 'mother-struck') Object.assign(stage, { oppressorPose: 'strike', oppressorLeft: 54, oppressorAsset: asset('patrol-strike'), motherPose: 'shield', motherAsset: asset('mother-shield'), heroLeft: 24 });
    if (v === 'mother-floor') Object.assign(stage, { oppressorPose: 'block', oppressorLeft: 67, motherPose: 'fallen', motherAsset: asset('mother-fallen'), heroPose: 'help', heroineAsset: asset('hero-help'), heroLeft: 46, motherLeft: 55 });
  } else if (v.startsWith('bread-')) {
    Object.assign(stage, { preDisguise: true, oppressor: 'merchant', oppressorAsset: asset('merchant'), heroineAsset: asset('hero-fear'), heroLeft: 37, oppressorLeft: 69, secondPatrol: true, secondLeft: 88 });
    if (v === 'bread-threat') Object.assign(stage, { secondPatrol: true, secondLeft: 88, secondAsset: asset('patrol-raised'), heroLeft: 31 });
    if (v === 'bread-flee') Object.assign(stage, { secondPatrol: true, secondLeft: 83, secondAsset: asset('patrol-raised'), heroLeft: 19, heroPose: 'hide' });
  } else if (v === 'home-wounded') {
    Object.assign(stage, { mother: true, sister: true, brother: true, oppressor: null, preDisguise: true,
      motherPose: 'wounded', motherAsset: '/art/sister-v2/mother-injured.png', heroineAsset: asset('hero-help'),
      heroPose: 'help', heroLeft: 46, motherLeft: 65, sisterLeft: 27 });
  } else if (v.startsWith('street-')) {
    Object.assign(stage, { friend: true, oppressor: 'recruit', oppressorAsset: asset('recruit'), heroLeft: 31, friendLeft: 48 });
    if (v === 'street-hide') Object.assign(stage, { heroPose: 'hide', heroLeft: 23, friendLeft: 39, oppressorLeft: 83, heroineAsset: asset('hero-worker-crouch'), friendAsset: asset('friend-worker-crouch') });
  } else if (v.startsWith('relative-')) {
    Object.assign(stage, { hero: false, mother: true, sister: true, brother: true, motherAsset: asset('mother-plead'),
      motherPose: 'plead', oppressor: 'relative', oppressorAsset: asset('relative'), motherLeft: 36, sisterLeft: 18, oppressorLeft: 58 });
    if (v === 'relative-pull') Object.assign(stage, { motherLeft: 40, oppressorLeft: 49, oppressorPose: 'pull', oppressorAsset: asset('relative-pull'), motherPose: 'grabbed', motherAsset: asset('mother-plead') });
    if (v === 'relative-refuse') Object.assign(stage, { motherLeft: 33, sisterLeft: 15, motherPose: 'refuse', oppressorLeft: 57, motherAsset: asset('mother-plead') });
  } else if (v.startsWith('prison-')) {
    Object.assign(stage, { amin: true, heroLeft: 32, oppressorLeft: 88, secondPatrol: true, secondLeft: 103,
      oppressorPose: 'rifle', oppressorAsset: asset('armed-patrol'), gunfire: v === 'prison-gunfire' });
    if (v === 'prison-shelter') Object.assign(stage, { heroPose: 'hide', heroLeft: 24, heroineAsset: asset('hero-worker-crouch') });
  }
  // This deliberately reuses a roadblock visual for a later, disguised child.
  // It must not replay the earlier mother-and-daughter journey or restore long hair.
  if (shot.id.startsWith('n08:')) Object.assign(stage, { mother: false, preDisguise: false, heroineAsset: undefined });
  return stage;
}
