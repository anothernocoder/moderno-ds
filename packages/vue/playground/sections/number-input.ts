/**
 * NumberInput — Ark's number-input machine: each input reaches the server as
 * a spinbutton with its value, bounds and formatted text, and a stepper at its
 * bound is already disabled.
 */
import { h } from "vue";
import { NumberInput } from "../../src/number-input.js";
import type { Section } from "../section.js";

const NumberInputSection: Section = () =>
  h("section", { "aria-label": "number-input" }, [
    h(NumberInput.Root, { defaultValue: "10", min: 0, max: 10 }, () => [
      h(NumberInput.Label, {}, () => "Quantity"),
      h(NumberInput.Control, {}, () => [
        h(NumberInput.Input),
        h(NumberInput.DecrementTrigger, {}, () => "−"),
        h(NumberInput.IncrementTrigger, {}, () => "+"),
      ]),
    ]),
    h(
      NumberInput.Root,
      {
        size: "sm",
        defaultValue: "1234.5",
        formatOptions: { style: "currency", currency: "USD" },
      },
      () => [
        h(NumberInput.Label, {}, () => "Price"),
        h(NumberInput.Control, {}, () => [
          h(NumberInput.Input),
          h(NumberInput.DecrementTrigger, {}, () => "−"),
          h(NumberInput.IncrementTrigger, {}, () => "+"),
        ]),
      ],
    ),
  ]);

export default NumberInputSection;
