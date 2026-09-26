<!--
  Progress — Ark's progress machine: the progressbar's value, the range's
  inline width, the circle and the loading / indeterminate state reach the
  server string.
-->
<script lang="ts">
  import { Progress } from "../../src/exports/progress.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

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
