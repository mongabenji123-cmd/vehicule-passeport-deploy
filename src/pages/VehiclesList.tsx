import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getMyVehicles } from '@/lib/actions/vehicles';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { Link } from 'react-router-dom';
import { Plus, Car } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { resolveVehiclePhotos } from '@/lib/actions/vehicles';

export default function VehiclesListPage() {
  const { user } = useAuth();

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['vehicules', user?.id],
    queryFn: () => getMyVehicles(user!.id),
    enabled: !!user,
  });

  const signedVehiclesQuery = useQuery({
    queryKey: ['vehicules-signed-photos', user?.id, vehicles?.map((vehicle: any) => vehicle.id).join(',')],
    queryFn: async () => resolveVehiclePhotos(vehicles ?? []),
    enabled: !!user && !!vehicles && vehicles.length > 0,
    initialData: vehicles,
  });

  const displayVehicles = signedVehiclesQuery.data ?? vehicles ?? [];

  if (isLoading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-sm text-destructive">Erreur : {(error as Error).message}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 text-sm border border-border rounded-md hover:bg-secondary transition-colors">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            Mes Véhicules
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {vehicles?.length ?? 0} véhicule{(vehicles?.length ?? 0) !== 1 ? 's' : ''} enregistré{(vehicles?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/dashboard/vehicles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Link>
      </div>

      {/* Content */}
      {vehicles && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
             {displayVehicles.map((v: any, i: number) => (
            <VehicleCard key={v.id} vehicle={v} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Car className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-foreground mb-1">
            Aucun véhicule
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs">
            Ajoutez votre premier véhicule pour construire son passeport numérique.
          </p>
          <Link
            to="/dashboard/vehicles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter mon premier véhicule
          </Link>
        </div>
      )}
    </div>
  );
}
