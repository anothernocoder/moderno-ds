// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  SortableList,
  type SortableListReorderDetails,
  type SortableListSize,
} from "../src/index.js";
import {
  dispatchPointer,
  liveRegionText,
  stubListLayout,
} from "../../core/test/sortable-list-dom.ts";

afterEach(cleanup);

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
  const [items, setItems] = useState(SLIDES.map((slide) => slide.value));
  return (
    <SortableList.Root
      items={items}
      onReorder={(details) => {
        setItems(details.items);
        props.onReorder?.(details);
      }}
      disabled={props.disabled}
      size={props.size}
      aria-label="Slides"
      className="slides"
    >
      {items.map((value) => (
        <SortableList.Item
          key={value}
          value={value}
          label={labelOf(value)}
          disabled={value === props.disabledItem}
        >
          {props.handles && <SortableList.ItemHandle />}
          <SortableList.ItemTrigger onClick={() => props.onSelect?.(value)}>
            {labelOf(value)}
          </SortableList.ItemTrigger>
        </SortableList.Item>
      ))}
    </SortableList.Root>
  );
}

const order = () =>
  [...document.querySelectorAll('[data-part="item"]')].map((item) =>
    item.getAttribute("data-value"),
  );
const trigger = (name: string) => screen.getByRole("button", { name });

describe("SortableList (React)", () => {
  it("renders a list of items with the recipe on the root and native props forwarded", () => {
    render(<Slides size="lg" />);
    const list = screen.getByRole("list", { name: "Slides" });
    expect(list.tagName).toBe("UL");
    expect(list.getAttribute("data-scope")).toBe("sortable-list");
    expect(list.getAttribute("data-size")).toBe("lg");
    expect(list.classList.contains("slides")).toBe(true);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("makes the list one Tab stop and moves focus with Up, Down, Home and End", async () => {
    const user = userEvent.setup();
    render(<Slides />);
    await user.tab();
    expect(document.activeElement).toBe(trigger("Title"));
    expect(trigger("Logo").getAttribute("tabindex")).toBe("-1");

    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(trigger("Logo")));
    expect(trigger("Logo").getAttribute("tabindex")).toBe("0");
    expect(trigger("Title").getAttribute("tabindex")).toBe("-1");

    await user.keyboard("{End}");
    await waitFor(() => expect(document.activeElement).toBe(trigger("Fonts")));
    await user.keyboard("{Home}");
    await waitFor(() => expect(document.activeElement).toBe(trigger("Title")));
  });

  it("reorders with the keyboard: Space picks up, arrows move, Space drops and focus stays", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(<Slides onReorder={onReorder} />);
    stubListLayout();
    act(() => trigger("Title").focus());

    await user.keyboard(" ");
    expect(screen.getByRole("list").getAttribute("data-dragging")).toBe("keyboard");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    await user.keyboard(" ");

    expect(onReorder).toHaveBeenCalledWith({
      items: ["logo", "colors", "title", "fonts"],
      value: "title",
      from: 0,
      to: 2,
    });
    expect(order()).toEqual(["logo", "colors", "title", "fonts"]);
    await waitFor(() => expect(document.activeElement).toBe(trigger("Title")));
    await waitFor(() => expect(liveRegionText()).toBe("Dropped."));
  });

  it("puts the item back on Escape", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(<Slides onReorder={onReorder} />);
    stubListLayout();
    act(() => trigger("Logo").focus());
    await user.keyboard(" {ArrowDown}{Escape}");
    expect(onReorder).not.toHaveBeenCalled();
    expect(order()).toEqual(["title", "logo", "colors", "fonts"]);
    expect(screen.getByRole("list").hasAttribute("data-dragging")).toBe(false);
  });

  it("names each handle after its item and picks up with Space on it", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Slides handles onSelect={onSelect} />);
    stubListLayout();
    expect(screen.getByRole("button", { name: "Reorder Logo" }).tagName).toBe("BUTTON");

    // Space on the name button stays a click when the item has a handle.
    act(() => trigger("Logo").focus());
    await user.keyboard(" ");
    expect(onSelect).toHaveBeenCalledWith("logo");
    expect(screen.getByRole("list").hasAttribute("data-dragging")).toBe(false);

    await user.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reorder Logo" })),
    );
    await user.keyboard(" {ArrowUp} ");
    expect(order()).toEqual(["logo", "title", "colors", "fonts"]);
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Reorder Logo" })),
    );
  });

  it("drags with a pointer past the threshold, and a click on the item stays a click", async () => {
    const onReorder = vi.fn();
    const onSelect = vi.fn();
    render(<Slides onReorder={onReorder} onSelect={onSelect} />);
    stubListLayout();

    const title = trigger("Title");
    const pointer = async (...args: Parameters<typeof dispatchPointer>) => {
      await act(async () => dispatchPointer(...args));
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
    expect(onReorder).toHaveBeenCalled();
    expect(onReorder.mock.calls[0]![0]).toMatchObject({ value: "title", from: 0, to: 1 });
    expect(order()).toEqual(["logo", "title", "colors", "fonts"]);
  });

  it("moves nothing when the list is disabled, while the buttons still work", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Slides disabled handles onSelect={onSelect} />);
    expect(screen.getByRole("list").hasAttribute("data-disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Reorder Title" }).hasAttribute("disabled")).toBe(
      true,
    );
    await user.click(trigger("Title"));
    expect(onSelect).toHaveBeenCalledWith("title");
  });

  it("does not move a disabled item", async () => {
    const user = userEvent.setup();
    render(<Slides disabledItem="logo" />);
    stubListLayout();
    act(() => trigger("Logo").focus());
    await user.keyboard(" {ArrowDown} ");
    expect(order()).toEqual(["title", "logo", "colors", "fonts"]);
    expect(trigger("Logo").closest("li")!.hasAttribute("data-disabled")).toBe(true);
  });

  it("holds its own order from defaultItems and hands it to a children function", async () => {
    const user = userEvent.setup();
    render(
      <SortableList.Root defaultItems={["a", "b"]} aria-label="Letters">
        {(items) =>
          items.map((value) => (
            <SortableList.Item key={value} value={value}>
              <SortableList.ItemTrigger>{value.toUpperCase()}</SortableList.ItemTrigger>
            </SortableList.Item>
          ))
        }
      </SortableList.Root>,
    );
    stubListLayout();
    act(() => trigger("A").focus());
    await user.keyboard(" {ArrowDown} ");
    expect(order()).toEqual(["b", "a"]);
  });

  it("throws a clear error when a part is used outside the root", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<SortableList.Item value="a" />)).toThrow(
      "SortableList.Item must be inside SortableList.Root.",
    );
    vi.restoreAllMocks();
  });
});

beforeEach(() => {
  document.body.replaceChildren();
});
