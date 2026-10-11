import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safePageUrl,safeReferrer,readChoice,CONSENT_KEY} from '../src/lib/analytics.mjs';

test('analytics URLs cannot include search input, fragments, credentials or unknown paths',()=>{
 assert.equal(safePageUrl('https://shift.aqsh.co.jp/products/?q=person%40example.com#secret'),'https://shift.aqsh.co.jp/products/');
 assert.equal(safePageUrl('https://shift.aqsh.co.jp/products/jp04/?email=secret'),'https://shift.aqsh.co.jp/products/jp04/');
 assert.equal(safePageUrl('https://shift.aqsh.co.jp/private-person-name/'),'https://shift.aqsh.co.jp/404/');
 assert.equal(safePageUrl('https://name:password@shift.aqsh.co.jp/products/'),'https://shift.aqsh.co.jp/products/');
 assert.equal(safeReferrer('https://www.google.com/search?q=medical-secret'),'https://www.google.com/');
 assert.equal(safeReferrer('https://name:password@example.com/private-person?q=secret'),'https://example.com/');
 assert.equal(safeReferrer('https://shift.aqsh.co.jp/products/?q=secret'),'https://shift.aqsh.co.jp/products/');
 assert.equal(safeReferrer('javascript:secret'),'');
});

test('consent expires, fails closed and cannot be granted with a future timestamp',()=>{
 const now=1800000000000;
 const storage=value=>({getItem:key=>{assert.equal(key,CONSENT_KEY);return value;}});
 assert.equal(readChoice(storage(JSON.stringify({state:'granted',at:now-1})),now),'granted');
 assert.equal(readChoice(storage(JSON.stringify({state:'denied',at:now-1})),now),'denied');
 for(const value of ['broken',null,'{}',JSON.stringify({state:'granted',at:now+1}),JSON.stringify({state:'granted',at:now-180*86400000})]) assert.equal(readChoice(storage(value),now),null);
 assert.equal(readChoice({getItem(){throw new Error('blocked storage');}},now),null);
});
