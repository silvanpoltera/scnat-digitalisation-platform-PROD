import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, Users, Workflow, Database, Server, Layers } from "lucide-react";
import PageHeader from "../components/PageHeader";

const fields = [
  {
    icon: Lightbulb,
    title: "Digitale Kultur",
    color: "bg-scnat-red",
    topics: [
      { name: "Digitales Mindset", desc: "Offenheit gegenüber digitalen Veränderungen und eine Kultur des lebenslangen Lernens fördern." },
      { name: "Digitale Kompetenzen", desc: "Gezielte Weiterbildung und Schulung der Mitarbeitenden in digitalen Fähigkeiten." },
      { name: "Change Management", desc: "Begleitung von Veränderungsprozessen und Abbau von Widerständen." },
    ],
  },
  {
    icon: Users,
    title: "Zusammenarbeit & Netzwerk digital",
    color: "bg-scnat-teal",
    topics: [
      { name: "Digitale Zusammenarbeit", desc: "Einsatz moderner Tools für effiziente teamübergreifende Kollaboration." },
      { name: "Kundenorientierung", desc: "Digitale Kanäle und Services für die Interaktion mit Mitgliedern und Partnern." },
    ],
  },
  {
    icon: Workflow,
    title: "Effiziente und digitale Prozesslandschaft",
    color: "bg-scnat-orange",
    topics: [
      { name: "Prozessdigitalisierung", desc: "Automatisierung und Digitalisierung bestehender Arbeitsabläufe." },
      { name: "Prozessmanagement", desc: "Dokumentation, Analyse und kontinuierliche Verbesserung von Geschäftsprozessen." },
    ],
  },
  {
    icon: Database,
    title: "Daten- & Wissensmanagement",
    color: "bg-scnat-green",
    topics: [
      { name: "Informationsmanagement", desc: "Strukturierte Ablage, Auffindbarkeit und Verwaltung von Dokumenten und Wissen." },
      { name: "Datenmanagement", desc: "Datenqualität, Governance und strategischer Umgang mit Forschungsdaten." },
    ],
  },
  {
    icon: Server,
    title: "Digitale Infrastruktur & Technologie",
    color: "bg-scnat-cyan",
    topics: [
      { name: "IT-Architektur", desc: "Strategische Planung und Weiterentwicklung der technischen Infrastruktur." },
      { name: "Applikationslandschaft", desc: "Konsolidierung und Optimierung der eingesetzten Softwarelandschaft." },
      { name: "Künstliche Intelligenz", desc: "Evaluierung und Integration von KI-Tools in die Arbeitsprozesse." },
    ],
  },
  {
    icon: Layers,
    title: "Digitale Transformation (übergreifend)",
    color: "bg-scnat-anthrazit",
    topics: [
      { name: "Kommunikation", desc: "Transparente interne Kommunikation zu Digitalisierungsinitiativen." },
      { name: "Rollen & Prozess", desc: "Klare Zuständigkeiten und definierte Abläufe für das Transformationsmanagement." },
      { name: "Strategische Steuerung", desc: "Monitoring, Priorisierung und strategische Ausrichtung der Digitalisierung." },
    ],
  },
];

const timelinePhases = [
  { label: "Analyse & Befragung", year: "2024", status: "done" },
  { label: "Strategieentwicklung", year: "2025", status: "done" },
  { label: "Umsetzung Phase 1", year: "2026", status: "active" },
  { label: "Skalierung", year: "2027+", status: "future" },
];

export default function Handlungsfelder() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div>
      <PageHeader
        title="Handlungsfelder"
        subtitle="Die Digitalisierungsstrategie der SCNAT gliedert sich in sechs zentrale Handlungsfelder mit insgesamt 16 Themenfeldern."
        breadcrumb={[{ label: 'Handlungsfelder' }]}
        seed={55}
        accentColor="#007A87"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="mb-12 p-4 sm:p-6 rounded-sm bg-bg-surface border border-bd-faint">
          <h3 className="font-heading font-semibold text-foreground mb-6 text-center">Zeitleiste der Transformation</h3>
          <div className="flex items-center justify-between relative overflow-x-auto">
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-border" />
            {timelinePhases.map((phase) => (
              <div key={phase.label} className="relative flex flex-col items-center z-10 flex-1 min-w-[70px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  phase.status === "done" ? "bg-scnat-green text-white" :
                  phase.status === "active" ? "bg-primary text-primary-foreground ring-4 ring-primary/20" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {phase.status === "done" ? "\u2713" : ""}
                </div>
                <span className="mt-2 text-xs font-semibold text-foreground">{phase.year}</span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground text-center mt-0.5 max-w-[80px] sm:max-w-[100px]">{phase.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {fields.map((field, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={field.title} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${field.color} text-white shrink-0`}>
                    <field.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-semibold text-foreground">{field.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{field.topics.length} Themenfelder</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {field.topics.map((topic) => (
                          <div key={topic.name} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                            <h4 className="font-heading font-semibold text-sm text-foreground mb-1">{topic.name}</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{topic.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
    </div>
  );
}
