export const CALCULATOR_FIELDS = [
  {
    id: "purchasePrice",
    label: "Purchase Price",
    helpText: "Total negotiated acquisition price before financing and transaction adjustments.",
    section: "Acquisition",
    type: "number",
    min: 0,
    step: 1000,
    defaultValue: 3500000
  },
  {
    id: "closingCosts",
    label: "Closing Costs",
    helpText: "One-time transaction costs paid at closing, including legal and lender fees.",
    section: "Acquisition",
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 70000
  },
  {
    id: "capexReserve",
    label: "CapEx Reserve",
    helpText: "Upfront reserve for tenant improvements, deferred maintenance, and planned upgrades.",
    section: "Acquisition",
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 50000
  },
  {
    id: "ltv",
    label: "LTV",
    helpText: "Loan-to-value ratio. 0.70 means debt covers 70% of purchase price.",
    section: "Financing",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.7
  },
  {
    id: "interestRateAnnual",
    label: "Interest Rate (Annual)",
    helpText: "Annual nominal debt rate used for payment and debt service calculations.",
    section: "Financing",
    type: "number",
    min: 0,
    max: 1,
    step: 0.001,
    defaultValue: 0.065
  },
  {
    id: "amortizationYears",
    label: "Amortization (Years)",
    helpText: "Years used to fully amortize the loan principal for debt service calculations.",
    section: "Financing",
    type: "number",
    min: 1,
    step: 1,
    defaultValue: 25
  },
  {
    id: "holdYears",
    label: "Hold Period (Years)",
    helpText: "Number of years the property is held before modeled sale or exit.",
    section: "Strategy",
    type: "number",
    min: 1,
    step: 1,
    defaultValue: 10
  },
  {
    id: "rentableSqft",
    label: "Rentable Sq Ft",
    helpText: "Total leasable area used to calculate gross rent potential and occupancy income.",
    section: "Operations",
    type: "number",
    min: 1,
    step: 10,
    defaultValue: 22000
  },
  {
    id: "occupancyRate",
    label: "Occupancy Rate",
    helpText: "Expected occupied share of rentable area. 0.90 means 90% occupied.",
    section: "Operations",
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 0.9
  },
  {
    id: "rentPerSqftAnnual",
    label: "Rent / Sq Ft (Annual)",
    helpText: "Annual rent assumed per rentable square foot before expense deductions.",
    section: "Operations",
    type: "number",
    min: 0,
    step: 0.5,
    defaultValue: 34
  },
  {
    id: "operatingExpensesAnnual",
    label: "Operating Expenses (Annual)",
    helpText: "Annual property operating costs excluded from debt service and capital events.",
    section: "Operations",
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 210000
  },
  {
    id: "rentGrowthRate",
    label: "Rent Growth Rate",
    helpText: "Year-over-year rent escalation assumption applied during the hold period.",
    section: "Operations",
    type: "number",
    min: -0.2,
    max: 1,
    step: 0.001,
    defaultValue: 0.03
  },
  {
    id: "expenseInflationRate",
    label: "Expense Inflation Rate",
    helpText: "Year-over-year inflation applied to operating expenses during the hold period.",
    section: "Operations",
    type: "number",
    min: -0.2,
    max: 1,
    step: 0.001,
    defaultValue: 0.025
  },
  {
    id: "exitCapRate",
    label: "Exit Cap Rate",
    helpText: "Capitalization rate used to estimate terminal sale value from stabilized NOI.",
    section: "Exit",
    type: "number",
    min: 0.001,
    max: 1,
    step: 0.001,
    defaultValue: 0.07
  },
  {
    id: "saleCostRate",
    label: "Sale Cost Rate",
    helpText: "Percentage of sale price allocated to broker fees and transaction costs.",
    section: "Exit",
    type: "number",
    min: 0,
    max: 1,
    step: 0.001,
    defaultValue: 0.03
  },
  {
    id: "currentLeaseCostAnnual",
    label: "Current Lease Cost (Annual)",
    helpText: "Current annual lease expense used to compare buy-versus-lease cash burden.",
    section: "Owner/Operator",
    personas: ["owner-operator"],
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 450000
  },
  {
    id: "grossMarginRate",
    label: "Gross Margin Rate",
    helpText: "Business gross margin used to estimate revenue needed to offset occupancy changes.",
    section: "Owner/Operator",
    personas: ["owner-operator"],
    type: "number",
    min: 0.01,
    max: 1,
    step: 0.01,
    defaultValue: 0.4
  },
  {
    id: "movingCosts",
    label: "Moving Costs",
    helpText: "One-time relocation and setup costs associated with moving into owned space.",
    section: "Owner/Operator",
    personas: ["owner-operator"],
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 0
  }
];

export const FIELD_MAP = Object.fromEntries(
  CALCULATOR_FIELDS.map((field) => [field.id, field])
);

export const SCENARIO_OVERRIDE_FIELDS = [
  "interestRateAnnual",
  "occupancyRate",
  "rentGrowthRate",
  "expenseInflationRate",
  "exitCapRate",
  "rentPerSqftAnnual",
  "operatingExpensesAnnual"
];

export function getFieldsForPersona(persona) {
  return CALCULATOR_FIELDS.filter((field) => {
    if (!field.personas) {
      return true;
    }

    return field.personas.includes(persona);
  });
}

export function getFieldLabel(fieldId) {
  return FIELD_MAP[fieldId]?.label || fieldId;
}

export function getFieldHelpText(fieldId) {
  return FIELD_MAP[fieldId]?.helpText || "";
}

export function getFieldsMissingHelpText(fields = CALCULATOR_FIELDS) {
  return fields
    .filter((field) => typeof field.helpText !== "string" || field.helpText.trim().length === 0)
    .map((field) => field.id);
}

export function assertFieldHelpTextCoverage() {
  const missing = getFieldsMissingHelpText();
  if (missing.length > 0) {
    throw new Error(`Missing helpText metadata for fields: ${missing.join(", ")}`);
  }
}

assertFieldHelpTextCoverage();
