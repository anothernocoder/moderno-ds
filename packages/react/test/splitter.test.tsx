// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Splitter,
  type SplitterPanelData,
  type SplitterResizeDetails,
  type SplitterVariant,
} from "../src/index.js";

/*
 * Ark only resolves the panel sizes it moves once it has measured the root,
 * and jsdom lays nothing out: give every element a 600 × 300 box.
 */
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
    DOMRect.fromRect({ width: 600, height: 300 }),
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Splitter surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Splitter: ArkSplitter } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkSplitter)) {
      if (part === "Root") continue; // wrapped below
      expect(Splitter[part as keyof typeof Splitter], `Splitter.${part} missing`).toBeDefined();
    }
  });
});

const PANELS: SplitterPanelData[] = [
  { id: "files", minSize: 20, collapsible: true, collapsedSize: 0 },
  { id: "editor", minSize: 30 },
];

function Demo(props: {
  variant?: SplitterVariant;
  orientation?: "horizontal" | "vertical";
  size?: number[];
  defaultSize?: number[];
  disabled?: boolean;
  onResize?: (details: SplitterResizeDetails) => void;
}) {
  return (
    <Splitter.Root
      variant={props.variant}
      orientation={props.orientation}
      panels={PANELS}
      size={props.size}
      defaultSize={props.defaultSize}
      onResize={props.onResize}
      className="workspace"
    >
      <Splitter.Panel id="files">Files</Splitter.Panel>
      <Splitter.ResizeTrigger
        id="files:editor"
        aria-label="Resize files and editor"
        disabled={props.disabled}
      >
        <Splitter.ResizeTriggerIndicator />
      </Splitter.ResizeTrigger>
      <Splitter.Panel id="editor">Editor</Splitter.Panel>
    </Splitter.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="splitter"][data-part="${name}"]`)!;
const panels = () => [
  ...document.querySelectorAll<HTMLElement>(`[data-scope="splitter"][data-part="panel"]`),
];
const separator = () => screen.getByRole("separator", { name: "Resize files and editor" });
const grows = () => panels().map((panel) => Number(panel.style.flexGrow));

describe("Splitter", () => {
  it("applies the recipe to the root part, defaulting to line", () => {
    render(<Demo variant="enclosed" defaultSize={[30, 70]} />);
    expect(part("root").getAttribute("data-variant")).toBe("enclosed");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("resize-trigger").contains(part("resize-trigger-indicator"))).toBe(true);
    expect(panels().map((panel) => panel.getAttribute("data-id"))).toEqual(["files", "editor"]);

    cleanup();
    render(<Demo defaultSize={[30, 70]} />);
    expect(part("root").getAttribute("data-variant")).toBe("line");
  });

  it("forwards native props to Ark's root", () => {
    render(<Demo defaultSize={[30, 70]} />);
    expect(part("root").className).toBe("workspace");
  });

  it("sizes each panel from defaultSize and lays them out in a row", () => {
    render(<Demo defaultSize={[30, 70]} />);
    expect(part("root").style.flexDirection).toBe("row");
    expect(part("root").getAttribute("data-orientation")).toBe("horizontal");
    expect(grows()).toEqual([30, 70]);
    // Each panel keeps Ark's limit along the axis it is resized on.
    expect(panels()[0]!.style.minWidth).toBe("20%");
  });

  it("makes the trigger a separator that controls the panels on both sides", () => {
    render(<Demo defaultSize={[30, 70]} />);
    const trigger = separator();
    expect(trigger).toBe(part("resize-trigger"));
    expect(trigger.getAttribute("aria-valuenow")).toBe("30");
    // The first panel can shrink to its own 20% and grow until the second is at 30%.
    expect(trigger.getAttribute("aria-valuemin")).toBe("20");
    expect(trigger.getAttribute("aria-valuemax")).toBe("70");
    expect(trigger.getAttribute("aria-orientation")).toBe("horizontal");
    expect(trigger.getAttribute("aria-controls")).toBe(
      panels()
        .map((panel) => panel.id)
        .join(" "),
    );
    expect(trigger.tabIndex).toBe(0);
  });

  it("moves the boundary with the arrow keys and reports the new sizes", async () => {
    const user = userEvent.setup();
    const onResize = vi.fn();
    render(<Demo defaultSize={[30, 70]} onResize={onResize} />);
    await user.tab();
    expect(document.activeElement).toBe(separator());
    expect(separator().hasAttribute("data-focus")).toBe(true);
    expect(part("resize-trigger-indicator").hasAttribute("data-focus")).toBe(true);

    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(separator().getAttribute("aria-valuenow")).toBe("31"));
    expect(grows()).toEqual([31, 69]);
    expect(onResize).toHaveBeenLastCalledWith(expect.objectContaining({ size: [31, 69] }));

    // End pushes the boundary until the second panel is at its own 30%.
    await user.keyboard("{End}");
    await waitFor(() => expect(separator().getAttribute("aria-valuenow")).toBe("70"));
  });

  it("collapses the collapsible panel before the trigger with Enter, and opens it again", async () => {
    const user = userEvent.setup();
    render(<Demo defaultSize={[30, 70]} />);
    await user.tab();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(grows()).toEqual([0, 100]));
    // It opens again, at least as wide as its minSize.
    await user.keyboard("{Enter}");
    await waitFor(() => expect(grows()[0]).toBeGreaterThanOrEqual(20));
  });

  it("stands the panels up when vertical", () => {
    render(<Demo orientation="vertical" defaultSize={[30, 70]} />);
    expect(part("root").style.flexDirection).toBe("column");
    expect(separator().getAttribute("aria-orientation")).toBe("vertical");
    expect(part("resize-trigger-indicator").getAttribute("data-orientation")).toBe("vertical");
    expect(panels()[0]!.style.minHeight).toBe("20%");
  });

  it("follows controlled sizes", () => {
    const { rerender } = render(<Demo size={[30, 70]} />);
    rerender(<Demo size={[60, 40]} />);
    expect(grows()).toEqual([60, 40]);
  });

  it("disables a trigger: out of the tab order, marked on it and its grip", () => {
    render(<Demo defaultSize={[30, 70]} disabled />);
    expect(separator().hasAttribute("tabindex")).toBe(false);
    expect(separator().hasAttribute("data-disabled")).toBe(true);
    expect(part("resize-trigger-indicator").hasAttribute("data-disabled")).toBe(true);
  });
});
