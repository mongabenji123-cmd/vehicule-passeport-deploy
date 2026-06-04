export type HealthStatus = "bon" | "attention" | "urgent";

export interface HealthScore {
  status: HealthStatus;
  label: string;
  color: string;
  score: number;
  urgentCount: number;
  warningCount: number;
}

export function computeHealthScore(
  alerts: any[],
  kilometrageActuel: number
): HealthScore {
  const unresolvedAlerts = alerts.filter((a) => !a.est_resolue);
  let urgentCount = 0;
  let warningCount = 0;
  const today = new Date();

  unresolvedAlerts.forEach((alert) => {
    if (alert.km_declencheur) {
      if (kilometrageActuel >= alert.km_declencheur) {
        urgentCount++;
      } else if (kilometrageActuel >= alert.km_declencheur - 1000) {
        warningCount++;
      }
    }
    if (alert.date_seuil) {
      const seuil = new Date(alert.date_seuil);
      const daysLeft = Math.floor(
        (seuil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysLeft <= 0) urgentCount++;
      else if (daysLeft <= 30) warningCount++;
    }
    // If alert has niveau_urgence but no specific threshold
    if (!alert.km_declencheur && !alert.date_seuil) {
      if (alert.niveau_urgence === 'critical' || alert.niveau_urgence === 'urgent') {
        urgentCount++;
      } else {
        warningCount++;
      }
    }
  });

  if (urgentCount > 0) {
    return {
      status: "urgent",
      label: "Urgent",
      color: "hsl(var(--destructive))",
      score: Math.max(0, 100 - urgentCount * 30),
      urgentCount,
      warningCount,
    };
  }
  if (warningCount > 0) {
    return {
      status: "attention",
      label: "Attention",
      color: "hsl(var(--accent))",
      score: Math.max(40, 100 - warningCount * 15),
      urgentCount,
      warningCount,
    };
  }
  return {
    status: "bon",
    label: "Bon état",
    color: "hsl(var(--success))",
    score: 100,
    urgentCount: 0,
    warningCount: 0,
  };
}
