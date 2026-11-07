'use client';

import './ending-tableau.css';

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
  return id && Object.hasOwn(ENDING_TABLEAUX, id) ? ENDING_TABLEAUX[id as TableauId] : null;
}

export default function EndingTableau({ endingId, reducedMotion }: { endingId: string; reducedMotion: boolean }) {
  const shot = getEndingTableau(endingId);
  if (!shot) return null;
  return <figure className={`ending-tableau ending-tableau--${endingId}${reducedMotion ? ' ending-tableau--still' : ''}`} data-ending-tableau={endingId} aria-label={`${shot.place}。${shot.action}`}>
    <img key={endingId} className="ending-tableau-image" src={`/art/sister-v4/end-${endingId}.webp`} width={1672} height={941} alt={shot.action} fetchPriority="high" decoding="async" draggable={false}/>
    <div className="ending-tableau-shade" aria-hidden="true"/>
    <figcaption className="ending-tableau-time">{shot.time}</figcaption>
  </figure>;
}
