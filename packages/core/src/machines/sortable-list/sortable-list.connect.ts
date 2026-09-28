import type { Service } from "@zag-js/core";
import { contains, dataAttr, getEventTarget, isEditableElement } from "@zag-js/dom-query";
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types";
import { parts } from "./sortable-list.anatomy.js";
import * as dom from "./sortable-list.dom.js";
import { shiftOffset, slotOffset } from "./sortable-list.layout.js";
import type {
  DragSource,
  ItemFocusPart,
  ItemProps,
  ItemState,
  SortableListApi,
  SortableListEvent,
  SortableListSchema,
} from "./sortable-list.types.js";

/** Keys that move focus while nothing is picked up. */
const FOCUS_KEYS: Record<string, SortableListEvent["type"]> = {
  ArrowDown: "FOCUS.NEXT",
  ArrowUp: "FOCUS.PREV",
  Home: "FOCUS.FIRST",
  End: "FOCUS.LAST",
};

/** Keys that move, drop or put back a picked-up item. */
const MOVE_KEYS: Record<string, SortableListEvent["type"]> = {
  ArrowDown: "MOVE.NEXT",
  ArrowUp: "MOVE.PREV",
  Home: "MOVE.FIRST",
  End: "MOVE.LAST",
  " ": "DROP",
  Enter: "DROP",
  Escape: "CANCEL",
};

const hasModifier = (event: JSX.KeyboardEvent) => event.altKey || event.ctrlKey || event.metaKey;

