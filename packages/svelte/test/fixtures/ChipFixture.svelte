<script lang="ts">
  import { Chip } from "../../src/index.js";
  import type { ComponentProps } from "svelte";

  type ChipProps = ComponentProps<typeof Chip>;
  // `label` stands in for the children snippet, which can't be passed as a
  // plain prop from @testing-library/svelte's `render`.
  let { label = "React", ...rest }: Omit<ChipProps, "children"> & { label?: string } = $props();
</script>

<Chip {...rest}>{label}</Chip>
