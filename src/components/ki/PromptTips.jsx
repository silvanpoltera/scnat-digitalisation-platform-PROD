import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";

const tips = [
  {
    title: "Sei spezifisch",
    bad: "Schreib mir eine E-Mail.",
    good: "Schreibe eine formelle E-Mail an einen Projektpartner, in der ich die Verschiebung des Workshops auf den 15. Mai ankündige. Ton: professionell, freundlich.",
  },
  {
    title: "Gib Kontext",
    bad: "Fasse das zusammen.",
    good: "Fasse die folgenden Sitzungsnotizen in maximal 5 Bulletpoints zusammen. Fokus auf Entscheidungen und nächste Schritte: [Text einfügen]",
  },
  {
    title: "Definiere das Format",
    bad: "Was weisst du über KI?",
    good: "Erstelle eine Tabelle mit 5 KI-Tools, ihren Hauptfunktionen, Kosten und Datenschutz-Einschätzung. Format: Markdown-Tabelle.",
  },
  {
    title: "Iteriere",
    bad: "Das ist nicht gut genug.",
    good: "Bitte kürze den Text auf die Hälfte und verwende einfachere Sprache. Zielgruppe: Mitarbeitende ohne technischen Hintergrund.",
  },
];

export default function PromptTips() {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-scnat-orange/10 text-scnat-orange">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">Prompt-Tipps</h2>
          <p className="text-sm text-muted-foreground">So holst du das Beste aus KI-Tools heraus</p>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-heading font-semibold text-foreground text-sm mb-3">{tip.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-scnat-red/5 border border-scnat-red/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-scnat-red mb-1 block">Weniger gut</span>
                <p className="text-xs text-foreground/70 italic">&ldquo;{tip.bad}&rdquo;</p>
              </div>
              <div className="p-3 rounded-lg bg-scnat-green/5 border border-scnat-green/10 relative group">
                <span className="text-[10px] font-bold uppercase tracking-wider text-scnat-green mb-1 block">Besser</span>
                <p className="text-xs text-foreground/70">&ldquo;{tip.good}&rdquo;</p>
                <button
                  onClick={() => copyToClipboard(tip.good, i)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-white/80 border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                >
                  {copiedIndex === i ? <Check className="w-3 h-3 text-scnat-green" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
