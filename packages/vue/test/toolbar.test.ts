import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref, type PropType } from "vue";
import { Menu, Toolbar, type ToolbarOrientation, type ToolbarSize } from "../src/index.js";

afterEach(cleanup);

const Demo = defineComponent({
  props: {
    orientation: { type: String as PropType<ToolbarOrientation>, default: undefined },
    size: { type: String as PropType<ToolbarSize>, default: undefined },
    dir: { type: String as PropType<"ltr" | "rtl">, default: undefined },
    onUndo: { type: Function, default: undefined },
    onRedo: { type: Function, default: undefined },
    onBoldChange: { type: Function, default: undefined },
  },
  setup(props) {
    const icon = () => h("svg", { "aria-hidden": "true" });
    return () => [
      h("button", { type: "button" }, "Before"),
      h(
        Toolbar.Root,
        {
          "aria-label": "Canvas tools",
          orientation: props.orientation,
          size: props.size,
          dir: props.dir,
          class: "tools",
        },
        () => [
          h(Toolbar.Button, { label: "Undo", shortcut: "⌘Z", onClick: props.onUndo }, icon),
          h(Toolbar.Button, { label: "Redo", disabled: true, onClick: props.onRedo }, icon),
          h(Toolbar.Separator),
          h(Toolbar.Group, { "aria-label": "Text style" }, () => [
            h(Toolbar.Toggle, { label: "Bold", onPressedChange: props.onBoldChange }, icon),
            h(Toolbar.Toggle, { label: "Italic", defaultPressed: true }, icon),
          ]),
          h("span", null, "100%"),
          h(Toolbar.Button, null, () => "Share"),
        ],
      ),
      h("button", { type: "button" }, "After"),
    ];
  },
});

const root = () => screen.getByRole("toolbar");
const item = (name: string) => screen.getByRole("button", { name });
const tabStops = () =>
  Array.from(root().querySelectorAll<HTMLElement>("[data-ownedby]"))
    .filter((el) => el.tabIndex === 0)
    .map((el) => el.getAttribute("aria-label") ?? el.textContent);

const MenuDemo = defineComponent({
  props: { disabled: { type: Boolean, default: false }, onSelect: { type: Function } },
  setup(props) {
    return () =>
      h(Toolbar.Root, { "aria-label": "Canvas tools" }, () => [
        h(Toolbar.Button, { label: "Undo" }, () => "U"),
        h(Menu.Root, { onSelect: props.onSelect }, () => [
          h(Menu.Trigger, { asChild: true }, () =>
            h(Toolbar.Button, { label: "More", disabled: props.disabled }, () => "⋯"),
          ),
          h(Menu.Positioner, null, () =>
            h(Menu.Content, null, () => h(Menu.Item, { value: "export" }, () => "Export")),
          ),
        ]),
      ]);
  },
});

/** A toolbar with two menu buttons and a plain item between them. */
const MenusDemo = defineComponent({
  props: { orientation: { type: String as PropType<ToolbarOrientation>, default: undefined } },
  setup(props) {
    const menu = (label: string) =>
      h(Menu.Root, null, () => [
        h(Menu.Trigger, { asChild: true }, () => h(Toolbar.Button, { label }, () => "⋯")),
        h(Menu.Positioner, null, () =>
          h(Menu.Content, null, () => h(Menu.Item, { value: "one" }, () => "One")),
        ),
      ]);
    return () =>
      h(Toolbar.Root, { "aria-label": "Canvas tools", orientation: props.orientation }, () => [
        h(Toolbar.Button, null, () => "First"),
        menu("Shapes"),
        h(Toolbar.Button, null, () => "Middle"),
        menu("Export"),
        h(Toolbar.Button, null, () => "Last"),
      ]);
  },
});

