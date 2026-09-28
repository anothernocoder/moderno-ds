import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { SegmentedControl } from "../src/index.js";
import Demo from "./fixtures/SegmentedControlFixture.svelte";
import InField from "./fixtures/SegmentedControlFieldFixture.svelte";
import IconOnly from "./fixtures/SegmentedControlIconFixture.svelte";

afterEach(cleanup);

describe("SegmentedControl surface (Svelte)", () => {
  it("exposes every Ark part but Label, and wraps Root and ItemText", async () => {
    const { SegmentGroup: ArkSegmentGroup } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkSegmentGroup)) {
      if (part === "Label") continue; // the root is the track; see exports/segmented-control.ts
      expect(
        SegmentedControl[part as keyof typeof SegmentedControl],
        `SegmentedControl.${part} missing`,
      ).toBeDefined();
    }
    expect("Label" in SegmentedControl).toBe(false);
    expect(SegmentedControl.Root).not.toBe(ArkSegmentGroup.Root);
    expect(SegmentedControl.ItemText).not.toBe(ArkSegmentGroup.ItemText);
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="segment-group"][data-part="${name}"]`)!;
const parts = (name: string) =>
  Array.from(
    document.querySelectorAll<HTMLElement>(`[data-scope="segment-group"][data-part="${name}"]`),
  );
const radio = (name: string) => screen.getByRole("radio", { name }) as HTMLInputElement;
const states = () => parts("item").map((item) => item.getAttribute("data-state"));

describe("SegmentedControl (Svelte)", () => {
  it("puts size and fullWidth on the root, defaulting to md and its own width", async () => {
    const { rerender } = render(Demo, { props: { size: "lg" as const, fullWidth: true } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    expect(part("root").hasAttribute("data-full-width")).toBe(true);

    await rerender({ size: undefined, fullWidth: false });
    expect(part("root").getAttribute("data-size")).toBe("md");
    expect(part("root").hasAttribute("data-full-width")).toBe(false);
  });

  it("lays the segments out in a row and forwards native props to the root", () => {
    render(Demo);
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");
    expect(part("root").className).toBe("scale");
    expect(part("indicator")).toBeTruthy();
  });

  it("is a named radiogroup of native radios", () => {
    render(Demo);
    expect(screen.getByRole("radiogroup", { name: "Scale" })).toBe(part("root"));
    const fit = radio("Fit");
    expect(fit.type).toBe("radio");
    expect(fit.name).toBe("scale");
    expect(fit.value).toBe("fit");
  });

  it("names an icon-only option by its hidden ItemText", () => {
    render(IconOnly);
    expect(radio("Align left").checked).toBe(true);
  });

  it("selects an option when clicked and reports it (uncontrolled)", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "fit", onValueChange } });
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);

    await user.click(screen.getByText("Fill"));

    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "fill" }));
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);
    expect(radio("Fill").checked).toBe(true);
  });

  it("keeps a bound value in step both ways", async () => {
    const user = userEvent.setup();
    const { rerender } = render(Demo, { props: { value: "fill" } });
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);

    await user.click(screen.getByText("Fit"));
    expect(screen.getByRole("status").textContent).toBe("fit");
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);

    await rerender({ value: "fill" });
    expect(states()).toEqual(["unchecked", "checked", "unchecked"]);
  });

  it("enters on Tab at the checked radio, and the arrow keys move and select", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "fill", onValueChange } });
    await user.tab();
    expect(document.activeElement).toBe(radio("Fill"));

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(radio("Fit"));
    expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: "fit" }));
    expect(states()).toEqual(["checked", "unchecked", "unchecked"]);
  });

  it("disables one option: marked, inert and skipped", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: "fit", onValueChange } });
    expect(parts("item")[2]!.hasAttribute("data-disabled")).toBe(true);
    expect(radio("Stretch").disabled).toBe(true);
    expect(part("root").hasAttribute("data-disabled")).toBe(false);

    await user.click(screen.getByText("Stretch"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(states()[2]).toBe("unchecked");
  });

  it("disables the whole control", () => {
    render(Demo, { props: { disabled: true } });
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });

  it("titles a cut-off label with its full text when the pointer enters it", async () => {
    const user = userEvent.setup();
    render(Demo);
    const text = screen.getByText("Stretch");
    Object.defineProperty(text, "scrollWidth", { configurable: true, value: 120 });
    Object.defineProperty(text, "clientWidth", { configurable: true, value: 60 });
    await user.hover(text);
    expect(text.getAttribute("title")).toBe("Stretch");

    const fits = screen.getByText("Fit");
    await user.hover(fits);
    expect(fits.hasAttribute("title")).toBe(false);
  });
});

describe("SegmentedControl in a Field (Svelte)", () => {
  it("is named by the Field's label and described by its helper text", () => {
    render(InField);
    const group = screen.getByRole("radiogroup", { name: "Scale" });
    expect(group).toBe(part("root"));
    const describedBy = group.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy)?.textContent).toBe(
      "How the image fills its frame.",
    );
  });

  it("follows the Field's disabled and invalid state", () => {
    render(InField, { props: { disabled: true, invalid: true } });
    expect(part("root").hasAttribute("data-disabled")).toBe(true);
    expect(part("root").hasAttribute("data-invalid")).toBe(true);
    for (const input of screen.getAllByRole("radio") as HTMLInputElement[]) {
      expect(input.disabled).toBe(true);
    }
  });
});
