<!--
  Editable.Input, Ark's input, named by the label (Ark's own fallback name
  would override it) and described by the Field's helper and error text.
  Focused as an edit starts, it selects the whole text.
-->
<script lang="ts">
  import { Editable as ArkEditable, useEditableContext, useFieldContext } from "@ark-ui/svelte";
  import type { EditableInputProps } from "@ark-ui/svelte";
  import { getEditableSettings } from "./editable-props.js";

  let { ref = $bindable(null), onfocus, ...rest }: EditableInputProps = $props();
  const editable = useEditableContext();
  const field = useFieldContext();
  const settings = getEditableSettings();

  function handleFocus(event: FocusEvent & { currentTarget: EventTarget & HTMLInputElement }) {
    onfocus?.(event);
    if (settings.selectOnFocus) event.currentTarget.select();
  }
</script>

<ArkEditable.Input
  bind:ref
  aria-labelledby={editable().getLabelProps().id}
  aria-describedby={field?.()?.ariaDescribedby}
  {...rest}
  onfocus={handleFocus}
/>
