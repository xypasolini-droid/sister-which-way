import { describe, expect, it } from 'vitest';
import { ACT_TITLES, REVISION_FIVE_ENDINGS as ENDINGS, LEGACY_NODES as NODES, NODE_COUNT, choose, createInitialState, getChoices, getEnding, getNode, interpretChoice, validateBranchState, type BranchState } from './branch-story';
import { ENDING_TEST_ROUTES, LEGACY_ENDING_TEST_ROUTES, NODE_TEST_ROUTES, REALITY_VARIANT_TEST_ROUTES } from './story-test-routes';

function walk(route: string[], seen = new Set<string>()) {
  let state = createInitialState();
  seen.add(state.nodeId);
  for (const id of route) {
    const action = getChoices(state).find(choice => choice.id === id);
    expect(action?.enabled, `${id} at ${state.nodeId}: ${action?.reason}`).toBe(true);
    const result = choose(state, id);
    expect(result).not.toBeNull();
    state = result!.state;
    seen.add(state.nodeId);
    for (const value of Object.values(state.stats)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
    expect(state.endingId || getChoices(state).some(choice => choice.enabled)).toBeTruthy();
  }
  return state;
}

/** These old terminal actions changed no physical facts; reconstruct only their historical final page. */
function legacySnapshot(before:BranchState,choiceId:string,endingId:string):BranchState {
  const choice=getNode(before).choices.find(item=>item.id===choiceId)!;
  const actual=choose(before,choiceId.startsWith('dream_')?choiceId:'live')!.state;
  return {...actual,endingId,history:[...before.history,{nodeId:'n30',choiceId,label:choice.label,consequence:choice.consequence}]};
}

describe('姐姐，我该怎么走：v3 branch story', () => {
  it('has 30 scenes, three reality endings and two explicit dreams', () => {
    expect(Object.keys(NODES)).toHaveLength(NODE_COUNT);
    expect(NODE_COUNT).toBe(30);
    expect(ENDINGS).toHaveLength(5);
    expect(ENDINGS.map(ending => ending.id).sort()).toEqual(['reunited','caravan','lantern','dream_guardian','dream_commons'].sort());
    expect(ENDINGS.filter(ending => ending.dream)).toHaveLength(2);
    for (const node of Object.values(NODES)) {
      expect(node.paragraphs.length).toBeGreaterThanOrEqual(2);
      expect(node.tale.length).toBeGreaterThan(20);
      expect(node.act).toBeGreaterThanOrEqual(1);
      expect(node.act).toBeLessThanOrEqual(ACT_TITLES.length);
      expect(node.choices.length).toBeGreaterThanOrEqual(2);
      expect(node.choices.length).toBeLessThanOrEqual(node.id === 'n30' ? 5 : 3);
      expect(new Set(node.choices.map(choice => choice.id)).size).toBe(node.choices.length);
      for (const choice of node.choices) expect(NODES[choice.next]).toBeDefined();
    }
  });
  for (const [endingId, route] of Object.entries(ENDING_TEST_ROUTES)) {
    it(`reaches ${endingId} by legal actions and restores it from history`, () => {
      const state = walk(route);
      expect(state.endingId).toBe(endingId);
      expect(getEnding(state)?.id).toBe(endingId);
      expect(validateBranchState(state)).toEqual(state);
      expect(choose(state, 'live')).toBeNull();
      expect(getChoices(state).every(choice => !choice.enabled)).toBe(true);
    });
  }
  it('reaches all 30 scenes with actual resources and prerequisites', () => {
    const seen = new Set<string>();
    for (const [nodeId, route] of Object.entries(NODE_TEST_ROUTES)) {
      const state = walk(route, seen);
      expect(state.nodeId).toBe(nodeId);
      expect(state.endingId).toBeNull();
      expect(validateBranchState(state)).toEqual(state);
    }
    expect([...seen].sort()).toEqual(Object.keys(NODES).sort());
  });
  it('changes clothing and family state without mutating earlier frames', () => {
    const before = walk(NODE_TEST_ROUTES.n06);
    const copy = structuredClone(before);
    const disguised = choose(before, 'buy')!.state;
    expect(disguised.outfit).toBe('worker');
    expect(disguised.flags).toContain('disguise');
    expect(before).toEqual(copy);
    expect(before.outfit).toBe('cloak');
    const named = choose(disguised, 'truth')!.state;
    expect(named.flags).toContain('aliasAatish');
    expect(named.flags).toContain('friendMet');
    expect(disguised.flags).not.toContain('aliasAatish');
    const injured = walk(NODE_TEST_ROUTES.n24);
    expect(injured.sister).toBe('injured');
    expect(injured.flags).toContain('sisterHurt');
    expect(injured.flags).toContain('motherHurt');
    expect(walk(ENDING_TEST_ROUTES.reunited).father).toBe('free');
    expect(walk(REALITY_VARIANT_TEST_ROUTES.separated).sister).toBe('apart');
  });
  it('requires the guard relationship for rescue and retains a fallback', () => {
    const before = walk(ENDING_TEST_ROUTES.reunited.slice(0, -2));
    expect(before.nodeId).toBe('n25');
    expect(getChoices(before).find(choice => choice.id === 'release')?.enabled).toBe(true);
    const unknownGuard = { ...before, flags: before.flags.filter(flag => flag !== 'guardBond') };
    expect(getChoices(unknownGuard).find(choice => choice.id === 'release')?.enabled).toBe(false);
    expect(choose(unknownGuard, 'release')).toBeNull();
    expect(getChoices(unknownGuard).some(choice => choice.enabled)).toBe(true);
    const exposed = { ...before, stats: { ...before.stats, exposure: 9 } };
    expect(getChoices(exposed).find(choice => choice.id === 'release')?.enabled).toBe(false);
    expect(getChoices(exposed).find(choice => choice.id === 'letter')?.enabled).toBe(true);
  });

  it.each(['n09', 'n12', 'n17', 'n25'])('keeps Hala’s identity in the journal when the first reading happens at %s', nodeId => {
    const state: BranchState = { ...createInitialState(), nodeId, father: 'located', outfit: 'worker', flags: ['disguise'] };
    const text = getNode(state).paragraphs.join('');
    expect(text).toContain('妻子');
    expect(text).toContain('哈拉');
    expect(text).not.toMatch(/亲人死|读完亲人的消息/);
  });

  it('remembers every first meeting at n12 without making a delivered petition equal to trust', () => {
    const firstMeeting = walk(NODE_TEST_ROUTES.n12);
    expect(firstMeeting.flags).not.toContain('guardKnown');
    expect(firstMeeting.flags).not.toContain('guardBond');
    for (const choiceId of ['petition', 'forms', 'wait']) {
      const after = choose(firstMeeting, choiceId)!.state;
      expect(after.flags, choiceId).toContain('guardKnown');
      expect(after.flags, choiceId).not.toContain('guardBond');
      expect(validateBranchState(after), choiceId).toEqual(after);
    }
    const nextMeeting = choose(firstMeeting, 'petition')!.state;
    expect(nextMeeting.nodeId).toBe('n17');
    for (const choiceId of ['copy', 'family']) {
      const after = choose(nextMeeting, choiceId)!.state;
      expect(after.flags).toContain('guardKnown');
      expect(after.flags).toContain('guardBond');
    }
  });

  it('returns Amin’s personal letter on all n09 paths and carries separate family information', () => {
    const state = walk(NODE_TEST_ROUTES.n09);
    const scene = getNode(state);
    for (const choice of getChoices(state)) {
      const result = choose(state, choice.id)!;
      const text = `${choice.label}${choice.detail}${result.consequence}`;
      expect(text, choice.id).not.toMatch(/带着信去拘留|把信带回家|带信回家/);
      expect(`${scene.paragraphs.join('')}${result.consequence}`, choice.id).toMatch(/(?:信|来信).{0,12}(?:还给|交还|递还|归还)|(?:还给|交还|递还|归还).{0,12}阿明|(?:他|阿明)把信.{0,12}(?:收好|收起|收回)/);
      expect(result.state.flags).toContain('guardKnown');
    }
  });

  it('does not invent an earlier reading relationship when n20 is the first personal contact', () => {
    const unknown = walk([...NODE_TEST_ROUTES.n14, 'teach', 'plan', 'rescue']);
    expect(unknown.nodeId).toBe('n20');
    expect(unknown.flags).not.toContain('guardKnown');
    expect(unknown.flags).not.toContain('guardBond');
    const firstChoice = getChoices(unknown).find(choice => choice.id === 'submit')!;
    expect(`${firstChoice.label}${firstChoice.detail}`).not.toMatch(/再写|认得|熟悉|往来让/);
    const firstReading = choose(unknown, 'submit')!;
    expect(firstReading.consequence).toContain('哈拉');
    expect(firstReading.consequence).toContain('妻子');

    const known = walk([...NODE_TEST_ROUTES.n09, 'verify', 'forms', 'route', 'plan', 'rescue']);
    expect(known.nodeId).toBe('n20');
    expect(known.flags).toContain('guardKnown');
    expect(known.flags).not.toContain('guardBond');
    const remembered = choose(known, 'submit')!;
    expect(remembered.consequence).not.toMatch(/初次|第一次见|我叫阿明|死于|死在|去世|触雷|地雷/);
    expect(remembered.state.flags).toContain('guardBond');
  });

  it('does not narrate a promised rescue in the unbonded n25 journal or tale', () => {
    const state = walk(NODE_TEST_ROUTES.n25);
    expect(state.flags).not.toContain('guardBond');
    const node = getNode(state);
    expect(node.paragraphs.join('')).not.toMatch(/现在他愿意冒险去找父亲|已经答应.{0,8}(?:救|带出)/);
    expect(node.tale).not.toMatch(/决定(?:走进|进去)|答应.{0,8}救出/);
    expect(getChoices(state).find(choice => choice.id === 'release')?.enabled).toBe(false);
  });
  it('requires confirmed family escort as well as documents before boarding', () => {
    const before = walk(ENDING_TEST_ROUTES.caravan.slice(0, -2));
    expect(before.nodeId).toBe('n26');
    expect(getChoices(before).find(choice => choice.id === 'board')?.enabled).toBe(true);
    for (const prerequisite of ['documents', 'escortConfirmed']) {
      const unavailable = { ...before, flags: before.flags.filter(flag => flag !== prerequisite) };
      expect(getChoices(unavailable).find(choice => choice.id === 'board')?.enabled).toBe(false);
      expect(choose(unavailable, 'board')).toBeNull();
      expect(getChoices(unavailable).find(choice => choice.id === 'shelter')?.enabled).toBe(true);
    }
  });
  it('does not invent actions or treat questions and negations as decisions', () => {
    const state = createInitialState();
    expect(interpretChoice(state, '扶父亲收摊，先离开').choiceId).toBe('work');
    expect(interpretChoice(state, '2').choiceId).toBe('neighbor');
    expect(interpretChoice(state, '请熟客留下见证').choiceId).toBe('neighbor');
    for (const words of ['我不想收摊', '姐姐，我该怎么走？', '变出宇宙飞船', '如果收摊就好了']) expect(interpretChoice(state, words).choiceId).toBeNull();
    expect(state.history).toHaveLength(0);
  });
  it('replays saves and rejects invented counters, destinations and extra decisions', () => {
    const state = walk(ENDING_TEST_ROUTES.caravan);
    expect(validateBranchState({ ...state, stats: { ...state.stats, coins: 99 } })).toBeNull();
    expect(validateBranchState({ ...state, father: 'free' })).toBeNull();
    expect(validateBranchState({ ...state, endingId: 'reunited' })).toBeNull();
    expect(validateBranchState({ ...state, history: [...state.history, { nodeId: 'n30', choiceId: 'live' }] })).toBeNull();
    expect(validateBranchState(null)).toBeNull();
    expect(validateBranchState({ ...state, history: state.history.map(entry => ({ ...entry, consequence: '<script>fake</script>' })) })?.history).toEqual(state.history);
  });
  it('finishes the actual result without offering a second writing or waiting classification', () => {
    const state = walk(ENDING_TEST_ROUTES.reunited.slice(0, -1));
    expect(state.father).toBe('free');
    expect(getChoices(state).map(choice=>choice.id)).toEqual(['live','dream_guardian','dream_commons']);
    expect(choose(state, 'wait')).toBeNull();
    expect(choose(state, 'pages')).toBeNull();
    const result=choose(state,'live')!.state;
    expect(result.endingId).toBe('reunited');
    expect(result.father).toBe('free');
    expect(getEnding(result)?.paragraphs.join('')).toContain('木推车');
  });
  it('keeps absent sisters absent and boarded families on the road', () => {
    const apart = walk(REALITY_VARIANT_TEST_ROUTES.separated.slice(0, -1));
    expect(getNode(apart).sisterLine).toContain('留下的话');
    const separated=choose(apart,'live')!.state;
    expect(separated.endingId).toBe('lantern');
    expect(getEnding(separated)?.scene).toBe('workshop');
    expect(getEnding(separated)?.paragraphs.join('')).toContain('作坊');
    const boarded = walk(ENDING_TEST_ROUTES.caravan.slice(0, -1));
    const ending=getEnding(choose(boarded,'live')!.state)!;
    expect(ending.id).toBe('caravan');
    expect(ending.scene).toBe('road');
    expect(ending.paragraphs.join('')).toContain('露天');
  });
  it('retains five former reality routes as distinct stay-in-city situations',()=>{
    for(const route of Object.values(REALITY_VARIANT_TEST_ROUTES)){
      const state=walk(route);
      expect(state.endingId).toBe('lantern');
      expect(state.father).not.toBe('free');
      expect(state.flags).not.toContain('boarded');
      expect(validateBranchState(state)).toEqual(state);
    }
  });
  it('migrates authentic old final pages to the five current outcomes without changing their facts',()=>{
    for(const [oldId,route] of Object.entries(LEGACY_ENDING_TEST_ROUTES)){
      const before=walk(route.slice(0,-1)),choiceId=route.at(-1)!;
      const old=legacySnapshot(before,choiceId,oldId),migrated=validateBranchState(old);
      expect(migrated,oldId).not.toBeNull();
      const expected=['reunited','caravan','dream_guardian','dream_commons'].includes(oldId)?oldId:'lantern';
      expect(migrated!.endingId).toBe(expected);
      for(const key of ['nodeId','stats','flags','outfit','scarf','sister','father'] as const)expect(migrated![key],`${oldId}/${key}`).toEqual(old[key]);
      expect(migrated!.history.map(({nodeId,choiceId})=>({nodeId,choiceId}))).toEqual(old.history.map(({nodeId,choiceId})=>({nodeId,choiceId})));
    }
  });
  it('preserves rescue and departure when replaying their former writing and waiting codas',()=>{
    const rescued=walk(ENDING_TEST_ROUTES.reunited.slice(0,-1));
    const pageId=(state:BranchState)=>state.flags.includes('evidence')&&state.flags.includes('courier')?'witness':'letters';
    const rescueSave=legacySnapshot(rescued,'pages',pageId(rescued));
    expect(validateBranchState(rescueSave)).toMatchObject({endingId:'reunited',father:'free'});
    expect(validateBranchState(legacySnapshot(rescued,'wait','waiting'))).toBeNull();
    const boarded=walk(ENDING_TEST_ROUTES.caravan.slice(0,-1));
    for(const [choiceId,oldId] of [['wait','waiting'],['pages',pageId(boarded)]]){
      const migrated=validateBranchState(legacySnapshot(boarded,choiceId,oldId))!;
      expect(migrated.endingId).toBe('caravan');
      expect(migrated.flags).toContain('boarded');
      expect(getEnding(migrated)?.scene).toBe('road');
    }
  });
  it('does not use old ending migration to accept a false final classification or invented resources',()=>{
    for(const oldId of ['waiting','letters']){
      const route=LEGACY_ENDING_TEST_ROUTES[oldId],before=walk(route.slice(0,-1));
      const old=legacySnapshot(before,route.at(-1)!,oldId);
      expect(validateBranchState(old)?.endingId).toBe('lantern');
      for(const wrongId of ['reunited','caravan','dream_guardian','dream_commons',oldId==='waiting'?'letters':'waiting'])expect(validateBranchState({...old,endingId:wrongId}),`${oldId} forged ${wrongId}`).toBeNull();
      expect(validateBranchState({...old,stats:{...old.stats,coins:old.stats.coins+1}})).toBeNull();
      expect(validateBranchState({...old,father:'free'})).toBeNull();
    }
  });
});
export { ENDING_TEST_ROUTES };
