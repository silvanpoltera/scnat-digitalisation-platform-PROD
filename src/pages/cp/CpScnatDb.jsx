import { useState, useEffect } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function CpScnatDb() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newBacklog, setNewBacklog] = useState({ titel: '', beschreibung: '', bereich: '', seit: '2026', prioritaet: 'mittel' });

  const load = () => {
    fetch('/api/scnat-infra', { credentials: 'include' }).then(r => r.json()).then(setData).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const saveStatus = async () => {
    setSaving(true);
    await fetch('/api/scnat-infra/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data.status),
    });
    setSaving(false);
  };

  const updateEntscheid = async (id, updates) => {
    await fetch(`/api/scnat-infra/entscheide/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    load();
  };

  const addBacklog = async (e) => {
    e.preventDefault();
    await fetch('/api/scnat-infra/backlog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newBacklog),
    });
    setNewBacklog({ titel: '', beschreibung: '', bereich: '', seit: '2026', prioritaet: 'mittel' });
    load();
  };

  const deleteBacklog = async (id) => {
    await fetch(`/api/scnat-infra/backlog/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  if (!data) return <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-heading font-semibold text-txt-primary mb-4">SCNAT DB verwalten</h2>

        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4">
          <h3 className="text-sm font-medium text-txt-primary mb-3">Konsolidierung</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Prozent</label>
              <input
                type="number" min="0" max="100"
                value={data.status?.konsolidierung_prozent || 0}
                onChange={e => setData({ ...data, status: { ...data.status, konsolidierung_prozent: parseInt(e.target.value) } })}
                className="w-20 bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-txt-tertiary font-mono mb-1">Geplanter Abschluss</label>
              <input
                value={data.status?.geplanter_abschluss || ''}
                onChange={e => setData({ ...data, status: { ...data.status, geplanter_abschluss: e.target.value } })}
                className="w-28 bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>
            <button onClick={saveStatus} disabled={saving} className="flex items-center gap-1 bg-scnat-red text-white text-xs px-3 py-1.5 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors mt-4">
              <Save className="w-3 h-3" /> {saving ? 'Speichern…' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3">Offene Entscheide</h3>
        <div className="space-y-2">
          {data.entscheide?.map(e => (
            <div key={e.id} className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-sm text-txt-primary font-medium">{e.titel}</span>
                <p className="text-xs text-txt-secondary mt-0.5 truncate max-w-md">{e.beschreibung}</p>
              </div>
              <select
                value={e.status}
                onChange={ev => updateEntscheid(e.id, { status: ev.target.value })}
                className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
              >
                <option value="offen">offen</option>
                <option value="in Klärung">in Klärung</option>
                <option value="entschieden">entschieden</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3">Backlog</h3>
        <form onSubmit={addBacklog} className="bg-bg-surface border border-bd-faint rounded-sm p-3 mb-3 grid grid-cols-5 gap-2">
          <input value={newBacklog.titel} onChange={e => setNewBacklog({ ...newBacklog, titel: e.target.value })} required placeholder="Titel" className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
          <input value={newBacklog.beschreibung} onChange={e => setNewBacklog({ ...newBacklog, beschreibung: e.target.value })} placeholder="Beschreibung" className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none col-span-2" />
          <input value={newBacklog.bereich} onChange={e => setNewBacklog({ ...newBacklog, bereich: e.target.value })} placeholder="Bereich" className="bg-bg-elevated border border-bd-faint text-txt-primary text-xs px-2 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none" />
          <button type="submit" className="flex items-center justify-center gap-1 bg-scnat-red text-white text-xs rounded-sm hover:bg-[#F06570] transition-colors"><Plus className="w-3 h-3" /></button>
        </form>
        <div className="space-y-1.5">
          {data.backlog?.map(b => (
            <div key={b.id} className="bg-bg-surface border border-bd-faint rounded-sm px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-primary">{b.titel}</span>
                <span className="text-[9px] font-mono bg-bg-elevated text-txt-tertiary px-1 py-0.5 rounded-sm">{b.bereich}</span>
                <span className="text-[9px] font-mono text-txt-tertiary">Seit {b.seit}</span>
              </div>
              <button onClick={() => deleteBacklog(b.id)} className="text-txt-tertiary hover:text-scnat-red p-1"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
