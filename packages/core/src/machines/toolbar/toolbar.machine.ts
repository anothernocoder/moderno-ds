import { createMachine, type Params } from "@zag-js/core";
import { observeChildren } from "@zag-js/dom-query";
import * as dom from "./toolbar.dom.js";
import type { ToolbarSchema } from "./toolbar.types.js";

type ToolbarParams = Params<ToolbarSchema>;

/** Where focus goes from the active item: one of the four navigation keys. */
type Step = "next" | "prev" | "first" | "last";

/** The index `step` lands on among `count` items, from `current`. Next and previous wrap. */
function stepIndex(step: Step, current: number, count: number): number {
  switch (step) {
    case "first":
      return 0;
    case "last":
      return count - 1;
    case "next":
      return (current + 1) % count;
    case "prev":
      return (current - 1 + count) % count;
  }
}

/** Moves focus, and the Tab stop with it, to the item `step` lands on. */
function focusItem({ context, scope }: ToolbarParams, step: Step): void {
  const items = dom.getItemEls(scope);
  if (items.length === 0) return;
  const current = items.findIndex((el) => dom.getItemValue(el) === context.get("activeValue"));
  const target = items[stepIndex(step, Math.max(current, 0), items.length)];
  context.set("activeValue", dom.getItemValue(target));
  target?.focus({ preventScroll: true });
}

/**
 * The WAI-ARIA toolbar pattern: one Tab stop for the whole bar, arrow keys
 * between its items, Home and End to the ends. The item that holds the Tab
 * stop is the last one focused (the first until then), so Tab brings the
 * user back where they left. Disabled items stay in the order: they are
 * announced and focusable, but do nothing.
 */
export const machine = createMachine<ToolbarSchema>({
  props({ props }) {
    return { orientation: "horizontal", ...props };
  },
  initialState: () => "idle",
  context: ({ bindable }) => ({
    activeValue: bindable<string | null>(() => ({ defaultValue: null })),
  }),
  effects: ["trackItems"],
  on: {
    "ITEM.FOCUS": { actions: ["setActiveValue"] },
    "ITEM.FOCUS_NEXT": { actions: ["focusNext"] },
    "ITEM.FOCUS_PREV": { actions: ["focusPrev"] },
    "ITEM.FOCUS_FIRST": { actions: ["focusFirst"] },
    "ITEM.FOCUS_LAST": { actions: ["focusLast"] },
    "ITEMS.CHANGE": { actions: ["syncActiveValue"] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      setActiveValue: ({ context, event }) => context.set("activeValue", event.value),
      /** Keeps the Tab stop on an item that is still there, or hands it to the first. */
      syncActiveValue: ({ context, scope }) => {
        const values = dom.getItemEls(scope).map(dom.getItemValue);
        if (values.includes(context.get("activeValue"))) return;
        context.set("activeValue", values[0] ?? null);
      },
      focusNext: (params) => focusItem(params, "next"),
      focusPrev: (params) => focusItem(params, "prev"),
      focusFirst: (params) => focusItem(params, "first"),
      focusLast: (params) => focusItem(params, "last"),
    },
    effects: {
      /** Finds the first item once the toolbar is in the DOM, and again whenever items come or go. */
      trackItems: ({ scope, send }) => {
        send({ type: "ITEMS.CHANGE" });
        return observeChildren(() => dom.getRootEl(scope), {
          callback: () => send({ type: "ITEMS.CHANGE" }),
        });
      },
    },
  },
});
