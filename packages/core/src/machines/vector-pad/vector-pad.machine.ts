import { createMachine } from "@zag-js/core";
import { raf, trackPointerMove } from "@zag-js/dom-query";
import * as dom from "./vector-pad.dom.js";
import type { VectorPadSchema } from "./vector-pad.types.js";
import {
  DEFAULT_MAX,
  DEFAULT_MIN,
  DEFAULT_STEP,
  centreValue,
  isSameValue,
  resolveBounds,
  snapAxisValue,
  snapValue,
  valueAfterArrow,
  valueAtPosition,
  vectorPadValueText,
} from "./vector-pad.utils.js";

/**
 * VectorPad: a square pad whose handle sets two values at once.
 *
 * - `idle` → `focused` when the handle takes focus; a press on the pad
 *   (`CONTROL.POINTER_DOWN`) moves the handle there and starts `dragging`.
 * - `dragging` follows the pointer across the whole document, so a drag that
 *   leaves the pad keeps moving the handle, held at the pad's edge. Letting
 *   go ends the change (`onValueChangeEnd`) and leaves the handle `focused`.
 * - The arrow keys, Home and a double-click on the pad work in any state.
 *
 * Every value the machine sets is kept in the range and on the step.
 */
export const machine = createMachine<VectorPadSchema>({
  props({ props }) {
    const min = props.min ?? DEFAULT_MIN;
    const max = props.max ?? DEFAULT_MAX;
    const step = props.step ?? DEFAULT_STEP;
    const bounds = resolveBounds(min, max, step);
    return {
      ...props,
      getAriaValueText: props.getAriaValueText ?? vectorPadValueText,
      min,
      max,
      step,
      defaultValue: props.defaultValue
        ? snapValue(props.defaultValue, bounds)
        : centreValue(bounds),
    };
  },

  context({ prop, bindable }) {
    return {
      value: bindable(() => ({
        defaultValue: prop("defaultValue"),
        value: prop("value"),
        isEqual: isSameValue,
        hash: (value) => `${value.x},${value.y}`,
        onChange(value) {
          prop("onValueChange")?.({ value });
        },
      })),
    };
  },

  refs() {
    return { grabOffset: null };
  },

  computed: {
    bounds: ({ prop }) => resolveBounds(prop("min"), prop("max"), prop("step")),
    interactive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
  },

  initialState() {
    return "idle";
  },

  on: {
    "VALUE.SET": { actions: ["setValue"] },
    "VALUE.SET_AXIS": { actions: ["setAxisValue"] },
    "VALUE.RESET": { actions: ["resetValue"] },
    "THUMB.ARROW": { actions: ["moveByArrow"] },
    "THUMB.HOME": { actions: ["resetValueAndEnd"] },
    "CONTROL.DOUBLE_CLICK": { actions: ["resetValueAndEnd"] },
  },

  states: {
    idle: {
      on: {
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setGrabOffset", "setPointerValue"],
        },
        "THUMB.FOCUS": { target: "focused" },
      },
    },
    focused: {
      on: {
        "CONTROL.POINTER_DOWN": {
          target: "dragging",
          actions: ["setGrabOffset", "setPointerValue"],
        },
        "THUMB.BLUR": { target: "idle" },
      },
    },
    dragging: {
      entry: ["focusThumb"],
      effects: ["trackPointerMove"],
      on: {
        "DOC.POINTER_MOVE": { actions: ["setPointerValue"] },
        "DOC.POINTER_UP": {
          target: "focused",
          actions: ["invokeOnChangeEnd", "clearGrabOffset"],
        },
      },
    },
  },

  implementations: {
    effects: {
      trackPointerMove({ scope, send }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove({ point }) {
            send({ type: "DOC.POINTER_MOVE", point });
          },
          onPointerUp() {
            send({ type: "DOC.POINTER_UP" });
          },
        });
      },
    },

    actions: {
      setPointerValue({ scope, event, context, computed, prop, refs }) {
        const controlEl = dom.getControlEl(scope);
        if (!controlEl) return;
        const grab = refs.get("grabOffset");
        const point = { x: event.point.x - (grab?.x ?? 0), y: event.point.y - (grab?.y ?? 0) };
        const position = dom.getPositionOnControl(controlEl, point);
        context.set("value", valueAtPosition(position, computed("bounds"), prop("invertY")));
      },
      setGrabOffset({ refs, event }) {
        refs.set("grabOffset", event.grabOffset ?? null);
      },
      clearGrabOffset({ refs }) {
        refs.set("grabOffset", null);
      },
      setValue({ context, event, computed }) {
        context.set("value", snapValue(event.value, computed("bounds")));
      },
      setAxisValue({ context, event, computed }) {
        const axis = event.axis as "x" | "y";
        const next = snapAxisValue(event.value, axis, computed("bounds"));
        context.set("value", { ...context.get("value"), [axis]: next });
      },
      resetValue({ context, prop }) {
        context.set("value", prop("defaultValue"));
      },
      // A key or a double-click is a whole change: it ends as it starts. The
      // value is reported as set here, since a binding may apply the set later.
      resetValueAndEnd({ context, prop }) {
        const next = prop("defaultValue");
        context.set("value", next);
        prop("onValueChangeEnd")?.({ value: next });
      },
      moveByArrow({ context, event, computed, prop }) {
        const next = valueAfterArrow(
          context.get("value"),
          event.arrow,
          event.steps,
          computed("bounds"),
          prop("invertY"),
        );
        context.set("value", next);
        prop("onValueChangeEnd")?.({ value: next });
      },
      invokeOnChangeEnd({ context, prop }) {
        prop("onValueChangeEnd")?.({ value: context.get("value") });
      },
      focusThumb({ scope }) {
        raf(() => dom.getThumbEl(scope)?.focus({ preventScroll: true }));
      },
    },
  },
});
