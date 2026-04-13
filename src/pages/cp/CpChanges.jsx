import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, User, Trash2, Save, AlertTriangle, CheckCircle2, Clock, Eye, Link2, MessageSquare, Send, ListChecks, Rocket, Search } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'eingereicht', label: 'Eingereicht', color: 'bg-status-yellow/15 text-status-yellow' },
  { value: 'in_pruefung', label: 'In Prüfung', color: 'bg-status-blue/15 text-status-blue' },
  { value: 'angenommen', label: 'Angenommen', color: 'bg-status-green/15 text-status-green' },
  { value: 'abgelehnt', label: 'Abgelehnt', color: 'bg-scnat-red/15 text-scnat-red' },
  { value: 'umgesetzt', label: 'Umgesetzt', color: 'bg-scnat-teal/15 text-scnat-teal' },
];

const CLUSTER_OPTIONS = [
  '', 'Digitale Kultur & Befähigung', 'Infrastruktur & Beschaffung',
  'Kommunikation & Transparenz', 'Prozesse & Methoden',
  'Strategie & Steuerung', 'Daten & Wissen',
];

const WIDERSTAND_COLORS = {
  niedrig: 'text-status-green',
  mittel: 'text-status-yellow',
  hoch: 'text-scnat-red',
};

const PRIO_OPTIONS = [
  { value: 'A', label: 'Quick Win' },
  { value: 'B', label: 'Strategisch' },
  { value: 'C', label: 'Mittelfristig' },
  { value: 'D', label: 'Langfristig' },
];

const TAG_OPTIONS = ['Schulungen', 'Befähigungen', 'Beschaffung', 'Information & Transparenz', 'Kommunikation'];

