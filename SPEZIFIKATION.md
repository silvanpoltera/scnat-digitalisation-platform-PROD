# Funktionale Spezifikation

## SCNAT Digitalisierungsportal

**Version:** 1.0  
**Datum:** 15. April 2026  
**Autor:** Silvan Poltera, Verantwortlicher Digitalisierung  
**Organisation:** Akademie der Naturwissenschaften Schweiz (SCNAT)  
**Status:** Produktiv (https://platform.poltis.ch)

---

## Inhaltsverzeichnis

1. [Zusammenfassung](#1-zusammenfassung)
2. [Zweck und Kontext](#2-zweck-und-kontext)
3. [Architektur und Technologie-Stack](#3-architektur-und-technologie-stack)
4. [Benutzerrollen und Berechtigungsmodell](#4-benutzerrollen-und-berechtigungsmodell)
5. [Authentifizierung und Sicherheit](#5-authentifizierung-und-sicherheit)
6. [Navigationsstruktur](#6-navigationsstruktur)
7. [Portal — Öffentliche Seiten (authentifiziert)](#7-portal--öffentliche-seiten-authentifiziert)
8. [Control Panel — Administrationsbereich](#8-control-panel--administrationsbereich)
9. [Datenmodell](#9-datenmodell)
10. [API-Spezifikation](#10-api-spezifikation)
11. [Querschnittsfunktionen](#11-querschnittsfunktionen)
12. [Infrastruktur und Deployment](#12-infrastruktur-und-deployment)
13. [Anhang A — Vollständige Routenübersicht](#anhang-a--vollständige-routenübersicht)
14. [Anhang B — Datenbank-Schema (JSON)](#anhang-b--datenbank-schema-json)
15. [Anhang C — Abhängigkeiten](#anhang-c--abhängigkeiten)

---

## 1. Zusammenfassung

Das SCNAT Digitalisierungsportal ist eine interne Webplattform für die Akademie der Naturwissenschaften Schweiz. Sie dient als zentrales Informations-, Planungs- und Steuerungsinstrument für die digitale Transformation der Organisation.

**Umfang der Plattform:**

| Kennzahl | Wert |
|----------|------|
| Portal-Seiten (für alle Benutzer) | 17 |
| Control-Panel-Seiten (Admin) | 18 |
| API-Routenmodule | 18 |
| REST-API-Endpunkte (total) | 68 |
| Datenmodelle (JSON-Dateien) | 19 |
| React-Komponenten | 49+ |
| Seitenbezogene Sichtbarkeitsschlüssel | 28 |

Die Plattform deckt folgende Kernbereiche ab:

- **Strategiekommunikation** — Vision, Handlungsfelder, Massnahmen
- **Umsetzungssteuerung** — Sprints, Kanban-Board, Priorisierungsmatrix
- **Wissensmanagement** — KI-Hub, Glossar, FAQs, Prozessdokumentation
- **Schulungsmanagement** — Event-Kalender, Anmeldungen, Themen-Voting
- **Software-Governance** — Systemlandschaft, Bewertungen, Beschaffungsanträge
- **Kommunikation** — News, Live-Ticker, Inbox-Nachrichtensystem
- **Administration** — Benutzerverwaltung, Content-Management, Sichtbarkeitssteuerung

---

## 2. Zweck und Kontext

### 2.1 Problemstellung

Die digitale Transformation einer Organisation mit mehreren Abteilungen erfordert ein zentrales Instrument, das Transparenz schafft, die Umsetzung steuert und alle Mitarbeitenden einbindet. Verstreute Dokumente, E-Mails und Tabellen sind nicht ausreichend.

### 2.2 Lösung

Eine massgeschneiderte Webplattform, die:

- Die Digitalisierungsstrategie und deren Umsetzungsstand für alle Mitarbeitenden sichtbar macht
- Die Planung und Steuerung von Massnahmen und Sprints ermöglicht
- Schulungen organisiert und Wissen zu Digitalisierungsthemen (inkl. KI) vermittelt
- Softwarelandschaft und -bewertungen transparent darstellt
- Interne Kommunikation zu Digitalisierungsthemen bündelt
- Change-Management-Prozesse unterstützt

### 2.3 Zielgruppen

| Zielgruppe | Beschreibung | Rolle im System |
|------------|-------------|-----------------|
| Mitarbeitende SCNAT | Alle Angestellten der SCNAT | Benutzer (`user`) |
| Verantwortlicher Digitalisierung | Projektleiter der digitalen Transformation | Administrator (`admin`) |
| Geschäftsleitung / Entscheidungsträger | Strategische Steuerung, Leserechte | Benutzer (`user`) |

---

## 3. Architektur und Technologie-Stack

### 3.1 Systemarchitektur

```
┌──────────────────────────────────────────────────────────┐
│                    Browser (Client)                       │
│  React 18 SPA · Vite 6 · Tailwind CSS 3 · React Router 6│
└─────────────────────────┬────────────────────────────────┘
                          │ HTTPS (Port 443)
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Nginx Reverse Proxy + SSL                    │
│         Let's Encrypt · certbot auto-renew               │
├──────────────────────────────────────────────────────────┤
│  /           → Static SPA (dist/)                        │
│  /api/*      → Proxy zu Express Backend (127.0.0.1:3001) │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP (localhost:3001)
                          ▼
┌──────────────────────────────────────────────────────────┐
│              Express 5 Backend (Node.js, ESM)            │
│  18 Route-Module · JWT Auth · Helmet · Rate Limiting     │
├──────────────────────────────────────────────────────────┤
│              Datei-basierter Speicher (JSON)              │
│              19 JSON-Dateien in /data                     │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Technologie-Stack

| Schicht | Technologie | Version |
|---------|-------------|---------|
| **Frontend-Framework** | React | 18.3 |
| **Build-Tool** | Vite | 6.0 |
| **Routing** | React Router | 6.28 |
| **CSS-Framework** | Tailwind CSS | 3.4 |
| **UI-Primitives** | Radix UI | Diverse (Accordion, Dialog, Tabs, Tooltip, Label, Separator) |
| **Animationen** | Framer Motion | 11.15 |
| **Icons** | Lucide React | 0.468 |
| **Drag & Drop** | dnd-kit (Core + Sortable) | 6.3 / 10.0 |
| **Charts** | Recharts | 3.8 |
| **Backend-Framework** | Express | 5.2 |
| **Authentifizierung** | jsonwebtoken (JWT) | 9.0 |
| **Passwort-Hashing** | bcryptjs | 3.0 |
| **Sicherheits-Header** | Helmet | 8.1 |
| **Rate Limiting** | express-rate-limit | 8.3 |
| **Datenspeicherung** | JSON-Dateien (Dateisystem) | — |
| **Prozessmanager** | PM2 | — |
| **Webserver** | Nginx | — |
| **SSL** | Let's Encrypt (certbot) | — |
| **Hosting** | Google Cloud Compute Engine (e2-small) | — |
| **OS** | Ubuntu 22.04 LTS | — |

### 3.3 Projektstruktur

```
/
├── data/                    # 19 JSON-Datendateien (persistenter Speicher)
├── public/                  # Statische Assets, Maintenance-Seite
│   ├── files/               # Statische HTML-Briefings (Admin Stuff)
│   └── maintenance.html     # Wartungsseite während Deployments
├── server/
│   ├── index.js             # Express-Server: Middleware, CORS, Routing
│   ├── auth.js              # JWT-Signing, Passwort-Hashing, Auth-Middleware
│   ├── utils.js             # readJSON, writeJSON, generateId, sanitize
│   └── routes/              # 18 API-Routenmodule
│       ├── auth.js
│       ├── massnahmen.js
│       ├── sprints.js
│       ├── events.js
│       ├── registrations.js
│       ├── requests.js
│       ├── changes.js
│       ├── users.js
│       ├── inbox.js
│       ├── news.js
│       ├── live-infos.js
│       ├── content.js
│       ├── ki-content.js
│       ├── visibility.js
│       ├── software-votes.js
│       ├── schulungsthemen.js
│       ├── scnat-infra.js
│       └── notifications.js
├── src/
│   ├── App.jsx              # Root-Komponente, Routing-Konfiguration
│   ├── config/
│   │   └── sections.js      # Navigations-Metadaten (Labels, Icons, Pfade)
│   ├── contexts/            # 4 React Context Provider
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── VisibilityContext.jsx
│   │   └── NotificationContext.jsx
│   ├── components/          # 49+ wiederverwendbare Komponenten
│   │   ├── Layout.jsx       # Portal-Layout (Sidebar + Content)
│   │   ├── CpLayout.jsx     # Control-Panel-Layout
│   │   ├── Sidebar.jsx      # Hauptnavigation
│   │   ├── ProtectedRoute.jsx
│   │   ├── AdminRoute.jsx
│   │   ├── VisibilityGuard.jsx
│   │   └── ...
│   ├── pages/               # 17 Portal-Seiten
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── ...
│   └── pages/cp/            # 18 Control-Panel-Seiten
│       ├── CpDashboard.jsx
│       └── ...
├── deploy.sh                # Automatisiertes Deployment-Skript
├── start.sh                 # Lokaler Entwicklungsstart
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                     # Umgebungsvariablen (nicht im Repository)
```

---

## 4. Benutzerrollen und Berechtigungsmodell

### 4.1 Rollen

Das System kennt genau zwei Rollen:

| Rolle | Technischer Wert | Beschreibung |
|-------|------------------|-------------|
| **Benutzer** | `user` | Zugriff auf alle Portal-Seiten. Kann Anträge stellen, sich für Events anmelden, Themen vorschlagen, abstimmen und den eigenen Bereich einsehen. |
| **Administrator** | `admin` | Voller Portal-Zugriff plus Zugriff auf das gesamte Control Panel. Kann Inhalte, Benutzer, Events, Massnahmen, Sprints und alle weiteren Daten verwalten. |

### 4.2 Berechtigungsmatrix

| Funktion | Benutzer | Administrator |
|----------|----------|---------------|
| Login / Logout | Ja | Ja |
| Portal-Seiten anzeigen | Ja (sofern sichtbar) | Ja (immer, mit Vorschau-Banner falls versteckt) |
| Eigene Übersicht (Dashboard) | Ja | Ja |
| Software-Antrag stellen | Ja | Ja |
| Für Events anmelden | Ja | Ja |
| Schulungsthemen vorschlagen | Ja | Ja |
| Schulungsthemen liken | Ja | Ja |
| Eigene Themen löschen | Ja | Ja |
| Software bewerten (Voting) | Ja | Ja |
| Change-Vorschläge einreichen | Ja | Ja |
| Massnahmen mit `isAdminTask` sehen | Nein | Ja |
| Sprints mit `isAdminSprint` sehen | Nein | Ja |
| Control Panel öffnen | Nein | Ja |
| Benutzer verwalten (CRUD) | Nein | Ja |
| Massnahmen verwalten (CRUD, Kanban, Reorder) | Nein | Ja |
| Sprints verwalten (CRUD, Gantt) | Nein | Ja |
| Events verwalten (CRUD) | Nein | Ja |
| Anträge bearbeiten / beantworten | Nein | Ja |
| Change-Vorschläge bearbeiten / beantworten | Nein | Ja |
| News verwalten (CRUD) | Nein | Ja |
| Live-Infos verwalten (CRUD) | Nein | Ja |
| Inbox-Nachrichten senden | Nein | Ja |
| Portal-Content bearbeiten (CMS) | Nein | Ja |
| KI-Content bearbeiten | Nein | Ja |
| SCNAT-DB-Dokumentation bearbeiten | Nein | Ja |
| Seitensichtbarkeit steuern | Nein | Ja |
| Benutzergruppen verwalten | Nein | Ja |

### 4.3 Sichtbarkeitssteuerung

Zusätzlich zum Rollenmodell gibt es ein **globales Sichtbarkeitssystem**:

- Jede Portal-Seite und jede Control-Panel-Sektion hat einen **Sichtbarkeitsschlüssel** (z.B. `home`, `strategie`, `cp-massnahmen`).
- Admins können über das Control Panel Seiten ein-/ausblenden.
- **Nicht-Admins** sehen bei ausgeblendeten Seiten: "Seite nicht verfügbar".
- **Admins** sehen ausgeblendete Seiten weiterhin, aber mit einem gelben **Vorschau-Banner**.
- Die Seitenreihenfolge in der Navigation wird ebenfalls über dieses System gesteuert.

**Portal-Sichtbarkeitsschlüssel (13):**

| Schlüssel | Seite |
|-----------|-------|
| `home` | Übersicht (Startseite) |
| `strategie` | Strategie |
| `handlungsfelder` | Handlungsfelder |
| `massnahmen` | Massnahmen |
| `sprints` | Sprints |
| `systemlandschaft` | Software & Co |
| `ki-hub` | KI-Hub |
| `schulungen` | Schulungen |
| `software-antraege` | Software-Anträge |
| `prozesse` | Prozesse |
| `team` | Team |
| `faqs` | FAQs |
| `glossar` | Glossar |

**Control-Panel-Sichtbarkeitsschlüssel (15):**

| Schlüssel | Sektion |
|-----------|---------|
| `cp-dashboard` | Dashboard |
| `cp-users` | Benutzerverwaltung |
| `cp-nachrichten` | Nachrichten / Inbox |
| `cp-live-infos` | Live-Infos |
| `cp-news` | News |
| `cp-content` | Content-Verwaltung |
| `cp-events` | Events |
| `cp-antraege` | Anträge |
| `cp-changes` | Changes |
| `cp-massnahmen` | Massnahmen |
| `cp-sprints` | Sprints |
| `cp-themen` | Schulungsthemen |
| `cp-scnat-db` | SCNAT DB |
| `cp-sichtbarkeit` | Sichtbarkeit |
| `cp-admin-stuff` | Admin Stuff |

---

## 5. Authentifizierung und Sicherheit

### 5.1 Authentifizierungsfluss

```
┌───────────┐    POST /api/auth/login     ┌───────────┐
│  Browser   │ ──────────────────────────► │  Backend   │
│            │   { email, password }       │            │
│            │                             │  1. Email  │
│            │                             │     lookup │
│            │                             │  2. bcrypt │
│            │                             │     verify │
│            │    Set-Cookie: token=JWT    │  3. JWT    │
│            │ ◄────────────────────────── │     sign   │
│            │    { user: {...} }          │            │
└───────────┘                             └───────────┘

Alle folgenden Requests:
Cookie: token=<JWT> wird automatisch mitgesendet (credentials: 'include')
```

### 5.2 JWT-Konfiguration

| Parameter | Wert |
|-----------|------|
| Algorithmus | HS256 (Standard jsonwebtoken) |
| Gültigkeit | 24 Stunden |
| Secret-Mindestlänge | 32 Zeichen (Server startet nicht bei kürzerer) |
| Payload | `{ id, email, name, role }` |
| Transport | httpOnly Cookie (nicht im Response-Body) |

### 5.3 Cookie-Konfiguration

| Attribut | Wert | Zweck |
|----------|------|-------|
| `httpOnly` | `true` | Kein JavaScript-Zugriff (XSS-Schutz) |
| `secure` | `true` (Produktion) | Nur über HTTPS |
| `sameSite` | `strict` | CSRF-Schutz |
| `maxAge` | 86'400'000 ms (24h) | Automatischer Ablauf |
| `path` | `/` | Für alle Pfade gültig |

### 5.4 Passwort-Richtlinien

| Regel | Wert |
|-------|------|
| Hashing-Algorithmus | bcrypt |
| Cost Factor (Salt Rounds) | 12 |
| Mindestlänge | 8 Zeichen (Server-Validierung) |

### 5.5 Rate Limiting

| Scope | Limit | Fenster |
|-------|-------|---------|
| Alle API-Endpunkte (`/api/*`) | 120 Requests | 1 Minute |
| Login (`/api/auth/login`) | 20 Requests | 15 Minuten |

### 5.6 Weitere Sicherheitsmassnahmen

- **Helmet**: Sicherheits-HTTP-Header (X-Content-Type-Options, X-Frame-Options, etc.)
- **CORS**: Eingeschränkt auf konfigurierte Origin(s) (`CORS_ORIGIN` Umgebungsvariable)
- **Input-Sanitisierung**: Alle API-Eingaben werden durch eine `sanitize()`-Funktion geleitet, die HTML-Tags entfernt und Prototype-Pollution verhindert
- **Mass-Assignment-Schutz**: `pick()`-Funktion beschränkt erlaubte Felder pro Endpunkt
- **Nginx-Zugriffssperre**: Blockiert Zugriff auf `.git`, `.env`, `data/`, `server/`, `node_modules/`, `package.json`
- **SSH**: Nur Public-Key-Authentifizierung, Root-Login deaktiviert

---

## 6. Navigationsstruktur

### 6.1 Portal-Navigation (Sidebar)

Die Hauptnavigation wird als kollabierbare Sidebar dargestellt. Die Reihenfolge und Sichtbarkeit der Einträge wird durch das Sichtbarkeitssystem gesteuert.

```
┌─────────────────────────┐
│  🔍 Suche (⌘K / Ctrl+K) │
├─────────────────────────┤
│  👤 Benutzername         │
│  🔔 Benachrichtigungen   │
├─────────────────────────┤
│  Übersicht               │  → /
│  Strategie               │  → /strategie
│  Handlungsfelder         │  → /handlungsfelder
│  Massnahmen              │  → /massnahmen
│  Sprints                 │  → /sprints
│  Software & Co           │  → /systemlandschaft
│  KI                      │  → /ki-hub
│  Schulungen              │  → /schulungen
│  Software-Anträge        │  → /software-antraege
│  Prozesse                │  → /prozesse
│  Team                    │  → /team
│  FAQs                    │  → /faqs
│  Glossar                 │  → /glossar
├─────────────────────────┤
│  ★ Meine Übersicht       │  → /meine-uebersicht
│  ⚙ Control Panel (Admin) │  → /cp
├─────────────────────────┤
│  🌓 Theme Toggle          │
│  🚪 Logout                │
└─────────────────────────┘
```

**Mobile:** Hamburger-Menü öffnet Sidebar als Overlay.

**Live-Ticker:** Ein horizontaler News-Ticker wird auf Desktop-Ansichten unterhalb der Hauptnavigation angezeigt (Live-Infos).

**Globale Suche:** Über `⌘K` / `Ctrl+K` aufrufbar. Durchsucht clientseitig einen Such-Index aller Seiteninhalt (kein API-Call).

### 6.2 Control-Panel-Navigation (CP Sidebar)

```
┌─────────────────────────┐
│  CONTROL PANEL           │
│  👤 Admin-Name           │
├─────────────────────────┤
│  Dashboard               │  → /cp
│  Live Infos              │  → /cp/live-infos
│  News                    │  → /cp/news
│  Nachrichten         🔴  │  → /cp/nachrichten
│  Content                 │  → /cp/content
│  Events              🔴  │  → /cp/events
│  Anträge             🔴  │  → /cp/antraege
│  Users                   │  → /cp/users
│  Changes             🔴  │  → /cp/changes
│  Massnahmen              │  → /cp/massnahmen
│  Sprints                 │  → /cp/sprints
│  Themen              🔴  │  → /cp/themen
│  SCNAT DB                │  → /cp/scnat-db
│  Sichtbarkeit            │  → /cp/sichtbarkeit
│  Admin Stuff             │  → /cp/admin-stuff
│  Admin Details           │  → /cp/admin-details
├─────────────────────────┤
│  ← Zurück zum Portal    │
└─────────────────────────┘
```

🔴 = Dynamische Badges zeigen die Anzahl neuer/ungesehener Einträge seit dem letzten Besuch der jeweiligen Sektion.

**Badge-Quellen:**

| Sektion | Badge-Quelle |
|---------|-------------|
| Events | Neue Event-Registrierungen |
| Anträge | Neue Software-Anträge |
| Changes | Neue Change-Vorschläge |
| Themen | Neue Schulungsthemen-Vorschläge |

---

## 7. Portal — Öffentliche Seiten (authentifiziert)

Alle Portal-Seiten erfordern eine gültige Authentifizierung. Nicht-angemeldete Benutzer werden auf `/login` umgeleitet.

---

### 7.1 Login (`/login`)

**Zweck:** Authentifizierung der Benutzer.

| Eigenschaft | Beschreibung |
|-------------|-------------|
| **Zugang** | Öffentlich (einzige Seite ohne Auth) |
| **UI-Elemente** | E-Mail-Feld, Passwort-Feld, Login-Button |
| **Hintergrund** | Animiertes Netzwerk-Muster (NetworkBackground-Komponente) |
| **Verhalten** | Bei erfolgreichem Login: Weiterleitung zur ursprünglichen Zielseite oder `/` |
| **Fehlerbehandlung** | Inline-Fehlermeldung bei ungültigen Zugangsdaten |
| **API** | `POST /api/auth/login` |

---

### 7.2 Übersicht / Startseite (`/`)

**Zweck:** Zentraler Einstiegspunkt mit Überblick über die Plattform.

**Sektionen:**

| Sektion | Beschreibung |
|---------|-------------|
| **Hero** | Grosser Titel mit Claim der digitalen Transformation, animierter Hintergrund |
| **Vision House** | Interaktive Grafik des Visiongebäudes (strategische Handlungsfelder als Bausteine) |
| **Quick Access Grid** | Schnellzugriff-Kacheln zu den wichtigsten Sektionen |
| **News Timeline** | Chronologische Liste aktueller Neuigkeiten |
| **Strategie-Überblick** | Kompakte Zusammenfassung des Strategiestatus |

**API-Aufrufe:** `GET /api/news` (via NewsTimeline-Komponente)

---

### 7.3 Strategie (`/strategie`)

**Zweck:** Darstellung der Digitalisierungsstrategie.

**Sektionen:**

| Sektion | Beschreibung |
|---------|-------------|
| **Einleitung** | Strategie-Intro, Version, Status (GL-verabschiedet) |
| **Flip Cards** | Interaktive Karten mit Strategie-Elementen (zum Umdrehen) |
| **Vision House** | Interaktive Darstellung des Visiongebäudes mit Handlungsfeldern |
| **Timeline** | Chronologische Darstellung der Strategie-Meilensteine |
| **Rollen** | Rollenkarten (Change Agents, Verantwortlicher Digitalisierung, etc.) |
| **Dokument-Links** | Links zur Strategie-Dokumentation |

**UI:** Framer Motion Animationen, PageHeader-Komponente.  
**API-Aufrufe:** Keine (statischer Content aus CMS).

---

### 7.4 Handlungsfelder (`/handlungsfelder`)

**Zweck:** Detaildarstellung der sechs strategischen Handlungsfelder.

**Handlungsfelder:**

1. Kultur & Kompetenz
2. Infrastruktur & Tools
3. Kommunikation & Transparenz
4. Prozesse & Automatisierung
5. Steuerung & Governance
6. Daten & Wissensmanagement

**UI:** Akkordeon-Darstellung mit Themen pro Handlungsfeld, animierte Timeline, Framer Motion.  
**API-Aufrufe:** Keine (statischer Content).

---

### 7.5 Massnahmen (`/massnahmen`)

**Zweck:** Übersicht aller Digitalisierungsmassnahmen für alle Mitarbeitenden (nur lesen).

**Ansichten:**

| Ansicht | Beschreibung |
|---------|-------------|
| **Listen-Ansicht** | Massnahmen gruppiert nach Themen-Cluster, mit Status-Badges |
| **Matrix-Ansicht** | Wirkung-Aufwand-Matrix zur Priorisierungsvisualisierung |
| **Start mit 6** | Hervorgehobene Darstellung der ersten 6 Startmassnahmen |

**Filter:**
- Freitext-Suche
- Cluster-Filter
- Status-Filter
- Tags-Filter

**Spezialverhalten:**
- Admins können über einen Toggle auch Admin-Massnahmen (`isAdminTask`) ein-/ausblenden
- Nicht-Admins sehen Admin-Massnahmen nie (API-seitiger Filter)
- Link zum Change-Prozess für neue Vorschläge

**API-Aufrufe:** `GET /api/massnahmen`, `GET /api/sprints`

---

### 7.6 Sprints (`/sprints`)

**Zweck:** Darstellung des Sprint-basierten Umsetzungsplans.

**Sektionen:**

| Sektion | Beschreibung |
|---------|-------------|
| **Statistik-Leiste** | Kennzahlen: Aktive Sprints, Geplante, Abgeschlossene Massnahmen |
| **Filter-Leiste** | Filter nach Sprint-Status, Cluster |
| **Sprint-Timeline** | Visuelle Timeline aller aktiven und geplanten Sprints |
| **Sprint-Detail-Panel** | Aufklappbares Panel mit zugeordneten Massnahmen, Fortschritt, Verantwortlichen |
| **Abgeschlossene Sprints** | Archiv vergangener Sprints |

**Spezialverhalten:**
- Admins können Admin-Sprints (`isAdminSprint`) ein-/ausblenden
- Nicht-Admins sehen Admin-Sprints nie (API-Filter)
- Archivierte Sprints (`status: 'archived'`) werden für alle ausgeblendet

**API-Aufrufe:** `GET /api/sprints`

---

### 7.7 Software & Co / Systemlandschaft (`/systemlandschaft`)

**Zweck:** Übersicht der gesamten Softwarelandschaft der SCNAT.

**Tabs:**

| Tab | Beschreibung |
|-----|-------------|
| **Tool-Matrix** | Tabellarische Übersicht aller Software-Tools mit Kategorien, Status |
| **Listen-Ansicht** | Alphabetische Liste mit Detailkarten |
| **Ranking** | Aggregierte Bewertungen aller Mitarbeitenden |

**Interaktionen:**
- **SystemCard:** Klickbare Karten mit Software-Details
- **SystemDetailModal:** Detailansicht mit allen Informationen
- **SoftwareDrawer:** Seitliches Panel mit Radar-Chart (Benutzerfreundlichkeit, Integration, Datenschutz, Kosteneffizienz, Support, Mobiltauglichkeit) und Voting-Funktion
- **Voting:** Benutzer können Software bewerten (Up/Down/Interesse)

**API-Aufrufe:** `GET /api/software-votes/ranking`, `GET /api/software-votes`, `POST /api/software-votes`, `DELETE /api/software-votes`

---

### 7.8 SCNAT DB (`/scnat-db`)

**Zweck:** Dokumentation des SCNAT-Datenbanksystems (Infrastruktur-Übersicht).

**Tabs:**

| Tab | Beschreibung |
|-----|-------------|
| **Übersicht** | Status der Konsolidierung, Migration, aktuelle Phase |
| **Funktionsbereiche** | Detaillierte Funktionskategorien der Datenbank |
| **Strategische Optionen** | Entscheidungsoptionen für die zukünftige Infrastruktur |
| **Entscheide** | Pendente und getroffene Entscheidungen |
| **Backlog** | Offene Infrastruktur-Aufgaben |

**API-Aufrufe:** `GET /api/scnat-infra`

---

### 7.9 KI-Hub (`/ki-hub`)

**Zweck:** Umfassendes Wissenszentrum zu Künstlicher Intelligenz.

**Tabs:**

| Tab | Beschreibung |
|-----|-------------|
| **Tools** | KI-Framework: Übersicht von KI-Tools und deren Einsatzmöglichkeiten |
| **ChatGPT** | Detailsektion zu ChatGPT: Prompting-Tipps, Best Practices, Szenarien |
| **Profis** | Fortgeschrittene Konzepte: Chain of Thought, Reasoning-Vergleiche, Sicherheit |

**Subkomponenten:** KiFramework, LlmComparison, OllamaSection, PromptTips.  
**API-Aufrufe:** `GET /api/ki-content`  
**Content-Verwaltung:** Inhalte werden über das CP als strukturiertes JSON gepflegt.

---

### 7.10 Schulungen (`/schulungen`)

**Zweck:** Schulungs- und Event-Management.

**Sektionen:**

| Sektion | Beschreibung |
|---------|-------------|
| **Kalender-Ansicht** | Monatskalender mit markierten Event-Tagen |
| **Listen-Ansicht** | Chronologische Liste aller Events mit Details |
| **Anmelde-Modal** | Anmeldeformular mit Name, E-Mail, Abteilung |
| **Themen-Voting** | Benutzer können Schulungsthemen vorschlagen und für bestehende Themen abstimmen |

**Interaktionen:**
- Für Events anmelden (mit Kapazitätsprüfung und Duplikatserkennung)
- Neue Schulungsthemen vorschlagen
- Für Themen abstimmen (Like-Toggle)
- Eigene Themen löschen (oder alle, wenn Admin, mit Einschränkungen)

**API-Aufrufe:** `GET /api/events`, `POST /api/registrations`, `GET /api/registrations/mine`, `GET /api/schulungsthemen`, `POST /api/schulungsthemen`, `POST /api/schulungsthemen/:id/like`, `DELETE /api/schulungsthemen/:id`

---

### 7.11 Software-Anträge (`/software-antraege`)

**Zweck:** Formular für Software-Beschaffungsanträge.

**Formularfelder:**
- Titel (Pflicht)
- Beschreibung
- Typ (Software-Art)
- Kontaktperson
- Kontakt-E-Mail

**Verhalten:** Nach Absenden wird der Antrag erstellt und ist für den Benutzer in "Meine Übersicht" einsehbar. Admins bearbeiten Anträge im Control Panel.

**API-Aufrufe:** `POST /api/requests`

---

### 7.12 Meine Übersicht (`/meine-uebersicht`)

**Zweck:** Persönliches Dashboard des angemeldeten Benutzers.

**Sektionen:**

| Sektion | Beschreibung |
|---------|-------------|
| **Meine Anträge** | Übersicht aller eigenen Software-Anträge mit Status |
| **Meine Anmeldungen** | Übersicht aller Event-Registrierungen |
| **Meine Changes** | Eingereichte Change-Vorschläge mit Status |
| **Inbox** | Empfangene Nachrichten mit Lese-Status, einzeln oder alle als gelesen markierbar |

**Besonderheit:** Diese Seite hat **keinen** Sichtbarkeitsschlüssel — sie ist immer zugänglich.

**API-Aufrufe:** `GET /api/requests/mine`, `GET /api/registrations/mine`, `GET /api/changes/mine`, `GET /api/inbox/mine`, `POST /api/inbox/:id/read`, `POST /api/inbox/read-all`

---

### 7.13 Prozesse (`/prozesse`)

**Zweck:** Dokumentation interner Prozesse.

**Tabs:**

| Tab | Beschreibung |
|-----|-------------|
| **Software beschaffen** | Schrittweise Darstellung des Beschaffungsprozesses (statisch, kein API-Call, Formular zeigt nur Toast-Benachrichtigung) |
| **PM-Framework** | Umfassende Dokumentation des Projektmanagement-Frameworks mit Change-Vorschlags-Formular |

**API-Aufrufe:** `POST /api/changes` (via PM-Framework-Tab)

---

### 7.14 Team (`/team`)

**Zweck:** Darstellung des Digitalisierungsteams.

**UI:** Statische Organigramm-Karten mit Rollen und Zuständigkeiten.  
**API-Aufrufe:** Keine.

---

### 7.15 FAQs (`/faqs`)

**Zweck:** Häufig gestellte Fragen zur Digitalisierung.

**UI:** Akkordeon-Darstellung, Kategorie-Filter-Chips.  
**API-Aufrufe:** Keine (Content aus CMS).

---

### 7.16 Glossar (`/glossar`)

**Zweck:** Begriffserklärungen rund um Digitalisierung.

**UI:** Suchbare alphabetische Liste (A–Z Sprungmarken), Freitext-Suche.  
**API-Aufrufe:** Keine (Content aus CMS).

---

### 7.17 Weitere Portal-Seiten

| Seite | Pfad | Beschreibung |
|-------|------|-------------|
| **Where does it fit?** | `/where` | Interaktive 3D-Darstellung (CSS 3D-Cubes) der Systemintegration. Zeigt wie verschiedene Tools und Systeme zusammenhängen. SVG-Verbindungslinien, Tooltips. |
| **How was this built?** | `/how-built` | Darstellung der Build-Pipeline und Entstehungsgeschichte der Plattform. Animierte Cube-Darstellung, Pipeline-Diagramm. |

---

## 8. Control Panel — Administrationsbereich

Das Control Panel ist ausschliesslich für Benutzer mit der Rolle `admin` zugänglich. Nicht-autorisierte Zugriffe werden auf die Startseite umgeleitet.

---

### 8.1 Dashboard (`/cp`)

**Zweck:** Übersicht und Statistiken für Administratoren.

**Inhalte:**
- Anzahl Benutzer, Massnahmen, Events, offene Anträge, Changes, Sprints
- Mini-Charts (Verteilungen, Trends)
- Schnellzugriff-Links zu allen CP-Sektionen

**API-Aufrufe:** Mehrere `GET`-Requests zu: Events, Requests, Users, Massnahmen, Schulungsthemen, Software-Votes, Changes, Sprints.

---

### 8.2 Benutzerverwaltung (`/cp/users`)

**Zweck:** CRUD-Verwaltung aller Plattform-Benutzer.

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Benutzer auflisten** | Tabelle mit Name, E-Mail, Rolle |
| **Benutzer erstellen** | Formular: Name, E-Mail, Passwort (mind. 8 Zeichen), Rolle (User/Admin) |
| **Benutzer bearbeiten** | Name, E-Mail, Rolle ändern |
| **Passwort zurücksetzen** | Neues Passwort setzen |
| **Benutzer löschen** | Mit Bestätigung; eigenes Konto kann nicht gelöscht werden |

**API-Aufrufe:** `GET /api/users`, `PUT /api/users`, `PATCH /api/users/:id`, `DELETE /api/users/:id`

---

### 8.3 Massnahmen-Verwaltung (`/cp/massnahmen`)

**Zweck:** Vollständige Verwaltung aller Digitalisierungsmassnahmen.

**Ansichten:**

| Ansicht | Beschreibung |
|---------|-------------|
| **Kanban-Board** | Drag-and-Drop Spalten nach Status (geplant, in Umsetzung, abgeschlossen). Powered by dnd-kit. |
| **Listen-Ansicht** | Tabellarische Darstellung mit Inline-Bearbeitung |

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Erstellen** | Formular mit allen Massnahmen-Feldern |
| **Bearbeiten** | Inline-Bearbeitung oder Modal: Titel, Beschreibung, Cluster, Status, Wirkung, Aufwand, Priorität, Tags, SCNAT-DB/Portal-Bezug |
| **Löschen** | Mit Bestätigung; entfernt auch Sprint-Zuordnungen |
| **Reihenfolge ändern** | Drag-and-Drop innerhalb des Kanban-Boards |
| **Kommentare** | Kommentar-Thread pro Massnahme |
| **Sprint-Zuordnung** | Massnahme einem Sprint zuweisen |
| **Admin-Flag** | `isAdminTask` — markiert interne Admin-Massnahmen |

**API-Aufrufe:** `GET /api/massnahmen`, `PUT /api/massnahmen`, `POST /api/massnahmen/:id`, `DELETE /api/massnahmen/:id`, `POST /api/massnahmen/reorder`, `GET /api/sprints`, `PATCH /api/sprints`

---

### 8.4 Sprint-Verwaltung (`/cp/sprints` und `/cp/sprints/:id`)

**Zweck:** Verwaltung der Umsetzungssprints.

#### Sprint-Übersicht (`/cp/sprints`)

| Funktion | Beschreibung |
|----------|-------------|
| **Sprint-Liste** | Alle Sprints mit Status, Datum, Massnahmen-Anzahl |
| **Sprint löschen** | Mit Bestätigung |
| **Status ändern** | Inline-Status-Update (geplant, aktiv, abgeschlossen, archiviert) |
| **Neuen Sprint erstellen** | Weiterleitung zum Sprint-Editor |

#### Sprint-Editor (`/cp/sprints/:id`)

| Funktion | Beschreibung |
|----------|-------------|
| **Metadaten bearbeiten** | Name, Cluster, Cluster-Farbe, Beschreibung, Start-/Enddatum, Status |
| **Massnahmen zuordnen** | Aus dem Pool verfügbarer Massnahmen auswählen und dem Sprint zuweisen |
| **Pro Massnahme im Sprint** | Status, Verantwortliche, Notizen, Fortschritt bearbeiten |
| **Admin-Sprint-Flag** | `isAdminSprint` — nur für Admins sichtbar |
| **Gantt-Chart** | Visuelle Timeline-Darstellung (CpSprintGantt-Komponente) |

**API-Aufrufe:** `GET /api/sprints`, `GET /api/sprints/:id`, `POST /api/sprints`, `PUT /api/sprints/:id`, `PATCH /api/sprints`, `DELETE /api/sprints`, `GET /api/massnahmen`

---

### 8.5 Event-Verwaltung (`/cp/events`)

**Zweck:** Verwaltung von Schulungen und Events inkl. Anmeldungen.

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Events erstellen** | Titel, Datum, Zeit, Ort, Beschreibung, Maximale Teilnehmer, Kategorie |
| **Events löschen** | Mit Bestätigung |
| **Anmeldungen einsehen** | Liste aller Anmeldungen pro Event |
| **Anmeldungen löschen** | Einzelne Registrierungen entfernen (aktualisiert Event-Anmeldungszähler) |
| **Benutzer manuell anmelden** | Admin kann Benutzer direkt einem Event zuordnen |

**API-Aufrufe:** `GET /api/events`, `PUT /api/events`, `DELETE /api/events/:id`, `GET /api/registrations`, `DELETE /api/registrations/:id`, `POST /api/registrations/admin`

---

### 8.6 Antrags-Verwaltung (`/cp/antraege`)

**Zweck:** Bearbeitung eingehender Software-Anträge.

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Anträge auflisten** | Tabelle mit Status-Filter |
| **Status ändern** | Dropdown: offen, in Bearbeitung, genehmigt, abgelehnt |
| **Antwort verfassen** | Freitext-Antwort an den Antragsteller |

**API-Aufrufe:** `GET /api/requests`, `POST /api/requests/:id/status`, `POST /api/requests/:id/reply`

---

### 8.7 Change-Verwaltung (`/cp/changes`)

**Zweck:** Bearbeitung eingehender Change-Vorschläge.

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Changes auflisten** | Tabelle mit Status, Cluster, verknüpfter Massnahme |
| **Status ändern** | Status-Update mit Timestamp |
| **Cluster zuordnen** | Thematische Einordnung |
| **Antwort verfassen** | Admin-Antwort mit Timestamp |
| **Admin-Notiz** | Interne Notiz (nur für Admins sichtbar) |
| **In Massnahme umwandeln** | Change-Vorschlag direkt als neue Massnahme erstellen und verknüpfen |
| **Löschen** | Mit Bestätigung |

**Spezialverhalten:** Wenn eine verknüpfte Massnahme den Status `abgeschlossen` erhält, wird der Change-Status automatisch auf `umgesetzt` aktualisiert.

**API-Aufrufe:** `GET /api/changes`, `POST /api/changes/:id`, `POST /api/changes/:id/reply`, `DELETE /api/changes/:id`, `PUT /api/massnahmen` (Konvertierung)

---

### 8.8 Nachrichten / Inbox (`/cp/nachrichten`)

**Zweck:** Broadcast-Nachrichtensystem für Admin-to-User-Kommunikation.

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Nachricht verfassen** | Titel, Nachrichtentext, Priorität |
| **Zielgruppe wählen** | Alle Benutzer / Bestimmte Benutzer / Benutzergruppe / Event-Teilnehmer |
| **Nachrichtenhistorie** | Übersicht aller gesendeten Nachrichten mit Lese-Statistik (gelesen/total) |
| **Nachrichten löschen** | Einzelne Nachrichten entfernen |

**Gruppen-Verwaltung:**

| Funktion | Beschreibung |
|----------|-------------|
| **Gruppe erstellen** | Name + Benutzer-Auswahl |
| **Gruppe bearbeiten** | Name und Mitglieder ändern |
| **Gruppe löschen** | Mit Bestätigung |

**Zieltypen:**

| Zieltyp | Beschreibung |
|---------|-------------|
| `all` | Alle registrierten Benutzer |
| `users` | Ausgewählte einzelne Benutzer |
| `group` | Alle Mitglieder einer Benutzergruppe |
| `event` | Alle Teilnehmer eines bestimmten Events |

**API-Aufrufe:** `POST /api/inbox/admin`, `GET /api/inbox/admin/all`, `DELETE /api/inbox/admin/:id`, `GET /api/inbox/groups`, `POST /api/inbox/groups`, `PUT /api/inbox/groups/:id`, `DELETE /api/inbox/groups/:id`, `GET /api/users`, `GET /api/events`

---

### 8.9 Content-Verwaltung (`/cp/content`)

**Zweck:** CMS für editierbare Textinhalte auf Portal-Seiten.

**Funktionen:**
- Bearbeitbare Textsektionen, gruppiert nach Portal-Seiten
- Speichern aktualisiert die CMS-Datenbank sofort
- Unterstützt auch KI-Content-Bearbeitung (strukturiertes JSON)

**Verwaltete Inhalte (Auszug aus 97+ Schlüsseln):**
- Hero-Texte (Titel, Untertitel)
- Strategie-Beschreibungen
- Handlungsfeld-Texte
- Massnahmen-Hinweise
- Software-Beschreibungen
- FAQ-Inhalte
- Glossar-Einträge
- Schulungs-Hinweise

**API-Aufrufe:** `GET /api/content`, `POST /api/content`, `GET /api/ki-content`, `POST /api/ki-content`

---

### 8.10 News-Verwaltung (`/cp/news`)

**Zweck:** CRUD-Verwaltung von Neuigkeiten.

**Felder pro News-Eintrag:**

| Feld | Beschreibung |
|------|-------------|
| `title` | Titel der Nachricht |
| `datum` | Veröffentlichungsdatum |
| `category` | Kategorie (z.B. Strategie, Schulung, Tool) |
| `categoryColor` | Farbcode der Kategorie |
| `teaser` | Kurztext für Übersichtsdarstellungen |
| `detail` | Ausführlicher Inhalt |
| `linkTo` | Optionaler interner Link |
| `isNew` | "Neu"-Badge anzeigen |
| `aktiv` | Aktivierungsstatus |
| `gueltigBis` | Optionales Ablaufdatum |

**API-Aufrufe:** `GET /api/news/all`, `POST /api/news`, `PUT /api/news/:id`, `DELETE /api/news/:id`

---

### 8.11 Live-Infos-Verwaltung (`/cp/live-infos`)

**Zweck:** Verwaltung des Live-Tickers (horizontales Banner im Portal).

**Felder pro Ticker-Eintrag:**

| Feld | Beschreibung |
|------|-------------|
| `tag` | Kürzel/Label (z.B. "NEU", "WICHTIG") |
| `text` | Ticker-Text |
| `priority` | Prioritätsstufe |
| `aktiv` | Ein-/Ausschalten |
| `gueltigBis` | Automatisches Ablaufdatum |

**API-Aufrufe:** `GET /api/live-infos/all`, `POST /api/live-infos`, `PUT /api/live-infos/:id`, `DELETE /api/live-infos/:id`

---

### 8.12 Schulungsthemen-Verwaltung (`/cp/themen`)

**Zweck:** Übersicht und Moderation der Schulungsthemen-Vorschläge.

**Funktionen:**
- Alle Themen anzeigen (vordefinierte + User-Vorschläge)
- User-Vorschläge löschen
- Like-Statistiken einsehen

**API-Aufrufe:** `GET /api/schulungsthemen`, `DELETE /api/schulungsthemen/:id`

---

### 8.13 SCNAT-DB-Verwaltung (`/cp/scnat-db`)

**Zweck:** Administration der SCNAT-Infrastruktur-Dokumentation.

**Verwaltbare Bereiche:**

| Bereich | Funktionen |
|---------|-----------|
| **Status** | Konsolidierungsphase, Migration, Timeline, Fortschritt, Notizen bearbeiten |
| **Entscheide** | Titel, Beschreibung, Status, Priorität, Deadline, Entscheidungstext bearbeiten |
| **Backlog** | Einträge erstellen, bearbeiten (Titel, Beschreibung, Kategorie, Priorität, Status), löschen |

**API-Aufrufe:** `GET /api/scnat-infra`, `POST /api/scnat-infra/status`, `POST /api/scnat-infra/entscheide/:id`, `PUT /api/scnat-infra/backlog`, `POST /api/scnat-infra/backlog/:id`, `DELETE /api/scnat-infra/backlog/:id`

---

### 8.14 Sichtbarkeits-Verwaltung (`/cp/sichtbarkeit`)

**Zweck:** Steuerung der Sichtbarkeit und Reihenfolge aller Portal- und CP-Sektionen.

**Funktionen:**

| Funktion | Beschreibung |
|----------|-------------|
| **Portal-Sektionen** | 13 Sektionen ein-/ausblenden, Reihenfolge ändern |
| **CP-Sektionen** | 15 Sektionen ein-/ausblenden, Reihenfolge ändern |
| **Toggle** | Pro Sektion ein/aus |
| **Drag & Drop** | Reihenfolge der Navigation per Drag & Drop anpassen |

**API-Aufrufe:** `GET /api/visibility`, `PUT /api/visibility`

---

### 8.15 Admin Stuff (`/cp/admin-stuff` und `/cp/admin-stuff/:page`)

**Zweck:** Sammlung von internen Admin-Briefings und Dokumenten.

**Funktionen:**
- Übersichtsseite mit Kacheln/Links zu verschiedenen Briefing-Dokumenten
- Detail-Ansicht: Full-Height iFrame, der statische HTML-Dateien aus `public/files/` lädt
- Theme-Parameter wird an iFrame weitergegeben (Dark/Light)

---

### 8.16 Admin Details (`/cp/admin-details` und `/cp/admin-details/:page`)

**Zweck:** Weitere administrative Detaildokumente.

**Funktionen:** Analog zu Admin Stuff — Übersicht mit Links, iFrame-Darstellung statischer HTML-Dateien.

---

## 9. Datenmodell

### 9.1 Übersicht der Datenentitäten

Das System verwendet 19 JSON-Dateien als persistenten Speicher. Es gibt keine relationale Datenbank — alle Daten werden als JSON-Arrays oder -Objekte im Dateisystem gespeichert.

```
data/
├── users.json              # Benutzerkonten
├── massnahmen.json         # Massnahmen-Katalog
├── sprints.json            # Sprint-Planung
├── changes.json            # Change-Vorschläge
├── requests.json           # Software-Anträge
├── events.json             # Schulungen/Events
├── registrations.json      # Event-Anmeldungen
├── schulungsthemen.json    # Schulungsthemen + Voting
├── software.json           # Software-Katalog (statisch)
├── software-votes.json     # Software-Bewertungen
├── inbox-messages.json     # Nachrichten
├── user-groups.json        # Benutzergruppen (für Inbox)
├── news.json               # News-Einträge
├── live-infos.json         # Ticker-Einträge
├── content.json            # CMS-Inhalte
├── ki-content.json         # KI-Hub-Inhalte
├── scnat-infra.json        # Infrastruktur-Dokumentation
├── visibility.json         # Sichtbarkeitseinstellungen
└── notifications-seen.json # Benachrichtigungs-Timestamps
```

### 9.2 Entity-Relationship-Diagramm (textuell)

```
users ──1:N──► requests         (userId)
users ──1:N──► changes          (userId)
users ──1:N──► registrations    (userId)
users ──1:N──► software-votes   (userId)
users ──1:N──► schulungsthemen  (erstelltVon, likes[])
users ──1:N──► inbox-messages   (readBy[], targetUserIds[])
users ──M:N──► user-groups      (userIds[])

events ──1:N──► registrations   (eventId)
events ──1:N──► inbox-messages  (targetEventId)

massnahmen ──M:N──► sprints     (sprints.massnahmen[].massnahmeId)
massnahmen ──1:N──► changes     (massnahmeId)

user-groups ──1:N──► inbox-messages (targetGroupId)
```

### 9.3 Detaillierte Feld-Spezifikationen

#### 9.3.1 `users.json` — Benutzer

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID (generiert) |
| `name` | String | Ja | Anzeigename |
| `email` | String | Ja | E-Mail-Adresse (eindeutig, lowercase) |
| `passwordHash` | String | Ja | bcrypt-Hash (wird nie an Frontend gesendet) |
| `role` | String | Ja | `"user"` oder `"admin"` |

#### 9.3.2 `massnahmen.json` — Massnahmen

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Format `m##` oder `at##` (Admin-Task) |
| `titel` | String | Ja | Massnahmen-Titel |
| `beschreibung` | String | Nein | Detailbeschreibung |
| `cluster` | String | Nein | Themen-Cluster (z.B. "Kultur", "Infrastruktur") |
| `status` | String | Ja | `"geplant"`, `"in_umsetzung"`, `"abgeschlossen"` |
| `tags` | String[] | Nein | Schlagwörter |
| `wirkung` | String/Number | Nein | Wirkungsbewertung (für Matrix) |
| `aufwand` | String/Number | Nein | Aufwandsbewertung (für Matrix) |
| `prioritaet` | String | Ja | `"A"`, `"B"`, `"C"` |
| `prioritaet_label` | String | Nein | Klartext-Label der Priorität |
| `reihenfolge` | Number | Nein | Sortierposition (per Drag & Drop) |
| `start_empfohlen` | String | Nein | Empfohlenes Startdatum |
| `scnat_db` | Boolean/String | Nein | Bezug zu SCNAT-Datenbank |
| `scnat_portal` | Boolean/String | Nein | Bezug zum Portal |
| `isNew` | Boolean | Nein | "Neu"-Badge anzeigen |
| `isAdminTask` | Boolean | Nein | Nur für Admins sichtbar |
| `notiz` | String | Nein | Interne Notiz |
| `comments` | Array | Nein | Kommentar-Thread |

#### 9.3.3 `sprints.json` — Sprints

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `name` | String | Ja | Sprint-Name |
| `cluster` | String | Nein | Themen-Cluster |
| `clusterColor` | String | Nein | Farbcode des Clusters |
| `description` | String | Nein | Sprint-Beschreibung |
| `startDate` | String | Nein | Startdatum (ISO) |
| `endDate` | String | Nein | Enddatum (ISO) |
| `status` | String | Ja | `"planned"`, `"active"`, `"completed"`, `"archived"` |
| `isAdminSprint` | Boolean | Nein | Nur für Admins sichtbar |
| `massnahmen` | Array | Nein | Zugeordnete Massnahmen (siehe unten) |

**Verschachtelte Massnahme im Sprint:**

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `massnahmeId` | String | Referenz auf `massnahmen.json` |
| `status` | String | Sprint-spezifischer Status |
| `verantwortliche` | String | Verantwortliche Person(en) |
| `notiz` | String | Sprint-spezifische Notiz |
| `progress` | Number | Fortschritt (0–100) |

#### 9.3.4 `changes.json` — Change-Vorschläge

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `titel` | String | Ja | Titel des Vorschlags |
| `beschreibung` | String | Nein | Detailbeschreibung |
| `typ` | String | Nein | Typ des Changes |
| `system` | String | Nein | Betroffenes System |
| `kontakt` | String | Nein | Kontaktperson |
| `kontaktEmail` | String | Nein | Kontakt-E-Mail |
| `userId` | String | Ja | Ersteller (auto) |
| `userEmail` | String | Ja | E-Mail des Erstellers (auto) |
| `status` | String | Ja | `"eingereicht"`, `"in_bearbeitung"`, `"umgesetzt"`, etc. |
| `cluster` | String | Nein | Zugeordneter Cluster (Admin) |
| `massnahmeId` | String | Nein | Verknüpfte Massnahme (Admin) |
| `adminNotiz` | String | Nein | Interne Admin-Notiz |
| `antwort` | String | Nein | Admin-Antwort |
| `antwortTimestamp` | String | Nein | Zeitpunkt der Antwort |
| `statusUpdatedAt` | String | Nein | Zeitpunkt der letzten Statusänderung |
| `timestamp` | String | Ja | Erstellungszeitpunkt |

#### 9.3.5 `requests.json` — Software-Anträge

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `titel` | String | Ja | Antrags-Titel |
| `beschreibung` | String | Nein | Begründung / Details |
| `typ` | String | Nein | Software-Typ |
| `kontakt` | String | Nein | Kontaktperson |
| `kontaktEmail` | String | Nein | Kontakt-E-Mail |
| `userId` | String | Ja | Ersteller (auto) |
| `status` | String | Ja | `"offen"`, `"in_bearbeitung"`, `"genehmigt"`, `"abgelehnt"` |
| `antwort` | String | Nein | Admin-Antwort |
| `antwortTimestamp` | String | Nein | Zeitpunkt der Antwort |
| `statusUpdatedAt` | String | Nein | Zeitpunkt der letzten Statusänderung |
| `timestamp` | String | Ja | Erstellungszeitpunkt |

#### 9.3.6 `events.json` — Events / Schulungen

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `titel` | String | Ja | Event-Titel |
| `datum` | String | Ja | Datum (ISO) |
| `zeit` | String | Nein | Uhrzeit |
| `ort` | String | Nein | Veranstaltungsort |
| `beschreibung` | String | Nein | Detailbeschreibung |
| `maxTeilnehmer` | Number | Nein | Maximale Teilnehmerzahl |
| `kategorie` | String | Nein | Event-Kategorie |
| `anmeldungen` | String[] | Ja | Array von Registrierungs-IDs |

#### 9.3.7 `registrations.json` — Event-Anmeldungen

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `eventId` | String | Ja | Referenz auf Event |
| `name` | String | Ja | Name des Teilnehmers |
| `email` | String | Ja | E-Mail des Teilnehmers |
| `userId` | String | Ja | Benutzer-ID (auto) |
| `abteilung` | String | Nein | Abteilung |
| `addedByAdmin` | Boolean | Nein | Vom Admin hinzugefügt |
| `timestamp` | String | Ja | Anmeldezeitpunkt |

#### 9.3.8 `schulungsthemen.json` — Schulungsthemen

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `titel` | String | Ja | Themen-Titel |
| `beschreibung` | String | Nein | Beschreibung |
| `typ` | String | Ja | `"vordefiniert"` oder `"user-vorschlag"` |
| `likes` | String[] | Ja | Array von User-IDs die geliked haben |
| `erstellt` | String | Ja | Erstellungszeitpunkt |
| `erstelltVon` | String | Ja | User-ID des Erstellers |

#### 9.3.9 `software.json` — Software-Katalog

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `name` | String | Ja | Software-Name |
| `kategorie` | String | Ja | Kategorie |
| `status` | String | Ja | Aktueller Status |
| `beschreibung` | String | Nein | Beschreibung |
| `radar` | Object | Nein | Bewertungsachsen (siehe unten) |
| `notizen` | String | Nein | Ergänzende Notizen |

**Radar-Objekt:**

| Achse | Typ | Beschreibung |
|-------|-----|-------------|
| `benutzerfreundlichkeit` | Number | Benutzerfreundlichkeit (0–10) |
| `integration` | Number | Integrationsfähigkeit (0–10) |
| `datenschutz` | Number | Datenschutz-Konformität (0–10) |
| `kosteneffizienz` | Number | Kosten-Nutzen-Verhältnis (0–10) |
| `support` | Number | Support-Qualität (0–10) |
| `mobiletauglichkeit` | Number | Mobile Nutzbarkeit (0–10) |

#### 9.3.10 `software-votes.json` — Software-Bewertungen

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `softwareId` | String | Ja | Referenz auf Software |
| `userId` | String | Ja | Abstimmender Benutzer |
| `type` | String | Ja | `"up"`, `"down"` oder `"interest"` |
| `timestamp` | String | Ja | Zeitpunkt der Abstimmung |

#### 9.3.11 `inbox-messages.json` — Nachrichten

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `title` | String | Ja | Betreff |
| `message` | String | Ja | Nachrichtentext |
| `priority` | String | Nein | Priorität |
| `targetType` | String | Ja | `"all"`, `"users"`, `"group"`, `"event"` |
| `targetUserIds` | String[] | Bedingt | Ziel-User (bei `targetType: "users"`) |
| `targetGroupId` | String | Bedingt | Ziel-Gruppe (bei `targetType: "group"`) |
| `targetEventId` | String | Bedingt | Ziel-Event (bei `targetType: "event"`) |
| `readBy` | String[] | Ja | User-IDs die gelesen haben |
| `createdAt` | String | Ja | Erstellungszeitpunkt |
| `createdBy` | String | Ja | Admin User-ID |
| `createdByName` | String | Ja | Admin-Name |

#### 9.3.12 `news.json` — News-Einträge

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `datum` | String | Ja | Veröffentlichungsdatum |
| `category` | String | Nein | Kategorie-Label |
| `categoryColor` | String | Nein | Kategorie-Farbe (HEX) |
| `title` | String | Ja | Titel |
| `teaser` | String | Nein | Kurztext |
| `detail` | String | Nein | Ausführlicher Text |
| `linkTo` | String | Nein | Interner Link |
| `isNew` | Boolean | Nein | "Neu"-Badge |
| `aktiv` | Boolean | Ja | Aktivierungsstatus |
| `gueltigBis` | String | Nein | Ablaufdatum |
| `erstellt` | String | Ja | Erstellungszeitpunkt |

#### 9.3.13 `live-infos.json` — Live-Ticker

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `tag` | String | Ja | Label (z.B. "NEU") |
| `text` | String | Ja | Ticker-Text |
| `priority` | String/Number | Nein | Priorität |
| `aktiv` | Boolean | Ja | Aktivierungsstatus |
| `gueltigBis` | String | Nein | Ablaufdatum |
| `erstellt` | String | Ja | Erstellungszeitpunkt |

#### 9.3.14 `scnat-infra.json` — Infrastruktur-Dokumentation

Verschachteltes JSON-Objekt mit folgenden Hauptbereichen:

| Bereich | Typ | Beschreibung |
|---------|-----|-------------|
| `status` | Object | Konsolidierungsphase, Migration, Timeline, Fortschritt |
| `strategische_optionen` | Object | Strategische Infrastruktur-Optionen mit Untervarianten |
| `entscheide` | Array | Pendente/getroffene Entscheidungen mit Status und Verantwortlichen |
| `funktionsbereiche` | Array | Funktionskategorien mit IDs, Farben, Projektzuordnungen |
| `backlog` | Array | Infrastruktur-Aufgaben mit Titel, Kategorie, Priorität, Status |

#### 9.3.15 `content.json` — CMS-Inhalte

Flaches JSON-Objekt mit 97+ Schlüssel-Wert-Paaren. Schlüsselformat: `{seite}_{sektion}` (z.B. `hero_title`, `strategie_vision`, `faq_1_q`).

#### 9.3.16 `ki-content.json` — KI-Hub-Inhalte

Verschachteltes JSON-Objekt mit 5 Hauptbereichen:

| Bereich | Beschreibung |
|---------|-------------|
| `profis` | Fortgeschrittene KI-Konzepte |
| `cot_szenarien` | Chain-of-Thought Szenarien |
| `reasoning_vergleich` | Vergleich von Reasoning-Modellen |
| `chatgpt` | ChatGPT-spezifische Inhalte |
| `sicherheit` | KI-Sicherheitsthemen |

#### 9.3.17 `visibility.json` — Sichtbarkeit

```json
{
  "portal": [{ "key": "home", "visible": true }, ...],
  "cp": [{ "key": "cp-dashboard", "visible": true }, ...]
}
```

#### 9.3.18 `notifications-seen.json` — Gesehen-Timestamps

```json
{
  "<userId>": "2026-04-15T10:00:00.000Z",
  "admin:<userId>": {
    "events": "2026-04-15T10:00:00.000Z",
    "antraege": "2026-04-15T10:00:00.000Z",
    "changes": "2026-04-15T10:00:00.000Z",
    "themen": "2026-04-15T10:00:00.000Z"
  }
}
```

#### 9.3.19 `user-groups.json` — Benutzergruppen

| Feld | Typ | Pflicht | Beschreibung |
|------|-----|---------|-------------|
| `id` | String | Ja | Eindeutige ID |
| `name` | String | Ja | Gruppenname |
| `userIds` | String[] | Ja | Mitglieder (User-IDs) |
| `createdAt` | String | Ja | Erstellungszeitpunkt |

---

## 10. API-Spezifikation

### 10.1 Allgemeines

| Eigenschaft | Wert |
|-------------|------|
| **Basis-URL** | `https://platform.poltis.ch/api` |
| **Datenformat** | JSON (`Content-Type: application/json`) |
| **Authentifizierung** | JWT via httpOnly Cookie |
| **Maximale Body-Grösse** | 1 MB |
| **Fehlerformat** | `{ "error": "Fehlermeldung" }` |
| **ID-Generierung** | `Date.now().toString(36)` + zufälliges Suffix |

### 10.2 Authentifizierung

| Methode | Pfad | Auth | Beschreibung |
|---------|------|------|-------------|
| `POST` | `/auth/login` | Nein | Login mit E-Mail und Passwort. Setzt JWT-Cookie. |
| `GET` | `/auth/me` | Cookie | Gibt aktuellen Benutzer zurück (aus JWT-Token). |
| `POST` | `/auth/logout` | Nein | Löscht JWT-Cookie. |

### 10.3 Benutzer

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/users` | Ja | Ja | Alle Benutzer (ohne Passwort-Hash) |
| `PUT` | `/users` | Ja | Ja | Benutzer erstellen |
| `PATCH` | `/users/:id` | Ja | Ja | Benutzer aktualisieren |
| `DELETE` | `/users/:id` | Ja | Ja | Benutzer löschen (nicht sich selbst) |

### 10.4 Massnahmen

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/massnahmen` | Ja | Nein | Alle Massnahmen (Nicht-Admins: ohne `isAdminTask`) |
| `PUT` | `/massnahmen` | Ja | Ja | Massnahme erstellen |
| `POST` | `/massnahmen/:id` | Ja | Ja | Massnahme aktualisieren |
| `DELETE` | `/massnahmen/:id` | Ja | Ja | Massnahme löschen (entfernt Sprint-Zuordnungen) |
| `POST` | `/massnahmen/reorder` | Ja | Ja | Reihenfolge aktualisieren |

### 10.5 Sprints

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/sprints` | Ja | Nein | Alle Sprints (ohne archivierte; Nicht-Admins: ohne `isAdminSprint`) |
| `GET` | `/sprints/:id` | Ja | Nein | Einzelner Sprint mit angereicherten Massnahmen |
| `POST` | `/sprints` | Ja | Ja | Sprint erstellen |
| `PUT` | `/sprints/:id` | Ja | Ja | Sprint aktualisieren |
| `PATCH` | `/sprints` | Ja | Ja | Sprint partiell aktualisieren (Status) |
| `DELETE` | `/sprints` | Ja | Ja | Sprint löschen |

### 10.6 Events

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/events` | Ja | Nein | Alle Events |
| `PUT` | `/events` | Ja | Ja | Event erstellen |
| `DELETE` | `/events/:id` | Ja | Ja | Event löschen |

### 10.7 Registrierungen

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `POST` | `/registrations` | Ja | Nein | Für Event anmelden (Kapazitäts- und Duplikatsprüfung) |
| `GET` | `/registrations` | Ja | Ja | Alle Registrierungen |
| `GET` | `/registrations/mine` | Ja | Nein | Eigene Registrierungen mit Event-Details |
| `DELETE` | `/registrations/:id` | Ja | Ja | Registrierung löschen |
| `POST` | `/registrations/admin` | Ja | Ja | Benutzer manuell anmelden |

### 10.8 Software-Anträge

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/requests` | Ja | Ja | Alle Anträge |
| `POST` | `/requests` | Ja | Nein | Antrag erstellen |
| `GET` | `/requests/mine` | Ja | Nein | Eigene Anträge |
| `POST` | `/requests/:id/status` | Ja | Ja | Status aktualisieren |
| `POST` | `/requests/:id/reply` | Ja | Ja | Antwort verfassen |

### 10.9 Change-Vorschläge

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/changes` | Ja | Ja | Alle Changes |
| `GET` | `/changes/mine` | Ja | Nein | Eigene Changes |
| `POST` | `/changes` | Ja | Nein | Change einreichen |
| `POST` | `/changes/:id` | Ja | Ja | Change aktualisieren (Admin) |
| `POST` | `/changes/:id/reply` | Ja | Ja | Antwort verfassen |
| `DELETE` | `/changes/:id` | Ja | Ja | Change löschen |

### 10.10 Inbox / Nachrichten

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/inbox/mine` | Ja | Nein | Eigene Nachrichten |
| `GET` | `/inbox/unread-count` | Ja | Nein | Anzahl ungelesener Nachrichten |
| `POST` | `/inbox/:id/read` | Ja | Nein | Nachricht als gelesen markieren |
| `POST` | `/inbox/read-all` | Ja | Nein | Alle als gelesen markieren |
| `GET` | `/inbox/admin/all` | Ja | Ja | Alle Nachrichten mit Statistiken |
| `POST` | `/inbox/admin` | Ja | Ja | Nachricht senden |
| `DELETE` | `/inbox/admin/:id` | Ja | Ja | Nachricht löschen |
| `GET` | `/inbox/groups` | Ja | Ja | Alle Benutzergruppen |
| `POST` | `/inbox/groups` | Ja | Ja | Gruppe erstellen |
| `PUT` | `/inbox/groups/:id` | Ja | Ja | Gruppe aktualisieren |
| `DELETE` | `/inbox/groups/:id` | Ja | Ja | Gruppe löschen |

### 10.11 Schulungsthemen

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/schulungsthemen` | Ja | Nein | Alle Themen (sortiert: vordefiniert zuerst, dann nach Likes) |
| `POST` | `/schulungsthemen` | Ja | Nein | Thema vorschlagen |
| `POST` | `/schulungsthemen/:id/like` | Ja | Nein | Like togglen |
| `DELETE` | `/schulungsthemen/:id` | Ja | Nein | Löschen (nur eigene; Admins: auch andere; nicht vordefinierte) |

### 10.12 Software-Bewertungen

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/software-votes` | Ja | Nein | Alle Votes (anonymisiert, mit `isOwn`-Flag) |
| `GET` | `/software-votes/ranking` | Ja | Nein | Aggregiertes Ranking pro Software |
| `POST` | `/software-votes` | Ja | Nein | Vote abgeben/ändern (Upsert) |
| `DELETE` | `/software-votes` | Ja | Nein | Eigene Stimme zurückziehen |

### 10.13 News

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/news` | Ja | Nein | Aktive News (sortiert nach Datum) |
| `GET` | `/news/all` | Ja | Ja | Alle News inkl. inaktive |
| `GET` | `/news/categories` | Ja | Nein | Kategorien-Liste |
| `POST` | `/news` | Ja | Ja | News erstellen |
| `PUT` | `/news/:id` | Ja | Ja | News aktualisieren |
| `DELETE` | `/news/:id` | Ja | Ja | News löschen |

### 10.14 Live-Infos

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/live-infos` | Ja | Nein | Aktive und nicht abgelaufene Ticker |
| `GET` | `/live-infos/all` | Ja | Ja | Alle Ticker-Einträge |
| `POST` | `/live-infos` | Ja | Ja | Ticker erstellen |
| `PUT` | `/live-infos/:id` | Ja | Ja | Ticker aktualisieren |
| `DELETE` | `/live-infos/:id` | Ja | Ja | Ticker löschen |

### 10.15 Content (CMS)

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/content` | Ja | Nein | CMS-Inhalte lesen |
| `POST` | `/content` | Ja | Ja | CMS-Inhalte überschreiben |

### 10.16 KI-Content

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/ki-content` | Ja | Nein | KI-Hub-Inhalte lesen |
| `POST` | `/ki-content` | Ja | Ja | KI-Hub-Inhalte überschreiben |

### 10.17 SCNAT-Infrastruktur

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/scnat-infra` | Ja | Nein | Gesamte Infrastruktur-Dokumentation |
| `POST` | `/scnat-infra/status` | Ja | Ja | Status-Sektion aktualisieren |
| `POST` | `/scnat-infra/entscheide/:id` | Ja | Ja | Entscheid aktualisieren |
| `PUT` | `/scnat-infra/backlog` | Ja | Ja | Backlog-Eintrag erstellen |
| `POST` | `/scnat-infra/backlog/:id` | Ja | Ja | Backlog-Eintrag aktualisieren |
| `DELETE` | `/scnat-infra/backlog/:id` | Ja | Ja | Backlog-Eintrag löschen |

### 10.18 Sichtbarkeit

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/visibility` | Nein | Nein | Sichtbarkeitsconfig lesen (öffentlich) |
| `PUT` | `/visibility` | Ja | Ja | Sichtbarkeitsconfig aktualisieren |

### 10.19 Benachrichtigungen

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/notifications/count` | Ja | Nein | Ungesehene Benachrichtigungen (eigene Requests/Changes) |
| `POST` | `/notifications/seen` | Ja | Nein | Benutzer-Benachrichtigungen als gesehen markieren |
| `GET` | `/notifications/admin` | Ja | Ja | Admin-Badge-Zähler (neue Events, Anträge, Changes, Themen) |
| `POST` | `/notifications/admin/seen` | Ja | Ja | Admin-Sektion als gesehen markieren |

### 10.20 Health Check

| Methode | Pfad | Auth | Admin | Beschreibung |
|---------|------|------|-------|-------------|
| `GET` | `/health` | Nein | Nein | `{ "status": "ok", "timestamp": "..." }` |

---

## 11. Querschnittsfunktionen

### 11.1 Theming (Dark / Light Mode)

- Zwei Themes: `dark` und `bright`
- Gespeichert in `localStorage` (Key: `theme-preference`)
- Toggle in der Sidebar (Portal) und im CP-Layout
- CSS-Klasse `theme-dark` / `theme-bright` auf `document.documentElement`
- Alle UI-Elemente verwenden CSS-Variablen (Tailwind-Konfiguration)

### 11.2 Benachrichtigungssystem

**Für Benutzer:**
- Badge auf dem Glocken-Icon in der Sidebar
- Zählt neue Status-Updates auf eigene Requests und Changes seit letztem Besuch
- Zählt ungelesene Inbox-Nachrichten
- Unterstützt PWA App Badge (`navigator.setAppBadge`) wenn verfügbar
- Polling-Intervall: 30 Sekunden

**Für Admins (CP):**
- Rote Badges an CP-Navigationseinträgen
- Zählt neue Einträge pro Sektion seit letztem Besuch dieser Sektion
- Sektionen: Events, Anträge, Changes, Themen
- Badge wird beim Navigieren zur jeweiligen Sektion zurückgesetzt

### 11.3 Globale Suche

- Tastenkürzel: `⌘K` (macOS) / `Ctrl+K` (Windows/Linux)
- Client-seitige Volltextsuche über einen vorgenerierten Such-Index
- Kein API-Call — alle Suchoperationen im Browser
- Suchergebnisse verlinken direkt auf die relevante Seite

### 11.4 Responsive Design

- Mobile-first Ansatz mit Tailwind CSS Breakpoints
- Sidebar wird auf Mobilgeräten als Overlay dargestellt
- Hamburger-Menü in der Top-Bar
- Alle Tabellen und Grids sind responsive

### 11.5 Animationen

- **Framer Motion**: Seitenübergänge, Aufklappeffekte, Einblendanimationen
- **CSS 3D**: Interaktive Cube-Darstellungen (Where-Seite, How-Built-Seite)
- **Flip Cards**: Strategie-Karten mit Umdreh-Animation
- **News-Ticker**: Horizontales Scroll-Banner

### 11.6 Wartungsseite

- Wird während Deployments automatisch aktiviert (via `deploy.sh`)
- Zeigt SCNAT-Logo mit Lade-Animation
- Auto-Reload: Prüft periodisch, ob die Anwendung wieder verfügbar ist
- Pfad: `public/maintenance.html`

### 11.7 Fehlerbehandlung

**Frontend:**
- Toast-Benachrichtigungen für Erfolg/Fehler-Meldungen (Radix UI Toast)
- Formular-Validierung mit Inline-Fehlermeldungen
- Loading-Spinner für asynchrone Operationen

**Backend:**
- Strukturiertes Fehlerformat: `{ "error": "..." }`
- Unterschiedliche Fehlermeldungen für Produktion (generisch deutsch) und Entwicklung (detailliert mit Stack Trace)
- HTTP-Status-Codes: 400 (Validierung), 401 (nicht authentifiziert), 403 (nicht autorisiert), 404 (nicht gefunden), 500 (Serverfehler)

---

## 12. Infrastruktur und Deployment

### 12.1 Server-Umgebung

| Eigenschaft | Wert |
|-------------|------|
| **Cloud-Provider** | Google Cloud Platform |
| **VM-Name** | `scnat-portal-new` |
| **Maschinentyp** | e2-small (0.5–2 vCPU, 2 GB RAM) |
| **Region** | us-east1-b |
| **Betriebssystem** | Ubuntu 22.04 LTS |
| **Statische IP** | Zugewiesen |
| **Swap** | 2 GB (erforderlich für Build-Prozess) |

### 12.2 Software-Stack auf dem Server

| Software | Zweck |
|----------|-------|
| **Nginx** | Reverse Proxy, SSL-Terminierung, statische Dateiauslieferung |
| **Node.js** | JavaScript-Runtime für Backend |
| **PM2** | Prozessmanager (Autostart, Monitoring, Restart) |
| **certbot** | SSL-Zertifikatsverwaltung (Let's Encrypt, Auto-Renew) |
| **Git** | Versionskontrolle und Deployment |

### 12.3 Deployment-Prozess

Der Deployment-Prozess ist vollautomatisiert über `deploy.sh`:

```
1. Wartungsseite aktivieren (Nginx-Config auf maintenance.html)
2. git pull origin main
3. npm install --prefer-offline
4. npm run build (Vite-Build, ~3–5 Minuten)
5. Produktions-Nginx-Config wiederherstellen
6. pm2 restart scnat-api
```

**Auslösung:** Manuell per SSH-Befehl nach Push auf `origin/main`.

### 12.4 Umgebungsvariablen

| Variable | Beschreibung |
|----------|-------------|
| `JWT_SECRET` | Geheimschlüssel für JWT-Signierung (mind. 32 Zeichen) |
| `CORS_ORIGIN` | Erlaubte Origins für CORS (kommagetrennt) |
| `COOKIE_SECURE` | `"true"` in Produktion (Secure-Flag für Cookies) |
| `PORT` | Server-Port (Standard: 3001) |
| `NODE_ENV` | `"production"` oder `"development"` |

---

## Anhang A — Vollständige Routenübersicht

### Frontend-Routen

| Pfad | Seite | Auth | Admin | Sichtbarkeit |
|------|-------|------|-------|-------------|
| `/login` | Login | Nein | Nein | — |
| `/` | Übersicht | Ja | Nein | `home` |
| `/strategie` | Strategie | Ja | Nein | `strategie` |
| `/handlungsfelder` | Handlungsfelder | Ja | Nein | `handlungsfelder` |
| `/massnahmen` | Massnahmen | Ja | Nein | `massnahmen` |
| `/sprints` | Sprints | Ja | Nein | `sprints` |
| `/systemlandschaft` | Software & Co | Ja | Nein | `systemlandschaft` |
| `/scnat-db` | SCNAT DB | Ja | Nein | `systemlandschaft` |
| `/ki-hub` | KI-Hub | Ja | Nein | `ki-hub` |
| `/schulungen` | Schulungen | Ja | Nein | `schulungen` |
| `/software-antraege` | Software-Anträge | Ja | Nein | `software-antraege` |
| `/meine-uebersicht` | Meine Übersicht | Ja | Nein | (immer sichtbar) |
| `/prozesse` | Prozesse | Ja | Nein | `prozesse` |
| `/team` | Team | Ja | Nein | `team` |
| `/faqs` | FAQs | Ja | Nein | `faqs` |
| `/glossar` | Glossar | Ja | Nein | `glossar` |
| `/where` | Where does it fit? | Ja | Nein | `cp-admin-stuff` |
| `/how-built` | How was this built? | Ja | Nein | `cp-admin-stuff` |
| `/cp` | CP Dashboard | Ja | Ja | `cp-dashboard` |
| `/cp/content` | CP Content | Ja | Ja | `cp-content` |
| `/cp/events` | CP Events | Ja | Ja | `cp-events` |
| `/cp/antraege` | CP Anträge | Ja | Ja | `cp-antraege` |
| `/cp/users` | CP Users | Ja | Ja | `cp-users` |
| `/cp/changes` | CP Changes | Ja | Ja | `cp-changes` |
| `/cp/massnahmen` | CP Massnahmen | Ja | Ja | `cp-massnahmen` |
| `/cp/sprints` | CP Sprints | Ja | Ja | `cp-sprints` |
| `/cp/sprints/:id` | CP Sprint-Editor | Ja | Ja | — |
| `/cp/themen` | CP Themen | Ja | Ja | `cp-themen` |
| `/cp/live-infos` | CP Live-Infos | Ja | Ja | `cp-live-infos` |
| `/cp/news` | CP News | Ja | Ja | `cp-news` |
| `/cp/nachrichten` | CP Nachrichten | Ja | Ja | `cp-nachrichten` |
| `/cp/scnat-db` | CP SCNAT DB | Ja | Ja | `cp-scnat-db` |
| `/cp/sichtbarkeit` | CP Sichtbarkeit | Ja | Ja | `cp-sichtbarkeit` |
| `/cp/admin-stuff` | CP Admin Stuff | Ja | Ja | `cp-admin-stuff` |
| `/cp/admin-stuff/:page` | CP Admin Stuff Detail | Ja | Ja | — |
| `/cp/admin-details` | CP Admin Details | Ja | Ja | `cp-admin-details` |
| `/cp/admin-details/:page` | CP Admin Details Detail | Ja | Ja | — |
| `*` | 404 Not Found | Ja | Nein | — |

---

## Anhang B — Datenbank-Schema (JSON)

Zusammenfassung aller 19 Datendateien:

| Datei | Typ | Anzahl Einträge | Primärschlüssel |
|-------|-----|-----------------|-----------------|
| `users.json` | Array | 5 | `id` |
| `massnahmen.json` | Array | 37 | `id` |
| `sprints.json` | Array | 5 | `id` |
| `changes.json` | Array | 5 | `id` |
| `requests.json` | Array | 5 | `id` |
| `events.json` | Array | 10 | `id` |
| `registrations.json` | Array | 1 | `id` |
| `schulungsthemen.json` | Array | 4 | `id` |
| `software.json` | Array | 10 | `id` |
| `software-votes.json` | Array | 24 | `softwareId` + `userId` (Komposit) |
| `inbox-messages.json` | Array | 1 | `id` |
| `user-groups.json` | Array | 0 | `id` |
| `news.json` | Array | 5 | `id` |
| `live-infos.json` | Array | 5 | `id` |
| `content.json` | Objekt | 97 Schlüssel | Schlüsselname |
| `ki-content.json` | Objekt | 5 Sektionen | Sektionsname |
| `scnat-infra.json` | Objekt | 5 Bereiche | Bereichsname |
| `visibility.json` | Objekt | 2 Arrays (13 + 15) | `key` pro Eintrag |
| `notifications-seen.json` | Objekt | Variabel | `userId` / `admin:userId` |

---

## Anhang C — Abhängigkeiten

### Produktions-Abhängigkeiten

| Paket | Version | Zweck |
|-------|---------|-------|
| `react` | ^18.3.1 | UI-Framework |
| `react-dom` | ^18.3.1 | React DOM-Rendering |
| `react-router-dom` | ^6.28.0 | Client-Side Routing |
| `express` | ^5.2.1 | Backend-Framework |
| `jsonwebtoken` | ^9.0.3 | JWT-Token-Generierung und -Validierung |
| `bcryptjs` | ^3.0.3 | Passwort-Hashing |
| `helmet` | ^8.1.0 | HTTP-Sicherheitsheader |
| `express-rate-limit` | ^8.3.2 | Rate Limiting |
| `cors` | ^2.8.6 | Cross-Origin Resource Sharing |
| `cookie-parser` | ^1.4.7 | Cookie-Parsing |
| `dotenv` | ^17.4.1 | Umgebungsvariablen |
| `@dnd-kit/core` | ^6.3.1 | Drag-and-Drop-Grundlage |
| `@dnd-kit/sortable` | ^10.0.0 | Sortierbare Listen |
| `@dnd-kit/utilities` | ^3.2.2 | dnd-kit Hilfsfunktionen |
| `@radix-ui/react-accordion` | ^1.2.2 | Akkordeon-Komponente |
| `@radix-ui/react-dialog` | ^1.1.4 | Dialog/Modal-Komponente |
| `@radix-ui/react-label` | ^2.1.1 | Label-Komponente |
| `@radix-ui/react-separator` | ^1.1.1 | Trennlinie |
| `@radix-ui/react-slot` | ^1.1.1 | Slot-Pattern |
| `@radix-ui/react-tabs` | ^1.1.2 | Tab-Komponente |
| `@radix-ui/react-tooltip` | ^1.1.6 | Tooltip-Komponente |
| `framer-motion` | ^11.15.0 | Animationen |
| `lucide-react` | ^0.468.0 | Icon-Bibliothek |
| `recharts` | ^3.8.1 | Charts und Diagramme |
| `class-variance-authority` | ^0.7.1 | CSS-Klassen-Varianten |
| `clsx` | ^2.1.1 | Bedingte CSS-Klassen |
| `tailwind-merge` | ^2.6.0 | Tailwind-Klassen zusammenführen |
| `tailwindcss-animate` | ^1.0.7 | CSS-Animationen für Tailwind |
| `concurrently` | ^9.2.1 | Parallele Skriptausführung |

### Entwicklungs-Abhängigkeiten

| Paket | Version | Zweck |
|-------|---------|-------|
| `vite` | ^6.0.5 | Build-Tool und Dev-Server |
| `@vitejs/plugin-react` | ^4.3.4 | React-Plugin für Vite |
| `tailwindcss` | ^3.4.16 | CSS-Framework |
| `postcss` | ^8.4.49 | CSS-Postprocessor |
| `autoprefixer` | ^10.4.20 | Browser-Prefix-Automatisierung |
| `nodemon` | ^3.1.14 | Hot-Reload für Backend-Entwicklung |

---

*Ende der Spezifikation*
