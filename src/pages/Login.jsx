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
    <div className="min-h-screen bg-[#0C0E10] flex items-center justify-center px-4 relative overflow-hidden">
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
        <div className="bg-[#141618] border border-[#23262B] rounded-sm p-6">
          <h1 className="text-lg font-semibold text-[#ECEEF1] mb-1 font-sans">Anmelden</h1>
          <p className="text-sm text-[#8A8F9B] mb-6">Digitalisierungsplattform</p>

          {error && (
            <div className="bg-[#EA515A]/10 border border-[#EA515A]/30 text-[#EA515A] text-sm px-3 py-2 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#8A8F9B] mb-1.5">E-Mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#1C1E22] border border-[#23262B] text-[#ECEEF1] text-sm px-3 py-2 rounded-sm focus:border-[#EA515A] focus:outline-none transition-colors"
                placeholder="name@scnat.ch"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8A8F9B] mb-1.5">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#1C1E22] border border-[#23262B] text-[#ECEEF1] text-sm px-3 py-2 rounded-sm focus:border-[#EA515A] focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#EA515A] text-white text-sm font-medium py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Wird angemeldet…' : 'Anmelden'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-[#4E535D] mt-6">
          SCNAT — Akademien der Wissenschaften Schweiz
        </p>
      </div>
    </div>
  );
}
