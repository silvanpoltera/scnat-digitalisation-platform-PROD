import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Network, Workflow, Database, Server } from "lucide-react";

const pillars = [
  {
    id: "kultur",
    title: "Digitale Kultur",
    icon: Users,
    color: "#EA515A",
    topics: ["Digitales Mindset", "Digitale Kompetenzen", "Change Management"],
    desc: "Offenheit gegenüber digitalen Veränderungen fördern und eine Kultur des lebenslangen Lernens aufbauen.",
  },
  {
    id: "zusammenarbeit",
    title: "Zusammenarbeit & Netzwerk",
    icon: Network,
    color: "#006482",
    topics: ["Digitale Zusammenarbeit", "Kundenorientierung"],
    desc: "Moderne Tools für teamübergreifende Kollaboration und digitale Interaktion mit Mitgliedern und Partnern.",
  },
  {
    id: "prozesse",
    title: "Effiziente Prozesslandschaft",
    icon: Workflow,
    color: "#f18700",
    topics: ["Prozessdigitalisierung", "Prozessmanagement"],
    desc: "Automatisierung bestehender Abläufe und kontinuierliche Verbesserung von Geschäftsprozessen.",
  },
  {
    id: "daten",
    title: "Daten- & Wissensmanagement",
    icon: Database,
    color: "#00836f",
    topics: ["Informationsmanagement", "Datenmanagement"],
    desc: "Strukturierte Ablage, Auffindbarkeit und strategischer Umgang mit Forschungsdaten.",
  },
  {
    id: "infrastruktur",
    title: "Digitale Infrastruktur & Tech.",
    icon: Server,
    color: "#5A616B",
    topics: ["IT-Architektur", "Applikationslandschaft", "Künstliche Intelligenz"],
    desc: "Strategische Planung der IT-Infrastruktur, Konsolidierung der Software und Integration von KI.",
  },
];

export { pillars };

export default function VisionHouse({ selected, onSelect, compact = false }) {
  const [internalSelected, setInternalSelected] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const active = selected !== undefined ? selected : internalSelected;
  const setActive = onSelect || setInternalSelected;

  const baseDelay = 0.15;

  return (
    <div ref={ref} className={`w-full ${compact ? "max-w-3xl mx-auto" : ""}`}>
      {/* Roof */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: baseDelay + 0.5, duration: 0.5 }}
        className="relative group cursor-default"
      >
        <div
          className="relative px-6 py-5 sm:py-6 text-center text-white overflow-hidden rounded-t-lg"
          style={{
            background: "#EA515A",
            clipPath: "polygon(3% 100%, 97% 100%, 100% 0%, 0% 0%)",
          }}
        >
          <p className={`font-heading font-bold text-white ${compact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"}`}>
            &laquo;Digitalisierung vereinfacht.&raquo;
          </p>
          <p className="text-white/70 text-xs mt-1">
            Digitale Transformation &middot; Übergreifendes Handlungsfeld
          </p>
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -bottom-7 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap px-3 py-1.5 rounded-md bg-scnat-anthrazit-dark text-white text-[10px] shadow-lg pointer-events-none">
          Von der GL verabschiedet, Juni 2025
        </div>
      </motion.div>

      {/* Pillars */}
      <div className={`grid grid-cols-5 ${compact ? "gap-1" : "gap-1.5"} mt-1`}>
        {pillars.map((pillar, i) => {
          const isActive = active === pillar.id;
          const Icon = pillar.icon;
          return (
            <motion.button
              key={pillar.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: baseDelay + 0.1 + i * 0.08, duration: 0.4 }}
              onClick={() => setActive(isActive ? null : pillar.id)}
              whileHover={{ scale: 1.02 }}
              className={`relative flex flex-col items-center justify-center text-center border transition-all duration-200 rounded-sm ${
                compact ? "py-5 px-1" : "py-7 sm:py-10 px-1.5"
              } ${
                isActive
                  ? "border-transparent shadow-lg ring-2 z-10"
                  : "border-white/20 hover:border-white/40"
              }`}
              style={{
                background: isActive ? pillar.color : `${pillar.color}cc`,
                ringColor: isActive ? pillar.color : undefined,
              }}
            >
              <Icon className={`text-white mb-1.5 ${compact ? "w-4 h-4" : "w-5 h-5"}`} />
              <span className={`text-white font-semibold leading-tight ${compact ? "text-[9px]" : "text-[10px] sm:text-xs"}`}>
                {pillar.title}
              </span>
              {isActive && (
                <motion.div
                  layoutId="pillar-indicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                  style={{ background: pillar.color }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Foundation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: baseDelay, duration: 0.5 }}
        className={`mt-1 text-center text-white rounded-b-lg ${compact ? "px-4 py-3" : "px-6 py-4"}`}
        style={{ background: "#3a3f47" }}
      >
        <p className={`font-medium text-white/90 ${compact ? "text-[10px]" : "text-xs"}`}>
          Strategie &middot; Governance &middot; PM-Framework &middot; Rollen &middot; Kommunikation
        </p>
      </motion.div>
    </div>
  );
}
