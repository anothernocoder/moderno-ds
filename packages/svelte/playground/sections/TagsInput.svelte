<!--
  TagsInput — Ark's tags-input machine: each tag with its text and named
  delete trigger, the label pointing at the input, the hidden form value and
  a disabled root reach the server string.
-->
<script lang="ts">
  import { TagsInput } from "../../src/exports/tags-input.js";
  import type { SectionProps } from "../section.js";

  let {}: SectionProps = $props();
</script>

{#snippet tagsInput(label: string, defaultValue: string[], size?: "sm", disabled?: boolean)}
  <TagsInput.Root {size} {defaultValue} {disabled} name="tags">
    <TagsInput.Label>{label}</TagsInput.Label>
    <TagsInput.Control>
      <TagsInput.Context>
        {#snippet render(api)}
          {#each api().value as value, index (index)}
            <TagsInput.Item {index} {value}>
              <TagsInput.ItemPreview>
                <TagsInput.ItemText>{value}</TagsInput.ItemText>
                <TagsInput.ItemDeleteTrigger>×</TagsInput.ItemDeleteTrigger>
              </TagsInput.ItemPreview>
              <TagsInput.ItemInput />
            </TagsInput.Item>
          {/each}
        {/snippet}
      </TagsInput.Context>
      <TagsInput.Input placeholder="Add a tag" />
      <TagsInput.ClearTrigger>×</TagsInput.ClearTrigger>
    </TagsInput.Control>
    <TagsInput.HiddenInput />
  </TagsInput.Root>
{/snippet}

<section aria-label="tags-input">
  {@render tagsInput("Frameworks", ["React", "Vue"])}
  {@render tagsInput("Topics", ["Design"], "sm", true)}
</section>
