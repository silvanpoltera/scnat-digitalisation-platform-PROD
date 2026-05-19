import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const routesDir = path.join(projectRoot, 'server', 'routes');
const serverIndexPath = path.join(projectRoot, 'server', 'index.js');

const runFull = process.argv.includes('--full');
let failedChecks = 0;

function ok(message) {
  console.log(`OK   ${message}`);
}

function warn(message) {
  console.log(`WARN ${message}`);
}

function fail(message) {
  failedChecks += 1;
  console.error(`FAIL ${message}`);
}

async function listRouteFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRouteFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${cmd} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function checkNoSyncJsonInRoutes(routeFiles) {
  const offenders = [];
  for (const file of routeFiles) {
    const content = await fs.readFile(file, 'utf-8');
    if (content.includes('readJSON(') || content.includes('writeJSON(')) {
      offenders.push(path.relative(projectRoot, file));
    }
  }
  if (offenders.length > 0) {
    fail(`Synchronous JSON access found in routes: ${offenders.join(', ')}`);
  } else {
    ok('No synchronous JSON helpers used in route modules');
  }
}

async function checkAtomicWritesUseLock(routeFiles) {
  const offenders = [];
  for (const file of routeFiles) {
    const content = await fs.readFile(file, 'utf-8');
    if (!content.includes('writeJSONAtomic(')) continue;
    if (!content.includes('withDataLock(')) {
      offenders.push(path.relative(projectRoot, file));
    }
  }
  if (offenders.length > 0) {
    fail(`Atomic writes without lock guard: ${offenders.join(', ')}`);
  } else {
    ok('Atomic write routes are guarded with withDataLock');
  }
}

async function checkIndexSecurityAndOps() {
  const content = await fs.readFile(serverIndexPath, 'utf-8');
  const requiredSnippets = [
    "helmet(",
    "rateLimit(",
    "app.get('/api/health'",
    "checkDataDirWritable",
    "process.on('SIGTERM'",
    "process.on('SIGINT'",
    "x-request-id",
    "Origin/Referer",
  ];
  const missing = requiredSnippets.filter((snippet) => !content.includes(snippet));
  if (missing.length > 0) {
    fail(`Missing critical server protections in index.js: ${missing.join(', ')}`);
  } else {
    ok('Security/ops middleware signatures are present in server/index.js');
  }
}

async function checkCoreScripts() {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  const scripts = pkg.scripts || {};
  const required = ['test:smoke', 'build', 'verify:it'];
  const missing = required.filter((name) => !scripts[name]);
  if (missing.length > 0) {
    fail(`Missing required package scripts: ${missing.join(', ')}`);
  } else {
    ok('Core package scripts exist (test:smoke, build, verify:it)');
  }
}

async function run() {
  console.log('== IT Preflight (Flat-File) ==');
  const routeFiles = await listRouteFiles(routesDir);
  ok(`Discovered ${routeFiles.length} route modules`);

  await checkNoSyncJsonInRoutes(routeFiles);
  await checkAtomicWritesUseLock(routeFiles);
  await checkIndexSecurityAndOps();
  await checkCoreScripts();

  if (runFull) {
    console.log('== Full checks ==');
    await runCommand('npm', ['run', 'test:smoke']);
    await runCommand('npm', ['run', 'build']);
    ok('Smoke + build completed');
  } else {
    warn('Skipped smoke/build execution. Use --full for end-to-end checks.');
  }

  if (failedChecks > 0) {
    console.error(`\nPreflight failed with ${failedChecks} check(s).`);
    process.exit(1);
  }
  console.log('\nPreflight passed.');
}

run().catch((err) => {
  console.error(`Preflight error: ${err.message}`);
  process.exit(1);
});
