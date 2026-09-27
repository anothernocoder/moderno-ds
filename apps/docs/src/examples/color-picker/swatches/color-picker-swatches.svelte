<script lang="ts">
  import { ColorPicker } from "@moderno-ui/svelte";

  const brand = ["#EF4444", "#F59E0B", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899"];
</script>

<ColorPicker defaultValue="#3B82F6" swatches={brand} />
