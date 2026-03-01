export const CALCULATOR_FIELDS = [
  {
    id: "purchasePrice",
    label: "Purchase Price",
    section: "Acquisition",
    type: "number",
    min: 0,
    step: 1000,
    defaultValue: 3500000
  },
  {
    id: "closingCosts",
    label: "Closing Costs",
    section: "Acquisition",
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 70000
  },
  {
    id: "capexReserve",
    label: "CapEx Reserve",
    section: "Acquisition",
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 50000
  },
  {
    id: "ltv",
    label: "LTV",
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
    section: "Financing",
    type: "number",
    min: 1,
    step: 1,
    defaultValue: 25
  },
  {
    id: "holdYears",
    label: "Hold Period (Years)",
    section: "Strategy",
    type: "number",
    min: 1,
    step: 1,
    defaultValue: 10
  },
  {
    id: "rentableSqft",
    label: "Rentable Sq Ft",
    section: "Operations",
    type: "number",
    min: 1,
    step: 10,
    defaultValue: 22000
  },
  {
    id: "occupancyRate",
    label: "Occupancy Rate",
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
    section: "Operations",
    type: "number",
    min: 0,
    step: 0.5,
    defaultValue: 34
  },
  {
    id: "operatingExpensesAnnual",
    label: "Operating Expenses (Annual)",
    section: "Operations",
    type: "number",
    min: 0,
    step: 100,
    defaultValue: 210000
  },
  {
    id: "rentGrowthRate",
    label: "Rent Growth Rate",
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
