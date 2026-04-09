# SCNAT Digitalisierungsportal – Cursor Spec (Update v1.1)
**Ergänzungen gegenüber v1.0: Echte SoLiWebL-Daten + PM-Framework-Seite**

---

## ÄNDERUNGEN IN DIESER VERSION

1. `src/data/apps.ts` – Vollständige SoLiWebL-Liste (v1.4, 8. Mai 2025) ersetzt Platzhalter
2. `src/data/procurement.ts` – Neues Datenmodell für Beschaffungsprozess
3. `src/data/pmframework.ts` – Neues Datenmodell für PM-Framework
4. `src/pages/Procurement.tsx` – Seite erweitert: Beschaffung + PM-Framework als zwei Tabs
5. `src/components/modules/PMFramework/` – Neue Komponenten für Sprint-Zyklus-Visualisierung

---

## 1. Aktualisierte App-Daten (src/data/apps.ts)

```typescript
import type { LucideIcon } from 'lucide-react'

export type AppStatus = 'aktiv' | 'in-prüfung' | 'auslaufend' | 'geplant'
export type AppTier = 'lizenziert' | 'auf-einladung' | 'verboten'
export type AppCategory =
  | 'office'
  | 'kommunikation'
  | 'ki-produktivitaet'
  | 'finanzen-admin'
  | 'kreation-medien'
  | 'web-publishing'
  | 'it-infrastruktur'

export interface AppEntry {
  id: string
  name: string
  category: AppCategory
  tier: AppTier                   // lizenziert / auf-einladung / verboten
  status: AppStatus
  description: string
  details?: string                // Längere Beschreibung für Modal
  responsible?: string
  licenseInfo?: string
  dataPrivacy?: 'öffentlich' | 'intern' | 'vertraulich' | 'eingeschränkt'
  useCases?: string[]
  alternatives?: string[]         // Falls verboten oder eingeschränkt
  requiresRequest?: boolean       // Antrag nötig?
  installedOnAllDevices?: boolean
  externalUrl?: string
  notes?: string[]
}

// ─── TIER 1: LIZENZIERT ─────────────────────────────────────────────────────

export const licensedApps: AppEntry[] = [

  // OFFICE
  {
    id: 'ms-office',
    name: 'Microsoft Office (Word, Excel, PowerPoint)',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Office-Paket für Textverarbeitung, Tabellenkalkulation und Präsentationen.',
    details: 'Volume License 2019, Open-License. Auf allen Geräten der SCNAT installiert. MUSS mit dem TemplateServer verwendet werden für SCNAT-Word-Dokumente.',
    installedOnAllDevices: true,
    licenseInfo: 'Volume License 2019',
    dataPrivacy: 'intern',
    useCases: ['Dokumente erstellen', 'Tabellen & Auswertungen', 'Präsentationen'],
    notes: ['Zwingend mit TemplateServer verwenden für SCNAT-Dokumente'],
  },
  {
    id: 'templateserver',
    name: 'TemplateServer',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'SCNAT-eigene Vorlagensoftware. Pflicht für alle Word-Dokumente der SCNAT.',
    details: 'Selbst programmierte Software. Erstellt benutzerdefinierte Word-Vorlagen. Auf allen Geräten installiert.',
    installedOnAllDevices: true,
    licenseInfo: 'SCNAT-eigen',
    notes: ['Pflicht für SCNAT Word-Dokumente'],
  },
  {
    id: 'apple-office',
    name: 'Apple Office Suite (Pages, Numbers, Keynote)',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Apple-Alternative zu Microsoft Office. Auf Wunsch installierbar.',
    requiresRequest: true,
    installedOnAllDevices: false,
  },
  {
    id: 'bbedit',
    name: 'BBEdit',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Texteditor (kostenfreie Version). Auf allen Geräten installiert.',
    installedOnAllDevices: true,
    licenseInfo: 'Kostenfrei',
  },
  {
    id: 'ia-writer',
    name: 'iA Writer',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Markdown-Editor für fokussiertes Schreiben.',
    licenseInfo: 'Optional',
    requiresRequest: true,
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Markdown-Editor und persönliche Wissensdatenbank (Zettelkasten-Ansatz).',
    externalUrl: 'https://obsidian.md',
    licenseInfo: 'Kostenfrei für Einzelnutzer',
  },
  {
    id: 'alfred',
    name: 'Alfred App',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Hotkeys, Schnellsuche und Automatisierungen auf dem Mac.',
    externalUrl: 'https://www.alfredapp.com',
  },
  {
    id: 'magnet',
    name: 'Magnet App',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Fensterverwaltung auf dem Mac. Fenster auf verschiedenen Bildschirmen anordnen.',
  },
  {
    id: 'flycut',
    name: 'FlyCut',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Clipboard Manager für MacOS. Mehrere Zwischenablagen gleichzeitig verwalten.',
    externalUrl: 'https://apps.apple.com/de/app/flycut-clipboard-manager/id442160987',
  },
  {
    id: 'freemind',
    name: 'Freemind',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'OpenSource Mindmap-Software. Auf Wunsch installierbar.',
    licenseInfo: 'OpenSource / Kostenfrei',
    requiresRequest: true,
  },
  {
    id: 'diagrams',
    name: 'Diagrams',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Schemas, Prozesse und Workflows einfach visualisieren.',
    useCases: ['Prozessdiagramme', 'Flowcharts', 'Systemarchitektur'],
  },
  {
    id: 'omniplan',
    name: 'Omniplan',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Planungs- und Projektmanagement-Software.',
    useCases: ['Projektplanung', 'Gantt-Charts', 'Ressourcenplanung'],
  },
  {
    id: 'unarchiver',
    name: 'The Unarchiver',
    category: 'office',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Dekompression von über 30 Archivformaten (ZIP, RAR, 7z, etc.).',
    installedOnAllDevices: true,
  },
  {
    id: 'vlc',
    name: 'VLC',
    category: 'kreation-medien',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Universeller Video-Player. Erkennt und konvertiert viele Videoformate.',
    licenseInfo: 'OpenSource / Kostenfrei',
    installedOnAllDevices: true,
  },

  // KOMMUNIKATION
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Enterprise-Videokonferenzen mit Chat und Content-Sharing.',
    details: 'Auf allen Geräten installiert. Corporate Edu-Lizenzen im Namen der Akademien der Wissenschaften Schweiz. Unlizenzierte Nutzer: max. 40 min. Lizenzierte Nutzer: unbegrenzt, max. 300 Teilnehmer. Auch Webinar-Lizenzen verfügbar.',
    installedOnAllDevices: true,
    licenseInfo: 'Corporate Edu-Lizenz (Akademienverbund) · lizenziert & unlizenziert',
    useCases: ['Video-Meetings intern/extern', 'Webinare', 'Grossveranstaltungen'],
    dataPrivacy: 'intern',
  },
  {
    id: 'mitel-one',
    name: 'Mitel One',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'IP-Telefonie über Browser oder App. Server in Frankfurt (DE).',
    details: 'Telefonieren über Internet. Produkt des Telefonanlagen-Herstellers im HdA. Cloud-Link. Server Frankfurt, Deutschland.',
    dataPrivacy: 'intern',
    useCases: ['Telefonieren', 'Erreichbarkeit per App'],
  },
  {
    id: 'daylite',
    name: 'Daylite',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Kalender & Scheduler. Übersicht auf Kalender aller Mitarbeitenden.',
    details: 'Auf allen Geräten installiert. Könnte auch für Projekt- und Taskmanagement genutzt werden.',
    installedOnAllDevices: true,
    useCases: ['Kalender', 'Terminplanung', 'Ressourcenplanung', 'Basisaufgaben PM'],
    alternatives: ['Asana → NICHT erlaubt, Alternative ist Daylite'],
  },
  {
    id: 'mentimeter',
    name: 'Mentimeter',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Interaktive Präsentationen und Live-Umfragen.',
    useCases: ['Live-Umfragen', 'Interaktive Präsentationen', 'Workshops', 'Plenums'],
    externalUrl: 'https://mentimeter.com',
  },
  {
    id: 'mural',
    name: 'Mural.co',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Digitales Whiteboard für Online-Kollaboration und Workshops.',
    useCases: ['Brainstorming', 'Workshop-Moderation', 'Remote-Zusammenarbeit'],
    externalUrl: 'https://mural.co',
  },
  {
    id: 'remo',
    name: 'remo.cc',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Videoorientierter virtueller Arbeitsbereich für Remote-Teams.',
    externalUrl: 'https://remo.cc',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Professionelles Netzwerk für Geschäftskontakte und Stellenausschreibungen.',
    useCases: ['Networking', 'Stelleninserate', 'Organisationspräsenz'],
    dataPrivacy: 'öffentlich',
    notes: ['Microsoft-Eigentum, US-basiert'],
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Dezentrale Social-Media-Plattform. Öffentlich seit Feb 2024.',
    useCases: ['Social Media', 'Wissenschaftskommunikation'],
    dataPrivacy: 'öffentlich',
  },
  {
    id: 'directmailmac',
    name: 'DirectMail Mac',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Newsletter-Versand und personalisierte Massenmails.',
    useCases: ['Newsletter', 'Massenmails', 'Kampagnen'],
    dataPrivacy: 'vertraulich',
  },
  {
    id: 'framadate',
    name: 'Framadate',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Datenschutzkonforme Terminplanung (Alternative zu Doodle). Primär Französisch.',
    externalUrl: 'https://framadate.org',
    alternatives: ['Doodle → Datenschutzprobleme, nicht selber verwenden'],
    licenseInfo: 'Kostenfrei / Open Source',
  },
  {
    id: 'nuudel',
    name: 'Nuudel',
    category: 'kommunikation',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Datenschutzkonforme Terminplanung (Alternative zu Doodle). Deutsch.',
    externalUrl: 'https://nuudel.digitalcourage.de',
    alternatives: ['Doodle → Datenschutzprobleme'],
    licenseInfo: 'Kostenfrei / Open Source',
  },

  // KI & PRODUKTIVITÄT
  {
    id: 'chatgpt',
    name: 'ChatGPT (Business Team)',
    category: 'ki-produktivitaet',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Offiziell lizenzierter KI-Chatbot. Kein Training mit SCNAT-Daten.',
    details: 'SCNAT hat ein Business Team Abo für Mitarbeitende. Wichtig: KI-Regelwerk SCNAT einhalten. Keine vertraulichen Daten eingeben. Kein Training mit Eingaben.',
    licenseInfo: 'Business Team Abo · OpenAI (USA)',
    dataPrivacy: 'öffentlich',
    useCases: ['Textentwürfe', 'Zusammenfassungen', 'Übersetzung', 'Recherche', 'Code-Hilfe'],
    notes: [
      '✓ OFFIZIELL FREIGEGEBEN',
      'Keine Personendaten eingeben',
      'Keine internen Berichte, Protokolle, Finanzdaten, Forschungsdaten',
      'KI-Rahmen SCNAT (GL März 2025) einhalten',
    ],
  },
  {
    id: 'deepl',
    name: 'DeepL (Translate + Write)',
    category: 'ki-produktivitaet',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Hochqualitative KI-Übersetzung und Schreibhilfe. 15 Lizenzen. EU-Anbieter.',
    details: 'Übersetzungs-Software aus Deutschland. 15 Lizenzen in der SCNAT verteilt. Neben DeepL Translate steht auch DeepL Write zur Verfügung.',
    licenseInfo: '15 Lizenzen · DeepL (Deutschland / EU)',
    dataPrivacy: 'intern',
    useCases: ['Texte übersetzen', 'Schreibstil verbessern', 'Mehrsprachige Dokumente'],
    notes: ['EU-Anbieter, bessere Datenschutzlage als US-Alternativen'],
  },
  {
    id: 'flowit',
    name: 'FLOWIT',
    category: 'ki-produktivitaet',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'KI-gestützte Lernplattform. MEG wird über FLOWIT abgewickelt.',
    details: 'Umfassende Lernmodule für Mitarbeitende. KI analysiert Lernfortschritt und gibt Empfehlungen. Feedback-Prozesse direkt im Arbeitsalltag integriert.',
    useCases: ['Mitarbeitendengespräche (MEG)', 'Weiterbildung', 'Feedback'],
  },

  // FINANZEN & ADMIN
  {
    id: 'abacus',
    name: 'Abacus / Abaclient',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'ERP: Rechnungsvisierung (Abaclient) und Stundenerfassung (Web-GUI).',
    dataPrivacy: 'vertraulich',
    useCases: ['Rechnungen visieren', 'Stundenerfassung'],
  },
  {
    id: 'profinance',
    name: 'Profinance',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'auslaufend',
    description: 'Legacy-Software für ERP und Stundenerfassung. Nur noch Finanzdienst.',
    dataPrivacy: 'vertraulich',
    notes: ['Wird noch vom Finanzdienst genutzt, langfristig ablösend'],
  },
  {
    id: 'filemaker',
    name: 'Filemaker Pro',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Datenbank-Software. Personendatenbanken und Budgettool der SCNAT.',
    dataPrivacy: 'vertraulich',
    useCases: ['Personendatenbanken (bis Ende PPO)', 'Budgettool'],
  },
  {
    id: 'jobportal',
    name: 'Bewerbermanagement (Abacus)',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Digitales Bewerbermanagement. Datenschutzkonform, Zugriffregelungen.',
    externalUrl: 'https://app.jobportal.abaservices.ch',
    dataPrivacy: 'vertraulich',
    useCases: ['Stellenausschreibungen', 'Bewerbungsmanagement', 'Auswahlprozesse'],
  },
  {
    id: 'flexopus',
    name: 'Flexopus',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Verwaltung von Shared Desks im HdA und der SCNAT.',
    useCases: ['Desk-Buchung', 'Raumplanung'],
  },
  {
    id: 'wizehive',
    name: 'Wizehive',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'in-prüfung',
    description: 'Verwaltung von Projektanträgen, Bewertungen und Auszahlungen.',
    details: 'Testweise eingesetzt für SwissCollNet. Lifecycle-Management von Projektunterstützungsbeiträgen.',
    useCases: ['Projektanträge', 'Förderabwicklung', 'Bewertungsprozesse'],
  },
  {
    id: 'mendeley',
    name: 'Mendeley',
    category: 'finanzen-admin',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Literaturverwaltung und Bibliographien für wissenschaftliche Artikel.',
    useCases: ['Forschungsarbeiten verwalten', 'Bibliographien erstellen', 'Literatur teilen'],
    dataPrivacy: 'intern',
  },

  // KREATION & MEDIEN
  {
    id: 'adobe-acrobat-dc',
    name: 'Adobe Acrobat DC',
    category: 'kreation-medien',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'PDF erstellen, bearbeiten und signieren. Per Nutzer lizenziert, Antrag nötig.',
    licenseInfo: 'Pro Nutzer · Antrag über Vorgesetzten und Bereichsleitung',
    requiresRequest: true,
    notes: ['Alternative: Vorschau (MacOS) ist kostenlos und deckt viele Funktionen ab'],
    alternatives: ['Vorschau (MacOS) → kostenlos, viele Funktionen'],
  },
  {
    id: 'adobe-reader',
    name: 'Adobe Acrobat Reader DC',
    category: 'kreation-medien',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'PDF betrachten. Kostenfrei, auf Wunsch installierbar.',
    licenseInfo: 'Kostenfrei',
    requiresRequest: true,
  },
  {
    id: 'adobe-cc',
    name: 'Adobe Creative Cloud (alle Produkte)',
    category: 'kreation-medien',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Vollständige Adobe Suite: Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, etc.',
    details: 'Sämtliche Adobe-Software enthalten. Kostenpflichtig, pro Nutzer. Vor Verwendung: Abstimmung mit Kommunikation + Antrag Vorgesetzter/Bereichsleitung.',
    licenseInfo: 'Per Nutzer · Abstimmung mit Kommunikation nötig',
    requiresRequest: true,
    useCases: ['Print-Design', 'Video-Produktion', 'Web-Design', 'Fotografie', 'Illustrationen'],
  },
  {
    id: 'imovie',
    name: 'iMovie',
    category: 'kreation-medien',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Video-Bearbeitungs-Software von Apple.',
    licenseInfo: 'Kostenfrei (Apple)',
  },

  // WEB & PUBLISHING
  {
    id: 'scnat-webshop',
    name: 'SCNAT Webshop',
    category: 'web-publishing',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Online-Verkauf und Ticketing für kostenpflichtige Veranstaltungen.',
    useCases: ['Veranstaltungstickets', 'Publikationsverkauf', 'Online-Bezahlung'],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'web-publishing',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Video-Plattform der SCNAT-Webportale.',
    dataPrivacy: 'öffentlich',
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    category: 'web-publishing',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Video-Plattform (Alternative zu YouTube, höhere Qualität).',
    dataPrivacy: 'öffentlich',
  },
  {
    id: 'online2pdf',
    name: 'online2pdf.com',
    category: 'web-publishing',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Online PDF-Converter. Links werden korrekt dargestellt.',
    externalUrl: 'https://online2pdf.com',
    dataPrivacy: 'öffentlich',
    notes: ['⚠️ KEINE vertraulichen oder geheimen Dokumente verwenden!'],
  },

  // IT & INFRASTRUKTUR
  {
    id: 'macos',
    name: 'MacOS (inkl. Safari, Mail, Vorschau)',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Betriebssystem auf allen SCNAT-Geräten inkl. integrierter Apple-Apps.',
    installedOnAllDevices: true,
    useCases: ['Betriebssystem', 'E-Mail (Mail.app)', 'Browser (Safari)', 'PDF bearbeiten (Vorschau)'],
  },
  {
    id: 'firefox',
    name: 'Firefox',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Browser (Mozilla, Open Source).',
    licenseInfo: 'Kostenfrei / Open Source',
  },
  {
    id: 'chrome',
    name: 'Google Chrome',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Browser (Google).',
  },
  {
    id: 'forti-client',
    name: 'Forti Client (VPN)',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'VPN-Verbindung ins Haus der Akademien (HdA).',
    useCases: ['Remote-Zugriff auf SCNAT-Server'],
  },
  {
    id: 'retrospect',
    name: 'Retrospect (Client & Server)',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Backup-Lösung (Client und Server).',
    responsible: 'IT',
  },
  {
    id: 'teamviewer',
    name: 'Teamviewer (IT-Support)',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Remote-Support durch IT SCNAT. Gesicherte Version, nur IT-Zugriff.',
    notes: [
      'Nur IT SCNAT darf sich remote verbinden',
      'Weitere Verwendung muss individuell mit IT geklärt werden',
    ],
    responsible: 'IT (Stef Schmidlin)',
  },
  {
    id: 'adblock',
    name: 'AdBlock Plus',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Werbeblocker als Browser-Extension (Firefox, Chrome).',
    licenseInfo: 'Kostenfrei',
  },
  {
    id: 'jira',
    name: 'Jira Service Management',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Service Desk / Ticketsystem. Meldungen, Anfragen, SLAs.',
    details: 'Atlassian (Australien). Vor Nov 2020: Jira Service Desk. IT Service Portal, Wissensdatenbank, Call-Routing, SLA-Zeiten.',
    responsible: 'IT (Stef Schmidlin)',
    useCases: ['IT-Tickets', 'Support-Anfragen', 'Incident Management'],
  },
  {
    id: 'confluence',
    name: 'Atlassian Confluence',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Dokumentations- und Wissensplattform. Primär für IT.',
    details: 'Atlassian (Australien). IT End-User-Support-Dokumentation und Knowledge Base.',
    responsible: 'IT',
    useCases: ['IT-Dokumentation', 'Knowledge Base', 'Weitere Bereiche möglich'],
  },
  {
    id: 'getfilepath',
    name: 'getFilePathToWebLink',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'SCNAT-eigene Software. Erstellt Links zu Dateien/Ordnern auf Dateiservern.',
    licenseInfo: 'SCNAT-eigen',
    useCases: ['Datei-Links für E-Mails', 'Verlinkung auf Server-Ablage'],
  },
  {
    id: 'tnef',
    name: "TNEF's Enough",
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Öffnet winmail.dat-Anhänge von Microsoft Exchange/Outlook auf dem Mac.',
    installedOnAllDevices: true,
  },
  {
    id: 'displaymenu',
    name: 'DisplayMenu',
    category: 'it-infrastruktur',
    tier: 'lizenziert',
    status: 'aktiv',
    description: 'Monitor-Auflösungs-Software. Primär im Serverbereich.',
    responsible: 'IT',
  },
]

// ─── TIER 2: AUF EINLADUNG (keine eigene Lizenz) ────────────────────────────

export const invitationOnlyApps: AppEntry[] = [
  {
    id: 'wetransfer',
    name: 'WeTransfer',
    category: 'it-infrastruktur',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Dateiübertragung. Nicht proaktiv verwenden – SCNAT hat eigene Server.',
    alternatives: ['SCNAT-eigene Server (Dateiübertragung mit/ohne Passwort, zeitbegrenzt)'],
    notes: ['Datenschutz, Privacy, Backup-Relevanz sind Gründe gegen eigenständige Nutzung'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'it-infrastruktur',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Filehosting. Nur auf Einladung. SCNAT hat eigene Cloud-Services.',
    alternatives: ['SCNAT Cloud Services (IT kontaktieren)'],
    notes: ['US-Datenschutz, Privacy-Bedenken'],
  },
  {
    id: 'ms-teams',
    name: 'Microsoft Teams',
    category: 'kommunikation',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Kein SCNAT-Abo. Nur als Gast an externen Meetings teilnehmen.',
    installedOnAllDevices: true,
    notes: ['SCNAT hat KEINE Teams-Lizenz. Nur Meetingteilnahme auf Einladung.'],
  },
  {
    id: 'webex',
    name: 'Cisco Webex',
    category: 'kommunikation',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Videokonferenzen. Nur auf Einladung, keine SCNAT-Lizenz.',
    installedOnAllDevices: true,
  },
  {
    id: 'skype',
    name: 'Skype / Skype for Business',
    category: 'kommunikation',
    tier: 'auf-einladung',
    status: 'auslaufend',
    description: 'Veraltet. Nur Meetingteilnahme auf Einladung, keine SCNAT-Lizenz.',
    installedOnAllDevices: true,
  },
  {
    id: 'gotomeeting',
    name: 'GoToMeeting',
    category: 'kommunikation',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Videokonferenzen. Keine SCNAT-Lizenzen mehr. Nur Teilnahme.',
    installedOnAllDevices: true,
  },
  {
    id: 'doodle',
    name: 'Doodle',
    category: 'kommunikation',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Terminplanung. Datenschutzprobleme – nicht selbst erstellen. Teilnahme ok.',
    alternatives: ['Framadate (SCNAT-Alternative)', 'Nuudel (SCNAT-Alternative)'],
    notes: [
      '⚠️ Datenschutzprobleme: Daten gehen an Google (USA)',
      'Anwaltskanzlei: Im Business-Kontext nicht verwenden',
      'Nur an externen Doodle-Umfragen teilnehmen, nicht selbst erstellen',
    ],
  },
  {
    id: 'google-suite',
    name: 'Google Docs / Drive / Forms / Cloud',
    category: 'it-infrastruktur',
    tier: 'auf-einladung',
    status: 'aktiv',
    description: 'Nur auf Einladung. SCNAT bietet eigene Cloud-Services. IT kontaktieren.',
    alternatives: ['SCNAT Cloud Services (IT für Anforderungen kontaktieren)'],
  },
  {
    id: 'x-twitter',
    name: 'X (ehemals Twitter)',
    category: 'kommunikation',
    tier: 'auf-einladung',
    status: 'auslaufend',
    description: 'Wird in der SCNAT nicht mehr aktiv genutzt.',
    notes: ['Abgelöst durch Bluesky'],
  },
]

// ─── TIER 3: VERBOTEN ───────────────────────────────────────────────────────

export const forbiddenApps: AppEntry[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'kommunikation',
    tier: 'verboten',
    status: 'aktiv',
    description: 'Nicht für SCNAT verwenden. Keine Alternative vorgesehen.',
  },
  {
    id: 'sharepoint',
    name: 'SharePoint / OneDrive / Exchange / Outlook',
    category: 'it-infrastruktur',
    tier: 'verboten',
    status: 'aktiv',
    description: 'Microsoft Cloud-Dienste werden in der SCNAT nicht eingesetzt.',
    alternatives: ['SCNAT Mail Services', 'SCNAT Cloud Services', 'Mail.app (statt Outlook)'],
    notes: ['IT für SCNAT-eigene Alternativen kontaktieren'],
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'office',
    tier: 'verboten',
    status: 'aktiv',
    description: 'Projektmanagement. Nicht erlaubt.',
    alternatives: ['Daylite (grundlegendes PM)'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'kommunikation',
    tier: 'verboten',
    status: 'aktiv',
    description: 'Nicht für SCNAT-Zwecke. Private Nutzung via web.whatsapp.com möglich.',
  },
  {
    id: 'thunderbird',
    name: 'Thunderbird',
    category: 'it-infrastruktur',
    tier: 'verboten',
    status: 'aktiv',
    description: 'Nicht für SCNAT-E-Mail-Zugriff.',
    alternatives: ['Mail.app (Apple, auf allen Geräten installiert)'],
  },
]

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  office:              'Büro & Office',
  kommunikation:       'Kommunikation & Video',
  'ki-produktivitaet': 'KI & Produktivität',
  'finanzen-admin':    'Finanzen & Admin',
  'kreation-medien':   'Kreation & Medien',
  'web-publishing':    'Web & Publishing',
  'it-infrastruktur':  'IT & Infrastruktur',
}

export const TIER_LABELS: Record<AppTier, string> = {
  'lizenziert':     '✓ Lizenziert',
  'auf-einladung':  '~ Nur auf Einladung',
  'verboten':       '✕ Nicht erlaubt',
}

export const TIER_COLORS: Record<AppTier, string> = {
  'lizenziert':     'bg-green-100 text-green-800',
  'auf-einladung':  'bg-yellow-100 text-yellow-800',
  'verboten':       'bg-red-100 text-red-800',
}
```

