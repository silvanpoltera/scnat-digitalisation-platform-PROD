import { useState, useEffect } from 'react';
import { Save, ChevronDown, FileText, Globe, Mail, Info } from 'lucide-react';

const SECTIONS = [
  {
    key: 'hero',
    label: 'Startseite – Hero',
    icon: Globe,
    fields: [
      { key: 'hero_title', label: 'Titel', type: 'text', placeholder: 'z.B. Digitalisierung vereinfacht.' },
      { key: 'hero_subtitle', label: 'Untertitel', type: 'textarea', placeholder: 'Beschreibung unter dem Hero-Titel' },
    ],
  },
  {
    key: 'uebersicht',
    label: 'Übersicht – Allgemein',
    icon: Info,
    fields: [
      { key: 'uebersicht', label: 'Einleitungstext', type: 'textarea', placeholder: 'Einführungstext für die Übersichtsseite' },
      { key: 'uebersicht_cta', label: 'Call-to-Action Text', type: 'text', placeholder: 'z.B. Los gehts!' },
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
    ],
  },
  {
    key: 'massnahmen',
    label: 'Massnahmen',
    icon: FileText,
    fields: [
      { key: 'massnahmen', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Massnahmen-Seite' },
      { key: 'massnahmen_start5_text', label: 'Start-mit-5 Erklärung', type: 'textarea', placeholder: 'Agiler Ansatz erklären' },
    ],
  },
  {
    key: 'schulungen',
    label: 'Schulungen',
    icon: FileText,
    fields: [
      { key: 'schulungen', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Schulungen-Seite' },
      { key: 'schulungen_kontakt', label: 'Kontakt für Schulungen', type: 'text', placeholder: 'z.B. silvan.poltera@scnat.ch' },
    ],
  },
  {
    key: 'software',
    label: 'Software & Co',
    icon: FileText,
    fields: [
      { key: 'software', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Software-Seite' },
      { key: 'software_antrag_hinweis', label: 'Antrags-Hinweis', type: 'textarea', placeholder: 'Hinweis für Softwareanträge' },
    ],
  },
  {
    key: 'ki',
    label: 'KI-Hub',
    icon: FileText,
    fields: [
      { key: 'ki_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zum KI-Hub' },
      { key: 'ki_rahmen_link', label: 'Link KI-Rahmen (PDF)', type: 'text', placeholder: 'URL zum KI-Rahmen PDF' },
      { key: 'ki_kontakt', label: 'Kontakt für KI-Fragen', type: 'text', placeholder: 'z.B. david.jezdimirovic@scnat.ch' },
    ],
  },
  {
    key: 'team',
    label: 'Team & Change Agents',
    icon: FileText,
    fields: [
      { key: 'team_intro', label: 'Einleitungstext', type: 'textarea', placeholder: 'Text zur Team-Seite' },
      { key: 'change_agent_text', label: 'Change Agents Beschreibung', type: 'textarea', placeholder: 'Beschreibung des Change Agent Programms' },
      { key: 'change_agent_kontakt', label: 'Kontakt-E-Mail', type: 'text', placeholder: 'E-Mail für Change Agent Anfragen' },
    ],
  },
  {
    key: 'footer',
    label: 'Footer & Allgemein',
    icon: Mail,
    fields: [
      { key: 'footer_org', label: 'Organisation', type: 'text', placeholder: 'z.B. SCNAT – Akademie der Naturwissenschaften Schweiz' },
      { key: 'footer_adresse', label: 'Adresse', type: 'textarea', placeholder: 'Haus der Akademien, Laupenstrasse 7...' },
      { key: 'datenschutz_hinweis', label: 'Datenschutz-Hinweis', type: 'textarea', placeholder: 'Allgemeiner Datenschutztext' },
    ],
  },
];

export default function CpContent() {
  const [content, setContent] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [openSections, setOpenSections] = useState(['hero']);

  useEffect(() => {
    fetch('/api/content', { credentials: 'include' }).then(r => r.json()).then(setContent).catch(() => {});
  }, []);

  const toggleSection = (key) => {
    setOpenSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Content verwalten</h2>
          <p className="text-xs text-txt-secondary mt-0.5">Texte, Einleitungen und Konfiguration für alle Seiten</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Speichern…' : saved ? 'Gespeichert!' : 'Alle speichern'}
        </button>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(section => {
          const Icon = section.icon;
          const isOpen = openSections.includes(section.key);
          return (
            <div key={section.key} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors"
              >
                <Icon className="w-4 h-4 text-txt-tertiary shrink-0" />
                <span className="text-sm font-medium text-txt-primary flex-1">{section.label}</span>
                <span className="text-[10px] text-txt-tertiary font-mono">{section.fields.length} Felder</span>
                <ChevronDown className={`w-4 h-4 text-txt-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-bd-faint pt-3">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs text-txt-secondary font-medium mb-1.5">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={content[field.key] || ''}
                          onChange={e => updateField(field.key, e.target.value)}
                          rows={3}
                          placeholder={field.placeholder}
                          className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none resize-none"
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
