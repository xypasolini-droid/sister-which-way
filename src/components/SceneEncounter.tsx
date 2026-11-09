'use client';

import { useEffect, useRef } from 'react';
import { ArrowRight, BookOpen, LockKeyhole, MoonStar, RotateCcw } from 'lucide-react';
import { getChoices, getNode, type BranchState } from '@/lib/branch-story';
import { getSceneEncounter } from '@/lib/scene-encounter';
import './scene-encounter.css';

type Props = {
  state: BranchState;
  onChoose: (choiceId: string) => void;
  onRead: () => void;
  onDream?: () => void;
  onReplay?: () => void;
  reducedMotion: boolean;
};

/** Every visible option is a story branch. No preparation or arithmetic gates. */
export default function SceneEncounter({ state, onChoose, onRead, onDream, onReplay, reducedMotion }: Props) {
  const closing = state.nodeId === 'n30';
  const choiceRef = useRef<HTMLElement>(null);
  const currentEdition = state.storyRevision === 7;
  useEffect(() => { if (currentEdition) choiceRef.current?.focus({ preventScroll: true }); }, [currentEdition]);
  const modern = state.storyRevision === 6 || state.storyRevision === 7;
  const choices = getChoices(state).filter(choice => modern || state.storyRevision === 5 || closing || !choice.id.startsWith('dream_'));
  const encounter = modern ? { goal: getNode(state).sisterLine } : getSceneEncounter(state);
  return <section ref={choiceRef} className={`scene-encounter${reducedMotion ? ' scene-encounter--still' : ''}`} tabIndex={-1} aria-label={currentEdition ? `第 ${state.history.length + 1} 次选择，共两次` : '选择故事的方向'}>
    <div className="encounter-dock">
      {currentEdition && <p className="encounter-step">第 {state.history.length + 1} 次选择 · 共 2 次</p>}
      <div className="encounter-heading"><p>{encounter.goal}</p><button className="encounter-tool" onClick={onRead}><BookOpen size={15}/><span>{modern ? '读手记' : '听他们说'}</span></button></div>
      <ol className="encounter-branches" data-count={choices.length} aria-label="选一项，直接进入不同的故事路径">
        {choices.map((choice, index) => <li key={choice.id}><button disabled={!choice.enabled} onClick={() => onChoose(choice.id)}>
          <span className="encounter-index" aria-hidden="true">{choice.enabled ? `0${index + 1}` : <LockKeyhole size={14}/>}</span>
          <span className="encounter-choice-copy">{(closing || (state.storyRevision === 5 && choice.finish?.startsWith('dream_'))) && <small className="encounter-ending-kind">{(choice.finish?.startsWith('dream_') || choice.id.startsWith('dream_')) ? '成年童话' : '现实终章'}</small>}<strong>{choice.label}</strong>{choice.qualities?.length ? <small className="encounter-qualities">{choice.qualities.join(' · ')}</small> : null}{!choice.enabled && <small>{choice.reason}</small>}</span>
          {choice.enabled && <ArrowRight size={16} aria-hidden="true"/>}
        </button></li>)}
      </ol>
      <div className="encounter-footer">{onReplay && <button className="encounter-tool" onClick={onReplay}><RotateCcw size={13}/>{currentEdition && state.history.length === 0 ? '观看开场' : '重看这一幕'}</button>}{onDream && !modern && state.storyRevision !== 5 && !closing && <button className="encounter-tool" onClick={onDream}><MoonStar size={14}/>做一个梦</button>}</div>
    </div>
  </section>;
}
