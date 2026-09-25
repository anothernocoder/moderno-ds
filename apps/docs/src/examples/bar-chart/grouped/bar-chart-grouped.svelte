<!--
  Two series grouped side by side inside each category; each paints
  from `--chart-1…5` by its index — @moderno-ui/svelte.

  This file is the Example the docs page shows *and* mounts (CONTEXT.md
  "Example"), so the source under the live demo cannot drift from it.
-->
<script lang="ts">
  import { BarChart } from "@moderno-ui/svelte";

  const categories = ["Q1", "Q2", "Q3", "Q4"];
  const series = [
    { name: "Revenue", values: [8, 14, 11, 20] },
    { name: "Costs", values: [5, 9, 8, 12] },
  ];
</script>

<BarChart width={520} height={260} {categories} {series} yTicks={5} />
