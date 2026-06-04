import { Car, Gauge, Calendar, ChevronRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';
import { computeHealthScore, type HealthScore } from '@/lib/utils/health';
import { HealthBadge } from '@/components/vehicles/HealthBadge';
import { cn } from '@/lib/utils';

type VehicleWithAlertes = Tables<'vehicules'> & {
  alertes?: Array<{
    id: string;
    type_alerte: string;
    niveau_urgence: string | null;
    km_declencheur: number | null;
    est_resolue: boolean | null;
  }>;
  interventions?: { date_intervention: string | null; type_service: string }[];
};

interface VehicleCardProps {
  vehicle: VehicleWithAlertes;
  index?: number;
}

export function VehicleCard({ vehicle, index = 0 }: VehicleCardProps) {
  const lastIntervention = vehicle.interventions?.[0];
  const healthScore = computeHealthScore(
    vehicle.alertes ?? [],
    vehicle.kilometrage_actuel ?? 0
  );

  return (
    <Link
      to={`/dashboard/vehicles/${vehicle.id}`}
      className={cn(
        'group block border border-border rounded-lg bg-card transition-all duration-200 hover:border-primary/30 active:scale-[0.98] overflow-hidden animate-fade-up',
        `stagger-${Math.min(index + 1, 5)}`
      )}
    >
      {/* Photo zone */}
      <div className="relative h-36 bg-muted/30 flex items-center justify-center overflow-hidden">
        {vehicle.photo_vehicule_url ? (
          <img
            src={vehicle.photo_vehicule_url}
            alt={`${vehicle.marque} ${vehicle.modele}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
            <Car className="w-10 h-10" />
            <span className="text-[10px] font-mono uppercase tracking-wider">
              {vehicle.marque} {vehicle.modele}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <HealthBadge score={healthScore} />
        </div>
      </div>

      {/* Info zone */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
            {vehicle.marque} {vehicle.modele}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {vehicle.annee && `${vehicle.annee} · `}{vehicle.plaque_immatriculation}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Santé</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {healthScore.score}<span className="text-xs text-muted-foreground">%</span>
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Kilométrage</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {(vehicle.kilometrage_actuel ?? 0).toLocaleString('fr-FR')}
              <span className="text-xs text-muted-foreground ml-0.5">km</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            Voir le passeport
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}