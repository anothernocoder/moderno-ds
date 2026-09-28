/**
 * SegmentedControl — one native radio per segment, each named by its text;
 * the checked segment, the sizes, fullWidth, a disabled segment and a
 * disabled control reach the server. The indicator has no box on the server,
 * so it stays hidden until the client measures the checked segment.
 */
import { h } from "vue";
import { SegmentedControl } from "../../src/segmented-control.js";
import type { Section } from "../section.js";

const segment = (value: string, label: string, disabled?: boolean) =>
  h(SegmentedControl.Item, { value, disabled }, () => [
    h(SegmentedControl.ItemText, {}, () => label),
    h(SegmentedControl.ItemHiddenInput),
  ]);

const SegmentedControlSection: Section = () =>
  h("section", { "aria-label": "segmented controls" }, [
    h(SegmentedControl.Root, { defaultValue: "fill", "aria-label": "Scale" }, () => [
      h(SegmentedControl.Indicator),
      segment("fit", "Fit"),
      segment("fill", "Fill"),
      segment("stretch", "Stretch", true),
    ]),
    h(
      SegmentedControl.Root,
      { size: "sm", fullWidth: true, disabled: true, modelValue: "week", "aria-label": "Period" },
      () => [h(SegmentedControl.Indicator), segment("day", "Day"), segment("week", "Week")],
    ),
  ]);

export default SegmentedControlSection;
