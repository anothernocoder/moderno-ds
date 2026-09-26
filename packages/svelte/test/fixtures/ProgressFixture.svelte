<script lang="ts">
  import { Progress } from "../../src/index.js";
  import type { ProgressSize } from "../../src/index.js";

  let {
    size = undefined,
    value = undefined,
    max = undefined,
    circular = false,
  }: {
    size?: ProgressSize;
    value?: number | null;
    max?: number;
    circular?: boolean;
  } = $props();
</script>

{#if circular}
  <Progress.Root {size} {value} {max}>
    <Progress.Circle>
      <Progress.CircleTrack />
      <Progress.CircleRange />
    </Progress.Circle>
    <Progress.ValueText />
  </Progress.Root>
{:else}
  <Progress.Root {size} {value} {max} class="upload">
    <Progress.Label>Uploading</Progress.Label>
    <Progress.ValueText />
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
    <Progress.View state="complete">Done</Progress.View>
  </Progress.Root>
{/if}
