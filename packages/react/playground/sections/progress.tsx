/**
 * Progress — Ark's progress machine: the progressbar's value and ids, the
 * range's inline width, the circle's inline geometry and the loading /
 * indeterminate state must match both ways.
 */
import { Progress } from "../../src/progress.js";
import type { Section } from "../section.js";

const ProgressSection: Section = () => (
  <section aria-label="progress">
    <Progress.Root value={40}>
      <Progress.Label>Uploading</Progress.Label>
      <Progress.ValueText />
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
    <Progress.Root size="sm" value={75}>
      <Progress.Circle>
        <Progress.CircleTrack />
        <Progress.CircleRange />
      </Progress.Circle>
      <Progress.ValueText />
    </Progress.Root>
    <Progress.Root size="lg" value={null}>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  </section>
);

export default ProgressSection;
