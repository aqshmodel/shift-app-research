import type {APIRoute} from 'astro';
import {getResearch} from '../lib/data';
import {categoryInfo,SITE} from '../lib/catalog';
import {GUIDE_UPDATED} from '../lib/category-guides';
import {detailModifiedDate} from '../lib/publication-dates.mjs';

export const GET:APIRoute=async({locals})=>{
  const repository=getResearch(locals);
  const products=await repository.catalog();
  const dates=await repository.modificationDates();
  const detailDates=new Map(products.map((product:any)=>[`/products/${product.slug}/`,detailModifiedDate(dates[product.id])]));
  const paths=[
    '/','/products/','/methodology/','/references/form-9/',
    '/webmcp/','/about/','/privacy/','/terms/',
    ...Object.keys(categoryInfo).map(key=>`/categories/${key}/`),
    ...products.map((product:any)=>`/products/${product.slug}/`)
  ];
  const urls=paths.map(path=>{
    const date=detailDates.get(path)||(path.startsWith('/categories/')?GUIDE_UPDATED:null);
    const modified=date?`<lastmod>${date}</lastmod>`:'';
    return `<url><loc>${SITE}${path}</loc>${modified}</url>`;
  }).join('');
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>'+
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+urls+'</urlset>',
    {headers:{'Content-Type':'application/xml; charset=utf-8'}}
  );
};
