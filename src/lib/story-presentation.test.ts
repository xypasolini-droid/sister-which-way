import { describe, expect, it } from 'vitest';
import { choose, createInitialState, getEnding, getNode, type BranchState } from './branch-story';
import { getSceneDialogue } from './scene-dialogue';
import { buildReadingBeats, getCompanionStatus, getHeroDisplayName, storyPresentationKey, MAX_SUBTITLE_CHARACTERS } from './story-presentation';

import { NODE_TEST_ROUTES as NODE_ROUTES, ENDING_TEST_ROUTES as ENDING_ROUTES } from './story-test-routes';
function play(path:string[]):BranchState {
  return path.reduce((state,id)=>{const next=choose(state,id);if(!next)throw new Error(`Invalid route ${state.nodeId}/${id}`);return next.state},createInitialState());
}

describe('performed scenes and a separate full journal',()=>{
  it('performs 2–4 authored lines, without turning consequences into another reading queue',()=>{
    const state=createInitialState();
    const beats=buildReadingBeats(state,'Long consequences belong in the journal. '.repeat(50));
    expect(beats).toHaveLength(getSceneDialogue(state).length);
    expect(beats.map(({speaker,actor,text})=>({speaker,actor,text}))).toEqual(getSceneDialogue(state));
    expect(beats.every(beat=>beat.kind==='dialogue')).toBe(true);
  });
  it('keeps every reachable node short and leaves its full journal prose and history untouched',()=>{
    expect(Object.keys(NODE_ROUTES)).toHaveLength(30);
    for(const path of Object.values(NODE_ROUTES)){
      const state=play(path), node=getNode(state), before=JSON.stringify(state), prose=[...node.paragraphs];
      const beats=buildReadingBeats(state,state.history.at(-1)?.consequence);
      const dialogue=beats.filter(b=>b.kind==='dialogue'), tales=beats.filter(b=>b.kind==='tale');
      expect(dialogue.length).toBeGreaterThanOrEqual(2);expect(dialogue.length).toBeLessThanOrEqual(4);
      expect(tales.length).toBeLessThanOrEqual(3);expect(beats.length).toBeLessThanOrEqual(7);
      expect(beats.every(b=>Array.from(b.text).length<=MAX_SUBTITLE_CHARACTERS)).toBe(true);
      expect(beats.every(b=>b.actor)).toBe(true);
      expect(new Set(beats.map(b=>b.id)).size).toBe(beats.length);
      expect(getNode(state).paragraphs).toEqual(prose);
      expect(JSON.stringify(state)).toBe(before);
      expect(prose.join('').length).toBeGreaterThan(dialogue.map(b=>b.text).join('').length);
    }
  });
  it('performs five linked fairy-tale interludes while preserving each longer tale in the journal',()=>{
    const episodes=['n05','n07','n20','n25','n30'];
    for(const [id,path] of Object.entries(NODE_ROUTES)){
      const state=play(path),tale=getNode(state).tale;
      const beats=buildReadingBeats(state).filter(b=>b.kind==='tale');
      expect(beats.length>0).toBe(episodes.includes(id));
      if(beats.length){expect(beats.length).toBeGreaterThanOrEqual(2);expect(tale.length).toBeGreaterThan(70);}
      expect(getNode(state).tale).toBe(tale);
    }
    const original=play(NODE_ROUTES.n07);
    const shared={...original,flags:[...original.flags,'brotherStory']};
    expect(buildReadingBeats(original).filter(b=>b.kind==='tale')).not.toEqual(buildReadingBeats(shared).filter(b=>b.kind==='tale'));
  });
  it('gives all five saved endings a brief coda without discarding their authored prose',()=>{
    for(const [id,path]of Object.entries(ENDING_ROUTES)){
      const state=play(path);expect(state.endingId).toBe(id);
      const original=getEnding(state)!,beats=buildReadingBeats(state);
      expect(beats.length).toBeGreaterThanOrEqual(2);expect(beats.length).toBeLessThanOrEqual(3);
      expect(beats.every(b=>b.kind==='ending'&&b.text.length<=40)).toBe(true);
      expect(getEnding(state)).toEqual(original);expect(original.paragraphs.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('keeps the rescued father lying on a handcart and distinguishes both vehicles in prose and subtitles',()=>{
    const opening=getNode(createInitialState()).paragraphs.join('');
    expect(opening).toContain('双腿');
    expect(opening).toContain('走路有些跛');
    expect(opening).not.toMatch(/失去.*腿|缺腿|单腿|空裤管/);
    expect(opening).toContain('腋拐');
    const reunion=play(ENDING_ROUTES.reunited);
    expect(getEnding(reunion)!.paragraphs.join('')).toContain('木推车');
    expect(getEnding(reunion)!.paragraphs.join('')).toContain('腋拐');
    expect(reunion.history.map(step=>step.consequence).join('')).not.toMatch(/失去.*腿|缺腿|单腿|空裤管/);
    expect(buildReadingBeats(reunion).map(beat=>beat.text).join('')).toContain('车把');
    expect(getNode(play(NODE_ROUTES.n21)).paragraphs.join('')).toContain('红色轿车');
    const departure=play(ENDING_ROUTES.caravan);
    expect(getEnding(departure)!.paragraphs.join('')).toContain('露天货斗');
    expect(buildReadingBeats(departure).map(beat=>beat.text).join('')).toContain('车');
    expect(getEnding(departure)!.paragraphs.join('')).not.toMatch(/车帘|帘子放下|车厢内/);
  });
  it('separates physical presence, memory and a face-to-face meeting during separation',()=>{
    expect(getCompanionStatus(play(NODE_ROUTES.n01)).presence).toBe('offstage');
    expect(getCompanionStatus(play(NODE_ROUTES.n03)).presence).toBe('offstage');
    const apart={...play(NODE_ROUTES.n18),sister:'apart' as const};
    expect(getCompanionStatus(apart).presence).toBe('apart');
    expect(getCompanionStatus({...apart,nodeId:'n23'}).presence).toBe('present');
    expect(getCompanionStatus({...apart,nodeId:'n29'}).presence).toBe('present');
  });
  it('uses the chosen flame name in public and the family name at home',()=>{
    const state={...play(NODE_ROUTES.n09),flags:['disguise','aliasAatish']};
    expect(getHeroDisplayName(state)).toBe('阿提什');
    expect(getHeroDisplayName({...state,nodeId:'n13'})).toBe('努拉');
    expect(getHeroDisplayName(createInitialState())).toBe('努拉');
  });
  it('distinguishes converging paths and preserves the cursor key when replayed',()=>{
    const a=play(['work']),b=play(['neighbor']);
    expect(a.nodeId).toBe(b.nodeId);
    expect(storyPresentationKey(a)).not.toBe(storyPresentationKey(b));
    expect(storyPresentationKey(a)).toBe(storyPresentationKey(play(['work'])));
  });
  it('performs exactly five fixed final scenes with different actions and family fates',()=>{
    const routes=[
      ['work','sew','buy','truth','courier','plan','release'],
      ['work','sew','buy','pact','care','find','register'],
      ['work','sew','buy','pact','care','find','child'],
      ['work','sew','buy','pact','care','rush','father'],
      ['neighbor','sew','buy','truth','courier','rush','school'],
    ];
    const screens=routes.map(route=>{
      const state=route.reduce((current,id)=>choose(current,id)!.state,createInitialState('short'));
      const beats=buildReadingBeats(state);
      expect(beats).toHaveLength(2);
      expect(beats.every(beat=>beat.kind==='ending'&&beat.text.length<=40)).toBe(true);
      return beats.map(beat=>beat.text).join('');
    });
    expect(new Set(screens).size).toBe(5);
    expect(screens[0]).toContain('车把');
    expect(screens[0]).toContain('五个人');
    expect(screens[1]).toContain('露天货车');
    expect(screens[1]).toContain('父亲还在里面');
    expect(screens[2]).toContain('几年后');
    expect(screens[2]).toContain('石阶');
    expect(screens[3]).toContain('女性卫队');
    expect(screens[4]).toContain('议事庭');
  });
  it('labels both adult fairy tales without making the real father free or the sister present',()=>{
    for(const route of [
      ['work','sew','buy','pact','care','rush','father'],
      ['neighbor','sew','buy','truth','courier','rush','school'],
    ]){
      const state=route.reduce((current,id)=>choose(current,id)!.state,createInitialState('short'));
      const lines=buildReadingBeats(state);
      expect(lines).toHaveLength(2);
      expect(lines.every(line=>line.text.length<=40)).toBe(true);
      expect(lines[0].text).toContain('成年童话');
      expect(state.father).not.toBe('free');
      expect(state.sister).toBe('apart');
      expect(state.flags).toContain('familyDeparted');
    }
  });
  it('remembers an earlier classroom without putting an absent sister in the heroine’s room',()=>{
    const separated={...createInitialState(),nodeId:'n30',endingId:'lantern',father:'located' as const,sister:'apart' as const,flags:['sustained']};
    const text=buildReadingBeats(separated).map(line=>line.text).join('');
    expect(text).toContain('想起那一小时');
    expect(text).toContain('独自铺床');
    expect(text).not.toContain('这节课，你也坐下');
  });
});
