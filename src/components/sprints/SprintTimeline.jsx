import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin } from 'lucide-react';

// Tracks the inline width of a referenced element via ResizeObserver.
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

// Drag-to-pan: grab the timeline anywhere (except interactive elements marked
// with data-no-pan) and slide it horizontally. Suppresses the spurious click
// that would otherwise fire after a drag. Cursor switches to grab/grabbing.
function useDragPan(scrollRef) {
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.style.cursor = 'grab';

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let didDrag = false;

    const onDown = (e) => {
      if (e.target.closest('[data-no-pan]') || e.target.closest('button')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDown = true;
      didDrag = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      el.style.cursor = 'grabbing';
      try { el.setPointerCapture(e.pointerId); } catch {}
    };
    const onMove = (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) didDrag = true;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = 'grab';
      if (didDrag) {
        const swallow = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        el.addEventListener('click', swallow, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', swallow, { capture: true }), 50);
      }
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [scrollRef]);
}

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

// minColPx = minimum width per column. Above this, the chart gets wider than
// the container and the timeline area becomes horizontally scrollable
// (drag-to-pan + scrollbar); sprint-name labels stay sticky on the left.
const ZOOM_LEVELS = [
  { days: 365, label: '12 M', minColPx: 110 },
  { days: 273, label: '9 M',  minColPx: 130 },
  { days: 182, label: '6 M',  minColPx: 160 },
  { days: 112, label: '16 W', minColPx: 90 },
  { days: 84,  label: '12 W', minColPx: 110 },
  { days: 56,  label: '8 W',  minColPx: 130 },
  { days: 42,  label: '6 W',  minColPx: 150 },
  { days: 28,  label: '4 W',  minColPx: 180 },
  { days: 21,  label: '3 W',  minColPx: 220 },
  { days: 14,  label: '2 W',  minColPx: 260 },
];
const DEFAULT_ZOOM = 6;
const MONTH_LABELS = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function SprintTimeline({ sprints, expandedIds, onToggle, stickyBg = 'var(--bg-surface)' }) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const scrollRef = useRef(null);
  const today = useMemo(() => new Date(), []);

  const { tlDays, tlStart, weeks } = useMemo(() => {
    const days = ZOOM_LEVELS[zoom].days;
    const leadDays = Math.max(7, Math.floor(days * 0.25));
    // Initial window: today minus a lead-in, plus the zoom range.
    let start = new Date(today.getTime() - leadDays * DAY);
    let end = new Date(start.getTime() + days * DAY);

    // Always extend to cover ALL sprints so the user can scroll to the last one.
    for (const sp of sprints || []) {
      if (!sp.startDate || !sp.endDate) continue;
      const sStart = new Date(sp.startDate + 'T00:00:00');
      const sEnd = new Date(sp.endDate + 'T23:59:59');
      if (sStart < start) start = new Date(sStart.getTime() - 7 * DAY);
      if (sEnd > end) end = new Date(sEnd.getTime() + 7 * DAY);
    }

    const totalDays = Math.max(1, Math.ceil((end - start) / DAY));
    const cols = [];

    if (days > 100) {
      // Monthly columns from the first day of start's month through end.
      let d = new Date(start.getFullYear(), start.getMonth(), 1);
      while (d <= end) {
        cols.push({
          label: MONTH_LABELS[d.getMonth()] + (d.getMonth() === 0 ? ` ${String(d.getFullYear()).slice(2)}` : ''),
          isToday: d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
        });
        d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      }
    } else {
      const numWeeks = Math.ceil(totalDays / 7);
      const todayKw = getKW(today);
      for (let w = 0; w < numWeeks; w++) {
        const d = new Date(start.getTime() + w * 7 * DAY);
        const kw = getKW(d);
        cols.push({ label: `KW${kw}`, isToday: kw === todayKw });
      }
    }

    return { tlDays: totalDays, tlStart: start, weeks: cols };
  }, [zoom, today, sprints]);

  function pct(date) {
    const offset = (date.getTime() - tlStart.getTime()) / DAY;
    return Math.max(0, Math.min(100, (offset / tlDays) * 100));
  }

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

  const zoomIn = () => setZoom(prev => Math.min(ZOOM_LEVELS.length - 1, prev + 1));
  const zoomOut = () => setZoom(prev => Math.max(0, prev - 1));
  const zoomReset = () => setZoom(DEFAULT_ZOOM);

  const jumpToToday = () => {
    const wrap = scrollRef.current?.querySelector('[data-gantt-scroll]');
    if (!wrap) return;
    const labelW = parseInt(wrap.dataset.labelW || '180', 10);
    const target = labelW + (wrap.scrollWidth - labelW) * (todayPct / 100) - wrap.clientWidth / 2 + labelW / 2;
    wrap.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  };

  return (
    <div className="pb-6" style={{ '--gantt-sticky-bg': stickyBg }}>
      {/* Zoom Controls */}
      <div className="flex items-center gap-1.5 px-3 pt-3 mb-3 flex-wrap">
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
        <button
          onClick={jumpToToday}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono text-scnat-red hover:bg-scnat-red/10 border border-scnat-red/30 rounded-[3px] transition-colors"
          title="Zu Heute scrollen"
        >
          <MapPin className="w-3 h-3" />
          Heute
        </button>
        <span className="text-[9px] font-mono text-txt-tertiary ml-auto hidden sm:inline">
          Ziehen zum Verschieben · Ctrl+Scroll zum Zoomen
        </span>
      </div>

      {/* Timeline */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="px-3"
      >
        <GanttChart
          sprints={sprints}
          expandedIds={expandedIds}
          onToggle={onToggle}
          weeks={weeks}
          todayPct={todayPct}
          pct={pct}
          minColPx={ZOOM_LEVELS[zoom].minColPx}
        />
      </div>
    </div>
  );
}

function GanttChart({ sprints, expandedIds, onToggle, weeks, todayPct, pct, minColPx }) {
  const wrapRef = useRef(null);
  const wrapW = useElementWidth(wrapRef);
  useDragPan(wrapRef);

  // Responsive label width: 35% of container, clamped 90–180 px.
  // Ensures the timeline area always has the majority of horizontal space.
  const labelW = wrapW > 0 ? Math.max(90, Math.min(180, wrapW * 0.35)) : 180;

  // Deterministic pixel-based layout:
  //   colW = max(minColPx, fit-to-container width per column)
  //   chartW = labelW + cols * colW
  // When chartW > wrapW, the wrapper scrolls horizontally.
  const cols = weeks?.length || 0;
  const fitColW = cols > 0 ? Math.max(0, (wrapW - labelW) / cols) : 0;
  const colW = Math.max(minColPx || 60, fitColW);
  const timelineW = cols * colW;
  const chartW = labelW + timelineW;
  const isScrollable = chartW > wrapW + 1;

  // On first render where the chart is wider than the viewport, snap scroll
  // position to "today" so the user lands in the relevant area instead of
  // the very beginning of the (potentially long) timeline.
  const didInitScroll = useRef(false);
  useEffect(() => {
    if (didInitScroll.current) return;
    if (!wrapRef.current || !isScrollable || timelineW === 0) return;
    const wrap = wrapRef.current;
    const targetLeft = labelW + (timelineW * todayPct) / 100 - 80;
    wrap.scrollLeft = Math.max(0, targetLeft);
    didInitScroll.current = true;
  }, [isScrollable, timelineW, labelW, todayPct]);

  return (
    <div className="w-full relative">
      <div
        ref={wrapRef}
        data-gantt-scroll
        data-label-w={labelW}
        className="overflow-x-auto overflow-y-hidden gantt-scroll select-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        <style>{`
          .gantt-scroll::-webkit-scrollbar { height: 10px; }
          .gantt-scroll::-webkit-scrollbar-track { background: transparent; }
          .gantt-scroll::-webkit-scrollbar-thumb { background: var(--bd-default,#3a3f4a); border-radius: 5px; opacity: .6; }
          .gantt-scroll::-webkit-scrollbar-thumb:hover { background: var(--bd-strong,#555a66); }
          .gantt-sticky-bg { background-color: var(--gantt-sticky-bg, var(--bg-surface, #fff)); }
        `}</style>
        {wrapW > 0 && (
          <div style={{ width: chartW }}>
            {/* KW / Month Header */}
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
                    className={`shrink-0 ${w.isToday ? 'border-l-[1.5px] border-dashed border-scnat-red' : 'border-l border-bd-faint/60'}`}
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
                const start = new Date(sp.startDate + 'T00:00:00');
                const end = new Date(sp.endDate + 'T23:59:59');
                const leftPct = pct(start);
                const rightPct = pct(end);
                const barLeft = (timelineW * leftPct) / 100;
                const barWidth = Math.max((timelineW * (rightPct - leftPct)) / 100, 4);
                const isOpen = expandedIds.has(sp.id);
                const dotColor = STATUS_DOT_COLORS[sp.status] || '#4E535D';
                const barBg = hexToRgba(sp.clusterColor || '#4E535D', 0.3);
                const barBorder = hexToRgba(sp.clusterColor || '#4E535D', isOpen ? 0.8 : 0.4);

                return (
                  <div key={sp.id} className="flex items-center mb-2 relative z-[1]" style={{ width: chartW }}>
                    <div
                      className="shrink-0 pr-3 sticky left-0 z-[2] gantt-sticky-bg self-stretch flex flex-col justify-center border-r border-bd-faint"
                      style={{ width: labelW }}
                    >
                      <div className="text-[12px] sm:text-[13px] font-medium truncate text-txt-primary flex items-center gap-1 min-w-0">
                        <span className="truncate">{sp.name}</span>
                        {sp.isAdminSprint && <span className="text-[7px] font-mono bg-purple-500/15 text-purple-400 px-1 rounded-sm shrink-0">ADM</span>}
                      </div>
                      <div className="font-mono text-[8px] sm:text-[9px] text-txt-tertiary truncate">
                        {sp.massnahmen.length} M · {formatDate(start)} → {formatDate(end)}
                      </div>
                    </div>
                    <div className="h-10 relative flex items-center shrink-0" style={{ width: timelineW }}>
                      <div
                        data-no-pan
                        onClick={() => onToggle(sp.id)}
                        className="absolute h-[30px] rounded-[3px] flex items-center px-2 sm:px-3 gap-1.5 sm:gap-2 cursor-pointer border transition-all overflow-hidden whitespace-nowrap hover:brightness-125"
                        style={{
                          left: barLeft,
                          width: barWidth,
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
        )}
      </div>

    </div>
  );
}
