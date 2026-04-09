import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

const FALLBACK_ITEMS = [
  { tag: "Info", text: "Willkommen auf der Digitalisierungsplattform der SCNAT", priority: "normal" },
];

export default function NewsTicker() {
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch('/api/live-infos', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(d => setItems(Array.isArray(d) && d.length > 0 ? d : FALLBACK_ITEMS))
      .catch(() => setItems(FALLBACK_ITEMS));
  }, []);

  const tickerItems = items.length > 0 ? items : FALLBACK_ITEMS;

  useEffect(() => {
    if (isPaused || tickerItems.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tickerItems.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [isPaused, tickerItems.length]);

  useEffect(() => {
    setCurrent(0);
  }, [tickerItems.length]);

  const goNext = () => setCurrent((prev) => (prev + 1) % tickerItems.length);
  const goPrev = () => setCurrent((prev) => (prev - 1 + tickerItems.length) % tickerItems.length);

  const item = tickerItems[current] || tickerItems[0];
  if (!item) return null;

  return (
    <div
      className="sticky top-0 z-30 bg-bg-surface border-b border-bd-faint relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-10 gap-3">
          <div className="shrink-0 flex items-center gap-2 pr-3 border-r border-white/10">
            <Radio className="w-3 h-3 text-scnat-red animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase text-scnat-red">Live</span>
          </div>

          <button
            onClick={goPrev}
            className="shrink-0 p-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 overflow-hidden relative min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="flex items-center gap-2.5"
              >
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                  item.priority === "high"
                    ? "bg-scnat-red/20 text-scnat-red"
                    : "bg-white/[0.08] text-white/50"
                }`}>
                  {item.tag}
                </span>
                <span className="text-xs text-white/70 truncate">{item.text}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={goNext}
            className="shrink-0 p-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="shrink-0 hidden sm:flex items-center gap-1 pl-3 border-l border-white/10">
            {tickerItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "bg-scnat-red w-4" : "bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
