// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import LayersPanel from "../../../registry/blocks/layers-panel/vue/LayersPanel.vue";

/**
 * The Vue layers panel block, controlled: it renders `layers` and
 * `selectedId` as given and emits every change. The docs e2e spec drives the
 * Svelte copy in a real browser (drag, hover, layout); this drives the Vue
 * one in jsdom.
 *
 * It lives in this `vue-ssr` project because only this project compiles
 * `<script setup>` SFCs (`@vitejs/plugin-vue`).
 */

afterEach(cleanup);

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  icon?: string;
}

const layers: Layer[] = [
  { id: "title", name: "Title", visible: true, locked: false, icon: "text" },
  { id: "logo", name: "Logo", visible: false, locked: true, icon: "image" },
  { id: "background", name: "Background", visible: true, locked: false },
];

function mount(props: Record<string, unknown> = {}) {
  const handlers = {
    onSelect: vi.fn(),
    onReorder: vi.fn(),
    onChange: vi.fn(),
    onDuplicate: vi.fn(),
    onDelete: vi.fn(),
    onAdd: vi.fn(),
  };
  render(LayersPanel, { props: { layers, ...handlers, ...props } });
  return handlers;
}

/** The panel as an app holds it: every emitted change is written back. */
function mountStateful(initial: Layer[]) {
  const App = defineComponent(() => {
    const items = ref(initial);
    const selectedId = ref<string | null>(null);
    return () =>
      h(LayersPanel, {
        layers: items.value,
        selectedId: selectedId.value,
        onSelect: (id: string) => (selectedId.value = id),
        onDelete: (id: string) => (items.value = items.value.filter((layer) => layer.id !== id)),
        onAdd: () => {
          items.value = [{ id: "new", name: "Layer 1", visible: true, locked: false }];
          selectedId.value = "new";
        },
      });
  });
  render(App);
}

const list = () => screen.getByRole("list", { name: "Layers" });
const nameButton = (name: RegExp | string) => within(list()).getByRole("button", { name });
const tabStops = () =>
  [...list().querySelectorAll<HTMLElement>("button")].filter((button) => button.tabIndex === 0);
// SortableList moves the focus on the next frame.
const focusMovesTo = (name: string) =>
  waitFor(() => expect(document.activeElement).toBe(nameButton(name)));

describe("LayersPanel block (Vue)", () => {
  it("renders one row per layer: its name button with its state, two toggles and a menu", () => {
    mount({ selectedId: "logo" });
    expect(within(list()).getAllByRole("listitem")).toHaveLength(3);
    expect(nameButton("Logo, hidden, locked").getAttribute("aria-current")).toBe("true");
    expect(nameButton("Title").hasAttribute("aria-current")).toBe(false);
    expect(screen.getByRole("button", { name: "Show Logo" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Unlock Logo" }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(screen.getByRole("button", { name: "Hide Title" }).dataset.scope).toBe("toggle");
    expect(screen.getByRole("button", { name: "Lock Title" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "Actions for Logo" })).toBeTruthy();
  });

  it("puts the one Tab stop on the selected row, with its toggles and menu", () => {
    mount({ selectedId: "logo" });
    expect(tabStops().map((button) => button.getAttribute("aria-label"))).toEqual([
      "Logo, hidden, locked",
      "Show Logo",
      "Unlock Logo",
      "Actions for Logo",
    ]);
  });

  it("moves between rows with the arrows, and Tab reaches that row's controls", async () => {
    const user = userEvent.setup();
    mount({ selectedId: "logo" });
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(nameButton(/^Logo/));
    await user.keyboard("{ArrowDown}");
    await focusMovesTo("Background");
    await user.keyboard("{Home}");
    await focusMovesTo("Title");
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Hide Title" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Lock Title" }));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Actions for Title" }));
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it("emits select on click and Enter, and the toggles' changes", async () => {
    const user = userEvent.setup();
    const handlers = mount({ selectedId: "logo" });
    await user.click(nameButton("Title"));
    expect(handlers.onSelect).toHaveBeenLastCalledWith("title");
    nameButton("Background").focus();
    await user.keyboard("{Enter}");
    expect(handlers.onSelect).toHaveBeenLastCalledWith("background");

    handlers.onSelect.mockClear();
    await user.click(screen.getByRole("button", { name: "Hide Title" }));
    expect(handlers.onChange).toHaveBeenLastCalledWith("title", { visible: false });
    await user.click(screen.getByRole("button", { name: "Unlock Logo" }));
    expect(handlers.onChange).toHaveBeenLastCalledWith("logo", { locked: false });
    expect(handlers.onSelect).not.toHaveBeenCalled();
  });

  it("renames inline: F2, Enter saves; a double click, Escape cancels; focus comes back", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    nameButton("Title").focus();
    await user.keyboard("{F2}");
    const input = await screen.findByRole("textbox", { name: "Layer name" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    await user.keyboard("Headline{Enter}");
    expect(handlers.onChange).toHaveBeenLastCalledWith("title", { name: "Headline" });
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    await focusMovesTo("Title");

    handlers.onChange.mockClear();
    await user.dblClick(nameButton("Background"));
    const second = await screen.findByRole("textbox", { name: "Layer name" });
    await waitFor(() => expect(document.activeElement).toBe(second));
    await user.keyboard("Sky{Escape}");
    await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
    expect(handlers.onChange).not.toHaveBeenCalled();
    await focusMovesTo("Background");
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
  });

  it("emits delete on Delete, and moves the focus to the next row once it is gone", async () => {
    const user = userEvent.setup();
    mountStateful(layers);
    nameButton(/^Logo/).focus();
    await user.keyboard("{Delete}");
    await focusMovesTo("Background");
  });

  it("reorders with Space and the arrows, emitting every id", async () => {
    const user = userEvent.setup();
    const handlers = mount();
    nameButton("Title").focus();
    await user.keyboard(" ");
    await user.keyboard("{ArrowDown}");
    await user.keyboard(" ");
    expect(handlers.onReorder).toHaveBeenLastCalledWith(["logo", "title", "background"]);
  });

  it("shows an empty state whose Add layer emits add and hands the focus to the new row", async () => {
    const user = userEvent.setup();
    mountStateful([]);
    expect(screen.queryByRole("list")).toBeNull();
    expect(screen.getByText("No layers yet")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Add layer" }));
    await focusMovesTo("Layer 1");
  });
});
