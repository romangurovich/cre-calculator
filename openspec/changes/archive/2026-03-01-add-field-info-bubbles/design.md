## Context

The app already renders persona-aware fields in Analysis and draggable fields in Composer, but users currently rely on memory or external docs to understand each input. This change adds in-context guidance through compact info bubbles while preserving the austere visual style and avoiding layout bloat.

## Goals / Non-Goals

**Goals:**
- Show an info bubble for every field on Analysis and Composer surfaces.
- Standardize help text source in field metadata so both screens use one content model.
- Support hover, keyboard focus, and tap interactions for accessibility and touch devices.
- Keep visual styling consistent with the existing restrained design system.

**Non-Goals:**
- Long-form educational content or embedded documentation pages.
- Dynamic AI-generated guidance text.
- Reworking calculation formulas or changing field IDs.

## Decisions

- Add `helpText` metadata to each field definition in the shared field map.
  - Rationale: one source of truth for tooltip content across Analysis and Composer.
  - Alternative considered: separate tooltip dictionaries per screen; rejected due to content drift risk.
- Implement a reusable `InfoBubble` UI primitive with shared interaction logic.
  - Rationale: ensures behavior parity (hover/focus/tap) and simplifies testing.
  - Alternative considered: ad hoc title attributes; rejected because they are inconsistent and hard to style.
- Anchor bubbles to field labels in Analysis and to field chips in Composer.
  - Rationale: users need context exactly where decisions are made.
- Add tokenized styling for tooltip surface, border, text, and motion.
  - Rationale: keeps the feature visually aligned with the austere system.

## Risks / Trade-offs

- [Risk] Dense forms may feel noisy with many info icons -> Mitigation: subtle icon treatment and delayed reveal behavior.
- [Risk] Tooltip overlap on mobile could obscure nearby controls -> Mitigation: constrained width, viewport-aware positioning, and tap-to-dismiss.
- [Risk] Help text quality may be inconsistent across fields -> Mitigation: shared writing guidelines and review checklist for field metadata.

## Migration Plan

- Add help text metadata for all existing field definitions.
- Introduce shared info bubble primitive and styles in UI primitives/design tokens.
- Wire the primitive into Analysis and Composer field renderers.
- Add tests for content presence and keyboard/touch interactions.
- Deploy with no data migration; existing templates remain compatible.

## Open Questions

- Should we add an optional "more details" link target in help text for advanced users?
- Do we want global "show all hints" mode for first-time onboarding?
