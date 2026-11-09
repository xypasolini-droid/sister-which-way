'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import './oppression-sequence.css';

type SequenceShot = { id: string; speaker: string; line: string; caption?: string; durationMs: number };
type Props = {
  shots: SequenceShot[];
  index: number;
  paused: boolean;
  suspended: boolean;
  exitLabel: string;
  onTogglePause: () => void;
  onAdvance: () => void;
  onSkip: () => void;
};

export default function OppressionSequence({ shots, index, paused, suspended, exitLabel, onTogglePause, onAdvance, onSkip }: Props) {
  const shot = shots[index];
  const sequenceRef = useRef<HTMLElement>(null);
  useEffect(() => { sequenceRef.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!shot || paused || suspended) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) onAdvance();
    }, shot.durationMs);
    return () => window.clearTimeout(timer);
  }, [shot, paused, suspended, onAdvance]);
  if (!shot) return null;
  return <section ref={sequenceRef} className="oppression-sequence" aria-label="故事演出" tabIndex={-1}>
    <div className="oppression-subtitle" aria-live="polite" aria-atomic="true"><span>{shot.speaker}</span><p>{shot.line}</p>{shot.caption && <small>{shot.caption}</small>}</div>
    <div className="oppression-playback">
      <div className="oppression-progress" aria-label={`演出第 ${index + 1} 镜，共 ${shots.length} 镜`}>
        {shots.map((item, at) => <i key={item.id} className={at === index ? 'is-current' : at < index ? 'is-seen' : ''}/>)}
      </div>
      <div>
        <button onClick={onTogglePause} aria-label={paused ? '继续演出' : '暂停演出'}>{paused ? <Play size={14}/> : <Pause size={14}/>}<span>{paused ? '继续' : '暂停'}</span></button>
        {index + 1 < shots.length && <button onClick={onAdvance}>下一句</button>}
        <button className="oppression-exit" onClick={onSkip}>{exitLabel}<ArrowRight size={15} aria-hidden="true"/></button>
      </div>
    </div>
  </section>;
}
