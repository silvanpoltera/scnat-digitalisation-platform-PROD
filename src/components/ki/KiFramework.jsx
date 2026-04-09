import { useState } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, ChevronDown, Users, FileWarning, Wrench, Scale, Eye, Lock } from "lucide-react";

const SECTIONS = [
  {
    id: "grundaspekte",
    titel: "Grundaspekte",
    icon: Scale,
    regeln: [
      "Es ist untersagt, Inhalte zu generieren, die rassistisch, sexistisch oder homophob sind. Die in der Schweiz geltenden Gesetze müssen eingehalten werden.",
      "KI-Modelle können nicht als sichere und zuverlässige Quellen betrachtet werden. Halluzinationen und Fehler sind durchaus möglich.",
      "KI dient als Arbeitstool und ersetzt keine menschliche Expertise. Sie sollte die Arbeit vereinfachen, nicht durch zusätzliche Komplexität und Plattformen erschweren.",
      "Der Energieverbrauch der KI-Modelle ist immens. Die Mitarbeitenden können einen Beitrag leisten, indem sie nur so wenige Anfragen wie möglich über KI laufen lassen. Nicht jede Herausforderung erfordert eine KI-Lösung.",
      "Die Nutzung von KI-Tools ist freiwillig. Mitarbeitende können bei Unsicherheiten Unterstützung durch KI-Spezialist:innen in Anspruch nehmen.",
    ],
  },
  {
    id: "verantwortung",
    titel: "Verantwortung",
    icon: Eye,
    regeln: [
      "Wer KI nutzt, soll ein grundlegendes Verständnis der Eigenschaften und Risiken generativer KIs (Bias, Halluzinationen, limitierte Trainingsdaten, Prompts, persönliche Daten, usw.) haben.",
      "Alle durch KI generierten Inhalte müssen von Menschen auf ihre Richtigkeit und Qualität überprüft werden. Nur durch menschliche Expertise und sorgfältiges Vorgehen lassen sich Fehler vermeiden und relevante Details wirklich erkennen.",
      "Die Mitarbeitenden sind für die finale Freigabe von KI-generierten oder KI-unterstützten Inhalten verantwortlich — unabhängig vom Format (Text, Bild, Video, usw.).",
      "Der Einsatz von KI zur Aufzeichnung und Transkription von Sitzungen muss im Voraus allen Teilnehmenden klar kommuniziert werden. Bei Bedenken von Sitzungsteilnehmenden ist auf die Nutzung von KI zu verzichten. Die Aufzeichnung darf nur für interne Zwecke erfolgen, beispielsweise für das Redigieren von Protokollen.",
    ],
  },
  {
    id: "daten",
    titel: "Persönliche Daten",
    icon: Lock,
    intro: "Beim Umgang mit persönlichen Daten ist besondere Sorgfalt erforderlich. Die SCNAT unterscheidet zwei Arten von Daten:",
    datentypen: [
      {
        name: "Öffentliche Daten",
        erlaubt: true,
        beschreibung: "Alle frei verfügbaren Informationen, die als öffentlich freigegeben gekennzeichnet sind. Dazu gehören beispielsweise Daten, die auf der SCNAT-Website bereits online zugänglich sind (Name, Vorname, E-Mail-Adresse, Diensttelefon).",
        regel: "Öffentliche Daten können ohne Weiteres in die KI-Tools eingegeben werden.",
      },
      {
        name: "Sensible & vertrauliche Daten",
        erlaubt: false,
        beschreibung: "Alle nicht öffentlichen Informationen:",
        details: [
          "Personen-Daten: Geburtsdatum, private Adresse, Telefonnummer, Gehalt oder andere Angaben, die unter Datenschutzgesetze fallen",
          "Interne Inhalte: Nicht veröffentlichte Berichte, Protokolle, Strategiepapiere oder Finanzdaten (inkl. Excel-Dateien mit Budgetinformationen)",
          "Wissenschaftliche Daten: Forschungsergebnisse vor der Veröffentlichung oder vertrauliche Daten von Partner:innen, Autor:innen, usw.",
          "Vertragliche Informationen: Inhalte aus Verhandlungen oder Absprachen mit externen Partner:innen",
        ],
        regel: "Sensible und vertrauliche Daten dürfen NICHT mit der KI verarbeitet werden. Dies gilt auch für weniger offensichtliche Verwendungszwecke wie die Verbesserung oder Übersetzung von E-Mails mit sensiblen Informationen. In diesem Fall: vertrauliche Daten anonymisieren.",
      },
    ],
  },
  {
    id: "tools",
    titel: "Zugelassene KI-Tools",
    icon: Wrench,
    regeln: [
      "Die Nutzung von Softwares und Lizenzen, darin insbesondere eingeschlossen auch KI-Tools, ist ausschliesslich mit den auf der SoLiWebL-Liste (Software, Lizenzen, WebLösungen) aufgeführten und von der IT freigegebenen Tools gestattet. Die Verwendung jedes anderen Tools ist im Kontext der SCNAT nicht erlaubt.",
      "Zu den zugelassenen KI-Tools gehören beispielsweise DeepL und — neu ab 2025 — die lizenzierte Version von ChatGPT (Team-Plan). Es ist jedoch wichtig, weder Personendaten noch vertrauliche Daten preiszugeben.",
      "Andere Tools können in Zukunft je nach Bedürfnissen zugelassen werden. Dazu können sich die Mitarbeitenden an die KI-Spezialist:innen wenden. Diese sammeln die Bedürfnisse und geben sie gebündelt an die IT weiter.",
    ],
  },
];

