import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Archive } from 'lucide-react';

const STATUS_STYLES = {
  active:    { bg: 'rgba(0,152,218,.1)', color: '#0098DA', border: 'rgba(0,152,218,.3)', label: 'Aktiv' },
  planned:   { bg: 'rgba(78,83,93,.15)', color: '#4E535D', border: 'rgba(78,83,93,.3)', label: 'Geplant' },
  review:    { bg: 'rgba(240,120,0,.1)', color: '#F07800', border: 'rgba(240,120,0,.3)', label: 'Review' },
  completed: { bg: 'rgba(0,135,112,.1)', color: '#008770', border: 'rgba(0,135,112,.3)', label: 'Abgeschlossen' },
  archived:  { bg: 'rgba(78,83,93,.1)',  color: '#4E535D', border: 'rgba(78,83,93,.2)', label: 'Archiviert' },
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' });
}

export default function CpSprints() {
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiveConfirm, setArchiveConfirm] = useState(null);

  useEffect(() => {
    fetch('/api/sprints', { credentials: 'include' })
      .then(r => r.json())
      .then(setSprints)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleArchive = async (id) => {
    await fetch(`/api/sprints/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'archived' }),
    });
    setSprints(prev => prev.filter(s => s.id !== id));
    setArchiveConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 border-scnat-red/30 border-t-scnat-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold mb-1">Sprint-Verwaltung</h1>
          <p className="text-sm text-txt-secondary">{sprints.length} Sprints</p>
        </div>
        <Link
          to="/cp/sprints/new"
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-scnat-red hover:bg-scnat-red/90 px-4 py-2 rounded-[3px] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Sprint erstellen
        </Link>
      </div>

      <div className="border border-bd-faint rounded-[3px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-surface border-b border-bd-faint">
              <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-txt-tertiary font-medium">Name</th>
              <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-txt-tertiary font-medium hidden md:table-cell">Cluster</th>
              <th className="text-left px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-txt-tertiary font-medium hidden sm:table-cell">Zeitraum</th>
              <th className="text-center px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-txt-tertiary font-medium">M</th>
              <th className="text-center px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-txt-tertiary font-medium">Status</th>
              <th className="text-right px-4 py-3 font-mono text-[9px] uppercase tracking-wider text-txt-tertiary font-medium">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {sprints.map(sp => {
              const ss = STATUS_STYLES[sp.status] || STATUS_STYLES.planned;
              return (
                <tr key={sp.id} className="border-b border-bd-faint last:border-b-0 hover:bg-bg-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: sp.clusterColor }} />
                      <span className="font-medium truncate">{sp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-txt-secondary capitalize hidden md:table-cell">{sp.cluster}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-txt-tertiary hidden sm:table-cell">
                    {formatDate(sp.startDate)} → {formatDate(sp.endDate)}
                  </td>
                  <td className="px-4 py-3 text-center">{sp.massnahmen.length}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="font-mono text-[9px] px-2 py-1 rounded-sm inline-block"
                      style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}
                    >
                      {ss.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        to={`/cp/sprints/${sp.id}`}
                        className="p-1.5 rounded-sm text-txt-tertiary hover:text-txt-primary hover:bg-bg-elevated transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      {archiveConfirm === sp.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleArchive(sp.id)}
                            className="text-[10px] font-mono text-scnat-red hover:underline"
                          >
                            Ja
                          </button>
                          <button
                            onClick={() => setArchiveConfirm(null)}
                            className="text-[10px] font-mono text-txt-tertiary hover:underline"
                          >
                            Nein
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setArchiveConfirm(sp.id)}
                          className="p-1.5 rounded-sm text-txt-tertiary hover:text-scnat-red hover:bg-scnat-red/10 transition-colors"
                          title="Archivieren"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sprints.length === 0 && (
          <div className="py-12 text-center text-txt-tertiary text-sm">
            Noch keine Sprints vorhanden.
          </div>
        )}
      </div>
    </div>
  );
}
