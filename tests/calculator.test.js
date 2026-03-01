import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAnalysisSummary,
  buildScenarioAnalysis,
  calculatePersonaScenario,
  exportAnalysisToCsv,
  getPersonaConfig
} from "../src/index.js";

const landlordAssumptions = {
  purchasePrice: 4500000,
  closingCosts: 90000,
  capexReserve: 100000,
  ltv: 0.7,
  interestRateAnnual: 0.065,
  amortizationYears: 25,
  holdYears: 10,
  rentableSqft: 25000,
  occupancyRate: 0.92,
  rentPerSqftAnnual: 35,
  operatingExpensesAnnual: 240000,
  expenseInflationRate: 0.025,
  rentGrowthRate: 0.03,
  exitCapRate: 0.07,
  saleCostRate: 0.03
};

const ownerAssumptions = {
  ...landlordAssumptions,
  currentLeaseCostAnnual: 500000,
  grossMarginRate: 0.45,
  movingCosts: 120000
};

test("calculator is deterministic for same inputs", () => {
  const first = calculatePersonaScenario({
    persona: "landlord",
    assumptions: landlordAssumptions
  });
  const second = calculatePersonaScenario({
    persona: "landlord",
    assumptions: landlordAssumptions
  });

  assert.deepEqual(first.metrics, second.metrics);
  assert.deepEqual(first.traces, second.traces);
});

test("owner-operator and landlord return persona-specific metrics", () => {
  const owner = calculatePersonaScenario({
    persona: "owner-operator",
    assumptions: ownerAssumptions
  });
  const landlord = calculatePersonaScenario({
    persona: "landlord",
    assumptions: landlordAssumptions
  });

  assert.ok("monthlyCashBurdenVsLease" in owner.metrics);
  assert.ok("breakEvenRevenueImpactAnnual" in owner.metrics);
  assert.ok("leveredIrr" in landlord.metrics);
  assert.ok("equityMultiple" in landlord.metrics);
});

test("scenario analysis compares deltas from baseline", () => {
  const analysis = buildScenarioAnalysis({
    persona: "landlord",
    baselineAssumptions: landlordAssumptions,
    scenarios: [
      {
        id: "downside",
        label: "Downside",
        overrides: {
          occupancyRate: 0.85,
          rentGrowthRate: 0.02
        }
      },
      {
        id: "rate-spike",
        label: "Rate Spike",
        overrides: {
          interestRateAnnual: 0.08
        }
      }
    ]
  });

  assert.equal(analysis.baseline.label, "Baseline");
  assert.equal(analysis.scenarios.length, 2);
  assert.ok(Number.isFinite(analysis.scenarios[0].deltasFromBaseline.noi));
  assert.ok(Number.isFinite(analysis.scenarios[1].deltasFromBaseline.dscr));
});

test("threshold breaches are highlighted", () => {
  const analysis = buildScenarioAnalysis({
    persona: "landlord",
    baselineAssumptions: landlordAssumptions,
    scenarios: [
      {
        label: "High vacancy",
        overrides: {
          occupancyRate: 0.72,
          interestRateAnnual: 0.085
        }
      }
    ],
    thresholds: {
      minDSCR: 1.3
    }
  });

  assert.ok(analysis.scenarios[0].breaches.some((item) => item.rule === "minDSCR"));
});

test("CSV export includes assumptions, metrics, and formula identifiers", () => {
  const analysis = buildScenarioAnalysis({
    persona: "landlord",
    baselineAssumptions: landlordAssumptions,
    scenarios: [
      {
        label: "Fast Growth",
        overrides: {
          rentGrowthRate: 0.04
        }
      }
    ]
  });

  const csv = exportAnalysisToCsv(analysis);
  assert.ok(csv.includes("section,assumption,value"));
  assert.ok(csv.includes("metric,baseline,Fast Growth"));
  assert.ok(csv.includes("formulaId"));
  assert.ok(csv.includes("capRate = noi / purchasePrice"));
});

test("summary payload includes headline metrics and breach indicators", () => {
  const analysis = buildScenarioAnalysis({
    persona: "owner-operator",
    baselineAssumptions: ownerAssumptions,
    scenarios: [
      {
        label: "Rent Recession",
        overrides: {
          rentPerSqftAnnual: 30,
          occupancyRate: 0.85
        }
      }
    ]
  });

  const summary = buildAnalysisSummary(analysis);
  const config = getPersonaConfig("owner-operator");

  assert.equal(summary.persona, "owner-operator");
  assert.deepEqual(summary.headlineMetricIds, config.headlineMetrics);
  assert.equal(summary.scenarios.length, 2);
  assert.ok("headlineMetrics" in summary.scenarios[0]);
});
