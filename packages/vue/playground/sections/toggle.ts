/**
 * Toggle — Ark's toggle machine on a native button: the pressed state reaches
 * the server string, and the Indicator renders its on or off content.
 */
import { h } from "vue";
import { Toggle } from "../../src/toggle.js";
import type { Section } from "../section.js";

const ToggleSection: Section = () =>
  h("section", { "aria-label": "toggles" }, [
    h(Toggle.Root, { defaultPressed: true }, () => [
      h(Toggle.Indicator, null, { default: () => "★", fallback: () => "☆" }),
      "Favorite",
    ]),
    h(Toggle.Root, { variant: "outline", size: "sm", disabled: true }, () => [
      h(Toggle.Indicator, null, { default: () => "★", fallback: () => "☆" }),
      "Pin",
    ]),
  ]);

export default ToggleSection;
