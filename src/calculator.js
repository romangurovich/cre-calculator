import { normalizeAssumptions, validateAssumptions } from "./contracts.js";
import {
  annualDebtService,
  buildTrace,
  effectiveGrossIncome,
  irr,
  netOperatingIncome,
  remainingLoanBalance,
  round,
  safeDivide
} from "./formulas.js";

function addMetric(metrics, traces, key, value, formulaId, inputs) {
  const metricValue = Number.isFinite(value) ? round(value) : value;
  metrics[key] = metricValue;
  traces[key] = buildTrace(formulaId, inputs, metricValue);
}

function annualNoiAtYear(assumptions, year) {
  const rent = assumptions.rentPerSqftAnnual * (1 + assumptions.rentGrowthRate) ** (year - 1);
  const expenses =
    assumptions.operatingExpensesAnnual *
    (1 + assumptions.expenseInflationRate) ** (year - 1);
  const noi = netOperatingIncome({
    rentableSqft: assumptions.rentableSqft,
    rentPerSqftAnnual: rent,
    occupancyRate: assumptions.occupancyRate,
    operatingExpensesAnnual: expenses
  });

  return {
    rent,
    expenses,
    noi
  };
}

function buildCashFlows({ assumptions, equityRequired, totalAcquisitionCost, annualDebtServiceValue }) {
  const levered = [-equityRequired];
  const unlevered = [-totalAcquisitionCost];

  for (let year = 1; year <= assumptions.holdYears; year += 1) {
    const { noi } = annualNoiAtYear(assumptions, year);
    const leveredCashFlow = noi - annualDebtServiceValue;

    levered.push(leveredCashFlow);
    unlevered.push(noi);
  }

  return {
    levered,
    unlevered
  };
}

