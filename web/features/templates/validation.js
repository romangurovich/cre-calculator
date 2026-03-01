import { getRequiredInputs } from "../../../src/contracts.js";

export function collectTemplateFieldIds(template) {
  const fieldIds = new Set();
  for (const section of template.sections) {
    for (const fieldId of section.fields) {
      fieldIds.add(fieldId);
    }
  }

  return fieldIds;
}

export function validateTemplateForPersona(template, persona = template.persona) {
  const requiredFields = getRequiredInputs(persona);
  const fieldsInTemplate = collectTemplateFieldIds(template);
  const missingRequired = requiredFields.filter((fieldId) => !fieldsInTemplate.has(fieldId));

  return {
    valid: missingRequired.length === 0,
    requiredFields,
    missingRequired
  };
}
