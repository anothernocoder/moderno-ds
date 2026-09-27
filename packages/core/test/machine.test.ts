import { createMachine, type Service } from "@zag-js/core";
import type { NormalizeProps, PropTypes } from "@zag-js/types";
import { describe, expect, it, vi } from "vitest";
import { runMachine } from "./machine.js";

/*
 * A pressable button, written the way a machine in `src/machines/` is, small
 * enough to exercise every part of `runMachine`: state, context, props,
 * guards, an action that sends another event, an effect and the connected
 * props.
 */
interface PressSchema {
  props: {
    disabled?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    onTrack?: (tracking: boolean) => void;
  };
  context: { pressed: boolean; presses: number };
  state: "idle" | "focused";
  event: { type: "FOCUS" | "BLUR" | "PRESS" | "COUNT" };
  action: "togglePressed" | "countPress";
  guard: "isEnabled";
  effect: "trackFocus";
}

const pressMachine = createMachine<PressSchema>({
  initialState: () => "idle",
  context: ({ prop, bindable }) => ({
    pressed: bindable(() => ({
      defaultValue: prop("defaultPressed") ?? false,
      onChange: (pressed) => prop("onPressedChange")?.(pressed),
    })),
    presses: bindable(() => ({ defaultValue: 0 })),
  }),
  on: {
    PRESS: { guard: "isEnabled", actions: ["togglePressed"] },
    COUNT: { actions: ["countPress"] },
  },
  states: {
    idle: { on: { FOCUS: { target: "focused" } } },
    focused: { effects: ["trackFocus"], on: { BLUR: { target: "idle" } } },
  },
  implementations: {
    guards: { isEnabled: ({ prop }) => !prop("disabled") },
    actions: {
      togglePressed: ({ context, send }) => {
        context.set("pressed", !context.get("pressed"));
        send({ type: "COUNT" });
      },
      countPress: ({ context }) => context.set("presses", context.get("presses") + 1),
    },
    effects: {
      trackFocus: ({ prop }) => {
        prop("onTrack")?.(true);
        return () => prop("onTrack")?.(false);
      },
    },
  },
});

function connectPress<T extends PropTypes>(
  service: Service<PressSchema>,
  normalize: NormalizeProps<T>,
) {
  const { state, context, send, prop } = service;
  const pressed = context.get("pressed");
  return {
    pressed,
    focused: state.matches("focused"),
    getRootProps: () =>
      normalize.button({
        "data-scope": "press",
        "data-part": "root",
        "aria-pressed": pressed,
        "data-disabled": prop("disabled") ? "" : undefined,
        onClick: () => send({ type: "PRESS" }),
      }),
  };
}

describe("runMachine", () => {
  it("starts in the machine's initial state, with its props applied", () => {
    const run = runMachine(pressMachine, connectPress, { defaultPressed: true });

    expect(run.state).toBe("idle");
    expect(run.context("pressed")).toBe(true);
    expect(run.api.pressed).toBe(true);
  });

  it("moves to the next state once a sent event resolves", async () => {
    const run = runMachine(pressMachine, connectPress);

    await run.send({ type: "FOCUS" });
    expect(run.state).toBe("focused");
    expect(run.api.focused).toBe(true);

    await run.send({ type: "BLUR" });
    expect(run.state).toBe("idle");
  });

  it("has also handled the events an action sends when a send resolves", async () => {
    const onPressedChange = vi.fn();
    const run = runMachine(pressMachine, connectPress, { onPressedChange });

    await run.send({ type: "PRESS" });

    expect(run.context("pressed")).toBe(true);
    expect(run.context("presses")).toBe(1);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("settles a send while the test fakes timers", async () => {
    vi.useFakeTimers();
    try {
      const run = runMachine(pressMachine, connectPress);
      await run.send({ type: "PRESS" });
      expect(run.context("presses")).toBe(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns the connected props, named as a binding spreads them", async () => {
    const run = runMachine(pressMachine, connectPress);
    const root = run.api.getRootProps();

    expect(root).toMatchObject({
      "data-scope": "press",
      "data-part": "root",
      "aria-pressed": false,
    });

    root.onClick();
    await run.send({ type: "BLUR" });
    expect(run.api.getRootProps()["aria-pressed"]).toBe(true);
  });

  it("reads props set after start, as a binding updates them", async () => {
    const run = runMachine(pressMachine, connectPress);

    run.setProps({ disabled: true });
    await run.send({ type: "PRESS" });

    expect(run.context("pressed")).toBe(false);
    expect(run.api.getRootProps()["data-disabled"]).toBe("");
  });

  it("cleans up the machine's effects on stop, once", async () => {
    const onTrack = vi.fn();
    const run = runMachine(pressMachine, connectPress, { onTrack });

    await run.send({ type: "FOCUS" });
    expect(onTrack).toHaveBeenLastCalledWith(true);

    run.stop();
    run.stop();
    expect(onTrack.mock.calls).toEqual([[true], [false]]);
  });

  describe("when the test ends", () => {
    const onTrack = vi.fn();

    it("(a test that leaves its machine focused)", async () => {
      const run = runMachine(pressMachine, connectPress, { onTrack });
      await run.send({ type: "FOCUS" });
      expect(onTrack).toHaveBeenLastCalledWith(true);
    });

    it("has stopped the machine and cleaned up its effects", () => {
      expect(onTrack).toHaveBeenLastCalledWith(false);
    });
  });
});
