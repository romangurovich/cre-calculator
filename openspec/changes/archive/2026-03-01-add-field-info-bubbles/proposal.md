## Why

Users entering financial assumptions need immediate context for each field to avoid misinterpretation and bad scenario outcomes. Adding concise info bubbles directly on field labels improves clarity without cluttering the austere UI.

## What Changes

- Add info bubbles to all calculator fields on the Analysis screen.
- Add info bubbles to all field chips and placed fields in the Template Composer.
- Define consistent tooltip content and behavior (hover/focus/tap) with accessibility support.
- Ensure the visual treatment matches the existing stylish, restrained design language.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `calculator-web-ui`: Field rendering requirements are updated to include help/info bubble affordances for all displayed inputs.
- `drag-template-composer`: Composer field catalog and canvas requirements are updated to include per-field help/info bubbles.
- `austere-visual-system`: UI component requirements are updated to define tooltip styling and interaction in the design token system.

## Impact

- Updates field metadata and UI rendering logic in analysis and composer feature modules.
- Adds shared tooltip/info-bubble primitive and accessibility interactions for keyboard and touch.
- Adds test coverage for help bubble visibility, content accuracy, and focus behavior.
