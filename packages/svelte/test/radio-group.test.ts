import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "../src/index.js";
import Demo from "./fixtures/RadioGroupFixture.svelte";

afterEach(cleanup);

describe("RadioGroup surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { RadioGroup: ArkRadioGroup } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkRadioGroup)) {
      if (part === "Root") continue; // wrapped below
      expect(
        RadioGroup[part as keyof typeof RadioGroup],
        `RadioGroup.${part} missing`,
      ).toBeDefined();
    }
    expect(RadioGroup.ItemDescription).toBeDefined();
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="radio-group"][data-part="${name}"]`)!;
const parts = (name: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-scope="radio-group"][data-part="${name}"]`),
  );
const radio = (name: RegExp) => screen.getByRole("radio", { name }) as HTMLInputElement;

describe("RadioGroup (Svelte)", () => {
  it("applies the size recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "lg" as const } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("label")).toBeTruthy();
    expect(parts("item")).toHaveLength(3);
    expect(parts("item-control")).toHaveLength(3);
    expect(parts("item-text")).toHaveLength(3);
    expect(parts("item-description")).toHaveLength(3);

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("shipping");
  });

  it("lays out vertically by default and horizontally on request", () => {
    render(Demo);
    expect(part("root").getAttribute("data-orientation")).toBe("vertical");

    cleanup();
    render(Demo, { props: { orientation: "horizontal" as const } });
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");
    expect(part("item").getAttribute("data-orientation")).toBe("horizontal");
  });

  it("names the group by its label and each radio by its text and description", () => {
    render(Demo);
    expect(screen.getByRole("radiogroup", { name: "Shipping" })).toBe(part("root"));
    const standard = radio(/^Standard/);
    expect(standard.type).toBe("radio");
    expect(standard.name).toBe("shipping");
    expect(standard.value).toBe("standard");
    // The description sits inside ItemText, so it is read with the label.
    expect(radio(/Express\s*1–2 business days/)).toBeTruthy();
    expect(part("item-description").tagName).toBe("SPAN");
  });

  it("selects an option when clicked and reports the new value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "standard", onValueChange } });
    expect(parts("item")[0]!.getAttribute("data-state")).toBe("checked");

    await user.click(screen.getByText("Express"));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "express" }));
    expect(parts("item")[0]!.getAttribute("data-state")).toBe("unchecked");
    expect(parts("item")[1]!.getAttribute("data-state")).toBe("checked");
    expect(parts("item-control")[1]!.getAttribute("data-state")).toBe("checked");
    expect(radio(/^Express/).checked).toBe(true);
  });

  it("puts keyboard focus on the checked radio", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { defaultValue: "express" } });
    await user.tab();
    expect(document.activeElement).toBe(radio(/^Express/));
  });

  it("moves the selection with the arrow keys", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "standard", onValueChange } });
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "express" }));
    expect(parts("item")[1]!.getAttribute("data-state")).toBe("checked");
  });

  it("marks a disabled option with data-disabled and refuses to select it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });

    expect(parts("item")[2]!.hasAttribute("data-disabled")).toBe(true);
    expect(radio(/^Pickup/).disabled).toBe(true);
    expect(part("root").hasAttribute("data-disabled")).toBe(false);

    await user.click(screen.getByText("Pickup"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(parts("item")[2]!.getAttribute("data-state")).toBe("unchecked");
  });

  it("disables every option when the group is disabled", () => {
    render(Demo, { props: { disabled: true } });
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });

  it("marks invalid on every radio circle and input", () => {
    render(Demo, { props: { invalid: true } });
    expect(part("root").hasAttribute("data-invalid")).toBe(true);
    for (const control of parts("item-control")) {
      expect(control.hasAttribute("data-invalid")).toBe(true);
    }
    expect(radio(/^Standard/).getAttribute("aria-invalid")).toBe("true");
  });
});
