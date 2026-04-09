import { systems } from "./systems";
import { newsItems } from "./news";

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

const faqs = [
  { q: "Was ist das Digitalisierungsportal?", a: "Das Portal ist die zentrale Anlaufstelle für alle Informationen rund um die Digitalisierungsstrategie der SCNAT.", cat: "Allgemein" },
  { q: "Wer ist für Digitalisierung zuständig?", a: "Silvan ist als Verantwortlicher Digitalisierung der erste Ansprechpartner.", cat: "Allgemein" },
  { q: "Wie kann ich mich an der Digitalisierung beteiligen?", a: "Du kannst dich als Change Agent engagieren.", cat: "Allgemein" },
  { q: "Darf ich ChatGPT für Sitzungsprotokolle nutzen?", a: "Ja, du kannst ChatGPT (Enterprise-Lizenz) für Sitzungsprotokolle nutzen. Keine vertraulichen personenbezogenen Daten eingeben.", cat: "KI" },
  { q: "Welche Daten darf ich der KI weitergeben?", a: "Allgemeine, nicht vertrauliche Informationen dürfen verarbeitet werden.", cat: "KI" },
  { q: "Kann ich andere KI-Tools als ChatGPT nutzen?", a: "Offiziell zugelassen sind ChatGPT (Enterprise-Lizenz) und DeepL.", cat: "KI" },
  { q: "Was mache ich, wenn ich neue Software brauche?", a: "Nutze den Beschaffungsprozess im Portal unter Prozesse.", cat: "Beschaffung" },
  { q: "Wie lange dauert eine Software-Beschaffung?", a: "Zwischen 2 Wochen und mehreren Monaten je nach Komplexität.", cat: "Beschaffung" },
  { q: "Was ist die SoLiWebL-Liste?", a: "Ein Register bereits evaluierter und zugelassener Softwareprodukte.", cat: "Beschaffung" },
  { q: "Wie gehe ich mit Personendaten um?", a: "Personendaten dürfen nur gemäss DSG und DSGVO verarbeitet werden.", cat: "Datenschutz" },
  { q: "Wo werden unsere Daten gespeichert?", a: "Microsoft-365-Daten liegen in Schweizer / EU-Rechenzentren.", cat: "Datenschutz" },
  { q: "An wen wende ich mich bei IT-Problemen?", a: "IT-Abteilung für allgemeine Probleme, Task Force für Strategie, David/Anina/Arber für KI.", cat: "Support" },
  { q: "Gibt es Schulungen zu digitalen Tools?", a: "Ja, die Task Force organisiert regelmässig Workshops.", cat: "Support" },
];

const teamMembers = [
  { name: "Silvan", role: "Verantwortlicher Digitalisierung", area: "Strategische Leitung" },
  { name: "David Jezdimirovic", role: "KI-Spezialist", area: "Künstliche Intelligenz" },
  { name: "Anina Steinlin", role: "KI-Spezialistin", area: "Künstliche Intelligenz" },
  { name: "Arber Aziri", role: "KI-Spezialist", area: "Künstliche Intelligenz" },
];

const pmConcepts = [
  { title: "Sprint Planning", desc: "Ziele definieren, Backlog priorisieren, Sprint-Scope festlegen. Woche 1, 90 min." },
  { title: "Weekly Check-in", desc: "Blocker identifizieren und lösen. Wöchentlich, 30 min standup-nah." },
  { title: "Sprint Review + Retro", desc: "Ergebnisse demonstrieren, Feedback einholen, Lessons Learned. Woche 4, 60 min." },
  { title: "Stakeholder-Touchpoint", desc: "Frühes Feedback der Abteilung einholen. Optional, Woche 3, 20 min." },
  { title: "Steering Committee", desc: "Quartalsplanung mit Geschäftsleitung. Prioritäten, Budget, Kurskorrektur. Alle 13 Wochen." },
  { title: "Change-Readiness", desc: "6 Fragen vor jedem Sprint: Wer ist betroffen, was ändert sich, Widerstand, Change Agent." },
  { title: "Sprint Board", desc: "Backlog, In Bearbeitung, Blockiert, Erledigt. Einziges lebendes Dokument." },
  { title: "Themen-Cluster", desc: "Infrastruktur & IT, Datenstrategie, Prozessdigitalisierung, Kommunikation, Skills & Change, Compliance." },
  { title: "Lean-Agile Framework", desc: "Drei Rhythmus-Ebenen: Strategie-Layer, Sprint-Layer, Ops-Layer." },
  { title: "Change Agent", desc: "Interner Multiplikator in der Abteilung, 20–30 min/Woche Aufwand." },
  { title: "Entscheidungslog", desc: "3–5 Zeilen pro Eintrag: was, wer, wann, warum. Kurz aber vollständig." },
];

