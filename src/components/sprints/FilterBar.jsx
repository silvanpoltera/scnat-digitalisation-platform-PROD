import { Search } from 'lucide-react';

const CLUSTER_FILTERS = [
  { key: 'alle', label: 'Alle' },
  { key: 'infrastruktur', label: 'Infrastruktur', color: '#0098DA' },
  { key: 'datenstrategie', label: 'Datenstrategie', color: '#7C5CBF' },
  { key: 'prozessdigitalisierung', label: 'Prozesse', color: '#008770' },
  { key: 'kommunikation', label: 'Kommunikation', color: '#EA515A' },
  { key: 'skills', label: 'Skills', color: '#F07800' },
];

export default function FilterBar({ activeCluster, onClusterChange, searchTerm, onSearchChange }) {
  return (
    <div className="px-4 md:px-8 py-2 pb-4 space-y-2">
      <div className="flex gap-1.5 sm:gap-2 items-center overflow-x-auto scrollbar-hide pb-1">
        <span className="font-mono text-[9px] uppercase tracking-wider text-txt-tertiary shrink-0">Cluster</span>
        {CLUSTER_FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onClusterChange(f.key)}
            className={`font-mono text-[10px] px-2 sm:px-2.5 py-1 rounded-sm border transition-all shrink-0 ${
              activeCluster === f.key
                ? 'border-scnat-red text-scnat-red bg-scnat-red/8'
                : 'border-bd-default text-txt-secondary hover:border-bd-strong hover:text-txt-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-bg-elevated border border-bd-default rounded-[3px] px-3 py-1.5">
        <Search className="w-3.5 h-3.5 text-txt-tertiary shrink-0" />
        <input
          type="text"
          placeholder="Massnahme suchen…"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-txt-primary text-[13px] w-full placeholder:text-txt-tertiary"
        />
      </div>
    </div>
  );
}
