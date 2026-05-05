import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const DAY = 86400000;

function getKW(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / DAY + 1) / 7);
}

function fmtDate(d) {
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', timeZone: 'Europe/Zurich' });
}

function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const STATUS_DOT = {
  active: '#0098DA', planned: '#4E535D', review: '#F07800', completed: '#008770',
};

// minColPx = minimum horizontal space per column. When the chart needs more
// width than the container offers, the timeline scrolls horizontally and
// sprint-name labels stay sticky at the left edge.
const ZOOM_LEVELS = [
  { days: 365, label: '12 M', minColPx: 80 },
  { days: 273, label: '9 M',  minColPx: 90 },
  { days: 182, label: '6 M',  minColPx: 110 },
  { days: 112, label: '16 W', minColPx: 70 },
  { days: 84,  label: '12 W', minColPx: 80 },
  { days: 56,  label: '8 W',  minColPx: 90 },
  { days: 42,  label: '6 W',  minColPx: 100 },
  { days: 28,  label: '4 W',  minColPx: 120 },
  { days: 21,  label: '3 W',  minColPx: 140 },
];

// Hook: track an element's content width via ResizeObserver.
function useElementWidth(ref) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setW(entry.contentRect.width);
    });
    ro.observe(el);
    setW(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}
const DEFAULT_ZOOM = 5;
const MONTH_LABELS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

export default function CpSprintGantt({ sprints, onDatesChange }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const today = useMemo(() => new Date(), []);
  const chartRef = useRef(null);

  const { tlDays, tlStart, weeks } = useMemo(() => {
    const days = ZOOM_LEVELS[zoom].days;
    const leadDays = Math.max(7, Math.floor(days * 0.25));
    const start = new Date(today.getTime() - leadDays * DAY);
    const cols = [];

    if (days > 100) {
      const ms = new Date(start.getFullYear(), start.getMonth(), 1);
      const end = new Date(start.getTime() + days * DAY);
      let d = new Date(ms);
      while (d <= end) {
        cols.push({
          label: MONTH_LABELS[d.getMonth()],
          isToday: d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
        });
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    } else {
      const numWeeks = Math.ceil(days / 7);
      const todayKw = getKW(today);
      for (let w = 0; w < numWeeks; w++) {
        const d = new Date(start.getTime() + w * 7 * DAY);
        const kw = getKW(d);
        cols.push({ label: `KW${kw}`, isToday: kw === todayKw });
      }
    }

    return { tlDays: days, tlStart: start, weeks: cols };
  }, [zoom, today]);

  const pct = useCallback(
    (date) => {
      const offset = (date.getTime() - tlStart.getTime()) / DAY;
      return Math.max(0, Math.min(100, (offset / tlDays) * 100));
    },
    [tlStart, tlDays],
  );

  const todayPct = pct(today);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(prev => {
        if (e.deltaY < 0) return Math.max(0, prev - 1);
        return Math.min(ZOOM_LEVELS.length - 1, prev + 1);
      });
    }
  }, []);

  const LABEL_W = typeof window !== 'undefined' && window.innerWidth < 768 ? 120 : 180;

  return (
    <div className="border border-bd-faint rounded-[3px] bg-bg-surface mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-bd-faint bg-bg-elevated">
        <span className="font-mono text-[10px] uppercase tracking-[.12em] text-txt-tertiary">
          Gantt-Zeitstrahl
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-bg-surface border border-bd-faint rounded-[3px] overflow-hidden">
            <button
              onClick={() => setZoom(prev => Math.max(0, prev - 1))}
              disabled={zoom === 0}
              className="p-1 text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-2 py-0.5 text-[9px] font-mono text-txt-tertiary border-x border-bd-faint min-w-[36px] text-center">
              {ZOOM_LEVELS[zoom].label}
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1))}
              disabled={zoom === ZOOM_LEVELS.length - 1}
              className="p-1 text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={() => setZoom(DEFAULT_ZOOM)}
            className="p-1 text-txt-tertiary hover:text-txt-secondary transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div ref={chartRef} onWheel={handleWheel} className="px-4 py-3">
        <GanttBody
          sprints={sprints}
          weeks={weeks}
          todayPct={todayPct}
          pct={pct}
          labelW={LABEL_W}
          minColPx={ZOOM_LEVELS[zoom].minColPx}
          tlStart={tlStart}
          tlDays={tlDays}
          chartRef={chartRef}
          onDatesChange={onDatesChange}
        />
      </div>
    </div>
  );
}

