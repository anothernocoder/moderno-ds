/**
 * ColorPicker — Ark's color-picker machine behind one component. The
 * trigger's and the thumbs' ids come from Ark; the popover is rendered in
 * place (`portalled: false`), so the closed area, sliders and hex box reach
 * the server string and hydrate too; `open` mounts the first picker open. The
 * second sits in a Field (its label names the trigger), with the alpha slider
 * and preset swatches. The eyedropper waits for the browser, so neither
 * server string has one.
 */
import { h } from "vue";
import { ColorPicker } from "../../src/color-picker.js";
import { Field } from "../../src/field.js";
import type { Section } from "../section.js";

const ColorPickerSection: Section = ({ open }) =>
  h("section", { "aria-label": "color-picker" }, [
    h(ColorPicker, { defaultValue: "#1E90FF", defaultOpen: open, portalled: false }),
    h(Field.Root, {}, () => [
      h(Field.Label, {}, () => "Brand color"),
      h(ColorPicker, {
        size: "sm",
        alpha: true,
        defaultValue: "#1E90FF80",
        swatches: ["#EF4444", "#22C55E", "#3B82F680"],
        portalled: false,
      }),
      h(Field.HelperText, {}, () => "Used for buttons and links."),
    ]),
  ]);

export default ColorPickerSection;
