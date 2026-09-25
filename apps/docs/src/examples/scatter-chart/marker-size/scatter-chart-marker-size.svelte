<!--
  Larger markers: `radius` sets the size of every point in the chart,
  in pixels — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { ScatterChart } from "@moderno-ui/svelte";

  const series = [
    {
      name: "Samples",
      points: [
        { x: 0, y: 12 },
        { x: 1, y: 28 },
        { x: 2, y: 22 },
        { x: 3, y: 40 },
        { x: 4, y: 18 },
        { x: 5, y: 34 },
      ],
    },
  ];
</script>

<ScatterChart width={520} height={260} {series} radius={8} />
