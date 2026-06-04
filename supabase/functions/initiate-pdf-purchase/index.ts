import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PRICE_GROUPS: Record<string, number> = { A: 2, B: 5, C: 10 };

function assignPriceGroup(): string {
  const rand = Math.random();
  if (rand < 0.333) return "A";
  if (rand < 0.666) return "B";
  return "C";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { vehicleId } = await req.json();
    if (!vehicleId) {
      return new Response(JSON.stringify({ error: "vehicleId requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Authenticate user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

    // Check if user already has a pending/paid record for this vehicle
    const { data: existing } = await supabase
      .from("rapports_pdf")
      .select("*")
      .eq("vehicule_id", vehicleId)
      .eq("proprietaire_id", user.id)
      .in("statut_paiement", ["pending", "paid"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      const record = existing[0];
      // If already paid and not expired, allow download
      if (record.statut_paiement === "paid" && record.expire_at && record.expire_at >= nowIso) {
        return new Response(JSON.stringify({
          status: "paid",
          record_id: record.id,
          prix_usd: record.prix_usd,
          price_group: record.price_group,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (record.statut_paiement === "paid" && (!record.expire_at || record.expire_at < nowIso)) {
        await supabase
          .from("rapports_pdf")
          .update({ statut_paiement: "expired" })
          .eq("id", record.id);
      }

      // Return existing pending record (same price group)
      if (record.statut_paiement === "pending") {
        return new Response(JSON.stringify({
          status: "pending",
          record_id: record.id,
          prix_usd: record.prix_usd,
          price_group: record.price_group,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Assign A/B price group
    const priceGroup = assignPriceGroup();
    const price = PRICE_GROUPS[priceGroup];

    // Create new record
    const { data: newRecord, error: insertErr } = await supabase
      .from("rapports_pdf")
      .insert({
        vehicule_id: vehicleId,
        proprietaire_id: user.id,
        prix_usd: price,
        price_group: priceGroup,
        statut_paiement: "pending",
      })
      .select()
      .single();

    if (insertErr) {
      console.error("initiate-pdf-purchase insert failed", insertErr);
      return new Response(JSON.stringify({ error: "Une erreur interne est survenue." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      status: "pending",
      record_id: newRecord.id,
      prix_usd: price,
      price_group: priceGroup,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("initiate-pdf-purchase unexpected error", err);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
