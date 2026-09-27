<script lang="ts">
  import { TagsInput } from "@moderno-ui/svelte";
</script>

<TagsInput.Root max={3} defaultValue={["React", "Vue"]}>
  <TagsInput.Label>Up to three frameworks</TagsInput.Label>
  <TagsInput.Control>
    <TagsInput.Context>
      {#snippet render(tagsInput)}
        {#each tagsInput().value as value, index (index)}
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
    <TagsInput.Input placeholder="Add a framework" />
  </TagsInput.Control>
</TagsInput.Root>