---

## 2. Neues Datenmodell: PM-Framework (src/data/pmframework.ts)

```typescript
export interface SprintPhase {
  id: string
  title: string
  subtitle: string
  duration: string
  color: string           // HEX Hintergrundfarbe (aus Screenshot übernehmen)
  participants: string[]
  activities: string[]
  output?: string
  isOptional?: boolean
  position?: 'main' | 'side'   // side = Stakeholder-Box
}

export const sprintPhases: SprintPhase[] = [
  {
    id: 'quarterly',
    title: 'Quartals-Strategie',
    subtitle: 'Steering Committee · alle 3 Monate',
    duration: '60 min',
    color: '#4A5568',  // Anthrazit
    participants: ['Geschäftsleitung', 'Verantwortlicher Digitalisierung'],
    activities: [
      'Rückblick: Was wurde geliefert?',
      'Priorisierung Themen-Cluster nächstes Quartal',
      'Budget- und Ressourcenentscheide',
      'Kurskorrektur basierend auf Ergebnissen',
    ],
    output: 'Priorisierter Cluster-Plan + Entscheidungslog + GL-Kommunikation',
    position: 'main',
  },
  {
    id: 'sprint-planning',
    title: 'Sprint Planning',
    subtitle: 'Woche 1 · 90 min · Verantw. + Owner',
    duration: '90 min',
    color: '#2B6CB0',  // Blau
    participants: ['Verantwortlicher Digitalisierung', 'Themen-Owner'],
    activities: [
      'Sprint-Ziel in einem Satz formulieren',
      'Deliverables konkret festlegen (Ergebnisse, nicht Aktivitäten)',
      'Aufgaben im Board erfassen + Verantwortung zuweisen',
      'Abhängigkeiten klären',
      'Risiken benennen',
    ],
    output: 'Befülltes Sprint Board mit Ziel, Tasks, Owners und Deadline',
    position: 'main',
  },
  {
    id: 'weekly',
    title: 'Wöchentl. Check-in',
    subtitle: 'W1–3 · 30 min · Blocker lösen',
    duration: '30 min',
    color: '#276749',  // Grün
    participants: ['Verantwortlicher Digitalisierung', 'Themen-Owner'],
    activities: [
      'Was ist seit letzter Woche erledigt?',
      'Was ist blockiert – was braucht es zum Entblocken?',
      'Was braucht einen Entscheid, der nicht auf Owner-Ebene lösbar ist?',
    ],
    output: 'Board live aktualisiert, Blocker gelöst oder eskaliert',
    position: 'main',
  },
  {
    id: 'stakeholder',
    title: 'Stakeholder Touchpoint',
    subtitle: 'Woche 3 · 20 min · optional',
    duration: '20 min',
    color: '#744210',  // Braun/Orange
    participants: ['Verantwortlicher Digitalisierung', 'Abteilungsleitung'],
    activities: [
      'Frühes Feedback der Abteilung einholen',
      'Offene Fragen klären (Sprint-Abschluss relevant)',
      'Kein Reporting – reines Arbeitstreffen',
    ],
    isOptional: true,
    position: 'side',
  },
  {
    id: 'review-retro',
    title: 'Sprint Review + Retro',
    subtitle: 'Woche 4 · 60 min · Verantw. + Owner',
    duration: '60 min',
    color: '#553C9A',  // Violett
    participants: ['Verantwortlicher Digitalisierung', 'Themen-Owner', 'GL (wenn strategisch relevant)'],
    activities: [
      'Review (35 min): Was geliefert? Demo. Was offen?',
      'Retro (25 min): Was gut? Was ändern?',
      '1 dokumentierter Lernpunkt für nächsten Sprint',
    ],
    output: 'Sprint-Summary (1 Seite): geliefert, offen, nächster Sprint',
    position: 'main',
  },
  {
    id: 'kommunikation',
    title: 'Kommunikation',
    subtitle: 'nach Review · Change-Moment',
    duration: 'variabel',
    color: '#9B2C2C',  // Dunkelrot
    participants: ['Verantwortlicher Digitalisierung', 'Themen-Owner'],
    activities: [
      'Erst intern abschliessen, DANN nach aussen kommunizieren',
      'Was wurde eingeführt/geändert – konkret',
      'Was ändert sich für wen (nach Rolle/Abteilung)',
      'Ab wann gilt die Änderung',
      'Wo gibt es Unterstützung: Ansprechperson, Doku, Schulung',
    ],
    position: 'main',
  },
]

export interface ThemeCluster {
  id: string
  name: string
  icon: string
  owner?: string
}

export const themeClusters: ThemeCluster[] = [
  { id: 'infrastruktur', name: 'Infrastruktur & IT', icon: 'Server' },
  { id: 'datenstrategie', name: 'Datenstrategie', icon: 'Database' },
  { id: 'prozess', name: 'Prozessdigitalisierung', icon: 'Workflow' },
  { id: 'kollaboration', name: 'Kommunikation & Kollaboration', icon: 'MessageSquare' },
  { id: 'skills', name: 'Skills & Change', icon: 'Users' },
  { id: 'compliance', name: 'Compliance', icon: 'Shield' },
]

export const pmPrinciples = [
  {
    title: 'Kein Big Bang',
    description: 'Immer in kleinen, testbaren Schritten. Nichts ausrollen, was nicht pilotiert wurde.',
    icon: 'Layers',
  },
  {
    title: 'People before Tools',
    description: 'Change-Readiness zuerst prüfen, dann Tool einführen. Wer das umdreht, bekommt ein Tool, das niemand nutzt.',
    icon: 'Users',
  },
  {
    title: 'Transparenz als Kultur',
    description: 'Status ist jederzeit sichtbar. Das Board ist das einzige lebende Dokument.',
    icon: 'Eye',
  },
  {
    title: 'Entscheide dokumentieren',
    description: 'Was entschieden wurde, von wem, wann und warum. Kein Rätseln später.',
    icon: 'FileText',
  },
]

export const changeReadinessChecklist = [
  'Wer ist betroffen? (Abteilung, Rolle, Anzahl Personen)',
  'Was ändert sich konkret? (Workflow, Tool, Verantwortung)',
  'Wieviel Widerstand ist realistisch? (niedrig / mittel / hoch – ehrlich einschätzen)',
  'Wer ist der Change Agent in der Abteilung?',
  'Wann und wie kommunizieren wir? (Timing festlegen)',
  'Was brauchen die Leute? (Training, Dokumentation, Begleitung)',
]
```

