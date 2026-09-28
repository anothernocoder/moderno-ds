// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce } from "../../src/announce.js";
import * as sortableList from "../../src/machines/sortable-list/index.js";
import {
  autoScrollSpeed,
  clampDragOffset,
  dropIndexAt,
  moveItem,
  shiftOffset,
  slotOffset,
} from "../../src/machines/sortable-list/sortable-list.layout.js";
import type {
  ItemLayout,
  SortableListProps,
} from "../../src/machines/sortable-list/sortable-list.types.js";
import { runMachine } from "../machine.js";

vi.mock("../../src/announce.js", () => ({ announce: vi.fn() }));

const ITEMS = ["title", "logo", "colors", "fonts"];
const LABELS: Record<string, string> = {
  title: "Title",
  logo: "Logo",
  colors: "Colors",
  fonts: "Fonts",
};

/** Every item is 32px tall with an 8px gap: tops at 0, 40, 80, 120. */
const ITEM_HEIGHT = 32;
const ITEM_STEP = 40;
const LAYOUT: ItemLayout[] = ITEMS.map((_, index) => ({
  top: index * ITEM_STEP,
  height: ITEM_HEIGHT,
}));

/** The box `getBoundingClientRect` reports, as a browser lays the list out. */
function stubBox(el: HTMLElement, top: () => number, height: number) {
  el.getBoundingClientRect = () =>
    ({ top: top(), bottom: top() + height, height, left: 0, right: 200, width: 200 }) as DOMRect;
}

type Run = ReturnType<typeof start>;

function start(props: Partial<SortableListProps> = {}) {
  return runMachine(sortableList.machine, sortableList.connect, {
    id: "slides",
    defaultItems: ITEMS,
    ...props,
  });
}

/**
 * Renders the list the way a binding does: one element per part with the ids
 * the connect gives, and a handle in each item when `handles` is set. The
 * list's top is `listTop()`, so a test can scroll it.
 */
function mount(
  run: Run,
  { handles = false, listTop = () => 0 }: { handles?: boolean; listTop?: () => number } = {},
) {
  const root = document.createElement("ul");
  root.id = run.api.getRootProps().id as string;
  stubBox(root, listTop, ITEMS.length * ITEM_STEP);
  run.api.items.forEach((value, index) => {
    const item = document.createElement("li");
    item.id = run.api.getItemProps({ value }).id as string;
    stubBox(item, () => listTop() + index * ITEM_STEP, ITEM_HEIGHT);
    if (handles) {
      const handle = document.createElement("button");
      handle.id = run.api.getItemHandleProps({ value }).id as string;
      item.append(handle);
    }
    const trigger = document.createElement("button");
    trigger.id = run.api.getItemTriggerProps({ value }).id as string;
    trigger.textContent = LABELS[value]!;
    item.append(trigger);
    root.append(item);
  });
  document.body.append(root);
  return root;
}

const trigger = (value: string) =>
  document.querySelector<HTMLElement>(`[id$=":trigger:${value}"]`)!;
const handle = (value: string) => document.querySelector<HTMLElement>(`[id$=":handle:${value}"]`)!;

