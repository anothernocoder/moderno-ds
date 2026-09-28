<!--
  Toolbar.Toggle — a button that stays pressed (aria-pressed), like bold.
  Ark's toggle machine keeps the pressed state; `pressed` is bindable, and
  `bind:pressed` receives each change.
-->
<script lang="ts">
  import { useToggle } from "@ark-ui/svelte";
  import { mergeProps } from "@zag-js/svelte";
  import ToolbarItem from "./ToolbarItem.svelte";
  import { useToolbar, type ToolbarToggleProps } from "./toolbar-props.js";

  let {
    pressed = $bindable(),
    defaultPressed,
    onPressedChange,
    label,
    shortcut,
    disabled = false,
    children,
    ...rest
  }: ToolbarToggleProps = $props();

  const api = useToolbar("Toggle");
  const value = $props.id();

  const toggle = useToggle(() => ({
    pressed,
    defaultPressed,
    onPressedChange(next: boolean) {
      pressed = next;
      onPressedChange?.(next);
    },
  }));

  const itemProps = $derived(
    api().getToggleProps({ value, disabled, pressed: toggle().pressed }),
  );
  const consumer = $derived(
    mergeProps({ onclick: () => toggle().setPressed(!toggle().pressed) }, rest),
  );
</script>

<ToolbarItem part="toggle" {label} {shortcut} {disabled} {itemProps} {consumer} {children} />