const handlungsfelder = [
  { title: "Digitale Kultur", desc: "Digitales Mindset, Kompetenzen, Change Management" },
  { title: "Zusammenarbeit & Netzwerk digital", desc: "Digitale Zusammenarbeit, Kundenorientierung" },
  { title: "Effiziente und digitale Prozesslandschaft", desc: "Prozessdigitalisierung, Prozessmanagement" },
  { title: "Daten- & Wissensmanagement", desc: "Informationsmanagement, Datenmanagement" },
  { title: "Digitale Infrastruktur & Technologie", desc: "IT-Architektur, Applikationslandschaft, KI" },
  { title: "Governance & Steuerung", desc: "IT-Governance, Datenschutz, Compliance" },
];

const pages = [
  { title: "Übersicht", desc: "Startseite mit Schnellzugriff und Neuigkeiten", path: "/" },
  { title: "Strategie", desc: "Vision, Zielbild, Strategieprozess und Rollen", path: "/strategie" },
  { title: "Handlungsfelder", desc: "6 strategische Transformationsfelder", path: "/handlungsfelder" },
  { title: "Software & Co", desc: "Alle Applikationen und Tools der SCNAT", path: "/systemlandschaft" },
  { title: "KI-Hub", desc: "KI-Richtlinien, LLM-Vergleich, lokale Modelle", path: "/ki-hub" },
  { title: "Glossar", desc: "Digitalisierungsbegriffe erklärt", path: "/glossar" },
  { title: "FAQs", desc: "Häufig gestellte Fragen", path: "/faqs" },
  { title: "Prozesse", desc: "Software beschaffen, PM-Framework", path: "/prozesse" },
  { title: "Team", desc: "Task Force & Ansprechpersonen", path: "/team" },
];

function match(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function globalSearch(query) {
  if (!query || query.length < 2) return [];

  const results = [];

  // Pages
  pages.forEach((p) => {
    if (match(p.title, query) || match(p.desc, query)) {
      results.push({ type: "page", title: p.title, subtitle: p.desc, path: p.path });
    }
  });

  // Systems
  systems.forEach((s) => {
    if (match(s.name, query) || match(s.desc, query) || match(s.category, query)) {
      results.push({ type: "system", title: s.name, subtitle: `${s.category} · ${s.responsible}`, path: "/systemlandschaft", meta: s });
    }
  });

  // Glossary
  glossarData.forEach((g) => {
    if (match(g.term, query) || match(g.def, query)) {
      results.push({ type: "glossar", title: g.term, subtitle: g.def.slice(0, 80) + "…", path: "/glossar" });
    }
  });

  // FAQs
  faqs.forEach((f) => {
    if (match(f.q, query) || match(f.a, query)) {
      results.push({ type: "faq", title: f.q, subtitle: f.a.slice(0, 80) + "…", path: "/faqs" });
    }
  });

  // Team
  teamMembers.forEach((t) => {
    if (match(t.name, query) || match(t.role, query) || match(t.area, query)) {
      results.push({ type: "team", title: t.name, subtitle: `${t.role} · ${t.area}`, path: "/team" });
    }
  });

  // Handlungsfelder
  handlungsfelder.forEach((h) => {
    if (match(h.title, query) || match(h.desc, query)) {
      results.push({ type: "handlungsfeld", title: h.title, subtitle: h.desc, path: "/handlungsfelder" });
    }
  });

  // PM-Framework
  pmConcepts.forEach((p) => {
    if (match(p.title, query) || match(p.desc, query)) {
      results.push({ type: "prozess", title: p.title, subtitle: p.desc, path: "/prozesse" });
    }
  });

  // News
  newsItems.forEach((n) => {
    if (match(n.title, query) || match(n.teaser, query) || match(n.category, query)) {
      results.push({ type: "news", title: n.title, subtitle: `${n.date} · ${n.category}`, path: n.linkTo || "/" });
    }
  });

  return results.slice(0, 20);
}

export const TYPE_LABELS = {
  page: "Seiten",
  system: "Systeme",
  glossar: "Glossar",
  faq: "FAQs",
  team: "Team",
  handlungsfeld: "Handlungsfelder",
  prozess: "PM-Framework",
  news: "Neuigkeiten",
};
