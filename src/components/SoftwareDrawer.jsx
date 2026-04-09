import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import RadarChart from './RadarChart';

export default function SoftwareDrawer({ software, onClose }) {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [myVote, setMyVote] = useState(null);

  const loadVotes = () => {
    if (!software) return;
    fetch('/api/software-votes', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setVotes(Array.isArray(data) ? data : []);
        const found = Array.isArray(data) ? data.find(v => v.softwareId === software.id && v.userId === user?.id) : null;
        setMyVote(found?.type || null);
      })
      .catch(() => setVotes([]));
  };

  useEffect(() => { loadVotes(); }, [software, user]);

  const handleVote = async (type) => {
    try {
      if (myVote === type) {
        await fetch('/api/software-votes', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ softwareId: software.id }),
        });
        setMyVote(null);
      } else {
        await fetch('/api/software-votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ softwareId: software.id, type }),
        });
        setMyVote(type);
      }
      loadVotes();
    } catch {}
  };

  if (!software) return null;

  const softVotes = votes.filter(v => v.softwareId === software.id);
  const ups = softVotes.filter(v => v.type === 'up').length;
  const downs = softVotes.filter(v => v.type === 'down').length;
  const interests = softVotes.filter(v => v.type === 'interest').length;
  const inUse = softVotes.filter(v => v.type === 'in_use').length;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-bg-surface border-l border-bd-faint z-50 overflow-y-auto transform transition-transform duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bd-faint sticky top-0 bg-bg-surface z-10">
          <h3 className="text-sm font-heading font-semibold text-txt-primary">{software.name}</h3>
          <button onClick={onClose} className="text-txt-tertiary hover:text-txt-primary"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
              software.status === 'erlaubt' ? 'bg-status-green/15 text-status-green' : 'bg-scnat-red/15 text-scnat-red'
            }`}>{software.status === 'erlaubt' ? 'Freigegeben' : software.status === 'nur-einladung' ? 'Nur Einladung' : 'Nicht erlaubt'}</span>
            <span className="text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1.5 py-0.5 rounded-sm">{software.kategorie}</span>
          </div>

          <p className="text-sm text-txt-secondary">{software.beschreibung}</p>

          {software.notizen && (
            <div className="bg-bg-elevated border border-bd-faint rounded-sm px-3 py-2">
              <p className="text-xs text-txt-tertiary">Hinweis: {software.notizen}</p>
            </div>
          )}

          {software.radar && (
            <div>
              <h4 className="text-xs font-mono text-txt-tertiary mb-3">Stärken / Schwächen</h4>
              <div className="flex justify-center">
                <RadarChart radar={software.radar} />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {Object.entries(software.radar).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-txt-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-mono text-txt-primary">{val}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-mono text-txt-tertiary mb-3">Deine Bewertung</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleVote('in_use')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs transition-colors ${
                  myVote === 'in_use' ? 'bg-scnat-teal/15 text-scnat-teal border border-scnat-teal/30' : 'bg-bg-elevated text-txt-secondary border border-bd-faint hover:border-bd-default'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Ich nutze das ({inUse})
              </button>
              <button
                onClick={() => handleVote('up')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs transition-colors ${
                  myVote === 'up' ? 'bg-status-green/15 text-status-green border border-status-green/30' : 'bg-bg-elevated text-txt-secondary border border-bd-faint hover:border-bd-default'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Zufrieden ({ups})
              </button>
              <button
                onClick={() => handleVote('down')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs transition-colors ${
                  myVote === 'down' ? 'bg-scnat-red/15 text-scnat-red border border-scnat-red/30' : 'bg-bg-elevated text-txt-secondary border border-bd-faint hover:border-bd-default'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" /> Unzufrieden ({downs})
              </button>
              <button
                onClick={() => handleVote('interest')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs transition-colors ${
                  myVote === 'interest' ? 'bg-status-yellow/15 text-status-yellow border border-status-yellow/30' : 'bg-bg-elevated text-txt-secondary border border-bd-faint hover:border-bd-default'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Interesse ({interests})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