function GanttBody({ sprints, weeks, todayPct, pct, labelW, minColPx, tlStart, tlDays, chartRef, onDatesChange }) {
  const wrapRef = useRef(null);
  const wrapW = useElementWidth(wrapRef);
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);

  const cols = weeks?.length || 0;
  const fitColW = cols > 0 ? Math.max(0, (wrapW - labelW) / cols) : 0;
  const colW = Math.max(minColPx || 60, fitColW);
  const timelineW = cols * colW;
  const chartW = labelW + timelineW;

  const pxToDate = useCallback(
    (pxDelta, trackWidth) => {
      const daysDelta = (pxDelta / trackWidth) * tlDays;
      return Math.round(daysDelta);
    },
    [tlDays],
  );

  const handlePointerDown = useCallback((e, sprintId, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const sp = sprints.find(s => s.id === sprintId);
    if (!sp) return;

    const trackEl = e.currentTarget.closest('[data-track]');
    if (!trackEl) return;
    const trackWidth = trackEl.getBoundingClientRect().width;

    const state = {
      sprintId,
      mode,
      startX: e.clientX,
      origStart: new Date(sp.startDate + 'T00:00:00'),
      origEnd: new Date(sp.endDate + 'T00:00:00'),
      trackWidth,
      newStart: null,
      newEnd: null,
    };
    dragRef.current = state;
    setDrag({ sprintId, mode, newStart: state.origStart, newEnd: state.origEnd });

    const target = e.target;
    target.setPointerCapture(e.pointerId);
  }, [sprints]);

  const handlePointerMove = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;

    const dx = e.clientX - d.startX;
    const daysDelta = pxToDate(dx, d.trackWidth);

    let newStart = d.origStart;
    let newEnd = d.origEnd;

    if (d.mode === 'move') {
      newStart = new Date(d.origStart.getTime() + daysDelta * DAY);
      newEnd = new Date(d.origEnd.getTime() + daysDelta * DAY);
    } else if (d.mode === 'resize-left') {
      newStart = new Date(d.origStart.getTime() + daysDelta * DAY);
      newEnd = d.origEnd;
      if (newStart >= newEnd) newStart = new Date(newEnd.getTime() - DAY);
    } else if (d.mode === 'resize-right') {
      newStart = d.origStart;
      newEnd = new Date(d.origEnd.getTime() + daysDelta * DAY);
      if (newEnd <= newStart) newEnd = new Date(newStart.getTime() + DAY);
    }

    d.newStart = newStart;
    d.newEnd = newEnd;
    setDrag({ sprintId: d.sprintId, mode: d.mode, newStart, newEnd });
  }, [pxToDate]);

  const handlePointerUp = useCallback(() => {
    const d = dragRef.current;
    if (!d) return;

    if (d.newStart && d.newEnd) {
      const startISO = toISO(d.newStart);
      const endISO = toISO(d.newEnd);
      const origStartISO = toISO(d.origStart);
      const origEndISO = toISO(d.origEnd);
      if (startISO !== origStartISO || endISO !== origEndISO) {
        onDatesChange(d.sprintId, startISO, endISO);
      }
    }

    dragRef.current = null;
    setDrag(null);
  }, [onDatesChange]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div className="w-full select-none">
      <div
        ref={wrapRef}
        className="overflow-x-auto overflow-y-visible gantt-scroll"
        style={{ scrollbarWidth: 'thin' }}
      >
        <style>{`
          .gantt-scroll::-webkit-scrollbar { height: 10px; }
          .gantt-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 5px; }
          .gantt-scroll::-webkit-scrollbar-thumb { background: var(--border-default,#3a3f4a); border-radius: 5px; }
          .gantt-scroll::-webkit-scrollbar-thumb:hover { background: var(--border-strong,#555a66); }
        `}</style>
        {wrapW > 0 && (
          <div style={{ width: chartW }}>
            {/* KW Header */}
            <div className="flex mb-2" style={{ paddingLeft: labelW, width: chartW }}>
              {weeks.map((w, i) => (
                <div
                  key={i}
                  className={`text-center font-mono text-[9px] tracking-wide shrink-0 ${w.isToday ? 'text-scnat-red font-medium' : 'text-txt-tertiary'}`}
                  style={{ width: colW }}
                >
                  {w.label}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="relative" style={{ width: chartW }}>
              {/* Grid columns */}
              <div className="absolute top-0 bottom-0 flex pointer-events-none z-0" style={{ left: labelW, width: timelineW }}>
                {weeks.map((w, i) => (
                  <div
                    key={i}
                    className={`shrink-0 ${w.isToday ? 'border-l-[1.5px] border-dashed border-scnat-red/30' : 'border-l border-bd-faint/50'}`}
                    style={{ width: colW }}
                  />
                ))}
              </div>

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 border-l-[1.5px] border-dashed border-scnat-red z-[2] pointer-events-none"
                style={{ left: labelW + (timelineW * todayPct) / 100 }}
              />

              {/* Sprint rows */}
              {sprints.map(sp => {
                const isDragging = drag?.sprintId === sp.id;
                const start = isDragging ? drag.newStart : new Date(sp.startDate + 'T00:00:00');
                const end = isDragging ? drag.newEnd : new Date(sp.endDate + 'T00:00:00');
                const leftPct = pct(start);
                const rightPct = pct(end);
                const barLeft = (timelineW * leftPct) / 100;
                const barWidth = Math.max((timelineW * (rightPct - leftPct)) / 100, 3);
                const dotColor = STATUS_DOT[sp.status] || '#4E535D';
                const clr = sp.clusterColor || '#4E535D';
                const barBg = hexToRgba(clr, isDragging ? 0.45 : 0.25);
                const barBorder = hexToRgba(clr, isDragging ? 0.9 : 0.5);

                return (
                  <div key={sp.id} className="flex items-center mb-1.5 relative z-[1]" style={{ width: chartW }}>
                    {/* Label (sticky) */}
                    <div className="shrink-0 pr-3 sticky left-0 z-[2] bg-bg-surface self-stretch flex flex-col justify-center" style={{ width: labelW }}>
                      <div className="text-[11px] font-medium truncate text-txt-primary leading-tight flex items-center gap-1">
                        {sp.name}
                        {sp.isAdminSprint && <span className="text-[7px] font-mono bg-purple-500/15 text-purple-400 px-1 rounded-sm">ADM</span>}
                      </div>
                      <div className="font-mono text-[8px] text-txt-tertiary truncate">
                        {fmtDate(start)} → {fmtDate(end)}
                        {isDragging && (
                          <span className="text-scnat-red ml-1 font-medium">verschieben...</span>
                        )}
                      </div>
                      <div className="absolute top-0 bottom-0 right-0 w-2 pointer-events-none" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.18))' }} />
                    </div>

                    {/* Track */}
                    <div className="h-9 relative flex items-center shrink-0" style={{ width: timelineW }} data-track>
                      <div
                        className={`absolute h-[28px] rounded-[3px] flex items-center gap-1.5 border transition-shadow overflow-hidden ${
                          isDragging ? 'shadow-lg ring-1 ring-white/10' : 'hover:shadow-md'
                        }`}
                        style={{
                          left: barLeft,
                          width: barWidth,
                          background: barBg,
                          borderColor: barBorder,
                          cursor: isDragging ? 'grabbing' : 'grab',
                          zIndex: isDragging ? 10 : 1,
                        }}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize z-10 group flex items-center"
                          onPointerDown={(e) => handlePointerDown(e, sp.id, 'resize-left')}
                        >
                          <div className="w-[3px] h-3 rounded-full bg-current opacity-0 group-hover:opacity-40 transition-opacity ml-0.5" style={{ color: clr }} />
                        </div>

                        <div
                          className="flex-1 h-full flex items-center gap-1.5 px-2 min-w-0"
                          onPointerDown={(e) => handlePointerDown(e, sp.id, 'move')}
                        >
                          <div className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background: dotColor }} />
                          <span className="text-[10px] font-semibold text-txt-primary truncate">{sp.name}</span>
                          <span className="font-mono text-[7px] bg-bg-base/40 text-txt-secondary px-1 py-0.5 rounded-sm whitespace-nowrap shrink-0">
                            {sp.massnahmen.length} M
                          </span>
                        </div>

                        <div
                          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize z-10 group flex items-center justify-end"
                          onPointerDown={(e) => handlePointerDown(e, sp.id, 'resize-right')}
                        >
                          <div className="w-[3px] h-3 rounded-full bg-current opacity-0 group-hover:opacity-40 transition-opacity mr-0.5" style={{ color: clr }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {sprints.length === 0 && (
                <div className="py-8 text-center text-[11px] text-txt-tertiary font-mono" style={{ paddingLeft: labelW }}>
                  Keine Sprints vorhanden
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-bd-faint/50 flex-wrap">
        <span className="font-mono text-[8px] text-txt-tertiary">Balken verschieben = Zeitraum ändern</span>
        <span className="font-mono text-[8px] text-txt-tertiary">·</span>
        <span className="font-mono text-[8px] text-txt-tertiary">Ränder ziehen = Start/Ende anpassen</span>
        <span className="font-mono text-[8px] text-txt-tertiary">·</span>
        <span className="font-mono text-[8px] text-txt-tertiary">Ctrl+Scroll = Zoom</span>
      </div>
    </div>
  );
}
