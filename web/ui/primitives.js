import { nextInfoBubbleState } from "./info-bubble-state.js";

let infoBubbleCounter = 0;

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

export function createInfoBubble({ helpText, label = "Field information" }) {
  const wrapper = createElement("span", { className: "info-bubble" });
  const tooltipId = `info-bubble-${++infoBubbleCounter}`;

  const trigger = createElement("button", {
    className: "info-bubble-button",
    text: "i",
    attributes: {
      type: "button",
      "aria-label": label,
      "aria-controls": tooltipId,
      "aria-expanded": "false",
      draggable: "false"
    }
  });

  const panel = createElement("span", {
    className: "info-bubble-panel",
    text: helpText,
    attributes: {
      id: tooltipId,
      role: "tooltip"
    }
  });

  let state = {
    open: false,
    pinned: false
  };

  function render() {
    trigger.setAttribute("aria-expanded", state.open ? "true" : "false");
    panel.hidden = !state.open;
    wrapper.classList.toggle("open", state.open);
  }

  function transition(eventType) {
    state = nextInfoBubbleState(state, eventType);
    render();
  }

  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    transition("toggle-pin");
  });

  wrapper.addEventListener("mouseenter", () => {
    transition("hover-in");
  });

  wrapper.addEventListener("mouseleave", () => {
    transition("hover-out");
  });

  trigger.addEventListener("focus", () => {
    transition("focus-in");
  });

  wrapper.addEventListener("focusout", (event) => {
    if (wrapper.contains(event.relatedTarget)) {
      return;
    }

    transition("focus-out");
  });

  trigger.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    transition("dismiss");
    trigger.blur();
  });

  render();
  appendChildren(wrapper, [trigger, panel]);
  return wrapper;
}

function createLabelContent({ label, helpText }) {
  if (!helpText) {
    return createElement("span", { text: label });
  }

  const row = createElement("span", { className: "label-row" });
  row.appendChild(createElement("span", { text: label }));
  row.appendChild(createInfoBubble({
    helpText,
    label: `Info for ${label}`
  }));
  return row;
}

export function createInputLabel({ label, id, input, helpText }) {
  const wrapper = createElement("label", { attributes: { for: id } });
  wrapper.appendChild(createLabelContent({ label, helpText }));
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
