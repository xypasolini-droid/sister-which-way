'use client';

import { useEffect, useRef, useState } from 'react';
import { Application, Container, Graphics } from 'pixi.js';
import { gsap } from 'gsap';
import type { StoryState } from '../lib/story';
import { CHARACTER_ASSETS, STAGE_ASSETS } from '../lib/stage-assets';

type Props = { state: StoryState; busy: boolean; reducedMotion: boolean };
type PaperParticle = { node: Graphics; x: number; y: number; phase: number; speed: number; spin: number };
type StageController = { update: (state: StoryState, busy: boolean, reduced: boolean) => void };

const W = 1600;
const H = 900;
const sceneNames = ['cave', 'forest', 'banquet'] as const;

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** A folded, imperfect paper petal, rather than a flat geometric dot. */
function petal(color: number, size: number, variant = 0) {
  const p = new Graphics();
  p.poly([0, -size, size * .56, -size * .12, size * .37, size * .55, 0, size * .82, -size * .48, size * .17, -size * .34, -size * .58]).fill({ color });
  p.poly([0, -size, size * .56, -size * .12, size * .37, size * .55, 0, size * .82, size * .11, 0]).fill({ color: variant ? 0xffe1b1 : 0xffefcf, alpha: .2 });
  p.moveTo(0, -size * .8).lineTo(size * .08, size * .58).stroke({ color: 0x713942, width: .65, alpha: .25 });
  return p;
}

function paperFlower(x: number, y: number, size: number, index: number) {
  const flower = new Container();
  flower.position.set(x, y);
  const stem = new Graphics().moveTo(0, 0).quadraticCurveTo(-size * .12, -size, size * .05, -size * 2).stroke({ color: 0x62745c, width: size * .075 });
  stem.poly([0, -size * .7, -size * .7, -size * 1.15, -size * .35, -size * .4]).fill({ color: 0x778268 });
  flower.addChild(stem);
  const head = new Container();
  head.position.set(0, -size * 2);
  const colors = [0xb24c62, 0xd46b70, 0xe29986, 0xc45567, 0xf0b69b];
  for (let j = 0; j < 7; j++) {
    const p = petal(colors[(j + index) % colors.length], size * .8, j % 2);
    p.pivot.set(0, size * .8);
    p.rotation = j * Math.PI * 2 / 7 + .13;
    head.addChild(p);
  }
  head.addChild(new Graphics().poly([-size * .23, 0, -size * .08, -size * .25, size * .2, -size * .13, size * .25, size * .13, 0, size * .23]).fill({ color: 0xefcf92 }));
  flower.addChild(head);
  flower.rotation = (seeded(index + 87) - .5) * .18;
  return flower;
}

