import { useState } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';

export default function SoftwareAntraege() {
  const { user } = useAuth();
  const initial = { name: '', begruendung: '', dringlichkeit: 'normal', abteilung: '', kontakt: user?.name || '', kontaktEmail: user?.email || '' };
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="w-12 h-12 text-status-green mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-txt-primary mb-2">Antrag eingereicht</h2>
          <p className="text-sm text-txt-secondary mb-6">Ihr Softwareantrag wurde erfolgreich eingereicht und wird geprüft.</p>
          <button onClick={() => { setSuccess(false); setForm({ ...initial }); }} className="text-sm text-scnat-red hover:underline">
            Neuen Antrag stellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Softwareantrag"
        subtitle="Neue Software beantragen — der Antrag wird vom IT-Team geprüft"
        breadcrumb={[{ label: 'Softwareanträge' }]}
        seed={51}
        accentColor="#1ABC9C"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-lg">
          <form onSubmit={handleSubmit} className="bg-bg-surface border border-bd-faint rounded-sm p-6 space-y-4">
            {error && <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-sm px-3 py-2 rounded-sm">{error}</div>}

            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">Kontaktperson *</label>
              <input
                value={form.kontakt}
                onChange={e => setForm({ ...form, kontakt: e.target.value })}
                required
                placeholder="Vor- und Nachname"
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">E-Mail *</label>
              <input
                type="email"
                value={form.kontaktEmail}
                onChange={e => setForm({ ...form, kontaktEmail: e.target.value })}
                required
                placeholder="vorname.nachname@scnat.ch"
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">Software-Name *</label>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="z.B. Figma, Slack, Asana"
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">Begründung *</label>
              <textarea
                value={form.begruendung}
                onChange={e => setForm({ ...form, begruendung: e.target.value })}
                required
                rows={4}
                placeholder="Warum benötigen Sie diese Software? Welchen Mehrwert bringt sie?"
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">Dringlichkeit</label>
              <select
                value={form.dringlichkeit}
                onChange={e => setForm({ ...form, dringlichkeit: e.target.value })}
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
              >
                <option value="niedrig">Niedrig</option>
                <option value="normal">Normal</option>
                <option value="hoch">Hoch</option>
                <option value="dringend">Dringend</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-txt-secondary mb-1.5">Abteilung</label>
              <input
                value={form.abteilung}
                onChange={e => setForm({ ...form, abteilung: e.target.value })}
                placeholder="z.B. Kommunikation, Wissenschaft"
                className="w-full bg-bg-elevated border border-bd-faint text-txt-primary text-sm px-3 py-2 rounded-sm focus:border-scnat-red focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-scnat-red text-white text-sm font-medium px-4 py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Wird eingereicht…' : 'Antrag einreichen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
