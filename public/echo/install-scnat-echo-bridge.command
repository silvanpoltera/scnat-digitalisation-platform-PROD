#!/bin/bash
set -euo pipefail

BRIDGE_DIR="$HOME/.scnat-echo-bridge"
BRIDGE_SCRIPT="$BRIDGE_DIR/bridge.mjs"
PLIST_PATH="$HOME/Library/LaunchAgents/ch.scnat.echo.bridge.plist"
NODE_BIN="$(command -v node || true)"

if [ -z "$NODE_BIN" ]; then
  echo "Fehler: Node.js wurde nicht gefunden. Bitte Node.js lokal installieren und Script erneut starten."
  exit 1
fi

mkdir -p "$BRIDGE_DIR"
mkdir -p "$HOME/Library/LaunchAgents"

cat > "$BRIDGE_SCRIPT" <<'EOF'
#!/usr/bin/env node
import http from 'http';
import { spawnSync, execSync } from 'child_process';
import { URL } from 'url';

const HOST = '127.0.0.1';
const PORT = 3017;
const ALLOWED_ORIGINS = new Set([
  'https://platform.poltis.ch',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(res, code, payload) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function isEchoRunning() {
  try {
    execSync("pgrep -f '/Applications/Echo.app/Contents/MacOS/Echo'", { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer((req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, {
      status: 'ok',
      engine: 'bridge_only',
      bridge: 'ready',
      echo_running: isEchoRunning(),
      user_message: {
        title: 'Lokaler Echo-Bridge-Dienst läuft',
        body: 'Echo kann nun per Button aus dem Portal gestartet werden.',
        emoji: '🧩',
      },
    });
  }

  if (req.method === 'POST' && url.pathname === '/start') {
    const start = spawnSync('open', ['-a', 'Echo'], { timeout: 10000 });
    if (start.error) {
      return json(res, 500, { ok: false, error: String(start.error.message || start.error) });
    }
    return json(res, 200, {
      ok: true,
      started: true,
      echo_running: isEchoRunning(),
    });
  }

  return json(res, 404, { error: 'not_found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[SCNAT Echo Bridge] listening on http://${HOST}:${PORT}`);
});
EOF

chmod +x "$BRIDGE_SCRIPT"

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>ch.scnat.echo.bridge</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE_BIN</string>
    <string>$BRIDGE_SCRIPT</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$HOME/Library/Logs/scnat-echo-bridge.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/Library/Logs/scnat-echo-bridge-error.log</string>
</dict>
</plist>
EOF

launchctl unload "$PLIST_PATH" >/dev/null 2>&1 || true
launchctl load "$PLIST_PATH"
launchctl start ch.scnat.echo.bridge >/dev/null 2>&1 || true

echo "SCNAT Echo Bridge installiert."
echo "Teste in 2-3 Sekunden: curl http://127.0.0.1:3017/health"
