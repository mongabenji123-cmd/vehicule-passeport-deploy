import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type AppRole = 'owner' | 'garage' | 'admin' | 'seller';

interface RoleGateProps {
  allowedRoles: AppRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />;
  }

  if (!profile || !allowedRoles.includes(profile.role)) return <>{fallback}</>;
  return <>{children}</>;
}
