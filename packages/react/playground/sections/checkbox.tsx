/**
 * Checkbox — a label bound to a visually hidden native input by `useId`, plus
 * indicators the machine hides via the `hidden` attribute.
 */
import { Checkbox } from "../../src/checkbox.js";
import type { Section } from "../section.js";

const CheckboxSection: Section = () => (
  <section aria-label="checkboxes">
    <Checkbox.Root defaultChecked>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Email me updates</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root size="sm" defaultChecked="indeterminate">
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
        <Checkbox.Indicator indeterminate>–</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Select all</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
    <Checkbox.Root size="lg" disabled>
      <Checkbox.Control>
        <Checkbox.Indicator>✓</Checkbox.Indicator>
      </Checkbox.Control>
      <Checkbox.Label>Unavailable</Checkbox.Label>
      <Checkbox.HiddenInput />
    </Checkbox.Root>
  </section>
);

export default CheckboxSection;
