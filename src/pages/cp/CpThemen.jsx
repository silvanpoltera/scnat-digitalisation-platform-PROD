import { useState, useEffect } from 'react';
import { Trash2, ThumbsUp } from 'lucide-react';

export default function CpThemen() {
  const [themen, setThemen] = useState([]);

  const load = () => {
    fetch('/api/schulungsthemen', { credentials: 'include' }).then(r => r.json()).then(setThemen).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Thema wirklich löschen?')) return;
    await fetch(`/api/schulungsthemen/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  return (
    <div>
      <h2 className="text-xl font-heading font-semibold text-txt-primary mb-6">Schulungsthemen</h2>

      <div className="space-y-2">
        {themen.map(t => (
          <div key={t.id} className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-3 flex items-center gap-4">
            <div className="flex items-center gap-1 text-txt-secondary">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span className="text-xs font-mono">{t.likes?.length || 0}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-txt-primary">{t.titel}</span>
                <span className={`text-[9px] font-mono px-1 py-0.5 rounded-sm ${t.typ === 'vordefiniert' ? 'bg-status-blue/15 text-status-blue' : 'bg-bg-elevated text-txt-tertiary'}`}>{t.typ}</span>
              </div>
              {t.beschreibung && <p className="text-xs text-txt-secondary mt-0.5 truncate">{t.beschreibung}</p>}
            </div>
            {t.typ !== 'vordefiniert' && (
              <button onClick={() => handleDelete(t.id)} className="text-txt-tertiary hover:text-scnat-red p-1"><Trash2 className="w-3.5 h-3.5" /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
