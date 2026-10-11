import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSearch, validateIds, validateEvidence, toolSchemas } from '../src/lib/contracts.mjs';

test('search has a bounded, normalized contract', () => {
  assert.equal(validateSearch({q:'Ｓｈｉｆｔ', limit:10}).q, 'shift');
  assert.throws(() => validateSearch({q:'a'.repeat(101)}));
  assert.throws(() => validateSearch({limit:51}));
  assert.throws(() => validateSearch({category:'invented'}));
  assert.throws(() => validateSearch({state:'unsupported'}));
  assert.throws(() => validateSearch({feature:'MFA'}));
  assert.throws(() => validateSearch({sql:'select *'}));
});
test('comparison requires 2–4 distinct fixed offering IDs', () => {
  assert.deepEqual(validateIds(['OF-JP01','OF-US01']), ['OF-JP01','OF-US01']);
  for (const bad of [[],['OF-JP01'],['OF-JP01','OF-JP01'],['JP01','OF-JP01'],['OF-JP01','OF-JP02','OF-JP03','OF-JP04','OF-JP05']]) assert.throws(() => validateIds(bad));
});
test('evidence rejects arbitrary criteria and pagination', () => {
  assert.equal(validateEvidence({id:'OF-JP04',criterion:'J05',page:1}).page,1);
  assert.throws(() => validateEvidence({id:'OF-JP04',criterion:"' OR 1=1"}));
  assert.throws(() => validateEvidence({id:'OF-JP04',page:-1}));
});
test('five tools are distinct, bounded and closed to extra parameters', () => {
  assert.equal(Object.keys(toolSchemas).length,5);
  for (const schema of Object.values(toolSchemas)) {
    assert.equal(schema.type,'object');
    assert.equal(schema.additionalProperties,false);
  }
});
