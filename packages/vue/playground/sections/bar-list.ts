/**
 * BarList — a ranking drawn on the server as one SVG, rows sorted largest
 * first, with no ids and no portal.
 */
import { h } from "vue";
import { BarList } from "../../src/bar-list.js";
import type { Section } from "../section.js";

const pages = [
  { name: "/blog", value: 320 },
  { name: "/", value: 1240 },
  { name: "/pricing", value: 860 },
  { name: "/docs", value: 540 },
];

const BarListSection: Section = () =>
  h("section", { "aria-label": "bar list" }, [
    h(BarList, { width: 320, data: pages, "aria-label": "Visits by page" }),
  ]);

export default BarListSection;
