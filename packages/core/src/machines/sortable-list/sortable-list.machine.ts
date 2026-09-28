import { createMachine, type Params } from "@zag-js/core";
import { addDomEvent, disableTextSelection, nextTick, raf } from "@zag-js/dom-query";
import type { Point } from "@zag-js/types";
import { announce } from "../../announce.js";
import * as dom from "./sortable-list.dom.js";
import {
  autoScrollSpeed,
  clampDragOffset,
  dropIndexAt,
  moveItem,
  slotOffset,
} from "./sortable-list.layout.js";
import type {
  AnnouncementDetails,
  ItemFocusPart,
  SortableListSchema,
  SortableListTranslations,
} from "./sortable-list.types.js";

/**
 * How far, in pixels, a pointer travels before a press becomes a drag. Below
 * it the press stays a click, so a button inside an item still works.
 */
export const DRAG_THRESHOLD = 5;

/** The English words; `translations` replaces any of them. */
export const defaultTranslations: SortableListTranslations = {
  handleLabel: (label) => `Reorder ${label}`,
  pickedUp: ({ label, position, count }) => `${label} picked up. Position ${position} of ${count}.`,
  moved: ({ position }) => `Moved to position ${position}.`,
  dropped: () => "Dropped.",
  cancelled: ({ label, position }) => `Cancelled. ${label} is back at position ${position}.`,
};

type SortableListParams = Params<SortableListSchema>;
type ItemLayout = SortableListSchema["context"]["layout"];

/*
 * A binding may read the context an action sets only after it renders again
 * (React does), so no action reads back a value set earlier in the same
 * transition: it works from its own local values instead.
 */

/** The words for the moved item at `index`. */
function announcementAt({ context, refs }: SortableListParams, index: number): AnnouncementDetails {
  return {
    label: refs.get("draggedLabel"),
    position: index + 1,
    count: context.get("items").length,
  };
}

/** Focuses an item's `part` on the next frame, once the DOM has caught up. */
function focusItem({ scope }: SortableListParams, value: string | undefined, part: ItemFocusPart) {
  if (value == null) return;
  raf(() => dom.getItemFocusEl(scope, value, part)?.focus({ preventScroll: true }));
}

/** Moves focus from the event's item to the one `pick` chooses, keeping the focused part. */
function focusBy(params: SortableListParams, pick: (index: number, last: number) => number) {
  const { context, event } = params;
  const items = context.get("items");
  const index = Math.max(0, items.indexOf(event.value));
  focusItem(params, items[pick(index, items.length - 1)], context.get("focusedPart"));
}

/** Marks the event's item as the one moving; returns where it starts. */
function beginMove({ context, refs, event }: SortableListParams): number {
  const index = context.get("items").indexOf(event.value);
  context.set("draggedValue", event.value);
  context.set("focusedPart", event.part);
  context.set("fromIndex", index);
  context.set("toIndex", index);
  refs.set("draggedLabel", event.label);
  return index;
}

/** Says the item at `index` was picked up. */
function announcePickedUp(params: SortableListParams, index: number) {
  announce(params.computed("translations").pickedUp(announcementAt(params, index)));
}

/**
 * Draws the pointer's item where the pointer has carried it, over `layout`,
 * and moves its landing slot under it.
 */
function followPointer(params: SortableListParams, layout: ItemLayout) {
  const { context, refs, scope, event, computed } = params;
  const point: Point | null = event.point ?? refs.get("lastPoint");
  const start = refs.get("pointerStart");
  if (!point || !start) return;
  refs.set("lastPoint", point);
  // The pointer's travel through the list: a scroll moves the list under a
  // still pointer, and that counts as travel too.
  const travel = point.y - start.y + (start.listTop - dom.getListTop(scope));
  const from = context.get("fromIndex");
  const offset = clampDragOffset(layout, from, travel);
  context.set("pointerOffset", offset);
  const to = dropIndexAt(layout, from, offset);
  if (to === context.get("toIndex")) return;
  context.set("toIndex", to);
  announce(computed("translations").moved(announcementAt(params, to)));
}

