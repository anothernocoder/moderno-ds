// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { vectorPad } from "../../src/index.js";
import {
  positionOfValue,
  resolveBounds,
  snapAxisValue,
  valueAfterArrow,
  valueAtPosition,
} from "../../src/machines/vector-pad/vector-pad.utils.js";
import { runMachine } from "../machine.js";

type Props = Partial<vectorPad.Props>;

/*
 * The machine finds the pad and the handle by id in the document. jsdom lays
 * nothing out, so the pad is a 200px square at (100, 100) and the handle a
 * 20px square wherever the value puts it: a point maps to a known value.
 */
const PAD = { left: 100, top: 100, size: 200 };
const THUMB = 20;

function rect(left: number, top: number, size: number): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width: size,
    height: size,
    right: left + size,
    bottom: top + size,
    toJSON: () => ({}),
  };
}

function start(props: Props = {}) {
  const run = runMachine(vectorPad.machine, vectorPad.connect, { id: "pad", ...props });
  const control = document.createElement("div");
  control.id = run.api.getControlProps().id as string;
  const thumb = document.createElement("div");
  thumb.id = run.api.getThumbProps().id as string;
  thumb.tabIndex = 0;
  control.append(thumb);
  document.body.append(control);
  vi.spyOn(control, "getBoundingClientRect").mockReturnValue(rect(PAD.left, PAD.top, PAD.size));
  vi.spyOn(thumb, "getBoundingClientRect").mockImplementation(() => {
    const { left, top } = positionOfValue(run.api.value, run.api.bounds, props.invertY);
    return rect(
      PAD.left + left * PAD.size - THUMB / 2,
      PAD.top + top * PAD.size - THUMB / 2,
      THUMB,
    );
  });
  // The connected handlers, as a binding attaches them.
  control.addEventListener("pointerdown", (event) =>
    run.api.getControlProps().onPointerDown(event),
  );
  return { run, control, thumb };
}

afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

/** The viewport point at fractions of the pad from its left and top edges. */
const at = (left: number, top: number) => ({
  clientX: PAD.left + left * PAD.size,
  clientY: PAD.top + top * PAD.size,
});

/*
 * jsdom has no PointerEvent; a MouseEvent of the pointer type carries the
 * coordinates and button the machine reads.
 */
function pointer(type: string, target: EventTarget, point: { clientX: number; clientY: number }) {
  target.dispatchEvent(
    new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, buttons: 1, ...point }),
  );
}

