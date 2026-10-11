import { defineMiddleware } from 'astro:middleware';
import { env } from 'cloudflare:workers';
export const onRequest=defineMiddleware(async(context,next)=>{
 const url=context.url; const production=(env as unknown as {ENVIRONMENT?:string}).ENVIRONMENT==='production';
 if(production && url.hostname.endsWith('.workers.dev'))return Response.redirect('https://shift.aqsh.co.jp'+url.pathname+url.search,301);
 const response=await next();
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','tools=(self), camera=(), microphone=(), geolocation=()');
 response.headers.set('Origin-Agent-Cluster','?1');
 response.headers.set('X-Frame-Options','DENY');
 response.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
 if(!production || url.hostname!=='shift.aqsh.co.jp')response.headers.set('X-Robots-Tag','noindex, nofollow');
 if(url.protocol==='https:')response.headers.set('Strict-Transport-Security','max-age=31536000');
 if(!url.pathname.startsWith('/api/'))response.headers.set('Cache-Control',url.search||response.status!==200?'no-store':'public, max-age=60, s-maxage=300');
 return response;
});
