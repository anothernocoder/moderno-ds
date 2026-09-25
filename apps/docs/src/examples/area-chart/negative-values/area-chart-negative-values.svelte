<!--
  A series that crosses zero; the area fills from the value-0
  baseline, so negative values fill downward with no extra prop — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { AreaChart } from "@moderno-ui/svelte";

  const series = [
    {
      name: "Net cash flow",
      points: [
        { x: 0, y: 6 },
        { x: 1, y: 2 },
        { x: 2, y: -4 },
        { x: 3, y: -1 },
        { x: 4, y: 5 },
        { x: 5, y: 9 },
      ],
    },
  ];
</script>

<AreaChart width={520} height={260} {series} xTicks={6} yTicks={5} />
