/**
 * Spinner — CSS-only loading state: the status role, the hidden ring and the
 * label serialise on the right elements.
 */
import { h } from "vue";
import { Spinner } from "../../src/spinner.js";
import type { Section } from "../section.js";

const SpinnerSection: Section = () =>
  h("section", { "aria-label": "spinners" }, [
    h(Spinner),
    h(Spinner, { size: "lg", label: "Saving changes" }),
  ]);

export default SpinnerSection;
