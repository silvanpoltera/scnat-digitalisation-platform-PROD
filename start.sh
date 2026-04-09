#!/bin/bash
#
# SCNAT Digitalisierungsportal — Start Script (macOS)
# Installiert Dependencies, startet Backend + Frontend und öffnet den Browser.
#

set -e

PORT_FRONTEND=5173
PORT_BACKEND=3001
DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$DIR"

# ── Farben ──────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${RED}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${NC}"
echo -e "${RED}┃${NC}  ${BOLD}SCNAT Digitalisierungsportal${NC}              ${RED}┃${NC}"
echo -e "${RED}┃${NC}  ${DIM}Start Script · macOS${NC}                      ${RED}┃${NC}"
echo -e "${RED}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${NC}"
echo ""

# ── Node.js prüfen ──────────────────────────────────
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗${NC} Node.js nicht gefunden. Bitte installieren: https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗${NC} Node.js >= 18 benötigt (aktuell: $(node -v))"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node -v)"

# ── Dependencies installieren ───────────────────────
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}→${NC} Dependencies werden installiert…"
    npm install --silent
    echo -e "${GREEN}✓${NC} Dependencies installiert"
else
    echo -e "${GREEN}✓${NC} Dependencies vorhanden"
fi

# ── Laufende Prozesse auf den Ports beenden ─────────
cleanup_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${DIM}  Port $port belegt — wird freigegeben…${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        sleep 0.5
    fi
}

cleanup_port $PORT_BACKEND
cleanup_port $PORT_FRONTEND

# ── Backend starten ─────────────────────────────────
echo -e "${CYAN}→${NC} Backend wird gestartet (Port $PORT_BACKEND)…"
node server/index.js &
PID_BACKEND=$!

# Warten bis Backend bereit ist
for i in $(seq 1 30); do
    if curl -s http://localhost:$PORT_BACKEND/api/auth/me > /dev/null 2>&1; then
        break
    fi
    sleep 0.3
done
echo -e "${GREEN}✓${NC} Backend läuft (PID $PID_BACKEND)"

# ── Frontend starten ────────────────────────────────
echo -e "${CYAN}→${NC} Frontend wird gestartet (Port $PORT_FRONTEND)…"
npx vite --port $PORT_FRONTEND &
PID_FRONTEND=$!

# Warten bis Vite bereit ist
for i in $(seq 1 40); do
    if curl -s http://localhost:$PORT_FRONTEND > /dev/null 2>&1; then
        break
    fi
    sleep 0.5
done
echo -e "${GREEN}✓${NC} Frontend läuft (PID $PID_FRONTEND)"

# ── Browser öffnen ──────────────────────────────────
echo ""
echo -e "${CYAN}→${NC} Browser wird geöffnet…"
sleep 1
open "http://localhost:$PORT_FRONTEND"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}  Portal bereit:${NC}  http://localhost:$PORT_FRONTEND"
echo -e "${BOLD}  API Server:${NC}    http://localhost:$PORT_BACKEND"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${DIM}  Drücke Ctrl+C um beide Server zu stoppen.${NC}"
echo ""

# ── Graceful Shutdown ───────────────────────────────
cleanup() {
    echo ""
    echo -e "${CYAN}→${NC} Server werden gestoppt…"
    kill $PID_FRONTEND 2>/dev/null || true
    kill $PID_BACKEND 2>/dev/null || true
    wait $PID_FRONTEND 2>/dev/null || true
    wait $PID_BACKEND 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Alle Prozesse beendet."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Auf Beendigung warten
wait
