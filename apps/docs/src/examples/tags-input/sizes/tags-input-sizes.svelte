<script lang="ts">
  import { TagsInput } from "@moderno-ui/svelte";
</script>

<div class="demo-stack">
  <TagsInput.Root size="sm" defaultValue={["React"]}>
    <TagsInput.Label>Small</TagsInput.Label>
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
      <TagsInput.Input />
    </TagsInput.Control>
  </TagsInput.Root>
  <TagsInput.Root size="md" defaultValue={["React"]}>
    <TagsInput.Label>Medium</TagsInput.Label>
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
      <TagsInput.Input />
    </TagsInput.Control>
  </TagsInput.Root>
  <TagsInput.Root size="lg" defaultValue={["React"]}>
    <TagsInput.Label>Large</TagsInput.Label>
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
      <TagsInput.Input />
    </TagsInput.Control>
  </TagsInput.Root>
</div>
