import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, ExternalLink,
  Compass, Target, Users, Wrench, GitBranch, AlertTriangle, FileCheck,
  Database, Server, Sparkles, Zap, Activity, Layers,
} from 'lucide-react';
import { CLUSTER_COLORS } from '../../lib/constants';
import SprintTimeline from '../../components/sprints/SprintTimeline';

// ────────────────────────────────────────────────────────────────────────────
//  STATIC CONTENT (mirrors the narrative of next_steps_2026.html)
// ────────────────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  { id: 'hero', label: 'Übersicht' },
  { id: 'massnahmen', label: 'Massnahmen' },
  { id: 'why', label: 'Warum der Hub' },
  { id: 'summary', label: 'Erfolgsfaktoren' },
  { id: 'pillars', label: '3 Säulen' },
  { id: 'ausgangslage', label: 'Stärken / Lücken' },
  { id: 'zeitplan', label: 'Zeitplan' },
  { id: 'risiken', label: 'Risiken' },
  { id: 'antraege', label: 'Anträge GL' },
];

const NUMBERS = [
  { val: '12', label: 'Priorisierte Massnahmen', sub: 'Sprint-tauglich aufbereitet, mit Briefing', color: 'text-scnat-red' },
  { val: '6',  label: 'Handlungscluster',         sub: 'Strategie, Kommunikation, Kultur, Infrastruktur, Prozesse, Daten', color: 'text-purple-400' },
  { val: '3',  label: 'Quartale Umsetzungshorizont', sub: 'Drei Wellen Q2 / Q3 / Q4 2026', color: 'text-status-blue' },
  { val: '8.1',label: 'Ø Score Wirkung × (11 − Aufwand)', sub: 'Primär intern via Change Agent Netzwerk', color: 'text-status-yellow' },
];

const FACTORS = [
  { num: '01 / Multiplikatoren', title: 'Change Agent Netzwerk als aktiver Multiplikator', text: 'Eine Task Force zur Unterstützung der Digitalisierung in allen Abteilungen – nicht als Etikett, sondern mit Zeitbudget und Mandat.', color: 'bg-scnat-red' },
  { num: '02 / Schnittstellen', title: 'Funktionierendes Zusammenspiel mit der IT', text: 'Rollen, Schnittstellen und Reaktionszeiten zwischen Digitalisierung und IT-Betrieb müssen klar definiert sein.', color: 'bg-status-blue' },
  { num: '03 / Mandat',          title: 'Sichtbares Commitment der Geschäftsleitung', text: 'Klares Mandat zu den getroffenen Prioritäten – auch wenn strukturelle Fragen im Hintergrund unbequem werden könnten.', color: 'bg-purple-400' },
];

const STRENGTHS = [
  { title: 'Digitalisierungsplattform bereits vorhanden', text: 'digitalisierung.scnat.ch ist technisch einsatzbereit – mit Toolübersicht, Massnahmentracking, KI-Hub, Schulungskalender und FAQ. Zentraler Info- und Wissenshub, auf den alle Kommunikations- und Befähigungsmassnahmen aufsetzen.' },
  { title: 'Strategie und Prioritäten dokumentiert', text: 'Digitalisierungsstrategie erarbeitet, sechs Handlungsfelder definiert, Massnahmenportfolio nach Wirkung und Aufwand bewertet und sprintweise gegliedert. Jede Massnahme verfügt über vollständiges Briefing.' },
  { title: 'Change Agent Netzwerk konzipiert', text: 'Pro Abteilung eine digital affine Person, ~10 % Zeitbudget, Rolle als Antenne, Multiplikator und Feedbackkanal. Monatliche Change Agent Meetings sichern das Alignment. Aktivierung steht in den kommenden Wochen an.' },
];

const GAPS = [
  { title: 'IT-Kapazität durch PPO & Xojo gebunden', text: 'Das seit zwölf Jahren laufende Xojo-Konsolidierungsprojekt (PPO, Abschluss 2026) bindet nahezu die gesamte IT-Kapazität. Akkumulierter Backlog in Kernsystemen SCNAT-DB und Portal begrenzt operative Reaktionsfähigkeit.' },
  { title: 'Basis-Services nicht durchgängig digital', text: 'Grundlegende Prozesse wie Raumreservation, Abwesenheitsnotizen oder digitale Arbeitsinstrumente sind nicht auf dem Stand, den Mitarbeitende heute erwarten. Cloud-Kollaboration weit von modernen Standards entfernt.' },
  { title: 'Toollandschaft gewachsen, aber ungeordnet', text: 'Zahlreiche Tools sind über die Jahre abteilungsweise eingeführt worden – häufig ausserhalb des formellen Beschaffungsprozesses. Rund zwanzig IT-Ausnahmen im Betrieb. Massnahme M-32 schafft Q3 die Faktenbasis.' },
];

const PILLARS = [
  {
    n: '01',
    title: 'Massnahmen',
    sub: 'Menschen · Kultur · KI · Change',
    desc: 'Die Veränderungsdimension – Wirkung über Befähigung, Prozesse und kulturelle Verankerung.',
    color: '#7C5CBF',
    icon: Users,
  },
  {
    n: '02',
    title: 'DB & Portale',
    sub: 'Kernsysteme · 12+ Jahre Geschichte',
    desc: 'Das organisationsspezifische Rückgrat – langlebig, datenkritisch, modernisierungsbedürftig.',
    color: '#D4882A',
    icon: Database,
  },
  {
    n: '03',
    title: 'Infrastruktur',
    sub: 'On-prem · souverän · modernisierungsbedürftig',
    desc: 'Das Fundament – Server, Netzwerk, Betrieb. Stabil, aber alt und personenabhängig.',
    color: '#EA515A',
    icon: Server,
  },
];

