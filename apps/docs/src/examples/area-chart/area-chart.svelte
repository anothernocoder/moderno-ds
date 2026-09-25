<!--
  A single series filled from the value-0 baseline; its colour comes
  from the `--chart-1` token slot, nothing baked in here — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { AreaChart } from "@moderno-ui/svelte";

  const series = [
    {
      name: "Revenue",
      points: [
        { x: 0, y: 8 },
        { x: 1, y: 14 },
        { x: 2, y: 11 },
        { x: 3, y: 20 },
        { x: 4, y: 18 },
        { x: 5, y: 26 },
      ],
    },
  ];
</script>

<AreaChart width={520} height={260} {series} xTicks={6} yTicks={5} />
