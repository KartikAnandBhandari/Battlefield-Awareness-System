import { describe, it, expect } from "vitest";
import {
  deriveSituationSummary,
  enrichUnits,
  deriveRiskMetrics,
  deriveActiveProblems,
} from "@/lib/dashboardUtils";
import type { Unit, RiskIndicator, EnvironmentalData } from "@/lib/simulationEngine";

// ── Helpers ───────────────────────────────────────────────────

function makeUnit(overrides: Partial<Unit> = {}): Unit {
  return {
    id: "UNIT-1",
    name: "Test Unit",
    type: "infantry",
    lat: 0,
    lng: 0,
    filteredLat: 0,
    filteredLng: 0,
    rawLat: 0,
    rawLng: 0,
    status: "active",
    personnel: 100,
    health: 80,
    ammo: 80,
    fuel: 80,
    threatLevel: "low",
    vulnerability: 10,
    speed: 20,
    direction: 0,
    communicationLink: "strong",
    lastUpdate: new Date(),
    ...overrides,
  };
}

function makeRiskIndicator(overrides: Partial<RiskIndicator> = {}): RiskIndicator {
  return {
    unitId: "UNIT-1",
    threatLevel: "low",
    vulnerability: 10,
    riskScore: 20,
    factors: ["Factor A"],
    ...overrides,
  };
}

// ── deriveSituationSummary ────────────────────────────────────

describe("deriveSituationSummary", () => {
  it("cold start: empty units returns uplink banner, zero risk, empty arrays", () => {
    const result = deriveSituationSummary([], [], []);
    expect(result.bannerText).toBe("Establishing uplink…");
    expect(result.overallRisk).toBe(0);
    expect(result.criticalUnits).toEqual([]);
    expect(result.warningUnits).toEqual([]);
  });

  it("all-critical scenario: criticalUnits.length equals units.length", () => {
    const units = [
      makeUnit({ id: "U-1", status: "critical" }),
      makeUnit({ id: "U-2", status: "critical" }),
      makeUnit({ id: "U-3", status: "critical" }),
    ];
    const result = deriveSituationSummary(units, [], []);
    expect(result.criticalUnits.length).toBe(units.length);
    expect(result.warningUnits.length).toBe(0);
  });

  it("empty riskIndicators: overallRisk is 0", () => {
    const units = [makeUnit()];
    const result = deriveSituationSummary(units, [], []);
    expect(result.overallRisk).toBe(0);
  });
});

// ── enrichUnits ───────────────────────────────────────────────

describe("enrichUnits", () => {
  it("riskScore > 70 gets riskColor 'red'", () => {
    const unit = makeUnit({ id: "U-1" });
    const indicator = makeRiskIndicator({ unitId: "U-1", riskScore: 85 });
    const [enriched] = enrichUnits([unit], [indicator]);
    expect(enriched.riskColor).toBe("red");
  });

  it("riskScore 41–70 gets riskColor 'amber'", () => {
    const unit = makeUnit({ id: "U-1" });
    const indicator = makeRiskIndicator({ unitId: "U-1", riskScore: 55 });
    const [enriched] = enrichUnits([unit], [indicator]);
    expect(enriched.riskColor).toBe("amber");
  });

  it("riskScore <= 40 gets riskColor 'green'", () => {
    const unit = makeUnit({ id: "U-1" });
    const indicator = makeRiskIndicator({ unitId: "U-1", riskScore: 40 });
    const [enriched] = enrichUnits([unit], [indicator]);
    expect(enriched.riskColor).toBe("green");
  });

  it("unit with no matching riskIndicator gets riskScore 0, riskColor 'green', topFactor ''", () => {
    const unit = makeUnit({ id: "U-1" });
    const [enriched] = enrichUnits([unit], []);
    expect(enriched.riskScore).toBe(0);
    expect(enriched.riskColor).toBe("green");
    expect(enriched.topFactor).toBe("");
  });

  it("unit with empty factors gets topFactor ''", () => {
    const unit = makeUnit({ id: "U-1" });
    const indicator = makeRiskIndicator({ unitId: "U-1", riskScore: 50, factors: [] });
    const [enriched] = enrichUnits([unit], [indicator]);
    expect(enriched.topFactor).toBe("");
  });
});

// ── deriveRiskMetrics ─────────────────────────────────────────

describe("deriveRiskMetrics", () => {
  it("always returns exactly 5 entries", () => {
    const result = deriveRiskMetrics([], [], []);
    expect(result.length).toBe(5);
  });

  it("empty units + empty environmentalData: all values are 0", () => {
    const result = deriveRiskMetrics([], [], []);
    result.forEach((metric) => {
      expect(metric.value).toBe(0);
    });
  });

  it("values are clamped to [0, 100]", () => {
    const units = [
      makeUnit({ id: "U-1", health: 200, ammo: 200, fuel: 200 }),
    ];
    const indicators = [makeRiskIndicator({ unitId: "U-1", riskScore: 150 })];
    const envData: EnvironmentalData[] = [
      { location: { lat: 0, lng: 0 }, weather: "clear", visibility: 200, terrain: "flat", temperature: 20 },
    ];
    const result = deriveRiskMetrics(units, envData, indicators);
    result.forEach((metric) => {
      expect(metric.value).toBeGreaterThanOrEqual(0);
      expect(metric.value).toBeLessThanOrEqual(100);
    });
  });
});

