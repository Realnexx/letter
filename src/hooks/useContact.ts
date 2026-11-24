import { useEffect, useState } from 'react';

let visitRequest: Promise<void> | null = null;
let transientSession: string | undefined;
function sessionId() {
  try {const key='birthday-visit-session';const value=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,value);return value;}
  catch {return transientSession ??= crypto.randomUUID();}
}
async function notifyVisit() {
  if (new URLSearchParams(location.search).get('preview')==='1') return;
  const id=sessionId();
  try {if(sessionStorage.getItem('birthday-visit-sent')===id)return;} catch { /* Storage is optional. */ }
  const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'visit',id}),keepalive:true});
  if(response.ok) {try {sessionStorage.setItem('birthday-visit-sent',id);} catch { /* In-memory deduplication still applies. */ }}
  else throw new Error('Visit notification unavailable');
}
export function useContact() {
  const [enabled,setEnabled]=useState<boolean | null>(null);
  useEffect(()=>{
    let active=true;
    void fetch('/api/contact',{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error();const data=await r.json();if(active)setEnabled(data.enabled===true);}).catch(()=>{if(active)setEnabled(false);});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!enabled)return;
    let timer:number | undefined;
    const schedule=()=>{
      window.clearTimeout(timer);
      if(document.visibilityState!=='visible')return;
      timer=window.setTimeout(()=>{visitRequest ??= notifyVisit().catch(()=>{visitRequest=null;});},1500);
    };
    schedule();document.addEventListener('visibilitychange',schedule);
    return()=>{window.clearTimeout(timer);document.removeEventListener('visibilitychange',schedule);};
  },[enabled]);
  return enabled;
}
