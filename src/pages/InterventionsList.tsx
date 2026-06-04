import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Plus, Wrench } from 'lucide-react';
import { InterventionTimeline } from '@/components/vehicles/InterventionTimeline';
import { Tables } from '@/integrations/supabase/types';

type Intervention = Tables<'interventions'> & {
  garages?: { id: string; nom_garage: string; commune: string | null } | null;
  vehicules?: { marque: string; modele: string; plaque_immatriculation: string } | null;
};

export default function InterventionsListPage() {
  const { user } = useAuth();

  const { data: interventions, isLoading } = useQuery({
    queryKey: ['my-interventions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select(`*, garages:garage_id(id, nom_garage, commune), vehicules:vehicule_id(marque, modele, plaque_immatriculation)`)
        .order('date_intervention', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Intervention[];
    },
    enabled: !!user,
  });

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            Mes Interventions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {interventions?.length ?? 0} intervention{(interventions?.length ?? 0) > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/dashboard/interventions/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.97]"
        >
          <Plus className="w-4 h-4" />
          Saisir
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : interventions && interventions.length > 0 ? (
        <InterventionTimeline interventions={interventions} />
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-lg">
          <Wrench className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">Aucune intervention</p>
          <Link
            to="/dashboard/interventions/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Saisir une intervention
          </Link>
        </div>
      )}
    </div>
  );
}
