import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppWindow, Lightbulb, ArrowRight, CheckCircle2, Heart,
  Network, Users, Workflow, MessageSquare, Sparkles, Shield,
  Gauge, Compass, ChevronRight, UserCheck, Send, HelpCircle,
} from "lucide-react";
import PmFramework from "../components/prozesse/PmFramework";
import PageHeader from "../components/PageHeader";

const TABS = [
  { id: "einstieg", label: "Wegweiser · Ideen einreichen" },
  { id: "pm", label: "PM-Framework & Sprints" },
];

/* Warum-Prinzipien: was Anforderungsmanagement leistet */
const WHY_POINTS = [
  {
    icon: Gauge,
    title: "Geschwindigkeit",
    desc: "Strukturierte Anfragen werden schneller bearbeitet. Kein Hin-und-Her, keine verlorenen Mails.",
    color: "bg-scnat-teal",
  },
  {
    icon: Sparkles,
    title: "Qualität",
    desc: "Vor der Umsetzung werden Bedarf, Alternativen und Risiken sauber geklärt — für bessere Lösungen.",
    color: "bg-scnat-orange",
  },
  {
    icon: Shield,
    title: "Transparenz",
    desc: "Alle sehen, was läuft: Status, Entscheide, Verantwortliche. Keine Black-Box-Prozesse mehr.",
    color: "bg-scnat-green",
  },
  {
    icon: Users,
    title: "Gemeinsam tragen",
    desc: "Change Agents, Abteilungen, GL und IT werden früh einbezogen — Veränderung wird mitgetragen.",
    color: "bg-scnat-red",
  },
];

/* Entscheidungspfade */
const PATHS = {
  software: {
    id: "software",
    icon: AppWindow,
    color: "bg-scnat-cyan",
    accent: "border-scnat-cyan/40 bg-scnat-cyan/5",
    title: "Software / Tool",
    short: "Ich wünsche mir ein neues Tool, eine App oder Software.",
    steps: [
      {
        title: "Zuerst prüfen: Existiert bereits etwas?",
        desc: "Schau in Software & Co, ob wir das Bedürfnis nicht schon mit einem bestehenden Tool abdecken können — das spart Zeit, Kosten und Schulungsaufwand.",
        action: { label: "Zu Software & Co", to: "/systemlandschaft" },
      },
      {
        title: "Gibt es bereits Wünsche von anderen?",
        desc: "Weiter unten auf Software & Co findest du das Wunsch-Ranking. Wenn dein Tool schon dort steht: like es, damit wir die Dringlichkeit sehen. Wenn nicht: reiche es ein.",
        action: { label: "Wünsche & Ranking ansehen", to: "/systemlandschaft#wunschliste" },
      },
      {
        title: "Mit Change Agent abstimmen (empfohlen)",
        desc: "Dein Change Agent kennt die Abteilung — oft gibt es schon eine Diskussion dazu oder ähnliche Bedürfnisse von Kolleg:innen.",
        action: { label: "Change Agents finden", to: "/team" },
      },
      {
        title: "Antrag einreichen",
        desc: "Kurzes Formular: Was, warum, für wen, Kosten-Schätzung, Personendaten. Silvan prüft, klärt mit IT und GL und kommt zurück.",
        action: { label: "Software beantragen", to: "/software-antraege", primary: true },
      },
    ],
  },
  change: {
    id: "change",
    icon: Lightbulb,
    color: "bg-scnat-orange",
    accent: "border-scnat-orange/40 bg-scnat-orange/5",
    title: "Idee / Change / Verbesserung",
    short: "Ich habe eine Idee für einen Prozess, einen Ablauf oder eine Verbesserung.",
    steps: [
      {
        title: "Kurz einlesen: Wie funktioniert unser PM-Framework?",
        desc: "Im PM-Framework steht, wie wir Changes ein­planen (Sprints, Themen-Cluster, Quartalsplanung). Das hilft dir, deine Idee einzuordnen.",
        action: { label: "PM-Framework ansehen", to: "/prozesse?tab=change" },
      },
      {
        title: "Mit deinem Change Agent sprechen",
        desc: "Er/sie ist der/die interne Multiplikator:in und kennt den Alltag in deiner Abteilung. Oft entstehen daraus gleich konkrete Verbesserungen oder gemeinsame Vorschläge.",
        action: { label: "Change Agents finden", to: "/team" },
      },
      {
        title: "Gibt es schon eine Massnahme dazu?",
        desc: "Schau kurz im Massnahmenkatalog — vielleicht läuft bereits etwas Passendes, dem man sich anschliessen kann.",
        action: { label: "Massnahmen durchsuchen", to: "/massnahmen" },
      },
      {
        title: "Change-Vorschlag einreichen",
        desc: "Kurzes Formular mit Readiness-Fragen (Wer ist betroffen? Was ändert sich? Was braucht es?). Wird vom Digitalisierungsteam geprüft und ggf. in den Massnahmenkatalog aufgenommen.",
        action: { label: "Change einreichen", to: "/prozesse?tab=change&section=vorschlag", primary: true },
      },
    ],
  },
};

