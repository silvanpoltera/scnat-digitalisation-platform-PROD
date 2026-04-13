import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  RotateCw, Target, ClipboardList, Zap, BarChart, Users, MessageSquare,
  ChevronDown, ChevronRight, Shield, Lightbulb, Eye, FileText, Calendar,
  AlertTriangle, Server, Database, Workflow, Radio, GraduationCap, Scale,
  Clock, UserCheck, Megaphone, CheckCircle2, Send, PlusCircle
} from "lucide-react";

const SECTIONS = [
  { id: "overview", label: "Übersicht", icon: Lightbulb },
  { id: "sprint", label: "Sprint-Zyklus", icon: RotateCw },
  { id: "change", label: "Change-Management", icon: Megaphone },
  { id: "quarterly", label: "Quartalsplanung", icon: Calendar },
  { id: "governance", label: "Governance & Meetings", icon: Scale },
  { id: "vorschlag", label: "Change einreichen", icon: PlusCircle },
];

const themenCluster = [
  { icon: Server, title: "Infrastruktur & IT", desc: "Geräte, Zugänge, Tools", color: "bg-scnat-cyan" },
  { icon: Database, title: "Datenstrategie", desc: "Datenschutz, Ablage, Governance, revDSG/DSGVO", color: "bg-scnat-green" },
  { icon: Workflow, title: "Prozessdigitalisierung", desc: "Workflows, Automatisierung", color: "bg-scnat-orange" },
  { icon: Radio, title: "Kommunikation & Kollaboration", desc: "Intranet, kollaborative Tools", color: "bg-scnat-teal" },
  { icon: GraduationCap, title: "Skills & Change", desc: "Schulungen, Adoption, Begleitung", color: "bg-scnat-red" },
  { icon: Scale, title: "Compliance", desc: "revDSG/DSGVO-Konformität, Audits", color: "bg-scnat-anthrazit" },
];

const principles = [
  { title: "Kein Big Bang", desc: "Immer in kleinen, testbaren Schritten. Nichts ausrollen, was nicht pilotiert wurde. Jede Neuerung muss erst in einem begrenzten Rahmen funktionieren, bevor sie breit eingeführt wird." },
  { title: "People before Tools", desc: "Change-Readiness zuerst prüfen, dann Tool einführen. Wer das umdreht, bekommt ein Tool, das niemand nutzt. Die technische Einführung ist der einfache Teil." },
  { title: "Transparenz als Kultur", desc: "Status ist jederzeit sichtbar — für Geschäftsleitung, Abteilungen und IT. Kein separates Reporting-Theater, das Board ist das einzige lebende Dokument." },
  { title: "Entscheide dokumentieren", desc: "Was entschieden wurde, von wem, wann und warum. Kein Rätseln später, keine Revisionsmöglichkeit ohne Grundlage." },
];

