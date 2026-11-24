// Original procedural foley. No remote assets, microphone, or narration processing.
export type EffectKind = 'seal' | 'flap' | 'paper' | 'unfold' | 'page' | 'finale';
let context: AudioContext | null = null;
let output: GainNode | null = null;
let paperNoise: AudioBuffer | null = null;
const active = new Set<AudioScheduledSourceNode>();

export function setEffectVolume(volume: number) {
  if (output && context) output.gain.setTargetAtTime(Math.max(0, volume), context.currentTime, .02);
  if (volume <= 0) stopEffects();
}
export function stopEffects() {
  for (const source of active) {try {source.stop();} catch { /* Already finished. */ }}
  active.clear();
}
export function playEffect(kind: EffectKind, volume: number) {
  if (volume <= 0) return;
  try {
    context ??= new AudioContext();
    output ??= context.createGain();
    if (!paperNoise) {
      output.connect(context.destination);
      paperNoise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const data = paperNoise.getChannelData(0);
      let softened = 0;
      for (let i = 0; i < data.length; i++) {softened = softened * .65 + (Math.random() * 2 - 1) * .35; data[i] = softened;}
    }
    void context.resume();
    stopEffects(); // Rapid navigation cannot pile up paper sounds.
    output.gain.setValueAtTime(volume, context.currentTime);
    const now = context.currentTime;
    const rustle = (delay: number, duration: number, frequency: number, level: number) => {
      const source = context!.createBufferSource();
      const filter = context!.createBiquadFilter();
      const envelope = context!.createGain();
      source.buffer = paperNoise; source.playbackRate.value = kind === 'seal' ? 1.25 : .85;
      filter.type = 'bandpass'; filter.frequency.setValueAtTime(frequency, now + delay);
      filter.frequency.exponentialRampToValueAtTime(frequency * .6, now + delay + duration); filter.Q.value = .65;
      const start = now + delay;
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(level, start + duration * .2);
      envelope.gain.exponentialRampToValueAtTime(.0001, start + duration);
      source.connect(filter); filter.connect(envelope); envelope.connect(output!);
      active.add(source); source.start(start, .2); source.stop(start + duration + .02);
      source.onended = () => {active.delete(source); source.disconnect(); filter.disconnect(); envelope.disconnect();};
    };
    if (kind === 'seal') {rustle(0,.12,1500,.2); rustle(.065,.13,650,.14);}
    if (kind === 'flap') rustle(0,.36,1100,.16);
    if (kind === 'paper') {rustle(0,.5,1600,.16); rustle(.22,.42,2100,.1);}
    if (kind === 'unfold') {rustle(0,.25,1250,.14); rustle(.16,.28,1800,.1);}
    if (kind === 'page') {rustle(0,.32,1450,.15); rustle(.12,.24,850,.09);}
    if (kind === 'finale') {
      [523.25,659.25,783.99].forEach((frequency,i) => {
        const tone = context!.createOscillator(); const envelope = context!.createGain();
        const start = now + i * .15; tone.type='sine'; tone.frequency.value=frequency;
        envelope.gain.setValueAtTime(0,start); envelope.gain.linearRampToValueAtTime(.035,start+.025);
        envelope.gain.exponentialRampToValueAtTime(.0001,start+1.05);
        tone.connect(envelope); envelope.connect(output!); active.add(tone); tone.start(start); tone.stop(start+1.1);
        tone.onended=()=>{active.delete(tone);tone.disconnect();envelope.disconnect();};
      });
    }
  } catch { /* Reading and narration remain available if Web Audio is unavailable. */ }
}
