import { getRequiredInputs } from "../../../src/index.js";
import { FIELD_MAP, getFieldsForPersona } from "../templates/fields.js";
import { validateTemplateForPersona } from "../templates/validation.js";
import {
  addSection,
  createBlankTemplate,
  insertField,
  removeField
} from "./operations.js";
import { clearChildren, createCard, createElement, createInfoBubble } from "../../ui/primitives.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dragPayload(event) {
  try {
    const text =
      event.dataTransfer.getData("text/plain") || event.dataTransfer.getData("text");
    if (!text) {
      return null;
    }
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function setDragData(event, payload) {
  const text = JSON.stringify(payload);
  event.dataTransfer.setData("text/plain", text);
  event.dataTransfer.setData("text", text);
  event.dataTransfer.effectAllowed = "move";
}

function firstTemplateForPersona(templateStore, persona) {
  return templateStore.listByPersona(persona)[0] || null;
}

export function renderComposerView(container, { state }) {
  clearChildren(container);

  if (!state.composerView) {
    const initial = firstTemplateForPersona(state.templateStore, "landlord");
    state.composerView = {
      persona: "landlord",
      selectedTemplateId: initial?.templateId || null,
      workingTemplate: initial ? clone(initial) : createBlankTemplate({ name: "Draft", persona: "landlord" }),
      message: "",
      error: ""
    };
  }

  const viewState = state.composerView;

  function ensureSelection() {
    const options = state.templateStore.listByPersona(viewState.persona);
    if (options.length === 0) {
      const blank = createBlankTemplate({
        name: `${viewState.persona === "landlord" ? "Landlord" : "Owner"} Draft`,
        persona: viewState.persona
      });
      viewState.workingTemplate = blank;
      viewState.selectedTemplateId = null;
      return;
    }

    if (!options.some((item) => item.templateId === viewState.selectedTemplateId)) {
      viewState.selectedTemplateId = options[0].templateId;
      viewState.workingTemplate = clone(options[0]);
    }
  }

  function refresh() {
    renderComposerView(container, { state });
  }

  function loadSelectedTemplate() {
    if (!viewState.selectedTemplateId) {
      return;
    }

    const template = state.templateStore.getTemplate(viewState.selectedTemplateId);
    if (!template) {
      return;
    }

    viewState.workingTemplate = clone(template);
    viewState.message = `Loaded template: ${template.name}`;
    viewState.error = "";
  }

  function saveTemplate({ forceNew = false } = {}) {
    const validation = validateTemplateForPersona(viewState.workingTemplate, viewState.persona);
    if (!validation.valid) {
      viewState.error = `Missing required fields: ${validation.missingRequired.join(", ")}`;
      viewState.message = "";
      refresh();
      return;
    }

    const templateForSave = clone(viewState.workingTemplate);
    templateForSave.persona = viewState.persona;

    if (forceNew || templateForSave.source === "built-in") {
      const created = state.templateStore.createTemplate({
        name: `${templateForSave.name} Copy`,
        persona: templateForSave.persona,
        sections: templateForSave.sections
      });
      viewState.selectedTemplateId = created.templateId;
      viewState.workingTemplate = created;
      viewState.message = `Saved as new template: ${created.name}`;
      viewState.error = "";
      refresh();
      return;
    }

    const saved = state.templateStore.updateTemplate(templateForSave);
    viewState.selectedTemplateId = saved.templateId;
    viewState.workingTemplate = saved;
    viewState.message = `Saved template: ${saved.name}`;
    viewState.error = "";
    refresh();
  }

  ensureSelection();

  const wrapper = createElement("div", { className: "stack" });

  const setupCard = createCard(
    "Composer Controls",
    "Drag fields from catalog into sections. Reorder by dragging across drop lines."
  );
  const setupRow = createElement("div", { className: "grid grid-3" });

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
    viewState.error = "";
    viewState.message = "";
    ensureSelection();
    refresh();
  });
  setupRow.appendChild(createElement("label", { html: "Persona" }));
  setupRow.lastChild.appendChild(personaSelect);

  const templateSelect = createElement("select");
  const personaTemplates = state.templateStore.listByPersona(viewState.persona);
  for (const template of personaTemplates) {
    const option = createElement("option", {
      text: `${template.name}${template.source === "built-in" ? " (Built-In)" : ""}`,
      attributes: { value: template.templateId }
    });
    if (template.templateId === viewState.selectedTemplateId) {
      option.selected = true;
    }
    templateSelect.appendChild(option);
  }
  templateSelect.addEventListener("change", (event) => {
    viewState.selectedTemplateId = event.target.value;
    loadSelectedTemplate();
    refresh();
  });
  setupRow.appendChild(createElement("label", { html: "Template" }));
  setupRow.lastChild.appendChild(templateSelect);

  const actionCluster = createElement("div", { className: "cluster" });
  const saveButton = createElement("button", { className: "primary", text: "Save" });
  saveButton.type = "button";
  saveButton.addEventListener("click", () => saveTemplate());
  actionCluster.appendChild(saveButton);

  const saveAsButton = createElement("button", { text: "Save as New" });
  saveAsButton.type = "button";
  saveAsButton.addEventListener("click", () => saveTemplate({ forceNew: true }));
  actionCluster.appendChild(saveAsButton);

  const addSectionButton = createElement("button", { text: "Add Section" });
  addSectionButton.type = "button";
  addSectionButton.addEventListener("click", () => {
    const sectionName = window.prompt("Section name", "New Section");
    if (!sectionName) {
      return;
    }
    viewState.workingTemplate = addSection(viewState.workingTemplate, sectionName.trim());
    refresh();
  });
  actionCluster.appendChild(addSectionButton);

  setupRow.appendChild(actionCluster);
  setupCard.appendChild(setupRow);

  const required = getRequiredInputs(viewState.persona);
  setupCard.appendChild(
    createElement("p", {
      className: "route-description",
      text: `Required fields for ${viewState.persona}: ${required.join(", ")}`
    })
  );

  if (viewState.message) {
    setupCard.appendChild(createElement("div", { className: "message success", text: viewState.message }));
  }
  if (viewState.error) {
    setupCard.appendChild(createElement("div", { className: "message error", text: viewState.error }));
  }

  wrapper.appendChild(setupCard);

  const composerGrid = createElement("div", { className: "grid grid-2" });

  const catalogCard = createCard("Field Catalog", "Drag fields into template sections.");
  const catalog = createElement("div", { className: "stack" });
  for (const field of getFieldsForPersona(viewState.persona)) {
    const item = createElement("div", {
      className: "field-chip",
      attributes: {
        draggable: "true"
      }
    });

    const title = createElement("span", {
      className: "field-chip-main",
      text: field.label
    });
    const meta = createElement("span", { className: "field-chip-meta" });
    meta.appendChild(createElement("span", { className: "pill monospace", text: field.id }));
    meta.appendChild(
      createInfoBubble({
        helpText: field.helpText,
        label: `Info for ${field.label}`
      })
    );

    item.appendChild(title);
    item.appendChild(meta);

    item.draggable = true;
    item.addEventListener("dragstart", (event) => {
      if (event.target.closest(".info-bubble")) {
        event.preventDefault();
        return;
      }
      setDragData(event, {
        kind: "catalog",
        fieldId: field.id
      });
    });
    catalog.appendChild(item);
  }
  catalogCard.appendChild(catalog);
  composerGrid.appendChild(catalogCard);

  const canvasCard = createCard("Template Canvas", "Drop fields to compose reusable layouts.");
  const canvas = createElement("div", { className: "template-canvas stack" });

  function createDropZone(sectionId, toIndex) {
    const zone = createElement("div", { className: "drop-zone", attributes: { tabindex: "0" } });
    zone.addEventListener("dragenter", (event) => {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.add("active");
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("active");
    });
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
    });
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.remove("active");
      const payload = dragPayload(event);
      if (!payload?.fieldId) {
        return;
      }

      viewState.workingTemplate = insertField(viewState.workingTemplate, {
        fieldId: payload.fieldId,
        toSectionId: sectionId,
        toIndex,
        fromSectionId: payload.fromSectionId,
        fromIndex: payload.fromIndex
      });
      refresh();
    });
    return zone;
  }

  for (const section of viewState.workingTemplate.sections) {
    const sectionEl = createElement("section", { className: "template-section stack" });
    sectionEl.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    sectionEl.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const payload = dragPayload(event);
      if (!payload?.fieldId) {
        return;
      }

      viewState.workingTemplate = insertField(viewState.workingTemplate, {
        fieldId: payload.fieldId,
        toSectionId: section.id,
        toIndex: section.fields.length,
        fromSectionId: payload.fromSectionId,
        fromIndex: payload.fromIndex
      });
      refresh();
    });

    const sectionTitle = createElement("h4", { className: "card-title", text: section.title });
    sectionEl.appendChild(sectionTitle);

    sectionEl.appendChild(createDropZone(section.id, 0));

    for (const [index, fieldId] of section.fields.entries()) {
      const field = FIELD_MAP[fieldId];
      const chip = createElement("div", {
        className: "field-chip",
        attributes: { draggable: "true" }
      });
      chip.draggable = true;

      const chipLabel = createElement("span", {
        className: "field-chip-main",
        text: field ? field.label : fieldId
      });
      const chipMeta = createElement("span", { className: "field-chip-meta" });
      chipMeta.appendChild(createElement("span", { className: "pill monospace", text: fieldId }));
      chipMeta.appendChild(
        createInfoBubble({
          helpText: field?.helpText || fieldId,
          label: `Info for ${field ? field.label : fieldId}`
        })
      );
      chip.appendChild(chipLabel);
      chip.appendChild(chipMeta);

      chip.addEventListener("dragstart", (event) => {
        if (event.target.closest(".info-bubble")) {
          event.preventDefault();
          return;
        }
        setDragData(event, {
          kind: "placed",
          fieldId,
          fromSectionId: section.id,
          fromIndex: index
        });
      });

      const removeButton = createElement("button", { className: "ghost", text: "Remove" });
      removeButton.type = "button";
      removeButton.addEventListener("click", () => {
        viewState.workingTemplate = removeField(viewState.workingTemplate, section.id, fieldId);
        refresh();
      });

      const row = createElement("div", { className: "cluster" });
      row.appendChild(chip);
      row.appendChild(removeButton);
      sectionEl.appendChild(row);
      sectionEl.appendChild(createDropZone(section.id, index + 1));
    }

    canvas.appendChild(sectionEl);
  }

  canvasCard.appendChild(canvas);
  composerGrid.appendChild(canvasCard);

  wrapper.appendChild(composerGrid);
  container.appendChild(wrapper);
}