// ── deriveActiveProblems ──────────────────────────────────────

describe("deriveActiveProblems", () => {
  it("empty units: returns []", () => {
    expect(deriveActiveProblems([], [])).toEqual([]);
  });

  it("only active units: returns []", () => {
    const units = [
      makeUnit({ id: "U-1", status: "active" }),
      makeUnit({ id: "U-2", status: "active" }),
    ];
    expect(deriveActiveProblems(units, [])).toEqual([]);
  });

  it("mix of critical/warning/active: only critical and warning included", () => {
    const units = [
      makeUnit({ id: "U-1", status: "critical" }),
      makeUnit({ id: "U-2", status: "active" }),
      makeUnit({ id: "U-3", status: "warning" }),
    ];
    const problems = deriveActiveProblems(units, []);
    const ids = problems.map((p) => p.unitId);
    expect(ids).toContain("U-1");
    expect(ids).toContain("U-3");
    expect(ids).not.toContain("U-2");
  });

  it("critical units appear before warning units in result", () => {
    const units = [
      makeUnit({ id: "U-1", name: "Warning Unit", status: "warning" }),
      makeUnit({ id: "U-2", name: "Critical Unit", status: "critical" }),
    ];
    const problems = deriveActiveProblems(units, []);
    expect(problems[0].severity).toBe("critical");
    expect(problems[1].severity).toBe("warning");
  });
});

// ── Property-Based Tests (fast-check) ────────────────────────
// Validates: Requirements 1.1–1.6

import * as fc from "fast-check";

// ── Arbitraries ───────────────────────────────────────────────

const unitStatusArb = fc.constantFrom("active", "warning", "critical", "idle" as const);
const communicationLinkArb = fc.constantFrom("strong", "weak", "lost" as const);
const threatLevelArb = fc.constantFrom("low", "medium", "high", "critical" as const);
const unitTypeArb = fc.constantFrom("infantry", "armor", "air", "logistics", "recon", "medic" as const);

const unitArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  type: unitTypeArb,
  lat: fc.float({ min: -90, max: 90, noNaN: true }),
  lng: fc.float({ min: -180, max: 180, noNaN: true }),
  filteredLat: fc.float({ min: -90, max: 90, noNaN: true }),
  filteredLng: fc.float({ min: -180, max: 180, noNaN: true }),
  rawLat: fc.float({ min: -90, max: 90, noNaN: true }),
  rawLng: fc.float({ min: -180, max: 180, noNaN: true }),
  status: unitStatusArb,
  personnel: fc.integer({ min: 0, max: 500 }),
  health: fc.float({ min: 0, max: 100, noNaN: true }),
  ammo: fc.float({ min: 0, max: 100, noNaN: true }),
  fuel: fc.float({ min: 0, max: 100, noNaN: true }),
  threatLevel: threatLevelArb,
  vulnerability: fc.float({ min: 0, max: 100, noNaN: true }),
  speed: fc.float({ min: 0, max: 100, noNaN: true }),
  direction: fc.float({ min: 0, max: 360, noNaN: true }),
  communicationLink: communicationLinkArb,
  morale: fc.float({ min: 0, max: 100, noNaN: true }),
  lastUpdate: fc.date(),
});

const riskIndicatorArb = (unitId: string) =>
  fc.record({
    unitId: fc.constant(unitId),
    threatLevel: threatLevelArb,
    vulnerability: fc.float({ min: 0, max: 100, noNaN: true }),
    riskScore: fc.float({ min: 0, max: 100, noNaN: true }),
    factors: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
  });

const recommendationArb = fc.record({
  id: fc.uuid(),
  timestamp: fc.date(),
  unitId: fc.uuid(),
  type: fc.constantFrom("evacuation", "defense", "movement", "reinforcement", "supply", "recon" as const),
  title: fc.string({ minLength: 1, maxLength: 40 }),
  description: fc.string({ minLength: 1, maxLength: 80 }),
  rationale: fc.string({ minLength: 1, maxLength: 80 }),
  priority: fc.constantFrom("low", "medium", "high", "critical" as const),
  confidence: fc.float({ min: 0, max: 100, noNaN: true }),
});

const environmentalDataArb = fc.record({
  location: fc.record({
    lat: fc.float({ min: -90, max: 90, noNaN: true }),
    lng: fc.float({ min: -180, max: 180, noNaN: true }),
  }),
  weather: fc.constantFrom("clear", "fog", "rain", "storm", "snow" as const),
  visibility: fc.float({ min: 0, max: 100, noNaN: true }),
  terrain: fc.constantFrom("flat", "forest", "urban", "mountain", "water" as const),
  temperature: fc.float({ min: -50, max: 60, noNaN: true }),
});

// ── Property 1: bannerText is always non-empty ────────────────
// Validates: Requirements 1.1

