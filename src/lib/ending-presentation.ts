import type { BranchState } from './branch-story';
import { getDreamEndingPresentation, getStayEndingPresentation } from './ending-content';
import { getDreamEndingPresentation as legacyDream, getStayEndingPresentation as legacyStay } from './legacy-ending-content';

/** Each fixed ending has a different life, not a title variant underneath a category. */
export function endingGrowth(state: BranchState): string {
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
  if (final === 'reunited') return '早先的姐妹联络与几次教字，分别保住了接应的门与愿意开侧门的人。';
  if (final === 'caravan') return '你选择按时上车，四个人离城；父亲和没有登车的莱拉没有被一句团圆补进画面。';
  return getStayEndingPresentation(state).echo;
}
