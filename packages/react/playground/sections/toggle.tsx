/**
 * Toggle — Ark's toggle machine on a native button; the pressed state
 * (aria-pressed, data-state), the Indicator's on/off content and the disabled
 * button must match both ways.
 */
import { Toggle } from "../../src/toggle.js";
import type { Section } from "../section.js";

const ToggleSection: Section = () => (
  <section aria-label="toggles">
    <Toggle.Root defaultPressed>
      <Toggle.Indicator fallback="☆">★</Toggle.Indicator>
      Favorite
    </Toggle.Root>
    <Toggle.Root variant="outline" size="sm" disabled>
      <Toggle.Indicator fallback="☆">★</Toggle.Indicator>
      Pin
    </Toggle.Root>
  </section>
);

export default ToggleSection;
