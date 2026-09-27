<!--
  Editable.Preview, Ark's text, as a button a keyboard reaches: Enter, F2
  or Space starts an edit, the label and the value name it (Ark would name
  it "edit"), and the Field's helper and error text describe it. A value
  cut short shows in full as its tooltip. It is where focus returns after a
  save or a cancel.
-->
<script lang="ts">
  import { Editable as ArkEditable, useEditableContext, useFieldContext } from "@ark-ui/svelte";
  import type { EditablePreviewProps } from "@ark-ui/svelte";
  import { editablePreviewTitle, isEditableStartKey } from "@moderno-ui/core";
  import { getEditableSettings } from "./editable-props.js";

  let {
    ref = $bindable(null),
    onfocusin,
    onkeydown,
    onpointerenter,
    ...rest
  }: EditablePreviewProps = $props();
  const editable = useEditableContext();
  const field = useFieldContext();
  const settings = getEditableSettings();
  let title = $state<string>();
  const preview = $derived(editable().getPreviewProps());
  const interactive = $derived(preview.tabindex === 0);

  $effect(() => {
    settings.focusReturn.setPreview(ref instanceof HTMLElement ? ref : null);
    return () => settings.focusReturn.setPreview(null);
  });

  // `focusin`, not `focus`: it comes after `focus`, so the edit it starts
  // cannot read this same focus as one outside the input.
  function handleFocusin(event: FocusEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
    onfocusin?.(event);
    if (settings.activationMode !== "focus" || settings.focusReturn.isReturning()) return;
    editable().edit();
  }

  function handleKeydown(event: KeyboardEvent & { currentTarget: EventTarget & HTMLSpanElement }) {
    onkeydown?.(event);
    if (event.defaultPrevented || settings.activationMode === "none") return;
    if (!isEditableStartKey(event.key)) return;
    event.preventDefault();
    editable().edit();
  }

  function handlePointerenter(
    event: PointerEvent & { currentTarget: EventTarget & HTMLSpanElement },
  ) {
    onpointerenter?.(event);
    title = editablePreviewTitle(event.currentTarget, editable().value);
  }
</script>

<ArkEditable.Preview
  bind:ref
  role={interactive ? "button" : undefined}
  aria-label={editable().valueText}
  aria-labelledby={interactive ? `${editable().getLabelProps().id} ${preview.id}` : undefined}
  aria-describedby={field?.()?.ariaDescribedby}
  {title}
  {...rest}
  onfocusin={handleFocusin}
  onkeydown={handleKeydown}
  onpointerenter={handlePointerenter}
/>
