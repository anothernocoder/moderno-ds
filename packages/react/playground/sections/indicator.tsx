/**
 * Indicator — CSS-only; proves the optional label and the bare `data-pulse`
 * attribute serialise identically both ways.
 */
import { Indicator } from "../../src/indicator.js";
import type { Section } from "../section.js";

const IndicatorSection: Section = () => (
  <section aria-label="indicators">
    <Indicator variant="success" pulse>
      Online
    </Indicator>
    <Indicator variant="error" size="sm" aria-label="Offline" />
  </section>
);

export default IndicatorSection;
