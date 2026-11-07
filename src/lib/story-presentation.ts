import { getEnding, getNode, SISTER_OFFSTAGE_NODES, type BranchState } from './branch-story';
import { getSceneDialogue, type SceneDialogueLine } from './scene-dialogue';

export type ReadingBeat = {
  id: string;
  kind: 'consequence' | 'narration' | 'dialogue' | 'memory' | 'ending' | 'tale';
  speaker: string;
  actor?: SceneDialogueLine['actor'];
  text: string;
};
export type CompanionStatus = {
  presence: 'present' | 'offstage' | 'apart'; label: string; speaker: string;
  injured: boolean; tone: 'warm' | 'guarded' | 'neutral';
};
export const MAX_SUBTITLE_CHARACTERS = 40;

/** A node id or step count alone cannot distinguish converging branches. */
export function storyPresentationKey(state: BranchState): string {
  const path = state.history.map(step => `${step.nodeId}:${step.choiceId}`).join('>');
  return `v${state.version}${state.edition === 'short' ? '-short' : ''}|${path}|${state.nodeId}|${state.endingId ?? 'open'}`;
}

/** Physical presence is separate from the long-term relationship stored by the engine. */
export function getCompanionStatus(state: Pick<BranchState, 'nodeId' | 'endingId' | 'sister'> & { stats: Pick<BranchState['stats'], 'trust'> }): CompanionStatus {
  const injured = state.sister === 'injured';
  const tone = state.stats.trust <= 3 ? 'guarded' : state.stats.trust >= 7 ? 'warm' : 'neutral';
  if (state.nodeId === 'n21' && !state.endingId) {
    return { presence: 'present', label: '镜头转向母亲与姐姐。努拉还没有回到这条街口。', speaker: '玛莉安', injured, tone };
  }
  if (['n23', 'n29'].includes(state.nodeId) && !state.endingId) {
    return { presence: 'present', label: state.nodeId === 'n29' ? '她仍在内院，你们正在商量分住或留下的约定。' : '你在女医师的后院找到了她，还有些话需要说清楚。', speaker: '玛莉安', injured, tone: state.sister === 'apart' ? 'guarded' : tone };
  }
  if (state.sister === 'apart') {
    return { presence: 'apart', label: '她此刻不在你身旁，你们留在不同的住处。', speaker: '她留下的话', injured, tone: 'guarded' };
  }
  if (SISTER_OFFSTAGE_NODES.has(state.nodeId)) {
    return { presence: 'offstage', label: injured ? '姐姐在遮挡的内院休息。' : '姐姐留在门内，这一幕没有与你一起出门。', speaker: '姐姐的叮嘱', injured, tone };
  }
  return { presence: 'present', speaker: '玛莉安', injured, tone,
    label: injured ? '姐姐坐下让脚踝休息，接下来的路需要放慢。' : tone === 'guarded' ? '她就在身旁，有些话还没有说出口。' : tone === 'warm' ? '你们愿意把实话交给彼此。' : '你们仍在学习怎样一起决定。' };
}

export function getHeroDisplayName(state: BranchState): string {
  if (state.endingId?.startsWith('dream_')) return '成年的阿提什';
  const publicScene = ['market', 'checkpoint', 'prison', 'road'].includes(getNode(state).scene);
  return publicScene && state.flags.includes('aliasAatish') ? '阿提什' : '努拉';
}

/** The full authored tales remain in the journal. These are performed interludes. */
function taleDialogue(state: BranchState): string[] {
  const has = (flag: string) => state.flags.includes(flag);
  switch (state.nodeId) {
    case 'n05': return ['从前，有个旅人把自己的名字弄丢了。', '一粒火苗说：你先把手拢好，我陪你找。', '弟弟问：火苗这么小，也能活过黑夜吗？'];
    case 'n07': return has('brotherStory')
      ? ['旅人走到石门前，火苗已经快熄了。', '另一粒火赶来：把我的这一半也带上。', '莱拉说：这一次，让她们一起找路。']
      : ['石门不认识旅人，只肯放有名字的人过。', '另一粒火说：我叫火焰，你也可以选名字。'];
    case 'n20': return ['守门人伸出手，掌心里也落满了灰。', '旅人没有推开石门，先替他读完了一封信。', '火苗照着两个名字，谁也没有许下必胜。'];
    case 'n25': return has('storyShared')
      ? ['石门后传来脚步，两粒火都屏住了呼吸。', '“别替我把结局写完。”旅人对同伴说。', '她们留了一点光，给还没走到门边的人。']
      : ['石门震动起来，火苗缩进旅人的掌心。', '她没有命令黑夜退开，只把光护得更紧。'];
    case 'n30': return ['旅人终于记起：名字也可以自己来选。', '火苗问：以后，你想守住怎样的地方？', '她还没有回答。那座没有锁的城，先在梦里亮了。'];
    default: return [];
  }
}

