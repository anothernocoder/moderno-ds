/**
 * Spinner — a CSS-only loading state; the status role, ring and label reach
 * the server.
 */
import { Spinner } from "../../src/spinner.jsx";
import type { Section } from "../section.js";

const SpinnerSection: Section = () => (
  <section aria-label="spinners">
    <Spinner />
    <Spinner size="lg" label="Saving changes" />
  </section>
);

export default SpinnerSection;
