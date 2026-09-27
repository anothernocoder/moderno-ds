import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Combobox } from "../src/index.js";
import Demo from "./fixtures/ComboboxFixture.svelte";

// Ark-Svelte's Portal leaves its positioner in <body> after the test's
// component is unmounted; clear it so each test queries only its own parts.
afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe("Combobox surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Combobox: ArkCombobox } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkCombobox)) {
      if (part === "Root") continue; // wrapped below
      expect(Combobox[part as keyof typeof Combobox], `Combobox.${part} missing`).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="combobox"][data-part="${name}"]`)!;
const parts = (name: string) => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="combobox"][data-part="${name}"]`),
];
const input = () => screen.getByRole<HTMLInputElement>("combobox", { name: "Framework" });
const options = () =>
  screen
    .queryAllByRole("option")
    .map((option) => option.querySelector(`[data-part="item-text"]`)!.textContent);

describe("Combobox", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "sm" as const } });
    expect(part("root").getAttribute("data-size")).toBe("sm");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("control").contains(part("input"))).toBe(true);
    expect(part("control").contains(part("trigger"))).toBe(true);
    expect(part("control").contains(part("clear-trigger"))).toBe(true);

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("frameworks");
  });

  it("names the input by its label and opens the listbox from the trigger", async () => {
    const user = userEvent.setup();
    render(Demo);
    expect(input()).toBe(part("input"));
    expect(input().getAttribute("aria-expanded")).toBe("false");
    await user.click(part("trigger"));
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBe(part("content"));
    expect(part("positioner").contains(listbox)).toBe(true);
    expect(input().getAttribute("aria-expanded")).toBe("true");
    expect(options()).toEqual(["React", "Vue", "Svelte", "Solid"]);
  });

  it("filters the list as the user types, and shows the empty state when nothing is left", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.type(input(), "sv");
    await waitFor(() => expect(options()).toEqual(["Svelte"]));
    expect(parts("empty")).toHaveLength(0);

    await user.type(input(), "x");
    await waitFor(() => expect(options()).toEqual([]));
    expect(part("empty").textContent).toBe("No frameworks found");
    expect(part("content").hasAttribute("data-empty")).toBe(true);
  });

  it("picks an item on click, reports it and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    await user.click(part("trigger"));
    await user.click(await screen.findByRole("option", { name: /Vue/ }));
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ["vue"] })),
    );
    await waitFor(() => expect(input().getAttribute("aria-expanded")).toBe("false"));
    expect(input().value).toBe("Vue");
  });

  it("highlights with the arrow keys and picks with Enter", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    const highlighted = () => parts("item").find((item) => item.hasAttribute("data-highlighted"));
    await user.click(input());
    // The first Arrow Down opens the list on its first item; the next moves on.
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(highlighted()?.getAttribute("data-value")).toBe("react"));
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(highlighted()?.getAttribute("data-value")).toBe("vue"));
    expect(input().getAttribute("aria-activedescendant")).toBe(highlighted()!.id);
    await user.keyboard("{Enter}");
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith(expect.objectContaining({ value: ["vue"] })),
    );
  });

  it("keeps several items with multiple, and checks each", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { multiple: true, onValueChange } });
    await user.click(part("trigger"));
    expect((await screen.findByRole("listbox")).getAttribute("aria-multiselectable")).toBe("true");
    await user.click(screen.getByRole("option", { name: /React/ }));
    await user.click(screen.getByRole("option", { name: /Svelte/ }));
    await waitFor(() =>
      expect(onValueChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ value: ["react", "svelte"] }),
      ),
    );
    const checked = parts("item").filter((item) => item.getAttribute("data-state") === "checked");
    expect(checked.map((item) => item.getAttribute("data-value"))).toEqual(["react", "svelte"]);
    expect(screen.getByRole("option", { name: /React/ }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("skips a disabled item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { onValueChange } });
    await user.click(part("trigger"));
    const solid = await screen.findByRole("option", { name: /Solid/ });
    expect(solid.getAttribute("aria-disabled")).toBe("true");
    expect(solid.hasAttribute("data-disabled")).toBe(true);
    // The item-text carries data-disabled too, so the stylesheet dims the item
    // once and resets its parts rather than dimming the label again.
    expect(solid.querySelector('[data-part="item-text"]')?.hasAttribute("data-disabled")).toBe(
      true,
    );
    solid.click();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears the value with the clear trigger, which hides once empty", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Demo, { props: { defaultValue: ["vue"], onValueChange } });
    expect(part("clear-trigger").hidden).toBe(false);
    await user.click(part("clear-trigger"));
    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith({ value: [], items: [] }));
    await waitFor(() => expect(part("clear-trigger").hidden).toBe(true));
    expect(input().value).toBe("");
  });

  it("follows a controlled value (bind:value)", async () => {
    const { rerender } = render(Demo, { props: { value: ["react"] } });
    await waitFor(() => expect(input().value).toBe("React"));
    await rerender({ value: ["svelte"] });
    await waitFor(() => expect(input().value).toBe("Svelte"));
  });

  it("marks an invalid value on the control and the input", () => {
    render(Demo, { props: { invalid: true } });
    expect(part("control").hasAttribute("data-invalid")).toBe(true);
    expect(input().getAttribute("aria-invalid")).toBe("true");
  });

  it("disables the control, the input and its buttons", () => {
    render(Demo, { props: { defaultValue: ["vue"], disabled: true } });
    for (const name of ["label", "control", "trigger"]) {
      expect(part(name).hasAttribute("data-disabled"), name).toBe(true);
    }
    expect(input().disabled).toBe(true);
    expect(part("trigger")).toHaveProperty("disabled", true);
    expect(part("clear-trigger")).toHaveProperty("disabled", true);
  });
});