export default function CpChanges() {
  const [changes, setChanges] = useState([]);
  const [massnahmen, setMassnahmen] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editData, setEditData] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [convertingId, setConvertingId] = useState(null);
  const [convertForm, setConvertForm] = useState({});
  const [convertBusy, setConvertBusy] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clusterFilter, setClusterFilter] = useState('');

  const load = () => {
    Promise.all([
      fetch('/api/changes', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/massnahmen', { credentials: 'include' }).then(r => r.json()),
    ]).then(([c, m]) => { setChanges(c); setMassnahmen(m); }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: changes.length,
    eingereicht: changes.filter(c => c.status === 'eingereicht').length,
    pruefung: changes.filter(c => c.status === 'in_pruefung').length,
    angenommen: changes.filter(c => c.status === 'angenommen').length,
    abgelehnt: changes.filter(c => c.status === 'abgelehnt').length,
  }), [changes]);

  const filtered = useMemo(() => {
    let result = [...changes];
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      result = result.filter(c =>
        c.titel?.toLowerCase().includes(q) ||
        c.beschreibung?.toLowerCase().includes(q) ||
        c.kontakt?.toLowerCase().includes(q) ||
        c.kontaktEmail?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter(c => c.status === statusFilter);
    if (clusterFilter) result = result.filter(c => c.cluster === clusterFilter);
    result.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
    return result;
  }, [changes, searchFilter, statusFilter, clusterFilter]);

  const handleSave = async (c) => {
    const patch = editData[c.id] || {};
    await fetch(`/api/changes/${c.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        status: patch.status ?? c.status,
        cluster: patch.cluster ?? c.cluster,
        massnahmeId: patch.massnahmeId ?? c.massnahmeId,
        adminNotiz: patch.adminNotiz ?? c.adminNotiz,
      }),
    });
    setEditData(prev => { const n = { ...prev }; delete n[c.id]; return n; });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Diesen Vorschlag wirklich löschen?')) return;
    await fetch(`/api/changes/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const updateEdit = (id, field, value) => {
    setEditData(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    await fetch(`/api/changes/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ antwort: replyText }),
    });
    setReplyingTo(null);
    setReplyText('');
    load();
  };

  const startConvert = (change) => {
    setConvertingId(change.id);
    setConvertForm({
      titel: change.titel,
      beschreibung: change.beschreibung,
      cluster: change.cluster || CLUSTER_OPTIONS.find(Boolean) || '',
      prioritaet: 'C',
      wirkung: 5,
      aufwand: 5,
      tags: [],
      scnat_db: false,
      scnat_portal: false,
      start_empfohlen: false,
    });
  };

  const handleConvert = async (changeId) => {
    if (!convertForm.titel?.trim()) return;
    setConvertBusy(true);
    try {
      const prio = PRIO_OPTIONS.find(p => p.value === convertForm.prioritaet);
      const res = await fetch('/api/massnahmen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...convertForm,
          prioritaet_label: prio?.label || '',
          status: 'geplant',
        }),
      });
      const newM = await res.json();
      await fetch(`/api/changes/${changeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'angenommen', massnahmeId: newM.id }),
      });
      setConvertingId(null);
      setConvertForm({});
      load();
    } finally {
      setConvertBusy(false);
    }
  };

  const getStatusStyle = (status) => STATUS_OPTIONS.find(s => s.value === status)?.color || 'bg-bg-elevated text-txt-secondary';

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-heading font-semibold text-txt-primary">Change-Vorschläge</h2>
        <div className="flex items-center gap-3 text-[10px] font-mono flex-wrap">
          <span className="text-txt-tertiary">{stats.total} total</span>
          <span className="text-status-yellow">{stats.eingereicht} neu</span>
          <span className="text-status-blue">{stats.pruefung} in Prüfung</span>
          <span className="text-status-green">{stats.angenommen} angenommen</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-txt-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Suchen (Titel, Beschreibung, Kontakt)..."
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs pl-8 pr-3 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        >
          <option value="">Alle Status</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <select
          value={clusterFilter}
          onChange={e => setClusterFilter(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        >
          <option value="">Alle Cluster</option>
          {CLUSTER_OPTIONS.filter(Boolean).map(cl => <option key={cl} value={cl}>{cl}</option>)}
        </select>
        <span className="text-xs text-txt-tertiary font-mono ml-auto">{filtered.length} / {changes.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-8 text-center">
          <Clock className="w-8 h-8 text-txt-tertiary mx-auto mb-3" />
          <p className="text-sm text-txt-secondary">{changes.length === 0 ? 'Noch keine Change-Vorschläge eingegangen.' : 'Keine Vorschläge für diesen Filter.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
              const isExpanded = expanded === c.id;
              const patch = editData[c.id] || {};
              const currentStatus = patch.status ?? c.status;
              const currentCluster = patch.cluster ?? c.cluster;
              const currentMassnahme = patch.massnahmeId ?? c.massnahmeId;
              const currentNotiz = patch.adminNotiz ?? c.adminNotiz;
              const isDirty = Object.keys(patch).length > 0;

              return (
                <div key={c.id} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-elevated/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="text-sm font-heading font-semibold text-txt-primary">{c.titel}</h4>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${getStatusStyle(c.status)}`}>
                          {STATUS_OPTIONS.find(s => s.value === c.status)?.label || c.status}
                        </span>
                        {c.readiness?.widerstand && (
                          <span className={`text-[10px] font-mono ${WIDERSTAND_COLORS[c.readiness.widerstand] || 'text-txt-tertiary'}`}>
                            Widerstand: {c.readiness.widerstand}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-txt-secondary line-clamp-1">{c.beschreibung}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-txt-tertiary">
                        {(c.kontakt || c.kontaktEmail) && (
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {c.kontakt} {c.kontaktEmail && `(${c.kontaktEmail})`}</span>
                        )}
                        {c.timestamp && (
                          <span className="font-mono">{new Date(c.timestamp).toLocaleDateString('de-CH')}</span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-txt-tertiary mt-1 shrink-0" /> : <ChevronRight className="w-4 h-4 text-txt-tertiary mt-1 shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-bd-faint p-4 space-y-4">
                      {/* Description */}
                      <div>
                        <h5 className="text-[10px] font-mono text-txt-tertiary mb-1">Beschreibung</h5>
                        <p className="text-xs text-txt-secondary leading-relaxed">{c.beschreibung}</p>
                      </div>

                      {/* Readiness Assessment */}
                      {c.readiness && (
                        <div>
                          <h5 className="text-[10px] font-mono text-txt-tertiary mb-2">Change-Readiness Assessment</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: 'Betroffen', val: c.readiness.betroffen },
                              { label: 'Änderung', val: c.readiness.aenderung },
                              { label: 'Widerstand', val: c.readiness.widerstand },
                              { label: 'Change Agent', val: c.readiness.changeAgent },
                              { label: 'Kommunikation', val: c.readiness.kommunikation },
                              { label: 'Bedarf', val: c.readiness.bedarf },
                            ].filter(f => f.val).map(f => (
                              <div key={f.label} className="bg-bg-elevated rounded-sm px-3 py-2">
                                <p className="text-[10px] text-txt-tertiary font-mono mb-0.5">{f.label}</p>
                                <p className="text-xs text-txt-secondary">{f.val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.zustaendigerAgent && (
                        <div className="flex items-center gap-2 text-xs text-txt-secondary">
                          <User className="w-3.5 h-3.5 text-scnat-teal" />
                          <span>Vorgeschlagener Change Agent: <strong className="text-txt-primary">{c.zustaendigerAgent}</strong></span>
                        </div>
                      )}

                      {/* Admin Controls */}
                      <div className="border-t border-bd-faint pt-4">
                        <h5 className="text-[10px] font-mono text-txt-tertiary mb-3">Admin-Steuerung</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Status</label>
                            <select
                              value={currentStatus}
                              onChange={e => updateEdit(c.id, 'status', e.target.value)}
                              className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                            >
                              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Cluster zuweisen</label>
                            <select
                              value={currentCluster}
                              onChange={e => updateEdit(c.id, 'cluster', e.target.value)}
                              className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                            >
                              <option value="">– Kein Cluster –</option>
                              {CLUSTER_OPTIONS.filter(Boolean).map(cl => <option key={cl} value={cl}>{cl}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Massnahme verknüpfen</label>
                            <select
                              value={currentMassnahme}
                              onChange={e => updateEdit(c.id, 'massnahmeId', e.target.value)}
                              className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                            >
                              <option value="">– Keine –</option>
                              {massnahmen.map(m => <option key={m.id} value={m.id}>{m.id.toUpperCase()} – {m.titel}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Admin-Notiz</label>
                          <input
                            value={currentNotiz}
                            onChange={e => updateEdit(c.id, 'adminNotiz', e.target.value)}
                            placeholder="Interne Notiz zum Vorschlag..."
                            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {isDirty && (
                            <button
                              onClick={() => handleSave(c)}
                              className="flex items-center gap-1 bg-status-green/15 text-status-green text-xs px-3 py-1.5 rounded-sm hover:bg-status-green/25 transition-colors"
                            >
                              <Save className="w-3 h-3" /> Speichern
                            </button>
                          )}
                          {!c.massnahmeId && (
                            <button
                              onClick={() => convertingId === c.id ? setConvertingId(null) : startConvert(c)}
                              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-sm transition-colors ${
                                convertingId === c.id
                                  ? 'bg-scnat-red/15 text-scnat-red'
                                  : 'bg-status-blue/15 text-status-blue hover:bg-status-blue/25'
                              }`}
                            >
                              <Rocket className="w-3 h-3" /> {convertingId === c.id ? 'Abbrechen' : 'Zur Massnahme machen'}
                            </button>
                          )}
                          <button
                            onClick={() => { setReplyingTo(replyingTo === c.id ? null : c.id); setReplyText(c.antwort || ''); }}
                            className="flex items-center gap-1 text-xs text-scnat-teal hover:text-scnat-teal/80 px-3 py-1.5 rounded-sm hover:bg-scnat-teal/10 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" /> Antworten
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="flex items-center gap-1 text-xs text-txt-tertiary hover:text-scnat-red px-3 py-1.5 rounded-sm hover:bg-scnat-red/10 transition-colors ml-auto"
                          >
                            <Trash2 className="w-3 h-3" /> Löschen
                          </button>
                        </div>

                        {/* Convert to Massnahme form */}
                        {convertingId === c.id && (
                          <div className="mt-3 bg-status-blue/5 border border-status-blue/20 rounded-sm p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                              <ListChecks className="w-4 h-4 text-status-blue" />
                              <span className="text-xs font-heading font-semibold text-txt-primary">Neue Massnahme aus Change-Vorschlag</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Titel</label>
                                <input
                                  value={convertForm.titel || ''}
                                  onChange={e => setConvertForm(f => ({ ...f, titel: e.target.value }))}
                                  className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Beschreibung</label>
                                <textarea
                                  value={convertForm.beschreibung || ''}
                                  onChange={e => setConvertForm(f => ({ ...f, beschreibung: e.target.value }))}
                                  rows={2}
                                  className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Cluster</label>
                                <select
                                  value={convertForm.cluster || ''}
                                  onChange={e => setConvertForm(f => ({ ...f, cluster: e.target.value }))}
                                  className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                                >
                                  <option value="">– Cluster wählen –</option>
                                  {CLUSTER_OPTIONS.filter(Boolean).map(cl => <option key={cl} value={cl}>{cl}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Priorität</label>
                                <select
                                  value={convertForm.prioritaet || 'B'}
                                  onChange={e => setConvertForm(f => ({ ...f, prioritaet: e.target.value }))}
                                  className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                                >
                                  {PRIO_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.value} – {p.label}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Wirkung: <strong className="text-status-green">{convertForm.wirkung}</strong></label>
                                <input
                                  type="range" min="0" max="10" step="0.5"
                                  value={convertForm.wirkung || 5}
                                  onChange={e => setConvertForm(f => ({ ...f, wirkung: parseFloat(e.target.value) }))}
                                  className="w-full accent-status-green"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Aufwand: <strong className="text-scnat-red">{convertForm.aufwand}</strong></label>
                                <input
                                  type="range" min="0" max="10" step="0.5"
                                  value={convertForm.aufwand || 5}
                                  onChange={e => setConvertForm(f => ({ ...f, aufwand: parseFloat(e.target.value) }))}
                                  className="w-full accent-scnat-red"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 flex-wrap">
                              <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                                <input type="checkbox" checked={convertForm.start_empfohlen || false} onChange={e => setConvertForm(f => ({ ...f, start_empfohlen: e.target.checked }))} className="accent-status-yellow" />
                                Start empfohlen
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                                <input type="checkbox" checked={convertForm.scnat_db || false} onChange={e => setConvertForm(f => ({ ...f, scnat_db: e.target.checked }))} className="accent-status-blue" />
                                SCNAT DB
                              </label>
                              <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                                <input type="checkbox" checked={convertForm.scnat_portal || false} onChange={e => setConvertForm(f => ({ ...f, scnat_portal: e.target.checked }))} />
                                SCNAT Portal
                              </label>
                            </div>
                            {/* Tags */}
                            <div>
                              <label className="block text-[10px] text-txt-tertiary font-mono mb-1.5">Tags</label>
                              <div className="flex flex-wrap gap-1.5">
                                {TAG_OPTIONS.map(tag => (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => setConvertForm(f => ({
                                      ...f,
                                      tags: f.tags?.includes(tag) ? f.tags.filter(t => t !== tag) : [...(f.tags || []), tag],
                                    }))}
                                    className={`text-[10px] px-2 py-1 rounded-sm transition-colors ${
                                      convertForm.tags?.includes(tag) ? 'bg-scnat-red/15 text-scnat-red font-medium' : 'bg-bg-elevated text-txt-tertiary hover:text-txt-secondary'
                                    }`}
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleConvert(c.id)}
                                disabled={convertBusy || !convertForm.titel?.trim()}
                                className="flex items-center gap-1.5 bg-scnat-red text-white text-xs px-4 py-2 rounded-sm hover:bg-scnat-darkred disabled:opacity-50 transition-colors"
                              >
                                <ListChecks className="w-3.5 h-3.5" />
                                {convertBusy ? 'Erstelle…' : 'Massnahme erstellen & verknüpfen'}
                              </button>
                              <button
                                onClick={() => setConvertingId(null)}
                                className="text-xs text-txt-tertiary hover:text-txt-primary px-3 py-1.5"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Existing reply */}
                        {c.antwort && replyingTo !== c.id && (
                          <div className="mt-3 bg-status-green/5 border border-status-green/20 rounded-sm px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-1">
                              <MessageSquare className="w-3.5 h-3.5 text-status-green" />
                              <span className="text-[10px] font-mono text-status-green font-medium">
                                Antwort{c.antwortTimestamp ? ` · ${new Date(c.antwortTimestamp).toLocaleDateString('de-CH')}` : ''}
                              </span>
                            </div>
                            <p className="text-xs text-txt-primary leading-relaxed">{c.antwort}</p>
                          </div>
                        )}

                        {/* Reply form */}
                        {replyingTo === c.id && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Antwort an den/die Einreichende/n..."
                              rows={3}
                              className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReply(c.id)}
                                className="flex items-center gap-1 bg-scnat-teal text-white text-xs px-3 py-1.5 rounded-sm hover:bg-scnat-teal/80 transition-colors"
                              >
                                <Send className="w-3 h-3" /> Senden
                              </button>
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="text-xs text-txt-tertiary hover:text-txt-primary px-3 py-1.5"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
