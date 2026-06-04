import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(userId: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { limited: false };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) {
    return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { limited: false };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function sanitizeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "vehicule";
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return ["—"];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, fontSize);

    if (width <= maxWidth || !currentLine) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = word;
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

async function buildPdf({
  vehicle,
  interventions,
  alertes,
  ownerName,
  generatedAt,
}: {
  vehicle: any;
  interventions: any[];
  alertes: any[];
  ownerName: string;
  generatedAt: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 48;
  const contentWidth = pageSize[0] - margin * 2;
  const palette = {
    text: rgb(0.1, 0.12, 0.18),
    muted: rgb(0.42, 0.47, 0.56),
    primary: rgb(0.1, 0.24, 0.62),
    border: rgb(0.88, 0.9, 0.94),
    success: rgb(0.06, 0.6, 0.38),
    danger: rgb(0.82, 0.16, 0.16),
  };

  let page = pdfDoc.addPage(pageSize);
  let y = pageSize[1] - margin;

  const ensureSpace = (needed = 20) => {
    if (y - needed < margin) {
      page = pdfDoc.addPage(pageSize);
      y = pageSize[1] - margin;
    }
  };

  const drawLine = (thickness = 1) => {
    ensureSpace(16);
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageSize[0] - margin, y },
      thickness,
      color: palette.border,
    });
    y -= 14;
  };

  const drawTextBlock = (
    text: string,
    options?: { size?: number; font?: typeof regular; color?: ReturnType<typeof rgb>; gapAfter?: number }
  ) => {
    const size = options?.size ?? 11;
    const font = options?.font ?? regular;
    const color = options?.color ?? palette.text;
    const lineHeight = size + 4;
    const lines = wrapText(text, contentWidth, font, size);

    ensureSpace(lines.length * lineHeight + (options?.gapAfter ?? 0));
    for (const line of lines) {
      page.drawText(line, { x: margin, y, size, font, color });
      y -= lineHeight;
    }
    y -= options?.gapAfter ?? 0;
  };

  const drawLabelValue = (label: string, value: string) => {
    drawTextBlock(`${label}: ${value}`, { size: 10, color: palette.muted });
  };

  drawTextBlock("AUTO-PASSEPORT", { size: 20, font: bold, color: palette.primary, gapAfter: 2 });
  drawTextBlock("Passeport numérique certifié", { size: 11, color: palette.muted, gapAfter: 10 });
  drawLine(1.5);

  drawTextBlock(`${vehicle.marque} ${vehicle.modele}`, { size: 18, font: bold, gapAfter: 4 });
  drawLabelValue("Immatriculation", vehicle.plaque_immatriculation ?? "—");
  drawLabelValue("Propriétaire", ownerName || "Propriétaire");
  drawLabelValue("Date de génération", generatedAt);
  drawLabelValue("Année", vehicle.annee ? String(vehicle.annee) : "—");
  drawLabelValue("Couleur", vehicle.couleur ?? "—");
  drawLabelValue(
    "Kilométrage actuel",
    `${(vehicle.kilometrage_actuel ?? 0).toLocaleString("fr-FR")} km`
  );
  drawLabelValue("Score santé", `${vehicle.score_sante ?? 100}%`);

  y -= 8;
  drawLine();
  drawTextBlock(`Alertes actives (${alertes.length})`, { size: 13, font: bold, color: palette.primary, gapAfter: 4 });

  if (alertes.length === 0) {
    drawTextBlock("Aucune alerte active.", { size: 10, color: palette.success, gapAfter: 8 });
  } else {
    for (const alert of alertes) {
      const title = `${alert.titre ?? "Alerte"} — ${alert.type_alerte ?? "Type inconnu"}`;
      const detail = alert.km_declencheur
        ? `Seuil: ${Number(alert.km_declencheur).toLocaleString("fr-FR")} km`
        : `Urgence: ${alert.niveau_urgence ?? "info"}`;

      drawTextBlock(title, { size: 10, font: bold, color: palette.danger, gapAfter: 1 });
      drawTextBlock(detail, { size: 9, color: palette.muted, gapAfter: 5 });
    }
  }

  y -= 6;
  drawLine();
  drawTextBlock(`Historique des interventions (${interventions.length})`, {
    size: 13,
    font: bold,
    color: palette.primary,
    gapAfter: 4,
  });

  if (interventions.length === 0) {
    drawTextBlock("Aucune intervention enregistrée.", { size: 10, color: palette.muted });
  } else {
    for (const intervention of interventions) {
      ensureSpace(64);
      drawTextBlock(
        `${formatDate(intervention.date_intervention)} — ${intervention.type_service ?? "Intervention"}`,
        { size: 10, font: bold, gapAfter: 1 }
      );
      drawTextBlock(
        `Garage: ${intervention.garages?.nom_garage ?? "—"} · Kilométrage: ${Number(intervention.kilometrage_au_moment_rdv ?? 0).toLocaleString("fr-FR")} km`,
        { size: 9, color: palette.muted, gapAfter: 1 }
      );
      drawTextBlock(
        `Montant: ${intervention.montant_facture ? `${Number(intervention.montant_facture).toFixed(2)} $` : "—"}`,
        { size: 9, color: palette.muted, gapAfter: 1 }
      );
      drawTextBlock(`Travaux: ${intervention.description_travaux ?? "—"}`, { size: 9, gapAfter: 6 });
    }
  }

  const pages = pdfDoc.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawLine({
      start: { x: margin, y: 32 },
      end: { x: pageSize[0] - margin, y: 32 },
      thickness: 1,
      color: palette.border,
    });

    pdfPage.drawText("Document certifié Auto-Passeport", {
      x: margin,
      y: 18,
      size: 8,
      font: regular,
      color: palette.muted,
    });
    pdfPage.drawText(`Page ${index + 1}/${pages.length}`, {
      x: pageSize[0] - margin - 44,
      y: 18,
      size: 8,
      font: regular,
      color: palette.muted,
    });
  });

  return pdfDoc.save();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const vehicleId = url.searchParams.get("vehicleId");
    if (!vehicleId) {
      return new Response(JSON.stringify({ error: "vehicleId requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token invalide" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rl = isRateLimited(user.id);
    if (rl.limited) {
      return new Response(JSON.stringify({ error: `Trop de requêtes. Réessayez dans ${rl.retryAfter}s.` }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Retry-After": String(rl.retryAfter),
        },
      });
    }

    const nowIso = new Date().toISOString();
    const { data: report, error: reportError } = await supabase
      .from("rapports_pdf")
      .select("id, expire_at")
      .eq("vehicule_id", vehicleId)
      .eq("proprietaire_id", user.id)
      .eq("statut_paiement", "paid")
      .not("expire_at", "is", null)
      .gte("expire_at", nowIso)
      .order("genere_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reportError) {
      console.error("generate-pdf report check failed", reportError);
      return new Response(JSON.stringify({ error: "Une erreur interne est survenue." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!report) {
      return new Response(JSON.stringify({ error: "Paiement requis pour télécharger ce PDF." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicules")
      .select(`*, interventions(*, garages:garage_id(nom_garage, commune)), alertes(*)`)
      .eq("id", vehicleId)
      .eq("proprietaire_id", user.id)
      .single();

    if (vehicleError || !vehicle) {
      if (vehicleError) console.error("generate-pdf vehicle fetch failed", vehicleError);
      return new Response(JSON.stringify({ error: "Véhicule introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const interventions = (vehicle.interventions ?? []).sort(
      (a: any, b: any) => new Date(b.date_intervention ?? 0).getTime() - new Date(a.date_intervention ?? 0).getTime()
    );
    const alertes = (vehicle.alertes ?? []).filter((alert: any) => !alert.est_resolue);
    const pdfBytes = await buildPdf({
      vehicle,
      interventions,
      alertes,
      ownerName: profile?.full_name ?? "Propriétaire",
      generatedAt: new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    const filename = `passeport-${sanitizeFilename(vehicle.plaque_immatriculation)}-${nowIso.slice(0, 10)}.pdf`;
    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("generate-pdf unexpected error", err);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});