import { getRequiredInputs, validatePersona } from "./contracts.js";

const PERSONA_REGISTRY = {
  "owner-operator": {
    id: "owner-operator",
    label: "Owner / Operator",
    metricGroups: {
      core: ["noi", "dscr", "cashFlowBeforeTax", "cashOnCashReturn"],
      persona: [
        "occupancyCostPerSqft",
        "monthlyCashBurdenVsLease",
        "breakEvenRevenueImpactAnnual",
        "controlPremiumEstimate"
      ]
    },
    headlineMetrics: [
      "occupancyCostPerSqft",
      "monthlyCashBurdenVsLease",
      "breakEvenRevenueImpactAnnual"
    ],
    defaultThresholds: {
      maxMonthlyCashBurdenVsLease: 0
    }
  },
  landlord: {
    id: "landlord",
    label: "Commercial Landlord",
    metricGroups: {
      core: ["noi", "capRate", "dscr", "cashOnCashReturn"],
      persona: ["stabilizedNoi", "leveredIrr", "unleveredIrr", "equityMultiple", "saleProceeds"]
    },
    headlineMetrics: ["noi", "dscr", "cashOnCashReturn", "leveredIrr", "equityMultiple"],
    defaultThresholds: {
      minDSCR: 1.25,
      minCashOnCashReturn: 0.08
    }
  }
};

export function listPersonas() {
  return Object.keys(PERSONA_REGISTRY);
}

export function getPersonaConfig(persona) {
  validatePersona(persona);
  return {
    ...PERSONA_REGISTRY[persona],
    requiredInputs: getRequiredInputs(persona)
  };
}
