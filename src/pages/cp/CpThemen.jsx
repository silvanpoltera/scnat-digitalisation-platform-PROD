import { useState, useEffect, useMemo } from 'react';
import { Trash2, ThumbsUp, MessageSquare, Check, ChevronDown, ChevronUp, Save, X, Mail, User, Calendar, CalendarPlus, BookOpen, Lightbulb, Inbox } from 'lucide-react';

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

const inputCls = 'w-full bg-bg-surface border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-teal focus:outline-none';

function formatDateCH(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return ''; }
}

export default function CpThemen() {
  const [themen, setThemen] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [edit, setEdit] = useState({ titel: '', beschreibung: '', status: '', adminAntwort: '' });
  const [saving, setSaving] = useState(false);
  const [creatingEventFor, setCreatingEventFor] = useState(null);
  const [eventForm, setEventForm] = useState({ datum: '', zeit: '', ort: '', maxTeilnehmer: 15, beschreibung: '' });
  const [eventBusy, setEventBusy] = useState(false);

  const load = () => {
    fetch('/api/schulungsthemen', { credentials: 'include' }).then(r => r.json()).then(setThemen).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const { vordefinierte, userVorschlaege, stats } = useMemo(() => {
    const vordefinierte = themen.filter(t => t.typ === 'vordefiniert');
    const userVorschlaege = themen.filter(t => t.typ !== 'vordefiniert');
    const offene = userVorschlaege.filter(t => !t.status).length;
    const beantwortet = userVorschlaege.filter(t => t.status || t.adminAntwort).length;
    return {
      vordefinierte,
      userVorschlaege,
      stats: { vordefiniert: vordefinierte.length, vorschlaege: userVorschlaege.length, offene, beantwortet },
    };
  }, [themen]);

  const handleDelete = async (id) => {
    if (!confirm('Thema wirklich löschen?')) return;
    await fetch(`/api/schulungsthemen/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const startEdit = (t) => {
    setExpandedId(t.id);
    setCreatingEventFor(null);
    setEdit({
      titel: t.titel || '',
      beschreibung: t.beschreibung || '',
      status: t.status || '',
      adminAntwort: t.adminAntwort || '',
    });
  };

  const cancelEdit = () => {
    setExpandedId(null);
    setCreatingEventFor(null);
    setEdit({ titel: '', beschreibung: '', status: '', adminAntwort: '' });
  };

  const saveEdit = async (id, isVordef) => {
    setSaving(true);
    try {
      const body = { titel: edit.titel, beschreibung: edit.beschreibung };
      if (!isVordef) {
        body.status = edit.status;
        body.adminAntwort = edit.adminAntwort;
      }
      const res = await fetch(`/api/schulungsthemen/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
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

  const openCreateEvent = (t) => {
    setCreatingEventFor(t.id);
    setEventForm({
      datum: '',
      zeit: '',
      ort: '',
      maxTeilnehmer: 15,
      beschreibung: t.beschreibung || '',
    });
  };

  const closeCreateEvent = () => {
    setCreatingEventFor(null);
  };

  const submitCreateEvent = async (t) => {
    if (!eventForm.datum) { alert('Datum erforderlich'); return; }
    setEventBusy(true);
    try {
      // 1) Event anlegen
      const evRes = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titel: t.titel,
          datum: eventForm.datum,
          zeit: eventForm.zeit || '',
          ort: eventForm.ort || '',
          beschreibung: eventForm.beschreibung || '',
          maxTeilnehmer: parseInt(eventForm.maxTeilnehmer, 10) || 15,
        }),
      });
      if (!evRes.ok) {
        const d = await evRes.json().catch(() => ({}));
        throw new Error(d.error || 'Event konnte nicht erstellt werden');
      }
      const ev = await evRes.json();

      // 2) Vorschlag verlinken, Status setzen, Auto-Antwort schreiben
      const datumStr = formatDateCH(eventForm.datum + 'T00:00:00');
      const autoAntwort = `Wir haben dazu eine Schulung am ${datumStr}${eventForm.ort ? ' in ' + eventForm.ort : ''} angesetzt. Anmeldung im Schulungs-Kalender.`;
      await fetch(`/api/schulungsthemen/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'geplant',
          adminAntwort: autoAntwort,
          linkedEventId: ev.id,
        }),
      });

      cancelEdit();
      load();
    } catch (err) {
      alert(err.message || 'Fehler');
    } finally {
      setEventBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-heading font-semibold text-txt-primary">Schulungsthemen</h2>
        <p className="text-xs text-txt-secondary mt-0.5">
          Vordefinierte Themen pflegen, User-Vorschläge mit Status / Antwort versehen und direkt in eine Schulung überführen.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-blue">{stats.vordefiniert}</p>
          <p className="text-[10px] text-txt-tertiary">Vordefinierte Themen</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-orange">{stats.vorschlaege}</p>
          <p className="text-[10px] text-txt-tertiary">User-Vorschläge</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className={`text-xl font-heading font-semibold ${stats.vorschlaege === 0 ? 'text-txt-tertiary/50' : 'text-scnat-red'}`}>
            {stats.vorschlaege === 0 ? '–' : stats.offene}
          </p>
          <p className="text-[10px] text-txt-tertiary">{stats.vorschlaege === 0 ? 'Noch offen' : `Noch offen (von ${stats.vorschlaege})`}</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className={`text-xl font-heading font-semibold ${stats.vorschlaege === 0 ? 'text-txt-tertiary/50' : 'text-status-green'}`}>
            {stats.vorschlaege === 0 ? '–' : stats.beantwortet}
          </p>
          <p className="text-[10px] text-txt-tertiary">Beantwortet</p>
        </div>
      </div>

      {/* Vordefinierte Themen */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-3.5 h-3.5 text-status-blue" />
          <h3 className="text-xs font-heading font-semibold text-txt-primary uppercase tracking-wider">
            Vordefinierte Themen
          </h3>
          <span className="text-[10px] font-mono text-txt-tertiary">({vordefinierte.length})</span>
          <span className="text-[10px] text-txt-tertiary ml-2">— vom Team gepflegt, immer auf der Schulungen-Seite sichtbar</span>
        </div>
        <div className="space-y-2">
          {vordefinierte.map(t => renderItem(t))}
          {vordefinierte.length === 0 && (
            <p className="text-xs text-txt-tertiary italic px-3 py-2">Keine vordefinierten Themen.</p>
          )}
        </div>
      </div>

      {/* User-Vorschläge */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-scnat-orange" />
          <h3 className="text-xs font-heading font-semibold text-txt-primary uppercase tracking-wider">
            User-Vorschläge
          </h3>
          <span className="text-[10px] font-mono text-txt-tertiary">({userVorschlaege.length})</span>
          <span className="text-[10px] text-txt-tertiary ml-2">— von Mitarbeitenden über die Schulungen-Seite eingereicht</span>
        </div>
        <div className="space-y-2">
          {userVorschlaege.map(t => renderItem(t))}
          {userVorschlaege.length === 0 && (
            <div className="bg-bg-surface border border-dashed border-bd-faint rounded-sm px-4 py-6 text-center">
              <Inbox className="w-6 h-6 text-txt-tertiary mx-auto mb-2 opacity-50" />
              <p className="text-sm text-txt-secondary mb-1">Noch keine User-Vorschläge</p>
              <p className="text-[11px] text-txt-tertiary leading-relaxed max-w-md mx-auto">
                Sobald jemand auf der Schulungen-Seite (Tab „Themen wünschen") einen Vorschlag einreicht,
                erscheint er hier. Du siehst dann <strong className="text-txt-secondary">Name + Mail-Kontakt</strong> der
                vorschlagenden Person und kannst Status setzen, antworten oder direkt eine Schulung daraus erstellen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  function renderItem(t) {
    const meta = statusMeta(t.status);
    const isExpanded = expandedId === t.id;
    const isVordef = t.typ === 'vordefiniert';
    const isCreatingEvent = creatingEventFor === t.id;

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
                    {t.linkedEventId && (
                      <span className="text-[9px] font-mono bg-scnat-teal/15 text-scnat-teal px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" /> Event
                      </span>
                    )}
                  </div>
                  {t.beschreibung && <p className="text-xs text-txt-secondary mt-0.5 truncate">{t.beschreibung}</p>}
                  {!isVordef && t.ersteller && (
                    <p className="text-[10px] text-txt-tertiary mt-0.5 flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {t.ersteller.name}
                      {t.erstellt && <span className="opacity-60">· {formatDateCH(t.erstellt)}</span>}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => isExpanded ? cancelEdit() : startEdit(t)}
                    className="text-txt-tertiary hover:text-scnat-teal p-1.5 rounded-sm hover:bg-bg-elevated transition-colors"
                    title={isExpanded ? 'Schliessen' : 'Bearbeiten'}
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="text-txt-tertiary hover:text-scnat-red p-1.5 rounded-sm hover:bg-scnat-red/10 transition-colors"
                    title="Löschen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-bd-faint px-4 py-3 bg-bg-elevated/30 space-y-3">
                  {!isVordef && t.ersteller && (
                    <div className="bg-bg-surface border border-bd-faint rounded-sm px-3 py-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-txt-secondary">
                        <User className="w-3 h-3 text-txt-tertiary" />
                        <span className="text-txt-primary font-medium">{t.ersteller.name}</span>
                      </div>
                      {t.ersteller.email && (
                        <a
                          href={`mailto:${t.ersteller.email}?subject=${encodeURIComponent('Dein Schulungsvorschlag: ' + t.titel)}`}
                          className="flex items-center gap-1.5 text-xs text-scnat-teal hover:underline"
                        >
                          <Mail className="w-3 h-3" /> {t.ersteller.email}
                        </a>
                      )}
                      {t.erstellt && (
                        <span className="text-[10px] font-mono text-txt-tertiary ml-auto">
                          eingereicht {formatDateCH(t.erstellt)}
                        </span>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1.5 block">Titel</label>
                    <input
                      value={edit.titel}
                      onChange={e => setEdit(s => ({ ...s, titel: e.target.value }))}
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1.5 block">Beschreibung</label>
                    <textarea
                      value={edit.beschreibung}
                      onChange={e => setEdit(s => ({ ...s, beschreibung: e.target.value }))}
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {!isVordef && (
                    <>
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
                          placeholder={'z.B. „Wird im Q2 als Halbtagskurs angeboten." oder „Danke für den Vorschlag, aktuell nicht priorisiert."'}
                          className={`${inputCls} resize-none`}
                        />
                      </div>
                    </>
                  )}

                  {t.adminUpdatedAt && (
                    <p className="text-[10px] text-txt-tertiary">
                      Zuletzt aktualisiert: {new Date(t.adminUpdatedAt).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })}
                      {t.adminUpdatedBy && ` · ${t.adminUpdatedBy}`}
                    </p>
                  )}

                  <div className="flex items-center gap-2 justify-between flex-wrap">
                    {!isVordef ? (
                      <button
                        onClick={() => isCreatingEvent ? closeCreateEvent() : openCreateEvent(t)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm transition-colors ${
                          isCreatingEvent
                            ? 'bg-scnat-orange/15 text-scnat-orange'
                            : 'border border-bd-faint text-txt-secondary hover:border-scnat-orange hover:text-scnat-orange'
                        }`}
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        {isCreatingEvent ? 'Schulung-Form schliessen' : 'Schulung daraus erstellen'}
                      </button>
                    ) : <span />}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 text-xs text-txt-secondary hover:text-txt-primary px-3 py-1.5 rounded-sm hover:bg-bg-surface transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Abbrechen
                      </button>
                      <button
                        onClick={() => saveEdit(t.id, isVordef)}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-scnat-teal text-white text-xs px-3 py-1.5 rounded-sm hover:bg-scnat-teal/90 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" /> {saving ? 'Speichere…' : 'Speichern'}
                      </button>
                    </div>
                  </div>

                  {!isVordef && isCreatingEvent && (
                    <div className="border border-scnat-orange/30 bg-scnat-orange/5 rounded-sm p-3 space-y-2 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-scnat-orange uppercase tracking-wider mb-1">
                        <CalendarPlus className="w-3.5 h-3.5" />
                        Neue Schulung aus diesem Vorschlag
                      </div>
                      <p className="text-[11px] text-txt-tertiary">
                        Erstellt ein Event mit dem Titel „{t.titel}", setzt den Vorschlag auf <strong>Geplant</strong> und schreibt eine Auto-Antwort mit Datum & Ort.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1 block">Datum *</label>
                          <input type="date" value={eventForm.datum} onChange={e => setEventForm(f => ({ ...f, datum: e.target.value }))} className={inputCls} />
                        </div>
                        <div>
                          <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1 block">Zeit</label>
                          <input value={eventForm.zeit} onChange={e => setEventForm(f => ({ ...f, zeit: e.target.value }))} placeholder="z.B. 09:00–11:00" className={inputCls} />
                        </div>
                        <div>
                          <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1 block">Ort</label>
                          <input value={eventForm.ort} onChange={e => setEventForm(f => ({ ...f, ort: e.target.value }))} placeholder="z.B. Haus der Akademien, Bern" className={inputCls} />
                        </div>
                        <div>
                          <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1 block">Max. Teilnehmer</label>
                          <input type="number" min="1" value={eventForm.maxTeilnehmer} onChange={e => setEventForm(f => ({ ...f, maxTeilnehmer: e.target.value }))} className={inputCls} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-1 block">Beschreibung (Event)</label>
                        <textarea
                          value={eventForm.beschreibung}
                          onChange={e => setEventForm(f => ({ ...f, beschreibung: e.target.value }))}
                          rows={2}
                          className={`${inputCls} resize-none`}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={closeCreateEvent}
                          className="text-xs text-txt-secondary hover:text-txt-primary px-3 py-1.5 rounded-sm hover:bg-bg-surface transition-colors"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={() => submitCreateEvent(t)}
                          disabled={eventBusy || !eventForm.datum}
                          className="flex items-center gap-1.5 bg-scnat-orange text-white text-xs px-3 py-1.5 rounded-sm hover:bg-scnat-orange/90 transition-colors disabled:opacity-50"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          {eventBusy ? 'Erstelle…' : 'Schulung erstellen'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
      </div>
    );
  }
}
