import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ticket, Shield, Lock, ArrowLeft, ChevronRight, Package, MapPin, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCreateOrder, calculateCommission, type PaymentMode } from '@/hooks/useOrders';

const PAYMENT_MODES = [
  {
    value: 'coupon' as PaymentMode,
    label: 'Coupon Réduction',
    subtitle: 'Gratuit / Cash',
    description: 'Recevez un QR code de réduction. Payez 100% en espèces au vendeur.',
    icon: Ticket,
    trust: 'Basique',
    trustColor: 'text-amber-500',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/5',
    badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    value: 'deposit' as PaymentMode,
    label: 'Réservation Garantie',
    subtitle: 'Acompte Mobile Money',
    description: 'Payez 2 500 FC de frais de service via Mobile Money pour réserver la pièce. Solde en cash.',
    icon: Shield,
    trust: 'Recommandé',
    trustColor: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/5',
    badgeBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    value: 'full_online' as PaymentMode,
    label: 'Pack Sérénité',
    subtitle: 'Paiement total Mobile Money',
    description: 'Payez le montant total via Mobile Money. Les fonds sont bloqués jusqu\'à confirmation de réception.',
    icon: Lock,
    trust: 'Sûr & Garanti',
    trustColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/5',
    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    premium: true,
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const part = location.state?.part;
  const seller = location.state?.seller;

  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full_online');
  const [quantity, setQuantity] = useState(1);
  const createOrder = useCreateOrder();

  if (!part || !seller) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground mb-4">Aucune pièce sélectionnée</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/marketplace/browse')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour au catalogue
        </Button>
      </div>
    );
  }

  const unitPrice = part.price ?? 0;
  const totalPrice = unitPrice * quantity;
  const commission = calculateCommission(paymentMode, totalPrice);
  const currency = part.currency ?? 'USD';

  const handleOrder = async () => {
    try {
      await createOrder.mutateAsync({
        part_id: part.id,
        seller_id: part.seller_id,
        quantity,
        total_price: totalPrice,
        payment_mode: paymentMode,
      });
      toast.success('Commande créée avec succès !');
      navigate('/marketplace/orders');
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors de la commande');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-lg font-display font-bold">Checkout</h2>
          <p className="text-xs text-muted-foreground">Résumé de commande</p>
        </div>
      </div>

      {/* Part summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{part.part_name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {part.category && <Badge variant="secondary" className="text-[10px] h-5">{part.category}</Badge>}
                {part.condition && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {part.condition === 'new' ? 'Neuf' : part.condition === 'used' ? 'Usagé' : 'Venant'}
                  </span>
                )}
              </div>
              {seller && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                  <MapPin className="h-3 w-3" />
                  <span>{seller.store_name}</span>
                  {seller.commune && <span>· {seller.commune}</span>}
                  {seller.is_verified && <ShieldCheck className="h-3 w-3 text-emerald-500" />}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {unitPrice} <span className="text-xs text-muted-foreground">{currency}</span>
              </p>
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Quantité</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-7 w-7"
                onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                −
              </Button>
              <span className="font-mono text-sm w-6 text-center">{quantity}</span>
              <Button variant="outline" size="icon" className="h-7 w-7"
                onClick={() => setQuantity(Math.min(part.stock_quantity ?? 99, quantity + 1))}
                disabled={quantity >= (part.stock_quantity ?? 99)}>
                +
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment mode selection */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Mode de paiement</h3>
        <RadioGroup value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)} className="space-y-3">
          {PAYMENT_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = paymentMode === mode.value;
            return (
              <Label
                key={mode.value}
                htmlFor={mode.value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `${mode.borderColor} ${mode.bgColor} shadow-sm`
                    : 'border-border hover:border-muted-foreground/30'
                } ${mode.premium && isSelected ? 'ring-1 ring-emerald-500/20' : ''}`}
              >
                <RadioGroupItem value={mode.value} id={mode.value} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className={`h-4 w-4 ${mode.trustColor}`} />
                    <span className="font-semibold text-sm">{mode.label}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${mode.badgeBg}`}>
                      {mode.trust}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-muted-foreground mt-0.5">{mode.subtitle}</p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1 leading-relaxed">{mode.description}</p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      {/* Order summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-semibold mb-2">Récapitulatif</h3>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Sous-total ({quantity}x)</span>
            <span className="font-mono">{totalPrice.toFixed(2)} {currency}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Frais de service</span>
            <span className="font-mono">
              {commission === 0 ? 'Gratuit' : paymentMode === 'deposit' ? '2 500 FC' : `${commission.toFixed(2)} ${currency}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm font-bold">
            <span>Total à payer</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400">
              {paymentMode === 'coupon'
                ? `${totalPrice.toFixed(2)} ${currency} (cash)`
                : paymentMode === 'deposit'
                ? `2 500 FC + solde cash`
                : `${(totalPrice + commission).toFixed(2)} ${currency}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Button
        className="w-full h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={handleOrder}
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Traitement...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            Confirmer la commande <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
}
