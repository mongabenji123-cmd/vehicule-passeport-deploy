import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Smartphone, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PHONE_PATTERN = /^\+?[0-9\s-]{8,20}$/;
const CARD_PATTERN = /^[0-9\s]{12,23}$/;

interface PDFPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: string | null;
  vehicleId: string | null;
  price: number | null;
  priceGroup: string | null;
  onPaymentSuccess: () => void;
}

const PAYMENT_METHODS = [
  { id: "flutterwave", label: "Flutterwave (M-Pesa, Airtel, Orange, Visa)", icon: CreditCard, color: "text-primary", bg: "bg-primary/10 border-primary/30" },
] as const;

export function PDFPaymentDialog({
  open,
  onOpenChange,
  recordId,
  vehicleId,
  price,
  priceGroup,
  onPaymentSuccess,
}: PDFPaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirmPayment = async () => {
    if (!selectedMethod || !recordId) return;

    const normalizedReference = phoneNumber.trim();

    if (selectedMethod === "flutterwave") {
      if (!vehicleId) {
        toast.error("Véhicule introuvable");
        return;
      }

      setProcessing(true);
      try {
        const returnUrl = `${window.location.origin}/payments/flutterwave/return?vehicleId=${vehicleId}`;
        const res = await supabase.functions.invoke("initiate-flutterwave-payment", {
          body: { recordId, returnUrl },
        });

        if (res.error) throw new Error(res.error.message);
        if (res.data?.status === "paid") {
          toast.success("Paiement déjà validé. Téléchargement du PDF...");
          await onPaymentSuccess();
          onOpenChange(false);
          return;
        }
        if (!res.data?.checkout_url) throw new Error("Lien de paiement Flutterwave indisponible");
        window.location.href = res.data.checkout_url;
        return;
      } catch (err: any) {
        toast.error(err.message || "Erreur lors de l'initialisation Flutterwave");
      } finally {
        setProcessing(false);
      }
      return;
    }

    // Validate phone for mobile money
    if (selectedMethod !== "visa" && !normalizedReference) {
      toast.error("Veuillez entrer votre numéro de téléphone");
      return;
    }

    if (selectedMethod !== "visa" && !PHONE_PATTERN.test(normalizedReference)) {
      toast.error("Veuillez entrer un numéro valide");
      return;
    }

    if (selectedMethod === "visa" && normalizedReference && !CARD_PATTERN.test(normalizedReference)) {
      toast.error("Veuillez entrer un numéro de carte valide");
      return;
    }

    setProcessing(true);
    try {
      const res = await supabase.functions.invoke("confirm-pdf-payment", {
        body: {
          recordId,
          paymentMethod: selectedMethod,
          paymentReference: normalizedReference || undefined,
        },
      });

      if (res.error) throw new Error(res.error.message);

      const result = res.data;
      if (result.status === "paid" || result.status === "already_paid") {
        setSuccess(true);
        toast.success("Paiement confirmé ! Votre PDF est prêt.");
        setTimeout(() => {
          setSuccess(false);
          onOpenChange(false);
          onPaymentSuccess();
        }, 1500);
      } else {
        throw new Error("Erreur inattendue");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  const resetState = () => {
    setSelectedMethod(null);
    setPhoneNumber("");
    setProcessing(false);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!processing) { onOpenChange(v); if (!v) resetState(); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg uppercase tracking-wide">
            Passeport PDF Certifié
          </DialogTitle>
          <DialogDescription>
            Obtenez le passeport numérique officiel de votre véhicule
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8 gap-3 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="text-sm font-medium text-foreground">Paiement confirmé !</p>
            <p className="text-xs text-muted-foreground">Téléchargement en cours…</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Price display */}
            <div className="text-center py-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Prix du passeport certifié</p>
              <p className="text-3xl font-bold font-mono text-foreground">{price ?? "—"} $</p>
              <p className="text-xs text-muted-foreground mt-1">USD • Valable 30 jours</p>
            </div>

            {/* Payment methods */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Choisissez votre moyen de paiement
              </p>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all active:scale-[0.97]",
                        isSelected
                          ? `${method.bg} ring-2 ring-primary/30`
                          : "border-border hover:bg-secondary"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", method.color)} />
                      {method.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Phone number input for mobile money */}
            {selectedMethod && selectedMethod !== "visa" && selectedMethod !== "flutterwave" && (
              <div className="animate-fade-in">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Numéro {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.label}
                </label>
                <input
                  type="tel"
                  placeholder="+243 XXX XXX XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
            )}

            {/* Visa card number placeholder */}
            {selectedMethod === "visa" && (
              <div className="animate-fade-in">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Numéro de carte
                </label>
                <input
                  type="text"
                  placeholder="4XXX XXXX XXXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                />
              </div>
            )}

            {selectedMethod === "flutterwave" && (
              <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground animate-fade-in">
                Vous serez redirigé vers la page de paiement Flutterwave sandbox pour finaliser le règlement en mode test.
              </div>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirmPayment}
              disabled={!selectedMethod || processing}
              className="w-full py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traitement en cours…
                </>
              ) : (
                `Payer ${price ?? "—"} $ et télécharger`
              )}
            </button>

            <p className="text-[10px] text-muted-foreground text-center">
              En procédant au paiement, vous acceptez nos{" "}
              <a href="/terms" className="underline">conditions d'utilisation</a>.
              Document valable 30 jours après génération.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
