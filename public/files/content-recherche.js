// Recherche Content Data - Hier können Sie den Content einfach anpassen
const rechercheData = {
    cards: [
        {
            id: 1,
            title: "Infrastruktur & Netzwerk",
            subtitle: "SDSL, Rechenzentrum, Serverlandschaft",
            items: [
                "Eigenes SDSL-Netzwerk (100/100 Mbit, symmetrisch)",
                "Hosting im Schweizer Rechenzentrum (NTS Workspace AG, Bern)",
                "Eigener IP-Block: 32 IPs, 26 aktiv genutzt",
                "Rund 26 Server, darunter:",
                "– proxy.scnat.ch (Reverse Proxy)",
                "– cms1/cms2 (Content Management)",
                "– documents1/2 (DMS)",
                "– cloud.scnat.ch (Collaboration, Fileshare, SMB)",
                "– dapnode.scnat.ch (zentrale Userverwaltung), mdm.scnat.ch (Mobile Device Management)",
                "– prod1/prod2 (Produktivumgebungen), test1/test2 (Testumgebungen)",
                "→ De facto eigenes Mini-Rechenzentrum (Web, Mail, Storage, Backup, MDM, DMS)"
            ]
        },
        {
            id: 2,
            title: "Web-Technologie & Portal",
            items: [
                "Reverse Proxy: OpenResty (Nginx + Lua)",
                "Frontend: React, Webpack, custom State-Management",
                "CDN: Eigenes CDN (portal-cdn.scnat.ch)",
                "Assets: versioniert, signiert",
                "Admin/API-Routen geschützt (307 Redirects)",
                "Keine Dev-Artefakte exponiert (Git, package.json, Sourcemaps geblockt)",
                "Mehrere Plattformdomains (Biologie, Chemie, ProClim, Biodiversität usw.)"
            ]
        },
        {
            id: 3,
            title: "Security (Mail + Web)",
            subtitle: "Mail-Security",
            items: [
                "SPF korrekt & streng",
                "DMARC = p=none (nur Monitoring)",
                "DKIM fehlt → grösstes Risiko",
                "Kein DANE/TLSA",
                "Kein CAA-Record",
                "Mailserver hostet mehrere Akademien gleichzeitig (scnat, a+, SAGW, SAMW)",
                "",
                "Web-Security:",
                "Vorhanden: nosniff, SAMEORIGIN, noopen",
                "Fehlend: CSP, HSTS, Permissions-Policy",
                "XSS-Protection in Ordnung, aber Wirkung limitiert ohne CSP"
            ]
        },
        {
            id: 4,
            title: "Collaboration, Filesharing & Mobile Device Management",
            items: [
                "cloud.scnat.ch:",
                "– Collaboration Suite (interne Kommunikation)",
                "– Fileshare Webaccess",
                "– SMB Network Drives",
                "documents1 / documents2: zentrale Dokumentenablage",
                "userbackup.scnat.ch: Benutzerbackups",
                "mdm.scnat.ch:",
                "– zentrale Smartphone- und Tablet-Verwaltung",
                "– App-Verteilung, Richtlinien, Remote Wipe"
            ]
        },
        {
            id: 5,
            title: "Daten & Publikationen",
            subtitle: "Publishing Setup heute",
            items: [
                "Keine zentrale Publishing-API",
                "PDFs manuell erzeugt, unklare Versionierung",
                "Layouts nicht einheitlich",
                "Metadaten uneinheitlich",
                "Upload ins Portal manuell",
                "Keine End-to-End Publikationspipeline",
                "Newsletter-Tool \"Direct Mail\" → Tracking mit personenbezogenen GET-Parametern (Datenschutzrisiko)"
            ]
        },
        {
            id: 6,
            title: "Betriebsprozesse & DevOps-Reifegrad",
            items: [
                "Kein sichtbares IaC (Terraform/Ansible)",
                "Keine containerisierten Dienste erkennbar",
                "Keine reproduzierbaren Deployments (Test ≠ Prod)",
                "Entwicklungsumgebungen vorhanden, aber nicht integriert (testserver1/2)",
                "Logging/Monitoring punktuell, nicht systemweit konsolidiert",
                "Kein zentrales Build-/Deploy-System sichtbar"
            ]
        }
    ],
    swot: {
        strengths: [
            "Swiss-first Infrastruktur, komplett souverän",
            "Hohe Datensouveränität, keine Cloud-Abhängigkeit",
            "Sehr stabile, robuste Betriebsumgebung",
            "Volle On-Prem Kontrolle (Mail, DNS, Storage, MDM, Portal)",
            "Professionelle Infrastruktur für mittelgrosse Organisation (150–250 User)",
            "Gut gepflegte Webplattform, sauber abgesichert auf Basisebene"
        ],
        weaknesses: [
            "Kein DKIM → E-Mail-Sicherheit unvollständig",
            "Fehlende Security-Header (CSP, HSTS, CAA)",
            "Publikationsprozesse stark manuell und fragmentiert",
            "Keine automatisierten Pipelines (Publishing / Deployment)",
            "Kein IaC → Konfigurationen nicht reproduzierbar",
            "Keine Containerisierung → Monolithische Systeme",
            "Newsletter-Tracking mit Datenschutzrisiko",
            "Dokumenten-Governance inkonsistent, wenig standardisiert"
        ],
        opportunities: [
            "Security-Layer schnell und ohne Kulturbruch modernisierbar",
            "Containerisierung macht Betrieb leichter, reproduzierbar und skalierbar",
            "Infrastructure-as-Code stärkt Souveränität und Transparenz",
            "End-to-End Publishing-Pipeline reduziert Aufwand massiv",
            "Governance-Framework bringt Ordnung in Dokumente & Workflows",
            "Standardisierter Workflow für Berichte, Policy Papers, Übersetzungen",
            "Digitale Swissness-Profilierung (Souveränität + Effizienz)",
            "Effizienzgewinne in allen Bereichen (IT, Kommunikation, Wissenschaftsteams)"
        ],
        threats: [
            "E-Mail-Fälschungen durch fehlendes DKIM",
            "XSS/MITM-Angriffe durch fehlende moderne Header",
            "Wissensverlust bei Schlüsselpersonen (fehlende Automatisierung)",
            "Komplexität und Betriebslast steigen ohne Standardisierung",
            "Inkonsistente Publikationen schwächen Aussenwirkung und Glaubwürdigkeit",
            "Datenschutzprobleme beim Newsletter-Tracking",
            "Langfristige technische Schulden durch manuelle Abläufe"
        ]
    }
};

