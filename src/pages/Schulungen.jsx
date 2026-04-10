import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, X, ThumbsUp, Plus, Trash2, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';

function CalendarView({ events, onSelect }) {
  const [month, setMonth] = useState(() => new Date());

  const year = month.getFullYear();
  const mo = month.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const weeks = Math.ceil((startOffset + daysInMonth) / 7);

  const eventDates = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const d = e.datum;
      if (!map[d]) map[d] = [];
      map[d].push(e);
    });
    return map;
  }, [events]);

  const monthStr = month.toLocaleDateString('de-CH', { month: 'long', year: 'numeric' });
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-bg-surface border border-bd-faint rounded-sm flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bd-faint">
        <button onClick={() => setMonth(new Date(year, mo - 1))} className="p-1 text-txt-tertiary hover:text-txt-primary"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-heading font-medium text-txt-primary">{monthStr}</span>
        <button onClick={() => setMonth(new Date(year, mo + 1))} className="p-1 text-txt-tertiary hover:text-txt-primary"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] text-txt-tertiary font-mono py-2 border-b border-bd-faint">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const day = i - startOffset + 1;
          const valid = day >= 1 && day <= daysInMonth;
          const dateStr = valid ? `${year}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
          const dayEvents = dateStr ? (eventDates[dateStr] || []) : [];
          const isToday = dateStr === today;

          return (
              <div
              key={i}
              className={`min-h-[32px] p-1 border-b border-r border-bd-faint ${valid ? 'cursor-pointer hover:bg-bg-elevated' : ''}`}
              onClick={() => dayEvents.length > 0 && onSelect(dayEvents[0])}
            >
              {valid && (
                <>
                  <span className={`text-xs ${isToday ? 'text-scnat-red font-bold' : 'text-txt-secondary'}`}>{day}</span>
                  {dayEvents.map(ev => (
                    <div key={ev.id} className="mt-0.5 px-1 py-0.5 text-[9px] bg-scnat-red/15 text-scnat-red rounded-sm truncate">{ev.titel}</div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RegistrationModal({ event, onClose }) {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [abteilung, setAbteilung] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!event) return;
    fetch('/api/registrations/mine', { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(regs => {
        if (Array.isArray(regs) && regs.some(r => r.eventId === event.id)) {
          setAlreadyRegistered(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [event]);

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ eventId: event.id, name, email, abteilung }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const spots = event.maxTeilnehmer - (event.anmeldungen?.length || 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-bg-surface border border-bd-faint rounded-sm w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-bd-faint">
          <h3 className="text-sm font-heading font-semibold text-txt-primary">Anmelden</h3>
          <button onClick={onClose} className="text-txt-tertiary hover:text-txt-primary"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <h4 className="text-sm font-medium text-txt-primary mb-1">{event.titel}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-txt-secondary mb-4">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.datum} · {event.zeit}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.ort}</span>
          </div>
          <div className="flex items-center gap-1 text-xs mb-4">
            <Users className="w-3 h-3 text-txt-tertiary" />
            <span className={spots <= 3 ? 'text-status-yellow' : 'text-txt-secondary'}>
              {event.anmeldungen?.length || 0}/{event.maxTeilnehmer} Plätze
            </span>
          </div>

          {checking ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : alreadyRegistered ? (
            <div className="bg-status-blue/10 border border-status-blue/30 text-status-blue text-sm px-3 py-2.5 rounded-sm">
              Du bist bereits für dieses Event angemeldet.
            </div>
          ) : success ? (
            <div className="bg-status-green/10 border border-status-green/30 text-status-green text-sm px-3 py-2 rounded-sm">Anmeldung erfolgreich!</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-xs px-3 py-2 rounded-sm">{error}</div>}
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Name" className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none" />
              <input value={email} onChange={e => setEmail(e.target.value)} required type="email" placeholder="E-Mail" className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none" />
              <input value={abteilung} onChange={e => setAbteilung(e.target.value)} placeholder="Abteilung (optional)" className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none" />
              <button type="submit" className="w-full bg-scnat-red text-white text-sm font-medium py-2 rounded-sm hover:bg-[#F06570] transition-colors">Anmelden</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemenVoting() {
  const { user } = useAuth();
  const [themen, setThemen] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadThemen = () => {
    fetch('/api/schulungsthemen', { credentials: 'include' }).then(r => r.json()).then(setThemen).catch(() => {});
  };

  useEffect(() => { loadThemen(); }, []);

  const handleLike = async (id) => {
    await fetch(`/api/schulungsthemen/${id}/like`, { method: 'POST', credentials: 'include' });
    loadThemen();
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await fetch('/api/schulungsthemen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ titel: newTitle, beschreibung: newDesc }),
    });
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
    loadThemen();
  };

  const handleDelete = async (id) => {
    await fetch(`/api/schulungsthemen/${id}`, { method: 'DELETE', credentials: 'include' });
    loadThemen();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-heading font-semibold text-txt-primary">Schulungsthemen</h3>
          <p className="text-xs text-txt-secondary">Vote für Themen oder schlage neue vor</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs bg-scnat-red text-white px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Vorschlag
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-4 mb-4 space-y-2">
          <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="Thema" className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Kurze Beschreibung (optional)" className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none" />
          <button type="submit" className="bg-scnat-red text-white text-xs px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">Einreichen</button>
        </form>
      )}

      <div className="space-y-2">
        {themen.map(t => {
          const liked = t.likes?.includes(user?.id);
          const canDelete = (t.typ !== 'vordefiniert') && ((t.likes?.length || 0) === 0 || t.erstelltVon === user?.id || user?.role === 'admin');
          return (
            <div key={t.id} className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-3 flex items-start gap-3">
              <button
                onClick={() => handleLike(t.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-sm transition-colors ${
                  liked ? 'bg-scnat-red/15 text-scnat-red' : 'text-txt-tertiary hover:text-scnat-red hover:bg-scnat-red/10'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-mono">{t.likes?.length || 0}</span>
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-txt-primary font-medium">{t.titel}</span>
                  {t.typ === 'vordefiniert' && <span className="text-[9px] font-mono bg-bg-elevated text-txt-tertiary px-1 py-0.5 rounded-sm">vordefiniert</span>}
                </div>
                {t.beschreibung && <p className="text-xs text-txt-secondary mt-0.5">{t.beschreibung}</p>}
              </div>
              {canDelete && (
                <button onClick={() => handleDelete(t.id)} className="text-txt-tertiary hover:text-scnat-red p-1"><Trash2 className="w-3.5 h-3.5" /></button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Schulungen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('kalender');

  useEffect(() => {
    fetch('/api/events', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setEvents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-8"><div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Schulungen"
        subtitle="Kalender, Anmeldung und Themenwünsche"
        breadcrumb={[{ label: 'Schulungen' }]}
        seed={66}
        accentColor="#2ECC71"
      />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <p className="text-sm text-txt-secondary leading-relaxed max-w-2xl">
          Die SCNAT bietet regelmässig Schulungen zu digitalen Tools, KI-Grundlagen und Arbeitsmethoden an. 
          Alle Mitarbeitenden sind eingeladen, sich anzumelden und aktiv Themenwünsche einzubringen.
        </p>
        <div className="flex items-center gap-1 bg-bg-surface border border-bd-faint rounded-sm p-1 shrink-0">
          {[{ id: 'kalender', label: 'Kalender' }, { id: 'themen', label: 'Themen wünschen' }].map(v => (
            <button
              key={v.id}
              onClick={() => setTab(v.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                tab === v.id ? 'bg-bg-elevated text-txt-primary border border-bd-default' : 'text-txt-secondary hover:text-txt-primary border border-transparent'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'kalender' && (
        <div className="space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
            <div className="flex-1 min-w-0 flex flex-col">
              <CalendarView events={events} onSelect={setSelectedEvent} />
            </div>

            {(() => {
              const popularEvent = events
                .filter(e => e.datum >= new Date().toISOString().split('T')[0])
                .sort((a, b) => (b.anmeldungen?.length || 0) - (a.anmeldungen?.length || 0))[0];
              if (!popularEvent) return null;
              const dateObj = new Date(popularEvent.datum + 'T00:00:00');
              const dayNum = dateObj.getDate();
              const monthShort = dateObj.toLocaleDateString('de-CH', { month: 'short' });
              const spots = popularEvent.maxTeilnehmer - (popularEvent.anmeldungen?.length || 0);
              const fillPct = Math.round(((popularEvent.anmeldungen?.length || 0) / popularEvent.maxTeilnehmer) * 100);
              return (
                <div className="hidden lg:flex lg:w-72 xl:w-80 flex-col">
                  <div className="bg-bg-surface border border-bd-faint rounded-sm flex flex-col h-full">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-bd-faint">
                      <TrendingUp className="w-4 h-4 text-scnat-red" />
                      <span className="text-sm font-heading font-medium text-txt-primary">Beliebt</span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex flex-col items-center justify-center bg-scnat-red/10 text-scnat-red rounded-sm px-3 py-2 shrink-0">
                          <span className="text-2xl font-bold leading-none">{dayNum}</span>
                          <span className="text-[10px] font-mono uppercase leading-tight mt-0.5">{monthShort}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm text-txt-primary font-semibold leading-snug">{popularEvent.titel}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-txt-secondary mt-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{popularEvent.ort}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-txt-secondary mt-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{popularEvent.datum} · {popularEvent.zeit}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-txt-secondary leading-relaxed mb-4 line-clamp-3">{popularEvent.beschreibung}</p>

                      <div className="mt-auto space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-txt-secondary flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Anmeldungen</span>
                          <span className="font-mono text-txt-primary">{popularEvent.anmeldungen?.length || 0}/{popularEvent.maxTeilnehmer}</span>
                        </div>
                        <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-scnat-red rounded-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        {spots <= 5 && spots > 0 && (
                          <p className="text-[10px] text-status-yellow font-medium">Nur noch {spots} {spots === 1 ? 'Platz' : 'Plätze'} frei</p>
                        )}
                        {spots === 0 && (
                          <p className="text-[10px] text-scnat-red font-medium">Ausgebucht</p>
                        )}
                        <button
                          onClick={() => setSelectedEvent(popularEvent)}
                          className="w-full mt-2 bg-scnat-red text-white text-xs font-medium py-2 rounded-sm hover:bg-[#F06570] transition-colors"
                        >
                          Jetzt anmelden
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {(() => {
            const upcoming = events
              .filter(e => e.datum >= new Date().toISOString().split('T')[0])
              .sort((a, b) => a.datum.localeCompare(b.datum));
            if (!upcoming.length) return null;
            return (
              <div>
                <h3 className="text-sm font-heading font-medium text-txt-primary mb-3">Nächste Events</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcoming.map(e => {
                    const spots = e.maxTeilnehmer - (e.anmeldungen?.length || 0);
                    const dateObj = new Date(e.datum + 'T00:00:00');
                    const dayNum = dateObj.getDate();
                    const monthShort = dateObj.toLocaleDateString('de-CH', { month: 'short' });
                    return (
                      <div
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className="bg-bg-surface border border-bd-faint rounded-sm p-3 cursor-pointer hover:border-bd-strong transition-colors flex gap-3"
                      >
                        <div className="flex flex-col items-center justify-center bg-scnat-red/10 text-scnat-red rounded-sm px-2.5 py-1.5 shrink-0">
                          <span className="text-lg font-bold leading-none">{dayNum}</span>
                          <span className="text-[10px] font-mono uppercase leading-tight mt-0.5">{monthShort}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm text-txt-primary font-medium truncate">{e.titel}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-txt-secondary mt-0.5">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{e.ort}</span>
                            <span className="flex items-center gap-0.5">
                              <Users className="w-3 h-3" />
                              <span className={spots <= 3 ? 'text-status-yellow' : ''}>
                                {e.anmeldungen?.length || 0}/{e.maxTeilnehmer}
                              </span>
                            </span>
                          </div>
                          <p className="text-[11px] text-txt-tertiary mt-1 line-clamp-1">{e.beschreibung}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {tab === 'themen' && <ThemenVoting />}

      {selectedEvent && <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
    </div>
  );
}