const QUICK_RULES = [
  { type: "do", text: "Allgemeine, nicht vertrauliche Inhalte bearbeiten lassen" },
  { type: "do", text: "Entwürfe, Zusammenfassungen, Übersetzungen erstellen" },
  { type: "do", text: "Nur freigegebene Tools nutzen (ChatGPT Team, DeepL)" },
  { type: "do", text: "Ergebnisse immer auf Richtigkeit und Qualität prüfen" },
  { type: "warn", text: "KI-Transkription nur mit Einverständnis aller Teilnehmenden" },
  { type: "warn", text: "Vertrauliche Infos in Prompts anonymisieren" },
  { type: "warn", text: "Bei Unsicherheit: David, Anina oder Arber fragen" },
  { type: "dont", text: "Keine Personendaten (Geburtsdatum, Gehalt, private Adressen)" },
  { type: "dont", text: "Keine internen Berichte, Finanzdaten oder Protokolle" },
  { type: "dont", text: "Keine nicht freigegebenen KI-Tools verwenden" },
  { type: "dont", text: "Keine rassistischen, sexistischen oder diskriminierenden Inhalte generieren" },
];

const GLOSSAR = [
  { term: "Generative KI", def: "Technologien, die Inhalte wie Texte, Bilder oder Videos erzeugen. Für Texte berechnen die Tools die Wahrscheinlichkeit für das nächste Wort in einem Satz." },
  { term: "Trainingsdaten", def: "Enorme Mengen an Texten und Bildern, mit denen KI-Modelle trainiert werden. Diese Daten sind limitiert und nicht neutral — sie spiegeln die Gesellschaft wider und damit auch ihre Vorurteile." },
  { term: "Bias", def: "Systematische Verzerrungen, die in KI-Modellen durch unausgewogene Trainingsdaten entstehen können." },
  { term: "Halluzinationen", def: "Fehlerhafte oder unrealistische Inhalte, die von KI generiert werden, obwohl sie plausibel klingen." },
  { term: "Prompts", def: "Anweisungen oder Beschreibungen, die man einer generativen KI in gesprochener oder geschriebener Form gibt." },
];

