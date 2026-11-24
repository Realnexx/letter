import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { settings } from '../data/messages';

export default function PortraitIntro({onContinue}: {onContinue: () => void}) {
  const reduced = useReducedMotion();
  return <motion.section className="portrait-intro" aria-labelledby="portrait-title" exit={reduced ? {} : {opacity:0, y:-12}} transition={{duration:.4}}>
    <div className="portrait-frame"><img src="/images/kimberly-ann.webp" alt="Kimberly Ann in a floral dress" width="1000" height="1500" fetchPriority="high"/></div>
    <div className="portrait-dedication"><h1 id="portrait-title">{settings.recipient},<br/><em>today is yours.</em></h1><div className="dedication-rule" aria-hidden="true"/><p>A little celebration of you.<br/>And a few words, written with love.</p><button className="next-button" onClick={onContinue}>A letter is waiting <ArrowRight size={17}/></button><span className="script">Just for you.</span></div>
  </motion.section>;
}
