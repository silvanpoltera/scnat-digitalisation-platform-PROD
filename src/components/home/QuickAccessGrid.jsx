import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Monitor, Lightbulb, Brain, BookOpen, HelpCircle, Workflow, Users, ArrowRight, Target } from "lucide-react";

const items = [
  { icon: Target, title: "Strategie", desc: "Vision, Zielbild & Strategieprozess", path: "/strategie", color: "bg-scnat-red/10 text-scnat-red" },
  { icon: Lightbulb, title: "Handlungsfelder", desc: "6 strategische Transformationsfelder", path: "/handlungsfelder", color: "bg-scnat-orange/10 text-scnat-orange" },
  { icon: Monitor, title: "Software & Co", desc: "Alle Applikationen & Tools im Überblick", path: "/systemlandschaft", color: "bg-scnat-cyan/10 text-scnat-cyan" },
  { icon: Brain, title: "KI-Hub", desc: "KI-Richtlinien, Tools & Best Practices", path: "/ki-hub", color: "bg-scnat-red/10 text-scnat-red" },
  { icon: Workflow, title: "Prozesse", desc: "Software beschaffen & PM-Framework", path: "/prozesse", color: "bg-scnat-pink/10 text-scnat-pink" },
  { icon: Users, title: "Team", desc: "Task Force & Ansprechpersonen", path: "/team", color: "bg-scnat-anthrazit/10 text-scnat-anthrazit" },
  { icon: HelpCircle, title: "FAQs", desc: "Antworten auf häufige Fragen", path: "/faqs", color: "bg-scnat-teal/10 text-scnat-teal" },
  { icon: BookOpen, title: "Glossar", desc: "Digitalisierungsbegriffe erklärt", path: "/glossar", color: "bg-scnat-green/10 text-scnat-green" },
];

export default function QuickAccessGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Schnellzugriff</h2>
      <p className="text-muted-foreground mb-8">Direkt zu den wichtigsten Bereichen navigieren.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <Link
              to={item.path}
              className="group flex flex-col p-5 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className={`p-2.5 rounded-lg ${item.color} w-fit mb-4`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.desc}</p>
              <div className="mt-auto flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Öffnen <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
