import { useState, useRef, useCallback, useEffect } from 'react';
import {
  AudioLines, Play, Square, Trash2, Upload, FileText, Sparkles,
  ShieldCheck, Cpu, HardDrive, Loader2,
} from 'lucide-react';
import { useEchoEngine } from '../../hooks/useEchoEngine';
import { useIsMobile } from '../../hooks/use-mobile';

const WHISPER_MODELS = [
  { id: 'turbo',        label: 'Turbo',        size: '~3 GB',   desc: 'Sehr schnell, hohe Qualität (empfohlen)' },
  { id: 'large-v3',     label: 'Large V3',     size: '~6 GB',   desc: 'Beste Genauigkeit, etwas langsamer' },
  { id: 'swiss-german', label: 'Swiss German', size: '~1.5 GB', desc: 'Spezial-Modell für CH-Dialekte → Hochdeutsch' },
];
const LANGUAGES = [
  { id: 'auto', label: 'Automatisch (verwendet Large V3)' },
  { id: 'de',   label: 'Deutsch' },
  { id: 'en',   label: 'English' },
  { id: 'fr',   label: 'Français' },
  { id: 'it',   label: 'Italiano' },
];
const OUTPUT_LANGUAGE_MODES = [
  { id: 'multi', label: 'Mehrsprachig (Originalsprache behalten)' },
  { id: 'de', label: 'Alles auf Deutsch' },
  { id: 'fr', label: 'Alles auf Französisch' },
  { id: 'it', label: 'Alles auf Italienisch' },
];

const DEFAULT_ECHO_ADDONS = {
  polish: {
    enabled_default: true,
    system_prompt: '',
    prompts: {
      multi: '',
      de: '',
      fr: '',
      it: '',
    },
  },
  document_template: {
    title: 'Meeting-Transkript',
    dateLabel: 'Datum',
    participantsLabel: 'Teilnehmer',
    unknownParticipants: 'Nicht eindeutig erkennbar',
    summaryLabel: 'Management Summary',
    bulletLabel: 'Besprochene Punkte',
    transcriptLabel: 'Wörtliche Transkription (1:1)',
  },
};

const STAGE_LABELS = {
  queued:           'In Warteschlange',
  extracting_audio: 'Audio wird extrahiert',
  loading_model:    'Modell wird geladen',
  transcribing:     'Transkribiert',
  diarizing:        'Sprecher werden erkannt',
  polishing:        'Text wird verfeinert',
  exporting:        'Wird exportiert',
  done:             'Fertig',
  cancelled:        'Abgebrochen',
};

