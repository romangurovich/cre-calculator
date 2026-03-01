import test from "node:test";
import assert from "node:assert/strict";

import { createTemplateStore } from "../../web/features/templates/store.js";

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

test("template store supports create/duplicate/rename/delete lifecycle", () => {
  const storage = createMemoryStorage();
  const store = createTemplateStore(storage);

  const created = store.createTemplate({
    name: "Custom Landlord",
    persona: "landlord",
    sections: [{ id: "core", title: "Core", fields: ["purchasePrice", "ltv"] }]
  });

  assert.ok(created.templateId.startsWith("user-template-"));
  assert.equal(store.getTemplate(created.templateId)?.name, "Custom Landlord");

  const duplicate = store.duplicateTemplate(created.templateId);
  assert.ok(duplicate.name.includes("Copy"));

  const renamed = store.renameTemplate(created.templateId, "Renamed Template");
  assert.equal(renamed.name, "Renamed Template");

  store.deleteTemplate(created.templateId);
  assert.equal(store.getTemplate(created.templateId), null);
});

test("template store persists user templates to provided storage", () => {
  const storage = createMemoryStorage();
  const firstStore = createTemplateStore(storage);

  const created = firstStore.createTemplate({
    name: "Persisted Owner Template",
    persona: "owner-operator",
    sections: [{ id: "core", title: "Core", fields: ["purchasePrice", "currentLeaseCostAnnual"] }]
  });

  const secondStore = createTemplateStore(storage);
  const loaded = secondStore.getTemplate(created.templateId);

  assert.ok(loaded);
  assert.equal(loaded?.name, "Persisted Owner Template");
  assert.equal(loaded?.persona, "owner-operator");
});

test("template store filters by persona for compatibility", () => {
  const storage = createMemoryStorage();
  const store = createTemplateStore(storage);

  store.createTemplate({
    name: "User Owner",
    persona: "owner-operator",
    sections: [{ id: "ops", title: "Ops", fields: ["purchasePrice", "currentLeaseCostAnnual"] }]
  });

  const ownerTemplates = store.listByPersona("owner-operator");
  const landlordTemplates = store.listByPersona("landlord");

  assert.ok(ownerTemplates.every((item) => item.persona === "owner-operator"));
  assert.ok(landlordTemplates.every((item) => item.persona === "landlord"));
});
