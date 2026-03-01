## ADDED Requirements

### Requirement: Austere design token system
The system SHALL define a design token set covering color, typography, spacing, border radius, and motion values for consistent styling.

#### Scenario: UI component consumes tokens
- **WHEN** a UI form card renders in the analysis screen
- **THEN** it uses tokenized styles rather than hardcoded ad-hoc values

### Requirement: Stylish but restrained presentation
The system SHALL apply an austere visual style with high contrast, restrained palette usage, and disciplined spacing across core screens.

#### Scenario: Compare view visual consistency
- **WHEN** a user navigates from assumptions to compare view
- **THEN** typography scale, spacing rhythm, and component styling remain consistent with the visual system

### Requirement: Responsive and accessible layout behavior
The system SHALL provide responsive layouts for mobile and desktop and SHALL preserve accessible contrast and focus indicators.

#### Scenario: Mobile layout adjustment
- **WHEN** the analysis form is opened on a narrow viewport
- **THEN** field groups stack in a single-column layout while retaining readable contrast and keyboard-visible focus styles
