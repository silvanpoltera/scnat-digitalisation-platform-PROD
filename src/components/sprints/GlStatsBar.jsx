const CLUSTER_COLORS = {
  infrastruktur: '#0098DA',
  datenstrategie: '#7C5CBF',
  prozessdigitalisierung: '#008770',
  kommunikation: '#EA515A',
  skills: '#F07800',
  compliance: '#5A616B',
};

const CLUSTER_SHORT = {
  infrastruktur: 'Infra',
  datenstrategie: 'Daten',
  prozessdigitalisierung: 'Prozess',
  kommunikation: 'Komm.',
  skills: 'Skills',
  compliance: 'Comp.',
};

export default function GlStatsBar({ sprints }) {
  const allMassnahmen = sprints.flatMap(s => s.massnahmen);
  const activeCount = sprints.filter(s => s.status === 'active').length;
  const runningCount = allMassnahmen.filter(m => m.status === 'in-arbeit').length;
  const reviewCount = allMassnahmen.filter(m => m.status === 'review').length;
  const doneCount = allMassnahmen.filter(m => m.status === 'fertig').length;
  const avgProgress = allMassnahmen.length > 0
    ? Math.round(allMassnahmen.reduce((a, m) => a + (m.progress || 0), 0) / allMassnahmen.length)
    : 0;

  const clusterBars = Object.entries(CLUSTER_COLORS).map(([key, color]) => {
    const clusterSprints = sprints.filter(s => s.cluster === key);
    const clusterMs = clusterSprints.flatMap(s => s.massnahmen);
    const total = clusterMs.length;
    const done = clusterMs.filter(m => m.status === 'fertig').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { key, color, pct, label: CLUSTER_SHORT[key] || key };
  });

  return (
    <div className="sticky top-0 z-[100] bg-bg-base/97 backdrop-blur-md border-b border-bd-faint">
      <div className="flex items-center gap-0 px-4 md:px-8 py-3 overflow-x-auto">
        <StatItem dotColor="#0098DA" value={activeCount} label="Aktive Sprints" />
        <StatItem dotColor="#F07800" value={runningCount} label="In Arbeit" />
        <StatItem dotColor="rgba(240,120,0,.7)" value={reviewCount} label="In Review" />
        <StatItem dotColor="#008770" value={doneCount} label="Abgeschlossen" />
        <StatItem value={`${avgProgress}%`} label="∅ Fortschritt" valueColor="#EA515A" />

        <div className="hidden md:flex gap-2.5 items-center pl-5 ml-auto">
          {clusterBars.map(cb => (
            <div key={cb.key} className="flex flex-col items-center gap-1">
              <div className="w-8 h-7 rounded-sm overflow-hidden flex items-end" style={{ background: 'var(--b-faint, #1E2124)' }}>
                <div className="w-full rounded-sm transition-all duration-500" style={{ height: `${Math.max(cb.pct, 4)}%`, background: cb.color }} />
              </div>
              <span className="font-mono text-[8px] tracking-wide text-txt-tertiary">{cb.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatItem({ dotColor, value, label, valueColor }) {
  return (
    <div className="flex items-center gap-2.5 py-1 px-3 md:px-5 border-r border-bd-faint last:border-r-0 min-w-0">
      {dotColor && <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />}
      <div>
        <div className="text-lg font-bold leading-none text-txt-primary" style={valueColor ? { color: valueColor } : undefined}>{value}</div>
        <div className="font-mono text-[9px] uppercase tracking-wider text-txt-tertiary leading-snug">{label}</div>
      </div>
    </div>
  );
}
