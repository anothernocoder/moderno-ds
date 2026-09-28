// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { toolbar } from "../../src/index.js";
import { runMachine } from "../machine.js";

/** One item of the toolbar under test. */
interface ItemSpec {
  value: string;
  disabled?: boolean;
  pressed?: boolean;
}

const ROOT_ID = "toolbar:tools";

/** Lets the machine handle whatever an event handler sent. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

/**
 * Renders a toolbar the way a binding does: the root and one `<button>` per
 * item, each carrying the connected props, with the focus and key handlers
 * attached. The DOM is written before the machine starts, as a framework
 * mounts it, so the machine's first look finds the items. Resolves once
 * that first look has settled.
 */
async function renderToolbar(items: ItemSpec[], props: Partial<toolbar.Props> = {}) {
  const root = document.createElement("div");
  root.id = ROOT_ID;
  for (const { value } of items) {
    const button = document.createElement("button");
    button.setAttribute("data-ownedby", ROOT_ID);
    button.setAttribute("data-value", value);
    button.textContent = value;
    root.append(button);
  }
  document.body.append(root);

  const run = runMachine(toolbar.machine, toolbar.connect, { id: "tools", ...props });
  const itemProps = (item: ItemSpec) =>
    item.pressed === undefined
      ? run.api.getButtonProps(item)
      : run.api.getToggleProps({ ...item, pressed: item.pressed });
  const el = (value: string) => root.querySelector<HTMLElement>(`[data-value="${value}"]`)!;
  const mounted = () => items.filter((item) => el(item.value));

  /** Writes the current props onto the DOM, as a re-render would. */
  const paint = () => {
    for (const [name, value] of Object.entries(run.api.getRootProps())) {
      if (typeof value !== "function" && value !== undefined)
        root.setAttribute(name, String(value));
    }
    for (const item of mounted()) {
      for (const [name, value] of Object.entries(itemProps(item))) {
        if (typeof value === "function") continue;
        const attr = name === "tabIndex" ? "tabindex" : name;
        if (value === undefined) el(item.value).removeAttribute(attr);
        else el(item.value).setAttribute(attr, String(value));
      }
    }
  };

  for (const item of items) {
    el(item.value).addEventListener("focus", () => itemProps(item).onFocus());
    el(item.value).addEventListener("keydown", (event) => itemProps(item).onKeyDown(event));
  }
  await settle();
  paint();

  /** Presses `key` on the focused item and lets the machine settle. */
  const press = async (key: string, init: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    document.activeElement!.dispatchEvent(event);
    await settle();
    paint();
    return event;
  };

  const tabStops = () =>
    mounted()
      .map((item) => item.value)
      .filter((value) => el(value).getAttribute("tabindex") === "0");

  return { run, root, el, paint, press, tabStops, itemProps };
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("toolbar machine", () => {
  it("names the root a toolbar laid out in a row by default", async () => {
    const { root } = await renderToolbar([{ value: "undo" }]);

    expect(root.getAttribute("role")).toBe("toolbar");
    expect(root.getAttribute("aria-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-orientation")).toBe("horizontal");
    expect(root.getAttribute("data-scope")).toBe("toolbar");
    expect(root.getAttribute("data-part")).toBe("root");
  });

  it("makes every item a Tab stop before it has seen the DOM, so none is out of reach", async () => {
    const run = runMachine(toolbar.machine, toolbar.connect, { id: "detached" });

    expect(run.context("activeValue")).toBeNull();
    expect(run.api.getButtonProps({ value: "undo" }).tabIndex).toBe(0);
    expect(run.api.getButtonProps({ value: "redo" }).tabIndex).toBe(0);
  });

  it("gives the whole toolbar one Tab stop, on the first item", async () => {
    const { tabStops, run } = await renderToolbar([
      { value: "undo" },
      { value: "redo" },
      { value: "zoom" },
    ]);

    expect(run.context("activeValue")).toBe("undo");
    expect(tabStops()).toEqual(["undo"]);
  });

  it("moves focus with the arrow keys and wraps at both ends", async () => {
    const { el, press, tabStops } = await renderToolbar([
      { value: "undo" },
      { value: "redo" },
      { value: "zoom" },
    ]);
    el("undo").focus();

    await press("ArrowRight");
    expect(document.activeElement).toBe(el("redo"));
    expect(tabStops()).toEqual(["redo"]);

    await press("ArrowRight");
    await press("ArrowRight");
    expect(document.activeElement).toBe(el("undo"));

    await press("ArrowLeft");
    expect(document.activeElement).toBe(el("zoom"));
    expect(tabStops()).toEqual(["zoom"]);
  });

  it("goes to the first and last item with Home and End", async () => {
    const { el, press } = await renderToolbar([
      { value: "undo" },
      { value: "redo" },
      { value: "zoom" },
    ]);
    el("redo").focus();

    await press("End");
    expect(document.activeElement).toBe(el("zoom"));

    await press("Home");
    expect(document.activeElement).toBe(el("undo"));
  });

  it("keeps the Tab stop on the item focused last, however it got focus", async () => {
    const { el, paint, tabStops, run } = await renderToolbar([
      { value: "undo" },
      { value: "redo" },
    ]);

    el("redo").focus();
    await settle();
    paint();

    expect(run.context("activeValue")).toBe("redo");
    expect(tabStops()).toEqual(["redo"]);
  });

  it("uses the up and down arrows in a vertical toolbar, and ignores left and right", async () => {
    const { root, el, press } = await renderToolbar([{ value: "select" }, { value: "pen" }], {
      orientation: "vertical",
    });
    expect(root.getAttribute("aria-orientation")).toBe("vertical");
    el("select").focus();

    const ignored = await press("ArrowRight");
    expect(ignored.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(el("select"));

    const handled = await press("ArrowDown");
    expect(handled.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el("pen"));

    await press("ArrowUp");
    expect(document.activeElement).toBe(el("select"));
  });

  it("swaps left and right in a right-to-left toolbar", async () => {
    const { el, press } = await renderToolbar([{ value: "undo" }, { value: "redo" }], {
      dir: "rtl",
    });
    el("undo").focus();

    await press("ArrowLeft");
    expect(document.activeElement).toBe(el("redo"));
  });

  it("leaves alone a key that a part inside the item already handled", async () => {
    const { el } = await renderToolbar([{ value: "more" }, { value: "zoom" }], {
      orientation: "vertical",
    });
    el("more").focus();
    // A menu trigger opens on ArrowDown and prevents its default first.
    el("more").addEventListener("keydown", (event) => event.preventDefault(), { capture: true });

    el("more").dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true }),
    );
    await settle();

    expect(document.activeElement).toBe(el("more"));
  });

  it("keeps a disabled item in the arrow-key order, marked aria-disabled", async () => {
    const { el, press } = await renderToolbar([
      { value: "undo" },
      { value: "redo", disabled: true },
      { value: "zoom" },
    ]);
    expect(el("redo").getAttribute("aria-disabled")).toBe("true");
    expect(el("redo").hasAttribute("data-disabled")).toBe(true);
    expect(el("redo").hasAttribute("disabled")).toBe(false);
    expect(el("undo").hasAttribute("aria-disabled")).toBe(false);
    el("undo").focus();

    await press("ArrowRight");
    expect(document.activeElement).toBe(el("redo"));

    await press("ArrowRight");
    expect(document.activeElement).toBe(el("zoom"));
  });

  it("hands the Tab stop to the first item when the item holding it goes away", async () => {
    const { el, paint, run } = await renderToolbar([{ value: "undo" }, { value: "redo" }]);
    el("redo").focus();
    await settle();
    expect(run.context("activeValue")).toBe("redo");

    el("redo").remove();
    await settle();
    paint();

    expect(run.context("activeValue")).toBe("undo");
    expect(el("undo").getAttribute("tabindex")).toBe("0");
  });

  it("finds no items of a toolbar nested inside it", async () => {
    const { root, el, press } = await renderToolbar([{ value: "undo" }, { value: "redo" }]);
    const nested = document.createElement("button");
    nested.setAttribute("data-ownedby", "toolbar:other");
    nested.setAttribute("data-value", "nested");
    el("undo").after(nested);
    expect(root.contains(nested)).toBe(true);
    el("undo").focus();

    await press("ArrowRight");
    expect(document.activeElement).toBe(el("redo"));
  });

  it("marks every item a button of this toolbar", async () => {
    const { el } = await renderToolbar([{ value: "undo" }]);

    expect(el("undo").getAttribute("type")).toBe("button");
    expect(el("undo").getAttribute("data-part")).toBe("button");
    expect(el("undo").getAttribute("data-ownedby")).toBe(ROOT_ID);
  });

  it("says whether a toggle is pressed", async () => {
    const { el } = await renderToolbar([
      { value: "bold", pressed: true },
      { value: "italic", pressed: false },
    ]);

    expect(el("bold").getAttribute("data-part")).toBe("toggle");
    expect(el("bold").getAttribute("aria-pressed")).toBe("true");
    expect(el("bold").getAttribute("data-state")).toBe("on");
    expect(el("bold").hasAttribute("data-pressed")).toBe(true);
    expect(el("italic").getAttribute("aria-pressed")).toBe("false");
    expect(el("italic").getAttribute("data-state")).toBe("off");
    expect(el("italic").hasAttribute("data-pressed")).toBe(false);
  });

  it("makes a group a role=group and turns a separator across the toolbar", async () => {
    const row = runMachine(toolbar.machine, toolbar.connect, { id: "row" });
    const column = runMachine(toolbar.machine, toolbar.connect, {
      id: "column",
      orientation: "vertical",
    });

    expect(row.api.getGroupProps()).toMatchObject({ role: "group", "data-part": "group" });
    expect(row.api.getSeparatorProps()).toMatchObject({
      role: "separator",
      "data-part": "separator",
      "aria-orientation": "vertical",
      "data-orientation": "vertical",
    });
    expect(column.api.getSeparatorProps()).toMatchObject({
      "aria-orientation": "horizontal",
      "data-orientation": "horizontal",
    });
  });

  it("follows a new orientation from its props", async () => {
    const run = runMachine(toolbar.machine, toolbar.connect, { id: "switch" });
    run.setProps({ orientation: "vertical" });

    expect(run.api.orientation).toBe("vertical");
    expect(run.api.getRootProps()).toMatchObject({ "aria-orientation": "vertical" });
  });
});
