import type { Service } from "@zag-js/core";
import { dataAttr, getEventPoint, getNativeEvent, isLeftClick } from "@zag-js/dom-query";
import type { NormalizeProps, PropTypes } from "@zag-js/types";
import { parts } from "./vector-pad.anatomy.js";
import * as dom from "./vector-pad.dom.js";
import type { VectorPadApi, VectorPadSchema } from "./vector-pad.types.js";
import { positionOfValue, SHIFT_STEPS, type VectorPadArrow } from "./vector-pad.utils.js";

/** The arrow keys, as the way each moves the handle on screen. */
const ARROWS: Record<string, VectorPadArrow> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

/** A percentage for a CSS custom property, without float noise: `0.25` → `"25%"`. */
function toPercent(fraction: number): string {
  return `${Number((fraction * 100).toFixed(4))}%`;
}

export function connect<T extends PropTypes>(
  service: Service<VectorPadSchema>,
  normalize: NormalizeProps<T>,
): VectorPadApi<T> {
  const { state, send, context, prop, computed, scope } = service;
  const value = context.get("value");
  const bounds = computed("bounds");
  const interactive = computed("interactive");
  const dragging = state.matches("dragging");
  const disabled = prop("disabled");
  const readOnly = prop("readOnly");
  const invalid = prop("invalid");
  const ariaLabel = prop("aria-label");
  const labelledBy = ariaLabel
    ? prop("aria-labelledby")
    : (prop("aria-labelledby") ?? dom.getLabelId(scope));
  const position = positionOfValue(value, bounds, prop("invertY"));

  /** The state every part carries. */
  const stateAttrs = {
    dir: prop("dir"),
    "data-disabled": dataAttr(disabled),
    "data-readonly": dataAttr(readOnly),
    "data-invalid": dataAttr(invalid),
    "data-dragging": dataAttr(dragging),
  };

  return {
    value,
    bounds,
    dragging,

    setValue(next) {
      send({ type: "VALUE.SET", value: next });
    },
    setAxisValue(axis, next) {
      send({ type: "VALUE.SET_AXIS", axis, value: next });
    },
    reset() {
      send({ type: "VALUE.RESET" });
    },
    endChange() {
      send({ type: "VALUE.END" });
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        ...stateAttrs,
        id: dom.getRootId(scope),
        role: "group",
        "aria-label": ariaLabel,
        "aria-labelledby": labelledBy,
        style: {
          "--vector-pad-x": toPercent(position.left),
          "--vector-pad-y": toPercent(position.top),
        },
      });
    },

    getLabelProps() {
      return normalize.label({
        ...parts.label.attrs,
        ...stateAttrs,
        id: dom.getLabelId(scope),
        onClick(event) {
          if (disabled) return;
          event.preventDefault();
          dom.getThumbEl(scope)?.focus();
        },
      });
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        ...stateAttrs,
        id: dom.getControlId(scope),
        onPointerDown(event) {
          if (!interactive || !isLeftClick(event)) return;
          const point = getEventPoint(event);
          const thumbEl = dom.getThumbEl(scope);
          const onThumb = !!thumbEl && getNativeEvent(event).composedPath().includes(thumbEl);
          // A press on the handle grabs it where it is: the handle does not jump to the pointer.
          const grabOffset = onThumb ? dom.getOffsetFromCentre(thumbEl, point) : null;
          send({ type: "CONTROL.POINTER_DOWN", point, grabOffset });
          event.stopPropagation();
        },
        onDoubleClick() {
          if (!interactive) return;
          send({ type: "CONTROL.DOUBLE_CLICK" });
        },
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
        },
      });
    },

    getGridProps() {
      return normalize.element({ ...parts.grid.attrs, ...stateAttrs, "aria-hidden": true });
    },

    getCrosshairProps() {
      return normalize.element({ ...parts.crosshair.attrs, ...stateAttrs, "aria-hidden": true });
    },

    getThumbProps() {
      return normalize.element({
        ...parts.thumb.attrs,
        ...stateAttrs,
        id: dom.getThumbId(scope),
        role: "slider",
        tabIndex: disabled ? undefined : 0,
        "aria-label": ariaLabel,
        "aria-labelledby": labelledBy,
        "aria-valuenow": value.x,
        "aria-valuemin": bounds.min.x,
        "aria-valuemax": bounds.max.x,
        "aria-valuetext": prop("getAriaValueText")(value),
        "aria-disabled": disabled || undefined,
        "aria-readonly": readOnly || undefined,
        "aria-invalid": invalid || undefined,
        onFocus() {
          send({ type: "THUMB.FOCUS" });
        },
        onBlur() {
          send({ type: "THUMB.BLUR" });
        },
        onKeyDown(event) {
          if (!interactive || event.defaultPrevented) return;
          const arrow = ARROWS[event.key];
          if (arrow) {
            send({ type: "THUMB.ARROW", arrow, steps: event.shiftKey ? SHIFT_STEPS : 1 });
          } else if (event.key === "Home") {
            send({ type: "THUMB.HOME" });
          } else {
            return;
          }
          event.preventDefault();
        },
      });
    },
  };
}
