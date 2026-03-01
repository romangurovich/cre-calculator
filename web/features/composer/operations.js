function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function indexOfSection(template, sectionId) {
  return template.sections.findIndex((section) => section.id === sectionId);
}

function removeFieldIfExists(template, fieldId) {
  for (const section of template.sections) {
    const index = section.fields.indexOf(fieldId);
    if (index >= 0) {
      section.fields.splice(index, 1);
    }
  }
}

export function createBlankTemplate({ name, persona }) {
  return {
    templateId: "draft-template",
    name,
    persona,
    source: "user",
    sections: [
      {
        id: "core",
        title: "Core Inputs",
        fields: []
      }
    ]
  };
}

export function addSection(template, title) {
  const next = clone(template);
  next.sections.push({
    id: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${next.sections.length + 1}`,
    title,
    fields: []
  });
  return next;
}

export function removeField(template, sectionId, fieldId) {
  const next = clone(template);
  const section = next.sections.find((item) => item.id === sectionId);
  if (!section) {
    return next;
  }

  section.fields = section.fields.filter((item) => item !== fieldId);
  return next;
}

export function insertField(template, {
  fieldId,
  toSectionId,
  toIndex,
  fromSectionId,
  fromIndex
}) {
  const next = clone(template);
  const movingWithinSameSection = Boolean(
    fromSectionId && fromSectionId === toSectionId && Number.isInteger(fromIndex)
  );

  if (fromSectionId) {
    const sourceSection = next.sections.find((section) => section.id === fromSectionId);
    if (sourceSection && fromIndex >= 0 && fromIndex < sourceSection.fields.length) {
      sourceSection.fields.splice(fromIndex, 1);
    } else {
      removeFieldIfExists(next, fieldId);
    }
  } else {
    removeFieldIfExists(next, fieldId);
  }

  const targetIndex = indexOfSection(next, toSectionId);
  if (targetIndex < 0) {
    return next;
  }

  const targetSection = next.sections[targetIndex];
  let insertionIndex = toIndex ?? targetSection.fields.length;

  if (movingWithinSameSection && fromIndex < insertionIndex) {
    insertionIndex -= 1;
  }

  const safeIndex = Math.max(0, Math.min(insertionIndex, targetSection.fields.length));
  targetSection.fields.splice(safeIndex, 0, fieldId);

  return next;
}
