import { useEffect, useRef, useState } from 'react';
import { Howl, Howler } from 'howler';
import { settings } from '../data/messages';

// One narration owner. Chapter changes always release the previous recording.
export function useAudio(src: string | null, volume: number, muted: boolean) {
  const sound = useRef<Howl | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState<'missing' | 'loading' | 'ready' | 'error'>('missing');
  useEffect(() => {
    setTime(0); setDuration(0); setPlaying(false);
    if (!src) { setStatus('missing'); return; }
    setStatus('loading');
    const audio = new Howl({ src: [src], html5: true, preload: true,
      onload: () => { setDuration(audio.duration()); setStatus('ready'); },
      onloaderror: () => setStatus('error'),
      onplayerror: () => { setPlaying(false); setStatus('error'); },
      onplay: () => setPlaying(true), onpause: () => setPlaying(false),
      onend: () => { setPlaying(false); setTime(audio.duration()); },
    });
    sound.current = audio;
    return () => { audio.unload(); sound.current = null; };
  }, [src]);
  useEffect(() => { sound.current?.volume(muted ? 0 : volume); }, [volume, muted, status]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous = 0;
    const tick = (now: number) => {
      if (now - previous >= 30) {setTime(Number(sound.current?.seek()) || 0); previous = now;}
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  return {playing, time, duration, status,
    toggle: () => { const a = sound.current; if (!a || status !== 'ready') return; if (a.playing()) a.pause(); else a.play(); },
    seek: (seconds: number) => { sound.current?.seek(seconds); setTime(seconds); },
    replay: () => { if (status === 'ready') { sound.current?.seek(0); sound.current?.play(); setTime(0); } },
  };
}

export { playEffect } from '../audio/soundEffects';

export function useAmbience(enabled: boolean, volume: number, muted: boolean) {
  const ambient = useRef<Howl | null>(null);
  useEffect(() => {
    if (!settings.backgroundAudio || !enabled) return;
    const audio = new Howl({src: [settings.backgroundAudio], loop: true, volume: 0});
    ambient.current = audio; audio.play();
    return () => { audio.unload(); ambient.current = null; };
  }, [enabled]);
  useEffect(() => { ambient.current?.volume(muted ? 0 : volume * .16); }, [volume, muted, enabled]);
  useEffect(() => () => { Howler.stop(); }, []);
}
