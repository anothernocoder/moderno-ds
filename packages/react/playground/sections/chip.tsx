/**
 * Chip — CSS-only; proves the optional remove button serialises identically
 * both ways.
 */
import { Chip } from "../../src/chip.js";
import type { Section } from "../section.js";

const ChipSection: Section = () => (
  <section aria-label="chips">
    <Chip>Design</Chip>
    <Chip variant="muted" size="sm" removable removeLabel="Remove React">
      React
    </Chip>
  </section>
);

export default ChipSection;
