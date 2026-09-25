<script lang="ts">
  import { BarChart } from "@moderno-ui/svelte";

  const categories = ["Q1", "Q2", "Q3", "Q4"];
  const series = [{ name: "Revenue", values: [8, 14, 11, 20] }];
</script>

<BarChart width={520} height={260} {categories} {series} yTicks={5} />