function formatBytes(b) {
  if (!b) return '–';
  const u = ['B','KB','MB','GB']; let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(1)} ${u[i]}`;
}

function humanizeJobError(rawError) {
  const raw = String(rawError || '').trim();
  if (!raw) {
    return {
      userMessage: 'Uuups, da hat etwas nicht geklappt. Bitte Job erneut starten.',
      technical: '',
    };
  }
  const lowered = raw.toLowerCase();
  if (
    lowered.includes('401 client error')
    || lowered.includes('repository not found')
    || lowered.includes('invalid username or password')
    || lowered.includes('huggingface.co')
  ) {
    return {
      userMessage: 'Uuups, da hat etwas nicht geklappt. Das Modell konnte nicht geladen werden. Bitte anderes Modell wählen oder IT Support kontaktieren.',
      technical: raw,
    };
  }
  if (lowered.includes('timeout')) {
    return {
      userMessage: 'Uuups, da hat etwas nicht geklappt. Die Verarbeitung hat zu lange gedauert. Bitte erneut versuchen.',
      technical: raw,
    };
  }
  return {
    userMessage: 'Uuups, da hat etwas nicht geklappt. Bitte erneut versuchen.',
    technical: raw,
  };
}

export default function EchoTranskription() {
  const isMobile = useIsMobile();
  const {
    health, jobs, isRunning, isAvailable, baseUrl, isStartingEcho, lastError,
    uploadFile, startJob, stopJob, removeJob, clearQueue, downloadResult,
    refreshHealth, attemptStartEcho, setManualBaseUrl,
  } = useEchoEngine();

  const [files, setFiles] = useState([]);
  const [settings, setSettings] = useState({
    model: 'turbo',
    language: 'auto',
    enableDiarization: true,
    outputLanguageMode: 'multi',
    enablePromptPolish: true,
    parallelJobs: 2,
  });
  const [dragActive, setDragActive] = useState(false);
  const [uiError, setUiError] = useState('');
  const [echoAddOns, setEchoAddOns] = useState(DEFAULT_ECHO_ADDONS);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch('/api/echo-addons', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => {
        setEchoAddOns({
          ...DEFAULT_ECHO_ADDONS,
          ...(data || {}),
          polish: {
            ...DEFAULT_ECHO_ADDONS.polish,
            ...(data?.polish || {}),
            prompts: {
              ...DEFAULT_ECHO_ADDONS.polish.prompts,
              ...(data?.polish?.prompts || {}),
            },
          },
          document_template: {
            ...DEFAULT_ECHO_ADDONS.document_template,
            ...(data?.document_template || {}),
          },
        });
      })
      .catch(() => setEchoAddOns(DEFAULT_ECHO_ADDONS));
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragActive(false);
    setUiError('');
    for (const file of Array.from(e.dataTransfer.files || [])) {
      try {
        const uploaded = await uploadFile(file);
        const previewUrl = URL.createObjectURL(file);
        setFiles(prev => [...prev, { ...uploaded, previewUrl }]);
      } catch (err) {
        setUiError(err?.message || 'Upload fehlgeschlagen.');
      }
    }
  }, [uploadFile]);

  const handleStart = useCallback(async () => {
    setUiError('');
    const maxParallel = Math.max(1, Number(settings.parallelJobs || 1));
    const selectedPrompt = echoAddOns?.polish?.prompts?.[settings.outputLanguageMode] || '';
    const runtimeSettings = {
      ...settings,
      enablePromptPolish: settings.enablePromptPolish && echoAddOns?.polish?.enabled_default !== false,
      polishPrompt: selectedPrompt,
      polishSystemPrompt: echoAddOns?.polish?.system_prompt || '',
      documentTemplate: echoAddOns?.document_template || DEFAULT_ECHO_ADDONS.document_template,
    };
    for (let i = 0; i < files.length; i += maxParallel) {
      const batch = files.slice(i, i + maxParallel);
      const results = await Promise.allSettled(
        batch.map((file) => startJob({ ...file, settings: runtimeSettings })),
      );
      const failed = results.find((result) => result.status === 'rejected');
      if (failed?.reason) {
        setUiError(failed.reason?.message || 'Mindestens ein Job konnte nicht gestartet werden.');
      }
    }
    files.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
    setFiles([]);
  }, [echoAddOns, files, settings, startJob]);

  useEffect(() => () => {
    files.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
  }, [files]);

  if (isMobile) {
    return <MobileOnlyEchoInfo />;
  }

  if (health.status === 'unknown') {
    return (
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-4 h-4 text-txt-tertiary animate-spin" />
        <span className="text-xs text-txt-secondary">Engine-Status wird geprüft...</span>
      </div>
    );
  }

  if (!isAvailable) {
    return (
      <NotAvailableView
        health={health}
        isStartingEcho={isStartingEcho}
        lastError={lastError}
        onRetry={refreshHealth}
        onStartEcho={attemptStartEcho}
        onSetManualBaseUrl={setManualBaseUrl}
      />
    );
  }

  return (
    <div className="space-y-6 text-txt-primary">
      <IntroBanner health={health} />

      <div className="rounded-sm border-2 border-scnat-red/25 bg-scnat-red/5 p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-scnat-red animate-pulse" />
          <p className="text-[11px] font-mono uppercase tracking-wider text-scnat-red">
            Echo Studio · Aktiver Arbeitsbereich
          </p>
        </div>

        {uiError && (
          <div className="bg-scnat-red/5 border border-scnat-red/20 rounded-sm px-3 py-2 mt-3">
            <p className="text-xs text-scnat-red">{uiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mt-4">
          <div className="space-y-6 min-w-0">
            <DropZone
              dragActive={dragActive}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onClick={() => inputRef.current?.click()}
              inputRef={inputRef}
              onChange={async (e) => {
                setUiError('');
                for (const f of Array.from(e.target.files)) {
                  try {
                    const up = await uploadFile(f);
                    const previewUrl = URL.createObjectURL(f);
                    setFiles(prev => [...prev, { ...up, previewUrl }]);
                  } catch (err) {
                    setUiError(err?.message || 'Upload fehlgeschlagen.');
                  }
                }
                e.target.value = '';
              }}
            />

            <ActionBar
              canStart={files.length > 0 && !isRunning}
              canStop={isRunning}
              canClear={jobs.length > 0}
              onStart={handleStart}
              onStop={stopJob}
              onClear={clearQueue}
            />

            <UploadedFiles files={files} />

            <JobQueue
              jobs={jobs}
              onRemove={removeJob}
              onDownload={downloadResult}
            />
          </div>

          <SettingsPanel settings={settings} onChange={setSettings} />
        </div>
      </div>

      <Footer baseUrl={baseUrl} />
    </div>
  );
}

function IntroBanner({ health }) {
  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-sm bg-scnat-red/10">
          <AudioLines className="w-5 h-5 text-scnat-red" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-heading font-semibold text-txt-primary">SCNAT Echo</h3>
          <p className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider mt-0.5">
            by Arber Aziri · On-device Transkription
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-status-amber/10 border border-status-amber/20">
          <span className="text-[10px] font-mono text-status-amber">Beta auf Anfrage</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-status-green/10 border border-status-green/20">
          <div className="w-1.5 h-1.5 rounded-full bg-status-green" />
          <span className="text-[10px] font-mono text-status-green">Engine bereit</span>
        </div>
      </div>

      <p className="text-xs text-txt-secondary leading-relaxed mb-3">
        Audio- oder Video-Dateien werden direkt auf deinem Mac transkribiert. Die Audio-Daten verlassen
        dein Gerät nie — keine Cloud, kein Upload zu externen Servern, kein Datenschutz-Risiko.
      </p>

      <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3 mb-3">
        <p className="text-xs text-txt-secondary leading-relaxed">
          <strong className="text-txt-primary">SCNAT Echo wurde von Arber aus der IT für die SCNAT aufgebaut</strong>,
          damit wir bei Transkriptionen keine Sicherheits- oder Souveränitätsprobleme mit externen Cloud-Diensten
          bekommen. Alles läuft lokal auf dem jeweiligen MacBook.
        </p>
      </div>
      <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm p-3 mb-3">
        <p className="text-xs text-txt-secondary leading-relaxed">
          Voraussetzung ist eine installierte <strong className="text-txt-primary">Echo.app</strong> auf dem Notebook.
          Falls Echo fehlt oder nicht funktioniert, bitte hier melden oder direkt den IT Support kontaktieren.
        </p>
      </div>

      <div className="bg-status-yellow/5 border border-status-yellow/20 rounded-sm p-3 mb-3">
        <p className="text-[10px] font-mono uppercase tracking-wider text-status-yellow mb-1">
          Sicherheits-Hinweis
        </p>
        <p className="text-xs text-txt-secondary leading-relaxed">
          Bitte achte darauf, dass die Audio-Dateien während Aufnahme und Verarbeitung nicht in private Cloud-Ordner
          (z. B. iCloud Drive, Dropbox, Google Drive, OneDrive) synchronisiert werden. Eine solche Synchronisation
          würde die Datensicherheitsvorgaben der SCNAT grundsätzlich verletzen.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <InfoTile
          icon={ShieldCheck}
          label="Datenschutz"
          value="100 % lokal"
          tone="green"
        />
        <InfoTile
          icon={Cpu}
          label="Hardware"
          value={`Apple Silicon · MLX ${health?.hardware?.mlx_version || '–'}`}
          tone="blue"
        />
        <InfoTile
          icon={HardDrive}
          label="Modelle"
          value={health?.echo_app_detected ? 'Echo.app erkannt' : 'Lokaler Cache'}
          tone="amber"
        />
      </div>
    </div>
  );
}

function InfoTile({ icon: Icon, label, value, tone }) {
  const toneClass = {
    green: 'text-status-green',
    blue:  'text-status-blue',
    amber: 'text-status-amber',
  }[tone] || 'text-txt-secondary';
  return (
    <div className="bg-bg-elevated border border-bd-faint rounded-sm px-3 py-2">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className={`w-3 h-3 ${toneClass}`} />
        <p className="text-[10px] font-mono text-txt-tertiary uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-xs text-txt-primary truncate">{value}</p>
    </div>
  );
}

function ActionBar({ canStart, canStop, canClear, onStart, onStop, onClear }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-sm bg-bg-surface border border-bd-faint">
      <button
        onClick={onStart}
        disabled={!canStart}
        className="flex items-center gap-2 px-4 py-2 rounded-sm
                   bg-scnat-red text-white text-xs font-medium
                   hover:bg-scnat-darkred disabled:bg-bd-default disabled:text-txt-tertiary
                   transition-colors"
      >
        <Play className="w-3.5 h-3.5" strokeWidth={2.5} />
        Start Transkription
      </button>
      <button
        onClick={onStop}
        disabled={!canStop}
        className="flex items-center justify-center w-9 h-9 rounded-sm
                   bg-bg-elevated border border-bd-default text-txt-primary
                   hover:bg-bd-faint disabled:text-txt-tertiary disabled:hover:bg-bg-elevated
                   transition-colors"
        title="Aktuellen Job stoppen"
      >
        <Square className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1" />
      <button
        onClick={onClear}
        disabled={!canClear}
        className="flex items-center justify-center w-9 h-9 rounded-sm
                   bg-bg-elevated border border-bd-default text-txt-secondary
                   hover:bg-bd-faint disabled:text-txt-tertiary disabled:hover:bg-bg-elevated
                   transition-colors"
        title="Warteschlange leeren"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function DropZone({ dragActive, onDrop, onDragOver, onDragLeave, onClick, inputRef, onChange }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
        Dateien
      </p>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={onClick}
        className={`relative rounded-sm p-8 cursor-pointer
                    border-2 border-dashed transition-all duration-150
                    ${dragActive
                      ? 'border-scnat-red bg-scnat-red/5'
                      : 'border-bd-default bg-bg-surface hover:bg-bg-elevated'}`}
      >
        <input
          ref={inputRef}
          type="file" multiple accept="audio/*,video/*"
          className="hidden"
          onChange={onChange}
        />
        <div className="flex flex-col items-center text-center gap-2">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-scnat-red' : 'text-txt-tertiary'}`}
                  strokeWidth={1.2} />
          <p className="text-xs text-txt-primary font-medium">
            Dateien hierher ziehen oder klicken
          </p>
          <p className="text-[10px] font-mono text-txt-tertiary">
            mp3 · wav · m4a · flac · ogg · mp4 · mov · mkv
          </p>
        </div>
      </div>
    </div>
  );
}

