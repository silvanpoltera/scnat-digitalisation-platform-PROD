import { useState, useEffect, useMemo } from 'react';
import { Save, Plus, X, ChevronDown, ChevronRight, Star, Activity, Database, Search } from 'lucide-react';

const PRIO_OPTIONS = ['A', 'B', 'C', 'D'];
const PRIO_LABEL = { A: 'Quick Win', B: 'Strategisch', C: 'Mittelfristig', D: 'Langfristig' };
const STATUS_OPTIONS = ['geplant', 'in_umsetzung', 'abgeschlossen', 'sistiert'];
const STATUS_COLORS = {
  geplant: 'bg-bg-elevated text-txt-secondary',
  in_umsetzung: 'bg-status-green/15 text-status-green',
  abgeschlossen: 'bg-scnat-teal/15 text-scnat-teal',
  sistiert: 'bg-scnat-red/15 text-scnat-red',
};
const TAG_OPTIONS = ['Schulungen', 'Befähigungen', 'Beschaffung', 'Information & Transparenz', 'Kommunikation'];
const CLUSTER_OPTIONS = [
  'Digitale Kultur & Befähigung', 'Infrastruktur & Beschaffung',
  'Kommunikation & Transparenz', 'Prozesse & Methoden',
  'Strategie & Steuerung', 'Daten & Wissen',
];

