# SCNAT Digitalisierungsportal — Deployment & Server-Anforderungen

> Alles, was für einen sicheren, schnellen und hochverfügbaren Betrieb dieser App nötig ist.

---

## 1. Server-Anforderungen (Hardware / VM)

| Ressource | Minimum | Empfohlen |
|-----------|---------|-----------|
| **CPU** | 1 vCPU | 2 vCPU |
| **RAM** | 1 GB | 2 GB |
| **Disk** | 10 GB SSD | 20 GB SSD |
| **OS** | Ubuntu 22.04+ / Debian 12 | Ubuntu 24.04 LTS |
| **Netzwerk** | 100 Mbit/s | 1 Gbit/s |

Die App ist leichtgewichtig (Node.js + statische Files). Ein kleiner VPS oder eine interne VM bei der SCNAT reicht problemlos.

**Hosting-Optionen:**
- **SCNAT-intern**: VM auf vorhandener Infrastruktur (vSphere, Proxmox, etc.)
- **Schweizer Cloud**: Infomaniak (Genf), Exoscale (CH), SWITCH (akademisches Netz)
- **Hyperscaler**: Azure Switzerland North (Zürich), AWS eu-central-2 (Zürich)

> Für einen Schweizer Wissenschaftsbetrieb empfiehlt sich Hosting in der Schweiz (Datenschutz, Latenz, Compliance).

---

## 2. Software-Stack auf dem Server

### Zwingend erforderlich

| Software | Version | Zweck |
|----------|---------|-------|
| **Node.js** | >= 18 LTS (empfohlen: 20 LTS) | Runtime für Backend + Build |
| **npm** | >= 9 | Dependency Management |
| **PM2** | latest | Process Manager (Auto-Restart, Logs, Cluster) |
| **Nginx** | >= 1.22 | Reverse Proxy, SSL-Termination, Static Files |
| **Certbot** | latest | Let's Encrypt SSL-Zertifikate (automatisch) |
| **UFW** | (vorinstalliert) | Firewall |
| **Git** | >= 2.30 | Code Deployment |

### Optional (empfohlen)

| Software | Zweck |
|----------|-------|
| **Fail2Ban** | Schutz gegen Brute-Force-Angriffe |
| **Logrotate** | Log-Dateien automatisch rotieren |
| **rsync / rclone** | Automatische Backups der JSON-Daten |
| **htop / glances** | Server-Monitoring |
| **Docker** | Alternative: containerisiertes Deployment |

---

## 3. Deployment-Ablauf

### 3.1 Server vorbereiten

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PM2 global installieren
sudo npm install -g pm2

# Nginx installieren
sudo apt install -y nginx certbot python3-certbot-nginx

# Firewall konfigurieren
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3.2 App deployen

```bash
# Code auf den Server bringen
cd /opt
sudo git clone <REPO_URL> scnat-portal
cd scnat-portal

# Dependencies installieren
npm install --production=false

# Frontend bauen (statische Files)
npm run build

# Ergebnis: dist/ Ordner mit HTML/JS/CSS
```

### 3.3 PM2 — Backend als Service

```bash
# Backend starten
pm2 start server/index.js --name scnat-api --node-args="--experimental-modules"

# Auto-Start bei Server-Reboot
pm2 startup
pm2 save

# Nützliche Befehle:
pm2 status          # Status aller Prozesse
pm2 logs scnat-api  # Live-Logs
pm2 restart scnat-api
pm2 monit           # CPU/RAM Dashboard
```

**PM2 Ecosystem-File** (optional, als `ecosystem.config.cjs`):

```javascript
module.exports = {
  apps: [{
    name: 'scnat-api',
    script: 'server/index.js',
    node_args: '--experimental-modules',
    instances: 1,         // oder 'max' für Cluster-Mode
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env_file: '.env',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
    },
  }],
};
```

### 3.4 Nginx — Reverse Proxy + Static Files

```nginx
# /etc/nginx/sites-available/scnat-portal

server {
    listen 80;
    server_name digitalisierung.scnat.ch;  # Domain anpassen
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name digitalisierung.scnat.ch;

    # SSL (wird von Certbot automatisch befüllt)
    ssl_certificate     /etc/letsencrypt/live/digitalisierung.scnat.ch/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digitalisierung.scnat.ch/privkey.pem;

    # Sicherheits-Header
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;

    # Gzip-Kompression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 256;

    # Statische Files (Vite Build Output)
    root /opt/scnat-portal/dist;
    index index.html;

    # Assets mit langem Cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API → Backend weiterleiten
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }

    # SPA Routing — alle anderen Pfade → index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Aktivieren
sudo ln -s /etc/nginx/sites-available/scnat-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL-Zertifikat einrichten (automatisch)
sudo certbot --nginx -d digitalisierung.scnat.ch
```

