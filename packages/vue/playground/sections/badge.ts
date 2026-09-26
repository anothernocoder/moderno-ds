/**
 * Badge — CSS-only status label: the optional dot part has to serialise on
 * the right element.
 */
import { h } from "vue";
import { Badge } from "../../src/badge.js";
import type { Section } from "../section.js";

const BadgeSection: Section = () =>
  h("section", { "aria-label": "badges" }, [
    h(Badge, {}, () => "Draft"),
    h(Badge, { variant: "success", dot: true }, () => "Paid"),
    h(Badge, { variant: "error", size: "sm" }, () => "Overdue"),
  ]);

export default BadgeSection;