const WAVES = [
  {
    q: 'Welle 1 · Q2 2026', title: 'Fundament & Aktivierung', period: 'April – Juni',
    focus: 'Change Agents aktivieren, Plattform launchen, Kommunikation etablieren, KI-Rahmen setzen.',
    color: 'var(--status-blue)',
    items: [
      ['M-07', 'Ressourcenabklärung', 'laufend bis Mai'],
      ['M-03', 'Kommunikation Digitale Transformation', 'fortlaufend'],
      ['M-30', 'Team Change Agents', 'Aktivierung im Mai'],
      ['M-29', 'Einführung Digitalisierungsplattform', 'Launch Mai / Juni'],
      ['M-05', 'KI-Strategie', 'Erarbeitung Mai / Juni'],
      ['M-06', 'Übersicht digitale Tools', 'Refresh Mai'],
    ],
  },
  {
    q: 'Welle 2 · Q3 2026', title: 'Befähigung & Strukturen', period: 'Juli – September',
    focus: 'KI-Lernpfad ausrollen, Applikationslandschaft klären, Beschaffung professionalisieren, Tool-Audit.',
    color: 'var(--status-yellow)',
    items: [
      ['M-01', 'KI Lernpfad', 'Aufbau & Pilot Juli / August'],
      ['M-02', 'Lead Applikationslandschaft', 'Rollenklärung ab Juni'],
      ['M-08', 'Beschaffungsprozess', 'Definition Juli / August'],
      ['M-32', 'Analyse Tools & Software', 'Audit August / September'],
      ['M-04', 'Prozessdigitalisierung Evergreens', 'Start Juli, drei Teilinitiativen'],
    ],
  },
  {
    q: 'Welle 3 · Q4 2026', title: 'Weichenstellung Kernsystem', period: 'ab Oktober',
    focus: 'Nach Abschluss des Xojo-Projekts: strategische Entscheide zur technologischen Zukunft der Kernsysteme.',
    color: '#7C5CBF',
    items: [
      ['M-31', 'Konzept DB & Portale', 'Konzeptphase Q4'],
      ['···', 'Folgemassnahmen aus Welle 2', 'Umsetzung'],
      ['···', 'Mailserver-Integration Plattform', 'Folgemassnahme M-03'],
    ],
  },
];

const RISKS = [
  { id: 'R-01', title: 'IT-Kapazität strukturell belegt', sev: 'hoch',
    obs: 'Die IT-Abteilung ist durch das seit zwölf Jahren laufende PPO und das Xojo-Konsolidierungsprojekt sowie den akkumulierten Backlog der Kernsysteme SCNAT-DB und Portal nahezu vollständig gebunden. Mehrere hundert offene Tasks dokumentieren diese Lage.',
    mit: 'Zusätzliche Ressourcen sowie externe Dienstleister für klar abgrenzbare Teilleistungen einsetzen, Silvan als Triage-Owner für Applikationsanfragen, Fokus der IT auf Betrieb, PPO-Abschluss und Xojo-Zukunft akzeptieren.' },
  { id: 'R-02', title: 'Reaktionszeiten bei Arbeitsinstrumenten', sev: 'hoch',
    obs: 'Anfragen zur Bereitstellung benötigter Arbeitsinstrumente (Software, Lizenzen, Zugänge) bleiben länger als drei Wochen unbeantwortet. Das verzögert die Arbeitsfähigkeit und sendet unklare Signale an die Belegschaft.',
    mit: 'Definierter Beschaffungsprozess (M-08) mit verbindlichen Reaktions-SLAs, klare Eskalationswege an die GL, vorübergehend externe Beschaffung für Arbeitsinstrumente der Digitalisierungsfunktion.' },
  { id: 'R-03', title: 'Rollenabgrenzung Digitalisierung und IT-Betrieb', sev: 'hoch',
    obs: 'Zwischen der Funktion Digitalisierung und dem IT-Betrieb fehlt aktuell eine formal verankerte Schnittstellenbeschreibung. Das führt zu Unklarheit über Entscheide und Verantwortung.',
    mit: 'Schnellstmöglich seitens GL die Rahmenbedingungen, Verantwortlichkeiten und Kompetenzen definieren: Digitalisierung als Taktgeber und Triage; IT als operativer Betreiber mit Veto in Sicherheits- und Architekturfragen.' },
  { id: 'R-04', title: 'Basis-Services unter modernem Erwartungshorizont', sev: 'mittel',
    obs: 'Grundlegende Services wie Raumreservation, Abwesenheiten und digitale Kollaboration sind nicht auf dem Stand, den Mitarbeitende heute erwarten. Cloud-Kollaboration weit von modernem Standard entfernt.',
    mit: 'Pragmatische Zwischenlösungen auf der Plattform (FAQ, Prozessseiten), parallele Prüfung einer Cloud-Einführung durch IT, gezielte Pilotierung auf Abteilungsebene via Change Agents.' },
  { id: 'R-05', title: 'Know-how in modernen Technologien', sev: 'mittel',
    obs: 'Erfahrung mit Cloud-Native-Architekturen, CI/CD, Container-Betrieb, modernem Web-Stack und KI-Integration ist intern nur punktuell aufgebaut – Folge der Aufgabenverteilung der letzten Jahre.',
    mit: 'Gezielter Einsatz externer Expertise für Wissenstransfer (nicht nur Umsetzung), KI-Spezialisten im Change Agent Netzwerk als interne Katalysatoren, Schulungsbudget nach Xojo-Abschluss.' },
  { id: 'R-06', title: 'Sicherheit zwischen On-Premise und moderner Souveränität', sev: 'mittel',
    obs: 'Die bestehende IT-Strategie setzt stark auf On-Premise-Lösungen. CH-Cloud-Anbieter (Infomaniak, Exoscale) bieten DSG-/DSGVO-Konformität mit Datenhaltung in der Schweiz – ein systematischer Vergleich steht aus.',
    mit: 'Evaluation CH-Cloud-Anbieter entlang konkreter Anwendungsfälle, dokumentierter DSG-Vergleich On-Premise vs. CH-Cloud als Entscheidungsgrundlage. Kein Dogma, sondern situative Wahl.' },
  { id: 'R-07', title: 'Wahrnehmung der Digitalisierungsfunktion', sev: 'mittel',
    obs: 'Neue Digitalisierungsfunktionen werden in gewachsenen IT-Umgebungen oft als Konkurrenz um Zuständigkeiten wahrgenommen. Ohne aktive Gegensteuerung entstehen Reibungsverluste.',
    mit: 'GL-mandatierte Rollenklärung (siehe R-03), transparente Kommunikation der Aufgabenteilung, frühe gemeinsame Erfolge sichtbar machen, Digitalisierung als IT-Entlastung positionieren.' },
  { id: 'R-08', title: 'Plattform-Nutzungsgrad in der Startphase', sev: 'tief',
    obs: 'In der Startphase besteht das Risiko, dass die Digitalisierungsplattform nur von einer digital-affinen Minderheit besucht wird, während der Rest der Belegschaft sie übersieht.',
    mit: 'Koordinierter Launch (M-29), parallele E-Mail-Kommunikation bis Mailserver-Integration, Change Agents als aktive Multiplikatoren, wiederkehrende sichtbare Updates im vierwöchigen Takt.' },
];