export default function CpMassnahmen() {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newItem, setNewItem] = useState({
    titel: '', beschreibung: '', cluster: CLUSTER_OPTIONS[0],
    wirkung: 5, aufwand: 5, prioritaet: 'C', status: 'geplant',
    tags: [], start_empfohlen: false, scnat_db: false, scnat_portal: false, notiz: '',
  });

  const load = () => {
    fetch('/api/massnahmen', { credentials: 'include' }).then(r => r.json()).then(setData).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.titel.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.cluster?.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter(m => m.status === filterStatus);
    return result;
  }, [data, search, filterStatus]);

  const stats = useMemo(() => ({
    total: data.length,
    geplant: data.filter(m => m.status === 'geplant').length,
    aktiv: data.filter(m => m.status === 'in_umsetzung').length,
    start5: data.filter(m => m.start_empfohlen).length,
    db: data.filter(m => m.scnat_db).length,
  }), [data]);

  const handleSave = async (m) => {
    await fetch(`/api/massnahmen/${m.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(m),
    });
    setEditing(null);
    load();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/massnahmen', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...newItem, prioritaet_label: PRIO_LABEL[newItem.prioritaet] || '' }),
    });
    setShowAdd(false);
    setNewItem({ titel: '', beschreibung: '', cluster: CLUSTER_OPTIONS[0], wirkung: 5, aufwand: 5, prioritaet: 'C', status: 'geplant', tags: [], start_empfohlen: false, scnat_db: false, scnat_portal: false, notiz: '' });
    load();
  };

  const updateLocal = (id, field, value) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const toggleTag = (m, tag) => {
    const tags = m.tags?.includes(tag) ? m.tags.filter(t => t !== tag) : [...(m.tags || []), tag];
    updateLocal(m.id, 'tags', tags);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Massnahmen verwalten</h2>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-txt-tertiary">
            <span>{stats.total} total</span>
            <span className="text-status-green">{stats.aktiv} aktiv</span>
            <span className="text-status-yellow">{stats.start5} «Start 5»</span>
            <span className="text-status-blue">{stats.db} DB</span>
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
          <Plus className="w-4 h-4" /> Neue Massnahme
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-txt-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Suchen..."
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs pl-8 pr-3 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        >
          <option value="">Alle Status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-txt-tertiary font-mono ml-auto">{filtered.length} angezeigt</span>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={newItem.titel} onChange={e => setNewItem({ ...newItem, titel: e.target.value })} required placeholder="Titel" className="bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none sm:col-span-2" />
            <textarea value={newItem.beschreibung} onChange={e => setNewItem({ ...newItem, beschreibung: e.target.value })} placeholder="Beschreibung" rows={2} className="bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none sm:col-span-2 resize-none" />
            <select value={newItem.cluster} onChange={e => setNewItem({ ...newItem, cluster: e.target.value })} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none">
              {CLUSTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={newItem.prioritaet} onChange={e => setNewItem({ ...newItem, prioritaet: e.target.value })} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none">
              {PRIO_OPTIONS.map(p => <option key={p} value={p}>Prio {p} – {PRIO_LABEL[p]}</option>)}
            </select>
            <div className="flex items-center gap-4">
              <label className="text-xs text-txt-secondary">Wirkung: <strong>{newItem.wirkung}</strong></label>
              <input type="range" min="0" max="10" step="0.5" value={newItem.wirkung} onChange={e => setNewItem({ ...newItem, wirkung: parseFloat(e.target.value) })} className="flex-1 accent-scnat-red" />
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs text-txt-secondary">Aufwand: <strong>{newItem.aufwand}</strong></label>
              <input type="range" min="0" max="10" step="0.5" value={newItem.aufwand} onChange={e => setNewItem({ ...newItem, aufwand: parseFloat(e.target.value) })} className="flex-1 accent-scnat-red" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer"><input type="checkbox" checked={newItem.start_empfohlen} onChange={e => setNewItem({ ...newItem, start_empfohlen: e.target.checked })} /> Start empfohlen</label>
            <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer"><input type="checkbox" checked={newItem.scnat_db} onChange={e => setNewItem({ ...newItem, scnat_db: e.target.checked })} /> SCNAT-DB</label>
            <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer"><input type="checkbox" checked={newItem.scnat_portal} onChange={e => setNewItem({ ...newItem, scnat_portal: e.target.checked })} /> SCNAT-Portal</label>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] transition-colors">Erstellen</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-txt-secondary hover:text-txt-primary px-3 py-2">Abbrechen</button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-2">
        {filtered.map(m => {
          const isEditing = editing === m.id;
          return (
            <div key={m.id} className={`bg-bg-surface border rounded-sm ${isEditing ? 'border-scnat-red/30' : 'border-bd-faint'}`}>
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                      m.prioritaet === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
                      m.prioritaet === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
                      m.prioritaet === 'C' ? 'bg-status-blue/15 text-status-blue' :
                      'bg-bg-elevated text-txt-tertiary'
                    }`}>Prio {m.prioritaet}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${STATUS_COLORS[m.status] || STATUS_COLORS.geplant}`}>{m.status}</span>
                    {m.start_empfohlen && <Star className="w-3 h-3 text-status-yellow" />}
                    {m.scnat_db && <Database className="w-3 h-3 text-status-blue" />}
                  </div>
                  <h4 className="text-sm text-txt-primary font-medium">{m.titel}</h4>
                  <p className="text-xs text-txt-secondary truncate">{m.beschreibung}</p>
                  <p className="text-[10px] text-txt-tertiary mt-0.5">{m.cluster}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(m)} className="flex items-center gap-1 bg-status-green/15 text-status-green text-xs px-2 py-1 rounded-sm hover:bg-status-green/25"><Save className="w-3 h-3" />Speichern</button>
                      <button onClick={() => { setEditing(null); load(); }} className="text-xs text-txt-tertiary hover:text-txt-secondary"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(m.id)} className="text-xs text-txt-secondary hover:text-txt-primary px-2 py-1 rounded-sm hover:bg-bg-elevated">Bearbeiten</button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="border-t border-bd-faint p-4 space-y-4">
                  {/* Basic fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Titel</label>
                      <input value={m.titel} onChange={e => updateLocal(m.id, 'titel', e.target.value)} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Beschreibung</label>
                      <textarea value={m.beschreibung} onChange={e => updateLocal(m.id, 'beschreibung', e.target.value)} rows={2} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Cluster</label>
                      <select value={m.cluster} onChange={e => updateLocal(m.id, 'cluster', e.target.value)} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none">
                        {CLUSTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Status</label>
                      <select value={m.status} onChange={e => updateLocal(m.id, 'status', e.target.value)} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Priorität</label>
                      <select value={m.prioritaet} onChange={e => { updateLocal(m.id, 'prioritaet', e.target.value); updateLocal(m.id, 'prioritaet_label', PRIO_LABEL[e.target.value]); }} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none">
                        {PRIO_OPTIONS.map(p => <option key={p} value={p}>Prio {p} – {PRIO_LABEL[p]}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Wirkung: <strong className="text-status-green">{m.wirkung}</strong></label>
                      <input type="range" min="0" max="10" step="0.1" value={m.wirkung || 0} onChange={e => updateLocal(m.id, 'wirkung', parseFloat(e.target.value))} className="w-full accent-[#2ECC71]" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Aufwand: <strong className="text-scnat-red">{m.aufwand}</strong></label>
                      <input type="range" min="0" max="10" step="0.5" value={m.aufwand || 0} onChange={e => updateLocal(m.id, 'aufwand', parseFloat(e.target.value))} className="w-full accent-scnat-red" />
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="flex items-center gap-5 flex-wrap">
                    <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                      <input type="checkbox" checked={m.start_empfohlen || false} onChange={e => updateLocal(m.id, 'start_empfohlen', e.target.checked)} className="rounded-sm accent-status-yellow" />
                      <Star className="w-3 h-3 text-status-yellow" /> Start empfohlen
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                      <input type="checkbox" checked={m.scnat_db || false} onChange={e => updateLocal(m.id, 'scnat_db', e.target.checked)} className="rounded-sm accent-status-blue" />
                      <Database className="w-3 h-3 text-status-blue" /> SCNAT-DB
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                      <input type="checkbox" checked={m.scnat_portal || false} onChange={e => updateLocal(m.id, 'scnat_portal', e.target.checked)} className="rounded-sm" />
                      SCNAT-Portal
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
                          onClick={() => toggleTag(m, tag)}
                          className={`text-[10px] px-2 py-1 rounded-sm transition-colors ${
                            m.tags?.includes(tag) ? 'bg-scnat-red/15 text-scnat-red font-medium' : 'bg-bg-elevated text-txt-tertiary hover:text-txt-secondary'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notiz */}
                  <div>
                    <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Notiz</label>
                    <input value={m.notiz || ''} onChange={e => updateLocal(m.id, 'notiz', e.target.value)} placeholder="Interne Notiz..." className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
