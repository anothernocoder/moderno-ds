<script lang="ts">
  import { TagsInput } from "../../src/index.js";
  import type {
    TagsInputSize,
    TagsInputValidityChangeDetails,
    TagsInputValueChangeDetails,
  } from "../../src/index.js";

  let {
    size = undefined,
    value = undefined,
    defaultValue = undefined,
    max = undefined,
    disabled = false,
    invalid = undefined,
    validate = undefined,
    onValueChange = undefined,
    onValueInvalid = undefined,
  }: {
    size?: TagsInputSize;
    value?: string[];
    defaultValue?: string[];
    max?: number;
    disabled?: boolean;
    invalid?: boolean;
    validate?: (details: { inputValue: string; value: string[] }) => boolean;
    onValueChange?: (details: TagsInputValueChangeDetails) => void;
    onValueInvalid?: (details: TagsInputValidityChangeDetails) => void;
  } = $props();
</script>

<TagsInput.Root
  {size}
  {value}
  {defaultValue}
  {max}
  {disabled}
  {invalid}
  {validate}
  {onValueChange}
  {onValueInvalid}
  class="frameworks"
>
  <TagsInput.Label>Frameworks</TagsInput.Label>
  <TagsInput.Control>
    <TagsInput.Context>
      {#snippet render(api)}
        {#each api().value as tag, index (index)}
          <TagsInput.Item {index} value={tag}>
            <TagsInput.ItemPreview>
              <TagsInput.ItemText>{tag}</TagsInput.ItemText>
              <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>
            </TagsInput.ItemPreview>
            <TagsInput.ItemInput />
          </TagsInput.Item>
        {/each}
      {/snippet}
    </TagsInput.Context>
    <TagsInput.Input />
    <TagsInput.ClearTrigger>×</TagsInput.ClearTrigger>
  </TagsInput.Control>
  <TagsInput.HiddenInput />
</TagsInput.Root>