/** A key event as a binding hands it to the connect; `repeat` when the key is held. */
function key(name: string, { repeat = false }: { repeat?: boolean } = {}) {
  return {
    key: name,
    repeat,
    defaultPrevented: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent & { preventDefault: ReturnType<typeof vi.fn> };
}

/** Waits past the frames the machine waits for (focus, settling). */
const frames = () => new Promise((resolve) => setTimeout(resolve, 50));

const pickUp = (run: Run, value: string, part: "trigger" | "handle" = "trigger") =>
  run.send({ type: "PICK_UP", value, label: LABELS[value]!, part, disabled: false });

const pointerDown = (run: Run, value: string, y: number, pointerId = 1) =>
  run.send({
    type: "POINTER.DOWN",
    value,
    label: LABELS[value]!,
    part: "trigger",
    disabled: false,
    point: { x: 10, y },
    pointerId,
  });

const pointerMove = (run: Run, y: number) =>
  run.send({ type: "POINTER.MOVE", point: { x: 10, y } });

const announced = () => vi.mocked(announce).mock.calls.map(([message]) => message);

beforeEach(() => {
  vi.mocked(announce).mockClear();
});
afterEach(() => {
  document.body.innerHTML = "";
});

describe("sortableList layout arithmetic", () => {
  it("moves one item to a new place", () => {
    expect(moveItem(ITEMS, 0, 2)).toEqual(["logo", "colors", "title", "fonts"]);
    expect(moveItem(ITEMS, 3, 0)).toEqual(["fonts", "title", "logo", "colors"]);
    expect(moveItem(ITEMS, 1, 1)).toEqual(ITEMS);
  });

  it("draws the moved item over its landing slot", () => {
    expect(slotOffset(LAYOUT, 0, 2)).toBe(80);
    expect(slotOffset(LAYOUT, 3, 1)).toBe(-80);
    expect(slotOffset(LAYOUT, 1, 1)).toBe(0);
  });

  it("steps the passed items aside by the moved item's height and one gap", () => {
    expect([0, 1, 2, 3].map((index) => shiftOffset(LAYOUT, 0, 2, index))).toEqual([0, -40, -40, 0]);
    expect([0, 1, 2, 3].map((index) => shiftOffset(LAYOUT, 3, 1, index))).toEqual([0, 40, 40, 0]);
  });

  it("keeps a dragged item inside the list", () => {
    expect(clampDragOffset(LAYOUT, 1, -500)).toBe(-40);
    expect(clampDragOffset(LAYOUT, 1, 500)).toBe(80);
    expect(clampDragOffset(LAYOUT, 1, 12)).toBe(12);
  });

  it("lands the item where its middle passes the others' middles", () => {
    expect(dropIndexAt(LAYOUT, 0, 0)).toBe(0);
    expect(dropIndexAt(LAYOUT, 0, 39)).toBe(0);
    expect(dropIndexAt(LAYOUT, 0, 41)).toBe(1);
    expect(dropIndexAt(LAYOUT, 0, 121)).toBe(3);
    expect(dropIndexAt(LAYOUT, 3, -41)).toBe(2);
  });

  it("lands an item held against the last or first slot in that slot", () => {
    expect(dropIndexAt(LAYOUT, 0, clampDragOffset(LAYOUT, 0, 500))).toBe(3);
    expect(dropIndexAt(LAYOUT, 3, clampDragOffset(LAYOUT, 3, -500))).toBe(0);
    expect(dropIndexAt(LAYOUT, 1, 0)).toBe(1);
  });

  it("scrolls near an edge, faster closer to it, and not in the middle", () => {
    const bounds = { top: 100, bottom: 500 };
    expect(autoScrollSpeed(300, bounds)).toBe(0);
    expect(autoScrollSpeed(100, bounds)).toBe(-16);
    expect(autoScrollSpeed(124, bounds)).toBe(-8);
    expect(autoScrollSpeed(500, bounds)).toBe(16);
    expect(autoScrollSpeed(476, bounds)).toBe(8);
  });
});

describe("sortableList machine — order", () => {
  it("holds its own order from defaultItems", () => {
    const run = start();
    expect(run.api.items).toEqual(ITEMS);
  });

  it("follows a controlled items prop", () => {
    const run = start({ items: ["fonts", "title"] });
    expect(run.api.items).toEqual(["fonts", "title"]);
    run.setProps({ items: ["title", "fonts"] });
    expect(run.api.items).toEqual(["title", "fonts"]);
  });

  it("keeps a controlled order until the owner applies onReorder", async () => {
    const onReorder = vi.fn();
    const run = start({ items: ITEMS, onReorder });
    mount(run);
    await pickUp(run, "title");
    await run.send({ type: "MOVE.NEXT" });
    await run.send({ type: "DROP" });

    expect(onReorder).toHaveBeenCalledWith({
      items: ["logo", "title", "colors", "fonts"],
      value: "title",
      from: 0,
      to: 1,
    });
    expect(run.api.items).toEqual(ITEMS);
  });
});

describe("sortableList machine — roving focus", () => {
  it("makes the first item's trigger the list's one Tab stop", () => {
    const run = start();
    const tabIndexes = ITEMS.map((value) => run.api.getItemTriggerProps({ value }).tabIndex);
    expect(tabIndexes).toEqual([0, -1, -1, -1]);
    expect(run.api.getItemHandleProps({ value: "title" }).tabIndex).toBe(-1);
  });

  it("moves the Tab stop to the item that takes focus", async () => {
    const run = start();
    await run.send({ type: "ITEM.FOCUS", value: "colors", part: "trigger" });
    const tabIndexes = ITEMS.map((value) => run.api.getItemTriggerProps({ value }).tabIndex);
    expect(tabIndexes).toEqual([-1, -1, 0, -1]);
  });

  it("gives the Tab stop to a focused handle", async () => {
    const run = start();
    await run.send({ type: "ITEM.FOCUS", value: "logo", part: "handle" });
    expect(run.api.getItemHandleProps({ value: "logo" }).tabIndex).toBe(0);
    expect(run.api.getItemTriggerProps({ value: "logo" }).tabIndex).toBe(-1);
  });

  it("moves focus with Down, Up, Home and End", async () => {
    const run = start();
    mount(run);
    trigger("title").focus();
    await run.send({ type: "ITEM.FOCUS", value: "title", part: "trigger" });

    run.api.getItemTriggerProps({ value: "title" }).onKeyDown(key("ArrowDown"));
    await frames();
    expect(document.activeElement).toBe(trigger("logo"));

    await run.send({ type: "ITEM.FOCUS", value: "logo", part: "trigger" });
    run.api.getItemTriggerProps({ value: "logo" }).onKeyDown(key("End"));
    await frames();
    expect(document.activeElement).toBe(trigger("fonts"));

    await run.send({ type: "ITEM.FOCUS", value: "fonts", part: "trigger" });
    run.api.getItemTriggerProps({ value: "fonts" }).onKeyDown(key("ArrowUp"));
    await frames();
    expect(document.activeElement).toBe(trigger("colors"));

    await run.send({ type: "ITEM.FOCUS", value: "colors", part: "trigger" });
    run.api.getItemTriggerProps({ value: "colors" }).onKeyDown(key("Home"));
    await frames();
    expect(document.activeElement).toBe(trigger("title"));
  });

  it("stops at the ends instead of wrapping", async () => {
    const run = start();
    mount(run);
    await run.send({ type: "ITEM.FOCUS", value: "fonts", part: "trigger" });
    trigger("fonts").focus();
    await run.send({ type: "FOCUS.NEXT", value: "fonts" });
    await frames();
    expect(document.activeElement).toBe(trigger("fonts"));
  });

  it("moves between an item's handle and trigger with Left and Right", async () => {
    const run = start();
    mount(run, { handles: true });
    await run.send({ type: "ITEM.FOCUS", value: "logo", part: "trigger" });

    run.api.getItemTriggerProps({ value: "logo" }).onKeyDown(key("ArrowLeft"));
    await frames();
    expect(document.activeElement).toBe(handle("logo"));

    await run.send({ type: "ITEM.FOCUS", value: "logo", part: "handle" });
    run.api.getItemHandleProps({ value: "logo" }).onKeyDown(key("ArrowDown"));
    await frames();
    expect(document.activeElement).toBe(handle("colors"));

    run.api.getItemHandleProps({ value: "colors" }).onKeyDown(key("ArrowRight"));
    await frames();
    expect(document.activeElement).toBe(trigger("colors"));
  });

  it("reaches a disabled item from the handles on its trigger", async () => {
    const run = start();
    mount(run, { handles: true });
    // A binding renders a disabled item's handle as a disabled button.
    for (const value of ["title", "colors"]) (handle(value) as HTMLButtonElement).disabled = true;
    const pressOnHandle = async (value: string, name: string) => {
      handle(value).focus();
      await run.send({ type: "ITEM.FOCUS", value, part: "handle" });
      run.api.getItemHandleProps({ value }).onKeyDown(key(name));
      await frames();
    };

    await pressOnHandle("logo", "ArrowUp");
    expect(document.activeElement).toBe(trigger("title"));
    await pressOnHandle("logo", "Home");
    expect(document.activeElement).toBe(trigger("title"));
    await pressOnHandle("logo", "ArrowDown");
    expect(document.activeElement).toBe(trigger("colors"));
    await pressOnHandle("fonts", "ArrowUp");
    expect(document.activeElement).toBe(trigger("colors"));
  });
});

describe("sortableList machine — keyboard reorder", () => {
  it("picks up with Space on the trigger of an item with no handle", async () => {
    const run = start();
    mount(run);
    const event = key(" ");
    run.api.getItemTriggerProps({ value: "colors", label: "Colors" }).onKeyDown(event);
    await frames();

    expect(event.preventDefault).toHaveBeenCalled();
    expect(run.state).toBe("picked");
    expect(run.api.dragging).toBe("keyboard");
    expect(run.api.getItemProps({ value: "colors" })["data-dragging"]).toBe("keyboard");
    expect(announced()).toEqual(["Colors picked up. Position 3 of 4."]);
  });

  it("leaves Space to the trigger's own click when the item has a handle", async () => {
    const run = start();
    mount(run, { handles: true });
    const onTrigger = key(" ");
    run.api.getItemTriggerProps({ value: "logo" }).onKeyDown(onTrigger);
    await frames();
    expect(onTrigger.preventDefault).not.toHaveBeenCalled();
    expect(run.state).toBe("idle");

    run.api.getItemHandleProps({ value: "logo", label: "Logo" }).onKeyDown(key(" "));
    await frames();
    expect(run.state).toBe("picked");
    expect(run.context("focusedPart")).toBe("handle");
  });

  it("stops the Space keyup from clicking where Space picks up", () => {
    const run = start();
    mount(run, { handles: true });
    const onHandle = key(" ");
    run.api.getItemHandleProps({ value: "logo" }).onKeyUp(onHandle);
    expect(onHandle.preventDefault).toHaveBeenCalled();
    const onTrigger = key(" ");
    run.api.getItemTriggerProps({ value: "logo" }).onKeyUp(onTrigger);
    expect(onTrigger.preventDefault).not.toHaveBeenCalled();
  });

  it("moves the picked item with the arrows, drawing it over its slot", async () => {
    const run = start();
    mount(run);
    await pickUp(run, "title");
    await run.send({ type: "MOVE.NEXT" });
    await run.send({ type: "MOVE.NEXT" });

    expect(run.context("toIndex")).toBe(2);
    const offsets = ITEMS.map((value) => run.api.getItemState({ value }).offset);
    expect(offsets).toEqual([80, -40, -40, 0]);
    expect(run.api.getItemProps({ value: "title" }).style).toEqual({
      "--sortable-list-offset": "80px",
    });
    expect(announced().slice(1)).toEqual(["Moved to position 2.", "Moved to position 3."]);
  });

  it("jumps to the first and last places with Home and End, and stops at the ends", async () => {
    const run = start();
    mount(run);
    await pickUp(run, "logo");
    await run.send({ type: "MOVE.LAST" });
    expect(run.context("toIndex")).toBe(3);
    await run.send({ type: "MOVE.NEXT" });
    expect(run.context("toIndex")).toBe(3);
    await run.send({ type: "MOVE.FIRST" });
    expect(run.context("toIndex")).toBe(0);
    expect(announced()).toEqual([
      "Logo picked up. Position 2 of 4.",
      "Moved to position 4.",
      "Moved to position 1.",
    ]);
  });

  it("drops with Space: reports the new order, keeps focus on the item, then settles", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    await pickUp(run, "title");
    await run.send({ type: "MOVE.NEXT" });
    run.api.getItemTriggerProps({ value: "title" }).onKeyDown(key(" "));
    await frames();

    expect(onReorder).toHaveBeenCalledWith({
      items: ["logo", "title", "colors", "fonts"],
      value: "title",
      from: 0,
      to: 1,
    });
    expect(run.api.items).toEqual(["logo", "title", "colors", "fonts"]);
    expect(announced().at(-1)).toBe("Dropped.");
    expect(document.activeElement).toBe(trigger("title"));
    expect(run.context("focusedValue")).toBe("title");
    expect(run.state).toBe("idle");
    expect(run.api.getItemState({ value: "title" }).offset).toBe(0);
  });

  it("picks up and drops once while Space is held", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    const pressOnTitle = async (name: string, repeat = false) => {
      const event = key(name, { repeat });
      run.api.getItemTriggerProps({ value: "title", label: "Title" }).onKeyDown(event);
      await frames();
      return event;
    };

    await pressOnTitle(" ");
    const held = await pressOnTitle(" ", true);
    expect(held.preventDefault).toHaveBeenCalled();
    expect(run.state).toBe("picked");

    await run.send({ type: "MOVE.NEXT" });
    await pressOnTitle(" ");
    await pressOnTitle(" ", true);
    await pressOnTitle("Enter", true);
    expect(run.state).toBe("idle");
    expect(onReorder).toHaveBeenCalledTimes(1);
  });

  it("does not report a drop in the same place", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    await pickUp(run, "logo");
    await run.send({ type: "DROP" });
    expect(onReorder).not.toHaveBeenCalled();
    expect(announced().at(-1)).toBe("Dropped.");
  });

  it("puts the item back with Escape", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    await pickUp(run, "logo");
    await run.send({ type: "MOVE.NEXT" });
    run.api.getItemTriggerProps({ value: "logo" }).onKeyDown(key("Escape"));
    await frames();

    expect(run.state).toBe("idle");
    expect(onReorder).not.toHaveBeenCalled();
    expect(run.api.items).toEqual(ITEMS);
    expect(ITEMS.map((value) => run.api.getItemState({ value }).offset)).toEqual([0, 0, 0, 0]);
    expect(announced().at(-1)).toBe("Cancelled. Logo is back at position 2.");
  });

  it("puts the item back when focus leaves it", async () => {
    const run = start();
    mount(run);
    await pickUp(run, "logo");
    run.api.getItemTriggerProps({ value: "logo" }).onBlur({ relatedTarget: document.body });
    await frames();
    expect(run.state).toBe("idle");
  });

  it("ignores arrows on an item that is not the picked one", async () => {
    const run = start();
    mount(run);
    await pickUp(run, "logo");
    const event = key("ArrowDown");
    run.api.getItemTriggerProps({ value: "fonts" }).onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(run.context("toIndex")).toBe(1);
  });
});

