import { useAuth } from '../contexts/AuthContext';
import { useVisibility } from '../contexts/VisibilityContext';
import { EyeOff, ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VisibilityGuard({ vKey, children }) {
  const { isVisible, ready } = useVisibility();
  const { user } = useAuth();

  if (!ready) return children;

  const hidden = !isVisible(vKey);

  if (!hidden) return children;

  if (user?.role === 'admin') {
    return (
      <>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center gap-3 bg-status-yellow/10 border border-status-yellow/30 rounded-sm px-4 py-3">
            <EyeOff className="w-4 h-4 text-status-yellow shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-txt-primary">
                Admin-Vorschau — Diese Seite ist für Benutzer deaktiviert
              </p>
              <p className="text-xs text-txt-secondary">
                Nur Admins können diese Seite aktuell sehen. Aktiviere sie unter Sichtbarkeit.
              </p>
            </div>
            <Link
              to="/cp/sichtbarkeit"
              className="flex items-center gap-1.5 text-xs font-medium text-status-yellow hover:text-status-yellow/80 bg-status-yellow/10 px-3 py-1.5 rounded-sm hover:bg-status-yellow/15 transition-colors shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              Sichtbarkeit
            </Link>
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-elevated mb-6">
        <EyeOff className="w-8 h-8 text-txt-tertiary" />
      </div>
      <h1 className="text-xl font-heading font-semibold text-txt-primary mb-2">Seite nicht verfügbar</h1>
      <p className="text-txt-secondary mb-8 max-w-md mx-auto">
        Diese Seite ist derzeit nicht aktiv. Bitte wende dich an den Administrator, falls du Zugang benötigst.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 bg-scnat-red text-white rounded-sm text-sm font-medium hover:bg-scnat-darkred transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Zur Startseite
      </Link>
    </div>
  );
}
