import { buildAnalysisSummary, exportAnalysisToCsv, getPersonaConfig } from "../../../src/index.js";
import { SCENARIO_OVERRIDE_FIELDS, getFieldLabel, FIELD_MAP } from "../templates/fields.js";
import { runAnalysisFromUi } from "./adapter.js";
import {
  appendChildren,
  clearChildren,
  createCard,
  createElement,
  createInputLabel,
  downloadTextFile,
  formatNumber
} from "../../ui/primitives.js";

function ensureTemplateState(viewState, templateStore) {
  const compatibleTemplates = templateStore.listByPersona(viewState.persona);
  if (compatibleTemplates.length === 0) {
    viewState.templateId = null;
    return null;
  }

  if (!compatibleTemplates.some((template) => template.templateId === viewState.templateId)) {
    viewState.templateId = compatibleTemplates[0].templateId;
  }

  const template = compatibleTemplates.find((item) => item.templateId === viewState.templateId);
  for (const section of template.sections) {
    for (const fieldId of section.fields) {
      if (viewState.baselineValues[fieldId] === undefined) {
        const field = FIELD_MAP[fieldId];
        if (field && field.defaultValue !== undefined) {
          viewState.baselineValues[fieldId] = String(field.defaultValue);
        }
      }
    }
  }

  return template;
}

function formatMetricValue(metricName, value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  const metricNameLower = metricName.toLowerCase();
  if (
    metricNameLower.includes("rate") ||
    metricNameLower.includes("irr") ||
    metricNameLower.includes("ltv") ||
    metricNameLower.includes("dscr")
  ) {
    if (metricNameLower.includes("dscr")) {
      return value.toFixed(3);
    }

    return `${(value * 100).toFixed(2)}%`;
  }

  if (Math.abs(value) >= 1000) {
    return `$${formatNumber(value)}`;
  }

  return formatNumber(value);
}