describe("Property 1 — deriveSituationSummary bannerText is always non-empty", () => {
  it("returns a non-empty bannerText for any combination of inputs", () => {
    fc.assert(
      fc.property(
        fc.array(unitArb, { maxLength: 10 }),
        fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { maxLength: 10 }),
        fc.array(recommendationArb, { maxLength: 5 }),
        (units, riskScores, recommendations) => {
          // Build matching riskIndicators for the generated units
          const riskIndicators = units.map((u, i) => ({
            unitId: u.id,
            threatLevel: u.threatLevel,
            vulnerability: u.vulnerability,
            riskScore: riskScores[i % riskScores.length] ?? 0,
            factors: [],
          }));
          const result = deriveSituationSummary(units, riskIndicators, recommendations);
          return typeof result.bannerText === "string" && result.bannerText.length > 0;
        }
      )
    );
  });
});

// ── Property 2: overallRisk is always in [0, 100] ─────────────
// Validates: Requirements 1.2

describe("Property 2 — deriveSituationSummary overallRisk is in [0, 100]", () => {
  it("overallRisk is always between 0 and 100 inclusive", () => {
    fc.assert(
      fc.property(
        fc.array(unitArb, { maxLength: 10 }),
        fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { maxLength: 10 }),
        (units, riskScores) => {
          const riskIndicators = units.map((u, i) => ({
            unitId: u.id,
            threatLevel: u.threatLevel,
            vulnerability: u.vulnerability,
            riskScore: riskScores[i % riskScores.length] ?? 0,
            factors: [],
          }));
          const result = deriveSituationSummary(units, riskIndicators, []);
          return result.overallRisk >= 0 && result.overallRisk <= 100;
        }
      )
    );
  });
});

// ── Property 3: every critical unit appears in criticalUnits ──
// Validates: Requirements 1.3

describe("Property 3 — deriveSituationSummary criticalUnits completeness", () => {
  it("every unit with status 'critical' is included in criticalUnits", () => {
    fc.assert(
      fc.property(fc.array(unitArb, { maxLength: 10 }), (units) => {
        const result = deriveSituationSummary(units, [], []);
        const criticalIds = new Set(result.criticalUnits.map((u) => u.id));
        return units
          .filter((u) => u.status === "critical")
          .every((u) => criticalIds.has(u.id));
      })
    );
  });
});

// ── Property 4: enrichUnits riskColor is always red/amber/green
// Validates: Requirements 1.4

describe("Property 4 — enrichUnits riskColor is always 'red', 'amber', or 'green'", () => {
  it("riskColor is exactly one of the three valid values for any unit and riskScore", () => {
    const validColors = new Set(["red", "amber", "green"]);
    fc.assert(
      fc.property(
        unitArb,
        fc.float({ min: 0, max: 100, noNaN: true }),
        (unit, riskScore) => {
          const indicator = {
            unitId: unit.id,
            threatLevel: unit.threatLevel,
            vulnerability: unit.vulnerability,
            riskScore,
            factors: [],
          };
          const [enriched] = enrichUnits([unit], [indicator]);
          return validColors.has(enriched.riskColor);
        }
      )
    );
  });
});

// ── Property 5: deriveRiskMetrics returns exactly 5 entries in [0, 100]
// Validates: Requirements 1.5

describe("Property 5 — deriveRiskMetrics returns exactly 5 entries each with value in [0, 100]", () => {
  it("always returns exactly 5 metrics with values in [0, 100]", () => {
    fc.assert(
      fc.property(
        fc.array(unitArb, { maxLength: 10 }),
        fc.array(environmentalDataArb, { maxLength: 5 }),
        fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { maxLength: 10 }),
        (units, environmentalData, riskScores) => {
          const riskIndicators = units.map((u, i) => ({
            unitId: u.id,
            threatLevel: u.threatLevel,
            vulnerability: u.vulnerability,
            riskScore: riskScores[i % riskScores.length] ?? 0,
            factors: [],
          }));
          const metrics = deriveRiskMetrics(units, environmentalData, riskIndicators);
          return (
            metrics.length === 5 &&
            metrics.every((m) => m.value >= 0 && m.value <= 100)
          );
        }
      )
    );
  });
});

// ── Property 6: deriveActiveProblems coverage and sort order ──
// Validates: Requirements 1.6

describe("Property 6 — deriveActiveProblems coverage and sort order", () => {
  it("includes a problem for every critical/warning unit and all critical entries precede warning entries", () => {
    fc.assert(
      fc.property(fc.array(unitArb, { maxLength: 10 }), (units) => {
        const problems = deriveActiveProblems(units, []);

        // Coverage: every critical or warning unit must appear
        const problemIds = new Set(problems.map((p) => p.unitId));
        const allCovered = units
          .filter((u) => u.status === "critical" || u.status === "warning")
          .every((u) => problemIds.has(u.id));

        // Sort order: no warning entry appears before a critical entry
        let seenWarning = false;
        let orderValid = true;
        for (const p of problems) {
          if (p.severity === "warning") seenWarning = true;
          if (p.severity === "critical" && seenWarning) {
            orderValid = false;
            break;
          }
        }

        return allCovered && orderValid;
      })
    );
  });
});
