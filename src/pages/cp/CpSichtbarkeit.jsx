import { useEffect, useState } from 'react';
import {
  Home, Target, Layers, ListChecks, Network, Brain, GraduationCap,
  AppWindow, Database, Workflow, Users, HelpCircle, BookOpen, Save,
  Eye, EyeOff, Loader2,
} from 'lucide-react';
import { toast } from '../../components/ui/use-toast';

const SECTIONS = [
  { key: 'home',              label: 'Home',               icon: Home },
  { key: 'strategie',         label: 'Strategie',          icon: Target },
  { key: 'handlungsfelder',   label: 'Handlungsfelder',    icon: Layers },
  { key: 'massnahmen',        label: 'Massnahmen',         icon: ListChecks },
  { key: 'systemlandschaft',  label: 'Systemlandschaft',   icon: Network },
  { key: 'ki-hub',            label: 'KI-Hub',             icon: Brain },
  { key: 'schulungen',        label: 'Schulungen',         icon: GraduationCap },
  { key: 'software-antraege', label: 'Software-Anträge',   icon: AppWindow },
  { key: 'scnat-db',          label: 'SCNAT Datenbank',    icon: Database },
  { key: 'prozesse',          label: 'Prozesse',           icon: Workflow },
  { key: 'team',              label: 'Team',               icon: Users },
  { key: 'faqs',              label: 'FAQs',               icon: HelpCircle },
  { key: 'glossar',           label: 'Glossar',            icon: BookOpen },
];

export default function CpSichtbarkeit() {
  const [visibility, setVisibility] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch('/api/visibility', { credentials: 'include' })
      .then(r => r.ok ? r.json() : {})
      .then(setVisibility)
      .catch(() => setVisibility({}));
  }, []);

  function toggle(key) {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(visibility),
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen');
      setDirty(false);
      toast({ title: 'Gespeichert', description: 'Sichtbarkeit wurde aktualisiert.' });
    } catch {
      toast({ title: 'Fehler', description: 'Sichtbarkeit konnte nicht gespeichert werden.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  if (!visibility) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const hiddenCount  = SECTIONS.length - visibleCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary mb-1">Sichtbarkeit</h2>
          <p className="text-sm text-txt-secondary">
            Steuere, welche Sektionen im Portal für Benutzer sichtbar sind.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 px-4 py-2 bg-scnat-red text-white rounded-sm text-sm font-medium hover:bg-scnat-darkred transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Speichern
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-sm bg-status-green/10 text-status-green">
          <Eye className="w-3.5 h-3.5" /> {visibleCount} sichtbar
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-sm bg-bg-elevated text-txt-tertiary">
          <EyeOff className="w-3.5 h-3.5" /> {hiddenCount} ausgeblendet
        </span>
      </div>

      {/* Section list */}
      <div className="bg-bg-surface border border-bd-faint rounded-sm divide-y divide-bd-faint">
        {SECTIONS.map(({ key, label, icon: Icon }) => {
          const visible = !!visibility[key];
          return (
            <div
              key={key}
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-bg-elevated/50"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-sm ${
                visible ? 'bg-scnat-red/10 text-scnat-red' : 'bg-bg-elevated text-txt-tertiary'
              }`}>
                <Icon className="w-4 h-4" />
              </div>

              <span className={`flex-1 text-sm font-medium ${
                visible ? 'text-txt-primary' : 'text-txt-tertiary'
              }`}>
                {label}
              </span>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
                visible
                  ? 'bg-status-green/15 text-status-green'
                  : 'bg-bg-elevated text-txt-tertiary'
              }`}>
                {visible ? 'Sichtbar' : 'Ausgeblendet'}
              </span>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={visible}
                onClick={() => toggle(key)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scnat-red focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ${
                  visible ? 'bg-scnat-red' : 'bg-bd-strong'
                }`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  visible ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
