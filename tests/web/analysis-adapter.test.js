import test from "node:test";
import assert from "node:assert/strict";

import { buildScenarioAnalysis } from "../../src/index.js";
import { buildAnalysisPayloadFromUi, runAnalysisFromUi } from "../../web/features/analysis/adapter.js";
import { PREBUILT_TEMPLATES } from "../../web/features/templates/prebuilt.js";

const landlordTemplate = PREBUILT_TEMPLATES.find(
  (template) => template.templateId === "built-in-landlord-underwriting"
);

test("analysis adapter maps UI payload to engine-ready assumptions", () => {
  const payload = buildAnalysisPayloadFromUi({
    persona: "landlord",
    template: landlordTemplate,
    baselineValues: {
      purchasePrice: "4500000",
      ltv: "0.7",
      interestRateAnnual: "0.065",
      amortizationYears: "25",
      holdYears: "10",
      rentableSqft: "25000",
      occupancyRate: "0.92",
      rentPerSqftAnnual: "35",
      operatingExpensesAnnual: "240000",
      exitCapRate: "0.07"
    },
    scenarios: [{ label: "Downside", overrides: { occupancyRate: "0.84", interestRateAnnual: "0.08" } }]
  });

  assert.equal(payload.persona, "landlord");
  assert.equal(payload.scenarios.length, 1);
  assert.equal(payload.baselineAssumptions.purchasePrice, 4500000);
  assert.equal(payload.baselineAssumptions.ltv, 0.7);
  assert.equal(payload.scenarios[0].overrides.occupancyRate, 0.84);
});

test("adapter-driven run matches direct engine outputs", () => {
  const uiInput = {
    persona: "landlord",
    template: landlordTemplate,
    baselineValues: {
      purchasePrice: "4500000",
      closingCosts: "90000",
      capexReserve: "100000",
      ltv: "0.7",
      interestRateAnnual: "0.065",
      amortizationYears: "25",
      holdYears: "10",
      rentableSqft: "25000",
      occupancyRate: "0.92",
      rentPerSqftAnnual: "35",
      operatingExpensesAnnual: "240000",
      rentGrowthRate: "0.03",
      expenseInflationRate: "0.025",
      exitCapRate: "0.07",
      saleCostRate: "0.03"
    },
    scenarios: [
      {
        id: "downside",
        label: "Downside",
        overrides: {
          occupancyRate: "0.84",
          interestRateAnnual: "0.08",
          rentGrowthRate: "0.02"
        }
      }
    ]
  };

  const adapterResult = runAnalysisFromUi(uiInput);
  const directPayload = buildAnalysisPayloadFromUi(uiInput);
  const directResult = buildScenarioAnalysis(directPayload);

  assert.deepEqual(adapterResult.baseline.metrics, directResult.baseline.metrics);
  assert.deepEqual(adapterResult.scenarios[0].metrics, directResult.scenarios[0].metrics);
  assert.deepEqual(
    adapterResult.scenarios[0].deltasFromBaseline,
    directResult.scenarios[0].deltasFromBaseline
  );
});
