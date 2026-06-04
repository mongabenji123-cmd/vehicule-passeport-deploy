import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Wrench, DollarSign, Users } from 'lucide-react';

export function GarageDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ interventions: 0, revenue: 0, clients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { data: interventions } = await supabase
        .from('interventions')
        .select('montant_facture, vehicule_id');

      const revenue = (interventions || []).reduce((s, i) => s + Number(i.montant_facture || 0), 0);
      const uniqueVehicles = new Set((interventions || []).map(i => i.vehicule_id));

      setStats({
        interventions: (interventions || []).length,
        revenue,
        clients: uniqueVehicles.size,
      });
      setLoading(false);
    };
    fetchStats();
  }, [user]);

  const kpis = [
    { label: 'Interventions', value: stats.interventions, icon: Wrench, color: 'text-primary' },
    { label: 'Chiffre d\'affaires', value: `${stats.revenue.toLocaleString('fr-FR')} $`, icon: DollarSign, color: 'text-success', mono: true },
    { label: 'Clients', value: stats.clients, icon: Users, color: 'text-accent' },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Tableau de bord garage</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`bg-card border border-border rounded-lg p-5 card-glow animate-fade-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xs uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className={`text-3xl font-bold ${kpi.color} ${kpi.mono ? 'font-mono' : ''}`}>{loading ? '—' : kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
