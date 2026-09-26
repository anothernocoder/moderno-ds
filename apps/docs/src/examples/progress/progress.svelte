<script lang="ts">
  import { Progress } from "@moderno-ui/svelte";
</script>

<Progress.Root defaultValue={60}>
  <Progress.Label>Uploading photos</Progress.Label>
  <Progress.ValueText />
  <Progress.Track>
    <Progress.Range />
  </Progress.Track>
</Progress.Root>
