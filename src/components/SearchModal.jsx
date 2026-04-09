import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Monitor, BookOpen, HelpCircle, Users, LayoutGrid, Compass, FileText, RotateCw, Newspaper } from "lucide-react";
import { globalSearch, TYPE_LABELS } from "@/lib/data/search-index";

const TYPE_ICONS = {
  page: LayoutGrid,
  system: Monitor,
  glossar: BookOpen,
  faq: HelpCircle,
  team: Users,
  handlungsfeld: Compass,
  prozess: RotateCw,
  news: Newspaper,
};

const TYPE_COLORS = {
  page: "text-scnat-cyan",
  system: "text-scnat-teal",
  glossar: "text-scnat-orange",
  faq: "text-scnat-green",
  team: "text-scnat-pink",
  handlungsfeld: "text-scnat-red",
  prozess: "text-scnat-teal",
  news: "text-scnat-red",
};

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const results = useMemo(() => globalSearch(query), [query]);

  const grouped = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      if (!map[r.type]) map[r.type] = [];
      map[r.type].push(r);
    });
    return map;
  }, [results]);

  const flatResults = results;

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const goTo = useCallback(
    (result) => {
      navigate(result.path);
      onClose();
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (!open) return;

    function handleKey(e) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flatResults.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && flatResults[activeIdx]) {
        e.preventDefault();
        goTo(flatResults[activeIdx]);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, flatResults, activeIdx, goTo, onClose]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl">
        <div className="mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Seiten, Systeme, Glossar, FAQs durchsuchen…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground border border-border rounded bg-muted">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {query.length < 2 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                Mindestens 2 Zeichen eingeben…
              </div>
            ) : flatResults.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">Keine Ergebnisse für «{query}»</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Versuche einen anderen Suchbegriff</p>
              </div>
            ) : (
              Object.entries(grouped).map(([type, items]) => {
                const Icon = TYPE_ICONS[type] || FileText;
                return (
                  <div key={type}>
                    <div className="px-4 py-2 bg-muted/50 border-b border-border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {TYPE_LABELS[type] || type}
                      </span>
                    </div>
                    {items.map((result) => {
                      flatIdx++;
                      const idx = flatIdx;
                      const isActive = idx === activeIdx;
                      return (
                        <button
                          key={`${result.type}-${result.title}-${idx}`}
                          data-idx={idx}
                          onClick={() => goTo(result)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            isActive ? "bg-scnat-red/10" : "hover:bg-muted/40"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${TYPE_COLORS[type] || "text-muted-foreground"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm truncate ${isActive ? "text-foreground font-medium" : "text-foreground/80"}`}>
                              {highlightMatch(result.title, query)}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {highlightMatch(result.subtitle, query)}
                              </p>
                            )}
                          </div>
                          {isActive && <ArrowRight className="w-3.5 h-3.5 text-scnat-red shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {flatResults.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
              <span>{flatResults.length} Ergebnis{flatResults.length !== 1 ? "se" : ""}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">↑↓</kbd>
                  navigieren
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">↵</kbd>
                  öffnen
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text, query) {
  if (!query || query.length < 2) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-scnat-red/20 text-foreground rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}
