import { LayoutDashboard, Package, PlusCircle, ClipboardList, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const items = [
  { to: '/marketplace/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/marketplace/inventory', icon: Package, label: 'Stock' },
  { to: '/marketplace/add', icon: PlusCircle, label: 'Ajouter' },
  { to: '/marketplace/orders', icon: ClipboardList, label: 'Commandes' },
  { to: '/marketplace/profile', icon: User, label: 'Profil' },
];

export function SellerBottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
