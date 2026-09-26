/**
 * Chip — CSS-only; proves the optional remove button reaches the server.
 */
import { Chip } from "../../src/chip.jsx";
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
