<!--
  Live AreaChart preview — pure SVG over @moderno/charts-core; colour comes from
  the `--chart-*` token slots via the series index, nothing baked in here.
-->
<script lang="ts">
  import { AreaChart } from "@moderno/svelte";

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
