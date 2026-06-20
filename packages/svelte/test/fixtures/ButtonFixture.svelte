<script lang="ts">
  import { Button } from "../../src/index.js";
  import type { ComponentProps } from "svelte";

  type ButtonProps = ComponentProps<typeof Button>;
  let {
    label = "Save",
    ariaLabel,
    ...rest
  }: ButtonProps & { label?: string; ariaLabel?: string } = $props();
</script>

<Button {...rest} aria-label={ariaLabel}>{label}</Button>
