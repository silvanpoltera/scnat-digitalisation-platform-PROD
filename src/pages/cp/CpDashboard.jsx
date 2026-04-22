import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Inbox, Users, BarChart3, MessageSquare,
  Monitor, ThumbsUp, ThumbsDown, Clock, AlertTriangle,
  CheckCircle2, Activity, TrendingUp, Sparkles, ArrowRight, GitPullRequest,
  CalendarRange, Play, Pause, Eye, CircleDot,
} from 'lucide-react';

const CHANGE_STATUS_LABELS = {
  eingereicht: 'Eingereicht',
  in_pruefung: 'In Prüfung',
  angenommen: 'Angenommen',
  abgelehnt: 'Abgelehnt',
  umgesetzt: 'Umgesetzt',
};

function StatCard({ label, value, icon: Icon, color = 'text-txt-tertiary', sub, to }) {
  const Wrapper = to ? Link : 'div';
  return (
    <Wrapper
      {...(to ? { to } : {})}
      className={`bg-bg-surface border border-bd-faint rounded-sm p-4 ${to ? 'hover:border-bd-strong transition-colors cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        {to && <ArrowRight className="w-3 h-3 text-txt-tertiary" />}
      </div>
      <p className="text-2xl font-heading font-semibold text-txt-primary">{value}</p>
      <p className="text-xs text-txt-secondary mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-txt-tertiary mt-1">{sub}</p>}
    </Wrapper>
  );
}

function MiniBar({ label, value, max, color = '#EA515A' }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-txt-secondary w-24 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, backgroundColor: color }} />
      </div>
      <span className="text-txt-tertiary font-mono w-6 text-right">{value}</span>
    </div>
  );
}

export default function CpDashboard() {
  const [events, setEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [massnahmen, setMassnahmen] = useState([]);
  const [themen, setThemen] = useState([]);
  const [votes, setVotes] = useState([]);
  const [changes, setChanges] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/events', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/requests', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/users', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/massnahmen', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/schulungsthemen', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/software-votes', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/changes', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
      fetch('/api/sprints', { credentials: 'include' }).then(r => r.ok ? r.json() : []),
    ]).then(([ev, req, usr, mass, th, sv, ch, sp]) => {
      setEvents(ev); setRequests(req); setUsers(usr);
      setMassnahmen(mass); setThemen(th); setVotes(Array.isArray(sv) ? sv : []); setChanges(ch);
      setSprints(Array.isArray(sp) ? sp : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const eventStats = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    const upcoming = events.filter(e => e.datum >= now);
    const past = events.filter(e => e.datum < now);
    const totalRegs = events.reduce((sum, e) => sum + (e.anmeldungen?.length || 0), 0);
    const totalCapacity = events.reduce((sum, e) => sum + (e.maxTeilnehmer || 0), 0);
    const fillRate = totalCapacity > 0 ? Math.round((totalRegs / totalCapacity) * 100) : 0;
    return { total: events.length, upcoming: upcoming.length, past: past.length, totalRegs, fillRate };
  }, [events]);

  const requestStats = useMemo(() => {
    const offen = requests.filter(r => r.status === 'offen').length;
    const pruefung = requests.filter(r => r.status === 'in Prüfung').length;
    const bewilligt = requests.filter(r => r.status === 'bewilligt').length;
    const abgelehnt = requests.filter(r => r.status === 'abgelehnt').length;
    const dringend = requests.filter(r => r.dringlichkeit === 'dringend' || r.dringlichkeit === 'hoch').length;
    return { total: requests.length, offen, pruefung, bewilligt, abgelehnt, dringend };
  }, [requests]);

  const softwareStats = useMemo(() => {
    const ups = votes.filter(v => v.type === 'up').length;
    const downs = votes.filter(v => v.type === 'down').length;
    const interests = votes.filter(v => v.type === 'interest').length;
    const inUse = votes.filter(v => v.type === 'in_use').length;
    const bySoftware = {};
    votes.forEach(v => {
      if (!bySoftware[v.softwareId]) bySoftware[v.softwareId] = { up: 0, down: 0, interest: 0, in_use: 0, total: 0 };
      bySoftware[v.softwareId][v.type] = (bySoftware[v.softwareId][v.type] || 0) + 1;
      bySoftware[v.softwareId].total++;
    });
    const topVoted = Object.entries(bySoftware).sort((a, b) => b[1].total - a[1].total).slice(0, 5);
    return { totalVotes: votes.length, ups, downs, interests, inUse, uniqueSoftware: Object.keys(bySoftware).length, topVoted };
  }, [votes]);

  const changeStats = useMemo(() => {
    const eingereicht = changes.filter(c => c.status === 'eingereicht').length;
    const pruefung = changes.filter(c => c.status === 'in_pruefung').length;
    const angenommen = changes.filter(c => c.status === 'angenommen').length;
    return { total: changes.length, eingereicht, pruefung, angenommen };
  }, [changes]);

  const massnahmenStats = useMemo(() => {
    const byPrio = { A: 0, B: 0, C: 0, D: 0 };
    const byCluster = {};
    massnahmen.forEach(m => {
      if (m.prioritaet) byPrio[m.prioritaet] = (byPrio[m.prioritaet] || 0) + 1;
      byCluster[m.cluster] = (byCluster[m.cluster] || 0) + 1;
    });
    const inUmsetzung = massnahmen.filter(m => m.status === 'in_umsetzung').length;
    const startEmpfohlen = massnahmen.filter(m => m.start_empfohlen).length;
    return { total: massnahmen.length, byPrio, byCluster, inUmsetzung, startEmpfohlen };
  }, [massnahmen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-heading font-semibold text-txt-primary mb-1">Dashboard</h2>
        <p className="text-sm text-txt-secondary">Übersicht über alle Module der Digitalisierungsplattform</p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Sprints" value={sprints.length} icon={CalendarRange} color="text-scnat-orange" sub={`${sprints.filter(s => s.status === 'active').length} aktiv`} to="/cp/sprints" />
        <StatCard label="Events" value={eventStats.total} icon={Calendar} color="text-scnat-teal" sub={`${eventStats.upcoming} bevorstehend`} to="/cp/events" />
        <StatCard label="Anmeldungen" value={eventStats.totalRegs} icon={Users} color="text-scnat-green" sub={`${eventStats.fillRate}% Auslastung`} />
        <StatCard label="Anträge" value={requestStats.total} icon={Inbox} color="text-scnat-orange" sub={`${requestStats.offen} offen`} to="/cp/antraege" />
        <StatCard label="Massnahmen" value={massnahmenStats.total} icon={BarChart3} color="text-scnat-red" sub={`${massnahmenStats.inUmsetzung} in Umsetzung`} to="/cp/massnahmen" />
        <StatCard label="Schulungsthemen" value={themen.length} icon={MessageSquare} color="text-scnat-cyan" sub={`${themen.reduce((s, t) => s + (t.likes?.length || 0), 0)} Votes`} to="/cp/themen" />
        <StatCard label="Changes" value={changeStats.total} icon={GitPullRequest} color="text-scnat-cyan" sub={`${changeStats.eingereicht} neu`} to="/cp/changes" />
        <StatCard label="Software-Votes" value={softwareStats.totalVotes} icon={Monitor} color="text-status-blue" sub={`${softwareStats.uniqueSoftware} Apps bewertet`} />
      </div>

      {/* Sprint Overview */}
      {sprints.length > 0 && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-scnat-orange" /> Sprint-Übersicht
            </h3>
            <Link to="/cp/sprints" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">Verwalten →</Link>
          </div>

          {/* Sprint-Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <div className="bg-status-blue/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-status-blue">{sprints.filter(s => s.status === 'active').length}</p>
              <p className="text-[9px] text-txt-tertiary">Aktive Sprints</p>
            </div>
            <div className="bg-bg-elevated rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-txt-secondary">{sprints.filter(s => s.status === 'planned').length}</p>
              <p className="text-[9px] text-txt-tertiary">Geplant</p>
            </div>
            <div className="bg-status-yellow/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-status-yellow">{sprints.filter(s => s.status === 'review').length}</p>
              <p className="text-[9px] text-txt-tertiary">Review</p>
            </div>
            <div className="bg-status-green/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-status-green">{sprints.filter(s => s.status === 'completed').length}</p>
              <p className="text-[9px] text-txt-tertiary">Abgeschlossen</p>
            </div>
          </div>

          {/* Massnahmen-Status */}
          <p className="text-[10px] font-mono text-txt-tertiary mb-2">Massnahmen</p>
          <div className="grid grid-cols-5 gap-2 mb-5">
            {(() => {
              const allM = sprints.flatMap(s => s.massnahmen || []);
              const geplant = allM.filter(m => m.status === 'geplant').length;
              const inArbeit = allM.filter(m => m.status === 'in-arbeit').length;
              const review = allM.filter(m => m.status === 'review').length;
              const fertig = allM.filter(m => m.status === 'fertig').length;
              const total = allM.length;
              return [
                { v: total, l: 'Total', c: 'text-txt-primary', bg: 'bg-bg-elevated' },
                { v: geplant, l: 'Geplant', c: 'text-txt-secondary', bg: 'bg-bg-elevated' },
                { v: inArbeit, l: 'In Arbeit', c: 'text-status-blue', bg: 'bg-status-blue/10' },
                { v: review, l: 'Review', c: 'text-status-yellow', bg: 'bg-status-yellow/10' },
                { v: fertig, l: 'Fertig', c: 'text-status-green', bg: 'bg-status-green/10' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-sm p-2 text-center`}>
                  <p className={`text-sm font-heading font-semibold ${s.c}`}>{s.v}</p>
                  <p className="text-[8px] text-txt-tertiary">{s.l}</p>
                </div>
              ));
            })()}
          </div>

          <div className="space-y-3">
            {sprints
              .sort((a, b) => {
                const order = { active: 0, review: 1, planned: 2, completed: 3 };
                return (order[a.status] ?? 9) - (order[b.status] ?? 9);
              })
              .map(sp => {
                const totalM = sp.massnahmen?.length || 0;
                const avgProgress = totalM > 0
                  ? Math.round(sp.massnahmen.reduce((s, m) => s + (m.progress || 0), 0) / totalM)
                  : 0;
                const doneCount = sp.massnahmen?.filter(m => m.status === 'done' || m.progress >= 100).length || 0;
                const inArbeit = sp.massnahmen?.filter(m => m.status === 'in-arbeit').length || 0;
                const startFmt = sp.startDate ? new Date(sp.startDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : '';
                const endFmt = sp.endDate ? new Date(sp.endDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : '';
                const isActive = sp.status === 'active';
                const isOverdue = sp.endDate && new Date(sp.endDate) < new Date() && sp.status === 'active';

                return (
                  <div key={sp.id} className={`rounded-sm border p-4 transition-colors ${
                    isActive ? 'border-l-2 bg-bg-elevated/50' : 'border-bd-faint'
                  }`} style={isActive ? { borderLeftColor: sp.clusterColor } : undefined}>
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-0.5 w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: sp.clusterColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-txt-primary truncate">{sp.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm ${
                            sp.status === 'active'    ? 'bg-status-blue/15 text-status-blue' :
                            sp.status === 'review'    ? 'bg-status-yellow/15 text-status-yellow' :
                            sp.status === 'completed' ? 'bg-status-green/15 text-status-green' :
                            'bg-bg-elevated text-txt-tertiary'
                          }`}>
                            {sp.status === 'active' ? 'Aktiv' : sp.status === 'planned' ? 'Geplant' : sp.status === 'review' ? 'Review' : 'Fertig'}
                          </span>
                          {isOverdue && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-scnat-red/15 text-scnat-red">
                              Überfällig
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-txt-tertiary mb-2.5">
                          <span className="font-mono">{startFmt} → {endFmt}</span>
                          <span className="capitalize">{sp.cluster}</span>
                          <span>{totalM} Massnahmen</span>
                          {inArbeit > 0 && <span className="text-status-blue">{inArbeit} in Arbeit</span>}
                          {doneCount > 0 && <span className="text-status-green">{doneCount} fertig</span>}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-bg-base rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${avgProgress}%`,
                                backgroundColor: avgProgress >= 80 ? 'var(--status-green)' : avgProgress >= 40 ? sp.clusterColor : 'var(--txt-tertiary)',
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-mono text-txt-secondary w-10 text-right">{avgProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Events Detail */}
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-scnat-teal" /> Events & Schulungen
            </h3>
            <Link to="/cp/events" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">Alle →</Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-bg-elevated rounded-sm p-3 text-center">
              <p className="text-lg font-heading font-semibold text-scnat-teal">{eventStats.upcoming}</p>
              <p className="text-[10px] text-txt-tertiary">Bevorstehend</p>
            </div>
            <div className="bg-bg-elevated rounded-sm p-3 text-center">
              <p className="text-lg font-heading font-semibold text-txt-primary">{eventStats.totalRegs}</p>
              <p className="text-[10px] text-txt-tertiary">Anmeldungen</p>
            </div>
            <div className="bg-bg-elevated rounded-sm p-3 text-center">
              <p className="text-lg font-heading font-semibold text-status-yellow">{eventStats.fillRate}%</p>
              <p className="text-[10px] text-txt-tertiary">Auslastung</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-txt-tertiary mb-1">Nächste Events</p>
            {events
              .filter(e => e.datum >= new Date().toISOString().split('T')[0])
              .sort((a, b) => a.datum.localeCompare(b.datum))
              .slice(0, 4)
              .map(e => {
                const regs = e.anmeldungen?.length || 0;
                const pct = Math.round((regs / e.maxTeilnehmer) * 100);
                return (
                  <div key={e.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-bd-faint last:border-0">
                    <span className="text-txt-tertiary font-mono w-20">{e.datum.slice(5)}</span>
                    <span className="text-txt-primary flex-1 truncate">{e.titel}</span>
                    <div className="w-16 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? 'var(--accent-red)' : pct > 50 ? 'var(--status-yellow)' : 'var(--status-green)' }} />
                    </div>
                    <span className="text-txt-tertiary font-mono w-12 text-right">{regs}/{e.maxTeilnehmer}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Anträge Detail */}
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
              <Inbox className="w-4 h-4 text-scnat-orange" /> Softwareanträge
            </h3>
            <Link to="/cp/antraege" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">Alle →</Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-status-yellow/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-status-yellow">{requestStats.offen}</p>
              <p className="text-[9px] text-txt-tertiary">Offen</p>
            </div>
            <div className="bg-status-blue/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-status-blue">{requestStats.pruefung}</p>
              <p className="text-[9px] text-txt-tertiary">In Prüfung</p>
            </div>
            <div className="bg-status-green/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-status-green">{requestStats.bewilligt}</p>
              <p className="text-[9px] text-txt-tertiary">Bewilligt</p>
            </div>
            <div className="bg-scnat-red/10 rounded-sm p-2 text-center">
              <p className="text-base font-heading font-semibold text-scnat-red">{requestStats.abgelehnt}</p>
              <p className="text-[9px] text-txt-tertiary">Abgelehnt</p>
            </div>
          </div>
          {requestStats.dringend > 0 && (
            <div className="flex items-center gap-2 mb-3 bg-scnat-red/5 border border-scnat-red/20 rounded-sm px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-scnat-red" />
              <span className="text-xs text-scnat-red">{requestStats.dringend} Antrag/Anträge mit hoher/dringender Priorität</span>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-txt-tertiary mb-1">Letzte Anträge</p>
            {requests
              .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
              .slice(0, 4)
              .map(r => (
                <div key={r.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-bd-faint last:border-0">
                  <span className="text-txt-primary font-medium flex-1 truncate">{r.name}</span>
                  <span className="text-txt-tertiary truncate max-w-[80px]">{r.abteilung}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                    r.status === 'offen' ? 'bg-status-yellow/15 text-status-yellow' :
                    r.status === 'in Prüfung' ? 'bg-status-blue/15 text-status-blue' :
                    r.status === 'bewilligt' ? 'bg-status-green/15 text-status-green' :
                    'bg-scnat-red/15 text-scnat-red'
                  }`}>{r.status}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Software Votes */}
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-status-blue" /> Software-Feedback
          </h3>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-scnat-teal/10 rounded-sm p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <CheckCircle2 className="w-3 h-3 text-scnat-teal" />
              </div>
              <p className="text-base font-heading font-semibold text-scnat-teal">{softwareStats.inUse}</p>
              <p className="text-[9px] text-txt-tertiary">Nutze ich</p>
            </div>
            <div className="bg-status-green/10 rounded-sm p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <ThumbsUp className="w-3 h-3 text-status-green" />
              </div>
              <p className="text-base font-heading font-semibold text-status-green">{softwareStats.ups}</p>
              <p className="text-[9px] text-txt-tertiary">Zufrieden</p>
            </div>
            <div className="bg-scnat-red/10 rounded-sm p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <ThumbsDown className="w-3 h-3 text-scnat-red" />
              </div>
              <p className="text-base font-heading font-semibold text-scnat-red">{softwareStats.downs}</p>
              <p className="text-[9px] text-txt-tertiary">Unzufrieden</p>
            </div>
            <div className="bg-status-yellow/10 rounded-sm p-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 text-status-yellow" />
              </div>
              <p className="text-base font-heading font-semibold text-status-yellow">{softwareStats.interests}</p>
              <p className="text-[9px] text-txt-tertiary">Interesse</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-txt-tertiary mb-1">Meiste Bewertungen</p>
            {softwareStats.topVoted.map(([id, counts]) => (
              <MiniBar key={id} label={id} value={counts.total} max={Math.max(...softwareStats.topVoted.map(([, c]) => c.total))} color="var(--status-blue)" />
            ))}
          </div>
        </div>

        {/* Massnahmen Overview */}
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-scnat-red" /> Massnahmen
            </h3>
            <Link to="/cp/massnahmen" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">Alle →</Link>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries(massnahmenStats.byPrio).map(([prio, count]) => (
              <div key={prio} className={`rounded-sm p-2 text-center ${
                prio === 'A' ? 'bg-scnat-red/10' : prio === 'B' ? 'bg-status-yellow/10' : prio === 'C' ? 'bg-status-blue/10' : 'bg-bg-elevated'
              }`}>
                <p className={`text-base font-heading font-semibold ${
                  prio === 'A' ? 'text-scnat-red' : prio === 'B' ? 'text-status-yellow' : prio === 'C' ? 'text-status-blue' : 'text-txt-secondary'
                }`}>{count}</p>
                <p className="text-[9px] text-txt-tertiary">Prio {prio}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5 text-status-green" />
              <span className="text-txt-secondary">{massnahmenStats.inUmsetzung} in Umsetzung</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-scnat-red" />
              <span className="text-txt-secondary">{massnahmenStats.startEmpfohlen} «Start mit 5»</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-txt-tertiary mb-1">Nach Cluster</p>
            {Object.entries(massnahmenStats.byCluster).sort(([, a], [, b]) => b - a).map(([cluster, count]) => (
              <MiniBar key={cluster} label={cluster} value={count} max={Math.max(...Object.values(massnahmenStats.byCluster))} color="#9B59B6" />
            ))}
          </div>
        </div>
      </div>

      {/* Change-Requests */}
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
            <GitPullRequest className="w-4 h-4 text-scnat-teal" /> Change-Vorschläge
          </h3>
          <Link to="/cp/changes" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">Verwalten →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="bg-status-yellow/10 rounded-sm p-2 text-center">
            <p className="text-base font-heading font-semibold text-status-yellow">{changeStats.eingereicht}</p>
            <p className="text-[9px] text-txt-tertiary">Eingereicht</p>
          </div>
          <div className="bg-status-blue/10 rounded-sm p-2 text-center">
            <p className="text-base font-heading font-semibold text-status-blue">{changeStats.pruefung}</p>
            <p className="text-[9px] text-txt-tertiary">In Prüfung</p>
          </div>
          <div className="bg-status-green/10 rounded-sm p-2 text-center">
            <p className="text-base font-heading font-semibold text-status-green">{changeStats.angenommen}</p>
            <p className="text-[9px] text-txt-tertiary">Angenommen</p>
          </div>
          <div className="bg-bg-elevated rounded-sm p-2 text-center">
            <p className="text-base font-heading font-semibold text-txt-secondary">{changeStats.total}</p>
            <p className="text-[9px] text-txt-tertiary">Total</p>
          </div>
        </div>
        {changes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-mono text-txt-tertiary mb-1">Letzte Vorschläge</p>
            {changes
              .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
              .slice(0, 5)
              .map(c => (
                <div key={c.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-bd-faint last:border-0">
                  <span className="text-txt-primary font-medium flex-1 truncate">{c.titel}</span>
                  <span className="text-txt-tertiary truncate max-w-[80px]">{c.kontakt}</span>
                  {c.readiness?.widerstand && (
                    <span className={`text-[10px] font-mono ${
                      c.readiness.widerstand === 'hoch' ? 'text-scnat-red' :
                      c.readiness.widerstand === 'mittel' ? 'text-status-yellow' :
                      'text-status-green'
                    }`}>{c.readiness.widerstand}</span>
                  )}
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                    c.status === 'eingereicht' ? 'bg-status-yellow/15 text-status-yellow' :
                    c.status === 'in_pruefung' ? 'bg-status-blue/15 text-status-blue' :
                    c.status === 'angenommen' ? 'bg-status-green/15 text-status-green' :
                    'bg-scnat-red/15 text-scnat-red'
                  }`}>{CHANGE_STATUS_LABELS[c.status] || c.status}</span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-xs text-txt-tertiary">Noch keine Change-Vorschläge eingegangen.</p>
        )}
      </div>

      {/* Schulungsthemen */}
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-scnat-cyan" /> Schulungsthemen-Voting
          </h3>
          <Link to="/cp/themen" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">Verwalten →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {themen.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).map(t => (
            <div key={t.id} className="bg-bg-elevated rounded-sm p-3 flex items-start gap-3">
              <div className="bg-scnat-cyan/10 text-scnat-cyan rounded-sm px-2 py-1 text-xs font-mono font-bold">
                {t.likes?.length || 0}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-txt-primary font-medium truncate">{t.titel}</p>
                {t.beschreibung && <p className="text-[10px] text-txt-tertiary mt-0.5 line-clamp-2">{t.beschreibung}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
