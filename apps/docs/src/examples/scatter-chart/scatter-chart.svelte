<!--
  Live ScatterChart preview — pure SVG over @moderno-ui/charts-core; colour comes
  from the `--chart-*` token slots via the series index, nothing baked in here.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example") — the source below the live demo is this file, raw-imported, so
  it cannot drift from what actually renders.
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

<ScatterChart width={520} height={260} {series} radius={4} />
