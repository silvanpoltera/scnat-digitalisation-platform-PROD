import { useMemo, useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const DAY = 86400000;

function getKW(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / DAY + 1) / 7);
}

function formatDate(d) {
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Zurich' });
}

const STATUS_DOT_COLORS = {
  active: '#0098DA',
  planned: '#4E535D',
  review: '#F07800',
  completed: '#008770',
};

const ZOOM_LEVELS = [
  { days: 84, label: '12 W', dayPx: null },
  { days: 56, label: '8 W', dayPx: null },
  { days: 42, label: '6 W', dayPx: null },
  { days: 28, label: '4 W', dayPx: null },
  { days: 21, label: '3 W', dayPx: null },
  { days: 14, label: '2 W', dayPx: null },
];
const DEFAULT_ZOOM = 2;

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function SprintTimeline({ sprints, expandedIds, onToggle }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const scrollRef = useRef(null);
  const today = useMemo(() => new Date(), []);

  const { tlDays, tlStart, weeks } = useMemo(() => {
    const days = ZOOM_LEVELS[zoom].days;
    const leadDays = Math.max(7, Math.floor(days * 0.25));
    const start = new Date(today.getTime() - leadDays * DAY);
    const numWeeks = Math.ceil(days / 7);
    const wks = [];
    for (let w = 0; w < numWeeks; w++) {
      const d = new Date(start.getTime() + w * 7 * DAY);
      const kw = getKW(d);
      const todayKw = getKW(today);
      wks.push({ kw, isToday: kw === todayKw });
    }
    return { tlDays: days, tlStart: start, weeks: wks };
  }, [zoom, today]);

  function pct(date) {
    const offset = (date.getTime() - tlStart.getTime()) / DAY;
    return Math.max(0, Math.min(100, (offset / tlDays) * 100));
  }

  const todayPct = pct(today);

  const LABEL_W = 180;
  const LABEL_W_MOBILE = 120;

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(prev => {
        if (e.deltaY < 0) return Math.max(0, prev - 1);
        return Math.min(ZOOM_LEVELS.length - 1, prev + 1);
      });
    }
  }, []);

  const zoomIn = () => setZoom(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1));
  const zoomOut = () => setZoom(prev => Math.max(0, prev - 1));
  const zoomReset = () => setZoom(DEFAULT_ZOOM);

  return (
    <div className="pb-6">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1.5 px-4 md:px-8 mb-3">
        <div className="flex items-center bg-bg-surface border border-bd-faint rounded-[3px] overflow-hidden">
          <button
            onClick={zoomOut}
            disabled={zoom === 0}
            className="p-1.5 text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Herauszoomen"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={zoomReset}
            className="px-2 py-1 text-[10px] font-mono text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors border-x border-bd-faint min-w-[40px] text-center"
            title="Zoom zurücksetzen"
          >
            {ZOOM_LEVELS[zoom].label}
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom === ZOOM_LEVELS.length - 1}
            className="p-1.5 text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Hineinzoomen"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
        <button
          onClick={zoomReset}
          className="p-1.5 text-txt-tertiary hover:text-txt-secondary transition-colors"
          title="Zurücksetzen"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <span className="text-[9px] font-mono text-txt-tertiary ml-1 hidden sm:inline">
          Ctrl+Scroll zum Zoomen
        </span>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="px-4 md:px-8"
      >
        <GanttChart
          sprints={sprints}
          expandedIds={expandedIds}
          onToggle={onToggle}
          weeks={weeks}
          todayPct={todayPct}
          pct={pct}
          labelW={typeof window !== 'undefined' && window.innerWidth < 768 ? LABEL_W_MOBILE : LABEL_W}
        />
      </div>
    </div>
  );
}

function GanttChart({ sprints, expandedIds, onToggle, weeks, todayPct, pct, labelW }) {
  return (
    <div className="w-full">
      {/* KW Header */}
      <div className="flex relative mb-2" style={{ paddingLeft: labelW }}>
        {weeks.map((w, i) => (
          <div
            key={i}
            className={`flex-1 text-center font-mono text-[9px] tracking-wide ${w.isToday ? 'text-scnat-red font-medium' : 'text-txt-tertiary'}`}
          >
            KW{w.kw}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="relative">
        {/* Grid columns */}
        <div className="absolute top-0 bottom-0 flex pointer-events-none z-0" style={{ left: labelW, right: 0 }}>
          {weeks.map((w, i) => (
            <div key={i} className={`flex-1 ${w.isToday ? 'border-l-[1.5px] border-dashed border-scnat-red' : 'border-l border-bd-faint'}`} />
          ))}
        </div>

        {/* Today line */}
        <div
          className="absolute top-0 bottom-0 border-l-[1.5px] border-dashed border-scnat-red z-[2] pointer-events-none"
          style={{ left: `calc(${labelW}px + (100% - ${labelW}px) * ${todayPct / 100})` }}
        />

        {/* Sprint rows */}
        {sprints.map(sp => {
          const start = new Date(sp.startDate + 'T00:00:00');
          const end = new Date(sp.endDate + 'T23:59:59');
          const left = pct(start);
          const right = pct(end);
          const width = Math.max(right - left, 4);
          const isOpen = expandedIds.has(sp.id);
          const dotColor = STATUS_DOT_COLORS[sp.status] || '#4E535D';
          const barBg = hexToRgba(sp.clusterColor || '#4E535D', 0.3);
          const barBorder = hexToRgba(sp.clusterColor || '#4E535D', isOpen ? 0.8 : 0.4);

          return (
            <div key={sp.id} className="flex items-center mb-2 relative z-[1]">
              <div className="shrink-0 pr-3" style={{ width: labelW }}>
                <div className="text-[12px] sm:text-[13px] font-medium truncate text-txt-primary">{sp.name}</div>
                <div className="font-mono text-[8px] sm:text-[9px] text-txt-tertiary truncate">
                  {sp.massnahmen.length} Massnahmen · {formatDate(start)} → {formatDate(end)}
                </div>
              </div>
              <div className="flex-1 h-10 relative flex items-center">
                <div
                  onClick={() => onToggle(sp.id)}
                  className="absolute h-[30px] rounded-[3px] flex items-center px-2 sm:px-3 gap-1.5 sm:gap-2 cursor-pointer border transition-all overflow-hidden whitespace-nowrap hover:brightness-125"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    background: barBg,
                    borderColor: barBorder,
                  }}
                >
                  <div className="w-[6px] h-[6px] rounded-full shrink-0" style={{ background: dotColor }} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-txt-primary truncate">{sp.name}</span>
                  <span className="font-mono text-[7px] sm:text-[8px] bg-bg-base/40 text-txt-secondary px-1 sm:px-1.5 py-0.5 rounded-sm whitespace-nowrap shrink-0">
                    {sp.massnahmen.length} M
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {sprints.length === 0 && (
          <div className="py-12 text-center text-sm text-txt-tertiary" style={{ paddingLeft: labelW }}>
            Keine Sprints in diesem Zeitraum
          </div>
        )}
      </div>
    </div>
  );
}
