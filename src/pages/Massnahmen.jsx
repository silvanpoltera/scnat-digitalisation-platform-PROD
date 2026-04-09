import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Star, Activity, Database, Filter, ArrowUpDown, PlusCircle, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const CLUSTER_COLORS = {
  'Digitale Kultur & Befähigung': '#3498DB',
  'Infrastruktur & Beschaffung': '#2ECC71',
  'Kommunikation & Transparenz': '#F39C12',
  'Prozesse & Methoden': '#9B59B6',
  'Strategie & Steuerung': '#EA515A',
  'Daten & Wissen': '#1ABC9C',
};

const PRIO_ORDER = { A: 0, B: 1, C: 2, D: 3 };
const PRIO_LABEL = { A: 'Quick Win', B: 'Strategisch', C: 'Mittelfristig', D: 'Langfristig' };

function PrioBar({ value, max = 10, color = '#EA515A' }) {
  if (!value) return <span className="text-xs text-txt-tertiary">–</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${(value / max) * 100}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs text-txt-secondary w-5 text-right font-mono">{value}</span>
    </div>
  );
}

function StatusBadge({ m }) {
  return (
    <div className="flex items-center gap-1.5">
      {m.isNew && (
        <span className="flex items-center gap-0.5 text-[10px] font-mono bg-scnat-teal/15 text-scnat-teal px-1.5 py-0.5 rounded-sm font-semibold">
          <Sparkles className="w-3 h-3" /> NEU
        </span>
      )}
      {m.start_empfohlen && (
        <span className="flex items-center gap-0.5 text-[10px] font-mono bg-status-yellow/15 text-status-yellow px-1.5 py-0.5 rounded-sm">
          <Star className="w-3 h-3" /> Start
        </span>
      )}
      {m.status === 'in_umsetzung' && (
        <span className="flex items-center gap-0.5 text-[10px] font-mono bg-status-green/15 text-status-green px-1.5 py-0.5 rounded-sm">
          <Activity className="w-3 h-3" /> Aktiv
        </span>
      )}
      {m.scnat_db && (
        <Link to="/scnat-db" className="flex items-center gap-0.5 text-[10px] font-mono bg-status-blue/15 text-status-blue px-1.5 py-0.5 rounded-sm hover:bg-status-blue/25 transition-colors">
          <Database className="w-3 h-3" /> DB
        </Link>
      )}
      {m.tags?.map(t => (
        <span key={t} className="text-[10px] font-mono bg-bg-elevated text-txt-secondary px-1.5 py-0.5 rounded-sm">{t}</span>
      ))}
    </div>
  );
}

