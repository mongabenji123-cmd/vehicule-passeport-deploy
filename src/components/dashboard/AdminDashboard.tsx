import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Users, Car, Building2, Wrench, ShieldCheck, ArrowRight } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, vehicles: 0, garages: 0, interventions: 0 });
  const [pendingGarages, setPendingGarages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
     // @ts-ignore
    const [profilesRes, vehiculesRes, garagesRes, interventionsRes, pendingRes] = await Promise.all([
      // @ts-ignore
      supabase.from('auto_profiles').select('id', { count: 'exact', head: true }),
      // @ts-ignore
      supabase.from('auto_vehicules').select('id', { count: 'exact', head: true }),
      // @ts-ignore
      supabase.from('auto_garages').select('id', { count: 'exact', head: true }),
      // @ts-ignore
      supabase.from('auto_interventions').select('id', { count: 'exact', head: true }).eq('est_certifie', true),
      // @ts-ignore
      supabase.from('auto_garages').select('id, nom_garage, commune, created_at').eq('est_certifie', false)
    ]);
      setStats({
        users: profilesRes.count || 0,
        vehicles: vehiculesRes.count || 0,
        garages: garagesRes.count || 0,
        interventions: interventionsRes.count || 0,
      });
      setPendingGarages(pendingRes.data || []);
      setLoading(false);
    };
    fetchStats();}, []);

  const kpis = [
    { label: 'Utilisateurs', value: stats.users, icon: Users, color: 'text-primary' },
    { label: 'Véhicules', value: stats.vehicles, icon: Car, color: 'text-success' },
    { label: 'Garages certifiés', value: stats.garages, icon: Building2, color: 'text-accent' },
    { label: 'Interventions', value: stats.interventions, icon: Wrench, color: 'text-muted-foreground' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Administration</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`bg-card border border-border rounded-lg p-5 card-glow animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className={`text-3xl font-bold ${kpi.color} font-mono`}>{loading ? '—' : kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border rounded-lg bg-card p-5 animate-fade-up stagger-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Garages en attente
          </h2>
          <Link to="/dashboard/admin/garages" className="text-xs text-primary hover:underline flex items-center gap-1">
            Tout voir <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : pendingGarages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun garage en attente</p>
        ) : (
          <div className="space-y-2">
            {pendingGarages.map(g => (
              <div key={g.id} className="flex items-center gap-3 p-3 rounded-md border border-accent/20 bg-accent/5">
                <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{g.nom_garage}</p>
                  <p className="text-xs text-muted-foreground">{g.commune ?? '—'}</p>
                </div>
                <span className="text-mono text-[10px] text-muted-foreground">
                  {new Date(g.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
