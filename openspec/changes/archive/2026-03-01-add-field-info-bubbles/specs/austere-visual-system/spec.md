## MODIFIED Requirements

### Requirement: Austere design token system
The system SHALL define a design token set covering color, typography, spacing, border radius, and motion values for consistent styling. The token set SHALL include tooltip/info-bubble tokens for surface color, border, text, spacing, and reveal motion.

#### Scenario: UI component consumes tokens
- **WHEN** a UI form card renders in the analysis screen
- **THEN** it uses tokenized styles rather than hardcoded ad-hoc values

#### Scenario: Info bubble consumes tooltip tokens
- **WHEN** an info bubble is rendered for any calculator field
- **THEN** the bubble uses tooltip tokens instead of screen-specific hardcoded styles
