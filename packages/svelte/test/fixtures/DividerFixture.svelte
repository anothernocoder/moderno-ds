<script lang="ts">
  import { Divider } from "../../src/index.js";
  import type { ComponentProps } from "svelte";

  type DividerProps = ComponentProps<typeof Divider>;
  // `label` stands in for the children snippet, which can't be passed as a
  // plain prop from @testing-library/svelte's `render`.
  let { label, ...rest }: Omit<DividerProps, "children"> & { label?: string } = $props();
</script>

{#if label === undefined}
  <Divider {...rest} />
{:else}
  <Divider {...rest}>{label}</Divider>
{/if}
