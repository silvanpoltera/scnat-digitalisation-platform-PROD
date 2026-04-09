import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const news = [
  {
    date: "8. April 2026",
    title: "KI-Rahmen offiziell von der Geschäftsleitung verabschiedet",
    desc: "Die neuen Richtlinien für den Einsatz von KI-Werkzeugen sind ab sofort gültig. Alle Mitarbeitenden sind eingeladen, das Dokument zu lesen.",
    tag: "KI",
    tagColor: "bg-scnat-red/10 text-scnat-red",
  },
  {
    date: "1. April 2026",
    title: "Task Force Digitalisierung gegründet",
    desc: "Die neue Task Force begleitet die digitale Transformation der SCNAT. Change Agents aus allen Abteilungen sind willkommen.",
    tag: "Organisation",
    tagColor: "bg-scnat-teal/10 text-scnat-teal",
  },
  {
    date: "22. März 2026",
    title: "DeepL-Lizenzen: 15 Plätze jetzt verfügbar",
    desc: "DeepL Translate + Write stehen allen Mitarbeitenden zur Verfügung. Lizenz über Digitalisierung anfragen.",
    tag: "Tools",
    tagColor: "bg-scnat-cyan/10 text-scnat-cyan",
  },
  {
    date: "15. März 2026",
    title: "Copilot-Pilotprojekt: Teilnehmende gesucht",
    desc: "Das Pilotprojekt für Microsoft 365 Copilot startet. Es sind 10 Plätze für Early Adopters verfügbar.",
    tag: "Pilot",
    tagColor: "bg-scnat-orange/10 text-scnat-orange",
  },
];

export default function NewsFeed() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Neuigkeiten</h2>
          <p className="text-muted-foreground">Aktuelle Meldungen zur Digitalisierung.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((item, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="group p-5 rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/10 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.tagColor}`}>
                {item.tag}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {item.date}
              </div>
            </div>
            <h3 className="font-heading font-semibold text-foreground text-sm mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
