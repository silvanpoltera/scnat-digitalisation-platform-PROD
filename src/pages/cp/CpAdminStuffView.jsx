import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

const PAGES = {
  frame: { title: 'The Frame', sub: 'Strategische Einordnung', file: '/files/digitaler_rahmen.html' },
  reason: { title: 'The Reason Why', sub: 'Analyse & Begründung', file: '/files/app_begruendung.html' },
  where: { title: 'Where', sub: 'Standort & Infrastruktur', file: '/files/where.html' },
  details: { title: 'The Details', sub: 'Technische Details · Cube', file: '/files/index.html' },
  recherche: { title: 'Recherche', sub: 'Infrastruktur & Sicherheit', file: '/files/recherche.html' },
  process: { title: 'Process', sub: 'Prinzipien & Roadmap', file: '/files/process.html' },
  'how-built': { title: 'How it gets Built', sub: 'Tech Stack · Codex · PAI', file: '/files/how-built.html' },
};

const PAGE_ORDER = ['frame', 'reason', 'where', 'details', 'recherche', 'process', 'how-built'];

export default function CpAdminStuffView() {
  const { page } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const config = PAGES[page];

  const currentIndex = PAGE_ORDER.indexOf(page);
  const prevPage = currentIndex > 0 ? PAGE_ORDER[currentIndex - 1] : null;
  const nextPage = currentIndex < PAGE_ORDER.length - 1 ? PAGE_ORDER[currentIndex + 1] : null;

  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && expanded) setExpanded(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [expanded]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-txt-secondary text-sm">Seite nicht gefunden.</p>
        <Link to="/cp/admin-stuff" className="text-sm text-scnat-red hover:text-scnat-red/80 transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const hash = location.hash || '';
  const iframeSrc = config.file + hash;

  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-base flex flex-col">
        <TopBar
          config={config}
          iframeSrc={iframeSrc}
          expanded
          toggleExpanded={toggleExpanded}
          prevPage={prevPage}
          nextPage={nextPage}
          currentIndex={currentIndex}
          navigate={navigate}
        />
        <iframe
          src={iframeSrc}
          title={config.title}
          className="flex-1 w-full border-0 bg-bg-base"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
    );
  }

  return (
    <div className="-m-4 md:-m-6 flex flex-col" style={{ height: 'calc(100dvh - 49px)' }}>
      <TopBar
        config={config}
        iframeSrc={iframeSrc}
        expanded={false}
        toggleExpanded={toggleExpanded}
        prevPage={prevPage}
        nextPage={nextPage}
        currentIndex={currentIndex}
        navigate={navigate}
      />
      <iframe
        src={iframeSrc}
        title={config.title}
        className="flex-1 w-full border-0 bg-bg-base min-h-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
}

function TopBar({ config, iframeSrc, expanded, toggleExpanded, prevPage, nextPage, currentIndex, navigate }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 h-10 bg-bg-surface border-b border-bd-faint shrink-0">
      <Link
        to="/cp/admin-stuff"
        className="flex items-center gap-1.5 text-xs text-txt-secondary hover:text-txt-primary transition-colors shrink-0"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Übersicht</span>
      </Link>

      <div className="w-px h-4 bg-bd-faint shrink-0" />

      <div className="flex items-center gap-0.5 shrink-0">
        {prevPage ? (
          <button
            onClick={() => navigate(`/cp/admin-stuff/${prevPage}`)}
            className="text-[10px] font-mono text-txt-tertiary hover:text-txt-primary px-1.5 py-0.5 hover:bg-bg-elevated rounded-sm transition-colors"
          >
            ‹
          </button>
        ) : <span className="w-5" />}
        <span className="text-[10px] font-mono text-txt-tertiary px-0.5">
          {currentIndex + 1}/{PAGE_ORDER.length}
        </span>
        {nextPage ? (
          <button
            onClick={() => navigate(`/cp/admin-stuff/${nextPage}`)}
            className="text-[10px] font-mono text-txt-tertiary hover:text-txt-primary px-1.5 py-0.5 hover:bg-bg-elevated rounded-sm transition-colors"
          >
            ›
          </button>
        ) : <span className="w-5" />}
      </div>

      <div className="w-px h-4 bg-bd-faint shrink-0" />

      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-sm font-heading font-semibold text-txt-primary truncate">{config.title}</p>
        <span className="text-[10px] font-mono text-txt-tertiary truncate hidden sm:inline">· {config.sub}</span>
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={toggleExpanded}
          className="p-1.5 text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated rounded-sm transition-colors"
          title={expanded ? 'Verkleinern (Esc)' : 'Vollbild'}
        >
          {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated rounded-sm transition-colors"
          title="In neuem Tab öffnen"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
