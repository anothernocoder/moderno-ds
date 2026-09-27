/**
 * SparkChart — a plain trend line and a filled one with its last point marked;
 * the SVG is drawn on the server, with no ids and no portal.
 */
import { h } from "vue";
import { SparkChart } from "../../src/spark-chart.js";
import type { Section } from "../section.js";

const visits = [
  { x: 0, y: 12 },
  { x: 1, y: 18 },
  { x: 2, y: 15 },
  { x: 3, y: 24 },
  { x: 4, y: 21 },
  { x: 5, y: 30 },
];

const SparkChartSection: Section = () =>
  h("section", { "aria-label": "spark charts" }, [
    h(SparkChart, { points: visits, "aria-label": "Visits, last 6 days" }),
    h(SparkChart, {
      points: visits,
      area: true,
      showLastPoint: true,
      "aria-label": "Visits, with today marked",
    }),
  ]);

export default SparkChartSection;