function formatDelta(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${formatMetricValue("delta", value)}`;
}

export function renderAnalysisView(container, { state }) {
  if (!state.analysisView) {
    state.analysisView = {
      persona: "landlord",
      templateId: null,
      baselineValues: {},
      scenarios: [],
      analysis: null,
      errorMessage: ""
    };
  }

  const viewState = state.analysisView;

  function runAnalysis(template) {
    try {
      const analysis = runAnalysisFromUi({
        persona: viewState.persona,
        template,
        baselineValues: viewState.baselineValues,
        scenarios: viewState.scenarios
      });
      viewState.analysis = analysis;
      viewState.errorMessage = "";
    } catch (error) {
      viewState.errorMessage = error instanceof Error ? error.message : String(error);
    }
  }

  function addScenario() {
    if (viewState.scenarios.length >= 3) {
      return;
    }

    viewState.scenarios.push({
      id: `scenario-${Date.now()}-${viewState.scenarios.length + 1}`,
      label: `Scenario ${viewState.scenarios.length + 1}`,
      overrides: {}
    });
    render();
  }

  function removeScenario(index) {
    viewState.scenarios.splice(index, 1);
    render();
  }

  function render() {
    clearChildren(container);

    const template = ensureTemplateState(viewState, state.templateStore);
    const compatibleTemplates = state.templateStore.listByPersona(viewState.persona);

    const layout = createElement("div", { className: "stack" });

    const controlsCard = createCard(
      "Analysis Setup",
      "Select persona and template, adjust assumptions, then run baseline + comparison scenarios."
    );

    const controlsRow = createElement("div", { className: "grid grid-3" });

    const personaSelect = createElement("select");
    for (const persona of ["landlord", "owner-operator"]) {
      const option = createElement("option", {
        text: persona === "landlord" ? "Commercial Landlord" : "Owner / Operator",
        attributes: { value: persona }
      });
      if (persona === viewState.persona) {
        option.selected = true;
      }
      personaSelect.appendChild(option);
    }
    personaSelect.addEventListener("change", (event) => {
      viewState.persona = event.target.value;
      viewState.analysis = null;
      render();
    });

    const templateSelect = createElement("select");
    for (const item of compatibleTemplates) {
      const option = createElement("option", {
        text: `${item.name}${item.source === "built-in" ? " (Built-In)" : ""}`,
        attributes: { value: item.templateId }
      });
      if (item.templateId === viewState.templateId) {
        option.selected = true;
      }
      templateSelect.appendChild(option);
    }
    templateSelect.addEventListener("change", (event) => {
      viewState.templateId = event.target.value;
      viewState.analysis = null;
      render();
    });

    const runButton = createElement("button", { className: "primary", text: "Calculate" });
    runButton.type = "button";
    runButton.addEventListener("click", () => {
      if (!template) {
        return;
      }

      runAnalysis(template);
      render();
    });

    controlsRow.appendChild(createInputLabel({
      label: "Persona",
      id: "analysis-persona",
      input: personaSelect
    }));
    controlsRow.appendChild(createInputLabel({
      label: "Template",
      id: "analysis-template",
      input: templateSelect
    }));

    const actionWrap = createElement("div", { className: "stack" });
    actionWrap.appendChild(createElement("span", { className: "pill", text: "Baseline + 3 scenarios max" }));
    actionWrap.appendChild(runButton);
    controlsRow.appendChild(actionWrap);
    controlsCard.appendChild(controlsRow);

    layout.appendChild(controlsCard);

    if (viewState.errorMessage) {
      layout.appendChild(createElement("div", { className: "message error", text: viewState.errorMessage }));
    }

    if (!template) {
      layout.appendChild(
        createElement("div", {
          className: "message",
          text: "No compatible templates are available for this persona. Create one in Template Library."
        })
      );

      container.appendChild(layout);
      return;
    }

    const assumptionsCard = createCard("Assumptions", "Fields are rendered from the selected template.");
    const assumptionsGrid = createElement("div", { className: "grid grid-2" });

    for (const section of template.sections) {
      const sectionCard = createElement("section", { className: "template-section stack" });
      sectionCard.appendChild(createElement("h4", { className: "card-title", text: section.title }));
      for (const fieldId of section.fields) {
        const field = FIELD_MAP[fieldId];
        if (!field) {
          continue;
        }

        const input = createElement("input", {
          attributes: {
            type: field.type || "number",
            step: field.step ?? "any"
          }
        });
        if (field.min !== undefined) {
          input.min = String(field.min);
        }
        if (field.max !== undefined) {
          input.max = String(field.max);
        }
        input.value = viewState.baselineValues[fieldId] ?? String(field.defaultValue ?? "");
        input.addEventListener("input", (event) => {
          viewState.baselineValues[fieldId] = event.target.value;
        });

        sectionCard.appendChild(
          createInputLabel({
            label: field.label,
            id: `assumption-${fieldId}`,
            input,
            helpText: field.helpText
          })
        );
      }
      assumptionsGrid.appendChild(sectionCard);
    }
    assumptionsCard.appendChild(assumptionsGrid);
    layout.appendChild(assumptionsCard);

    const scenarioCard = createCard(
      "Scenarios",
      "Create up to three comparison cases. Leave a field blank to inherit baseline values."
    );
    const scenarioActions = createElement("div", { className: "cluster" });
    const addScenarioButton = createElement("button", {
      text: "Add Comparison Scenario",
      className: viewState.scenarios.length >= 3 ? "ghost" : ""
    });
    addScenarioButton.type = "button";
    addScenarioButton.disabled = viewState.scenarios.length >= 3;
    addScenarioButton.addEventListener("click", addScenario);
    scenarioActions.appendChild(addScenarioButton);
    scenarioCard.appendChild(scenarioActions);

    const scenarioGrid = createElement("div", { className: "grid" });
    for (const [index, scenario] of viewState.scenarios.entries()) {
      const scenarioPanel = createElement("section", { className: "template-section stack" });
      const headingRow = createElement("div", { className: "cluster" });
      headingRow.appendChild(createElement("span", { className: "pill", text: `Scenario ${index + 1}` }));
      const removeButton = createElement("button", { className: "danger", text: "Remove" });
      removeButton.type = "button";
      removeButton.addEventListener("click", () => removeScenario(index));
      headingRow.appendChild(removeButton);
      scenarioPanel.appendChild(headingRow);

      const labelInput = createElement("input", { attributes: { type: "text" } });
      labelInput.value = scenario.label;
      labelInput.addEventListener("input", (event) => {
        scenario.label = event.target.value;
      });
      scenarioPanel.appendChild(
        createInputLabel({
          label: "Label",
          id: `scenario-label-${scenario.id}`,
          input: labelInput
        })
      );

      const overrideGrid = createElement("div", { className: "grid grid-3" });
      for (const fieldId of SCENARIO_OVERRIDE_FIELDS) {
        const field = FIELD_MAP[fieldId];
        if (!field) {
          continue;
        }

        const input = createElement("input", {
          attributes: {
            type: "number",
            step: field.step ?? "any",
            placeholder: "inherit"
          }
        });
        if (field.min !== undefined) {
          input.min = String(field.min);
        }
        if (field.max !== undefined) {
          input.max = String(field.max);
        }
        input.value = scenario.overrides[fieldId] ?? "";
        input.addEventListener("input", (event) => {
          scenario.overrides[fieldId] = event.target.value;
        });

        overrideGrid.appendChild(
          createInputLabel({
            label: getFieldLabel(fieldId),
            id: `scenario-${scenario.id}-${fieldId}`,
            input,
            helpText: field.helpText
          })
        );
      }
      scenarioPanel.appendChild(overrideGrid);
      scenarioGrid.appendChild(scenarioPanel);
    }
    scenarioCard.appendChild(scenarioGrid);
    layout.appendChild(scenarioCard);

    if (viewState.analysis) {
      const resultCard = createCard("Results", "Baseline and scenario metrics with deltas.");

      const exportActions = createElement("div", { className: "cluster" });
      const exportCsvButton = createElement("button", { text: "Export CSV" });
      exportCsvButton.type = "button";
      exportCsvButton.addEventListener("click", () => {
        const csv = exportAnalysisToCsv(viewState.analysis);
        downloadTextFile("analysis-export.csv", csv, "text/csv");
      });

      const exportSummaryButton = createElement("button", { text: "Export Summary JSON" });
      exportSummaryButton.type = "button";
      exportSummaryButton.addEventListener("click", () => {
        const summary = buildAnalysisSummary(viewState.analysis);
        downloadTextFile("analysis-summary.json", JSON.stringify(summary, null, 2), "application/json");
      });

      appendChildren(exportActions, [exportCsvButton, exportSummaryButton]);
      resultCard.appendChild(exportActions);

      const tableWrap = createElement("div", { className: "stack" });
      const table = createElement("table", { className: "metric-table" });
      const head = createElement("thead");
      const headRow = createElement("tr");
      headRow.appendChild(createElement("th", { text: "Metric" }));
      headRow.appendChild(createElement("th", { text: "Baseline" }));
      for (const scenario of viewState.analysis.scenarios) {
        headRow.appendChild(createElement("th", { text: scenario.label }));
      }
      head.appendChild(headRow);
      table.appendChild(head);

      const body = createElement("tbody");
      for (const metricName of Object.keys(viewState.analysis.baseline.metrics)) {
        const row = createElement("tr");
        row.appendChild(createElement("td", { text: metricName }));
        row.appendChild(
          createElement("td", {
            text: formatMetricValue(metricName, viewState.analysis.baseline.metrics[metricName])
          })
        );

        for (const scenario of viewState.analysis.scenarios) {
          const cell = createElement("td");
          cell.textContent = formatMetricValue(metricName, scenario.metrics[metricName]);
          const delta = scenario.deltasFromBaseline[metricName];
          if (Number.isFinite(delta)) {
            const deltaTag = createElement("span", {
              className: `metric-delta ${delta > 0 ? "positive" : delta < 0 ? "negative" : ""}`,
              text: `Delta ${formatDelta(delta)}`
            });
            cell.appendChild(deltaTag);
          }
          row.appendChild(cell);
        }

        body.appendChild(row);
      }
      table.appendChild(body);
      tableWrap.appendChild(table);
      resultCard.appendChild(tableWrap);

      const personaConfig = getPersonaConfig(viewState.persona);
      const highlight = createElement("div", { className: "stack" });
      highlight.appendChild(createElement("h4", { className: "card-title", text: "Threshold Alerts" }));
      for (const result of [viewState.analysis.baseline, ...viewState.analysis.scenarios]) {
        const row = createElement("div", { className: "template-section stack" });
        row.appendChild(createElement("strong", { text: result.label }));
        if (result.breaches.length === 0) {
          row.appendChild(createElement("span", { className: "pill", text: "No breaches" }));
        } else {
          const text = result.breaches
            .map((breach) => `${breach.rule}: ${formatMetricValue(breach.metric, breach.value)}`)
            .join(" | ");
          row.appendChild(createElement("div", { className: "message error", text }));
        }
        highlight.appendChild(row);
      }
      highlight.appendChild(
        createElement("p", {
          className: "route-description",
          text: `Default thresholds loaded from ${personaConfig.label} persona configuration.`
        })
      );
      resultCard.appendChild(highlight);

      layout.appendChild(resultCard);
    }

    container.appendChild(layout);
  }

  render();
}
