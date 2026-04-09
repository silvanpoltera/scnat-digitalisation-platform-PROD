import { useState, useEffect } from 'react';
import { Brain, MessageSquare, Wrench, ChevronDown, Shield, AlertTriangle, Lock, FileText, Layers, Cpu, Keyboard, Sparkles, Settings, FolderOpen, Bot, Upload, PenTool, Zap, Database, GitBranch, Workflow, Eye, Scale, Compass, BookOpen } from 'lucide-react';
import KiFramework from '../components/ki/KiFramework';
import LlmComparison from '../components/ki/LlmComparison';
import OllamaSection from '../components/ki/OllamaSection';
import PromptTips from '../components/ki/PromptTips';
import PageHeader from '../components/PageHeader';

const TABS = [
  { id: 'tools', label: 'Tools & Richtlinien', icon: Wrench },
  { id: 'chatgpt', label: 'ChatGPT nutzen', icon: MessageSquare },
  { id: 'denken', label: 'KI für Profis', icon: Brain },
];

function CotVisualization({ szenarien }) {
  const [selected, setSelected] = useState(0);
  const [visibleStep, setVisibleStep] = useState(0);

  const szenario = szenarien?.[selected];

  useEffect(() => {
    setVisibleStep(0);
    if (!szenario) return;
    const steps = szenario.schritte.length;
    const timers = [];
    for (let i = 0; i < steps; i++) {
      timers.push(setTimeout(() => setVisibleStep(i + 1), (i + 1) * 600));
    }
    return () => timers.forEach(clearTimeout);
  }, [selected, szenario]);

  if (!szenarien?.length) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-heading font-semibold text-txt-primary mb-1">Chain-of-Thought</h3>
        <p className="text-xs text-txt-secondary">So denkt ein KI-Modell Schritt für Schritt. Wähle ein Szenario:</p>
      </div>

      <div className="flex gap-2">
        {szenarien.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setSelected(i)}
            className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
              selected === i ? 'bg-scnat-red text-white' : 'bg-bg-surface border border-bd-faint text-txt-secondary hover:text-txt-primary'
            }`}
          >
            {s.titel}
          </button>
        ))}
      </div>

      {szenario && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <div className="bg-bg-elevated border border-bd-faint rounded-sm px-3 py-2 mb-4">
            <span className="text-[10px] font-mono text-txt-tertiary">Prompt:</span>
            <p className="text-sm text-txt-primary mt-0.5">{szenario.prompt}</p>
          </div>

          <div className="space-y-3">
            {szenario.schritte.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-3 transition-all duration-300"
                style={{
                  opacity: i < visibleStep ? 1 : 0.15,
                  transform: i < visibleStep ? 'translateY(0)' : 'translateY(8px)',
                }}
              >
                <div className="w-6 h-6 rounded-sm bg-scnat-red/15 text-scnat-red flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <span className="text-[10px] font-mono text-scnat-red">{step.label}</span>
                  <p className="text-xs text-txt-secondary mt-0.5">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ReasoningVergleich({ vergleich }) {
  if (!vergleich) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-heading font-semibold text-txt-primary mb-1">Reasoning vs. Standard</h3>
        <p className="text-xs text-txt-secondary">Wann welches Modell?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['standard', 'reasoning'].map(type => {
          const data = vergleich[type];
          return (
            <div key={type} className="bg-bg-surface border border-bd-faint rounded-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${type === 'standard' ? 'bg-status-blue' : 'bg-status-yellow'}`} />
                <h4 className="text-sm font-heading font-semibold text-txt-primary">{data.name}</h4>
              </div>
              <div className="mb-3">
                <p className="text-[10px] font-mono text-status-green mb-1">Stärken</p>
                {data.stärken.map((s, i) => <p key={i} className="text-xs text-txt-secondary">+ {s}</p>)}
              </div>
              <div>
                <p className="text-[10px] font-mono text-scnat-red mb-1">Schwächen</p>
                {data.schwächen.map((s, i) => <p key={i} className="text-xs text-txt-secondary">− {s}</p>)}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h4 className="text-xs font-mono text-txt-tertiary mb-3">Wann welches Modell?</h4>
        <div className="space-y-1">
          {vergleich.wann_welches?.map((item, i) => (
            <details key={i} className="group bg-bg-surface border border-bd-faint rounded-sm">
              <summary className="flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm text-txt-primary hover:bg-bg-elevated transition-colors list-none">
                <ChevronDown className="w-3.5 h-3.5 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
                <span className="flex-1">{item.aufgabe}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${
                  item.empfehlung.includes('Reasoning') ? 'bg-status-yellow/15 text-status-yellow' : 'bg-status-blue/15 text-status-blue'
                }`}>{item.empfehlung}</span>
              </summary>
              <div className="px-4 pb-3 text-xs text-txt-secondary">{item.grund}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatGPTTab({ data }) {
  if (!data) return null;

  const CHATGPT_SECTIONS = [
    { id: 'grundlagen', icon: Sparkles },
    { id: 'prompts', icon: MessageSquare },
    { id: 'personalisierung', icon: Settings },
    { id: 'projekte', icon: FolderOpen },
    { id: 'gpts', icon: Bot },
    { id: 'dateien', icon: Upload },
    { id: 'canvas', icon: PenTool },
    { id: 'modelle', icon: Cpu },
    { id: 'shortcuts', icon: Keyboard },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
        <p className="text-xs text-txt-secondary leading-relaxed">
          Dieser Bereich ist dein Nachschlagewerk für alles rund um ChatGPT. Egal ob du gerade erst anfängst oder schon Erfahrung hast — hier findest du praxisnahe Anleitungen, Tipps und Beispiele speziell für den Einsatz bei der SCNAT.
        </p>
      </div>

      {CHATGPT_SECTIONS.map(({ id, icon: SIcon }) => {
        const section = data[id];
        if (!section) return null;
        return (
          <Section key={id} title={section.titel} icon={SIcon} defaultOpen={id === 'grundlagen'}>
            {id === 'grundlagen' && <GrundlagenContent data={section} />}
            {id === 'prompts' && <PromptsContent data={section} />}
            {id === 'personalisierung' && <PersonalisierungContent data={section} />}
            {id === 'projekte' && <ProjekteContent data={section} />}
            {id === 'gpts' && <GptsContent data={section} />}
            {id === 'dateien' && <DateienContent data={section} />}
            {id === 'canvas' && <CanvasContent data={section} />}
            {id === 'modelle' && <ModelleContent data={section} />}
            {id === 'shortcuts' && <ShortcutsContent data={section} />}
          </Section>
        );
      })}
    </div>
  );
}

function GrundlagenContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>

      <div>
        <p className="text-[10px] font-mono text-txt-tertiary mb-3">WICHTIGE BEGRIFFE</p>
        <div className="space-y-2">
          {data.konzepte?.map((k, i) => (
            <details key={i} className="group bg-bg-elevated border border-bd-faint rounded-sm">
              <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-xs font-medium text-txt-primary hover:bg-bg-surface transition-colors list-none">
                <ChevronDown className="w-3 h-3 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
                <span className="text-scnat-red font-mono text-[10px] shrink-0">{String(i+1).padStart(2,'0')}</span>
                {k.begriff}
              </summary>
              <div className="px-3 pb-2.5 text-xs text-txt-secondary leading-relaxed">{k.erklaerung}</div>
            </details>
          ))}
        </div>
      </div>

      {data.versionen && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">CHATGPT-VERSIONEN IM VERGLEICH</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.versionen.map((v, i) => (
              <div key={i} className={`bg-bg-elevated border rounded-sm p-3 ${i === 2 ? 'border-scnat-red/30 ring-1 ring-scnat-red/10' : 'border-bd-faint'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-heading font-semibold text-txt-primary">{v.name}</h5>
                  <span className="text-[10px] font-mono text-scnat-red">{v.preis}</span>
                </div>
                <ul className="space-y-1.5">
                  {v.features.map((f, j) => (
                    <li key={j} className="text-[11px] text-txt-secondary flex items-start gap-1.5">
                      <span className="text-status-green mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                {i === 2 && <p className="text-[10px] text-scnat-red font-medium mt-2 pt-2 border-t border-scnat-red/20">← Empfohlen für SCNAT</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PromptsContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}

      <div className="space-y-4">
        <p className="text-[10px] font-mono text-txt-tertiary">VORHER / NACHHER</p>
        {data.schlecht_gut?.map((pair, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-scnat-red/5 border border-scnat-red/20 rounded-sm p-3">
              <span className="text-[10px] font-mono text-scnat-red mb-1 block">Schlecht</span>
              <p className="text-sm font-mono text-txt-secondary">{pair.schlecht}</p>
            </div>
            <div className="bg-status-green/5 border border-status-green/20 rounded-sm p-3">
              <span className="text-[10px] font-mono text-status-green mb-1 block">Besser</span>
              <p className="text-sm font-mono text-txt-secondary">{pair.gut}</p>
            </div>
            <p className="text-xs text-txt-tertiary md:col-span-2 italic">→ {pair.warum}</p>
          </div>
        ))}
      </div>

      {data.techniken && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">PROMPT-TECHNIKEN</p>
          <div className="space-y-2">
            {data.techniken.map((t, i) => (
              <details key={i} className="group bg-bg-elevated border border-bd-faint rounded-sm">
                <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer text-xs text-txt-primary hover:bg-bg-surface transition-colors list-none">
                  <ChevronDown className="w-3 h-3 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
                  <span className="font-medium">{t.name}</span>
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  <p className="text-xs text-txt-secondary leading-relaxed">{t.erklaerung}</p>
                  <div className="bg-bg-surface border border-bd-faint rounded-sm px-3 py-2">
                    <span className="text-[10px] font-mono text-txt-tertiary block mb-1">Beispiel-Prompt:</span>
                    <p className="text-xs text-txt-primary font-mono italic">{t.beispiel}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-mono text-txt-tertiary mb-2">SCNAT USE-CASES</p>
        <div className="flex flex-wrap gap-1.5">
          {data.scnat_usecases?.map((uc, i) => (
            <span key={i} className="text-xs bg-bg-elevated border border-bd-faint px-2 py-1 rounded-sm text-txt-secondary">{uc}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonalisierungContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}

      {data.custom_instructions && (
        <div className="bg-bg-elevated border border-bd-faint rounded-sm p-4 space-y-3">
          <h5 className="text-xs font-heading font-semibold text-txt-primary flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-scnat-red" />
            {data.custom_instructions.titel}
          </h5>
          <p className="text-xs text-txt-secondary">{data.custom_instructions.beschreibung}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.custom_instructions.felder?.map((f, i) => (
              <div key={i} className="bg-bg-surface border border-bd-faint rounded-sm p-3">
                <p className="text-[10px] font-mono text-scnat-red mb-1">{f.name}</p>
                <p className="text-xs text-txt-secondary mb-2">{f.beschreibung}</p>
                <div className="bg-bg-elevated border border-bd-faint rounded-sm px-2.5 py-2 font-mono text-[11px] text-txt-primary leading-relaxed italic">
                  «{f.beispiel}»
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.memory && (
        <div className="bg-bg-elevated border border-bd-faint rounded-sm p-4 space-y-3">
          <h5 className="text-xs font-heading font-semibold text-txt-primary flex items-center gap-2">
            <Brain className="w-3.5 h-3.5 text-status-blue" />
            {data.memory.titel}
          </h5>
          <p className="text-xs text-txt-secondary">{data.memory.beschreibung}</p>
          <ul className="space-y-1.5">
            {data.memory.punkte?.map((p, i) => (
              <li key={i} className="text-xs text-txt-secondary flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-status-blue mt-1.5 shrink-0" />{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.datenschutz && (
        <div className="bg-status-yellow/5 border border-status-yellow/20 rounded-sm p-4 space-y-2">
          <h5 className="text-xs font-heading font-semibold text-txt-primary flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-status-yellow" />
            {data.datenschutz.titel}
          </h5>
          <ul className="space-y-1.5">
            {data.datenschutz.punkte?.map((p, i) => (
              <li key={i} className="text-xs text-txt-secondary flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-status-yellow mt-1.5 shrink-0" />{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.tipps && (
        <TippBox tipps={data.tipps} />
      )}
    </div>
  );
}

function ProjekteContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}
      {data.was && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-4 py-3">
          <p className="text-xs text-txt-primary leading-relaxed">{data.was}</p>
        </div>
      )}

      {data.schritte && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">SCHRITT FÜR SCHRITT</p>
          <div className="space-y-2">
            {data.schritte.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <div className="w-6 h-6 rounded-sm bg-scnat-red/15 text-scnat-red flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{i+1}</div>
                <div>
                  <p className="text-xs font-medium text-txt-primary">{s.schritt}</p>
                  <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed">{s.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.beispiele && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">SCNAT-BEISPIELE</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.beispiele.map((b, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-scnat-red" />
                  <p className="text-xs font-medium text-txt-primary">{b.name}</p>
                </div>
                <p className="text-xs text-txt-secondary mb-2">{b.beschreibung}</p>
                <div className="bg-bg-surface border border-bd-faint rounded-sm px-2 py-1.5">
                  <span className="text-[9px] font-mono text-txt-tertiary">Dateien: </span>
                  <span className="text-[10px] text-txt-secondary">{b.dateien}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.tipps && <TippBox tipps={data.tipps} />}
    </div>
  );
}

function GptsContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}
      {data.was && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-4 py-3">
          <p className="text-xs text-txt-primary leading-relaxed">{data.was}</p>
        </div>
      )}

      {data.erstellen && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">CUSTOM GPT ERSTELLEN</p>
          <div className="space-y-2">
            {data.erstellen.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <div className="w-6 h-6 rounded-sm bg-scnat-red/15 text-scnat-red flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{i+1}</div>
                <div>
                  <p className="text-xs font-medium text-txt-primary">{s.schritt}</p>
                  <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed">{s.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.beispiele_gpts && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">GPT-IDEEN FÜR DIE SCNAT</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.beispiele_gpts.map((g, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-scnat-red" />
                  <p className="text-xs font-heading font-semibold text-txt-primary">{g.name}</p>
                </div>
                <p className="text-xs text-txt-secondary mb-2">{g.zweck}</p>
                <div className="space-y-1 text-[10px]">
                  <p><span className="font-mono text-txt-tertiary">Anweisungen:</span> <span className="text-txt-secondary">{g.anweisungen}</span></p>
                  <p><span className="font-mono text-txt-tertiary">Dateien:</span> <span className="text-txt-secondary">{g.dateien}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.teilen && (
        <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
          <p className="text-[10px] font-mono text-txt-tertiary mb-1.5">TEILEN & VERTEILEN</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.teilen}</p>
        </div>
      )}

      {data.tipps && <TippBox tipps={data.tipps} />}
    </div>
  );
}

function DateienContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}

      {data.formate && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">UNTERSTÜTZTE FORMATE</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.formate.map((f, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <p className="text-xs font-heading font-semibold text-txt-primary flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-scnat-red" />{f.typ}
                </p>
                <p className="text-[11px] text-txt-secondary mt-1">{f.beschreibung}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.anwendungen && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">PRAKTISCHE ANWENDUNGEN</p>
          <div className="space-y-2">
            {data.anwendungen.map((a, i) => (
              <div key={i} className="flex items-start gap-3 bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <div className="w-6 h-6 rounded-sm bg-status-blue/15 text-status-blue flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{i+1}</div>
                <div>
                  <p className="text-xs font-medium text-txt-primary">{a.aufgabe}</p>
                  <p className="text-[11px] text-txt-secondary mt-0.5 font-mono italic">{a.beschreibung}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.tipps && <TippBox tipps={data.tipps} />}
    </div>
  );
}

function CanvasContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}

      {data.funktionen && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">FUNKTIONEN</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.funktionen.map((f, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <p className="text-xs font-medium text-txt-primary mb-1">{f.name}</p>
                <p className="text-[11px] text-txt-secondary">{f.beschreibung}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.wann_nutzen && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-2">WANN CANVAS NUTZEN?</p>
          <ul className="space-y-1">
            {data.wann_nutzen.map((w, i) => (
              <li key={i} className="text-xs text-txt-secondary flex items-start gap-2">
                <span className="text-status-green mt-0.5 shrink-0">→</span>{w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ModelleContent({ data }) {
  return (
    <div className="space-y-5">
      {data.intro && <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>}

      {data.optionen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.optionen.map((m, i) => (
            <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-scnat-red" />
                <h5 className="text-sm font-heading font-semibold text-txt-primary">{m.name}</h5>
              </div>
              <p className="text-xs text-txt-secondary mb-3">{m.beschreibung}</p>
              <div className="mb-2">
                <p className="text-[10px] font-mono text-status-green mb-1">Ideal für</p>
                {m.ideal_fuer?.map((f, j) => (
                  <p key={j} className="text-[11px] text-txt-secondary">✓ {f}</p>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-mono text-scnat-red mb-1">Nicht für</p>
                {m.nicht_fuer?.map((f, j) => (
                  <p key={j} className="text-[11px] text-txt-secondary">✗ {f}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShortcutsContent({ data }) {
  return (
    <div className="space-y-5">
      {data.kategorien?.map((kat, i) => (
        <div key={i}>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">{kat.name.toUpperCase()}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {kat.items?.map((item, j) => (
              <div key={j} className="flex items-center gap-3 bg-bg-elevated border border-bd-faint rounded-sm px-3 py-2.5">
                {item.kuerzel ? (
                  <>
                    <kbd className="text-[10px] font-mono bg-bg-surface border border-bd-faint px-2 py-0.5 rounded-sm text-txt-primary whitespace-nowrap">{item.kuerzel}</kbd>
                    <span className="text-xs text-txt-secondary">{item.aktion}</span>
                  </>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-txt-primary">{item.tipp}</p>
                    <p className="text-[11px] text-txt-secondary mt-0.5">{item.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TippBox({ tipps }) {
  if (!tipps?.length) return null;
  return (
    <div className="bg-status-green/5 border border-status-green/20 rounded-sm p-3">
      <p className="text-[10px] font-mono text-status-green mb-2">PRAXIS-TIPPS</p>
      <ul className="space-y-1.5">
        {tipps.map((t, i) => (
          <li key={i} className="text-xs text-txt-secondary flex items-start gap-2">
            <span className="text-status-green mt-0.5 shrink-0">💡</span>{t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfisTab({ profis, cotSzenarien, reasoningVergleich }) {
  const PROFIS_SECTIONS = [
    { id: 'wie_ki_funktioniert', icon: Zap },
    { id: 'training', icon: GitBranch },
    { id: 'cot', icon: Brain, custom: true },
    { id: 'reasoning', icon: Cpu, custom: true },
    { id: 'rag', icon: Database },
    { id: 'embeddings', icon: Layers },
    { id: 'fine_tuning', icon: Settings },
    { id: 'agenten', icon: Workflow },
    { id: 'multimodal', icon: Eye },
    { id: 'ethik', icon: Scale },
    { id: 'zukunft', icon: Compass },
    { id: 'glossar', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {profis?.intro && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
          <p className="text-xs text-txt-secondary leading-relaxed">{profis.intro}</p>
        </div>
      )}

      {PROFIS_SECTIONS.map(({ id, icon: SIcon, custom }) => {
        if (id === 'cot') {
          return (
            <Section key={id} title="Chain-of-Thought — So denkt KI" icon={SIcon}>
              <div className="space-y-4">
                <p className="text-xs text-txt-secondary leading-relaxed">
                  Chain-of-Thought (CoT) bedeutet, dass ein KI-Modell seinen Denkprozess offenlegt, bevor es antwortet. Statt direkt eine Antwort zu geben, zerlegt es das Problem in Teilschritte. Das führt zu genaueren Ergebnissen — besonders bei komplexen Aufgaben wie Berechnungen, Analysen oder Planung.
                </p>
                <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                  <p className="text-[10px] font-mono text-txt-tertiary mb-1">WARUM IST DAS WICHTIG?</p>
                  <p className="text-xs text-txt-secondary leading-relaxed">
                    Ohne CoT «rät» das Modell oft die Antwort in einem Schritt — wie ein Schüler, der bei einer Matheaufgabe direkt das Ergebnis hinschreibt. Mit CoT zeigt es den Lösungsweg — und macht dabei weniger Fehler. Du kannst CoT in Standard-Modellen auslösen, indem du schreibst: «Denke Schritt für Schritt nach». Reasoning-Modelle (o3, o4-mini) tun dies automatisch.
                  </p>
                </div>
                <CotVisualization szenarien={cotSzenarien} />
              </div>
            </Section>
          );
        }
        if (id === 'reasoning') {
          return (
            <Section key={id} title="Reasoning-Modelle vs. Standard" icon={SIcon}>
              <div className="space-y-4">
                <p className="text-xs text-txt-secondary leading-relaxed">
                  OpenAI bietet seit 2024 sogenannte «Reasoning-Modelle» an (o1, o3, o4-mini). Diese denken intern nach, bevor sie antworten — man sieht einen «Thinking»-Block, in dem das Modell seine Überlegungen zeigt. Der Unterschied zu Standard-Modellen ist fundamental: Standard-Modelle antworten direkt, Reasoning-Modelle planen erst.
                </p>
                <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                  <p className="text-[10px] font-mono text-txt-tertiary mb-1">WANN LOHNT SICH EIN REASONING-MODELL?</p>
                  <p className="text-xs text-txt-secondary leading-relaxed">
                    Wenn die Aufgabe Logik erfordert, mehrere Schritte hat oder Fehler teuer wären. Für einfache Textaufgaben (E-Mail, Übersetzung) ist ein Standard-Modell schneller und günstiger. Faustregel: Wenn du selbst nachdenken müsstest, bevor du antwortest, nimm ein Reasoning-Modell.
                  </p>
                </div>
                <ReasoningVergleich vergleich={reasoningVergleich} />
              </div>
            </Section>
          );
        }
        const section = profis?.[id];
        if (!section) return null;
        return (
          <Section key={id} title={section.titel} icon={SIcon} defaultOpen={id === 'wie_ki_funktioniert'}>
            {id === 'wie_ki_funktioniert' && <WieKiFunktioniertContent data={section} />}
            {id === 'training' && <TrainingContent data={section} />}
            {id === 'rag' && <RagContent data={section} />}
            {id === 'embeddings' && <EmbeddingsContent data={section} />}
            {id === 'fine_tuning' && <FineTuningContent data={section} />}
            {id === 'agenten' && <AgentenContent data={section} />}
            {id === 'multimodal' && <MultimodalContent data={section} />}
            {id === 'ethik' && <EthikContent data={section} />}
            {id === 'zukunft' && <ZukunftContent data={section} />}
            {id === 'glossar' && <GlossarContent data={section} />}
          </Section>
        );
      })}
    </div>
  );
}

function WieKiFunktioniertContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>
      <div className="space-y-3">
        {data.konzepte?.map((k, i) => (
          <details key={i} className="group bg-bg-elevated border border-bd-faint rounded-sm">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-xs font-medium text-txt-primary hover:bg-bg-surface transition-colors list-none">
              <ChevronDown className="w-3.5 h-3.5 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
              <span className="text-scnat-red font-mono text-[10px]">{String(i+1).padStart(2,'0')}</span>
              {k.name}
            </summary>
            <div className="px-4 pb-3 space-y-2">
              <p className="text-xs text-txt-secondary leading-relaxed">{k.erklaerung}</p>
              {k.analogie && (
                <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-3 py-2">
                  <span className="text-[10px] font-mono text-status-blue block mb-1">Analogie</span>
                  <p className="text-xs text-txt-secondary italic leading-relaxed">{k.analogie}</p>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function TrainingContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>
      <div className="space-y-3">
        {data.phasen?.map((p, i) => (
          <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-7 h-7 rounded-sm bg-scnat-red/15 text-scnat-red flex items-center justify-center text-xs font-mono shrink-0">{i+1}</div>
              <h5 className="text-xs font-heading font-semibold text-txt-primary pt-1">{p.name}</h5>
            </div>
            <p className="text-xs text-txt-secondary leading-relaxed mb-2">{p.beschreibung}</p>
            <div className="bg-bg-surface border border-bd-faint rounded-sm px-3 py-2">
              <span className="text-[10px] font-mono text-status-green">Ergebnis: </span>
              <span className="text-xs text-txt-secondary">{p.ergebnis}</span>
            </div>
          </div>
        ))}
      </div>
      {data.wichtig && (
        <div className="bg-status-yellow/5 border border-status-yellow/20 rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono text-status-yellow mb-1">WICHTIG ZU WISSEN</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.wichtig}</p>
        </div>
      )}
    </div>
  );
}

function RagContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>

      {data.wie_es_funktioniert && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">SO FUNKTIONIERT RAG</p>
          <div className="space-y-2">
            {data.wie_es_funktioniert.map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <div className="w-6 h-6 rounded-sm bg-scnat-red/15 text-scnat-red flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{i+1}</div>
                <div>
                  <p className="text-xs font-medium text-txt-primary">{s.schritt}</p>
                  <p className="text-xs text-txt-secondary mt-0.5 leading-relaxed">{s.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.vorteile && (
        <div className="bg-status-green/5 border border-status-green/20 rounded-sm p-3">
          <p className="text-[10px] font-mono text-status-green mb-2">VORTEILE</p>
          <ul className="space-y-1.5">
            {data.vorteile.map((v, i) => (
              <li key={i} className="text-xs text-txt-secondary flex items-start gap-2"><span className="text-status-green mt-0.5 shrink-0">✓</span>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {data.scnat_relevanz && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono text-status-blue mb-1">SCNAT-RELEVANZ</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.scnat_relevanz}</p>
        </div>
      )}
    </div>
  );
}

function EmbeddingsContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>
      {data.erklaerung && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-4 py-3">
          <p className="text-xs text-txt-primary leading-relaxed">{data.erklaerung}</p>
        </div>
      )}

      {data.anwendungen && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">ANWENDUNGEN</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.anwendungen.map((a, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <p className="text-xs font-medium text-txt-primary mb-1">{a.name}</p>
                <p className="text-[11px] text-txt-secondary leading-relaxed">{a.beschreibung}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.dimensionen && (
        <div className="bg-bg-elevated border border-bd-faint rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono text-txt-tertiary mb-1">DIMENSIONEN</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.dimensionen}</p>
        </div>
      )}
    </div>
  );
}

function FineTuningContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>

      {data.vergleich && (
        <div className="space-y-3">
          {data.vergleich.map((m, i) => (
            <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-4">
              <h5 className="text-xs font-heading font-semibold text-txt-primary mb-2">{m.methode}</h5>
              <p className="text-xs text-txt-secondary mb-3 leading-relaxed">{m.beschreibung}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-mono text-status-green mb-1">Vorteile</p>
                  {m.vorteile.map((v, j) => <p key={j} className="text-[11px] text-txt-secondary">✓ {v}</p>)}
                </div>
                <div>
                  <p className="text-[10px] font-mono text-scnat-red mb-1">Nachteile</p>
                  {m.nachteile.map((v, j) => <p key={j} className="text-[11px] text-txt-secondary">✗ {v}</p>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.empfehlung && (
        <div className="bg-status-green/5 border border-status-green/20 rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono text-status-green mb-1">EMPFEHLUNG FÜR DIE SCNAT</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.empfehlung}</p>
        </div>
      )}
    </div>
  );
}

function AgentenContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>
      {data.was_ist_ein_agent && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-4 py-3">
          <p className="text-xs text-txt-primary leading-relaxed">{data.was_ist_ein_agent}</p>
        </div>
      )}

      {data.faehigkeiten && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">FÄHIGKEITEN EINES AGENTEN</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.faehigkeiten.map((f, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <p className="text-xs font-medium text-txt-primary flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-scnat-red" />{f.name}
                </p>
                <p className="text-[11px] text-txt-secondary mt-1 leading-relaxed">{f.beschreibung}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.beispiele && (
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-3">BEISPIELE</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.beispiele.map((b, i) => (
              <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
                <p className="text-xs font-medium text-txt-primary">{b.name}</p>
                <p className="text-[11px] text-txt-secondary mt-1">{b.beschreibung}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.risiken && (
        <div className="bg-status-yellow/5 border border-status-yellow/20 rounded-sm p-3">
          <p className="text-[10px] font-mono text-status-yellow mb-2">RISIKEN & GRENZEN</p>
          <ul className="space-y-1.5">
            {data.risiken.map((r, i) => (
              <li key={i} className="text-xs text-txt-secondary flex items-start gap-2"><span className="text-status-yellow mt-0.5 shrink-0">⚠</span>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {data.scnat_relevanz && (
        <div className="bg-bg-elevated border border-bd-faint rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono text-status-blue mb-1">SCNAT-RELEVANZ</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.scnat_relevanz}</p>
        </div>
      )}
    </div>
  );
}

function MultimodalContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>

      {data.modalitaeten && (
        <div className="space-y-3">
          {data.modalitaeten.map((m, i) => (
            <details key={i} className="group bg-bg-elevated border border-bd-faint rounded-sm">
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer text-xs text-txt-primary hover:bg-bg-surface transition-colors list-none">
                <ChevronDown className="w-3.5 h-3.5 text-txt-tertiary group-open:rotate-180 transition-transform duration-200 shrink-0" />
                <span className="font-medium flex-1">{m.typ}</span>
                <span className="text-[10px] font-mono text-txt-tertiary hidden sm:inline">{m.tool}</span>
              </summary>
              <div className="px-4 pb-3 space-y-2">
                <p className="text-xs text-txt-secondary leading-relaxed">{m.erklaerung}</p>
                <div className="sm:hidden text-[10px] font-mono text-txt-tertiary">{m.tool}</div>
                <div className="bg-bg-surface border border-bd-faint rounded-sm px-3 py-2">
                  <span className="text-[10px] font-mono text-scnat-red">SCNAT-Beispiel: </span>
                  <span className="text-xs text-txt-secondary">{m.scnat_beispiel}</span>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function EthikContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>

      {data.themen && (
        <div className="space-y-3">
          {data.themen.map((t, i) => (
            <details key={i} className="group bg-bg-elevated border border-bd-faint rounded-sm">
              <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer text-xs font-medium text-txt-primary hover:bg-bg-surface transition-colors list-none">
                <ChevronDown className="w-3.5 h-3.5 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
                {t.name}
              </summary>
              <div className="px-4 pb-3 space-y-2">
                <p className="text-xs text-txt-secondary leading-relaxed">{t.erklaerung}</p>
                {t.beispiel && (
                  <div className="bg-status-yellow/5 border border-status-yellow/20 rounded-sm px-3 py-2">
                    <span className="text-[10px] font-mono text-status-yellow block mb-1">Beispiel</span>
                    <p className="text-xs text-txt-secondary italic">{t.beispiel}</p>
                  </div>
                )}
                {t.was_tun && (
                  <div className="bg-status-green/5 border border-status-green/20 rounded-sm px-3 py-2">
                    <span className="text-[10px] font-mono text-status-green block mb-1">Was tun?</span>
                    <p className="text-xs text-txt-secondary">{t.was_tun}</p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}

      {data.scnat_relevanz && (
        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm px-4 py-3">
          <p className="text-[10px] font-mono text-status-blue mb-1">SCNAT-RELEVANZ</p>
          <p className="text-xs text-txt-secondary leading-relaxed">{data.scnat_relevanz}</p>
        </div>
      )}
    </div>
  );
}

function ZukunftContent({ data }) {
  return (
    <div className="space-y-5">
      <p className="text-xs text-txt-secondary leading-relaxed">{data.intro}</p>

      {data.trends && (
        <div className="space-y-3">
          {data.trends.map((t, i) => (
            <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h5 className="text-xs font-heading font-semibold text-txt-primary">{t.name}</h5>
                <span className="text-[10px] font-mono text-scnat-red bg-scnat-red/10 px-2 py-0.5 rounded-sm whitespace-nowrap">{t.zeitraum}</span>
              </div>
              <p className="text-xs text-txt-secondary leading-relaxed mb-2">{t.beschreibung}</p>
              <div className="bg-bg-surface border border-bd-faint rounded-sm px-3 py-2">
                <span className="text-[10px] font-mono text-status-blue">Impact: </span>
                <span className="text-xs text-txt-secondary">{t.impact}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GlossarContent({ data }) {
  const [search, setSearch] = useState('');
  const filtered = data.begriffe?.filter(b =>
    !search || b.term.toLowerCase().includes(search.toLowerCase()) || b.def.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Begriff suchen..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
      />
      <div className="space-y-1">
        {filtered.map((b, i) => (
          <details key={i} className="group bg-bg-elevated border border-bd-faint rounded-sm">
            <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer text-xs text-txt-primary hover:bg-bg-surface transition-colors list-none">
              <ChevronDown className="w-3 h-3 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
              <span className="font-mono text-scnat-red font-semibold text-[11px]">{b.term}</span>
            </summary>
            <div className="px-3 pb-2.5 text-xs text-txt-secondary leading-relaxed ml-5">{b.def}</div>
          </details>
        ))}
      </div>
      <p className="text-[10px] text-txt-tertiary text-center">{filtered.length} von {data.begriffe?.length || 0} Begriffen</p>
    </div>
  );
}

function SecurityModule({ data }) {
  const [subTab, setSubTab] = useState('guardrails');
  if (!data) return null;

  const sections = [
    { id: 'guardrails', label: 'Guardrails', icon: Shield },
    { id: 'jailbreaking', label: 'Jailbreaking', icon: AlertTriangle },
    { id: 'prompt_injection', label: 'Prompt Injection', icon: Lock },
  ];

  const section = data[subTab];

  return (
    <div className="mt-8 bg-bg-surface border border-status-yellow/20 rounded-sm">
      <div className="px-5 py-3 border-b border-bd-faint flex items-center gap-2">
        <Shield className="w-4 h-4 text-status-yellow" />
        <h3 className="text-sm font-heading font-semibold text-txt-primary">Sicherheit & Grenzen</h3>
      </div>

      <div className="flex border-b border-bd-faint overflow-x-auto">
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSubTab(s.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                subTab === s.id ? 'text-txt-primary border-b-2 border-scnat-red' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </div>

      {section && (
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-sm font-heading font-medium text-txt-primary mb-2">{section.titel}</h4>
            <p className="text-xs text-txt-secondary leading-relaxed">{section.inhalt}</p>
          </div>

          {section.beispiele && (
            <div>
              <p className="text-[10px] font-mono text-txt-tertiary mb-2">Beispiele:</p>
              <div className="space-y-1.5">
                {section.beispiele.map((b, i) => (
                  <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm px-3 py-2 text-xs text-txt-secondary font-mono">{b}</div>
                ))}
              </div>
            </div>
          )}

          {section.techniken && (
            <div>
              <p className="text-[10px] font-mono text-txt-tertiary mb-2">Techniken:</p>
              <div className="space-y-1.5">
                {section.techniken.map((t, i) => (
                  <div key={i} className="bg-bg-elevated border border-bd-faint rounded-sm px-3 py-2 text-xs text-txt-secondary font-mono">{t}</div>
                ))}
              </div>
            </div>
          )}

          {section.schutz && (
            <div>
              <p className="text-[10px] font-mono text-status-green mb-2">Schutzmassnahmen:</p>
              {section.schutz.map((s, i) => (
                <p key={i} className="text-xs text-txt-secondary mb-1">✓ {s}</p>
              ))}
            </div>
          )}

          <div className="bg-status-yellow/5 border border-status-yellow/20 rounded-sm px-3 py-2">
            <p className="text-xs text-status-yellow">{section.scnat_relevanz}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children, defaultOpen = false, icon: SectionIcon }) {
  return (
    <details open={defaultOpen} className="group bg-bg-surface border border-bd-faint rounded-sm">
      <summary className="flex items-center gap-2 px-5 py-3 cursor-pointer text-sm font-heading font-medium text-txt-primary hover:bg-bg-elevated transition-colors list-none">
        <ChevronDown className="w-4 h-4 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
        {SectionIcon && <SectionIcon className="w-4 h-4 text-scnat-red shrink-0" />}
        {title}
      </summary>
      <div className="px-5 pb-4">{children}</div>
    </details>
  );
}

export default function KiHub() {
  const [tab, setTab] = useState('tools');
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch('/api/ki-content', { credentials: 'include' })
      .then(r => r.json())
      .then(setContent)
      .catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader
        title="KI-Hub"
        subtitle="Interaktiver Lernbereich: Wie KI funktioniert, wie man sie nutzt, und wo die Grenzen liegen"
        breadcrumb={[{ label: 'KI' }]}
        seed={88}
        accentColor="#3498DB"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Persistent GL guideline banner across all tabs */}
      {tab !== 'tools' && (
        <div className="mb-6 bg-scnat-red/5 border border-scnat-red/20 rounded-sm px-4 py-3 flex items-start gap-3">
          <Shield className="w-4 h-4 text-scnat-red shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-txt-primary leading-relaxed">
              <strong>GL-Beschluss März 2025:</strong> Die Nutzung von KI bei der SCNAT unterliegt verbindlichen Richtlinien. Keine vertraulichen oder personenbezogenen Daten in KI-Tools eingeben. Nur freigegebene Tools verwenden. Alle Ergebnisse prüfen.
            </p>
            <button
              onClick={() => setTab('tools')}
              className="text-[11px] text-scnat-red hover:underline mt-1 font-medium"
            >
              → Vollständige Richtlinien ansehen
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1 mb-6 bg-bg-surface border border-bd-faint rounded-sm p-1 w-full sm:w-fit overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap ${
                tab === t.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'denken' && content && (
        <ProfisTab
          profis={content.profis}
          cotSzenarien={content.cot_szenarien}
          reasoningVergleich={content.reasoning_vergleich}
        />
      )}

      {tab === 'chatgpt' && content && (
        <div>
          <ChatGPTTab data={content.chatgpt} />
          <SecurityModule data={content.sicherheit} />
        </div>
      )}

      {tab === 'tools' && (
        <div className="space-y-8">
          <KiFramework />
          <LlmComparison />
          <OllamaSection />
          <PromptTips />
        </div>
      )}
    </div>
    </div>
  );
}
