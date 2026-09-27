<script lang="ts">
  import { Editable } from "../../src/index.js";
  import type {
    EditableActivationMode,
    EditableSize,
    EditableValueChangeDetails,
  } from "../../src/index.js";

  let {
    size = undefined,
    value = undefined,
    defaultValue = undefined,
    activationMode = undefined,
    submitMode = undefined,
    placeholder = undefined,
    maxLength = undefined,
    disabled = undefined,
    readOnly = undefined,
    triggers = false,
    onValueChange = undefined,
    onValueCommit = undefined,
    onValueRevert = undefined,
  }: {
    size?: EditableSize;
    value?: string;
    defaultValue?: string;
    activationMode?: EditableActivationMode;
    submitMode?: "enter" | "blur" | "both" | "none";
    placeholder?: string;
    maxLength?: number;
    disabled?: boolean;
    readOnly?: boolean;
    triggers?: boolean;
    onValueChange?: (details: EditableValueChangeDetails) => void;
    onValueCommit?: (details: EditableValueChangeDetails) => void;
    onValueRevert?: (details: EditableValueChangeDetails) => void;
  } = $props();
</script>

<Editable.Root
  {size}
  {value}
  {defaultValue}
  {activationMode}
  {submitMode}
  {placeholder}
  {maxLength}
  {disabled}
  {readOnly}
  {onValueChange}
  {onValueCommit}
  {onValueRevert}
  class="layer-name"
>
  <Editable.Label>Layer name</Editable.Label>
  <Editable.Area>
    <Editable.Input />
    <Editable.Preview />
  </Editable.Area>
  {#if triggers}
    <Editable.Control>
      <Editable.EditTrigger>Edit</Editable.EditTrigger>
      <Editable.SubmitTrigger>Save</Editable.SubmitTrigger>
      <Editable.CancelTrigger>Cancel</Editable.CancelTrigger>
    </Editable.Control>
  {/if}
</Editable.Root>
<button type="button">Elsewhere</button>
