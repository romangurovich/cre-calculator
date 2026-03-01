## ADDED Requirements

### Requirement: Persona-driven analysis workflow in browser
The system SHALL provide a web-based flow where users select a persona, fill required assumptions, and run baseline plus comparison scenarios without using CLI commands.

#### Scenario: User runs landlord analysis from UI
- **WHEN** a user selects the `landlord` persona, enters required fields, and clicks calculate
- **THEN** the system renders baseline metrics and any configured comparison scenario metrics in the browser

### Requirement: Scenario management controls
The system SHALL allow users to add, edit, and remove up to three comparison scenarios in the analysis UI.

#### Scenario: User edits downside assumptions
- **WHEN** a user updates a downside scenario assumption and recalculates
- **THEN** the system refreshes scenario outputs and baseline deltas using the updated values

### Requirement: Report action entry points
The system SHALL expose report export actions from the UI for the active analysis result set.

#### Scenario: User exports from results screen
- **WHEN** a user clicks export on the results view
- **THEN** the system generates and downloads the analysis export output for the current persona and scenarios
