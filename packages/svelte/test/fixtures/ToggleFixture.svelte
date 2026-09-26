<script lang="ts">
  import { Toggle } from "../../src/index.js";
  import type { ToggleSize, ToggleVariant } from "../../src/index.js";

  let {
    variant = undefined,
    size = undefined,
    disabled = undefined,
    defaultPressed = undefined,
    onPressedChange = undefined,
  }: {
    variant?: ToggleVariant;
    size?: ToggleSize;
    disabled?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
  } = $props();
</script>

<Toggle.Root {variant} {size} {disabled} {defaultPressed} {onPressedChange} class="favorite">
  <Toggle.Indicator>
    {#snippet fallback()}☆{/snippet}
    ★
  </Toggle.Indicator>
  Favorite
</Toggle.Root>
