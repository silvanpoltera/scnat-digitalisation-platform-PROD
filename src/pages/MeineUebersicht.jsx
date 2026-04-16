import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, FileText, MessageSquare, Send, CheckCircle, XCircle, Loader2, GitPullRequest, Megaphone, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import PageHeader from '../components/PageHeader';

const REQUEST_STATUS_COLORS = {
  'offen': 'bg-status-yellow/15 text-status-yellow',
  'in Prüfung': 'bg-status-blue/15 text-status-blue',
  'bewilligt': 'bg-status-green/15 text-status-green',
  'abgelehnt': 'bg-scnat-red/15 text-scnat-red',
};

const REQUEST_STATUS_ICONS = {
  'offen': Loader2,
  'in Prüfung': Clock,
  'bewilligt': CheckCircle,
  'abgelehnt': XCircle,
};

const CHANGE_STATUS_COLORS = {
  'eingereicht': 'bg-status-yellow/15 text-status-yellow',
  'in_pruefung': 'bg-status-blue/15 text-status-blue',
  'angenommen': 'bg-status-green/15 text-status-green',
  'abgelehnt': 'bg-scnat-red/15 text-scnat-red',
  'umgesetzt': 'bg-scnat-teal/15 text-scnat-teal',
};

const CHANGE_STATUS_LABELS = {
  'eingereicht': 'Eingereicht',
  'in_pruefung': 'In Prüfung',
  'angenommen': 'Angenommen',
  'abgelehnt': 'Abgelehnt',
  'umgesetzt': 'Umgesetzt',
};

const CHANGE_STATUS_ICONS = {
  'eingereicht': Loader2,
  'in_pruefung': Clock,
  'angenommen': CheckCircle,
  'abgelehnt': XCircle,
  'umgesetzt': CheckCircle,
};

