import { describe, expect, it } from 'vitest';
import type { BranchState } from './branch-story';
import { ENDINGS, projectEnding } from './ending-content';

const state = (patch: Partial<BranchState> = {}): BranchState => ({
  version: 3, nodeId: 'n30', stats: { food: 0, coins: 0, trust: 5, hope: 4, exposure: 4, health: 3 },
  flags: [], outfit: 'worker', scarf: 'worn', sister: 'beside', father: 'missing', endingId: 'lantern', history: [], ...patch,
});
const ending = (id: string) => ENDINGS.find(item => item.id === id)!;
const text = (value: ReturnType<typeof projectEnding>) => `${value.summary}${value.paragraphs.join('')}`;

describe('five original ending projections', () => {
  it('keeps three different reality transformations and two explicitly adult dreams', () => {
    expect(ENDINGS.map(item => item.id)).toEqual(['reunited', 'caravan', 'lantern', 'dream_guardian', 'dream_commons']);
    for (const dream of ENDINGS.filter(item => item.dream)) {
      expect(text(dream)).toContain('成年');
      expect(text(dream)).not.toMatch(/醒来|醒后|不过是梦|终究是梦/);
    }
  });
  it('does not manufacture food, healed injuries or a change of state', () => {
    const input = state({ flags: ['shelter', 'motherHurt', 'motherTreated', 'sisterHurt', 'sisterTreated'] });
    const before = structuredClone(input);
    const base = structuredClone(ending('lantern'));
    const result = projectEnding(input, ending('lantern'));
    expect(text(result)).not.toMatch(/掰.*饼|剩下的饼|伤已经好了|已经痊愈/);
    expect(text(result)).toContain('起身仍会牵动伤处');
    expect(text(result)).toContain('受伤的脚');
    expect(input).toEqual(before);
    expect(ending('lantern')).toEqual(base);
  });
  it('keeps a separated heroine in the workshop and does not conjure a reply or reconciliation', () => {
    const result = projectEnding(state({ sister: 'apart', flags: ['shelter'] }), ending('lantern'));
    expect(result.scene).toBe('workshop');
    expect(text(result)).toContain('今夜没有人在身旁立刻回答');
    expect(text(result)).toContain('之前没说清去向的争执还在');
    expect(text(result)).not.toContain('姐姐把一张凳子留给你');
  });
  it('distinguishes a real classroom from an invitation to shelter', () => {
    const school = projectEnding(state({ flags: ['sustained', 'shelter'] }), ending('lantern'));
    const refuge = projectEnding(state({ flags: ['shelter'] }), ending('lantern'));
    expect(school.scene).toBe('courtyard');
    expect(text(school)).toContain('课没有只留在');
    expect(text(refuge)).not.toContain('课没有只留在');
  });
  it('uses the sister-rest echo only after that action, not after feeding a brother', () => {
    const fedBrother = projectEnding(state({ flags: ['shelter', 'careFirst', 'brotherFed'] }), ending('lantern'));
    const restedSister = projectEnding(state({ flags: ['shelter'], history: [{ nodeId: 'n13', choiceId: 'care', label: '', consequence: '' }] }), ending('lantern'));
    expect(text(fedBrother)).not.toContain('你曾让姐姐先坐一会儿');
    expect(text(restedSister)).toContain('你曾让姐姐先坐一会儿');
  });
  it('keeps the actual rescue, crutches and injured father when the closing action is writing', () => {
    const result = projectEnding(state({ father: 'free', endingId: 'reunited', flags: ['guardBond', 'released', 'pact'], history: [{ nodeId: 'n30', choiceId: 'pages', label: '', consequence: '' }] }), ending('reunited'));
    expect(result.id).toBe('reunited');
    expect(text(result)).toContain('木推车');
    expect(text(result)).toContain('跛行时用的腋拐');
    expect(text(result)).not.toMatch(/失去.*腿|缺腿|单腿|空裤管/);
    expect(text(result)).toContain('你教他写过的字');
    expect(text(result)).toContain('回话地点');
  });
  it('keeps the open cargo bed and chosen departure when waiting for news', () => {
    const result = projectEnding(state({ endingId: 'caravan', flags: ['boarded'], history: [{ nodeId: 'n30', choiceId: 'wait', label: '', consequence: '' }] }), ending('caravan'));
    expect(result.scene).toBe('road');
    expect(text(result)).toContain('露天货斗');
    expect(text(result)).toContain('已经选择的路');
    expect(text(result)).not.toMatch(/车帘|公交|大巴|旧鞋摆在门边/);
  });
  it('does not turn a saved father into an absent waiting figure or invent public transmission', () => {
    const rescued = projectEnding(state({ father: 'free', endingId: 'reunited', flags: ['released'], history: [{ nodeId: 'n30', choiceId: 'wait', label: '', consequence: '' }] }), ending('reunited'));
    const privateLetter = projectEnding(state({ history: [{ nodeId: 'n30', choiceId: 'pages', label: '', consequence: '' }] }), ending('lantern'));
    expect(text(rescued)).not.toContain('仍等父亲的消息');
    expect(text(privateLetter)).not.toContain('交出获准传递的记录');
  });
});
