const EPSILON = 1e-9;

export function round(value, precision = 6) {
  if (!Number.isFinite(value)) {
    return value;
  }

  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function safeDivide(numerator, denominator) {
  if (Math.abs(denominator) < EPSILON) {
    return 0;
  }

  return numerator / denominator;
}

export function annualDebtService({ loanAmount, interestRateAnnual, amortizationYears }) {
  if (loanAmount <= 0 || amortizationYears <= 0) {
    return 0;
  }

  const periods = amortizationYears * 12;
  const monthlyRate = interestRateAnnual / 12;

  if (Math.abs(monthlyRate) < EPSILON) {
    return loanAmount / amortizationYears;
  }

  const monthlyPayment =
    (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -periods);

  return monthlyPayment * 12;
}

export function remainingLoanBalance({
  loanAmount,
  interestRateAnnual,
  amortizationYears,
  yearsElapsed
}) {
  if (loanAmount <= 0 || amortizationYears <= 0) {
    return 0;
  }

  const periods = amortizationYears * 12;
  const paidPeriods = Math.min(Math.max(yearsElapsed * 12, 0), periods);
  const monthlyRate = interestRateAnnual / 12;

  if (Math.abs(monthlyRate) < EPSILON) {
    const principalPaid = (loanAmount / periods) * paidPeriods;
    return Math.max(loanAmount - principalPaid, 0);
  }

  const monthlyPayment =
    (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -periods);
  const growth = (1 + monthlyRate) ** paidPeriods;
  const balance = loanAmount * growth - monthlyPayment * ((growth - 1) / monthlyRate);
  return Math.max(balance, 0);
}

export function effectiveGrossIncome({ rentableSqft, rentPerSqftAnnual, occupancyRate }) {
  return rentableSqft * rentPerSqftAnnual * occupancyRate;
}

export function netOperatingIncome({
  rentableSqft,
  rentPerSqftAnnual,
  occupancyRate,
  operatingExpensesAnnual
}) {
  return (
    effectiveGrossIncome({ rentableSqft, rentPerSqftAnnual, occupancyRate }) -
    operatingExpensesAnnual
  );
}

export function irr(cashFlows, maxIterations = 200, tolerance = 1e-7) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) {
    return 0;
  }

  const hasPositive = cashFlows.some((value) => value > 0);
  const hasNegative = cashFlows.some((value) => value < 0);
  if (!hasPositive || !hasNegative) {
    return 0;
  }

  const npv = (rate) =>
    cashFlows.reduce((sum, value, index) => sum + value / (1 + rate) ** index, 0);

  let low = -0.9999;
  let high = 10;
  let npvLow = npv(low);
  let npvHigh = npv(high);

  if (npvLow * npvHigh > 0) {
    return 0;
  }

  for (let i = 0; i < maxIterations; i += 1) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);

    if (Math.abs(npvMid) <= tolerance) {
      return mid;
    }

    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }

    if (Math.abs(high - low) <= tolerance) {
      return mid;
    }
  }

  return (low + high) / 2;
}

export function buildTrace(formulaId, inputs, output) {
  return {
    formulaId,
    inputs,
    output
  };
}
