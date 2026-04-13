import { useState, useEffect } from 'react';
import { Database, AlertTriangle, Filter, Shield, Zap, GitBranch, CheckCircle2, XCircle, ChevronDown, Rocket, Server, RefreshCw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ArchitekturDiagramm from '../components/systemlandschaft/ArchitekturDiagramm';

const OPTION_ICONS = { shield: Shield, zap: Zap, 'git-branch': GitBranch };
const OPTION_COLORS = {
  'opt-a': { border: 'border-status-blue/40', bg: 'bg-status-blue/5', accent: 'text-status-blue', iconBg: 'bg-status-blue/15' },
  'opt-b': { border: 'border-scnat-red/40', bg: 'bg-scnat-red/5', accent: 'text-scnat-red', iconBg: 'bg-scnat-red/15' },
  'opt-c': { border: 'border-status-green/40', bg: 'bg-status-green/5', accent: 'text-status-green', iconBg: 'bg-status-green/15' },
};

function StrategischeOptionen({ data }) {
  const [expanded, setExpanded] = useState(null);

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-sm bg-status-yellow/15 text-status-yellow shrink-0">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-semibold text-txt-primary mb-1">{data.titel}</h3>
            <p className="text-xs text-txt-secondary leading-relaxed">{data.beschreibung}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] font-mono bg-status-yellow/15 text-status-yellow px-1.5 py-0.5 rounded-sm border border-status-yellow/30">Entscheid ausstehend</span>
          <span className="text-[10px] text-txt-tertiary">Verantwortlich: IT / Geschäftsleitung</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {data.optionen?.map((opt, i) => {
          const Icon = OPTION_ICONS[opt.icon] || Shield;
          const colors = OPTION_COLORS[opt.id] || OPTION_COLORS['opt-a'];
          const isExpanded = expanded === opt.id;
          const letter = String.fromCharCode(65 + i);

          return (
            <div
              key={opt.id}
              className={`rounded-sm border-2 ${colors.border} ${colors.bg} transition-all duration-200 ${isExpanded ? 'lg:col-span-3' : ''}`}
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : opt.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-sm ${colors.iconBg} ${colors.accent} shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold ${colors.accent}`}>Option {letter}</span>
                    </div>
                    <h4 className="text-sm font-heading font-semibold text-txt-primary">{opt.titel}</h4>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-txt-tertiary transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <p className="text-xs text-txt-secondary leading-relaxed">{opt.beschreibung}</p>

                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="text-[10px] font-mono text-txt-tertiary">
                    Aufwand: <span className="text-txt-secondary">{opt.aufwand}</span>
                  </span>
                  <span className="text-[10px] font-mono text-txt-tertiary">
                    Risiko: <span className="text-txt-secondary">{opt.risiko}</span>
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-bd-faint pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-status-green mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" /> Vorteile
                      </p>
                      <div className="space-y-1.5">
                        {opt.vorteile?.map((v, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-txt-secondary">
                            <span className="text-status-green mt-0.5 shrink-0">+</span>
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-scnat-red mb-2 flex items-center gap-1.5">
                        <XCircle className="w-3 h-3" /> Nachteile
                      </p>
                      <div className="space-y-1.5">
                        {opt.nachteile?.map((n, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-txt-secondary">
                            <span className="text-scnat-red mt-0.5 shrink-0">−</span>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
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

function EntscheideView({ entscheide }) {
  const statusColors = {
    offen: 'bg-status-yellow/15 text-status-yellow border-status-yellow/30',
    'in Klärung': 'bg-status-blue/15 text-status-blue border-status-blue/30',
    entschieden: 'bg-status-green/15 text-status-green border-status-green/30',
  };

  const iconMap = {
    'CI/CD': Rocket,
    'Terraform': Server,
    'Xojo': RefreshCw,
    'CMS': Database,
    'Hosting': Server,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {entscheide.map(e => {
        const matchedKey = Object.keys(iconMap).find(k => e.titel.includes(k));
        const Entscheid_Icon = matchedKey ? iconMap[matchedKey] : Database;

        return (
          <div key={e.id} className="bg-bg-surface border border-bd-faint rounded-sm p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-sm bg-bg-elevated text-txt-secondary shrink-0 mt-0.5">
                  <Entscheid_Icon className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-heading font-semibold text-txt-primary">{e.titel}</h4>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border shrink-0 ${statusColors[e.status] || 'bg-bg-elevated text-txt-secondary border-bd-faint'}`}>{e.status}</span>
            </div>
            <p className="text-xs text-txt-secondary mb-4">{e.beschreibung}</p>
            <div className="space-y-1.5">
              <p className="text-[10px] font-mono text-txt-tertiary">Optionen:</p>
              {e.optionen?.map((opt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-txt-secondary">
                  <span className="w-4 h-4 rounded-sm bg-bg-elevated flex items-center justify-center text-[10px] font-mono text-txt-tertiary shrink-0 mt-0.5">{i + 1}</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-txt-tertiary mt-3">Verantwortlich: {e.verantwortlich}</p>
          </div>
        );
      })}
    </div>
  );
}

function BacklogView({ backlog }) {
  const [filterBereich, setFilterBereich] = useState('');
  const bereiche = [...new Set(backlog.map(b => b.bereich))];

  const filtered = filterBereich ? backlog.filter(b => b.bereich === filterBereich) : backlog;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-txt-tertiary" />
        <select
          value={filterBereich}
          onChange={e => setFilterBereich(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        >
          <option value="">Alle Bereiche</option>
          {bereiche.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {filtered.map(b => {
          const yearsSince = new Date().getFullYear() - parseInt(b.seit);
          const isOld = yearsSince >= 5;
          return (
            <div key={b.id} className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h4 className="text-sm text-txt-primary font-medium">{b.titel}</h4>
                  <span className="text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1 py-0.5 rounded-sm">{b.bereich}</span>
                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded-sm ${
                    b.prioritaet === 'hoch' ? 'bg-scnat-red/15 text-scnat-red' : 'bg-bg-elevated text-txt-tertiary'
                  }`}>{b.prioritaet}</span>
                </div>
                <p className="text-xs text-txt-secondary">{b.beschreibung}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                {isOld && <AlertTriangle className="w-3.5 h-3.5 text-status-yellow" />}
                <span className={`text-xs font-mono ${isOld ? 'text-status-yellow' : 'text-txt-tertiary'}`}>Seit {b.seit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ScnatDb() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('uebersicht');

  useEffect(() => {
    fetch('/api/scnat-infra', { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" /></div>;
  }

  const tabs = [
    { id: 'uebersicht', label: 'Übersicht' },
    { id: 'strategie', label: 'Strategische Optionen' },
    { id: 'entscheide', label: `Grundsatzentscheide (${data.entscheide?.length || 0})` },
    { id: 'backlog', label: `Backlog (${data.backlog?.length || 0})` },
  ];

  return (
    <div>
      <PageHeader
        title="SCNAT DB & Portale"
        subtitle="Dokumentation der Kern-Infrastruktur, strategische Optionen, Grundsatzentscheide und Entwicklungs-Backlog"
        breadcrumb={[{ label: 'Software & Co', path: '/systemlandschaft' }, { label: 'SCNAT DB' }]}
        seed={22}
        accentColor="#F39C12"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <div className="flex items-center gap-1 mb-6 bg-bg-surface border border-bd-faint rounded-sm p-1 w-full sm:w-fit overflow-x-auto">
        {tabs.map(v => (
          <button
            key={v.id}
            onClick={() => setTab(v.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
              tab === v.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {tab === 'uebersicht' && <ArchitekturDiagramm status={data.status} />}
      {tab === 'strategie' && <StrategischeOptionen data={data.strategische_optionen} />}
      {tab === 'entscheide' && <EntscheideView entscheide={data.entscheide || []} />}
      {tab === 'backlog' && <BacklogView backlog={data.backlog || []} />}
    </div>
    </div>
  );
}
