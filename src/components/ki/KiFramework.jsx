import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const rules = [
  { type: "do", text: "Allgemeine, nicht vertrauliche Inhalte bearbeiten lassen" },
  { type: "do", text: "Entwürfe, Zusammenfassungen, Übersetzungen erstellen" },
  { type: "do", text: "ChatGPT (Business Team) und DeepL verwenden" },
  { type: "do", text: "Ergebnisse immer auf Korrektheit prüfen" },
  { type: "warn", text: "Vertrauliche Dokumente nur nach Rücksprache" },
  { type: "warn", text: "Bei Unsicherheit: David, Anina oder Arber fragen" },
  { type: "dont", text: "Keine Personendaten eingeben" },
  { type: "dont", text: "Keine internen Berichte oder Finanzdaten" },
  { type: "dont", text: "Keine nicht freigegebenen KI-Tools für sensible Daten" },
];

export default function KiFramework() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-scnat-red/10 text-scnat-red">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">KI-Rahmen SCNAT</h2>
          <p className="text-sm text-muted-foreground">Beschluss der Geschäftsleitung, März 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-scnat-green/20 bg-scnat-green/5">
          <h3 className="flex items-center gap-2 font-heading font-semibold text-scnat-green text-sm mb-3">
            <CheckCircle className="w-4 h-4" /> Erlaubt
          </h3>
          <ul className="space-y-2">
            {rules.filter(r => r.type === "do").map((r, i) => (
              <li key={i} className="text-xs text-foreground/80 leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-scnat-green mt-1.5 shrink-0" />
                {r.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-xl border border-scnat-orange/20 bg-scnat-orange/5">
          <h3 className="flex items-center gap-2 font-heading font-semibold text-scnat-orange text-sm mb-3">
            <AlertTriangle className="w-4 h-4" /> Achtung
          </h3>
          <ul className="space-y-2">
            {rules.filter(r => r.type === "warn").map((r, i) => (
              <li key={i} className="text-xs text-foreground/80 leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-scnat-orange mt-1.5 shrink-0" />
                {r.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-xl border border-scnat-red/20 bg-scnat-red/5">
          <h3 className="flex items-center gap-2 font-heading font-semibold text-scnat-red text-sm mb-3">
            <XCircle className="w-4 h-4" /> Verboten
          </h3>
          <ul className="space-y-2">
            {rules.filter(r => r.type === "dont").map((r, i) => (
              <li key={i} className="text-xs text-foreground/80 leading-relaxed flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-scnat-red mt-1.5 shrink-0" />
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
