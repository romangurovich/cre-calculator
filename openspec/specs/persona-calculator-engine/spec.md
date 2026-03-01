### Requirement: Persona-specific calculation templates
The system SHALL provide calculation templates for at least `owner-operator` and `landlord` personas, where each template defines required inputs, derived metrics, and result sections.

#### Scenario: User selects owner-operator persona
- **WHEN** a user starts a new analysis and selects `owner-operator`
- **THEN** the system requires owner-operator inputs and computes owner-operator metrics only

#### Scenario: User selects landlord persona
- **WHEN** a user starts a new analysis and selects `landlord`
- **THEN** the system requires landlord inputs and computes landlord investment metrics

### Requirement: Deterministic financial calculations
The system SHALL compute all metrics using deterministic formulas with explicit intermediate values and SHALL return the same output for the same assumptions.

#### Scenario: Repeat calculation with unchanged assumptions
- **WHEN** a user recalculates an analysis without changing any input values
- **THEN** the system returns identical metric outputs and intermediate values

### Requirement: Formula traceability
The system SHALL expose formula trace metadata for each reported metric, including formula identifier, input values used, and computed output.

#### Scenario: User inspects a metric calculation
- **WHEN** a user opens metric details for any reported value
- **THEN** the system displays the formula identifier, referenced assumptions, and resulting value for that metric
