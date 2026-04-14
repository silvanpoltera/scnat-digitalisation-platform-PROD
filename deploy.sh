#!/bin/bash
set -e

DOMAIN="platform.poltis.ch"
APP_DIR="/opt/scnat-portal-prod"
NGINX_CONF="/etc/nginx/sites-available/scnat-portal"
NGINX_BAK="/etc/nginx/sites-available/scnat-portal.bak"

echo "=== Deploying scnat-portal-prod · $(date) ==="
cd "$APP_DIR"

# Restore Nginx and PM2 on ANY failure so the site never stays on maintenance
restore_on_fail() {
  echo "!! Deploy failed – restoring previous state"
  sudo cp "$NGINX_BAK" "$NGINX_CONF" 2>/dev/null || true
  sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true
  pm2 delete scnat-api 2>/dev/null || true
  pm2 start server/index.js --name scnat-api 2>/dev/null || true
  pm2 save 2>/dev/null || true
}
trap restore_on_fail ERR

# ── 1. Activate maintenance page ─────────────────────────────────────
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

# ── 2. Pull latest code ──────────────────────────────────────────────
echo "→ git pull"
# data/*.json may have live changes from the running app – use checkout
# to accept incoming code and then re-apply live data afterwards
git checkout -- data/ 2>/dev/null || true
git pull origin main

# ── 3. Install dependencies ──────────────────────────────────────────
echo "→ npm install"
npm install --prefer-offline

# ── 4. Build frontend ────────────────────────────────────────────────
echo "→ npm run build"
npm run build

# ── 5. Restore production Nginx config ───────────────────────────────
echo "→ Maintenance mode OFF"
sudo cp "$NGINX_BAK" "$NGINX_CONF"
sudo nginx -t && sudo systemctl reload nginx

# ── 6. Restart API (delete + start to ensure fresh code load) ────────
echo "→ pm2 restart"
pm2 delete scnat-api 2>/dev/null || true
pm2 start server/index.js --name scnat-api
pm2 save

echo "=== Deploy complete · $(date) ==="
