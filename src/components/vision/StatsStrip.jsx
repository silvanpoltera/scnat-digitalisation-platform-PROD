import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const stats = [
  { value: 6, label: "Handlungsfelder" },
  { value: 13, label: "Themenfelder" },
  { value: 55, label: "MA befragt" },
  { value: 2025, label: "Startjahr", noAnimate: true },
];

function AnimatedCounter({ target, duration = 1.5, noAnimate }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    if (noAnimate) { setCount(target); return; }

    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [isInView, target, duration, noAnimate]);

  return <span ref={ref}>{count}</span>;
}

export default function StatsStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="p-3 rounded-lg border border-border bg-card text-center"
        >
          <p className="text-xl font-heading font-bold text-foreground">
            <AnimatedCounter target={s.value} noAnimate={s.noAnimate} />
          </p>
          <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
