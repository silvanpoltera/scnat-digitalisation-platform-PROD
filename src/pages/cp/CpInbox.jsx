import { useState, useEffect, useMemo } from 'react';
import {
  Send, Trash2, Plus, X, Mail, Users, Calendar, Globe,
  ChevronDown, ChevronUp, Check, AlertTriangle, Eye,
  UsersRound, Edit2, UserPlus, Megaphone, Search,
} from 'lucide-react';

const inputCls = 'bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none';

export default function CpInbox() {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [tab, setTab] = useState('compose');
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetType: 'users',
    targetUserIds: [],
    targetGroupId: '',
    targetEventId: '',
  });

  const [groupForm, setGroupForm] = useState({ name: '', userIds: [] });
  const [showGroupAdd, setShowGroupAdd] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [userSearch, setUserSearch] = useState('');
  const [groupUserSearch, setGroupUserSearch] = useState('');

  const load = () => {
    const opts = { credentials: 'include' };
    Promise.all([
      fetch('/api/inbox/admin/all', opts).then(r => r.ok ? r.json() : []),
      fetch('/api/users', opts).then(r => r.ok ? r.json() : []),
      fetch('/api/inbox/groups', opts).then(r => r.ok ? r.json() : []),
      fetch('/api/events', opts).then(r => r.ok ? r.json() : []),
    ]).then(([msgs, usrs, grps, evts]) => {
      setMessages(msgs);
      setUsers(usrs.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
      setGroups(grps);
      setEvents(evts);
    }).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setSendError('');
    setSendSuccess('');
    if (form.targetType === 'users' && form.targetUserIds.length === 0) return;
    if (form.targetType === 'group' && !form.targetGroupId) return;
    if (form.targetType === 'event' && !form.targetEventId) return;

    setSending(true);
    try {
      const res = await fetch('/api/inbox/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Fehler ${res.status}`);
      }
      setForm({ title: '', message: '', priority: 'normal', targetType: 'users', targetUserIds: [], targetGroupId: '', targetEventId: '' });
      setSendSuccess('Nachricht erfolgreich gesendet!');
      setTimeout(() => setSendSuccess(''), 4000);
      load();
    } catch (err) {
      setSendError(err.message || 'Nachricht konnte nicht gesendet werden');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Nachricht wirklich löschen?')) return;
    await fetch(`/api/inbox/admin/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const handleGroupSave = async (e) => {
    e.preventDefault();
    if (!groupForm.name || groupForm.userIds.length === 0) return;
    if (editingGroup) {
      await fetch(`/api/inbox/groups/${editingGroup}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(groupForm),
      });
    } else {
      await fetch('/api/inbox/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(groupForm),
      });
    }
    setGroupForm({ name: '', userIds: [] });
    setShowGroupAdd(false);
    setEditingGroup(null);
    load();
  };

  const handleGroupDelete = async (id) => {
    if (!confirm('Gruppe wirklich löschen?')) return;
    await fetch(`/api/inbox/groups/${id}`, { method: 'DELETE', credentials: 'include' });
    load();
  };

  const toggleUserInForm = (userId) => {
    setForm(prev => ({
      ...prev,
      targetUserIds: prev.targetUserIds.includes(userId)
        ? prev.targetUserIds.filter(id => id !== userId)
        : [...prev.targetUserIds, userId],
    }));
  };

  const toggleUserInGroup = (userId) => {
    setGroupForm(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, userSearch]);

  const filteredGroupUsers = useMemo(() => {
    if (!groupUserSearch.trim()) return users;
    const q = groupUserSearch.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, groupUserSearch]);

  const targetPreview = useMemo(() => {
    if (form.targetType === 'all') return `${users.length} User (alle)`;
    if (form.targetType === 'users') return form.targetUserIds.length === 0
      ? 'Keine User ausgewählt'
      : `${form.targetUserIds.length} User ausgewählt`;
    if (form.targetType === 'group') {
      const g = groups.find(g => g.id === form.targetGroupId);
      return g ? `Gruppe "${g.name}" (${g.members?.length || 0} User)` : 'Keine Gruppe ausgewählt';
    }
    if (form.targetType === 'event') {
      const ev = events.find(e => e.id === form.targetEventId);
      return ev ? `Event "${ev.titel}" (${ev.anmeldungen?.length || 0} Anmeldungen)` : 'Kein Event ausgewählt';
    }
    return '';
  }, [form.targetType, form.targetUserIds, form.targetGroupId, form.targetEventId, users, groups, events]);

  const totalSent = messages.length;
  const totalRead = messages.reduce((s, m) => s + (m.readCount || 0), 0);
  const totalRecipients = messages.reduce((s, m) => s + (m.targetCount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-scnat-teal" /> Nachrichten
          </h2>
          <p className="text-xs text-txt-secondary mt-0.5">
            Sende Nachrichten an einzelne User, Gruppen oder Event-Teilnehmer
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-teal">{totalSent}</p>
          <p className="text-[10px] text-txt-tertiary">Gesendet</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-status-green">{totalRead}</p>
          <p className="text-[10px] text-txt-tertiary">Gelesen</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-txt-secondary">{totalRecipients}</p>
          <p className="text-[10px] text-txt-tertiary">Empfänger total</p>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-3 text-center">
          <p className="text-xl font-heading font-semibold text-scnat-orange">{groups.length}</p>
          <p className="text-[10px] text-txt-tertiary">Gruppen</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-bg-surface border border-bd-faint rounded-sm p-1 w-fit">
        {[
          { id: 'compose', label: 'Neue Nachricht', icon: Send },
          { id: 'sent', label: `Gesendet (${messages.length})`, icon: Mail },
          { id: 'groups', label: `Gruppen (${groups.length})`, icon: UsersRound },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-colors ${
              tab === t.id
                ? 'bg-bg-elevated text-txt-primary border border-bd-default'
                : 'text-txt-secondary hover:text-txt-primary border border-transparent'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* ═══ Compose Tab ═══ */}
      {tab === 'compose' && (
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-5">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-scnat-red" /> Nachricht verfassen
          </h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Betreff"
                required
                className={`w-full ${inputCls}`}
              />
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className={inputCls}
              >
                <option value="normal">Normal</option>
                <option value="important">Wichtig</option>
              </select>
            </div>

            <textarea
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Nachricht..."
              rows={4}
              required
              className={`w-full ${inputCls}`}
            />

            {/* Target selection */}
            <div>
              <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-2 block">Empfänger</label>
              <div className="flex gap-2 flex-wrap mb-3">
                {[
                  { value: 'all', label: 'Alle User', icon: Globe },
                  { value: 'users', label: 'Einzelne User', icon: Users },
                  { value: 'group', label: 'Gruppe', icon: UsersRound },
                  { value: 'event', label: 'Event-Teilnehmer', icon: Calendar },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, targetType: opt.value, targetUserIds: [], targetGroupId: '', targetEventId: '' })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                      form.targetType === opt.value
                        ? 'bg-scnat-red/10 text-scnat-red border-scnat-red/30'
                        : 'bg-bg-elevated text-txt-secondary border-bd-faint hover:border-bd-default'
                    }`}
                  >
                    <opt.icon className="w-3.5 h-3.5" /> {opt.label}
                  </button>
                ))}
              </div>

              {/* Individual user selection */}
              {form.targetType === 'users' && (
                <div className="bg-bg-elevated border border-bd-faint rounded-sm overflow-hidden">
                  <div className="relative p-2 border-b border-bd-faint">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-tertiary" />
                    <input
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="User suchen…"
                      className="w-full bg-bg-surface border border-bd-faint text-txt-primary text-sm pl-8 pr-3 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                    />
                  </div>
                  {form.targetUserIds.length > 0 && (
                    <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1 border-b border-bd-faint">
                      {form.targetUserIds.map(id => {
                        const u = users.find(u => u.id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1 text-[10px] bg-scnat-red/10 text-scnat-red px-2 py-0.5 rounded-sm">
                            {u?.name || id}
                            <button type="button" onClick={() => toggleUserInForm(id)} className="hover:text-scnat-darkred">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="p-2 max-h-48 overflow-y-auto space-y-0.5">
                    {filteredUsers.length === 0 ? (
                      <p className="text-xs text-txt-tertiary py-2 text-center">Keine User gefunden</p>
                    ) : filteredUsers.map(u => (
                      <label key={u.id} className="flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-bg-surface cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.targetUserIds.includes(u.id)}
                          onChange={() => toggleUserInForm(u.id)}
                          className="accent-scnat-red"
                        />
                        <span className="text-sm text-txt-primary">{u.name}</span>
                        <span className="text-[10px] text-txt-tertiary ml-auto">{u.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Group selection */}
              {form.targetType === 'group' && (
                <div className="space-y-2">
                  {groups.length === 0 ? (
                    <p className="text-xs text-txt-tertiary py-2">
                      Noch keine Gruppen erstellt. Wechsle zum Tab "Gruppen" um welche anzulegen.
                    </p>
                  ) : (
                    <div className="bg-bg-elevated border border-bd-faint rounded-sm p-3 space-y-1">
                      {groups.map(g => (
                        <label key={g.id} className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-bg-surface cursor-pointer">
                          <input
                            type="radio"
                            name="targetGroup"
                            checked={form.targetGroupId === g.id}
                            onChange={() => setForm({ ...form, targetGroupId: g.id })}
                            className="accent-scnat-red"
                          />
                          <span className="text-sm text-txt-primary">{g.name}</span>
                          <span className="text-[10px] text-txt-tertiary ml-auto">{g.members?.length || 0} Mitglieder</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Event selection */}
              {form.targetType === 'event' && (
                <select
                  value={form.targetEventId}
                  onChange={e => setForm({ ...form, targetEventId: e.target.value })}
                  className={`w-full ${inputCls}`}
                >
                  <option value="">Event auswählen...</option>
                  {events
                    .filter(e => (e.anmeldungen || []).length > 0)
                    .sort((a, b) => (b.datum || '').localeCompare(a.datum || ''))
                    .map(e => (
                      <option key={e.id} value={e.id}>
                        {e.titel} ({e.datum}) — {e.anmeldungen?.length || 0} Anmeldungen
                      </option>
                    ))}
                </select>
              )}

              {/* Preview */}
              <div className="mt-2 flex items-center gap-2 text-xs text-txt-secondary">
                <Eye className="w-3.5 h-3.5" />
                <span>{targetPreview}</span>
              </div>
            </div>

            {sendError && (
              <div className="flex items-center gap-2 text-sm text-scnat-red bg-scnat-red/10 border border-scnat-red/20 rounded-sm px-3 py-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{sendError}</span>
              </div>
            )}
            {sendSuccess && (
              <div className="flex items-center gap-2 text-sm text-status-green bg-status-green/10 border border-status-green/20 rounded-sm px-3 py-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{sendSuccess}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-1.5 bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {sending ? 'Sende...' : 'Senden'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══ Sent Tab ═══ */}
      {tab === 'sent' && (
        <div className="space-y-2">
          {messages.length === 0 ? (
            <p className="text-sm text-txt-tertiary py-8 text-center">Noch keine Nachrichten gesendet</p>
          ) : messages.map(msg => (
            <div key={msg.id} className="bg-bg-surface border border-bd-faint rounded-sm">
              <button
                onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-bg-elevated/50 transition-colors"
              >
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${msg.priority === 'important' ? 'bg-scnat-red' : 'bg-scnat-teal'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-heading font-semibold text-txt-primary">{msg.title}</h4>
                    {msg.priority === 'important' && (
                      <span className="text-[9px] font-bold uppercase bg-scnat-red/10 text-scnat-red px-1.5 py-0.5 rounded-sm">
                        Wichtig
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-txt-tertiary">{msg.targetLabel}</span>
                    <span className="text-[10px] text-txt-tertiary">
                      {new Date(msg.createdAt).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
                    msg.readCount === msg.targetCount
                      ? 'bg-status-green/15 text-status-green'
                      : msg.readCount > 0
                        ? 'bg-status-yellow/15 text-status-yellow'
                        : 'bg-bg-elevated text-txt-tertiary'
                  }`}>
                    {msg.readCount}/{msg.targetCount} gelesen
                  </span>
                  {expandedMsg === msg.id ? <ChevronUp className="w-4 h-4 text-txt-tertiary" /> : <ChevronDown className="w-4 h-4 text-txt-tertiary" />}
                </div>
              </button>

              {expandedMsg === msg.id && (
                <div className="px-4 pb-4 border-t border-bd-faint pt-3">
                  <p className="text-sm text-txt-secondary leading-relaxed whitespace-pre-wrap mb-4">{msg.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-txt-tertiary">
                      <span>Typ: {msg.targetType}</span>
                      <span>Von: {msg.createdByName}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="flex items-center gap-1 text-xs text-txt-tertiary hover:text-scnat-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Löschen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ═══ Groups Tab ═══ */}
      {tab === 'groups' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-heading font-semibold text-txt-primary flex items-center gap-2">
              <UsersRound className="w-4 h-4 text-scnat-orange" /> User-Gruppen
            </h3>
            <button
              onClick={() => { setShowGroupAdd(true); setEditingGroup(null); setGroupForm({ name: '', userIds: [] }); }}
              className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors"
            >
              <Plus className="w-4 h-4" /> Neue Gruppe
            </button>
          </div>

          {/* Add/Edit Group Form */}
          {showGroupAdd && (
            <div className="bg-bg-surface border border-bd-faint rounded-sm p-5 mb-4">
              <h4 className="text-sm font-heading font-semibold text-txt-primary mb-3">
                {editingGroup ? 'Gruppe bearbeiten' : 'Neue Gruppe erstellen'}
              </h4>
              <form onSubmit={handleGroupSave} className="space-y-3">
                <input
                  value={groupForm.name}
                  onChange={e => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Gruppenname (z.B. Projektleiter, IT-Team)"
                  required
                  className={`w-full ${inputCls}`}
                />
                <div>
                  <label className="text-[10px] text-txt-tertiary uppercase tracking-wider mb-2 block">
                    Mitglieder ({groupForm.userIds.length} ausgewählt)
                  </label>
                  <div className="bg-bg-elevated border border-bd-faint rounded-sm overflow-hidden">
                    <div className="relative p-2 border-b border-bd-faint">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-txt-tertiary" />
                      <input
                        value={groupUserSearch}
                        onChange={e => setGroupUserSearch(e.target.value)}
                        placeholder="User suchen…"
                        className="w-full bg-bg-surface border border-bd-faint text-txt-primary text-sm pl-8 pr-3 py-1.5 rounded-sm focus:border-scnat-red focus:outline-none"
                      />
                    </div>
                    {groupForm.userIds.length > 0 && (
                      <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1 border-b border-bd-faint">
                        {groupForm.userIds.map(id => {
                          const u = users.find(u => u.id === id);
                          return (
                            <span key={id} className="inline-flex items-center gap-1 text-[10px] bg-scnat-red/10 text-scnat-red px-2 py-0.5 rounded-sm">
                              {u?.name || id}
                              <button type="button" onClick={() => toggleUserInGroup(id)} className="hover:text-scnat-darkred">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <div className="p-2 max-h-48 overflow-y-auto space-y-0.5">
                      {filteredGroupUsers.length === 0 ? (
                        <p className="text-xs text-txt-tertiary py-2 text-center">Keine User gefunden</p>
                      ) : filteredGroupUsers.map(u => (
                        <label key={u.id} className="flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-bg-surface cursor-pointer">
                          <input
                            type="checkbox"
                            checked={groupForm.userIds.includes(u.id)}
                            onChange={() => toggleUserInGroup(u.id)}
                            className="accent-scnat-red"
                          />
                          <span className="text-sm text-txt-primary">{u.name}</span>
                          <span className="text-[10px] text-txt-tertiary ml-auto">{u.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-scnat-red text-white text-sm px-4 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
                    {editingGroup ? 'Speichern' : 'Erstellen'}
                  </button>
                  <button type="button" onClick={() => { setShowGroupAdd(false); setEditingGroup(null); }} className="text-sm text-txt-secondary hover:text-txt-primary px-3 py-1.5">
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Groups List */}
          {groups.length === 0 && !showGroupAdd ? (
            <div className="text-center py-12">
              <UsersRound className="w-10 h-10 text-txt-tertiary mx-auto mb-3" />
              <h4 className="text-sm font-heading font-semibold text-txt-primary mb-1">Noch keine Gruppen</h4>
              <p className="text-xs text-txt-secondary mb-4">
                Erstelle Gruppen um Nachrichten schnell an mehrere User zu senden.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map(g => (
                <div key={g.id} className="bg-bg-surface border border-bd-faint rounded-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-heading font-semibold text-txt-primary mb-1">{g.name}</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {(g.members || []).map(m => (
                          <span key={m.id} className="inline-flex items-center gap-1 text-[10px] bg-bg-elevated text-txt-secondary px-2 py-0.5 rounded-sm border border-bd-faint">
                            <span className="w-4 h-4 rounded-sm bg-bg-surface border border-bd-faint flex items-center justify-center text-[8px] font-mono text-txt-tertiary">
                              {m.name?.charAt(0) || '?'}
                            </span>
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingGroup(g.id);
                          setGroupForm({ name: g.name, userIds: g.userIds || [] });
                          setShowGroupAdd(true);
                        }}
                        className="p-1.5 text-txt-tertiary hover:text-txt-primary rounded-sm hover:bg-bg-elevated"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleGroupDelete(g.id)}
                        className="p-1.5 text-txt-tertiary hover:text-scnat-red rounded-sm hover:bg-bg-elevated"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
