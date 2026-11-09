import { useEffect, type CSSProperties } from 'react';
import { getSevenScene } from '@/lib/seven-story-scenes';
import type { SevenShot } from '@/lib/seven-story-presentation';
import './layered-story-stage.css';

type Props = {
  shot: SevenShot;
  nextShot?: SevenShot;
  playing: boolean;
  paused: boolean;
  reducedMotion: boolean;
};

export default function LayeredStoryStage({ shot, nextShot, playing, paused, reducedMotion }: Props) {
  const scene = getSevenScene(shot);

  useEffect(() => {
    if (!nextShot) return;
    const next = getSevenScene(nextShot);
    const urls = new Set([next.background, ...next.actors.map(actor => actor.src)]);
    if (next.foreground) urls.add(next.foreground);
    urls.forEach(url => { new Image().src = url; });
  }, [nextShot]);

  return <figure
    className="layered-story-stage"
    aria-label={scene.alt}
    data-shot={shot.id}
    data-realm={shot.realm ?? 'reality'}
    data-atmosphere={scene.atmosphere}
    data-light={scene.light}
    data-matched-rail={Boolean(scene.foregroundClip && scene.foreground === scene.background)}
    data-playing={playing}
    data-paused={paused}
    data-reduced={reducedMotion}
    style={{ '--stage-backdrop': `url("${scene.background}")`, '--beat': `${shot.durationMs}ms` } as CSSProperties}
  >
    <div className="layered-story-stage__frame" aria-hidden="true">
      <img className="layered-story-stage__background" src={scene.background} alt="" draggable={false} fetchPriority="high"/>
      <div className="layered-story-stage__air"/>
      {scene.actors.map(actor => <div
        key={actor.id}
        className="layered-story-stage__mark"
        data-layer={actor.kind ?? 'actor'}
        data-performer={actor.id}
        data-dim={actor.dim || undefined}
        style={{ left: `${actor.x}%`, top: `${actor.y}%`, height: `${actor.height}%`, zIndex: actor.z ?? Math.round(actor.y) }}
      >
        <div
          key={`${shot.id}/${actor.src}`}
          className="layered-story-stage__performance"
          data-mirrored={actor.mirror || undefined}
          data-motion={actor.motion ?? 'breathe'}
          style={{ '--action-delay': `${actor.delay ?? 0}ms` } as CSSProperties}
        >
          {actor.kind !== 'prop' && <span className="layered-story-stage__contact"/>}
          <img className="layered-story-stage__sprite" src={actor.src} alt="" data-mirrored={actor.mirror || undefined} draggable={false}/>
        </div>
      </div>)}
      {scene.foreground && <img className="layered-story-stage__foreground" src={scene.foreground} alt="" draggable={false} style={{ clipPath: scene.foregroundClip }}/>}
      <div className="layered-story-stage__light"/>
    </div>
    <div className="layered-story-stage__shade" aria-hidden="true"/>
  </figure>;
}