---

## 4. Sicherheit

### 4.1 Zwingend vor Go-Live

| Massnahme | Details |
|-----------|---------|
| **JWT_SECRET** | Eigenes, langes Geheimnis setzen (mind. 64 Zeichen). Wird aus `.env` / Umgebungsvariable gelesen. |
| **HTTPS only** | Kein HTTP-Traffic erlauben, alles auf HTTPS umleiten (Nginx-Config oben). |
| **Cookie-Flags** | `secure: true` setzen in `server/routes/auth.js` (aktuell `false` für Dev). `sameSite: 'strict'`. |
| **CORS einschränken** | `origin` in `server/index.js` auf die echte Domain setzen statt `localhost:5173`. |
| **Rate Limiting** | Bereits integriert: 120 Req/Min global, 20 Login-Versuche/15 Min. Bei Bedarf anpassen. |
| **Admin-Passwort** | Starkes Passwort für den Admin-Account setzen (mind. 12 Zeichen, Sonderzeichen). |
| **SSH-Zugang** | Nur per SSH-Key, Passwort-Login deaktivieren. Root-Login deaktivieren. |
| **Fail2Ban** | Schützt SSH und Nginx vor Brute-Force. |

### 4.2 Empfohlen

| Massnahme | Details |
|-----------|---------|
| **Helmet.js** | Bereits integriert. CSP wird in Production automatisch aktiviert. |
| **Content Security Policy** | Via Nginx oder Helmet konfigurieren. |
| **Regelmässige Updates** | `sudo apt update && sudo apt upgrade` monatlich, Node.js-Updates per nvm. |
| **Audit** | `npm audit` regelmässig ausführen und Vulnerabilities fixen. |

### 4.3 Code-Anpassungen für Production

In `server/index.js`:

```javascript
// CORS auf echte Domain einschränken
app.use(cors({
  origin: 'https://digitalisierung.scnat.ch',
  credentials: true,
}));
```

In `server/routes/auth.js` (Cookie-Config):

```javascript
res.cookie('token', token, {
  httpOnly: true,
  secure: true,              // ← auf true setzen
  sameSite: 'strict',        // ← von 'lax' auf 'strict'
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
```

---

## 5. Backups

Die App speichert alle Daten in JSON-Files unter `/data`. Diese müssen regelmässig gesichert werden.

### Automatisches tägliches Backup

```bash
# /opt/scnat-portal/backup.sh

#!/bin/bash
BACKUP_DIR="/opt/backups/scnat-portal"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/data_$TIMESTAMP.tar.gz" -C /opt/scnat-portal data/

# Alte Backups löschen (älter als 30 Tage)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
```

```bash
# Cronjob einrichten (täglich um 03:00)
crontab -e
# Zeile hinzufügen:
0 3 * * * /opt/scnat-portal/backup.sh
```

### Empfohlen: Off-Site Backup

```bash
# Backup auf externen Storage kopieren (z.B. SWITCH Drive, S3, NAS)
rclone copy /opt/backups/scnat-portal remote:scnat-backups/
```

---

## 6. Monitoring & Verfügbarkeit

### Basis-Monitoring mit PM2

```bash
pm2 install pm2-logrotate    # Automatische Log-Rotation
pm2 monit                    # Live CPU/RAM Überwachung
```

### Health-Check Endpoint

Im Backend einen einfachen Health-Check ergänzen:

```javascript
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### Uptime-Monitoring (extern)

| Tool | Kosten | Beschreibung |
|------|--------|-------------|
| **UptimeRobot** | Gratis (50 Checks) | Prüft alle 5 Min ob die Seite erreichbar ist, Alert via E-Mail/SMS |
| **Uptime Kuma** | Gratis (self-hosted) | Open Source, auf eigenem Server installierbar |
| **Better Stack** | Gratis (bis 10 Monitore) | Incident Management + Status Page |

### Log-Management

```bash
# PM2-Logs anschauen
pm2 logs scnat-api --lines 100

# Nginx Access/Error Logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 7. Performance-Optimierung

