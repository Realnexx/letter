import { createHash, randomBytes } from 'node:crypto';

type ContactEnvironment = { FORMSUBMIT_ACTIVATED?: string; CONTACT_TO_EMAIL?: string; CONTACT_SITE_URL?: string };
type DependencyOptions = {env?: ContactEnvironment; fetch?: typeof fetch; now?: () => number};
const limits = new Map<string, {count:number; reset:number}>();
const accepted = new Map<string, {fingerprint:string; expires:number}>();
const pending = new Map<string, Promise<boolean>>();
const salt = randomBytes(16).toString('hex');
const result = (body: object, status = 200) => Response.json(body, {status, headers:{'Cache-Control':'no-store'}});

export async function handleContact(request: Request, dependencies: DependencyOptions = {}) {
  const env = dependencies.env ?? process.env;
  const send = dependencies.fetch ?? fetch;
  const now = dependencies.now ?? Date.now;
  const configured = Boolean(env.FORMSUBMIT_ACTIVATED === 'true' && env.CONTACT_TO_EMAIL && env.CONTACT_SITE_URL);
  if (request.method === 'GET') return result({enabled:configured});
  if (request.method !== 'POST') return new Response(null,{status:405,headers:{Allow:'GET, POST'}});
  if (!configured) return result({error:'Replies are not available yet. Please try again later.'},503);
  let origin: string;
  try {origin=new URL(env.CONTACT_SITE_URL!).origin;} catch {return result({error:'Replies are temporarily unavailable.'},503);}
  if (request.headers.get('origin') !== origin || request.headers.get('sec-fetch-site') === 'cross-site') return result({error:'Please send your message from the birthday website.'},403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return result({error:'Invalid request format.'},415);
  if (Number(request.headers.get('content-length') ?? 0)>12000) return result({error:'Please keep your message under 2,000 characters.'},413);
  const text=await request.text();
  if (text.length>12000) return result({error:'Please keep your message under 2,000 characters.'},413);
  let body: Record<string, unknown>;
  try {body=JSON.parse(text);if (!body || Array.isArray(body) || typeof body!=='object') throw new Error();} catch {return result({error:'Invalid request.'},400);}
  if (body.website) return result({ok:true}); // Honeypot submissions do not reach the inbox.
  if (body.kind !== 'visit' && body.kind !== 'reply') return result({error:'Invalid request.'},400);
  if (typeof body.id!=='string' || !/^[a-f0-9-]{36}$/i.test(body.id)) return result({error:'Invalid request.'},400);
  const message=typeof body.message==='string'?body.message.trim():'';
  const name=typeof body.name==='string'?body.name.trim():'';
  if (body.kind==='reply' && (message.length<1 || message.length>2000 || name.length>80 || body.consent!==true)) return result({error:'Write a message of up to 2,000 characters and confirm that you want to send it.'},400);
  // Small, temporary per-instance abuse guard. No IP or device data goes into emails.
  const ip=request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const bucket=createHash('sha256').update(salt+ip+body.kind).digest('hex');
  const time=now();
  for (const [key,value] of limits) if(value.reset<=time) limits.delete(key);
  for (const [key,value] of accepted) if(value.expires<=time) accepted.delete(key);
  const eventKey=`${body.kind}/${body.id}`;
  const fingerprint=createHash('sha256').update(JSON.stringify({kind:body.kind,name,message})).digest('hex');
  const previous=accepted.get(eventKey);
  if(previous) return previous.fingerprint===fingerprint?result({ok:true}):result({error:'Please refresh before sending a different message.'},409);
  if(limits.size>5000) return result({error:'Please try again in a few minutes.'},429);
  const entry=limits.get(bucket);
  if(entry && entry.reset>time && entry.count>=10) return result({error:'Please wait a few minutes before trying again.'},429);
  limits.set(bucket,{count:(entry?.count??0)+1,reset:entry?.reset??time+15*60*1000});
  const reply=body.kind==='reply';
  const payload={_subject:reply?'A reply to your birthday keepsake':'Your birthday keepsake was opened',
    name:reply?name || 'Not provided':'Anonymous visit',
    message:reply?`An optional reply was submitted at ${origin}.\n\nName (self-reported): ${name || 'Not provided'}\n\n${message}\n\nThe sender chose to send this message. A name is not verified proof of identity.`:`A browser displayed your birthday keepsake at ${origin}.\n\nThis is a visit notice, not confirmation that Kimberly Ann opened it. Your own visits, shared links, or automated browsers may also trigger it. No visitor identity, location, or device details are included.`,
    event_id:eventKey,_url:origin,_captcha:'false',_template:'table',
  };
  try {
    const submissionKey=eventKey+'/'+fingerprint;
    let job=pending.get(submissionKey);
    if(!job) {
      if(accepted.size>=2000 || pending.size>=100) return result({error:'Please try again in a few minutes.'},429);
      job=(async()=>{
        const response=await send(`https://formsubmit.co/ajax/${encodeURIComponent(env.CONTACT_TO_EMAIL!)}`,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json',Origin:origin,Referer:origin+'/'},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000)});
        if(!response.ok){console.warn('[contact] Provider HTTP rejection',response.status);return false;}
        const receipt=await response.json() as {success?:boolean | string;message?:string};
        if(receipt.success!==true && receipt.success!=='true'){
          const category=/activat/i.test(receipt.message??'')?'activation-required':/spam|bot|captcha/i.test(receipt.message??'')?'anti-spam':'submission-rejected';
          console.warn('[contact] Provider submission rejection',category);return false;
        }
        accepted.set(eventKey,{fingerprint,expires:now()+24*60*60*1000});
        return true;
      })();
      pending.set(submissionKey,job);
      void job.finally(()=>pending.delete(submissionKey)).catch(()=>{});
    }
    if(!await job) return result({error:'Your message could not be sent. Please try again shortly.'},502);
    return result({ok:true});
  } catch {return result({error:'Your message could not be sent. Please try again shortly.'},502);}
}

export default {fetch:(request: Request) => handleContact(request)};
