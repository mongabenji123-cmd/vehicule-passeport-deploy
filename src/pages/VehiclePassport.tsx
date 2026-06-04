import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { computeHealthScore } from '@/lib/utils/health';
import { HealthBadge } from '@/components/vehicles/HealthBadge';
import { InterventionTimeline } from '@/components/vehicles/InterventionTimeline';
import { KilometrageProgress } from '@/components/vehicles/KilometrageProgress';
import { EditVehicleDialog } from '@/components/vehicles/EditVehicleDialog';
import { VehicleMileageCard } from '@/components/vehicles/VehicleMileageCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Car, Gauge, Shield, Wrench } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { lazy } from 'react';

type Intervention = Tables<'interventions'> & {
  garages?: { id: string; nom_garage: string; commune: string | null; est_certifie?: boolean | null } | null;
};

export default function VehiclePassportPage() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [realtimeInterventions, setRealtimeInterventions] = useState<Intervention[]>([]);

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicule', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicules')
        .select(`
          *,
          interventions(
            *,
            garages:garage_id(id, nom_garage, commune, est_certifie)
          ),
          alertes(*)
        `)
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const handleSaveMileage = async (mileage: number) => {
    if (!id) return;
    const { error } = await supabase
      .from('vehicules')
      .update({ kilometrage_actuel: mileage })
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success("Kilométrage mis à jour !");
      queryClient.invalidateQueries({ queryKey: ['vehicule', id] });
    }
  };

  // ... (le reste de votre logique reste inchangé)

  if (isLoading) return <div className="space-y-4 animate-fade-in max-w-3xl"><Skeleton className="h-6 w-40" /></div>;
  if (isError || !vehicle) return <div>Véhicule introuvable</div>;

  return (
    <div className="animate-fade-in max-w-3xl space-y-6">
      <Link to="/dashboard/vehicles" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Retour aux véhicules
      </Link>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-5">
            <h1 className="font-display text-xl font-bold uppercase">{vehicle.marque} {vehicle.modele}</h1>
          </div>
        </div>
      </div>

      <VehicleMileageCard vehicle={vehicle} lastMileage={vehicle.kilometrage_actuel ?? 0} onSave={handleSaveMileage} />

      {/* Reste de votre JSX ... */}
    </div>
  );
}