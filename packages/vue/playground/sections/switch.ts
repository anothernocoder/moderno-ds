/**
 * Switch — Ark's on/off machine: the state reaches every part on the server,
 * and the hidden input already carries the switch role (and its checked
 * state) before hydration.
 */
import { h } from "vue";
import { Switch } from "../../src/switch.js";
import type { Section } from "../section.js";

const SwitchSection: Section = () =>
  h("section", { "aria-label": "switches" }, [
    h(Switch.Root, { defaultChecked: true }, () => [
      h(Switch.Control, {}, () => h(Switch.Thumb)),
      h(Switch.Label, {}, () => "Airplane mode"),
      h(Switch.HiddenInput),
    ]),
    h(Switch.Root, { size: "sm", disabled: true }, () => [
      h(Switch.Control, {}, () => h(Switch.Thumb)),
      h(Switch.Label, {}, () => "Bluetooth"),
      h(Switch.HiddenInput),
    ]),
  ]);

export default SwitchSection;
