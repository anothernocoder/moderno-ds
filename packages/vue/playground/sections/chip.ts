/**
 * Chip — CSS-only tag: the optional remove trigger serialises with its
 * accessible name.
 */
import { h } from "vue";
import { Chip } from "../../src/chip.js";
import type { Section } from "../section.js";

const ChipSection: Section = () =>
  h("section", { "aria-label": "chips" }, [
    h(Chip, {}, () => "Design"),
    h(
      Chip,
      { variant: "muted", size: "sm", removable: true, removeLabel: "Remove React" },
      () => "React",
    ),
  ]);

export default ChipSection;