/**
 * Moves the picked-up item's landing slot, says where it is now, and scrolls
 * the slot into view.
 */
function moveTo(params: SortableListParams, pick: (index: number, last: number) => number) {
  const { context, computed, scope } = params;
  const current = context.get("toIndex");
  const next = pick(current, context.get("items").length - 1);
  if (next === current) return;
  context.set("toIndex", next);
  announce(computed("translations").moved(announcementAt(params, next)));

  const layout = context.get("layout");
  const from = context.get("fromIndex");
  const moved = layout[from];
  if (!moved) return;
  const top = dom.getListTop(scope) + moved.top + slotOffset(layout, from, next);
  dom.scrollBandIntoView(scope, dom.getScrollContainer(scope), top, top + moved.height);
}

export const machine = createMachine<SortableListSchema>({
  props({ props }) {
    return {
      defaultItems: [],
      ...props,
    };
  },

  initialState() {
    return "idle";
  },

  context({ prop, bindable }) {
    return {
      items: bindable(() => ({
        defaultValue: prop("defaultItems"),
        value: prop("items"),
        hash: (items) => items.join("\n"),
      })),
      focusedValue: bindable<string | null>(() => ({ defaultValue: null })),
      focusedPart: bindable<ItemFocusPart>(() => ({ defaultValue: "trigger" })),
      draggedValue: bindable<string | null>(() => ({ defaultValue: null })),
      fromIndex: bindable(() => ({ defaultValue: -1 })),
      toIndex: bindable(() => ({ defaultValue: -1 })),
      layout: bindable(() => ({ defaultValue: [] as SortableListSchema["context"]["layout"] })),
      pointerOffset: bindable(() => ({ defaultValue: 0 })),
      settleOffset: bindable(() => ({ defaultValue: 0 })),
    };
  },

  refs() {
    return { draggedLabel: "", pointerStart: null, pointerId: null, lastPoint: null };
  },

  computed: {
    disabled: ({ prop }) => !!prop("disabled"),
    translations: ({ prop }) => ({ ...defaultTranslations, ...prop("translations") }),
  },

  watch({ track, computed, send }) {
    // Disabling the list mid-move puts the item back.
    track([() => computed("disabled")], () => {
      if (computed("disabled")) send({ type: "CANCEL" });
    });
  },

  on: {
    "ITEM.FOCUS": { actions: ["setFocusedItem"] },
  },

  states: {
    idle: {
      on: {
        "FOCUS.NEXT": { actions: ["focusNextItem"] },
        "FOCUS.PREV": { actions: ["focusPrevItem"] },
        "FOCUS.FIRST": { actions: ["focusFirstItem"] },
        "FOCUS.LAST": { actions: ["focusLastItem"] },
        "FOCUS.PART": { actions: ["focusItemPart"] },
        PICK_UP: {
          guard: "canMove",
          target: "picked",
          actions: ["pickUpItem"],
        },
        "POINTER.DOWN": {
          guard: "canMove",
          target: "pressing",
          actions: ["setDraggedItem", "setPointerStart"],
        },
      },
    },

    // A pointer is down on an item but has not travelled far enough to drag.
    pressing: {
      effects: ["trackPointer"],
      on: {
        "POINTER.MOVE": {
          guard: "isPastThreshold",
          target: "dragging",
          actions: ["startPointerDrag"],
        },
        "POINTER.UP": { target: "idle", actions: ["clearDrag"] },
        "POINTER.CANCEL": { target: "idle", actions: ["clearDrag"] },
        CANCEL: { target: "idle", actions: ["clearDrag"] },
      },
    },

    // A pointer carries the item; the others step aside.
    dragging: {
      effects: ["trackPointer", "trackEscape", "autoScroll", "preventTextSelection"],
      on: {
        "POINTER.MOVE": { actions: ["followPointer"] },
        SCROLL: { actions: ["followPointer"] },
        "POINTER.UP": {
          target: "settling",
          actions: [
            "setSettleOffset",
            "commitReorder",
            "announceDropped",
            "focusDraggedItem",
            "preventNextClick",
          ],
        },
        "POINTER.CANCEL": { target: "idle", actions: ["announceCancelled", "clearDrag"] },
        CANCEL: {
          target: "idle",
          actions: ["announceCancelled", "clearDrag", "preventNextClick"],
        },
      },
    },

    // The keyboard picked the item up; arrows move it until it is dropped.
    picked: {
      on: {
        "MOVE.NEXT": { actions: ["moveToNext"] },
        "MOVE.PREV": { actions: ["moveToPrev"] },
        "MOVE.FIRST": { actions: ["moveToFirst"] },
        "MOVE.LAST": { actions: ["moveToLast"] },
        DROP: {
          target: "settling",
          actions: ["commitReorder", "announceDropped", "focusDraggedItem"],
        },
        CANCEL: { target: "idle", actions: ["announceCancelled", "clearDrag"] },
        BLUR: { target: "idle", actions: ["announceCancelled", "clearDrag"] },
      },
    },

    // The new order is in place; for two frames the item is drawn where it
    // was dropped, with no transition, then it glides into its slot.
    settling: {
      effects: ["waitTwoFrames"],
      on: {
        SETTLED: { target: "idle", actions: ["clearDrag"] },
      },
    },
  },

  implementations: {
    guards: {
      canMove: (params) => {
        const { computed, context, event } = params;
        return (
          !computed("disabled") && !event.disabled && context.get("items").includes(event.value)
        );
      },
      isPastThreshold: ({ refs, event }) => {
        const start = refs.get("pointerStart");
        if (!start || !event.point) return false;
        return Math.hypot(event.point.x - start.x, event.point.y - start.y) >= DRAG_THRESHOLD;
      },
    },

    actions: {
      setFocusedItem({ context, event }) {
        context.set("focusedValue", event.value);
        context.set("focusedPart", event.part);
      },
      focusNextItem: (params) => focusBy(params, (index, last) => Math.min(index + 1, last)),
      focusPrevItem: (params) => focusBy(params, (index) => Math.max(index - 1, 0)),
      focusFirstItem: (params) => focusBy(params, () => 0),
      focusLastItem: (params) => focusBy(params, (_, last) => last),
      focusItemPart: (params) => focusItem(params, params.event.value, params.event.part),

      setDraggedItem(params) {
        beginMove(params);
      },
      pickUpItem(params) {
        const { context, scope } = params;
        const index = beginMove(params);
        context.set("layout", dom.measureLayout(scope, context.get("items")));
        announcePickedUp(params, index);
      },
      setPointerStart({ refs, scope, event }) {
        refs.set("pointerId", event.pointerId);
        refs.set("pointerStart", { ...event.point, listTop: dom.getListTop(scope) });
        refs.set("lastPoint", event.point);
      },
      startPointerDrag(params) {
        const { context, scope } = params;
        const layout = dom.measureLayout(scope, context.get("items"));
        context.set("layout", layout);
        announcePickedUp(params, context.get("fromIndex"));
        followPointer(params, layout);
      },
      followPointer: (params) => followPointer(params, params.context.get("layout")),
      moveToNext: (params) => moveTo(params, (index, last) => Math.min(index + 1, last)),
      moveToPrev: (params) => moveTo(params, (index) => Math.max(index - 1, 0)),
      moveToFirst: (params) => moveTo(params, () => 0),
      moveToLast: (params) => moveTo(params, (_, last) => last),

      setSettleOffset({ context }) {
        // A pointer lets go of the item anywhere near its slot; it is drawn
        // there, measured from the slot, then glides in. (The keyboard has
        // already drawn it over its slot, so a keyboard drop needs none.)
        const layout = context.get("layout");
        const landed = slotOffset(layout, context.get("fromIndex"), context.get("toIndex"));
        context.set("settleOffset", context.get("pointerOffset") - landed);
      },
      commitReorder({ context, prop }) {
        const from = context.get("fromIndex");
        const to = context.get("toIndex");
        const value = context.get("draggedValue");
        if (value == null || from === to) return;
        const items = moveItem(context.get("items"), from, to);
        context.set("items", items);
        prop("onReorder")?.({ items, value, from, to });
      },
      focusDraggedItem(params) {
        const { context } = params;
        const value = context.get("draggedValue");
        if (value == null) return;
        context.set("focusedValue", value);
        focusItem(params, value, context.get("focusedPart"));
      },
      preventNextClick({ scope }) {
        // The press that ends a drag would click whatever it lands on, such as
        // the item's own name button. Swallow that one click.
        const win = scope.getWin();
        const swallow = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
        };
        win.addEventListener("click", swallow, { capture: true, once: true });
        win.setTimeout(() => win.removeEventListener("click", swallow, { capture: true }), 0);
      },
      clearDrag({ context, refs }) {
        context.set("draggedValue", null);
        context.set("fromIndex", -1);
        context.set("toIndex", -1);
        context.set("layout", []);
        context.set("pointerOffset", 0);
        context.set("settleOffset", 0);
        refs.set("pointerStart", null);
        refs.set("pointerId", null);
        refs.set("lastPoint", null);
      },

      announceDropped(params) {
        const { computed, context } = params;
        announce(computed("translations").dropped(announcementAt(params, context.get("toIndex"))));
      },
      announceCancelled(params) {
        const { computed, context } = params;
        announce(
          computed("translations").cancelled(announcementAt(params, context.get("fromIndex"))),
        );
      },
    },

    effects: {
      trackPointer({ scope, refs, send }) {
        const doc = scope.getDoc();
        const isOwn = (event: PointerEvent) => event.pointerId === refs.get("pointerId");
        const cleanups = [
          addDomEvent(doc, "pointermove", (event: PointerEvent) => {
            if (isOwn(event)) {
              send({ type: "POINTER.MOVE", point: { x: event.clientX, y: event.clientY } });
            }
          }),
          addDomEvent(doc, "pointerup", (event: PointerEvent) => {
            if (isOwn(event)) send({ type: "POINTER.UP" });
          }),
          addDomEvent(doc, "pointercancel", (event: PointerEvent) => {
            if (isOwn(event)) send({ type: "POINTER.CANCEL" });
          }),
        ];
        return () => cleanups.forEach((cleanup) => cleanup());
      },
      trackEscape({ scope, send }) {
        return addDomEvent(scope.getDoc(), "keydown", (event: KeyboardEvent) => {
          if (event.key === "Escape") send({ type: "CANCEL" });
        });
      },
      autoScroll({ scope, refs, send }) {
        // Near the top or bottom edge of whatever scrolls the list, scroll it
        // a little every frame, faster the closer the pointer is to the edge.
        const win = scope.getWin();
        const container = dom.getScrollContainer(scope);
        let frame = 0;
        const step = () => {
          const point = refs.get("lastPoint");
          const speed = point
            ? autoScrollSpeed(point.y, dom.getVisibleBounds(scope, container))
            : 0;
          if (speed !== 0) {
            const before = container.scrollTop;
            container.scrollTop += speed;
            if (container.scrollTop !== before) send({ type: "SCROLL" });
          }
          frame = win.requestAnimationFrame(step);
        };
        frame = win.requestAnimationFrame(step);
        return () => win.cancelAnimationFrame(frame);
      },
      preventTextSelection({ scope }) {
        scope.getDoc().getSelection()?.removeAllRanges();
        return disableTextSelection({ doc: scope.getDoc() });
      },
      waitTwoFrames({ send }) {
        return nextTick(() => send({ type: "SETTLED" }));
      },
    },
  },
});
