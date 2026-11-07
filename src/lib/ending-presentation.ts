import type { BranchState } from './branch-story';

/** Character growth is the payoff; ordinary acts are its remembered causes. */
export function endingGrowth(state: BranchState): string {
  switch (state.endingId) {
    case 'reunited': return '从牵住父亲的衣角，到握住带他回家的车把。';
    case 'caravan': return '从等别人决定去向，到选择自己的路，也承担离开的痛。';
    case 'dream_guardian': return '从躲开巡查的女孩，到守护女孩长大的女性首领。';
    case 'dream_commons': return '从被命令闭嘴的人，到愿意听见不同声音的建设者。';
    default: return '从把所有担子扛在身上，到学会共同承担，也接受照护。';
  }
}
export function endingEcho(state: BranchState): string {
  const has = (flag: string) => state.flags.includes(flag);
  const final = state.endingId;
  if (final?.startsWith('dream_')) return '成人梦境 · 女性决定这里的学习、经营与进入规则。';
  if (final === 'reunited') return has('pact') ? '留下的回话约定，让分开的家人终于找到同一扇门。' : '先前读信、教字的往来，让阿明在门边认出了你。';
  if (final === 'caravan') return '母亲没有丢下你；这次离开，也没有拿姐姐的婚事交换。';
  if (state.sister === 'apart') return '你们仍住在不同的门后，却开始让对方知道真实的难处。';
  if (has('sustained')) return '你被排进上课的一栏，不再只是给别人挣饭的人。';
  const last = state.history.at(-1);
  const legacyHandoff = last?.nodeId === 'n30' && last.choiceId === 'pages' && has('evidence') && has('courier');
  if (has('sent') || legacyHandoff) return '记录已交到送信人手中；还没有回音，日子仍要共同承担。';
  if (has('archive')) return '你们核对并保留记录，仍等可信的人带走；今天也要共同谋生。';
  if (has('evidence') && has('courier')) return '记录仍在手边，已有可信的递信联系；接下来仍需共同承担。';
  if (has('settled') || has('shelter')) return '这一夜，你终于放下水杯，让别人照顾你。';
  return '父亲还未归来。你开始承认：求助也是往前走。';
}
