import { useAuth } from '@/contexts/AuthContext';
import { OwnerDashboard } from '@/components/dashboard/OwnerDashboard';
import { GarageDashboard } from '@/components/dashboard/GarageDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
  const { profile } = useAuth();

  if (!profile) return null;

  if (profile.role === 'admin') return <AdminDashboard />;
  if (profile.role === 'garage') return <GarageDashboard />;
  return <OwnerDashboard />;
}
