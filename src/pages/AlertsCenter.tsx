import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CheckCircle2, Car, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────
type AlertWithVehicle = {
  id: string;
  type: string;
  kilometrage_seuil: number | null;
  date_seuil: string | null;
  is_resolved: boolean;
  created_at: string;
  vehicle: {
    id: string;
    marque: string;
    modele: string;
    immatriculation: string;
    kilometrage_actuel: number | null;
  };
};

type AlertTab = 'urgent' | 'aVenir' | 'resolues';

const ALERT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  vidange: { label: 'Vidange', icon: '🛢️', color: '#F59E0B' },
  controle_technique: { label: 'Contrôle technique', icon: '📋', color: '#3B82F6' },
  assurance: { label: 'Assurance', icon: '🛡️', color: '#10B981' },
};

// ── Urgency calculation ──────────────────────────────────────
function getAlertUrgency(alert: AlertWithVehicle) {
  const today = new Date();

  if (alert.kilometrage_seuil) {
    const km = alert.vehicle.kilometrage_actuel ?? 0;
    const remaining = alert.kilometrage_seuil - km;

    if (remaining <= 0) {
      return { isUrgent: true, isWarning: false, label: 'URGENT', color: '#EF4444', detail: `${Math.abs(remaining).toLocaleString('fr-FR')} km dépassés` };
    }
    if (remaining <= 1000) {
      return { isUrgent: false, isWarning: true, label: 'BIENTÔT', color: '#F59E0B', detail: `${remaining.toLocaleString('fr-FR')} km restants` };
    }
    return { isUrgent: false, isWarning: false, label: 'OK', color: '#10B981', detail: `${remaining.toLocaleString('fr-FR')} km restants` };
  }

  if (alert.date_seuil) {
    const seuil = new Date(alert.date_seuil);
    const daysLeft = Math.floor((seuil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { isUrgent: true, isWarning: false, label: 'EXPIRÉ', color: '#EF4444', detail: `Dépassé de ${Math.abs(daysLeft)} jours` };
    }
    if (daysLeft <= 30) {
      return { isUrgent: false, isWarning: true, label: 'BIENTÔT', color: '#F59E0B', detail: `Dans ${daysLeft} jours` };
    }
    return { isUrgent: false, isWarning: false, label: 'OK', color: '#10B981', detail: `Dans ${daysLeft} jours` };
  }

  return { isUrgent: false, isWarning: false, label: 'OK', color: '#10B981', detail: '—' };
}

// ── Query ────────────────────────────────────────────────────
async function fetchMyAlerts(userId: string): Promise<AlertWithVehicle[]> {
  // First get user's vehicle ids
  const { data: vehicleIds } = await supabase
    .from('vehicles')
    .select('id')
    .eq('owner_id', userId);

  if (!vehicleIds?.length) return [];

  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      vehicle:vehicles(id, marque, modele, immatriculation, kilometrage_actuel)
    `)
    .in('vehicle_id', vehicleIds.map(v => v.id))
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AlertWithVehicle[];
}

export default function AlertsCenterPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AlertTab>('urgent');

  const { data: allAlerts = [], isLoading } = useQuery({
    queryKey: ['alerts', user?.id],
    queryFn: () => fetchMyAlerts(user!.id),
    enabled: !!user,
  });

  const { mutate: resolve, isPending: isResolving } = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase.from('alerts').update({ is_resolved: true }).eq('id', alertId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      toast.success('Alerte résolue');
    },
  });

  const { mutate: reopen } = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase.from('alerts').update({ is_resolved: false }).eq('id', alertId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert-count'] });
      toast.success('Alerte rouverte');
    },
  });

  // Categorize
  const unresolved = allAlerts.filter(a => !a.is_resolved);
  const resolved = allAlerts.filter(a => a.is_resolved);
  const urgentAlerts = unresolved.filter(a => getAlertUrgency(a).isUrgent);
  const warningAlerts = unresolved.filter(a => getAlertUrgency(a).isWarning);

  const tabs: { id: AlertTab; label: string; count: number; color: string }[] = [
    { id: 'urgent', label: 'Urgent', count: urgentAlerts.length, color: 'hsl(var(--destructive))' },
    { id: 'aVenir', label: 'À venir', count: warningAlerts.length, color: 'hsl(var(--accent))' },
    { id: 'resolues', label: 'Résolues', count: resolved.length, color: 'hsl(var(--success, 142 76% 36%))' },
  ];

  const currentAlerts =
    activeTab === 'urgent' ? urgentAlerts :
    activeTab === 'aVenir' ? warningAlerts :
    resolved;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-28 rounded-xl" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          Centre d'alertes
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {urgentAlerts.length > 0
            ? `${urgentAlerts.length} alerte${urgentAlerts.length > 1 ? 's' : ''} urgente${urgentAlerts.length > 1 ? 's' : ''} à traiter`
            : 'Tous vos véhicules sont à jour'}
        </p>
      </div>

      {/* No alerts at all */}
      {allAlerts.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </div>
          <h2 className="font-display text-lg font-bold text-foreground mb-1">Aucune alerte</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Tous vos véhicules sont à jour. Les alertes apparaîtront ici automatiquement.
          </p>
        </div>
      )}

      {allAlerts.length > 0 && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border',
                  activeTab === tab.id
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/20'
                )}
                style={activeTab === tab.id ? {
                  borderColor: tab.id === 'urgent' ? 'rgba(239,68,68,0.3)' : tab.id === 'aVenir' ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)',
                  background: tab.id === 'urgent' ? 'rgba(239,68,68,0.08)' : tab.id === 'aVenir' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                  color: tab.id === 'urgent' ? '#EF4444' : tab.id === 'aVenir' ? '#F59E0B' : '#10B981',
                } : {}}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-current/10">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Alert list */}
          {currentAlerts.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-sm text-muted-foreground">
                {activeTab === 'urgent' ? 'Aucune alerte urgente 🎉' :
                 activeTab === 'aVenir' ? 'Aucune alerte à venir' :
                 'Aucune alerte résolue'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentAlerts.map(alert => {
                const urgency = getAlertUrgency(alert);
                const config = ALERT_CONFIG[alert.type] ?? { label: alert.type, icon: '⚠️', color: '#94A3B8' };
                const isResolved = alert.is_resolved;

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      'border rounded-xl p-4 transition-all bg-card',
                      isResolved ? 'border-border opacity-70' :
                      urgency.isUrgent ? 'border-destructive/30' :
                      urgency.isWarning ? 'border-yellow-500/30' : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Icon */}
                        <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>

                        <div className="min-w-0">
                          {/* Title + urgency badge */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-semibold uppercase tracking-wide text-foreground">
                              {config.label}
                            </span>
                            {!isResolved && (
                              <span
                                className={cn(
                                  'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full',
                                  urgency.isUrgent && 'animate-pulse'
                                )}
                                style={{ background: `${urgency.color}20`, color: urgency.color }}
                              >
                                {urgency.label}
                              </span>
                            )}
                          </div>

                          {/* Vehicle link */}
                          <Link
                            to={`/dashboard/vehicles/${alert.vehicle.id}`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mt-0.5"
                          >
                            <Car className="w-3 h-3" />
                            {alert.vehicle.marque} {alert.vehicle.modele} · <span className="font-mono">{alert.vehicle.immatriculation}</span>
                          </Link>

                          {/* Detail */}
                          <p className="text-xs text-muted-foreground mt-1">
                            {urgency.detail}
                            {alert.date_seuil && (
                              <> · {new Date(alert.date_seuil).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                            )}
                            {alert.kilometrage_seuil && (
                              <> · seuil : {alert.kilometrage_seuil.toLocaleString('fr-FR')} km</>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="flex-shrink-0">
                        {!isResolved ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resolve(alert.id)}
                            disabled={isResolving}
                            className="text-xs gap-1.5 border-success/25 text-success hover:bg-success/10 hover:text-success"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Résolu
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reopen(alert.id)}
                            className="text-xs gap-1.5 text-muted-foreground"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Rouvrir
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
