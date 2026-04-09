import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Radio, AlertTriangle, Clock } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'Normal', cls: 'bg-bg-elevated text-txt-secondary' },
  { value: 'high', label: 'Hoch', cls: 'bg-scnat-red/15 text-scnat-red' },
];

const emptyForm = { tag: '', text: '', priority: 'normal', aktiv: true, gueltigBis: '' };

export default function CpLiveInfos() {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = () => {
    fetch('/api/live-infos/all', { credentials: 'include' })
      .then(r => r.json()).then(setItems).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/live-infos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, gueltigBis: form.gueltigBis || null }),
    });
    setForm({ ...emptyForm });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Live-Info wirklich löschen?')) return;
    await fetch(`/api/live-infos/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      tag: item.tag,
      text: item.text,
      priority: item.priority,
      aktiv: item.aktiv,
      gueltigBis: item.gueltigBis || '',
    });
  };

  const saveEdit = async () => {
    await fetch(`/api/live-infos/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...editForm, gueltigBis: editForm.gueltigBis || null }),
    });
    setEditingId(null);
    load();
  };

  const now = new Date().toISOString().split('T')[0];
  const active = items.filter(i => i.aktiv && (!i.gueltigBis || i.gueltigBis >= now));
  const inactive = items.filter(i => !i.aktiv || (i.gueltigBis && i.gueltigBis < now));

  const inputCls = 'bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary flex items-center gap-2">
            <Radio className="w-5 h-5 text-scnat-red" /> Live Infos verwalten
          </h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            {active.length} aktiv · {inactive.length} inaktiv/abgelaufen · {items.length} total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors"
        >
          <Plus className="w-4 h-4" /> Neue Info
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-green">{active.length}</p>
          <p className="text-[10px] text-txt-tertiary">Aktiv</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-red">{items.filter(i => i.priority === 'high').length}</p>
          <p className="text-[10px] text-txt-tertiary">Hohe Priorität</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-yellow">{items.filter(i => i.gueltigBis).length}</p>
          <p className="text-[10px] text-txt-tertiary">Mit Ablaufdatum</p>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-5 mb-6 space-y-3">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-2">Neue Live-Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              value={form.tag}
              onChange={e => setForm({ ...form, tag: e.target.value })}
              placeholder="Tag (z.B. KI, Event)"
              required
              className={inputCls}
            />
            <div className="sm:col-span-3">
              <input
                value={form.text}
                onChange={e => setForm({ ...form, text: e.target.value })}
                placeholder="Nachricht"
                required
                className={`w-full ${inputCls}`}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className={inputCls}
            >
              <option value="normal">Normal</option>
              <option value="high">Hohe Priorität</option>
            </select>
            <div className="relative">
              <input
                type="date"
                value={form.gueltigBis}
                onChange={e => setForm({ ...form, gueltigBis: e.target.value })}
                className={`w-full ${inputCls}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-txt-tertiary pointer-events-none">Gültig bis</span>
            </div>
            <label className="flex items-center gap-2 text-sm text-txt-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={form.aktiv}
                onChange={e => setForm({ ...form, aktiv: e.target.checked })}
                className="accent-scnat-red"
              />
              Sofort aktiv
            </label>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-scnat-red text-white text-sm px-4 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
              Erstellen
            </button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-txt-secondary hover:text-txt-primary px-3 py-1.5">
              Abbrechen
            </button>
          </div>
        </form>
      )}

      {/* Active Items */}
      <div className="space-y-2 mb-8">
        <h3 className="text-xs font-mono text-txt-tertiary uppercase tracking-wider mb-2">Aktive Infos ({active.length})</h3>
        {active.map(item => (
          <div key={item.id} className="bg-bg-surface border border-bd-faint rounded-sm p-4">
            {editingId === item.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input value={editForm.tag} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} className={inputCls} />
                  <div className="sm:col-span-3">
                    <input value={editForm.text} onChange={e => setEditForm({ ...editForm, text: e.target.value })} className={`w-full ${inputCls}`} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} className={inputCls}>
                    <option value="normal">Normal</option>
                    <option value="high">Hohe Priorität</option>
                  </select>
                  <input type="date" value={editForm.gueltigBis} onChange={e => setEditForm({ ...editForm, gueltigBis: e.target.value })} className={inputCls} placeholder="Gültig bis" />
                  <label className="flex items-center gap-2 text-sm text-txt-secondary cursor-pointer">
                    <input type="checkbox" checked={editForm.aktiv} onChange={e => setEditForm({ ...editForm, aktiv: e.target.checked })} className="accent-scnat-red" />
                    Aktiv
                  </label>
                  <div className="flex gap-1">
                    <button onClick={saveEdit} className="flex items-center gap-1 bg-status-green text-white text-xs px-3 py-1.5 rounded-sm"><Check className="w-3.5 h-3.5" /> Speichern</button>
                    <button onClick={() => setEditingId(null)} className="text-txt-tertiary hover:text-txt-primary p-1.5"><X className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.priority === 'high' ? 'bg-scnat-red/20 text-scnat-red' : 'bg-bg-elevated text-txt-secondary'
                    }`}>
                      {item.tag}
                    </span>
                    {item.gueltigBis && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-status-yellow">
                        <Clock className="w-3 h-3" /> bis {item.gueltigBis}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-txt-primary">{item.text}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(item)} className="p-1.5 text-txt-tertiary hover:text-txt-primary rounded-sm hover:bg-bg-elevated"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-txt-tertiary hover:text-scnat-red rounded-sm hover:bg-bg-elevated"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {active.length === 0 && (
          <p className="text-sm text-txt-tertiary py-4 text-center">Keine aktiven Live-Infos</p>
        )}
      </div>

      {/* Inactive / Expired */}
      {inactive.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-mono text-txt-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Inaktiv / Abgelaufen ({inactive.length})
          </h3>
          {inactive.map(item => (
            <div key={item.id} className="bg-bg-surface border border-bd-faint rounded-sm p-4 opacity-60">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-bg-elevated text-txt-tertiary">
                      {item.tag}
                    </span>
                    {!item.aktiv && <span className="text-[10px] font-mono text-txt-tertiary">Deaktiviert</span>}
                    {item.gueltigBis && item.gueltigBis < now && (
                      <span className="text-[10px] font-mono text-scnat-red">Abgelaufen {item.gueltigBis}</span>
                    )}
                  </div>
                  <p className="text-sm text-txt-secondary">{item.text}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(item)} className="p-1.5 text-txt-tertiary hover:text-txt-primary rounded-sm hover:bg-bg-elevated"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-txt-tertiary hover:text-scnat-red rounded-sm hover:bg-bg-elevated"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
