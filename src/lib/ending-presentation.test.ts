import { describe, expect, it } from 'vitest';
import { choose, createInitialState, getEnding, validateBranchState, type BranchState } from './branch-story';
import { endingEcho, endingGrowth } from './ending-presentation';
import { NODE_TEST_ROUTES, SHORT_ENDING_TEST_ROUTES } from './story-test-routes';
function play(route:string[],short=false):BranchState{return route.reduce((state,id)=>{const result=choose(state,id);if(!result)throw new Error(`${state.nodeId}/${id}`);return result.state;},createInitialState(short?'short':undefined));}

describe('five growth endings remember the actions that caused them',()=>{
  it('gives each fixed fate its own growth, image and remembered cost',()=>{
    const states=Object.values(SHORT_ENDING_TEST_ROUTES).map(route=>play(route,true));
    expect(new Set(states.map(endingGrowth)).size).toBe(5);
    expect(new Set(states.map(endingEcho)).size).toBe(5);
    expect(endingGrowth(states[0])).toContain('木车');
    expect(endingGrowth(states[1])).toContain('离城');
    expect(endingGrowth(states[2])).toContain('山隘');
    expect(endingGrowth(states[3])).toContain('卫队首领');
    expect(endingGrowth(states[4])).toContain('学校、市场');
  });
  it('makes the ending 03 echo the turned-back hand and the loss of the family vehicle',()=>{
    const state=play(SHORT_ENDING_TEST_ROUTES.lantern,true);
    expect(endingEcho(state)).toContain('让家人不要等');
    expect(endingEcho(state)).toContain('折返接住莱拉');
    expect(endingEcho(state)).not.toMatch(/课堂|一小时|暂借/);
  });
  it('anchors the adult commander and builder in distinct performed earlier work',()=>{
    const guardian=play(SHORT_ENDING_TEST_ROUTES.dream_guardian,true);
    const commons=play(SHORT_ENDING_TEST_ROUTES.dream_commons,true);
    expect(endingEcho(guardian)).toContain('真正保护过别人');
    expect(endingEcho(commons)).toContain('留住见证、记下遭遇、教字或共担照护');
    expect(endingEcho(guardian)).toContain('现实');
    expect(endingEcho(commons)).toContain('现实');
  });
  it('does not turn historical evidence into a completed transmission when presenting an old archive',()=>{
    const state=play([...NODE_TEST_ROUTES.n27,'archive','live']);
    expect(endingEcho(state)).toContain('旧版记录');
    expect(endingEcho(state)).toContain('核对并保留记录');
    expect(endingEcho(state)).toContain('仍等可信的人带走');
    expect(endingEcho(state)).not.toMatch(/已交|已经送出|已传出/);
  });
  it('still acknowledges a real historical handoff without manufacturing a return',()=>{
    const state=play([...NODE_TEST_ROUTES.n28,'post','live']);
    expect(endingEcho(state)).toContain('已交到送信人手中');
    expect(endingEcho(state)).toContain('还没有回音');
    expect(endingEcho(state)).not.toContain('走出城');
  });
  it('keeps an authentic finished old short story archived without inventing the new third ending',()=>{
    const initial=createInitialState('short');delete initial.storyRevision;
    const state=['work','sew','buy','truth','courier','rush','father','live'].reduce((current,id)=>choose(current,id)!.state,initial);
    const restored=validateBranchState(state)!;
    expect(restored).not.toBeNull();
    expect(getEnding(restored)!.title).toContain('旧版结局');
    expect(endingGrowth(restored)).toContain('旧版');
    expect(endingEcho(restored)).not.toContain('引路人');
    expect(restored.flags).not.toContain('guideGrown');
  });
});
