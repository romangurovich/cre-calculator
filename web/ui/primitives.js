export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  if (options.className) {
    element.className = options.className;
  }

  if (options.text !== undefined) {
    element.textContent = options.text;
  }

  if (options.html !== undefined) {
    element.innerHTML = options.html;
  }

  if (options.attributes) {
    for (const [name, value] of Object.entries(options.attributes)) {
      element.setAttribute(name, String(value));
    }
  }

  return element;
}

export function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function appendChildren(element, children) {
  for (const child of children) {
    if (!child) {
      continue;
    }

    element.appendChild(child);
  }

  return element;
}

export function createCard(title, description = "") {
  const card = createElement("section", { className: "card stack" });
  card.appendChild(createElement("h3", { className: "card-title", text: title }));
  if (description) {
    card.appendChild(createElement("p", { className: "route-description", text: description }));
  }
  return card;
}

export function createInputLabel({ label, id, input }) {
  const wrapper = createElement("label", { attributes: { for: id } });
  wrapper.appendChild(createElement("span", { text: label }));
  input.id = id;
  wrapper.appendChild(input);
  return wrapper;
}

export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "-";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: Math.abs(value) >= 1000 ? 0 : 4
  }).format(value);
}

export function downloadTextFile(fileName, contents, mimeType = "text/plain") {
  const blob = new Blob([contents], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = createElement("a", {
    attributes: {
      href: url,
      download: fileName
    }
  });
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
