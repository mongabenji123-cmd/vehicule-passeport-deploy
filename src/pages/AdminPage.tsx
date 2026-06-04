import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Users, Car, Building2, Wrench, ShieldCheck, Clock,
  CheckCircle2, XCircle, Shield, DollarSign, Search,
  MapPin, Phone, ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Helpers ──────────────────────────────────────────────────
const roleLabels: Record<string, string> = { owner: 'Propriétaire', garage: 'Garage', admin: 'Admin', seller: 'Vendeur' };
const roleColors: Record<string, string> = {
  owner: 'bg-primary/10 text-primary',
  garage: 'bg-accent/10 text-accent',
  admin: 'bg-success/10 text-success',
  seller: 'bg-chart-4/10 text-chart-4',
};
const PAGE_SIZE = 20;

// ── Queries ──────────────────────────────────────────────────
async function fetchAdminStats() {
  const [profiles, vehicules, interventions, garagesCert, garagesPending] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('vehicules').select('id', { count: 'exact', head: true }),
    supabase.from('interventions').select('id', { count: 'exact', head: true }),
    supabase.from('garages').select('id', { count: 'exact', head: true }).eq('est_certifie', true),
    supabase.from('garages').select('id', { count: 'exact', head: true }).eq('est_certifie', false),
  ]);
  return {
    totalUsers: profiles.count ?? 0,
    totalVehicles: vehicules.count ?? 0,
    totalInterventions: interventions.count ?? 0,
    totalGarages: garagesCert.count ?? 0,
    pendingGarages: garagesPending.count ?? 0,
  };
}

