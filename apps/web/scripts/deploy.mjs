import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export function assertDeploymentTarget(config, target, source) {
  if (!['production', 'staging'].includes(target)) throw new Error('Choose production or staging.');
  const expected = target === 'staging' ? {...source, ...source.env.staging} : source;
  if (config.name !== expected.name) throw new Error('Deployment target mismatch: Worker name.');
  if (config.vars?.ENVIRONMENT !== expected.vars.ENVIRONMENT) throw new Error('Deployment target mismatch: environment.');
  const databases = config.d1_databases ?? [];
  if (databases.length !== expected.d1_databases.length || expected.d1_databases.some(db =>
    !databases.some(actual => actual.binding === db.binding && actual.database_id === db.database_id))) {
    throw new Error('Deployment target mismatch: D1 database.');
  }
}

function deploy(target) {
  const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const source = JSON.parse(readFileSync(resolve(cwd, 'wrangler.jsonc'), 'utf8'));
  if (!['production', 'staging'].includes(target)) throw new Error('Choose production or staging.');
  const env = {...process.env};
  delete env.CLOUDFLARE_ENV;
  if (target === 'staging') env.CLOUDFLARE_ENV = 'staging';
  // The Cloudflare Vite plugin chooses the environment while building, not while deploying.
  const build = spawnSync(process.execPath, ['node_modules/astro/bin/astro.mjs', 'build'], {cwd, env, stdio: 'inherit'});
  if (build.error) throw build.error;
  if (build.status !== 0) process.exit(build.status ?? 1);
  const redirectPath = resolve(cwd, '.wrangler/deploy/config.json');
  const redirect = JSON.parse(readFileSync(redirectPath, 'utf8'));
  const configPath = resolve(dirname(redirectPath), redirect.configPath);
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  assertDeploymentTarget(config, target, source);
  console.log(`Verified deployment target: ${target} / ${config.name}`);
  // The generated config already contains the resolved name and bindings.
  // Do not let Wrangler apply a named-environment suffix a second time.
  delete env.CLOUDFLARE_ENV;
  const result = spawnSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'deploy', '--config', configPath, '--name', config.name], {cwd, env, stdio: 'inherit'});
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { deploy(process.argv[2]); } catch (error) { console.error(error.message); process.exit(1); }
}
