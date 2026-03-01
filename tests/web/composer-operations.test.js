import test from "node:test";
import assert from "node:assert/strict";

import { addSection, insertField, removeField } from "../../web/features/composer/operations.js";

function baseTemplate() {
  return {
    templateId: "draft",
    name: "Draft",
    persona: "landlord",
    sections: [
      {
        id: "acquisition",
        title: "Acquisition",
        fields: ["purchasePrice", "closingCosts", "capexReserve"]
      },
      { id: "financing", title: "Financing", fields: ["ltv", "interestRateAnnual"] }
    ]
  };
}

test("insertField adds catalog field into target section", () => {
  const updated = insertField(baseTemplate(), {
    fieldId: "holdYears",
    toSectionId: "acquisition",
    toIndex: 1
  });

  assert.deepEqual(updated.sections[0].fields, [
    "purchasePrice",
    "holdYears",
    "closingCosts",
    "capexReserve"
  ]);
});

test("insertField reorders existing field across sections", () => {
  const updated = insertField(baseTemplate(), {
    fieldId: "closingCosts",
    fromSectionId: "acquisition",
    fromIndex: 1,
    toSectionId: "financing",
    toIndex: 0
  });

  assert.deepEqual(updated.sections[0].fields, ["purchasePrice", "capexReserve"]);
  assert.deepEqual(updated.sections[1].fields, ["closingCosts", "ltv", "interestRateAnnual"]);
});

test("removeField removes placed fields", () => {
  const updated = removeField(baseTemplate(), "financing", "ltv");

  assert.deepEqual(updated.sections[1].fields, ["interestRateAnnual"]);
});

test("insertField reorders existing field within same section", () => {
  const updated = insertField(baseTemplate(), {
    fieldId: "purchasePrice",
    fromSectionId: "acquisition",
    fromIndex: 0,
    toSectionId: "acquisition",
    toIndex: 2
  });

  assert.deepEqual(updated.sections[0].fields, ["closingCosts", "purchasePrice", "capexReserve"]);
});

test("addSection appends a new section for composition", () => {
  const updated = addSection(baseTemplate(), "Stress");

  assert.equal(updated.sections.length, 3);
  assert.equal(updated.sections[2].title, "Stress");
  assert.deepEqual(updated.sections[2].fields, []);
});
