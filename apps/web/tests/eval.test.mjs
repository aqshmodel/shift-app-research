import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {validateSearch,validateId,validateIds,validateEvidence} from '../src/lib/contracts.mjs';
const cases=JSON.parse(readFileSync(new URL('../../../docs/webmcp/eval-cases.json',import.meta.url))).cases;
function validate(c){if(c.tool==='search_shift_products'){const v=validateSearch(c.input);if(v.limit>20)throw new Error('tool limit');}else if(c.tool==='get_shift_product'){if(Object.keys(c.input).some(k=>k!=='id'))throw new Error('extra');validateId(c.input.id);}else if(c.tool==='compare_shift_products'){if(Object.keys(c.input).some(k=>k!=='ids'))throw new Error('extra');validateIds(c.input.ids);}else if(c.tool==='get_shift_evidence')validateEvidence(c.input);else if(Object.keys(c.input).length)throw new Error('extra');}
test('150 golden cases contain distinct tool intent and 100 validated argument cases',()=>{
 assert.equal(cases.length,150);assert.equal(new Set(cases.map(c=>c.id)).size,150);let checked=0;
 for(const c of cases){if(!c.input)continue;c.valid?assert.doesNotThrow(()=>validate(c),c.id):assert.throws(()=>validate(c),undefined,c.id);checked++;}assert.equal(checked,100);
});
