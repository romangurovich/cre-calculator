import "./styles/tokens.css";
import "./styles/base.css";

import { createRouter } from "./router.js";
import { createTemplateStore } from "./features/templates/store.js";

const root = document.querySelector("#app");

const state = {
  templateStore: createTemplateStore(),
  analysisView: null,
  composerView: null,
  libraryView: null
};

createRouter({ root, state }).start();
