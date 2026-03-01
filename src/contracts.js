export const PERSONA_IDS = ["owner-operator", "landlord"];

export const BASE_REQUIRED_INPUTS = [
  "purchasePrice",
  "ltv",
  "interestRateAnnual",
  "amortizationYears",
  "holdYears",
  "rentableSqft",
  "occupancyRate",
  "rentPerSqftAnnual",
  "operatingExpensesAnnual",
  "exitCapRate"
];

export const PERSONA_REQUIRED_INPUTS = {
  "owner-operator": ["currentLeaseCostAnnual"],
  landlord: []
};

export const DEFAULT_ASSUMPTIONS = {
  closingCosts: 0,
  capexReserve: 0,
  saleCostRate: 0.03,
  rentGrowthRate: 0.02,
  expenseInflationRate: 0.02,
  grossMarginRate: 0.4,
  movingCosts: 0
};

export function validatePersona(persona) {
  if (!PERSONA_IDS.includes(persona)) {
    throw new Error(`Unsupported persona: ${persona}`);
  }
}

export function getRequiredInputs(persona) {
  validatePersona(persona);
  return [...BASE_REQUIRED_INPUTS, ...(PERSONA_REQUIRED_INPUTS[persona] || [])];
}

export function normalizeAssumptions(assumptions) {
  return {
    ...DEFAULT_ASSUMPTIONS,
    ...assumptions
  };
}

export function mergeAssumptions(baseline, overrides = {}) {
  return normalizeAssumptions({
    ...baseline,
    ...overrides
  });
}

export function validateAssumptions(persona, assumptions) {
  validatePersona(persona);
  const normalized = normalizeAssumptions(assumptions);
  const missing = [];

  for (const field of getRequiredInputs(persona)) {
    const value = normalized[field];
    if (value === undefined || value === null || Number.isNaN(value)) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required assumptions: ${missing.join(", ")}`);
  }

  return normalized;
}
