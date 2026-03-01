## MODIFIED Requirements

### Requirement: Drag field catalog into template canvas
The system SHALL provide a field catalog of calculator inputs and SHALL allow users to drag fields into template sections on a composition canvas. The system SHALL show an info bubble for each field in the catalog and each placed field in the template canvas.

#### Scenario: User drags field into section
- **WHEN** a user drags `interestRateAnnual` from the catalog into the financing section
- **THEN** the template canvas adds that field to the target section layout

#### Scenario: User views field guidance in composer
- **WHEN** a user opens the info bubble for `interestRateAnnual` from the catalog or canvas
- **THEN** the composer shows the same contextual help text for that field in either location
