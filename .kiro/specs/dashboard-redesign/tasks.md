# Tasks

## Task List

- [x] 1. Create pure derivation utility functions
  - [x] 1.1 Create `client/lib/dashboardUtils.ts` with `deriveSituationSummary`, `enrichUnits`, `deriveRiskMetrics`, and `deriveActiveProblems` functions and their TypeScript interfaces (`DerivedSituationSummary`, `EnrichedUnit`, `RiskMetric`, `ActiveProblem`)
  - [x] 1.2 Write Vitest unit tests in `client/lib/dashboardUtils.spec.ts` covering example-based cases for each derivation function (cold-start empty arrays, all-critical scenario, empty riskIndicators)
  - [x] 1.3 Write property-based tests using fast-check for Properties 1–6 (bannerText non-empty, overallRisk in bounds, criticalUnits completeness, riskColor validity, 5 metrics in bounds, problems coverage and sort order)

- [x] 2. Build `SituationBanner` component
  - [x] 2.1 Create `client/components/SituationBanner.tsx` implementing the `SituationBannerProps` interface with risk-derived background color (red/amber/neutral), right-side timestamp, and pulse highlight when `criticalCount > 0`
  - [x] 2.2 Write Vitest + React Testing Library tests covering: neutral state with empty units, red background when overallRisk > 70, amber background when overallRisk 40–70, pulse class when criticalCount > 0, no interactive elements

- [x] 3. Build `RiskBreakdown` component
  - [x] 3.1 Create `client/components/RiskBreakdown.tsx` rendering exactly 5 labeled CSS/Tailwind progress bars from `RiskMetric[]`, with bar color derived from `value` and `inverted` flag — no chart library
  - [x] 3.2 Write Vitest + React Testing Library tests covering: renders 5 bars, all bars at 0% when metrics are zero, correct color for inverted vs non-inverted metrics

- [ ] 4. Build `UnitRoster` component
  - [-] 4.1 Create `client/components/UnitRoster.tsx` rendering a scrollable list sorted critical → warning → active, with name, status dot, and health/fuel mini-bars per row; highlight selected unit; invoke `onUnitSelect` on click
  - [~] 4.2 Write Vitest + React Testing Library tests and property tests for Property 7 (sort order stability across any units array)

- [ ] 5. Build `ProblemsFeed` component
  - [~] 5.1 Create `client/components/ProblemsFeed.tsx` rendering at most 5 `ActiveProblem` items (critical before warning), each showing a colored severity dot, unit name, and plain-English summary — no timestamps or event IDs
  - [~] 5.2 Write Vitest + React Testing Library tests and property tests for Property 9 (max 5 items, critical-first ordering)

- [ ] 6. Build `ActionsPanel` component
  - [~] 6.1 Create `client/components/ActionsPanel.tsx` rendering at most 4 `DecisionRecommendation` items sorted critical-first, with action verb + target + rationale per item, an optional acknowledge button that removes the item for the session, and no confidence percentage displayed
  - [~] 6.2 Write Vitest + React Testing Library tests and property tests for Property 8 (max 4 items, critical-first ordering, acknowledge removes item)

- [ ] 7. Build `UnitPopup` component
  - [~] 7.1 Create `client/components/UnitPopup.tsx` implementing `UnitPopupProps` showing unit name, color-coded risk badge, top risk factor summary, Health/Fuel/Ammo mini-bars, and recommended action — no raw coordinates or type abbreviations
  - [~] 7.2 Write Vitest + React Testing Library tests covering: correct unit name displayed, risk badge color matches riskScore, no coordinates in output, close button invokes `onClose`

- [ ] 8. Build `MapPanel` component
  - [~] 8.1 Create `client/components/MapPanel.tsx` wrapping `OperationalMap` with enriched unit data (riskScore merged in), sector zone polygon rendering with risk-proportional fill opacity, `UnitPopup` overlay on unit selection, and Units/Zones layer toggles
  - [~] 8.2 Write Vitest + React Testing Library integration tests: unit selection triggers UnitPopup, closing popup sets selectedUnit to null, enriched units are passed to OperationalMap

- [ ] 9. Refactor `Dashboard.tsx`
  - [~] 9.1 Replace the existing `Dashboard.tsx` layout with the new component hierarchy: `SituationBanner` (top), `MapPanel` + `RiskBreakdown`/`UnitRoster` right panel (middle), `ProblemsFeed` + `ActionsPanel` (bottom); wire all derivation functions and 1-second polling; remove all `recharts` imports
  - [~] 9.2 Add the stale-selection guard: when `selectedUnit` ID is absent from the current `units` array, call `setSelectedUnit(null)`
  - [~] 9.3 Write integration tests rendering `<Dashboard />` with a mocked `simulationEngine`: assert SituationBanner text, assert UnitPopup appears on unit selection, assert recharts is not imported

- [ ] 10. Verify build and run all tests
  - [~] 10.1 Run `pnpm typecheck` and resolve any TypeScript errors introduced by the new components and interfaces
  - [~] 10.2 Run `pnpm test` and confirm all unit, property, and integration tests pass with no regressions in existing tests (e.g. `client/lib/utils.spec.ts`)
