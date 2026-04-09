import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function CpKi() {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/ki-content', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setContent(JSON.stringify(data, null, 2)))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const parsed = JSON.parse(content);
      const res = await fetch('/api/ki-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error('Speichern fehlgeschlagen');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message === 'Unexpected token' || err instanceof SyntaxError ? 'Ungültiges JSON' : err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-heading font-semibold text-txt-primary">KI-Inhalte bearbeiten</h2>
          <p className="text-xs text-txt-secondary mt-1">JSON-Editor für alle KI-Hub-Inhalte (CoT-Szenarien, ChatGPT-Schulung, Sicherheit)</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-scnat-red text-white text-sm px-4 py-2 rounded-sm hover:bg-[#F06570] disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Speichern…' : saved ? 'Gespeichert!' : 'Speichern'}
        </button>
      </div>

      {error && (
        <div className="bg-scnat-red/10 border border-scnat-red/30 text-scnat-red text-sm px-3 py-2 rounded-sm mb-4">{error}</div>
      )}

      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full h-[calc(100vh-220px)] bg-bg-elevated border border-bd-faint text-txt-primary text-xs font-mono px-4 py-3 rounded-sm focus:border-scnat-red focus:outline-none resize-none leading-relaxed"
        spellCheck={false}
      />
    </div>
  );
}
