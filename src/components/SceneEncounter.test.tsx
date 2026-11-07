import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NODES, choose, createInitialState, getChoices, getNode, type BranchState } from '../lib/branch-story';
import { NODE_TEST_ROUTES, SHORT_ENDING_TEST_ROUTES } from '../lib/story-test-routes';
vi.mock('@/lib/branch-story', () => import('../lib/branch-story'));
vi.mock('@/lib/scene-encounter', () => import('../lib/scene-encounter'));
import SceneEncounter from './SceneEncounter';

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
const render = (state: BranchState) => renderToStaticMarkup(<SceneEncounter state={state} onChoose={() => {}} onRead={() => {}} onCompose={() => {}} onDream={() => {}} onReplay={() => {}} reducedMotion={true}/>);
const reach = (nodeId: string) => NODE_TEST_ROUTES[nodeId].reduce((state, id) => choose(state, id)!.state, createInitialState());

describe('direct single-choice story interface', () => {
  it('renders every ordinary branch, including each locked branch and its reason', () => {
    const states = Object.keys(NODES).map(reach);
    const pending = [createInitialState('short')];
    while (pending.length) {
      const state = pending.pop()!;
      if (state.endingId) continue;
      if (state.history.length > 8) throw new Error('Unexpected short-edition cycle');
      states.push(state);
      for (const choice of getChoices(state).filter(choice => choice.enabled)) pending.push(choose(state, choice.id)!.state);
    }
    for (const state of states) {
      const html = render(state);
      const rows = [...html.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]);
      const choices = getChoices(state).filter(choice => state.nodeId === 'n30' || !choice.id.startsWith('dream_'));
      expect(rows.length, state.nodeId).toBe(choices.length);
      choices.forEach((choice, index) => {
        expect(rows[index], `${state.nodeId}/${choice.id}`).toContain(`<strong>${escape(choice.label)}</strong>`);
        expect(rows[index].includes('disabled=""'), `${state.nodeId}/${choice.id}`).toBe(!choice.enabled);
        if (!choice.enabled) expect(rows[index]).toContain(escape(choice.reason));
      });
    }
  });

  it('contains no preparation controls, calculator, checkbox or second confirmation', () => {
    for (const nodeId of Object.keys(NODES)) {
      const html = render(reach(nodeId));
      expect(html).not.toMatch(/<(?:input|textarea|select)\b|role="checkbox"|aria-pressed|data-pack-item/);
      expect(html).not.toMatch(/encounter-(?:packing|wage|items|confirm|go)/);
      expect(html).not.toMatch(/选择下一步|确认选择|直接决定|应付工钱|4 件|每件 2 枚/);
      expect(html).toContain('写自己的决定');
      expect(html).toContain('听他们说');
      expect(html).toContain('重看这一幕');
      if (nodeId === 'n30') {
        expect(html).toContain('现实终章');
        expect(html.match(/成年梦境/g)).toHaveLength(2);
        expect(html).not.toContain('做一个梦');
      } else expect(html).toContain('做一个梦');
    }
  });
});

const play = (route: string[]) => route.reduce((state, id) => {
  const result = choose(state, id);
  if (!result) throw new Error(`Unavailable action ${state.nodeId}/${id}`);
  return result.state;
}, createInitialState('short'));


describe('the last decision shows the reality and adult dreams together', () => {
  it('exposes both dreams as direct choices without a separate dream menu', () => {
    const state = play(SHORT_ENDING_TEST_ROUTES.reunited.slice(0, -1));
    const markup = render(state);
    for (const choice of getChoices(state)) expect(markup).toContain(choice.label);
    expect(markup.match(/成年梦境/g)).toHaveLength(2);
    expect(markup).toContain('现实终章');
    expect(markup).not.toContain('做一个梦');
    expect(markup).not.toContain('选择下一步');
  });

  it('shows different completed facts before the last choice on rescue, departure and classroom routes', () => {
    const routes = ['reunited', 'caravan', 'lantern'];
    const pages = routes.map(id => render(play(SHORT_ENDING_TEST_ROUTES[id].slice(0, -1))));
    expect(pages[0]).toContain('阿明救出了父亲');
    expect(pages[1]).toContain('露天货斗');
    expect(pages[2]).toContain('课堂已经开起来');
    expect(new Set(pages).size).toBe(3);
  });

  it('keeps final choices isolated when previewing another route', () => {
    const original = structuredClone(NODES.n30);
    const rescue = play(SHORT_ENDING_TEST_ROUTES.reunited.slice(0, -1));
    const first = getNode(rescue);
    getNode(play(SHORT_ENDING_TEST_ROUTES.caravan.slice(0, -1)));
    expect(first.choices.find(choice => choice.id === 'live')!.label).toContain('父亲回家');
    expect(NODES.n30).toEqual(original);
  });
});
