import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NarrativeStage, { describeNarrativeChange, type NarrativeStageProps } from './NarrativeStage';
import { createInitialState, getNode, type BranchState } from '../lib/branch-story';
function props(patch:Partial<BranchState>):NarrativeStageProps{const state={...createInitialState(),...patch};return {...state,scene:getNode(state).scene,ending:state.endingId,reducedMotion:true};}
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
});
