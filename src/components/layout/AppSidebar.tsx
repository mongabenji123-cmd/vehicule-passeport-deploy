import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertCount } from '@/hooks/useAlertCount';
import { UserMenu } from './UserMenu';
import logoSrc from '@/assets/logo-glass-icon.png';
import {
  Car, LayoutDashboard, Bell, Wrench, Building2, ShieldCheck, Users, PlusCircle, DollarSign,
} from 'lucide-react';

type NavGroup = {
  label: string;
  roles?: string[];
  items: {
    title: string;
    url: string;
    icon: React.ElementType;
    roles: string[];
    badge?: 'alerts';
  }[];
};

const navGroups: NavGroup[] = [
  {
    label: 'Navigation',
    items: [
      { title: 'Dashboard',      url: '/dashboard',          icon: LayoutDashboard, roles: ['owner', 'garage', 'admin'] },
      { title: 'Mes Véhicules',  url: '/dashboard/vehicles', icon: Car,             roles: ['owner', 'admin'] },
      { title: 'Alertes',        url: '/dashboard/alerts',   icon: Bell,            roles: ['owner', 'admin'], badge: 'alerts' },
      { title: 'Garages',        url: '/dashboard/garages',  icon: Building2,       roles: ['owner', 'garage', 'admin'] },
    ],
  },
  {
    label: 'Mon Garage',
    roles: ['garage', 'admin'],
    items: [
      { title: 'Saisir intervention', url: '/dashboard/interventions/new', icon: PlusCircle, roles: ['garage', 'admin'] },
      { title: 'Mes interventions',   url: '/dashboard/interventions',     icon: Wrench,     roles: ['garage', 'admin'] },
    ],
  },
  {
    label: 'Administration',
    roles: ['admin'],
    items: [
      { title: 'Administration', url: '/dashboard/admin', icon: ShieldCheck, roles: ['admin'] },
      { title: 'Revenus & MRR', url: '/dashboard/admin/revenue', icon: DollarSign, roles: ['admin'] },
    ],
  },
];

export function AppSidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const alertCount = useAlertCount();

  if (!profile) return null;

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 w-64 h-screen bg-card border-r border-border z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={logoSrc} alt="Auto-Passeport" className="w-9 h-9 object-contain" />
          <span className="font-display text-base font-bold tracking-wide uppercase text-foreground">
            Auto-Passeport
          </span>
        </Link>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navGroups.map(group => {
          if (group.roles && !group.roles.includes(profile.role)) return null;

          const visibleItems = group.items.filter(item => item.roles.includes(profile.role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="px-3 mb-2 font-display text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {visibleItems.map(item => {
                  const isActive = item.url === '/dashboard'
                    ? location.pathname === '/dashboard'
                    : location.pathname.startsWith(item.url);
                  const badgeCount = item.badge === 'alerts' ? alertCount : 0;
                  const Icon = item.icon;

                  return (
                    <li key={item.url}>
                      <Link
                        to={item.url}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {/* Active left bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-primary" />
                        )}

                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1">{item.title}</span>

                        {badgeCount > 0 && (
                          <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                            {badgeCount > 99 ? '99+' : badgeCount}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User menu */}
      <div className="border-t border-border p-4">
        <UserMenu />
      </div>
    </aside>
  );
}
