import { renderAnalysisView } from "./features/analysis/view.js";
import { renderComposerView } from "./features/composer/view.js";
import { renderLibraryView } from "./features/library/view.js";
import { appendChildren, clearChildren, createElement } from "./ui/primitives.js";

const ROUTES = {
  analysis: {
    label: "Analysis",
    description: "Run persona-based scenarios and export results.",
    renderer: renderAnalysisView
  },
  composer: {
    label: "Template Composer",
    description: "Drag calculator fields into reusable template layouts.",
    renderer: renderComposerView
  },
  library: {
    label: "Template Library",
    description: "Manage prebuilt and user-created templates.",
    renderer: renderLibraryView
  }
};

function routeFromHash() {
  const hash = window.location.hash.replace(/^#/, "").trim();
  if (hash in ROUTES) {
    return hash;
  }

  return "analysis";
}

export function createRouter({ root, state }) {
  const shell = createElement("div", { className: "app-shell" });
  const header = createElement("header", { className: "app-header" });
  const headerInner = createElement("div", { className: "app-header-inner" });
  const titleBlock = createElement("div", { className: "stack" });
  titleBlock.appendChild(createElement("p", { className: "app-subtitle", text: "Commercial Property" }));
  titleBlock.appendChild(createElement("h1", { className: "app-title", text: "CRE Scenario Studio" }));
  const nav = createElement("nav", { className: "app-nav", attributes: { "aria-label": "Primary" } });

  appendChildren(headerInner, [titleBlock, nav]);
  header.appendChild(headerInner);

  const main = createElement("main", { className: "main-content" });
  appendChildren(shell, [header, main]);
  root.appendChild(shell);

  function renderNav(activeRoute) {
    clearChildren(nav);

    for (const [routeName, route] of Object.entries(ROUTES)) {
      const link = createElement("a", {
        className: `nav-link${routeName === activeRoute ? " active" : ""}`,
        text: route.label,
        attributes: { href: `#${routeName}` }
      });
      nav.appendChild(link);
    }
  }

  function renderRoute() {
    const routeName = routeFromHash();
    const route = ROUTES[routeName];
    renderNav(routeName);
    clearChildren(main);

    const title = createElement("h2", { className: "route-title", text: route.label });
    const description = createElement("p", {
      className: "route-description",
      text: route.description
    });

    main.appendChild(title);
    main.appendChild(description);

    route.renderer(main, {
      state,
      navigate(nextRoute) {
        window.location.hash = nextRoute;
      }
    });
  }

  return {
    start() {
      if (!window.location.hash || !(routeFromHash() in ROUTES)) {
        window.location.hash = "analysis";
      }
      window.addEventListener("hashchange", renderRoute);
      renderRoute();
    }
  };
}
