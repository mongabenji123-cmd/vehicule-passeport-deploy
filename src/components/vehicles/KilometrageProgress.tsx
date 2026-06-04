import { cn } from '@/lib/utils';

interface KilometrageProgressProps {
  label: string;
  currentKm: number;
  lastServiceKm: number;
  nextServiceKm: number;
}

export function KilometrageProgress({
  label,
  currentKm,
  lastServiceKm,
  nextServiceKm,
}: KilometrageProgressProps) {
  const total = nextServiceKm - lastServiceKm;
  const elapsed = Math.max(0, currentKm - lastServiceKm);
  const pct = total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
  const remaining = Math.max(0, nextServiceKm - currentKm);
  const overdue = Math.max(0, currentKm - nextServiceKm);

  const barColor =
    pct >= 100 ? 'bg-destructive'
    : pct >= 85 ? 'bg-accent'
    : pct >= 60 ? 'bg-primary'
    : 'bg-success';

  const statusLabel =
    pct >= 100 ? 'URGENT'
    : pct >= 85 ? 'BIENTÔT'
    : 'OK';

  const statusText =
    pct >= 100 ? 'text-destructive'
    : pct >= 85 ? 'text-accent'
    : 'text-success';

  return (
    <div className="space-y-2">
      {/* Titre + statut */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-display font-semibold uppercase tracking-wider text-[10px]', statusText)}>
          {statusLabel}
        </span>
      </div>

      {/* Barre */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${pct}%` }}
        />
        {pct >= 85 && (
          <div
            className={cn('absolute inset-0 rounded-full animate-pulse opacity-20', barColor)}
          />
        )}
      </div>

      {/* Labels bas */}
      <div className="flex justify-between text-[10px] font-mono text-muted-foreground/60">
        <span>{lastServiceKm.toLocaleString('fr-FR')} km</span>
        {overdue > 0 ? (
          <span className="text-destructive font-semibold">
            {overdue.toLocaleString('fr-FR')} km dépassés
          </span>
        ) : (
          <span>{remaining.toLocaleString('fr-FR')} km restants</span>
        )}
        <span>{nextServiceKm.toLocaleString('fr-FR')} km</span>
      </div>
    </div>
  );
}
