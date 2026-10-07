import { load } from 'cheerio';
import { validateTarget, isPublicIPv4, relayLink } from '../../lib/proxy-target.ts';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const MAX_BYTES = 4 * 1024 * 1024;
async function checkPublic(host:string){const dns=await fetch('https://cloudflare-dns.com/dns-query?name='+encodeURIComponent(host)+'&type=A',{headers:{accept:'application/dns-json'},signal:AbortSignal.timeout(8000)});if(!dns.ok)throw Error('Could not resolve this website.');const data=await dns.json() as {Answer?:{type:number;data:string}[]};const ips=data.Answer?.filter(a=>a.type===1)||[];if(!ips.length||ips.some(a=>!isPublicIPv4(a.data)))throw Error('This address is not available through the proxy.');}
async function limitedBody(response:Response){const reader=response.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw Error('This page is too large. Drift supports files up to 4 MB.')}chunks.push(value)}const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length}return body;}
function message(text:string,status=502){return new Response('<!doctype html><html><head><meta charset="utf-8"><title>Drift</title></head><body style="font:16px system-ui;padding:40px;color:#203f35"><h1>Couldn’t open this page</h1><p>'+text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))+'</p><p>Try another public website using the address bar above.</p></body></html>',{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','content-security-policy':"sandbox; default-src 'none'"}})}
export async function GET(request:Request){try{
 const incoming=new URL(request.url);let target=validateTarget(incoming.searchParams.get('url')||'',incoming.hostname);let response:Response|undefined;
 for(let i=0;i<6;i++){await checkPublic(target.hostname);response=await fetch(target.href,{redirect:'manual',headers:{accept:'text/html,text/css,image/*;q=0.8,*/*;q=0.5','user-agent':'DriftReadingProxy/1.0'},signal:AbortSignal.timeout(15000)});if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel();if(!location)throw Error('The website returned an invalid redirect.');target=validateTarget(new URL(location,target).href,incoming.hostname);continue}break;}
 if(!response||response.status>=300&&response.status<400)throw Error('The website redirected too many times.');
 if(!response.ok){await response.body?.cancel();return message('The destination returned HTTP '+response.status+'. It may block proxy access.',response.status===404?404:502)}
 const type=response.headers.get('content-type')||'application/octet-stream';
 if(!/^(text\/(html|css|plain)|image\/(png|jpeg|gif|webp|avif|svg\+xml|x-icon)|font\/)/i.test(type)){await response.body?.cancel();return message('This content type isn’t supported in reading mode.',415)}
 const bytes=await limitedBody(response);
 const headers=new Headers({'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer','content-security-policy':"sandbox; default-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src 'none'; form-action 'none'; base-uri 'none'"});
 if(type.includes('text/css')){const css=new TextDecoder().decode(bytes).replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(_,q,value)=>'url("'+relayLink(value,target.href)+'")').replace(/@import\s+(['"])(.*?)\1/gi,(_,q,value)=>'@import "'+relayLink(value,target.href)+'"');return new Response(css,{headers})}
 let result=new Response(bytes.buffer as ArrayBuffer,{headers});
 if(type.includes('text/html')){
 const base=target.href;
 const $=load(new TextDecoder().decode(bytes));
 $('script,iframe,object,embed,base,meta[http-equiv],input,button,textarea,select').remove();
 $('form').each((_,el)=>{$(el).replaceWith($(el).contents())});
 $('*').each((_,el)=>{
  if (!('attribs' in el)) return;
  const node=$(el);
  for(const attr of ['href','src','poster','background']){
   const value=node.attr(attr);if(value!==undefined)node.attr(attr,relayLink(value,base));
  }
  for(const attr of Object.keys(el.attribs)){
   if(attr.toLowerCase().startsWith('on')||['srcset','integrity','crossorigin','target'].includes(attr))node.removeAttr(attr);
  }
  const style=node.attr('style');if(style)node.attr('style',style.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(_,q,v)=>'url("'+relayLink(v,base)+'")'));
 });
 $('style').each((_,el)=>{$(el).text($(el).text().replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,(_,q,v)=>'url("'+relayLink(v,base)+'")').replace(/@import\s+(['"])(.*?)\1/gi,(_,q,v)=>'@import "'+relayLink(v,base)+'"'))});
 const html=$.html();
 if(Buffer.byteLength(html)>MAX_BYTES)throw Error('This rewritten page is too large. Drift supports files up to 4 MB.');
 result=new Response(html,{headers});
 }
 return result;
 }catch(error){return message(error instanceof Error?error.message:'The website could not be reached.')}
}
