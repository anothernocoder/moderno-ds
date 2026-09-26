/**
 * Spinner — a CSS-only loading state; the status role, ring and label match
 * both ways.
 */
import { Spinner } from "../../src/spinner.js";
import type { Section } from "../section.js";

const SpinnerSection: Section = () => (
  <section aria-label="spinners">
    <Spinner />
    <Spinner size="lg" label="Saving changes" />
  </section>
);

export default SpinnerSection;
