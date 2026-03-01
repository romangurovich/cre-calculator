## ADDED Requirements

### Requirement: Prebuilt analysis templates
The system SHALL ship prebuilt templates for at least owner/operator acquisition analysis, landlord underwriting, and downside stress testing.

#### Scenario: User starts from prebuilt landlord template
- **WHEN** a user selects the landlord underwriting template from the library
- **THEN** the system loads the predefined sections and mapped calculator fields for that template

### Requirement: User template lifecycle
The system SHALL allow users to create, duplicate, rename, and delete user-defined templates.

#### Scenario: User duplicates existing template
- **WHEN** a user chooses duplicate on an existing template
- **THEN** the system creates a new template copy with identical field layout and a distinct template identifier

### Requirement: Persona/template compatibility filtering
The system SHALL filter template choices by selected persona and SHALL prevent loading incompatible templates.

#### Scenario: Owner/operator persona selected
- **WHEN** a user has selected `owner-operator` persona in the analysis flow
- **THEN** the template selector hides templates that require landlord-only fields
