// SECURITY: This endpoint previously marked mobile-money / card payments as "paid"
// without calling any provider verification API, which allowed any authenticated
// user to obtain free PDF passports.
//
// All real payment verification now goes through Flutterwave:
//   - initiate-flutterwave-payment  -> creates the checkout session
//   - verify-flutterwave-payment    -> verifies via Flutterwave API and marks paid
//
// This function is kept as a 501 stub so any legacy client call fails closed
// instead of silently granting access.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve((req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.warn("confirm-pdf-payment called but is disabled. Use Flutterwave flow instead.");

  return new Response(
    JSON.stringify({
      error:
        "Cette méthode de paiement n'est pas disponible. Veuillez utiliser Flutterwave pour régler votre passeport PDF.",
      code: "PAYMENT_METHOD_DISABLED",
    }),
    {
      status: 501,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
