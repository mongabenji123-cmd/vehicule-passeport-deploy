import { useState, useEffect } from 'react';
import { useOwnerVehicles } from '@/hooks/useOwnerVehicles';
import { useAlertCount } from '@/hooks/useAlertCount';
import { VehicleSelector } from './VehicleSelector';
import { HealthMetricsCard } from './HealthMetricsCard';
import { QuickActions } from './QuickActions';
import { RecentInterventions } from './RecentInterventions';
import { Car, Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function OwnerDashboard() {
  const { data: vehicles, isLoading } = useOwnerVehicles();
  const alertCount = useAlertCount();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select first vehicle
  useEffect(() => {
    if (!selectedId && vehicles && vehicles.length > 0) {
      setSelectedId(vehicles[0].id);
    }
  }, [vehicles, selectedId]);

  const selectedVehicle = vehicles?.find(v => v.id === selectedId) ?? null;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 animate-fade-up">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
          Dashboard
        </h1>
        <Link
          to="/dashboard/alerts"
          className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </Link>
      </div>

      {/* Vehicle selector */}
      {isLoading ? (
        <Skeleton className="h-10 rounded-2xl" />
      ) : vehicles && vehicles.length > 0 ? (
        <div className="animate-fade-up stagger-1">
          <VehicleSelector
            vehicles={vehicles}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 border border-dashed border-border rounded-2xl animate-fade-up">
          <Car className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Aucun véhicule enregistré</p>
          <Link
            to="/dashboard/vehicles/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Ajouter un véhicule
          </Link>
        </div>
      )}

      {/* Health metrics */}
      {selectedVehicle && <HealthMetricsCard vehicle={selectedVehicle} />}

      {/* Quick actions */}
      <QuickActions vehicleId={selectedId ?? undefined} />

      {/* Recent interventions */}
      <RecentInterventions vehicleId={selectedId} />

      {/* Alerts summary */}
      {alertCount > 0 && (
        <div className="bg-card border border-white/5 rounded-2xl p-5 animate-fade-up stagger-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-destructive pulse-dot" />
              <span className="font-display text-sm font-semibold text-foreground">
                {alertCount} alerte{alertCount > 1 ? 's' : ''} active{alertCount > 1 ? 's' : ''}
              </span>
            </div>
            <Link
              to="/dashboard/alerts"
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Voir <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
