import { useState } from "react";
import { Bot, CheckCircle, Monitor, Shield, ExternalLink } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const models = [
  {
    id: "chatgpt",
    name: "ChatGPT (GPT-4o)",
    provider: "OpenAI",
    color: "#10A37F",
    isApproved: true,
    approvedNote: "Offiziell lizenziert (Enterprise). Kein Training mit SCNAT-Daten.",
    canRunLocally: false,
    strengths: ["Allgemeine Aufgaben", "Texterstellung", "Code", "Analysen"],
    weaknesses: ["US-Datenschutz (trotz Enterprise)", "Halluzinationen möglich"],
    bestFor: ["E-Mails schreiben", "Dokumente zusammenfassen", "Recherche", "Code erklären"],
    dataPrivacy: "mittel",
    dataPrivacyNote: "Enterprise-Vertrag: Daten werden nicht für Training genutzt. Trotzdem keine vertraulichen Daten eingeben.",
    radarData: { textQuality: 9, codeAbility: 9, docAnalysis: 8, multimodal: 9, privacy: 6, speed: 8 },
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    color: "#D4A27A",
    isApproved: false,
    canRunLocally: false,
    strengths: ["Sehr lange Dokumente", "Tiefenanalyse", "Sicherheitsorientiert"],
    weaknesses: ["Kein offizieller SCNAT-Vertrag", "US-basiert"],
    bestFor: ["Lange Dokumente analysieren", "Komplexe Texte", "Ethik-sensible Themen"],
    dataPrivacy: "mittel",
    dataPrivacyNote: "Kein aktiver Enterprise-Vertrag mit SCNAT. Derzeit nicht für internen Einsatz freigegeben.",
    radarData: { textQuality: 9, codeAbility: 8, docAnalysis: 10, multimodal: 7, privacy: 7, speed: 7 },
  },
  {
    id: "gemini",
    name: "Gemini 2.0",
    provider: "Google DeepMind",
    color: "#4285F4",
    isApproved: false,
    canRunLocally: false,
    strengths: ["Google-Integration", "Multimodal", "Websuche", "Bildanalyse"],
    weaknesses: ["Google-Ökosystem nötig", "Datenschutz-Fragen"],
    bestFor: ["Multimodale Aufgaben", "Bildanalyse", "Google Workspace"],
    dataPrivacy: "niedrig",
    dataPrivacyNote: "Google-Datenschutzrichtlinien. Nicht für SCNAT-internen Einsatz freigegeben.",
    radarData: { textQuality: 8, codeAbility: 8, docAnalysis: 7, multimodal: 10, privacy: 4, speed: 9 },
  },
  {
    id: "mistral",
    name: "Mistral Large",
    provider: "Mistral AI (FR)",
    color: "#FF7000",
    isApproved: false,
    canRunLocally: true,
    strengths: ["EU-Unternehmen (FR)", "Open Source", "DSGVO-freundlich", "Lokal betreibbar"],
    weaknesses: ["Weniger bekannt", "Qualität variiert je nach Modell"],
    bestFor: ["DSGVO-konforme Szenarien", "Lokaler Betrieb", "Europäische Datensouveränität"],
    dataPrivacy: "hoch",
    dataPrivacyNote: "EU-Unternehmen, DSGVO-konform. Bestimmte Modelle lokal betreibbar – Daten bleiben lokal.",
    radarData: { textQuality: 7, codeAbility: 8, docAnalysis: 7, multimodal: 5, privacy: 9, speed: 9 },
  },
  {
    id: "llama",
    name: "Llama 3.2",
    provider: "Meta (Open Source)",
    color: "#0668E1",
    isApproved: false,
    canRunLocally: true,
    strengths: ["Komplett lokal betreibbar", "Open Source", "Keine Datenweitergabe", "Kostenlos"],
    weaknesses: ["Lokale Infrastruktur nötig", "Schlechtere Performance als kommerzielle"],
    bestFor: ["Vertrauliche Daten lokal verarbeiten", "Experimentieren ohne Cloud", "Datensouveränität"],
    dataPrivacy: "hoch",
    dataPrivacyNote: "Vollständig lokal betreibbar. Keine Datenweitergabe. Ideal für vertrauliche Inhalte.",
    radarData: { textQuality: 7, codeAbility: 7, docAnalysis: 6, multimodal: 5, privacy: 10, speed: 6 },
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    provider: "Perplexity (US)",
    color: "#20808D",
    isApproved: false,
    canRunLocally: false,
    strengths: ["Echtzeit-Websuche", "Quellenangaben", "Recherche-Tool"],
    weaknesses: ["Nicht für SCNAT freigegeben", "US-basiert"],
    bestFor: ["Aktuelle Informationen suchen", "Recherche mit Quellennachweis"],
    dataPrivacy: "niedrig",
    dataPrivacyNote: "US-basiert, kein SCNAT-Vertrag. Nicht für interne Daten geeignet.",
    radarData: { textQuality: 7, codeAbility: 5, docAnalysis: 6, multimodal: 5, privacy: 4, speed: 8 },
  },
];

