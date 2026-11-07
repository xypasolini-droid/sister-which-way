import type { BranchState, SceneId } from './branch-story';
import { getCompanionStatus } from './story-presentation';
import type { DramaShot } from './oppression-scenes';
import { getDramaStaging } from './drama-staging';

export type NarrativeStageContext = Pick<BranchState, 'nodeId' | 'outfit' | 'sister' | 'father' | 'flags'> & {
  scene: SceneId; ending?: string | null;
  storyRevision?: 5;
  beatIndex?: number; phase?: 'explore' | 'reading' | 'choice' | 'compose' | 'intro' | 'ending' | 'cinematic';
  dramaShot?: DramaShot;
  stats: Pick<BranchState['stats'], 'trust' | 'health' | 'food'>;
};
type FeaturedProp = 'bread' | 'medicine' | 'letter' | 'book' | 'bag' | 'lantern';
const SCENE_PROPS: Partial<Record<string, FeaturedProp>> = {
  n01:'book',n02:'bread',n04:'bread',n05:'bread',n06:'book',n07:'bread',n09:'letter',
  n11:'letter',n12:'letter',n13:'letter',n14:'book',n15:'medicine',n16:'letter',
  n17:'letter',n18:'letter',n19:'bag',n20:'letter',n21:'bag',n22:'lantern',
  n23:'letter',n24:'medicine',n25:'letter',n26:'bag',n27:'book',n28:'letter',n29:'letter',
};
const HOME_FAMILY = new Set(['n02','n05','n06','n13','n18','n19','n21','n22','n26','n27','n28','n29']);
const FRIEND_SCENES = new Set(['n07','n08','n09','n10','n17','n20','n27']);

