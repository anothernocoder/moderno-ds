/**
 * Indicator — CSS-only status dot: the bare `data-pulse` flag and the
 * optional label serialise on the right element.
 */
import { h } from "vue";
import { Indicator } from "../../src/indicator.js";
import type { Section } from "../section.js";

const IndicatorSection: Section = () =>
  h("section", { "aria-label": "indicators" }, [
    h(Indicator, { variant: "success", pulse: true }, () => "Online"),
    h(Indicator, { variant: "error", size: "sm", "aria-label": "Offline" }),
  ]);

export default IndicatorSection;
