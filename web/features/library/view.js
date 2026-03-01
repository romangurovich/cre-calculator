import { createBlankTemplate } from "../composer/operations.js";
import { clearChildren, createCard, createElement } from "../../ui/primitives.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function countFields(template) {
  return template.sections.reduce((sum, section) => sum + section.fields.length, 0);
}

export function renderLibraryView(container, { state, navigate }) {
  clearChildren(container);

  if (!state.libraryView) {
    state.libraryView = {
      personaFilter: "all",
      message: ""
    };
  }
  const viewState = state.libraryView;

  function listTemplates() {
    const templates = state.templateStore.listTemplates();
    if (viewState.personaFilter === "all") {
      return templates;
    }

    return templates.filter((template) => template.persona === viewState.personaFilter);
  }

  function refresh() {
    renderLibraryView(container, { state, navigate });
  }

  const wrapper = createElement("div", { className: "stack" });

  const actionsCard = createCard("Template Lifecycle", "Create, duplicate, rename, and delete templates.");
  const controls = createElement("div", { className: "cluster" });

  const personaFilter = createElement("select");
  for (const optionValue of ["all", "landlord", "owner-operator"]) {
    const option = createElement("option", {
      text:
        optionValue === "all"
          ? "All Personas"
          : optionValue === "landlord"
            ? "Commercial Landlord"
            : "Owner / Operator",
      attributes: { value: optionValue }
    });
    if (optionValue === viewState.personaFilter) {
      option.selected = true;
    }
    personaFilter.appendChild(option);
  }

  personaFilter.addEventListener("change", (event) => {
    viewState.personaFilter = event.target.value;
    refresh();
  });
  controls.appendChild(personaFilter);

  const createButton = createElement("button", { className: "primary", text: "Create Blank Template" });
  createButton.type = "button";
  createButton.addEventListener("click", () => {
    const persona = viewState.personaFilter === "all" ? "landlord" : viewState.personaFilter;
    const draft = createBlankTemplate({
      name: `${persona === "landlord" ? "Landlord" : "Owner"} Draft Template`,
      persona
    });
    state.templateStore.createTemplate({
      name: draft.name,
      persona,
      sections: draft.sections
    });
    viewState.message = "Created a new blank template.";
    refresh();
  });
  controls.appendChild(createButton);

  actionsCard.appendChild(controls);
  if (viewState.message) {
    actionsCard.appendChild(createElement("div", { className: "message success", text: viewState.message }));
  }
  wrapper.appendChild(actionsCard);

  const list = createElement("div", { className: "grid grid-2" });
  for (const template of listTemplates()) {
    const card = createElement("article", { className: "card stack" });
    card.appendChild(createElement("h3", { className: "card-title", text: template.name }));
    card.appendChild(createElement("span", {
      className: "pill",
      text: `${template.persona} · ${template.source === "built-in" ? "Built-In" : "User"}`
    }));
    card.appendChild(createElement("p", {
      className: "route-description",
      text: `${template.sections.length} sections · ${countFields(template)} mapped fields`
    }));

    const buttonRows = createElement("div", { className: "stack" });
    const firstRow = createElement("div", { className: "cluster" });
    const secondRow = createElement("div", { className: "cluster" });

    const editLink = createElement("a", {
      className: "button-link",
      text: "Edit in Composer",
      attributes: { href: "#composer" }
    });
    editLink.addEventListener("click", (event) => {
      event.preventDefault();
      state.composerView = {
        persona: template.persona,
        selectedTemplateId: template.templateId,
        workingTemplate: clone(template),
        message: `Loaded template: ${template.name}`,
        error: ""
      };
      navigate("composer");
    });
    secondRow.appendChild(editLink);

    const useButton = createElement("button", { text: "Use in Analysis" });
    useButton.type = "button";
    useButton.addEventListener("click", () => {
      state.analysisView = {
        persona: template.persona,
        templateId: template.templateId,
        baselineValues: {},
        scenarios: [],
        analysis: null,
        errorMessage: ""
      };
      navigate("analysis");
    });
    firstRow.appendChild(useButton);

    const duplicateButton = createElement("button", { text: "Duplicate" });
    duplicateButton.type = "button";
    duplicateButton.addEventListener("click", () => {
      state.templateStore.duplicateTemplate(template.templateId);
      viewState.message = `Duplicated template: ${template.name}`;
      refresh();
    });
    firstRow.appendChild(duplicateButton);

    if (template.source === "user") {
      const renameButton = createElement("button", { text: "Rename" });
      renameButton.type = "button";
      renameButton.addEventListener("click", () => {
        const nextName = window.prompt("Rename template", template.name);
        if (!nextName) {
          return;
        }
        state.templateStore.renameTemplate(template.templateId, nextName.trim());
        viewState.message = `Renamed template to ${nextName.trim()}.`;
        refresh();
      });
      secondRow.appendChild(renameButton);

      const deleteButton = createElement("button", { className: "danger", text: "Delete" });
      deleteButton.type = "button";
      deleteButton.addEventListener("click", () => {
        const confirmed = window.confirm(`Delete template \"${template.name}\"?`);
        if (!confirmed) {
          return;
        }
        state.templateStore.deleteTemplate(template.templateId);
        viewState.message = `Deleted template: ${template.name}`;
        refresh();
      });
      secondRow.appendChild(deleteButton);
    }

    buttonRows.appendChild(firstRow);
    buttonRows.appendChild(secondRow);
    card.appendChild(buttonRows);
    list.appendChild(card);
  }

  wrapper.appendChild(list);
  container.appendChild(wrapper);
}
