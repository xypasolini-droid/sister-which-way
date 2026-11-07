import { describe, expect, it } from 'vitest';
import { choose, createInitialState, getEnding, validateBranchState, type BranchState } from './branch-story';
import { endingEcho } from './ending-presentation';
import { NODE_TEST_ROUTES } from './story-test-routes';

function play(route: string[], short = false): BranchState {
  return route.reduce((state, id) => {
    const next = choose(state, id);
    if (!next) throw new Error(`Unavailable route: ${state.nodeId}/${id}`);
    return next.state;
  }, createInitialState(short ? 'short' : undefined));
}

describe('ending echoes report completed actions rather than available contacts', () => {
  it('does not turn a trusted contact and stored evidence into a completed transmission', () => {
    const state = play(['work','sew','buy','truth','courier','rush','father','live'], true);
    expect(state.endingId).toBe('lantern');
    expect(state.flags).toEqual(expect.arrayContaining(['evidence','courier']));
    expect(state.flags).not.toContain('sent');
    expect(state.flags).not.toContain('archive');
    expect(endingEcho(state)).toContain('记录仍在手边');
    expect(endingEcho(state)).not.toMatch(/走出城|已交|已经送出|已传出/);
  });

  it('distinguishes preparing an archive from handing it to a messenger', () => {
    const state = play([...NODE_TEST_ROUTES.n27, 'archive', 'live']);
    expect(state.endingId).toBe('lantern');
    expect(state.flags).toContain('archive');
    expect(state.flags).not.toContain('sent');
    expect(endingEcho(state)).toContain('核对并保留记录');
    expect(endingEcho(state)).toContain('仍等可信的人带走');
    expect(endingEcho(state)).not.toMatch(/走出城|已交|已经送出|已传出/);
  });

  it('acknowledges a real handoff without pretending the messenger has already crossed the city or returned', () => {
    const state = play([...NODE_TEST_ROUTES.n28, 'post', 'live']);
    expect(state.endingId).toBe('lantern');
    expect(state.flags).toContain('sent');
    expect(endingEcho(state)).toContain('已交到送信人手中');
    expect(endingEcho(state)).toContain('还没有回音');
    expect(endingEcho(state)).not.toContain('走出城');
  });

  it('retains an authentic legacy writing handoff after exact migration without inventing a sent flag', () => {
    const current = play(['work','sew','buy','truth','courier','rush','father','live'], true);
    const old = {
      ...current, endingId:'witness',
      history:[...current.history.slice(0,-1),{...current.history.at(-1)!,choiceId:'pages'}],
    };
    const migrated = validateBranchState(old)!;
    expect(migrated).not.toBeNull();
    expect(migrated.endingId).toBe('lantern');
    expect(migrated.flags).not.toContain('sent');
    expect(getEnding(migrated)!.paragraphs.join('')).toContain('交出获准传递的记录');
    expect(endingEcho(migrated)).toContain('已交到送信人手中');
    expect(endingEcho(migrated)).not.toContain('仍在手边');
  });

  it('keeps rescue, departure, classroom and separate lodging as stronger established echoes', () => {
    const contact = play(['work','sew','buy','truth','courier','rush','father','live'], true);
    const snapshot = structuredClone(contact);
    const cases = [
      {...contact, endingId:'reunited', flags:[...contact.flags,'sent']},
      {...contact, endingId:'caravan', flags:[...contact.flags,'sent']},
      {...contact, flags:[...contact.flags,'sent','sustained']},
      {...contact, sister:'apart' as const, flags:[...contact.flags,'sent']},
    ];
    for (const state of cases) expect(endingEcho(state)).not.toContain('送信人');
    endingEcho(contact);
    expect(contact).toEqual(snapshot);
  });
});
