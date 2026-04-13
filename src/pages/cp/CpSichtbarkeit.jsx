import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Save, Eye, EyeOff, Loader2, ExternalLink, GripVertical, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from '../../components/ui/use-toast';
import { useVisibility } from '../../contexts/VisibilityContext';
import { getSectionMeta } from '../../config/sections';

function SortableRow({ item, onToggle, isDragOverlay }) {
  const meta = getSectionMeta(item.key);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
  });

  const style = isDragOverlay ? {} : {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${isDragOverlay ? 'bg-bg-surface border border-scnat-red/40 rounded-sm shadow-xl' : 'hover:bg-bg-elevated/50'}`}
    >
      <button
        {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
        className="cursor-grab active:cursor-grabbing text-txt-tertiary hover:text-txt-secondary p-0.5 touch-none shrink-0"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <div className={`flex items-center justify-center w-7 h-7 rounded-sm shrink-0 ${
        item.visible ? 'bg-scnat-red/10 text-scnat-red' : 'bg-bg-elevated text-txt-tertiary'
      }`}>
        <Icon className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${item.visible ? 'text-txt-primary' : 'text-txt-tertiary line-through'}`}>
          {meta.label}
        </span>
        <span className="ml-2 text-[9px] font-mono text-txt-tertiary">{item.key}</span>
      </div>

      {meta.path && (
        <Link
          to={meta.path}
          title={item.visible ? `${meta.label} öffnen` : `${meta.label} Vorschau`}
          className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm transition-colors shrink-0 ${
            item.visible
              ? 'text-txt-tertiary hover:text-txt-secondary hover:bg-bg-elevated'
              : 'text-status-yellow hover:text-status-yellow/80 bg-status-yellow/10'
          }`}
        >
          <ExternalLink className="w-3 h-3" />
        </Link>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={item.visible}
        onClick={() => onToggle(item.key)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scnat-red ${
          item.visible ? 'bg-scnat-red' : 'bg-bd-strong'
        }`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
          item.visible ? 'translate-x-4' : 'translate-x-0'
        }`} />
      </button>
    </div>
  );
}

export default function CpSichtbarkeit() {
  const { refresh: refreshGlobal } = useVisibility();
  const [groups, setGroups] = useState({ portal: [], cp: [] });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetch('/api/visibility', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { portal: [], cp: [] })
      .then(data => {
        setGroups({
          portal: (data.portal || []),
          cp: (data.cp || []),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = useCallback((key) => {
    setGroups(prev => ({
      portal: prev.portal.map(s => s.key === key ? { ...s, visible: !s.visible } : s),
      cp: prev.cp.map(s => s.key === key ? { ...s, visible: !s.visible } : s),
    }));
    setDirty(true);
  }, []);

  const toggleGroup = useCallback((group, targetState) => {
    setGroups(prev => ({
      ...prev,
      [group]: prev[group].map(s => ({ ...s, visible: targetState })),
    }));
    setDirty(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const allItems = useMemo(() => [...groups.portal, ...groups.cp], [groups]);
  const activeItem = activeId ? allItems.find(s => s.key === activeId) : null;

  function findGroup(key) {
    if (groups.portal.some(s => s.key === key)) return 'portal';
    if (groups.cp.some(s => s.key === key)) return 'cp';
    return null;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeGroup = findGroup(active.id);
    let overGroup;

    if (over.id === 'portal-droppable') overGroup = 'portal';
    else if (over.id === 'cp-droppable') overGroup = 'cp';
    else overGroup = findGroup(over.id);

    if (!activeGroup || !overGroup || activeGroup === overGroup) return;

    setGroups(prev => {
      const sourceList = [...prev[activeGroup]];
      const destList = [...prev[overGroup]];

      const activeIdx = sourceList.findIndex(s => s.key === active.id);
      if (activeIdx < 0) return prev;

      const [movedItem] = sourceList.splice(activeIdx, 1);

      const overIdx = destList.findIndex(s => s.key === over.id);
      if (overIdx >= 0) {
        destList.splice(overIdx, 0, movedItem);
      } else {
        destList.push(movedItem);
      }

      return { ...prev, [activeGroup]: sourceList, [overGroup]: destList };
    });
    setDirty(true);
  }

  function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeGroup = findGroup(active.id);
    const overGroup = findGroup(over.id);

    if (activeGroup && overGroup && activeGroup === overGroup) {
      setGroups(prev => {
        const list = [...prev[activeGroup]];
        const oldIdx = list.findIndex(s => s.key === active.id);
        const newIdx = list.findIndex(s => s.key === over.id);
        if (oldIdx < 0 || newIdx < 0) return prev;
        return { ...prev, [activeGroup]: arrayMove(list, oldIdx, newIdx) };
      });
      setDirty(true);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/visibility', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          portal: groups.portal.map(({ key, visible }) => ({ key, visible })),
          cp: groups.cp.map(({ key, visible }) => ({ key, visible })),
        }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      refreshGlobal();
      toast({ title: 'Gespeichert', description: 'Sichtbarkeit und Reihenfolge wurden aktualisiert.' });
    } catch {
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const portalVisible = groups.portal.filter(s => s.visible).length;
  const cpVisible = groups.cp.filter(s => s.visible).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary mb-1">Sichtbarkeit & Reihenfolge</h2>
          <p className="text-sm text-txt-secondary">
            Steuere Sichtbarkeit und Reihenfolge. Per Drag & Drop umsortieren oder zwischen Gruppen verschieben.
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

      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-sm bg-status-green/10 text-status-green">
          <Eye className="w-3.5 h-3.5" /> {portalVisible + cpVisible} sichtbar
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-sm bg-bg-elevated text-txt-tertiary">
          <EyeOff className="w-3.5 h-3.5" /> {groups.portal.length + groups.cp.length - portalVisible - cpVisible} ausgeblendet
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-txt-tertiary px-2 py-1 bg-bg-elevated rounded-sm">
          <ArrowRight className="w-3 h-3" /> Drag & Drop zwischen Gruppen möglich
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GroupColumn
            id="portal"
            title="Portal-Seiten"
            subtitle="Sichtbar für alle eingeloggten Benutzer"
            items={groups.portal}
            visibleCount={portalVisible}
            onToggle={toggle}
            onToggleAll={(state) => toggleGroup('portal', state)}
          />
          <GroupColumn
            id="cp"
            title="Control Panel"
            subtitle="Sichtbar nur für Admins"
            items={groups.cp}
            visibleCount={cpVisible}
            onToggle={toggle}
            onToggleAll={(state) => toggleGroup('cp', state)}
            accent
          />
        </div>

        <DragOverlay>
          {activeItem ? <SortableRow item={activeItem} onToggle={() => {}} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function GroupColumn({ id, title, subtitle, items, visibleCount, onToggle, onToggleAll, accent }) {
  const allOn = visibleCount === items.length;
  const ids = useMemo(() => items.map(s => s.key), [items]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className={`text-sm font-heading font-semibold ${accent ? 'text-scnat-red' : 'text-txt-primary'}`}>
            {title}
            <span className="ml-2 text-[10px] font-mono text-txt-tertiary font-normal">
              {visibleCount}/{items.length}
            </span>
          </h3>
          <p className="text-[11px] text-txt-tertiary">{subtitle}</p>
        </div>
        <button
          onClick={() => onToggleAll(!allOn)}
          className="text-[10px] font-mono text-txt-tertiary hover:text-txt-secondary px-2 py-1 rounded-sm hover:bg-bg-elevated transition-colors"
        >
          {allOn ? 'Alle ausblenden' : 'Alle einblenden'}
        </button>
      </div>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          id={`${id}-droppable`}
          className={`bg-bg-surface border rounded-sm divide-y divide-bd-faint min-h-[80px] ${
            accent ? 'border-scnat-red/20' : 'border-bd-faint'
          }`}
        >
          {items.length === 0 && (
            <p className="text-xs text-txt-tertiary text-center py-6">
              Keine Sektionen. Ziehe Einträge hierhin.
            </p>
          )}
          {items.map(item => (
            <SortableRow key={item.key} item={item} onToggle={onToggle} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
