'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { BookOpen, Footprints, ShieldAlert } from 'lucide-react';
import { selectNarrativeStage } from '../lib/narrative-stage-state';
import type { DramaShot } from '../lib/oppression-scenes';
import './narrative-stage.css';

export type NarrativeScene = 'home' | 'market' | 'workshop' | 'courtyard' | 'clinic' | 'checkpoint' | 'prison' | 'road';
export type NarrativeStageProps = {
  scene: NarrativeScene;
  outfit: 'cloak' | 'worker' | 'travel';
  sister: 'beside' | 'apart' | 'injured';
  father: 'missing' | 'located' | 'free';
  stats: { food: number; coins: number; trust: number; hope: number; exposure: number; health: number };
  flags: string[];
  nodeId: string;
  storyRevision?: 5;
  actionLabel?: string;
  reducedMotion: boolean;
  ending?: string | null;
  day?: number;
  scarf?: 'worn' | 'shared' | 'lost';
  immersive?: boolean;
  beatIndex?: number;
  phase?: 'reading' | 'choice' | 'compose' | 'explore' | 'intro' | 'ending' | 'cinematic';
  dramaShot?: DramaShot;
};

const SCENES: Record<NarrativeScene, { name: string; detail: string; hero: number; sister: number; hue: string }> = {
  home: { name: '土墙里的家', detail: '墙角的被褥旁，还留着父亲的位置。', hero: 47, sister: 65, hue: '#795443' },
  market: { name: '石榴街集市', detail: '人群和摊位之间，每一枚钱都有去处。', hero: 42, sister: 63, hue: '#947451' },
  workshop: { name: '针线铺', detail: '剪刀落下去，衣服和身份一起改变。', hero: 49, sister: 68, hue: '#65796f' },
  courtyard: { name: '石榴树庭院', detail: '高墙里面，邻居为彼此留着一盏灯。', hero: 44, sister: 63, hue: '#637159' },
  clinic: { name: '小巷诊所', detail: '这里先问哪里不舒服，再问你叫什么。', hero: 43, sister: 61, hue: '#698b85' },
  checkpoint: { name: '城南检查点', detail: '路障两边，是两种不同的明天。', hero: 38, sister: 56, hue: '#8d7461' },
  prison: { name: '拘留所外院', detail: '你寻找的声音，隔着一扇铁门。', hero: 40, sister: 58, hue: '#756d70' },
  road: { name: '翻山的公路', detail: '城逐渐变小，同行的人却更加清楚。', hero: 44, sister: 62, hue: '#8c8d79' },
};

function FigureImage({ src, fallback, className, onLoad }: { src: string; fallback?: string; className?: string; onLoad?: () => void }) {
  const [failed, setFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);
  useEffect(() => { setFailed(false); setFallbackFailed(false); }, [src]);
  return <img
    src={failed && fallback ? fallback : src}
    alt=""
    draggable={false}
    className={className}
    decoding="async"
    style={fallbackFailed || (failed && !fallback) ? { visibility: 'hidden' } : undefined}
    onLoad={onLoad}
    onError={() => { if (failed) setFallbackFailed(true); else setFailed(true); }}
  />;
}

