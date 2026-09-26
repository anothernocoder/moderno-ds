/**
 * Checkbox — Ark's checkbox machine: its checked / indeterminate state
 * serialises, and the label ↔ hidden-input pairing comes from `useId`.
 */
import { h, type Component } from "vue";
import { Checkbox } from "../../src/checkbox.js";
import type { Section } from "../section.js";

const CheckboxSection: Section = () =>
  h("section", { "aria-label": "checkboxes" }, [
    h(Checkbox.Root as unknown as Component, { defaultChecked: true }, () => [
      h(Checkbox.Control, {}, () => [
        h(Checkbox.Indicator, {}, () => "✓"),
        h(Checkbox.Indicator, { indeterminate: true }, () => "–"),
      ]),
      h(Checkbox.Label, {}, () => "Email me updates"),
      h(Checkbox.HiddenInput),
    ]),
    h(
      Checkbox.Root as unknown as Component,
      { size: "sm", defaultChecked: "indeterminate" },
      () => [
        h(Checkbox.Control, {}, () => [
          h(Checkbox.Indicator, {}, () => "✓"),
          h(Checkbox.Indicator, { indeterminate: true }, () => "–"),
        ]),
        h(Checkbox.Label, {}, () => "Select all"),
        h(Checkbox.HiddenInput),
      ],
    ),
    h(Checkbox.Root as unknown as Component, { size: "lg", disabled: true }, () => [
      h(Checkbox.Control, {}, () => h(Checkbox.Indicator, {}, () => "✓")),
      h(Checkbox.Label, {}, () => "Unavailable"),
      h(Checkbox.HiddenInput),
    ]),
  ]);

export default CheckboxSection;
