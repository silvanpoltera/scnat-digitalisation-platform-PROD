import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NetworkBackground, { NetworkGrid } from '../components/NetworkBackground';
import { ScnatMark } from '../components/ScnatLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4 relative overflow-hidden">
      <NetworkBackground nodeCount={60} seed={13} accentColor="#EA515A" opacity={0.3} showPulse />
      <NetworkGrid opacity={0.08} />
      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center gap-2 mb-8">
          <ScnatMark size={40} />
          <div className="flex flex-col items-center leading-tight">
            <span className="text-sm font-heading font-bold tracking-wider text-txt-primary uppercase">SCNAT</span>
            <span className="text-[10px] text-txt-tertiary">Digitalisierungsplattform</span>
          </div>
        </div>
        <div className="bg-bg-surface border border-bd-faint rounded-sm p-6">
          <h1 className="text-lg font-semibold text-txt-primary mb-1 font-sans">Anmelden</h1>
          <p className="text-sm text-txt-secondary mb-6">Digitalisierungsplattform</p>

          {error && (
            <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-sm px-3 py-2 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none transition-colors"
                placeholder="name@scnat.ch"
              />
            </div>
            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-scnat-red text-white text-sm font-medium py-2 rounded-sm hover:bg-scnat-darkred disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Wird angemeldet…' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgot(v => !v)}
              className="text-xs text-txt-tertiary hover:text-scnat-red transition-colors"
            >
              Passwort vergessen?
            </button>
          </div>

          {showForgot && (
            <div className="mt-3 bg-bg-elevated border border-bd-faint rounded-sm p-4 text-sm text-txt-secondary leading-relaxed">
              <p>
                Sorry Leute, da die App so klein wie möglich gebaut wurde, ist diese Funktion leider nicht verfügbar.
                Habt ihr das Passwort vergessen oder möchtet es ändern, kontaktiert bitte den Admin.
              </p>
              <a
                href="mailto:silvan.poltera@scnat.ch"
                className="inline-flex items-center gap-1.5 mt-2 text-scnat-red hover:underline text-sm"
              >
                silvan.poltera@scnat.ch
              </a>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-txt-tertiary mt-6">
          SCNAT — Akademien der Wissenschaften Schweiz
        </p>
      </div>
    </div>
  );
}
