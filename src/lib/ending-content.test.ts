import { describe, expect, it } from 'vitest';
import { choose, createInitialState, getEnding, type BranchState } from './branch-story';
import { ENDINGS, getStayEndingPresentation, projectEnding } from './ending-content';
import { SHORT_ENDING_TEST_ROUTES } from './story-test-routes';
const play = (id:string) => SHORT_ENDING_TEST_ROUTES[id].reduce((state, choiceId) => choose(state,choiceId)!.state,createInitialState('short'));
const text = (id:string) => {const e=getEnding(play(id))!;return `${e.summary}${e.paragraphs.join('')}${e.cost}`;};

describe('five fixed original final scenes',()=>{
  it('defines exactly five fates, with three different real lives and two expressly adult fairy tales',()=>{
    expect(ENDINGS.map(ending=>ending.id)).toEqual(['reunited','caravan','lantern','dream_guardian','dream_commons']);
    expect(ENDINGS.filter(ending=>ending.dream)).toHaveLength(2);
    expect(new Set(ENDINGS.map(ending=>ending.title)).size).toBe(5);
    for(const dream of ENDINGS.filter(ending=>ending.dream)) expect(dream.paragraphs.join('')).toMatch(/明确的成年梦境/);
  });
  it('never nests classroom, lodging or shelter variations under ending 03',()=>{
    const base=play('lantern');
    const variants:BranchState[]=[base,{...base,sister:'beside',flags:['sustained']},{...base,flags:['shelter']},{...base,flags:['settled','letter','waiting']}];
    for(const state of variants){
      expect(projectEnding(state,ENDINGS[2])).toEqual(ENDINGS[2]);
      expect(getStayEndingPresentation(state).kind).toBe('guide');
      expect(getStayEndingPresentation(state).title).toBe('回头的人');
    }
  });
  it('shows a rescued father on a handcart with two complete legs and an underarm crutch',()=>{
    expect(text('reunited')).toContain('木车');
    expect(text('reunited')).toContain('两条腿完整');
    expect(text('reunited')).toContain('木腋拐');
    expect(text('reunited')).toContain('五个人');
    expect(text('reunited')).not.toMatch(/单腿|缺腿|空裤管|失去了一条腿/);
  });
  it('shows exactly the four departing family members in an open cargo bed and leaves the father imprisoned',()=>{
    expect(text('caravan')).toContain('露天后斗');
    expect(text('caravan')).toContain('四个人');
    expect(text('caravan')).toContain('父亲没有获救');
    expect(text('caravan')).not.toMatch(/车帘|公交|大巴|五个人离城/);
  });
  it('makes the third ending a cost-bearing separation and an enacted new vocation',()=>{
    const t=text('lantern');
    expect(t).toContain('不要回头等我');
    expect(t).toContain('游戏原创的几年后');
    expect(t).toContain('莱拉守住队尾');
    expect(t).toContain('把一个滑到石阶边缘的女孩拉起来');
    expect(t).toContain('没有被安排在山口等你');
    expect(t).toContain('父亲未能救出');
    expect(t).not.toMatch(/暂借一夜|等待下一封|终于一家团聚/);
  });
  it('separates the commander’s defense from the builder’s public school, trade and shared decision making',()=>{
    expect(text('dream_guardian')).toContain('全女性卫队的首领');
    expect(text('dream_guardian')).toContain('抬手示意队伍守住石墙');
    expect(text('dream_commons')).toContain('姐姐把教室的门推开');
    expect(text('dream_commons')).toContain('莱拉翻起自己铺前的木牌');
    expect(text('dream_commons')).toContain('让出说话的位置');
    for(const id of ['dream_guardian','dream_commons'])expect(text(id)).toMatch(/男性.*(?:许可|共同许可)/);
  });
  it('never turns adult wishes into a claim that the real family returned or the real father was freed',()=>{
    for(const id of ['dream_guardian','dream_commons']){
      const state=play(id),e=getEnding(state)!;
      expect(state.father).not.toBe('free');
      expect(state.sister).toBe('apart');
      expect(e.cost).toMatch(/现实中/);
      expect(e.cost).toMatch(/离城/);
      expect(e.cost).toMatch(/父亲.*(?:未获救|仍被囚)/);
    }
  });
  it('does not mutate or heal a state when reading any ending',()=>{
    for(const id of Object.keys(SHORT_ENDING_TEST_ROUTES)){
      const state=play(id),before=structuredClone(state),base=ENDINGS.find(ending=>ending.id===id)!;
      const original=structuredClone(base);
      const result=projectEnding(state,base);result.paragraphs.push('local copy');
      expect(state).toEqual(before);expect(base).toEqual(original);
      expect(state.flags).toContain('motherHurt');
    }
  });
});
