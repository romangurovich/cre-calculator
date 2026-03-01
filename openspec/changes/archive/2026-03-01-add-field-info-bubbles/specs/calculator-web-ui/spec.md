## MODIFIED Requirements

### Requirement: Persona-driven analysis workflow in browser
The system SHALL provide a web-based flow where users select a persona, fill required assumptions, and run baseline plus comparison scenarios without using CLI commands. The system SHALL provide an info bubble for each displayed assumption field that explains field meaning and expected value semantics.

#### Scenario: User runs landlord analysis from UI
- **WHEN** a user selects the `landlord` persona, enters required fields, and clicks calculate
- **THEN** the system renders baseline metrics and any configured comparison scenario metrics in the browser

#### Scenario: User requests context for a field
- **WHEN** a user hovers, focuses, or taps the info bubble next to `exitCapRate`
- **THEN** the system displays contextual help text for `exitCapRate` without navigating away from the analysis flow
