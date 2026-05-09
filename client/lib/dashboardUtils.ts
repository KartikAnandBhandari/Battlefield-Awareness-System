import type {
  Unit,
  RiskIndicator,
  EnvironmentalData,
  DecisionRecommendation,
} from "@/lib/simulationEngine";

// ── Interfaces ────────────────────────────────────────────────

export interface ActiveProblem {
  unitId: string;
  unitName: string;
  severity: "critical" | "warning";
  summary: string;
}

export interface DerivedSituationSummary {
  bannerText: string;
  overallRisk: number; // 0–100
  criticalUnits: Unit[];
  warningUnits: Unit[];
  topProblems: ActiveProblem[];
  dominantSector: string | null;
}

export interface EnrichedUnit extends Unit {
  riskScore: number;
  riskColor: "red" | "amber" | "green";
  topFactor: string;
}

export interface RiskMetric {
  label: string;
  value: number;
  inverted: boolean;
}

// ── Helpers ───────────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// ── deriveSituationSummary ────────────────────────────────────

export function deriveSituationSummary(
  units: Unit[],
  riskIndicators: RiskIndicator[],
  recommendations: DecisionRecommendation[]
): DerivedSituationSummary {
  if (units.length === 0) {
    return {
      bannerText: "Establishing uplink…",
      overallRisk: 0,
      criticalUnits: [],
      warningUnits: [],
      topProblems: [],
      dominantSector: null,
    };
  }

  const overallRisk = clamp(
    riskIndicators.length > 0
      ? Math.round(avg(riskIndicators.map((r) => r.riskScore)))
      : 0
  );

  const criticalUnits = units.filter((u) => u.status === "critical");
  const warningUnits = units.filter((u) => u.status === "warning");

  const topProblems = deriveActiveProblems(
    units.filter((u) => u.status === "critical" || u.status === "warning"),
    riskIndicators
  );

  const icon =
    overallRisk > 70 ? "🔴" : overallRisk >= 40 ? "⚠️" : "✅";
  const riskLabel =
    overallRisk > 70
      ? "High Risk"
      : overallRisk >= 40
      ? "Moderate Risk"
      : "Nominal";

  const weakCommsCount = units.filter(
    (u) => u.communicationLink !== "strong"
  ).length;

  const topRecType =
    recommendations.length > 0 ? recommendations[0].type : "No Actions";

  const bannerText = `${icon} ${riskLabel} — ${criticalUnits.length} Units Critical • ${weakCommsCount} Comms Weak • ${topRecType}`;

  return {
    bannerText,
    overallRisk,
    criticalUnits,
    warningUnits,
    topProblems,
    dominantSector: null,
  };
}

// ── enrichUnits ───────────────────────────────────────────────

export function enrichUnits(
  units: Unit[],
  riskIndicators: RiskIndicator[]
): EnrichedUnit[] {
  const indicatorMap = new Map(riskIndicators.map((r) => [r.unitId, r]));

  return units.map((unit) => {
    const indicator = indicatorMap.get(unit.id);
    const riskScore = indicator ? indicator.riskScore : 0;
    const riskColor: "red" | "amber" | "green" =
      riskScore > 70 ? "red" : riskScore > 40 ? "amber" : "green";
    const topFactor =
      indicator && indicator.factors.length > 0 ? indicator.factors[0] : "";

    return { ...unit, riskScore, riskColor, topFactor };
  });
}

// ── deriveRiskMetrics ─────────────────────────────────────────

export function deriveRiskMetrics(
  units: Unit[],
  environmentalData: EnvironmentalData[],
  riskIndicators: RiskIndicator[]
): RiskMetric[] {
  const enriched = enrichUnits(units, riskIndicators);

  const threatLevel = clamp(
    Math.round(avg(enriched.map((u) => u.riskScore)))
  );

  const unitReadiness = clamp(
    Math.round(avg(units.map((u) => u.health)))
  );

  const supplies = clamp(
    Math.round(avg(units.map((u) => (u.ammo + u.fuel) / 2)))
  );

  const strongCommsCount = units.filter(
    (u) => u.communicationLink === "strong"
  ).length;
  const communication = clamp(
    units.length > 0 ? Math.round((strongCommsCount / units.length) * 100) : 0
  );

  const visibility = clamp(
    Math.round(avg(environmentalData.map((e) => e.visibility)))
  );

  return [
    { label: "Threat Level", value: threatLevel, inverted: true },
    { label: "Unit Readiness", value: unitReadiness, inverted: false },
    { label: "Supplies", value: supplies, inverted: false },
    { label: "Communication", value: communication, inverted: false },
    { label: "Visibility", value: visibility, inverted: false },
  ];
}

// ── deriveActiveProblems ──────────────────────────────────────

export function deriveActiveProblems(
  units: Unit[],
  riskIndicators: RiskIndicator[]
): ActiveProblem[] {
  const indicatorMap = new Map(riskIndicators.map((r) => [r.unitId, r]));

  const problemUnits = units.filter(
    (u) => u.status === "critical" || u.status === "warning"
  );

  const problems: ActiveProblem[] = problemUnits.map((unit) => {
    const indicator = indicatorMap.get(unit.id);
    const summary =
      indicator && indicator.factors.length > 0
        ? indicator.factors[0]
        : "No specific factor identified";

    return {
      unitId: unit.id,
      unitName: unit.name,
      severity: unit.status as "critical" | "warning",
      summary,
    };
  });

  // Sort: critical before warning
  return problems.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === "critical" ? -1 : 1;
  });
}
