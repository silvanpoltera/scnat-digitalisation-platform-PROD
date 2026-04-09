import { Server, Shield, Globe, Lock, Cpu, Database } from "lucide-react";

const useCases = [
  { icon: Lock, label: "Vertrauliche Dokumente", desc: "Interne Berichte, Personaldaten oder strategische Dokumente lokal verarbeiten – ohne Cloud." },
  { icon: Shield, label: "DSGVO-sensible Szenarien", desc: "Wenn europäische Datenschutzanforderungen eine lokale Verarbeitung zwingend machen." },
  { icon: Globe, label: "Datensouveränität", desc: "Volle Kontrolle über Daten – keine Abhängigkeit von US-Cloud-Diensten." },
  { icon: Cpu, label: "Offline-Nutzung", desc: "KI-Funktionen nutzen, auch ohne Internetverbindung oder VPN." },
];

const localModels = [
  { name: "Llama 3.2", provider: "Meta", size: "3B–70B Parameter", note: "Bestes Open-Source-Allround-Modell" },
  { name: "Mistral / Mixtral", provider: "Mistral AI (FR)", size: "7B–47B Parameter", note: "EU-Anbieter, starke Code-Fähigkeiten" },
  { name: "Phi-3", provider: "Microsoft", size: "3.8B Parameter", note: "Klein, schnell, gut für einfache Aufgaben" },
  { name: "Gemma 2", provider: "Google", size: "2B–27B Parameter", note: "Kompakt und effizient" },
];

export default function OllamaSection() {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-scnat-green/10 text-scnat-green">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Lokale KI-Modelle</h2>
          <p className="text-sm text-muted-foreground">Datensouveränität durch lokale Verarbeitung – keine Daten verlassen den Rechner</p>
        </div>
      </div>

      {/* Key message */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-scnat-green/5 to-scnat-teal/5 border border-scnat-green/20 mb-6">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-scnat-green shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-foreground text-sm mb-1">Warum lokale KI?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Mit Tools wie <strong>Ollama</strong> können grosse Sprachmodelle (Llama, Mistral, Phi u.a.) direkt auf dem
              eigenen Rechner betrieben werden. <strong>Keine Daten werden an externe Server gesendet</strong> –
              ideal für vertrauliche Inhalte und DSGVO-sensible Szenarien. Die SCNAT prüft derzeit die Möglichkeiten
              für einen organisierten Einsatz.
            </p>
          </div>
        </div>
      </div>

      {/* Use cases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {useCases.map((uc) => (
          <div key={uc.label} className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 rounded-lg bg-scnat-green/10 text-scnat-green">
                <uc.icon className="w-4 h-4" />
              </div>
              <h4 className="font-heading font-semibold text-foreground text-sm">{uc.label}</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{uc.desc}</p>
          </div>
        ))}
      </div>

      {/* Available local models */}
      <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Verfügbare Open-Source-Modelle</h3>
      <div className="overflow-x-auto rounded-xl border border-border mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-3 font-heading font-semibold text-foreground">Modell</th>
              <th className="text-left p-3 font-heading font-semibold text-foreground">Anbieter</th>
              <th className="text-left p-3 font-heading font-semibold text-foreground hidden sm:table-cell">Grösse</th>
              <th className="text-left p-3 font-heading font-semibold text-foreground hidden md:table-cell">Bemerkung</th>
            </tr>
          </thead>
          <tbody>
            {localModels.map((model) => (
              <tr key={model.name} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium text-foreground">{model.name}</td>
                <td className="p-3 text-muted-foreground">{model.provider}</td>
                <td className="p-3 text-muted-foreground hidden sm:table-cell">{model.size}</td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{model.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-lg bg-scnat-orange/5 border border-scnat-orange/20">
        <p className="text-xs text-foreground/70 leading-relaxed">
          <strong>Hinweis:</strong> Die Installation und Konfiguration lokaler KI-Modelle erfolgt über die IT-Abteilung.
          Bei Interesse an einem Pilotprojekt oder Fragen zu lokalen KI-Möglichkeiten wende dich an
          Silvan (Verantwortlicher Digitalisierung) oder die IT.
        </p>
      </div>
    </section>
  );
}
