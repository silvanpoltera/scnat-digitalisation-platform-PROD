import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

const STATUS_OPTIONS = ['offen', 'in Prüfung', 'bewilligt', 'abgelehnt'];
const STATUS_COLORS = {
  'offen': 'bg-status-yellow/15 text-status-yellow',
  'in Prüfung': 'bg-status-blue/15 text-status-blue',
  'bewilligt': 'bg-status-green/15 text-status-green',
  'abgelehnt': 'bg-scnat-red/15 text-scnat-red',
};

const DRING_COLORS = {
  'dringend': 'bg-scnat-red/15 text-scnat-red',
  'hoch': 'bg-status-yellow/15 text-status-yellow',
  'normal': 'bg-bg-elevated text-txt-secondary',
  'niedrig': 'bg-bg-elevated text-txt-tertiary',
};

export default function CpAntraege() {
  const [requests, setRequests] = useState([]);

  const load = () => {
    fetch('/api/requests', { credentials: 'include' }).then(r => r.json()).then(setRequests).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await fetch(`/api/requests/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    load();
  };

  const stats = {
    total: requests.length,
    offen: requests.filter(r => r.status === 'offen').length,
    pruefung: requests.filter(r => r.status === 'in Prüfung').length,
    bewilligt: requests.filter(r => r.status === 'bewilligt').length,
    abgelehnt: requests.filter(r => r.status === 'abgelehnt').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-semibold text-txt-primary">Softwareanträge</h2>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="text-txt-tertiary">{stats.total} total</span>
          <span className="text-status-yellow">{stats.offen} offen</span>
          <span className="text-status-blue">{stats.pruefung} in Prüfung</span>
          <span className="text-status-green">{stats.bewilligt} bewilligt</span>
        </div>
      </div>

      {requests.length === 0 ? (
        <p className="text-sm text-txt-secondary">Noch keine Anträge eingegangen.</p>
      ) : (
        <div className="space-y-3">
          {requests
            .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
            .map(r => (
            <div key={r.id} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="text-sm font-heading font-semibold text-txt-primary">{r.name}</h4>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${DRING_COLORS[r.dringlichkeit] || DRING_COLORS.normal}`}>
                        {r.dringlichkeit}
                      </span>
                      {r.abteilung && (
                        <span className="text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1.5 py-0.5 rounded-sm">
                          {r.abteilung}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-txt-secondary leading-relaxed">{r.begruendung}</p>
                  </div>
                  <select
                    value={r.status}
                    onChange={e => handleStatus(r.id, e.target.value)}
                    className={`text-[11px] font-mono px-2 py-1 rounded-sm border-0 cursor-pointer focus:outline-none shrink-0 ${STATUS_COLORS[r.status] || 'bg-bg-elevated text-txt-secondary'}`}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-txt-tertiary">
                  {(r.userName || r.kontakt || r.userEmail || r.kontaktEmail) && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      <span className="text-txt-secondary font-medium">{r.userName || r.kontakt || '–'}</span>
                      {(r.userEmail || r.kontaktEmail) && <span className="font-mono">{r.userEmail || r.kontaktEmail}</span>}
                    </span>
                  )}
                  {r.timestamp && (
                    <span className="font-mono">{new Date(r.timestamp).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
