import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, PieChart, Box, ArrowRight, ChevronRight, FolderOpen } from 'lucide-react';

const CARDS = [
  {
    num: '01',
    section: 'Strategische Einordnung',
    title: 'The Frame',
    sub: 'Der digitale Rahmen · Gesamtbild',
    desc: 'Die Digitalisierungsstrategie ist eingebettet in einen Kontext, den sie nur teilweise adressiert – und der langfristig über ihren Erfolg entscheidet.',
    primary: { to: '/cp/admin-stuff/frame', label: 'Öffnen' },
    secondary: { to: '/cp/admin-stuff/frame#probleme', label: 'Zu den Problemen' },
    visual: 'layers',
    quickIcon: Layers,
    quickColor: 'text-scnat-red',
    accentBg: 'bg-scnat-red/8',
  },
  {
    num: '02',
    section: 'Analyse & Begründung',
    title: 'The Reason Why',
    sub: 'Was die Zahlen sagen · Pitch-Unterlage',
    desc: '28 Massnahmen analysiert. 86% setzen voraus, dass Informationen aktiv geteilt werden – heute gibt es dafür keine gemeinsame Lösung.',
    primary: { to: '/cp/admin-stuff/reason', label: 'Öffnen' },
    secondary: { to: '/cp/admin-stuff/reason#statement', label: 'Zum Statement' },
    visual: 'stats',
    quickIcon: PieChart,
    quickColor: 'text-status-blue',
    accentBg: 'bg-status-blue/8',
  },
  {
    num: '03',
    section: 'Technische Details',
    title: 'The Details',
    sub: 'Sicherheit · Betrieb · Publishing · Governance',
    desc: 'Die technische Tiefe: Fünf Themenblöcke mit Analysen, Handlungsempfehlungen und konkreten nächsten Schritten.',
    primary: { to: '/cp/admin-stuff/details', label: 'Öffnen' },
    links: [
      { to: '/cp/admin-stuff/recherche', label: 'Recherche' },
      { to: '/cp/admin-stuff/process', label: 'Process' },
    ],
    visual: 'cube',
    detailLines: [
      { tag: 'Front', text: 'Sicherheit – Gezielt abdichten statt umbauen' },
      { tag: 'Oben', text: 'Einleitung – Starke Basis, gezielt weitergedacht' },
      { tag: 'Rechts', text: 'Betrieb – Monolith in Bausteine schneiden' },
      { tag: 'Hinten', text: 'Publishing – Vom Inselstaat zum Festland' },
      { tag: 'Links', text: 'Governance – Ordnung statt Sucharbeit' },
    ],
    quickIcon: Box,
    quickColor: 'text-status-green',
    accentBg: 'bg-status-green/8',
  },
];

const LAYER_COLORS = [
  { border: 'border-scnat-red/50', bg: 'bg-scnat-red/10', dot: 'bg-scnat-red', label: 'Strategie & Steuerung' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/7', dot: 'bg-purple-500', label: 'Kompetenzen & Kultur' },
  { border: 'border-amber-500/40', bg: 'bg-amber-500/7', dot: 'bg-amber-500', label: 'Prozesse & Arbeitsweisen' },
  { border: 'border-blue-500/40', bg: 'bg-blue-500/7', dot: 'bg-blue-500', label: 'Applikationen & Systeme' },
  { border: 'border-bd-strong/50', bg: 'bg-bd-strong/10', dot: 'bg-bd-strong', label: 'Infrastruktur & Betrieb' },
];

const STATS = [
  { value: '86%', label: 'Gemeinsame Lösung nötig', color: 'text-scnat-red' },
  { value: '39%', label: 'Schulungs-massnahmen', color: 'text-status-blue' },
  { value: '25%', label: 'Prozess-transparenz', color: 'text-status-green' },
  { value: '28', label: 'Massnahmen total', color: 'text-status-yellow' },
];

function LayersVisual() {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
      {LAYER_COLORS.map((l, i) => (
        <div
          key={i}
          className={`h-7 rounded-sm border ${l.border} ${l.bg} flex items-center px-2.5 gap-2 text-[10px] font-medium text-txt-secondary transition-transform duration-500`}
          style={{ animation: `layerFloat 6s ease-in-out ${i * 0.2}s infinite` }}
        >
          <span className={`w-1.5 h-1.5 rounded-[1px] shrink-0 ${l.dot}`} />
          <span className="truncate">{l.label}</span>
        </div>
      ))}
    </div>
  );
}

