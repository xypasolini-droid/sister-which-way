'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Download, Eye, Feather, Info, LockKeyhole, Maximize, MoreHorizontal, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import EndingTableau, { getEndingTableau } from './EndingTableau';
import SixStoryStage from './SixStoryStage';
import SceneEncounter from './SceneEncounter';
import OppressionSequence from './OppressionSequence';
import { createInitialState, getNode, getChoices, choose, getEnding, validateBranchState, ENDINGS, type BranchState } from '@/lib/branch-story';
import { storyPresentationKey } from '@/lib/story-presentation';
import { getSixChapter, getSixShots, getSixStill } from '@/lib/six-story-presentation';
import { createStoryAudio } from '@/lib/story-audio';
import { isMinitool, canFullscreen, readLocal, writeLocal, readSession, writeSession, downloadStory, enterFullscreen } from '@/lib/game-runtime';
import { initialPlayPhase, readPlayPosition, resolveSixPlayPhase, type PlayPhase, type PlayPosition } from '@/lib/play-flow';
import { getArchivedEnding, restoreEndingCollections, restoreTenEndingArchive, serializeEndingStates } from '@/lib/ending-collection';

type Frame = { state: BranchState; consequence: string; changes: string[]; action: string };
type Panel = 'journal' | 'endings' | 'menu' | 'about' | 'reset' | 'export' | null;
const SAVE = 'sister-which-way.play.r7', COLLECTION = 'sister-which-way.endings.r7', ENDING_STATES = 'sister-which-way.ending-states.r7';
const POSITION = 'sister-which-way.reading.r7', SETTINGS = 'sister-which-way.preferences.v3', SESSION = 'sister-entered.r7';
const fresh = (): Frame => ({ state: createInitialState('short'), consequence: '', changes: [], action: '' });
const PANEL_NAMES: Record<NonNullable<Panel>, string> = { journal: '走过的这一程', endings: '留下的故事', menu: '停一会儿', about: '关于这个故事', reset: '重新走一条路', export: '带走这一程' };
const modeLabel = (mode?: string) => mode === 'dream' ? '梦境' : mode === 'future' ? '原创未来' : '现实';

