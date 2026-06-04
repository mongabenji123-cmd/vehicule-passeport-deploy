import {
  Document, Page, View, Text, StyleSheet,
} from "@react-pdf/renderer";
import type { ComponentType, ReactNode } from "react";

const PdfDocument = Document as unknown as ComponentType<{ children?: ReactNode; title?: string; author?: string; subject?: string }>;
const PdfPage = Page as unknown as ComponentType<{ children?: ReactNode; size?: string; style?: unknown }>;
const PdfView = View as unknown as ComponentType<{ children?: ReactNode; style?: unknown; fixed?: boolean }>;
const PdfText = Text as unknown as ComponentType<{ children?: ReactNode; style?: unknown }>;

// ── Types ─────────────────────────────────────────────────────
type PDFVehicle = {
  marque: string;
  modele: string;
  annee: number | null;
  plaque_immatriculation: string;
  couleur: string | null;
  kilometrage_actuel: number | null;
};

type PDFIntervention = {
  id: string;
  type_service: string;
  description_travaux: string | null;
  kilometrage_au_moment_rdv: number;
  montant_facture: number | null;
  date_intervention: string | null;
  garages?: { nom_garage: string; commune: string | null; est_certifie?: boolean | null } | null;
};

type PDFAlert = {
  id: string;
  type_alerte: string;
  km_declencheur: number | null;
  titre: string;
  niveau_urgence: string | null;
  est_resolue: boolean | null;
};

interface VehiclePassportPDFProps {
  vehicle: PDFVehicle;
  interventions: PDFIntervention[];
  alerts: PDFAlert[];
  ownerName: string;
  generatedAt: string;
}

// ── Styles ────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 48,
    paddingRight: 48,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#0A0A0F",
  },
  logoText: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0F",
    letterSpacing: 2,
  },
  logoSub: {
    fontSize: 8,
    color: "#64748B",
    marginTop: 2,
    letterSpacing: 1,
  },
  headerRight: { alignItems: "flex-end" },
  certBadge: {
    backgroundColor: "#0A0A0F",
    color: "#FFFFFF",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateText: { fontSize: 8, color: "#94A3B8" },
  docTitle: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0F",
    marginBottom: 4,
    letterSpacing: 1,
  },
  docSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 24,
  },
  sectionBlock: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#0A0A0F",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  sectionHeaderText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  sectionBody: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoCell: {
    width: "50%",
    paddingVertical: 6,
    paddingRight: 12,
  },
  infoLabel: {
    fontSize: 7,
    color: "#94A3B8",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: "#0A0A0F",
    fontFamily: "Helvetica-Bold",
  },
  infoValueMono: {
    fontSize: 11,
    color: "#0A0A0F",
    fontFamily: "Helvetica",
  },
  kmBlock: {
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kmLabel: {
    fontSize: 7,
    color: "#94A3B8",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1,
  },
  kmValue: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0F",
  },
  kmUnit: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  colDate: { width: "15%", fontSize: 8 },
  colType: { width: "22%", fontSize: 8 },
  colDesc: { width: "35%", fontSize: 8 },
  colKm: { width: "14%", fontSize: 8, textAlign: "right" as const },
  colCout: { width: "14%", fontSize: 8, textAlign: "right" as const },
  thText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#64748B",
    letterSpacing: 0.8,
  },
  tdText: { fontSize: 8, color: "#1E293B" },
  tdMono: { fontSize: 8, color: "#334155", fontFamily: "Helvetica" },
  tdGarage: { fontSize: 7, color: "#94A3B8", marginTop: 1 },
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  alertBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
  },
  alertType: { fontSize: 9, color: "#0A0A0F", fontFamily: "Helvetica-Bold", flex: 1 },
  alertDetail: { fontSize: 8, color: "#64748B" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  footerText: { fontSize: 7, color: "#94A3B8" },
  footerBold: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#64748B" },
  emptyText: { fontSize: 9, color: "#94A3B8", textAlign: "center" as const, paddingVertical: 16 },
  noAlertText: { fontSize: 9, color: "#10B981", textAlign: "center" as const, paddingVertical: 10 },
});

