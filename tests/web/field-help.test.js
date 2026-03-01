import test from "node:test";
import assert from "node:assert/strict";

import {
  CALCULATOR_FIELDS,
  FIELD_MAP,
  SCENARIO_OVERRIDE_FIELDS,
  getFieldHelpText,
  getFieldsForPersona,
  getFieldsMissingHelpText
} from "../../web/features/templates/fields.js";

test("all calculator fields include non-empty help text", () => {
  const missing = getFieldsMissingHelpText();

  assert.deepEqual(missing, []);
  assert.ok(CALCULATOR_FIELDS.every((field) => field.helpText.trim().length > 0));
});

test("analysis and composer field sets resolve shared help content", () => {
  const landlordFields = getFieldsForPersona("landlord");
  const ownerFields = getFieldsForPersona("owner-operator");

  assert.ok(landlordFields.length > 0);
  assert.ok(ownerFields.length > 0);

  for (const field of [...landlordFields, ...ownerFields]) {
    assert.equal(getFieldHelpText(field.id), FIELD_MAP[field.id].helpText);
  }

  for (const fieldId of SCENARIO_OVERRIDE_FIELDS) {
    assert.ok(getFieldHelpText(fieldId).length > 0);
  }
});
