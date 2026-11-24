import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw, Headphones, Star, Flower2, Image } from 'lucide-react';
import type { Message } from '../data/messages';
import { useAudio } from '../hooks/useAudio';
import SpokenText from './SpokenText';

const format = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
export default function Letter({message, index, reading, volume, muted, onEnded, onNarrationPlay}: {message: Message; index: number; reading: boolean; volume: number; muted: boolean; onEnded: () => void; onNarrationPlay: () => void}) {
  const audio = useAudio(message.audio, volume, muted);
  const reduced = useReducedMotion();
  const active = message.cues.findIndex(cue => audio.time >= cue.start && audio.time < cue.end);
  const sentence = useRef<HTMLButtonElement | null>(null);
  const ended = audio.duration > 0 && audio.time >= audio.duration;
  const spoken = (text: string, block: string) => message.words?.length ? <SpokenText text={text} block={block} words={message.words} time={audio.time} follow={audio.playing}/> : text;
  useEffect(() => { if (ended && index === 4) onEnded(); }, [ended, index, onEnded]);
  useEffect(() => { if (!reading && active >= 0) sentence.current?.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block: 'nearest'}); }, [active, reading, reduced]);
  return <motion.article className={`letter-paper ${message.treatment}`} initial={reduced ? false : {opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} transition={{duration: .5}} aria-labelledby="letter-title">
    <div className="paper-top"><span>A LETTER FOR YOU</span><span>{String(index + 1).padStart(2, '0')} / 05</span></div>
    <div className="letter-title-row"><h1 id="letter-title">{spoken(message.title, 'title')}</h1><span className="chapter-ornament" aria-hidden="true">{message.treatment === 'stars' ? <Star/> : <Flower2/>}</span></div>
    <p className="letter-subtitle">{spoken(message.subtitle, 'subtitle')}</p><div className="fine-rule" />
    <h2 className="script letter-greeting">{spoken(message.greeting, 'greeting')}</h2>
    {message.treatment === 'memories' && <div className="memory-strip">{message.images.length ? message.images.map(image => <figure key={image.src}><img src={image.src} alt={image.alt}/></figure>) : <div className="memory-note"><Image size={22}/><span>Your own photographs can live here.<br/>For now, a little room for remembering.</span></div>}</div>}
    <div className="letter-body">
      {message.cues.length && message.audio && !message.words?.length ? message.cues.map((cue, i) => <button ref={i === active ? sentence : undefined} key={i} onClick={() => audio.seek(cue.start)} className={`sentence ${i === active ? 'active-sentence' : ''}`} aria-label={`Seek to sentence ${i + 1}`} style={{opacity: reading || i <= active || !audio.playing ? 1 : .55}}>{cue.text}</button>) : message.paragraphs.map((p, i) => <p key={p} className={message.treatment === 'scrapbook' ? 'appreciation' : ''}>{message.treatment === 'stars' && <Star className="wish-star" size={15}/>} {message.treatment === 'scrapbook' && <span className="note-number">{spoken(String(i + 1).padStart(2, '0'), `note-${i}`)}</span>}{spoken(p, `paragraph-${i}`)}</p>)}
    </div>
    <div className="signature"><span className="script">{spoken(message.signature + ',', 'signature')}</span><span>{spoken(index === 4 ? 'A little love, always.' : 'Written with care', 'signoff')}</span></div>
    <div className="audio-player">
      <button className="play-button" onClick={() => {if (!audio.playing) onNarrationPlay(); audio.toggle();}} disabled={audio.status !== 'ready' && audio.status !== 'blocked'} aria-label={audio.playing ? 'Pause narration' : 'Play narration'}>{audio.playing ? <Pause size={18}/> : <Play size={18}/>}</button>
      <div className="audio-info"><div className="audio-name"><Headphones size={13}/><span>{message.narrator}</span><span className="voice-description">{message.voice}</span></div>
        {audio.status === 'ready' || audio.status === 'blocked' ? <><input aria-label="Narration position" type="range" min="0" max={audio.duration} step=".01" value={audio.time} onChange={e => audio.seek(Number(e.target.value))}/>{audio.status === 'blocked' && <p className="audio-status" role="status">Tap play once to enable narration in this browser.</p>}<div className="audio-times"><span>{format(audio.time)}</span><span>{format(audio.duration)}</span></div></> : <p className="audio-status" role="status">{audio.status === 'missing' ? 'Recording not added yet. Enjoy the letter in reading mode.' : audio.status === 'loading' ? 'Loading your narration…' : 'This recording could not load. The full letter is here to read.'}</p>}
      </div><button className="icon-button" onClick={() => {onNarrationPlay(); audio.replay();}} disabled={audio.status !== 'ready' && audio.status !== 'blocked'} aria-label="Replay narration"><RotateCcw size={16}/></button>
    </div>
    {audio.duration > 0 && <div className="reading-progress" aria-label="Narration progress" role="progressbar" aria-valuenow={Math.round(audio.time / audio.duration * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${audio.time / audio.duration * 100}%`}}/></div>}
  </motion.article>;
}



