/**
 * ToggleGroup — Ark's toggle-group machine on native buttons: each group
 * carries its role and orientation, and each item its pressed or checked
 * state.
 */
import { h } from "vue";
import { ToggleGroup } from "../../src/toggle-group.js";
import type { Section } from "../section.js";

const ToggleGroupSection: Section = () =>
  h("section", { "aria-label": "toggle groups" }, [
    h(ToggleGroup.Root, { defaultValue: ["center"], "aria-label": "Text alignment" }, () => [
      h(ToggleGroup.Item, { value: "left" }, () => "Left"),
      h(ToggleGroup.Item, { value: "center" }, () => "Center"),
    ]),
    h(
      ToggleGroup.Root,
      {
        variant: "outline",
        size: "lg",
        orientation: "vertical",
        multiple: true,
        disabled: true,
        "aria-label": "Text style",
      },
      () => [
        h(ToggleGroup.Item, { value: "bold" }, () => "Bold"),
        h(ToggleGroup.Item, { value: "italic" }, () => "Italic"),
      ],
    ),
  ]);

export default ToggleGroupSection;
