import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Save, Plus, X, ChevronDown, ChevronRight, Star, Activity, Database, Search, Sparkles, GripVertical, ArrowUpDown, List, LayoutGrid, AlertCircle, Check, Zap, Shield, MessageSquare, Send, Trash2 } from 'lucide-react';
import { DndContext, DragOverlay, closestCenter, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, useDraggable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIO_OPTIONS = ['A', 'B', 'C', 'D'];
const PRIO_LABEL = { A: 'Quick Win', B: 'Strategisch', C: 'Mittelfristig', D: 'Langfristig' };
const STATUS_OPTIONS = ['geplant', 'in_umsetzung', 'blockiert', 'abgeschlossen', 'sistiert'];
const STATUS_LABELS = { geplant: 'Backlog', in_umsetzung: 'In Bearbeitung', blockiert: 'Blockiert', abgeschlossen: 'Erledigt', sistiert: 'Sistiert' };
const STATUS_COLORS = {
  geplant: 'bg-bg-elevated text-txt-secondary',
  in_umsetzung: 'bg-status-green/15 text-status-green',
  blockiert: 'bg-status-yellow/15 text-status-yellow',
  abgeschlossen: 'bg-scnat-teal/15 text-scnat-teal',
  sistiert: 'bg-scnat-red/15 text-scnat-red',
};
const KANBAN_COLUMNS = [
  { id: 'geplant', label: 'Backlog', desc: 'Alle geplanten Massnahmen', borderClass: 'border-txt-tertiary/40' },
  { id: 'in_umsetzung', label: 'In Bearbeitung', desc: 'Aktiv in Umsetzung', borderClass: 'border-status-green' },
  { id: 'blockiert', label: 'Blockiert', desc: 'Braucht Entscheid / Freigabe', borderClass: 'border-status-yellow' },
  { id: 'abgeschlossen', label: 'Erledigt', desc: 'Abgenommen & dokumentiert', borderClass: 'border-scnat-teal' },
  { id: 'sistiert', label: 'Sistiert', desc: 'Zurückgestellt', borderClass: 'border-scnat-red' },
];
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
          {m.isAdminTask && <span className="flex items-center gap-0.5 text-[10px] font-mono bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-sm font-semibold"><Shield className="w-3 h-3" /> ADM</span>}
          {m.isNew && <span className="text-[10px] font-mono bg-scnat-teal/15 text-scnat-teal px-1.5 py-0.5 rounded-sm font-semibold">NEU</span>}
        </div>
        <h4 className="text-sm text-txt-primary font-medium truncate">{m.titel}</h4>
        {m.cluster && <p className="text-[10px] text-txt-tertiary">{m.cluster}</p>}
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
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
                  {m.isAdminTask && <span className="text-[9px] font-mono bg-purple-500/15 text-purple-400 px-1 py-0.5 rounded-sm font-semibold">ADM</span>}
                  <span className="text-xs text-txt-secondary truncate">{m.titel}</span>
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

const isUnrated = (m) => !m.wirkung || m.wirkung === 0 || !m.aufwand || m.aufwand === 0;

function KanbanCard({ m, sprintMap, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: m.id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      className={`bg-bg-surface border rounded-sm transition-all flex ${
        isDragging ? 'opacity-25 border-bd-faint' :
        isSelected ? 'border-scnat-red/50 ring-1 ring-scnat-red/20 shadow-sm' :
        'border-bd-faint hover:border-bd-strong'
      }`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        className="flex items-center px-1 cursor-grab active:cursor-grabbing touch-none text-txt-tertiary/30 hover:text-txt-tertiary hover:bg-bg-elevated/50 transition-colors rounded-l-sm shrink-0"
        title="Ziehen zum Verschieben"
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Clickable card body */}
      <div
        className="flex-1 p-2 cursor-pointer min-w-0"
        onClick={() => onSelect(m.id)}
      >
        <div className="flex items-center gap-1 mb-1 flex-wrap">
          <span className="text-[9px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
          {m.isAdminTask && <span className="text-[9px] font-mono bg-purple-500/15 text-purple-400 px-1 rounded-sm font-semibold">ADM</span>}
          {m.prioritaet && <span className={`text-[9px] font-mono px-1 py-0.5 rounded-sm ${
            m.prioritaet === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
            m.prioritaet === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
            m.prioritaet === 'C' ? 'bg-status-blue/15 text-status-blue' :
            'bg-bg-elevated text-txt-tertiary'
          }`}>{m.prioritaet}</span>}
          {m.isNew && <span className="text-[9px] font-mono bg-scnat-teal/15 text-scnat-teal px-1 rounded-sm">NEU</span>}
          {m.start_empfohlen && <Star className="w-2.5 h-2.5 text-status-yellow fill-status-yellow" />}
          {m.scnat_db && <Database className="w-2.5 h-2.5 text-status-blue" />}
          {m.reihenfolge && <span className="text-[8px] font-mono text-scnat-red">#{m.reihenfolge}</span>}
          {m.comments?.length > 0 && <span className="text-[8px] font-mono text-txt-tertiary"><MessageSquare className="w-2.5 h-2.5 inline" /> {m.comments.length}</span>}
        </div>
        <h4 className="text-[11px] text-txt-primary font-medium line-clamp-2 leading-snug">{m.titel}</h4>
        {m.cluster && <p className="text-[9px] text-txt-tertiary mt-1 truncate">{m.cluster}</p>}
        {!m.isAdminTask && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[8px] font-mono text-status-green">W:{m.wirkung || 0}</span>
            <span className="text-[8px] font-mono text-scnat-red">A:{m.aufwand || 0}</span>
          </div>
        )}
        {sprintMap[m.id]?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {sprintMap[m.id].map(sp => (
              <span key={sp.id} className="text-[8px] font-mono bg-[#F07800]/12 text-[#F07800] px-1 py-0.5 rounded-sm">
                {sp.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCardOverlay({ m }) {
  return (
    <div className="bg-bg-surface border-2 border-scnat-red/40 rounded-sm p-2.5 shadow-2xl w-[210px] rotate-1">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-[9px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
        {m.prioritaet && <span className={`text-[9px] font-mono px-1 py-0.5 rounded-sm ${
          m.prioritaet === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
          m.prioritaet === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
          m.prioritaet === 'C' ? 'bg-status-blue/15 text-status-blue' :
          'bg-bg-elevated text-txt-tertiary'
        }`}>{m.prioritaet}</span>}
      </div>
      <h4 className="text-[11px] text-txt-primary font-medium line-clamp-2">{m.titel}</h4>
      {m.cluster && <p className="text-[9px] text-txt-tertiary mt-1">{m.cluster}</p>}
    </div>
  );
}

function KanbanQuickAdd({ status, sprints, onAdd }) {
  const [open, setOpen] = useState(false);
  const [titel, setTitel] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sprintId, setSprintId] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titel.trim() || saving) return;
    setSaving(true);
    await onAdd({ titel: titel.trim(), status, isAdminTask: isAdmin, sprintId: sprintId || null });
    setTitel('');
    setIsAdmin(false);
    setSprintId('');
    setSaving(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1 py-2 text-[10px] font-mono text-txt-tertiary/40 hover:text-txt-tertiary hover:bg-bg-elevated/50 rounded-sm transition-colors"
      >
        <Plus className="w-3 h-3" /> Hinzufügen
      </button>
    );
  }

  const activeSprints = sprints.filter(s => s.status !== 'archived' && s.status !== 'completed');

  return (
    <form onSubmit={handleSubmit} className="bg-bg-surface border border-bd-default rounded-sm p-2 space-y-1.5 shadow-sm">
      <input
        ref={inputRef}
        value={titel}
        onChange={e => setTitel(e.target.value)}
        placeholder="Titel eingeben..."
        className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-[11px] px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setTitel(''); } }}
      />
      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="flex bg-bg-elevated border border-bd-faint rounded-sm p-0.5">
          <button
            type="button"
            onClick={() => setIsAdmin(false)}
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm transition-colors ${
              !isAdmin ? 'bg-scnat-red/15 text-scnat-red font-semibold' : 'text-txt-tertiary hover:text-txt-secondary'
            }`}
          >
            Massnahme
          </button>
          <button
            type="button"
            onClick={() => setIsAdmin(true)}
            className={`flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded-sm transition-colors ${
              isAdmin ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-txt-tertiary hover:text-txt-secondary'
            }`}
          >
            <Shield className="w-2.5 h-2.5" /> Admin
          </button>
        </div>
        {activeSprints.length > 0 && (
          <select
            value={sprintId}
            onChange={e => setSprintId(e.target.value)}
            className="flex-1 min-w-0 bg-bg-elevated border border-bd-faint text-txt-secondary text-[9px] px-1.5 py-0.5 rounded-sm focus:border-scnat-red focus:outline-none"
          >
            <option value="">Kein Sprint</option>
            {activeSprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="submit"
          disabled={!titel.trim() || saving}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] font-medium text-white bg-scnat-red hover:bg-[#F06570] disabled:bg-bg-elevated disabled:text-txt-tertiary px-2 py-1 rounded-sm transition-colors"
        >
          {saving ? '...' : <><Plus className="w-3 h-3" /> Erstellen</>}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setTitel(''); setIsAdmin(false); setSprintId(''); }}
          className="text-txt-tertiary hover:text-txt-secondary p-1 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </form>
  );
}

const SORT_MODES = [
  { id: 'default', label: 'Standard' },
  { id: 'newest', label: 'Neueste zuerst' },
  { id: 'oldest', label: 'Älteste zuerst' },
  { id: 'prio', label: 'Priorität' },
  { id: 'alpha', label: 'A → Z' },
];

function sortItems(items, mode) {
  if (mode === 'default') return items;
  const sorted = [...items];
  const prioOrder = { A: 1, B: 2, C: 3, D: 4 };
  switch (mode) {
    case 'newest': return sorted.reverse();
    case 'oldest': return sorted;
    case 'prio': return sorted.sort((a, b) => (prioOrder[a.prioritaet] || 99) - (prioOrder[b.prioritaet] || 99));
    case 'alpha': return sorted.sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
    default: return sorted;
  }
}

function KanbanColumn({ column, items, sprintMap, sprints, onQuickAdd, selectedId, onSelect }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [sortMode, setSortMode] = useState('default');
  const [showSort, setShowSort] = useState(false);
  const [showTopAdd, setShowTopAdd] = useState(false);
  const sortRef = useRef(null);
  const sorted = useMemo(() => sortItems(items, sortMode), [items, sortMode]);

  useEffect(() => {
    if (!showSort) return;
    const close = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showSort]);

  return (
    <div ref={setNodeRef} className={`flex-1 min-w-[200px] flex flex-col rounded-sm transition-all ${isOver ? 'ring-2 ring-scnat-red/30' : ''}`}>
      <div className={`px-3 py-2 border-t-2 ${column.borderClass} bg-bg-elevated rounded-t-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-heading font-semibold text-txt-primary">{column.label}</h3>
            <span className="text-[10px] font-mono bg-bg-surface px-1.5 py-0.5 rounded-sm text-txt-tertiary">{items.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTopAdd(!showTopAdd)}
              className="p-0.5 text-txt-tertiary/40 hover:text-scnat-red transition-colors"
              title="Schnell hinzufügen"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSort(!showSort)}
                className={`p-0.5 transition-colors ${sortMode !== 'default' ? 'text-scnat-red' : 'text-txt-tertiary/40 hover:text-txt-tertiary'}`}
                title="Sortierung"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
              {showSort && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-bg-surface border border-bd-faint rounded-sm shadow-lg py-1 min-w-[130px]">
                  {SORT_MODES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSortMode(s.id); setShowSort(false); }}
                      className={`w-full text-left text-[10px] font-mono px-3 py-1.5 transition-colors ${
                        sortMode === s.id ? 'text-scnat-red bg-scnat-red/5 font-semibold' : 'text-txt-secondary hover:bg-bg-elevated'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-[9px] text-txt-tertiary mt-0.5">{column.desc}</p>
      </div>
      <div className="flex-1 p-2 space-y-2 min-h-[120px] bg-bg-elevated/30 rounded-b-sm border border-t-0 border-bd-faint">
        {showTopAdd && <KanbanQuickAdd status={column.id} sprints={sprints} onAdd={onQuickAdd} />}
        {sorted.map(m => <KanbanCard key={m.id} m={m} sprintMap={sprintMap} isSelected={selectedId === m.id} onSelect={onSelect} />)}
        {items.length === 0 && (
          <div className="flex items-center justify-center h-12 text-[10px] text-txt-tertiary/40 font-mono">Leer</div>
        )}
        {!showTopAdd && <KanbanQuickAdd status={column.id} sprints={sprints} onAdd={onQuickAdd} />}
      </div>
    </div>
  );
}

function KanbanView({ data, sprintMap, sprints, onStatusChange, onQuickAdd, onSave, onDelete, onAddComment, onDeleteComment, assignToSprint, removeFromSprint }) {
  const [activeId, setActiveId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const grouped = useMemo(() => {
    const map = {};
    KANBAN_COLUMNS.forEach(col => { map[col.id] = []; });
    data.forEach(m => {
      const col = map[m.status] ? m.status : 'geplant';
      map[col].push(m);
    });
    return map;
  }, [data]);

  const activeItem = activeId ? data.find(m => m.id === activeId) : null;
  const selectedItem = selectedId ? data.find(m => m.id === selectedId) : null;
  const assignableSprints = sprints.filter(s => s.status !== 'archived' && s.status !== 'completed');

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={({ active }) => setActiveId(active.id)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={({ active, over }) => {
          setActiveId(null);
          if (!over) return;
          const item = data.find(m => m.id === active.id);
          if (item && item.status !== over.id && KANBAN_COLUMNS.some(c => c.id === over.id)) {
            onStatusChange(item.id, over.id);
          }
        }}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn key={col.id} column={col} items={grouped[col.id] || []} sprintMap={sprintMap} sprints={sprints} onQuickAdd={onQuickAdd} selectedId={selectedId} onSelect={(id) => setSelectedId(selectedId === id ? null : id)} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 200 }}>
          {activeItem && <KanbanCardOverlay m={activeItem} />}
        </DragOverlay>
      </DndContext>

      {selectedItem && (
        <KanbanDetailPanel
          m={selectedItem}
          sprintMap={sprintMap}
          assignableSprints={assignableSprints}
          onClose={() => setSelectedId(null)}
          onSave={onSave}
          onDelete={onDelete}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
          assignToSprint={assignToSprint}
          removeFromSprint={removeFromSprint}
        />
      )}
    </>
  );
}

function KanbanDetailPanel({ m, sprintMap, assignableSprints, onClose, onSave, onDelete, onAddComment, onDeleteComment, assignToSprint, removeFromSprint }) {
  const [edit, setEdit] = useState({ ...m });
  const [dirty, setDirty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setEdit({ ...m });
    setDirty(false);
    setConfirmDelete(false);
  }, [m.id]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const update = (field, value) => {
    setEdit(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(edit);
    setDirty(false);
  };

  const assignedSprintIds = new Set((sprintMap[m.id] || []).map(sp => sp.id));
  const availableSprints = assignableSprints.filter(s => !assignedSprintIds.has(s.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-bg-surface border border-bd-faint rounded-sm shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-bd-faint bg-bg-elevated">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
            {m.isAdminTask && (
              <span className="flex items-center gap-0.5 text-[9px] font-mono bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-sm font-semibold">
                <Shield className="w-3 h-3" /> Admin Task
              </span>
            )}
            <h3 className="text-sm font-medium text-txt-primary truncate">{m.titel}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {dirty && (
              <button onClick={handleSave} className="flex items-center gap-1 text-[10px] font-medium text-white bg-scnat-red hover:bg-[#F06570] px-3 py-1 rounded-sm transition-colors">
                <Save className="w-3 h-3" /> Speichern
              </button>
            )}
            <button onClick={onClose} className="p-1 text-txt-tertiary hover:text-txt-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Titel</label>
              <input value={edit.titel || ''} onChange={e => update('titel', e.target.value)} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Beschreibung</label>
              <textarea value={edit.beschreibung || ''} onChange={e => update('beschreibung', e.target.value)} rows={2} className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none resize-none" />
            </div>
          </div>

          {/* Type, Status, Prio, Cluster row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Typ</label>
              <div className="flex bg-bg-elevated border border-bd-faint rounded-sm p-0.5">
                <button
                  type="button"
                  onClick={() => update('isAdminTask', false)}
                  className={`text-[10px] font-mono px-2 py-1 rounded-sm transition-colors ${
                    !edit.isAdminTask ? 'bg-scnat-red/15 text-scnat-red font-semibold' : 'text-txt-tertiary hover:text-txt-secondary'
                  }`}
                >
                  Massnahme
                </button>
                <button
                  type="button"
                  onClick={() => update('isAdminTask', true)}
                  className={`flex items-center gap-0.5 text-[10px] font-mono px-2 py-1 rounded-sm transition-colors ${
                    edit.isAdminTask ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-txt-tertiary hover:text-txt-secondary'
                  }`}
                >
                  <Shield className="w-3 h-3" /> Admin
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Status</label>
              <select value={edit.status} onChange={e => update('status', e.target.value)} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Priorität</label>
              <select value={edit.prioritaet || ''} onChange={e => { update('prioritaet', e.target.value); update('prioritaet_label', PRIO_LABEL[e.target.value] || ''); }} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none">
                <option value="">–</option>
                {PRIO_OPTIONS.map(p => <option key={p} value={p}>Prio {p} – {PRIO_LABEL[p]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Cluster</label>
              <select value={edit.cluster || ''} onChange={e => update('cluster', e.target.value)} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none">
                <option value="">–</option>
                {CLUSTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Wirkung / Aufwand */}
          {!edit.isAdminTask && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Wirkung: <strong className="text-status-green">{edit.wirkung || 0}</strong></label>
                <input type="range" min="0" max="10" step="0.5" value={edit.wirkung || 0} onChange={e => update('wirkung', parseFloat(e.target.value))} className="w-full accent-status-green" />
              </div>
              <div>
                <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Aufwand: <strong className="text-scnat-red">{edit.aufwand || 0}</strong></label>
                <input type="range" min="0" max="10" step="0.5" value={edit.aufwand || 0} onChange={e => update('aufwand', parseFloat(e.target.value))} className="w-full accent-scnat-red" />
              </div>
            </div>
          )}

          {/* Notiz */}
          <div>
            <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Notiz</label>
            <input value={edit.notiz || ''} onChange={e => update('notiz', e.target.value)} placeholder="Interne Notiz..." className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
          </div>

          {/* Sprints */}
          <div>
            <label className="block text-[10px] text-txt-tertiary font-mono mb-1.5">Sprint-Zuweisung</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(sprintMap[m.id] || []).map(sp => (
                <span key={sp.id} className="group flex items-center gap-1 text-[10px] font-mono bg-[#F07800]/12 text-[#F07800] px-1.5 py-0.5 rounded-sm">
                  <Zap className="w-3 h-3" /> {sp.name}
                  <button
                    type="button"
                    onClick={() => removeFromSprint(m.id, sp.id)}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-scnat-red transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {availableSprints.length > 0 && (
                <select
                  value=""
                  onChange={e => { if (e.target.value) assignToSprint(m.id, e.target.value); e.target.value = ''; }}
                  className="bg-bg-elevated border border-bd-faint text-txt-tertiary text-[10px] px-1.5 py-0.5 rounded-sm focus:border-scnat-red focus:outline-none"
                >
                  <option value="">+ Sprint zuweisen</option>
                  {availableSprints.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              {(sprintMap[m.id] || []).length === 0 && availableSprints.length === 0 && (
                <span className="text-[10px] text-txt-tertiary/40 font-mono">Keine Sprints verfügbar</span>
              )}
            </div>
          </div>

          {/* Comments */}
          <CommentSection
            comments={m.comments || []}
            onAdd={(text) => onAddComment(m.id, text)}
            onDelete={(commentId) => onDeleteComment(m.id, commentId)}
          />

          {/* Delete */}
          <div className="pt-2 border-t border-bd-faint">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-scnat-red">Wirklich löschen?</span>
                <button onClick={async () => { await onDelete(m.id); onClose(); }} className="text-[10px] font-medium text-white bg-scnat-red px-2.5 py-1 rounded-sm hover:bg-[#F06570] transition-colors">Ja, löschen</button>
                <button onClick={() => setConfirmDelete(false)} className="text-[10px] text-txt-tertiary hover:text-txt-secondary px-2 py-1">Abbrechen</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-[10px] text-txt-tertiary hover:text-scnat-red transition-colors">
                <Trash2 className="w-3 h-3" /> Entfernen
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineSelect({ value, options, renderOption, onSelect, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); }}
        className="cursor-pointer"
      >
        {renderOption(value)}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 bg-bg-surface border border-bd-default rounded-sm shadow-xl py-0.5 min-w-[120px]">
          {options.map(opt => (
            <button
              key={typeof opt === 'string' ? opt : opt.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(typeof opt === 'string' ? opt : opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-bg-elevated transition-colors flex items-center gap-2 ${
                (typeof opt === 'string' ? opt : opt.value) === value ? 'text-txt-primary font-medium' : 'text-txt-secondary'
              }`}
            >
              {(typeof opt === 'string' ? opt : opt.value) === value && <Check className="w-3 h-3 text-scnat-red shrink-0" />}
              <span className={(typeof opt === 'string' ? opt : opt.value) === value ? '' : 'ml-5'}>
                {typeof opt === 'string' ? opt : opt.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SprintAssignButton({ massnahmeId, assignableSprints, assignedSprintIds, onAssign }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const available = assignableSprints.filter(s => !assignedSprintIds.has(s.id));
  if (available.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(prev => !prev); }}
        className="flex items-center gap-0.5 text-[10px] font-mono text-txt-tertiary/50 hover:text-[#F07800] px-1 py-0.5 rounded-sm hover:bg-[#F07800]/10 transition-colors"
        title="Sprint zuweisen"
      >
        <Plus className="w-3 h-3" />
        <Zap className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-bg-surface border border-bd-default rounded-sm shadow-xl py-0.5 min-w-[180px]">
          <div className="px-2.5 py-1.5 text-[9px] font-mono text-txt-tertiary border-b border-bd-faint">
            Sprint zuweisen
          </div>
          {available.map(sp => (
            <button
              key={sp.id}
              onClick={(e) => {
                e.stopPropagation();
                onAssign(massnahmeId, sp.id);
                setOpen(false);
              }}
              className="w-full text-left px-2.5 py-2 text-[11px] hover:bg-bg-elevated transition-colors flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: sp.clusterColor || '#4E535D' }} />
              <span className="text-txt-primary truncate">{sp.name}</span>
              <span className="text-[9px] font-mono text-txt-tertiary ml-auto shrink-0">{sp.massnahmen?.length || 0} M</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ListQuickAdd({ sprints, onAdd }) {
  const [titel, setTitel] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sprintId, setSprintId] = useState('');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const activeSprints = sprints.filter(s => s.status !== 'archived' && s.status !== 'completed');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titel.trim() || saving) return;
    setSaving(true);
    await onAdd({ titel: titel.trim(), status: 'geplant', isAdminTask: isAdmin, sprintId: sprintId || null });
    setTitel('');
    setIsAdmin(false);
    setSprintId('');
    setSaving(false);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-3 bg-bg-surface border border-bd-faint rounded-sm px-3 py-2">
      <Plus className="w-4 h-4 text-txt-tertiary shrink-0" />
      <input
        ref={inputRef}
        value={titel}
        onChange={e => setTitel(e.target.value)}
        placeholder="Schnell erfassen — Titel eingeben, Enter drücken..."
        className="flex-1 bg-transparent text-txt-primary text-sm focus:outline-none placeholder:text-txt-tertiary/40"
      />
      <div className="flex bg-bg-elevated border border-bd-faint rounded-sm p-0.5 shrink-0">
        <button
          type="button"
          onClick={() => setIsAdmin(false)}
          className={`text-[9px] font-mono px-2 py-0.5 rounded-sm transition-colors ${
            !isAdmin ? 'bg-scnat-red/15 text-scnat-red font-semibold' : 'text-txt-tertiary hover:text-txt-secondary'
          }`}
        >
          Massnahme
        </button>
        <button
          type="button"
          onClick={() => setIsAdmin(true)}
          className={`flex items-center gap-0.5 text-[9px] font-mono px-2 py-0.5 rounded-sm transition-colors ${
            isAdmin ? 'bg-purple-500/15 text-purple-400 font-semibold' : 'text-txt-tertiary hover:text-txt-secondary'
          }`}
        >
          <Shield className="w-2.5 h-2.5" /> Admin
        </button>
      </div>
      {activeSprints.length > 0 && (
        <select
          value={sprintId}
          onChange={e => setSprintId(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-[10px] px-2 py-1 rounded-sm focus:border-scnat-red focus:outline-none shrink-0 max-w-[140px]"
        >
          <option value="">Kein Sprint</option>
          {activeSprints.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
      <button
        type="submit"
        disabled={!titel.trim() || saving}
        className="text-[10px] font-medium text-white bg-scnat-red hover:bg-[#F06570] disabled:bg-bg-elevated disabled:text-txt-tertiary px-2.5 py-1 rounded-sm transition-colors shrink-0"
      >
        {saving ? '...' : 'Enter ↵'}
      </button>
    </form>
  );
}

export default function CpMassnahmen() {
  const [data, setData] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUnrated, setFilterUnrated] = useState(false);
  const [filterCluster, setFilterCluster] = useState('');
  const [filterSprint, setFilterSprint] = useState('');
  const [filterType, setFilterType] = useState('');
  const [view, setView] = useState('kanban');
  const [newItem, setNewItem] = useState({
    titel: '', beschreibung: '', cluster: '',
    wirkung: 5, aufwand: 5, prioritaet: '', status: 'geplant',
    tags: [], start_empfohlen: false, scnat_db: false, scnat_portal: false, isNew: false, reihenfolge: null, notiz: '',
  });
  const [newAdminTask, setNewAdminTask] = useState({ titel: '', beschreibung: '', status: 'geplant' });

  const load = () => {
    fetch('/api/massnahmen', { credentials: 'include' }).then(r => r.json()).then(setData).catch(() => {});
    fetch('/api/sprints', { credentials: 'include' }).then(r => r.json()).then(setSprints).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const sprintMap = useMemo(() => {
    const map = {};
    sprints.forEach(s => {
      (s.massnahmen || []).forEach(sm => {
        if (!map[sm.massnahmeId]) map[sm.massnahmeId] = [];
        map[sm.massnahmeId].push({ id: s.id, name: s.name });
      });
    });
    return map;
  }, [sprints]);

  const assignableSprints = useMemo(() =>
    sprints.filter(s => s.status !== 'archived' && s.status !== 'completed'),
    [sprints]
  );

  const assignToSprint = useCallback(async (massnahmeId, sprintId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    const already = sprint.massnahmen.some(m => m.massnahmeId === massnahmeId);
    if (already) return;
    const m = data.find(d => d.id === massnahmeId);
    const updated = [
      ...sprint.massnahmen,
      { massnahmeId, status: 'geplant', verantwortliche: '', notiz: '', progress: 0, titel: m?.titel || '', cluster: m?.cluster || '' },
    ];
    setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, massnahmen: updated } : s));
    await fetch(`/api/sprints/${sprintId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ massnahmen: updated }),
    });
  }, [sprints, data]);

  const removeFromSprint = useCallback(async (massnahmeId, sprintId) => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    const updated = sprint.massnahmen.filter(m => m.massnahmeId !== massnahmeId);
    setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, massnahmen: updated } : s));
    await fetch(`/api/sprints/${sprintId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ massnahmen: updated }),
    });
  }, [sprints]);

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterType === 'admin') result = result.filter(m => m.isAdminTask);
    else if (filterType === 'massnahmen') result = result.filter(m => !m.isAdminTask);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.titel.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.cluster?.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter(m => m.status === filterStatus);
    if (filterCluster) result = result.filter(m => m.cluster === filterCluster);
    if (filterSprint) result = result.filter(m => sprintMap[m.id]?.some(sp => sp.id === filterSprint));
    if (filterUnrated) result = result.filter(isUnrated);
    result.sort((a, b) => {
      const ra = a.reihenfolge || Infinity;
      const rb = b.reihenfolge || Infinity;
      return ra - rb;
    });
    return result;
  }, [data, search, filterStatus, filterCluster, filterSprint, sprintMap, filterUnrated, filterType]);

  const stats = useMemo(() => ({
    total: data.length,
    massnahmen: data.filter(m => !m.isAdminTask).length,
    adminTasks: data.filter(m => m.isAdminTask).length,
    geplant: data.filter(m => m.status === 'geplant').length,
    aktiv: data.filter(m => m.status === 'in_umsetzung').length,
    start6: data.filter(m => m.start_empfohlen).length,
    neu: data.filter(m => m.isNew).length,
    db: data.filter(m => m.scnat_db).length,
    unrated: data.filter(m => !m.isAdminTask && isUnrated(m)).length,
    inSprint: data.filter(m => sprintMap[m.id]).length,
  }), [data, sprintMap]);

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

  const handleDelete = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/massnahmen/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Delete failed:', res.status, err);
        alert(`Löschen fehlgeschlagen (${res.status})`);
        return;
      }
      setData(prev => prev.filter(m => m.id !== id));
      setSprints(prev => prev.map(s => ({
        ...s,
        massnahmen: s.massnahmen.filter(m => m.massnahmeId !== id),
      })));
    } catch (e) {
      console.error('Delete error:', e);
      alert('Löschen fehlgeschlagen: ' + e.message);
    }
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/massnahmen', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...newItem, prioritaet_label: PRIO_LABEL[newItem.prioritaet] || '' }),
    });
    setShowAdd(false);
    setNewItem({ titel: '', beschreibung: '', cluster: '', wirkung: 5, aufwand: 5, prioritaet: '', status: 'geplant', tags: [], start_empfohlen: false, scnat_db: false, scnat_portal: false, isNew: false, reihenfolge: null, notiz: '' });
    load();
  };

  const handleAddAdminTask = async (e) => {
    e.preventDefault();
    await fetch('/api/massnahmen', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...newAdminTask, isAdminTask: true }),
    });
    setShowAddAdmin(false);
    setNewAdminTask({ titel: '', beschreibung: '', status: 'geplant' });
    load();
  };

  const addComment = useCallback(async (id, text) => {
    const m = data.find(d => d.id === id);
    const comments = [...(m?.comments || []), { id: Date.now().toString(36), text, createdAt: new Date().toISOString(), author: 'Admin' }];
    setData(prev => prev.map(d => d.id === id ? { ...d, comments } : d));
    await fetch(`/api/massnahmen/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ comments }),
    });
  }, [data]);

  const deleteComment = useCallback(async (massnahmeId, commentId) => {
    const m = data.find(d => d.id === massnahmeId);
    const comments = (m?.comments || []).filter(c => c.id !== commentId);
    setData(prev => prev.map(d => d.id === massnahmeId ? { ...d, comments } : d));
    await fetch(`/api/massnahmen/${massnahmeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ comments }),
    });
  }, [data]);

  const quickAdd = useCallback(async ({ titel, status, isAdminTask, sprintId }) => {
    const res = await fetch('/api/massnahmen', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        titel,
        status,
        isAdminTask: !!isAdminTask,
        cluster: '',
        prioritaet: '',
        prioritaet_label: '',
      }),
    });
    const created = await res.json();
    setData(prev => [...prev, created]);

    if (sprintId) {
      const sprint = sprints.find(s => s.id === sprintId);
      if (sprint) {
        const updated = [
          ...sprint.massnahmen,
          { massnahmeId: created.id, status: 'geplant', verantwortliche: '', notiz: '', progress: 0, titel: created.titel },
        ];
        setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, massnahmen: updated } : s));
        await fetch(`/api/sprints/${sprintId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ massnahmen: updated }),
        });
      }
    }
  }, [sprints]);

  const updateLocal = (id, field, value) => {
    setData(data.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const inlineSave = useCallback(async (id, updates) => {
    setData(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    await fetch(`/api/massnahmen/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
  }, []);

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
            <span>{stats.massnahmen} Massnahmen</span>
            {stats.adminTasks > 0 && <span className="text-purple-400">{stats.adminTasks} Admin Tasks</span>}
            <span className="text-status-green">{stats.aktiv} aktiv</span>
            {stats.inSprint > 0 && <span className="text-[#F07800]">{stats.inSprint} in Sprint</span>}
            {stats.unrated > 0 && <span className="text-status-yellow">{stats.unrated} unbewertet</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-bg-elevated border border-bd-faint rounded-sm p-0.5">
            <button onClick={() => setView('list')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${view === 'list' ? 'bg-bg-surface text-txt-primary border border-bd-default' : 'text-txt-secondary border border-transparent'}`}>
              <List className="w-3.5 h-3.5" /> Liste
            </button>
            <button onClick={() => setView('kanban')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${view === 'kanban' ? 'bg-bg-surface text-txt-primary border border-bd-default' : 'text-txt-secondary border border-transparent'}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button onClick={() => setView('reorder')} className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm transition-colors ${view === 'reorder' ? 'bg-bg-surface text-txt-primary border border-bd-default' : 'text-txt-secondary border border-transparent'}`}>
              <ArrowUpDown className="w-3.5 h-3.5" /> Reihenfolge
            </button>
          </div>
          {view === 'list' && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => { setShowAdd(!showAdd); setShowAddAdmin(false); }} className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
                <Plus className="w-4 h-4" /> Massnahme
              </button>
              <button onClick={() => { setShowAddAdmin(!showAddAdmin); setShowAdd(false); }} className="flex items-center gap-1 bg-purple-600 text-white text-sm px-3 py-1.5 rounded-sm hover:bg-purple-500 transition-colors">
                <Shield className="w-3.5 h-3.5" /> Admin Task
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-1.5 mb-4">
        {[
          { key: '', label: 'Alle', count: stats.total },
          { key: 'massnahmen', label: 'Massnahmen', count: stats.massnahmen },
          { key: 'admin', label: 'Admin Tasks', count: stats.adminTasks, icon: Shield },
        ].map(f => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`flex items-center gap-1 font-mono text-[10px] px-2.5 py-1 rounded-sm border transition-all ${
                filterType === f.key
                  ? f.key === 'admin'
                    ? 'border-purple-500/40 bg-purple-500/15 text-purple-400 font-medium'
                    : 'border-current bg-black/20 text-txt-primary font-medium'
                  : 'border-bd-faint text-txt-tertiary hover:text-txt-secondary'
              }`}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {f.label} · {f.count}
            </button>
          );
        })}
      </div>

      {view === 'reorder' && <ReorderView data={data} onSave={load} />}

      {view !== 'reorder' && <>
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
        {view === 'list' && (
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          >
            <option value="">Alle Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
          </select>
        )}
        <select
          value={filterCluster}
          onChange={e => setFilterCluster(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        >
          <option value="">Alle Cluster</option>
          {CLUSTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {sprints.filter(s => s.status !== 'archived').length > 0 && (
          <select
            value={filterSprint}
            onChange={e => setFilterSprint(e.target.value)}
            className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          >
            <option value="">Alle Sprints</option>
            {sprints.filter(s => s.status !== 'archived').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <button
          onClick={() => setFilterUnrated(prev => !prev)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-sm border transition-colors ${
            filterUnrated
              ? 'bg-status-yellow/15 text-status-yellow border-status-yellow/30 font-medium'
              : 'bg-bg-elevated text-txt-secondary border-bd-faint hover:border-bd-default'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Nicht eingeschätzt
          {stats.unrated > 0 && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
              filterUnrated ? 'bg-status-yellow/20' : 'bg-bg-elevated'
            }`}>{stats.unrated}</span>
          )}
        </button>
        <span className="text-xs text-txt-tertiary font-mono ml-auto">{filtered.length} angezeigt</span>
      </div>

      {view === 'kanban' && (
        <KanbanView
          data={filtered}
          sprintMap={sprintMap}
          sprints={sprints}
          onStatusChange={(id, status) => inlineSave(id, { status })}
          onQuickAdd={quickAdd}
          onSave={(m) => { inlineSave(m.id, m); }}
          onDelete={handleDelete}
          onAddComment={addComment}
          onDeleteComment={deleteComment}
          assignToSprint={assignToSprint}
          removeFromSprint={removeFromSprint}
        />
      )}

      {view === 'list' && <>
      {/* Add Massnahme Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-4 mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={newItem.titel} onChange={e => setNewItem({ ...newItem, titel: e.target.value })} required placeholder="Titel" className="bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none sm:col-span-2" />
            <textarea value={newItem.beschreibung} onChange={e => setNewItem({ ...newItem, beschreibung: e.target.value })} placeholder="Beschreibung" rows={2} className="bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none sm:col-span-2 resize-none" />
            <select value={newItem.cluster} onChange={e => setNewItem({ ...newItem, cluster: e.target.value })} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none">
              <option value="">Kein Cluster</option>
              {CLUSTER_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={newItem.prioritaet} onChange={e => setNewItem({ ...newItem, prioritaet: e.target.value })} className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none">
              <option value="">Keine Priorität</option>
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

      {/* Add Admin Task Form */}
      {showAddAdmin && (
        <form onSubmit={handleAddAdminTask} className="bg-bg-surface border border-purple-500/30 rounded-sm p-4 mb-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-400">Neuer Admin Task</span>
            <span className="text-[9px] font-mono text-txt-tertiary">(nur für dich sichtbar)</span>
          </div>
          <input
            value={newAdminTask.titel}
            onChange={e => setNewAdminTask({ ...newAdminTask, titel: e.target.value })}
            required
            placeholder="Was muss erledigt werden?"
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-purple-500 focus:outline-none"
          />
          <textarea
            value={newAdminTask.beschreibung}
            onChange={e => setNewAdminTask({ ...newAdminTask, beschreibung: e.target.value })}
            placeholder="Details / Notizen (optional)"
            rows={2}
            className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-purple-500 focus:outline-none resize-none"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="bg-purple-600 text-white text-sm px-4 py-2 rounded-sm hover:bg-purple-500 transition-colors">Erstellen</button>
            <button type="button" onClick={() => setShowAddAdmin(false)} className="text-sm text-txt-secondary hover:text-txt-primary px-3 py-2">Abbrechen</button>
          </div>
        </form>
      )}

      {/* Quick Add Bar */}
      <ListQuickAdd sprints={sprints} onAdd={quickAdd} />

      <div className="space-y-2">
        {filtered.map(m => {
          const isEditing = editing === m.id;
          return (
            <div key={m.id} className={`bg-bg-surface border rounded-sm ${isEditing ? 'border-scnat-red/30' : 'border-bd-faint'}`}>
              <div className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>

                    {m.isAdminTask && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono bg-purple-500/15 text-purple-400 px-1.5 py-0.5 rounded-sm font-semibold">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    )}

                    <InlineSelect
                      value={m.prioritaet || ''}
                      options={[{ value: '', label: 'Keine Prio' }, ...PRIO_OPTIONS.map(p => ({ value: p, label: `Prio ${p} – ${PRIO_LABEL[p]}` }))]}
                      onSelect={(v) => inlineSave(m.id, { prioritaet: v, prioritaet_label: PRIO_LABEL[v] || '' })}
                      renderOption={(v) => (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm hover:ring-1 hover:ring-bd-strong transition-shadow ${
                          v === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
                          v === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
                          v === 'C' ? 'bg-status-blue/15 text-status-blue' :
                          v ? 'bg-bg-elevated text-txt-tertiary' :
                          'bg-bg-elevated/50 text-txt-tertiary/40'
                        }`}>{v ? `Prio ${v}` : '–'}</span>
                      )}
                    />

                    <InlineSelect
                      value={m.status}
                      options={STATUS_OPTIONS.map(s => ({ value: s, label: STATUS_LABELS[s] || s }))}
                      onSelect={(v) => inlineSave(m.id, { status: v })}
                      renderOption={(v) => (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm hover:ring-1 hover:ring-bd-strong transition-shadow ${STATUS_COLORS[v] || STATUS_COLORS.geplant}`}>{STATUS_LABELS[v] || v}</span>
                      )}
                    />

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); inlineSave(m.id, { isNew: !m.isNew }); }}
                      className={`flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-sm transition-colors ${
                        m.isNew ? 'bg-scnat-teal/15 text-scnat-teal font-semibold hover:bg-scnat-teal/25' : 'bg-bg-elevated/50 text-txt-tertiary/40 hover:text-txt-tertiary hover:bg-bg-elevated'
                      }`}
                      title={m.isNew ? 'NEU entfernen' : 'Als NEU markieren'}
                    >
                      <Sparkles className="w-3 h-3" /> NEU
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); inlineSave(m.id, { start_empfohlen: !m.start_empfohlen }); }}
                      className={`p-0.5 rounded-sm transition-colors ${
                        m.start_empfohlen ? 'text-status-yellow hover:text-status-yellow/70' : 'text-txt-tertiary/30 hover:text-status-yellow/60'
                      }`}
                      title={m.start_empfohlen ? 'Start-Empfehlung entfernen' : 'Start empfohlen'}
                    >
                      <Star className={`w-3.5 h-3.5 ${m.start_empfohlen ? 'fill-status-yellow' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); inlineSave(m.id, { scnat_db: !m.scnat_db }); }}
                      className={`p-0.5 rounded-sm transition-colors ${
                        m.scnat_db ? 'text-status-blue hover:text-status-blue/70' : 'text-txt-tertiary/30 hover:text-status-blue/60'
                      }`}
                      title={m.scnat_db ? 'SCNAT-DB Bezug entfernen' : 'SCNAT-DB Bezug setzen'}
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>

                    {isUnrated(m) && <span className="flex items-center gap-0.5 text-[10px] font-mono bg-status-yellow/15 text-status-yellow px-1.5 py-0.5 rounded-sm font-semibold"><AlertCircle className="w-3 h-3" /></span>}
                    {m.reihenfolge && <span className="text-[10px] font-mono bg-scnat-red/10 text-scnat-red px-1.5 py-0.5 rounded-sm">#{m.reihenfolge}</span>}
                    {sprintMap[m.id]?.map(sp => (
                      <span
                        key={sp.id}
                        className="group/sp flex items-center gap-0.5 text-[10px] font-mono bg-[#F07800]/12 text-[#F07800] px-1.5 py-0.5 rounded-sm"
                      >
                        <Zap className="w-3 h-3" /> {sp.name}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFromSprint(m.id, sp.id); }}
                          className="ml-0.5 opacity-0 group-hover/sp:opacity-100 hover:text-scnat-red transition-opacity"
                          title={`Aus "${sp.name}" entfernen`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <SprintAssignButton
                      massnahmeId={m.id}
                      assignableSprints={assignableSprints}
                      assignedSprintIds={new Set((sprintMap[m.id] || []).map(sp => sp.id))}
                      onAssign={assignToSprint}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm text-txt-primary font-medium">{m.titel}</h4>
                    {(m.comments?.length > 0) && (
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-txt-tertiary">
                        <MessageSquare className="w-3 h-3" /> {m.comments.length}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-txt-secondary truncate">{m.beschreibung}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] text-txt-tertiary">{m.cluster}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-status-green w-8">W:{m.wirkung || 0}</span>
                      <input
                        type="range" min="0" max="10" step="0.5"
                        value={m.wirkung || 0}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { const v = parseFloat(e.target.value); updateLocal(m.id, 'wirkung', v); }}
                        onMouseUp={() => inlineSave(m.id, { wirkung: m.wirkung })}
                        onTouchEnd={() => inlineSave(m.id, { wirkung: m.wirkung })}
                        className="w-16 sm:w-20 h-1 accent-status-green cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-scnat-red w-8">A:{m.aufwand || 0}</span>
                      <input
                        type="range" min="0" max="10" step="0.5"
                        value={m.aufwand || 0}
                        onClick={e => e.stopPropagation()}
                        onChange={e => { const v = parseFloat(e.target.value); updateLocal(m.id, 'aufwand', v); }}
                        onMouseUp={() => inlineSave(m.id, { aufwand: m.aufwand })}
                        onTouchEnd={() => inlineSave(m.id, { aufwand: m.aufwand })}
                        className="w-16 sm:w-20 h-1 accent-scnat-red cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => handleSave(m)} className="flex items-center gap-1 bg-status-green/15 text-status-green text-xs px-2 py-1 rounded-sm hover:bg-status-green/25"><Save className="w-3 h-3" />Speichern</button>
                      <button onClick={() => { setEditing(null); load(); }} className="text-xs text-txt-tertiary hover:text-txt-secondary"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditing(m.id)} className="text-xs text-txt-secondary hover:text-txt-primary px-2 py-1 rounded-sm hover:bg-bg-elevated">Bearbeiten</button>
                      {deleteConfirmId === m.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={async () => { await handleDelete(m.id); setDeleteConfirmId(null); }} className="text-[10px] font-mono text-white bg-scnat-red px-2 py-0.5 rounded-sm hover:bg-[#F06570]">Löschen</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="text-[10px] font-mono text-txt-tertiary hover:text-txt-secondary px-1">Nein</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(m.id)}
                          className="p-1 text-txt-tertiary/40 hover:text-scnat-red transition-colors rounded-sm"
                          title="Löschen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
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
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
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
                      <input type="range" min="0" max="10" step="0.1" value={m.wirkung || 0} onChange={e => updateLocal(m.id, 'wirkung', parseFloat(e.target.value))} className="w-full accent-status-green" />
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

                  {/* Comments */}
                  <CommentSection
                    comments={m.comments || []}
                    onAdd={(text) => addComment(m.id, text)}
                    onDelete={(commentId) => deleteComment(m.id, commentId)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      </>}
      </>}
    </div>
  );
}

function CommentSection({ comments, onAdd, onDelete }) {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(comments.length > 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText('');
  };

  function timeAgo(iso) {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'gerade eben';
    if (mins < 60) return `vor ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `vor ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `vor ${days}d`;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-[10px] font-mono text-txt-tertiary hover:text-txt-secondary transition-colors mb-2"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Kommentare {comments.length > 0 && `(${comments.length})`}
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {expanded && (
        <div className="space-y-2 pl-1">
          {comments.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {comments.map(c => (
                <div key={c.id} className="group flex items-start gap-2 bg-bg-elevated/60 rounded-sm px-2.5 py-2 border border-bd-faint/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-txt-primary leading-snug whitespace-pre-wrap">{c.text}</p>
                    <span className="text-[9px] font-mono text-txt-tertiary mt-0.5 inline-block">{timeAgo(c.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                    className="p-0.5 text-txt-tertiary/30 hover:text-scnat-red opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Kommentar schreiben..."
              className="flex-1 bg-bg-elevated border border-bd-faint text-txt-primary text-[11px] px-2.5 py-1.5 rounded-sm focus:border-purple-500/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="p-1.5 text-purple-400 hover:text-purple-300 disabled:text-txt-tertiary/30 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
