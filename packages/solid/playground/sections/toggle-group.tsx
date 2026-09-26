/**
 * ToggleGroup — Ark's toggle-group machine on native buttons; the pressed
 * state (aria-checked, aria-pressed, data-state), the group's role and
 * orientation, and the disabled buttons must reach the server.
 */
import { ToggleGroup } from "../../src/toggle-group.jsx";
import type { Section } from "../section.js";

const ToggleGroupSection: Section = () => (
  <section aria-label="toggle groups">
    <ToggleGroup.Root defaultValue={["center"]} aria-label="Text alignment">
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
    </ToggleGroup.Root>
    <ToggleGroup.Root
      variant="outline"
      size="lg"
      orientation="vertical"
      multiple
      disabled
      aria-label="Text style"
    >
      <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
    </ToggleGroup.Root>
  </section>
);

export default ToggleGroupSection;