export function describeNarrativeChange(previous: NarrativeStageProps | null, next: NarrativeStageProps) {
  if (next.dramaShot) return next.dramaShot.caption;
  const nextCast = selectNarrativeStage(next);
  if (nextCast.arrest) return nextCast.arrest.caption;
  if (nextCast.isDream) return '在这个明确的梦里，成年的阿提什守护着女性自治之地。';
  if (nextCast.womenInVehicle) return '努拉与母亲、姐姐、弟弟坐在露天后斗。她们选择了离城的路，也没有忘记仍未归来的父亲。';
  if (next.nodeId === 'n01') return '清晨，努拉坐在父亲的摊边，听他替客人读信。';
  if (previous?.nodeId === 'n02' && next.nodeId === 'n06') return '母亲寻父受伤，努拉买饼被拒后回家。姐姐打开亡兄的衣箱，家人需要新的办法。';
  if (next.nodeId === 'n03') return '母亲带努拉来到监所附近。姐姐与萨米留在家里，街上的拦阻让这段路无法顺利走完。';
  if (next.nodeId === 'n04') return '努拉独自来到市场找食物。母亲回家养伤，姐姐与萨米留在门内。';
  if (next.storyRevision === 5 && next.nodeId === 'n21') return '努拉已和家人在亲舅舅的货车旁会合。莱拉被堵在街巷，封关正在逼近。';
  if (next.storyRevision === 5 && next.nodeId === 'n22') return '家人的车已离开。努拉与莱拉留在侧门前，受困女孩需要她们接应。';
  if (next.nodeId === 'n21') return '这一幕转向母亲：努拉尚未回来，她拒绝让贾维德替全家决定。';
  const restoredLaterScene = previous?.nodeId === 'n01' && next.nodeId !== 'n02';
  if (!previous || restoredLaterScene) return `努拉穿着${nextCast.heroDescription}，停在${nextCast.locationName ?? SCENES[next.scene].name}。${nextCast.companion.label}`;
  const previousCast = selectNarrativeStage(previous);
  if (previousCast.showSister && nextCast.companion.presence === 'apart') return '姐姐转身离开。原本并肩的位置，空了下来。';
  if (!previousCast.showSister && nextCast.showSister) return '姐姐重新出现在你面前。你们还有话没有说完。';
  if (nextCast.showSister && previous.sister !== 'injured' && next.sister === 'injured') return '姐姐靠着你坐下来。接下来的路，需要放慢一些。';
  if (nextCast.showSister && previous.sister === 'injured' && next.sister === 'beside') return nextCast.sisterInjured || nextCast.sisterRecovering ? '姐姐仍护着受伤的脚踝，等你把手伸过去。' : '姐姐重新站起，试着把重量放回自己的双脚。';
  if (previous.father !== 'free' && next.father === 'free') return '阿明把衰弱的父亲带了出来。他靠在木推车上，终于回到你们身边。';
  if (previous.outfit !== next.outfit) return next.outfit === 'worker'
    ? '绿色头巾被收进行囊，努拉换上灰白长衫与宽裤。出门的人还是她。'
    : next.outfit === 'travel' ? next.flags.includes('disguise')
      ? '努拉仍留着短发，穿好灰白长衫与宽裤，再背起远行的布行囊。'
      : '努拉把绿色头巾掖好，在长衫外背起布行囊。她没有把自己的名字留在这里。'
      : '努拉重新戴好绿色头巾，抬头看向眼前的路。';
  const newItems = next.flags.filter(flag => !previous.flags.includes(flag));
  if (newItems.includes('medicine')) return '一包药被放在行囊旁，留给需要照顾的家人。';
  if (nextCast.showBread && (newItems.includes('bread') || next.stats.food > previous.stats.food)) return '新得的馕饼被放进布袋，今后的口粮又多了一份。';
  if (next.stats.food > previous.stats.food) return '家里的口粮又添了一份。';
  if (newItems.includes('letter')) return '折好的信藏在衣襟边，写着你们不愿失去的名字。';
  if (newItems.includes('documents')) return '你把地址与旧纸摊开，小心抚平每一道折痕。';
  if (newItems.includes('lantern')) return '庭院里的灯亮了。今晚，又有人愿意为你们留门。';
  if (newItems.includes('school')) return '故事册摊在膝前，空着的庭院有了读书声。';
  if (nextCast.showSister && previous.stats.trust > next.stats.trust) return '姐姐慢下脚步。你们之间，多出了一段没有说话的距离。';
  if (nextCast.showSister && previous.stats.trust < next.stats.trust) return '姐姐靠近了一点。这一次，你们先听完了彼此的话。';
  if (next.stats.health < previous.stats.health) return '这一程让家人更加疲惫。食物、治疗和休息，都变得更要紧。';
  if (next.stats.health > previous.stats.health) return '家人的身体缓和了一些。你们终于能够稍稍松一口气。';
  if (previous.scene !== next.scene) return next.scene === 'road' ? '你们离开熟悉的街口，走向山的另一面。' : `脚步停在${SCENES[next.scene].name}。下一件事，已经在这里等你。`;
  return next.actionLabel ? `你作出了决定：${next.actionLabel}` : SCENES[next.scene].detail;
}