// ── Helpers ───────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getAlertStatus(alert: PDFAlert, kmActuel: number) {
  if (alert.km_declencheur) {
    const diff = alert.km_declencheur - kmActuel;
    if (diff <= 0) return { label: "DEPASSE", color: "#EF4444", bg: "#FEF2F2" };
    if (diff <= 1000) return { label: "BIENTOT", color: "#D97706", bg: "#FFFBEB" };
    return { label: "OK", color: "#10B981", bg: "#F0FDF4" };
  }
  return { label: "OK", color: "#10B981", bg: "#F0FDF4" };
}

function getAlertDetail(alert: PDFAlert, kmActuel: number): string {
  if (alert.km_declencheur) {
    const diff = alert.km_declencheur - kmActuel;
    return diff > 0
      ? `${diff.toLocaleString("fr-FR")} km restants`
      : `Depasse de ${Math.abs(diff).toLocaleString("fr-FR")} km`;
  }
  return "—";
}

// ── Composant PDF principal ───────────────────────────────────
export function VehiclePassportPDF({
  vehicle,
  interventions,
  alerts,
  ownerName,
  generatedAt,
}: VehiclePassportPDFProps) {
  const activeAlerts = alerts.filter((a) => !a.est_resolue);
  const km = vehicle.kilometrage_actuel ?? 0;

  return (
    <PdfDocument
      title={`Passeport - ${vehicle.marque} ${vehicle.modele} - ${vehicle.plaque_immatriculation}`}
      author="Auto-Passeport"
      subject="Passeport numerique certifie"
    >
      <PdfPage size="A4" style={S.page}>
        {/* HEADER */}
        <PdfView style={S.header}>
          <PdfView>
            <PdfText style={S.logoText}>AUTO-PASSEPORT</PdfText>
            <PdfText style={S.logoSub}>LE PASSEPORT NUMERIQUE DE VOTRE VEHICULE</PdfText>
          </PdfView>
          <PdfView style={S.headerRight}>
            <PdfText style={S.certBadge}>Document certifie</PdfText>
            <PdfText style={S.dateText}>Genere le {generatedAt}</PdfText>
            <PdfText style={S.dateText}>Proprietaire : {ownerName}</PdfText>
          </PdfView>
        </PdfView>

        {/* TITRE */}
        <PdfText style={S.docTitle}>
          {vehicle.marque} {vehicle.modele}
        </PdfText>
        <PdfText style={S.docSubtitle}>
          Passeport numerique complet — {vehicle.annee ?? "—"} · {vehicle.plaque_immatriculation}
          {vehicle.couleur ? ` · ${vehicle.couleur}` : ""}
        </PdfText>

        {/* SECTION 1 : INFOS */}
        <PdfView style={S.sectionBlock}>
          <PdfView style={S.sectionHeader}>
            <PdfText style={S.sectionHeaderText}>INFORMATIONS DU VEHICULE</PdfText>
          </PdfView>
          <PdfView style={S.sectionBody}>
            <PdfView style={S.infoGrid}>
              <PdfView style={S.infoCell}>
                <PdfText style={S.infoLabel}>MARQUE</PdfText>
                <PdfText style={S.infoValue}>{vehicle.marque}</PdfText>
              </PdfView>
              <PdfView style={S.infoCell}>
                <PdfText style={S.infoLabel}>MODELE</PdfText>
                <PdfText style={S.infoValue}>{vehicle.modele}</PdfText>
              </PdfView>
              <PdfView style={S.infoCell}>
                <PdfText style={S.infoLabel}>ANNEE</PdfText>
                <PdfText style={S.infoValue}>{vehicle.annee ?? "—"}</PdfText>
              </PdfView>
              <PdfView style={S.infoCell}>
                <PdfText style={S.infoLabel}>COULEUR</PdfText>
                <PdfText style={S.infoValue}>{vehicle.couleur ?? "—"}</PdfText>
              </PdfView>
              <PdfView style={S.infoCell}>
                <PdfText style={S.infoLabel}>IMMATRICULATION</PdfText>
                <PdfText style={S.infoValueMono}>{vehicle.plaque_immatriculation}</PdfText>
              </PdfView>
            </PdfView>
            <PdfView style={S.kmBlock}>
              <PdfView>
                <PdfText style={S.kmLabel}>KILOMETRAGE ACTUEL</PdfText>
                <PdfText style={S.kmValue}>
                  {km.toLocaleString("fr-FR")}
                  <PdfText style={S.kmUnit}> km</PdfText>
                </PdfText>
              </PdfView>
            </PdfView>
          </PdfView>
        </PdfView>

        {/* SECTION 2 : ALERTES */}
        <PdfView style={S.sectionBlock}>
          <PdfView style={S.sectionHeader}>
            <PdfText style={S.sectionHeaderText}>ALERTES ACTIVES ({activeAlerts.length})</PdfText>
          </PdfView>
          <PdfView style={S.sectionBody}>
            {activeAlerts.length === 0 ? (
              <PdfText style={S.noAlertText}>Aucune alerte active — vehicule en bon etat</PdfText>
            ) : (
              activeAlerts.map((alert) => {
                const status = getAlertStatus(alert, km);
                return (
                  <PdfView key={alert.id} style={S.alertRow}>
                    <PdfText style={[S.alertBadge, { color: status.color, backgroundColor: status.bg }]}>
                      {status.label}
                    </PdfText>
                    <PdfText style={S.alertType}>{alert.titre}</PdfText>
                    <PdfText style={S.alertDetail}>{getAlertDetail(alert, km)}</PdfText>
                  </PdfView>
                );
              })
            )}
          </PdfView>
        </PdfView>

        {/* SECTION 3 : INTERVENTIONS */}
        <PdfView style={S.sectionBlock}>
          <PdfView style={S.sectionHeader}>
            <PdfText style={S.sectionHeaderText}>HISTORIQUE DES INTERVENTIONS ({interventions.length})</PdfText>
          </PdfView>
          {interventions.length === 0 ? (
            <PdfView style={S.sectionBody}>
              <PdfText style={S.emptyText}>Aucune intervention enregistree</PdfText>
            </PdfView>
          ) : (
            <>
              <PdfView style={S.tableHeader}>
                <PdfText style={[S.colDate, S.thText]}>DATE</PdfText>
                <PdfText style={[S.colType, S.thText]}>TYPE</PdfText>
                <PdfText style={[S.colDesc, S.thText]}>DETAILS</PdfText>
                <PdfText style={[S.colKm, S.thText]}>KM</PdfText>
                <PdfText style={[S.colCout, S.thText]}>COUT</PdfText>
              </PdfView>
              {interventions.map((inv, index) => (
                <PdfView key={inv.id} style={index % 2 === 0 ? S.tableRow : S.tableRowAlt}>
                  <PdfText style={[S.colDate, S.tdMono]}>
                    {inv.date_intervention ? formatDate(inv.date_intervention) : "—"}
                  </PdfText>
                  <PdfText style={[S.colType, S.tdText]}>{inv.type_service}</PdfText>
                  <PdfView style={S.colDesc}>
                    <PdfText style={S.tdText}>
                      {inv.description_travaux
                        ? inv.description_travaux.slice(0, 80) + (inv.description_travaux.length > 80 ? "..." : "")
                        : "—"}
                    </PdfText>
                    {inv.garages && (
                      <PdfText style={S.tdGarage}>
                        {inv.garages.nom_garage}
                        {inv.garages.est_certifie ? " ✓" : ""}
                        {inv.garages.commune ? ` — ${inv.garages.commune}` : ""}
                      </PdfText>
                    )}
                  </PdfView>
                  <PdfText style={[S.colKm, S.tdMono]}>
                    {inv.kilometrage_au_moment_rdv.toLocaleString("fr-FR")}
                  </PdfText>
                  <PdfText style={[S.colCout, S.tdMono]}>
                    {inv.montant_facture != null ? `${inv.montant_facture.toFixed(2)} EUR` : "—"}
                  </PdfText>
                </PdfView>
              ))}
            </>
          )}
        </PdfView>

        {/* FOOTER */}
        <PdfView style={S.footer} fixed>
          <PdfText style={S.footerText}>
            Auto-Passeport · {vehicle.plaque_immatriculation} · {vehicle.marque} {vehicle.modele}
          </PdfText>
          <PdfText style={S.footerBold}>Document certifie Auto-Passeport</PdfText>
          <PdfText style={S.footerText}>{generatedAt}</PdfText>
        </PdfView>
      </PdfPage>
    </PdfDocument>
  );
}
