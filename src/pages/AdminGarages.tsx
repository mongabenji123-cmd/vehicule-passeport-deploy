import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Building2, CheckCircle2, XCircle, Clock, MapPin, Phone } from 'lucide-react';

export default function AdminGaragesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: garages, isLoading } = useQuery({
    queryKey: ['admin-garages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, est_certifie }: { id: string; est_certifie: boolean }) => {
      const { error } = await supabase
        .from('garages')
        .update({ est_certifie })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { est_certifie }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-garages'] });
      toast.success(est_certifie ? 'Garage certifié avec succès' : 'Garage rejeté');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const pending = (garages ?? []).filter(g => !g.est_certifie);
  const certified = (garages ?? []).filter(g => g.est_certifie);

  return (
    <div className="animate-fade-in space-y-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Validation des Garages</h1>

      <section>
        <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-accent flex items-center gap-2 mb-4">
          <Clock className="w-3.5 h-3.5" />
          En attente ({pending.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">{[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
        ) : pending.length === 0 ? (
          <div className="border border-border rounded-lg bg-card p-8 text-center">
            <p className="text-muted-foreground text-sm">Aucun garage en attente de validation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((garage, i) => (
              <div key={garage.id} className={`border border-accent/30 rounded-lg p-4 bg-card animate-fade-up stagger-${(i % 5) + 1} flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">{garage.nom_garage}</p>
                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{garage.commune}</span>
                    {garage.telephone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{garage.telephone}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => updateMutation.mutate({ id: garage.id, est_certifie: true })} disabled={updateMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors active:scale-[0.97]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certifier
                  </button>
                  <button onClick={() => updateMutation.mutate({ id: garage.id, est_certifie: false })} disabled={updateMutation.isPending} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors active:scale-[0.97]">
                    <XCircle className="w-3.5 h-3.5" /> Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-success flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Certifiés ({certified.length})
        </h2>
        {certified.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun garage certifié</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certified.map(garage => (
              <div key={garage.id} className="border border-border rounded-lg p-4 bg-card flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{garage.nom_garage}</p>
                  <p className="text-xs text-muted-foreground">{garage.commune}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
