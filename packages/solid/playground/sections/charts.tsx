/**
 * Charts — the four chart types over one shared sample dataset (Phase 4
 * deliverable): the SVG is drawn on the server.
 */
import { AreaChart, BarChart, LineChart, ScatterChart } from "../../src/charts.jsx";
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

const ChartsSection: Section = () => (
  <section aria-label="charts">
    <LineChart width={320} height={180} series={sales} />
    <AreaChart width={320} height={180} series={sales} />
    <BarChart width={320} height={180} categories={quarters} series={revenue} />
    <ScatterChart width={320} height={180} series={sales} />
  </section>
);

export default ChartsSection;