/* Wie läuft es nach Einreichung? */
const FLOW_STEPS = [
  {
    icon: Compass,
    title: "Du reichst ein",
    desc: "Über die Plattform — idealerweise nach kurzem Austausch mit deinem Change Agent.",
    color: "bg-scnat-cyan",
  },
  {
    icon: UserCheck,
    title: "Silvan analysiert & strukturiert",
    desc: "Prüft Bedarf, sichtet Alternativen, ordnet in die Roadmap ein.",
    color: "bg-scnat-red",
  },
  {
    icon: MessageSquare,
    title: "Abstimmung",
    desc: "Mit Change Agents, Abteilungsleitungen, GL und IT — je nach Thema.",
    color: "bg-scnat-teal",
  },
  {
    icon: CheckCircle2,
    title: "Entscheid & Umsetzung",
    desc: "Entscheid wird dokumentiert, Umsetzung in Sprint eingeplant, Kommunikation zielgruppengerecht.",
    color: "bg-scnat-green",
  },
];

function PathCard({ path, active, onClick }) {
  const Icon = path.icon;
  return (
    <button
      onClick={onClick}
      className={`group text-left p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
        active
          ? `${path.accent} border-current shadow-lg`
          : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${path.color} text-white shrink-0 transition-transform group-hover:scale-105`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-foreground text-base sm:text-lg mb-1">{path.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{path.short}</p>
          <div className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold ${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}>
            {active ? "Ausgewählt" : "Diesen Weg wählen"}
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </button>
  );
}

function StepItem({ step, index, total }) {
  const isInternalLink = step.action?.to?.startsWith("/");
  const LinkCmp = isInternalLink ? Link : "a";
  const linkProps = isInternalLink
    ? { to: step.action.to }
    : { href: step.action.to, target: "_blank", rel: "noopener noreferrer" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="relative pl-10 pb-6 last:pb-0"
    >
      {index < total - 1 && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
      )}
      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center">
        <span className="text-xs font-bold text-primary">{index + 1}</span>
      </div>
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5">
        <h4 className="font-heading font-semibold text-foreground text-sm sm:text-base mb-1">{step.title}</h4>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">{step.desc}</p>
        {step.action && (
          <LinkCmp
            {...linkProps}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 transition-colors ${
              step.action.primary
                ? "bg-primary text-primary-foreground hover:bg-scnat-darkred"
                : "bg-muted text-foreground hover:bg-muted/70"
            }`}
          >
            {step.action.primary && <Send className="w-3.5 h-3.5" />}
            {step.action.label}
            <ArrowRight className="w-3.5 h-3.5" />
          </LinkCmp>
        )}
      </div>
    </motion.div>
  );
}

function EinstiegTab() {
  const [pathId, setPathId] = useState(null);
  const path = pathId ? PATHS[pathId] : null;

  return (
    <div className="space-y-16">
      {/* ── INTRO ──────────────────────────────── */}
      <section>
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scnat-red/10 text-scnat-red text-xs font-semibold mb-4">
            <Compass className="w-3.5 h-3.5" />
            Einstieg
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-4 leading-tight">
            Dein Wegweiser für Software-Wünsche & Change-Ideen
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Diese Plattform ist <strong className="text-foreground">deine erste Anlaufstelle</strong>, wenn du dir neue Tools wünschst
            oder Ideen für Verbesserungen hast. Idealerweise besprichst du dein Anliegen zuerst
            kurz mit deinem <strong className="text-foreground">Change Agent</strong> in der Abteilung — dann kommst du hier rein,
            reichst strukturiert ein, und es geht los.
          </p>
        </div>
      </section>

      {/* ── WAS IST ANFORDERUNGSMANAGEMENT? ─────── */}
      <section>
        <div className="rounded-3xl bg-gradient-to-br from-scnat-red/5 via-scnat-orange/5 to-scnat-teal/5 border border-border p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-2">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground w-fit mb-4">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-3 leading-tight">
                Was ist Anforderungs­management?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Anforderungs­management — bei uns gelebt als <strong className="text-foreground">Change-Management</strong> —
                ist der strukturierte Weg, wie aus einer Idee oder einem Bedürfnis eine
                umgesetzte, akzeptierte und dokumentierte Lösung wird.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Kurz: <em>Zuhören · Verstehen · Einordnen · Gemeinsam entscheiden · Sauber umsetzen · Nachvollziehbar kommunizieren.</em>
              </p>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHY_POINTS.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className={`p-1.5 rounded-lg ${p.color} text-white w-fit mb-2`}>
                    <p.icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-heading font-semibold text-foreground text-sm mb-1">{p.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WIE LÄUFT ES AB? ──────────────────── */}
      <section>
        <div className="mb-6">
          <h3 className="text-xl font-heading font-bold text-foreground mb-2">So läuft es ab — von der Idee zur Umsetzung</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Neu läuft <strong className="text-foreground">alles zentral über Silvan</strong>, Verantwortlicher Digitalisierung.
            Er analysiert, strukturiert, prüft und stimmt mit Change Agents, Abteilungs­leitungen, GL und IT ab —
            damit wir für alle die bestmögliche Lösung finden.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {FLOW_STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="relative p-5 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${s.color} text-white shrink-0`}>
                  <s.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                  Schritt {i + 1}
                </span>
              </div>
              <h4 className="font-heading font-semibold text-foreground text-sm mb-1.5">{s.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              {i < FLOW_STEPS.length - 1 && (
                <ChevronRight className="hidden md:block absolute -right-[9px] top-1/2 -translate-y-1/2 w-4 h-4 text-border bg-background" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INTERAKTIVER WEGWEISER ───────────── */}
      <section>
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Interaktiver Wegweiser
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground mb-2">Was möchtest du einreichen?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            Wähle deinen Pfad — wir führen dich Schritt für Schritt durch. Keine Sorge: keine Frage ist zu klein.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.values(PATHS).map((p) => (
            <PathCard key={p.id} path={p} active={pathId === p.id} onClick={() => setPathId(pathId === p.id ? null : p.id)} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {path && (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl border-2 p-5 sm:p-7 ${path.accent}`}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2 rounded-lg ${path.color} text-white`}>
                  <path.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Dein Weg</p>
                  <h4 className="font-heading font-bold text-foreground text-base">{path.title}</h4>
                </div>
              </div>
              <div>
                {path.steps.map((step, i) => (
                  <StepItem key={i} step={step} index={i} total={path.steps.length} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!path && (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <Compass className="w-6 h-6 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Wähle oben einen Pfad, um die konkreten Schritte zu sehen.</p>
          </div>
        )}
      </section>

      {/* ── CHANGE AGENT HINWEIS ──────────────── */}
      <section>
        <div className="rounded-2xl bg-gradient-to-br from-scnat-red/5 to-scnat-teal/5 border border-border p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-scnat-red/10 text-scnat-red shrink-0">
              <Heart className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-heading font-bold text-foreground mb-2">Warum zuerst der Change Agent?</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-3xl">
                Change Agents kennen die Abteilung, die Kolleg:innen und den Alltag. Oft entsteht aus
                einem kurzen Gespräch mehr als aus einem langen Formular: ähnliche Bedürfnisse werden
                sichtbar, Lösungen präziser, Umsetzung leichter. Je besser wir zu Beginn abgestimmt sind,
                desto schneller und besser wird das Ergebnis — für alle.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/team"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-scnat-darkred transition-colors text-sm"
                >
                  <Users className="w-4 h-4" />
                  Change Agents & Team
                </Link>
                <Link
                  to="/prozesse?tab=change"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors text-sm"
                >
                  <Workflow className="w-4 h-4" />
                  Mehr zum PM-Framework
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHNELL-ACTIONS AM ENDE ─────────── */}
      <section>
        <div className="mb-5">
          <h3 className="text-lg font-heading font-bold text-foreground mb-1">Direkt loslegen</h3>
          <p className="text-sm text-muted-foreground">Kurze Wege zu den wichtigsten Anlaufstellen.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink to="/systemlandschaft" icon={Network} color="bg-scnat-cyan" title="Software & Co" desc="Tools & Wünsche ansehen" />
          <QuickLink to="/software-antraege" icon={AppWindow} color="bg-scnat-red" title="Software beantragen" desc="Neuen Antrag einreichen" />
          <QuickLink to="/prozesse?tab=change&section=vorschlag" icon={Lightbulb} color="bg-scnat-orange" title="Change einreichen" desc="Idee oder Verbesserung" />
          <QuickLink to="/team" icon={Users} color="bg-scnat-teal" title="Change Agents" desc="Ansprechpersonen finden" />
        </div>
      </section>
    </div>
  );
}

function QuickLink({ to, icon: Icon, color, title, desc }) {
  return (
    <Link
      to={to}
      className="group p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className={`p-2 rounded-lg ${color} text-white w-fit mb-3 transition-transform group-hover:scale-105`}>
        <Icon className="w-4 h-4" />
      </div>
      <h4 className="font-heading font-semibold text-foreground text-sm mb-0.5">{title}</h4>
      <p className="text-xs text-muted-foreground mb-2">{desc}</p>
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary group-hover:gap-1.5 transition-all">
        Öffnen <ArrowRight className="w-3 h-3" />
      </span>
    </Link>
  );
}

export default function Prozesse() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const startTab = tabParam === "change" ? "pm" : "einstieg";
  const sectionParam = searchParams.get("section");
  const startSection = sectionParam || (tabParam === "change" ? "change" : null);
  const [activeTab, setActiveTab] = useState(startTab);

  return (
    <div>
      <PageHeader
        title="Prozesse"
        subtitle="Wie du Ideen, Wünsche und Changes einreichst — und wie wir sie gemeinsam umsetzen."
        breadcrumb={[{ label: "Prozesse" }]}
        seed={11}
        accentColor="#F07800"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-10 w-full sm:w-fit overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "einstieg" && <EinstiegTab />}
          {activeTab === "pm" && <PmFramework initialSection={startSection} />}
        </motion.div>
      </div>
    </div>
  );
}
