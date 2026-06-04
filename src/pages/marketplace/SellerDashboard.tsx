import { Package, ListChecks, PlusCircle, Store, ClipboardList, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeller, useSpareParts } from '@/hooks/useSeller';
import { useSellerOrders } from '@/hooks/useSellerOrders';
import { useNavigate } from 'react-router-dom';
import { SellerOnboarding } from '@/components/marketplace/SellerOnboarding';

export default function SellerDashboard() {
  const navigate = useNavigate();

  // 1. TOUS LES HOOKS EN PREMIER (Règle absolue de React)
  const { seller, isLoading: sellerLoading } = useSeller();
  const { parts = [], isLoading: partsLoading } = useSpareParts(seller?.id);
  
  // On appelle le hook ici. Si seller n'existe pas, il renverra un tableau vide proprement sans crasher
  const ordersResult = useSellerOrders(seller?.id);
  const orders = ordersResult?.data || [];
  const ordersLoading = ordersResult?.isLoading || false;

  // 2. LES CONDITIONS DE RETOUR (Uniquement après que tous les hooks soient déclarés)
  if (sellerLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  // Si aucun profil vendeur n'est trouvé, on affiche le formulaire d'inscription
  if (!seller) return <SellerOnboarding />;

  // 3. CALCULS ET SÉCURISATION DES TABLEAUX
  const safeParts = Array.isArray(parts) ? parts : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const totalStock = safeParts.reduce((sum, p) => sum + (p?.stock_quantity ?? 0), 0);
  const activeListings = safeParts.length;
  const pendingOrders = safeOrders.filter((o: any) => o?.status === 'pending').length;
  const totalCommissions = safeOrders
    .filter((o: any) => o?.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o?.platform_commission ?? 0), 0);

  const stats = [
    { label: 'Stock Total', value: totalStock, icon: Package, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { label: 'Annonces', value: activeListings, icon: ListChecks, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: 'Commandes', value: pendingOrders, icon: ClipboardList, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { label: 'Commissions', value: `${totalCommissions}$`, icon: DollarSign, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40' },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <Store className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-base leading-tight">{seller.store_name}</h2>
          <p className="text-xs text-muted-foreground">{seller.commune ?? 'Kinshasa'}</p>
        </div>
        {seller.is_verified && (
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
            Vérifié
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <Card key={s.label} className={`border-0 shadow-sm animate-fade-up stagger-${i + 1}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono leading-none">{(partsLoading || ordersLoading) ? '—' : s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => navigate('/marketplace/add')}
          className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md active:scale-[0.97] transition-transform"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Ajouter pièce
        </Button>
        <Button
          onClick={() => navigate('/marketplace/orders')}
          variant="outline"
          className="h-12 font-semibold active:scale-[0.97] transition-transform"
        >
          <ClipboardList className="h-5 w-5 mr-2" />
          Voir commandes
        </Button>
      </div>

      {/* Recent parts */}
      {safeParts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Dernières pièces</h3>
          <div className="space-y-2">
            {safeParts.slice(0, 3).map((p) => (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{p.part_name}</p>
                    <p className="text-xs text-muted-foreground">{p.category ?? 'Non catégorisé'} · {p.condition ?? 'Neuf'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono">{p.price ?? 0} {p.currency ?? 'USD'}</p>
                    <p className="text-[10px] text-muted-foreground">Qté: {p.stock_quantity ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}