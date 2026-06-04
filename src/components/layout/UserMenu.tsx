import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  owner:  { label: 'Propriétaire', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  garage: { label: 'Garage',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  admin:  { label: 'Admin',        color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  seller: { label: 'Vendeur',      color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
};

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const config = roleConfig[profile.role] ?? roleConfig.owner;

  const initials = profile.full_name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-3">
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.bg }}
      >
        <span className="font-display text-xs font-bold uppercase" style={{ color: config.color }}>
          {initials}
        </span>
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {profile.full_name}
        </p>
        <span
          className="inline-block font-display text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleLogout}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
