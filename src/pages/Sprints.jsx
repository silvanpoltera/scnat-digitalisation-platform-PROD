import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import GlStatsBar from '../components/sprints/GlStatsBar';
import SprintTimeline from '../components/sprints/SprintTimeline';
import SprintDetailPanel from '../components/sprints/SprintDetailPanel';
import FilterBar from '../components/sprints/FilterBar';
import CompletedSprints from '../components/sprints/CompletedSprints';

export default function Sprints() {
  const { user } = useAuth();
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [clusterFilter, setClusterFilter] = useState('alle');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/sprints', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setSprints(data);
        const firstActive = data.find(s => s.status === 'active');
        if (firstActive) setExpandedIds(new Set([firstActive.id]));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredSprints = useMemo(() => {
    let result = sprints;
    if (clusterFilter !== 'alle') result = result.filter(s => s.cluster === clusterFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.massnahmen.some(m => (m.titel || '').toLowerCase().includes(q) || m.massnahmeId.toLowerCase().includes(q))
      );
    }
    return result;
  }, [sprints, clusterFilter, searchTerm]);

  const activeSprints = filteredSprints.filter(s => s.status !== 'completed' && s.status !== 'archived');
  const completedSprints = filteredSprints.filter(s => s.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-scnat-red/30 border-t-scnat-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <GlStatsBar sprints={sprints} />

      {/* Page Header */}
      <div className="px-4 md:px-8 pt-8 pb-4 flex items-start justify-between gap-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[.14em] text-scnat-red mb-1.5">
            Sprint-Planung · Q2 2025
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-1">Sprints</h1>
          <p className="text-[13px] text-txt-secondary">
            Übersicht aller laufenden und geplanten Sprints · 4-Wochen-Takte
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link
            to="/cp/sprints"
            className="flex items-center gap-1.5 text-[12px] text-txt-secondary border border-bd-default rounded-[3px] px-3 py-2 hover:border-bd-strong hover:text-txt-primary transition-colors shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Admin / CP
          </Link>
        )}
      </div>

      <FilterBar
        activeCluster={clusterFilter}
        onClusterChange={setClusterFilter}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <SprintTimeline
        sprints={activeSprints}
        expandedIds={expandedIds}
        onToggle={toggleExpand}
      />

      {activeSprints.map(sp => (
        <SprintDetailPanel key={sp.id} sprint={sp} isOpen={expandedIds.has(sp.id)} />
      ))}

      <CompletedSprints sprints={completedSprints} />
    </div>
  );
}
