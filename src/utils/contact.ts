export interface ContactConfiguration {enabled:boolean | null;endpoint?:string}
interface ContactSubmission {kind:'visit'|'reply';id:string;name?:string;message?:string;consent?:boolean;website?:string}
export async function submitContact(endpoint:string,submission:ContactSubmission){
 if(!/^https:\/\/formsubmit\.co\/ajax\/[a-zA-Z0-9_-]{20,128}$/.test(endpoint))throw new Error('Replies are temporarily unavailable.');
 const reply=submission.kind==='reply';
 const name=submission.name?.trim()??'';const message=submission.message?.trim()??'';
 if(reply&&(!submission.consent||!message||message.length>2000||name.length>80))throw new Error('Write a message of up to 2,000 characters and confirm that you want to send it.');
 const payload={_subject:reply?'A reply to your birthday keepsake':'Your birthday keepsake was opened',name:reply?name||'Not provided':'Anonymous visit',
 message:reply?`An optional reply was submitted at ${location.origin}.\n\nName (self-reported): ${name||'Not provided'}\n\n${message}\n\nThe sender chose to send this message. A name is not verified proof of identity.`:`A browser displayed your birthday keepsake at ${location.origin}.\n\nThis is a visit notice, not confirmation that Kimberly Ann opened it. Your own visits, shared links, or automated browsers may also trigger it. No visitor identity, location, or device details are included in this notice.`,
 event_id:`${submission.kind}/${submission.id}`,_url:location.origin,_captcha:'false',_template:'table',_honey:submission.website??''};
 const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),keepalive:!reply,signal:AbortSignal.timeout(15000)});
 let receipt:{success?:boolean|string};try{receipt=await response.json();}catch{throw new Error('Your message could not be sent. Please try again shortly.');}
 if(!response.ok||(receipt.success!==true&&receipt.success!=='true'))throw new Error('Your message could not be sent. Please try again shortly.');
}
