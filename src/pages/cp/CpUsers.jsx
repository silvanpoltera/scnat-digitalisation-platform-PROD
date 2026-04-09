import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Pencil, X, Check, Key, Shield, User, ShieldAlert, Eye } from 'lucide-react';

const inputCls = "bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none";

const ROLE_INFO = {
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'bg-scnat-red/15 text-scnat-red',
    badgeCls: 'bg-scnat-red/15 text-scnat-red border-scnat-red/30',
    desc: 'Vollzugriff inkl. Control Panel',
  },
  user: {
    label: 'User',
    icon: Eye,
    color: 'bg-scnat-teal/15 text-scnat-teal',
    badgeCls: 'bg-scnat-teal/15 text-scnat-teal border-scnat-teal/30',
    desc: 'Portal-Zugang, kein CP',
  },
};

export default function CpUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [resetPwId, setResetPwId] = useState(null);
  const [newPw, setNewPw] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => {
    fetch('/api/users', { credentials: 'include' }).then(r => r.json()).then(setUsers).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    setForm({ name: '', email: '', password: '', role: 'user' });
    setShowAdd(false);
    load();
    flashMsg('User erstellt');
  };

  const handleDelete = async (id) => {
    if (!confirm('User wirklich löschen?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    load();
    flashMsg('User gelöscht');
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
    setResetPwId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editForm),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    setEditingId(null);
    load();
    flashMsg('Gespeichert');
  };

  const resetPassword = async (id) => {
    if (!newPw || newPw.length < 6) { alert('Passwort muss mind. 6 Zeichen haben'); return; }
    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: newPw }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error); return; }
    setResetPwId(null);
    setNewPw('');
    flashMsg('Passwort zurückgesetzt');
  };

  const flashMsg = (text) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 2500);
  };

  const isMe = (id) => id === currentUser?.id;

  const admins = users.filter(u => u.role === 'admin');
  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">Users verwalten</h2>
          <p className="text-xs text-txt-secondary mt-0.5">{users.length} User · {admins.length} Admin · {regularUsers.length} User</p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-xs text-status-green font-medium">{msg}</span>}
          <button onClick={() => { setShowAdd(!showAdd); cancelEdit(); }} className="flex items-center gap-1 bg-scnat-red text-white text-sm px-3 py-1.5 rounded-sm hover:bg-[#F06570] transition-colors">
            <Plus className="w-4 h-4" /> Neuer User
          </button>
        </div>
      </div>

      {/* Role explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4 flex items-start gap-3">
          <div className="p-2 rounded-sm bg-scnat-red/15 text-scnat-red shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-heading font-semibold text-txt-primary">Admin</h4>
            <p className="text-xs text-txt-secondary mt-0.5">Vollzugriff auf das gesamte Portal <strong className="text-txt-primary">inklusive Control Panel</strong>. Kann Users verwalten, Content bearbeiten, Events erstellen und alle Einstellungen ändern.</p>
          </div>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-4 flex items-start gap-3">
          <div className="p-2 rounded-sm bg-scnat-teal/15 text-scnat-teal shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-heading font-semibold text-txt-primary">User</h4>
            <p className="text-xs text-txt-secondary mt-0.5">Zugang zum Portal mit allen Inhalten — Strategie, Massnahmen, Software-Bewertungen, Schulungsanmeldungen, Voting. <strong className="text-scnat-red">Kein Zugang zum Control Panel.</strong></p>
          </div>
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-bg-surface border border-bd-faint rounded-sm p-5 mb-6">
          <h3 className="text-sm font-heading font-semibold text-txt-primary mb-3">Neuen User erstellen</h3>
          {error && <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-xs px-3 py-2 rounded-sm mb-3">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Name" className={inputCls} />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required type="email" placeholder="E-Mail" className={inputCls} />
            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required type="password" placeholder="Passwort (mind. 6 Zeichen)" minLength={6} className={inputCls} />
            <div>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={`w-full ${inputCls}`}>
                <option value="user">User — Portal-Zugang, kein CP</option>
                <option value="admin">Admin — Vollzugriff inkl. CP</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] transition-colors">Erstellen</button>
            <button type="button" onClick={() => setShowAdd(false)} className="text-sm text-txt-secondary px-4 py-2 rounded-sm hover:bg-bg-elevated transition-colors">Abbrechen</button>
          </div>
        </form>
      )}

      {/* Admins section */}
      {admins.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-scnat-red" />
            <h3 className="text-sm font-heading font-semibold text-txt-primary">Admins</h3>
            <span className="text-[10px] font-mono text-txt-tertiary">{admins.length}</span>
          </div>
          <div className="space-y-2">
            {admins.map(u => (
              <UserRow
                key={u.id}
                u={u}
                isMe={isMe}
                editingId={editingId}
                editForm={editForm}
                setEditForm={setEditForm}
                resetPwId={resetPwId}
                newPw={newPw}
                setNewPw={setNewPw}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                saveEdit={saveEdit}
                handleDelete={handleDelete}
                setResetPwId={setResetPwId}
                resetPassword={resetPassword}
              />
            ))}
          </div>
        </div>
      )}

      {/* Users section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-scnat-teal" />
          <h3 className="text-sm font-heading font-semibold text-txt-primary">Users</h3>
          <span className="text-[10px] font-mono text-txt-tertiary">{regularUsers.length}</span>
          <span className="text-[10px] font-mono text-txt-tertiary ml-1">· kein CP-Zugang</span>
        </div>
        {regularUsers.length > 0 ? (
          <div className="space-y-2">
            {regularUsers.map(u => (
              <UserRow
                key={u.id}
                u={u}
                isMe={isMe}
                editingId={editingId}
                editForm={editForm}
                setEditForm={setEditForm}
                resetPwId={resetPwId}
                newPw={newPw}
                setNewPw={setNewPw}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                saveEdit={saveEdit}
                handleDelete={handleDelete}
                setResetPwId={setResetPwId}
                resetPassword={resetPassword}
              />
            ))}
          </div>
        ) : (
          <div className="bg-bg-surface border border-bd-faint rounded-sm px-4 py-6 text-center text-xs text-txt-tertiary">
            Noch keine regulären Users erstellt.
          </div>
        )}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-sm text-txt-secondary">Keine Users vorhanden.</div>
      )}
    </div>
  );
}

function UserRow({ u, isMe, editingId, editForm, setEditForm, resetPwId, newPw, setNewPw, startEdit, cancelEdit, saveEdit, handleDelete, setResetPwId, resetPassword }) {
  const editing = editingId === u.id;
  const showPwReset = resetPwId === u.id;
  const roleInfo = ROLE_INFO[u.role] || ROLE_INFO.user;

  return (
    <div className={`bg-bg-surface border rounded-sm overflow-hidden ${editing ? 'border-scnat-red/30' : 'border-bd-faint'}`}>
      <div className="flex items-center gap-4 px-4 py-3">
        <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-xs font-mono font-bold shrink-0 ${roleInfo.color}`}>
          {u.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
        </div>

        {editing ? (
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={`${inputCls} text-xs`} placeholder="Name" />
            <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} type="email" className={`${inputCls} text-xs`} placeholder="E-Mail" />
            <select
              value={editForm.role}
              onChange={e => setEditForm({ ...editForm, role: e.target.value })}
              className={`${inputCls} text-xs`}
              disabled={isMe(u.id)}
            >
              <option value="user">User — kein CP</option>
              <option value="admin">Admin — mit CP</option>
            </select>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-txt-primary font-medium">{u.name}</span>
              {isMe(u.id) && <span className="text-[9px] font-mono bg-scnat-red/10 text-scnat-red px-1.5 py-0.5 rounded-sm">Du</span>}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm border ${roleInfo.badgeCls}`}>
                {roleInfo.label}
              </span>
              <span className="text-[10px] text-txt-tertiary hidden sm:inline">{roleInfo.desc}</span>
            </div>
            <p className="text-xs text-txt-tertiary font-mono mt-0.5">{u.email}</p>
          </div>
        )}

        <div className="flex items-center gap-1 shrink-0">
          {editing ? (
            <>
              <button onClick={() => saveEdit(u.id)} className="p-1.5 text-status-green hover:bg-status-green/10 rounded-sm transition-colors" title="Speichern">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={cancelEdit} className="p-1.5 text-txt-tertiary hover:bg-bg-elevated rounded-sm transition-colors" title="Abbrechen">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => startEdit(u)} className="p-1.5 text-txt-tertiary hover:text-scnat-teal hover:bg-scnat-teal/10 rounded-sm transition-colors" title="Bearbeiten">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setResetPwId(showPwReset ? null : u.id); setNewPw(''); }} className="p-1.5 text-txt-tertiary hover:text-status-yellow hover:bg-status-yellow/10 rounded-sm transition-colors" title="Passwort zurücksetzen">
                <Key className="w-3.5 h-3.5" />
              </button>
              {!isMe(u.id) && (
                <button onClick={() => handleDelete(u.id)} className="p-1.5 text-txt-tertiary hover:text-scnat-red hover:bg-scnat-red/10 rounded-sm transition-colors" title="Löschen">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showPwReset && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-elevated/50 border-t border-bd-faint flex-wrap">
          <Key className="w-3.5 h-3.5 text-status-yellow shrink-0" />
          <span className="text-xs text-txt-secondary shrink-0">Neues Passwort:</span>
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="Mind. 6 Zeichen"
            minLength={6}
            className={`flex-1 min-w-[150px] max-w-xs ${inputCls} text-xs`}
            autoFocus
          />
          <button onClick={() => resetPassword(u.id)} className="text-xs bg-status-yellow/15 text-status-yellow px-3 py-1.5 rounded-sm hover:bg-status-yellow/25 transition-colors">
            Zurücksetzen
          </button>
          <button onClick={() => { setResetPwId(null); setNewPw(''); }} className="text-xs text-txt-tertiary px-2 py-1.5 hover:bg-bg-elevated rounded-sm transition-colors">
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}
