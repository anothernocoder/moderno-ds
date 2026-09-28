import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { defineComponent, h, ref } from "vue";
import { ColorPicker, Field } from "../src/index.js";

afterEach(() => {
  cleanup();
  delete (globalThis as { EyeDropper?: unknown }).EyeDropper;
});

const trigger = () => screen.getByRole("button", { name: /^Color / });
const hexInput = () => screen.getByRole<HTMLInputElement>("textbox", { name: "Hex" });

/** The text of the elements an element's aria-describedby points at, in order. */
const description = (element: HTMLElement) =>
  (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent)
    .join(" ");

async function open(props: Record<string, unknown> = {}) {
  const user = userEvent.setup();
  const result = render(ColorPicker, { props: { defaultValue: "#1E90FF", ...props } });
  await user.click(trigger());
  await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
  // Ark moves focus into the popover on the next frame.
  await waitFor(() =>
    expect(document.activeElement?.closest('[data-part="content"]')).not.toBeNull(),
  );
  return { user, ...result };
}

describe("ColorPicker (Vue)", () => {
  it("shows the colour and its hex on the trigger", async () => {
    render(ColorPicker, { props: { defaultValue: "#1e90ff" } });
    await waitFor(() => expect(trigger().getAttribute("aria-label")).toBe("Color #1E90FF"));
    expect(trigger().textContent).toBe("#1E90FF");
    expect(trigger().querySelector('[data-part="swatch"]')).not.toBeNull();
  });

  it("puts the recipe's size and native attributes on the root, md by default", async () => {
    const { container, rerender } = render(ColorPicker, { attrs: { class: "brand" } });
    const root = () => container.querySelector('[data-scope="color-picker"][data-part="root"]')!;
    expect(root().getAttribute("data-size")).toBe("md");
    expect(root().classList.contains("brand")).toBe(true);
    await rerender({ size: "lg" });
    expect(root().getAttribute("data-size")).toBe("lg");
  });

  it("is closed until the trigger opens it", async () => {
    render(ColorPicker);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.setup().click(trigger());
    expect((await screen.findByRole("dialog")).hidden).toBe(false);
  });

  it("opens to an area, a hue slider and a hex box, each named", async () => {
    await open();
    expect(
      screen
        .getByRole("slider", { name: "Saturation and brightness" })
        .getAttribute("aria-valuetext"),
    ).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Hue" }).getAttribute("aria-valuenow")).toBe("209.6");
    expect(hexInput().value).toBe("#1E90FF");
  });

  it("shows the alpha slider only with alpha", async () => {
    await open();
    expect(screen.queryByRole("slider", { name: "Alpha" })).toBeNull();
    cleanup();
    await open({ alpha: true, defaultValue: "#1E90FF80" });
    expect(screen.getByRole("slider", { name: "Alpha" }).getAttribute("aria-valuenow")).toBe("0.5");
    expect(trigger().textContent).toBe("#1E90FF80");
  });

  it("shows the preset swatches and selects the one clicked", async () => {
    const { user, emitted } = await open({ swatches: ["#f00", "#00ff00", "not a colour"] });
    const group = screen.getByRole("group", { name: "Swatches" });
    expect(group.querySelectorAll('[data-part="swatch-trigger"]')).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Select #FF0000" }));
    expect(emitted().valueChange!.at(-1)).toEqual([{ value: "#FF0000" }]);
    expect(emitted()["update:modelValue"]!.at(-1)).toEqual(["#FF0000"]);
    await waitFor(() => expect(trigger().textContent).toBe("#FF0000"));
  });

  it("shows the eyedropper only where the browser has one", async () => {
    await open();
    expect(screen.queryByRole("button", { name: "Pick a color from the screen" })).toBeNull();
    cleanup();
    (globalThis as { EyeDropper?: unknown }).EyeDropper = class {};
    await open();
    expect(screen.getByRole("button", { name: "Pick a color from the screen" })).toBeTruthy();
  });

  it("takes a hex typed with or without the #, short or long, on Enter", async () => {
    const { user, emitted } = await open();
    await user.clear(hexInput());
    await user.type(hexInput(), "f00{Enter}");
    expect(emitted().valueChange!.at(-1)).toEqual([{ value: "#FF0000" }]);
    await waitFor(() => expect(hexInput().value).toBe("#FF0000"));
  });

  it("takes a pasted #RRGGBBAA, alpha and all, with alpha", async () => {
    const { user, emitted } = await open({ alpha: true });
    await user.clear(hexInput());
    await user.paste("1e90ff80");
    await user.tab();
    expect(emitted().valueChange!.at(-1)).toEqual([{ value: "#1E90FF80" }]);
  });

  it("keeps a pasted #RRGGBBAA opaque without alpha", async () => {
    const { user, emitted } = await open({ defaultValue: "#000000" });
    await user.clear(hexInput());
    await user.paste("#1e90ff80");
    await user.tab();
    expect(emitted().valueChange!.at(-1)).toEqual([{ value: "#1E90FF" }]);
  });

  it("ignores an invalid hex and shows the last valid one on blur", async () => {
    const { user, emitted } = await open();
    await user.clear(hexInput());
    await user.type(hexInput(), "#12zz");
    expect(hexInput().value).toBe("#12zz");
    await user.tab();
    expect(emitted().valueChange).toBeUndefined();
    await waitFor(() => expect(hexInput().value).toBe("#1E90FF"));
  });

  it("moves in the area and along the sliders with the arrow keys", async () => {
    const { user, emitted } = await open();
    screen.getByRole("slider", { name: "Saturation and brightness" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(emitted().valueChange).toHaveLength(1);
    const hue = screen.getByRole("slider", { name: "Hue" });
    hue.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(hue.getAttribute("aria-valuenow")).toBe("211"));
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    const { user } = await open();
    screen.getByRole("slider", { name: "Hue" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
    await waitFor(() => expect(document.activeElement).toBe(trigger()));
  });

  it("follows v-model and reports each change", async () => {
    const value = ref("#1E90FF");
    const onValueChange = vi.fn();
    const Controlled = defineComponent({
      setup() {
        return () => [
          h(ColorPicker, {
            modelValue: value.value,
            "onUpdate:modelValue": (next: string) => (value.value = next),
            onValueChange,
            swatches: ["#ff0000"],
          }),
          h("button", { type: "button", onClick: () => (value.value = "#00FF00") }, "Green"),
        ];
      },
    });
    render(Controlled);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Green" }));
    await waitFor(() => expect(trigger().textContent).toBe("#00FF00"));
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Select #FF0000" }));
    expect(value.value).toBe("#FF0000");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#FF0000" });
    await waitFor(() => expect(trigger().textContent).toBe("#FF0000"));
  });

  it("keeps its hue while a bound value passes through grey", async () => {
    const value = ref("#1E90FF");
    const Controlled = defineComponent({
      setup() {
        return () =>
          h(ColorPicker, {
            modelValue: value.value,
            "onUpdate:modelValue": (next: string) => (value.value = next),
          });
      },
    });
    render(Controlled);
    const user = userEvent.setup();
    await user.click(trigger());
    const area = await screen.findByRole("slider", { name: "Saturation and brightness" });
    area.focus();
    await user.keyboard("{ArrowLeft}".repeat(100));
    expect(screen.getByRole("slider", { name: "Hue" }).getAttribute("aria-valuenow")).toBe("209.6");
  });

  it("is named by a Field's label and described by its helper text", async () => {
    render(
      defineComponent({
        setup: () => () =>
          h(Field.Root, null, () => [
            h(Field.Label, null, () => "Brand color"),
            h(ColorPicker, { defaultValue: "#1E90FF" }),
            h(Field.HelperText, null, () => "Used for buttons and links."),
          ]),
      }),
    );
    const button = screen.getByRole("button", { name: "Brand color" });
    await waitFor(() => expect(description(button)).toBe("#1E90FF Used for buttons and links."));
    expect(screen.getByText("Brand color").getAttribute("for")).toBe(button.id);
  });

  it("follows a disabled Field", () => {
    render(
      defineComponent({
        setup: () => () =>
          h(Field.Root, { disabled: true }, () => [
            h(Field.Label, null, () => "Brand color"),
            h(ColorPicker),
          ]),
      }),
    );
    expect(
      (screen.getByRole("button", { name: "Brand color" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("submits the hex under its name", async () => {
    const { container } = render(
      defineComponent({
        setup: () => () =>
          h("form", null, [
            h(ColorPicker, { name: "brand", defaultValue: "#1e90ff", swatches: ["#f00"] }),
          ]),
      }),
    );
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("brand")).toBe("#1E90FF");
    const user = userEvent.setup();
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Select #FF0000" }));
    await waitFor(() => expect(new FormData(form).get("brand")).toBe("#FF0000"));
  });

  it("names its parts in the reader's language", async () => {
    await open({ translations: { trigger: "Color de marca", hue: "Tono" } });
    expect(screen.getByRole("slider", { name: "Tono" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Color de marca #1E90FF" })).toBeTruthy();
  });
});