async function fetchAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchAllGarages() {
  const { data, error } = await supabase
    .from('garages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

async function fetchGarageDirectory() {
  const { data, error } = await supabase
    .from('garages_public_directory')
    .select('*')
    .order('nom_garage');
  if (error) throw error;
  return data ?? [];
}

async function fetchAllInterventions() {
  const { data, error } = await supabase
    .from('interventions')
    .select('*, vehicules(marque, modele, plaque_immatriculation), garages(nom_garage)')
    .order('date_intervention', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ── Tabs ─────────────────────────────────────────────────────
type TabKey = 'overview' | 'users' | 'garages' | 'interventions';
const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: 'overview', label: 'Vue globale', icon: ShieldCheck },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'garages', label: 'Garages', icon: Building2 },
  { key: 'interventions', label: 'Interventions', icon: Wrench },
];

// ── Page ─────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, loading: profileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [activeTab, search]);

  useEffect(() => {
    if (!profileLoading && profile && profile.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, profileLoading, navigate]);

  const isAdmin = profile?.role === 'admin';

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    enabled: isAdmin,
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: fetchAllUsers,
    enabled: isAdmin,
  });

  const { data: allGarages = [], isLoading: garagesLoading } = useQuery({
    queryKey: ['admin-all-garages'],
    queryFn: fetchAllGarages,
    enabled: isAdmin,
  });

  const { data: publicGarages = [], isLoading: publicGaragesLoading } = useQuery({
    queryKey: ['garage-directory'],
    queryFn: fetchGarageDirectory,
    enabled: isAdmin,
  });

  const { data: allInterventions = [], isLoading: interventionsLoading } = useQuery({
    queryKey: ['admin-all-interventions'],
    queryFn: fetchAllInterventions,
    enabled: isAdmin,
  });

  const { mutate: certify, isPending: isCertifying } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('garages').update({ est_certifie: true }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-garages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Garage certifié avec succès');
    },
    onError: () => toast.error('Erreur lors de la certification'),
  });

  const { mutate: reject, isPending: isRejecting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('garages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-garages'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Garage supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  if (profileLoading || !profile) {
    return <div className="flex items-center justify-center py-20"><Skeleton className="h-8 w-48" /></div>;
  }

  if (profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide mb-1">Accès refusé</h2>
        <p className="text-sm text-muted-foreground">Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  // ── Filter helpers ──
  const q = search.toLowerCase();

  const filteredUsers = allUsers.filter(u =>
    u.full_name.toLowerCase().includes(q) ||
    (u.phone ?? '').toLowerCase().includes(q) ||
    (roleLabels[u.role] ?? '').toLowerCase().includes(q)
  );

  const filteredGarages = allGarages.filter(g =>
    g.nom_garage.toLowerCase().includes(q) ||
    g.commune.toLowerCase().includes(q) ||
    (g.telephone ?? '').includes(q)
  );

  const filteredInterventions = allInterventions.filter((iv: any) =>
    iv.type_service.toLowerCase().includes(q) ||
    (iv.description_travaux ?? '').toLowerCase().includes(q) ||
    (iv.vehicules?.plaque_immatriculation ?? '').toLowerCase().includes(q) ||
    (iv.garages?.nom_garage ?? '').toLowerCase().includes(q)
  );

  const paginate = <T,>(arr: T[]) => {
    const total = Math.ceil(arr.length / PAGE_SIZE);
    return { items: arr.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), totalPages: total, total: arr.length };
  };

  // ── KPIs ──
  const kpis = [
    { label: 'Utilisateurs', value: stats?.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Véhicules', value: stats?.totalVehicles, icon: Car, color: 'text-chart-4' },
    { label: 'Interventions', value: stats?.totalInterventions, icon: Wrench, color: 'text-accent' },
    { label: 'Garages certifiés', value: stats?.totalGarages, icon: Building2, color: 'text-success' },
    { label: 'En attente', value: stats?.pendingGarages, icon: Clock, color: stats?.pendingGarages ? 'text-destructive' : 'text-success' },
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Administration</h1>
        <div className="flex items-center gap-3 mt-1">
          <p className="text-sm text-muted-foreground">Vue globale de la plateforme</p>
          <Link to="/dashboard/admin/revenue" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-colors">
            <DollarSign className="w-3.5 h-3.5" /> Revenus
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch(''); }}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map((kpi, i) => (
              <div key={kpi.label} className={cn('bg-card border border-border rounded-lg p-4 animate-fade-up', `stagger-${i + 1}`)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display text-[10px] uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className={cn('w-4 h-4', kpi.color)} />
                </div>
                {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                  <p className={cn('text-2xl font-bold font-mono', kpi.color)}>{kpi.value?.toLocaleString('fr-FR') ?? '—'}</p>
                )}
              </div>
            ))}
          </div>

          {/* Pending garages quick view */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Garages en attente
              </h2>
              <button onClick={() => setActiveTab('garages')} className="text-xs text-primary hover:underline">
                Tout voir →
              </button>
            </div>
            {garagesLoading ? <Skeleton className="h-16 w-full" /> :
              allGarages.filter(g => !g.est_certifie).length === 0 ? (
                <p className="text-sm text-success flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Aucun garage en attente</p>
              ) : (
                <div className="space-y-2">
                  {allGarages.filter(g => !g.est_certifie).slice(0, 3).map(g => (
                    <div key={g.id} className="flex items-center gap-3 p-3 rounded-md border border-accent/20 bg-accent/5">
                      <Building2 className="w-4 h-4 text-accent flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.nom_garage}</p>
                        <p className="text-xs text-muted-foreground">{g.commune}</p>
                      </div>
                      <button onClick={() => certify(g.id)} disabled={isCertifying} className="text-xs text-success hover:underline">Certifier</button>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <TableSection
          title="Tous les utilisateurs"
          icon={<Users className="w-4 h-4 text-primary" />}
          search={search}
          onSearch={setSearch}
          placeholder="Rechercher par nom, téléphone, rôle…"
          loading={usersLoading}
          page={page}
          onPageChange={setPage}
          paginated={paginate(filteredUsers)}
          headers={['Nom', 'Rôle', 'Téléphone', 'Inscrit le']}
          renderRow={(user: any) => (
            <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/20">
              <td className="py-2.5 px-3 font-medium truncate max-w-[200px]">{user.full_name}</td>
              <td className="py-2.5 px-3">
                <span className={cn('text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full', roleColors[user.role])}>
                  {roleLabels[user.role] ?? user.role}
                </span>
              </td>
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{user.phone ?? '—'}</td>
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
            </tr>
          )}
        />
      )}

      {/* ── Garages Tab ── */}
      {activeTab === 'garages' && (
        <TableSection
          title="Tous les garages"
          icon={<Building2 className="w-4 h-4 text-accent" />}
          search={search}
          onSearch={setSearch}
          placeholder="Rechercher par nom, commune, téléphone…"
           loading={garagesLoading}
          page={page}
          onPageChange={setPage}
          paginated={paginate(filteredGarages)}
          headers={['Garage', 'Commune', 'Téléphone', 'Statut', 'Actions']}
          renderRow={(garage: any) => (
            <tr key={garage.id} className="border-b border-border/50 hover:bg-secondary/20">
              <td className="py-2.5 px-3 font-medium truncate max-w-[180px]">{garage.nom_garage}</td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {garage.commune}
              </td>
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground">{garage.telephone ?? '—'}</td>
              <td className="py-2.5 px-3">
                {garage.est_certifie ? (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-success/10 text-success">Certifié</span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">En attente</span>
                )}
              </td>
              <td className="py-2.5 px-3">
                <div className="flex gap-1.5">
                  {!garage.est_certifie && (
                    <>
                      <button onClick={() => certify(garage.id)} disabled={isCertifying} className="text-[10px] px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors">
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Supprimer "${garage.nom_garage}" ?`)) reject(garage.id); }}
                        disabled={isRejecting}
                        className="text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  <Link to={`/dashboard/garages/${garage.id}`} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <Eye className="w-3 h-3" />
                  </Link>
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {activeTab === 'garages' && !publicGaragesLoading && publicGarages.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">
            Les coordonnées publiques des garages ont été masquées. La fiche publique utilise désormais un annuaire limité aux informations non sensibles.
          </p>
        </div>
      )}

      {/* ── Interventions Tab ── */}
      {activeTab === 'interventions' && (
        <TableSection
          title="Toutes les interventions"
          icon={<Wrench className="w-4 h-4 text-accent" />}
          search={search}
          onSearch={setSearch}
          placeholder="Rechercher par type, plaque, garage…"
          loading={interventionsLoading}
          page={page}
          onPageChange={setPage}
          paginated={paginate(filteredInterventions)}
          headers={['Date', 'Véhicule', 'Type', 'Garage', 'Km', 'Montant']}
          renderRow={(iv: any) => (
            <tr key={iv.id} className="border-b border-border/50 hover:bg-secondary/20">
              <td className="py-2.5 px-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                {iv.date_intervention ? new Date(iv.date_intervention).toLocaleDateString('fr-FR') : '—'}
              </td>
              <td className="py-2.5 px-3 text-xs">
                <span className="font-medium">{iv.vehicules?.plaque_immatriculation ?? '—'}</span>
                <br />
                <span className="text-muted-foreground text-[10px]">{iv.vehicules?.marque} {iv.vehicules?.modele}</span>
              </td>
              <td className="py-2.5 px-3">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-accent/10 text-accent">{iv.type_service}</span>
              </td>
              <td className="py-2.5 px-3 text-xs text-muted-foreground truncate max-w-[120px]">{iv.garages?.nom_garage ?? '—'}</td>
              <td className="py-2.5 px-3 font-mono text-xs">{iv.kilometrage_au_moment_rdv?.toLocaleString('fr-FR')} km</td>
              <td className="py-2.5 px-3 font-mono text-xs font-medium">
                {iv.montant_facture ? `${iv.montant_facture.toLocaleString('fr-FR')} $` : '—'}
              </td>
            </tr>
          )}
        />
      )}
    </div>
  );
}

// ── Reusable Table Section ───────────────────────────────────
function TableSection({
  title, icon, search, onSearch, placeholder, loading, page, onPageChange, paginated, headers, renderRow,
}: {
  title: string;
  icon: React.ReactNode;
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  loading: boolean;
  page: number;
  onPageChange: (p: number) => void;
  paginated: { items: any[]; totalPages: number; total: number };
  headers: string[];
  renderRow: (item: any) => React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          {icon}
          <h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
          <span className="ml-1 text-[10px] text-muted-foreground/60 font-mono">({paginated.total})</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="pl-8 h-8 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4 space-y-2">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full rounded" />)}</div>
        ) : paginated.items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucun résultat trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map(h => (
                  <th key={h} className="text-left py-2 px-3 font-display text-[10px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{paginated.items.map(renderRow)}</tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {paginated.totalPages > 1 && (
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground font-mono">
            Page {page + 1} / {paginated.totalPages}
          </span>
          <div className="flex gap-1.5">
            <button
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="p-1.5 rounded-md border border-border hover:bg-secondary/50 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={page >= paginated.totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="p-1.5 rounded-md border border-border hover:bg-secondary/50 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
