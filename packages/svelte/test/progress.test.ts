import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/svelte";
import { Progress } from "../src/index.js";
import Demo from "./fixtures/ProgressFixture.svelte";

afterEach(cleanup);

describe("Progress surface (Svelte)", () => {
  it("exposes every Ark part, not a hand-maintained subset", async () => {
    const { Progress: ArkProgress } = await import("@ark-ui/svelte");
    for (const part of Object.keys(ArkProgress)) {
      if (part === "Root") continue; // wrapped below
      expect(Progress[part as keyof typeof Progress], `Progress.${part} missing`).toBeDefined();
    }
  });
});

const part = (name: string) =>
  document.querySelector<HTMLElement>(`[data-scope="progress"][data-part="${name}"]`)!;

describe("Progress", () => {
  it("applies the recipe to the root part, defaulting to md", () => {
    render(Demo, { props: { size: "lg" as const, value: 40 } });
    expect(part("root").getAttribute("data-size")).toBe("lg");
    // Ark's own anatomy is intact around the recipe attribute.
    expect(part("track").contains(part("range"))).toBe(true);

    cleanup();
    render(Demo, { props: { value: 40 } });
    expect(part("root").getAttribute("data-size")).toBe("md");
  });

  it("forwards native props to Ark's root", () => {
    render(Demo, { props: { value: 40 } });
    expect(part("root").className).toBe("upload");
  });

  it("makes the track a progressbar that reports the value and fills the range", () => {
    render(Demo, { props: { value: 40 } });
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
    render(Demo, { props: { value: 3, max: 4 } });
    expect(part("range").style.width).toBe("75%");
    expect(part("value-text").textContent).toBe("75%");
  });

  it("follows a controlled value and marks the end as complete", async () => {
    const { rerender } = render(Demo, { props: { value: 40 } });
    await rerender({ value: 100 });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(part("range").style.width).toBe("100%");
    expect(part("root").getAttribute("data-state")).toBe("complete");
    expect(part("view").hidden).toBe(false);
    expect(part("view").textContent).toBe("Done");
  });

  it("is indeterminate when the value is null: no value, no width", () => {
    render(Demo, { props: { value: null } });
    const bar = screen.getByRole("progressbar");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    for (const name of ["root", "track", "range"]) {
      expect(part(name).getAttribute("data-state"), name).toBe("indeterminate");
    }
    expect(part("range").style.width).toBe("");
    expect(part("value-text").textContent).toBe("");
  });

  it("draws a circular progressbar from two circles", () => {
    render(Demo, { props: { circular: true, value: 25 } });
    const circle = screen.getByRole("progressbar");
    expect(circle).toBe(part("circle"));
    expect(circle.tagName.toLowerCase()).toBe("svg");
    expect(circle.getAttribute("aria-valuenow")).toBe("25");
    expect(circle.contains(part("circle-track"))).toBe(true);
    expect(circle.contains(part("circle-range"))).toBe(true);
    expect(part("circle-range").getAttribute("data-state")).toBe("loading");
    expect(part("value-text").textContent).toBe("25%");

    cleanup();
    render(Demo, { props: { circular: true, value: null } });
    expect(part("circle-range").getAttribute("data-state")).toBe("indeterminate");
  });
});
