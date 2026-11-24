import { useRef, useState } from 'react';
import { Send, Check } from 'lucide-react';
import { submitContact } from '../utils/contact';

export default function BirthdayReply({enabled,endpoint}:{enabled:boolean | null;endpoint?:string}) {
  const [name,setName]=useState('');
  const [message,setMessage]=useState('');
  const [consent,setConsent]=useState(false);
  const [website,setWebsite]=useState('');
  const [status,setStatus]=useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [error,setError]=useState('');
  const id=useRef<string | null>(null);
  const locked=status==='sending'||status==='sent';
  return <section className="birthday-reply" aria-labelledby="reply-title"><h2 id="reply-title">A little note back?</h2><p>Only if you feel like it. Your words will go privately to the person who made this for you.</p>
    {enabled===null?<p role="status">Preparing your reply…</p>:!enabled?<p className="reply-unavailable" role="status">Replies aren’t available right now. You can still enjoy every letter.</p>:status==='sent'?<div className="reply-sent" role="status"><Check size={21}/><span>Your note has been sent. Thank you for writing back.</span></div>:<form onSubmit={async e=>{
      e.preventDefault();if(locked||!consent||!message.trim()||!endpoint)return;
      setStatus('sending');setError('');id.current ??= crypto.randomUUID();
      try {await submitContact(endpoint,{kind:'reply',id:id.current,name,message,consent,website});setStatus('sent');}
      catch(err){setStatus('error');setError(err instanceof Error?err.message:'Your note could not be sent. Please try again.');}
    }}>
      <label htmlFor="reply-name">Your name <span>(optional)</span></label><input id="reply-name" value={name} onChange={e=>{setName(e.target.value);id.current=null;}} maxLength={80} disabled={locked} autoComplete="name"/>
      <label htmlFor="reply-message">Your message</label><textarea id="reply-message" value={message} onChange={e=>{setMessage(e.target.value);id.current=null;}} maxLength={2000} rows={5} required disabled={locked}/><span className="reply-count">{message.length} / 2,000</span>
      <div className="reply-honeypot" aria-hidden="true"><label htmlFor="reply-website">Website</label><input id="reply-website" tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></div>
      <label className="reply-consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required disabled={locked}/>I’m happy to send this message to the creator of this keepsake.</label>
      {error&&<p className="reply-error" role="alert">{error}</p>}
      <p className="reply-delivery">Delivered through FormSubmit. Your note won’t be published here.</p>
      <button className="next-button" type="submit" disabled={locked||!consent||!message.trim()}>{status==='sending'?'Sending your note…':'Send my note'}<Send size={15}/></button>
    </form>}
  </section>;
}