export function connect<T extends PropTypes>(
  service: Service<SortableListSchema>,
  normalize: NormalizeProps<T>,
): SortableListApi<T> {
  const { state, context, send, prop, scope, computed } = service;
  const items = context.get("items");
  const draggedValue = context.get("draggedValue");
  const listDisabled = !!prop("disabled");
  const translations = computed("translations");

  const dragging: DragSource | undefined = state.matches("dragging")
    ? "pointer"
    : state.matches("picked")
      ? "keyboard"
      : undefined;
  const settling = state.matches("settling");

  const focusedValue = context.get("focusedValue");
  const rovingValue =
    focusedValue != null && items.includes(focusedValue) ? focusedValue : items[0];
  const focusedPart = context.get("focusedPart");

  /** How far the item is drawn from its place: it follows the move, then settles. */
  function offsetOf(value: string, index: number): number {
    if (settling) return value === draggedValue ? context.get("settleOffset") : 0;
    if (!dragging) return 0;
    const layout = context.get("layout");
    const from = context.get("fromIndex");
    const to = context.get("toIndex");
    if (value !== draggedValue) return shiftOffset(layout, from, to, index);
    return dragging === "pointer" ? context.get("pointerOffset") : slotOffset(layout, from, to);
  }

  function getItemState(props: ItemProps): ItemState {
    const index = items.indexOf(props.value);
    return {
      index,
      disabled: listDisabled || !!props.disabled,
      dragging: props.value === draggedValue ? dragging : undefined,
      tabStop: props.value === rovingValue,
      offset: offsetOf(props.value, index),
    };
  }

  const labelOf = (props: ItemProps) => props.label ?? props.value;

  /** Arrow keys, Home, End, Space, Enter and Escape on an item's handle or trigger. */
  function handleItemKeyDown(event: JSX.KeyboardEvent, props: ItemProps, part: ItemFocusPart) {
    if (event.defaultPrevented || hasModifier(event)) return;
    const itemState = getItemState(props);

    if (state.matches("picked")) {
      const type = itemState.dragging ? MOVE_KEYS[event.key] : undefined;
      if (!type) return;
      event.preventDefault();
      send({ type } as SortableListEvent);
      return;
    }
    if (!state.matches("idle")) return;

    const focusType = FOCUS_KEYS[event.key];
    if (focusType) {
      event.preventDefault();
      send({ type: focusType, value: props.value } as SortableListEvent);
      return;
    }

    const hasHandle = dom.hasItemHandle(scope, props.value);
    if ((event.key === "ArrowLeft" || event.key === "ArrowRight") && hasHandle) {
      event.preventDefault();
      const target = event.key === "ArrowLeft" ? "handle" : "trigger";
      send({ type: "FOCUS.PART", value: props.value, part: target });
      return;
    }

    // Space picks the item up on its handle, or on its trigger when it has no handle.
    const picksUp = part === "handle" || !hasHandle;
    if (event.key === " " && picksUp && !itemState.disabled) {
      event.preventDefault();
      send({ type: "PICK_UP", value: props.value, label: labelOf(props), part, disabled: false });
    }
  }

  /**
   * A button clicks on the Space keyup: stop it where Space picks up and
   * drops, so a trigger with no handle is not also clicked.
   */
  function handleItemKeyUp(event: JSX.KeyboardEvent, props: ItemProps, part: ItemFocusPart) {
    if (event.key !== " ") return;
    if (part === "handle" || !dom.hasItemHandle(scope, props.value)) event.preventDefault();
  }

  /** Focus leaving a picked-up item puts it back. */
  function handleItemBlur(event: JSX.FocusEvent, props: ItemProps) {
    if (!state.matches("picked") || props.value !== draggedValue) return;
    if (contains(dom.getItemEl(scope, props.value), event.relatedTarget as Node | null)) return;
    send({ type: "BLUR" });
  }

  return {
    items,
    draggedValue,
    dragging,
    getItemState,

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        id: dom.getRootId(scope),
        role: "list",
        "data-disabled": dataAttr(listDisabled),
        "data-dragging": dragging,
        "data-settling": dataAttr(settling),
      });
    },

    getItemProps(props) {
      const itemState = getItemState(props);
      return normalize.element({
        ...parts.item.attrs,
        id: dom.getItemId(scope, props.value),
        role: "listitem",
        "data-value": props.value,
        "data-disabled": dataAttr(itemState.disabled),
        "data-dragging": itemState.dragging,
        style: itemState.offset ? { "--sortable-list-offset": `${itemState.offset}px` } : undefined,
        onPointerDown(event) {
          if (event.button !== 0 || itemState.disabled) return;
          const target = getEventTarget<HTMLElement>(event);
          const handle = dom.getItemHandleEl(scope, props.value);
          // With a handle, only the handle drags; without one, the whole item
          // does, except a text field inside it.
          if (handle ? !contains(handle, target) : isEditableElement(target)) return;
          send({
            type: "POINTER.DOWN",
            value: props.value,
            label: labelOf(props),
            part: handle ? "handle" : "trigger",
            disabled: false,
            point: { x: event.clientX, y: event.clientY },
            pointerId: event.pointerId,
          });
        },
      });
    },

    getItemHandleProps(props) {
      const itemState = getItemState(props);
      return normalize.button({
        ...parts.itemHandle.attrs,
        id: dom.getItemHandleId(scope, props.value),
        type: "button",
        "aria-label": translations.handleLabel(labelOf(props)),
        disabled: itemState.disabled,
        tabIndex: itemState.tabStop && focusedPart === "handle" && !itemState.disabled ? 0 : -1,
        "data-disabled": dataAttr(itemState.disabled),
        "data-dragging": itemState.dragging,
        onFocus() {
          send({ type: "ITEM.FOCUS", value: props.value, part: "handle" });
        },
        onBlur: (event) => handleItemBlur(event, props),
        onKeyDown: (event) => handleItemKeyDown(event, props, "handle"),
        onKeyUp: (event) => handleItemKeyUp(event, props, "handle"),
      });
    },

    getItemTriggerProps(props) {
      const itemState = getItemState(props);
      return normalize.button({
        ...parts.itemTrigger.attrs,
        id: dom.getItemTriggerId(scope, props.value),
        type: "button",
        // A disabled handle can not take focus, so its item's trigger keeps the Tab stop.
        tabIndex: itemState.tabStop && (focusedPart === "trigger" || itemState.disabled) ? 0 : -1,
        "data-dragging": itemState.dragging,
        onFocus() {
          send({ type: "ITEM.FOCUS", value: props.value, part: "trigger" });
        },
        onBlur: (event) => handleItemBlur(event, props),
        onKeyDown: (event) => handleItemKeyDown(event, props, "trigger"),
        onKeyUp: (event) => handleItemKeyUp(event, props, "trigger"),
      });
    },
  };
}
