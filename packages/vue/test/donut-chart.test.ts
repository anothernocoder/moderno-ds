import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/vue";
import { DonutChart } from "../src/donut-chart.js";

afterEach(cleanup);

const traffic = [
  { name: "Direct", value: 456 },
  { name: "Social", value: 0 },
  { name: "Search", value: 351 },
];

const props = { width: 160, height: 160, data: traffic };

describe("DonutChart (Vue)", () => {
  it("renders one slice per positive value, each in the series of its data index", () => {
    const { container } = render(DonutChart, { props });
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("data-scope")).toBe("chart");
    expect(svg.getAttribute("data-chart")).toBe("donut");
    expect(svg.getAttribute("viewBox")).toBe("0 0 160 160");

    const series = [...svg.querySelectorAll('[data-part="series"]')];
    expect(series.map((g) => g.getAttribute("data-series"))).toEqual(["0", "2"]);
    const slices = svg.querySelectorAll('[data-part="slice"]');
    expect(slices).toHaveLength(2);
    expect(slices[0]!.getAttribute("d")).toMatch(/^M/);
  });

  it("bakes in no colour: slices paint from --chart-* through components.css", () => {
    const { container } = render(DonutChart, { props });
    for (const slice of container.querySelectorAll('[data-part="slice"]')) {
      expect(slice.getAttribute("fill")).toBeNull();
      expect(slice.getAttribute("stroke")).toBeNull();
      expect(slice.getAttribute("style")).toBeNull();
    }
  });

  it("has no axes or grid", () => {
    const { container } = render(DonutChart, { props });
    expect(container.querySelector('[data-part="grid"]')).toBeNull();
    expect(container.querySelector('[data-part="axis-line"]')).toBeNull();
    expect(container.querySelector('[data-part="tick-label"]')).toBeNull();
  });

  it("forwards native attributes but keeps the contract attributes", () => {
    const { container } = render(DonutChart, {
      props,
      attrs: { "aria-label": "Traffic by source", class: "kpi", "data-chart": "pie" },
    });
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-label")).toBe("Traffic by source");
    expect(svg.getAttribute("class")).toBe("kpi");
    expect(svg.getAttribute("data-chart")).toBe("donut");
  });

  it("redraws when the data changes", async () => {
    const { container, rerender } = render(DonutChart, { props });
    await rerender({ data: [{ value: 1 }] });
    expect(container.querySelectorAll('[data-part="slice"]')).toHaveLength(1);
  });
});