function StatsVisual() {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-[190px]">
      {STATS.map((s, i) => (
        <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-2.5 text-center">
          <p className={`text-lg font-heading font-bold leading-none mb-0.5 ${s.color}`}>{s.value}</p>
          <p className="text-[9px] font-mono text-txt-tertiary leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function CubeVisual() {
  const cubeRef = useRef(null);
  const wrapRef = useRef(null);
  const stateRef = useRef({ dragging: false, lastX: 0, lastY: 0, rotX: -20, rotY: 25, autoAnim: true });

  useEffect(() => {
    const cube = cubeRef.current;
    const wrap = wrapRef.current;
    if (!cube || !wrap) return;
    const s = stateRef.current;

    const onEnter = () => { s.autoAnim = false; cube.style.animation = 'none'; };
    const onLeave = () => {
      s.autoAnim = true;
      cube.style.animation = 'cubeRotate 18s linear infinite';
      cube.style.animationDelay = `-${(s.rotY % 360) / 360 * 18}s`;
    };
    const onDown = (e) => { s.dragging = true; s.lastX = e.clientX; s.lastY = e.clientY; e.preventDefault(); };
    const onMove = (e) => {
      if (!s.dragging) return;
      s.rotY += (e.clientX - s.lastX) * 0.6;
      s.rotX -= (e.clientY - s.lastY) * 0.6;
      s.rotX = Math.max(-50, Math.min(50, s.rotX));
      cube.style.transform = `rotateX(${s.rotX}deg) rotateY(${s.rotY}deg)`;
      s.lastX = e.clientX; s.lastY = e.clientY;
    };
    const onUp = () => { s.dragging = false; };
    const onTouchStart = (e) => { s.lastX = e.touches[0].clientX; s.lastY = e.touches[0].clientY; s.autoAnim = false; cube.style.animation = 'none'; };
    const onTouchMove = (e) => {
      s.rotY += (e.touches[0].clientX - s.lastX) * 0.6;
      s.rotX -= (e.touches[0].clientY - s.lastY) * 0.6;
      s.rotX = Math.max(-50, Math.min(50, s.rotX));
      cube.style.transform = `rotateX(${s.rotX}deg) rotateY(${s.rotY}deg)`;
      s.lastX = e.touches[0].clientX; s.lastY = e.touches[0].clientY;
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    wrap.addEventListener('touchstart', onTouchStart, { passive: true });
    wrap.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      wrap.removeEventListener('touchstart', onTouchStart);
      wrap.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const faceBase = 'absolute w-[110px] h-[110px] flex flex-col items-center justify-center p-2 text-center border border-scnat-red/30';
  const faceStyle = { background: 'rgba(234,81,90,0.06)', backfaceVisibility: 'hidden' };

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={wrapRef} className="cursor-grab active:cursor-grabbing" style={{ perspective: '600px', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={cubeRef}
          className="relative"
          style={{
            width: '110px', height: '110px',
            transformStyle: 'preserve-3d',
            transform: 'rotateX(-20deg) rotateY(25deg)',
            animation: 'cubeRotate 18s linear infinite',
          }}
        >
          <div className={faceBase} style={{ ...faceStyle, transform: 'translateZ(55px)' }}>
            <span className="text-[9px] font-mono font-semibold text-scnat-red uppercase tracking-wider mb-0.5">Sicherheit</span>
            <span className="text-[8px] text-txt-secondary leading-snug">Gezielt abdichten</span>
          </div>
          <div className={faceBase} style={{ ...faceStyle, transform: 'rotateY(180deg) translateZ(55px)' }}>
            <span className="text-[9px] font-mono font-semibold text-scnat-red uppercase tracking-wider mb-0.5">Publishing</span>
            <span className="text-[8px] text-txt-secondary leading-snug">Vom Inselstaat zum Festland</span>
          </div>
          <div className={faceBase} style={{ ...faceStyle, transform: 'rotateY(90deg) translateZ(55px)' }}>
            <span className="text-[9px] font-mono font-semibold text-scnat-red uppercase tracking-wider mb-0.5">Betrieb</span>
            <span className="text-[8px] text-txt-secondary leading-snug">Monolith in Bausteine</span>
          </div>
          <div className={faceBase} style={{ ...faceStyle, transform: 'rotateY(-90deg) translateZ(55px)' }}>
            <span className="text-[9px] font-mono font-semibold text-scnat-red uppercase tracking-wider mb-0.5">Governance</span>
            <span className="text-[8px] text-txt-secondary leading-snug">Ordnung statt Sucharbeit</span>
          </div>
          <div className={faceBase} style={{ ...faceStyle, transform: 'rotateX(90deg) translateZ(55px)' }}>
            <span className="text-[9px] font-mono font-semibold text-scnat-red uppercase tracking-wider mb-0.5">Einleitung</span>
            <span className="text-[8px] text-txt-secondary leading-snug">Starke Basis</span>
          </div>
          <div className="absolute w-[110px] h-[110px]" style={{ transform: 'rotateX(-90deg) translateZ(55px)', background: 'rgba(0,0,0,0.15)', backfaceVisibility: 'hidden' }} />
        </div>
      </div>
      <p className="text-[9px] font-mono text-txt-tertiary">Hover · 5 Blöcke</p>
    </div>
  );
}

function CardVisual({ type }) {
  if (type === 'layers') return <LayersVisual />;
  if (type === 'stats') return <StatsVisual />;
  if (type === 'cube') return <CubeVisual />;
  return null;
}

export default function CpAdminStuff() {
  return (
    <div>
      {/* Header – same pattern as CpDashboard / CpEvents / CpMassnahmen */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-scnat-red" /> Admin Stuff
          </h2>
          <p className="text-xs text-txt-secondary mt-0.5">3 Dokumente · Strategie, Begründung und technische Details</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {STATS.map((s, i) => (
          <div key={i} className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
            <p className={`text-xl font-heading font-semibold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-txt-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Document cards */}
      <div className="space-y-3">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden hover:border-bd-strong transition-colors"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
              <div className="p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[10px] font-mono text-txt-tertiary bg-bg-elevated px-1.5 py-0.5 rounded-sm">{card.num}</span>
                  <span className="text-[10px] font-mono text-txt-tertiary">{card.section}</span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-heading font-semibold text-txt-primary">{card.title}</h3>
                </div>
                <p className="text-[10px] font-mono text-txt-tertiary tracking-wide mb-2">{card.sub}</p>
                <p className="text-sm text-txt-secondary leading-relaxed max-w-lg">{card.desc}</p>

                {card.detailLines && (
                  <div className="flex flex-col gap-1 mt-3">
                    {card.detailLines.map((line, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-txt-secondary">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 border border-bd-faint rounded-sm text-txt-tertiary shrink-0 w-12 text-center">{line.tag}</span>
                        <span className="truncate">{line.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Link
                    to={card.primary.to}
                    className="inline-flex items-center gap-1.5 bg-scnat-red hover:bg-[#f06570] text-white text-sm font-medium px-3.5 py-1.5 rounded-sm transition-colors"
                  >
                    {card.primary.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  {card.secondary && (
                    <Link
                      to={card.secondary.to}
                      className="inline-flex items-center gap-1.5 border border-bd-faint text-txt-secondary hover:border-bd-strong hover:text-txt-primary text-sm px-3.5 py-1.5 rounded-sm transition-colors"
                    >
                      {card.secondary.label}
                    </Link>
                  )}
                  {card.links?.map((link, j) => (
                    <Link
                      key={j}
                      to={link.to}
                      className="inline-flex items-center gap-1.5 border border-bd-faint text-txt-secondary hover:border-bd-strong hover:text-txt-primary text-sm px-3.5 py-1.5 rounded-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex w-[260px] shrink-0 items-center justify-center p-5 border-l border-bd-faint bg-bg-elevated/30">
                <CardVisual type={card.visual} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 lg:hidden">
        {CARDS.map((card, i) => {
          const Icon = card.quickIcon;
          return (
            <Link
              key={i}
              to={card.primary.to}
              className="bg-bg-surface border border-bd-faint rounded-sm p-3 hover:border-bd-strong transition-colors group flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-sm ${card.accentBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${card.quickColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-heading font-medium text-txt-primary truncate">{card.title}</p>
                <p className="text-[10px] text-txt-tertiary">{card.section}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-txt-tertiary shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
