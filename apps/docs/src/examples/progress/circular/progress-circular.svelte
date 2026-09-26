<script lang="ts">
  import { Progress } from "@moderno-ui/svelte";
</script>

<Progress.Root defaultValue={75}>
  <Progress.Circle>
    <Progress.CircleTrack />
    <Progress.CircleRange />
  </Progress.Circle>
  <Progress.ValueText />
</Progress.Root>
