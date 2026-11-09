import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NarrativeStage, { describeNarrativeChange, type NarrativeStageProps } from './NarrativeStage';
import { createInitialState, getNode, type BranchState } from '../lib/branch-story';
function props(patch:Partial<Omit<BranchState,'storyRevision'>>):NarrativeStageProps{const state={...createInitialState(),...patch,storyRevision:undefined};return {...state,scene:getNode(state).scene,ending:state.endingId,reducedMotion:true};}
describe('stage announcements follow the cast actually on camera',()=>{
 it('describes the mother on the prison journey instead of an offstage sister moving closer',()=>{
  const before=props({nodeId:'n02'}),next=props({nodeId:'n03',stats:{...before.stats,trust:8}});
  const text=describeNarrativeChange(before,next);
  expect(text).toContain('母亲带努拉');expect(text).not.toMatch(/姐姐靠近|姐姐慢下|重新出现/);
 });
 it('describes the solo market visit despite a trust change after the mother is hurt',()=>{
  const before=props({nodeId:'n03'}),next=props({nodeId:'n04',stats:{...before.stats,trust:8},flags:['motherHurt']});
  const text=describeNarrativeChange(before,next);
  expect(text).toContain('努拉独自来到市场');expect(text).toContain('母亲回家养伤');expect(text).not.toContain('姐姐靠近');
 });
 it('does not stage the sister standing up at the prison when treatment happened off camera',()=>{
  const before=props({nodeId:'n24',sister:'injured',flags:['sisterHurt']}),next=props({nodeId:'n25',sister:'beside',flags:['sisterTreated'],stats:{...before.stats,trust:8}});
  expect(describeNarrativeChange(before,next)).not.toMatch(/姐姐重新站起|姐姐靠近|姐姐慢下/);
 });
 it('allows an on-camera relationship gesture when the sister is physically present',()=>{
  const before=props({nodeId:'n13'}),next=props({nodeId:'n13',stats:{...before.stats,trust:8}});
  expect(describeNarrativeChange(before,next)).toContain('姐姐靠近');
 });
 it('only describes and draws bread actually carried, while empty food describes household stock',()=>{
  const stats=createInitialState().stats;
  for(const nodeId of ['n03','n04']){
   const markup=renderToStaticMarkup(createElement(NarrativeStage,props({nodeId,flags:[],stats:{...stats,food:5}})));
   expect(markup).not.toContain('行囊里带着馕饼');expect(markup).not.toContain('narrative-prop--bread');
  }
  const carried=renderToStaticMarkup(createElement(NarrativeStage,props({nodeId:'n04',flags:['bread'],stats:{...stats,food:1}})));
  expect(carried).toContain('行囊里带着馕饼');expect(carried).toContain('narrative-prop--bread');
  const empty=renderToStaticMarkup(createElement(NarrativeStage,props({nodeId:'n04',flags:['bread'],stats:{...stats,food:0}})));
  expect(empty).toContain('家里的口粮已经吃尽');expect(empty).not.toContain('行囊里');expect(empty).not.toContain('narrative-prop--bread');
 });
 it('does not announce the mother injured before the blow in the third dialogue beat',()=>{
  const base=props({nodeId:'n03',flags:[]});
  for(const beatIndex of [0,1])expect(renderToStaticMarkup(createElement(NarrativeStage,{...base,beatIndex,phase:'reading'}))).not.toContain('母亲还带着挨打后的伤');
  for(const beatIndex of [2,3])expect(renderToStaticMarkup(createElement(NarrativeStage,{...base,beatIndex,phase:'reading'}))).toContain('母亲还带着挨打后的伤');
  expect(renderToStaticMarkup(createElement(NarrativeStage,{...base,beatIndex:0,phase:'choice'}))).toContain('母亲还带着挨打后的伤');
 });
 it('announces a numerical food gain as household stock unless a loaf is carried',()=>{
  const before=props({nodeId:'n10',flags:[]}),next={...before,stats:{...before.stats,food:before.stats.food+1}};
  expect(describeNarrativeChange(before,next)).toBe('家里的口粮又添了一份。');
  expect(describeNarrativeChange(before,{...next,flags:['bread']})).toContain('馕饼被放进布袋');
 });
 it('announces the whole family in the truck even though separate figure slots are hidden',()=>{
  const before=props({nodeId:'n21'}),next={...props({nodeId:'n30',flags:['boarded','documents'],outfit:'travel'}),scene:'road' as const};
  const markup=renderToStaticMarkup(createElement(NarrativeStage,next));
  expect(markup).toContain('家人 · 同在露天后斗');
  expect(markup).not.toContain('你独自走在这一页');
  expect(describeNarrativeChange(before,next)).toContain('努拉与母亲、姐姐、弟弟坐在露天后斗');
  expect(describeNarrativeChange(before,next)).not.toContain('旧纸摊开');
 });
});


describe('persistent cast between dialogue and encounter phases',()=>{
 const render=(value:NarrativeStageProps)=>renderToStaticMarkup(createElement(NarrativeStage,value));
 const actorTags=(value:NarrativeStageProps)=>render(value).match(/<div data-actor="[^"]+"[^>]*>/g)??[];
 const actorIds=(value:NarrativeStageProps)=>actorTags(value).map(tag=>tag.match(/data-actor="([^"]+)"/)?.[1]);
 it('retains all nine actor slots when a family member enters or leaves the scene',()=>{
  const market=props({nodeId:'n01'}),home=props({nodeId:'n02'}),solo=props({nodeId:'n04',flags:['motherHurt']});
  const ids=['mother','father','hero','sister','brother','friend','guard','oppressor','second-patrol'];
  for(const value of [market,home,solo])expect(actorIds(value)).toEqual(ids);
  expect(actorTags(market).find(tag=>tag.includes('data-actor="mother"'))).toContain('data-presence="offstage"');
  expect(actorTags(home).find(tag=>tag.includes('data-actor="mother"'))).toContain('data-presence="present"');
  expect(actorTags(solo).find(tag=>tag.includes('data-actor="father"'))).toContain('data-presence="offstage"');
 });
 it('keeps ordinary dialogue, choices and exploration in exactly the same cast pose',()=>{
  const base=props({nodeId:'n13'});
  const still=actorTags({...base,phase:'reading',beatIndex:0});
  for(const value of [
   {...base,phase:'reading' as const,beatIndex:1},
   {...base,phase:'choice' as const,beatIndex:0},
   {...base,phase:'explore' as const,beatIndex:0},
   {...base,phase:'compose' as const,beatIndex:0},
   {...base,phase:'reading' as const,beatIndex:0,reducedMotion:false},
  ])expect(actorTags(value)).toEqual(still);
 });
 it('still carries the father towards the door over four arrest beats without replacing his slot',()=>{
  const base=props({nodeId:'n02'});
  for(const [beatIndex,left] of [69,77,86,108].entries()){
   const tag=actorTags({...base,phase:'reading',beatIndex}).find(value=>value.includes('data-actor="father"'));
   expect(tag).toContain(`left:${left}%`);
   expect(tag).toContain(`data-presence="${beatIndex===3?'offstage':'present'}"`);
  }
 });
});
