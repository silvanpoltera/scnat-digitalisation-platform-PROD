import { useState } from "react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageHeader from "../components/PageHeader";

const faqCategories = ["Alle", "Allgemein", "KI", "Beschaffung", "Datenschutz", "Support"];

const faqs = [
  { q: "Was ist das Digitalisierungsportal?", a: "Das Portal ist die zentrale Anlaufstelle für alle Informationen rund um die Digitalisierungsstrategie der SCNAT. Hier findest du Informationen zu Tools, Prozessen, KI-Richtlinien und Ansprechpersonen.", cat: "Allgemein" },
  { q: "Wer ist für Digitalisierung zuständig?", a: "Silvan ist als Verantwortlicher Digitalisierung der erste Ansprechpartner. Die Task Force Digitalisierung unterstützt bei der strategischen Umsetzung.", cat: "Allgemein" },
  { q: "Wie kann ich mich an der Digitalisierung beteiligen?", a: "Du kannst dich als Change Agent engagieren. Melde dich bei der Task Force oder bringe deine Ideen über das Portal ein.", cat: "Allgemein" },
  { q: "Darf ich ChatGPT für Sitzungsprotokolle nutzen?", a: "Ja, du kannst ChatGPT (Enterprise-Lizenz) für Sitzungsprotokolle nutzen. Achte darauf, keine vertraulichen personenbezogenen Daten einzugeben. Prüfe das Ergebnis immer auf Korrektheit.", cat: "KI" },
  { q: "Welche Daten darf ich der KI weitergeben?", a: "Allgemeine, nicht vertrauliche Informationen dürfen über die zugelassenen Tools (ChatGPT Enterprise, DeepL) verarbeitet werden. Vertrauliche Dokumente, Personendaten oder Finanzdaten nur nach Rücksprache mit dem Datenschutzverantwortlichen.", cat: "KI" },
  { q: "Kann ich andere KI-Tools als ChatGPT nutzen?", a: "Offiziell zugelassen sind ChatGPT (Enterprise-Lizenz) und DeepL. Andere Tools können für nicht-sensible Daten explorativ genutzt werden, sind aber nicht offiziell freigegeben.", cat: "KI" },
  { q: "Was mache ich, wenn ich neue Software brauche?", a: "Nutze den Beschaffungsprozess im Portal unter 'Prozesse'. Dort findest du den Schritt-für-Schritt-Prozess und kannst eine Software-Anfrage einreichen.", cat: "Beschaffung" },
  { q: "Wie lange dauert eine Software-Beschaffung?", a: "Je nach Komplexität und Kosten zwischen 2 Wochen (einfache Tools) und mehreren Monaten (komplexe Systeme).", cat: "Beschaffung" },
  { q: "Was ist die SoLiWebL-Liste?", a: "Die Software-Lizenz-Web-Liste (SoLiWebL) ist ein Register bereits evaluierter und zugelassener Softwareprodukte. Steht eine Software auf der Liste, beschleunigt dies den Beschaffungsprozess.", cat: "Beschaffung" },
  { q: "Wie gehe ich mit Personendaten um?", a: "Personendaten dürfen nur gemäss DSG (Schweizer Datenschutzgesetz) und DSGVO verarbeitet werden. Bei neuen Tools immer prüfen, ob Personendaten betroffen sind.", cat: "Datenschutz" },
  { q: "Wo werden unsere Daten gespeichert?", a: "Microsoft-365-Daten liegen in Schweizer / EU-Rechenzentren. Bei neuen Tools wird der Serverstandort als Teil der Datenschutzprüfung evaluiert.", cat: "Datenschutz" },
  { q: "An wen wende ich mich bei IT-Problemen?", a: "Für allgemeine IT-Probleme: IT-Abteilung. Für Fragen zur Digitalisierungsstrategie: Task Force Digitalisierung. Für KI-Fragen: David, Anina oder Arber.", cat: "Support" },
  { q: "Gibt es Schulungen zu digitalen Tools?", a: "Ja, die Task Force organisiert regelmässig Workshops und Schulungen. Aktuelle Termine findest du im Portal unter Neuigkeiten.", cat: "Support" },
];

export default function Faqs() {
  const [activeCat, setActiveCat] = useState("Alle");

  const filtered = activeCat === "Alle" ? faqs : faqs.filter((f) => f.cat === activeCat);

  return (
    <div>
      <PageHeader
        title="Häufig gestellte Fragen"
        subtitle="Antworten auf die wichtigsten Fragen zur Digitalisierung an der SCNAT."
        breadcrumb={[{ label: 'FAQs' }]}
        seed={19}
        accentColor="#9B59B6"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-wrap gap-2 mb-8">
          {faqCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors ${
                activeCat === cat ? "bg-bg-elevated text-txt-primary border border-bd-default" : "bg-bg-surface text-txt-secondary border border-bd-faint hover:border-bd-default"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          <Accordion type="single" collapsible className="space-y-2">
            {filtered.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-bd-faint rounded-sm px-5 bg-bg-surface">
                <AccordionTrigger className="text-left font-heading font-semibold text-txt-primary text-sm py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-txt-secondary leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </div>
    </div>
  );
}
