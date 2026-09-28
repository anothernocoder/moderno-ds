// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ComponentType } from "react";

/**
 * The React layers panel block, controlled: it renders `layers` and
 * `selectedId` as given and reports every change. The docs e2e spec drives
 * the Svelte copy in a real browser (drag, hover, layout); this drives the
 * React one in jsdom.
 *
 * Imported by path, as registry-timeline.test.tsx does: `registry/` has no
 * `node_modules`, so only Vitest's aliases (not this package's tsc) resolve
 * the block's own imports.
 */

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  thumbnail?: string;
  icon?: string;
}

interface LayersPanelProps {
  layers?: Layer[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onReorder?: (ids: string[]) => void;
  onChange?: (id: string, change: Partial<Layer>) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

const blockPath = "../../../registry/blocks/layers-panel/react/layers-panel.tsx";
const { LayersPanel } = (await import(/* @vite-ignore */ blockPath)) as {
  LayersPanel: ComponentType<LayersPanelProps>;
};

afterEach(cleanup);

const layers: Layer[] = [
  { id: "title", name: "Title", visible: true, locked: false, icon: "text" },
  { id: "logo", name: "Logo", visible: false, locked: true, icon: "image" },
  { id: "background", name: "Background", visible: true, locked: false },
];

function mount(props: LayersPanelProps = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onReorder: vi.fn(),
    onChange: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onAdd: vi.fn(),
  };
  render(<LayersPanel layers={layers} {...handlers} {...props} />);
  return handlers;
}

/** The panel as an app holds it: every reported change is written back. */
function Stateful({ initial, selected = null }: { initial: Layer[]; selected?: string | null }) {
  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(selected);
  return (
    <LayersPanel
      layers={items}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onReorder={(ids) => setItems(ids.map((id) => items.find((layer) => layer.id === id)!))}
      onChange={(id, change) =>
        setItems(items.map((layer) => (layer.id === id ? { ...layer, ...change } : layer)))
      }
      onDelete={(id) => setItems(items.filter((layer) => layer.id !== id))}
      onAdd={() => {
        setItems([{ id: "new", name: "Layer 1", visible: true, locked: false }, ...items]);
        setSelectedId("new");
      }}
    />
  );
}

const list = () => screen.getByRole("list", { name: "Layers" });
const nameButton = (name: RegExp | string) => within(list()).getByRole("button", { name });
const tabStops = () =>
  [...list().querySelectorAll<HTMLElement>("button")].filter((button) => button.tabIndex === 0);

describe("LayersPanel block (React)", () => {
  it("renders one row per layer: its name button with its state, two toggles and a menu", () => {
    mount({ selectedId: "logo" });
    const rows = within(list()).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(nameButton("Logo, hidden, locked").getAttribute("aria-current")).toBe("true");
    expect(nameButton("Title").hasAttribute("aria-current")).toBe(false);

    const show = screen.getByRole("button", { name: "Show Logo" });
    expect(show.getAttribute("aria-pressed")).toBe("true");
    const unlock = screen.getByRole("button", { name: "Unlock Logo" });
    expect(unlock.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "Hide Title" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "Lock Title" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "Actions for Logo" })).toBeTruthy();
  });

  it("puts the one Tab stop on the selected row, or on the first row", () => {
    mount({ selectedId: "logo" });
    expect(tabStops().map((button) => button.getAttribute("aria-label"))).toEqual([
      "Logo, hidden, locked",
      "Show Logo",
      "Unlock Logo",
      "Actions for Logo",
    ]);
    cleanup();
    mount();
    expect(tabStops()[0]!.getAttribute("aria-label")).toBe("Title");
  });

  it("moves between rows with Up/Down/Home/End, and Tab reaches that row's controls", async () => {
    const user = userEvent.setup();
    mount({ selectedId: "logo" });
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Add layer" }));
    await user.tab();
    expect(document.activeElement).toBe(nameButton(/^Logo/));
    // SortableList moves the focus on the next frame.
    const focusMovesTo = (name: string) =>
      waitFor(() => expect(document.activeElement).toBe(nameButton(name)));
    await user.keyboard("{ArrowDown}");
    await focusMovesTo("Background");
    await user.keyboard("{Home}");
    await focusMovesTo("Title");
    await user.keyboard("{End}");
    await focusMovesTo("Background");
    await user.keyboard("{ArrowUp}");
    await focusMovesTo("Logo, hidden, locked");
    await user.keyboard("{ArrowUp}");
    await focusMovesTo("Title");

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Hide Title" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Lock Title" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions for Title" }));
    await user.tab();
    expect(document.activeElement).toBe(document.body);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions for Logo" }));
  });