function endingDialogue(state: BranchState): string[] {
  const id = state.endingId;
  const fatherHome = state.father === 'free';
  if (id === 'dream_guardian') return ['梦里，我已经长大。她们选我守住这片土地。', '这里的女性可以上学、经商，也可以说不。', '谁能进入，由我们共同决定。天亮后，我仍记得。'];
  if (id === 'dream_commons') return ['梦里，姐姐开了学校，莱拉开了铺子。', '我们在议事庭里争论，谁都能把话说完。', '没有锁的明天，还要从今天这粒火开始。'];
  if (id === 'reunited') return ['“五个。”母亲把我们数了一遍，才肯坐下。', '父亲靠在门边。萨米伸手，却又怕碰疼他。', '先找水，让家人躺下。明天的路，明天一起想。'];
  if (id === 'caravan') return ['车帘放下。母亲又数了一遍三个孩子。', '舅舅按说好的地址走。父亲的消息还没有回来。'];
  if (id === 'lantern') return ['门外的声音过去了，姐姐重新拿起粉笔。', '莱拉也要一张纸。今天，我们轮流添灯油。'];
  if (id === 'separated') return ['“到了就托人报平安。”姐姐把红线分成两段。', '今夜我们住在不同的门后，仍知道彼此在哪里。'];
  if (id === 'shelter') return ['法里达说，这间屋子今晚留给你们。', '我把水放在家人手边，先不催任何人赶路。'];
  if (id === 'witness') return ['我核对名字，把得到同意的话写进信。', fatherHome ? '父亲已经回来，还有许多人的消息没有回来。' : '父亲还没回来。这些字会先走过城墙。'];
  if (id === 'letters') return ['今天住在哪里，下一次托谁回话，我都写清了。', fatherHome ? '父亲就在屋里。明天的饭与药，也要继续找。' : '有些地方仍空着。我没有替未知的事编答案。'];
  return ['萨米问父亲什么时候回来。我说，还不知道。', '先把今天的饼分好。明天，再去问一次。'];
}

/** Main view performs 2–4 dialogue rounds, then choices. Long prose stays in the journal. */
export function buildReadingBeats(state: BranchState, _consequence = ''): ReadingBeat[] {
  const key = storyPresentationKey(state);
  if (getEnding(state)) return endingDialogue(state).map((text, index) => ({
    id: `${key}|ending:${index}`, kind: 'ending', speaker: state.endingId?.startsWith('dream_') ? '梦里的阿提什' : '努拉', actor: 'narrator', text,
  }));
  if (state.edition === 'short' && state.nodeId === 'n06') return [
    { speaker: '努拉', actor: 'hero' as const, text: '母亲去要求放人，没说完就挨了打。我去买饼，钱被推回。' },
    { speaker: '玛莉安', actor: 'sister' as const, text: '这不是你的错。阿里的旧衣服还在。出门借他的衣服，回家你仍是努拉。' },
  ].map((line, index) => ({ ...line, id: `${key}|bridge:${index}`, kind: 'dialogue' as const }));
  const beats: ReadingBeat[] = getSceneDialogue(state).map((line, index) => ({...line, id: `${key}|dialogue:${index}`, kind: 'dialogue'}));
  taleDialogue(state).forEach((text, index) => beats.push({id:`${key}|tale:${index}`,kind:'tale',speaker:state.nodeId==='n05'?'讲给萨米的故事':'你们续写的童话',actor:'narrator',text}));
  return beats;
}
