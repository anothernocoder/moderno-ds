<!--
  VectorPad.Root: runs Moderno's `vectorPad` machine and holds the pad, the
  label and the fields. `value` is bindable: `bind:value` receives each value
  the pad moves to.
-->
<script lang="ts">
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte";
  import { vectorPad, vectorPadRecipe } from "@moderno-ui/core";
  import { setVectorPadContext, type VectorPadRootProps } from "./vector-pad-props.js";

  let { size, value = $bindable(), children, ...props }: VectorPadRootProps = $props();
  const providedId = $props.id();
  const split = $derived(vectorPad.splitProps(props));
  const machineProps = $derived(split[0]);

  const service = useMachine(vectorPad.machine, () => ({
    ...machineProps,
    id: machineProps.id ?? providedId,
    value,
    // Written back even when `value` starts unset, so `bind:value` always
    // learns it; an unbound pad keeps it locally.
    onValueChange(details: vectorPad.ValueChangeDetails) {
      value = details.value;
      machineProps.onValueChange?.(details);
    },
  }));
  const api = $derived(vectorPad.connect(service, normalizeProps));

  setVectorPadContext({
    get api() {
      return api;
    },
    get size() {
      return size;
    },
    get disabled() {
      return machineProps.disabled;
    },
    get readOnly() {
      return machineProps.readOnly;
    },
    get invalid() {
      return machineProps.invalid;
    },
  });
</script>

<div {...mergeProps(api.getRootProps(), vectorPadRecipe({ size }), split[1])}>
  {@render children?.()}
</div>
