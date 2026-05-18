import { useState, useEffect, useCallback, useRef } from 'react';

const HEALTH_POLL_MS = 30_000;
const JOB_POLL_MS = 1_500;
const HEALTH_TIMEOUT_MS = 2_500;
const REQUEST_TIMEOUT_MS = 20_000;
const TERMINAL_STATES = new Set(['completed', 'error', 'cancelled']);
const AUTOSTART_POLL_ATTEMPTS = 14;
const AUTOSTART_POLL_MS = 1_200;
const STORAGE_URL_KEY = 'scnat_echo_url';

function withTimeout(ms) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

function buildBaseCandidates() {
  const stored = typeof window !== 'undefined'
    ? window.localStorage.getItem(STORAGE_URL_KEY)
    : null;
  return [stored, 'http://127.0.0.1:3017', 'http://localhost:3017']
    .filter(Boolean)
    .map((url) => url.replace(/\/$/, ''));
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function triggerDeepLink(url) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => iframe.remove(), 1500);
}

export function useEchoEngine() {
  const [health, setHealth] = useState({ status: 'unknown' });
  const [jobs, setJobs] = useState([]);
  const [baseUrl, setBaseUrl] = useState(null);
  const [isStartingEcho, setIsStartingEcho] = useState(false);
  const [lastError, setLastError] = useState('');
  const pollersRef = useRef({});

  const persistBaseUrl = useCallback((url) => {
    try {
      if (typeof window !== 'undefined' && url) {
        window.localStorage.setItem(STORAGE_URL_KEY, url);
      }
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const probeHealth = useCallback(async () => {
    const candidates = buildBaseCandidates();
    for (const candidate of candidates) {
      const timeout = withTimeout(HEALTH_TIMEOUT_MS);
      try {
        const r = await fetch(`${candidate}/health`, { signal: timeout.signal });
        if (!r.ok) continue;
        const data = await r.json();
        return { base: candidate, data };
      } catch {
        // Probe next candidate.
      } finally {
        timeout.clear();
      }
    }
    return null;
  }, []);

  const refreshHealth = useCallback(async () => {
    const result = await probeHealth();
    if (result) {
      setBaseUrl(result.base);
      persistBaseUrl(result.base);
      setLastError('');
      setHealth(result.data);
      return true;
    }
    setBaseUrl(null);
    setLastError('Lokaler Echo-Host nicht gefunden oder CORS blockiert.');
    setHealth({
      status: 'ok',
      engine: 'unavailable',
      compat_status: 'sidecar_not_running',
      user_message: {
        title: 'SCNAT Echo Engine läuft nicht',
        body: 'Bitte starte Echo lokal auf deinem Mac. Falls die App bereits läuft, überprüfe den lokalen Host oder die CORS-Freigabe für platform.poltis.ch.',
        emoji: '🔌',
      },
    });
    return false;
  }, [persistBaseUrl, probeHealth]);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const result = await probeHealth();
      if (cancelled) return;
      if (result) {
        setBaseUrl(result.base);
        persistBaseUrl(result.base);
        setLastError('');
        setHealth(result.data);
      } else {
        setBaseUrl(null);
        setLastError('Lokaler Echo-Host nicht gefunden oder CORS blockiert.');
        setHealth({
          status: 'ok',
          engine: 'unavailable',
          compat_status: 'sidecar_not_running',
          user_message: {
            title: 'SCNAT Echo Engine läuft nicht',
            body: 'Bitte starte Echo lokal auf deinem Mac. Falls die App bereits läuft, überprüfe den lokalen Host oder die CORS-Freigabe für platform.poltis.ch.',
            emoji: '🔌',
          },
        });
      }
    }
    check();
    const id = setInterval(check, HEALTH_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [probeHealth]);

  const requestJson = useCallback(async (path, init = {}) => {
    if (!baseUrl) throw new Error('SCNAT Echo lokal nicht erreichbar.');
    const timeout = withTimeout(REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${baseUrl}${path}`, { ...init, signal: timeout.signal });
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(data?.detail || data?.error || 'Echo-Anfrage fehlgeschlagen.');
      }
      setLastError('');
      return data;
    } catch (err) {
      if (err?.name === 'AbortError') {
        setLastError('Echo-Anfrage Timeout');
        throw new Error('Echo-Anfrage hat das Zeitlimit überschritten.');
      }
      if (err instanceof TypeError) {
        setLastError('Echo lokal nicht erreichbar / CORS blockiert');
        throw new Error('Lokaler Echo-Host ist nicht erreichbar oder wird durch CORS blockiert.');
      }
      setLastError(err?.message || 'Unbekannter Echo-Fehler');
      throw err;
    } finally {
      timeout.clear();
    }
  }, [baseUrl]);

  const attemptStartEcho = useCallback(async () => {
    setIsStartingEcho(true);
    setLastError('');
    try {
      const links = ['echo://start-agent', 'echo://start', 'echo://open', 'echo://'];
      for (const link of links) {
        triggerDeepLink(link);
        await sleep(350);
      }

      for (let i = 0; i < AUTOSTART_POLL_ATTEMPTS; i += 1) {
        const ok = await refreshHealth();
        if (ok) return true;
        await sleep(AUTOSTART_POLL_MS);
      }
      setLastError('Echo konnte nicht automatisch gestartet werden.');
      return false;
    } finally {
      setIsStartingEcho(false);
    }
  }, [refreshHealth]);

  const setManualBaseUrl = useCallback(async (rawUrl) => {
    const trimmed = (rawUrl || '').trim().replace(/\/$/, '');
    if (!trimmed) throw new Error('Bitte eine gültige URL eingeben.');
    const timeout = withTimeout(HEALTH_TIMEOUT_MS);
    try {
      const r = await fetch(`${trimmed}/health`, { signal: timeout.signal });
      if (!r.ok) throw new Error('Health-Endpunkt antwortet nicht.');
      const data = await r.json();
      setBaseUrl(trimmed);
      persistBaseUrl(trimmed);
      setLastError('');
      setHealth(data);
      return true;
    } catch (err) {
      setLastError('Manueller Host konnte nicht verifiziert werden.');
      if (err?.name === 'AbortError') {
        throw new Error('Health-Check Timeout beim manuellen Host.');
      }
      throw new Error('Manueller Host nicht erreichbar oder ohne CORS-Freigabe.');
    } finally {
      timeout.clear();
    }
  }, [persistBaseUrl]);

  const uploadFile = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const data = await requestJson('/upload', { method: 'POST', body: fd });
    return { id: data.file_id, name: file.name, size: file.size, path: data.path };
  }, [requestJson]);

  const startPolling = useCallback((jobId) => {
    if (pollersRef.current[jobId]) return;
    pollersRef.current[jobId] = setInterval(async () => {
      try {
        const update = await requestJson(`/jobs/${jobId}`);
        setJobs((prev) => prev.map((job) => (
          job.id === jobId ? { ...job, ...update } : job
        )));
        if (TERMINAL_STATES.has(update.status)) {
          clearInterval(pollersRef.current[jobId]);
          delete pollersRef.current[jobId];
        }
      } catch {
        // Keep polling; health checker will show if engine is down.
      }
    }, JOB_POLL_MS);
  }, [requestJson]);

  const startJob = useCallback(async ({ id, name, size, path, settings }) => {
    const job = await requestJson('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: id, filename: name, ...settings }),
    });
    setJobs(prev => [...prev, { ...job, filename: name, size }]);
    startPolling(job.id);
    return job;
  }, [requestJson, startPolling]);

  const pauseJob = useCallback(async () => {
    await requestJson('/pause', { method: 'POST' });
  }, [requestJson]);

  const stopJob = useCallback(async () => {
    await requestJson('/stop', { method: 'POST' });
    setJobs((prev) => prev.map((job) => (
      job.status === 'processing' ? { ...job, status: 'cancelled', stage: 'cancelled' } : job
    )));
  }, [requestJson]);

  const removeJob = useCallback(async (id) => {
    await requestJson(`/jobs/${id}`, { method: 'DELETE' });
    if (pollersRef.current[id]) {
      clearInterval(pollersRef.current[id]);
      delete pollersRef.current[id];
    }
    setJobs(prev => prev.filter(j => j.id !== id));
  }, [requestJson]);

  const clearQueue = useCallback(async () => {
    await requestJson('/jobs', { method: 'DELETE' });
    Object.values(pollersRef.current).forEach(clearInterval);
    pollersRef.current = {};
    setJobs([]);
  }, [requestJson]);

  const downloadResult = useCallback((jobId, format) => {
    if (!baseUrl) return;
    window.location.href = `${baseUrl}/jobs/${jobId}/result?format=${format}`;
  }, [baseUrl]);

  useEffect(() => () => {
    Object.values(pollersRef.current).forEach(clearInterval);
  }, []);

  const currentJob = jobs.find(j => j.status === 'processing');
  const isRunning = !!currentJob;
  const isAvailable = health.status === 'ok' && health.engine === 'ready';

  return {
    health, jobs, currentJob, isRunning, isAvailable, baseUrl, isStartingEcho, lastError,
    uploadFile, startJob, pauseJob, stopJob, removeJob, clearQueue, downloadResult,
    refreshHealth, attemptStartEcho, setManualBaseUrl,
  };
}
