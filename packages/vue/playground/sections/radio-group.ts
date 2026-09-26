/**
 * RadioGroup — Ark's radio machine: the checked item reaches its parts on the
 * server, and every native radio is already there with its checked / disabled
 * state before hydration.
 */
import { h } from "vue";
import { RadioGroup } from "../../src/radio-group.js";
import type { Section } from "../section.js";

const RadioGroupSection: Section = () =>
  h("section", { "aria-label": "radio groups" }, [
    h(RadioGroup.Root, { defaultValue: "standard" }, () => [
      h(RadioGroup.Label, {}, () => "Shipping"),
      h(RadioGroup.Item, { value: "standard" }, () => [
        h(RadioGroup.ItemControl),
        h(RadioGroup.ItemText, {}, () => [
          "Standard",
          h(RadioGroup.ItemDescription, {}, () => "3–5 business days"),
        ]),
        h(RadioGroup.ItemHiddenInput),
      ]),
      h(RadioGroup.Item, { value: "express" }, () => [
        h(RadioGroup.ItemControl),
        h(RadioGroup.ItemText, {}, () => [
          "Express",
          h(RadioGroup.ItemDescription, {}, () => "1–2 business days"),
        ]),
        h(RadioGroup.ItemHiddenInput),
      ]),
    ]),
    h(RadioGroup.Root, { size: "sm", orientation: "horizontal", disabled: true }, () => [
      h(RadioGroup.Label, {}, () => "Billing"),
      h(RadioGroup.Item, { value: "monthly" }, () => [
        h(RadioGroup.ItemControl),
        h(RadioGroup.ItemText, {}, () => "Monthly"),
        h(RadioGroup.ItemHiddenInput),
      ]),
      h(RadioGroup.Item, { value: "yearly" }, () => [
        h(RadioGroup.ItemControl),
        h(RadioGroup.ItemText, {}, () => "Yearly"),
        h(RadioGroup.ItemHiddenInput),
      ]),
    ]),
  ]);

export default RadioGroupSection;
