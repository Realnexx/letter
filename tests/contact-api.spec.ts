import{test,expect}from'@playwright/test';
import{handleContact}from'../api/contact';
const origin='https://letter-ten-theta.vercel.app';const formId='0123456789abcdef0123456789abcdef';
test('configuration is disabled until activation and a valid opaque form ID exist',async()=>{
 for(const env of [{},{FORMSUBMIT_ACTIVATED:'false',FORMSUBMIT_FORM_ID:formId},{FORMSUBMIT_ACTIVATED:'true',FORMSUBMIT_FORM_ID:'owner@example.com'}])expect(await(await handleContact(new Request(origin+'/api/contact'),{env})).json()).toEqual({enabled:false});
});
test('configuration exposes only the intended public opaque endpoint',async()=>{
 const response=await handleContact(new Request(origin+'/api/contact'),{env:{FORMSUBMIT_ACTIVATED:'true',FORMSUBMIT_FORM_ID:formId}});
 expect(await response.json()).toEqual({enabled:true,endpoint:'https://formsubmit.co/ajax/'+formId});expect(response.headers.get('Cache-Control')).toBe('no-store');
});
test('the Vercel configuration endpoint does not relay replies or act as an email gateway',async()=>{
 const response=await handleContact(new Request(origin+'/api/contact',{method:'POST',body:'{}'}));expect(response.status).toBe(405);expect(response.headers.get('Allow')).toBe('GET');
});
