import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ExternalLink, AlertTriangle, Info } from "lucide-react";

const usageGroups = [
  {
    id: "schreiben",
    label: "Schreiben & Dokumente",
    color: "#006482",
    tools: [
      { name: "Microsoft Office", sub: "Word, Excel, PowerPoint", logo: "microsoft.com", pflicht: true },
      { name: "TemplateServer", sub: "SCNAT Vorlagen (Pflicht)", logo: null, brandColor: "#5A616B", pflicht: true },
      { name: "Apple Office Suite", sub: "Pages, Numbers, Keynote", logo: "apple.com" },
      { name: "iA Writer", sub: "Fokussiertes Schreiben", logo: "ia.net" },
      { name: "BBEdit", sub: "Texteditor", logo: "barebones.com" },
      { name: "Obsidian", sub: "Wissensdatenbank", logo: "obsidian.md" },
    ],
  },
  {
    id: "kommunikation",
    label: "Kommunikation & Meetings",
    color: "#EA515A",
    tools: [
      { name: "Zoom", sub: "Video-Konferenzen (Enterprise)", logo: "zoom.us", pflicht: true },
      { name: "Mail.app", sub: "Offizielle E-Mail (macOS)", logo: "apple.com", pflicht: true },
      { name: "Mitel One", sub: "IP-Telefonie", logo: "mitel.com" },
      { name: "DirectMail Mac", sub: "Newsletter & Mailings", logo: "directmailmac.com" },
      { name: "LinkedIn", sub: "Business-Netzwerk", logo: "linkedin.com" },
      { name: "Bluesky", sub: "Social Media", logo: "bsky.app" },
    ],
  },
  {
    id: "kollaboration",
    label: "Kollaboration & Planung",
    color: "#f18700",
    tools: [
      { name: "Daylite", sub: "Kalender & Tasks", logo: "marketcircle.com" },
      { name: "Mural.co", sub: "Digitales Whiteboard", logo: "mural.co" },
      { name: "Mentimeter", sub: "Live-Umfragen", logo: "mentimeter.com" },
      { name: "remo.cc", sub: "Virtueller Workspace", logo: "remo.co" },
      { name: "Framadate", sub: "Terminplanung (DSGVO)", logo: "framasoft.org" },
      { name: "Omniplan", sub: "Projektplanung", logo: "omnigroup.com" },
    ],
  },
  {
    id: "ki",
    label: "KI & Übersetzung",
    color: "#00836f",
    tools: [
      { name: "ChatGPT", sub: "Business Team (GL-freigegeben)", logo: "openai.com", highlight: true },
      { name: "DeepL", sub: "Translate + Write (15 Lizenzen)", logo: "deepl.com", highlight: true },
      { name: "FLOWIT", sub: "KI-Lernplattform / MEG", logo: "flowit.ch" },
    ],
  },
  {
    id: "kreation",
    label: "Kreation & Medien",
    color: "#EA515A",
    tools: [
      { name: "Adobe Creative Cloud", sub: "Photoshop, Illustrator, InDesign", logo: "adobe.com" },
      { name: "Adobe Acrobat DC", sub: "PDF erstellen & bearbeiten", logo: "adobe.com" },
      { name: "iMovie", sub: "Videobearbeitung", logo: "apple.com" },
      { name: "YouTube", sub: "Video-Publishing", logo: "youtube.com" },
      { name: "Vimeo", sub: "Video-Publishing", logo: "vimeo.com" },
    ],
  },
  {
    id: "finanzen",
    label: "Finanzen & HR",
    color: "#5A616B",
    tools: [
      { name: "Abacus", sub: "Visierung & Stunden", logo: "abacus.ch" },
      { name: "Flexopus", sub: "Shared Desk Booking", logo: "flexopus.com" },
      { name: "Filemaker Pro", sub: "Datenbanken", logo: "claris.com" },
      { name: "Wizehive", sub: "Förderanträge", logo: "wizehive.com" },
    ],
  },
  {
    id: "infrastruktur",
    label: "System & Sicherheit",
    color: "#006482",
    tools: [
      { name: "macOS", sub: "Betriebssystem (alle Geräte)", logo: "apple.com", pflicht: true },
      { name: "Firefox", sub: "Browser", logo: "mozilla.org" },
      { name: "Chrome", sub: "Browser", logo: "google.com" },
      { name: "Forti Client", sub: "VPN-Zugang", logo: "fortinet.com" },
      { name: "Retrospect", sub: "Backup", logo: "retrospect.com" },
      { name: "Jira Service Mgmt", sub: "IT Service Desk", logo: "atlassian.com" },
    ],
  },
  {
    id: "utility",
    label: "Utility & Produktivität",
    color: "#f18700",
    tools: [
      { name: "Alfred App", sub: "Schnellsuche macOS", logo: "alfredapp.com" },
      { name: "Magnet App", sub: "Fensterverwaltung", logo: "magnet.crowdcafe.com" },
      { name: "FlyCut", sub: "Clipboard Manager", logo: null, brandColor: "#5A616B" },
      { name: "Diagrams", sub: "Prozess-Visualisierung", logo: null, brandColor: "#006482" },
      { name: "Unarchiver", sub: "Archivformate", logo: null, brandColor: "#5A616B" },
      { name: "VLC", sub: "Videoplayer", logo: "videolan.org" },
    ],
  },
];

