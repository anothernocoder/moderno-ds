<script lang="ts">
  import { BarList } from "@moderno-ui/svelte";

  const teams = [
    { name: "Design", value: 82 },
    { name: "Engineering", value: 64 },
    { name: "Marketing", value: 45 },
    { name: "Sales", value: 30 },
  ];
  const format = (value: number) => `${value}%`;
</script>

<BarList width={420} data={teams} max={100} {format} aria-label="Goal progress by team" />
