<!--
  Editable.Root with the Moderno `size` recipe folded in, a double click as
  the default activation, button names that match their words, and the
  value held here rather than in Ark: Escape puts back the value from before
  the edit even when it was empty (Ark keeps the typed text then). The
  Input selects its text itself when an edit starts (`selectOnFocus`): Ark
  only calls `select()`, which does not focus the input in every browser.
  After a save or a cancel, focus goes back to the text.

  The machine is built with `useEditable` and handed to Ark's RootProvider,
  so Ark is always given the value held here: Ark's own Root would keep a
  value it reported as a local override of `value`.
-->
<script lang="ts">
  import { untrack } from "svelte";
  import { Editable as ArkEditable, useEditable } from "@ark-ui/svelte";
  import {
    EDITABLE_DEFAULT_ACTIVATION_MODE,
    arkEditableActivationMode,
    createEditableFocusReturn,
    editableRecipe,
    editableTranslations,
  } from "@moderno-ui/core";
  import {
    setEditableSettings,
    splitEditableRootProps,
    type ModernoEditableRootProps,
  } from "./editable-props.js";

  let {
    size,
    activationMode = EDITABLE_DEFAULT_ACTIVATION_MODE,
    selectOnFocus = true,
    value = $bindable(),
    defaultValue = "",
    translations,
    finalFocusEl,
    onValueChange,
    onValueRevert,
    id,
    ...rest
  }: ModernoEditableRootProps = $props();
  const providedId = $props.id();
  const [machineProps, elementProps] = $derived(splitEditableRootProps(rest));

  // `defaultValue` is read once, at mount, as its name says.
  let uncontrolled = $state(untrack(() => defaultValue));
  const current = $derived(value ?? uncontrolled);
  const focusReturn = createEditableFocusReturn<HTMLElement>();

  function change(next: string) {
    if (next === current) return;
    if (value === undefined) uncontrolled = next;
    else value = next;
    onValueChange?.({ value: next });
  }

  setEditableSettings({
    get activationMode() {
      return activationMode;
    },
    get selectOnFocus() {
      return selectOnFocus;
    },
    focusReturn,
  });

  const editable = useEditable(() => ({
    ...machineProps,
    id: id ?? providedId,
    value: current,
    activationMode: arkEditableActivationMode(activationMode),
    selectOnFocus: false,
    translations: { ...editableTranslations, ...translations },
    finalFocusEl: finalFocusEl ?? focusReturn.finalFocusEl,
    onValueChange: (details) => change(details.value),
    onValueRevert: (details) => {
      change(details.value);
      onValueRevert?.(details);
    },
  }));
</script>

<ArkEditable.RootProvider {...elementProps} {...editableRecipe({ size })} value={editable} />
