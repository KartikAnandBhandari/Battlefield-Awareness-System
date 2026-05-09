# Requirements Document

## Project Information

**Students:**
- Kartik Anand Bhandari — 500122458
- Ayushman Naresh — 500120529

**Professor:** Abhishek Roshan

---

## Introduction

The dashboard redesign replaces the current visually complex operational dashboard with a clarity-first layout that answers four questions at a glance: **What is happening? Where? How bad? What to do?** The redesign retains the existing React 18 + TypeScript + TailwindCSS 3 stack and the `simulationEngine` data layer without modification. Only the presentation layer changes: `Dashboard.tsx`, `OperationalMap.tsx`, and a set of new focused sub-components replace the current layout.

## Glossary

- **Dashboard**: The root `Dashboard.tsx` component that orchestrates all sub-components and polls the simulation engine.
- **SituationBanner**: A read-only top-bar strip that displays a one-line situational summary, overall risk level, and system timestamp.
- **MapPanel**: The dominant center element wrapping `OperationalMap` with enriched marker rendering and sector zone overlays.
- **OperationalMap**: The existing Leaflet-based map component, enhanced with risk-colored markers and zone polygons.
- **UnitPopup**: A structured mini-report card rendered as a map overlay when a unit marker is clicked.
- **RiskBreakdown**: A right-side panel showing five fleet-wide metrics as labeled CSS progress bars (no chart library).
- **UnitRoster**: A compact scrollable list of all units below `RiskBreakdown`, sorted by severity.
- **ProblemsFeed**: A bottom-left panel showing only active critical and warning problems in plain English.
- **ActionsPanel**: A bottom-right panel showing the top recommended actions from the simulation engine.
- **SimulationEngine**: The existing `simulationEngine` singleton — the sole data source; not modified by this feature.
- **DerivedSituationSummary**: A pure-function output computed in `Dashboard.tsx` from raw simulation data.
- **EnrichedUnit**: A `Unit` extended with `riskScore`, `riskColor`, and `topFactor` fields for map rendering.
- **RiskMetric**: A single labeled metric with a value in `[0, 100]` and an `inverted` flag used by `RiskBreakdown`.
- **ActiveProblem**: A plain-English problem entry derived from a critical or warning unit and its top risk factor.

---

## Requirements

### Requirement 1: Situation Banner

**User Story:** As an operator, I want a single-line situational summary pinned to the top of the screen, so that I can immediately understand the current threat level without scanning the entire dashboard.

#### Acceptance Criteria

1. WHEN the dashboard renders with no units loaded, THE SituationBanner SHALL display the text "Establishing uplink…" with a neutral background color.
2. WHEN `overallRisk` is greater than 70, THE SituationBanner SHALL render with a red background.
3. WHEN `overallRisk` is between 40 and 70 inclusive, THE SituationBanner SHALL render with an amber background.
4. WHEN `overallRisk` is less than 40, THE SituationBanner SHALL render with a neutral background.
5. THE SituationBanner SHALL display the current system timestamp on the right side.
6. WHEN `criticalCount` is greater than 0, THE SituationBanner SHALL apply a pulse visual highlight.
7. THE SituationBanner SHALL contain no interactive elements — it is a read-only status strip.

---

### Requirement 2: Dashboard Data Flow

**User Story:** As an operator, I want the dashboard to stay current with live simulation data, so that I always see the latest unit positions, risk levels, and recommendations.

#### Acceptance Criteria

1. THE Dashboard SHALL poll `simulationEngine` at a 1-second interval to retrieve `units`, `riskIndicators`, `recommendations`, and `alerts`.
2. WHEN each polling tick fires, THE Dashboard SHALL compute a `DerivedSituationSummary` from the latest `units` and `riskIndicators`.
3. WHEN the `selectedUnit` ID is no longer present in the current `units` array, THE Dashboard SHALL set `selectedUnit` to `null`.
4. THE Dashboard SHALL pass `DerivedSituationSummary` data to `SituationBanner`, `MapPanel`, `RiskBreakdown`, `ProblemsFeed`, and `ActionsPanel` as props.

---

### Requirement 3: Situation Summary Derivation

**User Story:** As a developer, I want a pure `deriveSituationSummary` function, so that the dashboard's top-level state can be computed deterministically and tested in isolation.

#### Acceptance Criteria

1. THE `deriveSituationSummary` function SHALL always return a non-empty `bannerText` string regardless of input state.
2. THE `deriveSituationSummary` function SHALL always return an `overallRisk` value in the range `[0, 100]`.
3. THE `deriveSituationSummary` function SHALL include every unit whose `status` is `"critical"` in the `criticalUnits` array.
4. THE `deriveSituationSummary` function SHALL include every unit whose `status` is `"warning"` in the `warningUnits` array.
5. THE `deriveSituationSummary` function SHALL derive `topProblems` by selecting the first entry of `riskIndicator.factors` for each critical or warning unit.

---

### Requirement 4: Unit Enrichment

**User Story:** As a developer, I want an `enrichUnits` pure function, so that map markers can be rendered with consistent risk-color coding derived from simulation data.

#### Acceptance Criteria

1. THE `enrichUnits` function SHALL always assign `riskColor` as one of `"red"`, `"amber"`, or `"green"` — never `undefined` or any other value.
2. WHEN a unit's `riskScore` is greater than 70, THE `enrichUnits` function SHALL assign `riskColor` as `"red"`.
3. WHEN a unit's `riskScore` is greater than 40 and at most 70, THE `enrichUnits` function SHALL assign `riskColor` as `"amber"`.
4. WHEN a unit's `riskScore` is 40 or less, THE `enrichUnits` function SHALL assign `riskColor` as `"green"`.
5. THE `enrichUnits` function SHALL assign `topFactor` from `riskIndicator.factors[0]`, or an empty string when `factors` is empty.

