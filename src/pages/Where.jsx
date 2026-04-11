import { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader from '../components/PageHeader';

const NODES = [
  {
    id: 'platform', type: 'hub', theme: 'theme-red', color: '#EA515A',
    label: 'SCNAT Plattform', cls: 'node-center',
    tooltip: { type: 'Hub · Eigenentwicklung', title: 'SCNAT Digitalisierungsplattform', text: 'Der zentrale Knotenpunkt. Informationen, Schulungen, Massnahmen, KI-Ressourcen, Systemlandschaft – alles an einem Ort. Verbindet bestehende Systeme und schafft Transparenz.', tags: ['Next.js', 'On-Prem', 'Live bald'] },
    faces: [
      { cls: 'f', icon: 'hub', title: 'SCNAT Plattform', sub: 'Zentraler Hub' },
      { cls: 'b', icon: 'check', title: 'Massnahmen', sub: '28 Massnahmen' },
      { cls: 'r', icon: 'book', title: 'Schulungen', sub: 'Kalender + Anmeldung' },
      { cls: 'l', icon: 'chip', title: 'KI-Hub', sub: 'Learning + Tools' },
      { cls: 't', icon: 'bolt', title: 'Digitalisierung', sub: 'SCNAT' },
    ],
  },
  {
    id: 'jira', type: 'planned', theme: 'theme-info', color: '#4A90D9',
    label: 'Jira + Service Desk', cls: 'node-jira',
    tooltip: { type: 'Geplante Integration · Atlassian', title: 'Jira + Service Desk', text: 'Projektmanagement und Anfragen-Tracking. Die Plattform wird Softwareanträge und Beschaffungsanfragen direkt in Jira Service Desk leiten – ohne Medienbruch.', tags: ['Jira', 'Service Desk', 'API-Integration', 'Geplant'] },
    faces: [
      { cls: 'f', icon: 'grid', title: 'Jira', sub: 'Projektmanagement' },
      { cls: 'b', icon: 'doc', title: 'Service Desk', sub: 'Anfragen-Tracking' },
      { cls: 'r', icon: 'list', title: 'Boards', sub: 'Sprints & Epics' },
      { cls: 'l', icon: 'bell', title: 'Alerts', sub: 'Notifications' },
      { cls: 't', icon: 'box', title: 'Atlassian', sub: 'Jira Suite' },
    ],
  },
  {
    id: 'cms', type: 'existing', theme: 'theme-warn', color: '#D4882A',
    label: 'SCNAT CMS & DB', cls: 'node-cms',
    tooltip: { type: 'Bestehend · Xojo / React', title: 'SCNAT CMS & DB', text: 'Das Herzstück der bestehenden Infrastruktur. 12 Jahre Konsolidierung, Xojo-Backend, React-Frontend. Die Plattform verlinkt und referenziert – greift aber nicht ein.', tags: ['Xojo', 'React', 'On-Prem', 'Eigenentwicklung'] },
    faces: [
      { cls: 'f', icon: 'db', title: 'SCNAT DB', sub: 'Xojo Backend' },
      { cls: 'b', icon: 'edit', title: 'CMS', sub: 'Redaktion' },
      { cls: 'r', icon: 'users', title: 'Mitglieder', sub: 'Stammdaten' },
      { cls: 'l', icon: 'globe', title: 'Portale', sub: 'scnat.ch' },
      { cls: 't', icon: 'signal', title: 'Core System', sub: 'Infrastruktur' },
    ],
  },
  {
    id: 'portals', type: 'existing', theme: 'theme-anth', color: '#5A616B',
    label: 'scnat.ch Portale', cls: 'node-db',
    tooltip: { type: 'Bestehend · Öffentlich', title: 'scnat.ch Portale', text: 'Die öffentlichen Web-Portale der SCNAT. Werden vom CMS befüllt. Die Plattform setzt sie in den Kontext der Digitalisierungsstrategie.', tags: ['Öffentlich', 'Web', 'CMS-getrieben'] },
    faces: [
      { cls: 'f', icon: 'layout', title: 'scnat.ch', sub: 'Hauptportal' },
      { cls: 'b', icon: 'books', title: 'Fachportale', sub: 'Kommissionen' },
      { cls: 'r', icon: 'doc', title: 'News', sub: 'Publikationen' },
      { cls: 'l', icon: 'cal', title: 'Events', sub: 'Veranstaltungen' },
      { cls: 't', icon: 'link', title: 'Portale', sub: 'Öffentlich' },
    ],
  },
  {
    id: 'mail', type: 'existing', theme: 'theme-purple', color: '#7C5CBF',
    label: 'Mail-Infrastruktur', cls: 'node-mail',
    tooltip: { type: 'Bestehend · On-Prem', title: 'Mail-Infrastruktur', text: 'Eigene Mailserver der SCNAT. Die Plattform sendet Schulungsbestätigungen und Antragsbenachrichtigungen via SMTP.', tags: ['SMTP', 'On-Prem', 'Eigene Server'] },
    faces: [
      { cls: 'f', icon: 'mail', title: 'Mail Server', sub: 'On-Premise' },
      { cls: 'b', icon: 'lock', title: 'Security', sub: 'TLS · SPF' },
      { cls: 'r', icon: 'send', title: 'SMTP', sub: 'Ausgehend' },
      { cls: 'l', icon: 'inbox', title: 'Postfächer', sub: 'Mitarbeitende' },
      { cls: 't', icon: 'mail', title: 'Mail', sub: 'SCNAT' },
    ],
  },
  {
    id: 'ki', type: 'existing', theme: 'theme-ok', color: '#3DAA75',
    label: 'KI-Tools', cls: 'node-ki',
    tooltip: { type: 'Extern · KI-Ökosystem', title: 'KI-Tools & Modelle', text: 'ChatGPT, Claude, Gemini und weitere. Die Plattform dokumentiert, bewertet und schult zu diesen Tools.', tags: ['ChatGPT', 'Claude', 'LLM Radar', 'Guidelines'] },
    faces: [
      { cls: 'f', icon: 'chat', title: 'ChatGPT', sub: 'OpenAI' },
      { cls: 'b', icon: 'brain', title: 'Claude', sub: 'Anthropic' },
      { cls: 'r', icon: 'star', title: 'Gemini', sub: 'Google' },
      { cls: 'l', icon: 'chart', title: 'LLM Radar', sub: 'Vergleich' },
      { cls: 't', icon: 'star', title: 'KI-Tools', sub: 'Ökosystem' },
    ],
  },
  {
    id: 'collab', type: 'existing', theme: 'theme-anth', color: '#5A616B',
    label: 'Collaboration-Tools', cls: 'node-teams',
    tooltip: { type: 'Bestehend · Collaboration', title: 'Digitale Zusammenarbeit', text: 'Collaboration-Tools der SCNAT. Die Plattform zeigt welche Tools offiziell erlaubt sind, wofür sie eingesetzt werden – und gibt Schulungen dazu.', tags: ['Systemlandschaft', 'Erlaubte Tools', 'Ranking'] },
    faces: [
      { cls: 'f', icon: 'chat', title: 'Collaboration', sub: 'Chat & Video' },
      { cls: 'b', icon: 'folder', title: 'Ablage', sub: 'Dateistruktur' },
      { cls: 'r', icon: 'cal', title: 'Kalender', sub: 'Termine' },
      { cls: 'l', icon: 'doc', title: 'Dokumente', sub: 'Zusammenarbeit' },
      { cls: 't', icon: 'signal', title: 'Tools', sub: 'Genehmigt' },
    ],
  },
  {
    id: 'future', type: 'future', theme: 'theme-future', color: '#2A2D34',
    label: 'Weitere Integrationen', cls: 'node-future',
    tooltip: { type: 'Zukunft · Offen', title: 'Weitere Integrationen', text: 'HR-Systeme, ERP, externe Akademie-Portale – was noch kommt. Die Plattform ist als offener Hub gebaut.', tags: ['API-ready', 'Zukunft', 'Erweiterbar'] },
    faces: [
      { cls: 'f', icon: 'plus', title: 'Future', sub: 'Kommend' },
      { cls: 'b', icon: 'briefcase', title: 'HR-Systeme', sub: 'Geplant' },
      { cls: 'r', icon: 'users', title: 'Akademien', sub: 'Verbünde' },
      { cls: 'l', icon: 'pulse', title: 'ERP', sub: 'Evaluation' },
      { cls: 't', icon: 'trending', title: 'Mehr', sub: 'API-ready' },
    ],
  },
];

const CONNECTIONS = [
  { id: 'jira',    color: 'rgba(74,144,217,0.5)',  dash: '6,4', width: 1.5 },
  { id: 'cms',     color: 'rgba(212,136,42,0.4)',   dash: '4,4', width: 1.2 },
  { id: 'portals', color: 'rgba(90,97,107,0.35)',   dash: '3,5', width: 1 },
  { id: 'mail',    color: 'rgba(124,92,191,0.4)',   dash: '5,4', width: 1.2 },
  { id: 'ki',      color: 'rgba(61,170,117,0.45)',  dash: '4,3', width: 1.5 },
  { id: 'collab',  color: 'rgba(90,97,107,0.3)',    dash: '3,5', width: 1 },
  { id: 'future',  color: 'rgba(90,97,107,0.2)',    dash: '2,6', width: 0.8 },
];

const INTEGRATIONS = [
  { status: 'live', title: 'SCNAT Mail-Server → Plattform', desc: 'Schulungsbestätigungen, Antragsbenachrichtigungen und Admin-Alerts werden via eigenem SMTP-Server versandt.', features: ['Bestätigungs-Mail bei Schulungsanmeldung', 'Benachrichtigung bei Softwareantrag', 'Admin-Alert bei neuen Einträgen'] },
  { status: 'live', title: 'SCNAT DB → Systemlandschaft', desc: 'Die Systemlandschaft der Plattform dokumentiert und verlinkt die bestehende DB-Infrastruktur.', features: ['Übersicht Applikationen & Status', 'Offene Entscheide dokumentiert', 'Backlog-Tracking für IT'] },
  { status: 'live', title: 'Software-Voting → Systemlandschaft', desc: 'Mitarbeitende bewerten Tools direkt in der Plattform. Ergebnisse fliessen in Beschaffungsentscheide.', features: ['Thumbs Up/Down für erlaubte Tools', 'Interessens-Voting für neue Tools', 'Automatisches Ranking'] },
  { status: 'planned', title: 'Plattform → Jira Service Desk', desc: 'Softwareanträge und Beschaffungsanfragen werden direkt als Jira-Tickets erstellt.', features: ['Antrag in Plattform ausfüllen', 'Automatisch als Jira-Issue erstellt', 'Status-Updates zurück in Plattform'] },
  { status: 'planned', title: 'Plattform → Jira Projektmanagement', desc: 'Massnahmen aus dem Massnahmenplan werden als Jira-Epics/Stories abgebildet.', features: ['Massnahmen als Jira-Epics', 'Status-Sync bidirektional', 'Fortschritt sichtbar für alle'] },
  { status: 'future', title: 'Weitere Anbindungen', desc: 'Die Plattform ist von Grund auf API-ready gebaut. Neue Integrationen ohne Umbau möglich.', features: ['REST API-Struktur vorhanden', 'Auth-System erweiterbar', 'JSON-Storage einfach migrierbar'] },
];

const LEGEND = [
  { color: '#EA515A', title: 'Hub (SCNAT Plattform)', desc: 'Zentraler Knotenpunkt – sammelt, verbindet, kommuniziert' },
  { color: '#5A616B', title: 'Bestehende Systeme', desc: 'Laufen weiter – Plattform schafft Sichtbarkeit' },
  { color: '#4A90D9', title: 'Geplante Integration', desc: 'API-Anbindung in Vorbereitung (z.B. Jira)' },
  { color: '#4E535D', title: 'Zukünftige Anbindungen', desc: 'Plattform ist offen gebaut – erweiterbar' },
];

function FaceIcon({ icon }) {
  const icons = {
    hub: <><circle cx="12" cy="12" r="3"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><line x1="6" y1="6.5" x2="10.5" y2="10.5"/><line x1="18" y1="6.5" x2="13.5" y2="10.5"/><line x1="6" y1="17.5" x2="10.5" y2="13.5"/><line x1="18" y1="17.5" x2="13.5" y2="13.5"/></>,
    check: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
    chip: <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/></>,
    bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    box: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>,
    db: <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    signal: <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></>,
    books: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
    cal: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
    chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
    brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    chart: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    folder: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>,
    plus: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    pulse: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    trending: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {icons[icon] || icons.hub}
    </svg>
  );
}

export default function Where() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });
  const [pausedNodes, setPausedNodes] = useState(new Set());
  const sceneRef = useRef(null);
  const svgRef = useRef(null);
  const nodeRefs = useRef({});

  const drawConnections = useCallback(() => {
    const svg = svgRef.current;
    const scene = sceneRef.current;
    if (!svg || !scene) return;
    const sr = scene.getBoundingClientRect();
    svg.innerHTML = '';
    svg.setAttribute('viewBox', `0 0 ${scene.offsetWidth} ${scene.offsetHeight}`);

    const centerEl = nodeRefs.current['platform'];
    if (!centerEl) return;

    function getCenter(el) {
      const r = el.getBoundingClientRect();
      return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 };
    }

    const c = getCenter(centerEl);

    CONNECTIONS.forEach(link => {
      const el = nodeRefs.current[link.id];
      if (!el) return;
      const p = getCenter(el);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', c.x); line.setAttribute('y1', c.y);
      line.setAttribute('x2', p.x); line.setAttribute('y2', p.y);
      line.setAttribute('stroke', link.color);
      line.setAttribute('stroke-width', link.width);
      line.setAttribute('stroke-dasharray', link.dash);

      const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
      anim.setAttribute('attributeName', 'stroke-dashoffset');
      anim.setAttribute('from', '0');
      anim.setAttribute('to', link.id === 'jira' ? '-20' : '20');
      anim.setAttribute('dur', link.id === 'future' ? '3s' : '1.5s');
      anim.setAttribute('repeatCount', 'indefinite');
      line.appendChild(anim);
      svg.appendChild(line);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y); dot.setAttribute('r', '4');
      dot.setAttribute('fill', link.color); dot.setAttribute('opacity', '0.8');
      svg.appendChild(dot);
    });

    const cdot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    cdot.setAttribute('cx', c.x); cdot.setAttribute('cy', c.y); cdot.setAttribute('r', '6');
    cdot.setAttribute('fill', 'rgba(234,81,90,0.8)');
    svg.appendChild(cdot);
  }, []);

  useEffect(() => {
    const timer = setTimeout(drawConnections, 400);
    window.addEventListener('resize', drawConnections);
    return () => { clearTimeout(timer); window.removeEventListener('resize', drawConnections); };
  }, [drawConnections]);

  const handleMouseEnter = (node, e) => {
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, node });
  };
  const handleMouseMove = (e) => {
    if (tooltip.visible) setTooltip(t => ({ ...t, x: e.clientX + 16, y: e.clientY - 60 }));
  };
  const handleMouseLeave = () => setTooltip(t => ({ ...t, visible: false }));
  const handleClick = (nodeId) => {
    setPausedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  return (
    <div className="min-h-screen relative">
      <style>{`
        .grid-bg-where{position:fixed;inset:0;background-image:linear-gradient(var(--b-faint,#1E2124) 1px,transparent 1px),linear-gradient(90deg,var(--b-faint,#1E2124) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 100% 100% at 50% 0%,black 0%,transparent 75%);pointer-events:none;z-index:0;opacity:.4}
        .glow-where{position:fixed;top:0;left:50%;transform:translateX(-50%);width:800px;height:400px;background:radial-gradient(ellipse at 50% 0%,rgba(234,81,90,0.05) 0%,transparent 70%);pointer-events:none;z-index:0}
        @keyframes floatCube{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes floatCubeCenter{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-10px)}}
        @keyframes floatCubeHalf{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-8px)}}
        @keyframes spinSlow{from{transform:rotateX(-15deg) rotateY(0deg)}to{transform:rotateX(-15deg) rotateY(360deg)}}
        .cube-node{position:absolute;width:150px;cursor:pointer;z-index:2;animation:floatCube 5s ease-in-out infinite}
        .cube-node:hover{filter:brightness(1.3);z-index:10}
        .cube-node:hover .cube-inner{animation-play-state:paused}
        .cube-inner{width:150px;height:150px;transform-style:preserve-3d;animation:spinSlow 20s linear infinite}
        .face{position:absolute;width:150px;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem;text-align:center;backface-visibility:hidden;border:1px solid}
        .face.f{transform:translateZ(75px)}.face.b{transform:rotateY(180deg) translateZ(75px)}.face.r{transform:rotateY(90deg) translateZ(75px)}.face.l{transform:rotateY(-90deg) translateZ(75px)}.face.t{transform:rotateX(90deg) translateZ(75px)}
        .node-center{left:50%;top:42%;transform:translateX(-50%);animation-name:floatCubeCenter;animation-duration:6s}
        .node-center .cube-inner{animation-duration:25s;width:180px;height:180px}
        .node-center .face{width:180px;height:180px}
        .node-center .face.f{transform:translateZ(90px)}.node-center .face.b{transform:rotateY(180deg) translateZ(90px)}.node-center .face.r{transform:rotateY(90deg) translateZ(90px)}.node-center .face.l{transform:rotateY(-90deg) translateZ(90px)}.node-center .face.t{transform:rotateX(90deg) translateZ(90px)}
        .node-jira{left:5%;top:18%;animation-delay:.4s;animation-duration:5.5s}
        .node-cms{left:28%;top:5%;animation-delay:.8s;animation-duration:6.2s}
        .node-db{left:62%;top:5%;animation-delay:.2s;animation-duration:5.8s}
        .node-mail{left:82%;top:18%;animation-delay:1s;animation-duration:6.4s}
        .node-ki{left:78%;top:62%;animation-delay:.6s;animation-duration:5.3s}
        .node-teams{left:50%;top:72%;transform:translateX(-50%);animation-name:floatCubeHalf;animation-delay:1.2s;animation-duration:6.1s}
        .node-future{left:5%;top:62%;animation-delay:.3s;animation-duration:5.7s}
        .theme-red .face{background:rgba(234,81,90,.10);border-color:rgba(234,81,90,.45)}.theme-red .face.t{background:rgba(234,81,90,.18)}
        .theme-info .face{background:rgba(74,144,217,.08);border-color:rgba(74,144,217,.4)}.theme-info .face.t{background:rgba(74,144,217,.15)}
        .theme-ok .face{background:rgba(61,170,117,.07);border-color:rgba(61,170,117,.38)}.theme-ok .face.t{background:rgba(61,170,117,.14)}
        .theme-warn .face{background:rgba(212,136,42,.07);border-color:rgba(212,136,42,.38)}.theme-warn .face.t{background:rgba(212,136,42,.14)}
        .theme-anth .face{background:rgba(90,97,107,.10);border-color:rgba(90,97,107,.4)}.theme-anth .face.t{background:rgba(90,97,107,.18)}
        .theme-purple .face{background:rgba(124,92,191,.08);border-color:rgba(124,92,191,.4)}.theme-purple .face.t{background:rgba(124,92,191,.15)}
        .theme-future .face{background:rgba(90,97,107,.05);border-color:rgba(90,97,107,.2);color:var(--text3,#4E535D)}.theme-future .face.t{background:rgba(90,97,107,.08)}
        @media(max-width:768px){
          .cube-node{width:110px}
          .cube-inner{width:110px!important;height:110px!important}
          .face{width:110px!important;height:110px!important;padding:.6rem}
          .face.f{transform:translateZ(55px)!important}.face.b{transform:rotateY(180deg) translateZ(55px)!important}.face.r{transform:rotateY(90deg) translateZ(55px)!important}.face.l{transform:rotateY(-90deg) translateZ(55px)!important}.face.t{transform:rotateX(90deg) translateZ(55px)!important}
          .node-center .cube-inner{width:130px!important;height:130px!important}
          .node-center .face{width:130px!important;height:130px!important}
          .node-center .face.f{transform:translateZ(65px)!important}.node-center .face.b{transform:rotateY(180deg) translateZ(65px)!important}.node-center .face.r{transform:rotateY(90deg) translateZ(65px)!important}.node-center .face.l{transform:rotateY(-90deg) translateZ(65px)!important}.node-center .face.t{transform:rotateX(90deg) translateZ(65px)!important}
          .node-center{top:38%}.node-jira{left:2%;top:8%}.node-cms{left:28%;top:2%}.node-db{left:56%;top:2%}.node-mail{left:78%;top:8%}.node-ki{left:74%;top:56%}.node-teams{top:68%}.node-future{left:2%;top:56%}
        }
      `}</style>
      <div className="grid-bg-where" />
      <div className="glow-where" />

      {/* Hero */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-8">
        <div className="font-mono text-[11px] uppercase tracking-[.14em] text-scnat-red mb-4">
          Plattform-Architektur · Systemlandschaft
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-none mb-4">
          <span className="text-scnat-red">Where</span> does<br />it fit?
        </h1>
        <p className="text-[15px] text-txt-secondary leading-relaxed max-w-[560px] mb-3">
          Die Digitalisierungsplattform ist keine Insel. Sie ist der zentrale Knotenpunkt – sichtbar für alle, verbunden mit den Systemen die bereits existieren und jenen die noch kommen.
        </p>
        <div className="font-mono text-[10px] text-txt-tertiary tracking-wide">
          Würfel rotieren automatisch · Hover für Details · Klick zum Pausieren
        </div>
      </div>

      {/* 3D Scene */}
      <div className="relative z-[1] w-full max-w-[1100px] mx-auto px-4 md:px-8 flex flex-col items-center">
        <div className="font-mono text-[10px] uppercase tracking-[.14em] text-txt-tertiary mb-6 self-start pl-4">
          Systemlandschaft · Interaktive 3D-Übersicht
        </div>

        <div ref={sceneRef} className="relative w-full max-w-[960px] h-[560px] md:h-[560px]" style={{ perspective: 1400, perspectiveOrigin: '50% 35%' }}>
          <svg ref={svgRef} className="absolute inset-0 pointer-events-none z-[1]" />

          {NODES.map(node => (
            <div
              key={node.id}
              ref={el => nodeRefs.current[node.id] = el}
              className={`cube-node ${node.cls} ${node.theme}`}
              style={{ transformStyle: 'preserve-3d' }}
              onMouseEnter={e => handleMouseEnter(node, e)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(node.id)}
            >
              <div className="cube-inner" style={pausedNodes.has(node.id) ? { animationPlayState: 'paused' } : undefined}>
                {node.faces.map(face => (
                  <div key={face.cls} className={`face ${face.cls}`}>
                    <div className="w-7 h-7 mb-2 opacity-90 shrink-0"><FaceIcon icon={face.icon} /></div>
                    <div className="text-[11px] font-bold tracking-wide leading-snug">{face.title}</div>
                    <div className="text-[9px] mt-1 opacity-70 leading-snug">{face.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="w-full max-w-[960px] grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 px-4">
          {LEGEND.map(l => (
            <div key={l.title} className="bg-bg-surface border border-bd-faint rounded-[3px] p-3 flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-sm shrink-0 mt-1" style={{ background: l.color }} />
              <div>
                <div className="text-[13px] font-semibold mb-0.5">{l.title}</div>
                <div className="text-[11px] text-txt-secondary leading-snug">{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="relative z-[1] max-w-[960px] mx-auto px-4 md:px-8 pt-12 pb-4">
        <div className="font-mono text-[10px] uppercase tracking-[.14em] text-txt-tertiary mb-6">
          Integration im Detail
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-bd-faint border border-bd-faint rounded-md overflow-hidden mb-12">
          {INTEGRATIONS.map((int, i) => (
            <div key={i} className="bg-bg-surface p-6 relative hover:bg-bg-elevated transition-colors">
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${int.status === 'live' ? 'bg-[#3DAA75]' : int.status === 'planned' ? 'bg-[#D4882A]' : 'bg-bd-default'}`} />
              <div className={`font-mono text-[9px] uppercase tracking-wider mb-2.5 ${int.status === 'live' ? 'text-[#3DAA75]' : int.status === 'planned' ? 'text-[#D4882A]' : 'text-txt-tertiary'}`}>
                {int.status === 'live' ? '● Live bei Launch' : int.status === 'planned' ? '◐ Geplant – Phase 2' : '○ Zukunft · Offen'}
              </div>
              <div className="font-semibold text-[15px] mb-1.5">{int.title}</div>
              <div className="text-[13px] text-txt-secondary leading-relaxed mb-3">{int.desc}</div>
              <div className="flex flex-col gap-1">
                {int.features.map((f, j) => (
                  <div key={j} className="text-[11px] text-txt-secondary flex items-start gap-1.5">
                    <span className="text-txt-tertiary shrink-0">→</span>{f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div className="relative z-[1] max-w-[960px] mx-auto px-4 md:px-8 pb-24">
        <div className="bg-scnat-red/8 border border-scnat-red/20 rounded p-8">
          <h3 className="text-base font-semibold mb-2.5">Eine Plattform mehr – aber die richtige.</h3>
          <p className="text-[14px] text-txt-secondary leading-relaxed">
            Es stimmt: eine weitere Plattform im Stack. Aber sie ist das einzige System, das <strong className="text-txt-primary">ausschliesslich für Sichtbarkeit und Verbindung</strong> gebaut ist – nicht für Datenhaltung, nicht für Produktion, nicht für Kernsysteme. Sie tritt keinem bestehenden System in die Quere. Sie macht sichtbar was existiert, schult was gebraucht wird, verbindet was getrennt ist – und öffnet die Tür für geordnete Integrationen in bestehende Workflows wie Jira.
          </p>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.node && (
        <div
          className="fixed z-[500] bg-bg-elevated border border-bd-default rounded p-4 min-w-[220px] max-w-[280px] pointer-events-none shadow-2xl"
          style={{
            left: Math.min(tooltip.x, window.innerWidth - 300),
            top: Math.max(10, Math.min(tooltip.y, window.innerHeight - 200)),
          }}
        >
          <div className={`font-mono text-[9px] uppercase tracking-wider mb-2 ${
            tooltip.node.tooltip.type.includes('Geplant') ? 'text-[#D4882A]' :
            tooltip.node.tooltip.type.includes('Hub') ? 'text-scnat-red' :
            tooltip.node.tooltip.type.includes('Zukunft') ? 'text-txt-tertiary' : 'text-[#4A90D9]'
          }`}>
            {tooltip.node.tooltip.type}
          </div>
          <div className="text-[15px] font-semibold mb-1.5">{tooltip.node.tooltip.title}</div>
          <div className="text-[13px] text-txt-secondary leading-relaxed">{tooltip.node.tooltip.text}</div>
          <div className="flex flex-wrap gap-1 mt-2.5">
            {tooltip.node.tooltip.tags.map(t => (
              <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 border border-bd-default rounded-sm text-txt-tertiary">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
