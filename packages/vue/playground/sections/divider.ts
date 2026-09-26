/**
 * Divider — CSS-only: the bare rule keeps its separator role, the captioned
 * one its label part, in both orientations (the captioned vertical rule is the
 * one whose gap depends on the label's rotated writing mode).
 */
import { h } from "vue";
import { Divider } from "../../src/divider.js";
import type { Section } from "../section.js";

const DividerSection: Section = () =>
  h("section", { "aria-label": "dividers" }, [
    h(Divider),
    h(Divider, { align: "start" }, () => "Or"),
    h(Divider, { orientation: "vertical" }),
    h(Divider, { orientation: "vertical" }, () => "Or"),
  ]);

export default DividerSection;
