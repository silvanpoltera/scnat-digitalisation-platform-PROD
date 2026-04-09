import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import NetworkBackground from './NetworkBackground';

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  badges,
  children,
  seed = 42,
  accentColor = '#EA515A',
}) {
  return (
    <section className="relative overflow-hidden bg-bg-base border-b border-bd-faint">
      <NetworkBackground
        nodeCount={30}
        seed={seed}
        accentColor={accentColor}
        opacity={0.35}
        showPulse
      />

      <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_var(--accent-glow,rgba(234,81,90,0.04))_0%,_transparent_70%)]" style={{ '--accent-glow': `${accentColor}08` }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 relative z-10">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-xs text-txt-tertiary mb-3">
            <Link to="/" className="hover:text-txt-secondary transition-colors">Übersicht</Link>
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3" />
                {item.path ? (
                  <Link to={item.path} className="hover:text-txt-secondary transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-txt-secondary">{item.label}</span>
                )}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-txt-primary mb-2">
          {title}
        </h1>

        {subtitle && (
          <p className="text-sm text-txt-secondary max-w-2xl mb-3">{subtitle}</p>
        )}

        {badges && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-sm text-xs font-mono ${
                  badge.variant === 'red' ? 'bg-scnat-red/15 text-scnat-red' :
                  badge.variant === 'green' ? 'bg-status-green/15 text-status-green' :
                  'bg-bg-elevated border border-bd-faint text-txt-secondary'
                }`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}
