import { useState } from 'react';
import { Wrench, ChevronDown, Camera } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';

type Intervention = Tables<'interventions'> & {
  garages?: { id: string; nom_garage: string; commune: string | null; est_certifie?: boolean | null } | null;
  // alias support for joined garage
  garage?: { id: string; nom_garage: string; commune: string | null; est_certifie?: boolean | null } | null;
};

const TYPE_ICONS: Record<string, string> = {
  'Vidange': '🛢️',
  'Freins': '🔴',
  'Pneus': '⚫',
  'Courroie distribution': '⚙️',
  'Contrôle technique': '📋',
  'Climatisation': '❄️',
  'Carrosserie': '🔧',
};

interface InterventionTimelineProps {
  interventions: Intervention[];
  onAddClick?: () => void;
}

export function InterventionTimeline({ interventions, onAddClick }: InterventionTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (interventions.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center">
          <Wrench className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-display font-semibold uppercase tracking-wide text-muted-foreground">
            Aucune intervention enregistrée
          </p>
          <p className="text-xs text-muted-foreground/60">
            L'historique apparaîtra ici après la première intervention
          </p>
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="text-xs text-primary hover:underline mt-1"
          >
            + Ajouter une intervention manuelle
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-primary/20" />

      <div className="space-y-0">
        {interventions.map((item) => {
          const isExpanded = expandedId === item.id;
          const garage = item.garages ?? item.garage;

          return (
            <div key={item.id} className="relative pl-10 pb-4">
              {/* Dot */}
              <div className="absolute left-[9px] top-4 w-[13px] h-[13px] rounded-full border-2 border-primary bg-background z-10" />

              {/* Card */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={cn(
                  'w-full text-left rounded-xl p-4 transition-all duration-200 border',
                  isExpanded
                    ? 'bg-elevated border-primary/25'
                    : 'bg-card border-border hover:border-primary/20'
                )}
              >
                {/* Main row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">
                      {TYPE_ICONS[item.type_service] ?? '🔩'}
                    </span>
                    <div>
                      <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                        {item.type_service}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono">
                          {item.date_intervention
                            ? new Date(item.date_intervention).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : '—'}
                        </span>
                        {item.kilometrage_au_moment_rdv != null && (
                          <>
                            <span>·</span>
                            <span className="font-mono">
                              {item.kilometrage_au_moment_rdv.toLocaleString('fr-FR')} km
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.montant_facture != null && (
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {Number(item.montant_facture).toLocaleString('fr-FR')} $
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-border space-y-3">
                    {garage && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>
                          {garage.nom_garage}
                          {garage.commune && ` — ${garage.commune}`}
                        </span>
                        {garage.est_certifie && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20">
                            ✓ Certifié
                          </span>
                        )}
                      </div>
                    )}

                    {item.description_travaux && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.description_travaux}
                      </p>
                    )}

                    {item.photos_url && item.photos_url.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {item.photos_url.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Photo ${i + 1}`}
                              className="w-16 h-16 rounded-lg object-cover border border-border hover:border-primary/30 transition-colors"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