/** Camera presence, private space, costume and real family facts are separate. */
export function selectNarrativeStage(context: NarrativeStageContext) {
  const drama = context.ending ? null : getDramaStaging(context.dramaShot);
  const {scene,nodeId,sister,father,stats,flags,ending}=context;
  const has=(flag:string)=>flags.includes(flag);
  const currentStory=context.storyRevision===5;
  const isDream=ending==='dream_guardian'||ending==='dream_commons';
  const grownGuide=currentStory&&ending==='lantern'&&has('guideGrown');
  const familyAtTruck=currentStory&&nodeId==='n21';
  const girlsAtSideDoor=currentStory&&nodeId==='n22';
  const marketStall=nodeId==='n01'&&!isDream;
  const fatherRescued=!isDream&&father==='free'&&has('released');
  const arrestStep=nodeId==='n02'&&!isDream ? context.phase==='explore'||context.phase==='choice'||context.phase==='compose' ? 3 : Math.min(3,Math.max(0,Math.trunc(context.beatIndex??0))) : null;
  const arrest=arrestStep===null?null:{step:arrestStep,fatherLeft:[69,77,86,108][arrestStep],heroLeft:[46,53,59,59][arrestStep],motherLeft:[21,62,70,45][arrestStep],sisterLeft:[36,36,37,36][arrestStep],caption:[
    '傍晚，白天的年轻巡查带人踢开家门。父亲还站在屋里，家人转向门口。',
    '父亲被拉向门口。母亲和努拉上前阻拦，姐姐把萨米护到身后。',
    '父亲被逼到门边，仍回头让孩子退开。水碗翻倒，家人没能拉住他。',
    '父亲被武装者带出家门。母亲、姐姐和两个孩子留在屋里，原来的位置空了。',
  ][arrestStep]};
  const companion=getCompanionStatus({nodeId,sister,stats,endingId:ending??null,storyRevision:context.storyRevision});
  const clinicPrivate=scene==='clinic';
  const space=isDream?'dream':scene==='home'?'family-home':scene==='courtyard'?'private-courtyard':clinicPrivate?'women-clinic':scene==='workshop'?'private-workshop':'public';
  const womenInVehicle=!isDream&&scene==='road'&&has('boarded');
  const familyAway=(currentStory&&has('familyDeparted'))||(nodeId==='n18'&&sister==='apart')||(nodeId==='n30'&&sister==='apart');
  const motherInClinic=nodeId==='n24'&&!has('rescueRoute');
  const showMother=!isDream&&!womenInVehicle&&!familyAway&&(HOME_FAMILY.has(nodeId)||nodeId==='n03'||motherInClinic||(nodeId==='n30'&&['home','courtyard'].includes(scene)));
  const brotherWithSister=nodeId==='n23'&&has('motherSearching');
  const showBrother=!isDream&&!womenInVehicle&&((showMother&&nodeId!=='n03')||brotherWithSister);
  const showSister=!isDream&&!womenInVehicle&&!familyAway&&companion.presence==='present';
  const showFather=arrest ? arrest.step<3 : !isDream&&father==='free'&&(nodeId==='n01'||has('released'));
  const friendAtCoda=!womenInVehicle&&(ending==='lantern'&&has('sustained')||ending==='witness');
  // Adult guides are painted into their tableau; never overlay a childhood sprite.
  const showFriend=!isDream&&!grownGuide&&(nodeId==='n07'||has('friendMet')&&(FRIEND_SCENES.has(nodeId)||friendAtCoda||girlsAtSideDoor));
  const showGuard=!isDream&&(['n09','n17','n25'].includes(nodeId)||(nodeId==='n12'&&!has('guardKnown')));
  const showHero=!grownGuide&&(isDream||(nodeId!=='n21'||familyAtTruck)&&!womenInVehicle);
  const sisterWardrobe=space==='family-home'?'home':space==='public'?'outdoor':'covered';
  const sisterInjured=companion.injured||has('sisterHurt');
  const sisterRecovering=has('sisterTreated')&&!sisterInjured;
  const sisterBase=sisterWardrobe==='home'?'sister':`sister-${sisterWardrobe}`;
  const motherWardrobe=space==='public'?'outdoor':'home';
  const motherStruckOnCamera=nodeId==='n03'&&((context.beatIndex??0)>=2||context.phase==='explore'||context.phase==='choice'||context.phase==='compose');
  const motherInjured=motherStruckOnCamera||has('motherHurt');
  const motherRecovering=has('motherHurt')&&has('motherTreated');
  const showBread=!isDream&&has('bread')&&stats.food>0;
  const disguised=context.outfit==='worker'||(context.outfit==='travel'&&has('disguise'));
  const privateSpace=space!=='public';
  const heroAsset=marketStall?'hero-market':isDream?'dream-guardian':context.outfit==='travel'&&!disguised?'hero-travel-girl':disguised&&privateSpace?`hero-${context.outfit}-indoor`:`hero-${context.outfit}`;
  const heroDescription=grownGuide?'几年后，成年的努拉与莱拉在山隘接应女孩':isDream?ending==='dream_commons'?'成年的阿提什，素色长衫，捧着议事本子':'成年的阿提什，穿着女性卫队的衣服':disguised?privateSpace?'短发、亡兄留下的灰白长衫与宽裤':'朴素浅灰小帽、灰白长衫与宽裤':'绿色头巾与长衫宽裤';
  const background=grownGuide?'/art/sister-v4/end-lantern.webp':isDream?`/art/oppression/${ending==='dream_guardian'?'dream-guardian':'dream-commons'}.svg`:scene==='road'?`/art/oppression/${nodeId==='n21'&&!familyAtTruck?'road-red-sedan':womenInVehicle?'road-open-truck-departure':'road-open-truck'}.svg`:scene==='clinic'&&nodeId==='n23'?'/art/sister/courtyard.png':`/art/sister/${scene}.png`;
  const locationName=grownGuide?'几年后的秘密山隘':isDream?'梦里的女性自治之地':familyAtTruck?'亲舅舅接应的露天货车旁':girlsAtSideDoor?'家人离城后，法里达半开的侧门':nodeId==='n21'?'被提前带离的街口':nodeId==='n26'?'确认接应的关门私院':nodeId==='n29'?'说清分别的内院':scene==='clinic'?nodeId==='n23'?'女医师相连的后院':'女医师遮挡的后屋':scene==='home'&&(has('settled')||ending==='shelter')?'法里达借出的里间':scene==='workshop'?'作坊遮挡的后间':null;
  const sceneProp:FeaturedProp|null=isDream||grownGuide||arrest||marketStall?null:nodeId==='n30'?scene==='courtyard'?'book':scene==='road'?'bag':'letter':SCENE_PROPS[nodeId]??null;
  const featuredProp=sceneProp==='bread'&&!showBread?null:sceneProp;
  const staging = {
    companion,space,clinicPrivate,isDream,womenInVehicle,heroDescription,arrest,marketStall,fatherRescued,
    sisterWardrobe,sisterInjured,sisterRecovering,motherWardrobe,motherInjured,motherRecovering,
    showHero,showSister,showMother,showBrother,showFather,showFriend,showGuard,showBread,
    heroSheltered:!disguised&&space==='public'&&nodeId!=='n01',
    featuredProp,locationName,
    assets:{background,hero:grownGuide||ending==='dream_commons'?'/art/sister-v3/adult-builder.png':`/art/sister-v2/${heroAsset}.png`,sister:`/art/sister-v2/${sisterBase}${sisterInjured||sisterRecovering?'-injured':''}.png`,mother:`/art/sister-v2/${arrest?'mother-stop':motherWardrobe==='outdoor'?'mother-outdoor':motherInjured?'mother-injured':'mother'}.png`,father:marketStall?'/art/sister-v2/father-market.png':fatherRescued?'/art/sister-v2/father-rescued.png':'/art/sister-v3/father-standing-crutch.png',brother:'/art/sister-v2/young-brother.png',friend:'/art/sister-v2/friend-worker.png',guard:'/art/sister-v2/guard-amin.png'},
  };
  if (!drama) return { ...staging, drama: null };
  const shot = context.dramaShot!;
  const arrestIndex = ['arrest-entry', 'arrest-grab', 'arrest-drag', 'arrest-empty'].indexOf(drama.visual);
  return {
    ...staging, drama,
    marketStall: drama.visual.startsWith('market-'),
    arrest: arrestIndex < 0 ? null : { step: arrestIndex, fatherLeft: drama.fatherLeft, heroLeft: drama.heroLeft, motherLeft: drama.motherLeft, sisterLeft: drama.sisterLeft, caption: shot.caption },
    showHero: drama.hero, showMother: drama.mother, showFather: drama.father,
    showSister: drama.sister, showBrother: drama.brother, showFriend: drama.friend, showGuard: drama.amin,
    heroSheltered: false, showBread: false, featuredProp: null,
    motherWardrobe: shot.scene === 'home' ? 'home' : 'outdoor',
    sisterWardrobe: shot.scene === 'road' ? 'outdoor' : shot.scene === 'home' ? 'home' : 'covered',
    motherInjured: ['mother-struck', 'mother-floor', 'home-wounded'].includes(drama.visual),
    locationName: shot.location,
    heroDescription: drama.preDisguise ? '尚未剪发的努拉，绿色头巾与女孩衣服' : staging.heroDescription,
    assets: { ...staging.assets,
      background: shot.scene==='road'?`/art/oppression/${drama.visual.startsWith('relative-')?'road-red-sedan':'road-open-truck'}.svg`:`/art/sister/${shot.scene}.png`,
      hero: drama.heroineAsset ?? (drama.preDisguise ? drama.visual === 'market-warning' ? '/art/sister-v2/hero-market.png' : '/art/sister-v2/hero-cloak.png' : staging.assets.hero),
      mother: drama.motherAsset ?? staging.assets.mother,
      father: drama.fatherAsset ?? staging.assets.father,
      friend: drama.friendAsset ?? staging.assets.friend,
      sister: `/art/sister-v2/sister${shot.scene === 'road' ? '-outdoor' : shot.scene === 'home' ? '' : '-covered'}.png`,
    },
  };
}
