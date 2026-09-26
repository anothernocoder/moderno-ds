<script lang="ts">
  import { Progress } from "@moderno-ui/svelte";
</script>

<Progress.Root defaultValue={null}>
  <Progress.Label>Preparing your download</Progress.Label>
  <Progress.Track>
    <Progress.Range />
  </Progress.Track>
</Progress.Root>
