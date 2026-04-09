import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Target, Map, Flag, FileText, Table2, Layout, Bot, BookOpen, GitBranch, Download, ExternalLink, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import VisionHouse from "@/components/vision/VisionHouse";
import ActionFieldDetail from "@/components/vision/ActionFieldDetail";
import StrategyTimeline from "@/components/strategy/StrategyTimeline";
import RolesCards from "@/components/strategy/RolesCards";
import PageHeader from "@/components/PageHeader";

const visionCards = [
  {
    icon: Target,
    label: "Vision",
    color: "#EA515A",
    back: "\"Digitalisierung vereinfacht.\" – Die kurze, von der GL gewählte Variante. Einfach, direkt, unmissverständlich.",
  },
  {
    icon: Map,
    label: "Langfristige Vision",
    color: "#006482",
    back: "\"Wir gestalten die vernetzte und digitale SCNAT der Zukunft.\" – Vollständige strategische Vision.",
  },
  {
    icon: Flag,
    label: "Oberziel",
    color: "#00836f",
    back: "Die SCNAT stärker als nationale Plattform für naturwissenschaftliche Fachgemeinschaften und den Dialog mit Politik und Gesellschaft entfalten.",
  },
];

const topGoals = [
  "Betriebliche Effizienz",
  "Interaktion mit dem Netzwerk",
  "IT-Sicherheit",
];

const documents = [
  { title: "Digitalisierungsstrategie SCNAT", type: "PDF", icon: FileText, status: "intern" },
  { title: "Zielkatalog & Massnahmen", type: "Excel", icon: Table2, status: "intern" },
  { title: "Massnahmen Canvas Vorlage", type: "PDF", icon: Layout, status: "intern" },
  { title: "KI-Rahmen SCNAT", type: "PDF", icon: Bot, status: "verfügbar", href: "/ki-hub" },
  { title: "Glossar Digitale Transformation", type: "PDF", icon: BookOpen, status: "verfügbar", href: "/glossar" },
  { title: "PM-Framework v1.0", type: "PDF", icon: GitBranch, status: "verfügbar", href: "/prozesse" },
];

function FlipCard({ card }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = card.icon;

  return (
    <div className="perspective-1000 h-48 cursor-pointer" onClick={() => setFlipped(!flipped)}>
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-xl border flex flex-col items-center justify-center gap-3 p-6 backface-hidden"
          style={{ backfaceVisibility: "hidden", borderColor: `${card.color}30` }}
        >
          <div className="p-3 rounded-xl text-white" style={{ background: card.color }}>
            <Icon className="w-6 h-6" />
          </div>
          <p className="font-heading font-bold text-foreground text-sm">{card.label}</p>
          <p className="text-[10px] text-muted-foreground">Klick zum Umdrehen</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-xl border p-5 flex items-center backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderColor: `${card.color}30`, background: `${card.color}08` }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed">{card.back}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Strategie() {
  const [selectedPillar, setSelectedPillar] = useState(null);
  const { toast } = useToast();

  const handleDocClick = (doc) => {
    if (doc.status === "intern") {
      toast({ title: "Dokument intern", description: `"${doc.title}" wird in Kürze über das Portal verfügbar sein.` });
    }
  };

  return (
    <div>
      <PageHeader
        title="Digitalisierungsstrategie SCNAT"
        subtitle="Das strategische Zielbild für die digitale Transformation der Akademie der Naturwissenschaften Schweiz."
        breadcrumb={[{ label: 'Strategie' }]}
        badges={[
          { label: 'Version 1.0 · Erarbeitet 2025' },
          { label: 'GL-verabschiedet' },
          { label: 'Interne Strategie', variant: 'red' },
        ]}
        seed={77}
        accentColor="#EA515A"
      />

      {/* Section 2: Vision & Ziele */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Vision & Ziele</h2>
          <p className="text-muted-foreground text-sm">Klick auf eine Karte zum Umdrehen.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          {visionCards.map((card) => (
            <FlipCard key={card.label} card={card} />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {topGoals.map((goal) => (
            <span key={goal} className="px-4 py-2 rounded-full bg-muted border border-border text-sm font-medium text-foreground">
              {goal}
            </span>
          ))}
        </div>
      </section>

      {/* Section 3: Strategie-Haus (full width) */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Das Zielbild – so ist die Strategie aufgebaut
            </h2>
            <p className="text-muted-foreground text-sm">Klick auf ein Handlungsfeld für Details.</p>
          </div>

          <VisionHouse selected={selectedPillar} onSelect={setSelectedPillar} />

          <div className="mt-6 max-w-xl mx-auto">
            <ActionFieldDetail selectedId={selectedPillar} />
          </div>
        </div>
      </section>

      {/* Section 4: Strategieprozess Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            Strategieprozess
          </h2>
          <p className="text-muted-foreground text-sm">Vier Phasen von der Analyse bis zur Umsetzung.</p>
        </div>
        <StrategyTimeline />
      </section>

      {/* Section 5: Rollen */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Rollen in der Umsetzung
            </h2>
            <p className="text-muted-foreground text-sm">Wer macht was in der digitalen Transformation.</p>
          </div>
          <RolesCards />
        </div>
      </section>

      {/* Section 6: Dokumente & Ressourcen */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
            Dokumente & Ressourcen
          </h2>
          <p className="text-muted-foreground text-sm">Alle strategischen Dokumente im Überblick.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {documents.map((doc) => {
            const Icon = doc.icon;
            const isAvailable = doc.status === "verfügbar";
            const Wrapper = isAvailable ? Link : "button";
            const wrapperProps = isAvailable
              ? { to: doc.href }
              : { onClick: () => handleDocClick(doc) };

            return (
              <Wrapper
                key={doc.title}
                {...wrapperProps}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/10 transition-all text-left w-full"
              >
                <div className="p-2.5 rounded-lg bg-muted text-muted-foreground">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{doc.title}</p>
                  <p className="text-[10px] text-muted-foreground">{doc.type}</p>
                </div>
                {isAvailable ? (
                  <ExternalLink className="w-4 h-4 text-primary shrink-0" />
                ) : (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-muted text-muted-foreground shrink-0">
                    intern
                  </span>
                )}
              </Wrapper>
            );
          })}
        </div>
      </section>
    </div>
  );
}