---

### Requirement 5: Risk Metrics Derivation

**User Story:** As a developer, I want a pure `deriveRiskMetrics` function, so that the five fleet-wide metrics displayed in `RiskBreakdown` are computed consistently and testably.

#### Acceptance Criteria

1. THE `deriveRiskMetrics` function SHALL always return exactly 5 `RiskMetric` entries.
2. THE `deriveRiskMetrics` function SHALL always return `RiskMetric.value` clamped to the range `[0, 100]`.
3. THE `deriveRiskMetrics` function SHALL compute the "Threat Level" metric as the average `riskScore` across all units, with `inverted` set to `true`.
4. THE `deriveRiskMetrics` function SHALL compute the "Unit Readiness" metric as the average `health` across all units, with `inverted` set to `false`.
5. THE `deriveRiskMetrics` function SHALL compute the "Supplies" metric as the average of `(ammo + fuel) / 2` across all units, with `inverted` set to `false`.
6. THE `deriveRiskMetrics` function SHALL compute the "Communication" metric as the percentage of units with `communicationLink === "strong"` multiplied by 100, with `inverted` set to `false`.
7. THE `deriveRiskMetrics` function SHALL compute the "Visibility" metric as the average `visibility` from `environmentalData`, with `inverted` set to `false`.

---

### Requirement 6: Active Problems Derivation

**User Story:** As a developer, I want a pure `deriveActiveProblems` function, so that the `ProblemsFeed` always shows a correctly sorted, plain-English list of current issues.

#### Acceptance Criteria

1. THE `deriveActiveProblems` function SHALL return a problem entry for every unit with `status === "critical"` or `status === "warning"`.
2. THE `deriveActiveProblems` function SHALL sort the returned problems with `severity === "critical"` entries before `severity === "warning"` entries.
3. THE `deriveActiveProblems` function SHALL derive each problem's `summary` from the unit's top `riskIndicator` factor in plain English.

---

### Requirement 7: Unit Roster

**User Story:** As an operator, I want a compact unit list sorted by severity, so that the most critical units are always visible at the top without scrolling.

#### Acceptance Criteria

1. THE UnitRoster SHALL render one row per unit showing: unit name, a color-coded status dot, and mini health and fuel bars.
2. THE UnitRoster SHALL sort units with `status === "critical"` first, then `"warning"`, then `"active"`.
3. WHEN a unit row is clicked, THE UnitRoster SHALL invoke `onUnitSelect` with that unit's ID.
4. WHEN a unit's ID matches `selectedUnit`, THE UnitRoster SHALL highlight that row.

---

### Requirement 8: Actions Panel

**User Story:** As an operator, I want to see the top recommended actions sorted by priority, so that I know what to do next without reading through low-priority items.

#### Acceptance Criteria

1. THE ActionsPanel SHALL display at most 4 recommendations at a time.
2. THE ActionsPanel SHALL sort recommendations with `priority === "critical"` first.
3. WHEN a recommendation is acknowledged, THE ActionsPanel SHALL remove it from the visible list for the remainder of the current session.
4. THE ActionsPanel SHALL not display the `confidence` percentage value to the user.

---

### Requirement 9: Problems Feed

**User Story:** As an operator, I want to see only active problems — not historical logs — so that I can focus on what needs attention right now.

#### Acceptance Criteria

1. THE ProblemsFeed SHALL display at most 5 problem items at a time, with scroll available for additional items.
2. THE ProblemsFeed SHALL show `severity === "critical"` problems before `severity === "warning"` problems.
3. THE ProblemsFeed SHALL display each problem as a colored severity dot, unit name, and plain-English summary — no timestamps, event IDs, or type codes.

---

### Requirement 10: Risk Breakdown Panel

**User Story:** As an operator, I want to see five fleet-wide metrics as labeled progress bars, so that I can assess overall fleet health at a glance without interpreting a radar chart.

#### Acceptance Criteria

1. THE RiskBreakdown SHALL render exactly 5 labeled progress bars — one per `RiskMetric`.
2. WHEN `riskIndicators` is empty, THE RiskBreakdown SHALL render all bars at 0%.
3. THE RiskBreakdown SHALL derive bar color from `value` and the `inverted` flag: red for bad, amber for moderate, green for good.
4. THE RiskBreakdown SHALL use only CSS/Tailwind for bar rendering — no chart library dependency.

---

### Requirement 11: Map Panel and Unit Popup

**User Story:** As an operator, I want to click a unit marker on the map and see a structured mini-report, so that I can quickly understand a unit's situation without navigating away.

#### Acceptance Criteria

1. THE MapPanel SHALL pass enriched unit data (with `riskScore` merged in) to `OperationalMap`.
2. WHEN a unit marker is clicked, THE MapPanel SHALL render a `UnitPopup` overlay for that unit.
3. THE UnitPopup SHALL display: unit name, risk badge (color-coded), main issue summary, key stats (Health, Fuel, Ammo as mini bars), and recommended action.
4. THE UnitPopup SHALL not display raw coordinates or type abbreviations.
5. WHEN `UnitPopup` is closed, THE MapPanel SHALL set `selectedUnit` to `null`.

---

### Requirement 12: Recharts Removal

**User Story:** As a developer, I want the `recharts` dependency removed from `Dashboard.tsx`, so that the bundle size is reduced and the radar chart is replaced by the new `RiskBreakdown` component.

#### Acceptance Criteria

1. THE Dashboard SHALL not import any `recharts` components (`RadarChart`, `PolarGrid`, `PolarAngleAxis`, `ResponsiveContainer`, `Radar`).
2. WHEN the application builds, THE build process SHALL complete successfully without `recharts` imports in `Dashboard.tsx`.
