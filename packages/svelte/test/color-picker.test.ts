import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { ColorPicker, type ColorPickerProps } from "../src/index.js";
import Bound from "./fixtures/ColorPickerBoundFixture.svelte";
import InField from "./fixtures/ColorPickerFieldFixture.svelte";
import InForm from "./fixtures/ColorPickerFormFixture.svelte";

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

async function open(props: ColorPickerProps = {}) {
  const user = userEvent.setup();
  render(ColorPicker, { props: { defaultValue: "#1E90FF", ...props } });
  await user.click(trigger());
  await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
  // Ark moves focus into the popover on the next frame.
  await waitFor(() =>
    expect(document.activeElement?.closest('[data-part="content"]')).not.toBeNull(),
  );
  return user;
}

describe("ColorPicker (Svelte)", () => {
  it("shows the colour and its hex on the trigger", () => {
    render(ColorPicker, { props: { defaultValue: "#1e90ff" } });
    expect(trigger().getAttribute("aria-label")).toBe("Color #1E90FF");
    expect(trigger().textContent?.trim()).toBe("#1E90FF");
    expect(trigger().querySelector('[data-part="swatch"]')).not.toBeNull();
  });

  it("puts the recipe's size and native props on the root, md by default", async () => {
    const { container, rerender } = render(ColorPicker, { props: { class: "brand" } });
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
    expect(trigger().textContent?.trim()).toBe("#1E90FF80");
  });

  it("shows the preset swatches and selects the one clicked", async () => {
    const onValueChange = vi.fn();
    const user = await open({ swatches: ["#f00", "#00ff00", "not a colour"], onValueChange });
    const group = screen.getByRole("group", { name: "Swatches" });
    expect(group.querySelectorAll('[data-part="swatch-trigger"]')).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Select #FF0000" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#FF0000" });
    await waitFor(() => expect(trigger().textContent?.trim()).toBe("#FF0000"));
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
    const onValueChange = vi.fn();
    const user = await open({ onValueChange });
    await user.clear(hexInput());
    await user.type(hexInput(), "f00{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#FF0000" });
    await waitFor(() => expect(hexInput().value).toBe("#FF0000"));
  });

  it("takes a pasted #RRGGBBAA, alpha and all, with alpha", async () => {
    const onValueChange = vi.fn();
    const user = await open({ alpha: true, onValueChange });
    await user.clear(hexInput());
    await user.paste("1e90ff80");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#1E90FF80" });
  });

  it("keeps a pasted #RRGGBBAA opaque without alpha", async () => {
    const onValueChange = vi.fn();
    const user = await open({ defaultValue: "#000000", onValueChange });
    await user.clear(hexInput());
    await user.paste("#1e90ff80");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#1E90FF" });
  });

  it("ignores an invalid hex and shows the last valid one on blur", async () => {
    const onValueChange = vi.fn();
    const user = await open({ onValueChange });
    await user.clear(hexInput());
    await user.type(hexInput(), "#12zz");
    expect(hexInput().value).toBe("#12zz");
    await user.tab();
    expect(onValueChange).not.toHaveBeenCalled();
    await waitFor(() => expect(hexInput().value).toBe("#1E90FF"));
  });

  it("moves in the area and along the sliders with the arrow keys", async () => {
    const onValueChange = vi.fn();
    const user = await open({ onValueChange });
    screen.getByRole("slider", { name: "Saturation and brightness" }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const hue = screen.getByRole("slider", { name: "Hue" });
    hue.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(hue.getAttribute("aria-valuenow")).toBe("211"));
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    const user = await open();
    screen.getByRole("slider", { name: "Hue" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
    await waitFor(() => expect(document.activeElement).toBe(trigger()));
  });

  it("follows a bound value (bind:value) both ways", async () => {
    render(Bound, { props: { value: "#1E90FF" } });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Green" }));
    await waitFor(() => expect(trigger().textContent?.trim()).toBe("#00FF00"));
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Select #FF0000" }));
    await waitFor(() => expect(screen.getByTestId("value").textContent).toBe("#FF0000"));
    expect(trigger().textContent?.trim()).toBe("#FF0000");
  });

  it("writes a picked colour back to a bound value that starts unset", async () => {
    render(Bound);
    const user = userEvent.setup();
    expect(screen.getByTestId("value").textContent).toBe("");
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Select #FF0000" }));
    await waitFor(() => expect(screen.getByTestId("value").textContent).toBe("#FF0000"));
    expect(trigger().textContent?.trim()).toBe("#FF0000");
  });

  it("keeps its hue while a bound value passes through grey", async () => {
    render(Bound, { props: { value: "#1E90FF" } });
    const user = userEvent.setup();
    await user.click(trigger());
    const area = await screen.findByRole("slider", { name: "Saturation and brightness" });
    area.focus();
    await user.keyboard("{ArrowLeft}".repeat(100));
    expect(screen.getByRole("slider", { name: "Hue" }).getAttribute("aria-valuenow")).toBe("209.6");
  });

  it("is named by a Field's label and described by its helper text", async () => {
    render(InField);
    const button = screen.getByRole("button", { name: "Brand color" });
    await waitFor(() => expect(description(button)).toBe("#1E90FF Used for buttons and links."));
    expect(screen.getByText("Brand color").getAttribute("for")).toBe(button.id);
  });

  it("shows a Field's error and marks the trigger invalid", async () => {
    render(InField, { props: { invalid: true } });
    const button = screen.getByRole("button", { name: "Brand color" });
    expect(button.hasAttribute("data-invalid")).toBe(true);
    await waitFor(() =>
      expect(description(button)).toBe("#1E90FF Pick a darker colour. Used for buttons and links."),
    );
  });

  it("follows a disabled Field", () => {
    render(InField, { props: { disabled: true } });
    expect(
      (screen.getByRole("button", { name: "Brand color" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("submits the hex under its name", async () => {
    const { container } = render(InForm);
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
