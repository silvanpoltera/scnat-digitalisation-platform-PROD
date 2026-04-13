import { useState, useMemo } from 'react';
import { Search, ChevronDown, Star } from 'lucide-react';

const DOT_COLORS = {
  blue:   'bg-status-blue',
  green:  'bg-status-green',
  orange: 'bg-status-yellow',
  purple: 'bg-[#9B59B6]',
  red:    'bg-scnat-red',
};

const KATEGORIEN = ['Alle', 'Personen', 'Organisationen', 'Daten', 'Web & Portal', 'PPO-Erweiterungen'];

export default function FunktionenUebersicht({ bereiche = [] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Alle');
  const [expanded, setExpanded] = useState(null);

  const q = search.toLowerCase();
  const filtered = useMemo(() =>
    bereiche.filter(b => {
      if (filter !== 'Alle' && b.kategorie !== filter) return false;
      if (q && !b.name.toLowerCase().includes(q) &&
          !b.funktionen.some(f => f.toLowerCase().includes(q))) return false;
      return true;
    }),
  [bereiche, filter, q]);

  const totalFunktionen = bereiche.reduce((s, b) => s + b.funktionen.length, 0);
  const projekte = [...new Set(bereiche.map(b => b.projekt))];
  const ppoCount = bereiche
    .filter(b => b.kategorie === 'PPO-Erweiterungen')
    .reduce((s, b) => s + b.funktionen.length, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
          <span className="text-2xl font-heading font-semibold text-txt-primary">{bereiche.length}</span>
          <p className="text-[11px] text-txt-secondary mt-1">Funktionsbereiche</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
          <span className="text-2xl font-heading font-semibold text-txt-primary">{totalFunktionen}</span>
          <p className="text-[11px] text-txt-secondary mt-1">Einzelfunktionen</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
          <span className="text-2xl font-heading font-semibold text-txt-primary">{projekte.length}</span>
          <p className="text-[11px] text-txt-secondary mt-1">Projekte ({projekte.join(' + ')})</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
          <Star className="w-5 h-5 text-scnat-red fill-scnat-red mb-1" />
          <p className="text-[11px] text-txt-secondary">PPO-Erweiterungen</p>
          <span className="text-[10px] font-mono text-txt-tertiary">{ppoCount} Funktionen</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-tertiary pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Funktion suchen…"
          className="w-full bg-bg-surface border border-bd-faint text-txt-primary text-sm pl-9 pr-3 py-2.5 rounded-sm focus:border-scnat-red focus:outline-none placeholder:text-txt-tertiary"
        />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {KATEGORIEN.map(k => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
              filter === k
                ? 'bg-bg-elevated text-txt-primary border-bd-default'
                : 'bg-bg-surface text-txt-secondary border-bd-faint hover:text-txt-primary hover:border-bd-default'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      {/* Function areas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(b => {
          const isOpen = expanded === b.id;
          return (
            <div key={b.id} className={`bg-bg-surface border border-bd-faint rounded-sm transition-all ${isOpen ? 'md:col-span-2' : ''}`}>
              <button
                onClick={() => setExpanded(isOpen ? null : b.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT_COLORS[b.farbe] || 'bg-txt-tertiary'}`} />
                <span className="flex-1 text-sm text-txt-primary font-medium truncate">{b.name}</span>
                <span className="text-xs font-mono text-txt-tertiary bg-bg-elevated px-1.5 py-0.5 rounded-sm shrink-0">
                  {b.funktionen.length}
                </span>
                <ChevronDown className={`w-4 h-4 text-txt-tertiary shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-bd-faint">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-txt-tertiary bg-bg-elevated px-1.5 py-0.5 rounded-sm">{b.kategorie}</span>
                    <span className="text-[10px] font-mono text-txt-tertiary bg-bg-elevated px-1.5 py-0.5 rounded-sm">Projekt: {b.projekt}</span>
                  </div>
                  <div className="space-y-1.5">
                    {b.funktionen.map((fn, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-txt-secondary">
                        <span className="w-4 h-4 rounded-sm bg-bg-elevated flex items-center justify-center text-[10px] font-mono text-txt-tertiary shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{fn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-txt-tertiary text-center py-8">Keine Funktionsbereiche gefunden.</p>
      )}
    </div>
  );
}
