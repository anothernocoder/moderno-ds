<!--
  Live LineChart preview — pure SVG over @moderno/charts-core; colour comes from
  the `--chart-*` token slots via the series index, nothing baked in here.
-->
<script lang="ts">
  import { LineChart } from "@moderno/svelte";

  const series = [
    {
      name: "Sessions",
      points: [
        { x: 0, y: 12 },
        { x: 1, y: 28 },
        { x: 2, y: 22 },
        { x: 3, y: 40 },
        { x: 4, y: 36 },
        { x: 5, y: 54 },
      ],
    },
    {
      name: "Signups",
      points: [
        { x: 0, y: 6 },
        { x: 1, y: 10 },
        { x: 2, y: 18 },
        { x: 3, y: 16 },
        { x: 4, y: 30 },
        { x: 5, y: 34 },
      ],
    },
  ];
</script>

<LineChart width={520} height={260} {series} xTicks={6} yTicks={5} />
