import { describe, expect, it } from "vitest";
import { render } from "svelte/server";
import { barListNodes, chartNodeToSvg } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import BarList from "../src/BarList.svelte";

const list = {
  width: 300,
  labelWidth: 80,
  rowHeight: 28,
  barHeight: 6,
  data: [
    { name: "/pricing", value: 50 },
    { name: "/", value: 100 },
  ],
};

describe("golden-SVG parity (Svelte vs charts-core reference)", () => {
  it("BarList matches the reference serialization", () => {
    const { html } = render(BarList, { props: list });
    expect(normalizeSvg(html)).toBe(normalizeSvg(chartNodeToSvg(barListNodes(list))));
  });
});
