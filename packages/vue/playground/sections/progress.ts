/**
 * Progress — Ark's progress machine: the track or the circle is the
 * progressbar with its value, the percentage is inline on the range, and an
 * indeterminate progress has neither.
 */
import { h } from "vue";
import { Progress } from "../../src/progress.js";
import type { Section } from "../section.js";

const ProgressSection: Section = () =>
  h("section", { "aria-label": "progress" }, [
    h(Progress.Root, { modelValue: 40 }, () => [
      h(Progress.Label, {}, () => "Uploading"),
      h(Progress.ValueText),
      h(Progress.Track, {}, () => h(Progress.Range)),
    ]),
    h(Progress.Root, { size: "sm", modelValue: 75 }, () => [
      h(Progress.Circle, {}, () => [h(Progress.CircleTrack), h(Progress.CircleRange)]),
      h(Progress.ValueText),
    ]),
    h(Progress.Root, { size: "lg", modelValue: null }, () => [
      h(Progress.Track, {}, () => h(Progress.Range)),
    ]),
  ]);

export default ProgressSection;