const sprintPhases = [
  {
    icon: Target, title: "Sprint Planning", timing: "Woche 1 · 90 min",
    color: "bg-blue-600",
    who: "Verantwortlicher Digitalisierung + Themen-Owner",
    items: [
      "Sprint-Ziel in einem Satz formulieren — was wird am Ende dieser 4 Wochen vorliegen?",
      "Deliverables konkret festlegen — nicht Aktivitäten, sondern Ergebnisse",
      "Aufgaben im Board erfassen und Verantwortung zuweisen",
      "Abhängigkeiten klären — was braucht es von wem, bis wann?",
      "Risiken benennen — was könnte diesen Sprint gefährden?",
    ],
    output: "Befülltes Sprint Board mit Ziel, Tasks, Owners und Deadline.",
  },
  {
    icon: Zap, title: "Wöchentl. Check-in", timing: "W1–3 · 30 min",
    color: "bg-scnat-teal",
    who: "Verantwortlicher Digitalisierung + Themen-Owner",
    items: [
      "Was ist seit letzter Woche erledigt worden?",
      "Was ist blockiert — und was braucht es zum Entblocken?",
      "Was braucht einen Entscheid, der nicht auf Ebene Owner gelöst werden kann?",
    ],
    output: "Board wird live aktualisiert. Blocker werden direkt gelöst oder eskaliert.",
  },
  {
    icon: Users, title: "Stakeholder-Touchpoint", timing: "Woche 3 · 20 min · optional",
    color: "bg-amber-600",
    who: "Verantwortlicher Digitalisierung + Abteilungsleitung",
    items: [
      "Frühes Feedback der Abteilung einholen, bevor alles fixiert ist",
      "Offene Fragen klären, die den Sprint-Abschluss beeinflussen",
      "Kein Reporting, kein Status-Update — reines Arbeitstreffen",
    ],
    output: "Nur wenn konkreter Anlass besteht. Nicht erzwingen.",
  },
  {
    icon: BarChart, title: "Sprint Review + Retro", timing: "Woche 4 · 60 min",
    color: "bg-violet-600",
    who: "Verantwortlicher Digitalisierung + Owner (+ GL bei strategischen Sprints)",
    items: [
      "Was wurde geliefert — konkret und nachweisbar? Demo wenn möglich",
      "Was ist offen geblieben — und warum?",
      "Was hat gut funktioniert — was beibehalten?",
      "Was hat nicht funktioniert — was ändern?",
      "Ein konkreter Lernpunkt wird dokumentiert",
    ],
    output: "Sprint-Summary (1 Seite). Input für nächsten Sprint.",
  },
  {
    icon: Megaphone, title: "Kommunikation", timing: "Nach Review",
    color: "bg-amber-800",
    who: "Verantwortlicher Digitalisierung",
    items: [
      "Erst wenn Sprint-Review intern abgeschlossen ist, wird nach aussen kommuniziert",
      "Was wurde eingeführt oder geändert — konkret",
      "Was ändert sich für wen — nach Rolle und Abteilung",
      "Ab wann gilt die Änderung, wo gibt es Unterstützung",
    ],
    output: "Zielgruppenspezifische Kommunikation (Details im Change-Management).",
  },
];

const boardColumns = [
  { title: "Backlog", desc: "Alle Tasks des Sprints", color: "bg-muted" },
  { title: "In Bearbeitung", desc: "Max. 3 parallel pro Person", color: "bg-scnat-teal/20" },
  { title: "Blockiert", desc: "Braucht Entscheid oder Freigabe", color: "bg-scnat-red/20" },
  { title: "Erledigt", desc: "Abgenommen und dokumentiert", color: "bg-scnat-green/20" },
];

const changeQuestions = [
  "Wer ist betroffen? (Abteilung, Rolle, Anzahl Personen)",
  "Was ändert sich konkret? (Workflow, Tool, Verantwortung)",
  "Wieviel Widerstand ist realistisch? (niedrig / mittel / hoch)",
  "Wer ist der Change Agent in der Abteilung?",
  "Wann und wie kommunizieren wir? (Timing festlegen)",
  "Was brauchen die Leute? (Training, Dokumentation, Begleitung)",
];

const commTargets = [
  { group: "Betroffene MA", format: "Max. halbe Seite, Klartext", timing: "Nach Sprint-Review" },
  { group: "Abteilungsleitung", format: "Kurzes Briefing — vor Breitenkommunikation", timing: "2–3 Tage vorher" },
  { group: "GL / Vorstand", format: "Nur wenn strategisch relevant", timing: "Quartals-Update / ad hoc" },
  { group: "IT / Technik", format: "Technisch vollständig, direkt", timing: "Laufend" },
];

const traps = [
  { title: "Zu früh zu viel kommunizieren", desc: "Vor Spruchreife erzeugt Kommunikation nur Unsicherheit. Erst kommunizieren, wenn etwas entschieden und umsetzbar ist." },
  { title: "Einmal-Training statt Begleitung", desc: "Eine Schulungssession genügt nicht — Change Agent in der Abteilung sichert Begleitung im Alltag." },
  { title: "Keinen Change Agent identifiziert", desc: "Ohne internen Träger in der Abteilung bleibt die Veränderung hängen. Change Agent = 20–30 min/Woche." },
  { title: "Widerstand ignorieren", desc: "Im akademischen Umfeld ist kritische Haltung normal. Anhören, einbeziehen, nicht übergehen." },
];

const roles = [
  { role: "Verantwortlicher Digitalisierung", resp: "Gesamtverantwortung, Priorisierung, Entscheide freigeben, Blocker eskalieren", time: "Variabel" },
  { role: "Themen-Owner (je Cluster)", resp: "Sprint vorbereiten, Aufgaben koordinieren, Status berichten", time: "ca. 3–5 h/Woche" },
  { role: "Change Agent (je Abteilung)", resp: "Interner Multiplikator, Feedback geben, Kolleg:innen begleiten", time: "20–30 min/Woche" },
  { role: "Steering Committee", resp: "Quartalsweise Entscheide zu Prioritäten, Budget, Kurskorrektur", time: "60 min/Quartal" },
];

