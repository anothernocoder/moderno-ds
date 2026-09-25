<script lang="ts">
  import { Indicator } from "../../src/index.js";
  import type { ComponentProps } from "svelte";

  type IndicatorProps = ComponentProps<typeof Indicator>;
  // `label` stands in for the children snippet, which can't be passed as a
  // plain prop from @testing-library/svelte's `render`.
  let { label, ...rest }: Omit<IndicatorProps, "children"> & { label?: string } = $props();
</script>

{#if label === undefined}
  <Indicator {...rest} />
{:else}
  <Indicator {...rest}>{label}</Indicator>
{/if}
