import {test,expect} from '@playwright/test';
import {handleContact} from '../api/contact';
const env={FORMSUBMIT_ACTIVATED:'true',CONTACT_TO_EMAIL:'owner@example.com',CONTACT_SITE_URL:'https://letter-ten-theta.vercel.app'};
const id='12345678-1234-1234-1234-123456789abc';
const request=(body:object,origin=env.CONTACT_SITE_URL)=>new Request(env.CONTACT_SITE_URL+'/api/contact',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(body)});
test('unconfigured service is honest and never reports a successful reply',async()=>{
 expect(await (await handleContact(new Request(env.CONTACT_SITE_URL+'/api/contact'),{env:{}})).json()).toEqual({enabled:false});
 expect((await handleContact(request({kind:'reply'}),{env:{}})).status).toBe(503);
});
test('visit email is anonymous and uses the server-owned destination and deduplicates acknowledged events',async()=>{
 let payload:Record<string,unknown>={};let endpoint='';let calls=0;
 const response=await handleContact(request({kind:'visit',id,to:'attacker@example.com'}),{env,fetch:async(_url,init)=>{calls++;endpoint=String(_url);payload=JSON.parse(init!.body as string);return Response.json({success:'true'});}});
 expect(response.status).toBe(200);expect(endpoint).toBe('https://formsubmit.co/ajax/owner%40example.com');expect(payload.message).toContain('not confirmation that Kimberly Ann opened it');expect(payload.event_id).toBe('visit/'+id);
 await handleContact(request({kind:'visit',id}),{env,fetch:async()=>{calls++;return Response.json({success:'true'});}});expect(calls).toBe(1);
 expect(JSON.stringify(await (await handleContact(new Request(env.CONTACT_SITE_URL+'/api/contact'),{env})).json())).not.toContain('owner@example.com');
});
test('replies require consent, length validation and same-origin requests',async()=>{
 const body={kind:'reply',id,name:'Kimberly',message:'Thank you!',consent:true};
 expect((await handleContact(request(body,'https://another.example'),{env})).status).toBe(403);
 expect((await handleContact(request({...body,consent:false}),{env})).status).toBe(400);
 expect((await handleContact(request({...body,message:'x'.repeat(2001)}),{env})).status).toBe(400);
 let text='';expect((await handleContact(request(body),{env,fetch:async(_url,init)=>{text=JSON.parse(init!.body as string).message;return Response.json({success:'true'});}})).status).toBe(200);expect(text).toContain('Thank you!');expect(text).toContain('self-reported');
});
test('provider failure and honeypot never send a misleading success to a real reply',async()=>{
 const body={kind:'reply',id:'12345678-1234-1234-1234-123456789abd',message:'A note',consent:true};
 expect((await handleContact(request(body),{env,fetch:async()=>Response.json({error:'unavailable'},{status:500})})).status).toBe(502);
 let called=false;expect((await handleContact(request({...body,website:'spam'}),{env,fetch:async()=>{called=true;return Response.json({});}})).status).toBe(200);expect(called).toBe(false);
});

test('pending email activation is never treated as successful delivery',async()=>{
 const r=await handleContact(request({kind:'reply',id:'12345678-1234-1234-1234-123456789abe',message:'My note',consent:true}),{env,fetch:async()=>Response.json({success:'false',message:'This form needs Activation.'})});
 expect(r.status).toBe(502);
 const ready=await handleContact(new Request(env.CONTACT_SITE_URL+'/api/contact'),{env:{...env,FORMSUBMIT_ACTIVATED:'false'}});expect(await ready.json()).toEqual({enabled:false});
});
