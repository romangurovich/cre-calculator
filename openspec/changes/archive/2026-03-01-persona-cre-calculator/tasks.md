## 1. Project Foundation

- [x] 1.1 Create a Node.js module structure for calculation engine, scenario comparison, and reporting.
- [x] 1.2 Define shared assumption and result data contracts used across personas.

## 2. Persona Calculator Engine

- [x] 2.1 Implement deterministic core financial formulas (debt service, NOI, cap rate, DSCR, cash flow).
- [x] 2.2 Implement owner-operator persona metrics with formula trace metadata.
- [x] 2.3 Implement landlord persona metrics with formula trace metadata.
- [x] 2.4 Add persona registry mapping required inputs and metric groups for each persona.

## 3. Scenario Comparison

- [x] 3.1 Implement baseline plus up to three labeled comparison scenarios with override-based assumptions.
- [x] 3.2 Implement side-by-side comparison output with metric deltas from baseline.
- [x] 3.3 Implement threshold breach highlighting and key-driver sensitivity ranking.

## 4. Reporting And Verification

- [x] 4.1 Implement CSV export that includes assumptions, scenario metrics, and formula identifiers.
- [x] 4.2 Implement structured summary payload for UI consumption.
- [x] 4.3 Add automated tests for deterministic behavior, scenario comparison, threshold breaches, and exports.
