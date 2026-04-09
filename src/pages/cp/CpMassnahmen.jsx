import { useState, useEffect, useMemo, useCallback } from 'react';
import { Save, Plus, X, ChevronDown, ChevronRight, Star, Activity, Database, Search, Sparkles, GripVertical, ArrowUpDown, List } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

function SortableItem({ m, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : undefined, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 bg-bg-surface border rounded-sm px-4 py-3 ${isDragging ? 'border-scnat-red/40 shadow-lg' : 'border-bd-faint'}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-txt-tertiary hover:text-txt-secondary p-0.5 touch-none">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-xs font-heading font-bold shrink-0 ${index <= 6 ? 'bg-scnat-red/15 text-scnat-red' : 'bg-bg-elevated text-txt-tertiary'}`}>
        {index}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
          {m.isNew && <span className="text-[10px] font-mono bg-scnat-teal/15 text-scnat-teal px-1.5 py-0.5 rounded-sm font-semibold">NEU</span>}
        </div>
        <h4 className="text-sm text-txt-primary font-medium truncate">{m.titel}</h4>
        <p className="text-[10px] text-txt-tertiary">{m.cluster}</p>
      </div>
      {index === 6 && <div className="text-[9px] font-mono text-scnat-red bg-scnat-red/10 px-2 py-0.5 rounded-sm shrink-0 hidden sm:block">Ende Welle 1</div>}
      {index === 12 && <div className="text-[9px] font-mono text-txt-tertiary bg-bg-elevated px-2 py-0.5 rounded-sm shrink-0 hidden sm:block">Ende Welle 2</div>}
    </div>
  );
}