function ListView({ items }) {
  const grouped = useMemo(() => {
    const g = {};
    items.forEach(m => {
      if (!g[m.cluster]) g[m.cluster] = [];
      g[m.cluster].push(m);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)).map(([cluster, ms]) => [
      cluster,
      [...ms].sort((a, b) => (PRIO_ORDER[a.prioritaet] ?? 4) - (PRIO_ORDER[b.prioritaet] ?? 4)),
    ]);
  }, [items]);

  const [open, setOpen] = useState(() => grouped.map(([c]) => c));

  const toggle = (cluster) => {
    setOpen(prev => prev.includes(cluster) ? prev.filter(c => c !== cluster) : [...prev, cluster]);
  };

  return (
    <div className="space-y-3">
      {grouped.map(([cluster, ms]) => (
        <div key={cluster} className="bg-bg-surface border border-bd-faint rounded-sm">
          <button onClick={() => toggle(cluster)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CLUSTER_COLORS[cluster] || '#888' }} />
            <span className="text-sm font-heading font-medium text-txt-primary flex-1">{cluster}</span>
            <span className="text-xs text-txt-tertiary font-mono">{ms.length}</span>
            {open.includes(cluster) ? <ChevronDown className="w-4 h-4 text-txt-tertiary" /> : <ChevronRight className="w-4 h-4 text-txt-tertiary" />}
          </button>
          {open.includes(cluster) && (
            <div className="border-t border-bd-faint">
              {ms.map(m => (
                <div key={m.id} className="px-4 py-3 border-b border-bd-faint last:border-b-0 hover:bg-bg-elevated/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                          m.prioritaet === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
                          m.prioritaet === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
                          m.prioritaet === 'C' ? 'bg-status-blue/15 text-status-blue' :
                          'bg-bg-elevated text-txt-tertiary'
                        }`}>Prio {m.prioritaet}</span>
                      </div>
                      <h4 className="text-sm font-medium text-txt-primary">{m.titel}</h4>
                      <p className="text-xs text-txt-secondary mt-0.5 line-clamp-2">{m.beschreibung}</p>
                    </div>
                    <div className="w-full sm:w-32 sm:shrink-0 space-y-1">
                      <div className="text-[10px] text-txt-tertiary">Wirkung</div>
                      <PrioBar value={m.wirkung} color="#2ECC71" />
                      <div className="text-[10px] text-txt-tertiary mt-1">Aufwand</div>
                      <PrioBar value={m.aufwand} color="#EA515A" />
                    </div>
                  </div>
                  <StatusBadge m={m} />
                  {m.notiz && <p className="text-[11px] text-txt-tertiary mt-1.5 italic">→ {m.notiz}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MatrixView({ items }) {
  const rated = items.filter(m => m.wirkung > 0 && m.aufwand > 0);
  const unrated = items.filter(m => !m.wirkung || !m.aufwand);
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);

  const pad = 50;
  const W = 600;
  const H = 400;

  const selectedItem = selected ? items.find(m => m.id === selected) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-bg-surface border border-bd-faint rounded-sm p-2 sm:p-4 overflow-x-auto">
          <svg viewBox={`0 0 ${W + pad * 2} ${H + pad * 2}`} className="w-full min-w-[400px]" style={{ overflow: 'visible' }}>
            <rect x={pad} y={pad} width={W / 2} height={H / 2} fill="#2ECC71" fillOpacity="0.04" />
            <rect x={pad + W / 2} y={pad} width={W / 2} height={H / 2} fill="#F39C12" fillOpacity="0.04" />
            <rect x={pad} y={pad + H / 2} width={W / 2} height={H / 2} fill="#3498DB" fillOpacity="0.04" />
            <rect x={pad + W / 2} y={pad + H / 2} width={W / 2} height={H / 2} fill="#EA515A" fillOpacity="0.04" />

            <line x1={pad} y1={pad + H / 2} x2={W + pad} y2={pad + H / 2} stroke="#2E3238" strokeDasharray="4,4" />
            <line x1={pad + W / 2} y1={pad} x2={pad + W / 2} y2={H + pad} stroke="#2E3238" strokeDasharray="4,4" />

            <line x1={pad} y1={pad} x2={pad} y2={H + pad} stroke="#2E3238" />
            <line x1={pad} y1={H + pad} x2={W + pad} y2={H + pad} stroke="#2E3238" />

            <text x={pad + W / 2} y={H + pad + 35} textAnchor="middle" fill="#8A8F9B" fontSize="11" fontFamily="DM Sans">Aufwand →</text>
            <text transform={`rotate(-90) translate(${-(pad + H / 2)},${pad - 30})`} textAnchor="middle" fill="#8A8F9B" fontSize="11" fontFamily="DM Sans">Wirkung →</text>

            <text x={pad + W * 0.25} y={pad + H * 0.25} textAnchor="middle" fill="#4E535D" fontSize="10" fontFamily="DM Sans">Quick Win</text>
            <text x={pad + W * 0.75} y={pad + H * 0.25} textAnchor="middle" fill="#4E535D" fontSize="10" fontFamily="DM Sans">Strategisch</text>
            <text x={pad + W * 0.25} y={pad + H * 0.75} textAnchor="middle" fill="#4E535D" fontSize="10" fontFamily="DM Sans">Nice to have</text>
            <text x={pad + W * 0.75} y={pad + H * 0.75} textAnchor="middle" fill="#4E535D" fontSize="10" fontFamily="DM Sans">Vermeiden</text>

            {rated.map(m => {
              const x = pad + (m.aufwand / 10) * W;
              const y = pad + H - (m.wirkung / 10) * H;
              const color = CLUSTER_COLORS[m.cluster] || '#888';
              const isHover = hover === m.id;
              const isSelected = selected === m.id;
              const tooltipX = x + 12 > W + pad - 180 ? x - 212 : x + 12;
              const tooltipY = y - 30 < pad ? y + 10 : y - 30;
              return (
                <g key={m.id} onMouseEnter={() => setHover(m.id)} onMouseLeave={() => setHover(null)} onClick={() => setSelected(selected === m.id ? null : m.id)} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r={isHover || isSelected ? 8 : 5} fill={color} fillOpacity={isHover || isSelected ? 1 : 0.8} stroke={isSelected ? '#ECEEF1' : isHover ? '#ECEEF1' : 'none'} strokeWidth={2} />
                  {isHover && !isSelected && (
                    <foreignObject x={tooltipX} y={tooltipY} width="200" height="60" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                      <div xmlns="http://www.w3.org/1999/xhtml" className="bg-bg-elevated border border-bd-default rounded-sm px-2 py-1.5 text-xs shadow-lg">
                        <p className="text-txt-primary font-medium">{m.titel}</p>
                        <p className="text-txt-tertiary font-mono">{m.id.toUpperCase()} · W:{m.wirkung} A:{m.aufwand}</p>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        {unrated.length > 0 && (
          <div className="w-full lg:w-56 lg:shrink-0">
            <h4 className="text-xs font-mono text-txt-tertiary mb-2">Nicht bewertet ({unrated.length})</h4>
            <div className="space-y-1">
              {unrated.map(m => (
                <div key={m.id} className="bg-bg-surface border border-bd-faint rounded-sm px-2.5 py-1.5 text-xs">
                  <span className="text-txt-tertiary font-mono mr-1">{m.id.toUpperCase()}</span>
                  <span className="text-txt-secondary">{m.titel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-mono text-txt-tertiary">{selectedItem.id.toUpperCase()}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                  selectedItem.prioritaet === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
                  selectedItem.prioritaet === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
                  selectedItem.prioritaet === 'C' ? 'bg-status-blue/15 text-status-blue' :
                  'bg-bg-elevated text-txt-tertiary'
                }`}>Prio {selectedItem.prioritaet} – {PRIO_LABEL[selectedItem.prioritaet]}</span>
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLUSTER_COLORS[selectedItem.cluster] || '#888' }} />
                <span className="text-[10px] text-txt-tertiary">{selectedItem.cluster}</span>
              </div>
              <h4 className="text-sm font-heading font-semibold text-txt-primary mb-1">{selectedItem.titel}</h4>
              <p className="text-xs text-txt-secondary leading-relaxed">{selectedItem.beschreibung}</p>
              {selectedItem.notiz && <p className="text-[11px] text-txt-tertiary mt-2 italic">→ {selectedItem.notiz}</p>}
            </div>
            <div className="w-full sm:w-28 sm:shrink-0 space-y-1">
              <div className="text-[10px] text-txt-tertiary">Wirkung</div>
              <PrioBar value={selectedItem.wirkung} color="#2ECC71" />
              <div className="text-[10px] text-txt-tertiary mt-1">Aufwand</div>
              <PrioBar value={selectedItem.aufwand} color="#EA515A" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MassnahmenCard({ m, index, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <div className={`bg-bg-surface border rounded-sm p-5 transition-all ${isPrimary ? 'border-bd-faint hover:border-bd-strong' : 'border-bd-faint opacity-80 hover:opacity-100 hover:border-bd-strong'}`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-sm font-heading font-bold ${isPrimary ? 'bg-scnat-red/15 text-scnat-red' : 'bg-bg-elevated text-txt-tertiary'}`}>{index}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()} · Prio {m.prioritaet}</span>
            {m.isNew && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono bg-scnat-teal/15 text-scnat-teal px-1.5 py-0.5 rounded-sm font-semibold">
                <Sparkles className="w-3 h-3" /> NEU
              </span>
            )}
            {m.status === 'in_umsetzung' && (
              <span className="flex items-center gap-0.5 text-[10px] font-mono bg-status-green/15 text-status-green px-1.5 py-0.5 rounded-sm">
                <Activity className="w-3 h-3" /> Aktiv
              </span>
            )}
          </div>
          <h4 className="text-sm font-heading font-semibold text-txt-primary">{m.titel}</h4>
        </div>
      </div>
      <p className="text-xs text-txt-secondary leading-relaxed mb-3">{m.beschreibung}</p>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <span className="text-[10px] text-txt-tertiary">Wirkung</span>
          <PrioBar value={m.wirkung} color="#2ECC71" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] text-txt-tertiary">Aufwand</span>
          <PrioBar value={m.aufwand} color="#EA515A" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CLUSTER_COLORS[m.cluster] }} />
        <span className="text-[10px] text-txt-tertiary">{m.cluster}</span>
      </div>
    </div>
  );
}

function StartSixView({ items }) {
  const firstSix = items
    .filter(m => m.reihenfolge >= 1 && m.reihenfolge <= 6)
    .sort((a, b) => a.reihenfolge - b.reihenfolge);
  const secondSix = items
    .filter(m => m.reihenfolge >= 7 && m.reihenfolge <= 12)
    .sort((a, b) => a.reihenfolge - b.reihenfolge);
  const inProgress = items.filter(m => m.status === 'in_umsetzung' && !m.reihenfolge);
  const [showNext, setShowNext] = useState(false);

  return (
    <div className="space-y-8">
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
        <p className="text-sm text-txt-secondary leading-relaxed">
          <strong className="text-txt-primary">Warum «Start mit 6»?</strong> — Die Digitalisierung ist kein Wasserfall-Projekt, 
          sondern ein laufender Prozess. Es ist weder sinnvoll noch möglich, alle {items.length} Massnahmen gleichzeitig zu starten oder 
          den gesamten Fahrplan auf Jahre hinaus festzulegen. Prioritäten verschieben sich, Ressourcen ändern sich, und neue 
          Erkenntnisse aus der Umsetzung fliessen zurück. Deshalb arbeiten wir <strong className="text-txt-primary">agil</strong>: 
          Wir starten mit 6 priorisierten Massnahmen, sammeln Erfahrungen und planen dann die nächste Welle — angepasst an das, 
          was wir gelernt haben.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-heading font-semibold text-txt-primary mb-1">Start mit 6</h3>
        <p className="text-sm text-txt-secondary mb-6">Priorisierte Massnahmen für den sofortigen Start</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {firstSix.map((m) => (
            <MassnahmenCard key={m.id} m={m} index={m.reihenfolge} variant="primary" />
          ))}
        </div>
      </div>

      {!showNext && secondSix.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowNext(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-bg-surface border border-bd-faint text-txt-secondary text-sm font-medium rounded-sm hover:border-bd-strong hover:text-txt-primary transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            Nächste 6 anzeigen
          </button>
        </div>
      )}

      {showNext && secondSix.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-1">Nächste 6 — zweite Welle</h3>
          <p className="text-xs text-txt-secondary mb-4">Diese Massnahmen werden in der nächsten Welle angegangen — Priorisierung erfolgt iterativ.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {secondSix.map((m) => (
              <MassnahmenCard key={m.id} m={m} index={m.reihenfolge} variant="secondary" />
            ))}
          </div>
        </div>
      )}

      {inProgress.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-status-green" /> Bereits in Umsetzung
          </h3>
          {inProgress.map(m => (
            <div key={m.id} className="bg-bg-surface border border-status-green/20 rounded-sm p-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-status-green">{m.id.toUpperCase()}</span>
                <span className="text-sm text-txt-primary font-medium">{m.titel}</span>
              </div>
              <p className="text-xs text-txt-secondary mt-1">{m.beschreibung}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Massnahmen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [filterCluster, setFilterCluster] = useState('');
  const [filterPrio, setFilterPrio] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDb, setFilterDb] = useState(false);

  useEffect(() => {
    fetch('/api/massnahmen', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...data];
    if (filterCluster) result = result.filter(m => m.cluster === filterCluster);
    if (filterPrio) result = result.filter(m => m.prioritaet === filterPrio);
    if (filterStatus) result = result.filter(m => m.status === filterStatus);
    if (filterDb) result = result.filter(m => m.scnat_db);
    result.sort((a, b) => {
      const prioA = PRIO_ORDER[a.prioritaet] ?? 4;
      const prioB = PRIO_ORDER[b.prioritaet] ?? 4;
      if (prioA !== prioB) return prioA - prioB;
      return (b.wirkung || 0) * (11 - (b.aufwand || 5)) - (a.wirkung || 0) * (11 - (a.aufwand || 5));
    });
    return result;
  }, [data, filterCluster, filterPrio, filterStatus, filterDb]);

  const clusters = useMemo(() => [...new Set(data.map(m => m.cluster))].sort(), [data]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const views = [
    { id: 'list', label: 'Alle Massnahmen' },
    { id: 'matrix', label: 'Wirkung / Aufwand' },
    { id: 'start6', label: 'Start mit 6' },
  ];

  return (
    <div>
      <PageHeader
        title="Massnahmen"
        subtitle={`${data.length || 32} Massnahmen zur Umsetzung der Digitalisierungsstrategie`}
        breadcrumb={[{ label: 'Massnahmen' }]}
        seed={33}
        accentColor="#9B59B6"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <div className="bg-bg-surface border border-bd-faint rounded-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-txt-secondary leading-relaxed flex-1">
            <strong className="text-txt-primary">Wie kommen neue Massnahmen hinzu?</strong> — Der Massnahmenkatalog ist kein statisches Dokument. 
            Neue Vorschläge können jederzeit über den <strong className="text-txt-primary">Change-Prozess</strong> eingereicht werden — 
            entweder direkt oder über deinen Change Agent. Das Digitalisierungsteam prüft und priorisiert die Vorschläge.
          </p>
          <Link
            to="/prozesse?tab=change"
            className="inline-flex items-center gap-2 px-4 py-2 bg-scnat-teal/10 text-scnat-teal text-xs font-medium rounded-sm hover:bg-scnat-teal/20 transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Change einreichen
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-bg-surface border border-bd-faint rounded-sm p-1 w-full sm:w-fit overflow-x-auto">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
              view === v.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view !== 'start6' && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-txt-tertiary" />
          <select
            value={filterCluster}
            onChange={e => setFilterCluster(e.target.value)}
            className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          >
            <option value="">Alle Cluster</option>
            {clusters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filterPrio}
            onChange={e => setFilterPrio(e.target.value)}
            className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
          >
            <option value="">Alle Prioritäten</option>
            {Object.entries(PRIO_LABEL).map(([k, v]) => <option key={k} value={k}>{k} – {v}</option>)}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-txt-secondary cursor-pointer">
            <input type="checkbox" checked={filterDb} onChange={e => setFilterDb(e.target.checked)} className="rounded-sm" />
            Nur SCNAT-DB
          </label>
          <span className="text-xs text-txt-tertiary font-mono ml-auto">{filtered.length} Massnahmen</span>
        </div>
      )}

      {view === 'list' && <ListView items={filtered} />}
      {view === 'matrix' && <MatrixView items={filtered} />}
      {view === 'start6' && <StartSixView items={data} />}
    </div>
    </div>
  );
}
