import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertDeploymentTarget} from '../scripts/deploy.mjs';

test('deployment rejects the opposite Worker and a matching Worker with the wrong environment or D1', () => {
  const source = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
  const staging = {...source, ...source.env.staging};
  assert.doesNotThrow(() => assertDeploymentTarget(source, 'production', source));
  assert.doesNotThrow(() => assertDeploymentTarget(staging, 'staging', source));
  assert.throws(() => assertDeploymentTarget(source, 'staging', source), /Worker name/);
  assert.throws(() => assertDeploymentTarget(staging, 'production', source), /Worker name/);
  assert.throws(() => assertDeploymentTarget({...staging, vars: source.vars}, 'staging', source), /environment/);
  assert.throws(() => assertDeploymentTarget({...staging, d1_databases: source.d1_databases}, 'staging', source), /D1 database/);
});
