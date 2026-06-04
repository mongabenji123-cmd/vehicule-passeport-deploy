import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { recordId, txRef, transactionId } = await req.json();
    if (!recordId || !txRef) {
      return new Response(JSON.stringify({ error: "recordId et txRef requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, serviceKey);
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token invalide" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Détection automatique du type grâce au préfixe de la référence (mkt_ pour marketplace, pdf_ pour le reste)
    const isMarketplace = txRef.startsWith("mkt_");

    // =========================================================
    // BRANCHE A : Mode Simulation / Validation Marketplace
    // =========================================================
    if (isMarketplace) {
      const { data: order, error: orderError } = await supabase
        .from("spare_parts_orders")
        .select("id, status, buyer_id")
        .eq("id", recordId)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Commande Marketplace introuvable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (order.status === "paid" || order.status === "completed") {
        return new Response(JSON.stringify({ status: "paid" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Simulation : On valide directement la commande Marketplace en mode "paid"
      const { error: updateError } = await supabase
        .from("spare_parts_orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("id", order.id);

      if (updateError) {
        return new Response(JSON.stringify({ error: "Impossible de valider la commande Marketplace" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ status: "paid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================================================
    // BRANCHE B : Validation Réelle / Sandbox pour les PDF
    // =========================================================
    const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SANDBOX_SECRET_KEY");
    if (!flutterwaveKey) {
      return new Response(JSON.stringify({ error: "Flutterwave sandbox n'est pas configuré" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: record, error: recordError } = await supabase
      .from("rapports_pdf")
      .select("id, payment_reference, statut_paiement, proprietaire_id")
      .eq("id", recordId)
      .eq("proprietaire_id", user.id)
      .maybeSingle();

    if (recordError || !record) {
      return new Response(JSON.stringify({ error: "Enregistrement PDF introuvable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (record.statut_paiement === "paid") {
      return new Response(JSON.stringify({ status: "paid" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (record.payment_reference !== txRef) {
      return new Response(JSON.stringify({ error: "Référence de paiement invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const verificationUrl = transactionId
      ? `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`;

    const verifyResponse = await fetch(verificationUrl, {
      headers: { Authorization: `Bearer ${flutterwaveKey}` },
    });
    const verifyData = await verifyResponse.json();

    const payment = verifyData?.data;
    const matchesReference = !payment?.tx_ref || payment.tx_ref === txRef;
    const isPaid = verifyResponse.ok && verifyData?.status === "success" && payment?.status === "successful" && matchesReference;

    if (verifyResponse.ok && verifyData?.status === "success" && payment?.status && payment?.status !== "successful") {
      return new Response(JSON.stringify({
        status: "pending",
        message: "Le paiement a été localisé et reste en attente de confirmation finale.",
        provider_status: payment.status,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isPaid) {
      return new Response(JSON.stringify({ error: verifyData?.message || "Paiement non confirmé", status: "pending" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const expireAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("rapports_pdf")
      .update({
        statut_paiement: "paid",
        payment_method: "flutterwave",
        genere_at: now.toISOString(),
        expire_at: expireAt.toISOString(),
      })
      .eq("id", record.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Impossible de valider le paiement PDF" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ status: "paid", expire_at: expireAt.toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("verify-flutterwave-payment-error", error);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});