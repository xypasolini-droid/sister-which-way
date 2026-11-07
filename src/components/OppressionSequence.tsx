'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import type { DramaShot } from '@/lib/oppression-scenes';
import './oppression-sequence.css';

type Props = { shots: DramaShot[]; index: number; paused: boolean; suspended: boolean; onTogglePause: () => void; onAdvance: () => void; onSkip: () => void };

export default function OppressionSequence({ shots, index, paused, suspended, onTogglePause, onAdvance, onSkip }: Props) {
  const shot = shots[index];
  const [visible, setVisible] = useState(true);
  const sequenceRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useEffect(() => { sequenceRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!shot || paused || suspended || !visible) return;
    const timer = window.setTimeout(onAdvance, shot.durationMs);
    return () => window.clearTimeout(timer);
  }, [shot?.id, shot?.durationMs, paused, suspended, visible, onAdvance]);
  if (!shot) return null;
  return <section ref={sequenceRef} className="oppression-sequence" aria-label="故事演出" tabIndex={-1}>
    <div className="oppression-subtitle" aria-live="polite" aria-atomic="true"><span>{shot.speaker}</span><p>{shot.line}</p><small>{shot.caption}</small></div>
    <div className="oppression-playback"><div className="oppression-progress" aria-label={`演出第 ${index + 1} 镜，共 ${shots.length} 镜`}>{shots.map((item, at) => <i key={item.id} className={at === index ? 'is-current' : at < index ? 'is-seen' : ''}/>)}</div><div><button onClick={onTogglePause} aria-label={paused ? '继续演出' : '暂停演出'}>{paused ? <Play size={14}/> : <Pause size={14}/>}<span>{paused ? '继续演出' : '暂停'}</span></button><button onClick={onSkip}><SkipForward size={14}/><span>跳过演出</span></button></div></div>
  </section>;
}