describe("sortableList machine — pointer reorder", () => {
  it("does not drag until the pointer passes the threshold, so a click stays a click", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    await pointerDown(run, "title", 16);
    await pointerMove(run, 16 + sortableList.DRAG_THRESHOLD - 1);
    expect(run.state).toBe("pressing");
    expect(run.api.dragging).toBeUndefined();

    await run.send({ type: "POINTER.UP" });
    expect(run.state).toBe("idle");
    expect(onReorder).not.toHaveBeenCalled();
    expect(announced()).toEqual([]);
  });

  it("drags past the threshold: the item follows the pointer and the others step aside", async () => {
    const run = start();
    mount(run);
    await pointerDown(run, "title", 16);
    await pointerMove(run, 16 + 50);

    expect(run.state).toBe("dragging");
    expect(run.api.dragging).toBe("pointer");
    expect(run.api.getItemState({ value: "title" }).offset).toBe(50);
    expect(run.context("toIndex")).toBe(1);
    expect(ITEMS.map((value) => run.api.getItemState({ value }).offset)).toEqual([50, -40, 0, 0]);
    expect(run.api.getRootProps()["data-dragging"]).toBe("pointer");
    expect(announced()).toEqual(["Title picked up. Position 1 of 4.", "Moved to position 2."]);
  });

  it("drops on pointer up: reports the order and settles from where it was let go", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    await pointerDown(run, "title", 16);
    await pointerMove(run, 16 + 90);
    await run.send({ type: "POINTER.UP" });

    expect(onReorder).toHaveBeenCalledWith({
      items: ["logo", "colors", "title", "fonts"],
      value: "title",
      from: 0,
      to: 2,
    });
    // Let go 90px down; its slot is 80px down, so it is drawn 10px past it.
    expect(run.state).toBe("settling");
    expect(run.context("settleOffset")).toBe(10);
    expect(run.api.getRootProps()["data-settling"]).toBe("");
    expect(run.api.getItemState({ value: "title" }).offset).toBe(10);
    expect(run.api.getItemState({ value: "logo" }).offset).toBe(0);

    await frames();
    expect(run.state).toBe("idle");
    expect(run.api.getItemState({ value: "title" }).offset).toBe(0);
  });

  it("follows the pointer when the list scrolls under it", async () => {
    let listTop = 0;
    const run = start();
    mount(run, { listTop: () => listTop });
    await pointerDown(run, "title", 16);
    await pointerMove(run, 30);
    expect(run.api.getItemState({ value: "title" }).offset).toBe(14);

    listTop = -40;
    await run.send({ type: "SCROLL" });
    expect(run.api.getItemState({ value: "title" }).offset).toBe(54);
  });

  it("follows the pointer when the list itself scrolls: its box stays, its content moves", async () => {
    const run = start();
    const root = mount(run);
    let scrolled = 0;
    Object.defineProperty(root, "scrollTop", { get: () => scrolled });
    await pointerDown(run, "title", 16);
    await pointerMove(run, 30);
    expect(run.api.getItemState({ value: "title" }).offset).toBe(14);

    scrolled = 40;
    await run.send({ type: "SCROLL" });
    expect(run.api.getItemState({ value: "title" }).offset).toBe(54);
    expect(run.context("toIndex")).toBe(1);
  });

  it("puts the item back when the pointer is cancelled or Escape is pressed", async () => {
    const onReorder = vi.fn();
    const run = start({ onReorder });
    mount(run);
    await pointerDown(run, "logo", 56);
    await pointerMove(run, 120);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await frames();

    expect(run.state).toBe("idle");
    expect(onReorder).not.toHaveBeenCalled();
    expect(announced().at(-1)).toBe("Cancelled. Logo is back at position 2.");
  });

  it("tracks only the pointer that started the drag", async () => {
    const run = start();
    mount(run);
    await pointerDown(run, "title", 16, 7);
    document.dispatchEvent(
      Object.assign(new MouseEvent("pointermove", { clientX: 10, clientY: 200 }), { pointerId: 8 }),
    );
    await frames();
    expect(run.state).toBe("pressing");

    document.dispatchEvent(
      Object.assign(new MouseEvent("pointermove", { clientX: 10, clientY: 60 }), { pointerId: 7 }),
    );
    await frames();
    expect(run.state).toBe("dragging");
  });

  it("starts a drag from the handle only, when the item has one", async () => {
    const run = start();
    mount(run, { handles: true });
    const pointer = (target: HTMLElement) =>
      ({ button: 0, clientX: 10, clientY: 16, pointerId: 1, target }) as unknown as PointerEvent;

    run.api.getItemProps({ value: "title" }).onPointerDown(pointer(trigger("title")));
    await frames();
    expect(run.state).toBe("idle");

    run.api.getItemProps({ value: "title" }).onPointerDown(pointer(handle("title")));
    await frames();
    expect(run.state).toBe("pressing");
    expect(run.context("focusedPart")).toBe("handle");
  });

  it("starts a drag from anywhere in an item with no handle, except a text field", async () => {
    const run = start();
    mount(run);
    const input = document.createElement("input");
    trigger("logo").parentElement!.append(input);
    const pointer = (target: HTMLElement) =>
      ({ button: 0, clientX: 10, clientY: 56, pointerId: 1, target }) as unknown as PointerEvent;

    run.api.getItemProps({ value: "logo" }).onPointerDown(pointer(input));
    await frames();
    expect(run.state).toBe("idle");

    run.api.getItemProps({ value: "logo" }).onPointerDown(pointer(trigger("logo")));
    await frames();
    expect(run.state).toBe("pressing");
  });

  it("stops the browser's own drag of an image where a press moves the item", () => {
    const run = start();
    mount(run, { handles: true });
    const image = document.createElement("img");
    trigger("logo").parentElement!.append(image);
    /** Whether the item stops a native drag that starts on `target`. */
    const stopsDrag = (target: HTMLElement, props: { disabled?: boolean; handle?: boolean }) => {
      if (props.handle === false) handle("logo").remove();
      const event = { target, preventDefault: vi.fn() } as unknown as DragEvent;
      run.api.getItemProps({ value: "logo", disabled: props.disabled }).onDragStart(event);
      return vi.mocked(event.preventDefault).mock.calls.length > 0;
    };

    expect(stopsDrag(handle("logo"), {})).toBe(true);
    expect(stopsDrag(image, {})).toBe(false);
    expect(stopsDrag(image, { handle: false })).toBe(true);
    expect(stopsDrag(image, { disabled: true })).toBe(false);
  });

  it("swallows the click that ends a drag", async () => {
    const run = start();
    mount(run);
    const onClick = vi.fn();
    trigger("colors").addEventListener("click", onClick);
    await pointerDown(run, "title", 16);
    await pointerMove(run, 100);
    await run.send({ type: "POINTER.UP" });

    trigger("colors").click();
    expect(onClick).not.toHaveBeenCalled();
    await frames();
    trigger("colors").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("sortableList machine — disabled", () => {
  it("moves nothing when the list is disabled, but focus still moves", async () => {
    const run = start({ disabled: true });
    mount(run);
    const space = key(" ");
    run.api.getItemTriggerProps({ value: "title" }).onKeyDown(space);
    await pointerDown(run, "title", 16);
    expect(run.state).toBe("idle");
    expect(space.preventDefault).not.toHaveBeenCalled();
    expect(run.api.getRootProps()["data-disabled"]).toBe("");
    expect(run.api.getItemHandleProps({ value: "title" }).disabled).toBe(true);
    expect(run.api.getItemTriggerProps({ value: "title" }).tabIndex).toBe(0);

    run.api.getItemTriggerProps({ value: "title" }).onKeyDown(key("ArrowDown"));
    await frames();
    expect(document.activeElement).toBe(trigger("logo"));
  });

  it("does not move a disabled item, while the others still pass it", async () => {
    const run = start();
    mount(run);
    const pointer = { button: 0, clientX: 10, clientY: 56, pointerId: 1, target: trigger("logo") };
    run.api.getItemProps({ value: "logo", disabled: true }).onPointerDown(pointer);
    run.api.getItemTriggerProps({ value: "logo", disabled: true }).onKeyDown(key(" "));
    await frames();
    expect(run.state).toBe("idle");
    expect(run.api.getItemProps({ value: "logo", disabled: true })["data-disabled"]).toBe("");

    await pickUp(run, "title");
    await run.send({ type: "MOVE.NEXT" });
    await run.send({ type: "MOVE.NEXT" });
    expect(run.context("toIndex")).toBe(2);
  });

  it("puts a moving item back when the list becomes disabled", async () => {
    const run = start();
    mount(run);
    await pickUp(run, "title");
    run.setProps({ disabled: true });
    await frames();
    expect(run.state).toBe("idle");
  });
});

describe("sortableList connect — names", () => {
  it("names the handle after its item", () => {
    const run = start();
    expect(run.api.getItemHandleProps({ value: "logo", label: "Logo" })["aria-label"]).toBe(
      "Reorder Logo",
    );
    expect(run.api.getItemHandleProps({ value: "logo" })["aria-label"]).toBe("Reorder logo");
  });

  it("takes other words from translations", async () => {
    const run = start({
      translations: {
        handleLabel: (label) => `Reordenar ${label}`,
        pickedUp: ({ label, position, count }) =>
          `${label} tomado. Posición ${position} de ${count}.`,
      },
    });
    mount(run);
    expect(run.api.getItemHandleProps({ value: "logo", label: "Logo" })["aria-label"]).toBe(
      "Reordenar Logo",
    );
    await pickUp(run, "logo");
    await run.send({ type: "MOVE.NEXT" });
    expect(announced()).toEqual(["Logo tomado. Posición 2 de 4.", "Moved to position 3."]);
  });

  it("marks the parts with the anatomy's scope and part names", () => {
    const run = start();
    expect(run.api.getRootProps()).toMatchObject({
      "data-scope": "sortable-list",
      "data-part": "root",
      role: "list",
    });
    expect(run.api.getItemProps({ value: "logo" })).toMatchObject({
      "data-part": "item",
      role: "listitem",
      "data-value": "logo",
    });
    expect(run.api.getItemHandleProps({ value: "logo" })).toMatchObject({
      "data-part": "item-handle",
      type: "button",
    });
    expect(run.api.getItemTriggerProps({ value: "logo" })).toMatchObject({
      "data-part": "item-trigger",
      type: "button",
    });
  });
});
