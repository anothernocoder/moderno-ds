<!--
  Two groups of samples on one frame; each paints from `--chart-1…5`
  by its series index — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { ScatterChart } from "@moderno-ui/svelte";

  const series = [
    {
      name: "Group A",
      points: [
        { x: 1, y: 8 },
        { x: 1.5, y: 12 },
        { x: 2, y: 10 },
        { x: 2.5, y: 15 },
        { x: 3, y: 13 },
        { x: 3.5, y: 18 },
      ],
    },
    {
      name: "Group B",
      points: [
        { x: 4, y: 30 },
        { x: 4.5, y: 26 },
        { x: 5, y: 34 },
        { x: 5.5, y: 31 },
        { x: 6, y: 38 },
        { x: 6.5, y: 35 },
      ],
    },
  ];
</script>

<ScatterChart width={520} height={260} {series} />
