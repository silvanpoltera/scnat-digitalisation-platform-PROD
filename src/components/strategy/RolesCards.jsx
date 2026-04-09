import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Compass, CheckSquare, Shield, Code, ChevronDown, CheckCircle2 } from "lucide-react";

const roles = [
  {
    id: "gl",
    title: "Strategische Steuerung",
    who: "Geschäftsleitung (GL)",
    icon: Crown,
    color: "#EA515A",
    responsibilities: [
      "Definiert strategische Ziele für Handlungs- und Themenfelder",
      "Entscheidet über Kapazität und Budget",
      "Entscheidet über Priorisierung der Massnahmen",
      "Kommuniziert Ziele in die Organisation",
    ],
  },
  {
    id: "digi",
    title: "Verantwortlicher Digitalisierung",
    who: "Silvan",
    icon: Compass,
    color: "#006482",
    responsibilities: [
      "Koordiniert und verantwortet die Umsetzung",
      "Pflegt Portfolio Board und Roadmap",
      "Reportet an die GL",
      "Berät Verantwortliche Digitale Massnahmen",
      "Lieferantenmanagement bei externen Ressourcen",
    ],
  },
  {
    id: "owner",
    title: "Verantwortliche Digitale Massnahmen",
    who: "Je nach Massnahme (inhaltliche Fähigkeiten)",
    icon: CheckSquare,
    color: "#f18700",
    responsibilities: [
      "Übernehmen Verantwortung für einzelne Massnahmen",
      "Beschreiben und treiben Massnahmen voran",
      "Stellen transparenten Status sicher",
      "Dokumentieren Resultate",
    ],
  },
  {
    id: "dpo",
    title: "Vertretung Datenschutz & IT-Security",
    who: "IT / Datenschutzbeauftragte",
    icon: Shield,
    color: "#5A616B",
    responsibilities: [
      "Stellt sicher, dass IT-Architektur-Standards eingehalten werden",
      "Prüft Datenschutz und Sicherheitsanforderungen in Massnahmen",
      "Datenhosting in der Schweiz als Grundsatz",
    ],
  },
  {
    id: "tech",
    title: "Technische Umsetzung & Business Analyse",
    who: "Intern oder externe Partner",
    icon: Code,
    color: "#00836f",
    responsibilities: [
      "Make oder Buy: Individualentwicklung oder SaaS",
      "Umsetzung und Dokumentation technischer Anforderungen",
      "Business Analyse: fachliche Inhalte in technische Anforderungen übersetzen",
    ],
  },
];

export default function RolesCards() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {roles.map((role, i) => {
        const Icon = role.icon;
        const isOpen = expanded === role.id;
        return (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
          >
            <button
              onClick={() => setExpanded(isOpen ? null : role.id)}
              className={`w-full text-left p-5 rounded-xl border transition-all duration-200 h-full ${
                isOpen ? "shadow-lg" : "border-border bg-card hover:shadow-md hover:border-primary/10"
              }`}
              style={isOpen ? { borderColor: `${role.color}40`, borderLeftWidth: 4, borderLeftColor: role.color } : { borderLeftWidth: 4, borderLeftColor: "transparent" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg text-white" style={{ background: role.color }}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-foreground text-sm truncate">{role.title}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{role.who}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-2 border-t border-border mt-2">
                      {role.responsibilities.map((r, j) => (
                        <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" style={{ color: role.color }} />
                          {r}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
