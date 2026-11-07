'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { BookOpen, Footprints, ShieldAlert } from 'lucide-react';
import { selectNarrativeStage } from '../lib/narrative-stage-state';
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
  actionLabel?: string;
  reducedMotion: boolean;
  ending?: string | null;
  day?: number;
  scarf?: 'worn' | 'shared' | 'lost';
  immersive?: boolean;
  beatIndex?: number;
  phase?: 'reading' | 'choice' | 'compose' | 'intro' | 'ending';
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
  const nextCast = selectNarrativeStage(next);
  if (nextCast.arrest) return nextCast.arrest.caption;
  if (nextCast.isDream) return '在这个明确的梦里，成年的阿提什守护着女性自治之地。';
  if (next.nodeId === 'n01') return '清晨，努拉坐在父亲的摊边，听他替客人读信。';
  if (next.nodeId === 'n03') return '母亲带努拉来到监所附近。姐姐与萨米留在家里，街上的拦阻让这段路无法顺利走完。';
  if (next.nodeId === 'n04') return '努拉独自来到市场找食物。母亲回家养伤，姐姐与萨米留在门内。';
  if (next.nodeId === 'n21') return '这一幕转向母亲：努拉尚未回来，她拒绝让贾维德替全家决定。';
  const restoredLaterScene = previous?.nodeId === 'n01' && next.nodeId !== 'n02';
  if (!previous || restoredLaterScene) return `努拉穿着${nextCast.heroDescription}，停在${nextCast.locationName ?? SCENES[next.scene].name}。${nextCast.companion.label}`;
  const previousCast = selectNarrativeStage(previous);
  if (previousCast.showSister && nextCast.companion.presence === 'apart') return '姐姐转身离开。原本并肩的位置，空了下来。';
  if (!previousCast.showSister && nextCast.showSister) return '姐姐重新出现在你面前。你们还有话没有说完。';
  if (nextCast.showSister && previous.sister !== 'injured' && next.sister === 'injured') return '姐姐靠着你坐下来。接下来的路，需要放慢一些。';
  if (nextCast.showSister && previous.sister === 'injured' && next.sister === 'beside') return '姐姐重新站起，试着把重量放回自己的双脚。';
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
  const { scene, outfit, sister, father, stats, flags, nodeId, actionLabel, reducedMotion, ending, day = 1, scarf = 'worn', immersive = false } = props;
  const staging = selectNarrativeStage(props);
  const backgroundSrc = staging.assets.background;
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const sisterRef = useRef<HTMLDivElement>(null);
  const fatherRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef<HTMLDivElement>(null);
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
  const heroX = staging.arrest ? staging.arrest.heroLeft : staging.marketStall ? 40 : staging.isDream ? 50 : staging.heroSheltered ? 31 : place.hero;
  const sisterX = staging.arrest ? staging.arrest.sisterLeft : sisterInjured ? heroX + 15 : distant ? place.sister + 12 : nearby ? heroX + 16 : place.sister;
  const gateOpen = father === 'free' && has('released');
  const showMother = staging.showMother;
  const showFather = staging.showFather;
  const noFood = !staging.isDream && stats.food === 0;
  const showBread = staging.showBread;
  const showBook = !staging.isDream && has('book');
  const showMedicine = !staging.isDream && has('medicine');
  const showLetter = !staging.isDream && (has('letter') || has('documents') || has('evidence'));
  const showLantern = !staging.isDream && (has('lantern') || scene === 'home' || scene === 'courtyard');

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
    if (!stageRef.current) return;
    const ctx = gsap.context(() => {
      const hero = heroRef.current;
      const sisterActor = sisterRef.current;
      const fatherActor = fatherRef.current;
      const duration = reducedMotion || !visible ? 0 : immersive ? .95 : .72;
      const changedScene = !before || selectNarrativeStage(before).assets.background !== backgroundSrc;
      if (staging.marketStall) gsap.set(hero, { left: 'var(--stall-hero-left)' });
      gsap.to(hero, { ...(staging.marketStall ? {} : { left: `${heroX}%` }), opacity: staging.showHero ? 1 : 0, xPercent: -50, x: 0, y: heroWeary ? 3 : 0, duration, ease: 'power2.out' });
      gsap.to(sisterActor, {
        left: `${alone ? 104 : sisterX}%`, xPercent: -50, x: 0, y: sisterInjured ? 6 : staging.sisterRecovering ? 2 : 0,
        opacity: alone ? 0 : 1, duration: duration * (staging.sisterRecovering ? 1.65 : 1.35), ease: 'power2.inOut',
      });
      if (staging.marketStall || staging.fatherRescued) gsap.set(fatherActor, { left: staging.marketStall ? 'var(--stall-father-left)' : 'var(--rescued-father-left)' });
      gsap.to(fatherActor, { ...(staging.marketStall || staging.fatherRescued ? {} : { left: staging.arrest ? `${staging.arrest.fatherLeft}%` : showFather ? '77%' : '96%' }), xPercent: -50, x: 0, opacity: showFather ? 1 : 0, rotation: staging.arrest && staging.arrest.step>0 && staging.arrest.step<3 ? 5 : 0, duration: staging.arrest ? duration*1.15 : duration, ease: 'power2.out' });
      if (staging.arrest && !reducedMotion && visible && before?.nodeId === 'n02' && before.beatIndex !== props.beatIndex) {
        gsap.fromTo(worldRef.current, { x: staging.arrest.step === 1 ? 4 : 0 }, { x: 0, duration: .25, ease: 'power2.out' });
      }
      if (changedScene && !reducedMotion && visible) {
        gsap.fromTo(worldRef.current, { scale: immersive ? 1.035 : 1.04 }, { scale: 1, duration: immersive ? 1.8 : 1.1, ease: 'power2.out' });
        gsap.fromTo(hero, { x: immersive ? -18 : -26, opacity: staging.showHero ? .35 : 0 }, { x: 0, opacity: staging.showHero ? 1 : 0, duration: immersive ? .95 : .7, ease: 'power2.out' });
      } else if (before?.outfit !== outfit && !reducedMotion && visible) {
        const sprite = hero?.querySelector('.narrative-sprite');
        if (sprite) gsap.fromTo(sprite, { opacity: .3, y: -8 }, { opacity: 1, y: 0, duration: .6 });
      } else if (before && before.nodeId !== nodeId && !reducedMotion && visible) {
        gsap.fromTo(hero, { rotation: -1.4 }, { rotation: 0, duration: .55, ease: 'power2.out' });
      }
      if (propsRef.current && !reducedMotion && visible && (!immersive || changedScene || flags.some(flag => !before?.flags.includes(flag)))) {
        const items = propsRef.current.querySelectorAll('.narrative-prop');
        if (items.length) gsap.fromTo(items, { y: 10, opacity: .25 }, { y: 0, opacity: 1, stagger: .055, duration: .45 });
      }
    }, stageRef);
    return () => ctx.revert();
    // Every story decision changes nodeId; derived positions also respond to undo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeId, scene, backgroundSrc, outfit, sister, father, stats.trust, stats.health, stats.food, flags.join('|'), ending, reducedMotion, visible, immersive, props.beatIndex, props.phase]);

  const sisterClothing = staging.sisterWardrobe === 'home' ? '长辫垂在肩巾旁' : staging.sisterWardrobe === 'covered' ? '头巾遮着头发，脸露在外面' : '穿着带面部网窗的全身外罩';
  const characterDescription = staging.isDream
    ? '这是与现实状态分开的梦境。成年的阿提什站在女性自治城市前。童年的家人没有被搬入这段未来，现实里的伤势与寻父进展没有改变。'
    : staging.arrest ? staging.arrest.caption
    : `${staging.showHero ? `努拉穿着${staging.heroDescription}。` : '镜头转向母亲；努拉尚未回到这一处。'}${staging.companion.label}${!alone ? `姐姐${sisterClothing}，${sisterInjured ? '坐着让受伤的脚踝休息' : distant ? '与你隔着一段距离' : '在这一幕里'}。` : ''}${showMother ? staging.motherInjured ? '母亲还带着挨打后的伤，需要休息。' : '母亲也在场。' : ''}${staging.showBrother ? '幼弟萨米抱着布玩具坐在家人身旁。' : ''}${staging.showFriend ? '女扮男装的同学莱拉与你一起商量。' : ''}${staging.showGuard ? '看守阿明在门边听你说话，他的帮助不能保证救援成功。' : ''}${showFather ? nodeId === 'n01' ? '父亲席地读着客人的信，努拉蹲坐在旁边整理纽扣与旧物。' : '衰弱的父亲靠在木推车上，被阿明带出监所后仍需要照护。' : father === 'located' ? '已有父亲的消息，但他还没有回来。' : '父亲被带走，尚未回来。'}${showBread ? '行囊里带着馕饼。' : noFood ? '家里的口粮已经吃尽。' : ''}${showMedicine ? '药包留给需要照护的家人。' : ''}${showLetter ? '信件与地址留在手边，不能保证通过检查。' : ''}${staging.womenInVehicle ? '母亲、姐姐与弟弟坐在放下帘子的车里。' : ''}`;

  const propClass = (name: string) => `narrative-prop narrative-prop--${name}${staging.featuredProp === name ? ' is-featured' : ''}`;

  return <figure className={`narrative-stage narrative-stage--cast-v2 narrative-stage--${scene}${staging.marketStall ? ' narrative-stage--market-stall' : ''}${staging.arrest ? ' narrative-stage--arrest' : ''}${staging.isDream ? ' narrative-stage--dream' : ''}${!staging.showHero ? ' narrative-stage--maternal' : ''}${immersive ? ' narrative-stage--immersive' : ''}${reducedMotion ? ' narrative-stage--reduced' : ''}`} data-space={staging.space} data-arrest-step={staging.arrest?.step} style={{ '--scene-color': place.hue, '--hero-left': `${heroX}%` } as CSSProperties}>
    <div className="narrative-world" ref={stageRef} role="img" aria-label={`${locationName}。${characterDescription}${staging.sisterRecovering && !alone ? '姐姐治疗后仍小心落脚，走得比以前慢。' : ''}${heroWeary ? '努拉的脚步放慢，站姿微微低垂。' : ''}`}>
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
        {showMother && <div className={`narrative-actor narrative-actor--mother narrative-wardrobe--${staging.motherWardrobe}${motherWeak ? ' is-tired' : ''}`} style={staging.arrest ? { left: `${staging.arrest.motherLeft}%` } : undefined}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.mother} className="narrative-sprite" />
          <div className="narrative-person-label"><b>母亲</b><span>{motherWeak ? '身体需要照顾' : showMedicine ? '药已经带到了' : '等你们回来'}</span></div>
        </div>}

        <div className={`narrative-actor narrative-actor--father${staging.fatherRescued ? ' is-rescued' : ''}${showFather ? ' is-present' : ''}`} ref={fatherRef} style={staging.arrest ? { left: `${staging.arrest.fatherLeft}%`, opacity: showFather ? 1 : 0 } : undefined}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.father} className="narrative-sprite" />
          <div className="narrative-person-label"><b>父亲</b><span>{nodeId === 'n01' ? '替人读信与摆摊' : staging.arrest ? '被武装者带向门口' : staging.fatherRescued ? '靠在推车上，仍需照护' : '终于回到身边'}</span></div>
        </div>

        <div className={`narrative-actor narrative-actor--hero narrative-outfit--${outfit}${heroWeary ? ' is-weary' : ''}`} ref={heroRef} style={{ left: staging.marketStall ? 'var(--stall-hero-left)' : `${heroX}%`, opacity: staging.showHero ? 1 : 0 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.hero} className="narrative-sprite" />
          {scarf === 'shared' && !staging.isDream && <span className="narrative-ribbon-knot" />}
          <div className="narrative-person-label"><b>{staging.isDream ? '成年的阿提什' : has('aliasAatish') && staging.space === 'public' ? '阿提什' : '努拉'}</b><span>{outfit === 'worker' ? '别人眼里的小工' : outfit === 'travel' ? '背起新的生活' : '还在寻找一条路'}</span></div>
        </div>

        <div className={`narrative-actor narrative-actor--sister narrative-wardrobe--${staging.sisterWardrobe}${sisterInjured ? ' is-injured' : ''}${staging.sisterRecovering ? ' is-recovering' : ''}${distant && !sisterInjured ? ' is-distant' : ''}${alone ? ' is-away' : ''}`} ref={sisterRef} style={{ left: `${sisterX}%`, opacity: alone ? 0 : 1 }}>
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.sister} className="narrative-sprite" />
          <div className="narrative-person-label"><b>玛莉安</b><span>{sisterInjured ? '靠在你身旁休息' : staging.sisterRecovering ? '慢慢试着落脚' : distant ? '有些话没有说出口' : nearby ? '愿意与你一起决定' : '姐姐，也在找路'}</span></div>
        </div>

        {staging.showBrother && <div className="narrative-actor narrative-actor--brother">
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.brother} className="narrative-sprite" />
          <div className="narrative-person-label"><b>萨米</b><span>把布玩具抱在怀里</span></div>
        </div>}
        {staging.showFriend && <div className="narrative-actor narrative-actor--friend">
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.friend} className="narrative-sprite" />
          <div className="narrative-person-label"><b>莱拉</b><span>也在男孩衣服里藏着名字</span></div>
        </div>}
        {staging.showGuard && <div className="narrative-actor narrative-actor--guard">
          <div className="narrative-foot-shadow" />
          <FigureImage src={staging.assets.guard} className="narrative-sprite" />
          <div className="narrative-person-label"><b>阿明</b><span>愿意听你把信读完</span></div>
        </div>}

        {staging.arrest && <div className="narrative-arrest-bowl"><i /></div>}
        <div className="narrative-props" ref={propsRef}>
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
        <span><BookOpen size={12} aria-hidden="true" />{staging.isDream ? '梦境 · 成年的阿提什' : nodeId === 'n21' ? '母亲 · 拒绝丢下女儿' : sisterAtHome ? '姐姐留在门内' : alone ? '你独自走在这一页' : sisterInjured ? '姐姐 · 受伤，需要照顾' : nodeId === 'n23' && sister === 'apart' ? '姐姐 · 当面把话说清楚' : '姐姐 · 同行'}</span>
      </div>
    </figcaption>
  </figure>;
}
