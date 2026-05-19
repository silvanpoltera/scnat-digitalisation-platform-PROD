import { useEffect, useState } from 'react';
import { Save, Loader2, Sparkles } from 'lucide-react';

const DEFAULTS = {
  version: 1,
  updated_at: '',
  updated_by: '',
  beta_note: 'Echo Add-Ons sind in der Beta und werden global aus dem Control Panel geladen.',
  polish: {
    enabled_default: true,
    system_prompt: 'Du bist der SCNAT Echo Polish Assistent. Halte den Inhalt sachlich, knapp und gut lesbar.',
    prompts: {
      multi: 'Behalte die Originalsprache je Abschnitt bei, korrigiere nur offensichtliche Transkriptionsfehler und Füllwörter.',
      de: 'Formuliere den gesamten Text in klarem Hochdeutsch. Korrigiere Füllwörter und Interpunktion.',
      fr: 'Formule tout le texte en francais clair. Corrige les mots de remplissage et la ponctuation.',
      it: 'Riformula tutto il testo in italiano chiaro. Correggi parole di riempimento e punteggiatura.',
    },
  },
  document_template: {
    title: 'Meeting-Transkript',
    dateLabel: 'Datum',
    participantsLabel: 'Teilnehmer',
    unknownParticipants: 'Nicht eindeutig erkennbar',
    summaryLabel: 'Management Summary',
    bulletLabel: 'Besprochene Punkte',
    transcriptLabel: 'Transkription',
  },
};

function mergeWithDefaults(raw) {
  return {
    ...DEFAULTS,
    ...(raw || {}),
    polish: {
      ...DEFAULTS.polish,
      ...(raw?.polish || {}),
      prompts: {
        ...DEFAULTS.polish.prompts,
        ...(raw?.polish?.prompts || {}),
      },
    },
    document_template: {
      ...DEFAULTS.document_template,
      ...(raw?.document_template || {}),
    },
  };
}

export default function CpEchoAddOns() {
  const [config, setConfig] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/echo-addons', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setConfig(mergeWithDefaults(data)))
      .catch(() => setConfig(DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  const update = (path, value) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        polish: { ...prev.polish, prompts: { ...prev.polish.prompts } },
        document_template: { ...prev.document_template },
      };
      if (path === 'beta_note') next.beta_note = value;
      if (path === 'polish.enabled_default') next.polish.enabled_default = value;
      if (path === 'polish.system_prompt') next.polish.system_prompt = value;
      if (path.startsWith('polish.prompts.')) {
        const key = path.split('.').at(-1);
        next.polish.prompts[key] = value;
      }
      if (path.startsWith('document_template.')) {
        const key = path.split('.').at(-1);
        next.document_template[key] = value;
      }
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const payload = {
        ...config,
        updated_at: new Date().toISOString(),
      };
      const res = await fetch('/api/echo-addons', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen.');
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(err?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-txt-secondary">
        <Loader2 className="w-4 h-4 animate-spin" />
        Echo Add-Ons werden geladen...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Echo Add-Ons</h2>
          <p className="text-xs text-txt-secondary mt-1">
            Diese Prompts gelten global für alle User auf Live und werden bei jedem Echo-Job geladen.
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Speichern...' : saved ? 'Gespeichert!' : 'Echo Add-Ons speichern'}
        </button>
      </div>

      {error && (
        <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-xs px-3 py-2 rounded-sm">
          {error}
        </div>
      )}

      <div className="bg-bg-surface border border-bd-faint rounded-sm p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-txt-secondary block mb-1.5">Beta-Hinweis</label>
          <textarea
            rows={2}
            value={config.beta_note || ''}
            onChange={(e) => update('beta_note', e.target.value)}
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
          />
        </div>

        <div className="flex items-start gap-2">
          <input
            id="echo-polish-default"
            type="checkbox"
            className="accent-scnat-red mt-0.5"
            checked={Boolean(config.polish?.enabled_default)}
            onChange={(e) => update('polish.enabled_default', e.target.checked)}
          />
          <label htmlFor="echo-polish-default" className="text-xs text-txt-secondary">
            Prompt-Polish standardmässig aktiviert
          </label>
        </div>

        <div>
          <label className="text-xs font-medium text-txt-secondary block mb-1.5">System Prompt (global)</label>
          <textarea
            rows={3}
            value={config.polish?.system_prompt || ''}
            onChange={(e) => update('polish.system_prompt', e.target.value)}
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { key: 'multi', label: 'Prompt Multi-Sprache' },
          { key: 'de', label: 'Prompt Alles auf Deutsch' },
          { key: 'fr', label: 'Prompt Alles auf Französisch' },
          { key: 'it', label: 'Prompt Alles auf Italienisch' },
        ].map((item) => (
          <div key={item.key} className="bg-bg-surface border border-bd-faint rounded-sm p-4">
            <label className="text-xs font-medium text-txt-secondary block mb-1.5">{item.label}</label>
            <textarea
              rows={4}
              value={config.polish?.prompts?.[item.key] || ''}
              onChange={(e) => update(`polish.prompts.${item.key}`, e.target.value)}
              className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-bg-surface border border-bd-faint rounded-sm p-4 space-y-3">
        <p className="text-xs font-medium text-txt-secondary">Output-Struktur für das Markdown</p>
        {[
          { key: 'title', label: 'Titel' },
          { key: 'dateLabel', label: 'Label für Datum' },
          { key: 'participantsLabel', label: 'Label für Teilnehmer' },
          { key: 'unknownParticipants', label: 'Fallback wenn Teilnehmer unbekannt' },
          { key: 'summaryLabel', label: 'Label für Management Summary' },
          { key: 'bulletLabel', label: 'Label für Stichpunkte' },
          { key: 'transcriptLabel', label: 'Label für Transkription' },
        ].map((item) => (
          <div key={item.key}>
            <label className="text-xs text-txt-secondary block mb-1">{item.label}</label>
            <input
              type="text"
              value={config.document_template?.[item.key] || ''}
              onChange={(e) => update(`document_template.${item.key}`, e.target.value)}
              className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div className="bg-status-blue/10 border border-status-blue/20 rounded-sm p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-status-blue shrink-0 mt-0.5" />
        <p className="text-xs text-txt-secondary leading-relaxed">
          Hinweis: Diese Add-Ons steuern den globalen Echo-Polish-Flow.
          Nach dem Speichern sind sie für alle Nutzer sichtbar, sobald diese den Echo-Bereich neu laden.
        </p>
      </div>
    </div>
  );
}
