// Pages supports external DNS subdomains. The service binding keeps SSR and D1
// in the Worker; no public origin URL or additional credential is needed.
export async function onRequest({request,env}) {
 const incoming=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 const isPublic=incoming.hostname==='shift.aqsh.co.jp';
 if(!isPublic && incoming.pathname==='/robots.txt')return new Response('User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain','X-Robots-Tag':'noindex, nofollow'}});
 const target=new URL(incoming.pathname+incoming.search,'https://shift.aqsh.co.jp');
 const upstream=await env.RESEARCH.fetch(new Request(target,request));
 const response=new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:upstream.headers});
 if(!isPublic){
  response.headers.set('X-Robots-Tag','noindex, nofollow');
  // Keep preview HTML and API fresh; reuse static assets with the Worker's
  // fingerprinted immutable or conditional-revalidation cache policy.
  const staticAsset=['/_astro/','/fonts/','/brand/'].some(prefix=>incoming.pathname.startsWith(prefix));
  if(!staticAsset || ![200,304].includes(response.status))response.headers.set('Cache-Control','no-store');
 }
 return response;
}
