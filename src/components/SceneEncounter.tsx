'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronRight, Hand, MapPin, Feather, MessageCircle, Minus, MoonStar, PackageOpen, Plus, Scale, Undo2 } from 'lucide-react';
import { getChoices, type BranchState } from '@/lib/branch-story';
import { getSceneEncounter, resolveEncounterAction, resolveEncounterActivity, toggleEncounterItem } from '@/lib/scene-encounter';
import './scene-encounter.css';

type Props = { state: BranchState; onChoose: (choiceId: string) => void; onRead: () => void; onCompose: () => void; onDream?: () => void; reducedMotion: boolean };
const ACTIVITY_ICONS = { pack: PackageOpen, share: Hand, compare: Scale, route: MapPin, reply: MessageCircle, remember: BookOpen };

export default function SceneEncounter({ state, onChoose, onRead, onCompose, onDream, reducedMotion }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [wage, setWage] = useState('6');
  const encounterRef = useRef<HTMLElement>(null);
  const pendingPackFocus = useRef<{ id: string; location: 'bag' | 'mat' } | null>(null);
  const encounter = getSceneEncounter(state);
  const activity = encounter.activity;
  const result = resolveEncounterActivity(state, selected);
  const choices = getChoices(state);
  const choice = choices.find(item => item.id === result.choiceId);
  const activityChoiceIds = activity ? ['route', 'reply'].includes(activity.kind) ? activity.items.map(item => item.id) : [activity.choiceId] : [];
  const activityChoice = activity && !['route', 'reply'].includes(activity.kind) ? choices.find(item => item.id === activity.choiceId) : undefined;
  const actions = encounter.points.filter(item => !activityChoiceIds.includes(item.choiceId));
  const Icon = activity ? ACTIVITY_ICONS[activity.kind] : Hand;
  useLayoutEffect(() => {
    const pending = pendingPackFocus.current;
    if (!pending) return;
    pendingPackFocus.current = null;
    encounterRef.current?.querySelector<HTMLButtonElement>(`[data-pack-item="${pending.id}"][data-pack-location="${pending.location}"]`)?.focus({ preventScroll: true });
  }, [selected]);
  function select(id: string) {
    if (!activity) return;
    if (state.nodeId === 'n01') pendingPackFocus.current = { id, location: selected.includes(id) ? 'mat' : 'bag' };
    const next = toggleEncounterItem(activity, selected, id);
    submitSelection(next);
  }
  function submitSelection(next: string[]) {
    setSelected(next);
    const action = resolveEncounterAction(state, next);
    if (action) onChoose(action);
  }
  function reviseWage(next: string) { setSelected([]); setWage(next); }
  return <section ref={encounterRef} className={`scene-encounter${reducedMotion ? ' scene-encounter--still' : ''}`} tabIndex={-1} aria-label="在场景中行动" data-activity={activity?.kind || 'observe'}>
    <div className="encounter-purpose"><span>此刻，你可以做的</span><p>{encounter.goal}</p></div>
    <div className="encounter-hotspots" role="group" aria-label="选择一个行动，立即继续">
      {actions.map((item, index) => {
        const action = choices.find(candidate => candidate.id === item.choiceId);
        if (!action) return null;
        return <button key={item.id} className={`encounter-hotspot encounter-hotspot--${index}`} disabled={!action.enabled} onClick={() => onChoose(action.id)}>
          <span className="encounter-hotspot-mark" aria-hidden="true"><ArrowRight size={13}/></span><span>{activity && '或：'}{action.label}{!action.enabled && <small>{action.reason}</small>}</span>
        </button>;
      })}
    </div>
    <div className="encounter-dock">
      <div className="encounter-heading"><div><Icon size={15}/><h2>{activity?.title || '你想怎么走'}</h2></div><button className="encounter-read" onClick={onRead}><BookOpen size={14}/>听他们说<ChevronRight size={13}/></button></div>
      {activity && <div className={`encounter-activity encounter-activity--${activity.kind}`}>
        <p className="encounter-instruction">{activityChoice && !activityChoice.enabled ? activityChoice.reason : activity.instruction}</p>
        {state.nodeId === 'n01' ? <div className="encounter-packing" role="group" aria-label="把旧物收进布包">
          <div className="encounter-pack-source"><span className="encounter-area-label">旧毯上</span><div>{activity.items.filter(item => !selected.includes(item.id)).map(item => <button className="encounter-loose-item" key={item.id} data-pack-item={item.id} data-pack-location="mat" onClick={() => select(item.id)}><PackageOpen size={17}/><span>{item.label}</span><ArrowRight size={13}/></button>)}{selected.length === activity.items.length && <p>摊上的旧物收好了。</p>}</div></div>
          <div className="encounter-pack-bag"><span className="encounter-area-label">布包里 · {selected.length} / {activity.items.length}</span><div><img src="/art/sister/bag.png" alt=""/><div>{activity.items.filter(item => selected.includes(item.id)).map(item => <button key={item.id} className="encounter-packed-item" data-pack-item={item.id} data-pack-location="bag" onClick={() => select(item.id)} aria-label={`从布包取出${item.id === 'buttons' ? '纽扣' : '布料'}`}><Check size={12}/><span>{item.id === 'buttons' ? '纽扣' : '布料'}</span><Undo2 size={12}/></button>)}{!selected.length && <p>布包还空着</p>}</div></div></div>
        </div> : state.nodeId === 'n10' ? <div className="encounter-wage" role="group" aria-label="核对工钱">
          <div className="encounter-wage-facts"><span>4 件 × 每件 2 枚</span><small>送货人已经付了 6 枚。</small></div><div className="encounter-wage-count"><label htmlFor="encounter-wage-total">应付</label><button aria-label="应付工钱减一枚" onClick={() => reviseWage(String(Math.max(0, (Number(wage) || 0) - 1)))}><Minus size={15}/></button><input id="encounter-wage-total" aria-label="应付工钱（枚）" type="number" inputMode="numeric" min="0" max="20" step="1" value={wage} onChange={event => reviseWage(event.target.value)}/><button aria-label="应付工钱加一枚" onClick={() => reviseWage(String(Math.min(20, (Number(wage) || 0) + 1)))}><Plus size={15}/></button><span>枚</span></div><button className="encounter-wage-check" disabled={activityChoice ? !activityChoice.enabled : false} onClick={() => submitSelection([Number(wage) === 8 ? 'eight' : 'six'])}>核对<Check size={14}/></button>
        </div> : <div className="encounter-items" role="group" aria-label={activity.title}>
          {activity.items.map(item => {
            const direct = ['route', 'reply'].includes(activity.kind) ? choices.find(candidate => candidate.id === item.id) : activityChoice;
            return <button key={item.id} className={`encounter-item${selected.includes(item.id) ? ' is-selected' : ''}`} aria-pressed={['route', 'reply', 'share'].includes(activity.kind) ? undefined : selected.includes(item.id)} disabled={direct ? !direct.enabled : false} onClick={() => select(item.id)}>
            {item.image && <img src={item.image} alt=""/>}<span><strong>{item.label}</strong>{direct && !direct.enabled ? <small>{direct.reason}</small> : item.note && <small>{item.note}</small>}</span><span className={`encounter-item-check${['route', 'reply', 'share'].includes(activity.kind) ? ' encounter-item-action' : ''}`} aria-hidden="true">{['route', 'reply', 'share'].includes(activity.kind) ? <ArrowRight size={13}/> : selected.includes(item.id) && <Check size={13}/>}</span>
          </button>; })}
        </div>}
      </div>}
      <div className="encounter-response" aria-live="polite" aria-atomic="true">
        {selected.length > 0 && <><span>{result.complete ? '暂时走不通' : activity?.correction ? '再核一遍' : '还差一步'}</span><p>{choice && !choice.enabled ? choice.reason : result.response}</p></>}
      </div>
      <div className="encounter-footer"><button className="encounter-secondary" onClick={onCompose}><Feather size={13}/>写自己的决定</button>{onDream && <button className="encounter-secondary" onClick={onDream}><MoonStar size={13}/>做一个梦</button>}</div>
    </div>
  </section>;
}
