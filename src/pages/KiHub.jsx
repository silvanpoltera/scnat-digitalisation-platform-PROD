import { useState, useEffect } from 'react';
import { Brain, MessageSquare, Wrench, ChevronDown, Shield, AlertTriangle, Lock } from 'lucide-react';
import LlmComparison from '../components/ki/LlmComparison';
import OllamaSection from '../components/ki/OllamaSection';
import PromptTips from '../components/ki/PromptTips';
import PageHeader from '../components/PageHeader';

const TABS = [
  { id: 'tools', label: 'Tools & Einsatz', icon: Wrench },
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

  return (
    <div className="space-y-8">
      {/* Prompts */}
      <Section title={data.prompts?.titel} defaultOpen>
        <div className="space-y-4 mb-4">
          {data.prompts?.schlecht_gut?.map((pair, i) => (
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
        <div>
          <p className="text-[10px] font-mono text-txt-tertiary mb-2">SCNAT Use-Cases:</p>
          <div className="flex flex-wrap gap-1.5">
            {data.prompts?.scnat_usecases?.map((uc, i) => (
              <span key={i} className="text-xs bg-bg-elevated border border-bd-faint px-2 py-1 rounded-sm text-txt-secondary">{uc}</span>
            ))}
          </div>
        </div>
      </Section>

      {/* Personalisierung */}
      <Section title={data.personalisierung?.titel}>
        <ul className="space-y-2">
          {data.personalisierung?.punkte?.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-txt-secondary">
              <span className="w-4 h-4 rounded-sm bg-bg-elevated flex items-center justify-center text-[10px] font-mono text-txt-tertiary shrink-0 mt-0.5">{i + 1}</span>
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* Projekte */}
      <Section title={data.projekte?.titel}>
        <ul className="space-y-2">
          {data.projekte?.punkte?.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-txt-secondary">
              <span className="w-4 h-4 rounded-sm bg-bg-elevated flex items-center justify-center text-[10px] font-mono text-txt-tertiary shrink-0 mt-0.5">{i + 1}</span>
              {p}
            </li>
          ))}
        </ul>
      </Section>

      {/* Custom GPTs */}
      <Section title={data.gpts?.titel}>
        <ul className="space-y-2">
          {data.gpts?.punkte?.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-txt-secondary">
              <span className="w-4 h-4 rounded-sm bg-bg-elevated flex items-center justify-center text-[10px] font-mono text-txt-tertiary shrink-0 mt-0.5">{i + 1}</span>
              {p}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function SecurityModule({ data }) {
  const [subTab, setSubTab] = useState('rail_guards');
  if (!data) return null;

  const sections = [
    { id: 'rail_guards', label: 'Rail Guards', icon: Shield },
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

function Section({ title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group bg-bg-surface border border-bd-faint rounded-sm">
      <summary className="flex items-center gap-2 px-5 py-3 cursor-pointer text-sm font-heading font-medium text-txt-primary hover:bg-bg-elevated transition-colors list-none">
        <ChevronDown className="w-4 h-4 text-txt-tertiary group-open:rotate-180 transition-transform duration-200" />
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
        <div className="space-y-10">
          <CotVisualization szenarien={content.cot_szenarien} />
          <ReasoningVergleich vergleich={content.reasoning_vergleich} />
        </div>
      )}

      {tab === 'chatgpt' && content && (
        <div>
          <ChatGPTTab data={content.chatgpt} />
          <SecurityModule data={content.sicherheit} />
        </div>
      )}

      {tab === 'tools' && (
        <div className="space-y-8">
          <LlmComparison />
          <OllamaSection />
          <PromptTips />
        </div>
      )}
    </div>
    </div>
  );
}
