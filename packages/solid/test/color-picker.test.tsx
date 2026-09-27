import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import userEvent from "@testing-library/user-event";
import { ColorPicker, Field, type ColorPickerProps } from "../src/index.jsx";

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
  render(() => <ColorPicker defaultValue="#1E90FF" data-testid="root" {...props} />);
  await user.click(trigger());
  await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
  // Ark moves focus into the popover on the next frame.
  await waitFor(() =>
    expect(document.activeElement?.closest('[data-part="content"]')).not.toBeNull(),
  );
  return user;
}

describe("ColorPicker (Solid)", () => {
  it("shows the colour and its hex on the trigger", () => {
    render(() => <ColorPicker defaultValue="#1e90ff" />);
    expect(trigger().getAttribute("aria-label")).toBe("Color #1E90FF");
    expect(trigger().textContent).toBe("#1E90FF");
    expect(trigger().querySelector('[data-part="swatch"]')).not.toBeNull();
  });

  it("puts the recipe's size and native props on the root, md by default", () => {
    const [size, setSize] = createSignal<"lg" | undefined>(undefined);
    render(() => <ColorPicker data-testid="root" class="brand" size={size()} />);
    const root = screen.getByTestId("root");
    expect(root.getAttribute("data-scope")).toBe("color-picker");
    expect(root.getAttribute("data-size")).toBe("md");
    expect(root.classList.contains("brand")).toBe(true);
    setSize("lg");
    expect(root.getAttribute("data-size")).toBe("lg");
  });

  it("starts black with no value", () => {
    render(() => <ColorPicker />);
    expect(trigger().textContent).toBe("#000000");
  });

  it("is closed until the trigger opens it", async () => {
    render(() => <ColorPicker />);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.setup().click(trigger());
    expect((await screen.findByRole("dialog")).hidden).toBe(false);
  });

  it("opens to an area, a hue slider and a hex box, each named", async () => {
    await open();
    const area = screen.getByRole("slider", { name: "Saturation and brightness" });
    expect(area.hasAttribute("aria-valuetext")).toBe(true);
    const hue = screen.getByRole("slider", { name: "Hue" });
    expect(hue.getAttribute("aria-valuenow")).toBe("209.6");
    expect(hexInput().value).toBe("#1E90FF");
  });

  it("shows the alpha slider only with alpha", async () => {
    await open();
    expect(screen.queryByRole("slider", { name: "Alpha" })).toBeNull();
    cleanup();
    await open({ alpha: true, defaultValue: "#1E90FF80" });
    const slider = screen.getByRole("slider", { name: "Alpha" });
    expect(slider.getAttribute("aria-valuenow")).toBe("0.5");
    expect(slider.closest('[data-part="channel-slider"]')?.getAttribute("data-channel")).toBe(
      "alpha",
    );
    expect(trigger().textContent).toBe("#1E90FF80");
  });

  it("drops the alpha of a colour when alpha is off", () => {
    render(() => <ColorPicker defaultValue="#1E90FF80" />);
    expect(trigger().textContent).toMatch(/^#1E90FF$/);
  });

  it("shows the preset swatches and selects the one clicked", async () => {
    const onValueChange = vi.fn();
    const user = await open({ swatches: ["#f00", "#00ff00", "not a colour"], onValueChange });
    const group = screen.getByRole("group", { name: "Swatches" });
    expect(group.querySelectorAll('[data-part="swatch-trigger"]')).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Select #FF0000" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#FF0000" });
    expect(trigger().textContent).toBe("#FF0000");
    expect(screen.getByRole("button", { name: "Select #FF0000" }).getAttribute("data-state")).toBe(
      "checked",
    );
  });

  it("shows the eyedropper only where the browser has one", async () => {
    await open();
    expect(screen.queryByRole("button", { name: "Pick a color from the screen" })).toBeNull();
    cleanup();
    (globalThis as { EyeDropper?: unknown }).EyeDropper = class {};
    await open();
    expect(screen.getByRole("button", { name: "Pick a color from the screen" }).hidden).toBe(false);
  });

  it("takes a hex typed with or without the #, short or long, on Enter", async () => {
    const onValueChange = vi.fn();
    const user = await open({ onValueChange });
    await user.clear(hexInput());
    await user.type(hexInput(), "f00{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#FF0000" });
    expect(hexInput().value).toBe("#FF0000");
    await user.clear(hexInput());
    await user.type(hexInput(), "#00ff00{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#00FF00" });
  });

  it("takes a pasted #RRGGBBAA, alpha and all, with alpha", async () => {
    const onValueChange = vi.fn();
    const user = await open({ alpha: true, onValueChange });
    await user.clear(hexInput());
    await user.paste("1e90ff80");
    await user.tab();
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "#1E90FF80" });
    expect(screen.getByRole("slider", { name: "Alpha" }).getAttribute("aria-valuenow")).toBe("0.5");
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
    expect(hexInput().value).toBe("#1E90FF");
    expect(trigger().textContent).toBe("#1E90FF");
  });

  it("moves in the area and along the sliders with the arrow keys", async () => {
    const onValueChange = vi.fn();
    await open({ onValueChange });
    const area = screen.getByRole("slider", { name: "Saturation and brightness" });
    area.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const hue = screen.getByRole("slider", { name: "Hue" });
    hue.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(hue.getAttribute("aria-valuenow")).toBe("211");
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it("closes on Escape and gives focus back to the trigger", async () => {
    const user = await open();
    screen.getByRole("slider", { name: "Hue" }).focus();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
    await waitFor(() => expect(document.activeElement).toBe(trigger()));
  });

  it("opens from the keyboard", async () => {
    render(() => <ColorPicker />);
    const user = userEvent.setup();
    trigger().focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
  });

  it("follows a controlled value and reports each change", async () => {
    function Controlled() {
      const [value, setValue] = createSignal("#1E90FF");
      return (
        <>
          <ColorPicker
            value={value()}
            onValueChange={(details) => setValue(details.value)}
            swatches={["#ff0000"]}
          />
          <output data-testid="value">{value()}</output>
          <button type="button" onClick={() => setValue("#00FF00")}>
            Green
          </button>
        </>
      );
    }
    render(() => <Controlled />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Green" }));
    expect(trigger().textContent).toBe("#00FF00");
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Select #FF0000" }));
    expect(screen.getByTestId("value").textContent).toBe("#FF0000");
    expect(trigger().textContent).toBe("#FF0000");
  });

  it("keeps a controlled value the owner does not change", async () => {
    const user = await open({ value: "#1E90FF", swatches: ["#ff0000"] });
    await user.click(screen.getByRole("button", { name: "Select #FF0000" }));
    expect(trigger().textContent).toBe("#1E90FF");
  });

  it("keeps its hue while a controlled value passes through grey", async () => {
    function Controlled() {
      const [value, setValue] = createSignal("#1E90FF");
      return <ColorPicker value={value()} onValueChange={(details) => setValue(details.value)} />;
    }
    render(() => <Controlled />);
    const user = userEvent.setup();
    await user.click(trigger());
    const area = await screen.findByRole("slider", { name: "Saturation and brightness" });
    area.focus();
    // All the way left: saturation 0, a grey whose hex carries no hue.
    await user.keyboard("{ArrowLeft}".repeat(100));
    expect(screen.getByRole("slider", { name: "Hue" }).getAttribute("aria-valuenow")).toBe("209.6");
  });

  it("is named by a Field's label and described by its helper text", () => {
    render(() => (
      <Field.Root>
        <Field.Label>Brand color</Field.Label>
        <ColorPicker defaultValue="#1E90FF" />
        <Field.HelperText>Used for buttons and links.</Field.HelperText>
      </Field.Root>
    ));
    const button = screen.getByRole("button", { name: "Brand color" });
    expect(description(button)).toBe("#1E90FF Used for buttons and links.");
    expect(screen.getByText("Brand color").getAttribute("for")).toBe(button.id);
  });

  it("shows a Field's error and marks the trigger invalid", () => {
    render(() => (
      <Field.Root invalid>
        <Field.Label>Brand color</Field.Label>
        <ColorPicker defaultValue="#1E90FF" />
        <Field.ErrorText>Pick a darker colour.</Field.ErrorText>
      </Field.Root>
    ));
    const button = screen.getByRole("button", { name: "Brand color" });
    expect(button.hasAttribute("data-invalid")).toBe(true);
    expect(description(button)).toBe("#1E90FF Pick a darker colour.");
  });

  it("follows a disabled Field", () => {
    render(() => (
      <Field.Root disabled>
        <Field.Label>Brand color</Field.Label>
        <ColorPicker />
      </Field.Root>
    ));
    expect(
      (screen.getByRole("button", { name: "Brand color" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("submits the hex under its name", async () => {
    const { container } = render(() => (
      <form>
        <ColorPicker name="brand" defaultValue="#1e90ff" swatches={["#f00"]} />
      </form>
    ));
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("brand")).toBe("#1E90FF");
    const user = userEvent.setup();
    await user.click(trigger());
    await user.click(await screen.findByRole("button", { name: "Select #FF0000" }));
    expect(new FormData(form).get("brand")).toBe("#FF0000");
  });

  it("names its parts in the reader's language", async () => {
    await open({ alpha: true, translations: { trigger: "Color de marca", hue: "Tono" } });
    expect(screen.getByRole("slider", { name: "Tono" }).hidden).toBe(false);
    expect(screen.getByRole("button", { name: "Color de marca #1E90FF" }).hidden).toBe(false);
  });
});
