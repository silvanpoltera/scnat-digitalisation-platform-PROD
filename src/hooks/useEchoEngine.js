import { useState, useEffect, useCallback, useRef } from 'react';

const HEALTH_POLL_MS = 30_000;
const JOB_POLL_MS = 1_500;
const HEALTH_TIMEOUT_MS = 2_500;
const REQUEST_TIMEOUT_MS = 20_000;
const TERMINAL_STATES = new Set(['completed', 'error', 'cancelled']);

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
    ? window.localStorage.getItem('scnat_echo_url')
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

export function useEchoEngine() {
  const [health, setHealth] = useState({ status: 'unknown' });
  const [jobs, setJobs] = useState([]);
  const [baseUrl, setBaseUrl] = useState(null);
  const pollersRef = useRef({});

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

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const result = await probeHealth();
      if (cancelled) return;
      if (result) {
        setBaseUrl(result.base);
        setHealth(result.data);
      } else {
        setBaseUrl(null);
        setHealth({
          status: 'ok',
          engine: 'unavailable',
          compat_status: 'sidecar_not_running',
          user_message: {
            title: 'SCNAT Echo Engine läuft nicht',
            body: 'Bitte starte Echo lokal auf deinem Mac, damit die Transkription im Portal verfügbar ist.',
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
      return data;
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw new Error('Echo-Anfrage hat das Zeitlimit überschritten.');
      }
      throw err;
    } finally {
      timeout.clear();
    }
  }, [baseUrl]);

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
    health, jobs, currentJob, isRunning, isAvailable, baseUrl,
    uploadFile, startJob, pauseJob, stopJob, removeJob, clearQueue, downloadResult,
  };
}
