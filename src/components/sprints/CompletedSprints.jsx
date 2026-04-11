import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function CompletedSprints({ sprints }) {
  const [open, setOpen] = useState(false);

  if (sprints.length === 0) return null;

  return (
    <div className="px-4 md:px-8 pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-bg-surface border border-bd-faint rounded-[3px] text-[13px] text-txt-secondary hover:bg-bg-elevated transition-colors"
      >
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} />
        <span>Abgeschlossene Sprints</span>
        <span className="font-mono text-[9px] text-txt-tertiary ml-2">
          {sprints.length} abgeschlossen
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 400 : 0 }}
      >
        <div className="pt-2 space-y-1.5">
          {sprints.map(sp => (
            <div key={sp.id} className="flex items-center gap-3 px-3 py-2.5 bg-bg-surface border border-bd-faint rounded-[3px] opacity-60 hover:opacity-85 transition-opacity">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sp.clusterColor }} />
              <div className="text-[13px] font-medium flex-1">{sp.name}</div>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-sm bg-[#008770]/10 text-[#008770] border border-[#008770]/30">
                Fertig
              </span>
              <span className="font-mono text-[9px] text-txt-tertiary">
                {sp.massnahmen.length} Massnahmen
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
