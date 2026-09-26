/**
 * Switch — the label ↔ hidden-input pairing by Ark's ids, with the on/off
 * state and the switch role on the server string.
 */
import { Switch } from "../../src/switch.jsx";
import type { Section } from "../section.js";

const SwitchSection: Section = () => (
  <section aria-label="switches">
    <Switch.Root defaultChecked>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Airplane mode</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
    <Switch.Root size="sm" disabled>
      <Switch.Control>
        <Switch.Thumb />
      </Switch.Control>
      <Switch.Label>Bluetooth</Switch.Label>
      <Switch.HiddenInput />
    </Switch.Root>
  </section>
);

export default SwitchSection;
