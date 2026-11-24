import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Settings2, X, BookOpen, Film, RotateCcw, Mail, Check } from 'lucide-react';

import Envelope from './components/Envelope';
import PortraitIntro from './components/PortraitIntro';
import BirthdayReply from './components/BirthdayReply';
import { useContact } from './hooks/useContact';
const Letter = lazy(() => import('./components/Letter'));
import { messages, settings } from './data/messages';
import { playEffect } from './hooks/useAudio';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { setEffectVolume, stopEffects, type EffectKind } from './audio/soundEffects';

export default function App() {
  const [stage, setStage] = useState<'portrait' | 'welcome' | 'letters' | 'finale'>('portrait');
  const [chapter, setChapter] = useState(0);
  const [collection, setCollection] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(.7);
  const [effects, setEffects] = useState(true);
  const [music, setMusic] = useState(true);
  const [reading, setReading] = useState(true);
  const reduced = useReducedMotion();
  const contact = useContact();
  const contactEnabled = contact.enabled;
  const ambience = useBackgroundMusic(music, stage === 'letters', volume, muted);
  useEffect(() => {setEffectVolume(muted || !effects ? 0 : volume);}, [muted, effects, volume]);
  useEffect(() => () => stopEffects(), []);
  const effect = useCallback((kind: EffectKind) => { if (effects && !muted) playEffect(kind, volume); }, [effects, muted, volume]);
  const changeChapter = useCallback((next: number) => { if (next < 0 || next > 4) return; effect('page'); setChapter(next); setCollection(false); window.scrollTo({top: 0, behavior: 'instant'}); }, [effect]);
  const finish = useCallback(() => { setStage('finale'); effect('finale'); if (!reduced) void import('canvas-confetti').then(({default: confetti}) => confetti({particleCount: 55, spread: 65, origin: {y: .65}, colors: ['#C5A15C', '#55333C', '#e3d5b9'], disableForReducedMotion: true})); window.scrollTo({top: 0}); }, [effect, reduced]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {setShowSettings(false); setCollection(false);}
      if (stage !== 'letters' || collection || showSettings || (event.target as HTMLElement).closest('input, button')) return;
      if (event.key === 'ArrowRight') changeChapter(chapter + 1);
      if (event.key === 'ArrowLeft') changeChapter(chapter - 1);
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [chapter, stage, collection, showSettings, changeChapter]);
  const restart = () => {setStage('portrait'); setChapter(0); setCollection(false);};

  return <div className={`experience ${stage} ${reading ? 'reading-mode' : 'cinematic-mode'}`}>
    <a className="skip-link" href="#main">Skip to letter</a>
    <header className="site-header"><button className="brand" onClick={restart} aria-label="Return to the birthday introduction"><span className="brand-monogram">a.</span><span>A letter for her<span className="brand-subtitle">A BIRTHDAY KEEPSAKE</span></span></button>
      <div className="header-actions"><button className="sound-toggle" onClick={() => setMuted(!muted)} aria-label={muted ? 'Enable sound' : 'Mute sound'} aria-pressed={!muted}>{muted ? <VolumeX size={16}/> : <Volume2 size={16}/>}<span>Sound {muted ? 'off' : 'on'}</span></button><span className="header-divider"/><button className="icon-button" onClick={() => setShowSettings(!showSettings)} aria-label="Sound settings" aria-expanded={showSettings}><Settings2 size={18}/></button></div>
    </header>
    {showSettings && <aside className="settings-panel" aria-label="Sound settings"><div className="settings-heading"><h2>Make yourself comfortable</h2><button className="icon-button" onClick={() => setShowSettings(false)} aria-label="Close sound settings"><X size={18}/></button></div><label className="volume-label">Volume <input aria-label="Volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e => setVolume(Number(e.target.value))}/></label><label className="check-label"><input type="checkbox" checked={effects} onChange={e => setEffects(e.target.checked)}/> Gentle sound effects</label><label className="check-label"><input type="checkbox" checked={music} onChange={e => setMusic(e.target.checked)}/> Background music</label>{music && <div className="music-status"><p>{stage === 'letters' ? 'Music pauses while you read and listen.' : ambience.status === 'blocked' ? 'Music begins after your first tap.' : ambience.status === 'error' ? 'Music could not load. Try the next track.' : muted ? 'Music is muted.' : 'A soft instrumental playlist, on repeat.'}</p><div><span>{ambience.track.title}</span><button className="text-button" onClick={ambience.next}>Next track <ArrowRight size={13}/></button></div></div>}<a className="music-credit-link" href="/music-credits.html" target="_blank" rel="noreferrer">Music credits</a></aside>}
    <main id="main" tabIndex={-1}>
      <AnimatePresence mode="wait">
        {stage === 'portrait' && <PortraitIntro contactEnabled={contactEnabled} key="portrait" onContinue={() => {void import('./components/Letter'); effect('page'); setStage('welcome'); window.scrollTo({top:0});}}/>}
        {stage === 'welcome' && <motion.section key="welcome" className="welcome-screen" exit={{opacity: 0}} transition={{duration: reduced ? 0 : .3}}>
          <div className="welcome-heading"><h1>{settings.recipient},<br/>this letter is <em>for you.</em></h1><p>Five little chapters. One very special person.<br/>A birthday wish, waiting to be opened.</p></div>
          <Envelope onOpen={() => setStage('letters')} effect={effect}/>
          <div className="welcome-bottom"><span className="tiny-flower" aria-hidden="true">✳</span><p>Take a breath. Take your time.<br/><span>This moment is just for you.</span></p></div>
          <div className="side-note" aria-hidden="true">A FEW WORDS, A WHOLE LOT OF LOVE</div>
        </motion.section>}
        {stage === 'letters' && <motion.section key="letters" className="reading-layout" initial={reduced ? false : {opacity: 0}} animate={{opacity: 1}}>
          <nav className="chapter-sidebar" aria-label="Letter chapters"><p className="collection-label">Five chapters, for you</p>{messages.map((message, i) => <button key={message.id} className={`chapter-link ${chapter === i ? 'selected' : ''}`} onClick={() => changeChapter(i)} aria-current={chapter === i ? 'step' : undefined}><span>{String(i + 1).padStart(2, '0')}</span><span>{message.title}</span>{chapter > i && <Check size={13}/>}</button>)}<div className="sidebar-bottom"><Mail size={21}/><span>A little love.<br/>To keep forever.</span></div></nav>
          <div className="reader-column"><div className="reader-toolbar"><button className="text-button" onClick={() => setCollection(!collection)} aria-expanded={collection}>{collection ? <X size={15}/> : <BookOpen size={15}/>} {collection ? 'Close collection' : 'All letters'}</button><button className="text-button" onClick={() => setReading(!reading)}>{reading ? <Film size={15}/> : <BookOpen size={15}/>} {reading ? 'Cinematic mode' : 'Reading mode'}</button></div>
            {collection ? <div className="collection"><h1>Words to come back to.</h1><p>Choose a letter. Stay as long as you like.</p>{messages.map((message, i) => <button key={message.id} onClick={() => changeChapter(i)}><span className="collection-number">0{i + 1}</span><span><strong>{message.title}</strong><small>{message.subtitle}</small></span><ArrowUpRightIcon/></button>)}</div> : <><Suspense fallback={<div className="letter-paper" role="status">Unfolding your letter…</div>}><Letter key={chapter} message={messages[chapter]} index={chapter} reading={reading} volume={volume} muted={muted} onEnded={finish} onNarrationPlay={() => setMuted(false)}/></Suspense><div className="chapter-navigation"><button className="text-button" disabled={chapter === 0} onClick={() => changeChapter(chapter - 1)}><ArrowLeft size={16}/> Previous letter</button><span>0{chapter + 1} — 05</span><button className="next-button" onClick={() => chapter === 4 ? finish() : changeChapter(chapter + 1)}>{chapter === 4 ? 'One final wish' : 'Next letter'}<ArrowRight size={16}/></button></div></>}
          </div>
        </motion.section>}
        {stage === 'finale' && <motion.section key="finale" className="finale-screen" initial={reduced ? false : {opacity: 0}} animate={{opacity: 1}} transition={{duration: 1}}><div className="finale-seal" aria-hidden="true">a</div><h1>Here’s to your<br/><em>next beautiful chapter.</em></h1><p>More reasons to smile. More dreams to follow.<br/>More beautiful moments to remember.</p><span className="script">Happy birthday, {settings.recipient}.</span><span className="finale-sender">With love, {settings.sender}</span><button className="next-button" onClick={restart}><RotateCcw size={16}/> Open it all again</button><button className="text-button" onClick={() => {setStage('letters'); setCollection(true);}}>Return to the letters <ArrowRight size={15}/></button><BirthdayReply enabled={contactEnabled} endpoint={contact.endpoint}/></motion.section>}
      </AnimatePresence>
    </main>
    <footer className="site-footer"><span>MADE OF WORDS. FILLED WITH LOVE.</span><span>Made with care, just for {settings.recipient}.</span><span>KEEP THIS MOMENT</span></footer>
  </div>;
}
function ArrowUpRightIcon() {return <ArrowRight className="collection-arrow" size={19}/>;}



