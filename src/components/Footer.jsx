import { Link } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import ScnatLogo from './ScnatLogo';

export default function Footer() {
  return (
    <footer className="bg-bg-surface border-t border-bd-faint">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-wrap gap-8">
          <div className="min-w-[180px] flex-1">
            <div className="mb-3">
              <ScnatLogo size={24} subtitle="Akademie der Naturwissenschaften Schweiz" />
            </div>
            <p className="text-sm text-txt-tertiary leading-relaxed">
              Haus der Akademien<br />
              Laupenstrasse 7, Postfach<br />
              3001 Bern, Schweiz
            </p>
          </div>

          <div className="min-w-[140px]">
            <h4 className="font-heading font-semibold text-txt-primary text-sm mb-3">Navigation</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Übersicht', path: '/' },
                { label: 'Strategie', path: '/strategie' },
                { label: 'Handlungsfelder', path: '/handlungsfelder' },
                { label: 'Software & Co', path: '/systemlandschaft' },
                { label: 'KI', path: '/ki-hub' },
              ].map(item => (
                <Link key={item.path} to={item.path} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="min-w-[140px]">
            <h4 className="font-heading font-semibold text-txt-primary text-sm mb-3">Ressourcen</h4>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Massnahmen', path: '/massnahmen' },
                { label: 'Schulungen', path: '/schulungen' },
                { label: 'Prozesse', path: '/prozesse' },
                { label: 'Task Force', path: '/team' },
                { label: 'FAQs', path: '/faqs' },
                { label: 'Glossar', path: '/glossar' },
              ].map(item => (
                <Link key={item.path} to={item.path} className="text-sm text-txt-secondary hover:text-txt-primary transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-bd-faint flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-txt-tertiary">&copy; 2026 SCNAT — Akademie der Naturwissenschaften Schweiz</p>
          <div className="flex items-center gap-3">
            <p className="text-xs text-txt-tertiary">Digitalisierungsportal</p>
            <Link to="/cp" className="opacity-[0.08] hover:opacity-40 transition-opacity" title="CP">
              <Terminal className="w-3.5 h-3.5 text-txt-tertiary" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
