import { Car, CheckCircle2, AlertTriangle } from 'lucide-react';

interface VehiclePassportMockProps {
  variant?: 'hero' | 'auth';
}

export function VehiclePassportMock({ variant = 'hero' }: VehiclePassportMockProps) {
  const isHero = variant === 'hero';

  return (
    <div
      className={`
        bg-card border border-border rounded-xl shadow-2xl shadow-primary/10
        animate-float select-none
        ${isHero ? 'p-6 w-full max-w-sm' : 'p-4 w-64 rotate-2'}
      `}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center ${isHero ? 'w-8 h-8' : 'w-6 h-6'}`}>
          <Car className={`text-primary ${isHero ? 'w-4 h-4' : 'w-3 h-3'}`} />
        </div>
        <span className={`font-display font-bold uppercase tracking-wider text-foreground ${isHero ? 'text-xs' : 'text-[10px]'}`}>
          Passeport Véhicule
        </span>
      </div>

      <div className="h-px bg-border mb-3" />

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className={`font-display font-bold uppercase tracking-wide text-foreground ${isHero ? 'text-sm' : 'text-xs'}`}>
            Peugeot 308 GTI
          </p>
          <p className={`text-muted-foreground font-mono ${isHero ? 'text-xs' : 'text-[10px]'}`}>
            AB-123-CD &bull; 2019
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-display uppercase tracking-wider px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot" />
          Bon état
        </span>
      </div>

      {/* Kilométrage */}
      <div className="mb-3">
        <p className={`text-muted-foreground ${isHero ? 'text-xs' : 'text-[10px]'}`}>Kilométrage actuel</p>
        <p className={`font-mono font-bold text-foreground ${isHero ? 'text-lg' : 'text-sm'}`}>87 432 km</p>
      </div>

      <div className="h-px bg-border mb-3" />

      <div className={`space-y-2.5 ${isHero ? 'text-xs' : 'text-[10px]'}`}>
        {[
          { label: 'Prochaine vidange', status: 'ok', pct: 72, color: 'hsl(var(--success))' },
          { label: 'Contrôle technique', status: 'warn', pct: 30, color: 'hsl(var(--accent))' },
          { label: 'Assurance', status: 'ok', pct: 85, color: 'hsl(var(--success))' },
        ].map(item => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground">{item.label}</span>
              <span className={`inline-flex items-center gap-1 ${item.status === 'ok' ? 'text-success' : 'text-accent'}`}>
                {item.status === 'ok' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3 pulse-dot" />}
                {item.status === 'ok' ? '✓ OK' : '⚠ Attention'}
              </span>
            </div>
            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.pct}%`, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
