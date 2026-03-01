import { PREBUILT_TEMPLATES } from "./prebuilt.js";

const STORAGE_KEY = "cre-calc-user-templates-v1";

function cloneTemplate(template) {
  return JSON.parse(JSON.stringify(template));
}

function normalizeLoadedTemplates(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      ...item,
      source: "user"
    }));
}

function createTemplateId() {
  return `user-template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTemplateStore(storage) {
  const storageRef =
    storage ||
    (typeof window !== "undefined" && window.localStorage
      ? window.localStorage
      : undefined);

  let userTemplates = [];

  if (storageRef) {
    try {
      const raw = storageRef.getItem(STORAGE_KEY);
      userTemplates = normalizeLoadedTemplates(raw ? JSON.parse(raw) : []);
    } catch {
      userTemplates = [];
    }
  }

  function persist() {
    if (!storageRef) {
      return;
    }

    storageRef.setItem(STORAGE_KEY, JSON.stringify(userTemplates));
  }

  function listTemplates() {
    return [...PREBUILT_TEMPLATES, ...userTemplates].map(cloneTemplate);
  }

  function listByPersona(persona) {
    return listTemplates().filter((template) => template.persona === persona);
  }

  function getTemplate(templateId) {
    return listTemplates().find((template) => template.templateId === templateId) || null;
  }

  function createTemplate({ name, persona, sections }) {
    const template = {
      templateId: createTemplateId(),
      name,
      persona,
      source: "user",
      sections: cloneTemplate(sections)
    };

    userTemplates.push(template);
    persist();
    return cloneTemplate(template);
  }

  function updateTemplate(template) {
    if (template.source === "built-in") {
      throw new Error("Built-in templates cannot be overwritten.");
    }

    const index = userTemplates.findIndex(
      (current) => current.templateId === template.templateId
    );
    if (index < 0) {
      throw new Error(`Template not found: ${template.templateId}`);
    }

    userTemplates[index] = {
      ...cloneTemplate(template),
      source: "user"
    };
    persist();
    return cloneTemplate(userTemplates[index]);
  }

  function duplicateTemplate(templateId) {
    const template = getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return createTemplate({
      name: `${template.name} Copy`,
      persona: template.persona,
      sections: template.sections
    });
  }

  function renameTemplate(templateId, name) {
    const template = userTemplates.find((item) => item.templateId === templateId);
    if (!template) {
      throw new Error("Only user templates can be renamed.");
    }

    template.name = name;
    persist();
    return cloneTemplate(template);
  }

  function deleteTemplate(templateId) {
    const nextTemplates = userTemplates.filter((item) => item.templateId !== templateId);
    if (nextTemplates.length === userTemplates.length) {
      throw new Error("Only user templates can be deleted.");
    }

    userTemplates = nextTemplates;
    persist();
  }

  return {
    listTemplates,
    listByPersona,
    getTemplate,
    createTemplate,
    updateTemplate,
    duplicateTemplate,
    renameTemplate,
    deleteTemplate
  };
}