---

## 3. Procurement-Seite erweitert (src/pages/Procurement.tsx)

Die Seite erhält zwei Tabs:

```tsx
// Tab 1: Software beschaffen (bestehender Stepper + Formular)
// Tab 2: PM-Framework (neuer interaktiver Bereich)

const tabs = [
  { id: 'beschaffung', label: 'Software beschaffen', icon: 'ShoppingCart' },
  { id: 'pm-framework', label: 'PM-Framework', icon: 'GitBranch' },
]
```

---

## 4. SprintCycleViz Komponente (src/components/modules/PMFramework/SprintCycleViz.tsx)

```tsx
// Visuelle Darstellung exakt wie im Screenshot:
// - Vertikale Kaskade von Phasen-Boxen
// - Stakeholder-Box seitlich mit gestrichelter Linie
// - Rückpfeil "nächster Sprint" links
// - Farben aus sprintPhases Daten
// - Hover: Box hebt sich, Detail-Panel erscheint rechts

// Implementierung: SVG-basierte Linien + absolute positionierte Boxen
// oder: Flexbox mit border-left als Verbindungslinie

// Interaktion:
// - Klick auf Phase → Accordion klappt auf mit Activities + Output
// - Hover → Tooltip mit Dauer und Teilnehmern

// Footer-Text: "max. 2–3 aktive Sprints parallel · je Themen-Cluster"
```