const radarLabels = {
  textQuality: "Textqualität",
  codeAbility: "Code",
  docAnalysis: "Dokumentenanalyse",
  multimodal: "Multimodal",
  privacy: "Datenschutz",
  speed: "Geschwindigkeit",
};

const privacyColors = {
  hoch: "text-scnat-green bg-scnat-green/10",
  mittel: "text-scnat-orange bg-scnat-orange/10",
  niedrig: "text-scnat-red bg-scnat-red/10",
};

function buildRadarData(model) {
  return Object.entries(radarLabels).map(([key, label]) => ({
    dimension: label,
    value: model.radarData[key],
    fullMark: 10,
  }));
}

export default function LlmComparison() {
  const [selected, setSelected] = useState(models[0]);

  const chartData = buildRadarData(selected);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-scnat-cyan/10 text-scnat-cyan">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">LLM-Vergleich</h2>
          <p className="text-sm text-muted-foreground">Klicke auf ein Modell, um dessen Stärken-Profil zu sehen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Model cards */}
        <div className="space-y-2">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => setSelected(model)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
                selected.id === model.id
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: model.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-foreground text-sm truncate">{model.name}</span>
                    {model.isApproved && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-scnat-green/10 text-scnat-green">
                        <CheckCircle className="w-2.5 h-2.5" /> SCNAT
                      </span>
                    )}
                    {model.canRunLocally && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-scnat-cyan/10 text-scnat-cyan">
                        <Monitor className="w-2.5 h-2.5" /> Lokal
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{model.provider}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Detail panel + Radar */}
        <div className="p-6 rounded-xl border border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
                <h3 className="font-heading font-bold text-foreground text-lg">{selected.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">{selected.provider}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${privacyColors[selected.dataPrivacy]}`}>
              <Shield className="w-3 h-3 inline mr-0.5 -mt-px" />
              Datenschutz: {selected.dataPrivacy}
            </span>
          </div>

          {/* Radar Chart */}
          <div className="h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="hsl(0 0% 90%)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 10, fill: "hsl(215 12% 47%)" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 10]}
                  tick={{ fontSize: 8, fill: "hsl(215 12% 60%)" }}
                  tickCount={6}
                />
                <Radar
                  name={selected.name}
                  dataKey="value"
                  stroke={selected.color}
                  fill={selected.color}
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip
                  formatter={(value) => [`${value}/10`]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(0 0% 90%)" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {selected.isApproved && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-scnat-green/10 text-scnat-green border border-scnat-green/20">
                <CheckCircle className="w-3 h-3" /> Für SCNAT freigegeben
              </span>
            )}
            {selected.canRunLocally && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-scnat-cyan/10 text-scnat-cyan border border-scnat-cyan/20">
                <Monitor className="w-3 h-3" /> Lokal betreibbar
              </span>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-scnat-green block mb-1">Stärken</span>
              <ul className="space-y-1">
                {selected.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-scnat-green mt-1.5 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-scnat-red block mb-1">Schwächen</span>
              <ul className="space-y-1">
                {selected.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-scnat-red mt-1.5 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">Ideal für</span>
            <div className="flex flex-wrap gap-1.5">
              {selected.bestFor.map((b, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground">{b}</span>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">{selected.dataPrivacyNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