export default function SisterGame() {
  const [frames, setFrames] = useState<Frame[]>([fresh()]);
  const [ready, setReady] = useState(false), [entered, setEntered] = useState(false), [saved, setSaved] = useState(false);
  const [unlocked, setUnlocked] = useState<string[]>([]), [endingStates, setEndingStates] = useState<Record<string, BranchState>>({});
  const [oldUnlocked, setOldUnlocked] = useState<string[]>([]), [oldEndingStates, setOldEndingStates] = useState<Record<string, BranchState>>({});
  const [oldProgress, setOldProgress] = useState(false), [panel, setPanel] = useState<Panel>(null), [viewEnding, setViewEnding] = useState<string | null>(null);
  const [position, setPosition] = useState<PlayPosition | null>(null), [exportText, setExportText] = useState(''), [notice, setNotice] = useState('');
  const [systemReduced, setSystemReduced] = useState(false), [lessMotion, setLessMotion] = useState(false), [largeText, setLargeText] = useState(false);
  const [quiet, setQuiet] = useState(false), [paused, setPaused] = useState(false), [visible, setVisible] = useState(true), [sound, setSound] = useState(false);
  const audioRef = useRef<ReturnType<typeof createStoryAudio> | null>(null), dialogRef = useRef<HTMLDialogElement>(null);
  const current = frames[frames.length - 1], state = current.state, key = storyPresentationKey(state);
  const routeRef = useRef(key); routeRef.current = key;
  const node = getNode(state), ending = getEnding(state), shots = getSixShots(state);
  const recoveredPhase = position?.key === key ? position.phase : initialPlayPhase(state);
  const phase = resolveSixPlayPhase(recoveredPhase, Boolean(ending), shots.length);
  const index = position?.key === key ? Math.max(0, Math.min(position.index, shots.length - 1)) : 0;
  const activeShot = phase === 'cinematic' ? shots[index] : getSixStill(state);
  const chapter = getSixChapter(state), tableau = getEndingTableau(state.endingId), reduced = systemReduced || lessMotion;
  const viewingPrevious = Boolean(viewEnding?.startsWith('old:')), viewedId = viewingPrevious ? viewEnding!.slice(4) : viewEnding;
  const collectedId = viewedId && (viewingPrevious ? oldUnlocked : unlocked).includes(viewedId) ? viewedId : null;
  const collectedState = collectedId ? (viewingPrevious ? oldEndingStates : endingStates)[collectedId] : null;
  const originalTenEnding = viewingPrevious && collectedId?.startsWith('legacy10:') ? getArchivedEnding(collectedId) : null;
  const collectedEnding = originalTenEnding || (collectedState ? getEnding(collectedState) : viewingPrevious && collectedId ? getArchivedEnding(collectedId) : null);

  useEffect(() => {
    const stored = (storageKey: string) => { try { return readLocal(storageKey); } catch { return null; } };
    try {
      const raw = stored(SAVE);
      if (raw) {
        const data = JSON.parse(raw);
        if (!Array.isArray(data) || !data.length || data.length > 4) throw Error('save');
        const parsed: Frame[] = data.map((frame: Frame) => {
          const valid = validateBranchState(frame.state);
          if (!valid || valid.storyRevision !== 6 || valid.storyContentRevision !== 7) throw Error('revision');
          const last = valid.history.at(-1);
          return { state: valid, consequence: last?.consequence || '', action: last?.label || '', changes: Array.isArray(frame.changes) ? frame.changes.filter(x => typeof x === 'string').slice(0, 12) : [] };
        });
        setFrames(parsed);
      }
    } catch { setNotice('这一页暂时没有读出来。你可以从剪刀前重新开始；旧版进度仍保留。'); }
    // Read the original main save without migrating or rewriting it. A completed
    // old run is also a historical completion when its old collection is absent.
    let oldSnapshot: BranchState | null = null;
    const oldSave = stored('sister-which-way.v3');
    try {
      const oldFrames = JSON.parse(oldSave || 'null');
      if (Array.isArray(oldFrames) && oldFrames.length) oldSnapshot = validateBranchState(oldFrames.at(-1)?.state);
    } catch {}
    const collections = restoreEndingCollections({ ids: stored(COLLECTION), states: stored(ENDING_STATES) }, [
      { ids: stored('sister-which-way.endings.r6'), states: stored('sister-which-way.ending-states.r6'), revision: 'r5c6' },
      { ids: stored('sister-which-way.endings.r5'), states: stored('sister-which-way.ending-states.r5'), revision: 'r5c0' },
      { ids: stored('sister-which-way.endings.v3'), states: stored('sister-which-way.ending-states.v3'), revision: 'legacy' },
      restoreTenEndingArchive(stored('sister-which-way.ten-ending-archive.v1')),
      { ids: null, states: oldSnapshot?.endingId ? JSON.stringify({ completedMainSave: oldSnapshot }) : null },
    ]);
    setUnlocked(collections.current.ids); setEndingStates(collections.current.states);
    setOldUnlocked(collections.previous.ids); setOldEndingStates(collections.previous.states);
    setOldProgress(Boolean(oldSave) && !oldSnapshot?.endingId);
    try {
      setPosition(readPlayPosition(JSON.parse(stored(POSITION) || 'null')));
      const preferences = JSON.parse(stored(SETTINGS) || '{}');
      setLessMotion(preferences.lessMotion === true); setLargeText(preferences.largeText === true);
      setEntered(readSession(SESSION) === 'yes');
    } catch {}
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setSystemReduced(query.matches), updateVisibility = () => setVisible(!document.hidden && document.hasFocus());
    const suspend = () => setVisible(false);
    updateMotion(); updateVisibility(); query.addEventListener('change', updateMotion); document.addEventListener('visibilitychange', updateVisibility);
    window.addEventListener('blur', suspend); window.addEventListener('focus', updateVisibility);
    setReady(true);
    return () => { query.removeEventListener('change', updateMotion); document.removeEventListener('visibilitychange', updateVisibility); window.removeEventListener('blur', suspend); window.removeEventListener('focus', updateVisibility); };
  }, []);
  useEffect(() => {
    if (!ready) return;
    let active = true; setSaved(false);
    void writeLocal(SAVE, JSON.stringify(frames)).then(() => { if (active) setSaved(true); }).catch(() => { if (active) { setSaved(false); setNotice('进度暂时没能保存，请在手记里保留这一程。'); } });
    return () => { active = false; };
  }, [frames, ready]);
  useEffect(() => {
    if (!ready || phase !== 'ending' || !state.endingId) return;
    setUnlocked(ids => ids.includes(state.endingId!) ? ids : [...ids, state.endingId!]);
    setEndingStates(previous => previous[state.endingId!] === state ? previous : ({ ...previous, [state.endingId!]: state }));
  }, [ready, phase, state]);
  useEffect(() => { if (ready) void Promise.all([writeLocal(COLLECTION, JSON.stringify(unlocked)), writeLocal(ENDING_STATES, serializeEndingStates(endingStates, oldEndingStates))]).catch(() => setNotice('结局收藏暂时没能保存，请保留这一程。')); }, [unlocked, endingStates, oldEndingStates, ready]);
  useEffect(() => { if (ready) void writeLocal(POSITION, JSON.stringify({ key, index, phase })).catch(() => setNotice('播放位置暂时没能保存。')); }, [ready, key, index, phase]);
  useEffect(() => { if (ready) void writeLocal(SETTINGS, JSON.stringify({ lessMotion, largeText })).catch(() => undefined); }, [ready, lessMotion, largeText]);
  useEffect(() => { document.title = `${phase === 'ending' ? ending?.title : chapter} · 姐姐，我该怎么走`; }, [chapter, ending?.title, phase]);
  useEffect(() => { setPaused(false); }, [key]);
  useEffect(() => {
    const audio = audioRef.current; audio?.stop();
    if (sound && entered && visible && !paused && !panel && !quiet && phase === 'cinematic' && activeShot?.cue) audio?.play(activeShot.cue);
    return () => audio?.stop();
  }, [sound, entered, visible, paused, panel, quiet, phase, activeShot?.id, activeShot?.cue]);
  useEffect(() => () => { audioRef.current?.dispose(); audioRef.current = null; }, []);
  useEffect(() => {
    const dialog = dialogRef.current; if (!dialog) return;
    if (panel && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal(); else { dialog.setAttribute('open', ''); dialog.classList.add('dialog-fallback'); }
      dialog.scrollTop = 0; dialog.querySelector<HTMLButtonElement>('button')?.focus();
    } else if (!panel && dialog.hasAttribute('open')) { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
  }, [panel]);

  function setPhase(next: PlayPhase, at = 0) { setPosition({ key, index: at, phase: next }); }
  function finishSequence() { setPhase(ending ? 'ending' : 'explore'); }
  const advanceCinematic = useCallback(() => {
    if (routeRef.current !== key) return;
    const more = index < shots.length - 1;
    setPosition({ key, index: more ? index + 1 : 0, phase: more ? 'cinematic' : state.endingId ? 'ending' : 'explore' });
  }, [key, index, shots.length, state.endingId]);
  function commit(id: string) {
    if (!ready || phase !== 'explore' || state.endingId || routeRef.current !== key) return;
    const result = choose(state, id); if (!result) return;
    routeRef.current = storyPresentationKey(result.state);
    setFrames(old => [...old, { state: result.state, consequence: result.consequence, changes: result.changes, action: result.state.history.at(-1)?.label || '' }]);
    setPosition(null); setNotice(''); setPaused(false);
  }
  function undo() { if (frames.length < 2) return; setFrames(old => old.slice(0, -1)); setPosition(null); setPanel(null); setPaused(false); setNotice('已回到上一个决定。'); }
  function reset() { setFrames([fresh()]); setPosition(null); setNotice(''); setPanel(null); setQuiet(false); setPaused(false); }
  function enter() { setEntered(true); try { writeSession(SESSION, 'yes'); } catch {} }
  async function toggleSound() {
    audioRef.current ??= createStoryAudio();
    const enabled = await audioRef.current.setEnabled(!sound); setSound(enabled);
    if (!sound && !enabled) setNotice('当前设备未能开启声音，字幕与游玩仍可正常继续。');
  }
  function exportStory() {
    const text = ['# 姐姐，我该怎么走', '', '0.6.0 · 我的这一程', '', ...state.history.flatMap((step, at) => [`## ${at + 1}. ${step.label}`, step.consequence, '']), ...(ending ? [`## ${ending.number} ${ending.title} · ${modeLabel(ending.mode)}`, ending.summary, ...ending.paragraphs] : ['这一程，还没有走完。'])].join('\n');
    if (isMinitool) { setExportText(text); setPanel('export'); } else downloadStory(text);
  }
  async function fullscreen() { try { await enterFullscreen(); } catch { setNotice('当前浏览器没有进入全屏，仍可正常游玩。'); } setPanel(null); }
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (!entered || panel || quiet || event.repeat || event.isComposing || (event.target instanceof HTMLElement && /INPUT|TEXTAREA|BUTTON|SELECT/.test(event.target.tagName))) return;
      if (phase === 'cinematic' && (event.code === 'Space' || event.key === 'ArrowRight')) { event.preventDefault(); if (event.code === 'Space') setPaused(value => !value); else advanceCinematic(); }
      else if (phase === 'explore' && /^[123]$/.test(event.key)) { const choice = getChoices(state)[Number(event.key) - 1]; if (choice?.enabled) { event.preventDefault(); commit(choice.id); } }
    }
    window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey);
  });

  return <main className={`immersive-game six-edition${largeText ? ' is-large-text' : ''}${ending && phase === 'ending' ? ' has-fate-tableau' : ''}`}>
    <h1 className="sr-only">姐姐，我该怎么走</h1>
    <div className="immersive-world" data-phase={!entered ? 'intro' : phase} data-quiet={quiet} data-realm={activeShot?.realm || (phase === 'ending' ? ending?.mode : 'reality')}>
      {ending && phase === 'ending' ? <EndingTableau endingId={ending.id} reducedMotion={reduced}/> : activeShot && <SixStoryStage shot={activeShot} reducedMotion={reduced} paused={paused || !visible || Boolean(panel) || quiet || !entered}/>}
    </div>
    {!entered ? <section className="story-intro" aria-label="故事封面"><div className="intro-copy"><span className="eyebrow">一纸童话 · 姐妹的生存手记</span><p className="intro-title">姐姐，<br/>我该怎么走<span>？</span></p><p className="intro-subtitle">门外没有为她留路。<br/>姐姐拿着剪刀，等她回答。</p><button className="begin-button" disabled={!ready} onClick={enter}>{state.history.length ? '继续这一程' : '走进故事'}<ArrowRight size={20}/></button><button className="text-button intro-about" onClick={() => setPanel('about')}>关于这个故事</button></div><span className="intro-footer">六条命运 · 每一次选择，直接走向下一幕</span></section> : quiet ? <button className="return-story glass-button" onClick={() => setQuiet(false)}><BookOpen size={17}/>继续故事</button> : <>
      <header className="story-hud"><div className="place-caption"><span>{phase === 'ending' ? modeLabel(ending?.mode) : activeShot?.realm === 'dream' ? '梦中的故事' : activeShot?.realm === 'future' ? '多年以后 · 原创未来' : '萨岚城 · 姐妹的手记'}</span><p>{chapter}</p></div><nav aria-label="故事工具"><button className="sound-toggle" aria-label={sound ? '关闭声音' : '开启声音'} aria-pressed={sound} onClick={toggleSound}>{sound ? <Volume2 size={19}/> : <VolumeX size={19}/>}<span>{sound ? '声音开' : '声音关'}</span></button><button aria-label="手记" onClick={() => setPanel('journal')}><BookOpen size={20}/><span>手记</span></button><button aria-label="更多：阅读设置与重新开始" onClick={() => setPanel('menu')}><MoreHorizontal size={24}/><span>更多</span></button></nav></header>
      {phase === 'explore' && !ending && <SceneEncounter key={key} state={state} onChoose={commit} onRead={() => setPanel('journal')} onReplay={() => { setPaused(false); setPhase('cinematic'); }} reducedMotion={reduced}/>}
      {phase === 'cinematic' && <OppressionSequence key={key} shots={shots} index={index} paused={paused} suspended={Boolean(panel) || quiet || !visible} onTogglePause={() => setPaused(value => !value)} onAdvance={advanceCinematic} onSkip={finishSequence}/>}
      {phase === 'ending' && ending && <section className="story-dialogue story-dialogue--ending" tabIndex={-1} aria-label="当前故事"><div className="ending-scene"><span className="eyebrow">{modeLabel(ending.mode)} · 终幕 {ending.number}</span><h2>{ending.title}</h2><p className="ending-growth">{ending.summary}</p><p className="ending-fate">{tableau?.fate}</p><div className="ending-actions"><button className="continue-button" onClick={() => setPanel('reset')}>再走一条路<ArrowRight size={16}/></button><button className="text-button" onClick={() => { setPaused(false); setPhase('cinematic'); }}><RotateCcw size={14}/>重看结尾</button></div><button className="text-button" onClick={() => setPanel('journal')}>读完这一程<BookOpen size={15}/></button></div></section>}
      <footer className="story-bottomline"><span role="status">{saved ? <Check size={12}/> : <Feather size={12}/>} {notice || (saved ? '这一页，已替你留好' : ready ? '正在留存这一页' : '正在翻开故事')}</span></footer>
    </>}
    <dialog ref={dialogRef} className={`story-sheet${panel === 'reset' ? ' story-sheet--small' : ''}`} role="dialog" aria-modal={Boolean(panel)} aria-labelledby="sheet-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)}>
      <header className="sheet-header"><div><span className="eyebrow">姐姐，我该怎么走</span><h2 id="sheet-title">{panel ? PANEL_NAMES[panel] : ''}</h2></div><button className="icon-button" aria-label="合上，回到故事" onClick={() => setPanel(null)}><X size={21}/></button></header>
      <div className="sheet-content">
        {panel === 'journal' && <><div className="sheet-links"><button className="text-button" onClick={() => { setViewEnding(null); setPanel('endings'); }}>留下的结局 {unlocked.length} / 6<ArrowRight size={15}/></button><button className="text-button" onClick={exportStory}><Download size={15}/>带走这一程</button></div><article className="journal-current"><span className="eyebrow">{ending ? `${modeLabel(ending.mode)} · ${ending.number}` : chapter}</span><h3>{ending?.title || node.title}</h3>{(ending ? [ending.summary, ...ending.paragraphs] : node.paragraphs).map((paragraph, at) => <p key={at}>{paragraph}</p>)}{!ending && <blockquote>{node.sisterLine}</blockquote>}{node.tale && <><h3>她们讲的故事</h3><p>{node.tale}</p></>}</article><h3>你做过的决定</h3>{state.history.length ? <ol className="journey-list">{state.history.map((step, at) => <li key={`${at}-${step.nodeId}`}><span>{String(at + 1).padStart(2, '0')}</span><div><h4>{step.label}</h4><p>{step.consequence}</p></div></li>)}</ol> : <p className="muted">姐姐握着剪刀，正在等你的第一个回答。</p>}</>}
        {panel === 'endings' && <>{collectedEnding ? <article className="collected-ending"><button className="text-button" onClick={() => setViewEnding(null)}><ArrowLeft size={15}/>所有结局</button><span className="eyebrow">{viewingPrevious ? `历史记录 · ${collectedState?.storyRevision === 5 || collectedId?.startsWith('r5') ? '旧五结局版' : collectedId?.startsWith('legacy10:') ? '旧十结局版' : '早期版本'}` : modeLabel(collectedEnding.mode)} · {collectedEnding.number}</span><h3>{collectedEnding.title}</h3><p className="ending-lead">{collectedEnding.summary}</p>{collectedEnding.paragraphs.map((paragraph, at) => <p key={at}>{paragraph}</p>)}{viewingPrevious && <p className="muted">保留当时版本的原标题、编号与正文，不计入新版 6 / 6。</p>}</article> : <><p className="muted">每条命运都来自你实际做过的选择。未走过的终幕会留待亲眼看见。</p><ol className="ending-collection">{ENDINGS.map(item => <li key={item.id}><button disabled={!unlocked.includes(item.id)} onClick={() => setViewEnding(item.id)}><span>{item.number}</span><strong>{unlocked.includes(item.id) ? item.title : '还没有走到的地方'}</strong>{unlocked.includes(item.id) ? <ChevronRight size={18}/> : <LockKeyhole size={15}/>}</button></li>)}</ol>{oldUnlocked.length > 0 && <details className="historical-endings"><summary>历史版本 · {oldUnlocked.length} 条记录</summary><ol className="ending-collection">{oldUnlocked.map(id => { const archived = (id.startsWith('legacy10:') ? getArchivedEnding(id) : null) || (oldEndingStates[id] ? getEnding(oldEndingStates[id]) : getArchivedEnding(id)); return <li key={id}><button onClick={() => setViewEnding(`old:${id}`)}><span className="historical-number">旧版 {archived?.number}</span><strong>{archived?.title || '此前的故事'}</strong><ChevronRight size={18}/></button></li>; })}</ol></details>}{oldProgress && <p className="muted historical-progress">旧版进行中的进度仍原样留在设备上。新版从剪刀开场，不会把旧路线算成这六个结局。</p>}</>}</>}
        {panel === 'export' && <><p>这一程的完整记录，可以选中文字留存。</p><pre className="story-export-text">{exportText}</pre></>}
        {panel === 'menu' && <><div className="menu-actions"><button disabled={frames.length < 2} onClick={undo}><RotateCcw size={19}/><span>回到上一个决定</span><ChevronRight size={16}/></button><button onClick={() => { setPanel(null); setQuiet(true); }}><Eye size={19}/><span>静静看一会儿</span><ChevronRight size={16}/></button>{canFullscreen && <button onClick={fullscreen}><Maximize size={19}/><span>切换全屏</span><ChevronRight size={16}/></button>}<button onClick={() => setPanel('about')}><Info size={19}/><span>故事背景与玩法</span><ChevronRight size={16}/></button><button onClick={() => setPanel('reset')}><Feather size={19}/><span>从剪刀前重新开始</span><ChevronRight size={16}/></button></div><h3>按自己的节奏看</h3><label className="setting-row"><span>较大的字幕</span><input type="checkbox" checked={largeText} onChange={event => setLargeText(event.target.checked)}/></label><label className="setting-row"><span>减少画面运动{systemReduced && <small>系统设置已开启</small>}</span><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={event => setLessMotion(event.target.checked)}/></label><p className="muted keyboard-help">空格暂停／继续，→ 看下一镜；分支可按 1、2、3。切到后台会暂停。跳过演出只会抵达已选路径的下一幕或终幕。</p></>}
        {panel === 'about' && <><p className="about-lead">人需要故事，才能把今天走到明天。</p><p>这是受《养家之人》启发、按新故事图创作的分支游戏。努拉与萨岚城是虚构；生活环境具体参照 2001 年前后、塔利班统治下的阿富汗。故事中的禁令与施暴者不能代表整个伊斯兰世界。</p><p>父亲已经在全家眼前被捕。最后一点粮食旁，姐姐拿着剪刀等你回答。每条路线有两到三个关键选择；每次单选直接进入后续情节，其他冲突用短镜头自动演出，可暂停、跳过和重看。</p><p>六条命运包含饥饿、强迫婚姻、战争征用与暴力。05 是明确标识的未醒梦境；06 是女主醒来后，经过多年学习、互助与组织守望的原创未来。它们都不是影片实际结局的复述。</p><p>声音由你主动开启，关闭声音也有完整字幕。进度保存在当前设备，手记可查看完整故事与历史版本。</p>{!isMinitool && <div className="source-links"><a href="https://gkids.com/films/the-breadwinner/" target="_blank" rel="noreferrer">影片背景 · GKIDS<ArrowRight size={14}/></a><a href="https://www.hrw.org/reports/2001/afghan3/afgwrd1001-05.htm" target="_blank" rel="noreferrer">历史参考 · HRW 2001<ArrowRight size={14}/></a></div>}</>}
        {panel === 'reset' && <><p>回到最后一点粮食旁，姐姐还拿着剪刀。当前这一程会被替换，已经抵达的结局与旧版记录会保留。</p><button className="sheet-action" onClick={exportStory}><Download size={17}/>先带走当前故事<ArrowRight size={16}/></button><div className="reset-actions"><button className="text-button" onClick={() => setPanel(null)}>留在这一页</button><button className="continue-button" onClick={reset}>重新开始<ArrowRight size={17}/></button></div></>}
      </div>
    </dialog>
  </main>;
}
