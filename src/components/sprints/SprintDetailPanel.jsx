import { useState, useMemo } from 'react';
import MassnahmeCard from './MassnahmeCard';

const STATUS_FILTERS = [
  { key: 'alle', label: 'Alle' },
  { key: 'geplant', label: 'Geplant' },
  { key: 'in-arbeit', label: 'In Arbeit' },
  { key: 'review', label: 'Review' },
  { key: 'fertig', label: 'Fertig' },
];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + (iso.includes('T') ? '' : 'T00:00:00'));
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

export default function SprintDetailPanel({ sprint, isOpen }) {
  const [statusFilter, setStatusFilter] = useState('alle');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let ms = sprint.massnahmen;
    if (statusFilter !== 'alle') ms = ms.filter(m => m.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      ms = ms.filter(m =>
        (m.titel || '').toLowerCase().includes(q) ||
        (m.massnahmeId || '').toLowerCase().includes(q) ||
        (m.verantwortliche || '').toLowerCase().includes(q)
      );
    }
    return ms;
  }, [sprint.massnahmen, statusFilter, search]);

  const statusCounts = useMemo(() => {
    return sprint.massnahmen.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});
  }, [sprint.massnahmen]);

  return (
    <div
      className="mx-4 md:mx-8 mb-3 overflow-hidden rounded border border-bd-default bg-bg-elevated transition-all duration-[450ms] ease-out"
      style={{
        maxHeight: isOpen ? 1200 : 0,
        opacity: isOpen ? 1 : 0,
      }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div>
            <div className="font-semibold text-base text-txt-primary mb-0.5">{sprint.name}</div>
            <div className="font-mono text-[10px] text-txt-secondary">
              {sprint.massnahmen.length} Massnahmen · {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`font-mono text-[9px] px-2 py-1 rounded-sm border transition-all ${
                  statusFilter === f.key
                    ? 'border-current bg-black/20 text-txt-primary'
                    : 'border-bd-default text-txt-tertiary hover:text-txt-secondary'
                }`}
              >
                {f.label}{statusCounts[f.key] ? ` · ${statusCounts[f.key]}` : ''}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-6 text-center font-mono text-[10px] text-txt-tertiary">
            Keine Massnahmen mit diesem Status
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filtered.map(m => (
              <MassnahmeCard key={m.massnahmeId} m={m} clusterColor={sprint.clusterColor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
