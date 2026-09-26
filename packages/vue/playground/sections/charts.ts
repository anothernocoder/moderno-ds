/**
 * Charts — the four chart types over one shared sample dataset (Phase 4
 * deliverable): the SVG is drawn on the server, with no ids and no portal.
 */
import { h } from "vue";
import { AreaChart, BarChart, LineChart, ScatterChart } from "../../src/charts.js";
import type { Section } from "../section.js";

const sales = [
  {
    name: "2023",
    points: [
      { x: 0, y: 10 },
      { x: 1, y: 40 },
      { x: 2, y: 30 },
      { x: 3, y: 55 },
      { x: 4, y: 48 },
    ],
  },
  {
    name: "2024",
    points: [
      { x: 0, y: 5 },
      { x: 1, y: 18 },
      { x: 2, y: 25 },
      { x: 3, y: 22 },
      { x: 4, y: 35 },
    ],
  },
];
const quarters = ["Q1", "Q2", "Q3", "Q4"];
const revenue = [{ name: "revenue", values: [12, 28, 19, 34] }];

const ChartsSection: Section = () =>
  h("section", { "aria-label": "charts" }, [
    h(LineChart, { width: 320, height: 180, series: sales }),
    h(AreaChart, { width: 320, height: 180, series: sales }),
    h(BarChart, { width: 320, height: 180, categories: quarters, series: revenue }),
    h(ScatterChart, { width: 320, height: 180, series: sales }),
  ]);

export default ChartsSection;
