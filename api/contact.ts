type ContactEnvironment = {FORMSUBMIT_ACTIVATED?:string;FORMSUBMIT_FORM_ID?:string};
export async function handleContact(request:Request,dependencies:{env?:ContactEnvironment}={}){
 if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET'}});
 const env=dependencies.env??process.env;
 const formId=env.FORMSUBMIT_FORM_ID?.trim()??'';
 const enabled=env.FORMSUBMIT_ACTIVATED==='true'&&/^[a-zA-Z0-9_-]{20,128}$/.test(formId);
 return Response.json(enabled?{enabled:true,endpoint:`https://formsubmit.co/ajax/${formId}`}:{enabled:false},{headers:{'Cache-Control':'no-store'}});
}
export default {fetch:(request:Request)=>handleContact(request)};
