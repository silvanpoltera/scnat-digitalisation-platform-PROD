import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewsTimeline() {
  const [newsItems, setNewsItems] = useState([]);
  const [filter, setFilter] = useState("Alle");

  useEffect(() => {
    fetch('/api/news', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(d => setNewsItems(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(newsItems.map(n => n.category).filter(Boolean))];
    return ['Alle', ...cats.sort()];
  }, [newsItems]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const filtered = filter === "Alle" ? newsItems : newsItems.filter((n) => n.category === filter);

  if (newsItems.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Neuigkeiten</h2>
        <p className="text-muted-foreground mb-5">Meilensteine und Updates zur Digitalisierung.</p>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-border" />

        <div className="space-y-1">
          {filtered.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="relative pl-9 sm:pl-12 py-4 group"
            >
              <div className="absolute left-1.5 sm:left-2.5 top-[22px] z-10">
                {item.isNew ? (
                  <span className="flex h-3 w-3">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                      style={{ background: item.categoryColor }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-3 w-3 border-2 border-background"
                      style={{ background: item.categoryColor }}
                    />
                  </span>
                ) : (
                  <span
                    className="block w-2.5 h-2.5 rounded-full border-2 border-background"
                    style={{ background: item.categoryColor }}
                  />
                )}
              </div>

              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: item.categoryColor }}
                >
                  {item.category}
                </span>
                <span className="text-xs text-muted-foreground">{formatDate(item.datum)}</span>
                {item.isNew && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-scnat-red/10 text-scnat-red text-[10px] font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> Neu
                  </span>
                )}
              </div>

              <h3 className="font-heading font-semibold text-foreground text-sm mb-1 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{item.teaser}</p>

              {item.linkTo && (
                <Link
                  to={item.linkTo}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-scnat-darkred transition-colors"
                >
                  Mehr lesen <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
