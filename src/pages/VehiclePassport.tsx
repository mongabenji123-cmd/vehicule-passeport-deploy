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
import { ArrowLeft, Car, Pencil, Gauge, Shield, Wrench, Calendar, CheckCircle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { lazy, Suspense } from 'react';
import { SEO } from '@/components/seo/SEO';
import { resolveVehiclePhotoUrl } from '@/lib/actions/vehicles';
const PDFDownloadButton = lazy(() => import('@/components/pdf/PDFDownloadButton').then(m => ({ default: m.PDFDownloadButton })));

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

  const { data: vehicle, isLoading, isError, error } = useQuery({
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

  const { data: signedPhotoUrl } = useQuery({
    queryKey: ['vehicule-photo', vehicle?.id, vehicle?.photo_vehicule_url],
    queryFn: async () => resolveVehiclePhotoUrl(vehicle?.photo_vehicule_url ?? null),
    enabled: !!vehicle?.photo_vehicule_url,
    initialData: vehicle?.photo_vehicule_url ?? null,
  });

  const queryInterventions: Intervention[] = (vehicle?.interventions ?? [])
    .sort((a: any, b: any) => new Date(b.date_intervention).getTime() - new Date(a.date_intervention).getTime());

  const allInterventions = [
    ...realtimeInterventions.filter(ri => !queryInterventions.some(i => i.id === ri.id)),
    ...queryInterventions,
  ].sort((a, b) => new Date(b.date_intervention!).getTime() - new Date(a.date_intervention!).getTime());

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`vehicule-passport-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'interventions', filter: `vehicule_id=eq.${id}` }, async (payload) => {
        const { data } = await supabase.from('interventions').select('*, garages:garage_id(id, nom_garage, commune, est_certifie)').eq('id', payload.new.id).single();
        if (data) {
          setRealtimeInterventions(prev => [data as Intervention, ...prev]);
          toast.info('⚡ Nouvelle intervention ajoutée !');
          queryClient.invalidateQueries({ queryKey: ['vehicules'] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  const alertes = (vehicle as any)?.alertes ?? [];
  const healthScore = computeHealthScore(alertes, vehicle?.kilometrage_actuel ?? 0);
  const unresolvedAlertes = alertes.filter((a: any) => !a.est_resolue);
  const currentKm = vehicle?.kilometrage_actuel ?? 0;
  const derniereVidangeKm = vehicle?.derniere_vidange_km ?? 0;
  const prochainEntretienKm = vehicle?.prochain_entretien_km ?? (derniereVidangeKm + 15000);
  const isGarageOrAdmin = profile?.role === 'garage' || profile?.role === 'admin';

  if (isLoading) return <div className="space-y-4 animate-fade-in max-w-3xl"><Skeleton className="h-6 w-40" /></div>;
  if (isError || !vehicle) return <div>Véhicule introuvable</div>;

  return (
    <div className="animate-fade-in max-w-3xl space-y-6">
      <Link to="/dashboard/vehicles" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Retour aux véhicules
      </Link>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="relative w-full sm:w-40 h-36 bg-muted/30 flex items-center justify-center">
            {signedPhotoUrl ? <img src={signedPhotoUrl} className="w-full h-full object-cover" /> : <Car className="w-12 h-12 text-muted-foreground" />}
          </div>
          <div className="flex-1 p-5">
            <h1 className="font-display text-xl font-bold uppercase">{vehicle.marque} {vehicle.modele}</h1>
            <div className="flex items-center gap-2 mt-4">
              <Gauge className="w-4 h-4 text-primary" />
              <span className="font-mono text-lg font-semibold">{currentKm.toLocaleString('fr-FR')} km</span>
            </div>
          </div>
        </div>
      </div>

      <VehicleMileageCard vehicle={vehicle} lastMileage={currentKm} onSave={handleSaveMileage} />

      <div className="border border-border rounded-lg p-5 bg-card">
        <h2 className="font-display text-xs font-semibold uppercase flex items-center gap-2 mb-5"><Shield className="w-3.5 h-3.5" /> Jauges & Statuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <KilometrageProgress label="Prochaine vidange" currentKm={currentKm} lastServiceKm={derniereVidangeKm} nextServiceKm={prochainEntretienKm} />
          <KilometrageProgress label="Score de santé" currentKm={healthScore.score} lastServiceKm={0} nextServiceKm={100} />
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xs font-semibold uppercase flex items-center gap-2"><Wrench className="w-3.5 h-3.5" /> Historique</h2>
        </div>
        <InterventionTimeline interventions={allInterventions as Intervention[]} onAddClick={isGarageOrAdmin ? () => navigate(`/dashboard/interventions/new?vehicule=${id}`) : undefined} />
      </div>

      <EditVehicleDialog vehicle={vehicle} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}