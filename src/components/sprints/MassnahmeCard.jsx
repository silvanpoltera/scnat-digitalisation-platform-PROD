const STATUS_STYLES = {
  'geplant':   { bg: 'rgba(78,83,93,.15)',  color: '#4E535D', border: 'rgba(78,83,93,.3)' },
  'in-arbeit': { bg: 'rgba(0,152,218,.1)',  color: '#0098DA', border: 'rgba(0,152,218,.3)' },
  'review':    { bg: 'rgba(240,120,0,.1)',  color: '#F07800', border: 'rgba(240,120,0,.3)' },
  'fertig':    { bg: 'rgba(0,135,112,.1)',  color: '#008770', border: 'rgba(0,135,112,.3)' },
  'blockiert': { bg: 'rgba(234,81,90,.1)',  color: '#EA515A', border: 'rgba(234,81,90,.3)' },
};

const STATUS_LABELS = {
  'geplant': 'Geplant',
  'in-arbeit': 'In Arbeit',
  'review': 'Review',
  'fertig': 'Fertig',
  'blockiert': 'Blockiert',
};

export default function MassnahmeCard({ m, clusterColor }) {
  const style = STATUS_STYLES[m.status] || STATUS_STYLES['geplant'];
  const initials = (m.verantwortliche || '').split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-[3px] p-3.5 flex flex-col gap-1.5 hover:border-bd-strong transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[9px] text-txt-tertiary px-1.5 py-0.5 border border-bd-faint rounded-sm shrink-0">
          {m.massnahmeId}
        </span>
        <span
          className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm shrink-0"
          style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
        >
          {STATUS_LABELS[m.status] || m.status}
        </span>
      </div>

      <div className="text-[13px] font-medium leading-snug text-txt-primary">
        {m.titel || m.massnahmeId}
      </div>

      <div className="flex items-center gap-1.5 mt-0.5">
        {clusterColor && <div className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: clusterColor }} />}
        {m.cluster && <span className="font-mono text-[8.5px] text-txt-tertiary">{m.cluster}</span>}
        {m.verantwortliche && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-txt-secondary">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center font-mono text-[7px] border border-bd-default shrink-0"
              style={{ background: 'var(--elevated, #1C1E22)' }}
            >
              {initials}
            </div>
            <span>{m.verantwortliche}</span>
          </div>
        )}
      </div>

      {m.progress > 0 && (
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--b-faint, #1E2124)' }}>
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
