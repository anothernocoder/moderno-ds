import { describe, expect, it } from "vitest";
import { renderToString } from "solid-js/web";
import { barListNodes, chartNodeToSvg } from "@moderno-ui/charts-core";
import { normalizeSvg } from "../../charts-core/test/svg-parity.ts";
import { BarList } from "../src/bar-list.jsx";

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

describe("golden-SVG parity (Solid vs charts-core reference)", () => {
  it("BarList matches the reference serialization", () => {
    expect(normalizeSvg(renderToString(() => <BarList {...list} />))).toBe(
      normalizeSvg(chartNodeToSvg(barListNodes(list))),
    );
  });
});
