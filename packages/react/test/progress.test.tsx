// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Progress, type ProgressSize } from "../src/index.js";

afterEach(cleanup);

describe("Progress surface (React)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Progress: ArkProgress } = await import("@ark-ui/react");
    for (const part of Object.keys(ArkProgress)) {
      if (part === "Root") continue; // wrapped below
      expect(Progress[part as keyof typeof Progress], `Progress.${part} missing`).toBeDefined();
    }
  });
});

function Linear(props: { size?: ProgressSize; value?: number | null; max?: number }) {
  return (
    <Progress.Root size={props.size} value={props.value} max={props.max} className="upload">
      <Progress.Label>Uploading</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
      <Progress.View state="complete">Done</Progress.View>
    </Progress.Root>
  );
}

function Circular(props: { value?: number | null }) {
  return (
    <Progress.Root value={props.value}>
      <Progress.Circle>
        <Progress.CircleTrack />
        <Progress.CircleRange />
      </Progress.Circle>
      <Progress.ValueText />
    </Progress.Root>
  );
}

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="progress"][data-part="${name}"]`)!;

describe("Progress", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(<Linear size="lg" value={40} />);
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("track").contains(part("range"))).toBe(true);

    cleanup();
    render(<Linear value={40} />);
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(<Linear value={40} />);
    expect(part("root").className).toBe("upload");
  });

  it("makes the track a progressbar that reports the value and fills the range", () => {
    render(<Linear value={40} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBe(part("track"));
    expect(bar.getAttribute("aria-valuenow")).toBe("40");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(part("range").style.width).toBe("40%");
    expect(part("value-text").textContent).toBe("40%");
    expect(part("label").textContent).toBe("Uploading");
    for (const name of ["root", "track", "range"]) {
      expect(part(name).getAttribute("data-state"), name).toBe("loading");
    }
    expect(part("view").hidden).toBe(true);
  });

  it("measures the value against min and max", () => {
    render(<Linear value={3} max={4} />);
    expect(part("range").style.width).toBe("75%");
    expect(part("value-text").textContent).toBe("75%");
  });

  it("follows a controlled value and marks the end as complete", () => {
    const { rerender } = render(<Linear value={40} />);
    rerender(<Linear value={100} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(part("range").style.width).toBe("100%");
    expect(part("root").getAttribute("data-state")).toBe("complete");
    expect(part("view").hidden).toBe(false);
    expect(part("view").textContent).toBe("Done");
  });

  it("is indeterminate when the value is null: no value, no width", () => {
    render(<Linear value={null} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    for (const name of ["root", "track", "range"]) {
      expect(part(name).getAttribute("data-state"), name).toBe("indeterminate");
    }
    expect(part("range").style.width).toBe("");
    expect(part("value-text").textContent).toBe("");
  });

  it("draws a circular progressbar from two circles", () => {
    render(<Circular value={25} />);
    const circle = screen.getByRole("progressbar");
    expect(circle).toBe(part("circle"));
    expect(circle.tagName.toLowerCase()).toBe("svg");
    expect(circle.getAttribute("aria-valuenow")).toBe("25");
    expect(circle.contains(part("circle-track"))).toBe(true);
    expect(circle.contains(part("circle-range"))).toBe(true);
    expect(part("circle-range").getAttribute("data-state")).toBe("loading");
    expect(part("value-text").textContent).toBe("25%");

    cleanup();
    render(<Circular value={null} />);
    expect(part("circle-range").getAttribute("data-state")).toBe("indeterminate");
  });
});
