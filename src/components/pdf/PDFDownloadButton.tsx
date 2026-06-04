import { useState } from "react";
import { PDFPaymentDialog } from "./PDFPaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface PDFDownloadButtonProps {
  vehicle: any;
}

export function PDFDownloadButton({ vehicle }: PDFDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [priceGroup, setPriceGroup] = useState<string | null>(null);

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Session introuvable");
      }

      const fileName = `passeport-${vehicle.plaque_immatriculation
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pdf?vehicleId=${vehicle.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Erreur lors de la génération du PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Passeport PDF exporté");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du téléchargement du PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    setLoading(true);
    try {
      // Check payment status via edge function
      const res = await supabase.functions.invoke("initiate-pdf-purchase", {
        body: { vehicleId: vehicle.id },
      });

      if (res.error) throw new Error(res.error.message);

      const data = res.data;

      if (data.status === "paid") {
        // Already paid, download directly
        await downloadPDF();
      } else {
        // Show payment dialog
        setRecordId(data.record_id);
        setPrice(data.prix_usd);
        setPriceGroup(data.price_group);
        setPaymentOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la vérification du paiement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-border rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 active:scale-[0.97]"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
        PDF
      </button>

      <PDFPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        recordId={recordId}
        vehicleId={vehicle.id}
        price={price}
        priceGroup={priceGroup}
        onPaymentSuccess={downloadPDF}
      />
    </>
  );
}
