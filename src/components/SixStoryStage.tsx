'use client';

import type { CSSProperties } from 'react';
import { SIX_ART, type SixShot } from '@/lib/six-story-presentation';
import './six-story-stage.css';

/** A composed scene owns the cast and their actions; no floating portrait stack. */
export default function SixStoryStage({ shot, reducedMotion, paused = false }: { shot: SixShot; reducedMotion: boolean; paused?: boolean }) {
  const art = SIX_ART[shot.art];
  return <figure className={`six-story-stage${reducedMotion ? ' six-story-stage--still' : ''}`} data-shot={shot.id} data-art={shot.art} data-realm={shot.realm || 'reality'} data-paused={paused} aria-label={art.alt} style={{ '--scene-backdrop': `url("${art.src}")` } as CSSProperties}>
    <img key={art.src} className="six-story-image" src={art.src} width={1672} height={941} alt={art.alt} fetchPriority="high" decoding="async" draggable={false} style={{ '--shot-duration': `${shot.durationMs}ms`, objectPosition: shot.position || 'center 42%' } as CSSProperties}/>
    <div className="six-story-shade" aria-hidden="true"/>
  </figure>;
}
