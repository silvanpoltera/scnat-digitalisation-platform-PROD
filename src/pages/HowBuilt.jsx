import { useState, useEffect, useRef } from 'react';

const BUILD_STEPS = [
  {
    num: '01', color: 'var(--b-strong, #5A616B)', label: 'Phase 01 · Ausgangspunkt',
    title: 'Strategie & Prompt-Katalog', sub: 'Dieser Cursor-Prompt',
    text: 'Der gesamte Prompt-Katalog – diese Datei – ist die Spezifikation der Plattform. Jede Seite, jede Komponente, jedes API-Endpunkt, jedes Datenfeld ist hier beschrieben. Cursor liest ihn und setzt ihn direkt in Code um.',
    tags: ['Prompt Engineering', 'Cursor-Spezifikation', 'Architektur-Dokument'],
    faceStyle: { background: 'rgba(90,97,107,.12)', borderColor: 'rgba(90,97,107,.45)' },
    faceTransform: 'translateZ(120px)',
    icon: 'doc',
  },
  {
    num: '02', color: 'var(--info, #4A90D9)', label: 'Phase 01 · Code-Generierung ☁ Cloud',
    title: 'OpenAI Codex in Cursor', sub: 'Code-Generierung',
    text: 'Cursor mit OpenAI Codex generiert aus dem Prompt-Katalog die gesamte App-Struktur: Komponenten, API-Routes, Auth-System, Design-System, CP-Module.',
    tags: ['OpenAI Codex', 'Cursor IDE', 'Next.js 14', 'TypeScript', 'NextAuth v5', 'Tailwind CSS'],
    faceStyle: { background: 'rgba(74,144,217,.09)', borderColor: 'rgba(74,144,217,.45)' },
    faceTransform: 'rotateY(90deg) translateZ(120px)',
    icon: 'code',
  },
  {
    num: '03', color: 'var(--ok, #3DAA75)', label: 'Phase 02 · Lokale Pipeline ⬡ On-Device',
    title: 'Super Mini PAI lokal', sub: 'Qwen2.5 on-device',
    text: 'Ein eigens entwickeltes lokales KI-Framework. Läuft vollständig auf dem eigenen Gerät. Keine Cloud-Verbindung, keine externen Server. Qwen2.5 als lokales Sprachmodell.',
    tags: ['Super Mini PAI', 'Qwen2.5', 'Lokal', 'DSG-konform', 'Cursor-Integration'],
    faceStyle: { background: 'rgba(61,170,117,.08)', borderColor: 'rgba(61,170,117,.42)' },
    faceTransform: 'rotateY(180deg) translateZ(120px)',
    icon: 'brain',
  },
  {
    num: '04', color: 'var(--warn, #D4882A)', label: 'Phase 02 · Content ⬡ On-Device',
    title: 'Content-Extraktion', sub: 'Interne Dokumente',
    text: 'Interne SCNAT-Dokumente dürfen nicht in externe Cloud-Dienste. The PAI verarbeitet sie lokal, extrahiert strukturierten Content und bringt ihn in den gewünschten Stil.',
    tags: ['Interne Docs', 'Kein Cloud-Upload', 'Strukturierter Content', 'Stilanpassung'],
    faceStyle: { background: 'rgba(212,136,42,.08)', borderColor: 'rgba(212,136,42,.42)' },
    faceTransform: 'rotateY(270deg) translateZ(120px)',
    icon: 'search',
  },
  {
    num: '05', color: 'var(--purple, #7C5CBF)', label: 'Integration · Merge',
    title: 'Integration in Cursor', sub: 'Code + Content merge',
    text: 'Code aus Phase 1 und Content aus Phase 2 werden in einem einzigen Projekt zusammengeführt. Cursor integriert beides – kein manueller Copy-Paste, keine Medienbrüche.',
    tags: ['Merge', 'Ein Projekt', 'Kein Medienbruch'],
    faceStyle: { background: 'rgba(124,92,191,.08)', borderColor: 'rgba(124,92,191,.42)' },
    faceTransform: 'rotateX(90deg) translateZ(120px)',
    icon: 'box',
  },
  {
    num: '06', color: 'var(--red, #EA515A)', label: 'Ergebnis · Produktionsreif',
    title: 'Live', sub: 'Deployment bereit',
    text: 'Eine vollständige, produktionsreife Web-Applikation. Deployment auf SCNAT-Server: 2–4h IT-Aufwand. Diese Methode ist neu, reproducible und auf weitere Projekte übertragbar.',
    tags: ['Produktionsreif', 'AI-native', '2–4h Deployment', 'Reproducible'],
    faceStyle: { background: 'rgba(234,81,90,.10)', borderColor: 'rgba(234,81,90,.5)' },
    faceTransform: 'rotateX(-90deg) translateZ(120px)',
    icon: 'pulse',
  },
];

