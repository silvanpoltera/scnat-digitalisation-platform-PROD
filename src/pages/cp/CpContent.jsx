import { useState, useEffect } from 'react';
import { Save, ChevronDown, Globe, FileText, Mail, Brain, Monitor, Users, Calendar, BarChart3, Database, Settings, Megaphone, BookOpen, HelpCircle, Search } from 'lucide-react';

const SECTIONS = [
  {
    key: 'hero',
    label: 'Startseite – Hero & Einstieg',
    icon: Globe,
    fields: [
      { key: 'hero_title', label: 'Hero-Titel', type: 'text', placeholder: 'z.B. Digitalisierung vereinfacht.' },
      { key: 'hero_subtitle', label: 'Hero-Untertitel', type: 'textarea', placeholder: 'Beschreibung unter dem Hero-Titel' },
      { key: 'uebersicht', label: 'Einleitungstext Übersicht', type: 'textarea', placeholder: 'Text für die Übersichtsseite' },
      { key: 'uebersicht_cta', label: 'Call-to-Action Button', type: 'text', placeholder: 'z.B. Los gehts!' },
    ],
  },
  {
    key: 'news',
    label: 'News-Ticker & Ankündigungen',
    icon: Megaphone,
    fields: [
      { key: 'news_1', label: 'News-Eintrag 1', type: 'text', placeholder: 'Aktuelle News-Meldung...' },
      { key: 'news_2', label: 'News-Eintrag 2', type: 'text', placeholder: 'Zweite News-Meldung...' },
      { key: 'news_3', label: 'News-Eintrag 3', type: 'text', placeholder: 'Dritte News-Meldung...' },
      { key: 'news_4', label: 'News-Eintrag 4', type: 'text', placeholder: 'Vierte News-Meldung...' },
      { key: 'news_highlight', label: 'Highlight-Badge (optional)', type: 'text', placeholder: 'z.B. NEU, UPDATE, WICHTIG' },
    ],
  },
  {
    key: 'strategie',
    label: 'Strategie',
    icon: FileText,
    fields: [
      { key: 'strategie_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Digitalisierungsstrategie' },
      { key: 'strategie_version', label: 'Version', type: 'text', placeholder: 'z.B. Version 1.0 · 2025' },
      { key: 'strategie_status', label: 'Status', type: 'text', placeholder: 'z.B. GL-verabschiedet' },
      { key: 'strategie_vision', label: 'Vision Statement', type: 'textarea', placeholder: 'Wo will die SCNAT hin?' },
      { key: 'strategie_ziele', label: 'Strategische Ziele (kommasepariert)', type: 'textarea', placeholder: 'Ziel 1, Ziel 2, Ziel 3...' },
      { key: 'strategie_dokument_link', label: 'Link zum Strategie-Dokument', type: 'text', placeholder: 'URL zum PDF oder Sharepoint' },
    ],
  },
  {
    key: 'handlungsfelder',
    label: 'Handlungsfelder',
    icon: BarChart3,
    fields: [
      { key: 'hf_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Erklärung zu den Handlungsfeldern' },
      { key: 'hf_kultur', label: 'Digitale Kultur & Befähigung', type: 'textarea', placeholder: 'Beschreibung dieses Handlungsfelds' },
      { key: 'hf_infrastruktur', label: 'Infrastruktur & Beschaffung', type: 'textarea', placeholder: 'Beschreibung...' },
      { key: 'hf_kommunikation', label: 'Kommunikation & Transparenz', type: 'textarea', placeholder: 'Beschreibung...' },
      { key: 'hf_prozesse', label: 'Prozesse & Methoden', type: 'textarea', placeholder: 'Beschreibung...' },
      { key: 'hf_steuerung', label: 'Strategie & Steuerung', type: 'textarea', placeholder: 'Beschreibung...' },
      { key: 'hf_daten', label: 'Daten & Wissen', type: 'textarea', placeholder: 'Beschreibung...' },
      { key: 'hf_timeline_hinweis', label: 'Timeline-Hinweis', type: 'text', placeholder: 'z.B. Stand April 2026' },
    ],
  },
  {
    key: 'massnahmen',
    label: 'Massnahmen',
    icon: BarChart3,
    fields: [
      { key: 'massnahmen', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Massnahmen-Seite' },
      { key: 'massnahmen_start5_text', label: '«Start mit 5» Erklärung', type: 'textarea', placeholder: 'Agiler Ansatz erklären' },
      { key: 'massnahmen_change_hinweis', label: 'Change-Vorschlags Hinweis', type: 'textarea', placeholder: 'Text der erklärt wie neue Massnahmen eingereicht werden' },
      { key: 'massnahmen_tags', label: 'Verfügbare Tags (kommasepariert)', type: 'text', placeholder: 'Schulungen, Befähigungen, Beschaffung...' },
    ],
  },
  {
    key: 'software',
    label: 'Software & Co',
    icon: Monitor,
    fields: [
      { key: 'software', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Software-Seite' },
      { key: 'software_antrag_hinweis', label: 'Antrags-Hinweis', type: 'textarea', placeholder: 'Hinweis für Softwareanträge' },
      { key: 'software_kategorien', label: 'Kategorien (kommasepariert)', type: 'text', placeholder: 'Produktivität, Kommunikation, Sicherheit...' },
      { key: 'software_beschaffung_link', label: 'Link zum Beschaffungsprozess', type: 'text', placeholder: '/prozesse oder externe URL' },
      { key: 'software_radar_erklaerung', label: 'Radar-Chart Erklärung', type: 'textarea', placeholder: 'Was zeigt die Spinnengrafik?' },
    ],
  },
  {
    key: 'ki',
    label: 'KI-Hub',
    icon: Brain,
    fields: [
      { key: 'ki_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zum KI-Hub' },
      { key: 'ki_tools_intro', label: 'Tools & Einsatz — Intro', type: 'textarea', placeholder: 'Einleitung zum Tools-Tab' },
      { key: 'ki_chatgpt_intro', label: 'ChatGPT nutzen — Intro', type: 'textarea', placeholder: 'Einleitung zum ChatGPT-Tab' },
      { key: 'ki_profis_intro', label: 'KI für Profis — Intro', type: 'textarea', placeholder: 'Einleitung zum Profis-Tab' },
      { key: 'ki_rahmen_link', label: 'Link KI-Rahmen (PDF)', type: 'text', placeholder: 'URL zum KI-Rahmen PDF' },
      { key: 'ki_guidelines_text', label: 'KI-Nutzungsrichtlinien', type: 'textarea', placeholder: 'Was bei der Nutzung von KI-Tools zu beachten ist' },
      { key: 'ki_sicherheit_text', label: 'Sicherheitshinweise KI', type: 'textarea', placeholder: 'Datenschutz und Vertraulichkeit bei KI-Nutzung' },
      { key: 'ki_kontakt', label: 'Kontakt für KI-Fragen', type: 'text', placeholder: 'z.B. david.jezdimirovic@scnat.ch' },
    ],
  },
  {
    key: 'schulungen',
    label: 'Schulungen & Events',
    icon: Calendar,
    fields: [
      { key: 'schulungen', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Schulungen-Seite' },
      { key: 'schulungen_kontakt', label: 'Kontakt für Schulungen', type: 'text', placeholder: 'z.B. silvan.poltera@scnat.ch' },
      { key: 'schulungen_anmeldung_text', label: 'Anmelde-Hinweis', type: 'textarea', placeholder: 'Wie funktioniert die Anmeldung?' },
      { key: 'schulungen_themen_intro', label: 'Schulungsthemen-Voting Erklärung', type: 'textarea', placeholder: 'Erklärung wie das Themen-Voting funktioniert' },
      { key: 'schulungen_kalender_text', label: 'Kalender-Hinweis', type: 'text', placeholder: 'z.B. Alle Termine im Überblick' },
    ],
  },
  {
    key: 'prozesse',
    label: 'Prozesse & PM',
    icon: Settings,
    fields: [
      { key: 'prozesse_intro', label: 'Einleitungstext Prozesse-Seite', type: 'textarea', placeholder: 'Überblick über die Prozesse' },
      { key: 'prozesse_beschaffung_intro', label: 'Beschaffungsprozess — Intro', type: 'textarea', placeholder: 'Erklärung des Software-Beschaffungsprozesses' },
      { key: 'prozesse_pm_intro', label: 'PM-Framework — Intro', type: 'textarea', placeholder: 'Einleitung zum PM-Framework' },
      { key: 'prozesse_sprint_dauer', label: 'Sprint-Dauer', type: 'text', placeholder: 'z.B. 4 Wochen' },
      { key: 'prozesse_max_sprints', label: 'Max. parallele Sprints', type: 'text', placeholder: 'z.B. 2-3' },
      { key: 'prozesse_change_intro', label: 'Change-Vorschlag — Intro', type: 'textarea', placeholder: 'Erklärung zum Change-Einreichungs-Prozess' },
    ],
  },
  {
    key: 'scnat_db',
    label: 'SCNAT DB & Portale',
    icon: Database,
    fields: [
      { key: 'scnat_db_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur SCNAT DB Seite' },
      { key: 'scnat_db_architektur', label: 'Architektur-Beschreibung', type: 'textarea', placeholder: 'Technische Beschreibung der aktuellen Architektur' },
      { key: 'scnat_db_strategie', label: 'Strategische Optionen — Intro', type: 'textarea', placeholder: 'Einleitung zu den strategischen Optionen' },
      { key: 'scnat_db_entscheide', label: 'Grundsatzentscheide — Intro', type: 'textarea', placeholder: 'Was sind Grundsatzentscheide?' },
      { key: 'scnat_db_backlog_intro', label: 'Backlog — Intro', type: 'textarea', placeholder: 'Was ist der technische Backlog?' },
      { key: 'scnat_db_kontakt', label: 'Technischer Kontakt', type: 'text', placeholder: 'z.B. it@scnat.ch' },
    ],
  },
  {
    key: 'team',
    label: 'Team & Change Agents',
    icon: Users,
    fields: [
      { key: 'team_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Team-Seite' },
      { key: 'team_lead_beschreibung', label: 'Beschreibung Leitung Digitalisierung', type: 'textarea', placeholder: 'Rolle und Aufgaben der Leitung' },
      { key: 'team_ki_beschreibung', label: 'Beschreibung KI-Team', type: 'textarea', placeholder: 'Rolle und Aufgaben des KI-Teams' },
      { key: 'change_agent_text', label: 'Change Agents Beschreibung', type: 'textarea', placeholder: 'Beschreibung des Change Agent Programms' },
      { key: 'change_agent_anforderungen', label: 'Change Agent — Anforderungen', type: 'textarea', placeholder: 'Was wird von Change Agents erwartet?' },
      { key: 'change_agent_benefits', label: 'Change Agent — Vorteile', type: 'textarea', placeholder: 'Was bekommt man als Change Agent?' },
      { key: 'change_agent_kontakt', label: 'Kontakt-E-Mail', type: 'text', placeholder: 'E-Mail für Change Agent Anfragen' },
    ],
  },
  {
    key: 'softwareantrag',
    label: 'Softwareantrag-Formular',
    icon: Monitor,
    fields: [
      { key: 'antrag_intro', label: 'Formular-Einleitung', type: 'textarea', placeholder: 'Text über dem Antragsformular' },
      { key: 'antrag_success_title', label: 'Erfolgs-Titel', type: 'text', placeholder: 'z.B. Antrag eingereicht!' },
      { key: 'antrag_success_text', label: 'Erfolgs-Text', type: 'textarea', placeholder: 'Was passiert nach dem Einreichen?' },
      { key: 'antrag_dringlichkeit_hinweis', label: 'Dringlichkeit — Hinweis', type: 'text', placeholder: 'Hinweis zur Wahl der Dringlichkeit' },
    ],
  },
  {
    key: 'faqs',
    label: 'FAQs',
    icon: HelpCircle,
    fields: [
      { key: 'faq_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur FAQ-Seite' },
      { key: 'faq_kontakt', label: 'Kontakt bei offenen Fragen', type: 'text', placeholder: 'E-Mail für weitere Fragen' },
      { key: 'faq_1_q', label: 'FAQ 1 — Frage', type: 'text', placeholder: '' },
      { key: 'faq_1_a', label: 'FAQ 1 — Antwort', type: 'textarea', placeholder: '' },
      { key: 'faq_2_q', label: 'FAQ 2 — Frage', type: 'text', placeholder: '' },
      { key: 'faq_2_a', label: 'FAQ 2 — Antwort', type: 'textarea', placeholder: '' },
      { key: 'faq_3_q', label: 'FAQ 3 — Frage', type: 'text', placeholder: '' },
      { key: 'faq_3_a', label: 'FAQ 3 — Antwort', type: 'textarea', placeholder: '' },
      { key: 'faq_4_q', label: 'FAQ 4 — Frage', type: 'text', placeholder: '' },
      { key: 'faq_4_a', label: 'FAQ 4 — Antwort', type: 'textarea', placeholder: '' },
      { key: 'faq_5_q', label: 'FAQ 5 — Frage', type: 'text', placeholder: '' },
      { key: 'faq_5_a', label: 'FAQ 5 — Antwort', type: 'textarea', placeholder: '' },
    ],
  },
  {
    key: 'glossar',
    label: 'Glossar',
    icon: BookOpen,
    fields: [
      { key: 'glossar_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Glossar-Seite' },
    ],
  },
  {
    key: 'login',
    label: 'Login-Seite',
    icon: Users,
    fields: [
      { key: 'login_title', label: 'Login-Titel', type: 'text', placeholder: 'z.B. Willkommen zurück' },
      { key: 'login_subtitle', label: 'Login-Untertitel', type: 'text', placeholder: 'z.B. Melde dich an...' },
      { key: 'login_hilfe_text', label: 'Hilfe-Text unter dem Formular', type: 'text', placeholder: 'z.B. Bei Problemen wende dich an...' },
      { key: 'login_hilfe_email', label: 'Hilfe-E-Mail', type: 'text', placeholder: 'support@scnat.ch' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer & Branding',
    icon: Mail,
    fields: [
      { key: 'footer_org', label: 'Organisation', type: 'text', placeholder: 'z.B. SCNAT – Akademie der Naturwissenschaften Schweiz' },
      { key: 'footer_adresse', label: 'Adresse', type: 'textarea', placeholder: 'Haus der Akademien, Laupenstrasse 7...' },
      { key: 'footer_website', label: 'Haupt-Website URL', type: 'text', placeholder: 'https://scnat.ch' },
      { key: 'footer_copyright', label: 'Copyright-Text', type: 'text', placeholder: 'z.B. © 2026 SCNAT' },
      { key: 'datenschutz_hinweis', label: 'Datenschutz-Hinweis', type: 'textarea', placeholder: 'Allgemeiner Datenschutztext' },
      { key: 'impressum', label: 'Impressum', type: 'textarea', placeholder: 'Rechtliche Angaben' },
    ],
  },
  {
    key: 'allgemein',
    label: 'Allgemeine Einstellungen',
    icon: Settings,
    fields: [
      { key: 'plattform_name', label: 'Plattform-Name', type: 'text', placeholder: 'SCNAT Digitalisierungsportal' },
      { key: 'plattform_claim', label: 'Claim / Tagline', type: 'text', placeholder: 'Die Plattform für die digitale Transformation' },
      { key: 'support_email', label: 'Support-E-Mail', type: 'text', placeholder: 'digitalisierung@scnat.ch' },
      { key: 'support_telefon', label: 'Support-Telefon', type: 'text', placeholder: '+41 31 306 93 00' },
      { key: 'feedback_text', label: 'Feedback-Hinweis', type: 'textarea', placeholder: 'Hast du Feedback zur Plattform? Melde dich bei...' },
      { key: 'wartung_hinweis', label: 'Wartungs-Hinweis (leer = kein Banner)', type: 'text', placeholder: 'z.B. Wartung am 15.04.2026 von 18-20 Uhr' },
    ],
  },
];

export default function CpContent() {
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSections, setOpenSections] = useState(['hero']);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/content', { credentials: 'include' }).then(r => r.json()).then(setContent).catch(() => {});
  }, []);

  const toggleSection = (key) => {
    setOpenSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const expandAll = () => setOpenSections(SECTIONS.map(s => s.key));
  const collapseAll = () => setOpenSections([]);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(content),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (key, value) => {
    setContent(prev => ({ ...prev, [key]: value }));
  };

  const filteredSections = search
    ? SECTIONS.filter(s =>
        s.label.toLowerCase().includes(search.toLowerCase()) ||
        s.fields.some(f => f.label.toLowerCase().includes(search.toLowerCase()) || f.key.toLowerCase().includes(search.toLowerCase()))
      )
    : SECTIONS;

  const totalFields = SECTIONS.reduce((sum, s) => sum + s.fields.length, 0);
  const filledFields = SECTIONS.reduce((sum, s) => sum + s.fields.filter(f => content[f.key]).length, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Content verwalten</h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Texte, Einleitungen und Konfiguration aller Seiten —
            <span className="font-mono text-txt-tertiary ml-1">{filledFields}/{totalFields} Felder befüllt</span>
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Speichern…' : saved ? 'Gespeichert!' : 'Alle speichern'}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-3.5 h-3.5 text-txt-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sektion oder Feld suchen..."
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs pl-8 pr-3 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          />
        </div>
        <button onClick={expandAll} className="text-[10px] text-txt-tertiary hover:text-txt-secondary px-2 py-1 rounded-sm hover:bg-bg-elevated">Alle öffnen</button>
        <button onClick={collapseAll} className="text-[10px] text-txt-tertiary hover:text-txt-secondary px-2 py-1 rounded-sm hover:bg-bg-elevated">Alle schliessen</button>
        <span className="text-[10px] text-txt-tertiary font-mono ml-auto">{filteredSections.length} Sektionen</span>
      </div>

      <div className="space-y-2">
        {filteredSections.map(section => {
          const Icon = section.icon;
          const isOpen = openSections.includes(section.key);
          const filled = section.fields.filter(f => content[f.key]).length;
          return (
            <div key={section.key} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors"
              >
                <Icon className="w-4 h-4 text-txt-tertiary shrink-0" />
                <span className="text-sm font-medium text-txt-primary flex-1">{section.label}</span>
                <span className={`text-[10px] font-mono ${filled === section.fields.length ? 'text-status-green' : 'text-txt-tertiary'}`}>
                  {filled}/{section.fields.length}
                </span>
                <ChevronDown className={`w-4 h-4 text-txt-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-bd-faint pt-3">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="flex items-center justify-between text-xs text-txt-secondary font-medium mb-1.5">
                        {field.label}
                        <span className="text-[9px] font-mono text-txt-tertiary font-normal">{field.key}</span>
                      </label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={content[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          rows={3}
                          placeholder={field.placeholder}
                          className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none resize-y"
                        />
                      ) : (
                        <input
                          type="text"
                          value={content[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
