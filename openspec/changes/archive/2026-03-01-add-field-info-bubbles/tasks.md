## 1. Field Metadata And Help Content

- [x] 1.1 Add `helpText` metadata for each calculator field in shared field definitions.
- [x] 1.2 Add content consistency checks so every renderable field has a non-empty help text value.

## 2. Shared Info Bubble Primitive

- [x] 2.1 Implement a reusable info bubble component/utility with hover, focus, and tap behaviors.
- [x] 2.2 Add tokenized tooltip styling for surface, border, text, spacing, and reveal motion.

## 3. Analysis Screen Integration

- [x] 3.1 Attach info bubbles to all assumption field labels in Analysis.
- [x] 3.2 Ensure keyboard focus and touch interactions show and dismiss field help correctly.

## 4. Composer Integration

- [x] 4.1 Attach info bubbles to field catalog items in Template Composer.
- [x] 4.2 Attach info bubbles to placed fields on the template canvas using the same help content source.

## 5. Verification

- [x] 5.1 Add tests for info bubble rendering and content coverage across Analysis and Composer fields.
- [x] 5.2 Add interaction tests for hover/focus/tap behavior and accessibility-friendly dismissal.
- [x] 5.3 Run test/build verification and document manual QA checks for tooltip behavior on desktop and mobile.
