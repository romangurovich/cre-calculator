### Requirement: Drag field catalog into template canvas
The system SHALL provide a field catalog of calculator inputs and SHALL allow users to drag fields into template sections on a composition canvas.

#### Scenario: User drags field into section
- **WHEN** a user drags `interestRateAnnual` from the catalog into the financing section
- **THEN** the template canvas adds that field to the target section layout

### Requirement: Field ordering and placement controls
The system SHALL allow users to reorder placed fields within a section and move fields between sections.

#### Scenario: User reorders field position
- **WHEN** a user drags a field from position three to position one in the same section
- **THEN** the template preview reflects the updated order immediately

### Requirement: Template validation before save
The system SHALL validate that required persona fields are present in the template before allowing publish-ready save.

#### Scenario: Missing required field during save
- **WHEN** a user attempts to save a landlord template without `purchasePrice`
- **THEN** the system blocks save and identifies missing required fields
