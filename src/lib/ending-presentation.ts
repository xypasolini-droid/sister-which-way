import { getEnding, type BranchState } from './branch-story';
import { getDreamEndingPresentation, getStayEndingPresentation } from './revision-five-ending-content';
import { getDreamEndingPresentation as legacyDream, getStayEndingPresentation as legacyStay } from './legacy-ending-content';

/** Each fixed ending has a different life, not a title variant underneath a category. */
export function endingGrowth(state: BranchState): string {
  if (state.storyRevision === 7) return getEnding(state)?.summary ?? '';
  if (state.storyRevision === 6) return ({
    no_smoke: '她想守住姐姐，封锁生活的禁令却让一家人的未来停在了饥饿之中。',
    sister_married: '从依靠姐姐的孩子，成长为记得自己的生存由谁付出代价的人。',
    conscripted: '为养家借来的男孩身份，把她与莱拉推上了无法选择的战场。',
    family_escape: '从把饼带回家的孩子，到在封路之前带母亲、姐姐和幼弟离城的人。',
    unwaking_spring: '她在梦中完成少年的旅程，现实中的成长却永远停在未醒的那一天。',
    guardian_future: '从独自养家的孩子，到与其他女性共同守护生活的成年护卫队长。',
  } as Record<string, string>)[state.endingId ?? ''] ?? '';
  if (state.storyRevision !== 5) return '旧版结局记录：保留当时的经历；新故事需要重新开始。';
  switch (state.endingId) {
    case 'reunited': return '从牵住父亲的衣角，到推起木车把他带回家人身旁。';
    case 'caravan': return '从等别人决定去向，到与家人离城，承担父亲仍被留下的痛。';
    case 'dream_guardian': return '成年童话：从被迫退开的女孩，到守住山口的全女性卫队首领。';
    case 'dream_commons': return '成年童话：从替人读名字，到与女人们建设学校、市场和共同议事的地方。';
    default: return getStayEndingPresentation(state).growth;
  }
}
export function endingEcho(state: BranchState): string {
  if (state.storyRevision === 7) return state.endingId ? state.history.at(-1)?.consequence ?? '' : '';
  if (state.storyRevision === 6) return ({
    no_smoke: '放下剪刀后求援失败；你们拒绝婚事，援助始终没有到来。',
    sister_married: '放下剪刀后求援失败；家人的恳求使姐姐在生存压力下离开家门。',
    conscripted: '你拉住莱拉的手挤向城门，却被当作男孩一同征用。',
    family_escape: '战乱中先赶回家，让四个人赶在封锁之前登上露天货车。',
    unwaking_spring: '回头找莱拉使你受伤昏迷；你最终跟随梦中家人的声音，没有醒来。',
    guardian_future: '回头找莱拉使你受伤昏迷；回应她的呼唤，才有了获救、逃离与多年共同成长。',
  } as Record<string, string>)[state.endingId ?? ''] ?? '';
  const has = (flag: string) => state.flags.includes(flag);
  const final = state.endingId;
  if (state.storyRevision !== 5) {
    if (final?.startsWith('dream_')) return `旧版记录：${legacyDream(state).echo}`;
    if (final === 'reunited') return has('pact') ? '旧版记录：留下的回话约定，让分开的家人找到同一扇门。' : '旧版记录：先前读信、教字的往来，让阿明在门边认出了你。';
    if (final === 'caravan') return '旧版记录：母亲没有丢下你，这次离开没有拿姐姐的婚事交换。';
    const moment = legacyStay(state);
    const last = state.history.at(-1);
    if (has('sent') || (last?.nodeId === 'n30' && last.choiceId === 'pages' && has('evidence') && has('courier'))) return '旧版记录：记录已交到送信人手中；还没有回音，日子仍要共同承担。';
    if (has('archive')) return '旧版记录：你们核对并保留记录，仍等可信的人带走。';
    if (has('evidence') && has('courier')) return '旧版记录：记录仍在手边，已有可信的递信联系。';
    return `旧版记录：${moment.echo}`;
  }
  if (final?.startsWith('dream_')) return getDreamEndingPresentation(state).echo;
  if (final === 'reunited') return '和姐姐约接应、花几天读信教字，再留在侧门等人；你为救父放下日工和离城车，家人也承担了等待。';
  if (final === 'caravan') return '你选择按时上车，四个人离城；父亲和没有登车的莱拉没有被一句团圆补进画面。';
  return getStayEndingPresentation(state).echo;
}
