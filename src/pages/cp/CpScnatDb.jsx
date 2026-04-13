import { useState, useEffect } from 'react';
import {
  Save, Plus, Trash2, Database, AlertTriangle, Filter, Shield, Zap,
  GitBranch, CheckCircle2, XCircle, ChevronDown, Rocket, Server, RefreshCw,
} from 'lucide-react';
import ArchitekturDiagramm from '@/components/systemlandschaft/ArchitekturDiagramm';

/* ── Strategische Optionen (read-only) ── */
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
            <div key={opt.id} className={`rounded-sm border-2 ${colors.border} ${colors.bg} transition-all duration-200 ${isExpanded ? 'lg:col-span-3' : ''}`}>
              <button onClick={() => setExpanded(isExpanded ? null : opt.id)} className="w-full text-left p-5">
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
                  <span className="text-[10px] font-mono text-txt-tertiary">Aufwand: <span className="text-txt-secondary">{opt.aufwand}</span></span>
                  <span className="text-[10px] font-mono text-txt-tertiary">Risiko: <span className="text-txt-secondary">{opt.risiko}</span></span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 border-t border-bd-faint pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-status-green mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Vorteile</p>
                      <div className="space-y-1.5">
                        {opt.vorteile?.map((v, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-txt-secondary"><span className="text-status-green mt-0.5 shrink-0">+</span>{v}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-mono text-scnat-red mb-2 flex items-center gap-1.5"><XCircle className="w-3 h-3" /> Nachteile</p>
                      <div className="space-y-1.5">
                        {opt.nachteile?.map((n, j) => (
                          <div key={j} className="flex items-start gap-2 text-xs text-txt-secondary"><span className="text-scnat-red mt-0.5 shrink-0">−</span>{n}</div>
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

/* ── Entscheide-Karten (rich view + editable status) ── */
const ENTSCHEID_STATUS_COLORS = {
  offen: 'bg-status-yellow/15 text-status-yellow border-status-yellow/30',
  'in Klärung': 'bg-status-blue/15 text-status-blue border-status-blue/30',
  entschieden: 'bg-status-green/15 text-status-green border-status-green/30',
};

const ENTSCHEID_ICONS = { 'CI/CD': Rocket, Terraform: Server, Xojo: RefreshCw, CMS: Database, Hosting: Server };

function EntscheideView({ entscheide, onStatusChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {entscheide.map(e => {
        const matchedKey = Object.keys(ENTSCHEID_ICONS).find(k => e.titel.includes(k));
        const EIcon = matchedKey ? ENTSCHEID_ICONS[matchedKey] : Database;

        return (
          <div key={e.id} className="bg-bg-surface border border-bd-faint rounded-sm p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-sm bg-bg-elevated text-txt-secondary shrink-0 mt-0.5"><EIcon className="w-4 h-4" /></div>
                <h4 className="text-sm font-heading font-semibold text-txt-primary">{e.titel}</h4>
              </div>
              <select
                value={e.status}
                onChange={ev => onStatusChange(e.id, ev.target.value)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border cursor-pointer focus:outline-none ${ENTSCHEID_STATUS_COLORS[e.status] || 'bg-bg-elevated text-txt-secondary border-bd-faint'}`}
              >
                <option value="offen">offen</option>
                <option value="in Klärung">in Klärung</option>
                <option value="entschieden">entschieden</option>
              </select>
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

/* ── Backlog (rich view + management) ── */
function BacklogView({ backlog, onAdd, onDelete, newBacklog, setNewBacklog }) {
  const [filterBereich, setFilterBereich] = useState('');
  const bereiche = [...new Set(backlog.map(b => b.bereich))];
  const filtered = filterBereich ? backlog.filter(b => b.bereich === filterBereich) : backlog;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Filter className="w-4 h-4 text-txt-tertiary" />
        <select
          value={filterBereich}
          onChange={e => setFilterBereich(e.target.value)}
          className="bg-bg-elevated border border-bd-faint text-txt-secondary text-xs px-2.5 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
        >
          <option value="">Alle Bereiche</option>
          {bereiche.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <span className="text-[10px] text-txt-tertiary font-mono">{filtered.length} Einträge</span>
      </div>

      <form onSubmit={onAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-3 mb-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
        <input value={newBacklog.titel} onChange={e => setNewBacklog({ ...newBacklog, titel: e.target.value })} required placeholder="Titel" className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
        <input value={newBacklog.beschreibung} onChange={e => setNewBacklog({ ...newBacklog, beschreibung: e.target.value })} placeholder="Beschreibung" className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none sm:col-span-2" />
        <input value={newBacklog.bereich} onChange={e => setNewBacklog({ ...newBacklog, bereich: e.target.value })} placeholder="Bereich" className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
        <button type="submit" className="flex items-center justify-center gap-1 bg-scnat-red text-white text-xs rounded-sm hover:bg-[#F06570] transition-colors"><Plus className="w-3 h-3" /> Hinzufügen</button>
      </form>

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
                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded-sm ${b.prioritaet === 'hoch' ? 'bg-scnat-red/15 text-scnat-red' : 'bg-bg-elevated text-txt-tertiary'}`}>{b.prioritaet}</span>
                </div>
                <p className="text-xs text-txt-secondary">{b.beschreibung}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {isOld && <AlertTriangle className="w-3.5 h-3.5 text-status-yellow" />}
                <span className={`text-xs font-mono ${isOld ? 'text-status-yellow' : 'text-txt-tertiary'}`}>Seit {b.seit}</span>
                <button onClick={() => onDelete(b.id)} className="text-txt-tertiary hover:text-scnat-red p-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Component ── */
const TABS = [
  { id: 'uebersicht', label: 'Architektur' },
  { id: 'strategie', label: 'Strategische Optionen' },
  { id: 'entscheide', label: 'Grundsatzentscheide' },
  { id: 'backlog', label: 'Backlog' },
  { id: 'status', label: 'Status verwalten' },
];

export default function CpScnatDb() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('uebersicht');
  const [saving, setSaving] = useState(false);
  const [newBacklog, setNewBacklog] = useState({ titel: '', beschreibung: '', bereich: '', seit: '2026', prioritaet: 'mittel' });

  const load = () => {
    fetch('/api/scnat-infra', { credentials: 'include' }).then(r => r.json()).then(setData).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const saveStatus = async () => {
    setSaving(true);
    await fetch('/api/scnat-infra/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data.status),
    });
    setSaving(false);
  };

  const updateEntscheid = async (id, status) => {
    await fetch(`/api/scnat-infra/entscheide/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    load();
  };

  const addBacklog = async (e) => {
    e.preventDefault();
    await fetch('/api/scnat-infra/backlog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newBacklog),
    });
    setNewBacklog({ titel: '', beschreibung: '', bereich: '', seit: '2026', prioritaet: 'mittel' });
    load();
  };

  const deleteBacklog = async (id) => {
    await fetch(`/api/scnat-infra/backlog/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  if (!data) return <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />;

  const entscheideCount = data.entscheide?.length || 0;
  const backlogCount = data.backlog?.length || 0;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-heading font-semibold text-txt-primary">SCNAT DB & Portale</h2>

      <div className="flex items-center gap-1 bg-bg-surface border border-bd-faint rounded-sm p-1 w-full overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
            }`}
          >
            {t.label}
            {t.id === 'entscheide' && ` (${entscheideCount})`}
            {t.id === 'backlog' && ` (${backlogCount})`}
          </button>
        ))}
      </div>

      {tab === 'uebersicht' && <ArchitekturDiagramm status={data.status} />}

      {tab === 'strategie' && <StrategischeOptionen data={data.strategische_optionen} />}

      {tab === 'entscheide' && (
        <EntscheideView entscheide={data.entscheide || []} onStatusChange={updateEntscheid} />
      )}

      {tab === 'backlog' && (
        <BacklogView
          backlog={data.backlog || []}
          onAdd={addBacklog}
          onDelete={deleteBacklog}
          newBacklog={newBacklog}
          setNewBacklog={setNewBacklog}
        />
      )}

      {tab === 'status' && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-4">Konsolidierung verwalten</h3>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Prozent</label>
              <input
                type="number" min="0" max="100"
                value={data.status?.konsolidierung_prozent || 0}
                onChange={e => setData({ ...data, status: { ...data.status, konsolidierung_prozent: parseInt(e.target.value) } })}
                className="w-20 bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Geplanter Abschluss</label>
              <input
                value={data.status?.geplanter_abschluss || ''}
                onChange={e => setData({ ...data, status: { ...data.status, geplanter_abschluss: e.target.value } })}
                className="w-28 bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Startjahr</label>
              <input
                value={data.status?.start_jahr || ''}
                onChange={e => setData({ ...data, status: { ...data.status, start_jahr: e.target.value } })}
                className="w-20 bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>
            <button onClick={saveStatus} disabled={saving} className="flex items-center gap-1.5 bg-scnat-red text-white text-xs px-4 py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
