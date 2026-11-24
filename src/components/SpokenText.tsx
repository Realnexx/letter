import { Fragment, useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import type { WordCue } from '../data/messages';

export default function SpokenText({text, block, words, time, follow}: {text: string; block: string; words: WordCue[]; time: number; follow: boolean}) {
  const current = words.find(word => word.block === block && time >= word.start && time < word.end)?.index ?? -1;
  const active = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!follow || current < 0 || !active.current) return;
    const rect = active.current.getBoundingClientRect();
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop ?? 0;
    const height = viewport?.height ?? window.innerHeight;
    const margin = Math.min(100, height * .18);
    if (rect.top < top + margin || rect.bottom > top + height - margin) {
      active.current.scrollIntoView({block:'center', inline:'nearest', behavior:reduced ? 'instant' : 'smooth'});
    }
  }, [current, follow, reduced]);
  let token = -1;
  return <>{text.split(/(\s+)/).map((part, i) => {
    if (/^\s+$/.test(part)) return <Fragment key={i}>{part}</Fragment>;
    token++;
    const selected = token === current;
    return <mark key={i} ref={selected ? active : undefined} className={`spoken-word${selected ? ' is-speaking' : ''}`} data-word={token} data-block={block}>{part}</mark>;
  })}</>;
}