const ROTATIONS = [
  'rotateX(-18deg) rotateY(0deg)',
  'rotateX(-18deg) rotateY(-90deg)',
  'rotateX(-18deg) rotateY(-180deg)',
  'rotateX(-18deg) rotateY(-270deg)',
  'rotateX(72deg) rotateY(0deg)',
  'rotateX(-108deg) rotateY(0deg)',
];

function StepIcon({ icon }) {
  const icons = {
    doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
    code: <><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></>,
    brain: <><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/></>,
    search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>,
    box: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
    pulse: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      {icons[icon] || icons.doc}
    </svg>
  );
}

function PipeArrow({ color = 'rgba(74,144,217,0.5)' }) {
  return (
    <div className="w-12 shrink-0 flex items-center justify-center pipe-arrow-el">
      <svg viewBox="0 0 40 24" fill="none" className="w-10 h-6">
        <path d="M0 12H35" stroke={color} strokeWidth="1.5" />
        <polyline points="28,6 36,12 28,18" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

export default function HowBuilt() {
  const [step, setStep] = useState(0);
  const timerRef = useRef(null);

  const goStep = (idx) => {
    setStep(idx);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setStep(prev => (prev + 1) % 6), 4000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setStep(prev => (prev + 1) % 6), 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const currentStep = BUILD_STEPS[step];

  return (
    <div className="min-h-screen relative">
      <style>{`
        .grid-bg-how{position:fixed;inset:0;background-image:linear-gradient(var(--b-faint,#1E2124) 1px,transparent 1px),linear-gradient(90deg,var(--b-faint,#1E2124) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse 100% 80% at 50% 0%,black 0%,transparent 70%);pointer-events:none;z-index:0;opacity:.4}
        .glow-how{position:fixed;top:0;left:50%;transform:translateX(-50%);width:900px;height:500px;background:radial-gradient(ellipse at 50% 0%,rgba(74,144,217,0.05) 0%,transparent 70%);pointer-events:none;z-index:0}
        .build-face{position:absolute;width:240px;height:240px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem;text-align:center;border:1px solid;backface-visibility:hidden}
        @media(max-width:768px){
          .cube-panel-grid{grid-template-columns:1fr!important;gap:2rem!important}
          .pipeline-desktop{display:flex!important;flex-direction:column!important}
          .pipeline-desktop .pipe-arrow-el svg{transform:rotate(90deg);width:28px!important;height:28px!important}
          .pipeline-desktop .pipe-arrow-el{width:100%!important;padding:.2rem 0!important;justify-content:center!important}
          .merge-connector{display:none!important}
          .merge-grid{display:flex!important;flex-direction:column!important}
          .merge-grid .merge-spacer{display:none!important}
          .merge-inner-grid{flex-direction:column!important}
          .merge-inner-grid .pipe-arrow-el svg{transform:rotate(90deg);width:28px!important;height:28px!important}
          .merge-inner-grid .pipe-arrow-el{width:100%!important;padding:.2rem 0!important;justify-content:center!important}
          .pai-grid{grid-template-columns:1fr!important}
        }
      `}</style>
      <div className="grid-bg-how" />
      <div className="glow-how" />

      {/* Hero */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-8">
        <div className="font-mono text-[11px] uppercase tracking-[.14em] mb-4" style={{ color: 'var(--info, #4A90D9)' }}>
          Technologie · Prozess · Pipeline
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-none mb-4">
          How it gets<br /><span style={{ color: 'var(--info, #4A90D9)' }}>Built</span>
        </h1>
        <p className="text-[15px] text-txt-secondary leading-relaxed max-w-[580px]">
          Kein externes Team. Kein klassisches Projekt. Eine neue Art zu bauen – mit modernen KI-Tools, einer eigens entwickelten lokalen Pipeline und einem klaren Stack.
        </p>
      </div>

      <hr className="border-t border-bd-faint relative z-[1]" />

      {/* Build Process Section */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-4 md:px-8 py-16">
        <div className="font-mono text-[10px] uppercase tracking-[.14em] text-txt-tertiary mb-4">01 · Build Prozess</div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">Von Prompt zu Plattform</h2>
        <p className="text-[14px] text-txt-secondary leading-relaxed max-w-[600px] mb-10">
          Sechs Schritte. Zwei parallele Pipelines. Ein fertiges Produkt. Der Würfel dreht sich durch den gesamten Build-Prozess – Klick auf einen Schritt für Details.
        </p>

        {/* Cube + Detail Panel */}
        <div className="cube-panel-grid grid gap-12 items-center mb-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Cube */}
          <div className="flex flex-col items-center gap-5">
            <div
              className="cursor-pointer"
              style={{ perspective: 700, width: 240, height: 240 }}
              onClick={() => goStep((step + 1) % 6)}
              title="Klick für nächsten Schritt"
            >
              <div
                style={{
                  width: 240, height: 240,
                  transformStyle: 'preserve-3d',
                  transform: ROTATIONS[step],
                  transition: 'transform .9s cubic-bezier(.22,1,.36,1)',
                  position: 'relative',
                }}
              >
                {BUILD_STEPS.map((s, i) => (
                  <div key={i} className="build-face" style={{ ...s.faceStyle, transform: s.faceTransform }}>
                    <div className="font-mono text-[10px] text-txt-tertiary tracking-wider mb-2">{s.num}</div>
                    <div className="w-9 h-9 mb-2.5 opacity-85"><StepIcon icon={s.icon} /></div>
                    <div className="font-bold text-[14px] leading-snug mb-1" dangerouslySetInnerHTML={{ __html: s.title.replace('&', '&amp;') }} />
                    <div className="text-[11px] text-txt-secondary font-mono">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Step dots */}
            <div className="flex gap-2">
              {BUILD_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goStep(i)}
                  className={`w-2 h-2 rounded-full border-none p-0 cursor-pointer transition-all ${
                    step === i ? 'bg-scnat-red scale-[1.4]' : 'bg-bd-strong'
                  }`}
                />
              ))}
            </div>
            <p className="font-mono text-[9px] text-txt-tertiary text-center">Klick · automatische Rotation alle 4s</p>
          </div>

          {/* Detail Panel */}
          <div className="flex flex-col gap-4">
            <div className="font-mono text-[9px] uppercase tracking-wider mb-1" style={{ color: currentStep.color }}>
              {currentStep.label}
            </div>
            <div className="font-bold text-xl leading-snug mb-3">{currentStep.title}</div>
            <div className="text-[14px] text-txt-secondary leading-relaxed mb-4">{currentStep.text}</div>
            <div className="flex flex-wrap gap-1.5">
              {currentStep.tags.map(t => (
                <span key={t} className="font-mono text-[9px] px-2 py-0.5 border border-bd-default rounded-sm text-txt-tertiary">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline */}
        <div className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-[.14em] text-txt-tertiary mb-5">Pipeline-Übersicht</div>

          {/* Top row: 01 → 02 | PARALLEL | 03 → 04 */}
          <div className="pipeline-desktop flex items-center gap-0 mb-0">
            <PipeStep num="01" title="Prompt-Katalog" sub="Cursor-Prompt als Spezifikation" borderColor="rgba(90,97,107,.35)" />
            <PipeArrow color="rgba(74,144,217,0.5)" />
            <PipeStep num="02" title="Codex + Cursor" sub="Struktur · Auth · API" borderColor="rgba(74,144,217,.4)" bg="rgba(74,144,217,.05)" badge="☁ Cloud" badgeColor="var(--info, #4A90D9)" />

            <div className="hidden md:flex flex-col items-center px-3 gap-1 shrink-0 merge-connector">
              <div className="w-px h-7" style={{ background: 'rgba(61,170,117,.3)' }} />
              <div className="font-mono text-[8px] text-txt-tertiary" style={{ writingMode: 'vertical-rl', letterSpacing: '.06em' }}>PARALLEL</div>
              <div className="w-px h-7" style={{ background: 'rgba(61,170,117,.3)' }} />
            </div>

            <PipeStep num="03" title="Super Mini PAI" sub="Qwen2.5 lokal · DSG-konform" borderColor="rgba(61,170,117,.4)" bg="rgba(61,170,117,.05)" badge="⬡ Lokal" badgeColor="var(--ok, #3DAA75)" />
            <PipeArrow color="rgba(61,170,117,0.5)" />
            <PipeStep num="04" title="Content-Extraktion" sub="Interne Docs → Content" borderColor="rgba(212,136,42,.4)" bg="rgba(212,136,42,.05)" badge="⬡ Lokal" badgeColor="var(--warn, #D4882A)" />
          </div>

          {/* Connector line */}
          <div className="merge-connector hidden md:flex items-center gap-0 mt-px">
            <div className="flex-[4] border-t border-dashed mt-3" style={{ borderColor: 'rgba(124,92,191,.25)' }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><line x1="12" y1="0" x2="12" y2="24" stroke="rgba(124,92,191,.35)" strokeWidth="1.5" /></svg>
            <div className="flex-[4] border-t border-dashed mt-3" style={{ borderColor: 'rgba(124,92,191,.25)' }} />
          </div>

          {/* Merge row: 05 → 06 */}
          <div className="merge-grid grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
            <div className="merge-spacer" />
            <div className="merge-inner-grid flex items-center gap-0">
              <PipeStep num="05" title="Merge in Cursor" sub="Code + Content → ein Projekt" borderColor="rgba(124,92,191,.45)" bg="rgba(124,92,191,.06)" />
              <PipeArrow color="rgba(234,81,90,0.5)" />
              <PipeStep num="06" title="Live" sub="Produktionsreif · Bereit" borderColor="rgba(234,81,90,.5)" bg="rgba(234,81,90,.07)" />
            </div>
            <div className="merge-spacer" />
          </div>
        </div>
      </div>

      <hr className="border-t border-bd-faint relative z-[1]" />

      {/* PAI Section */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-4 md:px-8 py-16">
        <div className="font-mono text-[10px] uppercase tracking-[.14em] text-txt-tertiary mb-4">03 · The Super Mini PAI</div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">Das lokale KI-Framework</h2>
        <p className="text-[14px] text-txt-secondary leading-relaxed max-w-[600px] mb-10">
          Eigens entwickelt. Eigens für diese Aufgabe. Eigens für die Anforderungen der SCNAT.
        </p>

        <div className="bg-bg-surface border border-bd-default rounded-md overflow-hidden mb-12">
          <div className="border-b border-bd-default p-7 flex items-start gap-6 flex-wrap" style={{ background: 'linear-gradient(135deg,rgba(74,144,217,0.08) 0%,rgba(124,92,191,0.08) 100%)' }}>
            <div className="w-[52px] h-[52px] rounded-md flex items-center justify-center shrink-0" style={{ background: 'rgba(74,144,217,0.12)', border: '1px solid rgba(74,144,217,0.3)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.14z"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.14z"/>
              </svg>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-wider mb-1.5" style={{ color: '#4A90D9' }}>Eigenentwicklung · poltis.ch</div>
              <div className="font-bold text-lg mb-1">The Super Mini PAI</div>
              <div className="text-[13px] text-txt-secondary">Ein lokales KI-Framework für datenschutzkonforme Content-Extraktion und -Implementierung</div>
            </div>
          </div>
          <div className="pai-grid grid p-7 gap-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-txt-tertiary mb-3">Was es tut</div>
              <ul className="space-y-2">
                {['Interne Dokumente lokal verarbeiten (PDF, Word, Text)', 'Inhalte mit lokalem LLM (Qwen2.5) extrahieren und strukturieren', 'Outputs in gewünschten Stil und Format bringen', 'Direkt in Cursor eingebunden – Code und Content in einem Workflow', 'Keine Daten verlassen das lokale Gerät', 'Vollständig DSG/DSGVO-konform'].map(t => (
                  <li key={t} className="text-[13px] text-txt-secondary leading-snug pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-txt-tertiary before:text-[12px]">{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-txt-tertiary mb-3">Warum es existiert</div>
              <ul className="space-y-2">
                {['SCNAT-Dokumente dürfen nicht in externe KI-Tools hochgeladen werden', 'Bestehende lokale LLM-Tools sind nicht in Entwicklungsumgebungen integrierbar', 'Die Lücke: KI-Unterstützung bei sensiblen Inhalten ohne Cloud', 'The Super Mini PAI schliesst diese Lücke – pragmatisch und reproducible'].map(t => (
                  <li key={t} className="text-[13px] text-txt-secondary leading-snug pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-txt-tertiary before:text-[12px]">{t}</li>
                ))}
                <li className="text-[13px] text-txt-secondary leading-snug pl-4 relative before:content-['→'] before:absolute before:left-0 before:text-txt-tertiary before:text-[12px]">
                  <a href="https://www.poltis.ch/the-super-mini-pai/" target="_blank" rel="noopener noreferrer" className="font-mono text-[12px] inline-flex items-center gap-1.5" style={{ color: '#4A90D9' }}>
                    poltis.ch/the-super-mini-pai
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                  <div className="flex gap-2 items-center mt-1.5">
                    <span className="font-mono text-[11px] bg-bg-elevated border border-bd-default px-2 py-0.5 rounded-sm text-txt-secondary">User: thePAi</span>
                    <span className="font-mono text-[11px] bg-bg-elevated border border-bd-default px-2 py-0.5 rounded-sm text-txt-secondary">PW: loc@l:AI</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-t border-bd-faint relative z-[1]" />

      {/* Constraint Box */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-4 md:px-8 py-8">
        <div className="font-mono text-[10px] uppercase tracking-[.14em] text-txt-tertiary mb-4">04 · Rahmenbedingungen</div>
        <div className="rounded p-6 mb-12" style={{ background: 'rgba(212,136,42,0.05)', border: '1px solid rgba(212,136,42,0.25)', borderLeft: '3px solid #D4882A' }}>
          <div className="font-mono text-[9px] uppercase tracking-wider mb-2.5" style={{ color: '#D4882A' }}>⚠ Offener Punkt</div>
          <div className="font-semibold text-[15px] mb-2">Rechenleistung und Admin-Rechte</div>
          <p className="text-[14px] text-txt-secondary leading-relaxed">
            The Super Mini PAI benötigt <strong className="text-txt-primary">lokale Rechenleistung</strong> – GPU oder leistungsfähige CPU – um Sprachmodelle wie Qwen2.5 lokal zu betreiben. Die Einbindung in Cursor erfordert zudem <strong className="text-txt-primary">bestimmte Softwareinstallationen und erweiterte Berechtigungen</strong> auf dem Arbeitsgerät. Beides war zum Zeitpunkt der Entwicklung nicht verfügbar. Die Pipeline wurde deshalb auf einem privaten Gerät entwickelt und betrieben. <strong className="text-txt-primary">Mit den entsprechenden IT-Ressourcen wäre dieser Prozess deutlich effizienter, stabiler und vollständig innerhalb der SCNAT-Infrastruktur umsetzbar gewesen.</strong>
          </p>
        </div>
      </div>

      <hr className="border-t border-bd-faint relative z-[1]" />

      {/* Closing */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-4 md:px-8 py-8 pb-24">
        <div className="bg-scnat-red/8 border border-scnat-red/20 rounded p-8">
          <h3 className="text-base font-semibold mb-2.5">Was das zeigt</h3>
          <p className="text-[14px] text-txt-secondary leading-relaxed">
            Diese Plattform ist kein klassisches IT-Projekt. Sie ist ein Beweis, dass mit den richtigen Werkzeugen und einer klaren Methodik <strong className="text-txt-primary">eine vollständige, produktionsreife Applikation</strong> gebaut werden kann – AI-native, datenschutzkonform und ohne externes Entwicklungsteam. The Super Mini PAI ist dabei kein Workaround, sondern eine <strong className="text-txt-primary">neue Art von Production Pipeline</strong>, die zeigt, wie KI-gestützte Entwicklung und organisationale Compliance zusammengedacht werden können.
          </p>
        </div>
      </div>
    </div>
  );
}

function PipeStep({ num, title, sub, borderColor, bg, badge, badgeColor }) {
  return (
    <div
      className="flex-1 rounded-[3px] p-3.5 border transition-colors hover:brightness-110"
      style={{ background: bg || 'var(--surface, #141618)', borderColor }}
    >
      <div className="font-mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1" style={badgeColor ? { color: 'var(--text3, #4E535D)' } : undefined}>
        {num}
      </div>
      <div className="font-semibold text-[13px] mb-0.5">{title}</div>
      <div className="text-[11px] text-txt-secondary leading-snug">{sub}</div>
      {badge && (
        <div className="font-mono text-[9px] mt-1.5" style={{ color: badgeColor }}>{badge}</div>
      )}
    </div>
  );
}