function ReorderView({ data, onSave }) {
  const ordered = useMemo(() =>
    data.filter(m => m.reihenfolge > 0).sort((a, b) => a.reihenfolge - b.reihenfolge),
    [data]
  );

  const [items, setItems] = useState(ordered);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(ordered); setDirty(false); }, [ordered]);

  const itemIds = useMemo(() => new Set(items.map(m => m.id)), [items]);
  const unordered = useMemo(() =>
    data.filter(m => !itemIds.has(m.id)),
    [data, itemIds]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIdx = prev.findIndex(m => m.id === active.id);
      const newIdx = prev.findIndex(m => m.id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
    setDirty(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const order = items.map((m, i) => ({ id: m.id, reihenfolge: i + 1 }));
    await fetch('/api/massnahmen/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ order }),
    });
    setSaving(false);
    setDirty(false);
    onSave();
  };

  const addToOrder = (m) => {
    setItems(prev => [...prev, { ...m, reihenfolge: prev.length + 1 }]);
    setDirty(true);
  };

  const removeFromOrder = (id) => {
    setItems(prev => prev.filter(m => m.id !== id));
    setDirty(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-txt-primary font-medium">Drag & Drop Reihenfolge</p>
            <p className="text-xs text-txt-secondary">Position 1–6 = «Start mit 6» (Erste Welle) · 7–12 = Zweite Welle</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-sm transition-colors ${dirty ? 'bg-scnat-red text-white hover:bg-[#F06570]' : 'bg-bg-elevated text-txt-tertiary cursor-not-allowed'}`}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichern…' : dirty ? 'Reihenfolge speichern' : 'Gespeichert'}
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(m => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {items.length === 0 && (
              <p className="text-sm text-txt-tertiary text-center py-8">Keine priorisierten Massnahmen. Füge welche hinzu.</p>
            )}
            {items.map((m, i) => (
              <div key={m.id} className="relative group">
                <SortableItem m={m} index={i + 1} />
                <button
                  onClick={() => removeFromOrder(m.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-txt-tertiary hover:text-scnat-red p-1 transition-opacity"
                  title="Aus Reihenfolge entfernen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {i === 5 && <div className="border-t-2 border-dashed border-scnat-red/20 mt-1.5" />}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {unordered.length > 0 && (
        <div>
          <h4 className="text-xs font-mono text-txt-tertiary mb-2">Nicht priorisiert ({unordered.length})</h4>
          <div className="space-y-1">
            {unordered.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-bg-surface border border-bd-faint rounded-sm px-4 py-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono text-txt-tertiary mr-2">{m.id.toUpperCase()}</span>
                  <span className="text-xs text-txt-secondary">{m.titel}</span>
                </div>
                <button
                  onClick={() => addToOrder(m)}
                  className="text-[10px] text-scnat-teal hover:text-scnat-teal/80 font-medium px-2 py-1 rounded-sm hover:bg-scnat-teal/10 transition-colors shrink-0"
                >
                  + Hinzufügen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CpMassnahmen() {
  const [data, setData] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [view, setView] = useState('list');
  const [newItem, setNewItem] = useState({
    titel: '', beschreibung: '', cluster: CLUSTER_OPTIONS[0],
    wirkung: 5, aufwand: 5, prioritaet: 'C', status: 'geplant',
    tags: [], start_empfohlen: false, scnat_db: false, scnat_portal: false, isNew: false, reihenfolge: null, notiz: '',
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
    start6: data.filter(m => m.start_empfohlen).length,
    neu: data.filter(m => m.isNew).length,
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
    setNewItem({ titel: '', beschreibung: '', cluster: CLUSTER_OPTIONS[0], wirkung: 5, aufwand: 5, prioritaet: 'C', status: 'geplant', tags: [], start_empfohlen: false, scnat_db: false, scnat_portal: false, isNew: false, reihenfolge: null, notiz: '' });
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
            <span className="text-status-yellow">{stats.start6} «Start 6»</span>
            <span className="text-scnat-teal">{stats.neu} neu</span>
            <span className="text-status-blue">{stats.db} DB</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-elevated border border-bd-faint rounded-sm p-0.5">
            <button onClick={() => setView('list')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${view === 'list' ? 'bg-bg-surface text-txt-primary border border-bd-default' : 'text-txt-secondary border border-transparent'}`}>
              <List className="w-3.5 h-3.5" /> Liste
            </button>
            <button onClick={() => setView('reorder')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${view === 'reorder' ? 'bg-bg-surface text-txt-primary border border-bd-default' : 'text-txt-secondary border border-transparent'}`}>
              <ArrowUpDown className="w-3.5 h-3.5" /> Reihenfolge
            </button>
          </div>
          {view === 'list' && (
            <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
              <Plus className="w-4 h-4" /> Neue Massnahme
            </button>
          )}
        </div>
      </div>

      {view === 'reorder' && <ReorderView data={data} onSave={load} />}

      {view === 'list' && <>
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
                    {m.isNew && <span className="flex items-center gap-0.5 text-[10px] font-mono bg-scnat-teal/15 text-scnat-teal px-1.5 py-0.5 rounded-sm font-semibold"><Sparkles className="w-3 h-3" /> NEU</span>}
                    {m.start_empfohlen && <Star className="w-3 h-3 text-status-yellow" />}
                    {m.scnat_db && <Database className="w-3 h-3 text-status-blue" />}
                    {m.reihenfolge && <span className="text-[10px] font-mono bg-scnat-red/10 text-scnat-red px-1.5 py-0.5 rounded-sm">#{m.reihenfolge}</span>}
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
                    <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
                      <input type="checkbox" checked={m.isNew || false} onChange={e => updateLocal(m.id, 'isNew', e.target.checked)} className="rounded-sm accent-scnat-teal" />
                      <Sparkles className="w-3 h-3 text-scnat-teal" /> NEU
                    </label>
                    <label className="flex items-center gap-2 text-xs text-txt-secondary">
                      Reihenfolge:
                      <input type="number" min="0" max="99" value={m.reihenfolge || ''} onChange={e => updateLocal(m.id, 'reihenfolge', e.target.value ? parseInt(e.target.value) : null)} className="w-14 bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1 rounded-sm focus:border-scnat-red focus:outline-none" />
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
      </>}
    </div>
  );
}
