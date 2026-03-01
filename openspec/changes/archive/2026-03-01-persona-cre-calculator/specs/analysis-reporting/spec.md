## ADDED Requirements

### Requirement: Exportable analysis reports
The system SHALL export an analysis report in CSV format containing assumptions, scenario labels, and metric outputs for the selected persona.

#### Scenario: User exports analysis to CSV
- **WHEN** a user triggers CSV export for an analysis
- **THEN** the system downloads a CSV file with baseline and comparison scenario results and source assumptions

### Requirement: Formula audit section in exports
The system SHALL include formula trace references in exported reports so each key metric can be traced back to assumptions and formula identifiers.

#### Scenario: Reviewer verifies exported metric source
- **WHEN** a reviewer inspects the exported report for a key metric
- **THEN** the report includes the metric value, formula identifier, and referenced assumption keys

### Requirement: Shareable summary payload
The system SHALL expose a structured summary payload for each analysis that includes persona, scenarios, headline metrics, and threshold breach indicators.

#### Scenario: UI requests summary for compare page
- **WHEN** the compare page requests an analysis summary
- **THEN** the system returns a payload with persona metadata, scenario headline metrics, and breach flags
