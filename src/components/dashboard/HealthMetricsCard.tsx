import { cn } from '@/lib/utils';
import { Vehicule } from '@/hooks/useOwnerVehicles';
import { AlertTriangle } from 'lucide-react';

function getHealthColor(score: number) {
  if (score >= 70) return { stroke: 'hsl(142 71% 45%)', class: 'text-success' };
  if (score >= 40) return { stroke: 'hsl(38 92% 50%)', class: 'text-accent' };
  return { stroke: 'hsl(0 84% 60%)', class: 'text-destructive' };
}

interface Props {
  vehicle: Vehicule;
}

export function HealthMetricsCard({ vehicle }: Props) {
  const score = vehicle.score_sante ?? 100;
  const km = vehicle.kilometrage_actuel ?? 0;
  const nextServiceKm = vehicle.prochain_entretien_km;
  const delta = nextServiceKm ? nextServiceKm - km : null;
  const showAlert = delta !== null && delta < 1500;
  const health = getHealthColor(score);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 shadow-[0_0_30px_rgba(30,90,180,0.15)] animate-fade-up">
      <div className="flex items-center gap-6">
        {/* Health gauge */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="8"
            />
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              stroke={health.stroke}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 64 64)"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('font-display text-3xl font-bold', health.class)}>
              {score}
            </span>
            <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
              Santé
            </span>
          </div>
        </div>

        {/* Odometer */}
        <div className="flex-1 min-w-0">
          <p className="text-muted-foreground text-xs font-display uppercase tracking-widest mb-1">
            Kilométrage
          </p>
          <p className="font-mono text-4xl sm:text-5xl font-bold text-foreground leading-none">
            {km.toLocaleString('fr-FR')}
            <span className="text-lg font-normal text-muted-foreground ml-1">km</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {vehicle.marque} {vehicle.modele} {vehicle.annee ? `· ${vehicle.annee}` : ''}
          </p>
        </div>
      </div>

      {/* Alert strip */}
      {showAlert && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-accent/10 border-l-4 border-accent px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="text-sm text-accent font-medium">
            Prochaine vidange dans <span className="font-mono font-bold">{delta!.toLocaleString('fr-FR')}</span> km
          </p>
        </div>
      )}
    </div>
  );
}
