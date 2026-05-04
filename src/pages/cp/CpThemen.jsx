import { useState, useEffect, useMemo } from 'react';
import { Trash2, ThumbsUp, MessageSquare, Check, ChevronDown, ChevronUp, Save, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',             label: 'Offen',         badge: 'bg-bg-elevated text-txt-tertiary' },
  { value: 'geplant',      label: 'Geplant',       badge: 'bg-status-blue/15 text-status-blue' },
  { value: 'in-umsetzung', label: 'In Umsetzung',  badge: 'bg-status-yellow/15 text-status-yellow' },
  { value: 'erledigt',     label: 'Erledigt',      badge: 'bg-status-green/15 text-status-green' },
  { value: 'abgelehnt',    label: 'Abgelehnt',     badge: 'bg-scnat-red/15 text-scnat-red' },
];

function statusMeta(s) {
  return STATUS_OPTIONS.find(o => o.value === (s || '')) || STATUS_OPTIONS[0];
}

export default function CpThemen() {
  const [themen, setThemen] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [edit, setEdit] = useState({ status: '', adminAntwort: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch('/api/schulungsthemen', { credentials: 'include' }).then(r => r.json()).then(setThemen).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const userVorschlaege = themen.filter(t => t.typ !== 'vordefiniert');
    const offene = userVorschlaege.filter(t => !t.status).length;
    const beantwortet = userVorschlaege.filter(t => t.status || t.adminAntwort).length;
    return { total: themen.length, vorschlaege: userVorschlaege.length, offene, beantwortet };
  }, [themen]);

  const handleDelete = async (id) => {
    if (!confirm('Thema wirklich löschen?')) return;
    await fetch(`/api/schulungsthemen/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const startEdit = (t) => {
    setExpandedId(t.id);
    setEdit({ status: t.status || '', adminAntwort: t.adminAntwort || '' });
  };

  const cancelEdit = () => {
    setExpandedId(null);
    setEdit({ status: '', adminAntwort: '' });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/schulungsthemen/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: edit.status, adminAntwort: edit.adminAntwort }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fehler');
      }
      cancelEdit();
      load();
    } catch (err) {
      alert(err.message || 'Speichern fehlgeschlagen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-semibold text-txt-primary">Schulungsthemen</h2>
        <p className="text-xs text-txt-secondary mt-0.5">
          User-Vorschläge mit Status versehen oder beantworten — die Antwort wird auf der Schulungen-Seite sichtbar.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-txt-primary">{stats.total}</p>
          <p className="text-[10px] text-txt-tertiary">Themen total</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-orange">{stats.vorschlaege}</p>
          <p className="text-[10px] text-txt-tertiary">User-Vorschläge</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-red">{stats.offene}</p>
          <p className="text-[10px] text-txt-tertiary">Noch offen</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-green">{stats.beantwortet}</p>
          <p className="text-[10px] text-txt-tertiary">Beantwortet</p>
        </div>
      </div>

      <div className="space-y-2">
        {themen.map(t => {
          const meta = statusMeta(t.status);
          const isExpanded = expandedId === t.id;
          const isVordef = t.typ === 'vordefiniert';

          return (
            <div key={t.id} className="bg-bg-surface border border-bd-faint rounded-sm">
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-txt-secondary shrink-0">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">{t.likes?.length || 0}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-txt-primary">{t.titel}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${isVordef ? 'bg-status-blue/15 text-status-blue' : 'bg-bg-elevated text-txt-tertiary'}`}>{t.typ}</span>
                    {!isVordef && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${meta.badge}`}>
                        {meta.label}
                      </span>
                    )}
                    {t.adminAntwort && (
                      <span className="text-[9px] font-mono bg-status-green/15 text-status-green px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5" /> Antwort
                      </span>
                    )}
                  </div>
                  {t.beschreibung && <p className="text-xs text-txt-secondary mt-0.5 truncate">{t.beschreibung}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!isVordef && (
                    <button
                      onClick={() => isExpanded ? cancelEdit() : startEdit(t)}
                      className="text-txt-tertiary hover:text-scnat-teal p-1.5 rounded-sm hover:bg-bg-elevated transition-colors"
                      title={isExpanded ? 'Schliessen' : 'Reagieren'}
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  {!isVordef && (
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-txt-tertiary hover:text-scnat-red p-1.5 rounded-sm hover:bg-scnat-red/10 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {!isVordef && isExpanded && (
                <div className="border-t border-bd-faint px-4 py-3 bg-bg-elevated/30 space-y-3">
                  <div>
                    <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1.5 block">Status</label>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map(opt => (
                        <button
                          key={opt.value || 'offen'}
                          onClick={() => setEdit(s => ({ ...s, status: opt.value }))}
                          className={`text-[11px] px-2.5 py-1 rounded-sm border transition-colors ${
                            edit.status === opt.value
                              ? `${opt.badge} border-current`
                              : 'bg-bg-surface text-txt-secondary border-bd-faint hover:border-bd-default'
                          }`}
                        >
                          {edit.status === opt.value && <Check className="w-3 h-3 inline mr-1" />}
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1.5 block">
                      Antwort an Vorschlagsteller (sichtbar auf Schulungen-Seite)
                    </label>
                    <textarea
                      value={edit.adminAntwort}
                      onChange={e => setEdit(s => ({ ...s, adminAntwort: e.target.value }))}
                      rows={3}
                      placeholder="z.B. „Wird im Q2 als Halbtagskurs angeboten." oder „Danke für den Vorschlag, aktuell nicht priorisiert.""
                      className="w-full bg-bg-surface border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-teal focus:outline-none resize-none"
                    />
                  </div>

                  {t.adminUpdatedAt && (
                    <p className="text-[10px] text-txt-tertiary">
                      Zuletzt aktualisiert: {new Date(t.adminUpdatedAt).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}
                      {t.adminUpdatedBy && ` · ${t.adminUpdatedBy}`}
                    </p>
                  )}

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1 text-xs text-txt-secondary hover:text-txt-primary px-3 py-1.5 rounded-sm hover:bg-bg-surface transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Abbrechen
                    </button>
                    <button
                      onClick={() => saveEdit(t.id)}
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-scnat-teal text-white text-xs px-3 py-1.5 rounded-sm hover:bg-scnat-teal/90 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> {saving ? 'Speichere…' : 'Speichern'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {themen.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 text-txt-tertiary mx-auto mb-3" />
            <p className="text-sm text-txt-secondary">Noch keine Schulungsthemen vorhanden.</p>
          </div>
        )}
      </div>
    </div>
  );
}
