import { spawn } from 'child_process';
import { setTimeout as sleep } from 'timers/promises';

const port = process.env.SMOKE_PORT || '3101';
const baseUrl = `http://127.0.0.1:${port}`;
const startTimeoutMs = 15000;
const stopTimeoutMs = 10000;
const jwtSecret = process.env.JWT_SECRET || 'dev-smoke-secret-please-change-this-1234567890';

function fail(message) {
  console.error(`[smoke] ${message}`);
  process.exit(1);
}

const server = spawn(process.execPath, ['server/index.js'], {
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'development',
    JWT_SECRET: jwtSecret,
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let ready = false;
let exited = false;
let stdoutBuffer = '';
let stderrBuffer = '';

server.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  stdoutBuffer += text;
  if (text.includes('SCNAT API server running')) ready = true;
});

server.stderr.on('data', (chunk) => {
  stderrBuffer += chunk.toString();
});

server.on('exit', () => {
  exited = true;
});

for (let elapsed = 0; elapsed < startTimeoutMs; elapsed += 200) {
  if (ready) break;
  if (exited) fail(`Server exited early.\n${stderrBuffer || stdoutBuffer}`);
  await sleep(200);
}

if (!ready) {
  server.kill('SIGKILL');
  fail(`Server did not start within ${startTimeoutMs}ms.\n${stderrBuffer || stdoutBuffer}`);
}

const healthRes = await fetch(`${baseUrl}/api/health`);
if (!healthRes.ok) {
  server.kill('SIGKILL');
  fail(`Health endpoint returned status ${healthRes.status}.`);
}

const health = await healthRes.json();
if (health.status !== 'ok' || !health?.checks?.dataWritable) {
  server.kill('SIGKILL');
  fail(`Unexpected health payload: ${JSON.stringify(health)}`);
}

server.kill('SIGTERM');
for (let elapsed = 0; elapsed < stopTimeoutMs; elapsed += 200) {
  if (exited) break;
  await sleep(200);
}

if (!exited) {
  server.kill('SIGKILL');
  fail(`Server did not stop within ${stopTimeoutMs}ms after SIGTERM.`);
}

console.log('[smoke] Health and graceful shutdown checks passed.');
