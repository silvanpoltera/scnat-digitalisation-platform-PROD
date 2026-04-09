import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, PenTool, Settings, Rocket, CheckCircle2, ChevronDown } from "lucide-react";

const phases = [
  {
    id: "analyse",
    phase: "1",
    title: "Strategische Analyse",
    period: "Frühjahr 2025",
    status: "done",
    icon: Search,
    color: "#EA515A",
    deliverables: [
      "IT-Architektur-Analyse (avega IT AG)",
      "Umfrage Digitaler Reifegrad (55 MA)",
      "Analyse Datenbank & Websysteme",
      "GL-Workshops zu Vision und Ambition",
    ],
  },
  {
    id: "entwicklung",
    phase: "2",
    title: "Strategieentwicklung",
    period: "Frühjahr–Sommer 2025",
    status: "done",
    icon: PenTool,
    color: "#006482",
    deliverables: [
      "Handlungsfelder & Themenfelder definiert",
      "IST/SOLL je Themenfeld erarbeitet",
      "Zielkatalog & Massnahmen erstellt",
      "Vision \"Digitalisierung vereinfacht.\" verabschiedet",
    ],
  },
  {
    id: "vorbereitung",
    phase: "3",
    title: "Umsetzungsvorbereitung",
    period: "Herbst 2025",
    status: "done",
    icon: Settings,
    color: "#f18700",
    deliverables: [
      "Massnahmen Canvas erstellt",
      "Massnahmen priorisiert (Wirkung/Aufwand)",
      "Rollen definiert",
      "PM-Framework entwickelt",
      "Glossar veröffentlicht",
    ],
  },
  {
    id: "umsetzung",
    phase: "4",
    title: "Umsetzung (laufend)",
    period: "ab Q1 2026",
    status: "active",
    icon: Rocket,
    color: "#00836f",
    deliverables: [
      "Sprint-Betrieb gestartet",
      "Pilotmassnahmen in Bearbeitung",
      "Quartalsweise Steering Committee",
      "Laufende Kommunikation via Portal",
    ],
  },
];

function StatusDot({ status, color }) {
  if (status === "done") {
    return (
      <div className="w-8 h-8 rounded-full bg-scnat-green flex items-center justify-center">
        <CheckCircle2 className="w-4 h-4 text-white" />
      </div>
    );
  }
  if (status === "active") {
    return (
      <span className="relative flex h-8 w-8">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: color }} />
        <span className="relative inline-flex items-center justify-center rounded-full h-8 w-8 text-white text-xs font-bold" style={{ background: color }}>
          <Rocket className="w-3.5 h-3.5" />
        </span>
      </span>
    );
  }
  return <div className="w-8 h-8 rounded-full bg-muted border-2 border-border" />;
}

export default function StrategyTimeline() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div>
      {/* Desktop: horizontal cards */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        {phases.map((p) => {
          const Icon = p.icon;
          const isOpen = expanded === p.id;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-200 ${
                  isOpen ? "border-transparent shadow-lg ring-1" : "border-border bg-card hover:shadow-md"
                }`}
                style={isOpen ? { borderColor: `${p.color}40`, ringColor: `${p.color}30`, background: `${p.color}08` } : {}}
              >
                <div className="flex items-center justify-between mb-3">
                  <StatusDot status={p.status} color={p.color} />
                  <span className="text-[10px] font-mono text-muted-foreground">{p.period}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground">Phase {p.phase}</span>
                </div>
                <h4 className="font-heading font-semibold text-foreground text-sm">{p.title}</h4>
                <ChevronDown className={`w-4 h-4 text-muted-foreground mt-2 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-1.5">
                      {p.deliverables.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: p.color }} />
                          {d}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="md:hidden space-y-4">
        {phases.map((p) => {
          const isOpen = expanded === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setExpanded(isOpen ? null : p.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                isOpen ? "shadow-md" : "border-border bg-card"
              }`}
              style={isOpen ? { borderColor: `${p.color}40`, background: `${p.color}08` } : {}}
            >
              <div className="flex items-center gap-3">
                <StatusDot status={p.status} color={p.color} />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">{p.period}</p>
                  <h4 className="font-heading font-semibold text-foreground text-sm">{p.title}</h4>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pl-11 space-y-1.5">
                      {p.deliverables.map((d, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: p.color }} />
                          {d}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>
    </div>
  );
}
