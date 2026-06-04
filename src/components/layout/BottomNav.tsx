import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAlertCount } from '@/hooks/useAlertCount';
import { LayoutDashboard, Car, Bell, Building2, PlusCircle, Wrench } from 'lucide-react';

type NavItem = { href: string; label: string; icon: React.ElementType; badge?: boolean };

const ownerItems: NavItem[] = [
  { href: '/dashboard',          label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/vehicles', label: 'Véhicules', icon: Car },
  { href: '/dashboard/alerts',   label: 'Alertes',   icon: Bell, badge: true },
  { href: '/dashboard/garages',  label: 'Garages',   icon: Building2 },
];

const garageItems: NavItem[] = [
  { href: '/dashboard',                    label: 'Home',         icon: LayoutDashboard },
  { href: '/dashboard/interventions/new',  label: 'Intervention', icon: PlusCircle },
  { href: '/dashboard/interventions',      label: 'Historique',   icon: Wrench },
  { href: '/dashboard/garages',            label: 'Garages',      icon: Building2 },
];

export function BottomNav() {
  const { profile } = useAuth();
  const location = useLocation();
  const alertCount = useAlertCount();

  if (!profile) return null;

  const items = profile.role === 'garage' ? garageItems : ownerItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-card/95 backdrop-blur-md border-t border-border lg:hidden">
      <div className="flex items-center justify-around h-full px-2">
        {items.map(item => {
          const isActive = item.href === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(item.href);
          const count = item.badge ? alertCount : 0;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b bg-primary" />
              )}

              <div className="relative">
                <Icon className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
