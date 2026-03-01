import { buildScenarioAnalysis, getRequiredInputs } from "../../../src/index.js";
import { CALCULATOR_FIELDS, FIELD_MAP, SCENARIO_OVERRIDE_FIELDS } from "../templates/fields.js";

function isBlank(value) {
  return value === "" || value === undefined || value === null;
}

function parseFieldValue(fieldId, rawValue) {
  if (isBlank(rawValue)) {
    return undefined;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric value for ${fieldId}`);
  }

  return value;
}

function getTemplateFieldIds(template) {
  return template.sections.flatMap((section) => section.fields);
}

function toBaselineAssumptions({ persona, template, baselineValues }) {
  const requiredFields = new Set(getRequiredInputs(persona));
  const templateFields = new Set(getTemplateFieldIds(template));
  const allFieldIds = new Set([...requiredFields, ...templateFields]);

  const assumptions = {};
  for (const fieldId of allFieldIds) {
    const field = FIELD_MAP[fieldId];
    if (!field) {
      continue;
    }

    const parsed = parseFieldValue(fieldId, baselineValues[fieldId]);
    if (parsed === undefined) {
      assumptions[fieldId] = field.defaultValue;
      continue;
    }

    assumptions[fieldId] = parsed;
  }

  for (const field of CALCULATOR_FIELDS) {
    if (field.id in assumptions) {
      continue;
    }

    const parsed = parseFieldValue(field.id, baselineValues[field.id]);
    if (parsed !== undefined) {
      assumptions[field.id] = parsed;
    }
  }

  return assumptions;
}

function toScenarioOverrides(rawOverrides) {
  const overrides = {};
  for (const fieldId of SCENARIO_OVERRIDE_FIELDS) {
    if (!(fieldId in rawOverrides)) {
      continue;
    }

    const value = parseFieldValue(fieldId, rawOverrides[fieldId]);
    if (value !== undefined) {
      overrides[fieldId] = value;
    }
  }

  return overrides;
}

export function buildAnalysisPayloadFromUi({ persona, template, baselineValues, scenarios }) {
  const baselineAssumptions = toBaselineAssumptions({
    persona,
    template,
    baselineValues
  });

  const normalizedScenarios = scenarios
    .map((scenario, index) => ({
      id: scenario.id || `scenario-${index + 1}`,
      label: (scenario.label || `Scenario ${index + 1}`).trim(),
      overrides: toScenarioOverrides(scenario.overrides || {})
    }))
    .filter((scenario) => scenario.label.length > 0);

  return {
    persona,
    baselineAssumptions,
    scenarios: normalizedScenarios
  };
}

export function runAnalysisFromUi({ persona, template, baselineValues, scenarios }) {
  const payload = buildAnalysisPayloadFromUi({
    persona,
    template,
    baselineValues,
    scenarios
  });

  return buildScenarioAnalysis(payload);
}
