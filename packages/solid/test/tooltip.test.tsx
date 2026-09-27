import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import { Tooltip, type TooltipOpenChangeDetails, type TooltipSize } from "../src/index.jsx";

afterEach(cleanup);

describe("Tooltip surface (Solid)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Tooltip: ArkTooltip } = await import("@ark-ui/solid");
    for (const part of Object.keys(ArkTooltip)) {
      if (part === "Root" || part === "Content") continue; // wrapped below
      expect(Tooltip[part as keyof typeof Tooltip], `Tooltip.${part} missing`).toBeDefined();
    }
  });
});

function Demo(props: {
  size?: TooltipSize;
  open?: boolean;
  disabled?: boolean;
  onOpenChange?: (details: TooltipOpenChangeDetails) => void;
  contentRef?: (node: HTMLDivElement) => void;
}) {
  return (
    <Tooltip.Root
      size={props.size}
      open={props.open}
      disabled={props.disabled}
      onOpenChange={props.onOpenChange}
      openDelay={0}
      closeDelay={0}
    >
      <Tooltip.Trigger>Save</Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content class="hint" ref={props.contentRef}>
          <Tooltip.Arrow>
            <Tooltip.ArrowTip />
          </Tooltip.Arrow>
          Save your changes
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="tooltip"][data-part="${name}"]`)!;
const trigger = () => screen.getByRole("button", { name: "Save" });

describe("Tooltip", () => {
  it("puts the recipe's size on the content, defaulting to md", () => {
    render(() => <Demo size="sm" />);
    expect(part("content").getAttribute("data-size")).toBe("sm");

    cleanup();
    render(() => <Demo />);
    expect(part("content").getAttribute("data-size")).toBe("md");
  });

  it("follows a size change on the root", () => {
    const [size, setSize] = createSignal<TooltipSize>("sm");
    render(() => <Demo size={size()} />);
    setSize("lg");
    expect(part("content").getAttribute("data-size")).toBe("lg");
  });

  it("forwards native props and the ref to Ark's content", () => {
    let contentRef: HTMLDivElement | undefined;
    render(() => <Demo contentRef={(node) => (contentRef = node)} />);
    expect(part("content").className).toBe("hint");
    expect(contentRef).toBe(part("content"));
  });

  it("stays hidden until the trigger is hovered", () => {
    render(() => <Demo />);
    expect(part("content").hidden).toBe(true);
    expect(part("content").getAttribute("data-state")).toBe("closed");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens on hover, describes the trigger, and closes when the pointer leaves", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
    await user.hover(trigger());
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toBe(part("content"));
    expect(tooltip.textContent).toBe("Save your changes");
    expect(trigger().getAttribute("aria-describedby")).toBe(tooltip.id);
    await user.unhover(trigger());
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("opens on keyboard focus and closes on Escape", async () => {
    const user = userEvent.setup();
    render(() => <Demo />);
    await user.tab();
    expect(document.activeElement).toBe(trigger());
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
  });

  it("renders the arrow inside the content, sized by Ark from --arrow-size", () => {
    render(() => <Demo />);
    expect(part("content").contains(part("arrow"))).toBe(true);
    expect(part("arrow").contains(part("arrow-tip"))).toBe(true);
    expect(part("arrow").style.width).toBe("var(--arrow-size)");
  });

  it("follows a controlled open and reports the change", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const [open, setOpen] = createSignal(false);
    render(() => <Demo open={open()} onOpenChange={onOpenChange} />);
    await user.hover(trigger());
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith({ open: true }));
    expect(screen.queryByRole("tooltip")).toBeNull();

    setOpen(true);
    expect(await screen.findByRole("tooltip")).toBe(part("content"));
  });

  it("does not open while disabled", async () => {
    const user = userEvent.setup();
    render(() => <Demo disabled />);
    await user.hover(trigger());
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});
