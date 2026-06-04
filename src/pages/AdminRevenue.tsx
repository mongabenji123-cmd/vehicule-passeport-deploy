import { useEffect } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, DollarSign, TrendingUp, CreditCard, BarChart3, Users, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ChartXAxis = XAxis as unknown as ComponentType<any>;
const ChartYAxis = YAxis as unknown as ComponentType<any>;
const ChartTooltip = Tooltip as unknown as ComponentType<any>;
const ChartBar = Bar as unknown as ComponentType<any>;
const ChartPie = Pie as unknown as ComponentType<any>;

interface PdfRecord {
  id: string;
  prix_usd: number | null;
  price_group: string | null;
  statut_paiement: string | null;
  payment_method: string | null;
  created_at: string | null;
  genere_at: string | null;
}

interface OrderRecord {
  id: number;
  total_price: number | null;
  platform_commission: number | null;
  status: string | null;
  payment_mode: string | null;
  created_at: string | null;
}

async function fetchRevenueData() {
  const [pdfRes, ordersRes] = await Promise.all([
    supabase.from('rapports_pdf').select('id, prix_usd, price_group, statut_paiement, payment_method, created_at, genere_at'),
    supabase.from('spare_parts_orders').select('id, total_price, platform_commission, status, payment_mode, created_at'),
  ]);
  return {
    pdfs: (pdfRes.data ?? []) as PdfRecord[],
    orders: (ordersRes.data ?? []) as OrderRecord[],
  };
}

function computeMetrics(pdfs: PdfRecord[], orders: OrderRecord[]) {
  const paidPdfs = pdfs.filter(p => p.statut_paiement === 'paid');
  const pendingPdfs = pdfs.filter(p => p.statut_paiement === 'pending');
  const totalPdfRevenue = paidPdfs.reduce((s, p) => s + (p.prix_usd ?? 0), 0);
  const conversionRate = pdfs.length > 0 ? (paidPdfs.length / pdfs.length) * 100 : 0;

  // A/B price group analysis
  const groups = ['A', 'B', 'C'];
  const abData = groups.map(g => {
    const all = pdfs.filter(p => p.price_group === g);
    const paid = all.filter(p => p.statut_paiement === 'paid');
    const price = g === 'A' ? 2 : g === 'B' ? 5 : 10;
    return {
      group: `Groupe ${g} ($${price})`,
      total: all.length,
      paid: paid.length,
      revenue: paid.reduce((s, p) => s + (p.prix_usd ?? 0), 0),
      conversion: all.length > 0 ? Math.round((paid.length / all.length) * 100) : 0,
    };
  });

  // Payment method breakdown
  const methodMap: Record<string, number> = {};
  paidPdfs.forEach(p => {
    const m = p.payment_method ?? 'inconnu';
    methodMap[m] = (methodMap[m] || 0) + (p.prix_usd ?? 0);
  });
  const paymentMethods = Object.entries(methodMap).map(([name, value]) => ({ name: formatMethod(name), value }));

  // Marketplace commissions
  const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
  const marketplaceCommission = completedOrders.reduce((s, o) => s + (o.platform_commission ?? 0), 0);
  const marketplaceVolume = completedOrders.reduce((s, o) => s + (o.total_price ?? 0), 0);

  // Monthly revenue (MRR tracking)
  const monthlyData: Record<string, { pdf: number; marketplace: number }> = {};
  paidPdfs.forEach(p => {
    const month = (p.genere_at ?? p.created_at ?? '').slice(0, 7);
    if (!month) return;
    if (!monthlyData[month]) monthlyData[month] = { pdf: 0, marketplace: 0 };
    monthlyData[month].pdf += p.prix_usd ?? 0;
  });
  completedOrders.forEach(o => {
    const month = (o.created_at ?? '').slice(0, 7);
    if (!month) return;
    if (!monthlyData[month]) monthlyData[month] = { pdf: 0, marketplace: 0 };
    monthlyData[month].marketplace += o.platform_commission ?? 0;
  });
  const mrrChart = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      pdf: data.pdf,
      marketplace: data.marketplace,
      total: data.pdf + data.marketplace,
    }));

  const totalRevenue = totalPdfRevenue + marketplaceCommission;

  return {
    totalRevenue, totalPdfRevenue, marketplaceCommission, marketplaceVolume,
    paidCount: paidPdfs.length, pendingCount: pendingPdfs.length,
    conversionRate, abData, paymentMethods, mrrChart,
    totalOrders: orders.length,
  };
}

