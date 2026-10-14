import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
import { getResearch } from './lib/data';
import { guardPublicRequest, contentParams } from './lib/cost-guard.mjs';
export const onRequest=defineMiddleware(async(context,next)=>{
 const url=context.url; const production=(env as unknown as {ENVIRONMENT?:string}).ENVIRONMENT==='production';
 if(production && url.hostname.endsWith('.workers.dev'))return Response.redirect('https://shift.aqsh.co.jp'+url.pathname+url.search,301);
 const staticAsset=['/_astro/','/fonts/','/brand/'].some(prefix=>url.pathname.startsWith(prefix)) || ['/robots.txt','/favicon.svg','/llms.txt'].includes(url.pathname);
 if(!staticAsset){
  const guardEnv=import.meta.env.DEV?{...env,ENVIRONMENT:'development',PUBLIC_API_LIMITER:undefined}:env;
  const blocked=await guardPublicRequest(context.request,guardEnv);
  if(blocked){console.log(JSON.stringify({event:'research_guard',status:blocked.status,calls:0,queries:0}));return blocked;}
  // Tracking does not change catalog content and must not bypass input validation.
  const params=contentParams(url.searchParams);url.search=params.toString();
 }
 const response=await next();
 response.headers.set('Server-Timing',getResearch(context.locals).timingHeader());
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','tools=(self), camera=(), microphone=(), geolocation=()');
 response.headers.set('Origin-Agent-Cluster','?1');
 response.headers.set('X-Frame-Options','DENY');
 const analytics=production && url.hostname==='shift.aqsh.co.jp';
 const scripts=analytics?"'self' https://www.googletagmanager.com":"'self'";
 const connections=analytics?"'self' https://www.googletagmanager.com https://*.google-analytics.com":"'self'";
 response.headers.set('Content-Security-Policy',`default-src 'self'; script-src ${scripts}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src ${connections}; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`);
 if(!production || url.hostname!=='shift.aqsh.co.jp')response.headers.set('X-Robots-Tag','noindex, nofollow');
 if(url.protocol==='https:')response.headers.set('Strict-Transport-Security','max-age=31536000');
 // D1 results never persist through a pause/publication/rollback at a downstream cache.
 // Snapshot catalog reuse happens inside the repository after a fresh live-pointer read.
 if(!staticAsset)response.headers.set('Cache-Control','no-store');
 if(!staticAsset)console.log(JSON.stringify({event:'research_request',route:url.pathname.startsWith('/api/')?'api':url.pathname.startsWith('/products/')?'product':'page',status:response.status,...getResearch(context.locals).metrics()}));
 return response;
});
