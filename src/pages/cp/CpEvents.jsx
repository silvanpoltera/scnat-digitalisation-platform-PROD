import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Users, Calendar, Clock, MapPin, ChevronDown, UserPlus, UserMinus, Search, X } from 'lucide-react';

export default function CpEvents() {
  const [events, setEvents] = useState([]);
  const [regs, setRegs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [addingUserTo, setAddingUserTo] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [form, setForm] = useState({ titel: '', datum: '', zeit: '', ort: '', maxTeilnehmer: 15, beschreibung: '' });

  const load = () => {
    fetch('/api/events', { credentials: 'include' }).then(r => r.json()).then(setEvents).catch(() => {});
    fetch('/api/registrations', { credentials: 'include' }).then(r => r.json()).then(setRegs).catch(() => {});
    fetch('/api/users', { credentials: 'include' }).then(r => r.json()).then(setAllUsers).catch(() => {});
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

  const handleRemoveRegistration = async (regId) => {
    if (!confirm('Anmeldung wirklich entfernen?')) return;
    await fetch(`/api/registrations/${regId}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const handleAddUser = async (eventId, userId) => {
    const res = await fetch('/api/registrations/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ eventId, userId }),
    });
    if (res.ok) {
      setAddingUserTo(null);
      setUserSearch('');
      load();
    } else {
      const data = await res.json();
      alert(data.error || 'Fehler beim Hinzufügen');
    }
  };

  const now = new Date().toISOString().split('T')[0];
  const upcoming = events.filter(e => e.datum >= now).sort((a, b) => a.datum.localeCompare(b.datum));
  const past = events.filter(e => e.datum < now).sort((a, b) => b.datum.localeCompare(a.datum));

  const inputCls = "bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none w-full";

  const getAvailableUsers = (eventId) => {
    const eventRegs = regs.filter(r => r.eventId === eventId);
    const registeredUserIds = new Set(eventRegs.map(r => r.userId));
    const search = userSearch.toLowerCase();
    return allUsers.filter(u =>
      !registeredUserIds.has(u.id) &&
      (u.name?.toLowerCase().includes(search) || u.email?.toLowerCase().includes(search))
    );
  };

  const renderEventCard = (ev, isPast = false) => {
    const evRegs = regs.filter(r => r.eventId === ev.id);
    const regsCount = ev.anmeldungen?.length || 0;
    const pct = ev.maxTeilnehmer ? Math.round((regsCount / ev.maxTeilnehmer) * 100) : 0;
    const isExpanded = expandedEvent === ev.id;
    const isAddingUser = addingUserTo === ev.id;

    return (
      <div key={ev.id} className={`bg-bg-surface border border-bd-faint rounded-sm overflow-hidden ${isPast ? 'opacity-60' : ''}`}>
        <div className="px-3 py-2.5 sm:px-4 sm:py-3">
          {/* Top row: Title + badges */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h4 className="text-sm font-medium text-txt-primary truncate">{ev.titel}</h4>
              {!isPast && pct > 80 && <span className="text-[9px] font-mono bg-scnat-red/15 text-scnat-red px-1.5 py-0.5 rounded-sm shrink-0">Fast voll</span>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setExpandedEvent(isExpanded ? null : ev.id)} className="text-txt-tertiary hover:text-txt-primary p-1">
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
              <button onClick={() => handleDelete(ev.id)} className="text-txt-tertiary hover:text-scnat-red p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Meta row: date/time/location - wrapping on mobile */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-txt-secondary mb-2">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3 shrink-0" />{ev.datum}</span>
            {ev.zeit && <span className="flex items-center gap-1"><Clock className="w-3 h-3 shrink-0" />{ev.zeit}</span>}
            {ev.ort && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{ev.ort}</span>}
          </div>

          {/* Capacity bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct > 80 ? 'var(--accent-red)' : pct > 50 ? 'var(--status-yellow)' : 'var(--status-green)' }} />
            </div>
            <span className="text-xs font-mono text-txt-tertiary shrink-0">{regsCount}/{ev.maxTeilnehmer}</span>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="border-t border-bd-faint px-3 py-3 sm:px-4 bg-bg-elevated/30">
            {ev.beschreibung && <p className="text-xs text-txt-secondary mb-3">{ev.beschreibung}</p>}

            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-mono text-txt-tertiary flex items-center gap-1">
                <Users className="w-3 h-3" />
                Anmeldungen ({evRegs.length})
              </p>
              {!isPast && (
                <button
                  onClick={() => { setAddingUserTo(isAddingUser ? null : ev.id); setUserSearch(''); }}
                  className="flex items-center gap-1 text-[11px] text-scnat-teal hover:text-scnat-teal/80 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Person hinzufügen</span>
                </button>
              )}
            </div>

            {/* Add user panel */}
            {isAddingUser && (
              <div className="mb-3 bg-bg-surface border border-bd-faint rounded-sm p-2.5">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-tertiary" />
                  <input
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    placeholder="User suchen…"
                    autoFocus
                    className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-xs pl-8 pr-8 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt-tertiary hover:text-txt-primary">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="max-h-36 overflow-y-auto space-y-0.5">
                  {getAvailableUsers(ev.id).length > 0 ? (
                    getAvailableUsers(ev.id).slice(0, 20).map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleAddUser(ev.id, u.id)}
                        className="w-full flex items-center gap-2 text-left text-xs px-2.5 py-1.5 rounded-sm hover:bg-bg-elevated transition-colors"
                      >
                        <span className="text-txt-primary font-medium truncate">{u.name}</span>
                        <span className="text-txt-tertiary truncate ml-auto text-[11px]">{u.email}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-txt-tertiary italic px-2 py-1">
                      {userSearch ? 'Keine passenden User gefunden' : 'Alle User sind bereits angemeldet'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Registrations list */}
            {evRegs.length > 0 ? (
              <div className="space-y-1">
                {evRegs.map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-xs bg-bg-surface rounded-sm px-2.5 py-1.5 sm:px-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
                        <span className="text-txt-primary font-medium truncate">{r.name}</span>
                        <span className="text-txt-tertiary text-[11px] truncate">{r.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {r.abteilung && <span className="hidden sm:inline text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1.5 py-0.5 rounded-sm">{r.abteilung}</span>}
                      {r.addedByAdmin && <span className="hidden sm:inline text-[9px] font-mono bg-scnat-teal/15 text-scnat-teal px-1 py-0.5 rounded-sm">Admin</span>}
                      <button
                        onClick={() => handleRemoveRegistration(r.id)}
                        title="Anmeldung entfernen"
                        className="text-txt-tertiary hover:text-scnat-red p-0.5 transition-colors"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-txt-tertiary italic">Noch keine Anmeldungen</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Events verwalten</h2>
          <p className="text-xs text-txt-secondary mt-0.5">{events.length} Events · {stats.totalRegs} Anmeldungen · {stats.fillRate}% Auslastung</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Neues Event
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
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

      {/* Add form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-4 sm:p-5 mb-6">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3">Neues Event erstellen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.titel} onChange={e => setForm({ ...form, titel: e.target.value })} required placeholder="Titel" className={`sm:col-span-2 ${inputCls}`} />
            <input value={form.datum} onChange={e => setForm({ ...form, datum: e.target.value })} required type="date" className={inputCls} />
            <input value={form.zeit} onChange={e => setForm({ ...form, zeit: e.target.value })} placeholder="z.B. 09:00–11:00" className={inputCls} />
            <input value={form.ort} onChange={e => setForm({ ...form, ort: e.target.value })} placeholder="Ort" className={inputCls} />
            <input value={form.maxTeilnehmer} onChange={e => setForm({ ...form, maxTeilnehmer: e.target.value })} type="number" min="1" placeholder="Max. Teilnehmer" className={inputCls} />
            <textarea value={form.beschreibung} onChange={e => setForm({ ...form, beschreibung: e.target.value })} placeholder="Beschreibung" rows={2} className={`sm:col-span-2 resize-none ${inputCls}`} />
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
            {upcoming.map(ev => renderEventCard(ev))}
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
            {past.map(ev => renderEventCard(ev, true))}
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