const ANTRAEGE = [
  { num: '01', title: 'Portfolio und Prioritäten bestätigen', text: 'Die GL bestätigt das vorliegende Massnahmenportfolio mit Welle 1 (Q2), Welle 2 (Q3) und Welle 3 (Q4). Die Digitalisierungsfunktion arbeitet das Portfolio sprint-basiert ab und berichtet quartalsmässig an die GL. Abweichungen und Blocker werden transparent gemeldet.', color: 'bg-scnat-red', text_color: 'text-scnat-red' },
  { num: '02', title: 'Rollen und Schnittstellen formal klären',  text: 'Die GL klärt formal (vor Q2) die Rollen, Schnittstellen und Entscheidungswege zwischen Digitalisierung und IT-Betrieb, inklusive Reaktions-SLAs für Arbeitsinstrumente und eines Eskalationspfads. Das Ergebnis wird schriftlich festgehalten und gilt vorerst als Arbeitsrahmen.', color: 'bg-status-blue',  text_color: 'text-status-blue' },
  { num: '03', title: 'Entscheid Kernsystem-Zukunft auf Q4 terminieren', text: 'Die GL nimmt den Abschluss des Xojo-Konsolidierungsprojekts (geplant Ende 2026) zum Anlass, den strategischen Entscheid über die technologische Zukunft von SCNAT-DB und Portal (M-31) bewusst auf Q4 zu terminieren. Die Vorbereitung der Entscheidungsgrundlage erfolgt ab Q3.', color: 'bg-purple-400', text_color: 'text-purple-400' },
];

// ────────────────────────────────────────────────────────────────────────────
//  COMPONENTS
// ────────────────────────────────────────────────────────────────────────────

