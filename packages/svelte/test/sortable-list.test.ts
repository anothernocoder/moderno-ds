import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import Slides from "./fixtures/SortableListFixture.svelte";
import Letters from "./fixtures/SortableListDefaultFixture.svelte";
import {
  dispatchPointer,
  liveRegionText,
  stubListLayout,
} from "../../core/test/sortable-list-dom.ts";

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

const order = () =>
  [...document.querySelectorAll('[data-part="item"]')].map((item) =>
    item.getAttribute("data-value"),
  );
const trigger = (name: string) => screen.getByRole("button", { name });
const list = () => screen.getByRole("list");

describe("SortableList (Svelte)", () => {
  it("renders a list of items with the recipe on the root and native attributes forwarded", () => {
    render(Slides, { props: { size: "lg" as const } });
    const root = screen.getByRole("list", { name: "Slides" });
    expect(root.tagName).toBe("UL");
    expect(root.getAttribute("data-scope")).toBe("sortable-list");
    expect(root.getAttribute("data-size")).toBe("lg");
    expect(root.classList.contains("slides")).toBe(true);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("makes the list one Tab stop and moves focus with Up, Down, Home and End", async () => {
    const user = userEvent.setup();
    render(Slides);
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
    render(Slides, { props: { onReorder } });
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
    await waitFor(() => expect(order()).toEqual(["logo", "colors", "title", "fonts"]));
    await waitFor(() => expect(document.activeElement).toBe(trigger("Title")));
    await waitFor(() => expect(liveRegionText()).toBe("Dropped."));
  });

  it("puts the item back on Escape", async () => {
    const user = userEvent.setup();
    const onReorder = vi.fn();
    render(Slides, { props: { onReorder } });
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
    render(Slides, { props: { handles: true, onSelect } });
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
    render(Slides, { props: { onReorder, onSelect } });
    stubListLayout();
    const title = trigger("Title");
    const pointer = async (...args: Parameters<typeof dispatchPointer>) => {
      dispatchPointer(...args);
      await new Promise((resolve) => setTimeout(resolve, 0));
      await tick();
    };

    await pointer("pointerdown", title, { y: 16 });
    await pointer("pointermove", document, { y: 18 });
    await pointer("pointerup", document, { y: 18 });
    await fireEvent.click(title);
    expect(onSelect).toHaveBeenCalledWith("title");
    expect(onReorder).not.toHaveBeenCalled();

    await pointer("pointerdown", title, { y: 16, pointerId: 2 });
    await pointer("pointermove", document, { y: 70, pointerId: 2 });
    expect(title.closest('[data-part="item"]')!.getAttribute("data-dragging")).toBe("pointer");
    await pointer("pointerup", document, { y: 70, pointerId: 2 });
    expect(onReorder.mock.calls[0]![0]).toMatchObject({ value: "title", from: 0, to: 1 });
    await waitFor(() => expect(order()).toEqual(["logo", "title", "colors", "fonts"]));
  });

  it("moves nothing when the list is disabled, while the buttons still work", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(Slides, { props: { disabled: true, handles: true, onSelect } });
    expect(list().hasAttribute("data-disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Reorder Title" }).hasAttribute("disabled")).toBe(
      true,
    );
    await user.click(trigger("Title"));
    expect(onSelect).toHaveBeenCalledWith("title");
  });

  it("does not move a disabled item", async () => {
    const user = userEvent.setup();
    render(Slides, { props: { disabledItem: "logo" } });
    stubListLayout();
    trigger("Logo").focus();
    await user.keyboard(" {ArrowDown} ");
    await tick();
    expect(order()).toEqual(["title", "logo", "colors", "fonts"]);
    expect(trigger("Logo").closest("li")!.hasAttribute("data-disabled")).toBe(true);
  });

  it("holds its own order from defaultItems and hands it to the children snippet", async () => {
    const user = userEvent.setup();
    render(Letters);
    stubListLayout();
    trigger("A").focus();
    await user.keyboard(" {ArrowDown} ");
    await waitFor(() => expect(order()).toEqual(["b", "a"]));
  });
});
