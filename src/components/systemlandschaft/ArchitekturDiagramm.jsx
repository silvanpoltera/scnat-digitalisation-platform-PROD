import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const DARK = {
  bg: '#0C0E10', grid: '#1A1D20', zoneLine: '#1E2124', zoneText: '#3A3F48',
  userFill: '#141618', userStroke: '#2A2D34', userIcon: '#5A616B', userIconDim: '#4E535D',
  userLabel: '#5A616B', userSub: '#3A3F48',
  intStroke: '#2A3A4A', intIcon: '#8A9AAA', intLabel: '#AAAAAA', intSub: '#4E535D',
  maBadgeBg: '#0D1C2B', maBadgeStroke: '#3A7AC0', maBadgeText: '#4A8AD0',
  redBadgeBg: '#1A0D0D', redBadgeStroke: '#EA515A', redBadgeFill: '#EA515A',
  conn: '#2A2D34',
  webOuterBg: '#0A1824', webOuterStroke: '#0d3355',
  webBg: '#0D1C2B', webBorder: '#1A4878', webHeader: '#102238', webTitle: '#ECEEF1',
  webModBg: '#091A2A', webModBorder: '#183A5A', webModText: '#3A7AB0', webSub: '#3A4A5A',
  webTagBg: '#071219', webTagBorder: '#183A5A', webTagText: '#2A5A80',
  webGlow: 'rgba(26,100,180,.5)',
  dbOuterBg: '#081A08', dbOuterStroke: '#0A2E0A',
  dbBg: '#0C1C0C', dbBorder: '#1A4820', dbHeader: '#102410', dbTitle: '#ECEEF1',
  dbModBg: '#081508', dbModBorder: '#1A4020', dbModText: '#2A8A50', dbSub: '#2A4A2A',
  dbTagBg: '#060E06', dbTagBorder: '#1A4020', dbTagText: '#1A6030',
  dbGlow: 'rgba(26,120,40,.45)',
  apiBg: '#1A0E0E', apiBorder: '#5A2020', apiBase: '#3A1818',
  apiFlow: '#c04040', apiFlowAlt: '#804040', apiText: '#6A3030', apiHi: '#EA515A',
  neutBg: '#141618', neutBorder: '#2A2D34', neutText: '#8A8F9B', neutLabel: '#6A7080',
  neutTagBg: '#1C1E22', neutTagBorder: '#2A2D34', neutTagText: '#4E535D',
  arrowGray: '#3A3F48',
};

const BRIGHT = {
  bg: '#F2F3F5', grid: '#E2E4E8', zoneLine: '#D0D2D6', zoneText: '#A0A4AC',
  userFill: '#FFFFFF', userStroke: '#D0D2D6', userIcon: '#8A8F9B', userIconDim: '#B0B4BC',
  userLabel: '#8A8F9B', userSub: '#B0B4BC',
  intStroke: '#8AB8D8', intIcon: '#5A7A9A', intLabel: '#4A5A6A', intSub: '#8A8F9B',
  maBadgeBg: '#D6EAF8', maBadgeStroke: '#3A7AC0', maBadgeText: '#2471A3',
  redBadgeBg: '#FEF0F0', redBadgeStroke: '#EA515A', redBadgeFill: '#EA515A',
  conn: '#CDD1D6',
  webOuterBg: '#D6EAF8', webOuterStroke: '#8AB8E0',
  webBg: '#EBF3FA', webBorder: '#7AADE0', webHeader: '#D6EAF8', webTitle: '#1A2A3A',
  webModBg: '#D6E8F7', webModBorder: '#90BFE8', webModText: '#2471A3', webSub: '#5A7A9A',
  webTagBg: '#C5DAF0', webTagBorder: '#90BFE8', webTagText: '#1A5A8A',
  webGlow: 'rgba(36,113,163,.25)',
  dbOuterBg: '#DCF0DC', dbOuterStroke: '#A8D8A8',
  dbBg: '#E8F5E8', dbBorder: '#5AA86A', dbHeader: '#D0EAD0', dbTitle: '#1A2A1A',
  dbModBg: '#D0EAD0', dbModBorder: '#78C088', dbModText: '#1B8A4A', dbSub: '#4A7A4A',
  dbTagBg: '#BFDFBF', dbTagBorder: '#78C088', dbTagText: '#146838',
  dbGlow: 'rgba(27,138,74,.2)',
  apiBg: '#FEF0F0', apiBorder: '#E88080', apiBase: '#E8BABA',
  apiFlow: '#EA515A', apiFlowAlt: '#D88888', apiText: '#C04040', apiHi: '#EA515A',
  neutBg: '#FFFFFF', neutBorder: '#D0D2D6', neutText: '#5A616B', neutLabel: '#5A616B',
  neutTagBg: '#F0F1F3', neutTagBorder: '#D0D2D6', neutTagText: '#7A8090',
  arrowGray: '#9A9FA8',
};