function PendingFileRow({ file }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-sm bg-bg-surface border border-bd-faint">
      <FileText className="w-3.5 h-3.5 text-txt-secondary shrink-0" />
      <span className="flex-1 text-xs text-txt-primary truncate">{file.name}</span>
      <span className="text-[10px] font-mono text-txt-tertiary">{formatBytes(file.size)}</span>
    </div>
  );
}

function UploadedFiles({ files }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
        Hochgeladene Dateien
      </p>
      {files.length === 0 ? (
        <div className="text-center py-3 bg-bg-surface border border-bd-faint border-dashed rounded-sm">
          <p className="text-xs text-txt-tertiary">Noch keine Datei hochgeladen</p>
        </div>
      ) : (
        <div className="space-y-1">
          {files.map((f) => (
            <PendingFileRow key={f.id} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobQueue({ jobs, onRemove, onDownload }) {
  const completed = jobs.filter(j => j.status === 'completed').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary">
          Warteschlange
        </p>
        <span className="text-[10px] font-mono text-txt-tertiary">
          {completed} / {jobs.length}
        </span>
      </div>
      {jobs.length === 0 ? (
        <div className="text-center py-8 bg-bg-surface border border-bd-faint border-dashed rounded-sm">
          <p className="text-xs text-txt-tertiary">Keine Jobs in der Warteschlange</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onRemove={() => onRemove(job.id)}
              onDownload={(format) => onDownload(job.id, format)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, onRemove, onDownload }) {
  const statusBgClass = {
    queued:     'bg-status-amber',
    pending:    'bg-status-amber',
    processing: 'bg-status-blue',
    completed:  'bg-status-green',
    error:      'bg-scnat-red',
    cancelled:  'bg-txt-tertiary',
  }[job.status] || 'bg-txt-tertiary';
  const isActive = job.status === 'processing';
  const stageLabel = STAGE_LABELS[job.stage] || job.stage;
  const { userMessage, technical } = humanizeJobError(job.error);

  return (
    <div className={`rounded-sm border p-3 transition-colors
                     ${isActive
                       ? 'bg-bg-elevated border-l-2 border-l-scnat-red border-bd-faint'
                       : 'bg-bg-surface border-bd-faint'}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-1.5 h-1.5 rounded-full ${statusBgClass} shrink-0`} />
        <span className="flex-1 text-xs font-medium text-txt-primary truncate">{job.filename}</span>
        <span className="text-[10px] font-mono text-txt-tertiary shrink-0">{formatBytes(job.size)}</span>
        <button
          onClick={onRemove}
          className="text-txt-tertiary hover:text-scnat-red transition-colors p-0.5"
          title="Entfernen"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {(job.status === 'processing' || job.status === 'queued') && (
        <>
          <div className="h-1 bg-bd-faint rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-scnat-red transition-all duration-300"
                 style={{ width: `${(job.progress || 0) * 100}%` }} />
          </div>
          <p className="text-[10px] font-mono text-txt-secondary">
            {stageLabel} · {Math.round((job.progress || 0) * 100)}%
          </p>
        </>
      )}

      {job.status === 'completed' && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] font-mono text-status-green mr-1">Fertig — Download:</span>
          {['md','srt','txt','json'].map(fmt => (
            <button
              key={fmt}
              onClick={() => onDownload(fmt)}
              className="px-1.5 py-0.5 text-[10px] font-mono rounded-sm
                         bg-bg-elevated border border-bd-default text-txt-primary
                         hover:border-scnat-red transition-colors"
            >
              .{fmt}
            </button>
          ))}
        </div>
      )}

      {job.status === 'cancelled' && (
        <p className="text-[10px] font-mono text-txt-tertiary mt-1">Abgebrochen</p>
      )}

      {job.status === 'error' && (
        <div className="mt-1.5 rounded-sm border border-scnat-red/25 bg-scnat-red/10 p-2">
          <p className="text-xs text-scnat-red">{userMessage}</p>
          {technical && (
            <details className="mt-1">
              <summary className="text-[10px] font-mono text-scnat-red/80 cursor-pointer">
                Details anzeigen
              </summary>
              <p className="text-[10px] font-mono text-scnat-red/90 mt-1 break-words">
                {technical}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function SettingsPanel({ settings, onChange }) {
  return (
    <aside className="space-y-5">
      <SettingsSection label="Whisper Modell">
        <Select
          value={settings.model}
          options={WHISPER_MODELS}
          onChange={(model) => onChange({ ...settings, model })}
        />
      </SettingsSection>

      <SettingsSection label="Sprache der Aufnahme">
        <Select
          value={settings.language}
          options={LANGUAGES}
          onChange={(language) => onChange({ ...settings, language })}
        />
      </SettingsSection>

      <SettingsSection label="Ausgabe-Sprache">
        <Select
          value={settings.outputLanguageMode}
          options={OUTPUT_LANGUAGE_MODES}
          onChange={(outputLanguageMode) => onChange({ ...settings, outputLanguageMode })}
        />
      </SettingsSection>

      <SettingsSection label="Modus">
        <label className="flex items-start gap-2 cursor-pointer mb-1.5">
          <input
            type="radio"
            checked={!settings.enableDiarization}
            onChange={() => onChange({ ...settings, enableDiarization: false })}
            className="accent-scnat-red mt-0.5"
          />
          <div>
            <span className="text-xs text-txt-primary block">Schnell</span>
            <span className="text-[10px] text-txt-tertiary">Nur Transkription</span>
          </div>
        </label>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            checked={settings.enableDiarization}
            onChange={() => onChange({ ...settings, enableDiarization: true })}
            className="accent-scnat-red mt-0.5"
          />
          <div>
            <span className="text-xs text-txt-primary block">Vollständig</span>
            <span className="text-[10px] text-txt-tertiary">Mit Sprechererkennung</span>
          </div>
        </label>
      </SettingsSection>

      <SettingsSection label="Verarbeitung im Hintergrund">
        <label className="flex items-start gap-2 cursor-pointer mb-2">
          <input
            type="checkbox"
            checked={settings.enablePromptPolish}
            onChange={() => onChange({ ...settings, enablePromptPolish: !settings.enablePromptPolish })}
            className="accent-scnat-red mt-0.5"
          />
          <div>
            <span className="text-xs text-txt-primary block">Prompt-Polish aktivieren</span>
            <span className="text-[10px] text-txt-tertiary">Text wird nach Transkription automatisch geglättet</span>
          </div>
        </label>
        <p className="text-[10px] text-txt-tertiary mb-2">
          Die Sektion „Transkription“ im Export bleibt immer wörtlich (1:1) als Protokoll.
        </p>
        <div>
          <p
            className="text-[10px] font-mono text-txt-tertiary mb-1 cursor-help"
            title="Wie viele Dateien gleichzeitig gestartet werden. Mehr Parallelität ist schneller, belastet aber den Mac stärker."
          >
            Parallelität
          </p>
          <Select
            value={String(settings.parallelJobs)}
            options={[
              { id: '1', label: '1 Job gleichzeitig (stabil)' },
              { id: '2', label: '2 Jobs gleichzeitig (empfohlen)' },
              { id: '3', label: '3 Jobs gleichzeitig (hohe Last)' },
            ]}
            onChange={(parallelJobs) => onChange({ ...settings, parallelJobs: Number(parallelJobs) })}
          />
        </div>
        <p className="text-[10px] text-txt-tertiary mt-2">
          Polish-Prompts werden global aus dem Control Panel (Echo Add-Ons) geladen.
        </p>
      </SettingsSection>

      <div className="bg-bg-surface border border-bd-faint rounded-sm p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-scnat-red shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-scnat-red mb-1">
              Demnächst
            </p>
            <p className="text-[11px] text-txt-secondary leading-relaxed">
              LLM-Polish, mehrere Output-Formate (SRT, VTT) und Min/Max-Sprecher-Hints kommen in v1.1.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SettingsSection({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
        {label}
      </p>
      {children}
    </div>
  );
}

function Select({ value, options, onChange }) {
  const selected = options.find(o => o.id === value);
  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 rounded-sm
                   bg-bg-surface border border-bd-default text-txt-primary text-xs
                   focus:border-scnat-red outline-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.id} value={o.id}>
            {o.label}{o.size ? ` · ${o.size}` : ''}
          </option>
        ))}
      </select>
      {selected?.desc && (
        <p className="text-[10px] text-txt-tertiary px-0.5 leading-relaxed">{selected.desc}</p>
      )}
    </div>
  );
}

function Footer({ baseUrl }) {
  return (
    <div className="pt-3 border-t border-bd-faint text-center space-y-1">
      <p className="text-[10px] font-mono text-txt-tertiary">
        {baseUrl ? `Verbunden mit lokaler Engine: ${baseUrl}` : 'Lokale Engine nicht verbunden'}
      </p>
      <p className="text-[10px] font-mono text-txt-tertiary">
        SCNAT Echo · v1.1 beta · powered by mlx-whisper &amp; pyannote · by Arber Aziri
      </p>
    </div>
  );
}

function MobileOnlyEchoInfo() {
  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm p-6 text-txt-primary">
      <h3 className="text-sm font-heading font-semibold mb-2">SCNAT Echo ist aktuell nur für Desktop verfügbar</h3>
      <p className="text-xs text-txt-secondary leading-relaxed mb-3">
        Echo nutzt lokale Apple-Silicon-Beschleunigung (GPU/MLX) und die installierte Echo.app.
        Auf Mobile-Geräten steht diese Runtime nicht stabil zur Verfügung.
      </p>
      <p className="text-xs text-txt-secondary leading-relaxed mb-3">
        Für die Nutzung bitte das Portal auf einem MacBook/Desktop öffnen.
        Echo ist derzeit in der Beta-Testphase und nur auf Anfrage freigeschaltet.
      </p>
      <p className="text-xs text-txt-tertiary">
        Falls Echo.app fehlt oder nicht startet: bitte direkt IT Support kontaktieren.
      </p>
    </div>
  );
}

function NotAvailableView({ health, isStartingEcho, lastError, onRetry, onStartEcho, onSetManualBaseUrl }) {
  const status = health?.compat_status;
  const msg = health?.user_message;
  const [manualHost, setManualHost] = useState('http://127.0.0.1:3017');
  const [manualStatus, setManualStatus] = useState('');
  const [isStandalone, setIsStandalone] = useState(false);

  const isInstalling = status === 'installing' || health?.engine === 'installing';

  useEffect(() => {
    const checkStandalone = () => {
      const displayStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
      const iosStandalone = window.navigator?.standalone === true;
      setIsStandalone(Boolean(displayStandalone || iosStandalone));
    };
    checkStandalone();
    const mq = window.matchMedia?.('(display-mode: standalone)');
    mq?.addEventListener?.('change', checkStandalone);
    return () => mq?.removeEventListener?.('change', checkStandalone);
  }, []);

  if (isInstalling) {
    return (
      <div className="bg-bg-surface border border-bd-faint rounded-sm p-8 text-center">
        <Loader2 className="w-8 h-8 text-scnat-red animate-spin mx-auto mb-3" />
        <h3 className="text-sm font-heading font-semibold text-txt-primary mb-1">
          Engine wird im Hintergrund installiert…
        </h3>
        <p className="text-xs text-txt-secondary">
          Das passiert nur beim ersten Mal. In ein paar Minuten ist alles bereit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm p-8 text-txt-primary">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{msg?.emoji || '🔌'}</div>
          <h3 className="text-xl font-heading font-bold text-txt-primary mb-2">
            {msg?.title || 'SCNAT Echo Engine läuft nicht'}
          </h3>
          <p className="text-sm text-txt-secondary leading-relaxed max-w-xl mx-auto">
            {msg?.body || 'Die lokale Engine ist nicht erreichbar. Starte das Portal über ./start.sh, dann läuft sie automatisch mit.'}
          </p>
          {msg?.hint && (
            <p className="text-xs text-txt-tertiary italic mt-2">{msg.hint}</p>
          )}
        </div>

        <div className="bg-bg-elevated border border-bd-faint rounded-sm p-4 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
            Was ist SCNAT Echo?
          </p>
          <p className="text-sm text-txt-secondary leading-relaxed">
            SCNAT Echo wurde von Arber aus der IT für die SCNAT gebaut, damit Transkriptionen lokal auf dem Mac
            laufen und keine externen Cloud-Dienste benötigt werden. So bleiben Sicherheits- und
            Souveränitätsanforderungen der SCNAT gewahrt.
          </p>
          <p className="text-xs text-status-amber mt-2">
            Aktuell Beta-Testphase · Nutzung nur auf Anfrage.
          </p>
        </div>

        <div className="bg-status-blue/5 border border-status-blue/20 rounded-sm p-4 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
            Voraussetzung
          </p>
          <p className="text-sm text-txt-secondary leading-relaxed">
            Diese Funktion läuft nur mit installierter Echo.app auf dem Notebook. Falls Echo nicht installiert ist
            oder nicht funktioniert, kann die Freischaltung hier oder direkt beim IT Support angefragt werden.
          </p>
        </div>

        <div className="bg-bg-elevated border border-bd-faint rounded-sm p-4 mb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
            Empfohlener Modus
          </p>
          <p className="text-sm text-txt-secondary leading-relaxed">
            Die sauberste Nutzung von SCNAT Echo ist über das installierte Portal als App auf deinem Gerät.
            Dann kann Echo per Knopfdruck im Hintergrund geöffnet werden, ohne störenden Browser-Flow.
          </p>
          {!isStandalone && (
            <p className="text-xs text-status-amber mt-2">
              Du nutzt das Portal aktuell im Browser-Tab. Bitte öffne/installiere die Portal-App für den besten Echo-Start.
            </p>
          )}
          {isStandalone && (
            <p className="text-xs text-status-green mt-2">
              Portal-App erkannt - Echo-Start per Button ist aktiviert.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={onStartEcho}
            disabled={isStartingEcho}
            className="flex items-center gap-2 px-4 py-2 rounded-sm
                       bg-scnat-red text-white text-xs font-semibold
                       hover:bg-scnat-darkred disabled:bg-bd-default disabled:text-txt-tertiary
                       transition-colors"
          >
            {isStartingEcho ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            {isStartingEcho ? 'Echo wird im Hintergrund geöffnet…' : 'Echo im Hintergrund öffnen'}
          </button>
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-sm text-xs font-medium
                       bg-bg-elevated border border-bd-default text-txt-primary
                       hover:bg-bd-faint transition-colors"
          >
            Erneut prüfen
          </button>
        </div>

        <details className="bg-bg-elevated border border-bd-faint rounded-sm p-3 mb-4">
          <summary className="cursor-pointer text-[11px] font-mono uppercase tracking-wider text-txt-tertiary">
            Erweiterte Verbindung & Diagnose
          </summary>
          <div className="mt-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
              Lokaler Endpoint (Fallback)
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={manualHost}
                onChange={(e) => setManualHost(e.target.value)}
                placeholder="http://127.0.0.1:3017"
                className="flex-1 px-3 py-2 text-xs font-mono rounded-sm
                           bg-bg-surface border border-bd-default text-txt-primary
                           focus:border-scnat-red outline-none"
              />
              <button
                onClick={async () => {
                  setManualStatus('');
                  try {
                    await onSetManualBaseUrl(manualHost);
                    setManualStatus('Verbunden');
                  } catch (err) {
                    setManualStatus(err?.message || 'Verbindung fehlgeschlagen');
                  }
                }}
                className="px-4 py-2 rounded-sm text-xs font-medium
                           bg-bg-surface border border-bd-default text-txt-primary
                           hover:bg-bd-faint transition-colors"
              >
                Host verbinden
              </button>
            </div>
            {(manualStatus || lastError) && (
              <p className="text-[11px] mt-2 text-txt-secondary">
                {manualStatus || lastError}
              </p>
            )}
          </div>

          <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 mt-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-2">
              System-Diagnose
            </p>
            <pre className="text-[10px] font-mono text-txt-secondary overflow-x-auto">
{JSON.stringify({
  status,
  hardware: health?.hardware,
  echo_app_detected: health?.echo_app_detected,
}, null, 2)}
            </pre>
          </div>
        </details>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-1">Schritt 1</p>
            <p className="text-xs text-txt-secondary">Portal als App öffnen (empfohlen) und auf Start klicken.</p>
          </div>
          <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-1">Schritt 2</p>
            <p className="text-xs text-txt-secondary">Echo startet im Hintergrund lokal auf deinem Mac.</p>
          </div>
          <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3">
            <p className="text-[10px] font-mono uppercase tracking-wider text-txt-tertiary mb-1">Schritt 3</p>
            <p className="text-xs text-txt-secondary">Zurück im Portal transkribieren und `.md` laden.</p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-mono text-txt-tertiary">
          SCNAT Echo · by Arber Aziri
        </p>
      </div>
    </div>
  );
}
