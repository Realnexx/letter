import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { settings } from '../data/messages';

export default function Envelope({onOpen, effect}: {onOpen: () => void; effect: (kind: 'seal' | 'flap' | 'paper' | 'unfold') => void}) {
  const root = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const [opening, setOpening] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => () => { timeline.current?.kill(); }, []);
  const open = () => {
    if (opening || !root.current) return;
    setOpening(true); effect('seal');
    const el = root.current;
    timeline.current = gsap.timeline({onComplete: onOpen})
      .to(el.querySelector('.seal'), {scale: 1.18, opacity: 0, duration: reduced ? .01 : .32})
      .call(() => effect('flap'))
      .to(el.querySelector('.flap'), {rotateX: -180, duration: reduced ? .01 : .8, ease: 'power2.inOut'})
      .set(el.querySelector('.flap'), {zIndex: 0})
      .call(() => effect('paper'))
      .to(el.querySelector('.insert'), {y: -155, duration: reduced ? .01 : .9, ease: 'power3.out'})
      .call(() => effect('unfold'))
      .to(el.querySelector('.insert'), {rotateX: 0, scale: 1.1, duration: reduced ? .01 : .5})
      .to(el, {opacity: 0, y: 25, duration: reduced ? .01 : .4}, '+=.15');
  };
  return <div className="envelope-stage"><div className="envelope-halo" aria-hidden="true" />
    <button ref={root} className={`envelope ${opening ? 'opening' : ''}`} onClick={open} disabled={opening} aria-label="Open your birthday letter">
      <div className="envelope-back" />
      <div className="insert"><span className="insert-rule" /><span className="script">A little something</span><span>just for {settings.recipient}.</span><span className="insert-rule" /></div>
      <div className="envelope-front" /><div className="envelope-left" /><div className="envelope-right" />
      <div className="flap" /><div className="seal"><span className="seal-ring"><span className="seal-letter">a</span></span></div>
      <span className="envelope-address">For {settings.recipient}, with love.</span>
    </button>
    <div className="open-invitation"><span className="invitation-line" /><span>{opening ? 'Something lovely is unfolding' : 'Touch the seal to open'}</span><ArrowUpRight size={14}/></div>
  </div>;
}