export default function StoryStage({ state, busy, reducedMotion }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const effectsRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<StageController | null>(null);
  const latest = useRef({ state, busy, reducedMotion });
  latest.current = { state, busy, reducedMotion };
  const [canvasUnavailable, setCanvasUnavailable] = useState(false);
  const [missingArt, setMissingArt] = useState(false);

  useEffect(() => {
    const mount = effectsRef.current;
    const host = hostRef.current;
    if (!mount || !host) return;
    let disposed = false;
    let initialized = false;
    let app: Application | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cleanVisibility = () => {};
    let cleanupPointer = () => {};

    async function initialize() {
      const localApp = new Application();
      app = localApp;
      await localApp.init({
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        preference: 'webgl',
        width: Math.max(mount!.clientWidth, 1),
        height: Math.max(mount!.clientHeight, 1),
        autoStart: false,
      });
      initialized = true;
      if (disposed) {
        localApp.destroy(true, { children: true });
        app = null;
        return;
      }
      mount!.appendChild(localApp.canvas);
      setCanvasUnavailable(false);
      localApp.canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
      localApp.canvas.setAttribute('aria-hidden', 'true');
      localApp.ticker.maxFPS = 40;
      const world = new Container();
      const atmosphere = new Container();
      const road = new Container();
      const flowers = new Container();
      const weather = new Container();
      const celebration = new Container();
      localApp.stage.addChild(world);
      world.addChild(atmosphere, road, flowers, weather, celebration);
      let current = latest.current.state;
      let isBusy = latest.current.busy;
      let reduced = latest.current.reducedMotion;
      let lastVisualKey = '';
      let elapsed = 0;
      let pointerX = 0;
      let smoothPointer = 0;

      const motes: PaperParticle[] = [];
      for (let i = 0; i < 28; i++) {
        const node = new Graphics().circle(0, 0, 1.1 + seeded(i + 3) * 1.8).fill({ color: 0xf3d7a1 });
        node.alpha = .15 + seeded(i + 10) * .35;
        const p = { node, x: seeded(i + 200) * W, y: seeded(i + 501) * H * .86, phase: i * .74, speed: 1 + seeded(i + 40), spin: 0 };
        node.position.set(p.x, p.y);
        atmosphere.addChild(node);
        motes.push(p);
      }
      const drops: PaperParticle[] = [];
      const confetti: PaperParticle[] = [];
      const flowerSways: { node: Container; base: number; phase: number }[] = [];
      const roadPieces: Graphics[] = [];

      const layout = () => {
        if (disposed) return;
        const width = Math.max(mount!.clientWidth, 1);
        const height = Math.max(mount!.clientHeight, 1);
        localApp.renderer.resize(width, height);
        const scale = Math.max(width / W, height / H);
        world.scale.set(scale);
        world.position.set((width - W * scale) / 2, (height - H * scale) / 2);
        localApp.render();
      };
      resizeObserver = new ResizeObserver(layout);
      resizeObserver.observe(mount!);
      layout();

      const clearLayer = (layer: Container) => {
        layer.children.forEach(child => {
          gsap.killTweensOf(child);
          gsap.killTweensOf(child.scale);
        });
        layer.removeChildren().forEach(child => child.destroy({ children: true }));
      };

      const buildVisuals = (s: StoryState) => {
        const key = [s.chapter, s.pathOpen, s.flowers, s.weather, s.ending, s.light, reduced].join(':');
        if (key === lastVisualKey) return;
        lastVisualKey = key;
        clearLayer(road);
        clearLayer(flowers);
        clearLayer(weather);
        clearLayer(celebration);
        drops.length = 0;
        confetti.length = 0;
        flowerSways.length = 0;
        roadPieces.length = 0;
        if (s.pathOpen) {
          for (let i = 0; i < 18; i++) {
            const t = i / 17;
            const x = 440 + t * 760;
            const y = 785 - t * 160 + Math.sin(t * Math.PI) * 32;
            const p = petal(i % 3 === 0 ? 0xd9936b : i % 2 ? 0xe8bd88 : 0xce977d, 13 + (1 - t) * 10, i % 2);
            p.position.set(x, y);
            p.rotation = 1.1 + Math.sin(i * .7) * .45;
            p.alpha = reduced ? .85 : 0;
            road.addChild(p);
            roadPieces.push(p);
            if (!reduced) gsap.to(p, { alpha: .85, duration: .5, delay: i * .055, ease: 'power2.out', onUpdate: () => localApp.render() });
          }
        }
        if (s.flowers || s.ending === 'together') {
          for (let i = 0; i < 18; i++) {
            const x = i < 9 ? 140 + i * 70 : 965 + (i - 9) * 63;
            const y = 862 + (seeded(i + 62) - .5) * 55;
            const f = paperFlower(x, y, 15 + seeded(i + 12) * 13, i);
            const scale = reduced ? 1 : .05;
            f.scale.set(scale);
            flowers.addChild(f);
            flowerSways.push({ node: f, base: f.rotation, phase: i * .72 });
            if (!reduced) gsap.to(f.scale, { x: 1, y: 1, duration: .8, delay: i * .045, ease: 'back.out(1.15)', onUpdate: () => localApp.render() });
          }
        }
        if (s.weather !== 'still') {
          for (let i = 0; i < (s.weather === 'rain' ? 50 : 23); i++) {
            const n = new Graphics();
            if (s.weather === 'rain') n.moveTo(0, 0).lineTo(-3, 16 + seeded(i + 5) * 12).stroke({ color: 0xc5d2e7, width: 1.15, alpha: .32 });
            else {
              const size = 2.7 + seeded(i + 3) * 3;
              n.poly([0, -size, size * .23, -size * .23, size, 0, size * .23, size * .23, 0, size, -size * .23, size * .23, -size, 0, -size * .23, -size * .23]).fill({ color: 0xf6d49a, alpha: .8 });
            }
            const p = { node: n, x: seeded(i + 100) * W, y: seeded(i + 300) * H, speed: 1 + seeded(i + 700), phase: i, spin: 0 };
            n.position.set(p.x, p.y);
            weather.addChild(n);
            drops.push(p);
          }
        }
        if (s.ending === 'together') {
          for (let i = 0; i < 36; i++) {
            const p = { node: petal([0xf5c78f, 0xd9777d, 0x94a879][i % 3], 5 + seeded(i) * 7), x: seeded(i + 400) * W, y: seeded(i + 600) * H, phase: i * .84, speed: .6 + seeded(i + 17), spin: (seeded(i + 23) - .5) * .4 };
            p.node.position.set(p.x, p.y);
            p.node.alpha = .8;
            celebration.addChild(p.node);
            confetti.push(p);
          }
        }
        localApp.render();
      };

      const syncTicker = () => {
        if (document.hidden || reduced) {
          localApp.stop();
          localApp.render();
        } else localApp.start();
      };
      controllerRef.current = {
        update(s, pending, preferReduced) {
          current = s;
          isBusy = pending;
          reduced = preferReduced;
          buildVisuals(s);
          syncTicker();
        },
      };
      localApp.ticker.add((ticker) => {
        elapsed += Math.min(ticker.deltaMS, 48) / 1000;
        smoothPointer += (pointerX - smoothPointer) * .025;
        atmosphere.x = smoothPointer * 7;
        for (const p of motes) {
          p.node.x = p.x + Math.sin(elapsed * .2 + p.phase) * 14;
          p.node.y = p.y + Math.sin(elapsed * .15 * p.speed + p.phase) * 20;
          p.node.alpha = (.18 + Math.sin(elapsed * .6 + p.phase) * .11) * (isBusy ? 1.8 : 1);
        }
        flowerSways.forEach(f => { f.node.rotation = f.base + Math.sin(elapsed * .7 + f.phase) * .035; });
        for (const p of drops) {
          if (current.weather === 'rain') {
            p.node.y = (p.y + elapsed * 140 * p.speed) % (H + 60) - 30;
            p.node.x = p.x - ((elapsed * 14 * p.speed) % 40);
          } else p.node.alpha = .35 + (Math.sin(elapsed * .7 + p.phase) + 1) * .25;
        }
        for (const p of confetti) {
          p.node.y = (p.y + elapsed * 25 * p.speed) % (H + 30) - 15;
          p.node.x = p.x + Math.sin(elapsed * .4 + p.phase) * 33;
          p.node.rotation = elapsed * p.spin + p.phase;
        }
      });
      const onPointer = (event: PointerEvent) => {
        const rect = host!.getBoundingClientRect();
        pointerX = ((event.clientX - rect.left) / rect.width - .5) * 2;
      };
      const onLeave = () => { pointerX = 0; };
      host!.addEventListener('pointermove', onPointer, { passive: true });
      host!.addEventListener('pointerleave', onLeave);
      cleanupPointer = () => {
        host!.removeEventListener('pointermove', onPointer);
        host!.removeEventListener('pointerleave', onLeave);
      };
      document.addEventListener('visibilitychange', syncTicker);
      cleanVisibility = () => document.removeEventListener('visibilitychange', syncTicker);
      controllerRef.current.update(latest.current.state, latest.current.busy, latest.current.reducedMotion);
    }

    initialize().catch(() => {
      if (!disposed) setCanvasUnavailable(true);
    });
    return () => {
      disposed = true;
      controllerRef.current = null;
      resizeObserver?.disconnect();
      cleanupPointer();
      cleanVisibility();
      // Initialization may still be awaiting its WebGL context. That branch
      // handles its own disposal above; never destroy a half-built Application.
      if (initialized && app?.renderer) {
        app.stage.children.forEach(container => {
          if (container instanceof Container) container.children.forEach(layer => {
            if (layer instanceof Container) layer.children.forEach(child => { gsap.killTweensOf(child); gsap.killTweensOf(child.scale); });
          });
        });
        app.destroy(true, { children: true });
        app = null;
      }
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.update(state, busy, reducedMotion);
    if (!actorRef.current || reducedMotion) return;
    const tween = gsap.fromTo(actorRef.current, { y: 5 }, { y: 0, duration: .8, ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [state, busy, reducedMotion]);

  const scene = STAGE_ASSETS[state.chapter];
  const restored = state.companionForm === 'child';
  const together = state.ending === 'together';
  const visualDescription = `${scene.description}${state.pathOpen ? '花瓣铺出的道路已经打开。' : ''}${restored ? '同伴重新拥有了颜色。' : '同伴仍是一道褪色的影子。'}${state.flowers ? '纸花正在盛开。' : ''}${state.weather === 'rain' ? '雨落在纸页上。' : state.weather === 'stars' ? '天空出现星光。' : ''}`;

  return (
    <div ref={hostRef} className={`story-stage stage-${state.chapter}${busy ? ' is-writing' : ''}${together ? ' is-complete' : ''}`} role="img" aria-label={visualDescription} style={{ width: '100%', height: '100%', minHeight: 230, position: 'relative', overflow: 'hidden', isolation: 'isolate', backgroundColor: state.chapter === 'cave' ? '#292337' : state.chapter === 'forest' ? '#342322' : '#263c37' }}>
      {sceneNames.map(chapter => (
        // Native images allow the static stage to remain visible if WebGL is unavailable.
        // eslint-disable-next-line @next/next/no-img-element
        <img key={chapter} src={STAGE_ASSETS[chapter].background} alt="" aria-hidden="true" draggable={false} onError={() => setMissingArt(true)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: state.chapter === chapter ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 1000ms ease', zIndex: 0 }} />
      ))}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', background: `radial-gradient(ellipse at 55% 62%, ${scene.glow}3b, transparent 62%)`, opacity: state.light || together ? 1 : 0, transition: reducedMotion ? 'none' : 'opacity 1000ms ease' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', background: 'linear-gradient(180deg, rgba(15,13,22,.08), transparent 35%, rgba(15,13,22,.18) 100%)' }} />
      <div ref={actorRef} className="stage-actors" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        <div className="stage-character stage-hero" style={{ position: 'absolute', height: '29%', width: '14%', left: '36%', bottom: '15%', transform: state.pathOpen ? 'translateX(8%)' : 'translateX(0)', transition: reducedMotion ? 'none' : 'transform 1700ms ease' }}>
          <span style={{ position: 'absolute', bottom: '-1%', left: '19%', width: '64%', height: '5%', background: '#100b17', opacity: .4, borderRadius: '50%', filter: 'blur(3px)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CHARACTER_ASSETS.hero} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', position: 'relative', filter: 'drop-shadow(3px 4px 2px rgba(14,9,22,.35))' }} />
        </div>
        <div className="stage-character stage-companion" style={{ position: 'absolute', height: '28%', width: '14%', left: '53%', bottom: '15%', opacity: restored ? 1 : .62, transform: restored ? 'scale(1)' : 'scale(1.04)', transition: reducedMotion ? 'none' : 'opacity 1600ms ease, transform 1600ms ease' }}>
          <span style={{ position: 'absolute', bottom: '-1%', left: '19%', width: '64%', height: '5%', background: '#100b17', opacity: .35, borderRadius: '50%', filter: 'blur(3px)' }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CHARACTER_ASSETS.companion} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', position: 'relative', filter: restored ? 'drop-shadow(3px 4px 2px rgba(14,9,22,.35))' : 'brightness(.16) saturate(.15) drop-shadow(0 0 14px rgba(156,120,191,.35))', transition: reducedMotion ? 'none' : 'filter 1600ms ease' }} />
          {state.companionName && <span className="stage-character-name" style={{ position: 'absolute', left: '50%', bottom: '-21%', transform: 'translateX(-50%)', padding: '3px 9px', color: '#f1dfbd', fontFamily: 'var(--font-story, serif)', fontSize: 'clamp(10px, 1vw, 14px)', lineHeight: 1.5, letterSpacing: '.12em', whiteSpace: 'nowrap', textShadow: '0 1px 6px #211524' }}>{state.companionName}</span>}
        </div>
      </div>
      <div ref={effectsRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }} />
      {state.pathOpen && canvasUnavailable && <div aria-hidden="true" style={{ position: 'absolute', zIndex: 2, bottom: '18%', left: '30%', width: '50%', height: '4%', transform: 'rotate(-9deg)', opacity: .75, background: 'linear-gradient(90deg, transparent, #d1a17d 10%, #ead4a5 80%, transparent)', borderRadius: '50%' }} />}
      {(canvasUnavailable || missingArt) && <span className="stage-render-status" style={{ position: 'absolute', left: 16, bottom: 12, color: '#eee1cf', background: '#241e2ac9', padding: '4px 8px', fontSize: 11, zIndex: 5 }}>{missingArt ? '场景图片尚未载入，请刷新重试' : '静态舞台模式 · 故事仍可继续'}</span>}
    </div>
  );
}
