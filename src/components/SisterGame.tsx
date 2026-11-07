'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Backpack, BookOpen, Check, ChevronRight, Download, Eye, Feather, Info, LockKeyhole, Maximize, MoonStar, MoreHorizontal, RotateCcw, X } from 'lucide-react';
import NarrativeStage from './NarrativeStage';
import { createInitialState, getNode, getChoices, choose, getEnding, interpretChoice, validateBranchState, ENDINGS, NODES, ACT_TITLES, STAT_LABELS, type BranchState, type Stats } from '@/lib/branch-story';
import { buildReadingBeats, getCompanionStatus, storyPresentationKey } from '@/lib/story-presentation';
import { selectNarrativeStage } from '@/lib/narrative-stage-state';
import { observeDecisionMode } from '@/lib/decision-mode';

type Frame = { state: BranchState; consequence: string; changes: string[]; action: string };
type Panel = 'bag' | 'journal' | 'tale' | 'endings' | 'choices' | 'dreams' | 'menu' | 'about' | 'reset' | null;
type Phase = 'reading' | 'choice' | 'compose' | 'ending';
type ReadingPosition = { key: string; index: number; phase: Phase };
const SAVE = 'sister-which-way.v3';
const COLLECTION = 'sister-which-way.endings.v3';
const ENDING_STATES = 'sister-which-way.ending-states.v3';
const POSITION = 'sister-which-way.reading.v6';
const SETTINGS = 'sister-which-way.preferences.v3';
const fresh = (): Frame => ({ state: createInitialState(), consequence: '', changes: [], action: '' });
const SCENES: Record<string, string> = { home: '家中的房间', market: '旧城集市', workshop: '裁缝铺', courtyard: '石榴庭院', clinic: '街角诊所', checkpoint: '城门检查点', prison: '拘留所外院', road: '通向山口的路' };
const ITEMS: Record<string, string> = { book: '父亲的书', ribbon: '姐妹的缎带', bread: '面饼', medicine: '药包', documents: '地址与旧纸', letter: '往来的信件', evidence: '父亲的身份线索', lantern: '油灯', caravan: '接应的约定', school: '庭院课堂' };
const PANEL_NAMES: Record<NonNullable<Panel>, string> = { bag: '带在身边的', journal: '走过的这一程', tale: '姐姐讲过的童话', endings: '留下的故事', choices: '先想一想', dreams: '让故事做一个梦', menu: '停一会儿', about: '关于这个故事', reset: '重新走一条路' };

