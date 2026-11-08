'use client';

import type { CSSProperties } from 'react';
import './ending-tableau.css';

export const SIX_ENDING_TABLEAUX = {
  no_smoke: { place: '家中 · 冷下去的灶', time: '现实 · 终幕 01', action: '冷灶旁有四只空碗。母亲、姐姐、努拉和幼弟相继死于饥饿，父亲不在家中。', fate: '等待没有换来援手。四个人的声音，在同一个房间里先后消失。' },
  sister_married: { place: '家门 · 姐姐离开的日子', time: '现实 · 终幕 02', action: '姐姐被带离家门。母亲、努拉与幼弟三个人围坐吃饭，姐姐的位置空着。', fate: '家人靠姐姐的婚事活下来；她离开了这张饭桌，也失去了决定自己生活的余地。' },
  conscripted: { place: '前线 · 没有返程的路', time: '现实 · 终幕 03', action: '努拉与莱拉被当作男孩征用，肩负物资，跟着武装队伍走向前线。', fate: '借来的男孩身份让她们走出家门，也让她们被带进战争。' },
  family_escape: { place: '露天货斗 · 封城之前', time: '现实 · 终幕 04', action: '努拉、母亲、姐姐与幼弟四人挤在露天木板货斗里离城。父亲仍被关押，莱拉去向不明。', fate: '你带三位家人离城，成为他们的依靠；父亲和莱拉留在身后的未知里。' },
  unwaking_spring: { place: '梦中 · 团聚的饭桌', time: '梦境 · 终幕 05', action: '梦里父亲回家，姐姐没有出嫁，亡兄阿里也与幼弟萨米一起围坐。现实中受伤的努拉没有醒来。', fate: '她把失去的人都带回故事；现实中，她始终没有醒来，家人的去向仍未知。' },
  guardian_future: { place: '多年以后 · 女性守护的山口', time: '原创未来 · 终幕 06', action: '成年的努拉指挥成年女性护卫队换哨。女孩们从她们身后走向学校，莱拉与伙伴一同守望。', fate: '从被救起的孩子，到与女性伙伴共同组织守护的成年人，她让更多女孩有机会长大。' },
} as const;

/** Each fate owns a complete composition; no standing cast is reused over it. */
export const ENDING_TABLEAUX = {
  reunited: {
    place: '月夜 · 约定的家门', time: '同一夜',
    action: '努拉俯身推着木手车，受伤的父亲卧在车上，完整的双腿和木腋拐都在。姐姐伸手接车，母亲与幼弟在门口迎接。',
    fate: '父亲获救，五人会合；离城的车已经错过。',
  },
  caravan: {
    place: '黎明 · 离城的货车', time: '封关前',
    action: '努拉扶着露天木板货斗的栏板，母亲护住幼弟，姐姐坐在一旁。舅舅驾驶货车离城，父亲没有在车上。',
    fate: '你与母亲、姐姐、幼弟离城；父亲仍被囚。',
  },
  lantern: {
    place: '山隘 · 她们带过的路', time: '几年后 · 原创延展',
    action: '成年努拉伏在高石阶旁，伸手拉一个女孩跨过岩坎。成年莱拉在上方接应、回望警戒，其他女孩弓身跟随。家人没有在山口等待。',
    fate: '母亲、姐姐、幼弟已离城；你与莱拉留下，长成引路人。父亲未获救。',
  },
  dream_guardian: {
    place: '成年童话 · 守护的山口', time: '她们续写的未来',
    action: '成年努拉伸掌指挥全女性卫队展开山口防线，女孩们从她们身后走向学校。孩子没有持械，守卫者都是成年女性。',
    fate: '现实：家人已离城，父亲未获救。童话：你成为全女性卫队首领。',
  },
  dream_commons: {
    place: '成年童话 · 自治的庭院', time: '她们续写的未来',
    action: '成年努拉让出议事席，听站起的女人发言。左边姐姐推开教室门，右边莱拉开起铺子，女孩们自由进出课堂。',
    fate: '现实：家人已离城，父亲仍被囚。童话：你们建起学校、市场与议事庭。',
  },
} as const;

export type TableauId = keyof typeof ENDING_TABLEAUX;

export function getEndingTableau(id: string | null) {
  if (id && Object.hasOwn(SIX_ENDING_TABLEAUX, id)) return SIX_ENDING_TABLEAUX[id as keyof typeof SIX_ENDING_TABLEAUX];
  return id && Object.hasOwn(ENDING_TABLEAUX, id) ? ENDING_TABLEAUX[id as TableauId] : null;
}

export default function EndingTableau({ endingId, reducedMotion }: { endingId: string; reducedMotion: boolean }) {
  const shot = getEndingTableau(endingId);
  if (!shot) return null;
  const isSix = Object.hasOwn(SIX_ENDING_TABLEAUX, endingId);
  const source = `/art/${isSix ? 'sister-v6' : 'sister-v4'}/end-${endingId}.webp`;
  return <figure className={`ending-tableau ending-tableau--${endingId}${isSix ? ' ending-tableau--six' : ''}${reducedMotion ? ' ending-tableau--still' : ''}`} data-ending-tableau={endingId} aria-label={`${shot.place}。${shot.action}`} style={isSix ? { '--scene-backdrop': `url("${source}")` } as CSSProperties : undefined}>
    <img key={endingId} className="ending-tableau-image" src={source} width={1672} height={941} alt={shot.action} fetchPriority="high" decoding="async" draggable={false}/>
    <div className="ending-tableau-shade" aria-hidden="true"/>
    <figcaption className="ending-tableau-time">{shot.time}</figcaption>
  </figure>;
}
