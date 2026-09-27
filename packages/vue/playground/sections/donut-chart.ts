/**
 * DonutChart — a ring and a pie over one traffic split, the second with a zero
 * share and a gap between slices: the SVG is drawn on the server.
 */
import { h } from "vue";
import { DonutChart } from "../../src/donut-chart.js";
import type { Section } from "../section.js";

const traffic = [
  { name: "Direct", value: 456 },
  { name: "Search", value: 351 },
  { name: "Referral", value: 271 },
];
const withEmpty = [...traffic.slice(0, 1), { name: "Social", value: 0 }, ...traffic.slice(1)];

const DonutChartSection: Section = () =>
  h("section", { "aria-label": "donut chart" }, [
    h(DonutChart, { width: 180, height: 180, data: traffic, "aria-label": "Traffic by source" }),
    h(DonutChart, { width: 180, height: 180, data: withEmpty, innerRadius: 0, padAngle: 0.02 }),
  ]);

export default DonutChartSection;
