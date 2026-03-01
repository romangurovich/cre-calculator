import test from "node:test";
import assert from "node:assert/strict";

import { nextInfoBubbleState } from "../../web/ui/info-bubble-state.js";

const CLOSED = { open: false, pinned: false };

test("info bubble opens and closes on hover events", () => {
  const hovered = nextInfoBubbleState(CLOSED, "hover-in");
  assert.deepEqual(hovered, { open: true, pinned: false });

  const closed = nextInfoBubbleState(hovered, "hover-out");
  assert.deepEqual(closed, CLOSED);
});

test("info bubble supports tap/click pin toggle behavior", () => {
  const pinned = nextInfoBubbleState(CLOSED, "toggle-pin");
  assert.deepEqual(pinned, { open: true, pinned: true });

  const unpinned = nextInfoBubbleState(pinned, "toggle-pin");
  assert.deepEqual(unpinned, CLOSED);
});

test("info bubble remains open on focus-out while pinned and dismisses on explicit dismiss", () => {
  const pinned = nextInfoBubbleState(CLOSED, "toggle-pin");
  const afterFocusOut = nextInfoBubbleState(pinned, "focus-out");
  assert.deepEqual(afterFocusOut, pinned);

  const dismissed = nextInfoBubbleState(afterFocusOut, "dismiss");
  assert.deepEqual(dismissed, CLOSED);
});
