import { motion } from "framer-motion";
import { Target, TrendingUp, Shield, Users } from "lucide-react";

const pillars = [
  {
    icon: Target,
    title: "Vision",
    desc: "SCNAT als agile, datengetriebene Organisation, die digitale Werkzeuge souverän einsetzt.",
    color: "bg-scnat-red",
  },
  {
    icon: TrendingUp,
    title: "Digitale Reife",
    desc: "Schrittweiser Aufbau digitaler Kompetenzen auf allen Ebenen der Organisation.",
    color: "bg-scnat-teal",
  },
  {
    icon: Shield,
    title: "Verantwortung",
    desc: "Datenschutz, Ethik und Transparenz als Leitprinzipien der digitalen Transformation.",
    color: "bg-scnat-green",
  },
  {
    icon: Users,
    title: "Teilhabe",
    desc: "Mitarbeitende aktiv einbeziehen – als Change Agents und Gestalter der Veränderung.",
    color: "bg-scnat-orange",
  },
];

export default function StrategyOverview() {
  return (
    <section className="bg-muted/50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">
            Digitalisierungsstrategie
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Vier Grundpfeiler bilden das Fundament der digitalen Transformation an der SCNAT.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow"
            >
              <div className={`p-2.5 rounded-lg ${pillar.color} text-white w-fit mb-4`}>
                <pillar.icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-foreground mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
