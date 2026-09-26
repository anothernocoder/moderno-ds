<script lang="ts">
  import { Progress } from "@moderno-ui/svelte";
</script>

<Progress.Root defaultValue={3} max={5}>
  <Progress.Label>Profile setup</Progress.Label>
  <Progress.ValueText>3 of 5 steps</Progress.ValueText>
  <Progress.Track>
    <Progress.Range />
  </Progress.Track>
</Progress.Root>
