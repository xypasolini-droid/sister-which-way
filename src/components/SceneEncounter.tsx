'use client';

import { ArrowRight, BookOpen, Feather, LockKeyhole, MoonStar, RotateCcw } from 'lucide-react';
import { getChoices, type BranchState } from '@/lib/branch-story';
import { getSceneEncounter } from '@/lib/scene-encounter';
import './scene-encounter.css';

type Props = {
  state: BranchState;
  onChoose: (choiceId: string) => void;
  onRead: () => void;
  onCompose: () => void;
  onDream?: () => void;
  onReplay?: () => void;
  reducedMotion: boolean;
};

/** Every visible option is a story branch. No preparation or arithmetic gates. */
export default function SceneEncounter({ state, onChoose, onRead, onCompose, onDream, onReplay, reducedMotion }: Props) {
  const choices = getChoices(state).filter(choice => !choice.id.startsWith('dream_'));
  const encounter = getSceneEncounter(state);
  return <section className={`scene-encounter${reducedMotion ? ' scene-encounter--still' : ''}`} tabIndex={-1} aria-label="选择故事的方向">
    <div className="encounter-dock">
      <div className="encounter-heading"><p>{encounter.goal}</p><button className="encounter-tool" onClick={onRead}><BookOpen size={15}/><span>听他们说</span></button></div>
      <ol className="encounter-branches" aria-label="选一项，直接进入不同的故事路径">
        {choices.map((choice, index) => <li key={choice.id}><button disabled={!choice.enabled} onClick={() => onChoose(choice.id)}>
          <span className="encounter-index" aria-hidden="true">{choice.enabled ? `0${index + 1}` : <LockKeyhole size={14}/>}</span>
          <span className="encounter-choice-copy"><strong>{choice.label}</strong>{!choice.enabled && <small>{choice.reason}</small>}</span>
          {choice.enabled && <ArrowRight size={16} aria-hidden="true"/>}
        </button></li>)}
      </ol>
      <div className="encounter-footer"><button className="encounter-tool" onClick={onCompose}><Feather size={14}/>写自己的决定</button>{onReplay && <button className="encounter-tool" onClick={onReplay}><RotateCcw size={13}/>重看这一幕</button>}{onDream && <button className="encounter-tool" onClick={onDream}><MoonStar size={14}/>做一个梦</button>}</div>
    </div>
  </section>;
}
