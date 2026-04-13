import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Archive, ChevronDown, ChevronRight } from 'lucide-react';

const SPRINT_STATUS_STYLES = {
  active:    { bg: 'rgba(0,152,218,.1)', color: '#0098DA', border: 'rgba(0,152,218,.3)', label: 'Aktiv' },
  planned:   { bg: 'rgba(78,83,93,.15)', color: '#4E535D', border: 'rgba(78,83,93,.3)', label: 'Geplant' },
  review:    { bg: 'rgba(240,120,0,.1)', color: '#F07800', border: 'rgba(240,120,0,.3)', label: 'Review' },
  completed: { bg: 'rgba(0,135,112,.1)', color: '#008770', border: 'rgba(0,135,112,.3)', label: 'Abgeschlossen' },
  archived:  { bg: 'rgba(78,83,93,.1)',  color: '#4E535D', border: 'rgba(78,83,93,.2)', label: 'Archiviert' },
};

const M_STATUS_OPTIONS = [
  { value: 'geplant',       label: 'Backlog',        bg: 'rgba(78,83,93,.15)',  color: '#4E535D', border: 'rgba(78,83,93,.3)' },
  { value: 'in_umsetzung',  label: 'In Bearbeitung', bg: 'rgba(46,204,113,.1)', color: '#2ECC71', border: 'rgba(46,204,113,.3)' },
  { value: 'blockiert',     label: 'Blockiert',      bg: 'rgba(243,156,18,.1)', color: '#F39C12', border: 'rgba(243,156,18,.3)' },
  { value: 'abgeschlossen', label: 'Erledigt',       bg: 'rgba(0,122,135,.1)',  color: '#007A87', border: 'rgba(0,122,135,.3)' },
  { value: 'sistiert',      label: 'Sistiert',       bg: 'rgba(234,81,90,.1)',  color: '#EA515A', border: 'rgba(234,81,90,.3)' },
];

const M_STYLE_MAP = Object.fromEntries(M_STATUS_OPTIONS.map(s => [s.value, s]));

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

