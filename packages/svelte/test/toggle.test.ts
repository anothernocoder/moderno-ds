import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Toggle } from "../src/index.js";
import Demo from "./fixtures/ToggleFixture.svelte";

afterEach(cleanup);

describe("Toggle surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Toggle: ArkToggle } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkToggle)) {
      if (part === "Root") continue; // wrapped below
      expect(Toggle[part as keyof typeof Toggle], `Toggle.${part} missing`).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="toggle"][data-part="${name}"]`)!;
const button = () => screen.getByRole("button", { name: /Favorite/ }) as HTMLButtonElement;

describe("Toggle", () => {
  it("applies the recipe to the root part, defaulting to ghost md", () => {
    render(Demo, { props: { variant: "outline" as const, size: "lg" as const } });
    expect(part("root").getAttribute("data-variant")).toBe("outline");
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attributes.
    expect(part("indicator")).toBeTruthy();

    cleanup();
    render(Demo);
    expect(part("root").getAttribute("data-variant")).toBe("ghost");
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(Demo);
    expect(part("root").className).toBe("favorite");
    expect(part("root").hasAttribute("style")).toBe(false);
  });

  it("is a native button, not pressed until it is pressed", () => {
    render(Demo);
    expect(button()).toBe(part("root"));
    expect(button().type).toBe("button");
    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(part("root").getAttribute("data-state")).toBe("off");
    expect(part("indicator").textContent).toBe("☆");
  });

  it("stays pressed when clicked and reports the new state", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(Demo, { props: { onPressedChange } });

    await user.click(button());

    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(part("root").getAttribute("data-state")).toBe("on");
    expect(part("root").hasAttribute("data-pressed")).toBe(true);
    expect(part("indicator").textContent).toBe("★");

    await user.click(button());
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
    expect(part("root").getAttribute("data-state")).toBe("off");
  });

  it("starts pressed from defaultPressed", () => {
    render(Demo, { props: { defaultPressed: true } });
    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(part("indicator").getAttribute("data-state")).toBe("on");
  });

  it("toggles from the keyboard", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.tab();
    expect(document.activeElement).toBe(button());
    await user.keyboard(" ");
    expect(part("root").getAttribute("data-state")).toBe("on");
    await user.keyboard("{Enter}");
    expect(part("root").getAttribute("data-state")).toBe("off");
  });

  it("marks disabled with data-disabled and refuses to toggle", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(Demo, { props: { disabled: true, onPressedChange } });

    expect(button().disabled).toBe(true);
    expect(part("root").hasAttribute("data-disabled")).toBe(true);

    await user.click(button());
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(part("root").getAttribute("data-state")).toBe("off");
  });
});
