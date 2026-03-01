## Why

The current implementation provides a strong calculation engine but no user-facing interface, which blocks non-technical users from running and comparing analyses. A web UI with a restrained, austere design and template authoring unlocks practical usage for advisors and buyers.

## What Changes

- Add a web-based interface for persona selection, assumptions input, scenario comparison, and report export.
- Introduce a drag-and-drop template builder so users can place calculator fields into reusable input templates.
- Provide prebuilt templates for common workflows (owner/operator purchase analysis, landlord underwriting, downside stress test).
- Establish a cohesive visual system with austere styling (minimal palette, strong typography, high contrast, intentional spacing).

## Capabilities

### New Capabilities
- `calculator-web-ui`: Browser-based workflow for configuring analyses and viewing outputs from the existing calculation engine.
- `drag-template-composer`: Template canvas that allows draggable calculator fields and saved layout templates.
- `template-library`: Built-in starter templates and user-saved template management.
- `austere-visual-system`: Design tokens and UI component styling guidelines for a stylish but restrained experience.

### Modified Capabilities
- None.

## Impact

- Adds frontend application structure, UI components, and state management for analysis flows.
- Adds template schema, storage, and mapping logic between field definitions and renderable layouts.
- Integrates UI actions with existing calculator/scenario/reporting modules.
- Requires UI and integration tests for drag/drop behavior, template persistence, and scenario result rendering.
