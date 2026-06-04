import { useState } from 'react';
import { ClipboardList, DollarSign, Clock, CheckCircle2, XCircle, PackageCheck, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSeller } from '@/hooks/useSeller';
import { useSellerOrders, useUpdateOrderStatus } from '@/hooks/useSellerOrders';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; icon: typeof Clock; className: string }> = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' },
  completed: { label: 'Livré', icon: CheckCircle2, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' },
  cancelled: { label: 'Annulé', icon: XCircle, className: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' },
};

const paymentModeLabels: Record<string, string> = {
  coupon: 'Coupon',
  deposit: 'Réservation',
  full_online: 'Pack Sérénité',
};

export default function SellerOrders() {
  const { seller, isLoading: sellerLoading } = useSeller();
  const { data: orders = [], isLoading } = useSellerOrders(seller?.id);
  const updateStatus = useUpdateOrderStatus();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (sellerLoading || isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (!seller) {
    return <p className="text-center text-muted-foreground py-10">Créez d'abord votre profil vendeur.</p>;
  }

  const filtered = statusFilter === 'all' ? orders : orders.filter((o: any) => o.status === statusFilter);

  const totalCommissions = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o.platform_commission ?? 0), 0);

  const totalRevenue = orders
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o.total_price ?? 0), 0);

  const pendingCount = orders.filter((o: any) => o.status === 'pending').length;

  const handleMarkReady = async (orderId: number) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: 'completed' });
      toast.success('Commande marquée comme livrée');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <h2 className="font-display font-bold text-lg">Commandes entrantes</h2>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <ClipboardList className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
            <p className="text-xl font-bold font-mono">{pendingCount}</p>
            <p className="text-[10px] text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <DollarSign className="h-4 w-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <p className="text-xl font-bold font-mono">{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Revenus (USD)</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <PackageCheck className="h-4 w-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
            <p className="text-xl font-bold font-mono">{totalCommissions.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="h-9 text-xs w-full">
          <Filter className="h-3 w-3 mr-1" />
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les commandes</SelectItem>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="completed">Livrées</SelectItem>
          <SelectItem value="cancelled">Annulées</SelectItem>
        </SelectContent>
      </Select>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune commande</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order: any, i: number) => {
            const cfg = statusConfig[order.status] ?? statusConfig.pending;
            const StatusIcon = cfg.icon;
            return (
              <Card key={order.id} className={`border-0 shadow-sm animate-fade-up stagger-${Math.min(i + 1, 5)}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {order.spare_parts?.part_name ?? `Pièce #${order.part_id}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Cmd #{order.id} · Qté: {order.quantity ?? 1}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold font-mono">{order.total_price ?? 0} USD</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Mode: {paymentModeLabels[order.payment_mode] ?? order.payment_mode}</span>
                    <span>Commission: {order.platform_commission ?? 0} USD</span>
                  </div>

                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleMarkReady(order.id)}
                      disabled={updateStatus.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Marquer comme livré
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
