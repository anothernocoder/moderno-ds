<!--
  Live BarChart preview — pure SVG over @moderno/charts-core; colour comes from
  the `--chart-*` token slots via the series index, nothing baked in here.
-->
<script lang="ts">
  import { BarChart } from "@moderno/svelte";

  const categories = ["Q1", "Q2", "Q3", "Q4"];
  const series = [
    { name: "Revenue", values: [8, 14, 11, 20] },
    { name: "Costs", values: [5, 9, 8, 12] },
  ];
</script>

<BarChart width={520} height={260} {categories} {series} yTicks={5} />
