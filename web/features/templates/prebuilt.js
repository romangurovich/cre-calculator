export const PREBUILT_TEMPLATES = [
  {
    templateId: "built-in-landlord-underwriting",
    name: "Landlord Underwriting",
    persona: "landlord",
    source: "built-in",
    sections: [
      {
        id: "acquisition",
        title: "Acquisition",
        fields: ["purchasePrice", "closingCosts", "capexReserve", "holdYears"]
      },
      {
        id: "financing",
        title: "Financing",
        fields: ["ltv", "interestRateAnnual", "amortizationYears"]
      },
      {
        id: "operations",
        title: "Operations",
        fields: [
          "rentableSqft",
          "occupancyRate",
          "rentPerSqftAnnual",
          "operatingExpensesAnnual",
          "rentGrowthRate",
          "expenseInflationRate"
        ]
      },
      {
        id: "exit",
        title: "Exit",
        fields: ["exitCapRate", "saleCostRate"]
      }
    ]
  },
  {
    templateId: "built-in-owner-operator-acquisition",
    name: "Owner/Operator Acquisition",
    persona: "owner-operator",
    source: "built-in",
    sections: [
      {
        id: "business-premises",
        title: "Business Premises",
        fields: ["purchasePrice", "closingCosts", "capexReserve", "holdYears"]
      },
      {
        id: "financing",
        title: "Financing",
        fields: ["ltv", "interestRateAnnual", "amortizationYears"]
      },
      {
        id: "operations",
        title: "Operations",
        fields: [
          "rentableSqft",
          "occupancyRate",
          "rentPerSqftAnnual",
          "operatingExpensesAnnual",
          "rentGrowthRate",
          "expenseInflationRate"
        ]
      },
      {
        id: "business-impact",
        title: "Business Impact",
        fields: ["currentLeaseCostAnnual", "grossMarginRate", "movingCosts", "exitCapRate", "saleCostRate"]
      }
    ]
  },
  {
    templateId: "built-in-downside-stress-test",
    name: "Downside Stress Test",
    persona: "landlord",
    source: "built-in",
    sections: [
      {
        id: "core",
        title: "Core Assumptions",
        fields: [
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
        ]
      },
      {
        id: "stress-drivers",
        title: "Stress Drivers",
        fields: ["rentGrowthRate", "expenseInflationRate", "saleCostRate", "closingCosts", "capexReserve"]
      }
    ]
  }
];
