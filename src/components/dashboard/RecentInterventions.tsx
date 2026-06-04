import { useRecentInterventions } from '@/hooks/useRecentInterventions';
import { ChevronRight, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const serviceColors: Record<string, string> = {
  vidange: 'bg-primary',
  pneus: 'bg-accent',
  freins: 'bg-destructive',
  batterie: 'bg-success',
};

function getDotColor(type: string) {
  const key = type.toLowerCase();
  for (const [k, v] of Object.entries(serviceColors)) {
    if (key.includes(k)) return v;
  }
  return 'bg-muted-foreground';
}

interface Props {
  vehicleId: string | null;
}

export function RecentInterventions({ vehicleId }: Props) {
  const { data: interventions, isLoading } = useRecentInterventions(vehicleId);

  return (
    <div className="animate-fade-up stagger-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Derniers entretiens
        </h2>
        {vehicleId && (
          <Link
            to={`/dashboard/vehicles/${vehicleId}/interventions`}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Voir tout <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <Skeleton key={i} className="h-14 rounded-2xl" />
          ))}
        </div>
      ) : !interventions || interventions.length === 0 ? (
        <div className="flex flex-col items-center py-10 border border-dashed border-border rounded-2xl">
          <Wrench className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Aucun entretien enregistré</p>
        </div>
      ) : (
        <div className="space-y-2">
          {interventions.map((intv) => (
            <div
              key={intv.id}
              className="flex items-center gap-3 bg-card border border-white/5 rounded-2xl px-4 py-3"
            >
              <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', getDotColor(intv.type_service))} />
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-semibold text-foreground truncate">
                  {intv.type_service}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {intv.technicien_nom ?? 'Garage'}
                </p>
              </div>
              <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                {intv.date_intervention
                  ? format(new Date(intv.date_intervention), 'dd MMM yyyy', { locale: fr })
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