const meetings = [
  { name: "Sprint Planning", dur: "90 min", who: "Verantw. + Owner", freq: "Pro Sprint" },
  { name: "Weekly Check-in", dur: "30 min", who: "Verantw. + Owner", freq: "Wöchentlich" },
  { name: "Stakeholder-Touchpoint", dur: "20 min", who: "Verantw. + Abt.", freq: "Bei Bedarf (W3)" },
  { name: "Sprint Review + Retro", dur: "60 min", who: "Verantw. + Owner (+ GL)", freq: "Pro Sprint" },
  { name: "Steering Committee", dur: "60 min", who: "GL + Verantw.", freq: "Quartalsweise" },
];

const docs = [
  { name: "Sprint Board", desc: "Einziges lebendes Dokument im Sprint, täglich aktuell" },
  { name: "Entscheidungslog", desc: "3–5 Zeilen pro Eintrag: was, wer, wann, warum" },
  { name: "Sprint-Summary", desc: "1 Seite nach Review: was geliefert, was offen, nächster Sprint" },
  { name: "Quartals-Statusbericht", desc: "Für Steering Committee, alle Cluster auf einen Blick" },
];

function SectionCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`rounded-xl border border-border bg-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Expandable({ title, icon: Icon, color, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        {Icon && (
          <div className={`p-1.5 rounded-lg ${color || "bg-muted"} text-white shrink-0`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        <span className="flex-1 font-heading font-semibold text-foreground text-sm">{title}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Das Framework basiert auf <strong className="text-foreground">drei unabhängigen Rhythmus-Ebenen</strong>, die parallel laufen und jeweils eigene Outputs produzieren.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Strategie-Layer", sub: "alle 3 Monate", color: "border-l-scnat-red", items: ["Quartalsplanung mit GL & Steering Committee", "Priorisierung der Themen-Cluster", "Budget- und Ressourcenentscheide", "Kurskorrektur basierend auf Ergebnissen"] },
          { title: "Sprint-Layer", sub: "alle 4 Wochen", color: "border-l-scnat-teal", items: ["Je Themen-Cluster ein 4-Wochen-Sprint", "Max. 2–3 aktive Sprints gleichzeitig", "Themen-Owner koordiniert und berichtet"] },
          { title: "Ops-Layer", sub: "wöchentlich", color: "border-l-scnat-orange", items: ["Weekly Check-in: Blocker lösen", "Sprint Board wird aktuell gehalten", "Kein Status-Theater, nur Entscheidungsbedarf"] },
        ].map((layer) => (
          <SectionCard key={layer.title} className={`p-5 border-l-4 ${layer.color}`}>
            <h4 className="font-heading font-semibold text-foreground text-sm">{layer.title}</h4>
            <p className="text-[11px] text-muted-foreground mb-3">{layer.sub}</p>
            <ul className="space-y-1.5">
              {layer.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ChevronRight className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
        ))}
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Themen-Cluster</h3>
        <p className="text-xs text-muted-foreground mb-4">Jeder Cluster hat einen Owner aus der Fachseite. Der Verantwortliche Digitalisierung steuert den Gesamtrahmen.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {themenCluster.map((c) => (
            <div key={c.title} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50">
              <div className={`p-1.5 rounded-lg ${c.color} text-white shrink-0`}>
                <c.icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{c.title}</p>
                <p className="text-[11px] text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Grundprinzipien</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {principles.map((p) => (
            <div key={p.title} className="p-4 rounded-lg border border-border bg-card/50">
              <p className="text-xs font-bold text-foreground mb-1">{p.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Interactive Sprint Cycle ── */
const CYCLE_STEPS = [
  { id: 'planning', label: 'Sprint\nPlanning', angle: -90, color: '#2563EB', icon: '📋', week: 'W1', detail: 'Ziel setzen, Deliverables definieren, Board befüllen, Risiken klären.' },
  { id: 'checkin1', label: 'Check-in', angle: -36, color: '#14B8A6', icon: '⚡', week: 'W1', detail: 'Fortschritt prüfen, Blocker lösen, Board aktualisieren.' },
  { id: 'checkin2', label: 'Check-in', angle: 18, color: '#14B8A6', icon: '⚡', week: 'W2', detail: 'Fortschritt prüfen, Blocker lösen, Board aktualisieren.' },
  { id: 'stakeholder', label: 'Stakeholder\nTouchpoint', angle: 72, color: '#D97706', icon: '👥', week: 'W3', detail: 'Frühes Feedback einholen, offene Fragen klären. Optional.' },
  { id: 'review', label: 'Review\n+ Retro', angle: 126, color: '#7C3AED', icon: '📊', week: 'W4', detail: 'Was geliefert? Was offen? Was gelernt? Sprint-Summary erstellen.' },
  { id: 'komm', label: 'Kommu-\nnikation', angle: 180, color: '#92400E', icon: '📢', week: 'Nach W4', detail: 'Zielgruppenspezifisch kommunizieren: was, für wen, ab wann.' },
];

function InteractiveSprintCycle() {
  const [active, setActive] = useState(null);
  const cx = 200, cy = 200, R = 140, nodeR = 32;

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      <div className="bg-bg-surface border border-bd-faint rounded-xl p-4 overflow-x-auto flex-shrink-0 w-full lg:w-auto">
        <svg viewBox="0 0 400 400" className="w-full max-w-[340px] sm:max-w-[380px] mx-auto" style={{ overflow: 'visible' }}>
          {/* Center ring */}
          <circle cx={cx} cy={cy} r={R - 10} fill="none" style={{ stroke: 'var(--border-default)' }} strokeWidth="1" strokeDasharray="6,4" />
          <circle cx={cx} cy={cy} r={50} style={{ fill: 'var(--bg-base)', stroke: 'var(--border-default)' }} strokeWidth="1.5" />
          <text x={cx} y={cy - 8} textAnchor="middle" style={{ fill: 'var(--text-primary)' }} fontSize="11" fontWeight="700" fontFamily="DM Sans">4-Wochen</text>
          <text x={cx} y={cy + 8} textAnchor="middle" style={{ fill: 'var(--text-secondary)' }} fontSize="10" fontFamily="DM Sans">Sprint</text>

          {/* Connection arrows */}
          {CYCLE_STEPS.map((step, i) => {
            const next = CYCLE_STEPS[(i + 1) % CYCLE_STEPS.length];
            const rad1 = (step.angle * Math.PI) / 180;
            const rad2 = (next.angle * Math.PI) / 180;
            const x1 = cx + Math.cos(rad1) * (R - 10);
            const y1 = cy + Math.sin(rad1) * (R - 10);
            const x2 = cx + Math.cos(rad2) * (R - 10);
            const y2 = cy + Math.sin(rad2) * (R - 10);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const pullX = cx + (midX - cx) * 0.75;
            const pullY = cy + (midY - cy) * 0.75;
            return (
              <path
                key={`arc-${i}`}
                d={`M${x1},${y1} Q${pullX},${pullY} ${x2},${y2}`}
                fill="none"
                style={{ stroke: 'var(--border-default)' }}
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Nodes */}
          {CYCLE_STEPS.map((step) => {
            const rad = (step.angle * Math.PI) / 180;
            const x = cx + Math.cos(rad) * R;
            const y = cy + Math.sin(rad) * R;
            const isActive = active === step.id;
            return (
              <g
                key={step.id}
                onClick={() => setActive(active === step.id ? null : step.id)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={x} cy={y} r={nodeR}
                  fill={isActive ? step.color : `${step.color}22`}
                  stroke={step.color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <text x={x} y={y - 5} textAnchor="middle" style={{ fill: isActive ? '#fff' : 'var(--text-primary)' }} fontSize="8" fontWeight="600" fontFamily="DM Sans">
                  {step.label.split('\n').map((line, li) => (
                    <tspan key={li} x={x} dy={li === 0 ? 0 : 11}>{line}</tspan>
                  ))}
                </text>
                <text x={x} y={y + nodeR + 14} textAnchor="middle" style={{ fill: 'var(--text-secondary)' }} fontSize="9" fontFamily="DM Sans">{step.week}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {active ? (
          (() => {
            const step = CYCLE_STEPS.find(s => s.id === active);
            const phase = sprintPhases.find(p =>
              p.title.toLowerCase().includes(step.label.split('\n')[0].toLowerCase().replace('-', ''))
            );
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${step.color}22` }}>
                    {step.icon}
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-foreground text-sm">{step.label.replace('\n', ' ')}</h4>
                    <p className="text-[11px] text-muted-foreground">{step.week}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{step.detail}</p>
                {phase && (
                  <>
                    <p className="text-[11px] text-muted-foreground mb-2"><strong>Teilnehmer:</strong> {phase.who}</p>
                    <ul className="space-y-1.5 mb-3">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5 text-scnat-green mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <p className="text-[11px] text-muted-foreground"><strong className="text-foreground">Output:</strong> {phase.output}</p>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })()
        ) : (
          <div className="bg-card/50 border border-border rounded-xl p-5 text-center">
            <RotateCw className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Klicke auf einen Schritt im Zyklus, um Details zu sehen.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Jeder Themen-Cluster durchläuft diesen 4-Wochen-Rhythmus.</p>
          </div>
        )}

        {/* Sprint Board always visible */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Sprint Board (minimal)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {boardColumns.map((col) => (
              <div key={col.title} className={`p-3 rounded-lg ${col.color} border border-border`}>
                <p className="text-xs font-bold text-foreground mb-1">{col.title}</p>
                <p className="text-[11px] text-muted-foreground">{col.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            <strong>Tool-Empfehlung:</strong> Planka (Open Source, selbst gehostet) oder Notion — kein Overhead, kein Jira-Trauma.
          </p>
        </div>
      </div>
    </div>
  );
}

function SprintSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Der Sprint-Zyklus ist der operative Kern. Jeder Themen-Cluster durchläuft diesen 4-Wochen-Zyklus; die Schritte sind immer dieselben.
      </p>
      <InteractiveSprintCycle />
    </div>
  );
}

function ChangeSection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Change-Management ist kein separates Projektthema, sondern <strong className="text-foreground">eingebaut in jeden Sprint</strong>. Die Fragen werden vor Sprint-Start beantwortet — nicht am Ende.
      </p>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Change-Readiness vor jedem Sprint</h3>
        <div className="space-y-2">
          {changeQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50">
              <span className="w-6 h-6 rounded-full bg-scnat-red/10 text-scnat-red text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-xs text-muted-foreground pt-0.5">{q}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-2">Kommunikation nach Zielgruppe</h3>
        <p className="text-xs text-muted-foreground mb-3">Kein Rundmail an alle. Zielgruppenspezifisch:</p>
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Zielgruppe</th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Format & Inhalt</th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Timing</th>
              </tr>
            </thead>
            <tbody>
              {commTargets.map((t, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-foreground">{t.group}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{t.format}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{t.timing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Häufige Fallen im akademischen Umfeld</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {traps.map((t) => (
            <div key={t.title} className="p-4 rounded-lg border border-scnat-orange/20 bg-scnat-orange/5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-scnat-orange" />
                <p className="text-xs font-bold text-foreground">{t.title}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuarterlySection() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Das Quarterly ist das einzige Meeting, wo gemeinsam mit der Geschäftsleitung Prioritäten gesetzt werden — und damit der Rahmen für alle Sprints der nächsten drei Monate festgelegt wird.
      </p>
      <SectionCard className="p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Vorbereitung (1 Woche vorher)</h3>
        <p className="text-xs text-muted-foreground mb-3">Der Verantwortliche Digitalisierung bereitet vor:</p>
        <ul className="space-y-2">
          {[
            "Status aller Cluster aus dem letzten Quartal: was geliefert, was offen, was verzögert und warum",
            "Vorschlag Prioritäten nächstes Quartal — pro Cluster klare Empfehlung (aktiv / pausiert / abgeschlossen)",
            "Offene Entscheide, die die GL treffen muss: Budget, Ressourcen, strategische Richtung",
            "Risiken und Abhängigkeiten, die auf GL-Ebene sichtbar sein müssen",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-scnat-teal mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[11px] text-muted-foreground/70 mt-3 italic">
          Format: max. 2 Seiten oder 10 Minuten Präsentation. Kein 30-Folien-Deck.
        </p>
      </SectionCard>
      <SectionCard className="p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-4">Ablauf Steering Committee (60 min)</h3>
        <div className="space-y-3">
          {[
            { time: "15 min", title: "Rückblick", desc: "Was wurde im letzten Quartal geliefert? Fakten, kein Schönreden. Probleme kurz erklären." },
            { time: "30 min", title: "Prioritäten nächstes Quartal", desc: "Vorschlag besprechen, gemeinsam entscheiden — Cluster aktiv/pausiert, Budget klären. Entscheide dokumentieren." },
            { time: "15 min", title: "Offene Punkte", desc: "Was braucht der Verantwortliche von der GL bis wann. Was kommuniziert die GL intern." },
          ].map((block) => (
            <div key={block.title} className="flex gap-4 p-3 rounded-lg border border-border bg-muted/30">
              <div className="shrink-0">
                <span className="inline-flex items-center px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold">{block.time}</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground mb-0.5">{block.title}</p>
                <p className="text-[11px] text-muted-foreground">{block.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard className="p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Output des Meetings</h3>
        <div className="space-y-2">
          {[
            "Priorisierter Cluster-Plan für das Quartal (welche Themen laufen, welche pausieren)",
            "Entscheidungslog mit allen getroffenen Beschlüssen",
            "Kurze interne Kommunikation der GL an Abteilungsleitungen",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-scnat-green mt-0.5 shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-[11px] text-muted-foreground">
            <strong className="text-foreground">Rhythmus:</strong> Alle 13 Wochen — idealerweise ein fixer Termin (z.B. letzter Montag im Quartal). Zwischen den Quartalsmeetings gibt es keinen weiteren GL-Kontakt, ausser bei GL-relevanten Sprint Reviews oder eskalierten Blockern.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

function GovernanceSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Rollen</h3>
        <div className="space-y-2">
          {roles.map((r) => (
            <div key={r.role} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-lg border border-border bg-card/50">
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">{r.role}</p>
                <p className="text-[11px] text-muted-foreground">{r.resp}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-[10px] font-medium text-muted-foreground shrink-0">
                <Clock className="w-3 h-3" />
                {r.time}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Alle Meetings auf einen Blick</h3>
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Meeting</th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Dauer</th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground hidden sm:table-cell">Teilnehmer</th>
                <th className="text-left px-4 py-2.5 font-semibold text-foreground">Frequenz</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m, i) => (
                <tr key={i} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium text-foreground">{m.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.dur}</td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell">{m.who}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{m.freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Meeting-Overhead bei 2 aktiven Sprints: ca. <strong>3 Stunden pro Woche</strong>. Alles andere läuft asynchron über das Board.
        </p>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground text-sm mb-3">Dokumente — nur was wirklich nützt</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {docs.map((d) => (
            <div key={d.name} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50">
              <FileText className="w-4 h-4 text-scnat-teal shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-foreground">{d.name}</p>
                <p className="text-[11px] text-muted-foreground">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Change-Vorschlag einreichen ── */
const READINESS_FIELDS = [
  { key: 'betroffen', label: 'Wer ist betroffen?', placeholder: 'Abteilung, Rolle, Anzahl Personen', type: 'textarea' },
  { key: 'aenderung', label: 'Was ändert sich konkret?', placeholder: 'Workflow, Tool, Verantwortung', type: 'textarea' },
  { key: 'widerstand', label: 'Erwarteter Widerstand', placeholder: '', type: 'select', options: ['niedrig', 'mittel', 'hoch'] },
  { key: 'changeAgent', label: 'Change Agent in der Abteilung', placeholder: 'Falls bekannt — wer kann intern begleiten?', type: 'text' },
  { key: 'kommunikation', label: 'Wie und wann kommunizieren?', placeholder: 'Timing, Format, Kanal', type: 'textarea' },
  { key: 'bedarf', label: 'Was brauchen die Betroffenen?', placeholder: 'Training, Dokumentation, Begleitung', type: 'textarea' },
];

function VorschlagSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    titel: '', beschreibung: '',
    kontakt: user?.name || '', kontaktEmail: user?.email || '',
    zustaendigerAgent: '',
    readiness: { betroffen: '', aenderung: '', widerstand: 'mittel', changeAgent: '', kommunikation: '', bedarf: '' },
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const updateReadiness = (key, val) => setForm(prev => ({ ...prev, readiness: { ...prev.readiness, [key]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/changes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Fehler');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto p-8 rounded-xl border border-scnat-green/30 bg-scnat-green/5 text-center">
        <CheckCircle2 className="w-12 h-12 text-scnat-green mx-auto mb-4" />
        <h3 className="font-heading font-bold text-foreground text-lg mb-2">Change-Vorschlag eingereicht!</h3>
        <p className="text-sm text-muted-foreground mb-4">Dein Vorschlag wird vom Digitalisierungsteam geprüft und kann in den Massnahmenkatalog aufgenommen werden.</p>
        <button
          onClick={() => { setSuccess(false); setForm({ titel: '', beschreibung: '', kontakt: user?.name || '', kontaktEmail: user?.email || '', zustaendigerAgent: '', readiness: { betroffen: '', aenderung: '', widerstand: 'mittel', changeAgent: '', kommunikation: '', bedarf: '' } }); }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-scnat-darkred transition-colors"
        >
          Weiteren Vorschlag einreichen
        </button>
      </motion.div>
    );
  }

  const cls = "w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  return (
    <div className="space-y-6">
      <div className="bg-scnat-teal/5 border border-scnat-teal/20 rounded-xl p-5">
        <h3 className="font-heading font-semibold text-foreground text-sm mb-2">Change-Vorschlag einreichen</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Du hast eine Idee für eine Veränderung oder Verbesserung? Hier kannst du einen Vorschlag einreichen, der vom Digitalisierungsteam geprüft wird. 
          Die <strong className="text-foreground">Readiness-Fragen</strong> helfen dabei, den Vorschlag realistisch einzuschätzen und die Umsetzung vorzubereiten. 
          Wenn der Vorschlag angenommen wird, fliesst er in den Massnahmenkatalog ein.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        {error && <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-sm px-4 py-2 rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Name <span className="text-primary">*</span></label>
            <input value={form.kontakt} onChange={e => setForm({ ...form, kontakt: e.target.value })} required className={cls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">E-Mail <span className="text-primary">*</span></label>
            <input type="email" value={form.kontaktEmail} onChange={e => setForm({ ...form, kontaktEmail: e.target.value })} required className={cls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Titel des Vorschlags <span className="text-primary">*</span></label>
          <input value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })} required placeholder="Kurz und prägnant — was soll sich ändern?" className={cls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Beschreibung <span className="text-primary">*</span></label>
          <textarea value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} required rows={3} placeholder="Was genau soll geändert werden? Warum? Welches Problem wird gelöst?" className={cls} />
        </div>

        <div className="border border-border rounded-xl p-5">
          <h4 className="font-heading font-semibold text-foreground text-sm mb-1">Change-Readiness Assessment</h4>
          <p className="text-xs text-muted-foreground mb-4">Diese Fragen helfen dem Team, den Vorschlag einzuordnen und die Umsetzung realistisch zu planen.</p>
          <div className="space-y-4">
            {READINESS_FIELDS.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea value={form.readiness[f.key]} onChange={e => updateReadiness(f.key, e.target.value)} rows={2} placeholder={f.placeholder} className={cls} />
                ) : f.type === 'select' ? (
                  <select value={form.readiness[f.key]} onChange={e => updateReadiness(f.key, e.target.value)} className={cls}>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={form.readiness[f.key]} onChange={e => updateReadiness(f.key, e.target.value)} placeholder={f.placeholder} className={cls} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Zuständiger Change Agent (optional)</label>
          <input value={form.zustaendigerAgent} onChange={e => setForm({ ...form, zustaendigerAgent: e.target.value })} placeholder="Falls bekannt — wer könnte die Umsetzung begleiten?" className={cls} />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-scnat-darkred transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Wird eingereicht…' : 'Vorschlag einreichen'}
        </button>
      </form>
    </div>
  );
}

const SECTION_CONTENT = {
  overview: OverviewSection,
  sprint: SprintSection,
  change: ChangeSection,
  quarterly: QuarterlySection,
  governance: GovernanceSection,
  vorschlag: VorschlagSection,
};

export default function PmFramework({ initialSection }) {
  const [activeSection, setActiveSection] = useState(initialSection || "overview");
  const Content = SECTION_CONTENT[activeSection];

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-lg bg-scnat-teal/10 text-scnat-teal">
          <RotateCw className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">PM-Framework & Sprint-Design</h2>
          <p className="text-sm text-muted-foreground">Lean-Agile für akademische Organisationen</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-6">Version 1.0 — 7.4.2026 · Erstellt für Silvan, Verantwortlicher Digitalisierung</p>

      <div className="flex flex-wrap gap-1.5 p-1 bg-muted rounded-xl mb-8 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              activeSection === s.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Content />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