const CONNS = [
  { x1: 115, y1: 84, x2: 222, y2: 345, users: ['konto'] },
  { x1: 280, y1: 84, x2: 265, y2: 345, users: ['partner'] },
  { x1: 292, y1: 84, x2: 560, y2: 345, users: ['partner'], w: .8 },
  { x1: 620, y1: 84, x2: 410, y2: 345, users: ['ma'] },
  { x1: 650, y1: 84, x2: 626, y2: 345, users: ['ma'] },
  { x1: 790, y1: 84, x2: 430, y2: 345, users: ['redak'] },
];

export default function ArchitekturDiagramm({ status }) {
  const { theme } = useTheme();
  const c = theme === 'dark' ? DARK : BRIGHT;
  const [tip, setTip] = useState(null);
  const [hUser, setHUser] = useState(null);

  const showTip = useCallback((e, title, text) => {
    setTip({ title, text, x: e.clientX, y: e.clientY });
  }, []);
  const moveTip = useCallback((e) => {
    setTip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);
  const hideTip = useCallback(() => setTip(null), []);

  const enterUser = useCallback((id, e, title, text) => {
    setHUser(id);
    showTip(e, title, text);
  }, [showTip]);
  const leaveUser = useCallback(() => { setHUser(null); hideTip(); }, [hideTip]);

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden relative">
      <div className="p-4 sm:p-6 pb-2 sm:pb-3">
        <h3 className="text-sm font-heading font-semibold text-txt-primary">Architektur-Übersicht</h3>
        <p className="text-[10px] text-txt-tertiary mt-1 sm:hidden font-mono">← wischen zum erkunden →</p>
      </div>

      <div className="overflow-x-auto pb-4 px-2 sm:px-4">
        <svg viewBox="0 0 920 590" className="w-full min-w-[700px]" style={{ minHeight: 360 }}>
          {/* ── DEFS ── */}
          <defs>
            <marker id="arch-ar" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 L1.5,3.5Z" fill={c.apiHi} />
            </marker>
            <marker id="arch-ad" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
              <path d="M0,0 L7,3.5 L0,7 L1.5,3.5Z" fill={c.conn} />
            </marker>
            <marker id="arch-ag" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 L1.2,3Z" fill={c.arrowGray} />
            </marker>
            <marker id="arch-al" markerWidth="7" markerHeight="7" refX="1.5" refY="3.5" orient="auto">
              <path d="M7,0 L0,3.5 L7,7 L5.5,3.5Z" fill={c.apiHi} />
            </marker>
            <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40,0L0,0 0,40" fill="none" stroke={c.grid} strokeWidth=".5" />
            </pattern>
          </defs>

          {/* ── BACKGROUND ── */}
          <rect width="920" height="590" fill={c.bg} />
          <rect width="920" height="590" fill="url(#arch-grid)" opacity=".6" />

          {/* ── ZONE LABELS ── */}
          <text x="460" y="24" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.zoneText} letterSpacing="2.5">NUTZENDE</text>
          <line x1="30" y1="30" x2="410" y2="30" stroke={c.zoneLine} strokeWidth=".6" />
          <line x1="510" y1="30" x2="890" y2="30" stroke={c.zoneLine} strokeWidth=".6" />

          <text x="460" y="315" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.zoneText} letterSpacing="2.5">KERNSYSTEME</text>
          <line x1="30" y1="321" x2="400" y2="321" stroke={c.zoneLine} strokeWidth=".6" />
          <line x1="520" y1="321" x2="890" y2="321" stroke={c.zoneLine} strokeWidth=".6" />

          <text x="460" y="540" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.zoneText} letterSpacing="2.5">{'OUTPUT & ANBINDUNGEN'}</text>
          <line x1="30" y1="546" x2="395" y2="546" stroke={c.zoneLine} strokeWidth=".6" />
          <line x1="525" y1="546" x2="890" y2="546" stroke={c.zoneLine} strokeWidth=".6" />

          {/* ── USER NODES ── */}

          {/* Konto-User */}
          <g className="arch-unode" transform="translate(115,58)"
            onMouseEnter={(e) => enterUser('konto', e, 'Konto-User', 'Zugriff auf Web-Login, Mitgliederbereiche und Veranstaltungen über das Websystem.')}
            onMouseMove={moveTip} onMouseLeave={leaveUser}>
            <circle r="24" fill={c.userFill} stroke={c.userStroke} strokeWidth="1.3" className="arch-ucirc" />
            <circle cy="-8" r="6.5" fill="none" stroke={c.userIcon} strokeWidth="1.5" />
            <path d="M-11,13 Q-11,1 0,1 Q11,1 11,13" fill="none" stroke={c.userIcon} strokeWidth="1.5" strokeLinecap="round" />
            <text y="40" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="10.5" fill={c.userLabel} className="arch-ulabel">Konto-User</text>
            <text y="52" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.userSub}>extern</text>
          </g>

          {/* Partner */}
          <g className="arch-unode" transform="translate(285,58)"
            onMouseEnter={(e) => enterUser('partner', e, 'Partner', 'Zugriff auf Websystem (Publikationen, Portale) und direkte DB-Schnittstelle für Partnerdaten.')}
            onMouseMove={moveTip} onMouseLeave={leaveUser}>
            <circle r="24" fill={c.userFill} stroke={c.userStroke} strokeWidth="1.3" className="arch-ucirc" />
            <circle cx="-5" cy="-8" r="5.5" fill="none" stroke={c.userIcon} strokeWidth="1.5" />
            <path d="M-14,12 Q-14,1 -5,1 Q4,1 4,12" fill="none" stroke={c.userIcon} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="-9" r="4.5" fill="none" stroke={c.userIconDim} strokeWidth="1" />
            <path d="M3,12 Q4,2 8,2 Q14,2 15,12" fill="none" stroke={c.userIconDim} strokeWidth="1" strokeLinecap="round" />
            <text y="40" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="10.5" fill={c.userLabel} className="arch-ulabel">Partner</text>
            <text y="52" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.userSub}>extern</text>
          </g>

          {/* MA SCNAT */}
          <g className="arch-unode" transform="translate(635,58)"
            onMouseEnter={(e) => enterUser('ma', e, 'MA SCNAT', 'Intern: Zugang zu Websystem und Datenbank über VPN. Lese- und Schreibrechte je nach Rolle.')}
            onMouseMove={moveTip} onMouseLeave={leaveUser}>
            <circle r="24" fill={c.userFill} stroke={c.intStroke} strokeWidth="1.3" className="arch-ucirc" />
            <circle cy="-8" r="6.5" fill="none" stroke={c.intIcon} strokeWidth="1.5" />
            <path d="M-11,13 Q-11,1 0,1 Q11,1 11,13" fill="none" stroke={c.intIcon} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="-16" r="6" fill={c.maBadgeBg} stroke={c.maBadgeStroke} strokeWidth="1.2" />
            <text x="16" y="-12" textAnchor="middle" fontSize="8" fill={c.maBadgeText} fontFamily="'JetBrains Mono',monospace">✦</text>
            <text y="40" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="10.5" fill={c.intLabel} className="arch-ulabel">MA SCNAT</text>
            <text y="52" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.intSub}>intern</text>
          </g>

          {/* Web-Redaktorin */}
          <g className="arch-unode" transform="translate(805,58)"
            onMouseEnter={(e) => enterUser('redak', e, 'Web-Redaktorin', 'Schreibt Inhalte über das CMS, die via Editor API in der SCNAT DB gespeichert werden.')}
            onMouseMove={moveTip} onMouseLeave={leaveUser}>
            <circle r="24" fill={c.userFill} stroke={c.intStroke} strokeWidth="1.3" className="arch-ucirc" />
            <circle cy="-8" r="6.5" fill="none" stroke={c.intIcon} strokeWidth="1.5" />
            <path d="M-11,13 Q-11,1 0,1 Q11,1 11,13" fill="none" stroke={c.intIcon} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="16" cy="-16" r="6" fill={c.redBadgeBg} stroke={c.redBadgeStroke} strokeWidth="1.2" />
            <path d="M13,-19 L18,-14 L16,-12 L11,-17Z" fill={c.redBadgeFill} />
            <text y="40" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="10.5" fill={c.intLabel} className="arch-ulabel">Web-Redaktorin</text>
            <text y="52" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.intSub}>intern</text>
          </g>

          {/* ── USER → SYSTEM CONNECTIONS ── */}
          {CONNS.map((cn, i) => {
            const active = hUser && cn.users.includes(hUser);
            return (
              <line key={i}
                x1={cn.x1} y1={cn.y1} x2={cn.x2} y2={cn.y2}
                stroke={active ? c.apiHi : c.conn}
                strokeWidth={active ? 1.2 : (cn.w || 1)}
                strokeDasharray={active ? '4 4' : '3 6'}
                opacity={active ? .9 : 1}
                markerEnd={active ? 'url(#arch-ar)' : 'url(#arch-ad)'}
                style={{ transition: 'stroke .2s, opacity .2s' }}
              />
            );
          })}

          {/* ── EXTERNE SYSTEME ── */}
          <rect x="315" y="134" width="288" height="52" rx="4" fill={c.neutBg} stroke={c.neutBorder} strokeWidth="1" />
          <text x="459" y="152" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="10" fontWeight="500" fill={c.neutText}>Externe Systeme</text>
          <rect x="326" y="160" width="62" height="14" rx="2" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="357" y="170" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7.5" fill={c.neutTagText}>ScienceGuide</text>
          <rect x="394" y="160" width="40" height="14" rx="2" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="414" y="170" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7.5" fill={c.neutTagText}>Guidle</text>
          <rect x="440" y="160" width="72" height="14" rx="2" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="476" y="170" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7.5" fill={c.neutTagText}>Partnerportale</text>
          <rect x="518" y="160" width="74" height="14" rx="2" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="555" y="170" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7.5" fill={c.neutTagText}>Akademienportal</text>
          <path d="M370,186 Q300,260 210,340" fill="none" stroke={c.conn} strokeWidth=".8" strokeDasharray="3 6" opacity=".4" markerEnd="url(#arch-ag)" />
          <path d="M548,186 Q600,260 660,340" fill="none" stroke={c.conn} strokeWidth=".8" strokeDasharray="3 6" opacity=".4" markerEnd="url(#arch-ag)" />

          {/* ── KERN-BLOCK: WEBSYSTEM SCNAT ── */}
          <g className="arch-pulse-web" style={{ '--pulse-glow': c.webGlow }}>
            <rect x="42" y="340" width="340" height="168" rx="5" fill={c.webOuterBg} stroke={c.webOuterStroke} strokeWidth=".8" opacity=".5" />
            <rect x="48" y="346" width="328" height="156" rx="5" fill={c.webBg} stroke={c.webBorder} strokeWidth="1.5" />
            <rect x="48" y="346" width="328" height="30" rx="5" fill={c.webHeader} />
            <rect x="48" y="362" width="328" height="14" fill={c.webHeader} />
            <text x="212" y="368" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="12" fontWeight="600" fill={c.webTitle} letterSpacing=".3">Websystem SCNAT</text>

            <rect x="64" y="390" width="88" height="26" rx="3" fill={c.webModBg} stroke={c.webModBorder} strokeWidth=".9" />
            <text x="108" y="408" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.webModText}>CMS / Frontend</text>
            <rect x="162" y="390" width="88" height="26" rx="3" fill={c.webModBg} stroke={c.webModBorder} strokeWidth=".9" />
            <text x="206" y="408" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.webModText}>Auth / Accounts</text>
            <rect x="260" y="390" width="88" height="26" rx="3" fill={c.webModBg} stroke={c.webModBorder} strokeWidth=".9" />
            <text x="304" y="408" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.webModText}>Search / Index</text>

            <text x="212" y="436" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9.5" fill={c.webSub}>Darstellung optimiert</text>
            <text x="212" y="449" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9.5" fill={c.webSub}>(repliziert via Push API)</text>

            <rect x="64" y="460" width="56" height="16" rx="2" fill={c.webTagBg} stroke={c.webTagBorder} strokeWidth=".8" />
            <text x="92" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.webTagText}>React/Next</text>
            <rect x="126" y="460" width="46" height="16" rx="2" fill={c.webTagBg} stroke={c.webTagBorder} strokeWidth=".8" />
            <text x="149" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.webTagText}>Xojo CMS</text>
            <rect x="178" y="460" width="52" height="16" rx="2" fill={c.webTagBg} stroke={c.webTagBorder} strokeWidth=".8" />
            <text x="204" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.webTagText}>GraphQL</text>
            <rect x="236" y="460" width="40" height="16" rx="2" fill={c.webTagBg} stroke={c.webTagBorder} strokeWidth=".8" />
            <text x="256" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.webTagText}>Nuxt.js</text>
            <rect x="282" y="460" width="52" height="16" rx="2" fill={c.webTagBg} stroke={c.webTagBorder} strokeWidth=".8" />
            <text x="308" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.webTagText}>Statamic</text>
          </g>

          {/* ── KERN-BLOCK: DATENBANK SCNAT ── */}
          <g className="arch-pulse-db" style={{ '--pulse-glow': c.dbGlow }}>
            <rect x="536" y="340" width="340" height="168" rx="5" fill={c.dbOuterBg} stroke={c.dbOuterStroke} strokeWidth=".8" opacity=".5" />
            <rect x="542" y="346" width="328" height="156" rx="5" fill={c.dbBg} stroke={c.dbBorder} strokeWidth="1.5" />
            <rect x="542" y="346" width="328" height="30" rx="5" fill={c.dbHeader} />
            <rect x="542" y="362" width="328" height="14" fill={c.dbHeader} />
            <text x="706" y="368" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="12" fontWeight="600" fill={c.dbTitle} letterSpacing=".3">Datenbank SCNAT</text>

            <rect x="558" y="390" width="88" height="26" rx="3" fill={c.dbModBg} stroke={c.dbModBorder} strokeWidth=".9" />
            <text x="602" y="408" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.dbModText}>Personen</text>
            <rect x="656" y="390" width="88" height="26" rx="3" fill={c.dbModBg} stroke={c.dbModBorder} strokeWidth=".9" />
            <text x="700" y="408" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.dbModText}>Organisationen</text>
            <rect x="754" y="390" width="88" height="26" rx="3" fill={c.dbModBg} stroke={c.dbModBorder} strokeWidth=".9" />
            <text x="798" y="408" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.dbModText}>Web-Content</text>

            <text x="706" y="436" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9.5" fill={c.dbSub}>Datenmaster:</text>
            <text x="706" y="449" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9.5" fill={c.dbSub}>{'Personen \u00B7 Orgs \u00B7 Web-Content'}</text>

            <rect x="558" y="460" width="46" height="16" rx="2" fill={c.dbTagBg} stroke={c.dbTagBorder} strokeWidth=".8" />
            <text x="581" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.dbTagText}>Xojo DB</text>
            <rect x="610" y="460" width="52" height="16" rx="2" fill={c.dbTagBg} stroke={c.dbTagBorder} strokeWidth=".8" />
            <text x="636" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.dbTagText}>REST API</text>
            <rect x="668" y="460" width="62" height="16" rx="2" fill={c.dbTagBg} stroke={c.dbTagBorder} strokeWidth=".8" />
            <text x="699" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.dbTagText}>{'On-Prem CH \ud83c\udde8\ud83c\udded'}</text>
            <rect x="736" y="460" width="58" height="16" rx="2" fill={c.dbTagBg} stroke={c.dbTagBorder} strokeWidth=".8" />
            <text x="765" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.dbTagText}>Nightly Backup</text>
            <rect x="800" y="460" width="52" height="16" rx="2" fill={c.dbTagBg} stroke={c.dbTagBorder} strokeWidth=".8" />
            <text x="826" y="472" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8" fill={c.dbTagText}>VPN-only</text>
          </g>

          {/* ── API BRIDGES ── */}

          {/* Editor API */}
          <g className="arch-apig"
            onMouseEnter={(e) => showTip(e, 'Editor API', 'Inhalte erstellen und bearbeiten (bidirektional). Redaktorinnen schreiben im CMS, Daten landen in der SCNAT DB. Änderungen fliessen zurück ins Websystem.')}
            onMouseMove={moveTip} onMouseLeave={hideTip}>
            <rect className="arch-fbg" x="388" y="352" width="144" height="22" rx="3" fill={c.apiBg} stroke={c.apiBorder} strokeWidth=".8" opacity=".5" />
            <line className="arch-fbase" x1="376" y1="363" x2="540" y2="363" stroke={c.apiBase} strokeWidth="1.5" />
            <line className="arch-flow" x1="376" y1="363" x2="540" y2="363" stroke={c.apiFlow} strokeWidth="1.5" opacity=".6" markerEnd="url(#arch-ar)" />
            <line className="arch-flow arch-flow-rev" x1="376" y1="359" x2="540" y2="359" stroke={c.apiFlowAlt} strokeWidth="1" opacity=".3" />
            <text className="arch-alabel" x="458" y="368" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.apiText}>{'Editor API  \u21C4'}</text>
          </g>

          {/* Pull API */}
          <g className="arch-apig"
            onMouseEnter={(e) => showTip(e, 'Pull API', 'Websystem liest Daten aus der Datenbank: Personeninfos, Veranstaltungen, Mitgliedschaften. Read-only in diese Richtung.')}
            onMouseMove={moveTip} onMouseLeave={hideTip}>
            <rect className="arch-fbg" x="388" y="393" width="144" height="22" rx="3" fill={c.apiBg} stroke={c.apiBorder} strokeWidth=".8" opacity=".5" />
            <line className="arch-fbase" x1="376" y1="404" x2="540" y2="404" stroke={c.apiBase} strokeWidth="1.5" />
            <line className="arch-flow arch-flow-rev arch-flow-slow" x1="376" y1="404" x2="540" y2="404" stroke={c.apiFlow} strokeWidth="1.5" opacity=".55" markerStart="url(#arch-al)" />
            <text className="arch-alabel" x="458" y="409" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.apiText}>{'Pull API  \u2190'}</text>
          </g>

          {/* Push API */}
          <g className="arch-apig"
            onMouseEnter={(e) => showTip(e, 'Push API', 'Datenbank überträgt Änderungen automatisch an das Websystem – z.B. nach Massenimporten oder Datenbereinigungen.')}
            onMouseMove={moveTip} onMouseLeave={hideTip}>
            <rect className="arch-fbg" x="388" y="434" width="144" height="22" rx="3" fill={c.apiBg} stroke={c.apiBorder} strokeWidth=".8" opacity=".5" />
            <line className="arch-fbase" x1="376" y1="445" x2="540" y2="445" stroke={c.apiBase} strokeWidth="1.5" />
            <line className="arch-flow arch-flow-slow" x1="376" y1="445" x2="540" y2="445" stroke={c.apiFlow} strokeWidth="1.5" opacity=".55" markerEnd="url(#arch-ar)" />
            <text className="arch-alabel" x="458" y="450" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.apiText}>{'Push API  \u2192'}</text>
          </g>

          {/* Account API */}
          <g className="arch-apig"
            onMouseEnter={(e) => showTip(e, 'Account API', 'Nutzerkonten und Berechtigungen synchronisieren. Die SCNAT DB ist die einzige Quelle der Wahrheit für User-Accounts.')}
            onMouseMove={moveTip} onMouseLeave={hideTip}>
            <rect className="arch-fbg" x="388" y="475" width="144" height="22" rx="3" fill={c.apiBg} stroke={c.apiBorder} strokeWidth=".8" opacity=".5" />
            <line className="arch-fbase" x1="376" y1="486" x2="540" y2="486" stroke={c.apiBase} strokeWidth="1.5" />
            <line className="arch-flow arch-flow-fast" x1="376" y1="486" x2="540" y2="486" stroke={c.apiFlow} strokeWidth="1.5" opacity=".4" markerEnd="url(#arch-ar)" />
            <text className="arch-alabel" x="458" y="491" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="8.5" fill={c.apiText}>{'Account API  \u21E2'}</text>
          </g>

          {/* ── IT-APPLIKATIONEN ── */}
          <rect x="20" y="554" width="166" height="28" rx="3" fill={c.neutBg} stroke={c.neutBorder} strokeWidth="1" />
          <text x="103" y="566" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9.5" fontWeight="500" fill={c.neutLabel}>IT-Applikationen</text>
          <rect x="26" y="568" width="28" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="40" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>DNS</text>
          <rect x="58" y="568" width="28" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="72" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>Mail</text>
          <rect x="90" y="568" width="34" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="107" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>Backup</text>
          <rect x="128" y="568" width="28" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="142" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>VPN</text>
          <path d="M103,554 Q103,520 140,514" fill="none" stroke={c.conn} strokeWidth=".8" strokeDasharray="3 6" opacity=".45" markerEnd="url(#arch-ag)" />

          {/* ── PRODUKTE & OUTPUT ── */}
          <rect x="736" y="554" width="168" height="28" rx="3" fill={c.neutBg} stroke={c.neutBorder} strokeWidth="1" />
          <text x="820" y="566" textAnchor="middle" fontFamily="'DM Sans',sans-serif" fontSize="9.5" fontWeight="500" fill={c.neutLabel}>{'Produkte & Output'}</text>
          <rect x="742" y="568" width="48" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="766" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>Web-Portal</text>
          <rect x="794" y="568" width="56" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="822" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>Publikationen</text>
          <rect x="854" y="568" width="40" height="10" rx="1" fill={c.neutTagBg} stroke={c.neutTagBorder} />
          <text x="874" y="576" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="7" fill={c.neutTagText}>Events</text>
          <path d="M820,554 Q800,520 760,514" fill="none" stroke={c.conn} strokeWidth=".8" strokeDasharray="3 6" opacity=".45" markerEnd="url(#arch-ag)" />
          <path d="M740,560 Q600,540 376,510" fill="none" stroke={c.conn} strokeWidth=".7" strokeDasharray="2 6" opacity=".3" />
        </svg>
      </div>

      {/* Consolidation progress */}
      {status?.konsolidierung_prozent != null && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="h-5 bg-bg-elevated rounded-sm overflow-hidden relative">
            <div className="h-full bg-status-green/30 rounded-sm transition-all" style={{ width: `${status.konsolidierung_prozent}%` }} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-status-green">
              Konsolidierung: {status.konsolidierung_prozent}% · Geplant: {status.geplanter_abschluss}
            </span>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: Math.min(tip.x + 14, window.innerWidth - 260),
            top: Math.max(8, Math.min(tip.y - 8, window.innerHeight - 120)),
          }}
        >
          <div className="bg-bg-elevated border border-bd-default rounded px-3 py-2.5 max-w-[240px]" style={{ boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}>
            <p className="text-xs font-heading font-semibold text-txt-primary mb-0.5">{tip.title}</p>
            <p className="text-[11px] text-txt-secondary leading-relaxed">{tip.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
