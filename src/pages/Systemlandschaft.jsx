import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, BarChart3 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { categories, systems } from '../lib/data/systems';
import SystemCard from '../components/systemlandschaft/SystemCard';
import SystemDetailModal from '../components/systemlandschaft/SystemDetailModal';
import ToolMatrix from '../components/systemlandschaft/ToolMatrix';
import SoftwareDrawer from '../components/SoftwareDrawer';
import RadarChart from '../components/RadarChart';

const VIEWS = [
  { id: 'matrix', label: 'Tool-Matrix', icon: LayoutGrid },
  { id: 'list', label: 'Alle Systeme', icon: List },
  { id: 'ranking', label: 'Ranking', icon: BarChart3 },
];

function RankingView({ onSelectSoftware }) {
  const [software, setSoftware] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [tab, setTab] = useState('satisfaction');

  useEffect(() => {
    Promise.all([
      fetch('/api/software-votes/ranking', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([r]) => setRanking(r)).catch(() => {});

    fetch('/api/software-votes', { credentials: 'include' }).catch(() => {});

    import('../../data/software.json').catch(() =>
      fetch('/api/massnahmen', { credentials: 'include' })
    );
  }, []);

  useEffect(() => {
    fetch('/api/software-votes/ranking', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(setRanking)
      .catch(() => {});
  }, []);

  const softwareData = useMemo(() => {
    const soft = [
      { id: 'm365', name: 'Microsoft 365', kategorie: 'Collaboration' },
      { id: 'zoom', name: 'Zoom', kategorie: 'Kommunikation' },
      { id: 'chatgpt', name: 'ChatGPT (Business Team)', kategorie: 'KI' },
      { id: 'deepl', name: 'DeepL', kategorie: 'KI' },
      { id: 'mural', name: 'Mural.co', kategorie: 'Collaboration' },
      { id: 'adobe-cc', name: 'Adobe Creative Cloud', kategorie: 'Kreation' },
      { id: 'daylite', name: 'Daylite', kategorie: 'Collaboration' },
      { id: 'abacus', name: 'Abacus', kategorie: 'Finanzen' },
      { id: 'notion', name: 'Notion', kategorie: 'Collaboration' },
      { id: 'miro', name: 'Miro', kategorie: 'Collaboration' },
    ];
    return soft.map(s => {
      const r = ranking.find(x => x.softwareId === s.id);
      return { ...s, ...(r || { up: 0, down: 0, interest: 0, satisfaction: null }) };
    });
  }, [ranking]);

  const sorted = useMemo(() => {
    if (tab === 'satisfaction') {
      return [...softwareData].sort((a, b) => (b.satisfaction ?? -1) - (a.satisfaction ?? -1));
    }
    return [...softwareData].sort((a, b) => b.interest - a.interest);
  }, [softwareData, tab]);

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 bg-bg-surface border border-bd-faint rounded-sm p-1 w-fit">
        {[{ id: 'satisfaction', label: 'Zufriedenheit' }, { id: 'interest', label: 'Interesse' }].map(v => (
          <button
            key={v.id}
            onClick={() => setTab(v.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
              tab === v.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {sorted.map((s, i) => (
          <div
            key={s.id}
            onClick={() => onSelectSoftware(s)}
            className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-3 flex items-center gap-4 cursor-pointer hover:border-bd-strong transition-colors"
          >
            <span className="text-sm font-heading font-semibold text-txt-tertiary w-6">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-txt-primary font-medium">{s.name}</span>
              <span className="text-[10px] font-mono text-txt-tertiary ml-2">{s.kategorie}</span>
            </div>
            {tab === 'satisfaction' ? (
              <div className="flex items-center gap-3">
                <div className="w-32 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: s.satisfaction != null ? `${s.satisfaction}%` : '0%',
                      backgroundColor: s.satisfaction >= 70 ? '#2ECC71' : s.satisfaction >= 40 ? '#F39C12' : '#EA515A',
                    }}
                  />
                </div>
                <span className="text-xs font-mono text-txt-secondary w-10 text-right">
                  {s.satisfaction != null ? `${s.satisfaction}%` : '–'}
                </span>
              </div>
            ) : (
              <span className="text-sm font-mono text-status-yellow">{s.interest}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Systemlandschaft() {
  const [view, setView] = useState('matrix');
  const [activeCategory, setActiveCategory] = useState('Alle');
  const [activeLizenz, setActiveLizenz] = useState('Alle');
  const [search, setSearch] = useState('');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [drawerSoftware, setDrawerSoftware] = useState(null);
  const [apiSoftware, setApiSoftware] = useState([]);

  useEffect(() => {
    fetch('/api/massnahmen', { credentials: 'include' }).catch(() => {});
  }, []);

  const lizenzFilter = [
    { id: 'Alle', label: 'Alle' },
    { id: 'freigegeben', label: 'Freigegeben' },
    { id: 'nur-einladung', label: 'Nur Einladung' },
    { id: 'nicht-erlaubt', label: 'Nicht erlaubt' },
  ];

  const filtered = useMemo(() => {
    return systems.filter((s) => {
      const matchCat = activeCategory === 'Alle' || s.category === activeCategory;
      const matchLizenz = activeLizenz === 'Alle' || s.lizenzstatus === activeLizenz;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchLizenz && matchSearch;
    });
  }, [activeCategory, activeLizenz, search]);

  const handleSelectForDrawer = (soft) => {
    const mapped = {
      id: soft.id || soft.name?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: soft.name,
      beschreibung: soft.desc || soft.beschreibung,
      status: soft.lizenzstatus === 'freigegeben' ? 'erlaubt' : soft.lizenzstatus,
      kategorie: soft.kategorie || soft.category,
      radar: soft.radar || null,
      notizen: soft.warning || soft.notizen,
    };
    setDrawerSoftware(mapped);
  };

  return (
    <div>
      <PageHeader
        title="Software & Co"
        subtitle="Alle Applikationen und Systeme der SCNAT im Überblick."
        breadcrumb={[{ label: 'Software & Co' }]}
        seed={44}
        accentColor="#0098DA"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex gap-1 p-1 bg-bg-surface border border-bd-faint rounded-sm w-full sm:w-fit overflow-x-auto">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                  view === v.id
                    ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                    : 'text-txt-secondary hover:text-txt-primary border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>

        {view === 'list' && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary" />
            <input
              type="text"
              placeholder="App suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-sm border border-bd-faint bg-bg-elevated text-sm text-txt-primary focus:outline-none focus:border-scnat-red transition-colors"
            />
          </div>
        )}
      </div>

      {view === 'matrix' && <ToolMatrix />}

      {view === 'list' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-scnat-red text-white'
                    : 'bg-bg-surface border border-bd-faint text-txt-secondary hover:text-txt-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {lizenzFilter.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveLizenz(f.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors border ${
                  activeLizenz === f.id
                    ? 'border-txt-primary bg-txt-primary text-bg-base'
                    : 'border-bd-faint text-txt-secondary hover:border-bd-default'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((system, i) => (
              <motion.div
                key={system.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <SystemCard system={system} onClick={handleSelectForDrawer} />
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-txt-secondary">
              Keine Systeme gefunden.
            </div>
          )}
        </>
      )}

      {view === 'ranking' && <RankingView onSelectSoftware={handleSelectForDrawer} />}

      <SystemDetailModal system={selectedSystem} open={!!selectedSystem} onClose={() => setSelectedSystem(null)} />
      {drawerSoftware && <SoftwareDrawer software={drawerSoftware} onClose={() => setDrawerSoftware(null)} />}
    </div>
    </div>
  );
}