export default function CpSprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveConfirm, setArchiveConfirm] = useState(null);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState({});

  useEffect(() => {
    fetch('/api/sprints', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setSprints(data);
        const first = data.find(s => s.status === 'active');
        if (first) setExpandedIds(new Set([first.id]));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleArchive = async (id) => {
    await fetch(`/api/sprints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'archived' }),
    });
    setSprints(prev => prev.filter(s => s.id !== id));
    setArchiveConfirm(null);
  };

  const updateMassnahmeStatus = useCallback(async (sprintId, massnahmeId, newStatus) => {
    setSprints(prev => prev.map(sp => {
      if (sp.id !== sprintId) return sp;
      return {
        ...sp,
        massnahmen: sp.massnahmen.map(m =>
          m.massnahmeId === massnahmeId ? { ...m, status: newStatus } : m
        ),
      };
    }));

    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return;
    const updatedMassnahmen = sprint.massnahmen.map(m =>
      m.massnahmeId === massnahmeId ? { ...m, status: newStatus } : m
    );

    await fetch(`/api/sprints/${sprintId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ massnahmen: updatedMassnahmen }),
    });
  }, [sprints]);

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
        <div>
          <h1 className="text-xl font-bold mb-1">Sprint-Verwaltung</h1>
          <p className="text-sm text-txt-secondary">{sprints.length} Sprints</p>
        </div>
        <Link
          to="/cp/sprints/new"
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-scnat-red hover:bg-scnat-red/90 px-4 py-2 rounded-[3px] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Sprint erstellen
        </Link>
      </div>

      <div className="space-y-3">
        {sprints.map(sp => {
          const ss = SPRINT_STATUS_STYLES[sp.status] || SPRINT_STATUS_STYLES.planned;
          const isOpen = expandedIds.has(sp.id);
          const filter = statusFilter[sp.id] || 'alle';
          const filteredM = filter === 'alle'
            ? sp.massnahmen
            : sp.massnahmen.filter(m => m.status === filter);

          const statusCounts = sp.massnahmen.reduce((acc, m) => {
            acc[m.status] = (acc[m.status] || 0) + 1;
            return acc;
          }, {});

          return (
            <div key={sp.id} className="border border-bd-faint rounded-[3px] bg-bg-surface overflow-hidden">
              {/* Sprint Header Row */}
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg-elevated transition-colors"
                onClick={() => toggleExpand(sp.id)}
              >
                <div className="text-txt-tertiary shrink-0">
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
                <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: sp.clusterColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-txt-primary truncate">{sp.name}</div>
                  <div className="font-mono text-[9px] text-txt-tertiary">
                    {sp.massnahmen.length} Massnahmen · {formatDate(sp.startDate)} → {formatDate(sp.endDate)}
                    <span className="hidden sm:inline"> · {sp.cluster}</span>
                  </div>
                </div>
                <span
                  className="font-mono text-[9px] px-2 py-1 rounded-sm shrink-0"
                  style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                >
                  {ss.label}
                </span>
                <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <Link
                    to={`/cp/sprints/${sp.id}`}
                    className="p-1.5 rounded-sm text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors"
                    title="Bearbeiten"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  {archiveConfirm === sp.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleArchive(sp.id)} className="text-[10px] font-mono text-scnat-red hover:underline">Ja</button>
                      <button onClick={() => setArchiveConfirm(null)} className="text-[10px] font-mono text-txt-tertiary hover:underline">Nein</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setArchiveConfirm(sp.id)}
                      className="p-1.5 rounded-sm text-txt-tertiary hover:text-scnat-red hover:bg-scnat-red/10 transition-colors"
                      title="Archivieren"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Detail */}
              {isOpen && (
                <div className="border-t border-bd-faint bg-bg-elevated">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1.5 px-4 py-3 flex-wrap">
                    {[
                      { key: 'alle', label: 'Alle' },
                      ...M_STATUS_OPTIONS,
                    ].map(f => {
                      const key = f.key || f.value;
                      const count = key === 'alle' ? sp.massnahmen.length : (statusCounts[key] || 0);
                      const isActive = filter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setStatusFilter(prev => ({ ...prev, [sp.id]: key }))}
                          className={`font-mono text-[9px] px-2 py-1 rounded-sm border transition-all ${
                            isActive
                              ? 'border-current bg-black/20 text-txt-primary font-medium'
                              : 'border-bd-default text-txt-tertiary hover:text-txt-secondary'
                          }`}
                        >
                          {f.label} · {count}
                        </button>
                      );
                    })}
                  </div>

                  {/* Massnahmen Grid */}
                  <div className="px-4 pb-4">
                    {filteredM.length === 0 ? (
                      <div className="py-6 text-center font-mono text-[10px] text-txt-tertiary">
                        Keine Massnahmen mit diesem Status
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2" style={{ overflow: 'visible' }}>
                        {filteredM.map(m => (
                          <CpMassnahmeCard
                            key={m.massnahmeId}
                            m={m}
                            clusterColor={sp.clusterColor}
                            onStatusChange={(newStatus) => updateMassnahmeStatus(sp.id, m.massnahmeId, newStatus)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sprints.length === 0 && (
          <div className="py-12 text-center text-txt-tertiary text-sm border border-bd-faint rounded-[3px]">
            Noch keine Sprints vorhanden.
          </div>
        )}
      </div>
    </div>
  );
}

function CpMassnahmeCard({ m, clusterColor, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const style = M_STYLE_MAP[m.status] || M_STYLE_MAP['geplant'];
  const initials = (m.verantwortliche || '').split(' ').map(n => n[0]).join('').slice(0, 2);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-[3px] p-3.5 flex flex-col gap-1.5 hover:border-bd-strong transition-colors relative" style={{ overflow: 'visible' }}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[9px] text-txt-tertiary px-1.5 py-0.5 border border-bd-faint rounded-sm shrink-0">
          {m.massnahmeId}
        </span>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev); }}
            className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm cursor-pointer hover:ring-1 hover:ring-bd-strong transition-shadow"
            style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
          >
            {style.label}
          </button>
          {menuOpen && (
            <div className="absolute top-full right-0 mt-1 z-50 bg-bg-surface border border-bd-default rounded-sm shadow-xl py-0.5 min-w-[120px]">
              {M_STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(opt.value);
                    setMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-[10px] font-mono hover:bg-bg-elevated transition-colors flex items-center gap-2 ${
                    opt.value === m.status ? 'font-medium' : ''
                  }`}
                  style={{ color: opt.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: opt.color }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-[13px] font-medium leading-snug text-txt-primary">
        {m.titel || m.massnahmeId}
      </div>

      <div className="flex items-center gap-1.5 mt-0.5">
        {clusterColor && <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: clusterColor }} />}
        {m.cluster && <span className="font-mono text-[8.5px] text-txt-tertiary">{m.cluster}</span>}
        {m.verantwortliche && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-txt-secondary">
            <div className="w-4 h-4 rounded-full flex items-center justify-center font-mono text-[7px] border border-bd-default shrink-0 bg-bg-elevated">
              {initials}
            </div>
            <span>{m.verantwortliche}</span>
          </div>
        )}
      </div>

      {m.progress > 0 && (
        <div className="h-0.5 rounded-full overflow-hidden bg-bd-faint">
          <div className="h-full rounded-full" style={{ width: `${m.progress}%`, background: clusterColor || '#0098DA' }} />
        </div>
      )}

      {m.notiz && (
        <div className="text-[11px] text-txt-tertiary italic leading-snug border-l-2 border-bd-default pl-2 mt-0.5">
          {m.notiz}
        </div>
      )}
    </div>
  );
}