---

## 5. Angepasste FAQ-Ergänzungen

```typescript
// Neue FAQs ergänzen:
{
  category: 'PM & Prozesse',
  question: 'Was ist ein Sprint im Digitalisierungsprojekt?',
  answer: '4-Wochen-Zyklus mit konkreten Deliverables für einen Themen-Cluster. Schritte: Planning → Weekly Check-ins → Review + Retro → Kommunikation. Max. 2–3 Sprints laufen gleichzeitig.',
},
{
  category: 'PM & Prozesse',
  question: 'Was ist das Steering Committee?',
  answer: 'Quartalsmeeting der Geschäftsleitung mit dem Verantwortlichen Digitalisierung. 60 Minuten, alle 3 Monate. Entscheide zu Prioritäten, Budget und Kurskorrektur.',
},
{
  category: 'PM & Prozesse',
  question: 'Was ist ein Themen-Owner?',
  answer: 'Person aus der Fachseite, die einen Themen-Cluster (z.B. Datenstrategie) verantwortet. Bereitet Sprints vor, koordiniert Aufgaben, berichtet Status. Aufwand: ca. 3–5 Stunden pro Woche.',
},
```

---

## 6. Wichtige Korrekturen gegenüber v1.0

| Punkt | Alt (v1.0) | Korrekt (v1.1) |
|---|---|---|
| Microsoft Teams | Als "aktiv lizenziert" geführt | Nur auf Einladung, KEINE SCNAT-Lizenz |
| SharePoint / OneDrive | Als "aktiv" geführt | Explizit VERBOTEN |
| Outlook | Als Kommunikationstool geführt | VERBOTEN, Alternative: Mail.app |
| Primäre Kollaborationstools | Teams/SharePoint | Zoom + Daylite + Mural + eigene SCNAT-Server |
| Silvans Titel | "CTO" | "Verantwortlicher Digitalisierung" |
| Neue Tools | Fehlten | FLOWIT, Jira, Confluence, Bluesky, LinkedIn, Flexopus, Wizehive, Mitel One, Teamviewer, etc. |