<script lang="ts">
  import { Progress } from "@moderno-ui/svelte";
</script>

<Progress.Root defaultValue={70} orientation="vertical">
  <Progress.Label>Storage</Progress.Label>
  <Progress.ValueText />
  <Progress.Track>
    <Progress.Range />
  </Progress.Track>
</Progress.Root>
