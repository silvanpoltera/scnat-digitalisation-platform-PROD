import { useMemo } from 'react';

const DAY = 86400000;
const TL_DAYS = 42;

function getKW(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / DAY + 1) / 7);
}

function formatDate(d) {
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

const STATUS_DOT_COLORS = {
  active: '#0098DA',
  planned: '#4E535D',
  review: '#F07800',
  completed: '#008770',
};

export default function SprintTimeline({ sprints, expandedIds, onToggle }) {
  const today = useMemo(() => new Date(), []);
  const tlStart = useMemo(() => new Date(today.getTime() - 14 * DAY), [today]);

  function pct(date) {
    const offset = (date.getTime() - tlStart.getTime()) / DAY;
    return Math.max(0, Math.min(100, (offset / TL_DAYS) * 100));
  }

  const weeks = useMemo(() => {
    const arr = [];
    for (let w = 0; w < 6; w++) {
      const d = new Date(tlStart.getTime() + w * 7 * DAY);
      const kw = getKW(d);
      const todayKw = getKW(today);
      arr.push({ kw, isToday: kw === todayKw });
    }
    return arr;
  }, [tlStart, today]);

  const todayPct = pct(today);

  return (
    <>
      {/* Desktop Timeline */}
      <div className="hidden md:block px-4 md:px-8 pb-6">
        {/* KW Header */}
        <div className="flex relative mb-2" style={{ paddingLeft: 200 }}>
          {weeks.map((w, i) => (
            <div key={i} className={`flex-1 text-center font-mono text-[9px] tracking-wide ${w.isToday ? 'text-scnat-red font-medium' : 'text-txt-tertiary'}`}>
              KW{w.kw}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="relative">
          {/* Grid cols */}
          <div className="absolute top-0 bottom-0 flex pointer-events-none z-0" style={{ left: 200, right: 0 }}>
            {weeks.map((w, i) => (
              <div key={i} className={`flex-1 ${w.isToday ? 'border-l-[1.5px] border-dashed border-scnat-red' : 'border-l border-bd-faint'}`} />
            ))}
          </div>

          {/* Today line */}
          <div
            className="absolute top-0 bottom-0 border-l-[1.5px] border-dashed border-scnat-red z-[2] pointer-events-none"
            style={{ left: `calc(200px + ${(todayPct / 100) * (100)}% * (1 - 200px / 100%))` }}
          />

          {/* Sprint rows */}
          {sprints.map(sp => {
            const start = new Date(sp.startDate);
            const end = new Date(sp.endDate);
            const left = pct(start);
            const right = pct(end);
            const width = Math.max(right - left, 4);
            const isOpen = expandedIds.has(sp.id);
            const dotColor = STATUS_DOT_COLORS[sp.status] || '#4E535D';

            return (
              <div key={sp.id} className="flex items-center mb-2 relative z-[1]">
                <div className="w-[200px] shrink-0 pr-4">
                  <div className="text-[13px] font-medium truncate text-txt-primary">{sp.name.split('–')[0].trim()}</div>
                  <div className="font-mono text-[9px] text-txt-tertiary">{sp.massnahmen.length} Massnahmen · {formatDate(start)} → {formatDate(end)}</div>
                </div>
                <div className="flex-1 h-10 relative flex items-center">
                  <div
                    onClick={() => onToggle(sp.id)}
                    className={`absolute h-[30px] rounded-[3px] flex items-center px-3 gap-2 cursor-pointer border transition-all overflow-hidden whitespace-nowrap ${isOpen ? 'brightness-110' : 'hover:brightness-120'}`}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: `color-mix(in srgb, ${sp.clusterColor} 18%, transparent)`,
                      borderColor: isOpen ? sp.clusterColor : 'transparent',
                    }}
                  >
                    <div className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: dotColor }} />
                    <span className="text-[11px] font-semibold text-txt-primary truncate">{sp.name}</span>
                    <span className="font-mono text-[8px] bg-black/25 px-1.5 py-0.5 rounded-sm whitespace-nowrap">{sp.massnahmen.length} M</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical list */}
      <div className="md:hidden px-4 pb-4 space-y-2">
        {sprints.map(sp => {
          const start = new Date(sp.startDate);
          const end = new Date(sp.endDate);
          const isOpen = expandedIds.has(sp.id);
          return (
            <button
              key={sp.id}
              onClick={() => onToggle(sp.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[3px] border text-left transition-all ${
                isOpen ? 'border-current bg-bg-elevated' : 'border-bd-faint bg-bg-surface hover:bg-bg-elevated'
              }`}
              style={isOpen ? { borderColor: sp.clusterColor } : undefined}
            >
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: sp.clusterColor }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{sp.name}</div>
                <div className="font-mono text-[9px] text-txt-tertiary">{formatDate(start)} → {formatDate(end)} · {sp.massnahmen.length} M</div>
              </div>
              <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm border ${
                sp.status === 'active' ? 'text-[#0098DA] border-[#0098DA]/30 bg-[#0098DA]/10' : 'text-txt-tertiary border-bd-faint'
              }`}>
                {sp.status === 'active' ? 'Aktiv' : sp.status === 'planned' ? 'Geplant' : sp.status}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
