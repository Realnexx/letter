import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { musicTracks } from '../data/music';

export function useBackgroundMusic(enabled: boolean, paused: boolean, volume: number, muted: boolean) {
  const sound = useRef<Howl | null>(null);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<'loading'|'playing'|'paused'|'blocked'|'error'>('loading');
  const failures = useRef(new Set<number>());
  const preferences = useRef({enabled, paused, volume, muted});
  preferences.current = {enabled, paused, volume, muted};
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setStatus('loading');
    const allowed = () => {const p=preferences.current;return p.enabled && !p.paused && !p.muted;};
    const audio = new Howl({src:[musicTracks[index].src], html5:true, preload:true, volume:muted ? 0 : volume * .12,
      onload: () => {
        if (!alive) return;
        audio.volume(preferences.current.volume * .12);
        if (allowed()) audio.play(); else setStatus('paused');
      },
      onplay: () => {if (alive) {if (!allowed()) audio.pause(); else setStatus('playing');}},
      onpause: () => {if (alive) setStatus('paused');},
      onend: () => {if (alive) setIndex(i => (i+1)%musicTracks.length);},
      onplayerror: () => {if (alive) setStatus('blocked');},
      onloaderror: () => {
        if (!alive) return;
        failures.current.add(index);
        if (failures.current.size < musicTracks.length) setIndex(i => (i+1)%musicTracks.length);
        else setStatus('error');
      },
    });
    sound.current=audio;
    // The first interaction retries playback if the browser blocked page-load audio.
    const retry = () => {if (alive && allowed() && audio.state()==='loaded' && !audio.playing()) audio.play();};
    window.addEventListener('pointerup',retry);window.addEventListener('keydown',retry);
    return () => {alive=false;window.removeEventListener('pointerup',retry);window.removeEventListener('keydown',retry);audio.unload();sound.current=null;};
  }, [index, enabled]);
  useEffect(() => {
    const audio=sound.current;
    if (!audio) return;
    audio.volume(muted ? 0 : volume*.12);
    if (paused || muted || !enabled) audio.pause();
    else if (audio.state()==='loaded' && !audio.playing()) audio.play();
  }, [enabled, paused, volume, muted]);
  return {track:musicTracks[index], status, next:()=>{failures.current.clear();setIndex(i=>(i+1)%musicTracks.length);}};
}
