import { useEffect, useState } from 'react';
import { submitContact, type ContactConfiguration } from '../utils/contact';

let visitRequest: Promise<void> | null = null;
let transientSession: string | undefined;
function sessionId() {
  try {const key='birthday-visit-session';const value=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,value);return value;}
  catch {return transientSession ??= crypto.randomUUID();}
}
async function notifyVisit(endpoint:string) {
  if (new URLSearchParams(location.search).get('preview')==='1') return;
  const id=sessionId();
  try {if(sessionStorage.getItem('birthday-visit-sent')===id)return;} catch { /* Storage is optional. */ }
  await submitContact(endpoint,{kind:'visit',id});
  try {sessionStorage.setItem('birthday-visit-sent',id);} catch { /* In-memory deduplication still applies. */ }
}
export function useContact() {
  const [configuration,setConfiguration]=useState<ContactConfiguration>({enabled:null});
  useEffect(()=>{
    let active=true;
    void fetch('/api/contact',{cache:'no-store'}).then(async r=>{if(!r.ok)throw new Error();const data=await r.json();if(active)setConfiguration({enabled:data.enabled===true && typeof data.endpoint==='string',endpoint:data.endpoint});}).catch(()=>{if(active)setConfiguration({enabled:false});});
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(!configuration.enabled || !configuration.endpoint)return;
    let timer:number | undefined;
    const schedule=()=>{
      window.clearTimeout(timer);
      if(document.visibilityState!=='visible')return;
      timer=window.setTimeout(()=>{visitRequest ??= notifyVisit(configuration.endpoint!).catch(()=>{visitRequest=null;});},1500);
    };
    schedule();document.addEventListener('visibilitychange',schedule);
    return()=>{window.clearTimeout(timer);document.removeEventListener('visibilitychange',schedule);};
  },[configuration.enabled,configuration.endpoint]);
  return configuration;
}
