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

    const { recordId, returnUrl } = await req.json();
    if (!recordId || !returnUrl) {
      return new Response(JSON.stringify({ error: "recordId et returnUrl requis" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    // Récupération de la commande Marketplace
    const { data: order, error: orderError } = await supabase
      .from("spare_parts_orders")
      .select("id, total_amount, status, buyer_id")
      .eq("id", recordId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Commande introuvable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (order.status === "paid" || order.status === "completed") {
      return new Response(JSON.stringify({ status: "paid" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const txRef = `mkt_${order.id}_${Date.now()}`;

    // ==========================================
    // 🛠️ MODE SIMULATION LOCAL (MOCK SIMULATOR)
    // ==========================================
    // On crée directement l'URL de retour vers FlutterwaveReturnPage en simulant un succès
    const simulatedRedirectUrl = new URL(returnUrl);
    simulatedRedirectUrl.searchParams.set("status", "successful"); // Simule le succès du paiement
    simulatedRedirectUrl.searchParams.set("recordId", order.id);
    simulatedRedirectUrl.searchParams.set("tx_ref", txRef);

    // Mise à jour immédiate de la commande en "pending" ou directement "paid" pour tes tests
    const { error: updateError } = await supabase
      .from("spare_parts_orders")
      .update({ 
        payment_method: "simulation_local_mpesa", 
        payment_reference: txRef, 
        status: "paid" // On la passe directement en paid pour valider ton tunnel frontend !
      })
      .eq("id", order.id);

    if (updateError) {
      return new Response(JSON.stringify({ error: "Impossible de mettre à jour la commande" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // On renvoie l'URL simulée au client
    return new Response(JSON.stringify({ 
      status: "success", 
      checkout_url: simulatedRedirectUrl.toString(), 
      tx_ref: txRef 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("simulation-payment-error", error);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});