/** Lets the machine handle what the DOM events sent. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

function key(run: ReturnType<typeof start>["run"], name: string, shiftKey = false) {
  run.api
    .getThumbProps()
    .onKeyDown(new KeyboardEvent("keydown", { key: name, shiftKey, cancelable: true }));
  return settle();
}

describe("vectorPad machine: value and range", () => {
  it("starts at the centre of a -100 to 100 range, idle", () => {
    const { run } = start();
    expect(run.state).toBe("idle");
    expect(run.api.value).toEqual({ x: 0, y: 0 });
    expect(run.api.bounds).toEqual({
      min: { x: -100, y: -100 },
      max: { x: 100, y: 100 },
      step: { x: 1, y: 1 },
    });
  });

  it("takes min, max and step for both axes or per axis, and centres the default on the step", () => {
    const { run } = start({ min: 0, max: { x: 10, y: 1 }, step: { x: 4, y: 0.1 } });
    expect(run.api.bounds).toEqual({
      min: { x: 0, y: 0 },
      max: { x: 10, y: 1 },
      step: { x: 4, y: 0.1 },
    });
    expect(run.api.value).toEqual({ x: 4, y: 0.5 });
  });

  it("keeps defaultValue in the range and on the step", () => {
    const { run } = start({ defaultValue: { x: 250, y: 12.4 }, step: 5 });
    expect(run.api.value).toEqual({ x: 100, y: 10 });
  });

  it("sets both values or one axis, kept in the range and on the step", async () => {
    const onValueChange = vi.fn();
    const { run } = start({ step: 10, onValueChange });

    run.api.setValue({ x: 33, y: -500 });
    await settle();
    expect(run.api.value).toEqual({ x: 30, y: -100 });
    expect(onValueChange).toHaveBeenLastCalledWith({ value: { x: 30, y: -100 } });

    run.api.setAxisValue("y", 47);
    await settle();
    expect(run.api.value).toEqual({ x: 30, y: 50 });
  });

  it("ends a change made with setValue or setAxisValue on endChange, once, with the value set last", async () => {
    const onValueChangeEnd = vi.fn();
    const { run } = start({ step: 10, onValueChangeEnd });

    run.api.setAxisValue("x", 33);
    run.api.setAxisValue("x", 47);
    await settle();
    expect(onValueChangeEnd).not.toHaveBeenCalled();

    run.api.endChange();
    await settle();
    expect(onValueChangeEnd).toHaveBeenCalledOnce();
    expect(onValueChangeEnd).toHaveBeenLastCalledWith({ value: { x: 50, y: 0 } });

    // Nothing set since: nothing to end.
    run.api.endChange();
    await settle();
    expect(onValueChangeEnd).toHaveBeenCalledOnce();
  });

  it("ends nothing when setValue left the value as it was", async () => {
    const onValueChangeEnd = vi.fn();
    const { run } = start({ onValueChangeEnd });
    run.api.setValue({ x: 0, y: 0 });
    run.api.endChange();
    await settle();
    expect(onValueChangeEnd).not.toHaveBeenCalled();
  });

  it("does not end a field's change twice when a key on the handle ended it first", async () => {
    const onValueChangeEnd = vi.fn();
    const { run } = start({ onValueChangeEnd });
    run.api.setAxisValue("y", 20);
    await settle();
    await key(run, "ArrowRight");
    expect(onValueChangeEnd).toHaveBeenLastCalledWith({ value: { x: 1, y: 20 } });

    run.api.endChange();
    await settle();
    expect(onValueChangeEnd).toHaveBeenCalledOnce();
  });

  it("reports a change only when the value moves", async () => {
    const onValueChange = vi.fn();
    const { run } = start({ onValueChange });
    run.api.setValue({ x: 0, y: 0 });
    await settle();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("follows a controlled value, and reports changes without taking them", async () => {
    const onValueChange = vi.fn();
    const { run } = start({ value: { x: 10, y: 20 }, onValueChange });
    await key(run, "ArrowRight");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: { x: 11, y: 20 } });
    expect(run.api.value).toEqual({ x: 10, y: 20 });

    run.setProps({ value: { x: -40, y: 5 } });
    expect(run.api.value).toEqual({ x: -40, y: 5 });
  });
});

describe("vectorPad machine: pointer", () => {
  it("sets x and y where the pad is pressed: up on screen is a larger y", async () => {
    const { run, control } = start();
    pointer("pointerdown", control, at(0.75, 0.25));
    await settle();
    expect(run.api.value).toEqual({ x: 50, y: 50 });
    expect(run.state).toBe("dragging");
    expect(run.api.dragging).toBe(true);
  });

  it("with invertY, y grows downward while the handle still sits under the pointer", async () => {
    const { run, control } = start({ invertY: true });
    pointer("pointerdown", control, at(0.75, 0.25));
    await settle();
    expect(run.api.value).toEqual({ x: 50, y: -50 });
    expect(positionOfValue(run.api.value, run.api.bounds, true)).toEqual({
      left: 0.75,
      top: 0.25,
    });
  });

  it("follows a drag live, clamped to the edges when the pointer leaves the pad", async () => {
    const onValueChange = vi.fn();
    const onValueChangeEnd = vi.fn();
    const { run, control } = start({ onValueChange, onValueChangeEnd });
    pointer("pointerdown", control, at(0.5, 0.5));
    await settle();

    pointer("pointermove", document, at(0.6, 0.4));
    await settle();
    expect(run.api.value).toEqual({ x: 20, y: 20 });
    expect(onValueChangeEnd).not.toHaveBeenCalled();

    pointer("pointermove", document, at(1.5, -0.8));
    await settle();
    expect(run.api.value).toEqual({ x: 100, y: 100 });

    pointer("pointerup", document, at(1.5, -0.8));
    await settle();
    expect(run.state).toBe("focused");
    expect(onValueChangeEnd).toHaveBeenCalledOnce();
    expect(onValueChangeEnd).toHaveBeenCalledWith({ value: { x: 100, y: 100 } });
    expect(onValueChange.mock.calls.map(([details]) => details.value)).toEqual([
      { x: 20, y: 20 },
      { x: 100, y: 100 },
    ]);

    // The drag is over: the pointer moving no longer moves the handle.
    pointer("pointermove", document, at(0, 1));
    await settle();
    expect(run.api.value).toEqual({ x: 100, y: 100 });
  });

  it("grabs the handle where it is pressed, so it does not jump to the pointer", async () => {
    const { run, thumb } = start({ defaultValue: { x: 0, y: 0 } });
    // 6px right of the handle's centre, and 4px below it.
    pointer("pointerdown", thumb, { clientX: 206, clientY: 204 });
    await settle();
    expect(run.api.value).toEqual({ x: 0, y: 0 });

    pointer("pointermove", document, { clientX: 226, clientY: 204 });
    await settle();
    expect(run.api.value).toEqual({ x: 20, y: 0 });
  });

  it("takes touch and pen presses, which report the primary button like a mouse", async () => {
    const { run, control } = start();
    control.dispatchEvent(
      Object.assign(
        new MouseEvent("pointerdown", { bubbles: true, button: 0, buttons: 1, ...at(0, 1) }),
        { pointerType: "touch" },
      ),
    );
    await settle();
    expect(run.api.value).toEqual({ x: -100, y: -100 });
  });

  it("ignores a press with another button", async () => {
    const { run, control } = start();
    control.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true, button: 2, ...at(1, 0) }));
    await settle();
    expect(run.api.value).toEqual({ x: 0, y: 0 });
    expect(run.state).toBe("idle");
  });

  it("goes back to defaultValue on a double-click, and ends the change", async () => {
    const onValueChangeEnd = vi.fn();
    const { run } = start({ defaultValue: { x: 10, y: -10 }, onValueChangeEnd });
    run.api.setValue({ x: 90, y: 90 });
    await settle();

    run.api.getControlProps().onDoubleClick();
    await settle();
    expect(run.api.value).toEqual({ x: 10, y: -10 });
    expect(onValueChangeEnd).toHaveBeenLastCalledWith({ value: { x: 10, y: -10 } });
  });
});

describe("vectorPad machine: keyboard", () => {
  it("moves the handle one step per arrow, the way the arrow points", async () => {
    const onValueChangeEnd = vi.fn();
    const { run } = start({ step: 5, onValueChangeEnd });
    await key(run, "ArrowRight");
    await key(run, "ArrowUp");
    expect(run.api.value).toEqual({ x: 5, y: 5 });
    await key(run, "ArrowLeft");
    await key(run, "ArrowLeft");
    await key(run, "ArrowDown");
    expect(run.api.value).toEqual({ x: -5, y: 0 });
    expect(onValueChangeEnd).toHaveBeenLastCalledWith({ value: { x: -5, y: 0 } });
  });

  it("moves ten steps with Shift, and stops at the edges", async () => {
    const { run } = start({ defaultValue: { x: 95, y: 0 } });
    await key(run, "ArrowUp", true);
    expect(run.api.value).toEqual({ x: 95, y: 10 });
    await key(run, "ArrowRight", true);
    expect(run.api.value).toEqual({ x: 100, y: 10 });
  });

  it("with invertY, ArrowUp still moves the handle up, which lowers y", async () => {
    const { run } = start({ invertY: true });
    await key(run, "ArrowUp");
    expect(run.api.value).toEqual({ x: 0, y: -1 });
  });

  it("goes back to defaultValue on Home", async () => {
    const { run } = start({ defaultValue: { x: 30, y: 40 } });
    await key(run, "ArrowRight", true);
    await key(run, "Home");
    expect(run.api.value).toEqual({ x: 30, y: 40 });
  });

  it("leaves other keys to the page", () => {
    const { run } = start();
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    run.api.getThumbProps().onKeyDown(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("follows focus on the handle", async () => {
    const { run } = start();
    run.api.getThumbProps().onFocus();
    await settle();
    expect(run.state).toBe("focused");
    run.api.getThumbProps().onBlur();
    await settle();
    expect(run.state).toBe("idle");
  });
});

describe("vectorPad machine: disabled and read-only", () => {
  for (const flag of ["disabled", "readOnly"] as const) {
    it(`ignores the pointer, the keys and a double-click when ${flag}`, async () => {
      const { run, control } = start({ [flag]: true, defaultValue: { x: 10, y: 10 } });
      pointer("pointerdown", control, at(1, 1));
      await key(run, "ArrowRight");
      run.api.getControlProps().onDoubleClick();
      await settle();
      expect(run.api.value).toEqual({ x: 10, y: 10 });
      expect(run.state).toBe("idle");
    });
  }

  it("takes a disabled handle out of the tab order, and keeps a read-only one in it", () => {
    expect(start({ disabled: true }).run.api.getThumbProps().tabIndex).toBeUndefined();
    expect(start({ readOnly: true }).run.api.getThumbProps()).toMatchObject({
      tabIndex: 0,
      "aria-readonly": true,
      "data-readonly": "",
    });
  });
});

describe("vectorPad connect", () => {
  it("makes the handle a slider named by the label that says both values", async () => {
    const { run } = start({ defaultValue: { x: 20, y: -10 } });
    const thumb = run.api.getThumbProps();
    expect(thumb).toMatchObject({
      "data-scope": "vector-pad",
      "data-part": "thumb",
      role: "slider",
      tabIndex: 0,
      "aria-labelledby": run.api.getLabelProps().id,
      "aria-valuetext": "X 20, Y -10",
      "aria-valuenow": 20,
      "aria-valuemin": -100,
      "aria-valuemax": 100,
    });
    expect(run.api.getRootProps()).toMatchObject({
      role: "group",
      "aria-labelledby": run.api.getLabelProps().id,
    });
  });

  it("words the spoken value with getAriaValueText, and takes an aria-label instead of the label", () => {
    const { run } = start({
      "aria-label": "Offset",
      getAriaValueText: ({ x, y }) => `${x} a la derecha, ${y} arriba`,
    });
    expect(run.api.getThumbProps()).toMatchObject({
      "aria-label": "Offset",
      "aria-labelledby": undefined,
      "aria-valuetext": "0 a la derecha, 0 arriba",
    });
  });

  it("places the handle with --vector-pad-x / --vector-pad-y on the root", () => {
    const { run } = start({ min: 0, max: 100, defaultValue: { x: 25, y: 80 } });
    expect(run.api.getRootProps().style).toEqual({
      "--vector-pad-x": "25%",
      "--vector-pad-y": "20%",
    });
  });

  it("stamps the state on every part and hides the grid and crosshair from screen readers", async () => {
    const { run, control } = start({ disabled: false, invalid: true });
    pointer("pointerdown", control, at(0.5, 0.5));
    await settle();
    for (const part of ["Root", "Label", "Control", "Grid", "Crosshair", "Thumb"] as const) {
      const props = run.api[`get${part}Props`]() as Record<string, unknown>;
      expect(props["data-invalid"], part).toBe("");
      expect(props["data-dragging"], part).toBe("");
      expect(props["data-disabled"], part).toBeUndefined();
    }
    expect(run.api.getGridProps()["aria-hidden"]).toBe(true);
    expect(run.api.getCrosshairProps()["aria-hidden"]).toBe(true);
  });

  it("lets the pad take touch without scrolling the page", () => {
    const { run } = start();
    expect(run.api.getControlProps().style).toMatchObject({ touchAction: "none" });
  });

  it("focuses the handle when the label is clicked", () => {
    const { run, thumb } = start();
    run.api.getLabelProps().onClick(new MouseEvent("click", { cancelable: true }));
    expect(document.activeElement).toBe(thumb);
  });
});

describe("vectorPad utils", () => {
  const bounds = resolveBounds(0, 10, 4);

  it("snaps to the step counted from min, never past max", () => {
    expect(snapAxisValue(7, "x", bounds)).toBe(8);
    expect(snapAxisValue(10, "x", bounds)).toBe(8);
    expect(snapAxisValue(-3, "x", bounds)).toBe(0);
    expect(snapAxisValue(0.30000000000000004, "x", resolveBounds(0, 1, 0.1))).toBe(0.3);
    expect(Object.is(snapAxisValue(-0.2, "x", resolveBounds(-1, 1, 1)), 0)).toBe(true);
  });

  it("turns a spot on the pad into a value and back", () => {
    const full = resolveBounds(-100, 100, 1);
    expect(valueAtPosition({ left: 0, top: 0 }, full)).toEqual({ x: -100, y: 100 });
    expect(valueAtPosition({ left: 0, top: 0 }, full, true)).toEqual({ x: -100, y: -100 });
    expect(positionOfValue({ x: 100, y: 100 }, full)).toEqual({ left: 1, top: 0 });
    expect(positionOfValue({ x: 100, y: 100 }, full, true)).toEqual({ left: 1, top: 1 });
  });

  it("moves by an arrow in its direction on screen", () => {
    const full = resolveBounds(-100, 100, 1);
    expect(valueAfterArrow({ x: 0, y: 0 }, "up", 1, full)).toEqual({ x: 0, y: 1 });
    expect(valueAfterArrow({ x: 0, y: 0 }, "up", 1, full, true)).toEqual({ x: 0, y: -1 });
    expect(valueAfterArrow({ x: 0, y: 0 }, "left", 10, full)).toEqual({ x: -10, y: 0 });
  });
});
