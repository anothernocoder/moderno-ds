import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { For } from "solid-js";
import {
  Select,
  Portal,
  createListCollection,
  type SelectValueChangeDetails,
} from "../src/index.jsx";

afterEach(cleanup);

const collection = createListCollection({
  items: [
    { label: "React", value: "react" },
    { label: "Vue", value: "vue" },
    { label: "Svelte", value: "svelte" },
  ],
});

function Demo(props: { onValueChange?: (d: SelectValueChangeDetails) => void }) {
  return (
    <Select.Root collection={collection} size="sm" onValueChange={props.onValueChange}>
      <Select.Label>Framework</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder="Pick one" />
          <Select.Indicator>▼</Select.Indicator>
        </Select.Trigger>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            <For each={collection.items}>
              {(item) => (
                <Select.Item item={item}>
                  <Select.ItemText>{item.label}</Select.ItemText>
                  <Select.ItemIndicator>✓</Select.ItemIndicator>
                </Select.Item>
              )}
            </For>
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}

describe("Select (Solid)", () => {
  it("applies the size recipe to the root part", () => {
    const { container } = render(() => <Demo />);
    const root = container.querySelector('[data-scope="select"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("sm");
  });

  it("shows the placeholder and opens the listbox on trigger", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
    expect(screen.getByText("Pick one")).toBeTruthy();
    await user.click(screen.getByRole("combobox"));
    const list = await screen.findByRole("listbox");
    expect(list.getAttribute("data-part")).toBe("content");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option by click and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(() => <Demo onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /Vue/ }));

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["vue"] })),
    );
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.querySelector('[data-part="value-text"]')?.textContent).toBe("Vue");
  });

  it("opens the listbox from the keyboard with focus on the trigger", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);

    const trigger = screen.getByRole("combobox");
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await user.keyboard("{Enter}");
    await screen.findByRole("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });
});