export default function SisterGame() {
  const [frames, setFrames] = useState<Frame[]>([fresh()]);
  const [ready, setReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const [saved, setSaved] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [endingStates, setEndingStates] = useState<Record<string, BranchState>>({});
  const [panel, setPanel] = useState<Panel>(null);
  const [viewEnding, setViewEnding] = useState<string | null>(null);
  const [position, setPosition] = useState<ReadingPosition | null>(null);
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  const [lessMotion, setLessMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const epoch = useRef(0);
  const request = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const current = frames[frames.length - 1];
  const state = current.state;
  const key = storyPresentationKey(state);
  const routeRef = useRef(key);
  routeRef.current = key;
  const node = getNode(state);
  const choices = getChoices(state);
  const ordinaryChoices = choices.filter(choice => !choice.id.startsWith('dream_'));
  const dreamChoices = choices.filter(choice => choice.id.startsWith('dream_'));
  const ending = getEnding(state);
  const dreamEnding = Boolean(state.endingId?.startsWith('dream_'));
  const companion = getCompanionStatus(state);
  const stage = selectNarrativeStage({ ...state, scene: ending?.scene || node.scene, ending: state.endingId });
  const placeName = stage.locationName || SCENES[ending?.scene || node.scene];
  const beats = buildReadingBeats(state, current.consequence);
  const phase = position?.key === key ? position.phase : 'reading';
  const beatIndex = position?.key === key ? Math.max(0, Math.min(position.index, beats.length - 1)) : 0;
  const beat = beats[beatIndex];
  const fatherStatus = state.nodeId === 'n01' ? '与你一起在市场摆摊'
    : state.nodeId === 'n02' ? phase === 'reading' && beatIndex < 3 ? '武装者闯进家中，正在把他带走' : '刚刚在全家人面前被抓走，押往拘留院'
    : state.father === 'free' ? '已从监所出来，仍需要照护'
    : state.father === 'located' ? '已进一步确认拘押信息，还没能带他回来'
    : '被抓进拘留院后，尚未得到他的近况';
  const inTale = entered && phase === 'reading' && beat?.kind === 'tale';
  const sceneBeats = beats.filter(item => (item.kind === 'tale') === inTale);
  const sceneBeatIndex = Math.max(0, sceneBeats.indexOf(beat));
  const reduced = systemReduced || lessMotion;
  const collectedId = viewEnding && unlocked.includes(viewEnding) ? viewEnding : null;
  const collectedEnding = collectedId && endingStates[collectedId] ? getEnding(endingStates[collectedId]) : null;
  const legacyEnding = collectedId && !collectedEnding ? ENDINGS.find(e => e.id === collectedId) : null;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE);
      if (raw) {
        const data = JSON.parse(raw);
        if (!Array.isArray(data) || !data.length || data.length > 40) throw Error('save');
        const parsed: Frame[] = data.map((f: Frame) => {
          const valid = validateBranchState(f.state);
          if (!valid || typeof f.consequence !== 'string' || typeof f.action !== 'string' || !Array.isArray(f.changes) || !f.changes.every(x => typeof x === 'string')) throw Error('save');
          const last = valid.history.at(-1);
          const originalLabel = f.state.history.at(-1)?.label;
          return { state: valid, consequence: last?.consequence || '', action: f.action === originalLabel ? last?.label || '' : f.action.slice(0, 240), changes: f.changes.slice(0, 12) };
        });
        setFrames(parsed);
      }
    } catch { setNotice('旧存档没能读出来，已翻开新的故事。'); }
    try {
      const ids: unknown = JSON.parse(localStorage.getItem(COLLECTION) || '[]');
      if (Array.isArray(ids)) setUnlocked([...new Set(ids.filter((x): x is string => typeof x === 'string' && ENDINGS.some(e => e.id === x)))]);
      const raw: unknown = JSON.parse(localStorage.getItem(ENDING_STATES) || '{}');
      const valid: Record<string, BranchState> = {};
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) for (const [id, value] of Object.entries(raw)) {
        const snapshot = validateBranchState(value);
        if (snapshot?.endingId === id) valid[id] = snapshot;
      }
      setEndingStates(valid);
    } catch {}
    try {
      const stored = JSON.parse(localStorage.getItem(POSITION) || 'null');
      if (stored && typeof stored.key === 'string' && Number.isInteger(stored.index) && ['reading', 'choice', 'compose', 'ending'].includes(stored.phase)) setPosition(stored);
      const preferences = JSON.parse(localStorage.getItem(SETTINGS) || '{}');
      setLessMotion(preferences.lessMotion === true); setLargeText(preferences.largeText === true);
      setEntered(sessionStorage.getItem('sister-entered.v4') === 'yes');
    } catch {}
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(query.matches);
    update(); query.addEventListener('change', update);
    const stopObservingMode = observeDecisionMode(setAi);
    setBusy(false);
    setReady(true);
    return () => {
      query.removeEventListener('change', update);
      stopObservingMode();
      epoch.current++;
      const retiredRequest = request.current;
      request.current = null;
      pending.current = false;
      retiredRequest?.abort();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(SAVE, JSON.stringify(frames)); setSaved(true); }
    catch { setSaved(false); setNotice('浏览器暂时无法保存，请在手记里导出这一程。'); }
    if (state.endingId) {
      setUnlocked(ids => ids.includes(state.endingId!) ? ids : [...ids, state.endingId!]);
      setEndingStates(previous => ({ ...previous, [state.endingId!]: state }));
    }
  }, [frames, ready, state]);
  useEffect(() => { if (ready) { try { localStorage.setItem(COLLECTION, JSON.stringify(unlocked)); localStorage.setItem(ENDING_STATES, JSON.stringify(endingStates)); } catch {} } }, [unlocked, endingStates, ready]);
  useEffect(() => { if (ready) { try { localStorage.setItem(POSITION, JSON.stringify({ key, index: beatIndex, phase })); } catch {} } }, [ready, key, beatIndex, phase]);
  useEffect(() => { if (ready) { try { localStorage.setItem(SETTINGS, JSON.stringify({ lessMotion, largeText })); } catch {} } }, [ready, lessMotion, largeText]);
  useEffect(() => { document.title = `${ending?.title || node.title} · 姐姐，我该怎么走`; }, [node.title, ending?.title]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (panel && dialog) {
      if (!dialog.open) dialog.showModal();
      dialog.scrollTop = 0;
      dialog.querySelector<HTMLButtonElement>('button')?.focus();
    }
    if (!panel && dialog?.open) dialog.close();
  }, [panel, viewEnding]);
  useEffect(() => { if (phase === 'compose') composeRef.current?.focus(); }, [phase]);

  function setPhase(next: Phase, index = beatIndex) { setPosition({ key, index, phase: next }); }
  function invalidateRequest() {
    epoch.current++;
    const retiredRequest = request.current;
    request.current = null;
    pending.current = false;
    retiredRequest?.abort();
    setBusy(false);
  }
  function focusStory() { requestAnimationFrame(() => storyRef.current?.focus({ preventScroll: true })); }
  function enter() { setEntered(true); try { sessionStorage.setItem('sister-entered.v4', 'yes'); } catch {} focusStory(); }
  function advance() {
    if (phase !== 'reading') return;
    if (beatIndex < beats.length - 1) setPhase('reading', beatIndex + 1);
    else setPhase(ending ? 'ending' : 'choice');
  }
  function commit(id: string, words = '') {
    if (routeRef.current !== key) return;
    const result = choose(state, id);
    if (!result) { setFeedback('这条路暂时走不通。看看下面的条件，再选一次。'); return; }
    invalidateRequest();
    routeRef.current = storyPresentationKey(result.state);
    const label = choices.find(c => c.id === id)?.label || words;
    setFrames(old => [...old, { state: result.state, consequence: result.consequence, changes: result.changes, action: words || label }].slice(-40));
    setPosition(null); setDraft(''); setFeedback(''); setNotice(''); focusStory();
  }
  async function submitText() {
    const text = draft.trim();
    if (!text || !ready || pending.current || ending) return;
    const id = ++epoch.current;
    const origin = key;
    const controller = new AbortController();
    request.current = controller; pending.current = true; setBusy(true); setFeedback('');
    const active = () => epoch.current === id && routeRef.current === origin;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      let result = interpretChoice(state, text);
      if (!result.choiceId && ai) {
        try {
          const response = await fetch('/api/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ state, input: text }), signal: controller.signal });
          if (!response.ok) throw Error('unavailable');
          const data = await response.json();
          if (!active()) return;
          if (data.choiceId && choices.some(c => c.id === data.choiceId && c.enabled)) result = { choiceId: data.choiceId, message: '' };
          else result.message = typeof data.message === 'string' ? data.message : result.message;
          if (data.mode === 'fallback') setNotice('讲述者暂时没有回应；你仍可选择这一页的行动。');
        } catch { if (active()) setNotice('连接暂时中断。你的文字还在，也可以直接选择行动。'); }
      }
      if (!active()) return;
      if (result.choiceId) commit(result.choiceId, text);
      else setFeedback(result.message || '请写得具体一点，或选择这一页的行动。');
    } finally {
      clearTimeout(timer);
      if (active()) { pending.current = false; request.current = null; setBusy(false); }
    }
  }
  function undo() {
    if (frames.length < 2) return;
    invalidateRequest(); setFrames(old => old.slice(0, -1)); setPosition(null); setFeedback(''); setDraft(''); setPanel(null);
    setNotice('已回到上一个决定，人物与物资也回到当时。'); focusStory();
  }
  function reset() {
    invalidateRequest(); setFrames([fresh()]); setPosition(null); setDraft(''); setFeedback(''); setNotice(''); setPanel(null); setQuiet(false); focusStory();
  }
  function exportStory() {
    const text = ['# 姐姐，我该怎么走', '', '萨岚城 · 我的这一程', '', ...state.history.flatMap((h, i) => [`## ${i + 1}. ${NODES[h.nodeId]?.title || h.nodeId}`, `我选择：${h.label}`, '', h.consequence, '']), ...(ending ? [`## ${dreamEnding ? '梦境结局' : '结局'}：${ending.title}`, ending.summary, ...ending.paragraphs] : ['这一程，还没有走完。'])].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = '姐姐，我该怎么走-我的故事.md'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { setNotice('这个浏览器没有进入全屏；你仍可以继续阅读。'); }
    setPanel(null);
  }
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!entered || panel || e.isComposing || e.keyCode === 229 || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') { setQuiet(false); return; }
      if (quiet || (e.target instanceof HTMLElement && e.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))) return;
      if (phase === 'reading' && (e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); advance(); }
      if (phase === 'choice' && /^[1-3]$/.test(e.key)) { const option = ordinaryChoices[Number(e.key) - 1]; if (option?.enabled) { e.preventDefault(); commit(option.id); } }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  });

  return <main className={`immersive-game${largeText ? ' is-large-text' : ''}${reduced ? ' is-reduced-motion' : ''}`}>
    <h1 className="sr-only">姐姐，我该怎么走</h1>
    <div className="immersive-world" data-phase={!entered ? 'intro' : phase} data-quiet={quiet} data-realm={inTale ? 'tale' : dreamEnding ? 'dream' : 'real'} data-speaking={entered && phase === 'reading' ? beat?.actor : undefined}>
      <NarrativeStage scene={ending?.scene || node.scene} outfit={state.outfit} sister={state.sister} father={state.father} scarf={state.scarf} stats={state.stats} flags={state.flags} nodeId={state.nodeId} beatIndex={beatIndex} phase={!entered ? 'intro' : phase} actionLabel={current.action} reducedMotion={reduced} ending={state.endingId} day={node.day} immersive />
      {inTale && <div className="tale-world" role="img" aria-label="童话里，一簇提灯的火苗走进红金色纸片森林。"><img className="tale-forest" src="/art/scene-forest.png" alt=""/><div className="tale-halo"/><img className="tale-traveler" src="/art/sister-v2/tale-flame.png" alt=""/><span className="tale-speck tale-speck--one"/><span className="tale-speck tale-speck--two"/><span className="tale-speck tale-speck--three"/></div>}
    </div>
    {!entered ? <section className="story-intro" aria-label="故事封面">
      <div className="intro-copy"><span className="eyebrow">一纸童话 · 姐妹的生存手记</span><p className="intro-title">姐姐，<br/>我该怎么走<span>？</span></p><p className="intro-subtitle">当世界不肯让路，<br/>我们还可以把故事讲下去。</p>
      <button className="begin-button" disabled={!ready} onClick={enter}>{state.history.length ? '继续这一程' : '走进故事'}<ArrowRight size={20}/></button>
      <button className="text-button intro-about" onClick={() => setPanel('about')}>关于这个故事</button></div>
      <span className="intro-footer">无需赶路 · 你可以随时停下</span>
    </section> : quiet ? <button className="return-story glass-button" onClick={() => { setQuiet(false); focusStory(); }}><BookOpen size={17}/>继续故事</button> : <>
      <header className="story-hud">
        <div className="place-caption"><span>{inTale ? '童话 · 她们正在讲述' : dreamEnding ? '梦境 · 她想象的未来' : <>第 {node.day} 日 <i/> {placeName}</>}</span><p>{inTale ? '火苗走过的路' : dreamEnding ? '另一种明天' : ACT_TITLES[node.act - 1]}</p></div>
        <nav aria-label="故事工具"><button aria-label="行囊" onClick={() => setPanel('bag')}><Backpack size={20}/><span>行囊</span></button><button aria-label="手记" onClick={() => setPanel('journal')}><BookOpen size={20}/><span>手记</span></button><button aria-label="更多：阅读设置与重新开始" onClick={() => setPanel('menu')}><MoreHorizontal size={24}/><span>更多</span></button></nav>
      </header>
      <section className={`story-dialogue story-dialogue--${phase}`} ref={storyRef} tabIndex={-1} aria-label="当前故事">
        {phase === 'reading' && <>
          <div className="dialogue-meta"><span className={`speaker speaker--${beat?.kind}`}><i/>{beat?.speaker || '努拉'}</span><span className="dialogue-progress" aria-label={`这一幕第${sceneBeatIndex + 1}句，共${sceneBeats.length}句`}>{sceneBeats.map((item, index) => <i key={item.id} className={index === sceneBeatIndex ? 'is-current' : index < sceneBeatIndex ? 'is-read' : ''}/>)}</span></div>
          <p key={beat?.id} className="spoken-line" aria-live="polite" aria-atomic="true">{beat?.text}</p>
          <div className="dialogue-actions"><div><button className="icon-button" aria-label="上一句" disabled={beatIndex === 0} onClick={() => setPhase('reading', beatIndex - 1)}><ArrowLeft size={16}/></button><button className="text-button" onClick={() => setPhase(ending ? 'ending' : 'choice')}>{ending ? '查看结局' : '直接做选择'}</button><button className="text-button subtitle-journal" onClick={() => setPanel('journal')}>读手记</button></div><button className="continue-button" onClick={advance}>{beatIndex < beats.length - 1 ? '继续' : ending ? '收好这一程' : '我该怎么走'}<ChevronRight size={17}/></button></div>
        </>}
        {(phase === 'choice' || phase === 'compose') && !ending && <>
          <div className="dialogue-meta"><h2>姐姐，我该怎么走？</h2><button className="icon-button" aria-label="重读这一页" onClick={() => setPhase('reading', 0)}><BookOpen size={17}/></button></div>
          {phase === 'choice' ? <><ol className="story-choices">{ordinaryChoices.map((choice, i) => <li key={choice.id}><button disabled={!ready || !choice.enabled} onClick={() => commit(choice.id)}><span className="choice-index">{choice.enabled ? `0${i + 1}` : <LockKeyhole size={14}/>}</span><span><strong>{choice.label}</strong><small>{!choice.enabled ? choice.reason : null}</small></span>{choice.enabled && <ArrowRight className="choice-arrow" size={18}/>}</button></li>)}</ol><div className="choice-tools"><button className="write-decision text-button" onClick={() => setPhase('compose')}><Feather size={16}/>写下我的决定</button><button className="text-button" onClick={() => setPanel('choices')}><Info size={15}/>先想一想</button>{dreamChoices.length > 0 && <button className="text-button dream-entry" onClick={() => setPanel('dreams')}><MoonStar size={15}/>做一个梦</button>}</div></> : <form className="decision-form" onSubmit={e => { e.preventDefault(); void submitText(); }}><label htmlFor="decision">你想怎样走下一步？</label><p id="decision-hint">用自己的话表达这一页的行动。{ai ? '讲述者会尝试理解你的意图。' : `例如「${choices.find(choice => choice.enabled)?.label || '先停下来想一想'}」。`}</p><textarea ref={composeRef} id="decision" value={draft} onChange={e => setDraft(e.target.value)} maxLength={180} rows={2} aria-describedby="decision-hint decision-feedback" placeholder="姐姐，我想……" onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); void submitText(); } }}/><div className="compose-actions"><button type="button" className="text-button" onClick={() => { invalidateRequest(); setPhase('choice'); }}>返回选择</button><button className="continue-button" disabled={busy || !draft.trim()}>{busy ? '正在读你的决定…' : '把它写进故事'}<ArrowRight size={16}/></button></div></form>}
        </>}
        {phase === 'ending' && ending && <div className="ending-scene"><span className="eyebrow">{dreamEnding ? '梦境结局 · 她选择想象的未来' : '你们走到了这里'} · {ending.number}</span><h2>{ending.title}</h2><div className="ending-actions"><button className="continue-button" onClick={exportStory}><Download size={16}/>带走这一程</button><button className="text-button" onClick={() => setPanel('reset')}>再走一条路<ArrowRight size={16}/></button></div><button className="text-button" onClick={() => setPanel('journal')}>在手记里读完结尾<BookOpen size={15}/></button></div>}
        <p className="decision-feedback" id="decision-feedback" role="status">{feedback || notice}</p>
      </section>
      <footer className="story-bottomline"><span>{saved ? <Check size={12}/> : <Feather size={12}/>} {saved ? '这一页，已替你留好' : '正在翻开故事'}</span><span>姐姐，我该怎么走</span></footer>
    </>}
    <dialog ref={dialogRef} className={`story-sheet${panel === 'reset' ? ' story-sheet--small' : ''}`} aria-labelledby="sheet-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={e => { if (e.target === e.currentTarget) { const rect = e.currentTarget.getBoundingClientRect(); if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) setPanel(null); } }}>
      <header className="sheet-header"><div><span className="eyebrow">姐姐，我该怎么走</span><h2 id="sheet-title">{panel ? PANEL_NAMES[panel] : ''}</h2></div><button className="icon-button" aria-label="合上，回到故事" onClick={() => setPanel(null)}><X size={21}/></button></header>
      <div className="sheet-content">
        {panel === 'bag' && <><div className="companion-note"><span className="eyebrow">姐姐 · 玛莉安</span><p>{companion.label}</p></div><dl className="people-status"><div><dt>你的名字</dt><dd>{state.flags.includes('aliasAatish') ? '家人叫你努拉；在外你叫阿提什，意为火焰。' : '努拉'}</dd></div><div><dt>母亲</dt><dd>{state.flags.includes('motherHurt') ? '寻父途中受了伤，仍在恢复。' : '在家照顾幼弟，也在为一家人的生计忧心。'}</dd></div><div><dt>幼弟 · 萨米</dt><dd>三岁，需要家人的陪伴、食物和照看。</dd></div><div><dt>你此刻的衣着</dt><dd>{state.outfit === 'cloak' ? '绿色头巾、长衫与宽裤' : state.outfit === 'worker' ? '浅灰小帽、灰色男式长衫与宽裤' : state.flags.includes('disguise') ? '浅灰小帽、男孩装束与出行布袋' : '长衫、宽裤与出行布袋'}</dd></div><div><dt>父亲</dt><dd>{fatherStatus}</dd></div></dl><h3>行囊与约定</h3><ul className="inventory">{Object.entries(ITEMS).filter(([id]) => state.flags.includes(id)).map(([id, label]) => <li key={id}><span/>{label}</li>)}</ul><details className="supply-details"><summary>看看家里的状况</summary><dl className="supply-grid">{(Object.keys(STAT_LABELS) as (keyof Stats)[]).map(stat => <div key={stat}><dt>{STAT_LABELS[stat]}</dt><dd>{state.stats[stat]}<small> / 10</small></dd><meter min="0" max="10" value={state.stats[stat]} aria-label={STAT_LABELS[stat]}/></div>)}</dl><p className="muted">这些数值记录游戏状态。家人的身体、姐妹的关系与物资，会改变能走的路。</p></details>{current.changes.length > 0 && <><h3>刚刚发生的变化</h3><ul className="change-list">{current.changes.map((change, i) => <li key={i}>{change}</li>)}</ul></>}</>}
        {panel === 'journal' && <><div className="sheet-links"><button className="text-button" onClick={() => setPanel('tale')}><Feather size={16}/>姐姐的童话</button><button className="text-button" onClick={() => { setViewEnding(null); setPanel('endings'); }}>留下的结局 {unlocked.length} / {ENDINGS.length}<ArrowRight size={15}/></button></div><article className="journal-current"><span className="eyebrow">现在 · {placeName}</span><h3>{ending?.title || node.title}</h3>{(ending ? [ending.summary, ...ending.paragraphs] : node.paragraphs).map((p, i) => <p key={i}>{p}</p>)}{!ending && <blockquote>{companion.speaker}：「{node.sisterLine}」</blockquote>}</article><h3>你做过的决定</h3>{state.history.length ? <ol className="journey-list">{state.history.map((step, i) => <li key={`${i}-${step.nodeId}`}><span>{String(i + 1).padStart(2, '0')}</span><div><h4>{step.label}</h4><p>{step.consequence}</p></div></li>)}</ol> : <p className="muted">这一页还没有落笔。第一个决定，就在门外。</p>}<button className="sheet-action" onClick={exportStory}><Download size={17}/>导出我的故事<ArrowRight size={16}/></button></>}
        {panel === 'choices' && <><p className="muted">先看清每条路的代价。这里不会替你作决定。</p><ul className="choice-considerations">{ordinaryChoices.map((choice, i) => <li key={choice.id}><span className="eyebrow">0{i + 1}</span><h3>{choice.label}</h3><p>{choice.detail}</p>{!choice.enabled && <p className="muted">暂时走不通：{choice.reason}</p>}</li>)}</ul><button className="sheet-action" onClick={() => setPanel(null)}>回去做决定<ArrowRight size={16}/></button></>}
        {panel === 'dreams' && <><p className="dream-preface">这是阿提什讲给自己的未来。现实还在门外，梦里，她可以先为自己和别的女孩开一扇门。</p><ul className="dream-options">{dreamChoices.map(choice => <li key={choice.id}><button disabled={!choice.enabled} onClick={() => { setPanel(null); commit(choice.id); }}><MoonStar size={22}/><span><strong>{choice.label}</strong><small>{choice.detail}</small></span><ArrowRight size={17}/></button></li>)}</ul><p className="muted">梦境是原创愿景，不是历史事件，也不会改写现实中家人的伤势与去向。</p></>}
        {panel === 'tale'   && <><p className="tale-preface">现实里没有无敌的人。可在自己讲述的故事里，她仍然有一个不能被夺走的名字。</p><blockquote className="tale-quote">{node.tale}</blockquote><p className="muted">童话会陪着这一程变化。它不能取消现实的代价，却让你们记得为什么继续。</p><button className="text-button" onClick={() => setPanel('journal')}><ArrowLeft size={15}/>回到手记</button></>}
        {panel === 'endings' && <>{collectedEnding ? <article className="collected-ending"><button className="text-button" onClick={() => setViewEnding(null)}><ArrowLeft size={15}/>所有结局</button>{collectedId?.startsWith('dream_') && <span className="eyebrow">梦境 · 她选择想象的未来</span>}<h3>{collectedEnding.title}</h3><p className="ending-lead">{collectedEnding.summary}</p>{collectedEnding.paragraphs.map((p, i) => <p key={i}>{p}</p>)}<p className="muted">这是你抵达这一结局时，家人与故事的真实状态。</p></article> : legacyEnding ? <><button className="text-button" onClick={() => setViewEnding(null)}><ArrowLeft size={15}/>所有结局</button><h3>{legacyEnding.title}</h3><p>这份旧记录保留了结局名称，没有当时的家庭状态。重新走到这里后，会收好完整正文。</p></> : <><p className="muted">每条路都有留下的人，也有没能带走的东西。未走过的结局不会提前揭开。</p><ol className="ending-collection">{ENDINGS.map((e, i) => <li key={e.id}><button disabled={!unlocked.includes(e.id)} onClick={() => setViewEnding(e.id)}><span>{String(i + 1).padStart(2, '0')}</span><strong>{unlocked.includes(e.id) ? `${e.id.startsWith('dream_') ? '梦境 · ' : ''}${e.title}` : '还没有走到的地方'}</strong>{unlocked.includes(e.id) ? <ChevronRight size={18}/> : <LockKeyhole size={15}/>}</button></li>)}</ol></>}</>}
        {panel === 'menu' && <><div className="menu-actions"><button disabled={frames.length < 2} onClick={undo}><RotateCcw size={19}/><span>回到上一个决定</span><ChevronRight size={16}/></button><button onClick={() => { setPanel(null); setQuiet(true); }}><Eye size={19}/><span>静静看一会儿</span><ChevronRight size={16}/></button><button onClick={fullscreen}><Maximize size={19}/><span>切换全屏</span><ChevronRight size={16}/></button><button onClick={() => setPanel('about')}><Info size={19}/><span>故事背景与玩法</span><ChevronRight size={16}/></button><button onClick={() => setPanel('reset')}><Feather size={19}/><span>重新走一条路</span><ChevronRight size={16}/></button></div><h3>按自己的节奏读</h3><label className="setting-row"><span>较大的故事文字</span><input type="checkbox" checked={largeText} onChange={e => setLargeText(e.target.checked)}/></label><label className="setting-row"><span>减少画面运动{systemReduced && <small>系统设置已开启</small>}</span><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e => setLessMotion(e.target.checked)}/></label><p className="muted keyboard-help">正文可用空格 / → 继续；做选择时按 1、2、3。没有倒计时，也不会自动替你选择。</p></>}
        {panel === 'about' && <><p className="about-lead">人需要故事，才能把今天走到明天。</p><p>这是一个受《养家的人》启发的原创分支故事。努拉、玛莉安与萨岚城为虚构；服饰与生活限制以 2001 年前后、塔利班统治下的阿富汗为具体参照。不同地区、家庭与场合并不相同，故事中的命令不能代表整个伊斯兰世界。</p><p>你会经历匮乏、盘查、失散和家人间的争执。选择有代价，善意也未必立刻得到回报。你可以随时停下，再回来陪她们走一段。</p><h3>怎样继续</h3><p>每场以2–4轮人物对话推进，随后做选择。完整背景与经历留在手记里；也可以用自己的话表达当前页面的决定。文字会匹配已写好的分支，尚不能任意创造新场景。30 个故事节点通向 10 种结局，其中 2 种是清楚标识的愿望梦境。一次旅程只经过其中一部分。</p><p>行囊里能查看物资与家人的状况，手记保留完整剧情和决定。进度自动保存在当前浏览器；“更多”中可以撤回上一个决定。本轮重排了故事开端，旧版存档保留在原位置，新版单独开始。</p><div className="source-links"><a href="https://gkids.com/films/the-breadwinner/" target="_blank" rel="noreferrer">影片背景 · GKIDS<ArrowRight size={14}/></a><a href="https://www.hrw.org/reports/2001/afghan3/afgwrd1001-05.htm" target="_blank" rel="noreferrer">历史参考 · HRW 2001 年报告<ArrowRight size={14}/></a></div></>}
        {panel === 'reset' && <><p>这一程会从父女摆摊的集市重新开始。已经收好的结局仍会保留。</p><p className="muted">如果想留住当前经历，可以先把它带走。</p><button className="sheet-action" onClick={exportStory}><Download size={17}/>导出当前故事<ArrowRight size={16}/></button><div className="reset-actions"><button className="text-button" onClick={() => setPanel(null)}>留在这一页</button><button className="continue-button" onClick={reset}>重新开始<ArrowRight size={17}/></button></div></>}
      </div>
    </dialog>
  </main>;
}
