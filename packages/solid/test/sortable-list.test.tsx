import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal, For, Show, type Accessor } from "solid-js";
import {
  SortableList,
  type SortableListReorderDetails,
  type SortableListSize,
} from "../src/index.jsx";
import {
  dispatchPointer,
  liveRegionText,
  stubListLayout,
} from "../../core/test/sortable-list-dom.ts";

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const SLIDES = [
  { value: "title", label: "Title" },
  { value: "logo", label: "Logo" },
  { value: "colors", label: "Colors" },
  { value: "fonts", label: "Fonts" },
];
const labelOf = (value: string) => SLIDES.find((slide) => slide.value === value)!.label;

function Slides(props: {
  handles?: boolean;
  disabled?: boolean;
  disabledItem?: string;
  size?: SortableListSize;
  onReorder?: (details: SortableListReorderDetails) => void;
  onSelect?: (value: string) => void;
}) {
  const [items, setItems] = createSignal(SLIDES.map((slide) => slide.value));
  return (
    <SortableList.Root
      items={items()}
      onReorder={(details) => {
        setItems(details.items);
        props.onReorder?.(details);
      }}
      disabled={props.disabled}
      size={props.size}
      aria-label="Slides"
      class="slides"
    >
      <For each={items()}>
        {(value) => (
          <SortableList.Item
            value={value}
            label={labelOf(value)}
            disabled={value === props.disabledItem}
          >
            <Show when={props.handles}>
              <SortableList.ItemHandle />
            </Show>
            <SortableList.ItemTrigger onClick={() => props.onSelect?.(value)}>
              {labelOf(value)}
            </SortableList.ItemTrigger>
          </SortableList.Item>
        )}
      </For>
    </SortableList.Root>
  );
}

const order = () =>
  [...document.querySelectorAll('[data-part="item"]')].map((item) =>
    item.getAttribute("data-value"),
  );
const trigger = (name: string) => screen.getByRole("button", { name });
const list = () => screen.getByRole("list");

