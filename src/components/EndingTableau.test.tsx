import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import EndingTableau, { ENDING_TABLEAUX, getEndingTableau } from './EndingTableau';
import { choose, createRevisionFiveState } from '../lib/branch-story';
import { SHORT_ENDING_TEST_ROUTES } from '../lib/story-test-routes';

describe('five independent final compositions', () => {
  it('each reachable fate renders its own available illustration and action', () => {
    const sources = new Set<string>();
    for (const [id, route] of Object.entries(SHORT_ENDING_TEST_ROUTES)) {
      const state = route.reduce((previous, action) => choose(previous, action)!.state, createRevisionFiveState());
      expect(state.endingId).toBe(id);
      const html = renderToStaticMarkup(<EndingTableau endingId={id} reducedMotion/>);
      const source = `/art/sister-v4/end-${id}.webp`;
      expect(html).toContain(source);
      expect(existsSync(resolve('public' + source))).toBe(true);
      expect(html).toContain('ending-tableau--still');
      expect(html).not.toContain('narrative-actor');
      sources.add(source);
    }
    expect(sources.size).toBe(5);
  });

  it('separates childhood rescue, departure, grown guide, defence and self-government', () => {
    expect(ENDING_TABLEAUX.reunited.action).toContain('完整的双腿');
    expect(ENDING_TABLEAUX.caravan.action).toContain('父亲没有在车上');
    expect(ENDING_TABLEAUX.lantern.action).toContain('成年莱拉');
    expect(ENDING_TABLEAUX.lantern.fate).toContain('你与莱拉留下');
    expect(ENDING_TABLEAUX.dream_guardian.action).toContain('守卫者都是成年女性');
    expect(ENDING_TABLEAUX.dream_commons.action).toContain('让出议事席');
    expect(ENDING_TABLEAUX.dream_guardian.fate).toContain('现实');
    expect(ENDING_TABLEAUX.dream_commons.fate).toContain('父亲仍被囚');
    expect(getEndingTableau('not-an-ending')).toBeNull();
  });
});

describe('six revised fates own distinct terminal compositions', () => {
  const ids = ['no_smoke', 'sister_married', 'conscripted', 'family_escape', 'unwaking_spring', 'guardian_future'];
  it('renders six independent whole paintings without standing actor overlays', () => {
    const sources = new Set<string>();
    for (const id of ids) {
      const html = renderToStaticMarkup(<EndingTableau endingId={id} reducedMotion/>);
      const source = `/art/sister-v6/end-${id}.webp`;
      expect(html).toContain(source);
      expect(html).toContain(`data-ending-tableau="${id}"`);
      expect(html).not.toContain('narrative-actor');
      sources.add(source);
    }
    expect(sources.size).toBe(6);
  });
  it('keeps departure, failed waking, and adult protection materially distinct', () => {
    expect(getEndingTableau('no_smoke')!.action).toContain('父亲不在家中');
    expect(getEndingTableau('sister_married')!.action).toContain('三个人');
    expect(getEndingTableau('conscripted')!.action).toContain('前线');
    expect(getEndingTableau('family_escape')!.action).toContain('露天木板货斗');
    expect(getEndingTableau('unwaking_spring')!.action).toContain('亡兄阿里');
    expect(getEndingTableau('unwaking_spring')!.action).toContain('没有醒来');
    expect(getEndingTableau('guardian_future')!.time).toContain('原创未来');
    expect(getEndingTableau('guardian_future')!.fate).not.toMatch(/家人已离城|梦境|童话/);
  });
});