| Bereich | Massnahme | Impact |
|---------|-----------|--------|
| **Frontend** | Vite Build mit Chunking → `dist/assets/` mit Content-Hash | Caching für 1 Jahr |
| **Nginx** | Gzip aktiviert, statische Assets mit `expires 1y` | Schnelle Ladezeiten |
| **Backend** | PM2 Cluster Mode bei Bedarf (mehrere Worker) | Parallelverarbeitung |
| **JSON Storage** | Bei >1000 Einträgen auf SQLite (besser: `better-sqlite3`) migrieren | I/O Performance |
| **CDN** | Optional: Cloudflare Free Tier davor schalten | Global schnell, DDoS-Schutz |

---

## 8. Update- / Deploy-Prozess

### Manuelles Deployment

```bash
cd /opt/scnat-portal

# Neusten Code holen
git pull origin main

# Dependencies aktualisieren
npm install

# Frontend neu bauen
npm run build

# Backend neustarten
pm2 restart scnat-api

# Prüfen
pm2 status
curl -s https://digitalisierung.scnat.ch/api/health
```

### Automatisiert (optional)

Ein einfaches Skript `/opt/scnat-portal/deploy.sh`:

```bash
#!/bin/bash
set -e
cd /opt/scnat-portal
git pull origin main
npm install
npm run build
pm2 restart scnat-api
echo "✓ Deployment erfolgreich — $(date)"
```

---

## 9. Docker-Alternative

Falls Docker bevorzugt wird:

```dockerfile
# Dockerfile
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist
COPY --from=build /app/data ./data
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3001
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "server/index.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    expose:
      - "3001"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
      - COOKIE_SECURE=true
    restart: unless-stopped
    read_only: true
    tmpfs:
      - /tmp
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - internal

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      app:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - internal

networks:
  internal:
    driver: bridge
```

---

## 10. Checkliste vor Go-Live

- [ ] Server aufgesetzt (Ubuntu, Node.js, PM2, Nginx)
- [ ] Domain konfiguriert (DNS A-Record → Server-IP)
- [ ] SSL-Zertifikat aktiv (Let's Encrypt via Certbot)
- [ ] JWT_SECRET als sichere Umgebungsvariable gesetzt
- [ ] Cookie `secure: true` und `sameSite: 'strict'`
- [ ] CORS auf die echte Domain eingeschränkt
- [ ] Admin-Passwort geändert (starkes Passwort, mind. 12 Zeichen)
- [ ] Firewall aktiv (nur SSH + HTTPS offen)
- [ ] SSH nur per Key, kein Passwort-Login
- [ ] Fail2Ban installiert und konfiguriert
- [ ] Backup-Cronjob eingerichtet und getestet
- [ ] Uptime-Monitoring eingerichtet
- [ ] `npm audit` ausgeführt, keine kritischen Findings
- [ ] Testlauf: Login, Navigation, API-Calls funktionieren über HTTPS
- [ ] Erstbenutzer (Silvan) kann sich einloggen und CP erreichen

---

## 11. Kosten-Einschätzung

| Variante | Monatlich | Beschreibung |
|----------|-----------|-------------|
| **SCNAT-interne VM** | CHF 0 | Wenn bestehende Infrastruktur vorhanden |
| **Infomaniak VPS (Genf)** | ~CHF 5–10 | 1 vCPU, 2 GB RAM, 20 GB SSD |
| **Exoscale Small** | ~CHF 10 | Schweizer Cloud, gute Performance |
| **Azure B1s (Zürich)** | ~CHF 8–12 | Falls Microsoft-Ökosystem bevorzugt |
| **Domain** | ~CHF 10/Jahr | Falls eigene Subdomain nötig (z.B. via Infomaniak) |
| **SSL** | CHF 0 | Let's Encrypt ist kostenlos |

> Gesamtkosten: **CHF 5–15/Monat** je nach Provider — oder CHF 0 auf interner Infrastruktur.

---

## Zusammenfassung

Diese App braucht keinen grossen Server. Ein kleiner VPS mit **Node.js, PM2, Nginx und Let's Encrypt** genügt vollständig. Die kritischen Punkte sind:

1. **HTTPS und Sicherheits-Header** — kein HTTP-Traffic
2. **JWT_SECRET und Cookie-Flags** für Production anpassen
3. **Tägliche Backups** des `data/`-Ordners
4. **Uptime-Monitoring** damit Ausfälle sofort bemerkt werden
5. **Regelmässige Updates** von OS, Node.js und npm-Dependencies

Bei Fragen zur Umsetzung: Die gesamte Infrastruktur lässt sich in unter einer Stunde aufsetzen.
