import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, User, Tag, Shield } from "lucide-react";

const statusConfig = {
  freigegeben: { label: "Freigegeben", color: "text-scnat-green", bg: "bg-scnat-green/10" },
  "nur-einladung": { label: "Nur auf Einladung", color: "text-scnat-orange", bg: "bg-scnat-orange/10" },
  "nicht-erlaubt": { label: "Nicht erlaubt", color: "text-scnat-red", bg: "bg-scnat-red/10" },
};

export default function SystemDetailModal({ system, open, onClose }) {
  if (!system) return null;

  const status = statusConfig[system.lizenzstatus] || statusConfig.freigegeben;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{system.name}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">{system.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status.bg}`}>
              <Shield className={`w-4 h-4 ${status.color}`} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Lizenzstatus</span>
              <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Verantwortlich</span>
              <p className="text-sm font-medium text-foreground">{system.responsible}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Tag className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Kategorie</span>
              <p className="text-sm font-medium text-foreground">{system.category}</p>
            </div>
          </div>

          {system.warning && (
            <div className="p-4 rounded-lg bg-scnat-orange/5 border border-scnat-orange/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-scnat-orange shrink-0 mt-0.5" />
                <p className="text-xs text-foreground/80 leading-relaxed">{system.warning}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
