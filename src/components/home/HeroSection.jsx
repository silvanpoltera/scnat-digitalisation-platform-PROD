import { motion } from "framer-motion";
import { ArrowRight, Layers, Brain, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import NetworkBackground, { NetworkGrid } from "../NetworkBackground";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-bg-base">
      <NetworkBackground
        nodeCount={50}
        seed={99}
        accentColor="#EA515A"
        opacity={0.5}
        showPulse
      />
      <NetworkGrid opacity={0.15} />

      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(234,81,90,0.06)_0%,_transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(0,122,135,0.04)_0%,_transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 relative z-10">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-bg-surface border border-bd-faint mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-scnat-red animate-pulse" />
              <span className="text-xs text-txt-secondary font-mono">Digitalisierungsportal 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-txt-primary leading-tight mb-6">
              Digitalisierung
              <span className="block text-scnat-red">gemeinsam gestalten</span>
            </h1>

            <p className="text-lg text-txt-secondary leading-relaxed mb-10 max-w-2xl">
              Das zentrale Informationsportal der SCNAT für die digitale Transformation.
              Strategien, Tools, Prozesse und KI-Richtlinien – alles an einem Ort.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/systemlandschaft"
                className="inline-flex items-center gap-2 px-6 py-3 bg-scnat-red text-white font-medium rounded-sm hover:bg-[#F06570] transition-colors"
              >
                Software & Co erkunden
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/ki-hub"
                className="inline-flex items-center gap-2 px-6 py-3 bg-bg-surface text-txt-primary font-medium rounded-sm hover:bg-bg-elevated border border-bd-faint transition-colors"
              >
                KI-Hub entdecken
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { icon: Layers, label: "60+ Systeme", desc: "Vollständige Software-Übersicht", color: "text-scnat-cyan" },
            { icon: Brain, label: "KI-Framework", desc: "Richtlinien & Best Practices", color: "text-scnat-red" },
            { icon: Workflow, label: "6 Handlungsfelder", desc: "Strategische Transformation", color: "text-scnat-teal" },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-sm bg-bg-surface/70 border border-bd-faint backdrop-blur-sm">
              <div className={`p-2.5 rounded-sm bg-bg-elevated ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-txt-primary font-heading font-semibold text-sm">{stat.label}</p>
                <p className="text-txt-tertiary text-xs">{stat.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
