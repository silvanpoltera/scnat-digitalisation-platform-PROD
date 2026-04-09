import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { pillars } from "./VisionHouse";

export default function ActionFieldDetail({ selectedId }) {
  const pillar = pillars.find((p) => p.id === selectedId);

  return (
    <AnimatePresence mode="wait">
      {pillar ? (
        <motion.div
          key={pillar.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="p-5 rounded-xl border bg-card"
          style={{ borderColor: `${pillar.color}30` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg text-white" style={{ background: pillar.color }}>
              <pillar.icon className="w-4 h-4" />
            </div>
            <h3 className="font-heading font-bold text-foreground text-sm">{pillar.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{pillar.desc}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pillar.topics.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: `${pillar.color}15`, color: pillar.color }}
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            to="/handlungsfelder"
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: pillar.color }}
          >
            Alle Handlungsfelder <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>
      ) : (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-5 rounded-xl border border-dashed border-border bg-muted/30 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Klick auf eine Säule im Haus, um Details zu sehen.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
