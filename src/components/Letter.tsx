import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Play, Pause, RotateCcw, Headphones, Star, Flower2, Image } from 'lucide-react';
import type { Message } from '../data/messages';
import { useAudio } from '../hooks/useAudio';

const format = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
export default function Letter({message, index, reading, volume, muted, onEnded}: {message: Message; index: number; reading: boolean; volume: number; muted: boolean; onEnded: () => void}) {
  const audio = useAudio(message.audio, volume, muted);
  const reduced = useReducedMotion();
  const active = message.cues.findIndex(cue => audio.time >= cue.start && audio.time < cue.end);
  const sentence = useRef<HTMLButtonElement | null>(null);
  const ended = audio.duration > 0 && audio.time >= audio.duration;
  useEffect(() => { if (ended && index === 4) onEnded(); }, [ended, index, onEnded]);
  useEffect(() => { if (!reading && active >= 0) sentence.current?.scrollIntoView({behavior: reduced ? 'instant' : 'smooth', block: 'nearest'}); }, [active, reading, reduced]);
  return <motion.article className={`letter-paper ${message.treatment}`} initial={reduced ? false : {opacity: 0, y: 18}} animate={{opacity: 1, y: 0}} transition={{duration: .5}} aria-labelledby="letter-title">
    <div className="paper-top"><span>A LETTER FOR YOU</span><span>{String(index + 1).padStart(2, '0')} / 05</span></div>
    <div className="letter-title-row"><h1 id="letter-title">{message.title}</h1><span className="chapter-ornament" aria-hidden="true">{message.treatment === 'stars' ? <Star/> : <Flower2/>}</span></div>
    <p className="letter-subtitle">{message.subtitle}</p><div className="fine-rule" />
    <h2 className="script letter-greeting">{message.greeting}</h2>
    {message.treatment === 'memories' && <div className="memory-strip">{message.images.length ? message.images.map(image => <figure key={image.src}><img src={image.src} alt={image.alt}/></figure>) : <div className="memory-note"><Image size={22}/><span>Your own photographs can live here.<br/>For now, a little room for remembering.</span></div>}</div>}
    <div className="letter-body">
      {message.cues.length && message.audio ? message.cues.map((cue, i) => <button ref={i === active ? sentence : undefined} key={i} onClick={() => audio.seek(cue.start)} className={`sentence ${i === active ? 'active-sentence' : ''}`} aria-label={`Seek to sentence ${i + 1}`} style={{opacity: reading || i <= active || !audio.playing ? 1 : .55}}>{cue.text}</button>) : message.paragraphs.map((p, i) => <p key={p} className={message.treatment === 'scrapbook' ? 'appreciation' : ''}>{message.treatment === 'stars' && <Star className="wish-star" size={15}/>} {message.treatment === 'scrapbook' && <span className="note-number">{String(i + 1).padStart(2, '0')}</span>}{p}</p>)}
    </div>
    <div className="signature"><span className="script">{message.signature},</span><span>{index === 4 ? 'A little love, always.' : 'Written with care'}</span></div>
    <div className="audio-player">
      <button className="play-button" onClick={audio.toggle} disabled={audio.status !== 'ready'} aria-label={audio.playing ? 'Pause narration' : 'Play narration'}>{audio.playing ? <Pause size={18}/> : <Play size={18}/>}</button>
      <div className="audio-info"><div className="audio-name"><Headphones size={13}/><span>{message.narrator}</span><span className="voice-description">{message.voice}</span></div>
        {audio.status === 'ready' ? <><input aria-label="Narration position" type="range" min="0" max={audio.duration} step=".1" value={audio.time} onChange={e => audio.seek(Number(e.target.value))}/><div className="audio-times"><span>{format(audio.time)}</span><span>{format(audio.duration)}</span></div></> : <p className="audio-status" role="status">{audio.status === 'missing' ? 'Recording not added yet. Enjoy the letter in reading mode.' : audio.status === 'loading' ? 'Loading your narration…' : 'This recording could not load. The full letter is here to read.'}</p>}
      </div><button className="icon-button" onClick={audio.replay} disabled={audio.status !== 'ready'} aria-label="Replay narration"><RotateCcw size={16}/></button>
    </div>
    {audio.duration > 0 && <div className="reading-progress" aria-label="Narration progress" role="progressbar" aria-valuenow={Math.round(audio.time / audio.duration * 100)} aria-valuemin={0} aria-valuemax={100}><span style={{width: `${audio.time / audio.duration * 100}%`}}/></div>}
  </motion.article>;
}
