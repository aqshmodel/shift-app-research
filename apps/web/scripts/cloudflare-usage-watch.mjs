import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function detectUsageAnomalies(groups, now=Date.now()) {
  const hour=3600000, end=Math.floor(now/hour)*hour;
  const dbs=new Map();
  for(const row of groups){
    const id=row.dimensions.databaseId;
    if(!dbs.has(id))dbs.set(id,[]);dbs.get(id).push(row);
  }
  return [...dbs].map(([databaseId,rows])=>{
    const latest=Math.max(...rows.map(r=>Date.parse(r.dimensions.datetimeHour)));
    // Recheck three completed hours so a delayed ingestion does not silently skip a spike.
    const current=rows.filter(r=>Date.parse(r.dimensions.datetimeHour)>=end-3*hour && Date.parse(r.dimensions.datetimeHour)<end);
    const baseline=rows.filter(r=>Date.parse(r.dimensions.datetimeHour)<end-3*hour && Date.parse(r.dimensions.datetimeHour)>=end-8*24*hour);
    const thresholds={rowsRead:5_000_000,rowsWritten:100_000,readQueries:10_000,writeQueries:1_000};
    const metrics={};
    for(const [field,floor] of Object.entries(thresholds)){
      const values=baseline.map(r=>r.sum[field]).sort((a,b)=>a-b);
      const median=values[Math.floor(values.length/2)]??0;
      const value=Math.max(0,...current.map(r=>r.sum[field]));
      metrics[field]={value,median,threshold:Math.max(floor,median*5),alert:current.length>0 && value>Math.max(floor,median*5)};
    }
    return {databaseId,latestAvailable:new Date(latest).toISOString(),stale:latest<end-2*hour,
      currentHourAvailable:current.some(r=>Date.parse(r.dimensions.datetimeHour)===end-hour),reviewedHours:current.length,metrics};
  });
}

export async function readUsage({accountId,token,fetcher=fetch,now=Date.now()}) {
  if(!/^[a-f0-9]{32}$/.test(accountId??'')||!token)throw Error('Set CLOUDFLARE_ACCOUNT_ID and a GraphQL-read CLOUDFLARE_API_TOKEN.');
  const start=new Date(now-8*86400000).toISOString(),end=new Date(now).toISOString();
  // One analytics request; no D1 queries, DB writes, overlap, retries or Worker/Cron deployment.
  const response=await fetcher('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{
    Authorization:'Bearer '+token,'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({query:
    `{viewer{accounts(filter:{accountTag:"${accountId}"}){d1AnalyticsAdaptiveGroups(limit:10000,filter:{datetime_geq:"${start}",datetime_leq:"${end}"}){dimensions{databaseId datetimeHour}sum{rowsRead rowsWritten readQueries writeQueries}}}}}`})});
  const result=await response.json();
  if(!response.ok||result.errors?.length)throw Error('Cloudflare analytics unavailable; no automatic retry.');
  const rows=result.data?.viewer?.accounts?.[0]?.d1AnalyticsAdaptiveGroups;
  if(!Array.isArray(rows))throw Error('Cloudflare analytics response incomplete.');
  if(rows.length>=10000)throw Error('Cloudflare analytics result may be truncated; check dashboard.');
  return {at:new Date(now).toISOString(),empty:rows.length===0,databases:detectUsageAnomalies(rows,now)};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const result=await readUsage({accountId:process.env.CLOUDFLARE_ACCOUNT_ID,token:process.env.CLOUDFLARE_API_TOKEN});
  console.log(JSON.stringify(result,null,2));process.exitCode=result.databases.some(d=>d.stale||Object.values(d.metrics).some(m=>m.alert))?2:result.empty?2:0;
 }catch{console.error('Usage check failed. Check GraphQL read permission and dashboard; no retry was run.');process.exitCode=1;}
}
