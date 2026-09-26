// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ToggleGroup,
  type ToggleGroupSize,
  type ToggleGroupValueChangeDetails,
  type ToggleGroupVariant,
} from "../src/index.js";

afterEach(cleanup);

describe("ToggleGroup surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { ToggleGroup: ArkToggleGroup } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkToggleGroup)) {
      if (part === "Root") continue; // wrapped below
      expect(
        ToggleGroup[part as keyof typeof ToggleGroup],
        `ToggleGroup.${part} missing`,
      ).toBeDefined();
    }
  });
});

const ITEMS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right", disabled: true },
];

function Demo(props: {
  variant?: ToggleGroupVariant;
  size?: ToggleGroupSize;
  orientation?: "horizontal" | "vertical";
  multiple?: boolean;
  disabled?: boolean;
  defaultValue?: string[];
  onValueChange?: (details: ToggleGroupValueChangeDetails) => void;
}) {
  return (
    <ToggleGroup.Root
      variant={props.variant}
      size={props.size}
      orientation={props.orientation}
      multiple={props.multiple}
      disabled={props.disabled}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      aria-label="Text alignment"
      className="alignment"
    >
      {ITEMS.map((item) => (
        <ToggleGroup.Item key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="toggle-group"][data-part="${name}"]`)!;
const items = () =>
  Array.from(
    document.querySelectorAll<HTMLButtonElement>(`[data-scope="toggle-group"][data-part="item"]`),
  );
const states = () => items().map((item) => item.getAttribute("data-state"));

describe("ToggleGroup", () => {
  it("applies the recipe to the root part, defaulting to ghost md", () => {
    render(<Demo variant="outline" size="sm" />);
    expect(part("root").getAttribute("data-variant")).toBe("outline");
    expect(part("root").getAttribute("data-size")).toBe("sm");
    expect(items()).toHaveLength(3);

    cleanup();
    render(<Demo />);
    expect(part("root").getAttribute("data-variant")).toBe("ghost");
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(<Demo />);
    expect(part("root").className).toBe("alignment");
  });

  it("lays out horizontally by default and vertically on request", () => {
    render(<Demo />);
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");

    cleanup();
    render(<Demo orientation="vertical" />);
    expect(part("root").getAttribute("data-orientation")).toBe("vertical");
    expect(items()[0]!.getAttribute("data-orientation")).toBe("vertical");
  });

  it("is a radio group of native buttons when one item can be on", () => {
    render(<Demo defaultValue={["left"]} />);
    expect(screen.getByRole("radiogroup", { name: "Text alignment" })).toBe(part("root"));
    const left = screen.getByRole("radio", { name: "Left" }) as HTMLButtonElement;
    expect(left.tagName).toBe("BUTTON");
    expect(left.type).toBe("button");
    expect(left.getAttribute("aria-checked")).toBe("true");
    expect(states()).toEqual(["on", "off", "off"]);
  });

  it("presses one item at a time and reports the new value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo defaultValue={["left"]} onValueChange={onValueChange} />);

    await user.click(screen.getByText("Center"));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["center"] }));
    expect(states()).toEqual(["off", "on", "off"]);
  });

  it("keeps several items on with multiple, as pressed buttons in a group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo multiple onValueChange={onValueChange} />);
    expect(screen.getByRole("group", { name: "Text alignment" })).toBe(part("root"));

    await user.click(screen.getByText("Left"));
    await user.click(screen.getByText("Center"));

    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: ["left", "center"] }),
    );
    expect(states()).toEqual(["on", "on", "off"]);
    expect(screen.getByRole("button", { name: "Left" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("moves focus between items with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Demo defaultValue={["left"]} />);
    // Tab lands on the root, which hands focus to an item; Ark moves focus
    // on the next frame, so each step waits for it.
    await user.tab();
    await waitFor(() => expect(document.activeElement).toBe(items()[0]));
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(items()[1]));
  });

  it("marks a disabled item with data-disabled and refuses to press it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Demo onValueChange={onValueChange} />);

    expect(items()[2]!.disabled).toBe(true);
    expect(items()[2]!.hasAttribute("data-disabled")).toBe(true);
    expect(part("root").hasAttribute("data-disabled")).toBe(false);

    await user.click(screen.getByText("Right"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(states()[2]).toBe("off");
  });

  it("disables every item when the group is disabled", () => {
    render(<Demo disabled />);
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    for (const item of items()) {
      expect(item.disabled).toBe(true);
      expect(item.hasAttribute("data-disabled")).toBe(true);
    }
  });
});
