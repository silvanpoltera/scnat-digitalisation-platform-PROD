import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Users, Calendar, Clock, MapPin, ChevronDown, Edit2, Check, X } from 'lucide-react';

export default function CpEvents() {
  const [events, setEvents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ titel: '', datum: '', zeit: '', ort: '', maxTeilnehmer: 15, beschreibung: '' });

  const load = () => {
    fetch('/api/events', { credentials: 'include' }).then(r => r.json()).then(setEvents).catch(() => {});
    fetch('/api/registrations', { credentials: 'include' }).then(r => r.json()).then(setRegs).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const now = new Date().toISOString().split('T')[0];
    const upcoming = events.filter(e => e.datum >= now);
    const past = events.filter(e => e.datum < now);
    const totalRegs = events.reduce((sum, e) => sum + (e.anmeldungen?.length || 0), 0);
    const totalCap = events.reduce((sum, e) => sum + (e.maxTeilnehmer || 0), 0);
    return { upcoming: upcoming.length, past: past.length, totalRegs, totalCap, fillRate: totalCap ? Math.round((totalRegs / totalCap) * 100) : 0 };
  }, [events]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...form, maxTeilnehmer: parseInt(form.maxTeilnehmer) }),
    });
    setForm({ titel: '', datum: '', zeit: '', ort: '', maxTeilnehmer: 15, beschreibung: '' });
    setShowAdd(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Event wirklich löschen?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const now = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.datum >= now).sort((a, b) => a.datum.localeCompare(b.datum));
  const past = events.filter(e => e.datum < now).sort((a, b) => b.datum.localeCompare(a.datum));

  const inputCls = "bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Events verwalten</h2>
          <p className="text-xs text-txt-secondary mt-0.5">{events.length} Events · {stats.totalRegs} Anmeldungen · {stats.fillRate}% Auslastung</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
          <Plus className="w-4 h-4" /> Neues Event
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-teal">{stats.upcoming}</p>
          <p className="text-[10px] text-txt-tertiary">Bevorstehend</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-txt-secondary">{stats.past}</p>
          <p className="text-[10px] text-txt-tertiary">Vergangen</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-txt-primary">{stats.totalRegs}</p>
          <p className="text-[10px] text-txt-tertiary">Total Anmeldungen</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-yellow">{stats.fillRate}%</p>
          <p className="text-[10px] text-txt-tertiary">Auslastung</p>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-5 mb-6">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3">Neues Event erstellen</h3>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })} required placeholder="Titel" className={`col-span-2 ${inputCls}`} />
            <input value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} required type="date" className={inputCls} />
            <input value={form.zeit} onChange={e => setForm({ ...form, zeit: e.target.value })} placeholder="z.B. 09:00–11:00" className={inputCls} />
            <input value={form.ort} onChange={e => setForm({ ...form, ort: e.target.value })} placeholder="Ort" className={inputCls} />
            <input value={form.maxTeilnehmer} onChange={e => setForm({ ...form, maxTeilnehmer: e.target.value })} type="number" min="1" placeholder="Max. Teilnehmer" className={inputCls} />
            <textarea value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} placeholder="Beschreibung" rows={2} className={`col-span-2 resize-none ${inputCls}`} />
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] transition-colors">Erstellen</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-txt-secondary px-4 py-2 rounded-sm hover:bg-bg-elevated transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-scnat-teal" /> Bevorstehende Events ({upcoming.length})
          </h3>
          <div className="space-y-2">
            {upcoming.map(ev => {
              const evRegs = regs.filter(r => r.eventId === ev.id);
              const regsCount = ev.anmeldungen?.length || 0;
              const pct = Math.round((regsCount / ev.maxTeilnehmer) * 100);
              const isExpanded = expandedEvent === ev.id;
              return (
                <div key={ev.id} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
                  <div className="flex items-center gap-4 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-txt-primary">{ev.titel}</h4>
                        {pct > 80 && <span className="text-[9px] font-mono bg-scnat-red/15 text-scnat-red px-1.5 py-0.5 rounded-sm">Fast voll</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-txt-secondary">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.datum}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.zeit}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.ort}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct > 80 ? '#EA515A' : pct > 50 ? '#F39C12' : '#2ECC71' }} />
                          </div>
                          <span className="text-xs font-mono text-txt-tertiary">{regsCount}/{ev.maxTeilnehmer}</span>
                        </div>
                      </div>
                      <button onClick={() => setExpandedEvent(isExpanded ? null : ev.id)} className="text-txt-tertiary hover:text-txt-primary p-1">
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="text-txt-tertiary hover:text-scnat-red p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-bd-faint px-4 py-3 bg-bg-elevated/30">
                      <p className="text-xs text-txt-secondary mb-3">{ev.beschreibung}</p>
                      <div>
                        <p className="text-[10px] font-mono text-txt-tertiary mb-2">
                          <Users className="w-3 h-3 inline mr-1" />
                          Anmeldungen ({evRegs.length})
                        </p>
                        {evRegs.length > 0 ? (
                          <div className="space-y-1">
                            {evRegs.map(r => (
                              <div key={r.id} className="flex items-center gap-3 text-xs bg-bg-surface rounded-sm px-3 py-1.5">
                                <span className="text-txt-primary font-medium flex-1">{r.name}</span>
                                <span className="text-txt-tertiary">{r.email}</span>
                                {r.abteilung && <span className="text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1.5 py-0.5 rounded-sm">{r.abteilung}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-txt-tertiary italic">Noch keine externen Anmeldungen</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-txt-secondary mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-txt-tertiary" /> Vergangene Events ({past.length})
          </h3>
          <div className="space-y-2">
            {past.map(ev => {
              const regsCount = ev.anmeldungen?.length || 0;
              return (
                <div key={ev.id} className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-3 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-txt-primary">{ev.titel}</h4>
                      <div className="flex items-center gap-3 text-xs text-txt-secondary">
                        <span>{ev.datum}</span>
                        <span>{ev.ort}</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{regsCount}/{ev.maxTeilnehmer}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(ev.id)} className="text-txt-tertiary hover:text-scnat-red p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-8 h-8 text-txt-tertiary mx-auto mb-3" />
          <p className="text-sm text-txt-secondary">Noch keine Events erstellt.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-sm text-scnat-red hover:text-scnat-red/80 transition-colors">
            Erstes Event erstellen →
          </button>
        </div>
      )}
    </div>
  );
}