export default function KiFramework() {
  const [expanded, setExpanded] = useState(null);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="bg-scnat-red/5 border-2 border-scnat-red/30 rounded-sm p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="p-2 rounded-sm bg-scnat-red/15 text-scnat-red shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-txt-primary">
              Offizieller Rahmen zur Nutzung von KI
            </h2>
            <p className="text-xs text-txt-secondary mt-1">
              Beschluss der Geschäftsleitung, März 2025 — Gültig bis zur Festlegung der definitiven KI-Strategie im Rahmen des Digitalisierungsprojektes
            </p>
          </div>
        </div>
        <p className="text-xs text-txt-secondary leading-relaxed">
          Dieses Rahmenwerk stellt verbindliche Grundregeln auf, um eine sinnvolle und verantwortungsbewusste Nutzung von KI innerhalb der SCNAT sicherzustellen. Seit Ende 2024 ist der Einsatz bestimmter KI-Tools offiziell erlaubt — unter den hier definierten Bedingungen. Dieser Rahmen soll die wesentlichen Risiken reduzieren. Fragen bezüglich Deklarationspflicht, Urheberrecht, Schulungsbedarf, Risikomanagement und Nachhaltigkeit werden im Digitalisierungsprojekt geklärt.
        </p>
      </div>

      {/* Quick-Reference: Erlaubt / Achtung / Verboten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 rounded-sm border-2 border-status-green/30 bg-status-green/5">
          <h3 className="flex items-center gap-2 font-heading font-bold text-status-green text-sm mb-3">
            <CheckCircle className="w-4 h-4" /> Erlaubt
          </h3>
          <ul className="space-y-2">
            {QUICK_RULES.filter(r => r.type === "do").map((r, i) => (
              <li key={i} className="text-xs text-txt-primary leading-relaxed flex items-start gap-2">
                <span className="text-status-green mt-0.5 shrink-0">✓</span>
                {r.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-sm border-2 border-status-yellow/30 bg-status-yellow/5">
          <h3 className="flex items-center gap-2 font-heading font-bold text-status-yellow text-sm mb-3">
            <AlertTriangle className="w-4 h-4" /> Achtung
          </h3>
          <ul className="space-y-2">
            {QUICK_RULES.filter(r => r.type === "warn").map((r, i) => (
              <li key={i} className="text-xs text-txt-primary leading-relaxed flex items-start gap-2">
                <span className="text-status-yellow mt-0.5 shrink-0">⚠</span>
                {r.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-sm border-2 border-scnat-red/30 bg-scnat-red/5">
          <h3 className="flex items-center gap-2 font-heading font-bold text-scnat-red text-sm mb-3">
            <XCircle className="w-4 h-4" /> Verboten
          </h3>
          <ul className="space-y-2">
            {QUICK_RULES.filter(r => r.type === "dont").map((r, i) => (
              <li key={i} className="text-xs text-txt-primary leading-relaxed flex items-start gap-2">
                <span className="text-scnat-red mt-0.5 shrink-0">✗</span>
                {r.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Sections */}
      <div>
        <h3 className="text-sm font-heading font-bold text-txt-primary mb-3 flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-scnat-red" />
          Vollständige Richtlinien im Detail
        </h3>
        <div className="space-y-2">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isOpen = expanded === section.id;
            return (
              <div key={section.id} className="bg-bg-surface border border-bd-faint rounded-sm">
                <button
                  onClick={() => setExpanded(isOpen ? null : section.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-txt-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  <Icon className="w-4 h-4 text-scnat-red shrink-0" />
                  <span className="text-sm font-heading font-semibold text-txt-primary">{section.titel}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-bd-faint">
                    {section.intro && (
                      <p className="text-xs text-txt-secondary leading-relaxed mb-3">{section.intro}</p>
                    )}

                    {section.regeln && (
                      <ul className="space-y-3">
                        {section.regeln.map((regel, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-sm bg-scnat-red/10 text-scnat-red flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                              {i + 1}
                            </div>
                            <p className="text-xs text-txt-primary leading-relaxed">{regel}</p>
                          </li>
                        ))}
                      </ul>
                    )}

                    {section.datentypen && (
                      <div className="space-y-3">
                        {section.datentypen.map((dt, i) => (
                          <div
                            key={i}
                            className={`rounded-sm p-3 border-2 ${
                              dt.erlaubt
                                ? 'border-status-green/30 bg-status-green/5'
                                : 'border-scnat-red/30 bg-scnat-red/5'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {dt.erlaubt
                                ? <CheckCircle className="w-4 h-4 text-status-green" />
                                : <XCircle className="w-4 h-4 text-scnat-red" />
                              }
                              <h5 className="text-xs font-heading font-bold text-txt-primary">{dt.name}</h5>
                            </div>
                            <p className="text-xs text-txt-secondary leading-relaxed mb-2">{dt.beschreibung}</p>
                            {dt.details && (
                              <ul className="space-y-1 mb-2 ml-2">
                                {dt.details.map((d, j) => (
                                  <li key={j} className="text-xs text-txt-secondary flex items-start gap-2">
                                    <span className="text-scnat-red shrink-0">•</span>{d}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className={`text-xs font-semibold leading-relaxed ${dt.erlaubt ? 'text-status-green' : 'text-scnat-red'}`}>
                              {dt.regel}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Glossar */}
      <div className="bg-bg-surface border border-bd-faint rounded-sm">
        <button
          onClick={() => setExpanded(expanded === 'glossar' ? null : 'glossar')}
          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-elevated transition-colors"
        >
          <ChevronDown className={`w-4 h-4 text-txt-tertiary transition-transform duration-200 ${expanded === 'glossar' ? 'rotate-180' : ''}`} />
          <span className="text-sm font-heading font-semibold text-txt-primary">Offizielle Begriffsdefinitionen (Glossar)</span>
        </button>
        {expanded === 'glossar' && (
          <div className="px-4 pb-4 border-t border-bd-faint pt-3 space-y-2">
            {GLOSSAR.map((g, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <span className="text-xs font-heading font-bold text-txt-primary">{g.term}: </span>
                <span className="text-xs text-txt-secondary leading-relaxed">{g.def}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="bg-bg-elevated border border-bd-faint rounded-sm p-4 flex items-start gap-3">
        <Users className="w-5 h-5 text-scnat-red shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-heading font-bold text-txt-primary mb-1">KI-Spezialist:innen bei Fragen</p>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Bei Unsicherheiten zur Nutzung von KI stehen folgende Personen zur Verfügung:
            <strong className="text-txt-primary"> David Jezdimirovic</strong>,
            <strong className="text-txt-primary"> Anina Steinlin</strong> und
            <strong className="text-txt-primary"> Arber Aziri</strong>.
            Sie können auch kontaktiert werden, wenn neue KI-Tools evaluiert oder Schulungsbedarf besprochen werden soll.
          </p>
        </div>
      </div>
    </section>
  );
}
