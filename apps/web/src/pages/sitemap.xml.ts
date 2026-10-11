import type {APIRoute} from 'astro';
import {getResearch} from '../lib/data';
import {categoryInfo,SITE} from '../lib/catalog';
import {GUIDE_UPDATED} from '../lib/category-guides';

export const GET:APIRoute=async({locals})=>{
  const products=await getResearch(locals).catalog();
  const paths=[
    '/','/products/','/methodology/','/references/form-9/',
    '/webmcp/','/about/','/privacy/','/terms/',
    ...Object.keys(categoryInfo).map(key=>`/categories/${key}/`),
    ...products.map((product:any)=>`/products/${product.slug}/`)
  ];
  // Only the substantially updated selection guides receive an editorial lastmod.
  const urls=paths.map(path=>{
    const modified=path.startsWith('/categories/')?`<lastmod>${GUIDE_UPDATED}</lastmod>`:'';
    return `<url><loc>${SITE}${path}</loc>${modified}</url>`;
  }).join('');
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls+'</urlset>',
    {headers:{'Content-Type':'application/xml; charset=utf-8'}}
  );
};
