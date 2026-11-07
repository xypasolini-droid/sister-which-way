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
      const choices = getChoices(state).filter(choice => state.storyRevision === 5 || state.nodeId === 'n30' || !choice.id.startsWith('dream_'));
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
        expect(html.match(/成年童话/g)).toHaveLength(2);
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


describe('revision 5 uses decisive actions rather than an ending menu', () => {
  it('ends immediately after the seventh action, without an eighth confirmation', () => {
    for (const route of Object.values(SHORT_ENDING_TEST_ROUTES)) {
      const before = play(route.slice(0, -1));
      expect(before.endingId).toBeNull();
      expect(before.nodeId).not.toBe('n30');
      const after = choose(before, route.at(-1)!)!.state;
      expect(after.endingId).toBeTruthy();
      expect(after.history).toHaveLength(7);
      expect(getChoices(after).some(choice => choice.enabled)).toBe(false);
    }
  });

  it('shows departure and returning for Leila as different actions in the same encounter', () => {
    const state = play(SHORT_ENDING_TEST_ROUTES.caravan.slice(0, -1));
    const html = render(state);
    const departure = getChoices(state).find(choice => choice.id === 'register')!;
    const returnForFriend = getChoices(state).find(choice => choice.id === 'child')!;
    expect(html).toContain(escape(departure.label));
    expect(html).toContain(escape(returnForFriend.label));
    expect(choose(state, departure.id)!.state.endingId).toBe('caravan');
    expect(choose(state, returnForFriend.id)!.state.endingId).toBe('lantern');
    expect(html).not.toContain('选择下一步');
    expect(html).not.toContain('做一个梦');
  });

  it('labels the earned adult tales where their commitments are made', () => {
    const state = play(SHORT_ENDING_TEST_ROUTES.dream_guardian.slice(0, -1));
    const html = render(state);
    expect(html.match(/encounter-ending-kind/g)).toHaveLength(2);
    expect(html.match(/>成年童话</g)).toHaveLength(2);
    expect(html).not.toContain('现实终章');
    expect(html).not.toContain('做一个梦');
    const before = structuredClone(NODES.n30);
    getNode(state);
    getNode(play(SHORT_ENDING_TEST_ROUTES.caravan.slice(0, -1)));
    expect(NODES.n30).toEqual(before);
  });
});
