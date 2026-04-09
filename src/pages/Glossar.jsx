import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader";

const glossarData = [
  { term: "Agile", def: "Ein iterativer Ansatz für Projekt- und Softwareentwicklung, der auf Flexibilität und schnelles Reagieren auf Änderungen setzt." },
  { term: "API", def: "Application Programming Interface – eine Schnittstelle, über die verschiedene Softwareanwendungen miteinander kommunizieren." },
  { term: "Bias", def: "Systematische Verzerrung in Daten oder Algorithmen, die zu unfairen oder ungenauen Ergebnissen führen kann." },
  { term: "Change Management", def: "Strukturierter Ansatz zur Planung und Umsetzung von organisatorischen Veränderungen." },
  { term: "Cloud Computing", def: "Bereitstellung von IT-Ressourcen wie Speicher, Rechenleistung und Software über das Internet." },
  { term: "Datenmanagement", def: "Planung, Kontrolle und Verwaltung von Daten über deren gesamten Lebenszyklus hinweg." },
  { term: "Digitalisierung", def: "Die Umwandlung analoger Informationen und Prozesse in digitale Formate." },
  { term: "Digitale Transformation", def: "Grundlegende Veränderung von Geschäftsprozessen, Kultur und Kundenerlebnissen durch den Einsatz digitaler Technologien." },
  { term: "DSGVO", def: "Datenschutz-Grundverordnung – EU-Gesetzgebung zum Schutz personenbezogener Daten." },
  { term: "Generative KI", def: "KI-Systeme, die neue Inhalte wie Texte, Bilder, Code oder Musik erzeugen können (z.B. ChatGPT, DALL-E)." },
  { term: "Governance", def: "Steuerungs- und Regelungssystem für Organisationen, insbesondere im Umgang mit Daten und Technologie." },
  { term: "Halluzination", def: "Wenn ein KI-Modell plausibel klingende, aber faktisch falsche Informationen generiert." },
  { term: "IT-Architektur", def: "Die strukturelle Gesamtplanung der IT-Infrastruktur einer Organisation." },
  { term: "Künstliche Intelligenz (KI)", def: "Computersysteme, die Aufgaben ausführen, die normalerweise menschliche Intelligenz erfordern." },
  { term: "LLM", def: "Large Language Model – ein grosses Sprachmodell, das auf riesigen Textmengen trainiert wurde (z.B. GPT-4, Claude, Llama)." },
  { term: "Low-Code / No-Code", def: "Plattformen, die Softwareentwicklung mit minimalem oder keinem Programmieraufwand ermöglichen." },
  { term: "Machine Learning", def: "Teilbereich der KI, bei dem Algorithmen aus Daten lernen und sich ohne explizite Programmierung verbessern." },
  { term: "Prompt", def: "Die Eingabe oder Anweisung, die man einem KI-System gibt, um eine bestimmte Antwort zu erhalten." },
  { term: "Prompt Engineering", def: "Die Kunst, Prompts so zu formulieren, dass KI-Modelle optimale Ergebnisse liefern." },
  { term: "Prozessdigitalisierung", def: "Die Umstellung manueller oder papierbasierter Abläufe auf digitale, automatisierte Prozesse." },
  { term: "SaaS", def: "Software as a Service – Software, die über das Internet als Dienstleistung bereitgestellt und abonniert wird." },
  { term: "Scraping", def: "Automatisiertes Extrahieren von Daten aus Webseiten oder Dokumenten." },
  { term: "Token", def: "Grundeinheit, in die Text für die Verarbeitung durch KI-Modelle zerlegt wird (Wörter, Wortteile)." },
];

const alphabet = [...new Set(glossarData.map((g) => g.term[0].toUpperCase()))].sort();

export default function Glossar() {
  const [search, setSearch] = useState("");
  const [activeLetter, setActiveLetter] = useState(null);

  const filtered = useMemo(() => {
    let items = glossarData;
    if (search) {
      items = items.filter(
        (g) => g.term.toLowerCase().includes(search.toLowerCase()) || g.def.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeLetter) {
      items = items.filter((g) => g.term[0].toUpperCase() === activeLetter);
    }
    return items;
  }, [search, activeLetter]);

  return (
    <div>
      <PageHeader
        title="Glossar"
        subtitle="Wichtige Begriffe rund um Digitalisierung und KI – verständlich erklärt."
        breadcrumb={[{ label: 'Glossar' }]}
        seed={17}
        accentColor="#008770"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Begriff suchen..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setActiveLetter(null); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-8">
          <button
            onClick={() => setActiveLetter(null)}
            className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
              !activeLetter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Alle
          </button>
          {alphabet.map((l) => (
            <button
              key={l}
              onClick={() => { setActiveLetter(l); setSearch(""); }}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                activeLetter === l ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((g, i) => (
            <motion.div
              key={g.term}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className="p-4 rounded-xl border border-border bg-card"
            >
              <h3 className="font-heading font-semibold text-foreground mb-1">{g.term}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.def}</p>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">Kein Eintrag gefunden.</div>
        )}
      </motion.div>
    </div>
    </div>
  );
}