export default function MeineUebersicht() {
  const { user } = useAuth();
  const { markSeen, refresh: refreshNotifications } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [events, setEvents] = useState([]);
  const [changes, setChanges] = useState([]);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [expandedInbox, setExpandedInbox] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const safeFetch = (url) =>
      fetch(url, { credentials: 'include' })
        .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(d => Array.isArray(d) ? d : [])
        .catch(() => []);

    Promise.all([
      safeFetch('/api/requests/mine'),
      safeFetch('/api/registrations/mine'),
      safeFetch('/api/changes/mine'),
      safeFetch('/api/inbox/mine'),
    ]).then(([reqs, evts, chgs, msgs]) => {
      setRequests(reqs);
      setEvents(evts);
      setChanges(chgs);
      setInboxMessages(msgs);
      setLoading(false);
    });

    markSeen();
  }, [markSeen]);

  const markInboxRead = async (id) => {
    await fetch(`/api/inbox/${id}/read`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setInboxMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    refreshNotifications();
  };

  const markAllInboxRead = async () => {
    await fetch('/api/inbox/read-all', { method: 'POST', credentials: 'include' }).catch(() => {});
    setInboxMessages(prev => prev.map(m => ({ ...m, read: true })));
    refreshNotifications();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="w-6 h-6 border-2 border-scnat-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasContent = requests.length > 0 || events.length > 0 || changes.length > 0 || inboxMessages.length > 0;
  const unreadInbox = inboxMessages.filter(m => !m.read).length;

  return (
    <div>
      <PageHeader
        title="Meine Übersicht"
        subtitle={`Hallo ${user?.name || 'User'} — deine Anträge, Vorschläge und Event-Anmeldungen auf einen Blick.`}
        breadcrumb={[{ label: 'Meine Übersicht' }]}
        seed={77}
        accentColor="#3498DB"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {!hasContent && (
          <div className="text-center py-16">
            <FileText className="w-10 h-10 text-txt-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-heading font-semibold text-txt-primary mb-2">Noch keine Aktivitäten</h3>
            <p className="text-sm text-txt-secondary mb-6 max-w-md mx-auto">
              Sobald du einen Antrag einreichst, einen Change-Vorschlag machst oder dich für ein Event anmeldest,
              siehst du hier den Status und allfällige Antworten.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link to="/software-antraege" className="inline-flex items-center gap-2 px-4 py-2 bg-scnat-red text-white text-sm font-medium rounded-sm hover:bg-scnat-darkred transition-colors">
                <Send className="w-4 h-4" /> Softwareantrag
              </Link>
              <Link to="/prozesse" className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface border border-bd-faint text-txt-secondary text-sm font-medium rounded-sm hover:border-bd-strong hover:text-txt-primary transition-colors">
                <GitPullRequest className="w-4 h-4" /> Change-Vorschlag
              </Link>
              <Link to="/schulungen" className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface border border-bd-faint text-txt-secondary text-sm font-medium rounded-sm hover:border-bd-strong hover:text-txt-primary transition-colors">
                <Calendar className="w-4 h-4" /> Events
              </Link>
            </div>
          </div>
        )}

        {/* Inbox Messages */}
        {inboxMessages.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-txt-primary flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-scnat-red" /> Nachrichten
                {unreadInbox > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-scnat-red text-white text-[10px] font-bold">
                    {unreadInbox}
                  </span>
                )}
              </h2>
              {unreadInbox > 0 && (
                <button
                  onClick={markAllInboxRead}
                  className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Alle als gelesen markieren
                </button>
              )}
            </div>
            <div className="space-y-2">
              {inboxMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`bg-bg-surface border rounded-sm overflow-hidden transition-colors ${
                    msg.read ? 'border-bd-faint' : 'border-scnat-red/30 bg-scnat-red/[0.02]'
                  }`}
                >
                  <button
                    onClick={() => {
                      setExpandedInbox(expandedInbox === msg.id ? null : msg.id);
                      if (!msg.read) markInboxRead(msg.id);
                    }}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-bg-elevated/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      !msg.read
                        ? msg.priority === 'important' ? 'bg-scnat-red animate-pulse' : 'bg-scnat-teal'
                        : 'bg-transparent'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm font-heading ${msg.read ? 'font-medium text-txt-secondary' : 'font-semibold text-txt-primary'}`}>
                          {msg.title}
                        </h4>
                        {msg.priority === 'important' && (
                          <span className="text-[9px] font-bold uppercase bg-scnat-red/10 text-scnat-red px-1.5 py-0.5 rounded-sm">
                            Wichtig
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-txt-tertiary">
                        <span>Von {msg.createdByName}</span>
                        <span>{new Date(msg.createdAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {expandedInbox === msg.id
                      ? <ChevronUp className="w-4 h-4 text-txt-tertiary shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-txt-tertiary shrink-0" />
                    }
                  </button>
                  {expandedInbox === msg.id && (
                    <div className="px-4 pb-4 pt-1 border-t border-bd-faint">
                      <p className="text-sm text-txt-secondary leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Software Requests */}
        {requests.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-txt-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-scnat-teal" /> Meine Softwareanträge
              </h2>
              <Link to="/software-antraege" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">
                + Neuer Antrag
              </Link>
            </div>
            <div className="space-y-3">
              {requests.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).map(r => {
                const StatusIcon = REQUEST_STATUS_ICONS[r.status] || Loader2;
                return (
                  <div key={r.id} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-heading font-semibold text-txt-primary">{r.name}</h4>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${REQUEST_STATUS_COLORS[r.status] || 'bg-bg-elevated text-txt-secondary'}`}>
                              <StatusIcon className="w-3 h-3" /> {r.status}
                            </span>
                          </div>
                          <p className="text-xs text-txt-secondary leading-relaxed">{r.begruendung}</p>
                        </div>
                        {r.timestamp && (
                          <span className="text-[10px] font-mono text-txt-tertiary shrink-0">
                            {new Date(r.timestamp).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {r.antwort && (
                        <div className="mt-3 bg-status-green/5 border border-status-green/20 rounded-sm px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-status-green" />
                            <span className="text-[10px] font-mono text-status-green font-medium">
                              Antwort vom Team
                              {r.antwortTimestamp ? ` · ${new Date(r.antwortTimestamp).toLocaleDateString('de-CH')}` : ''}
                            </span>
                          </div>
                          <p className="text-sm text-txt-primary leading-relaxed">{r.antwort}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Change Proposals */}
        {changes.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-txt-primary flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-scnat-orange" /> Meine Change-Vorschläge
              </h2>
              <Link to="/prozesse" className="text-xs text-scnat-red hover:text-scnat-red/80 transition-colors">
                + Neuer Vorschlag
              </Link>
            </div>
            <div className="space-y-3">
              {changes.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')).map(c => {
                const StatusIcon = CHANGE_STATUS_ICONS[c.status] || Loader2;
                return (
                  <div key={c.id} className="bg-bg-surface border border-bd-faint rounded-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-heading font-semibold text-txt-primary">{c.titel}</h4>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${CHANGE_STATUS_COLORS[c.status] || 'bg-bg-elevated text-txt-secondary'}`}>
                              <StatusIcon className="w-3 h-3" /> {CHANGE_STATUS_LABELS[c.status] || c.status}
                            </span>
                            {c.cluster && (
                              <span className="text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1.5 py-0.5 rounded-sm">
                                {c.cluster}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-txt-secondary leading-relaxed line-clamp-2">{c.beschreibung}</p>
                        </div>
                        {c.timestamp && (
                          <span className="text-[10px] font-mono text-txt-tertiary shrink-0">
                            {new Date(c.timestamp).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {c.antwort && (
                        <div className="mt-3 bg-status-green/5 border border-status-green/20 rounded-sm px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-status-green" />
                            <span className="text-[10px] font-mono text-status-green font-medium">
                              Antwort vom Team
                              {c.antwortTimestamp ? ` · ${new Date(c.antwortTimestamp).toLocaleDateString('de-CH')}` : ''}
                            </span>
                          </div>
                          <p className="text-sm text-txt-primary leading-relaxed">{c.antwort}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Event Registrations */}
        {events.length > 0 && (
          <div>
            <h2 className="text-lg font-heading font-semibold text-txt-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-scnat-orange" /> Meine Event-Anmeldungen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.sort((a, b) => {
                const da = a.event?.datum || '';
                const db = b.event?.datum || '';
                return db.localeCompare(da);
              }).map(r => {
                const ev = r.event;
                if (!ev) return null;
                const isPast = ev.datum < new Date().toISOString().split('T')[0];
                return (
                  <div key={r.id} className={`bg-bg-surface border border-bd-faint rounded-sm p-5 ${isPast ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="text-sm font-heading font-semibold text-txt-primary">{ev.titel}</h4>
                      {isPast ? (
                        <span className="text-[10px] font-mono bg-bg-elevated text-txt-tertiary px-1.5 py-0.5 rounded-sm shrink-0">Vergangen</span>
                      ) : (
                        <span className="text-[10px] font-mono bg-status-green/15 text-status-green px-1.5 py-0.5 rounded-sm shrink-0">Angemeldet</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-txt-secondary">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ev.datum}</span>
                      {ev.zeit && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.zeit}</span>}
                      {ev.ort && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.ort}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
