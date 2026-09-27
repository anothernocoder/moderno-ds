import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../src/index.js";
import Demo from "./fixtures/TooltipFixture.svelte";

afterEach(cleanup);

describe("Tooltip surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Tooltip: ArkTooltip } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkTooltip)) {
      if (part === "Root" || part === "Content") continue; // wrapped below
      expect(Tooltip[part as keyof typeof Tooltip], `Tooltip.${part} missing`).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="tooltip"][data-part="${name}"]`)!;
const trigger = () => screen.getByRole("button", { name: "Save" });

describe("Tooltip", () => {
  it("puts the recipe's size on the content, defaulting to md", () => {
    render(Demo, { props: { size: "sm" as const } });
    expect(part("content").getAttribute("data-size")).toBe("sm");

    cleanup();
    render(Demo);
    expect(part("content").getAttribute("data-size")).toBe("md");
  });

  it("follows a size change on the root", async () => {
    const { rerender } = render(Demo, { props: { size: "sm" as const } });
    await rerender({ size: "lg" });
    expect(part("content").getAttribute("data-size")).toBe("lg");
  });

  it("forwards native attributes and the ref to Ark's content", () => {
    let contentRef: HTMLElement | null = null;
    render(Demo, {
      props: {
        get contentRef() {
          return contentRef;
        },
        set contentRef(node: HTMLElement | null) {
          contentRef = node;
        },
      },
    });
    expect(part("content").className).toBe("hint");
    expect(contentRef).toBe(part("content"));
  });

  it("stays hidden until the trigger is hovered", () => {
    render(Demo);
    expect(part("content").hidden).toBe(true);
    expect(part("content").getAttribute("data-state")).toBe("closed");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens on hover, describes the trigger, and closes when the pointer leaves", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.hover(trigger());
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toBe(part("content"));
    expect(tooltip.textContent?.trim()).toBe("Save your changes");
    expect(trigger().getAttribute("aria-describedby")).toBe(tooltip.id);
    await user.unhover(trigger());
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("opens on keyboard focus and closes on Escape", async () => {
    const user = userEvent.setup();
    render(Demo);
    await user.tab();
    expect(document.activeElement).toBe(trigger());
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("renders the arrow inside the content, sized by Ark from --arrow-size", () => {
    render(Demo);
    expect(part("content").contains(part("arrow"))).toBe(true);
    expect(part("arrow").contains(part("arrow-tip"))).toBe(true);
    expect(part("arrow").style.width).toBe("var(--arrow-size)");
  });

  it("follows a controlled open and reports the change", async () => {
    // Ark's own Svelte Root never hands `open` to the machine; the wrapper does.
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(Demo, { props: { open: true, onOpenChange } });
    expect(await screen.findByRole("tooltip")).toBe(part("content"));

    await rerender({ open: false, onOpenChange });
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());

    await user.hover(trigger());
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith({ open: true }));
  });

  it("does not open while disabled", async () => {
    const user = userEvent.setup();
    render(Demo, { props: { disabled: true } });
    await user.hover(trigger());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
