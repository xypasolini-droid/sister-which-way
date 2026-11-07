import type { BranchState } from './branch-story';
import { getDreamEndingPresentation, getStayEndingPresentation } from './ending-content';

/** Character growth is the payoff; ordinary acts are its remembered causes. */
export function endingGrowth(state: BranchState): string {
  switch (state.endingId) {
    case 'reunited': return '从牵住父亲的衣角，到握住带他回家的车把。';
    case 'caravan': return '从等别人决定去向，到选择自己的路，也承担离开的痛。';
    case 'dream_guardian': return '从躲开巡查的女孩，到守护女孩长大的女性首领。';
    case 'dream_commons': return '从被命令闭嘴的人，到愿意听见不同声音的建设者。';
    default: return getStayEndingPresentation(state).growth;
  }
}
export function endingEcho(state: BranchState): string {
  const has = (flag: string) => state.flags.includes(flag);
  const final = state.endingId;
  if (final?.startsWith('dream_')) return getDreamEndingPresentation(state).echo;
  if (final === 'reunited') return has('pact') ? '留下的回话约定，让分开的家人终于找到同一扇门。' : '先前读信、教字的往来，让阿明在门边认出了你。';
  if (final === 'caravan') return '母亲没有丢下你；这次离开，也没有拿姐姐的婚事交换。';
  const moment = getStayEndingPresentation(state);
  if (['classroom', 'apart'].includes(moment.kind)) return moment.echo;
  const last = state.history.at(-1);
  const legacyHandoff = last?.nodeId === 'n30' && last.choiceId === 'pages' && has('evidence') && has('courier');
  const rescueEcho = moment.kind === 'rescue_failed' ? `${moment.echo} ` : '';
  if (has('sent') || legacyHandoff) return `${rescueEcho}记录已交到送信人手中；还没有回音，日子仍要共同承担。`;
  if (has('archive')) return `${rescueEcho}你们核对并保留记录，仍等可信的人带走；今天也要共同谋生。`;
  if (has('evidence') && has('courier')) return `${rescueEcho}记录仍在手边，已有可信的递信联系；接下来仍需共同承担。`;
  return moment.echo;
}
