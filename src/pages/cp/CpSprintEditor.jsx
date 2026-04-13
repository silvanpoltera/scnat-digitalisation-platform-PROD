import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, X, Search, PlusCircle } from 'lucide-react';

const CLUSTER_OPTIONS = [
  { value: 'infrastruktur', label: 'Infrastruktur', color: '#0098DA' },
  { value: 'datenstrategie', label: 'Datenstrategie', color: '#7C5CBF' },
  { value: 'prozessdigitalisierung', label: 'Prozessdigitalisierung', color: '#008770' },
  { value: 'kommunikation', label: 'Kommunikation', color: '#EA515A' },
  { value: 'skills', label: 'Skills', color: '#F07800' },
  { value: 'compliance', label: 'Compliance', color: '#5A616B' },
];

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Geplant' },
  { value: 'active', label: 'Aktiv' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Abgeschlossen' },
];

const M_STATUS_OPTIONS = [
  { value: 'geplant', label: 'Backlog' },
  { value: 'in_umsetzung', label: 'In Bearbeitung' },
  { value: 'blockiert', label: 'Blockiert' },
  { value: 'abgeschlossen', label: 'Erledigt' },
  { value: 'sistiert', label: 'Sistiert' },
];

export default function CpSprintEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    name: '', cluster: 'infrastruktur', clusterColor: '#0098DA',
    description: '', startDate: '', endDate: '', status: 'planned',
    massnahmen: [],
  });
  const [allMassnahmen, setAllMassnahmen] = useState([]);
  const [mSearch, setMSearch] = useState('');
  const [mClusterFilter, setMClusterFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [showNewM, setShowNewM] = useState(false);
  const [newMTitel, setNewMTitel] = useState('');
  const [newMCluster, setNewMCluster] = useState('');
  const [creatingM, setCreatingM] = useState(false);

  useEffect(() => {
    fetch('/api/massnahmen', { credentials: 'include' })
      .then(r => r.json())
      .then(setAllMassnahmen)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/sprints/${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
          setForm({
            name: data.name || '',
            cluster: data.cluster || 'infrastruktur',
            clusterColor: data.clusterColor || '#0098DA',
            description: data.description || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            status: data.status || 'planned',
            massnahmen: data.massnahmen || [],
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const assignedIds = new Set(form.massnahmen.map(m => m.massnahmeId));

  const availableMassnahmen = useMemo(() => {
    let ms = allMassnahmen.filter(m => !assignedIds.has(m.id));
    if (mClusterFilter) ms = ms.filter(m => m.cluster === mClusterFilter);
    if (mSearch.trim()) {
      const q = mSearch.toLowerCase();
      ms = ms.filter(m => m.titel.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
    }
    ms.sort((a, b) => (a.reihenfolge || Infinity) - (b.reihenfolge || Infinity));
    return ms;
  }, [allMassnahmen, assignedIds, mClusterFilter, mSearch]);

  const handleClusterChange = (value) => {
    const opt = CLUSTER_OPTIONS.find(c => c.value === value);
    setForm(f => ({ ...f, cluster: value, clusterColor: opt?.color || '#0098DA' }));
  };

  const addMassnahme = (m) => {
    setForm(f => ({
      ...f,
      massnahmen: [...f.massnahmen, {
        massnahmeId: m.id, status: 'geplant', verantwortliche: '', notiz: '', progress: 0,
        titel: m.titel, cluster: m.cluster,
      }],
    }));
  };

  const removeMassnahme = (massnahmeId) => {
    setForm(f => ({ ...f, massnahmen: f.massnahmen.filter(m => m.massnahmeId !== massnahmeId) }));
  };

  const updateMassnahme = (massnahmeId, field, value) => {
    setForm(f => ({
      ...f,
      massnahmen: f.massnahmen.map(m =>
        m.massnahmeId === massnahmeId ? { ...m, [field]: value } : m
      ),
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      ...form,
      massnahmen: form.massnahmen.map(({ massnahmeId, status, verantwortliche, notiz, progress }) => ({
        massnahmeId, status, verantwortliche, notiz, progress: Number(progress) || 0,
      })),
    };

    try {
      const url = isNew ? '/api/sprints' : `/api/sprints/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      navigate('/cp/sprints');
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMassnahme = useCallback(async () => {
    if (!newMTitel.trim()) return;
    setCreatingM(true);
    try {
      const res = await fetch('/api/massnahmen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          titel: newMTitel.trim(),
          beschreibung: '',
          cluster: newMCluster || CLUSTER_OPTIONS[0].label,
          status: 'geplant',
          tags: [],
          wirkung: 0,
          aufwand: 0,
          prioritaet: 'C',
          prioritaet_label: 'Mittelfristig',
          start_empfohlen: false,
          scnat_db: false,
          scnat_portal: false,
        }),
      });
      const created = await res.json();
      setAllMassnahmen(prev => [...prev, created]);
      addMassnahme(created);
      setNewMTitel('');
      setShowNewM(false);
    } catch { /* silent */ }
    finally { setCreatingM(false); }
  }, [newMTitel, newMCluster]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-scnat-red/30 border-t-scnat-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">{isNew ? 'Sprint erstellen' : 'Sprint bearbeiten'}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/cp/sprints')}
            className="text-sm text-txt-secondary border border-bd-default rounded-[3px] px-4 py-2 hover:border-bd-strong transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="text-sm font-medium text-white bg-scnat-red hover:bg-scnat-red/90 disabled:opacity-50 px-4 py-2 rounded-[3px] transition-colors"
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1.5">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-bg-surface border border-bd-default rounded-[3px] px-3 py-2 text-sm text-txt-primary outline-none focus:border-scnat-red/50 transition-colors"
            placeholder="Sprint 05 – Thema"
          />
        </div>
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1.5">Cluster</label>
          <select
            value={form.cluster}
            onChange={e => handleClusterChange(e.target.value)}
            className="w-full bg-bg-surface border border-bd-default rounded-[3px] px-3 py-2 text-sm text-txt-primary outline-none focus:border-scnat-red/50 transition-colors"
          >
            {CLUSTER_OPTIONS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1.5">Beschreibung</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2}
            className="w-full bg-bg-surface border border-bd-default rounded-[3px] px-3 py-2 text-sm text-txt-primary outline-none focus:border-scnat-red/50 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1.5">Startdatum</label>
          <input
            type="date"
            value={form.startDate}
            onChange={e => {
              const start = e.target.value;
              const updates = { startDate: start };
              if (start && !form.endDate) {
                const d = new Date(start);
                d.setDate(d.getDate() + 28);
                updates.endDate = d.toISOString().split('T')[0];
              }
              setForm(f => ({ ...f, ...updates }));
            }}
            className="w-full bg-bg-surface border border-bd-default rounded-[3px] px-3 py-2 text-sm text-txt-primary outline-none focus:border-scnat-red/50 transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1.5">Enddatum</label>
          <input
            type="date"
            value={form.endDate}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
            className="w-full bg-bg-surface border border-bd-default rounded-[3px] px-3 py-2 text-sm text-txt-primary outline-none focus:border-scnat-red/50 transition-colors"
          />
        </div>
        <div>
          <label className="block font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1.5">Status</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full bg-bg-surface border border-bd-default rounded-[3px] px-3 py-2 text-sm text-txt-primary outline-none focus:border-scnat-red/50 transition-colors"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Massnahmen Assignment */}
      <h2 className="text-lg font-bold mb-4">Massnahmen zuweisen</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Available */}
        <div className="bg-bg-surface border border-bd-faint rounded-[3px] p-4 max-h-[500px] overflow-y-auto">
          <div className="font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-3">
            Verfügbare Massnahmen ({availableMassnahmen.length})
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-bg-elevated border border-bd-default rounded-[3px] px-2 py-1 flex-1 min-w-0">
              <Search className="w-3 h-3 text-txt-tertiary shrink-0" />
              <input
                type="text"
                placeholder="Suchen…"
                value={mSearch}
                onChange={e => setMSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-[12px] text-txt-primary w-full placeholder:text-txt-tertiary"
              />
            </div>
            <select
              value={mClusterFilter}
              onChange={e => setMClusterFilter(e.target.value)}
              className="bg-bg-elevated border border-bd-default rounded-[3px] px-2 py-1 text-[11px] text-txt-secondary outline-none"
            >
              <option value="">Alle Cluster</option>
              {[...new Set(allMassnahmen.map(m => m.cluster))].filter(Boolean).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            {availableMassnahmen.map(m => (
              <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-bg-elevated transition-colors group">
                <span className="font-mono text-[9px] text-txt-tertiary shrink-0">{m.id}</span>
                <span className="text-[12px] text-txt-primary truncate flex-1">{m.titel}</span>
                <button
                  onClick={() => addMassnahme(m)}
                  className="p-1 rounded-sm text-txt-tertiary hover:text-scnat-red hover:bg-scnat-red/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {availableMassnahmen.length === 0 && !showNewM && (
              <div className="py-6 text-center text-[11px] text-txt-tertiary">Keine verfügbaren Massnahmen</div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-bd-faint">
            {showNewM ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newMTitel}
                  onChange={e => setNewMTitel(e.target.value)}
                  placeholder="Titel der neuen Massnahme"
                  className="w-full bg-bg-elevated border border-bd-default rounded-sm px-2.5 py-1.5 text-[12px] text-txt-primary outline-none focus:border-scnat-red/50"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && newMTitel.trim()) handleCreateMassnahme(); if (e.key === 'Escape') setShowNewM(false); }}
                />
                <select
                  value={newMCluster}
                  onChange={e => setNewMCluster(e.target.value)}
                  className="w-full bg-bg-elevated border border-bd-default rounded-sm px-2 py-1.5 text-[11px] text-txt-secondary outline-none"
                >
                  <option value="">Cluster wählen…</option>
                  {[...new Set(allMassnahmen.map(m => m.cluster))].filter(Boolean).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCreateMassnahme}
                    disabled={!newMTitel.trim() || creatingM}
                    className="text-[11px] font-medium text-white bg-scnat-red hover:bg-scnat-red/90 disabled:opacity-40 px-3 py-1.5 rounded-sm transition-colors"
                  >
                    {creatingM ? 'Erstellen…' : 'Erstellen & zuweisen'}
                  </button>
                  <button
                    onClick={() => { setShowNewM(false); setNewMTitel(''); }}
                    className="text-[11px] text-txt-tertiary hover:text-txt-secondary px-2 py-1.5"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewM(true)}
                className="flex items-center gap-1.5 text-[11px] text-txt-secondary hover:text-scnat-red transition-colors w-full py-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Neue Massnahme anlegen
              </button>
            )}
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-bg-surface border border-bd-faint rounded-[3px] p-4 max-h-[500px] overflow-y-auto">
          <div className="font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-3">
            Im Sprint ({form.massnahmen.length})
          </div>
          <div className="space-y-3">
            {form.massnahmen.map(m => (
              <div key={m.massnahmeId} className="bg-bg-elevated border border-bd-default rounded-[3px] p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-[9px] text-txt-tertiary">{m.massnahmeId}</span>
                    <div className="text-[13px] font-medium text-txt-primary">{m.titel || m.massnahmeId}</div>
                  </div>
                  <button
                    onClick={() => removeMassnahme(m.massnahmeId)}
                    className="p-1 rounded-sm text-txt-tertiary hover:text-scnat-red hover:bg-scnat-red/10 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-mono text-[8px] uppercase text-txt-tertiary mb-0.5 block">Status</label>
                    <select
                      value={m.status}
                      onChange={e => updateMassnahme(m.massnahmeId, 'status', e.target.value)}
                      className="w-full bg-bg-surface border border-bd-faint rounded-sm px-2 py-1 text-[11px] text-txt-primary outline-none"
                    >
                      {M_STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-mono text-[8px] uppercase text-txt-tertiary mb-0.5 block">Verantwortliche:r</label>
                    <input
                      type="text"
                      value={m.verantwortliche}
                      onChange={e => updateMassnahme(m.massnahmeId, 'verantwortliche', e.target.value)}
                      className="w-full bg-bg-surface border border-bd-faint rounded-sm px-2 py-1 text-[11px] text-txt-primary outline-none"
                      placeholder="Name"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="font-mono text-[8px] uppercase text-txt-tertiary mb-0.5 block">Notiz</label>
                    <input
                      type="text"
                      value={m.notiz || ''}
                      onChange={e => updateMassnahme(m.massnahmeId, 'notiz', e.target.value)}
                      className="w-full bg-bg-surface border border-bd-faint rounded-sm px-2 py-1 text-[11px] text-txt-primary outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>
              </div>
            ))}
            {form.massnahmen.length === 0 && (
              <div className="py-8 text-center text-[11px] text-txt-tertiary">
                Noch keine Massnahmen zugewiesen.<br />
                Wähle links Massnahmen aus.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
