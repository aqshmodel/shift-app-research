import type {APIRoute} from 'astro';import {env} from 'cloudflare:workers';
export const GET:APIRoute=()=>new Response((env as unknown as {ENVIRONMENT:string}).ENVIRONMENT==='production'?'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://shift.aqsh.co.jp/sitemap.xml\n':'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain; charset=utf-8'}});
