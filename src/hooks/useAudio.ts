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
    const timer = window.setInterval(() => setTime(Number(sound.current?.seek()) || 0), 100);
    return () => window.clearInterval(timer);
  }, [playing]);
  return {playing, time, duration, status,
    toggle: () => { const a = sound.current; if (!a || status !== 'ready') return; if (a.playing()) a.pause(); else a.play(); },
    seek: (seconds: number) => { sound.current?.seek(seconds); setTime(seconds); },
    replay: () => { if (status === 'ready') { sound.current?.seek(0); sound.current?.play(); setTime(0); } },
  };
}

// Short original, synthesized tones: no fabricated recordings or remote audio requests.
let context: AudioContext | null = null;
export function playEffect(kind: 'seal' | 'paper' | 'page' | 'finale', volume: number) {
  if (volume <= 0) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const notes = kind === 'finale' ? [523.25, 659.25, 783.99, 1046.5] : kind === 'seal' ? [220, 330] : kind === 'paper' ? [740, 620] : [440, 554];
    notes.forEach((frequency, i) => {
      const oscillator = context!.createOscillator(); const gain = context!.createGain();
      const start = context!.currentTime + i * .09;
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume * .065, start + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + .4);
      oscillator.connect(gain); gain.connect(context!.destination); oscillator.start(start); oscillator.stop(start + .42);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { /* Text and navigation remain available if browser audio is unavailable. */ }
}

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
