import { ArrowLeft, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useBuyerOrders, useConfirmDelivery, useCancelOrder } from '@/hooks/useOrders';

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'En attente', icon: Clock, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  completed: { label: 'Terminée', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  cancelled: { label: 'Annulée', icon: XCircle, color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
};

const modeLabels: Record<string, string> = {
  coupon: 'Coupon Réduction',
  deposit: 'Réservation Garantie',
  full_online: 'Pack Sérénité',
};

export default function BuyerOrders() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useBuyerOrders();
  const confirmDelivery = useConfirmDelivery();
  const cancelOrder = useCancelOrder();

  const handleConfirm = async (orderId: number) => {
    try {
      await confirmDelivery.mutateAsync(orderId);
      toast.success('Livraison confirmée !');
    } catch {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleCancel = async (orderId: number) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success('Commande annulée');
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/marketplace/browse')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-display font-bold">Mes commandes</h2>
          <p className="text-xs text-muted-foreground">{orders.length} commande(s)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune commande</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/marketplace/browse')}>
            Parcourir le catalogue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const status = statusConfig[order.status] ?? statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <Card key={order.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      #{String(order.id).padStart(6, '0')}
                    </span>
                    <Badge className={`text-[10px] gap-1 ${status.color} border-0`}>
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Part details */}
                  <p className="font-semibold text-sm">{order.spare_parts?.part_name ?? 'Pièce'}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>Qté: {order.quantity}</span>
                    <span>·</span>
                    <span className="font-mono font-bold text-foreground">
                      {order.total_price} {order.spare_parts?.currency ?? 'USD'}
                    </span>
                    <span>·</span>
                    <span>{modeLabels[order.payment_mode] ?? order.payment_mode}</span>
                  </div>

                  {/* Seller */}
                  {order.sellers && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Vendeur : {order.sellers.store_name}
                      {order.sellers.commune && ` · ${order.sellers.commune}`}
                    </p>
                  )}

                  {/* Date */}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>

                  {/* Actions */}
                  {order.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleConfirm(order.id)}
                        disabled={confirmDelivery.isPending}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Confirmer réception
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelOrder.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
