import { calculatePersonaScenario } from "./calculator.js";
import { mergeAssumptions, validatePersona } from "./contracts.js";
import { getPersonaConfig } from "./personas.js";

const MAX_COMPARISON_SCENARIOS = 3;

const DRIVER_DELTAS = {
  interestRateAnnual: 0.01,
  occupancyRate: 0.05,
  rentGrowthRate: 0.01,
  exitCapRate: 0.01,
  expenseInflationRate: 0.01
};

function getNumericMetricDelta(baselineValue, comparedValue) {
  if (!Number.isFinite(baselineValue) || !Number.isFinite(comparedValue)) {
    return null;
  }

  return comparedValue - baselineValue;
}

function buildMetricDeltas(baselineMetrics, comparedMetrics) {
  const deltas = {};

  for (const metricName of Object.keys(baselineMetrics)) {
    if (!(metricName in comparedMetrics)) {
      continue;
    }

    deltas[metricName] = getNumericMetricDelta(
      baselineMetrics[metricName],
      comparedMetrics[metricName]
    );
  }

  return deltas;
}

function clampAssumption(driver, value) {
  if (driver === "occupancyRate") {
    return Math.min(1, Math.max(0, value));
  }

  if (value <= 0 && driver !== "rentGrowthRate") {
    return 0.0001;
  }

  return value;
}

export function evaluateThresholdBreaches(persona, metrics, thresholds = {}) {
  const config = getPersonaConfig(persona);
  const activeThresholds = {
    ...(config.defaultThresholds || {}),
    ...thresholds
  };

  const breaches = [];

  if (
    activeThresholds.minDSCR !== undefined &&
    Number.isFinite(metrics.dscr) &&
    metrics.dscr < activeThresholds.minDSCR
  ) {
    breaches.push({
      rule: "minDSCR",
      metric: "dscr",
      threshold: activeThresholds.minDSCR,
      value: metrics.dscr
    });
  }

  if (
    activeThresholds.minCashOnCashReturn !== undefined &&
    Number.isFinite(metrics.cashOnCashReturn) &&
    metrics.cashOnCashReturn < activeThresholds.minCashOnCashReturn
  ) {
    breaches.push({
      rule: "minCashOnCashReturn",
      metric: "cashOnCashReturn",
      threshold: activeThresholds.minCashOnCashReturn,
      value: metrics.cashOnCashReturn
    });
  }

  if (
    activeThresholds.maxMonthlyCashBurdenVsLease !== undefined &&
    Number.isFinite(metrics.monthlyCashBurdenVsLease) &&
    metrics.monthlyCashBurdenVsLease > activeThresholds.maxMonthlyCashBurdenVsLease
  ) {
    breaches.push({
      rule: "maxMonthlyCashBurdenVsLease",
      metric: "monthlyCashBurdenVsLease",
      threshold: activeThresholds.maxMonthlyCashBurdenVsLease,
      value: metrics.monthlyCashBurdenVsLease
    });
  }

  return breaches;
}

export function rankSensitivityDrivers({
  persona,
  assumptions,
  outcomeMetric,
  drivers = Object.keys(DRIVER_DELTAS)
}) {
  validatePersona(persona);
  const baseline = calculatePersonaScenario({ persona, assumptions });
  const baselineValue = baseline.metrics[outcomeMetric];

  if (!Number.isFinite(baselineValue)) {
    return [];
  }

  const ranked = [];

  for (const driver of drivers) {
    if (!(driver in DRIVER_DELTAS) || !Number.isFinite(assumptions[driver])) {
      continue;
    }

    const delta = DRIVER_DELTAS[driver];
    const upAssumptions = {
      ...assumptions,
      [driver]: clampAssumption(driver, assumptions[driver] + delta)
    };
    const downAssumptions = {
      ...assumptions,
      [driver]: clampAssumption(driver, assumptions[driver] - delta)
    };

    const upResult = calculatePersonaScenario({
      persona,
      assumptions: upAssumptions
    }).metrics[outcomeMetric];
    const downResult = calculatePersonaScenario({
      persona,
      assumptions: downAssumptions
    }).metrics[outcomeMetric];

    const upImpact = Number.isFinite(upResult) ? upResult - baselineValue : 0;
    const downImpact = Number.isFinite(downResult) ? downResult - baselineValue : 0;
    const impact = Math.max(Math.abs(upImpact), Math.abs(downImpact));

    ranked.push({
      driver,
      baseline: assumptions[driver],
      upImpact,
      downImpact,
      impact
    });
  }

  return ranked.sort((a, b) => b.impact - a.impact);
}

export function buildScenarioAnalysis({
  persona,
  baselineAssumptions,
  scenarios = [],
  thresholds = {},
  sensitivityMetric
}) {
  validatePersona(persona);
  if (scenarios.length > MAX_COMPARISON_SCENARIOS) {
    throw new Error(
      `Too many comparison scenarios: ${scenarios.length}. Maximum is ${MAX_COMPARISON_SCENARIOS}.`
    );
  }

  const baselineResult = calculatePersonaScenario({
    persona,
    assumptions: baselineAssumptions
  });

  const evaluatedScenarios = scenarios.map((scenario, index) => {
    const label = scenario.label || `Scenario ${index + 1}`;
    const id = scenario.id || `scenario-${index + 1}`;
    const mergedAssumptions = mergeAssumptions(baselineResult.assumptions, scenario.overrides || {});
    const result = calculatePersonaScenario({
      persona,
      assumptions: mergedAssumptions
    });

    return {
      id,
      label,
      assumptions: result.assumptions,
      metrics: result.metrics,
      traces: result.traces,
      deltasFromBaseline: buildMetricDeltas(baselineResult.metrics, result.metrics),
      breaches: evaluateThresholdBreaches(persona, result.metrics, thresholds)
    };
  });

  const config = getPersonaConfig(persona);
  const selectedSensitivityMetric =
    sensitivityMetric || config.headlineMetrics[0] || Object.keys(baselineResult.metrics)[0];

  return {
    persona,
    baseline: {
      id: "baseline",
      label: "Baseline",
      assumptions: baselineResult.assumptions,
      metrics: baselineResult.metrics,
      traces: baselineResult.traces,
      breaches: evaluateThresholdBreaches(persona, baselineResult.metrics, thresholds)
    },
    scenarios: evaluatedScenarios,
    sensitivity: {
      metric: selectedSensitivityMetric,
      ranking: rankSensitivityDrivers({
        persona,
        assumptions: baselineResult.assumptions,
        outcomeMetric: selectedSensitivityMetric
      })
    },
    thresholds,
    generatedAt: new Date().toISOString()
  };
}