function LogoImg({ tool, size = 32 }) {
  const [error, setError] = useState(false);

  if (!tool.logo || error) {
    return (
      <div
        className="rounded-lg flex items-center justify-center text-white font-bold text-xs"
        style={{ width: size, height: size, background: tool.brandColor || "#5A616B" }}
      >
        {tool.name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${tool.logo}`}
      alt={tool.name}
      width={size}
      height={size}
      className="rounded-lg bg-white"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

export default function ToolMatrix() {
  const [hoveredTool, setHoveredTool] = useState(null);

  return (
    <div className="space-y-8">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-scnat-green" /> Freigegeben
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-scnat-red/10 text-scnat-red text-[9px] font-bold">Pflicht</span>
          Muss verwendet werden
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-scnat-green/10 text-scnat-green text-[9px] font-bold">KI</span>
          KI-Rahmen beachten
        </span>
      </div>

      {/* Groups */}
      {usageGroups.map((group, gi) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: gi * 0.04, duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: group.color }} />
            <h3 className="font-heading font-semibold text-foreground text-sm">{group.label}</h3>
            <span className="text-[10px] text-muted-foreground">{group.tools.length} Tools</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {group.tools.map((tool) => (
              <div
                key={tool.name}
                className="relative group"
                onMouseEnter={() => setHoveredTool(tool.name)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border bg-card transition-all duration-200 cursor-default ${
                    hoveredTool === tool.name
                      ? "border-primary/30 shadow-md scale-[1.02]"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <LogoImg tool={tool} size={28} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">{tool.name}</p>
                      {tool.pflicht && (
                        <span className="shrink-0 px-1 py-0 rounded text-[8px] font-bold bg-scnat-red/10 text-scnat-red leading-tight">
                          Pflicht
                        </span>
                      )}
                      {tool.highlight && (
                        <span className="shrink-0 px-1 py-0 rounded text-[8px] font-bold bg-scnat-green/10 text-scnat-green leading-tight">
                          KI
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{tool.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Footer note */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border flex items-start gap-3">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Diese Übersicht zeigt alle <strong className="text-foreground">freigegebenen Tools</strong> der SCNAT, gruppiert nach Einsatzbereich.
          Für Details zu einzelnen Tools oder den vollständigen Katalog inkl. nicht freigegebener Software wechsle zur Listenansicht.
          Alle Geräte sind <strong className="text-foreground">Mac-basiert</strong> (macOS).
        </p>
      </div>
    </div>
  );
}
