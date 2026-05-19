# SCNAT Digitalisierungsportal

Internes Portal der Akademie der Naturwissenschaften Schweiz (SCNAT) für die digitale Transformation. Zentrale Anlaufstelle für Strategiedokumentation, Systemlandschaft, KI-Richtlinien, Schulungen, Sprint-Planung, Massnahmentracking und administrative Verwaltung.

**Live:** [platform.poltis.ch](https://platform.poltis.ch)

## Inhaltsverzeichnis

- [Architektur](#architektur)
- [Voraussetzungen](#voraussetzungen)
- [Installation & Start](#installation--start)
- [Projektstruktur](#projektstruktur)
- [Frontend](#frontend)
- [Backend (API)](#backend-api)
- [Authentifizierung](#authentifizierung)
- [Datenhaltung](#datenhaltung)
- [Design-System](#design-system)
- [Seiten & Module](#seiten--module)
- [Control Panel (Admin)](#control-panel-admin)
- [API-Referenz](#api-referenz)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Deployment](#deployment)

---

## Architektur

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
│  React 18 + React Router + Tailwind CSS + Framer    │
│  (Vite Dev-Server :5173)                            │
└───────────────────┬─────────────────────────────────┘
                    │  /api/*  (Proxy)
                    ▼
┌─────────────────────────────────────────────────────┐
│               Express.js API (:3001)                 │
│  JWT Auth · CORS · Cookie-Parser                     │
│  18 Route-Module                                     │
└───────────────────┬─────────────────────────────────┘
                    │  async read + atomic write + lock
                    ▼
┌─────────────────────────────────────────────────────┐
│              /data/*.json  (File Storage)             │
│  users · sprints · massnahmen · events · news · …    │
└─────────────────────────────────────────────────────┘
```

| Schicht  | Technologie                                     |
|----------|-------------------------------------------------|
| Frontend | React 18, Vite 6, React Router 6, Tailwind 3   |
| UI       | Radix UI, Framer Motion, Lucide Icons, Recharts, dnd-kit |
| Backend  | Express 5, Node.js (ESM)                        |
| Auth     | JWT (jsonwebtoken), bcryptjs, httpOnly Cookies   |
| Storage  | JSON-Dateien im Dateisystem (`/data`)            |
| Fonts    | DM Sans, JetBrains Mono (Google Fonts)           |

---

## Voraussetzungen

- **Node.js** >= 18
- **npm** >= 9

Keine Datenbank nötig — alle Daten werden als JSON-Dateien im `/data`-Verzeichnis gespeichert.

---

## Installation & Start

```bash
npm install
npm run dev:all          # Frontend (5173) + Backend (3001)
```

Vite proxied automatisch alle `/api/*`-Anfragen an den Express-Server.

```bash
npm run dev              # Nur Frontend
npm run server           # Nur Backend
npm run build            # Produktions-Build nach /dist
npm run preview          # Built-Version lokal testen
npm run test:smoke       # Health + Graceful-Shutdown Smoke-Test
npm run verify:it        # IT-Preflight (Flat-File-Regeln)
npm run verify:it:full   # Preflight + Smoke + Build
```

### Standard-Login

Beim ersten Start existiert ein Admin-Account. Zugangsdaten in `.env`. **Niemals Passwörter in Code oder Dokumentation.**

---

## Projektstruktur

```
├── data/                          # JSON-Datenspeicher (19 Dateien)
│   ├── users.json                 # Benutzer (gehashte Passwörter)
│   ├── massnahmen.json            # Massnahmen + Admin Tasks
│   ├── sprints.json               # Sprint-Planung + Admin Sprints
│   ├── events.json                # Schulungstermine
│   ├── registrations.json         # Schulungsanmeldungen
│   ├── requests.json              # Softwareanträge
│   ├── software.json              # Softwarekatalog
│   ├── software-votes.json        # Nutzervotings zu Software
│   ├── schulungsthemen.json       # Themenwünsche & Likes
│   ├── content.json               # Redaktionelle Inhalte
│   ├── scnat-infra.json           # SCNAT DB Infra-Daten
│   ├── ki-content.json            # KI-Hub Lerninhalte
│   ├── changes.json               # Change-Log / Änderungen
│   ├── news.json                  # News-Beiträge
│   ├── live-infos.json            # Live-Informationen
│   ├── inbox-messages.json        # Admin-Inbox Nachrichten
│   ├── notifications-seen.json    # Gelesen-Status
│   ├── user-groups.json           # Benutzergruppen
│   └── visibility.json            # Seitensichtbarkeit
│
├── server/                        # Express Backend
│   ├── index.js                   # Server-Einstiegspunkt
│   ├── auth.js                    # JWT-Helpers & Middleware
│   ├── utils.js                   # readJSON, writeJSON, generateId
│   └── routes/                    # 18 API-Route-Module
│       ├── auth.js
│       ├── massnahmen.js
│       ├── sprints.js
│       ├── events.js
│       ├── registrations.js
│       ├── requests.js
│       ├── users.js
│       ├── software-votes.js
│       ├── schulungsthemen.js
│       ├── content.js
│       ├── scnat-infra.js
│       ├── ki-content.js
│       ├── changes.js
│       ├── news.js
│       ├── live-infos.js
│       ├── inbox.js
│       ├── notifications.js
│       └── visibility.js
│
├── src/                           # React Frontend
│   ├── App.jsx                    # Routing-Konfiguration
│   ├── index.css                  # Globales CSS, Design-Tokens
│   ├── main.jsx                   # React-Einstiegspunkt
│   ├── contexts/
│   │   └── AuthContext.jsx        # Auth-State
│   ├── components/                # Wiederverwendbare Komponenten
│   │   ├── Layout.jsx             # Haupt-Layout (Sidebar + Content)
│   │   ├── CpLayout.jsx           # Admin Control Panel Layout
│   │   ├── Sidebar.jsx            # Navigation mit Suche
│   │   ├── Header.jsx             # Page Header
│   │   ├── Footer.jsx             # Footer
│   │   ├── NewsTicker.jsx         # Sticky News-Leiste
│   │   ├── SearchModal.jsx        # Globale Suche (⌘K)
│   │   ├── ProtectedRoute.jsx     # Auth-Guard
│   │   ├── AdminRoute.jsx         # Admin-Guard
│   │   ├── VisibilityGuard.jsx    # Seitensichtbarkeits-Guard
│   │   ├── PageHeader.jsx         # Wiederverwendbarer Seiten-Header
│   │   ├── NetworkBackground.jsx  # Digitales Netzwerk-SVG
│   │   ├── RadarChart.jsx         # SVG-Radarchart für Software
│   │   ├── SoftwareDrawer.jsx     # Software-Detail-Drawer
│   │   ├── ScnatLogo.jsx          # SCNAT Logo-Komponente
│   │   ├── home/                  # Home-Unterkomponenten
│   │   ├── ki/                    # KI-Hub-Unterkomponenten
│   │   ├── strategy/              # Strategie-Unterkomponenten
│   │   ├── vision/                # Vision-House-Unterkomponenten
│   │   ├── systemlandschaft/      # Systemlandschaft-Unterkomponenten
│   │   ├── sprints/               # Sprint-Unterkomponenten (Gantt, Timeline, ...)
│   │   ├── prozesse/              # Prozess-Unterkomponenten
│   │   └── ui/                    # shadcn/ui Basiskomponenten
│   └── pages/
│       ├── Home.jsx               # Startseite / Dashboard
│       ├── Strategie.jsx          # Digitalisierungsstrategie
│       ├── Handlungsfelder.jsx    # 6 Handlungsfelder
│       ├── Massnahmen.jsx         # Massnahmen (3 Views)
│       ├── Sprints.jsx            # Sprint-Planung (Timeline)
│       ├── Systemlandschaft.jsx   # Software-Katalog & Ranking
│       ├── KiHub.jsx              # KI-Lernbereich (3 Tabs)
│       ├── Schulungen.jsx         # Kalender & Themenvoting
│       ├── SoftwareAntraege.jsx   # Antragsformular
│       ├── ScnatDb.jsx            # SCNAT DB Infrastruktur
│       ├── Prozesse.jsx           # Beschaffung & PM-Framework
│       ├── MeineUebersicht.jsx    # Persönliche Übersicht
│       ├── Team.jsx               # Task Force
│       ├── Faqs.jsx               # FAQ mit Kategorien
│       ├── Glossar.jsx            # Begriffslexikon
│       ├── HowBuilt.jsx           # "Wie wurde das Portal gebaut?"
│       ├── Where.jsx              # Standorte / Wo
│       ├── Login.jsx              # Anmeldeseite
│       └── cp/                    # Control Panel (Admin, 18 Module)
│           ├── CpDashboard.jsx
│           ├── CpContent.jsx
│           ├── CpEvents.jsx
│           ├── CpAntraege.jsx
│           ├── CpUsers.jsx
│           ├── CpMassnahmen.jsx   # Massnahmen + Admin Tasks (Kanban, Liste, Reihenfolge)
│           ├── CpSprints.jsx      # Sprint-Verwaltung + Gantt + Admin Sprints
│           ├── CpSprintEditor.jsx # Sprint erstellen/bearbeiten
│           ├── CpThemen.jsx
│           ├── CpKi.jsx
│           ├── CpScnatDb.jsx
│           ├── CpChanges.jsx
│           ├── CpNews.jsx
│           ├── CpLiveInfos.jsx
│           ├── CpInbox.jsx
│           ├── CpSichtbarkeit.jsx
│           ├── CpAdminStuff.jsx
│           └── CpAdminStuffView.jsx
│
├── public/
│   └── maintenance.html           # Wartungsseite beim Deployment
├── deploy.sh                      # VM-Deployment-Script
├── start.sh                       # Lokaler Start-Helper
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

---

## Frontend

### Routing

Alle Routen in `src/App.jsx`. Drei Zugriffsebenen:

| Route              | Zugang         | Layout      |
|--------------------|----------------|-------------|
| `/login`           | Öffentlich     | Kein Layout |
| `/`, `/strategie`, … | Authentifiziert | `Layout` (Sidebar) |
| `/cp`, `/cp/*`     | Nur Admin      | `CpLayout`  |

### Navigation

Sidebar mit SCNAT-Logo, Navigationslinks, globaler Suche (`⌘K`), Benutzerinfo und Logout.

### Globale Suche

`SearchModal` durchsucht alle Seiten nach Titel, Beschreibung und Tags. `⌘K` (Mac) / `Ctrl+K`.

---

## Backend (API)

Express-Server (`server/index.js`) mit ESM-Modulen auf Port 3001.

### Middleware-Stack

1. **CORS** — Credentials + erlaubte Origins
2. **express.json()** — JSON-Body-Parsing
3. **cookie-parser** — JWT aus httpOnly-Cookies

### Utility-Funktionen (`server/utils.js`)

| Funktion              | Beschreibung                                    |
|-----------------------|-------------------------------------------------|
| `readJSONAsync(filename)`  | Liest JSON asynchron aus `/data` |
| `writeJSONAtomic(filename, data)` | Schreibt atomisch via temp+rename |
| `withDataLock(task)` | Serialisiert konkurrierende Read-Modify-Write-Operationen |
| `generateId()`        | Eindeutige ID (Timestamp + Random)              |
| `sanitize(obj)`       | Entfernt HTML-Tags aus User-Input               |

---

## Authentifizierung

```
1. POST /api/auth/login → { email, password }
2. Server prüft bcrypt-Hash
3. JWT signiert (24h gültig), als httpOnly Cookie gesetzt
4. Frontend liest User via GET /api/auth/me
```

### Rollen

| Rolle   | Zugriff                                           |
|---------|---------------------------------------------------|
| `user`  | Alle Portal-Seiten, Voting, Schulungsanmeldung    |
| `admin` | Zusätzlich: Control Panel (`/cp/*`), CRUD, Admin Tasks/Sprints |

---

## Datenhaltung

Alle Daten als JSON-Dateien in `/data`. Kein Datenbank-Setup nötig.

| Datei                  | Inhalt                                    |
|------------------------|-------------------------------------------|
| `users.json`           | Benutzerkonten mit bcrypt-Passworthashes  |
| `massnahmen.json`      | Massnahmen + Admin Tasks mit Cluster, Priorität, Wirkung/Aufwand, Kommentare |
| `sprints.json`         | Sprint-Planung mit Massnahmen-Zuweisung, Admin Sprints |
| `events.json`          | Schulungstermine                          |
| `registrations.json`   | Anmeldungen zu Schulungen                 |
| `requests.json`        | Softwareanträge mit Status-Tracking       |
| `software.json`        | Software-Katalog (Systemlandschaft)       |
| `software-votes.json`  | Benutzer-Votings (Zufriedenheit/Interesse)|
| `schulungsthemen.json` | Themenwünsche und Likes                   |
| `content.json`         | Redaktionelle Textinhalte                 |
| `scnat-infra.json`     | SCNAT DB Architektur, Entscheide, Backlog |
| `ki-content.json`      | KI-Hub Lerninhalte                        |
| `changes.json`         | Change-Log pro Massnahme                  |
| `news.json`            | News-Beiträge für Ticker                  |
| `live-infos.json`      | Live-Info-Banner                          |
| `inbox-messages.json`  | Admin-Inbox Nachrichten                   |
| `notifications-seen.json` | Gelesen-Status pro User               |
| `user-groups.json`     | Benutzergruppen                           |
| `visibility.json`      | Seitensichtbarkeits-Konfiguration         |

---

## Design-System

### Farben

```
Hintergründe            Rahmen               Text
─────────────           ──────               ────
bg-base    #0C0E10      bd-faint   #23262B   txt-primary   #ECEEF1
bg-surface #141618      bd-default #2E3238   txt-secondary #8A8F9B
bg-elevated#1C1E22      bd-strong  #5A616B   txt-tertiary  #4E535D
```

**Akzentfarben (SCNAT CI):**

| Token          | Hex       | Verwendung               |
|----------------|-----------|--------------------------|
| `scnat-red`    | `#EA515A` | Primäraktion, Highlights |
| `scnat-teal`   | `#007A87` | Strategie, Links         |
| `scnat-cyan`   | `#0098DA` | Infrastruktur            |
| `scnat-green`  | `#008770` | Erfolg, Nachhaltigkeit   |
| `scnat-orange` | `#F07800` | Warnungen, Prozesse      |

### Typografie

| Token         | Schriftart      | Verwendung                |
|---------------|-----------------|---------------------------|
| `font-heading`| DM Sans         | Überschriften             |
| `font-body`   | DM Sans         | Fliesstext                |
| `font-mono`   | JetBrains Mono  | Code, Tags, Badges, Daten |

### Komponenten-Regeln

- `rounded-sm` als Standard-Radius
- Keine Shadows, Gradients oder Glasmorphismus
- Buttons: Gefüllt (`bg-scnat-red`) oder Ghost (`bg-bg-surface border`)
- Cards: `bg-bg-surface border border-bd-faint rounded-sm`
- Inputs: `bg-bg-elevated border border-bd-faint`

---

## Seiten & Module

### Übersicht (`/`)
Hero mit SVG-Netzwerk, Quick-Access-Grid, Vision-House, News-Timeline.

### Strategie (`/strategie`)
Digitalisierungsstrategie mit Flip-Cards, Strategy-Timeline, Rollen.

### Handlungsfelder (`/handlungsfelder`)
6 Handlungsfelder mit Themenfeldern. Zeitstrahl der Transformation.

### Massnahmen (`/massnahmen`)
Drei Darstellungen: Liste, Impact/Effort-Matrix, "Start mit 6". Admin Toggle für Admin Tasks.

### Sprints (`/sprints`)
Sprint-Timeline mit Detail-Panels. Admin Toggle für Admin Sprints.

### Systemlandschaft (`/systemlandschaft`)
Software-Katalog mit Tool-Matrix, Alle Systeme, Ranking. Software-Drawer mit Radarchart und Voting.

### KI-Hub (`/ki-hub`)
Lernbereich: "Wie KI denkt", "ChatGPT nutzen" (inkl. Sicherheitsmodul), "Tools & Einsatz".

### Schulungen (`/schulungen`)
Kalender (Monatsansicht), Eventliste, Anmeldemodal. Themenwünsche mit Voting.

### Weitere Seiten
- **Softwareanträge** (`/software-antraege`) — Antragsformular
- **SCNAT DB** (`/scnat-db`) — Architekturdiagramm, Entscheide, Backlog
- **Prozesse** (`/prozesse`) — Beschaffungsprozess, PM-Framework
- **Meine Übersicht** (`/meine-uebersicht`) — Persönliches Dashboard
- **Team** (`/team`) — Task Force & Ansprechpersonen
- **FAQs** (`/faqs`) — FAQ nach Kategorien
- **Glossar** (`/glossar`) — Begriffslexikon A–Z

---

## Control Panel (Admin)

Erreichbar über `/cp`. Nur für `role: "admin"`.

| Modul            | Route              | Funktionen                                        |
|------------------|--------------------|---------------------------------------------------|
| Dashboard        | `/cp`              | Statistiken: Events, Anträge, User, Massnahmen    |
| Content          | `/cp/content`      | JSON-Editor für redaktionelle Inhalte              |
| Events           | `/cp/events`       | CRUD Schulungstermine, Anmeldungen                 |
| Anträge          | `/cp/antraege`     | Softwareanträge verwalten                          |
| Users            | `/cp/users`        | Benutzer CRUD, Rollen                              |
| Massnahmen       | `/cp/massnahmen`   | Liste, Kanban, Reihenfolge, Admin Tasks, Kommentare |
| Sprints          | `/cp/sprints`      | Sprint-Verwaltung, Gantt-Chart, Admin Sprints      |
| Sprint-Editor    | `/cp/sprints/:id`  | Sprint erstellen/bearbeiten, Massnahmen zuweisen   |
| Themen           | `/cp/themen`       | Schulungsthemen verwalten                          |
| KI-Inhalte       | `/cp/ki`           | JSON-Editor für KI-Hub                             |
| SCNAT DB         | `/cp/scnat-db`     | Konsolidierung, Entscheide, Backlog                |
| Changes          | `/cp/changes`      | Change-Log verwalten                               |
| News             | `/cp/news`         | News-Beiträge erstellen/bearbeiten                 |
| Live-Infos       | `/cp/live-infos`   | Live-Info-Banner verwalten                         |
| Inbox            | `/cp/inbox`        | Admin-Nachrichten                                  |
| Sichtbarkeit     | `/cp/sichtbarkeit` | Seitensichtbarkeit konfigurieren                   |

---

## API-Referenz

Alle Endpunkte unter `/api`. Auth-geschützte Routen erfordern ein gültiges JWT-Cookie.

### Auth

| Methode | Endpunkt          | Auth | Beschreibung              |
|---------|-------------------|------|---------------------------|
| POST    | `/api/auth/login` | —    | Login, setzt JWT-Cookie   |
| GET     | `/api/auth/me`    | —    | Aktuelle Session abrufen  |
| POST    | `/api/auth/logout`| —    | Logout, löscht Cookie     |

### Massnahmen

| Methode | Endpunkt                    | Auth  | Beschreibung                    |
|---------|-----------------------------|-------|---------------------------------|
| GET     | `/api/massnahmen`           | User  | Alle Massnahmen (Admin: inkl. Admin Tasks) |
| PUT     | `/api/massnahmen`           | Admin | Neue Massnahme/Admin Task anlegen |
| POST    | `/api/massnahmen/:id`       | Admin | Massnahme aktualisieren         |
| DELETE  | `/api/massnahmen/:id`       | Admin | Massnahme löschen               |
| POST    | `/api/massnahmen/reorder`   | Admin | Reihenfolge aktualisieren       |

### Sprints

| Methode | Endpunkt           | Auth  | Beschreibung                       |
|---------|--------------------|-------|------------------------------------|
| GET     | `/api/sprints`     | User  | Alle Sprints (Admin: inkl. Admin Sprints) |
| GET     | `/api/sprints/:id` | User  | Sprint-Detail                      |
| POST    | `/api/sprints`     | Admin | Neuen Sprint erstellen             |
| PUT     | `/api/sprints/:id` | Admin | Sprint aktualisieren               |

### Events

| Methode | Endpunkt          | Auth  | Beschreibung            |
|---------|-------------------|-------|-------------------------|
| GET     | `/api/events`     | User  | Alle Events             |
| POST    | `/api/events`     | Admin | Neues Event             |
| DELETE  | `/api/events/:id` | Admin | Event löschen           |

### Registrations

| Methode | Endpunkt                        | Auth  | Beschreibung              |
|---------|---------------------------------|-------|---------------------------|
| GET     | `/api/registrations`            | User  | Alle Anmeldungen          |
| POST    | `/api/registrations`            | User  | Neue Anmeldung            |
| GET     | `/api/registrations/event/:id`  | Admin | Anmeldungen pro Event     |

### Softwareanträge

| Methode | Endpunkt              | Auth  | Beschreibung                  |
|---------|-----------------------|-------|-------------------------------|
| GET     | `/api/requests`       | Admin | Alle Anträge                  |
| POST    | `/api/requests`       | User  | Neuen Antrag einreichen       |
| PUT     | `/api/requests/:id`   | Admin | Status ändern                 |

### Users

| Methode | Endpunkt          | Auth  | Beschreibung           |
|---------|-------------------|-------|------------------------|
| GET     | `/api/users`      | Admin | Alle Benutzer          |
| POST    | `/api/users`      | Admin | Neuen Benutzer anlegen |
| DELETE  | `/api/users/:id`  | Admin | Benutzer löschen       |

### Software-Votes

| Methode | Endpunkt                          | Auth | Beschreibung             |
|---------|-----------------------------------|------|--------------------------|
| GET     | `/api/software-votes/:softwareId` | User | Votes für eine Software  |
| POST    | `/api/software-votes`             | User | Vote abgeben             |

### Schulungsthemen

| Methode | Endpunkt                        | Auth  | Beschreibung                 |
|---------|---------------------------------|-------|------------------------------|
| GET     | `/api/schulungsthemen`          | User  | Alle Themen                  |
| POST    | `/api/schulungsthemen`          | User  | Neues Thema vorschlagen      |
| POST    | `/api/schulungsthemen/:id/like` | User  | Like-Toggle                  |
| DELETE  | `/api/schulungsthemen/:id`      | User* | Thema löschen (*eigenes oder Admin) |

### Content, KI, SCNAT Infra

| Methode | Endpunkt            | Auth  | Beschreibung             |
|---------|---------------------|-------|--------------------------|
| GET     | `/api/content`      | User  | Redaktionelle Inhalte    |
| PUT     | `/api/content`      | Admin | Inhalte aktualisieren    |
| GET     | `/api/ki-content`   | User  | KI-Lerninhalte           |
| PUT     | `/api/ki-content`   | Admin | KI-Inhalte aktualisieren |
| GET     | `/api/scnat-infra`  | User  | Infrastruktur-Daten      |
| PUT     | `/api/scnat-infra`  | Admin | Infrastruktur updaten    |

### Changes, News, Live-Infos, Inbox, Visibility, Notifications

| Methode | Endpunkt                 | Auth  | Beschreibung              |
|---------|--------------------------|-------|---------------------------|
| GET     | `/api/changes`           | User  | Change-Log abrufen        |
| POST    | `/api/changes`           | Admin | Change-Eintrag erstellen  |
| GET     | `/api/news`              | User  | News-Beiträge             |
| POST    | `/api/news`              | Admin | News erstellen            |
| GET     | `/api/live-infos`        | User  | Live-Info-Banner          |
| PUT     | `/api/live-infos`        | Admin | Live-Info aktualisieren   |
| GET     | `/api/inbox`             | Admin | Inbox-Nachrichten         |
| GET     | `/api/visibility`        | User  | Sichtbarkeits-Config      |
| PUT     | `/api/visibility`        | Admin | Sichtbarkeit ändern       |
| GET     | `/api/notifications`     | User  | Benachrichtigungsstatus   |
| POST    | `/api/notifications`     | User  | Als gelesen markieren     |

---

## Umgebungsvariablen

Konfiguration via `.env` im Projektroot:

| Variable        | Default                 | Beschreibung                  |
|-----------------|-------------------------|-------------------------------|
| `PORT`          | `3001`                  | Express-Server-Port           |
| `JWT_SECRET`    | —                       | Secret für JWT (mind. 32 Zeichen, **zwingend**) |
| `CORS_ORIGIN`   | `http://localhost:5173` | Erlaubte Origins              |
| `COOKIE_SECURE` | `false`                 | `true` für HTTPS              |
| `NODE_ENV`      | —                       | `production` für Produktion   |

**Wichtig:** Server startet nicht ohne `JWT_SECRET` (mind. 32 Zeichen).

---

## Deployment

### Infrastruktur

- **VM:** Google Cloud `scnat-portal-new`, Ubuntu 22.04, e2-small
- **Prozess:** PM2 (auto-start on boot)
- **Reverse Proxy:** Nginx mit SSL (Let's Encrypt)
- **Frontend:** Vite SPA aus `/opt/scnat-portal-prod/dist`
- **Backend:** Express auf `127.0.0.1:3001`

### Deploy

```bash
git push origin main
ssh silvanpoltera@34.26.170.228 'bash /opt/scnat-portal-prod/deploy.sh'
```

`deploy.sh` führt automatisch aus:
1. Maintenance Page aktivieren
2. `git pull origin main`
3. `npm install --prefer-offline`
4. `npm run build`
5. Nginx-Config wiederherstellen
6. `pm2 restart scnat-api`

### Verifizierung

```bash
ssh silvanpoltera@34.26.170.228 'pm2 list && curl -s http://127.0.0.1:3001/api/health'
```

### Sicherheitshinweise

- `JWT_SECRET` in `.env` (mind. 32 Zeichen)
- httpOnly + SameSite=Strict Cookies
- `CORS_ORIGIN` auf Produktionsdomain
- Nginx blockiert: `.git`, `.env`, `data/`, `server/`, `node_modules/`
- SSH: nur Pubkey, kein Root-Login
- `.env` Permissions: `600`

---

## Lizenz

Internes Projekt der SCNAT. Nicht zur öffentlichen Verbreitung bestimmt.
