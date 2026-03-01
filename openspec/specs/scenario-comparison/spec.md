### Requirement: Multiple labeled scenarios
The system SHALL allow a user to define and save at least four labeled scenarios per analysis: one baseline scenario and up to three comparison scenarios.

#### Scenario: User creates baseline and comparison scenarios
- **WHEN** a user saves one baseline and three additional scenarios
- **THEN** the system stores each scenario label and assumption set under the same analysis

### Requirement: Side-by-side metric comparison
The system SHALL present scenario results in a side-by-side comparison view that includes absolute values and deltas from baseline for shared metrics.

#### Scenario: User compares downside scenario against baseline
- **WHEN** a user opens the comparison view with baseline and downside scenarios
- **THEN** the system shows each shared metric value and the downside delta from baseline

### Requirement: Key-driver sensitivity summary
The system SHALL provide a sensitivity summary for configurable drivers including interest rate, vacancy, rent growth, exit cap rate, and expense inflation.

#### Scenario: User requests sensitivity summary
- **WHEN** a user opens sensitivity analysis for an analysis
- **THEN** the system returns the impact ranking of configured drivers on the selected outcome metric

### Requirement: Threshold breach highlighting
The system SHALL allow persona-specific threshold rules and SHALL highlight scenarios that breach defined thresholds.

#### Scenario: DSCR threshold breach in landlord scenario
- **WHEN** a landlord scenario produces DSCR below the configured threshold
- **THEN** the system marks the scenario as breached and shows the threshold condition that failed
