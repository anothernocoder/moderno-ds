// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  Portal,
  createListCollection,
  type SelectValueChangeDetails,
} from "../src/index.js";

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
            {collection.items.map((item) => (
              <Select.Item key={item.value} item={item}>
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator>✓</Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  );
}

describe("Select", () => {
  it("applies the size recipe to the root part", () => {
    const { container } = render(<Demo />);
    const root = container.querySelector('[data-scope="select"][data-part="root"]');
    expect(root?.getAttribute("data-size")).toBe("sm");
  });

  it("shows the placeholder and opens the listbox on trigger", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    expect(screen.getByText("Pick one")).toBeTruthy();
    await user.click(screen.getByRole("combobox"));
    const list = await screen.findByRole("listbox");
    expect(list.getAttribute("data-part")).toBe("content");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("selects an option by click and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);
    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: /Vue/ }));

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["vue"] })),
    );
    // Popover closes and the trigger's value text now shows the chosen label.
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    expect(document.querySelector('[data-part="value-text"]')?.textContent).toBe("Vue");
  });

  it("opens and selects with the keyboard (arrow to open + highlight, enter to select)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);

    await user.tab(); // focus the trigger
    expect(document.activeElement).toBe(screen.getByRole("combobox"));

    // ArrowDown opens the popover and highlights the first option.
    await user.keyboard("{ArrowDown}");
    await screen.findByRole("listbox");
    const firstOption = screen.getByRole("option", { name: /React/ });
    await waitFor(() => expect(firstOption.hasAttribute("data-highlighted")).toBe(true));

    // Enter commits the highlighted option.
    // (jsdom can't advance zag's highlight across items — that needs layout
    // measurement it doesn't implement — so this exercises the open → highlight
    // → select path on the first item. Cross-item traversal is a browser-level
    // concern covered in a later phase.)
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["react"] })),
    );
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });
});
