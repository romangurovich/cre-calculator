## Context

The project needs a financial decision tool for commercial property buyers with distinct personas. A single underwriting sheet does not capture owner/operator and landlord decision logic, so the system needs persona-aware inputs, calculations, and outputs while sharing one core calculation flow.

## Goals / Non-Goals

**Goals:**
- Provide a deterministic calculator that supports owner/operator and landlord personas from the same project baseline.
- Allow users to create and compare labeled scenarios with clear delta reporting.
- Ensure every output metric is traceable to assumptions and formulas.
- Produce exportable analysis summaries for sharing and review.

**Non-Goals:**
- Monte Carlo simulation and probabilistic modeling in the first release.
- Full portfolio analytics across multiple properties.
- Live market data ingestion from external providers.

## Decisions

- Use a persona metric registry that maps persona IDs to required inputs, computed metrics, and display groups.
  - Rationale: enables adding future personas without rewriting shared calculation flow.
  - Alternative considered: separate calculator implementations per persona; rejected due to duplicated logic and higher regression risk.
- Use a normalized scenario model (`baseline` plus parameter overrides) and compute each scenario independently.
  - Rationale: keeps scenario calculations deterministic and auditable.
  - Alternative considered: chained scenario diffs; rejected because compounding deltas are harder to reason about.
- Keep calculations deterministic with explicit formulas and no hidden heuristics.
  - Rationale: financial tools need explainability and reproducibility for advisor workflows.
  - Alternative considered: score-based recommendation engine; rejected for MVP because it obscures decision drivers.
- Expose export payloads that include assumptions, metrics, and formula traces.
  - Rationale: allows downstream PDF/CSV renderers and independent verification.

## Risks / Trade-offs

- [Risk] Persona configuration drift (inputs or metrics change over time) -> Mitigation: centralize persona definitions and add fixture-based regression tests per persona.
- [Risk] Formula mistakes in edge cases -> Mitigation: golden test fixtures for known financial cases and cross-checking with spreadsheet references.
- [Risk] Scenario compare UI overload -> Mitigation: enforce a focused comparison set (baseline + three scenarios) and highlight key deltas first.
- [Risk] Export shape instability -> Mitigation: version export schema and keep backward-compatible field additions.

## Migration Plan

- Build calculator engine and persona registry behind internal interfaces first.
- Add scenario persistence and comparison outputs.
- Add export endpoints and renderer adapters.
- Enable UI workflow for persona selection, assumptions, and compare view.
- Roll out as a new feature path; no legacy migration is required.

## Open Questions

- Should tax treatment toggles be global or persona-specific in MVP?
- Should hybrid persona be shipped in MVP or follow in the next increment?
- What minimum export format set is required at launch (CSV only vs CSV + PDF)?
