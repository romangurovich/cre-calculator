import { getPersonaConfig } from "./personas.js";

function csvEscape(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);
  if (text.includes(",") || text.includes("\n") || text.includes("\"")) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }

  return text;
}

function buildMetricRows(analysis) {
  const scenarioLabels = analysis.scenarios.map((scenario) => scenario.label);
  const rows = [["metric", "baseline", ...scenarioLabels]];
  const metricNames = Object.keys(analysis.baseline.metrics);

  for (const metricName of metricNames) {
    const row = [
      metricName,
      analysis.baseline.metrics[metricName],
      ...analysis.scenarios.map((scenario) => scenario.metrics[metricName] ?? "")
    ];
    rows.push(row);
  }

  return rows;
}

function buildTraceRows(analysis) {
  const rows = [["scenario", "metric", "formulaId", "output", "inputKeys"]];
  const allScenarios = [analysis.baseline, ...analysis.scenarios];

  for (const scenario of allScenarios) {
    for (const [metric, trace] of Object.entries(scenario.traces)) {
      rows.push([
        scenario.label,
        metric,
        trace.formulaId,
        trace.output,
        Object.keys(trace.inputs).join(";")
      ]);
    }
  }

  return rows;
}

export function exportAnalysisToCsv(analysis) {
  const lines = [];
  lines.push("section,key,value");
  lines.push(`meta,persona,${csvEscape(analysis.persona)}`);
  lines.push(`meta,generatedAt,${csvEscape(analysis.generatedAt)}`);
  lines.push("");

  lines.push("section,assumption,value");
  for (const [key, value] of Object.entries(analysis.baseline.assumptions)) {
    lines.push(`assumptions,${csvEscape(key)},${csvEscape(value)}`);
  }
  lines.push("");

  lines.push("section,scenario metrics");
  for (const row of buildMetricRows(analysis)) {
    lines.push(row.map(csvEscape).join(","));
  }
  lines.push("");

  lines.push("section,formula traces");
  for (const row of buildTraceRows(analysis)) {
    lines.push(row.map(csvEscape).join(","));
  }

  return lines.join("\n");
}

export function buildAnalysisSummary(analysis) {
  const config = getPersonaConfig(analysis.persona);
  const headlineMetricIds = config.headlineMetrics;
  const allScenarios = [analysis.baseline, ...analysis.scenarios];

  const scenarios = allScenarios.map((scenario) => {
    const headlineMetrics = {};

    for (const metric of headlineMetricIds) {
      if (metric in scenario.metrics) {
        headlineMetrics[metric] = scenario.metrics[metric];
      }
    }

    return {
      id: scenario.id,
      label: scenario.label,
      headlineMetrics,
      breachCount: scenario.breaches.length,
      breaches: scenario.breaches
    };
  });

  return {
    schemaVersion: "1.0",
    persona: analysis.persona,
    generatedAt: analysis.generatedAt,
    headlineMetricIds,
    scenarios,
    sensitivity: analysis.sensitivity
  };
}