  it("selects on click and Enter, and reports the toggles", async () => {
    const user = userEvent.setup();
    const handlers = mount({ selectedId: "logo" });
    await user.click(nameButton("Title"));
    expect(handlers.onSelect).toHaveBeenLastCalledWith("title");
    act(() => nameButton("Background").focus());
    await user.keyboard("{Enter}");
    expect(handlers.onSelect).toHaveBeenLastCalledWith("background");

    handlers.onSelect.mockClear();
    await user.click(screen.getByRole("button", { name: "Hide Title" }));
    expect(handlers.onChange).toHaveBeenLastCalledWith("title", { visible: false });
    await user.click(screen.getByRole("button", { name: "Show Logo" }));
    expect(handlers.onChange).toHaveBeenLastCalledWith("logo", { visible: true });
    await user.click(screen.getByRole("button", { name: "Lock Title" }));
    expect(handlers.onChange).toHaveBeenLastCalledWith("title", { locked: true });
    await user.click(screen.getByRole("button", { name: "Unlock Logo" }));
    expect(handlers.onChange).toHaveBeenLastCalledWith("logo", { locked: false });
    expect(handlers.onSelect).not.toHaveBeenCalled();
  });

  it("renames inline: F2 or a double click, Enter saves, Escape cancels, focus comes back", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    act(() => nameButton("Title").focus());
    await user.keyboard("{F2}");
    const input = await screen.findByRole("textbox", { name: "Layer name" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    await user.keyboard("Headline{Enter}");
    expect(handlers.onChange).toHaveBeenLastCalledWith("title", { name: "Headline" });
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(nameButton("Title")));

    handlers.onChange.mockClear();
    await user.dblClick(nameButton("Background"));
    await screen.findByRole("textbox", { name: "Layer name" });
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "Layer name" })),
    );
    await user.keyboard("Sky{Escape}");
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    expect(handlers.onChange).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(nameButton("Background")));
  });

  it("duplicates, renames and deletes from the row's menu", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    await user.click(screen.getByRole("button", { name: "Actions for Title" }));
    await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
    expect(handlers.onDuplicate).toHaveBeenLastCalledWith("title");

    await user.click(screen.getByRole("button", { name: "Actions for Logo" }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));
    expect(handlers.onDelete).toHaveBeenLastCalledWith("logo");

    await user.click(screen.getByRole("button", { name: "Actions for Background" }));
    await user.click(await screen.findByRole("menuitem", { name: "Rename" }));
    const input = await screen.findByRole("textbox", { name: "Layer name" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    await user.keyboard("Sky{Enter}");
    expect(handlers.onChange).toHaveBeenLastCalledWith("background", { name: "Sky" });
    expect(handlers.onSelect).not.toHaveBeenCalled();
  });

  it("asks to delete on Delete, and moves the focus to the next row once the app removes it", async () => {
    const user = userEvent.setup();
    render(<Stateful initial={layers} />);
    act(() => nameButton(/^Logo/).focus());
    await user.keyboard("{Delete}");
    await waitFor(() => expect(document.activeElement).toBe(nameButton("Background")));
    expect(within(list()).getAllByRole("listitem")).toHaveLength(2);
  });

  it("reorders with Space and the arrows (SortableList), reporting every id", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    act(() => nameButton("Title").focus());
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");
    expect(handlers.onReorder).toHaveBeenLastCalledWith(["logo", "title", "background"]);
  });

  it("shows an empty state whose Add layer reports onAdd and hands the focus to the new row", async () => {
    const user = userEvent.setup();
    render(<Stateful initial={[]} />);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText("No layers yet")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Add layer" }));
    await waitFor(() => expect(document.activeElement).toBe(nameButton("Layer 1")));
    expect(nameButton("Layer 1").getAttribute("aria-current")).toBe("true");
  });
});
