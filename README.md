# SCNAT Digitalisierungsportal

Internes Portal der Akademie der Naturwissenschaften Schweiz (SCNAT) für die digitale Transformation. Das Portal dient als zentrale Anlaufstelle für Strategiedokumentation, Systemlandschaft, KI-Richtlinien, Schulungen, Massnahmentracking und administrative Verwaltung.

## Inhaltsverzeichnis

- [Architektur](#architektur)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Starten](#starten)
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
│  11 Route-Module                                     │
└───────────────────┬─────────────────────────────────┘
                    │  fs.readFileSync / writeFileSync
                    ▼
┌─────────────────────────────────────────────────────┐
│              /data/*.json  (File Storage)             │
│  users · events · massnahmen · requests · …          │
└─────────────────────────────────────────────────────┘
```

**Stack-Übersicht:**

| Schicht    | Technologie                                    |
|------------|------------------------------------------------|
| Frontend   | React 18, Vite 6, React Router 6, Tailwind 3  |
| UI         | Radix UI, Framer Motion, Lucide Icons, Recharts|
| Backend    | Express 5, Node.js (ESM)                       |
| Auth       | JWT (jsonwebtoken), bcryptjs, httpOnly Cookies  |
| Storage    | JSON-Dateien im Dateisystem (`/data`)          |
| Fonts      | DM Sans, JetBrains Mono (Google Fonts)         |

---

## Voraussetzungen

- **Node.js** >= 18
- **npm** >= 9

Keine Datenbank nötig — alle Daten werden als JSON-Dateien im `/data`-Verzeichnis gespeichert.

---

## Installation

```bash
npm install
```

---

## Starten

### Beide Server gleichzeitig (empfohlen)

```bash
npm run dev:all
```

Startet parallel:
- **Vite** Frontend auf `http://localhost:5173`
- **Express** API auf `http://localhost:3001`

Vite proxied automatisch alle `/api/*`-Anfragen an den Express-Server.

### Einzeln starten

```bash
# Nur Frontend
npm run dev

# Nur Backend
npm run server
```

### Produktions-Build

```bash
npm run build
npm run preview
```

### Standard-Login

| Feld     | Wert                          |
|----------|-------------------------------|
| E-Mail   | `silvan.poltera@scnat.ch`     |
| Passwort | `scnat2026!`                  |
| Rolle    | `admin`                       |

---

## Projektstruktur

```
├── data/                      # JSON-Datenspeicher
│   ├── users.json             # Benutzer (mit gehashten Passwörtern)
│   ├── massnahmen.json        # 28 Digitalisierungsmassnahmen
│   ├── events.json            # Schulungstermine
│   ├── registrations.json     # Schulungsanmeldungen
│   ├── requests.json          # Softwareanträge
│   ├── software.json          # Softwarekatalog
│   ├── software-votes.json    # Nutzervotings zu Software
│   ├── schulungsthemen.json   # Themenwünsche & Likes
│   ├── content.json           # Redaktionelle Inhalte
│   ├── scnat-infra.json       # SCNAT DB Infra-Daten
│   └── ki-content.json        # KI-Hub Lerninhalte
│
├── server/                    # Express Backend
│   ├── index.js               # Server-Einstiegspunkt
│   ├── auth.js                # JWT-Helpers & Middleware
│   ├── utils.js               # readJSON, writeJSON, generateId
│   └── routes/                # API-Routen (je 1 Datei pro Ressource)
│       ├── auth.js            # Login, Logout, Session
│       ├── massnahmen.js
│       ├── events.js
│       ├── registrations.js
│       ├── requests.js
│       ├── users.js
│       ├── software-votes.js
│       ├── schulungsthemen.js
│       ├── content.js
│       ├── scnat-infra.js
│       └── ki-content.js
│
├── src/                       # React Frontend
│   ├── App.jsx                # Routing-Konfiguration
│   ├── index.css              # Globales CSS, Design-Tokens
│   ├── main.jsx               # React-Einstiegspunkt
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx    # Auth-State (user, login, logout)
│   │
│   ├── components/
│   │   ├── Layout.jsx         # Haupt-Layout (Sidebar + Content)
│   │   ├── CpLayout.jsx       # Admin Control Panel Layout
│   │   ├── Sidebar.jsx        # Navigation mit Suche
│   │   ├── Footer.jsx         # Footer mit verstecktem CP-Link
│   │   ├── NewsTicker.jsx     # Sticky News-Leiste
│   │   ├── SearchModal.jsx    # Globale Suche (⌘K)
│   │   ├── ProtectedRoute.jsx # Auth-Guard
│   │   ├── AdminRoute.jsx     # Admin-Guard
│   │   ├── PageHeader.jsx     # Wiederverwendbarer Seiten-Header
│   │   ├── NetworkBackground.jsx  # Digitales Netzwerk-SVG
│   │   ├── RadarChart.jsx     # SVG-Radarchart für Software
│   │   ├── SoftwareDrawer.jsx # Software-Detail-Drawer
│   │   ├── home/              # Home-Unterkomponenten
│   │   ├── ki/                # KI-Hub-Unterkomponenten
│   │   ├── strategy/          # Strategie-Unterkomponenten
│   │   ├── vision/            # Vision-House-Unterkomponenten
│   │   ├── systemlandschaft/  # Systemlandschaft-Unterkomponenten
│   │   ├── prozesse/          # Prozess-Unterkomponenten
│   │   └── ui/                # shadcn/ui Basiskomponenten
│   │
│   └── pages/
│       ├── Home.jsx           # Startseite / Dashboard
│       ├── Strategie.jsx      # Digitalisierungsstrategie
│       ├── Handlungsfelder.jsx # 6 Handlungsfelder
│       ├── Massnahmen.jsx     # 28 Massnahmen (3 Views)
│       ├── Systemlandschaft.jsx # Software-Katalog & Ranking
│       ├── KiHub.jsx          # KI-Lernbereich (3 Tabs)
│       ├── Schulungen.jsx     # Kalender & Themenvoting
│       ├── SoftwareAntraege.jsx # Antragsformular
│       ├── ScnatDb.jsx        # SCNAT DB Infrastruktur
│       ├── Prozesse.jsx       # Beschaffung & PM-Framework
│       ├── Team.jsx           # Task Force
│       ├── Faqs.jsx           # FAQ mit Kategorien
│       ├── Glossar.jsx        # Begriffslexikon
│       ├── Login.jsx          # Anmeldeseite
│       └── cp/                # Control Panel (Admin)
│           ├── CpDashboard.jsx
│           ├── CpContent.jsx
│           ├── CpEvents.jsx
│           ├── CpAntraege.jsx
│           ├── CpUsers.jsx
│           ├── CpMassnahmen.jsx
│           ├── CpThemen.jsx
│           ├── CpKi.jsx
│           └── CpScnatDb.jsx
│
├── package.json
├── vite.config.js             # Vite + Proxy-Konfiguration
├── tailwind.config.js         # Tailwind + Design-Tokens
├── postcss.config.js
└── index.html
```

---

## Frontend

### Routing

Alle Routen sind in `src/App.jsx` definiert. Die Anwendung kennt drei Ebenen:

| Route             | Zugang         | Layout      |
|-------------------|----------------|-------------|
| `/login`          | Öffentlich     | Kein Layout |
| `/`, `/strategie`, `/ki-hub`, … | Authentifiziert | `Layout` (Sidebar) |
| `/cp`, `/cp/*`    | Nur Admin      | `CpLayout`  |

### Navigation

Die Sidebar (`src/components/Sidebar.jsx`) zeigt alle Portal-Seiten und enthält:
- SCNAT-Logo mit dezimalem Netzwerk-Hintergrund
- Navigationslinks mit aktiver Hervorhebung
- Globale Suche (`⌘K` / `Ctrl+K`)
- Benutzerinfo und Logout

### Seiten-Header

Jede Seite verwendet die `PageHeader`-Komponente mit:
- Animiertes SVG-Netzwerk im Hintergrund (pro Seite individueller Seed und Accent-Farbe)
- Breadcrumb-Navigation
- Titel, Untertitel und optionale Badges

### Globale Suche

`SearchModal` durchsucht alle Seiten nach Titel, Beschreibung und Tags. Erreichbar über:
- Tastenkombination `⌘K` (Mac) / `Ctrl+K` (Windows/Linux)
- Suchfeld in der Sidebar

---

## Backend (API)

Der Express-Server (`server/index.js`) verwendet ESM-Module und läuft auf Port 3001.

### Middleware-Stack

1. **CORS** — Erlaubt Anfragen von `http://localhost:5173` mit Credentials
2. **express.json()** — JSON-Body-Parsing
3. **cookie-parser** — Liest JWT-Token aus httpOnly-Cookies

### Utility-Funktionen (`server/utils.js`)

| Funktion              | Beschreibung                                    |
|-----------------------|-------------------------------------------------|
| `readJSON(filename)`  | Liest eine JSON-Datei aus `/data`, gibt `[]` bei fehlendem File zurück |
| `writeJSON(filename, data)` | Schreibt Daten als formatiertes JSON in `/data` |
| `generateId()`        | Erzeugt eine eindeutige ID (Timestamp + Random) |

---

## Authentifizierung

### Ablauf

```
1. POST /api/auth/login  → { email, password }
2. Server prüft bcrypt-Hash
3. JWT wird signiert (7 Tage gültig)
4. Token wird als httpOnly Cookie gesetzt
5. Frontend liest User via GET /api/auth/me
```

### Rollen

| Rolle   | Zugriff                                           |
|---------|---------------------------------------------------|
| `user`  | Alle Portal-Seiten, Voting, Schulungsanmeldung    |
| `admin` | Zusätzlich: Control Panel (`/cp/*`), CRUD-Operationen |

### Middleware (`server/auth.js`)

| Funktion              | Beschreibung                                          |
|-----------------------|-------------------------------------------------------|
| `signToken(payload)`  | Signiert ein JWT mit 7-Tage-Ablauf                    |
| `verifyToken(token)`  | Verifiziert ein JWT, gibt Payload oder `null` zurück  |
| `hashPassword(pw)`    | Hasht ein Passwort mit bcrypt (12 Runden)             |
| `comparePassword(pw, hash)` | Vergleicht Passwort mit Hash                   |
| `requireAuth`         | Express-Middleware: prüft JWT aus Cookie               |
| `requireAdmin`        | Express-Middleware: prüft `role === 'admin'`           |

### Frontend-Integration

`AuthContext` (`src/contexts/AuthContext.jsx`) stellt bereit:
- `user` — Aktueller Benutzer oder `null`
- `loading` — `true` während der initialen Session-Prüfung
- `login(email, password)` — Async Login-Funktion
- `logout()` — Async Logout-Funktion
- `isAdmin` — Boolean für Admin-Prüfung

---

## Datenhaltung

Alle Daten werden als JSON-Dateien im `/data`-Verzeichnis gespeichert. Kein Datenbank-Setup nötig.

| Datei                   | Inhalt                                    |
|-------------------------|-------------------------------------------|
| `users.json`            | Benutzerkonten mit bcrypt-Passworthashes  |
| `massnahmen.json`       | 28 Massnahmen mit Cluster, Priorität, Wirkung/Aufwand |
| `events.json`           | Schulungstermine                          |
| `registrations.json`    | Anmeldungen zu Schulungen                 |
| `requests.json`         | Softwareanträge mit Status-Tracking       |
| `software.json`         | Software-Katalog (Systemlandschaft)       |
| `software-votes.json`   | Benutzer-Votings (Zufriedenheit/Interesse)|
| `schulungsthemen.json`  | Themenwünsche und Likes                   |
| `content.json`          | Redaktionelle Textinhalte                 |
| `scnat-infra.json`      | SCNAT DB Architektur, Entscheide, Backlog |
| `ki-content.json`       | Alle KI-Hub Lerninhalte                   |

---

## Design-System

### Farben

Die Plattform verwendet ein dunkles Design mit folgenden Tokens:

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

**Statusfarben:**

| Token           | Hex       | Verwendung     |
|-----------------|-----------|----------------|
| `status-green`  | `#2ECC71` | Erfolg, Aktiv  |
| `status-yellow` | `#F39C12` | Warnung        |
| `status-blue`   | `#3498DB` | Information    |

### Typografie

| Token         | Schriftart      | Verwendung                |
|---------------|-----------------|---------------------------|
| `font-heading`| DM Sans         | Überschriften             |
| `font-body`   | DM Sans         | Fliesstext                |
| `font-mono`   | JetBrains Mono  | Code, Tags, Badges, Daten |

### Komponenten-Regeln

- **Border-Radius:** `rounded-sm` als Standard
- **Keine** Shadows, Gradients, Glasmorphismus oder lange Animationen
- **Buttons:** Gefüllt (`bg-scnat-red`) oder Ghost (`bg-bg-surface border`)
- **Cards:** `bg-bg-surface border border-bd-faint rounded-sm`
- **Inputs:** `bg-bg-elevated border border-bd-faint`

---

## Seiten & Module

### Übersicht (`/`)

Hero-Section mit animiertem SVG-Netzwerk, Quick-Access-Grid zu wichtigen Seiten, Vision-House-Visualisierung und News-Timeline.

### Strategie (`/strategie`)

Strategiedokument der SCNAT mit Flip-Cards (Vision, Oberziel), Strategy-Timeline, Rollen und Dokumentenübersicht.

### Handlungsfelder (`/handlungsfelder`)

6 Handlungsfelder mit je 2–3 Themenfeldern in aufklappbaren Akkordeons. Zeitstrahl der Transformation (2024–2027+).

### Massnahmen (`/massnahmen`)

28 Massnahmen in drei Darstellungen:

1. **Listenansicht** — Filterbar nach Cluster, Priorität, Status. Sortierung nach Prio, dann Score (Wirkung × (11 − Aufwand)). Mini-Bars für Wirkung/Aufwand.
2. **Impact/Effort-Matrix** — Custom SVG 2×2 Quadrant, Massnahmen als Punkte positioniert nach Wirkung/Aufwand.
3. **Start mit 5** — Empfohlene Massnahmen als nummerierte Karten + bereits laufende Massnahmen.

### Systemlandschaft (`/systemlandschaft`)

Software-Katalog mit drei Views:
- **Tool-Matrix:** Kategorisierte Software-Karten mit Detailmodal
- **Alle Systeme:** Listenansicht mit Suche und Filterung
- **Ranking:** Sortiert nach Zufriedenheit oder Interesse, verlinkt auf den Software-Drawer

**Software-Drawer:** Slide-in-Panel mit SVG-Radarchart (6 Dimensionen), Nutzer-Voting (Zufrieden/Unzufrieden/Interesse).

### KI-Hub (`/ki-hub`)

Interaktiver Lernbereich mit drei Tabs:

1. **Wie KI denkt** — Chain-of-Thought-Visualisierung (animierte Denkschritte), Reasoning-Modell-Vergleich
2. **ChatGPT nutzen** — Prompt-Beispiele (gut/schlecht), Personalisierung, Projekte, Custom GPTs. Sicherheitsmodul mit Sub-Tabs: Rail Guards, Jailbreaking, Prompt Injection
3. **Tools & Einsatz** — LLM-Vergleichstabelle, lokale Modelle (Ollama), Prompt-Tipps

### Schulungen (`/schulungen`)

- **Kalender:** Monatsansicht (CSS Grid), Eventliste, Anmeldemodal mit Kapazitätsanzeige
- **Themen wünschen:** Voting-System (Like pro User), Vorschläge einreichen, Admin kann löschen

### Softwareanträge (`/software-antraege`)

Formular für neue Software-Anfragen (Name, Begründung, Dringlichkeit, Abteilung). Einreichung über API mit Erfolgsmeldung.

### SCNAT DB & Portale (`/scnat-db`)

- **Übersicht:** Custom SVG-Architekturdiagramm (SCNAT DB, Frontends, Portale, Konsolidierungsstatus)
- **Offene Entscheide:** Kritische Entscheidungen mit Statusbadges
- **Backlog:** Filterbarer Entwicklungs-Backlog

### Prozesse (`/prozesse`)

Software-Beschaffungsprozess (5 Schritte) und PM-Framework mit Sprint-Rhythmus.

### Weitere Seiten

- **Team** (`/team`) — Task Force & Ansprechpersonen
- **FAQs** (`/faqs`) — Fragen nach Kategorien (Allgemein, KI, Beschaffung, Datenschutz, Support)
- **Glossar** (`/glossar`) — Digitalisierungsbegriffe A–Z mit Suche und Buchstabenfilter

---

## Control Panel (Admin)

Erreichbar über `/cp` (verstecktes Terminal-Icon im Footer oder direkt via URL). Nur für Benutzer mit `role: "admin"`.

| Modul             | Route            | Funktionen                                      |
|-------------------|------------------|-------------------------------------------------|
| Dashboard         | `/cp`            | Statistiken: Events, Anträge, User, Massnahmen  |
| Content           | `/cp/content`    | JSON-Editor für redaktionelle Inhalte            |
| Events            | `/cp/events`     | CRUD Schulungstermine, Anmeldungen einsehen      |
| Anträge           | `/cp/antraege`   | Softwareanträge verwalten (Status ändern)        |
| Users             | `/cp/users`      | Benutzer anlegen, löschen, Rollen verwalten      |
| Massnahmen        | `/cp/massnahmen` | Status, Notizen, Tags, Priorität bearbeiten      |
| Themen            | `/cp/themen`     | Schulungsthemen einsehen und löschen             |
| KI-Inhalte        | `/cp/ki`         | JSON-Editor für alle KI-Hub-Lerninhalte          |
| SCNAT DB          | `/cp/scnat-db`   | Konsolidierung, Entscheide, Backlog verwalten    |

---

## API-Referenz

Alle Endpunkte sind unter `/api` erreichbar. Auth-geschützte Routen erfordern ein gültiges JWT-Cookie.

### Auth

| Methode | Endpunkt          | Auth | Beschreibung              |
|---------|-------------------|------|---------------------------|
| POST    | `/api/auth/login` | —    | Login, setzt JWT-Cookie   |
| GET     | `/api/auth/me`    | —    | Aktuelle Session abrufen  |
| POST    | `/api/auth/logout`| —    | Logout, löscht Cookie     |

### Massnahmen

| Methode | Endpunkt              | Auth  | Beschreibung                  |
|---------|-----------------------|-------|-------------------------------|
| GET     | `/api/massnahmen`     | User  | Alle Massnahmen abrufen       |
| PUT     | `/api/massnahmen/:id` | Admin | Massnahme aktualisieren       |
| POST    | `/api/massnahmen`     | Admin | Neue Massnahme anlegen        |

### Events (Schulungen)

| Methode | Endpunkt          | Auth  | Beschreibung            |
|---------|-------------------|-------|-------------------------|
| GET     | `/api/events`     | User  | Alle Events abrufen     |
| POST    | `/api/events`     | Admin | Neues Event anlegen     |
| DELETE  | `/api/events/:id` | Admin | Event löschen           |

### Registrations (Anmeldungen)

| Methode | Endpunkt                   | Auth  | Beschreibung                  |
|---------|----------------------------|-------|-------------------------------|
| GET     | `/api/registrations`       | User  | Alle Anmeldungen              |
| POST    | `/api/registrations`       | User  | Neue Anmeldung erstellen      |
| GET     | `/api/registrations/event/:id` | Admin | Anmeldungen pro Event    |

### Softwareanträge

| Methode | Endpunkt              | Auth  | Beschreibung                  |
|---------|-----------------------|-------|-------------------------------|
| GET     | `/api/requests`       | Admin | Alle Anträge abrufen          |
| POST    | `/api/requests`       | User  | Neuen Antrag einreichen       |
| PUT     | `/api/requests/:id`   | Admin | Status eines Antrags ändern   |

### Users

| Methode | Endpunkt          | Auth  | Beschreibung           |
|---------|-------------------|-------|------------------------|
| GET     | `/api/users`      | Admin | Alle Benutzer abrufen  |
| POST    | `/api/users`      | Admin | Neuen Benutzer anlegen |
| DELETE  | `/api/users/:id`  | Admin | Benutzer löschen       |

### Software-Votes

| Methode | Endpunkt                        | Auth | Beschreibung                    |
|---------|---------------------------------|------|---------------------------------|
| GET     | `/api/software-votes/:softwareId` | User | Votes für eine Software       |
| POST    | `/api/software-votes`           | User | Vote abgeben (up/down/interest)|

### Schulungsthemen

| Methode | Endpunkt                        | Auth  | Beschreibung                 |
|---------|---------------------------------|-------|------------------------------|
| GET     | `/api/schulungsthemen`          | User  | Alle Themen abrufen          |
| POST    | `/api/schulungsthemen`          | User  | Neues Thema vorschlagen      |
| POST    | `/api/schulungsthemen/:id/like` | User  | Like-Toggle                  |
| DELETE  | `/api/schulungsthemen/:id`      | User* | Thema löschen (*eigenes oder Admin) |

### Content

| Methode | Endpunkt       | Auth  | Beschreibung              |
|---------|----------------|-------|---------------------------|
| GET     | `/api/content` | User  | Alle Inhalte abrufen      |
| PUT     | `/api/content` | Admin | Inhalte aktualisieren     |

### SCNAT Infrastruktur

| Methode | Endpunkt          | Auth  | Beschreibung               |
|---------|-------------------|-------|----------------------------|
| GET     | `/api/scnat-infra` | User | Infrastruktur-Daten abrufen|
| PUT     | `/api/scnat-infra` | Admin | Infrastruktur aktualisieren|

### KI-Inhalte

| Methode | Endpunkt          | Auth  | Beschreibung             |
|---------|-------------------|-------|--------------------------|
| GET     | `/api/ki-content` | User  | KI-Inhalte abrufen       |
| PUT     | `/api/ki-content` | Admin | KI-Inhalte aktualisieren |

---

## Umgebungsvariablen

Optionale Konfiguration via `.env`-Datei im Projektroot:

| Variable      | Default                                  | Beschreibung                  |
|---------------|------------------------------------------|-------------------------------|
| `PORT`        | `3001`                                   | Express-Server-Port           |
| `JWT_SECRET`  | `scnat-digi-platform-secret-key-2026`    | Secret für JWT-Signierung     |

Für Produktion **muss** `JWT_SECRET` auf einen sicheren, zufälligen Wert gesetzt werden.

---

## Deployment

### Vite Build

```bash
npm run build
```

Erzeugt einen statischen Build in `/dist`. Dieser kann über einen beliebigen Webserver (Nginx, Apache, Vercel, etc.) ausgeliefert werden.

### Produktionsbetrieb

Für den Produktionsbetrieb wird empfohlen:

1. **Frontend:** Statische Dateien aus `/dist` über Nginx oder einen CDN ausliefern
2. **Backend:** Express-Server mit `pm2` oder als systemd-Service betreiben
3. **Reverse Proxy:** Nginx leitet `/api/*`-Anfragen an den Express-Server weiter

Beispiel Nginx-Konfiguration:

```nginx
server {
    listen 80;
    server_name portal.scnat.ch;

    root /var/www/scnat-portal/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Sicherheitshinweise

- `JWT_SECRET` in Produktion zwingend ändern
- `data/users.json` enthält Passwort-Hashes — nicht öffentlich zugänglich machen
- httpOnly Cookies schützen vor XSS-Token-Diebstahl
- Für HTTPS: `secure: true` in der Cookie-Konfiguration (`server/routes/auth.js`) setzen
- CORS-Origin auf die tatsächliche Domain anpassen (`server/index.js`)

---

## Lizenz

Internes Projekt der SCNAT. Nicht zur öffentlichen Verbreitung bestimmt.
