// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Menu, Toolbar, type ToolbarOrientation, type ToolbarSize } from "../src/index.js";

afterEach(cleanup);

function Demo(props: {
  orientation?: ToolbarOrientation;
  size?: ToolbarSize;
  dir?: "ltr" | "rtl";
  onUndo?: () => void;
  onRedo?: () => void;
  onBoldChange?: (pressed: boolean) => void;
}) {
  return (
    <>
      <button type="button">Before</button>
      <Toolbar.Root
        aria-label="Canvas tools"
        orientation={props.orientation}
        size={props.size}
        dir={props.dir}
        className="tools"
      >
        <Toolbar.Button label="Undo" shortcut="⌘Z" onClick={props.onUndo}>
          <svg aria-hidden="true" />
        </Toolbar.Button>
        <Toolbar.Button label="Redo" disabled onClick={props.onRedo}>
          <svg aria-hidden="true" />
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Group aria-label="Text style">
          <Toolbar.Toggle label="Bold" onPressedChange={props.onBoldChange}>
            <svg aria-hidden="true" />
          </Toolbar.Toggle>
          <Toolbar.Toggle label="Italic" defaultPressed>
            <svg aria-hidden="true" />
          </Toolbar.Toggle>
        </Toolbar.Group>
        <span>100%</span>
        <Toolbar.Button>Share</Toolbar.Button>
      </Toolbar.Root>
      <button type="button">After</button>
    </>
  );
}

/** A toolbar with two menu buttons and a plain item between them. */
function MenusDemo(props: { orientation?: ToolbarOrientation }) {
  const menu = (label: string) => (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Toolbar.Button label={label}>⋯</Toolbar.Button>
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          <Menu.Item value="one">One</Menu.Item>
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
  return (
    <Toolbar.Root aria-label="Canvas tools" orientation={props.orientation}>
      <Toolbar.Button>First</Toolbar.Button>
      {menu("Shapes")}
      <Toolbar.Button>Middle</Toolbar.Button>
      {menu("Export")}
      <Toolbar.Button>Last</Toolbar.Button>
    </Toolbar.Root>
  );
}

const root = () => screen.getByRole("toolbar");
const item = (name: string) => screen.getByRole("button", { name });
const tabStops = () =>
  Array.from(root().querySelectorAll<HTMLElement>("[data-ownedby]"))
    .filter((el) => el.tabIndex === 0)
    .map((el) => el.getAttribute("aria-label") ?? el.textContent);

describe("Toolbar (React)", () => {
  it("is a named toolbar, horizontal by default, with the recipe's size", () => {
    render(<Demo />);
    expect(root().getAttribute("aria-label")).toBe("Canvas tools");
    expect(root().getAttribute("aria-orientation")).toBe("horizontal");
    expect(root().getAttribute("data-size")).toBe("md");
    expect(root().className).toBe("tools");

    cleanup();
    render(<Demo orientation="vertical" size="sm" />);
    expect(root().getAttribute("aria-orientation")).toBe("vertical");
    expect(root().getAttribute("data-size")).toBe("sm");
  });

  it("keeps an id given to the root", () => {
    render(
      <Toolbar.Root id="canvas-tools" aria-label="Canvas tools">
        <Toolbar.Button>Undo</Toolbar.Button>
      </Toolbar.Root>,
    );
    expect(root().id).toBe("canvas-tools");
    expect(item("Undo").getAttribute("data-ownedby")).toBe("canvas-tools");
  });

  it("names every icon-only item by its label", () => {
    render(<Demo />);
    for (const name of ["Undo", "Redo", "Bold", "Italic"]) {
      expect(item(name).getAttribute("aria-label")).toBe(name);
    }
    expect(item("Share").hasAttribute("aria-label")).toBe(false);
  });

  it("is one Tab stop: Tab enters on the first item and leaves on the next", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await waitFor(() => expect(tabStops()).toEqual(["Undo"]));

    await user.click(screen.getByText("Before"));
    await user.tab();
    expect(document.activeElement).toBe(item("Undo"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText("After"));
  });

  it("moves between items with the arrow keys, Home and End, and wraps", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    item("Undo").focus();

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(item("Redo"));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(item("Bold"));
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
    render(<Demo />);
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
    render(<Demo orientation="vertical" />);
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
    render(<Demo dir="rtl" />);
    item("Undo").focus();

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(item("Redo"));
  });

  it("runs a button's onClick", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(<Demo onUndo={onUndo} />);

    await user.click(item("Undo"));
    item("Undo").focus();
    await user.keyboard("{Enter}");
    expect(onUndo).toHaveBeenCalledTimes(2);
  });

  it("keeps a disabled item reachable by keyboard but does nothing with it", async () => {
    const user = userEvent.setup();
    const onRedo = vi.fn();
    render(<Demo onRedo={onRedo} />);
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
    render(<Demo onBoldChange={onBoldChange} />);
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

  it("follows a controlled toggle", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [bold, setBold] = useState(false);
      return (
        <>
          <Toolbar.Root aria-label="Text">
            <Toolbar.Toggle label="Bold" pressed={bold} onPressedChange={setBold}>
              B
            </Toolbar.Toggle>
          </Toolbar.Root>
          <output>{bold ? "bold" : "regular"}</output>
        </>
      );
    }
    render(<Controlled />);

    await user.click(item("Bold"));
    expect(screen.getByText("bold")).toBeTruthy();
    expect(item("Bold").getAttribute("aria-pressed")).toBe("true");
  });

  it("shows the label and shortcut in a tooltip on keyboard focus", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByText("Before"));
    await user.tab();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip.textContent).toBe("Undo (⌘Z)");
    expect(item("Undo").getAttribute("aria-describedby")).toBe(tooltip.id);
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("tooltip").textContent).toBe("Redo"));
  });

  it("marks groups and separators", () => {
    render(<Demo />);
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
    render(
      <Toolbar.Root aria-label="Canvas tools">
        <Toolbar.Button label="Undo">U</Toolbar.Button>
        <Menu.Root onSelect={onSelect}>
          <Menu.Trigger asChild>
            <Toolbar.Button label="More">⋯</Toolbar.Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="export">Export</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Toolbar.Root>,
    );
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
    render(<MenusDemo orientation="vertical" />);
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
    render(<MenusDemo />);
    item("First").focus();

    await user.keyboard("{ArrowRight}{ArrowDown}");
    await screen.findByRole("menu");
    expect(item("Shapes").getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps a disabled menu trigger closed", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar.Root aria-label="Canvas tools">
        <Menu.Root>
          <Menu.Trigger asChild>
            <Toolbar.Button label="More" disabled>
              ⋯
            </Toolbar.Button>
          </Menu.Trigger>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="export">Export</Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </Toolbar.Root>,
    );
    item("More").focus();
    await user.keyboard("{Enter}{ArrowDown}");
    await user.click(item("More"));
    expect(item("More").getAttribute("aria-expanded")).not.toBe("true");
  });

  it("refuses an item outside a Toolbar.Root", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Toolbar.Button>Undo</Toolbar.Button>)).toThrow(/Toolbar.Root/);
  });
});
