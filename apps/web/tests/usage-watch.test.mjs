import {test} from 'node:test';
import assert from 'node:assert/strict';
import {detectUsageAnomalies,readUsage} from '../scripts/cloudflare-usage-watch.mjs';
const now=Date.parse('2026-10-14T04:30:00Z');
const row=(date,reads,writes=0)=>({dimensions:{databaseId:'test',datetimeHour:date},sum:{rowsRead:reads,rowsWritten:writes,readQueries:100,writeQueries:0}});
test('absolute and fivefold baseline thresholds avoid low-volume noise and report ingestion delay',()=>{
 const base=row('2026-10-14T02:00:00Z',100);
 assert.equal(detectUsageAnomalies([base,row('2026-10-14T03:00:00Z',1000)],now)[0].metrics.rowsRead.alert,false);
 assert.equal(detectUsageAnomalies([base,row('2026-10-14T03:00:00Z',6_000_000)],now)[0].metrics.rowsRead.alert,true);
 assert.equal(detectUsageAnomalies([row('2026-10-14T02:00:00Z',6_000_000)],now)[0].metrics.rowsRead.alert,true);
 assert.equal(detectUsageAnomalies([row('2026-10-14T00:00:00Z',10)],now)[0].stale,true);
 assert.equal(detectUsageAnomalies([base,row('2026-10-14T03:00:00Z',100,100_001)],now)[0].metrics.rowsWritten.alert,true);
});
test('analytics failure makes exactly one bounded request and never retries or runs SQL',async()=>{
 let calls=0;
 await assert.rejects(()=>readUsage({accountId:'a'.repeat(32),token:'test',fetcher:async(url,options)=>{
  calls++;assert.equal(url,'https://api.cloudflare.com/client/v4/graphql');assert(options.signal);assert(!options.body.includes('SELECT '));
  return {ok:false,json:async()=>({errors:[{message:'unavailable'}]})};
 }}),/unavailable/);assert.equal(calls,1);
});
