import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertTriangle, RefreshCw, FileCheck2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 3000;

type FlowState = "loading" | "success" | "error";
type StepStatus = "complete" | "current" | "upcoming" | "error";

export default function FlutterwaveReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<FlowState>("loading");
  const [message, setMessage] = useState("Connexion au paiement en cours...");
  const [attempt, setAttempt] = useState(0);
  const [stepStatus, setStepStatus] = useState<Record<"redirect" | "payment" | "document", StepStatus>>({
    redirect: "current",
    payment: "upcoming",
    document: "upcoming",
  });

  const recordId = searchParams.get("recordId");
  const vehicleId = searchParams.get("vehicleId");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");
  const providerStatus = searchParams.get("status");

  const targetVehicleUrl = useMemo(
    () => (vehicleId ? `/dashboard/vehicles/${vehicleId}` : "/dashboard"),
    [vehicleId],
  );

  const progressValue = useMemo(() => {
    if (status === "success") return 100;
    if (status === "error") return 66;

    const completed = Object.values(stepStatus).filter((value) => value === "complete").length;
    const current = Object.values(stepStatus).some((value) => value === "current") ? 1 : 0;
    return Math.min(100, Math.round(((completed + current * 0.5) / 3) * 100));
  }, [status, stepStatus]);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!recordId || !txRef) {
        setStatus("error");
        setMessage("Paiement introuvable. Veuillez relancer l’opération.");
        setStepStatus({ redirect: "error", payment: "upcoming", document: "upcoming" });
        return;
      }

      if (providerStatus && ["cancelled", "failed"].includes(providerStatus)) {
        setStatus("error");
        setMessage("Le paiement a été annulé ou refusé par Flutterwave.");
        setStepStatus({ redirect: "complete", payment: "error", document: "upcoming" });
        return;
      }

      setStepStatus({ redirect: "complete", payment: "current", document: "upcoming" });

      for (let currentAttempt = 1; currentAttempt <= MAX_POLL_ATTEMPTS; currentAttempt += 1) {
        if (cancelled) return;

        setAttempt(currentAttempt);
        setMessage(
          currentAttempt === 1
            ? "Retour du checkout détecté. Vérification du paiement en cours..."
            : `Paiement détecté. Nouvelle vérification en cours (${currentAttempt}/${MAX_POLL_ATTEMPTS})...`,
        );

        const res = await supabase.functions.invoke("verify-flutterwave-payment", {
          body: { recordId, txRef, transactionId },
        });

        if (cancelled) return;

        if (res.data?.status === "paid") {
          setStatus("success");
          setStepStatus({ redirect: "complete", payment: "complete", document: "complete" });
          setMessage("Paiement confirmé et passeport PDF débloqué. Vous pouvez continuer.");
          return;
        }

        if (res.data?.status === "pending") {
          setStepStatus({ redirect: "complete", payment: "current", document: "upcoming" });
          setMessage(res.data?.message || "Paiement localisé, confirmation bancaire en attente...");
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          continue;
        }

        setStatus("error");
        setStepStatus({ redirect: "complete", payment: "error", document: "upcoming" });
        setMessage(res.error?.message || res.data?.error || "La vérification du paiement a échoué.");
        return;
      }

      setStatus("error");
      setStepStatus({ redirect: "complete", payment: "error", document: "upcoming" });
      setMessage("Le paiement est encore en attente. Réessayez dans quelques instants.");
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [providerStatus, recordId, transactionId, txRef]);

  const steps = [
    {
      key: "redirect",
      title: "Retour Flutterwave",
      description: "Le retour du checkout a bien été reçu.",
      icon: RefreshCw,
    },
    {
      key: "payment",
      title: "Validation du paiement",
      description: "Nous confirmons la transaction côté sandbox.",
      icon: Loader2,
    },
    {
      key: "document",
      title: "Passeport PDF prêt",
      description: "Votre achat est débloqué pour le téléchargement.",
      icon: FileCheck2,
    },
  ] as const;

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto flex max-w-xl flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <span>Suivi du paiement</span>
            <span>{progressValue}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <div className="mb-6 flex flex-col items-center text-center">
        {status === "loading" ? (
          <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        ) : status === "success" ? (
          <CheckCircle2 className="mb-4 h-10 w-10 text-primary" />
        ) : (
          <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
        )}

        <h1 className="font-display text-xl font-bold uppercase tracking-wide">
          {status === "loading" ? "Paiement Flutterwave" : status === "success" ? "Paiement confirmé" : "Vérification impossible"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        {status === "loading" && attempt > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Tentative {attempt}/{MAX_POLL_ATTEMPTS} · actualisation automatique</p>
        ) : null}
        </div>

        <div className="space-y-3">
          {steps.map((step) => {
            const currentState = stepStatus[step.key];
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex items-start gap-3 rounded-md border border-border bg-background/60 px-4 py-3"
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground">
                  <Icon className={currentState === "current" ? "h-4 w-4 animate-spin text-primary" : "h-4 w-4"} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{step.title}</p>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {currentState === "complete"
                        ? "Terminé"
                        : currentState === "current"
                          ? "En cours"
                          : currentState === "error"
                            ? "Bloqué"
                            : "À venir"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          {status !== "success" ? (
            <Button className="flex-1" variant="secondary" onClick={() => window.location.reload()}>
              Reprendre la vérification
            </Button>
          ) : null}
          <Button className="flex-1" onClick={() => navigate(targetVehicleUrl, { replace: true })}>
            Retour au véhicule
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <Link to="/dashboard">Tableau de bord</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}