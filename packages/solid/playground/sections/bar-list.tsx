/**
 * BarList — a ranking drawn on the server as one SVG, rows sorted largest
 * first.
 */
import { BarList } from "../../src/bar-list.jsx";
import type { Section } from "../section.js";

const pages = [
  { name: "/blog", value: 320 },
  { name: "/", value: 1240 },
  { name: "/pricing", value: 860 },
  { name: "/docs", value: 540 },
];

const BarListSection: Section = () => (
  <section aria-label="bar list">
    <BarList width={320} data={pages} aria-label="Visits by page" />
  </section>
);

export default BarListSection;
