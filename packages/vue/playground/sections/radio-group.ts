/**
 * RadioGroup — Ark's radio machine: the checked item reaches its parts on the
 * server, every native radio is already there with its checked / disabled
 * state before hydration, and the tile grid carries its media.
 */
import { h } from "vue";
import { RadioGroup } from "../../src/radio-group.js";
import type { Section } from "../section.js";

/** A tile's stand-in thumbnail: one shape in a 4:3 frame. */
const thumbnail = (x: number, y: number, width: number, height: number) =>
  h("svg", { viewBox: "0 0 4 3", "aria-hidden": "true" }, [h("rect", { x, y, width, height })]);

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
    h(
      RadioGroup.Root,
      { variant: "tile", columns: 2, aspectRatio: "4:3", defaultValue: "title" },
      () => [
        h(RadioGroup.Label, {}, () => "Layout"),
        h(RadioGroup.Item, { value: "title" }, () => [
          h(RadioGroup.ItemMedia, {}, () => thumbnail(1, 1, 2, 1)),
          h(RadioGroup.ItemControl),
          h(RadioGroup.ItemText, {}, () => [
            "Title",
            h(RadioGroup.ItemDescription, {}, () => "A heading alone"),
          ]),
          h(RadioGroup.ItemHiddenInput),
        ]),
        h(RadioGroup.Item, { value: "split", disabled: true }, () => [
          h(RadioGroup.ItemMedia, {}, () => thumbnail(0, 0, 2, 3)),
          h(RadioGroup.ItemControl),
          h(RadioGroup.ItemText, {}, () => "Split"),
          h(RadioGroup.ItemHiddenInput),
        ]),
      ],
    ),
  ]);

export default RadioGroupSection;
