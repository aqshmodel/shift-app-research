import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
test('public runtime stays read-only and cannot silently add background billed execution',()=>{
 function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);}
 for(const file of files(new URL('../src',import.meta.url).pathname).filter(f=>/\.(ts|mjs|astro)$/.test(f))){
  const source=readFileSync(file,'utf8');
  assert(!/\bsetAlarm\s*\(|\bscheduled\s*\(|\bqueue\s*\(|\bwhile\s*\(\s*true\s*\)|\bfor\s*\(\s*;\s*;/.test(source),file+' adds background/unbounded execution; review budgets and tests before updating this policy.');
  assert(!/\b(?:INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM|DROP\s+TABLE|CREATE\s+TABLE)\b/i.test(source),file+' must not write D1 from the public runtime.');
 }
 const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url)));
 for(const env of [config,config.env.staging]){
  assert(!env.triggers?.crons?.length);assert(!env.queues);assert(!env.durable_objects);assert(!env.workflows);
 }
 assert.equal(config.observability.logs.invocation_logs,false);
 assert(config.observability.logs.head_sampling_rate<=0.01);
 assert.equal(config.observability.traces.enabled,false);
});
