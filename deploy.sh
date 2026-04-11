#!/bin/bash
set -e

DOMAIN="platform.poltis.ch"
APP_DIR="/opt/scnat-portal-prod"
NGINX_CONF="/etc/nginx/sites-available/scnat-portal"

echo "=== Deploying scnat-portal-prod · $(date) ==="
cd "$APP_DIR"

# ── 1. Save original Nginx config ────────────────────────────────────
ORIG_CONF=$(sudo cat "$NGINX_CONF")

# ── 2. Activate maintenance page ─────────────────────────────────────
echo "→ Maintenance mode ON"
sudo mkdir -p /var/www
sudo cp "$APP_DIR/public/maintenance.html" /var/www/maintenance.html
sudo cp "$APP_DIR/public/scnat-icon.png"   /var/www/scnat-icon.png   2>/dev/null || true
sudo cp "$APP_DIR/public/apple-touch-icon.png" /var/www/apple-touch-icon.png 2>/dev/null || true
sudo cp "$APP_DIR/public/manifest.json"    /var/www/manifest.json    2>/dev/null || true
sudo cp "$APP_DIR/public/pwa-icon-192.png" /var/www/pwa-icon-192.png 2>/dev/null || true
sudo cp "$APP_DIR/public/pwa-icon-512.png" /var/www/pwa-icon-512.png 2>/dev/null || true

sudo tee "$NGINX_CONF" > /dev/null << MAINT
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\\\$server_name\\\$request_uri;
}
server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www;

    location / {
        try_files /maintenance.html =503;
    }
    location = /scnat-icon.png      { try_files /scnat-icon.png =404; }
    location = /apple-touch-icon.png { try_files /apple-touch-icon.png =404; }
    location = /manifest.json       { try_files /manifest.json =404; }
    location = /pwa-icon-192.png    { try_files /pwa-icon-192.png =404; }
    location = /pwa-icon-512.png    { try_files /pwa-icon-512.png =404; }
}
MAINT

sudo nginx -t && sudo systemctl reload nginx
echo "   Maintenance page active"

# ── 3. Pull latest code ──────────────────────────────────────────────
echo "→ git pull"
git pull origin main

# ── 4. Install dependencies ──────────────────────────────────────────
echo "→ npm install"
npm install --prefer-offline

# ── 5. Build frontend ────────────────────────────────────────────────
echo "→ npm run build"
npm run build

# ── 6. Restore production Nginx config ───────────────────────────────
echo "→ Maintenance mode OFF"
echo "$ORIG_CONF" | sudo tee "$NGINX_CONF" > /dev/null
sudo nginx -t && sudo systemctl reload nginx

# ── 7. Restart API ───────────────────────────────────────────────────
echo "→ pm2 restart"
pm2 restart scnat-api || pm2 start server/index.js --name scnat-api
pm2 save

echo "=== Deploy complete · $(date) ==="
