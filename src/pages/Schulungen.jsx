import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, X, ThumbsUp, Plus, Trash2 } from 'lucide-react';
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
    <div className="bg-bg-surface border border-bd-faint rounded-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bd-faint">
        <button onClick={() => setMonth(new Date(year, mo - 1))} className="p-1 text-txt-tertiary hover:text-txt-primary"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-heading font-medium text-txt-primary">{monthStr}</span>
        <button onClick={() => setMonth(new Date(year, mo + 1))} className="p-1 text-txt-tertiary hover:text-txt-primary"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] text-txt-tertiary font-mono py-2 border-b border-bd-faint">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: weeks * 7 }, (_, i) => {
          const day = i - startOffset + 1;
          const valid = day >= 1 && day <= daysInMonth;
          const dateStr = valid ? `${year}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
          const dayEvents = dateStr ? (eventDates[dateStr] || []) : [];
          const isToday = dateStr === today;

          return (
            <div
              key={i}
              className={`min-h-[48px] p-1 border-b border-r border-bd-faint ${valid ? 'cursor-pointer hover:bg-bg-elevated' : ''}`}
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
          <div className="flex items-center gap-3 text-xs text-txt-secondary mb-4">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{event.datum} · {event.zeit}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.ort}</span>
          </div>
          <div className="flex items-center gap-1 text-xs mb-4">
            <Users className="w-3 h-3 text-txt-tertiary" />
            <span className={spots <= 3 ? 'text-status-yellow' : 'text-txt-secondary'}>
              {event.anmeldungen?.length || 0}/{event.maxTeilnehmer} Plätze
            </span>
          </div>

          {success ? (
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

    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <div className="mb-8">
        <p className="text-sm text-txt-secondary leading-relaxed max-w-3xl">
          Digitale Kompetenzen sind ein zentraler Baustein der Transformation. Die SCNAT bietet regelmässig 
          Schulungen zu digitalen Tools, KI-Grundlagen und Arbeitsmethoden an. Alle Mitarbeitenden sind 
          eingeladen, sich anzumelden und aktiv einzubringen — sei es als Teilnehmende oder mit eigenen 
          Themenwünschen. Die Schulungen finden in kleinen Gruppen statt, um Raum für Fragen und Austausch zu bieten.
        </p>
      </div>

      <div className="flex items-center gap-1 mb-6 bg-bg-surface border border-bd-faint rounded-sm p-1 w-full sm:w-fit">
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

      {tab === 'kalender' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarView events={events} onSelect={setSelectedEvent} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-heading font-medium text-txt-primary">Nächste Events</h3>
            {events
              .filter(e => e.datum >= new Date().toISOString().split('T')[0])
              .sort((a, b) => a.datum.localeCompare(b.datum))
              .map(e => {
                const spots = e.maxTeilnehmer - (e.anmeldungen?.length || 0);
                return (
                  <div
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className="bg-bg-surface border border-bd-faint rounded-sm p-3 cursor-pointer hover:border-bd-strong transition-colors"
                  >
                    <h4 className="text-sm text-txt-primary font-medium">{e.titel}</h4>
                    <div className="flex items-center gap-3 text-xs text-txt-secondary mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{e.datum}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{e.ort}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs mt-1.5">
                      <Users className="w-3 h-3 text-txt-tertiary" />
                      <span className={spots <= 3 ? 'text-status-yellow' : 'text-txt-secondary'}>
                        {e.anmeldungen?.length || 0}/{e.maxTeilnehmer} Plätze
                      </span>
                    </div>
                    <p className="text-xs text-txt-tertiary mt-1.5 line-clamp-2">{e.beschreibung}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {tab === 'themen' && <ThemenVoting />}

      {selectedEvent && <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
    </div>
  );
}