describe("Toolbar (Vue)", () => {
  it("is a named toolbar, horizontal by default, with the recipe's size", () => {
    render(Demo);
    expect(root().getAttribute("aria-label")).toBe("Canvas tools");
    expect(root().getAttribute("aria-orientation")).toBe("horizontal");
    expect(root().getAttribute("data-size")).toBe("md");
    expect(root().className).toBe("tools");

    cleanup();
    render(Demo, { props: { orientation: "vertical", size: "sm" } });
    expect(root().getAttribute("aria-orientation")).toBe("vertical");
    expect(root().getAttribute("data-size")).toBe("sm");
  });

  it("keeps an id given to the root", () => {
    render(() =>
      h(Toolbar.Root, { id: "canvas-tools", "aria-label": "Canvas tools" }, () =>
        h(Toolbar.Button, null, () => "Undo"),
      ),
    );
    expect(root().id).toBe("canvas-tools");
    expect(item("Undo").getAttribute("data-ownedby")).toBe("canvas-tools");
  });

  it("names every icon-only item by its label", () => {
    render(Demo);
    for (const name of ["Undo", "Redo", "Bold", "Italic"]) {
      expect(item(name).getAttribute("aria-label")).toBe(name);
    }
    expect(item("Share").hasAttribute("aria-label")).toBe(false);
  });

  it("is one Tab stop: Tab enters on the first item and leaves on the next", async () => {
    const user = userEvent.setup();
    render(Demo);
    await waitFor(() => expect(tabStops()).toEqual(["Undo"]));

    await user.click(screen.getByText("Before"));
    await user.tab();
    expect(document.activeElement).toBe(item("Undo"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText("After"));
  });

  it("moves between items with the arrow keys, Home and End, and wraps", async () => {
    const user = userEvent.setup();
    render(Demo);
    item("Undo").focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(item("Redo"));
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(item("Share"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(item("Undo"));
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(item("Share"));
    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(item("Undo"));
  });

  it("brings Tab back to the item focused last", async () => {
    const user = userEvent.setup();
    render(Demo);
    item("Undo").focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText("After"));

    await user.tab({ shift: true });
    expect(document.activeElement).toBe(item("Bold"));
    expect(tabStops()).toEqual(["Bold"]);
  });

  it("uses the up and down arrows when vertical", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { orientation: "vertical" } });
    item("Undo").focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(item("Undo"));
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(item("Redo"));
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(item("Undo"));
  });

  it("swaps left and right when right-to-left", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { dir: "rtl" } });
    item("Undo").focus();

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(item("Redo"));
  });

  it("runs a button's click handler", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(Demo, { props: { onUndo } });

    await user.click(item("Undo"));
    item("Undo").focus();
    await user.keyboard("{Enter}");
    expect(onUndo).toHaveBeenCalledTimes(2);
  });

  it("keeps a disabled item reachable by keyboard but does nothing with it", async () => {
    const user = userEvent.setup();
    const onRedo = vi.fn();
    render(Demo, { props: { onRedo } });
    const redo = item("Redo") as HTMLButtonElement;
    expect(redo.disabled).toBe(false);
    expect(redo.getAttribute("aria-disabled")).toBe("true");
    expect(redo.hasAttribute("data-disabled")).toBe(true);

    item("Undo").focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(redo);
    await user.keyboard("{Enter}{ }");
    redo.click();
    expect(onRedo).not.toHaveBeenCalled();
  });

  it("presses a toggle, announces it and reports the change", async () => {
    const user = userEvent.setup();
    const onBoldChange = vi.fn();
    render(Demo, { props: { onBoldChange } });
    expect(item("Bold").getAttribute("aria-pressed")).toBe("false");
    expect(item("Italic").getAttribute("aria-pressed")).toBe("true");
    expect(item("Italic").getAttribute("data-state")).toBe("on");

    await user.click(item("Bold"));
    expect(onBoldChange).toHaveBeenCalledWith(true);
    expect(item("Bold").getAttribute("aria-pressed")).toBe("true");
    expect(item("Bold").getAttribute("data-state")).toBe("on");

    await user.keyboard("{ }");
    expect(item("Bold").getAttribute("aria-pressed")).toBe("false");
  });

  it("binds a toggle with v-model:pressed", async () => {
    const user = userEvent.setup();
    const bold = ref(false);
    render(() => [
      h(Toolbar.Root, { "aria-label": "Text" }, () =>
        h(
          Toolbar.Toggle,
          {
            label: "Bold",
            pressed: bold.value,
            "onUpdate:pressed": (pressed: boolean) => (bold.value = pressed),
          },
          () => "B",
        ),
      ),
      h("output", null, bold.value ? "bold" : "regular"),
    ]);

    await user.click(item("Bold"));
    expect(bold.value).toBe(true);
    await waitFor(() => expect(item("Bold").getAttribute("aria-pressed")).toBe("true"));
  });

  it("shows the label and shortcut in a tooltip on keyboard focus", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.click(screen.getByText("Before"));
    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Undo (⌘Z)");
    expect(item("Undo").getAttribute("aria-describedby")).toBe(tooltip.id);
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("tooltip").textContent).toBe("Redo"));
  });

  it("marks groups and separators", () => {
    render(Demo);
    expect(screen.getByRole("group", { name: "Text style" }).getAttribute("data-part")).toBe(
      "group",
    );
    const separator = screen.getByRole("separator");
    expect(separator.getAttribute("aria-orientation")).toBe("vertical");
    expect(separator.getAttribute("tabindex")).toBeNull();
  });

  it("holds a menu trigger that opens its menu and still moves with the arrows", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(MenuDemo, { props: { onSelect } });
    const more = item("More");
    expect(more.getAttribute("data-scope")).toBe("toolbar");
    expect(more.getAttribute("aria-haspopup")).toBe("menu");

    item("Undo").focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(more);
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.click(screen.getByRole("menuitem", { name: "Export" }));
    expect(onSelect).toHaveBeenCalledWith({ value: "export" });
  });

  it("moves past menu buttons with Up and Down in a vertical toolbar", async () => {
    const user = userEvent.setup();
    render(MenusDemo, { props: { orientation: "vertical" } });
    item("First").focus();

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(item("Middle"));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(document.activeElement).toBe(item("Last"));
    await user.keyboard("{ArrowUp}{ArrowUp}");
    expect(document.activeElement).toBe(item("Middle"));
    expect(screen.queryByRole("menu")).toBeNull();

    await user.keyboard("{ArrowUp}{Enter}");
    await screen.findByRole("menu");
    expect(item("Shapes").getAttribute("aria-expanded")).toBe("true");
  });

  it("opens a menu button with ArrowDown in a horizontal toolbar", async () => {
    const user = userEvent.setup();
    render(MenusDemo);
    item("First").focus();

    await user.keyboard("{ArrowRight}{ArrowDown}");
    await screen.findByRole("menu");
    expect(item("Shapes").getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps a disabled menu trigger closed", async () => {
    const user = userEvent.setup();
    render(MenuDemo, { props: { disabled: true } });
    item("More").focus();
    await user.keyboard("{Enter}{ArrowDown}");
    await user.click(item("More"));
    expect(item("More").getAttribute("aria-expanded")).not.toBe("true");
  });

  it("refuses an item outside a Toolbar.Root", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => render(() => h(Toolbar.Button, null, () => "Undo"))).toThrow(/Toolbar.Root/);
  });
});
