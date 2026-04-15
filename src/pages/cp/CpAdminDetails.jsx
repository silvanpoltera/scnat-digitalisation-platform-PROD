import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, LayoutGrid } from 'lucide-react';

const CARDS = [
  { num: '00', slug: 'uebersicht',            title: 'Übersicht',                              sub: 'Dashboard aller Massnahmen',           accent: 'text-scnat-red',    bg: 'bg-scnat-red/8',    highlight: true },
  { num: '01', slug: 'kommunikation',          title: 'Kommunikation Digitale Transformation',  sub: 'Strategie · Narrativ · Kanäle',        accent: 'text-status-blue',  bg: 'bg-status-blue/8'   },
  { num: '02', slug: 'ressourcen',             title: 'Ressourcenabklärung',                     sub: 'Bedarf · Konzept · Priorisierung',     accent: 'text-status-green', bg: 'bg-status-green/8'  },
  { num: '03', slug: 'change-agents',          title: 'Team Change Agents',                     sub: 'Rollen · Netzwerk · Befähigung',       accent: 'text-purple-400',   bg: 'bg-purple-400/8'    },
  { num: '04', slug: 'plattform',              title: 'Einführung Digitalisierungsplattform',    sub: 'Rollout · Onboarding · Betrieb',       accent: 'text-scnat-red',    bg: 'bg-scnat-red/8'     },
  { num: '05', slug: 'tools',                  title: 'Übersicht digitale Tools',                sub: 'Inventar · Bewertung · Empfehlung',    accent: 'text-status-blue',  bg: 'bg-status-blue/8'   },
  { num: '06', slug: 'db-portale',             title: 'DB & Portale Konzept',                   sub: 'Zukunftskonzept · Technologie',        accent: 'text-amber-400',    bg: 'bg-amber-400/8'     },
  { num: '07', slug: 'ki-strategie',           title: 'KI-Strategie & Befähigung',              sub: 'Strategie · Programm · Governance',    accent: 'text-status-green', bg: 'bg-status-green/8'  },
  { num: '08', slug: 'ki-lernpfad',            title: 'KI Lernpfad',                            sub: 'Befähigung · Module · Praxis',         accent: 'text-purple-400',   bg: 'bg-purple-400/8'    },
  { num: '09', slug: 'analyse-tools',          title: 'Analyse Tools & Software',               sub: 'Evaluation · Kriterien · Vergleich',   accent: 'text-status-blue',  bg: 'bg-status-blue/8'   },
  { num: '10', slug: 'beschaffung',            title: 'Beschaffungsprozess',                    sub: 'Digitalisierung · Prozess · Ablauf',   accent: 'text-scnat-red',    bg: 'bg-scnat-red/8'     },
  { num: '11', slug: 'prozessdigitalisierung', title: 'Prozessdigitalisierung',                 sub: 'Evergreens · Optimierung · Workflows', accent: 'text-amber-400',    bg: 'bg-amber-400/8'     },
  { num: '12', slug: 'applikationslandschaft', title: 'Lead Applikationslandschaft',             sub: 'Governance · Portfolio · Steuerung',   accent: 'text-status-green', bg: 'bg-status-green/8'  },
];


export default function CpAdminDetails() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-scnat-red" /> Admin Details
          </h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            {CARDS.length} Massnahmen-Briefings · Strategie, Tools, KI, Prozesse und mehr
          </p>
        </div>
      </div>

      {/* Overview card */}
      {CARDS.filter(c => c.highlight).map(card => (
        <Link
          key={card.slug}
          to={`/cp/admin-details/${card.slug}`}
          className="block bg-bg-surface border border-bd-faint rounded-sm p-5 mb-5 hover:border-bd-strong transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-sm ${card.bg} flex items-center justify-center shrink-0`}>
              <LayoutGrid className={`w-5 h-5 ${card.accent}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-heading font-semibold text-txt-primary">{card.title}</p>
              <p className="text-[10px] font-mono text-txt-tertiary">{card.sub}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-txt-tertiary shrink-0 transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      ))}

      {/* Massnahmen grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CARDS.filter(c => !c.highlight).map(card => (
          <Link
            key={card.slug}
            to={`/cp/admin-details/${card.slug}`}
            className="bg-bg-surface border border-bd-faint rounded-sm p-4 hover:border-bd-strong transition-colors group flex flex-col"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`text-xs font-mono font-semibold ${card.accent} bg-bg-elevated px-1.5 py-0.5 rounded-sm`}>
                {card.num}
              </span>
              <span className="text-[10px] font-mono text-txt-tertiary truncate">{card.sub}</span>
            </div>
            <p className="text-sm font-heading font-semibold text-txt-primary leading-snug mb-3 flex-1">
              {card.title}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-scnat-red group-hover:text-scnat-red/80 transition-colors">
              Öffnen <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