function StickyNav({ active, onJump }) {
  return (
    <div
      className="sticky z-20 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-bg-base/90 backdrop-blur border-b border-bd-faint"
      style={{ top: 49 }}
    >
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        <span className="text-[9px] font-mono uppercase tracking-wider text-txt-tertiary mr-2 whitespace-nowrap">
          Next Steps 2026
        </span>
        {NAV_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onJump(s.id)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-sm transition-colors whitespace-nowrap ${
              active === s.id
                ? 'bg-scnat-red/12 text-scnat-red'
                : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-elevated'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, lead, icon: Icon }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px w-7 bg-bd-default" />
        <span className="text-[10px] font-mono text-txt-tertiary uppercase tracking-[.14em]">{eyebrow}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-txt-tertiary" />}
      </div>
      <h2 className="text-2xl md:text-3xl font-heading font-bold text-txt-primary leading-tight tracking-tight mb-2">
        {title}
      </h2>
      {lead && <p className="text-sm text-txt-secondary leading-relaxed max-w-3xl">{lead}</p>}
    </div>
  );
}

// ── MASSNAHMEN MODULE (live data, compact matrix + Top 6/12) ──────────────
function MassnahmenModule({ data, sprintMap }) {
  const [view, setView] = useState('matrix');
  const [welle, setWelle] = useState('12');
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let r = data.filter(m => !m.isAdminTask);
    if (welle === '6') r = r.filter(m => m.reihenfolge >= 1 && m.reihenfolge <= 6);
    else if (welle === '12') r = r.filter(m => m.reihenfolge >= 1 && m.reihenfolge <= 12);
    return r;
  }, [data, welle]);

  const topList = useMemo(() => {
    return [...filtered]
      .sort((a, b) => (a.reihenfolge ?? 99) - (b.reihenfolge ?? 99))
      .filter(m => m.reihenfolge);
  }, [filtered]);

  const rated = filtered.filter(m => m.wirkung > 0 && m.aufwand > 0);
  const pad = 36;
  const W = 540;
  const H = 280;
  const selectedItem = selected ? filtered.find(m => m.id === selected) : null;

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
      {/* Header / controls */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-bd-faint bg-bg-elevated/30">
        <span className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider">Live aus /massnahmen</span>
        <div className="flex items-center gap-0.5 bg-bg-base border border-bd-faint rounded-sm p-0.5 ml-2">
          {[
            { id: 'matrix', label: 'Wirkung / Aufwand' },
            { id: 'list', label: 'Top-Liste' },
          ].map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors ${
                view === v.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-bg-base border border-bd-faint rounded-sm p-0.5">
          {[
            { value: '', label: 'Alle' },
            { value: '6', label: 'Top 6' },
            { value: '12', label: 'Top 12' },
          ].map(w => (
            <button
              key={w.value}
              onClick={() => setWelle(w.value)}
              className={`px-2 py-1 text-[10px] font-mono rounded-sm transition-colors ${
                welle === w.value
                  ? 'bg-scnat-red/15 text-scnat-red font-medium border border-scnat-red/30'
                  : 'text-txt-tertiary hover:text-txt-secondary border border-transparent'
              }`}
            >
              {w.value ? `★ ${w.label}` : w.label}
            </button>
          ))}
        </div>
        <span className="text-[10px] font-mono text-txt-tertiary ml-auto">
          {filtered.length} Massnahmen
        </span>
        <Link
          to="/massnahmen"
          className="text-[10px] font-mono text-scnat-red hover:text-scnat-red/80 transition-colors flex items-center gap-1"
        >
          Vollansicht <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {view === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-0">
          <div className="p-4">
            <svg viewBox={`0 0 ${W + pad * 2} ${H + pad * 2}`} className="w-full" style={{ overflow: 'visible' }}>
              <rect x={pad} y={pad} width={W / 2} height={H / 2} style={{ fill: 'var(--status-green)' }} fillOpacity="0.04" />
              <rect x={pad + W / 2} y={pad} width={W / 2} height={H / 2} style={{ fill: 'var(--status-yellow)' }} fillOpacity="0.04" />
              <rect x={pad} y={pad + H / 2} width={W / 2} height={H / 2} style={{ fill: 'var(--status-blue)' }} fillOpacity="0.04" />
              <rect x={pad + W / 2} y={pad + H / 2} width={W / 2} height={H / 2} fill="#EA515A" fillOpacity="0.04" />

              <line x1={pad} y1={pad + H / 2} x2={W + pad} y2={pad + H / 2} style={{ stroke: 'var(--border-default)' }} strokeDasharray="4,4" />
              <line x1={pad + W / 2} y1={pad} x2={pad + W / 2} y2={H + pad} style={{ stroke: 'var(--border-default)' }} strokeDasharray="4,4" />
              <line x1={pad} y1={pad} x2={pad} y2={H + pad} style={{ stroke: 'var(--border-default)' }} />
              <line x1={pad} y1={H + pad} x2={W + pad} y2={H + pad} style={{ stroke: 'var(--border-default)' }} />

              <text x={pad + W / 2} y={H + pad + 25} textAnchor="middle" style={{ fill: 'var(--text-secondary)' }} fontSize="10" fontFamily="DM Sans">Aufwand →</text>
              <text transform={`rotate(-90) translate(${-(pad + H / 2)},${pad - 22})`} textAnchor="middle" style={{ fill: 'var(--text-secondary)' }} fontSize="10" fontFamily="DM Sans">Wirkung →</text>

              <text x={pad + W * 0.25} y={pad + H * 0.18} textAnchor="middle" style={{ fill: 'var(--text-tertiary)' }} fontSize="10" fontFamily="DM Sans">Quick Win</text>
              <text x={pad + W * 0.75} y={pad + H * 0.18} textAnchor="middle" style={{ fill: 'var(--text-tertiary)' }} fontSize="10" fontFamily="DM Sans">Strategisch</text>
              <text x={pad + W * 0.25} y={pad + H * 0.82} textAnchor="middle" style={{ fill: 'var(--text-tertiary)' }} fontSize="10" fontFamily="DM Sans">Nice to have</text>
              <text x={pad + W * 0.75} y={pad + H * 0.82} textAnchor="middle" style={{ fill: 'var(--text-tertiary)' }} fontSize="10" fontFamily="DM Sans">Vermeiden</text>

              {rated.map(m => {
                const x = pad + (m.aufwand / 10) * W;
                const y = pad + H - (m.wirkung / 10) * H;
                const color = CLUSTER_COLORS[m.cluster] || '#888';
                const isHover = hover === m.id;
                const isSelected = selected === m.id;
                return (
                  <g key={m.id}
                     onMouseEnter={() => setHover(m.id)}
                     onMouseLeave={() => setHover(null)}
                     onClick={() => setSelected(selected === m.id ? null : m.id)}
                     style={{ cursor: 'pointer' }}>
                    <circle cx={x} cy={y} r={isHover || isSelected ? 7 : 5} fill={color} fillOpacity={isHover || isSelected ? 1 : 0.85} stroke={isSelected || isHover ? 'var(--text-primary)' : 'none'} strokeWidth={2} />
                  </g>
                );
              })}

              {hover && !selected && (() => {
                const m = rated.find(r => r.id === hover);
                if (!m) return null;
                const x = pad + (m.aufwand / 10) * W;
                const y = pad + H - (m.wirkung / 10) * H;
                const tooltipX = x + 12 > W + pad - 180 ? x - 200 : x + 10;
                const tooltipY = y - 30 < pad ? y + 10 : y - 30;
                return (
                  <foreignObject x={tooltipX} y={tooltipY} width="190" height="60" style={{ overflow: 'visible', pointerEvents: 'none' }}>
                    <div xmlns="http://www.w3.org/1999/xhtml" className="bg-bg-elevated border border-bd-default rounded-sm px-2 py-1.5 text-[11px] shadow-lg">
                      <p className="text-txt-primary font-medium leading-tight">{m.titel}</p>
                      <p className="text-txt-tertiary font-mono mt-0.5">{m.id.toUpperCase()} · W:{m.wirkung} A:{m.aufwand}</p>
                    </div>
                  </foreignObject>
                );
              })()}
            </svg>

            {/* Cluster legend */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 px-1">
              {Object.entries(CLUSTER_COLORS).map(([cl, color]) => (
                <span key={cl} className="flex items-center gap-1.5 text-[10px] text-txt-tertiary font-mono">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  {cl}
                </span>
              ))}
            </div>
          </div>

          {/* Side: selected detail or Top list */}
          <div className="lg:w-[280px] lg:shrink-0 lg:border-l border-bd-faint p-4 bg-bg-base/30">
            {selectedItem ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono text-txt-tertiary">{selectedItem.id.toUpperCase()}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                    selectedItem.prioritaet === 'A' ? 'bg-scnat-red/15 text-scnat-red' :
                    selectedItem.prioritaet === 'B' ? 'bg-status-yellow/15 text-status-yellow' :
                    selectedItem.prioritaet === 'C' ? 'bg-status-blue/15 text-status-blue' :
                    'bg-bg-elevated text-txt-tertiary'
                  }`}>Prio {selectedItem.prioritaet}</span>
                  <span className="w-2 h-2 rounded-full" style={{ background: CLUSTER_COLORS[selectedItem.cluster] }} />
                  <span className="text-[10px] text-txt-tertiary truncate">{selectedItem.cluster}</span>
                </div>
                <h4 className="text-sm font-heading font-semibold text-txt-primary">{selectedItem.titel}</h4>
                <p className="text-xs text-txt-secondary leading-relaxed line-clamp-5">{selectedItem.beschreibung}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[9px] font-mono text-txt-tertiary uppercase">Wirkung</p>
                    <p className="text-base font-heading font-semibold text-status-green">{selectedItem.wirkung}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-txt-tertiary uppercase">Aufwand</p>
                    <p className="text-base font-heading font-semibold text-scnat-red">{selectedItem.aufwand}</p>
                  </div>
                </div>
                {sprintMap[selectedItem.id] && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-[#F07800]">
                    <Zap className="w-3 h-3" /> {sprintMap[selectedItem.id].join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider">Top {topList.length} priorisiert</p>
                <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1">
                  {topList.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelected(m.id)}
                      className="w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-sm hover:bg-bg-elevated transition-colors"
                    >
                      <span className="text-[10px] font-mono text-txt-tertiary w-5 shrink-0 pt-0.5">{m.reihenfolge}</span>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: CLUSTER_COLORS[m.cluster] }} />
                      <span className="text-[11px] text-txt-secondary leading-snug">{m.titel}</span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-txt-tertiary italic pt-1">Klick auf einen Punkt in der Matrix oder Liste für Details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-bd-faint">
          {topList.map((m, i) => (
            <div key={m.id} className="bg-bg-surface p-3 hover:bg-bg-elevated transition-colors">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-sm flex items-center justify-center text-[11px] font-heading font-bold bg-scnat-red/15 text-scnat-red">{m.reihenfolge}</div>
                <span className="text-[10px] font-mono text-txt-tertiary">{m.id.toUpperCase()} · Prio {m.prioritaet}</span>
                {m.status === 'in_umsetzung' && (
                  <span className="text-[9px] font-mono bg-status-green/15 text-status-green px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                    <Activity className="w-3 h-3" /> Aktiv
                  </span>
                )}
              </div>
              <h4 className="text-xs font-heading font-semibold text-txt-primary leading-tight mb-1">{m.titel}</h4>
              <div className="flex items-center gap-2 text-[10px] text-txt-tertiary">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: CLUSTER_COLORS[m.cluster] }} />
                <span className="truncate">{m.cluster}</span>
                <span className="ml-auto font-mono text-txt-secondary">W{m.wirkung}/A{m.aufwand}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── KPI / WHY-Module (Donut + 3 Categories) ────────────────────────────────
function WhyModule() {
  // Reason Why donut: 39% Wissen / 29% Transparenz / 25% Prozess / 7% Strategie
  const segs = [
    { pct: 39, color: '#3DAA75', label: 'Wissensvermittlung & Schulung', count: '11 von 28' },
    { pct: 29, color: '#4A90D9', label: 'Transparenz & Kommunikation', count: '8 von 28' },
    { pct: 25, color: '#D4882A', label: 'Prozessoptimierung & Zentralisierung', count: '7 von 28' },
    { pct: 7,  color: 'var(--border-default)', label: 'Rein strategisch / Konzeptarbeit', count: '2 von 28' },
  ];
  const C = 2 * Math.PI * 70; // circumference
  let offset = 0;
  const arcs = segs.map(s => {
    const len = (s.pct / 100) * C;
    const arc = { ...s, dasharray: `${len} ${C - len}`, dashoffset: -offset };
    offset += len;
    return arc;
  });

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-0">
        {/* Donut */}
        <div className="flex flex-col items-center justify-center p-6 lg:border-r border-bd-faint bg-gradient-to-br from-bg-elevated/30 to-transparent">
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r="70" fill="none" stroke="var(--bg-elevated)" strokeWidth="22" />
              {arcs.map((a, i) => (
                <circle
                  key={i}
                  cx="90" cy="90" r="70"
                  fill="none" stroke={a.color} strokeWidth="22"
                  strokeDasharray={a.dasharray}
                  strokeDashoffset={a.dashoffset}
                  transform="rotate(-90 90 90)"
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-heading font-bold text-txt-primary leading-none">28</span>
              <span className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider mt-1">Massnahmen</span>
            </div>
          </div>
          <p className="text-[10px] font-mono text-txt-tertiary mt-3 text-center leading-relaxed">
            Kategorien überlappen bewusst.<br />Mehrfachzuordnung möglich.
          </p>
        </div>

        {/* Stats + legend */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {[
              { v: '86%', l: 'Setzen eine zentrale Plattform voraus', c: 'text-scnat-red',     n: '24 von 28 Massnahmen' },
              { v: '39%', l: 'Sind Schulungs- bzw. Befähigungs-Massnahmen', c: 'text-status-blue', n: '11 von 28 Massnahmen' },
              { v: '25%', l: 'Verlangen Prozesstransparenz & Zentralisierung', c: 'text-status-green', n: '7 von 28 Massnahmen' },
            ].map((s, i) => (
              <div key={i} className="border border-bd-faint rounded-sm p-3 bg-bg-elevated/30">
                <p className={`text-2xl font-heading font-bold leading-none ${s.c}`}>{s.v}</p>
                <p className="text-[11px] text-txt-secondary leading-snug mt-1.5">{s.l}</p>
                <p className="text-[9px] font-mono text-txt-tertiary uppercase tracking-wider mt-1.5">{s.n}</p>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            {arcs.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: a.color }} />
                <span className="text-txt-secondary flex-1">{a.label}</span>
                <span className="font-mono text-txt-tertiary">{a.pct}% · {a.count}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-bd-faint">
            <p className="text-[12px] text-txt-secondary leading-relaxed">
              <span className="text-txt-primary font-medium">Die Plattform ist nicht das Ziel der Digitalisierung – sie ist die Voraussetzung.</span>{' '}
              Was heute über E-Mails, Ordner und Einzelinitiativen läuft, braucht eine gemeinsame Heimat. Sonst bleibt der Plan ein Dokument.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PILLARS ROW ─────────────────────────────────────────────────────────────
function PillarsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {PILLARS.map(p => {
        const Icon = p.icon;
        return (
          <div
            key={p.n}
            className="bg-bg-surface border border-bd-faint rounded-sm p-4 relative overflow-hidden hover:border-bd-strong transition-colors"
            style={{ borderTop: `2px solid ${p.color}` }}
          >
            <div className="flex items-start gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0"
                style={{ background: `${p.color}1f`, color: p.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider">Säule {p.n}</p>
                <h4 className="text-sm font-heading font-semibold text-txt-primary leading-tight">{p.title}</h4>
                <p className="text-[10px] font-mono text-txt-tertiary mt-0.5">{p.sub}</p>
              </div>
            </div>
            <p className="text-xs text-txt-secondary leading-relaxed">{p.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── RISK CARD ───────────────────────────────────────────────────────────────
const SEV_BADGE = {
  hoch:   'bg-scnat-red/12 text-scnat-red border-scnat-red/30',
  mittel: 'bg-status-yellow/12 text-status-yellow border-status-yellow/30',
  tief:   'bg-status-green/12 text-status-green border-status-green/30',
};

function RiskCard({ r, expanded, onToggle }) {
  const meterPct = r.sev === 'hoch' ? 90 : r.sev === 'mittel' ? 60 : 30;
  const meterColor = r.sev === 'hoch' ? 'var(--accent-red)' : r.sev === 'mittel' ? 'var(--status-yellow)' : 'var(--status-green)';

  return (
    <div className={`bg-bg-surface border rounded-sm overflow-hidden transition-colors ${expanded ? 'border-bd-strong' : 'border-bd-faint hover:border-bd-default'}`}>
      <button onClick={onToggle} className="w-full grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 items-center px-4 py-3 text-left hover:bg-bg-elevated/50 transition-colors">
        <span className="text-[11px] font-mono text-txt-tertiary">{r.id}</span>
        <span className="text-sm font-medium text-txt-primary">{r.title}</span>
        <div className="hidden sm:block w-20 h-1 bg-bd-faint rounded-sm overflow-hidden">
          <div className="h-full transition-[width] duration-700" style={{ width: `${meterPct}%`, background: meterColor }} />
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm uppercase tracking-wider border ${SEV_BADGE[r.sev]}`}>{r.sev}</span>
        <ChevronRight className={`w-3.5 h-3.5 text-txt-tertiary transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="border-t border-bd-faint px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-elevated/30">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-wider text-txt-tertiary mb-1.5">Beobachtung</p>
            <p className="text-xs text-txt-secondary leading-relaxed">{r.obs}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono uppercase tracking-wider text-txt-tertiary mb-1.5">Mitigation</p>
            <p className="text-xs text-txt-secondary leading-relaxed">{r.mit}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ────────────────────────────────────────────────────────────────────────────

export default function CpNextSteps() {
  const [massnahmen, setMassnahmen] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [active, setActive] = useState('hero');
  const [expandedRisk, setExpandedRisk] = useState(null);
  const [riskFilter, setRiskFilter] = useState('all');
  const [expandedSprintIds, setExpandedSprintIds] = useState(new Set());
  const sectionRefs = useRef({});

  useEffect(() => {
    fetch('/api/massnahmen', { credentials: 'include' })
      .then(r => r.json())
      .then(setMassnahmen)
      .catch(() => {});
    fetch('/api/sprints', { credentials: 'include' })
      .then(r => r.json())
      .then(setSprints)
      .catch(() => {});
  }, []);

  const sprintMap = useMemo(() => {
    const map = {};
    sprints.forEach(s => {
      (s.massnahmen || []).forEach(sm => {
        if (!map[sm.massnahmeId]) map[sm.massnahmeId] = [];
        map[sm.massnahmeId].push(s.name);
      });
    });
    return map;
  }, [sprints]);

  const activeSprints = useMemo(
    () => sprints.filter(s => !s.isAdminSprint && s.status !== 'completed' && s.status !== 'archived'),
    [sprints]
  );

  const handleJump = useCallback((id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    // Offset = CP header (49px) + sticky section nav (~36px) + small gap
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  // Track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: 0 }
    );
    NAV_SECTIONS.forEach(s => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const toggleSprint = useCallback((id) => {
    setExpandedSprintIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filteredRisks = riskFilter === 'all' ? RISKS : RISKS.filter(r => r.sev === riskFilter);
  const counts = {
    all: RISKS.length,
    hoch: RISKS.filter(r => r.sev === 'hoch').length,
    mittel: RISKS.filter(r => r.sev === 'mittel').length,
    tief: RISKS.filter(r => r.sev === 'tief').length,
  };

  const setRef = (id) => (el) => { if (el) sectionRefs.current[id] = el; };

  return (
    <div className="space-y-12 pb-12">
      <StickyNav active={active} onJump={handleJump} />

      {/* HERO */}
      <section ref={setRef('hero')} id="hero" className="scroll-mt-24 pt-2">
        <div className="text-[10px] font-mono uppercase tracking-[.16em] text-scnat-red mb-2">
          Quartalsplanung Q2 – Q4 2026
        </div>
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-txt-primary leading-[1.05] tracking-tight mb-4">
          Next Steps <span className="text-scnat-red">2026</span>
        </h1>
        <p className="text-sm md:text-base text-txt-secondary leading-relaxed max-w-3xl">
          Massnahmenportfolio, Roadmap und Risiken für die Quartale Q2, Q3 und Q4 2026. Gesamtüberblick über die priorisierten Digitalisierungsmassnahmen der SCNAT, deren zeitliche Verortung sowie eine ehrliche Einschätzung der strukturellen Voraussetzungen, die den Umsetzungserfolg beeinflussen.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-[10px] font-mono uppercase tracking-wider text-txt-tertiary">
          <span>Version <span className="text-txt-secondary normal-case ml-1">1.0</span></span>
          <span>Datum <span className="text-txt-secondary normal-case ml-1">20. April 2026</span></span>
          <span>Status <span className="text-txt-secondary normal-case ml-1">Zur Lektüre Geschäftsleitung</span></span>
          <span>Verfasser <span className="text-txt-secondary normal-case ml-1">Silvan Poltera</span></span>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px mt-8 bg-bd-faint border border-bd-faint rounded-sm overflow-hidden">
          {NUMBERS.map((n, i) => (
            <div key={i} className="bg-bg-surface p-4">
              <p className={`text-3xl md:text-4xl font-heading font-bold leading-none tracking-tight ${n.color}`}>{n.val}</p>
              <p className="text-[9px] font-mono uppercase tracking-wider text-txt-tertiary mt-2">{n.label}</p>
              <p className="text-[11px] text-txt-secondary leading-snug mt-1">{n.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MASSNAHMEN MODULE */}
      <section ref={setRef('massnahmen')} id="massnahmen" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Portfolio · Live"
          icon={Target}
          title="Zwölf Massnahmen, bewertet und priorisiert"
          lead="Identische Datenbasis wie unter /massnahmen – jede Änderung dort erscheint hier automatisch. Matrix Wirkung × Aufwand zur Entscheidungsfindung, Top 6 als Startwelle, Top 12 als Q2–Q4 Portfolio."
        />
        <MassnahmenModule data={massnahmen} sprintMap={sprintMap} />
      </section>

      {/* WHY / KPI */}
      <section ref={setRef('why')} id="why" className="scroll-mt-24">
        <SectionHeader
          eyebrow="The Reason Why"
          icon={Sparkles}
          title="Warum dieser Hub – was die Zahlen sagen"
          lead="Die Analyse aller 28 Massnahmen aus dem Strategieportfolio zeigt: Eine zentrale Plattform ist keine zusätzliche Idee – sie ist die strukturelle Voraussetzung für die Umsetzung. 86 % aller Massnahmen setzen einen gemeinsamen Ort für Information, Schulung und Prozesstransparenz voraus."
        />
        <WhyModule />
      </section>

      {/* MGMT SUMMARY: 3 ERFOLGSFAKTOREN */}
      <section ref={setRef('summary')} id="summary" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Management Summary"
          icon={Compass}
          title="Drei Erfolgsfaktoren entscheiden über die Wirkung"
          lead="Nach der strategischen Vorarbeit der letzten Monate liegt ein priorisiertes, sprint-taugliches Portfolio vor. Strategie, Handlungsfelder und Bewertung sind dokumentiert. Die Plattform digitalisierung.scnat.ch ist technisch einsatzbereit, das Change Agent Netzwerk konzipiert, erste Sprints laufen."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FACTORS.map((f, i) => (
            <div key={i} className="bg-bg-surface border border-bd-faint rounded-sm p-5 relative overflow-hidden hover:border-bd-strong transition-colors">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${f.color}`} />
              <p className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider mb-2">{f.num}</p>
              <h4 className="text-sm font-heading font-semibold text-txt-primary leading-tight mb-2">{f.title}</h4>
              <p className="text-xs text-txt-secondary leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-bg-surface border border-bd-faint border-l-2 border-l-scnat-anthrazit rounded-sm p-4">
          <p className="text-xs text-txt-secondary leading-relaxed">
            <span className="text-txt-primary font-medium">Ehrlicher Blick auf die Risiken:</span>{' '}
            Die grössten Umsetzungsrisiken liegen nicht in den Massnahmen selbst, sondern in den Rahmenbedingungen: eine strukturell überlastete IT mit Fokus auf das auslaufende Xojo-Konsolidierungsprojekt, offene Rollenklärungen zwischen Digitalisierung und IT-Betrieb, und Basis-Infrastruktur (Cloud-Kollaboration, Raumreservation, Abwesenheiten), die erst teilweise auf modernem Stand ist.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section ref={setRef('pillars')} id="pillars" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Drei Säulen · Wechselwirkungen"
          icon={Layers}
          title="Massnahmen, DB & Portale, Infrastruktur – im Zusammenspiel"
          lead="Die Digitalisierung der SCNAT spielt sich auf drei Säulen ab. Sie sind nicht isoliert: Modernisierung der Infrastruktur ermöglicht neue Massnahmen, ein modernisiertes Portal entlastet die Massnahmenarbeit, und kulturelle Befähigung ist die Voraussetzung dafür, dass technische Investitionen Wirkung entfalten. Wer eine Säule ignoriert, schwächt die anderen."
        />
        <PillarsRow />
        <p className="text-[11px] text-txt-tertiary italic mt-3 leading-relaxed">
          → Die nachfolgende Stärken-/Lücken-Analyse betrachtet alle drei Säulen gemeinsam. Die meisten Risiken (siehe unten) entstehen genau an den Schnittstellen.
        </p>
      </section>

      {/* AUSGANGSLAGE */}
      <section ref={setRef('ausgangslage')} id="ausgangslage" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Bestandsaufnahme"
          icon={Wrench}
          title="Ausgangslage – nüchtern betrachtet"
          lead="Eine nüchterne Bestandsaufnahme der digitalen Voraussetzungen bei SCNAT, auf deren Basis die Priorisierung und Sequenzierung der Massnahmen erfolgt."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Stärken */}
          <div className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-bd-faint">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-status-green" />
                <span className="text-sm font-heading font-semibold text-txt-primary">Stärken</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-status-green/12 text-status-green border border-status-green/25">
                Vorhanden / im Aufbau
              </span>
            </div>
            <div className="divide-y divide-bd-faint">
              {STRENGTHS.map((s, i) => (
                <div key={i} className="px-4 py-3">
                  <h5 className="text-xs font-semibold text-txt-primary mb-1">{s.title}</h5>
                  <p className="text-[12px] text-txt-secondary leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Lücken */}
          <div className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-bd-faint">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-status-yellow" />
                <span className="text-sm font-heading font-semibold text-txt-primary">Lücken & Abhängigkeiten</span>
              </div>
              <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm bg-status-yellow/12 text-status-yellow border border-status-yellow/25">
                Adressieren
              </span>
            </div>
            <div className="divide-y divide-bd-faint">
              {GAPS.map((s, i) => (
                <div key={i} className="px-4 py-3">
                  <h5 className="text-xs font-semibold text-txt-primary mb-1">{s.title}</h5>
                  <p className="text-[12px] text-txt-secondary leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ZEITPLAN: 3 WAVES + LIVE GANTT */}
      <section ref={setRef('zeitplan')} id="zeitplan" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Roadmap"
          icon={GitBranch}
          title="Drei Wellen, gestaffelt nach Abhängigkeiten"
          lead="Die Massnahmen sind so sequenziert, dass Abhängigkeiten berücksichtigt werden und in jedem Monat sichtbare Ergebnisse entstehen. Innerhalb eines Clusters laufen Massnahmen so weit sinnvoll parallel, zwischen den Clustern wird gestaffelt."
        />

        {/* Live Gantt module */}
        <div className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden mb-5">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-bd-faint bg-bg-elevated/30">
            <span className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider">Live Sprint-Gantt</span>
            <span className="text-[10px] text-txt-tertiary">·</span>
            <span className="text-[10px] text-txt-tertiary">{activeSprints.length} aktive / geplante Sprints</span>
            <Link
              to="/sprints"
              className="ml-auto text-[10px] font-mono text-scnat-red hover:text-scnat-red/80 transition-colors flex items-center gap-1"
            >
              Sprint-Detailansicht <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          {activeSprints.length > 0 ? (
            <div className="-mx-2 sm:-mx-0">
              <SprintTimeline
                sprints={activeSprints}
                expandedIds={expandedSprintIds}
                onToggle={toggleSprint}
              />
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-txt-tertiary">Sprints werden geladen …</p>
          )}
        </div>

        {/* Three waves narrative cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {WAVES.map((w, i) => (
            <div key={i} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: w.color }} />
              <div className="px-4 pt-4 pb-3 border-b border-bd-faint">
                <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: w.color }}>{w.q}</p>
                <h4 className="text-sm font-heading font-semibold text-txt-primary leading-tight mb-1">{w.title}</h4>
                <p className="text-[11px] font-mono text-txt-tertiary">{w.period}</p>
              </div>
              <div className="px-4 py-3 bg-bg-elevated/40 border-b border-bd-faint">
                <p className="text-[12px] text-txt-secondary leading-relaxed">{w.focus}</p>
              </div>
              <div className="divide-y divide-bd-faint">
                {w.items.map(([id, label, sub], j) => (
                  <div key={j} className="px-4 py-2.5 flex items-start gap-2.5">
                    <span className="text-[10px] font-mono text-txt-tertiary shrink-0 w-9 pt-0.5">{id}</span>
                    <div className="min-w-0">
                      <p className="text-[12px] text-txt-primary leading-tight">{label}</p>
                      <p className="text-[10px] font-mono text-txt-tertiary mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-status-yellow/8 border border-status-yellow/25 rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-status-yellow font-medium mb-1">
            Hinweis zur Realität
          </p>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Dieser Zeitplan gilt explizit als Orientierung. Die aktuellen Voraussetzungen in der SCNAT – insbesondere die IT-Kapazitätssituation – werden eine vollständige Umsetzung in dieser Taktung kaum zulassen.
          </p>
        </div>
      </section>

      {/* RISIKEN */}
      <section ref={setRef('risiken')} id="risiken" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Risiken & Abhängigkeiten"
          icon={AlertTriangle}
          title="Acht Risiken, sachlich benannt"
          lead="Die grössten Risiken liegen nicht in den Massnahmen selbst, sondern in den organisatorischen und technischen Rahmenbedingungen. Die Darstellung benennt diese Risiken sachlich und ohne Schuldzuweisung – mit dem Ziel, sie als gemeinsam zu lösende Herausforderungen auf die GL-Agenda zu bringen."
        />

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mr-1">Filter</span>
          {[
            { k: 'all',    l: `Alle (${counts.all})`,      on: 'border-scnat-red text-scnat-red bg-scnat-red/12' },
            { k: 'hoch',   l: `Hoch (${counts.hoch})`,     on: 'border-scnat-red text-scnat-red bg-scnat-red/12' },
            { k: 'mittel', l: `Mittel (${counts.mittel})`, on: 'border-status-yellow text-status-yellow bg-status-yellow/12' },
            { k: 'tief',   l: `Tief (${counts.tief})`,     on: 'border-status-green text-status-green bg-status-green/12' },
          ].map(({ k, l, on }) => (
            <button
              key={k}
              onClick={() => setRiskFilter(k)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-sm border transition-colors ${
                riskFilter === k
                  ? on
                  : 'border-bd-faint text-txt-secondary hover:border-bd-default hover:text-txt-primary'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredRisks.map(r => (
            <RiskCard
              key={r.id}
              r={r}
              expanded={expandedRisk === r.id}
              onToggle={() => setExpandedRisk(expandedRisk === r.id ? null : r.id)}
            />
          ))}
        </div>
      </section>

      {/* ANTRÄGE GL */}
      <section ref={setRef('antraege')} id="antraege" className="scroll-mt-24">
        <SectionHeader
          eyebrow="Handlungsempfehlung"
          icon={FileCheck}
          title="Drei Anträge an die Geschäftsleitung"
          lead="Aus dem Portfolio, der Zeitplanung und der Risikoanalyse ergeben sich drei konkrete Anträge an die Geschäftsleitung, die über den Erfolg der kommenden Monate entscheiden."
        />

        <div className="bg-scnat-red/8 border border-scnat-red/25 rounded-sm px-5 py-4 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-scnat-red mb-1.5">Kernempfehlung</p>
          <h4 className="text-base font-heading font-semibold text-txt-primary mb-2">Portfolio bestätigen, Rahmenbedingungen aktiv gestalten</h4>
          <p className="text-sm text-txt-secondary leading-relaxed mb-2">
            Das vorliegende Portfolio ist bereit für die Umsetzung. Für die erfolgreiche Realisierung ist nicht nur die Bestätigung der Prioritäten nötig, sondern auch die aktive Adressierung der strukturellen Rahmenbedingungen, insbesondere im Zusammenspiel mit der IT.
          </p>
          <p className="text-sm text-txt-secondary leading-relaxed">
            <span className="text-txt-primary font-semibold">Strategie jetzt umsetzen, parallel die Strukturfragen gezielt angehen.</span>{' '}
            Nicht das eine gegen das andere, sondern beides als Teil derselben Transformation.
          </p>
        </div>

        <div className="space-y-3">
          {ANTRAEGE.map((a, i) => (
            <div key={i} className="bg-bg-surface border border-bd-faint rounded-sm p-5 grid grid-cols-[auto_1fr] gap-5 relative overflow-hidden">
              <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${a.color}`} />
              <div className="flex flex-col items-center min-w-[55px]">
                <p className={`text-3xl font-heading font-bold leading-none ${a.text_color}`}>{a.num}</p>
                <p className="text-[9px] font-mono uppercase tracking-wider text-txt-tertiary mt-1.5">Antrag</p>
              </div>
              <div>
                <h4 className="text-sm font-heading font-semibold text-txt-primary mb-1.5">{a.title}</h4>
                <p className="text-xs text-txt-secondary leading-relaxed">{a.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 bg-bg-surface border border-bd-faint border-l-2 border-l-scnat-red rounded-sm p-5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">Schlussbemerkung</p>
          <p className="text-sm text-txt-secondary leading-relaxed">
            Die Digitalisierung bei SCNAT ist weder ein Sprint noch ein Selbstläufer. Sie verlangt{' '}
            <span className="text-txt-primary font-semibold">Disziplin in der Umsetzung</span> und{' '}
            <span className="text-txt-primary font-semibold">Mut in den Strukturfragen</span>. Das vorliegende Portfolio macht sichtbar, was möglich ist. Die Rahmenbedingungen entscheiden, wie viel davon Wirkung entfaltet.
          </p>
        </div>
      </section>

      <div className="border-t border-bd-faint pt-5 mt-8 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider text-txt-tertiary">
        <span>SCNAT · Digitalisierung · Next Steps 2026 · v1.0 · 20.04.2026</span>
        <span className="normal-case tracking-normal text-txt-secondary">
          Silvan Poltera · <span className="text-txt-tertiary">silvan.poltera@scnat.ch</span>
        </span>
      </div>
    </div>
  );
}