describe("SortableList (Solid)", () => {
  it("renders a list of items with the recipe on the root and native props forwarded", () => {
    render(() => <Slides size="lg" />);
    const root = screen.getByRole("list", { name: "Slides" });
    expect(root.tagName).toBe("UL");
    expect(root.getAttribute("data-scope")).toBe("sortable-list");
    expect(root.getAttribute("data-size")).toBe("lg");
    expect(root.classList.contains("slides")).toBe(true);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("makes the list one Tab stop and moves focus with Up, Down, Home and End", async () => {
    const user = userEvent.setup();
    render(() => <Slides />);
    await user.tab();
    expect(document.activeElement).toBe(trigger("Title"));
    expect(trigger("Logo").getAttribute("tabindex")).toBe("-1");

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(trigger("Logo")));
    expect(trigger("Logo").getAttribute("tabindex")).toBe("0");

    await user.keyboard("{End}");
    await waitFor(() => expect(document.activeElement).toBe(trigger("Fonts")));
    await user.keyboard("{Home}");
    await waitFor(() => expect(document.activeElement).toBe(trigger("Title")));
  });

  it("reorders with the keyboard: Space picks up, arrows move, Space drops and focus stays", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(() => <Slides onReorder={onReorder} />);
    stubListLayout();
    trigger("Title").focus();

    await user.keyboard(" ");
    await waitFor(() => expect(list().getAttribute("data-dragging")).toBe("keyboard"));
    await user.keyboard("{ArrowDown}{ArrowDown}");
    await user.keyboard(" ");

    await waitFor(() =>
      expect(onReorder).toHaveBeenCalledWith({
        items: ["logo", "colors", "title", "fonts"],
        value: "title",
        from: 0,
        to: 2,
      }),
    );
    expect(order()).toEqual(["logo", "colors", "title", "fonts"]);
    await waitFor(() => expect(document.activeElement).toBe(trigger("Title")));
    await waitFor(() => expect(liveRegionText()).toBe("Dropped."));
  });

  it("puts the item back on Escape", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(() => <Slides onReorder={onReorder} />);
    stubListLayout();
    trigger("Logo").focus();
    await user.keyboard(" {ArrowDown}{Escape}");
    await waitFor(() => expect(list().hasAttribute("data-dragging")).toBe(false));
    expect(onReorder).not.toHaveBeenCalled();
    expect(order()).toEqual(["title", "logo", "colors", "fonts"]);
  });

  it("names each handle after its item and picks up with Space on it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(() => <Slides handles onSelect={onSelect} />);
    stubListLayout();
    const handle = () => screen.getByRole("button", { name: "Reorder Logo" });
    expect(handle().tagName).toBe("BUTTON");

    // Space on the name button stays a click when the item has a handle.
    trigger("Logo").focus();
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith("logo");
    expect(list().hasAttribute("data-dragging")).toBe(false);

    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(document.activeElement).toBe(handle()));
    await user.keyboard(" ");
    await waitFor(() => expect(list().getAttribute("data-dragging")).toBe("keyboard"));
    await user.keyboard("{ArrowUp} ");
    await waitFor(() => expect(order()).toEqual(["logo", "title", "colors", "fonts"]));
    await waitFor(() => expect(document.activeElement).toBe(handle()));
  });

  it("drags with a pointer past the threshold, and a click on the item stays a click", async () => {
    const onReorder = vi.fn();
    const onSelect = vi.fn();
    render(() => <Slides onReorder={onReorder} onSelect={onSelect} />);
    stubListLayout();
    const title = trigger("Title");
    const pointer = async (...args: Parameters<typeof dispatchPointer>) => {
      dispatchPointer(...args);
      await new Promise((resolve) => setTimeout(resolve, 0));
    };

    await pointer("pointerdown", title, { y: 16 });
    await pointer("pointermove", document, { y: 18 });
    await pointer("pointerup", document, { y: 18 });
    fireEvent.click(title);
    expect(onSelect).toHaveBeenCalledWith("title");
    expect(onReorder).not.toHaveBeenCalled();

    await pointer("pointerdown", title, { y: 16, pointerId: 2 });
    await pointer("pointermove", document, { y: 70, pointerId: 2 });
    expect(title.closest('[data-part="item"]')!.getAttribute("data-dragging")).toBe("pointer");
    await pointer("pointerup", document, { y: 70, pointerId: 2 });
    expect(onReorder.mock.calls[0]![0]).toMatchObject({ value: "title", from: 0, to: 1 });
    expect(order()).toEqual(["logo", "title", "colors", "fonts"]);
  });

  it("moves nothing when the list is disabled, while the buttons still work", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(() => <Slides disabled handles onSelect={onSelect} />);
    expect(list().hasAttribute("data-disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Reorder Title" }).hasAttribute("disabled")).toBe(
      true,
    );
    await user.click(trigger("Title"));
    expect(onSelect).toHaveBeenCalledWith("title");
  });

  it("does not move a disabled item", async () => {
    const user = userEvent.setup();
    render(() => <Slides disabledItem="logo" />);
    stubListLayout();
    trigger("Logo").focus();
    await user.keyboard(" {ArrowDown} ");
    expect(order()).toEqual(["title", "logo", "colors", "fonts"]);
    expect(trigger("Logo").closest("li")!.hasAttribute("data-disabled")).toBe(true);
  });

  it("holds its own order from defaultItems and hands it to a children function", async () => {
    const user = userEvent.setup();
    render(() => (
      <SortableList.Root defaultItems={["a", "b"]} aria-label="Letters">
        {(items: Accessor<string[]>) => (
          <For each={items()}>
            {(value) => (
              <SortableList.Item value={value}>
                <SortableList.ItemTrigger>{value.toUpperCase()}</SortableList.ItemTrigger>
              </SortableList.Item>
            )}
          </For>
        )}
      </SortableList.Root>
    ));
    stubListLayout();
    trigger("A").focus();
    await user.keyboard(" {ArrowDown} ");
    await waitFor(() => expect(order()).toEqual(["b", "a"]));
  });

  it("throws a clear error when a part is used outside the root", () => {
    expect(() => render(() => <SortableList.Item value="a" />)).toThrow(
      "SortableList.Item must be inside SortableList.Root.",
    );
  });
});
