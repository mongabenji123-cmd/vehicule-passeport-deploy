import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertCount } from '@/hooks/useAlertCount';
import { Bell } from 'lucide-react';

const segmentLabels: Record<string, string> = {
  dashboard:     'Dashboard',
  vehicles:      'Mes Véhicules',
  alerts:        'Alertes',
  garages:       'Garages',
  interventions: 'Interventions',
  new:           'Nouvelle',
  admin:         'Administration',
  users:         'Utilisateurs',
  settings:      'Paramètres',
};

function useBreadcrumb() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isUUID = /^[0-9a-f-]{36}$/i.test(seg);
    const label = isUUID
      ? 'Détail'
      : (segmentLabels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1));
    return { href, label, isLast: i === segments.length - 1 };
  });
}

export function DashboardHeader() {
  const { profile } = useAuth();
  const breadcrumb = useBreadcrumb();
  const alertCount = useAlertCount();

  if (!profile) return null;

  const roleColors: Record<string, string> = {
    owner: 'bg-primary/10 text-primary',
    garage: 'bg-accent/10 text-accent',
    admin: 'bg-success/10 text-success',
  };
  const avatarClass = roleColors[profile.role] ?? roleColors.owner;

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 sm:px-6 bg-background/90 backdrop-blur-md border-b border-border">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm overflow-x-auto">
        {breadcrumb.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5 whitespace-nowrap">
            {i > 0 && (
              <span className="text-muted-foreground/40">/</span>
            )}
            {crumb.isLast ? (
              <span className="font-display font-semibold uppercase tracking-wider text-foreground text-xs">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-xs"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <Link
          to="/dashboard/alerts"
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>

        <div className="w-px h-6 bg-border" />

        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg ${avatarClass} flex items-center justify-center`}>
          <span className="font-display text-[10px] font-bold uppercase">{initials}</span>
        </div>
      </div>
    </header>
  );
}
