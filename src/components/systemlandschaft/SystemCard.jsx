import { AlertTriangle } from "lucide-react";

const statusConfig = {
  freigegeben: { label: "Freigegeben", dot: "bg-scnat-green", bg: "bg-scnat-green/10 text-scnat-green" },
  "nur-einladung": { label: "Nur Einladung", dot: "bg-scnat-orange", bg: "bg-scnat-orange/10 text-scnat-orange" },
  "nicht-erlaubt": { label: "Nicht erlaubt", dot: "bg-scnat-red", bg: "bg-scnat-red/10 text-scnat-red" },
};

export default function SystemCard({ system, onClick }) {
  const status = statusConfig[system.lizenzstatus] || statusConfig.freigegeben;

  return (
    <button
      onClick={() => onClick(system)}
      className="w-full text-left p-4 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-heading font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-tight">
          {system.name}
        </h3>
        {system.warning && <AlertTriangle className="w-3.5 h-3.5 text-scnat-orange shrink-0 mt-0.5" />}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {system.desc}
      </p>

      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg}`}>
          {status.label}
        </span>
        <span className="text-[10px] text-muted-foreground">{system.responsible}</span>
      </div>
    </button>
  );
}
