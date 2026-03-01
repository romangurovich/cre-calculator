## Context

The codebase currently exposes a calculation engine and reporting utilities but lacks an interactive application surface. The requested change introduces a frontend UI with a specific visual direction (stylish and austere), plus a template-composition workflow where calculator fields can be arranged via drag-and-drop and reused.

## Goals / Non-Goals

**Goals:**
- Deliver a browser UI that runs the existing persona calculator/scenario comparison workflows without requiring manual scripting.
- Add a template-composer experience that supports dragging fields from a catalog into layout regions.
- Ship prebuilt templates for common commercial property analysis use cases.
- Establish an austere visual system with explicit design tokens and component rules.

**Non-Goals:**
- Building a fully collaborative multi-user template editor in this phase.
- Adding external market-data ingestion.
- Replacing the existing calculation formulas or persona semantics.

## Decisions

- Build a React-based single-page app with modular feature areas (`analysis`, `template-composer`, `template-library`, `design-system`).
  - Rationale: this matches the interactive drag/drop requirements and keeps UI logic isolated from domain calculations.
  - Alternative considered: server-rendered forms with minimal JavaScript; rejected due to weak drag/drop ergonomics.
- Reuse the current calculation engine through an adapter layer that normalizes UI form state into engine inputs.
  - Rationale: avoids duplicating financial logic and preserves deterministic behavior.
  - Alternative considered: implementing duplicate formulas in the UI; rejected because of parity risk.
- Represent templates as schema documents (`templateId`, `persona`, `sections`, `fields[]`, `layout[]`).
  - Rationale: allows prebuilt and user-defined templates to share one render path.
  - Alternative considered: storing template UI trees as raw component snapshots; rejected for poor forward compatibility.
- Use a strict design-token approach for austere styling (palette, type scale, spacing, radius, elevation, motion).
  - Rationale: ensures consistency and intentional visual outcomes across screens.
- Keep drag-and-drop limited to field placement and reordering in MVP.
  - Rationale: reduces complexity while still meeting core composition needs.

## Risks / Trade-offs

- [Risk] Drag-and-drop interactions feel fragile on touch devices -> Mitigation: provide explicit move controls and touch-friendly drop targets.
- [Risk] Template schema changes break saved templates -> Mitigation: include schema versioning and migration handlers.
- [Risk] Austere direction becomes too sparse and harms usability -> Mitigation: run accessibility checks and content-density review before release.
- [Risk] UI-engine adapter drift introduces incorrect calculations -> Mitigation: integration tests that compare UI-driven payload results against engine fixtures.

## Migration Plan

- Introduce UI shell and route structure with one analysis flow behind a feature flag.
- Add template schema, storage, and composer interactions.
- Add prebuilt templates and template library management.
- Integrate comparison views and report export actions.
- Remove feature flag after QA and regression tests pass.

## Open Questions

- Should user templates persist to local storage only or be API-backed in MVP?
- Which drag-and-drop library best satisfies keyboard accessibility and mobile behavior?
- What exact prebuilt template set is mandatory for launch (minimum three vs expanded catalog)?
