<script lang="ts">
  import { Badge } from "../../src/index.js";
  import type { ComponentProps } from "svelte";

  type BadgeProps = ComponentProps<typeof Badge>;
  // `label` stands in for the children snippet, which can't be passed as a
  // plain prop from @testing-library/svelte's `render`.
  let { label = "New", ...rest }: Omit<BadgeProps, "children"> & { label?: string } = $props();
</script>

<Badge {...rest}>{label}</Badge>
