#!/bin/bash
set -e
echo "=== Deploying scnat-portal-prod ==="
cd /opt/scnat-portal-prod

# Activate maintenance page
echo "→ Maintenance mode ON"
sudo cp /opt/scnat-portal-prod/public/maintenance.html /var/www/maintenance.html 2>/dev/null || true

MAINT_CONF='server { listen 80; server_name platform.poltis.ch; return 301 https://\$server_name\$request_uri; }
server { listen 443 ssl; server_name platform.poltis.ch;
  ssl_certificate /etc/letsencrypt/live/platform.poltis.ch/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/platform.poltis.ch/privkey.pem;
  include /etc/letsencrypt/options-ssl-nginx.conf;
  ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
  root /var/www; location / { try_files /maintenance.html =503; }
  location /scnat-icon.png { alias /opt/scnat-portal-prod/public/scnat-icon.png; }
}'

ORIG_CONF=$(sudo cat /etc/nginx/sites-available/scnat-portal)
echo "$MAINT_CONF" | sudo tee /etc/nginx/sites-available/scnat-portal > /dev/null
sudo nginx -t && sudo systemctl reload nginx

# Pull and build
echo "→ git pull"
git pull origin main

echo "→ npm install"
npm install

echo "→ npm run build"
npm run build

# Restore production config
echo "→ Maintenance mode OFF"
echo "$ORIG_CONF" | sudo tee /etc/nginx/sites-available/scnat-portal > /dev/null
sudo nginx -t && sudo systemctl reload nginx

# Restart API
echo "→ pm2 restart"
pm2 restart scnat-api || pm2 start server/index.js --name scnat-api
pm2 save

echo "=== Done: $(date) ==="
