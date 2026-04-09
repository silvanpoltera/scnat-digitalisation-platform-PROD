import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Newspaper, Clock, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react';

const PRESET_COLORS = [
  { value: '#EA515A', label: 'Rot' },
  { value: '#006482', label: 'Blau' },
  { value: '#f18700', label: 'Orange' },
  { value: '#00836f', label: 'Grün' },
  { value: '#5A616B', label: 'Grau' },
  { value: '#8B5CF6', label: 'Violett' },
];

const emptyForm = {
  datum: new Date().toISOString().split('T')[0],
  category: '',
  categoryColor: '#5A616B',
  title: '',
  teaser: '',
  linkTo: '',
  isNew: false,
  aktiv: true,
  gueltigBis: '',
};

export default function CpNews() {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const load = () => {
    fetch('/api/news/all', { credentials: 'include' })
      .then(r => r.json()).then(setItems).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, linkTo: form.linkTo || null, gueltigBis: form.gueltigBis || null }),
    });
    setForm({ ...emptyForm });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('News wirklich löschen?')) return;
    await fetch(`/api/news/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditForm({
      datum: item.datum || '',
      category: item.category || '',
      categoryColor: item.categoryColor || '#5A616B',
      title: item.title || '',
      teaser: item.teaser || '',
      linkTo: item.linkTo || '',
      isNew: item.isNew || false,
      aktiv: item.aktiv,
      gueltigBis: item.gueltigBis || '',
    });
  };

  const saveEdit = async () => {
    await fetch(`/api/news/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...editForm, linkTo: editForm.linkTo || null, gueltigBis: editForm.gueltigBis || null }),
    });
    setEditingId(null);
    load();
  };

  const now = new Date().toISOString().split('T')[0];
  const active = items.filter(i => i.aktiv && (!i.gueltigBis || i.gueltigBis >= now));
  const inactive = items.filter(i => !i.aktiv || (i.gueltigBis && i.gueltigBis < now));

  const inputCls = 'bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none';

  const NewsForm = ({ f, setF, onSubmit, onCancel, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Titel" required className={`w-full ${inputCls}`} />
        <input type="date" value={f.datum} onChange={e => setF({ ...f, datum: e.target.value })} required className={inputCls} />
      </div>
      <textarea value={f.teaser} onChange={e => setF({ ...f, teaser: e.target.value })} placeholder="Teaser / Beschreibung" rows={2} required className={`w-full ${inputCls}`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input value={f.category} onChange={e => setF({ ...f, category: e.target.value })} placeholder="Kategorie (z.B. KI, Strategie)" required className={inputCls} />
        <div>
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setF({ ...f, categoryColor: c.value })}
                className={`w-6 h-6 rounded-sm border-2 transition-all ${f.categoryColor === c.value ? 'border-txt-primary scale-110' : 'border-transparent'}`}
                style={{ background: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>
        <input value={f.linkTo} onChange={e => setF({ ...f, linkTo: e.target.value })} placeholder="Link (z.B. /ki-hub)" className={inputCls} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input type="date" value={f.gueltigBis} onChange={e => setF({ ...f, gueltigBis: e.target.value })} className={`w-full ${inputCls}`} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-txt-tertiary pointer-events-none">Gültig bis</span>
        </div>
        <label className="flex items-center gap-2 text-sm text-txt-secondary cursor-pointer">
          <input type="checkbox" checked={f.isNew} onChange={e => setF({ ...f, isNew: e.target.checked })} className="accent-scnat-red" />
          Als "Neu" markieren
        </label>
        <label className="flex items-center gap-2 text-sm text-txt-secondary cursor-pointer">
          <input type="checkbox" checked={f.aktiv} onChange={e => setF({ ...f, aktiv: e.target.checked })} className="accent-scnat-red" />
          Aktiv
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="bg-scnat-red text-white text-sm px-4 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">{submitLabel}</button>
        <button type="button" onClick={onCancel} className="text-sm text-txt-secondary hover:text-txt-primary px-3 py-1.5">Abbrechen</button>
      </div>
    </form>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-scnat-teal" /> News verwalten
          </h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            {active.length} aktiv · {inactive.length} inaktiv/abgelaufen · {items.length} total
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors"
        >
          <Plus className="w-4 h-4" /> Neue News
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-green">{active.length}</p>
          <p className="text-[10px] text-txt-tertiary">Aktiv</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-red">{items.filter(i => i.isNew).length}</p>
          <p className="text-[10px] text-txt-tertiary">Als "Neu"</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-yellow">{items.filter(i => i.gueltigBis).length}</p>
          <p className="text-[10px] text-txt-tertiary">Mit Ablaufdatum</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-txt-secondary">{[...new Set(items.map(i => i.category))].length}</p>
          <p className="text-[10px] text-txt-tertiary">Kategorien</p>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5 mb-6">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3">Neue News erstellen</h3>
          <NewsForm f={form} setF={setForm} onSubmit={handleAdd} onCancel={() => setShowAdd(false)} submitLabel="Erstellen" />
        </div>
      )}

      {/* Active Items */}
      <div className="space-y-2 mb-8">
        <h3 className="text-xs font-mono text-txt-tertiary uppercase tracking-wider mb-2">Aktive News ({active.length})</h3>
        {active.map(item => (
          <div key={item.id} className="bg-bg-surface border border-bd-faint rounded-sm p-4">
            {editingId === item.id ? (
              <NewsForm
                f={editForm}
                setF={setEditForm}
                onSubmit={(e) => { e.preventDefault(); saveEdit(); }}
                onCancel={() => setEditingId(null)}
                submitLabel="Speichern"
              />
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: item.categoryColor }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: item.categoryColor }}
                    >
                      {item.category}
                    </span>
                    <span className="text-[10px] font-mono text-txt-tertiary">{item.datum}</span>
                    {item.isNew && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-scnat-red bg-scnat-red/10 px-1.5 py-0.5 rounded-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Neu
                      </span>
                    )}
                    {item.gueltigBis && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-status-yellow">
                        <Clock className="w-3 h-3" /> bis {item.gueltigBis}
                      </span>
                    )}
                    {item.linkTo && (
                      <span className="flex items-center gap-0.5 text-[10px] text-txt-tertiary">
                        <ExternalLink className="w-3 h-3" /> {item.linkTo}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-heading font-semibold text-txt-primary mb-0.5">{item.title}</h4>
                  <p className="text-xs text-txt-secondary leading-relaxed">{item.teaser}</p>
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
          <p className="text-sm text-txt-tertiary py-4 text-center">Keine aktiven News</p>
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
                <div className="w-1 self-stretch rounded-full shrink-0 bg-txt-tertiary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-bg-elevated text-txt-tertiary">{item.category}</span>
                    <span className="text-[10px] font-mono text-txt-tertiary">{item.datum}</span>
                    {!item.aktiv && <span className="text-[10px] font-mono text-txt-tertiary">Deaktiviert</span>}
                    {item.gueltigBis && item.gueltigBis < now && <span className="text-[10px] font-mono text-scnat-red">Abgelaufen</span>}
                  </div>
                  <h4 className="text-sm font-heading font-semibold text-txt-secondary">{item.title}</h4>
                  <p className="text-xs text-txt-tertiary leading-relaxed">{item.teaser}</p>
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