export function calculatePersonaScenario({ persona, assumptions }) {
  const normalized = normalizeAssumptions(assumptions);
  const validated = validateAssumptions(persona, normalized);

  const metrics = {};
  const traces = {};

  const totalAcquisitionCost =
    validated.purchasePrice + validated.closingCosts + validated.capexReserve;
  const loanAmount = validated.purchasePrice * validated.ltv;
  const equityRequired = totalAcquisitionCost - loanAmount;

  const annualDebtServiceValue = annualDebtService({
    loanAmount,
    interestRateAnnual: validated.interestRateAnnual,
    amortizationYears: validated.amortizationYears
  });

  const egi = effectiveGrossIncome({
    rentableSqft: validated.rentableSqft,
    rentPerSqftAnnual: validated.rentPerSqftAnnual,
    occupancyRate: validated.occupancyRate
  });

  const noi = netOperatingIncome({
    rentableSqft: validated.rentableSqft,
    rentPerSqftAnnual: validated.rentPerSqftAnnual,
    occupancyRate: validated.occupancyRate,
    operatingExpensesAnnual: validated.operatingExpensesAnnual
  });

  const capRate = safeDivide(noi, validated.purchasePrice);
  const dscr = safeDivide(noi, annualDebtServiceValue);
  const cashFlowBeforeTax = noi - annualDebtServiceValue;
  const cashOnCashReturn = safeDivide(cashFlowBeforeTax, equityRequired);

  const { noi: stabilizedNoi } = annualNoiAtYear(validated, validated.holdYears);
  const terminalValue = safeDivide(stabilizedNoi, validated.exitCapRate);
  const saleCosts = terminalValue * validated.saleCostRate;
  const remainingBalance = remainingLoanBalance({
    loanAmount,
    interestRateAnnual: validated.interestRateAnnual,
    amortizationYears: validated.amortizationYears,
    yearsElapsed: validated.holdYears
  });
  const saleProceeds = terminalValue - saleCosts - remainingBalance;

  const cashFlows = buildCashFlows({
    assumptions: validated,
    equityRequired,
    totalAcquisitionCost,
    annualDebtServiceValue
  });

  cashFlows.levered[cashFlows.levered.length - 1] += saleProceeds;
  cashFlows.unlevered[cashFlows.unlevered.length - 1] += terminalValue - saleCosts;

  addMetric(metrics, traces, "loanAmount", loanAmount, "loan = purchasePrice * ltv", {
    purchasePrice: validated.purchasePrice,
    ltv: validated.ltv
  });
  addMetric(
    metrics,
    traces,
    "equityRequired",
    equityRequired,
    "equity = purchasePrice + closingCosts + capexReserve - loanAmount",
    {
      purchasePrice: validated.purchasePrice,
      closingCosts: validated.closingCosts,
      capexReserve: validated.capexReserve,
      loanAmount
    }
  );
  addMetric(
    metrics,
    traces,
    "annualDebtService",
    annualDebtServiceValue,
    "amortized annual debt service",
    {
      loanAmount,
      interestRateAnnual: validated.interestRateAnnual,
      amortizationYears: validated.amortizationYears
    }
  );
  addMetric(
    metrics,
    traces,
    "effectiveGrossIncome",
    egi,
    "EGI = rentableSqft * rentPerSqftAnnual * occupancyRate",
    {
      rentableSqft: validated.rentableSqft,
      rentPerSqftAnnual: validated.rentPerSqftAnnual,
      occupancyRate: validated.occupancyRate
    }
  );
  addMetric(
    metrics,
    traces,
    "noi",
    noi,
    "NOI = effectiveGrossIncome - operatingExpensesAnnual",
    {
      effectiveGrossIncome: egi,
      operatingExpensesAnnual: validated.operatingExpensesAnnual
    }
  );
  addMetric(metrics, traces, "capRate", capRate, "capRate = noi / purchasePrice", {
    noi,
    purchasePrice: validated.purchasePrice
  });
  addMetric(metrics, traces, "dscr", dscr, "dscr = noi / annualDebtService", {
    noi,
    annualDebtService: annualDebtServiceValue
  });
  addMetric(
    metrics,
    traces,
    "cashFlowBeforeTax",
    cashFlowBeforeTax,
    "cashFlowBeforeTax = noi - annualDebtService",
    {
      noi,
      annualDebtService: annualDebtServiceValue
    }
  );
  addMetric(
    metrics,
    traces,
    "cashOnCashReturn",
    cashOnCashReturn,
    "cashOnCashReturn = cashFlowBeforeTax / equityRequired",
    {
      cashFlowBeforeTax,
      equityRequired
    }
  );
  addMetric(
    metrics,
    traces,
    "terminalValue",
    terminalValue,
    "terminalValue = stabilizedNoi / exitCapRate",
    {
      stabilizedNoi,
      exitCapRate: validated.exitCapRate
    }
  );
  addMetric(
    metrics,
    traces,
    "saleProceeds",
    saleProceeds,
    "saleProceeds = terminalValue - saleCosts - remainingBalance",
    {
      terminalValue,
      saleCosts,
      remainingBalance
    }
  );

  if (persona === "owner-operator") {
    const occupancyCostAnnual = annualDebtServiceValue + validated.operatingExpensesAnnual;
    const occupancyCostPerSqft = safeDivide(occupancyCostAnnual, validated.rentableSqft);
    const monthlyCashBurdenVsLease =
      (occupancyCostAnnual - validated.currentLeaseCostAnnual) / 12;
    const breakEvenRevenueImpactAnnual = safeDivide(
      Math.max(occupancyCostAnnual - validated.currentLeaseCostAnnual, 0),
      validated.grossMarginRate
    );
    const controlPremiumEstimate =
      validated.currentLeaseCostAnnual * (1 + validated.rentGrowthRate) -
      occupancyCostAnnual -
      safeDivide(validated.movingCosts, Math.max(validated.holdYears, 1));

    addMetric(
      metrics,
      traces,
      "occupancyCostAnnual",
      occupancyCostAnnual,
      "occupancyCostAnnual = annualDebtService + operatingExpensesAnnual",
      {
        annualDebtService: annualDebtServiceValue,
        operatingExpensesAnnual: validated.operatingExpensesAnnual
      }
    );
    addMetric(
      metrics,
      traces,
      "occupancyCostPerSqft",
      occupancyCostPerSqft,
      "occupancyCostPerSqft = occupancyCostAnnual / rentableSqft",
      {
        occupancyCostAnnual,
        rentableSqft: validated.rentableSqft
      }
    );
    addMetric(
      metrics,
      traces,
      "monthlyCashBurdenVsLease",
      monthlyCashBurdenVsLease,
      "monthlyCashBurdenVsLease = (occupancyCostAnnual - currentLeaseCostAnnual) / 12",
      {
        occupancyCostAnnual,
        currentLeaseCostAnnual: validated.currentLeaseCostAnnual
      }
    );
    addMetric(
      metrics,
      traces,
      "breakEvenRevenueImpactAnnual",
      breakEvenRevenueImpactAnnual,
      "breakEvenRevenueImpactAnnual = max(occupancyCostAnnual - currentLeaseCostAnnual, 0) / grossMarginRate",
      {
        occupancyCostAnnual,
        currentLeaseCostAnnual: validated.currentLeaseCostAnnual,
        grossMarginRate: validated.grossMarginRate
      }
    );
    addMetric(
      metrics,
      traces,
      "controlPremiumEstimate",
      controlPremiumEstimate,
      "controlPremiumEstimate = currentLeaseCostAnnual*(1+rentGrowthRate) - occupancyCostAnnual - (movingCosts/holdYears)",
      {
        currentLeaseCostAnnual: validated.currentLeaseCostAnnual,
        rentGrowthRate: validated.rentGrowthRate,
        occupancyCostAnnual,
        movingCosts: validated.movingCosts,
        holdYears: validated.holdYears
      }
    );
  }

  if (persona === "landlord") {
    const leveredIrr = irr(cashFlows.levered);
    const unleveredIrr = irr(cashFlows.unlevered);
    const totalInflows = cashFlows.levered
      .slice(1)
      .reduce((sum, value) => sum + Math.max(value, 0), 0);
    const equityMultiple = safeDivide(totalInflows, equityRequired);

    addMetric(
      metrics,
      traces,
      "stabilizedNoi",
      stabilizedNoi,
      "stabilizedNoi = NOI projected at hold year",
      {
        holdYears: validated.holdYears,
        rentGrowthRate: validated.rentGrowthRate,
        expenseInflationRate: validated.expenseInflationRate
      }
    );
    addMetric(metrics, traces, "leveredIrr", leveredIrr, "IRR(leveredCashFlows)", {
      leveredCashFlows: cashFlows.levered
    });
    addMetric(
      metrics,
      traces,
      "unleveredIrr",
      unleveredIrr,
      "IRR(unleveredCashFlows)",
      {
        unleveredCashFlows: cashFlows.unlevered
      }
    );
    addMetric(
      metrics,
      traces,
      "equityMultiple",
      equityMultiple,
      "equityMultiple = positiveLeveredInflows / equityRequired",
      {
        positiveLeveredInflows: totalInflows,
        equityRequired
      }
    );
  }

  return {
    persona,
    assumptions: validated,
    metrics,
    traces,
    cashFlows: {
      levered: cashFlows.levered.map((value) => round(value)),
      unlevered: cashFlows.unlevered.map((value) => round(value))
    }
  };
}