export default function NarrativeStage(props: NarrativeStageProps) {
  const { scene, outfit, sister, father, stats, flags, nodeId, reducedMotion, ending, day = 1, scarf = 'worn', immersive = false } = props;
  const staging = selectNarrativeStage(props);
  const drama = staging.drama;
  const backgroundSrc = staging.assets.background;
  const worldRef = useRef<HTMLDivElement>(null);
  const previousArrestStep = useRef<number | null>(null);
  const previous = useRef<NarrativeStageProps | null>(null);
  const [beat, setBeat] = useState('清晨，努拉坐在父亲的摊边，听他替客人读信。');
  const [backdrop, setBackdrop] = useState(backgroundSrc);
  const [loadedBackground, setLoadedBackground] = useState<string | null>(null);
  const sceneLoaded = loadedBackground === backgroundSrc;
  const [visible, setVisible] = useState(true);
  const place = SCENES[scene];
  const locationName = staging.locationName ?? place.name;
  const has = (flag: string) => flags.includes(flag);
  const sisterAtHome = staging.companion.presence === 'offstage';
  const alone = !staging.showSister;
  const sisterInjured = staging.sisterInjured;
  const motherWeak = stats.health <= 3;
  const heroWeary = !staging.isDream && (stats.food <= 1 || stats.health <= 2);
  const distant = staging.companion.tone === 'guarded';
  const nearby = staging.companion.tone === 'warm';
  const heroX = drama ? drama.heroLeft : staging.arrest ? staging.arrest.heroLeft : staging.marketStall ? 40 : staging.isDream ? 50 : staging.heroSheltered ? 31 : place.hero;
  const sisterX = drama ? drama.sisterLeft : staging.arrest ? staging.arrest.sisterLeft : sisterInjured ? heroX + 15 : distant ? place.sister + 12 : nearby ? heroX + 16 : place.sister;
  const gateOpen = father === 'free' && has('released');
  const showMother = staging.showMother;
  const showFather = staging.showFather;
  const noFood = !staging.isDream && stats.food === 0;
  const showBread = staging.showBread;
  const showBook = !staging.isDream && has('book');
  const showMedicine = !staging.isDream && has('medicine');
  const showLetter = !staging.isDream && (has('letter') || has('documents') || has('evidence'));
  const showLantern = !staging.isDream && (has('lantern') || scene === 'home' || scene === 'courtyard');
  // An image failure must not change an adult into a child, or undo a disguise.
  // Exact injury/action poses have no standing substitute: hide failed art.
  const heroineFallback = staging.isDream ? undefined : drama?.preDisguise ? '/art/sister-v2/hero-cloak.png'
    : outfit === 'worker' || (outfit === 'travel' && has('disguise'))
      ? `/art/sister-v2/hero-worker${staging.space === 'public' ? '' : '-indoor'}.png`
      : outfit === 'travel' ? '/art/sister-v2/hero-travel-girl.png' : '/art/sister-v2/hero-cloak.png';

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    if (!sceneLoaded) return;
    // Keep the outgoing image underneath until the new location has faded in.
    const timer = window.setTimeout(() => setBackdrop(backgroundSrc), reducedMotion ? 0 : 600);
    return () => window.clearTimeout(timer);
  }, [backgroundSrc, sceneLoaded, reducedMotion]);

  useEffect(() => {
    const before = previous.current;
    setBeat(describeNarrativeChange(before, props));
    previous.current = { ...props, stats: { ...stats }, flags: [...flags] };
    // Announcements follow story state, while the cast stays on the same DOM nodes.
    // Dialogue and reading/choice changes must never revert an actor's final pose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, scene, backgroundSrc, outfit, sister, father, stats.trust, stats.health, stats.food, flags.join('|'), ending, props.beatIndex, props.phase, props.dramaShot?.id]);

  const arrestStep = staging.arrest?.step ?? null;
  useEffect(() => {
    const before = previousArrestStep.current;
    previousArrestStep.current = arrestStep;
    const world = worldRef.current;
    if (!world) return;
    // This is the only camera impulse: the family being pulled apart at the door.
    // A later dialogue line, focus change or visibility change never replays it.
    if (arrestStep !== 1 || before !== 0 || reducedMotion || !visible) {
      gsap.set(world, { x: 0 });
      return;
    }
    const impulse = gsap.fromTo(world, { x: 2 }, { x: 0, duration: .2, ease: 'power2.out' });
    return () => { impulse.kill(); gsap.set(world, { x: 0 }); };
  }, [arrestStep, reducedMotion, visible]);

  const sisterClothing = staging.sisterWardrobe === 'home' ? '长辫垂在肩巾旁' : staging.sisterWardrobe === 'covered' ? '头巾遮着头发，脸露在外面' : '穿着带面部网窗的全身外罩';
  const characterDescription = staging.isDream
    ? ending==='dream_commons'?'这是成年梦境。成年的阿提什捧着议事本子，女性经营市场、女孩在学校写字。':'这是成年梦境。成年的阿提什与女性卫队守住山口，女孩安全走进校门。'
    : props.dramaShot ? props.dramaShot.caption
    : staging.arrest ? staging.arrest.caption
    : `${staging.womenInVehicle ? '努拉、母亲、姐姐和弟弟一起坐在货车露天后斗，优素福在驾驶位。' : staging.showHero ? `努拉穿着${staging.heroDescription}。` : '镜头转向母亲；努拉尚未回到这一处。'}${staging.companion.label}${!alone ? `姐姐${sisterClothing}，${sisterInjured ? '坐着让受伤的脚踝休息' : distant ? '与你隔着一段距离' : '在这一幕里'}。` : ''}${showMother ? staging.motherInjured ? '母亲还带着挨打后的伤，需要休息。' : '母亲也在场。' : ''}${staging.showBrother ? '幼弟萨米抱着布玩具坐在家人身旁。' : ''}${staging.showFriend ? '女扮男装的同学莱拉与你一起商量。' : ''}${staging.showGuard ? '看守阿明在门边听你说话，他的帮助不能保证救援成功。' : ''}${showFather ? nodeId === 'n01' ? '父亲席地读着客人的信，努拉蹲坐在旁边整理纽扣与旧物。' : '衰弱的父亲靠在木推车上，被阿明带出监所后仍需要照护。' : father === 'located' ? '已有父亲的消息，但他还没有回来。' : '父亲被带走，尚未回来。'}${showBread ? '行囊里带着馕饼。' : noFood ? '家里的口粮已经吃尽。' : ''}${showMedicine ? '药包留给需要照护的家人。' : ''}${showLetter ? '信件与地址留在手边，不能保证通过检查。' : ''}`;

  const propClass = (name: string) => `narrative-prop narrative-prop--${name}${staging.featuredProp === name ? ' is-featured' : ''}`;

  return <figure className={`narrative-stage narrative-stage--cast-v2 narrative-stage--${scene}${staging.marketStall ? ' narrative-stage--market-stall' : ''}${staging.arrest ? ' narrative-stage--arrest' : ''}${staging.isDream ? ' narrative-stage--dream' : ''}${drama ? ' narrative-stage--drama' : ''}${staging.womenInVehicle ? ' narrative-stage--truck-passengers' : ''}${!staging.showHero ? ' narrative-stage--maternal' : ''}${immersive ? ' narrative-stage--immersive' : ''}${reducedMotion ? ' narrative-stage--reduced' : ''}`} data-space={staging.space} data-drama-visual={drama?.visual} data-phase={props.phase} data-arrest-step={staging.arrest?.step} style={{ '--scene-color': place.hue, '--hero-left': `${heroX}%` } as CSSProperties}>
    <div className="narrative-world" role="img" aria-label={`${locationName}。${characterDescription}${staging.sisterRecovering && !alone ? '姐姐治疗后仍小心落脚，走得比以前慢。' : ''}${heroWeary ? staging.womenInVehicle ? '努拉坐在车斗里，疲惫地低下头。' : '努拉的脚步放慢，站姿微微低垂。' : ''}`}>
      <div className="narrative-world-art" aria-hidden="true">
        <div className="narrative-backdrops" ref={worldRef}>
          <img src={backdrop} className="narrative-backdrop narrative-backdrop--under" alt="" draggable={false} />
          <img
            key={backgroundSrc}
            src={backgroundSrc}
            className={`narrative-backdrop narrative-backdrop--front${sceneLoaded ? ' is-ready' : ''}`}
            alt=""
            draggable={false}
            fetchPriority="high"
            onLoad={() => setLoadedBackground(backgroundSrc)}
          />
        </div>
        <div className="narrative-ground-shade" />
        {staging.arrest && <div className="narrative-arrest-doorlight" />}
        {staging.arrest && <div className="narrative-arrest-shadow" />}
        <div className={`narrative-light${has('lantern') ? ' is-lit' : ''}`} />

        <div className="narrative-location">
          <span>萨岚 · 第 {day} 日</span>
          <strong>{locationName}</strong>
        </div>
        {(scene === 'checkpoint' || scene === 'prison') && <div className={`narrative-gate-status${gateOpen ? ' is-open' : ''}`}>
          {gateOpen ? <Footprints size={14} /> : <ShieldAlert size={14} />}
          <span>{father === 'free' ? '父亲已越过门槛' : gateOpen ? '侧门暂时打开' : has('caravan') ? '车队接应，仍需过关' : '前路仍有人把守'}</span>
        </div>}

        <div className="narrative-ensemble">
        {staging.marketStall && <div className="narrative-market-mat" />}
        <div key="mother" data-actor="mother" data-pose={drama?.motherPose} data-presence={showMother ? 'present' : 'offstage'} className={`narrative-actor narrative-actor--mother narrative-wardrobe--${staging.motherWardrobe}${motherWeak ? ' is-tired' : ''}`} style={{ ...(drama ? {left:`${drama.motherLeft}%`} : staging.arrest ? { left: `${staging.arrest.motherLeft}%` } : {}), opacity: showMother ? 1 : 0 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.mother} fallback={drama || staging.motherInjured ? undefined : staging.motherWardrobe === 'home' ? '/art/sister-v2/mother.png' : '/art/sister-v3/mother-standing.png'} className="narrative-sprite" />
          <div className="narrative-person-label"><b>母亲</b><span>{motherWeak ? '身体需要照顾' : showMedicine ? '药已经带到了' : '等你们回来'}</span></div>
        </div>

        <div key="father" data-actor="father" data-pose={drama?.fatherPose} data-presence={showFather ? 'present' : 'offstage'} className={`narrative-actor narrative-actor--father${staging.fatherRescued ? ' is-rescued' : ''}${showFather ? ' is-present' : ''}`} style={{ left: drama ? `${drama.fatherLeft}%` : staging.marketStall ? 'var(--stall-father-left)' : staging.fatherRescued ? 'var(--rescued-father-left)' : staging.arrest ? `${staging.arrest.fatherLeft}%` : '77%', opacity: showFather ? 1 : 0 } as CSSProperties}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.father} fallback={staging.marketStall || staging.fatherRescued ? undefined : '/art/sister-v3/father-standing-crutch.png'} className="narrative-sprite" />
          {((staging.marketStall && drama?.fatherPose !== 'shield') || staging.fatherRescued) && <svg className={staging.fatherRescued ? 'narrative-cart-crutch' : 'narrative-market-crutch'} viewBox="0 0 70 260" aria-hidden="true"><path d="M10 13 Q34 3 59 13 M14 17 L26 132 L30 248 M55 17 L44 132 L36 248 M23 100 L47 100" fill="none" stroke="#634b33" strokeWidth="8" strokeLinecap="round"/><path d="M14 17 L27 132 L31 242 M54 17 L43 132 L35 242" fill="none" stroke="#b08b5c" strokeWidth="4"/><path d="M29 248 L37 248" stroke="#3d3b34" strokeWidth="10" strokeLinecap="round"/></svg>}
          <div className="narrative-person-label"><b>父亲</b><span>{nodeId === 'n01' ? '替人读信与摆摊' : staging.arrest ? '被武装者带向门口' : staging.fatherRescued ? '靠在推车上，仍需照护' : '终于回到身边'}</span></div>
        </div>

        <div key="hero" data-actor="hero" data-pose={drama?.heroPose} data-presence={staging.showHero ? 'present' : 'offstage'} className={`narrative-actor narrative-actor--hero narrative-outfit--${outfit}${heroWeary ? ' is-weary' : ''}`} style={{ left: drama ? `${heroX}%` : staging.marketStall ? 'var(--stall-hero-left)' : `${heroX}%`, opacity: staging.showHero ? 1 : 0 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.hero} fallback={heroineFallback} className="narrative-sprite" />
          {scarf === 'shared' && !staging.isDream && <span className="narrative-ribbon-knot" />}
          <div className="narrative-person-label"><b>{staging.isDream ? '成年的阿提什' : has('aliasAatish') && staging.space === 'public' ? '阿提什' : '努拉'}</b><span>{outfit === 'worker' ? '别人眼里的小工' : outfit === 'travel' ? '背起新的生活' : '还在寻找一条路'}</span></div>
        </div>

        <div key="sister" data-actor="sister" data-presence={alone ? 'offstage' : 'present'} className={`narrative-actor narrative-actor--sister narrative-wardrobe--${staging.sisterWardrobe}${sisterInjured ? ' is-injured' : ''}${staging.sisterRecovering ? ' is-recovering' : ''}${distant && !sisterInjured ? ' is-distant' : ''}${alone ? ' is-away' : ''}`} style={{ left: `${sisterX}%`, opacity: alone ? 0 : 1 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.sister} className="narrative-sprite" />
          <div className="narrative-person-label"><b>玛莉安</b><span>{sisterInjured ? '靠在你身旁休息' : staging.sisterRecovering ? '慢慢试着落脚' : distant ? '有些话没有说出口' : nearby ? '愿意与你一起决定' : '姐姐，也在找路'}</span></div>
        </div>

        <div key="brother" data-actor="brother" data-presence={staging.showBrother ? 'present' : 'offstage'} className="narrative-actor narrative-actor--brother" style={{ opacity: staging.showBrother ? 1 : 0 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.brother} className="narrative-sprite" />
          <div className="narrative-person-label"><b>萨米</b><span>把布玩具抱在怀里</span></div>
        </div>
        <div key="friend" data-actor="friend" data-pose={drama?.heroPose} data-presence={staging.showFriend ? 'present' : 'offstage'} className="narrative-actor narrative-actor--friend" style={{ ...(drama ? {left:`${drama.friendLeft}%`} : {}), opacity: staging.showFriend ? 1 : 0 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.friend} className="narrative-sprite" />
          <div className="narrative-person-label"><b>莱拉</b><span>也在男孩衣服里藏着名字</span></div>
        </div>
        <div key="guard" data-actor="guard" data-presence={staging.showGuard ? 'present' : 'offstage'} className="narrative-actor narrative-actor--guard" style={{ ...(drama ? {left:'57%'} : {}), opacity: staging.showGuard ? 1 : 0 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.guard} className="narrative-sprite" />
          <div className="narrative-person-label"><b>阿明</b><span>愿意听你把信读完</span></div>
        </div>

        <div key="oppressor" data-actor="oppressor" data-kind={drama?.oppressor} data-pose={drama?.oppressorPose} data-presence={drama?.oppressor ? 'present' : 'offstage'} className="narrative-actor narrative-actor--oppressor" style={{left:`${drama?.oppressorLeft ?? 88}%`,opacity:drama?.oppressor ? 1 : 0}}>
          <div className="narrative-foot-shadow"/>
          <FigureImage src={drama?.oppressorAsset ?? '/art/sister-v3/patrol.png'} fallback="/art/sister-v3/patrol.png" className="narrative-sprite"/>
        </div>
        <div key="second-patrol" data-actor="second-patrol" data-presence={drama?.secondPatrol ? 'present' : 'offstage'} className="narrative-actor narrative-actor--second-patrol" style={{left:`${drama?.secondLeft ?? 96}%`,opacity:drama?.secondPatrol ? 1 : 0}}>
          <FigureImage src={drama?.secondAsset ?? '/art/sister-v3/armed-patrol.png'} fallback="/art/sister-v3/patrol.png" className="narrative-sprite"/>
        </div>
        <div className="narrative-gunfire-haze" data-active={drama?.gunfire || undefined}/>

        {staging.arrest && <div className="narrative-arrest-bowl"><i /></div>}
        <div className="narrative-props">
          {showBread && <div className={propClass('bread')}><FigureImage src="/art/sister/bread.png" /><span>剩下的馕</span></div>}
          {showMedicine && <div className={propClass('medicine')}><FigureImage src="/art/sister/medicine.png" /><span>带给家人的药</span></div>}
          {showLetter && <div className={propClass('letter')}><FigureImage src="/art/sister/letter.png" /><span>{has('documents') ? '地址与旧纸' : has('evidence') ? '核对过的线索' : '折好的信件'}</span></div>}
          {showBook && <div className={propClass('book')}><FigureImage src="/art/sister/book.png" /><span>家里的故事册</span></div>}
          {!staging.isDream && (outfit === 'travel' || has('caravan')) && <div className={propClass('bag')}><FigureImage src="/art/sister/bag.png" /><span>没有丢下的行囊</span></div>}
          {showLantern && <div className={`${propClass('lantern')}${has('lantern') ? ' is-lit' : ''}`}><FigureImage src="/art/sister/lantern.png" /><span>{has('lantern') ? '邻居点亮的灯' : '屋里的一点光'}</span></div>}
        </div>
        </div>

        {!staging.isDream && staging.companion.presence === 'apart' && <div className="narrative-empty-place"><span>姐姐原来站在这里</span><i /></div>}
        {stats.exposure >= 7 && !ending && <div className="narrative-patrol"><ShieldAlert size={13} /><span>街口的脚步声更近了</span></div>}
        {noFood && <div className="narrative-empty-bowl">家里的口粮已经吃尽</div>}
        <div className="narrative-paper-edge" />
      </div>
    </div>
    <figcaption className="narrative-scene-caption">
      <div className="narrative-action"><Footprints size={15} aria-hidden="true" /><span>{beat}</span></div>
      <div className="narrative-scene-facts">
        <span><BookOpen size={12} aria-hidden="true" />{staging.isDream ? '梦境 · 成年的阿提什' : staging.womenInVehicle ? '家人 · 同在露天后斗' : nodeId === 'n21' ? props.storyRevision === 5 && !props.dramaShot ? '家人 · 舅舅的车旁' : '母亲 · 拒绝丢下女儿' : drama?.mother && !drama.sister ? '母亲与你在街上' : sisterAtHome ? '姐姐留在门内' : alone ? staging.showFriend ? '你与莱拉同行' : '你独自走在这一页' : sisterInjured ? '姐姐 · 受伤，需要照顾' : nodeId === 'n23' && sister === 'apart' ? '姐姐 · 当面把话说清楚' : '姐姐 · 同行'}</span>
      </div>
    </figcaption>
  </figure>;
}