function formatMethod(m: string) {
  const map: Record<string, string> = {
    mpesa: 'M-Pesa', airtel_money: 'Airtel Money', orange_money: 'Orange Money', visa: 'Visa',
  };
  return map[m] ?? m;
}

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function AdminRevenue() {
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useAuth();

  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: fetchRevenueData,
    enabled: profile?.role === 'admin',
  });

  if (profileLoading || !profile) return <Skeleton className="h-8 w-48 mx-auto mt-20" />;
  if (profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <Shield className="w-8 h-8 text-destructive mb-4" />
        <p className="text-sm text-muted-foreground">Accès réservé aux administrateurs.</p>
      </div>
    );
  }

  const metrics = data ? computeMetrics(data.pdfs, data.orders) : null;

  const kpis = [
    { label: 'Revenu total', value: metrics ? `$${metrics.totalRevenue.toFixed(2)}` : null, icon: DollarSign, color: 'text-success' },
    { label: 'PDF vendus', value: metrics?.paidCount, icon: TrendingUp, color: 'text-primary' },
    { label: 'Taux conversion', value: metrics ? `${metrics.conversionRate.toFixed(1)}%` : null, icon: Percent, color: 'text-accent' },
    { label: 'Commissions MKP', value: metrics ? `$${metrics.marketplaceCommission.toFixed(2)}` : null, icon: CreditCard, color: 'text-chart-4' },
  ];

  return (
    <div className="animate-fade-in space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Revenus & MRR</h1>
        <p className="text-sm text-muted-foreground mt-1">Suivi des revenus dès le premier paiement</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={cn('bg-card border border-border rounded-lg p-4 animate-fade-up', `stagger-${i + 1}`)}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
              <kpi.icon className={cn('w-4 h-4', kpi.color)} />
            </div>
            {isLoading ? <Skeleton className="h-8 w-16" /> : (
              <p className={cn('text-2xl font-bold font-mono', kpi.color)}>{kpi.value ?? '—'}</p>
            )}
          </div>
        ))}
      </div>

      {/* MRR Chart */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Revenus mensuels (MRR)
          </h2>
        </div>
        {isLoading ? <Skeleton className="h-48 w-full" /> : metrics && metrics.mrrChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={metrics.mrrChart}>
              <ChartXAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <ChartYAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `$${v}`} />
              <ChartTooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`$${v.toFixed(2)}`, '']}
              />
              <ChartBar dataKey="pdf" name="PDF" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <ChartBar dataKey="marketplace" name="Marketplace" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">Aucun revenu enregistré pour le moment</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A/B Test Results */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-4 h-4 text-accent" />
            <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Test A/B – Prix PDF
            </h2>
          </div>
          {isLoading ? <Skeleton className="h-32 w-full" /> : (
            <div className="space-y-3">
              {metrics?.abData.map(ab => (
                <div key={ab.group} className="p-3 rounded-lg border border-border bg-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">{ab.group}</span>
                    <span className="font-mono text-xs text-success">${ab.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{ab.total} tentatives</span>
                    <span>{ab.paid} payés</span>
                    <span className={cn('font-semibold', ab.conversion > 30 ? 'text-success' : ab.conversion > 15 ? 'text-accent' : 'text-destructive')}>
                      {ab.conversion}% conversion
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${ab.conversion}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-4 h-4 text-chart-4" />
            <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Méthodes de paiement
            </h2>
          </div>
          {isLoading ? <Skeleton className="h-32 w-full" /> : metrics && metrics.paymentMethods.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <ChartPie data={metrics.paymentMethods} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {metrics.paymentMethods.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </ChartPie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {metrics.paymentMethods.map((m, i) => (
                  <div key={m.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1 truncate">{m.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">${m.value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun paiement enregistré</p>
          )}
        </div>
      </div>
    </div>
  );
}
