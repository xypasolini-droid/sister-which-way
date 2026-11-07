import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { choose, createInitialState, getEnding, getNode, type BranchState, type SceneId } from './branch-story';
import { selectNarrativeStage, type NarrativeStageContext } from './narrative-stage-state';
import { getOppressionShots } from './oppression-scenes';
import { ENDING_TEST_ROUTES, NODE_TEST_ROUTES, REALITY_VARIANT_TEST_ROUTES } from './story-test-routes';
function stage(patch:Partial<BranchState>,scene?:SceneId,camera:Pick<NarrativeStageContext,'beatIndex'|'phase'>={}){const state={...createInitialState(),...patch};return selectNarrativeStage({...state,...camera,scene:scene??getNode(state).scene,ending:state.endingId});}
function play(path:string[]){return path.reduce((state,id)=>{const next=choose(state,id);if(!next)throw new Error(`${state.nodeId}/${id}`);return next.state;},createInitialState());}
describe('physical presence, clothing and visible story consequences',()=>{
 it('opens on the father and daughter stall, then leaves the father absent after arrest',()=>{
  expect(stage({})).toMatchObject({showHero:true,showFather:true,showMother:false,showSister:false,showBrother:false});
  expect(stage({})).toMatchObject({marketStall:true,featuredProp:null});
  expect(stage({}).assets.hero).toBe('/art/sister-v2/hero-market.png');
  expect(stage({}).assets.father).toBe('/art/sister-v2/father-market.png');
  expect(stage({nodeId:'n02'}).assets.father).toBe('/art/sister-v3/father-standing-crutch.png');
  expect(stage({nodeId:'n02',father:'free'},undefined,{beatIndex:3})).toMatchObject({showMother:true,showSister:true,showBrother:true,showFather:false});
 });
 it('performs the arrest over four dialogue beats and keeps the empty place through decisions',()=>{
  const context={nodeId:'n02',father:'free' as const};
  const shots=[0,1,2,3].map(beatIndex=>stage(context,undefined,{beatIndex,phase:'reading'}));
  expect(shots.map(s=>s.showFather)).toEqual([true,true,true,false]);
  expect(shots.map(s=>s.arrest?.fatherLeft)).toEqual([69,77,86,108]);
  expect(shots.map(s=>s.arrest?.motherLeft)).toEqual([21,62,70,45]);
  expect(shots.every(s=>s.assets.mother.endsWith('/mother-stop.png'))).toBe(true);
  expect(shots.every(s=>s.showMother&&s.showSister&&s.showBrother&&!s.showGuard)).toBe(true);
  expect(shots[0].arrest?.caption).toContain('踢开家门');
  expect(shots[3].arrest?.caption).toContain('被武装者带出');
  for(const phase of ['explore','choice','compose'] as const)expect(stage(context,undefined,{beatIndex:0,phase}).showFather).toBe(false);
  expect(stage(context,undefined,{beatIndex:0,phase:'reading'}).showFather).toBe(true);
  expect(stage({nodeId:'n03',father:'missing'}).arrest).toBeNull();
 });
 it('shows the mother on the first prison journey and keeps her injuries visible at home',()=>{
  expect(stage({nodeId:'n03'})).toMatchObject({showMother:true,showSister:false,showBrother:false,motherInjured:false});
  expect([0,1,2,3].map(beatIndex=>stage({nodeId:'n03'},undefined,{beatIndex,phase:'reading'}).motherInjured)).toEqual([false,false,true,true]);
  for(const phase of ['explore','choice','compose'] as const)expect(stage({nodeId:'n03'},undefined,{beatIndex:0,phase}).motherInjured).toBe(true);
  expect(stage({nodeId:'n03'},undefined,{beatIndex:2}).assets.mother).toBe('/art/sister-v2/mother-outdoor.png');
  const home=stage({nodeId:'n05',flags:['motherHurt']});
  expect(home).toMatchObject({showMother:true,showBrother:true});expect(home.assets.mother).toContain('mother-injured.png');
  expect(stage({nodeId:'n15',flags:['motherHurt']}).showMother).toBe(false);
  const recovering=stage({nodeId:'n18',flags:['motherHurt','motherTreated']});
  expect(recovering).toMatchObject({showMother:true,motherInjured:true,motherRecovering:true});
  expect(recovering.assets.mother).toContain('mother-injured.png');
 });
 it('does not turn household food into a carried loaf or featured bread prop',()=>{
  const stats=createInitialState().stats;
  for(const nodeId of ['n03','n04'])expect(stage({nodeId,flags:[],stats:{...stats,food:5}})).toMatchObject({showBread:false,featuredProp:null});
  expect(stage({nodeId:'n04',flags:['bread'],stats:{...stats,food:1}})).toMatchObject({showBread:true,featuredProp:'bread'});
  expect(stage({nodeId:'n04',flags:['bread'],stats:{...stats,food:0}})).toMatchObject({showBread:false,featuredProp:null});
 });
 it('shows the classmate during the first encounter, before the acquaintance flag exists',()=>{
  expect(stage({nodeId:'n07',outfit:'worker'})).toMatchObject({showFriend:true,showSister:false});
  expect(stage({nodeId:'n09',outfit:'worker',flags:['friendMet']})).toMatchObject({showFriend:true,showGuard:true});
  expect(stage({nodeId:'n01'}).showGuard).toBe(false);
 });
 it('changes camera to the mother during forced departure; the heroine is elsewhere',()=>{
  const cast=stage({nodeId:'n21',flags:['friendMet','disguise']});
  expect(cast).toMatchObject({showHero:false,showMother:true,showSister:true,showBrother:true});
  expect(cast.assets.sister).toContain('sister-outdoor.png');expect(cast.assets.mother).toContain('mother-outdoor.png');
 });
 it('shows the sister in the back courtyard while the mother is still searching elsewhere',()=>{
  const cast=stage({nodeId:'n23',sister:'apart',flags:['motherReturned','motherSearching']});
  expect(cast).toMatchObject({showSister:true,showMother:false,showBrother:true});
  expect(cast.companion.presence).toBe('present');expect(cast.assets.background).toContain('courtyard.png');
 });
 it('distinguishes home, screened private rooms and public coverings',()=>{
  expect(stage({nodeId:'n05'}).assets.sister).toContain('/sister.png');
  expect(stage({nodeId:'n11'}).assets.sister).toContain('/sister-covered.png');
  expect(stage({nodeId:'n21'}).assets.sister).toContain('/sister-outdoor.png');
  expect(stage({nodeId:'n24',sister:'injured',flags:['sisterHurt']})).toMatchObject({space:'women-clinic',showSister:true});
  expect(stage({nodeId:'n24',sister:'injured',flags:['sisterHurt']}).assets.sister).toContain('sister-covered-injured.png');
 });
 it('does not take the whole family to the clinic or prison to witness each errand',()=>{
  expect(stage({nodeId:'n24',flags:['rescueRoute','sisterHurt']}).showMother).toBe(false);
  expect(stage({nodeId:'n25',sister:'beside',flags:['sisterHurt']})).toMatchObject({showMother:false,showSister:false,sisterInjured:true,showGuard:true});
  const resting=stage({nodeId:'n30',sister:'beside',father:'free',flags:['released','sisterHurt']},'home');
  expect(resting).toMatchObject({showFather:true,showSister:true,sisterInjured:true,fatherRescued:true});
  expect(resting.assets.father).toBe('/art/sister-v2/father-rescued.png');
  expect(resting.assets.sister).toContain('sister-injured.png');
  expect(stage({nodeId:'n30',flags:['sisterTreated']},'home')).toMatchObject({sisterInjured:false,sisterRecovering:true});
  expect(stage({nodeId:'n30',flags:['sisterTreated']},'home').assets.sister).toContain('sister-injured.png');
 });
 it('uses a modest cap in public and removes it in private without changing the haircut',()=>{
  expect(stage({nodeId:'n09',outfit:'worker',flags:['disguise']}).assets.hero).toContain('/hero-worker.png');
  expect(stage({nodeId:'n13',outfit:'worker',flags:['disguise']}).assets.hero).toContain('/hero-worker-indoor.png');
  expect(stage({nodeId:'n26',outfit:'travel',flags:['disguise']}).assets.hero).toContain('/hero-travel-indoor.png');
  expect(stage({nodeId:'n26',outfit:'travel',flags:[]}).assets.hero).toContain('/hero-travel-girl.png');
 });
 it('keeps women inside the vehicle and preserves private lodging after separation',()=>{
  expect(stage({nodeId:'n30',flags:['boarded'],endingId:'caravan'},'road')).toMatchObject({womenInVehicle:true,showMother:false,showSister:false,showBrother:false});
  expect(stage({nodeId:'n30',sister:'apart',endingId:'lantern'},'workshop')).toMatchObject({showMother:false,showSister:false,showBrother:false});
 });
 it('distinguishes the coercive red sedan from the open departure truck and its seated passengers',()=>{
  const relative=stage({nodeId:'n21',flags:['relativePressure']});
  expect(relative.assets.background).toBe('/art/oppression/road-red-sedan.svg');
  const road=stage({nodeId:'n30',flags:[]},'road');
  expect(road.assets.background).toBe('/art/oppression/road-open-truck.svg');
  const departing=stage({nodeId:'n30',flags:['boarded'],endingId:'caravan'},'road');
  expect(departing.assets.background).toBe('/art/oppression/road-open-truck-departure.svg');
  expect(departing).toMatchObject({showHero:false,womenInVehicle:true,showMother:false,showSister:false,showBrother:false});
  const state=play(NODE_TEST_ROUTES.n21);
  for(const dramaShot of getOppressionShots(state)){
   expect(selectNarrativeStage({...state,scene:dramaShot.scene,dramaShot,phase:'cinematic'}).assets.background).toBe('/art/oppression/road-red-sedan.svg');
  }
 });
 it('embeds all four departing family members and the confirmed escort instead of hiding the heroine from the truck',()=>{
  const asset=readFileSync(new URL('../../public/art/oppression/road-open-truck-departure.svg',import.meta.url),'utf8');
  expect(asset.match(/<g id="passenger-[^"]+"/g)).toHaveLength(4);
  for(const id of ['passenger-nura','passenger-mother','passenger-sister','passenger-brother','driver-yusuf'])expect(asset).toContain(`id="${id}"`);
  expect(asset).not.toContain('Nura and father are not embedded');
  expect(asset).not.toContain('id="passenger-father"');
 });
 it('keeps separated lodging in the workshop across the final scene and real ending',()=>{
  const state=play(REALITY_VARIANT_TEST_ROUTES.separated.slice(0,-1));
  expect(getNode(state).scene).toBe('workshop');
  {
   const ended=choose(state,'live')!.state;
   const ending=getEnding(ended)!;
   expect(ending.scene).toBe('workshop');
   expect(selectNarrativeStage({...ended,scene:ending.scene,ending:ended.endingId})).toMatchObject({showMother:false,showSister:false,showBrother:false,locationName:'作坊遮挡的后间'});
  }
 });
 it('keeps the classmate at the classroom without inventing a visit in other stay-in-city variants',()=>{
  expect(stage({nodeId:'n30',flags:['friendMet','sustained'],endingId:'lantern'},'courtyard').showFriend).toBe(true);
  expect(stage({nodeId:'n30',flags:['friendMet','settled'],endingId:'lantern'},'home').showFriend).toBe(false);
  expect(stage({nodeId:'n30',sister:'apart',flags:['friendMet','chosenApart'],endingId:'lantern'},'workshop').showFriend).toBe(false);
  expect(stage({nodeId:'n30',flags:['friendMet','boarded'],endingId:'caravan'},'road').showFriend).toBe(false);
 });
 it('resolves every authored stage and coda to existing local assets',()=>{
  for(const path of [...Object.values(NODE_TEST_ROUTES),...Object.values(ENDING_TEST_ROUTES)]){
   const state=play(path),scene=getEnding(state)?.scene??getNode(state).scene;
   const shots=getOppressionShots(state);
   const casts=[selectNarrativeStage({...state,scene,ending:state.endingId}),...shots.map(dramaShot=>selectNarrativeStage({...state,scene:dramaShot.scene,dramaShot,phase:'cinematic'}))];
   for(const cast of casts)for(const asset of Object.values(cast.assets))expect(existsSync(new URL(`../../public${asset}`,import.meta.url)),`${state.nodeId}: ${asset}`).toBe(true);
  }
 });
 it('shows only an adult dream protagonist and dream landscape without copying real injuries into the dream cast',()=>{
  for(const endingId of ['dream_guardian','dream_commons']){
   const cast=stage({nodeId:'n30',endingId,sister:'injured',father:'free',flags:['released','motherHurt','sisterHurt','friendMet']},'courtyard');
   expect(cast).toMatchObject({isDream:true,showHero:true,showMother:false,showFather:false,showSister:false,showBrother:false,showFriend:false,showGuard:false,featuredProp:null});
   expect(cast.assets.hero).toBe(endingId==='dream_commons'?'/art/sister-v3/adult-builder.png':'/art/sister-v2/dream-guardian.png');
   expect(cast.assets.background).toBe(`/art/oppression/${endingId.replace('_','-')}.svg`);
   if(endingId==='dream_commons')expect(cast.heroDescription).not.toContain('卫队');
   else expect(cast.heroDescription).toContain('卫队');
  }
 });
});
